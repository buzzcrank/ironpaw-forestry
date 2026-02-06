/**
 * Netlify Function: dispatch
 * IronPaw Forestry — Conversation Brain
 * FULL FILE REPLACEMENT
 */

import Airtable from "airtable";
import OpenAI from "openai";

// -------------------------
// ENV VARS REQUIRED
// -------------------------
// OPENAI_API_KEY
// AIRTABLE_API_KEY
// AIRTABLE_BASE_ID

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// -------------------------
// HELPERS
// -------------------------
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

function getNextQuestion(step) {
  switch (step) {
    case "start":
      return "About how many acres are you looking to clear?";
    case "acreage":
      return "How dense is the vegetation — light brush, medium, or very dense?";
    case "density":
      return "What’s the terrain like — flat, rolling, or steep?";
    case "terrain":
      return "Is the area easily accessible for a skid steer and trailer?";
    case "access":
      return "What city or county is the property located in?";
    case "location":
      return "Thanks — that’s enough to prepare an estimate. Would you like me to schedule a site visit?";
    default:
      return "Can you tell me a bit more about the property?";
  }
}

// -------------------------
// MAIN HANDLER
// -------------------------
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return response(405, { error: "Method not allowed" });
  }

  const sessionId = event.headers["x-session-id"];
  if (!sessionId) {
    return response(400, { error: "Missing session ID" });
  }

  const { message } = JSON.parse(event.body || "{}");
  if (!message) {
    return response(400, { error: "Missing message" });
  }

  // -------------------------
  // LOAD OR CREATE CONVO
  // -------------------------
  let record;

  const existing = await base("Conversations")
    .select({
      filterByFormula: `{Session ID}="${sessionId}"`,
      maxRecords: 1,
    })
    .firstPage();

  if (existing.length === 0) {
    const created = await base("Conversations").create({
      "Session ID": sessionId,
      "Step": "start",
      "Last Question": "About how many acres are you looking to clear?",
    });
    record = created;
  } else {
    record = existing[0];
  }

  const fields = record.fields;
  let step = fields["Step"] || "start";

  // -------------------------
  // STORE USER ANSWER
  // -------------------------
  const updates = {};

  if (step === "start") updates["Acreage"] = message;
  if (step === "acreage") updates["Density"] = message;
  if (step === "density") updates["Terrain"] = message;
  if (step === "terrain") updates["Access"] = message;
  if (step === "access") updates["Location"] = message;

  // Advance step
  const stepOrder = [
    "start",
    "acreage",
    "density",
    "terrain",
    "access",
    "location",
  ];

  const nextStep =
    stepOrder[stepOrder.indexOf(step) + 1] || "complete";

  updates["Step"] = nextStep;

  const nextQuestion = getNextQuestion(nextStep);
  updates["Last Question"] = nextQuestion;

  await base("Conversations").update(record.id, updates);

  // -------------------------
  // AI RESPONSE (FRAMING ONLY)
  // -------------------------
  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You are a calm forestry mulching coordinator. Ask one clear question at a time.",
      },
      {
        role: "user",
        content: nextQuestion,
      },
    ],
  });

  return response(200, {
    reply_text: ai.choices[0].message.content,
  });
}
