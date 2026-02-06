/**
 * Netlify Function: /.netlify/functions/dispatch
 * IronPaw Forestry — AI Foreman
 * Conversation Memory + Question Flow (STABLE)
 *
 * FULL FILE REPLACEMENT
 * Node 18+
 */

import OpenAI from "openai";
import Airtable from "airtable";
import crypto from "crypto";

// =========================
// ENV VARS REQUIRED
// =========================
// OPENAI_API_KEY
// AIRTABLE_API_KEY
// AIRTABLE_BASE_ID

// =========================
// CLIENTS
// =========================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// =========================
// SYSTEM PROMPT
// =========================
const SYSTEM_PROMPT = `
You are the AI Foreman for IronPaw Forestry, LLC.

You guide landowners through a forestry mulching estimate.
You ask ONE clear question at a time.
You never repeat a question that was already answered.
You are calm, practical, and professional.

Do not give exact prices.
Explain that pricing depends on site conditions.
`;

// =========================
// HELPERS
// =========================
function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

function getSessionId(event) {
  return (
    event.headers["x-session-id"] ||
    crypto
      .createHash("md5")
      .update(event.headers["user-agent"] || "anon")
      .digest("hex")
  );
}

// =========================
// FLOW DEFINITION
// =========================
const FLOW = [
  { field: "Acreage", question: "About how many acres are you looking to clear?" },
  { field: "Density", question: "How dense is the vegetation? Light brush, heavy brush, or small trees?" },
  { field: "Terrain", question: "Is the terrain mostly flat, hilly, or steep?" },
  { field: "Access", question: "How is access for equipment? Easy access or somewhat limited?" },
  { field: "Location", question: "What city or county is the property located in?" },
];

// =========================
// MAIN HANDLER
// =========================
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  const userMessage = body.message?.trim();
  if (!userMessage) {
    return json(400, { ok: false, error: "No message provided" });
  }

  const sessionId = getSessionId(event);

  // =========================
  // LOAD OR CREATE CONVERSATION
  // =========================
  let record;
  let fields = {};

  try {
    const existing = await base("Conversations")
      .select({
        filterByFormula: `{Session ID} = '${sessionId}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (existing.length > 0) {
      record = existing[0];
      fields = record.fields || {};
    } else {
      record = await base("Conversations").create({
        "Session ID": sessionId,
        "Updated At": new Date().toISOString(),
      });
      fields = record.fields || {};
    }
  } catch (err) {
    console.error("Airtable load/create failed:", err.message);
  }

  // =========================
  // STORE ANSWER TO LAST QUESTION
  // =========================
  if (fields["Last Question"]) {
    const lastFlow = FLOW.find(f => f.question === fields["Last Question"]);
    if (lastFlow && !fields[lastFlow.field]) {
      try {
        await base("Conversations").update(record.id, {
          [lastFlow.field]: userMessage,
          "Updated At": new Date().toISOString(),
        });
        fields[lastFlow.field] = userMessage;
      } catch (err) {
        console.error("Airtable update failed:", err.message);
      }
    }
  }

  // =========================
  // FIND NEXT QUESTION
  // =========================
  const next = FLOW.find(f => !fields[f.field]);

  if (next) {
    try {
      await base("Conversations").update(record.id, {
        Step: next.field,
        "Last Question": next.question,
        "Updated At": new Date().toISOString(),
      });
    } catch (err) {
      console.error("Airtable step update failed:", err.message);
    }

    return json(200, {
      ok: true,
      reply_text: next.question,
    });
  }

  // =========================
  // ALL INFO COLLECTED → AI RESPONSE
  // =========================
  let reply =
    "Thanks for the details. The next step would be scheduling a site visit so we can give you an accurate estimate.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `
Customer details:
Acreage: ${fields.Acreage}
Density: ${fields.Density}
Terrain: ${fields.Terrain}
Access: ${fields.Access}
Location: ${fields.Location}

Explain next steps and offer to schedule an estimate.
          `,
        },
      ],
    });

    reply =
      completion.choices?.[0]?.message?.content || reply;
  } catch (err) {
    console.error("OpenAI error:", err.message);
  }

  return json(200, {
    ok: true,
    reply_text: reply,
  });
}
