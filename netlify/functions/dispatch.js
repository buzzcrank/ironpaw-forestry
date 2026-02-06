/**
 * Netlify Function: /.netlify/functions/dispatch
 * IronPaw Forestry — AI Foreman (HARDENED)
 *
 * GUARANTEED RESPONSE VERSION
 * Node 18+
 */

import OpenAI from "openai";
import Airtable from "airtable";
import crypto from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// -------------------------
// FLOW
// -------------------------
const FLOW = [
  { field: "Acreage", question: "About how many acres are you looking to clear?" },
  { field: "Density", question: "How dense is the vegetation? Light brush, heavy brush, or small trees?" },
  { field: "Terrain", question: "Is the terrain mostly flat, hilly, or steep?" },
  { field: "Access", question: "How is access for equipment? Easy access or limited?" },
  { field: "Location", question: "What city or county is the property located in?" },
];

// -------------------------
// RESPONSE HELPER
// -------------------------
const respond = (text) => ({
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify({ ok: true, reply_text: text }),
});

// -------------------------
// SESSION ID
// -------------------------
const getSessionId = (event) =>
  crypto
    .createHash("md5")
    .update(event.headers["user-agent"] || "anon")
    .digest("hex");

// -------------------------
// HANDLER (FULLY GUARDED)
// -------------------------
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return respond("Hi! Tell me a bit about your land and I’ll help with next steps.");
    }

    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return respond("Let’s start with the basics. About how many acres are you looking to clear?");
    }

    const sessionId = getSessionId(event);

    // -------------------------
    // LOAD OR CREATE RECORD
    // -------------------------
    let record;
    let fields = {};

    try {
      const found = await base("Conversations")
        .select({
          filterByFormula: `{Session ID} = '${sessionId}'`,
          maxRecords: 1,
        })
        .firstPage();

      if (found.length > 0) {
        record = found[0];
        fields = record.fields || {};
      } else {
        record = await base("Conversations").create({
          "Session ID": sessionId,
          "Updated At": new Date().toISOString(),
        });
        fields = {};
      }
    } catch {
      // Even if Airtable is down, keep chat alive
      return respond("Let’s start with the basics. About how many acres are you looking to clear?");
    }

    // -------------------------
    // SAVE ANSWER TO LAST QUESTION
    // -------------------------
    if (fields["Last Question"]) {
      const last = FLOW.find((f) => f.question === fields["Last Question"]);
      if (last && !fields[last.field]) {
        try {
          await base("Conversations").update(record.id, {
            [last.field]: userMessage,
            "Updated At": new Date().toISOString(),
          });
          fields[last.field] = userMessage;
        } catch {}
      }
    }

    // -------------------------
    // NEXT QUESTION
    // -------------------------
    const next = FLOW.find((f) => !fields[f.field]);

    if (next) {
      try {
        await base("Conversations").update(record.id, {
          Step: next.field,
          "Last Question": next.question,
          "Updated At": new Date().toISOString(),
        });
      } catch {}

      return respond(next.question);
    }

    // -------------------------
    // FINAL RESPONSE (OPTIONAL AI)
    // -------------------------
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a forestry mulching professional explaining next steps calmly and clearly.",
          },
          {
            role: "user",
            content: JSON.stringify(fields),
          },
        ],
      });

      const reply =
        completion.choices?.[0]?.message?.content ||
        "Thanks for the details. The next step is scheduling a site visit so we can provide an accurate estimate.";

      return respond(reply);
    } catch {
      return respond(
        "Thanks for the details. The next step is scheduling a site visit so we can provide an accurate estimate."
      );
    }
  } catch {
    // Absolute last-resort safety net
    return respond("Let’s start with the basics. About how many acres are you looking to clear?");
  }
}
