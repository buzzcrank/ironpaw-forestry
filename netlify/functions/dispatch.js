/**
 * Netlify Function: /.netlify/functions/dispatch
 * IronPaw Forestry — AI Operations Brain (OpenAI)
 *
 * FULL FILE REPLACEMENT
 * Node 18+
 */

import OpenAI from "openai";
import Airtable from "airtable";

/**
 * ENV VARS REQUIRED
 * OPENAI_API_KEY
 * AIRTABLE_API_KEY   (Personal Access Token)
 * AIRTABLE_BASE_ID
 */

// -------------------------
// OPENAI CLIENT
// -------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -------------------------
// AIRTABLE SETUP
// -------------------------
const airtableEnabled =
  process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID;

let base = null;

if (airtableEnabled) {
  Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY,
  });
  base = Airtable.base(process.env.AIRTABLE_BASE_ID);
}

// -------------------------
// SYSTEM PROMPT
// -------------------------
const SYSTEM_PROMPT = `
You are the AI Operations Assistant for IronPaw Forestry, LLC.

You speak like an experienced land-clearing coordinator.
You are calm, friendly, confident, and professional.
You never sound robotic or salesy.

Your job:
- Understand the customer’s land
- Ask ONE question at a time
- Explain forestry mulching in plain language
- Guide toward a free estimate and booking

Service area:
Memphis, TN and 50–100 mile radius.

Pricing depends on:
- acreage
- density
- terrain
- access
- distance

Never give exact prices without details.
Use ranges and explain why.

Always end your reply with ONE helpful follow-up question.
`;

// -------------------------
// HELPERS
// -------------------------
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function safeParse(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

async function logCommunication(message) {
  if (!airtableEnabled) return;

  try {
    await base("Communications").create({
      Channel: "Chat",
      Direction: "Incoming",
      "Message Summary": message,
      "Sent At": new Date().toISOString(),
      "Follow-up Needed": false,
    });
  } catch (err) {
    console.error("❌ Airtable write failed:", err.message);
  }
}

// -------------------------
// MAIN HANDLER
// -------------------------
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return response(200, {});
  }

  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, error: "Method not allowed" });
  }

  const body = safeParse(event.body);
  if (!body) {
    return response(400, { ok: false, error: "Invalid JSON" });
  }

  const userMessage =
    body?.entities?.communications?.[0]?.message_summary ||
    body?.message ||
    "";

  if (!userMessage) {
    return response(400, { ok: false, error: "No user message provided" });
  }

  // Log to Airtable (non-blocking)
  logCommunication(userMessage);

  // -------------------------
  // OPENAI CALL
  // -------------------------
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Thanks for that. About how many acres are you looking to clear?";

    return response(200, {
      ok: true,
      reply_text: reply,
    });
  } catch (err) {
    console.error("❌ OpenAI error:", err.message);

    return response(200, {
      ok: true,
      reply_text:
        "I’m having a brief issue, but I can still help. About how large is the area you want cleared?",
      warning: "openai_unavailable",
    });
  }
}
