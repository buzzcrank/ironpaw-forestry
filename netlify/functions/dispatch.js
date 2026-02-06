/**
 * Netlify Function: dispatch
 * IronPaw Forestry — Conversation Engine (FINALIZED)
 * FULL FILE REPLACEMENT
 */

import Airtable from "airtable";
import OpenAI from "openai";

// -------------------------
// ENV VARS
// -------------------------
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
function respond(statusCode, body) {
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
    default:
      return null;
  }
}

// -------------------------
// MAIN HANDLER
// -------------------------
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  const sessionId = event.headers["x-session-id"];
  if (!sessionId) {
    return respond(400, { error: "Missing session ID" });
  }

  const { message } = JSON.parse(event.body || "{}");
  if (!message) {
    return respond(400, { error: "Missing message" });
  }

  // -------------------------
  // LOAD OR CREATE CONVERSATION
  // -------------------------
  let record;

  const existing = await base("Conversations")
    .select({
      filterByFormula: `{Session ID}="${sessionId}"`,
      maxRecords: 1,
    })
    .firstPage();

  if (existing.length === 0) {
    record = await base("Conversations").create({
      "Session ID": sessionId,
      "Step": "start",
    });
  } else {
    record = existing[0];
  }

  const fields = record.fields;
  const step = fields["Step"] || "start";

  // -------------------------
  // STOP CONDITION
  // -------------------------
  if (step === "complete") {
    const summary = `
Here’s what I’ve got so far:

• Acreage: ${fields.Acreage}
• Density: ${fields.Density}
• Terrain: ${fields.Terrain}
• Access: ${fields.Access}
• Location: ${fields.Location}

This looks like a good candidate for forestry mulching.
The next step would be a site visit or a formal estimate.

Would you like me to schedule that?
`;

    return respond(200, {
      reply_text: summary.trim(),
    });
  }

  // -------------------------
  // STORE USER RESPONSE
  // -------------------------
  const updates = {};

  if (step === "start") updates.Acreage = message;
  if (step === "acreage") updates.Density = message;
  if (step === "density") updates.Terrain = message;
  if (step === "terrain") updates.Access = message;
  if (step === "access") updates.Location = message;

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

  updates.Step = nextStep;

  const nextQuestion = getNextQuestion(nextStep);
  if (nextQuestion) {
    updates["Last Question"] = nextQuestion;
  }

  await base("Conversations").update(record.id, updates);

  // -------------------------
  // ASK NEXT QUESTION
  // -------------------------
  if (!nextQuestion) {
    return respond(200, {
      reply_text:
        "Thanks — I have everything I need to prepare an estimate. Would you like to move forward?",
    });
  }

  return respond(200, {
    reply_text: nextQuestion,
  });
}
