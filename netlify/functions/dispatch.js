/**
 * Netlify Function: /.netlify/functions/dispatch
 * IronPaw Forestry — AI Operations Brain v2
 * WITH CONVERSATION MEMORY + QUESTION FLOW
 *
 * FULL FILE REPLACEMENT
 * Node 18+
 */

import OpenAI from "openai";
import Airtable from "airtable";
import crypto from "crypto";

// -------------------------
// ENV VARS REQUIRED
// -------------------------
// OPENAI_API_KEY
// AIRTABLE_API_KEY
// AIRTABLE_BASE_ID

// -------------------------
// CLIENTS
// -------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// -------------------------
// SYSTEM PROMPT
// -------------------------
const SYSTEM_PROMPT = `
You are the AI Foreman for IronPaw Forestry, LLC.

You guide landowners through a forestry mulching estimate.
You ask ONE clear question at a time.
You never repeat questions already answered.
You sound like a calm, experienced land-clearing professional.

Do not give exact pricing.
Explain that pricing depends on site conditions.

When enough information is collected, explain next steps.
`;

// -------------------------
// HELPERS
// -------------------------
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
    crypto.createHash("md5").update(event.headers["user-agent"] || "anon").digest("hex")
  );
}

async function getConversation(sessionId) {
  const records = await base("Conversations")
    .select({
      filterByFormula: `{Session ID} = '${sessionId}'`,
      maxRecords: 1,
    })
    .firstPage();

  return records[0] || null;
}

async function saveConversation(sessionId, data) {
  const existing = await getConversation(sessionId);

  if (existing) {
    await base("Conversations").update(existing.id, {
      ...data,
      "Updated At": new Date().toISOString(),
    });
  } else {
    await base("Conversations").create({
      "Session ID": sessionId,
      ...data,
      "Updated At": new Date().toISOString(),
    });
  }
}

// -------------------------
// FLOW LOGIC
// -------------------------
const FLOW = [
  {
    step: "acreage",
    field: "Acreage",
    question: "About how many acres are you looking to have cleared?",
  },
  {
    step: "density",
    field: "Density",
    question: "How dense is the vegetation? Light brush, heavy brush, or small trees?",
  },
  {
    step: "terrain",
    field: "Terrain",
    question: "Is the terrain mostly flat, hilly, or steep?",
  },
  {
    step: "access",
    field: "Access",
    question: "How’s the access for equipment? Easy access or somewhat limited?",
  },
  {
    step: "location",
    field: "Location",
    question: "What city or county is the property located in?",
  },
];

// -------------------------
// MAIN HANDLER
// -------------------------
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const body = JSON.parse(event.body || "{}");
  const userMessage = body.message?.trim();
  if (!userMessage) {
    return json(400, { ok: false, error: "No message" });
  }

  const sessionId = getSessionId(event);
  let convo = await getConversation(sessionId);
  let convoData = convo ? convo.fields : {};

  // Determine current step
  let nextStep = FLOW.find(
    (f) => !convoData?.[f.field]
  );

  // If we already asked something, store user response
  if (convoData?.LastQuestion && nextStep) {
    await saveConversation(sessionId, {
      [nextStep.field]: userMessage,
    });
    convoData[nextStep.field] = userMessage;
    nextStep = FLOW.find((f) => !convoData?.[f.field]);
  }

  // If still gathering info → ask next question
  if (nextStep) {
    await saveConversation(sessionId, {
      Step: nextStep.step,
      LastQuestion: nextStep.question,
    });

    return json(200, {
      ok: true,
      reply_text: nextStep.question,
    });
  }

  // -------------------------
  // ENOUGH INFO → AI RESPONSE
  // -------------------------
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `
Customer details:
Acreage: ${convoData.Acreage}
Density: ${convoData.Density}
Terrain: ${convoData.Terrain}
Access: ${convoData.Access}
Location: ${convoData.Location}

Provide a helpful next-step explanation and offer to schedule an estimate.
        `,
      },
    ],
  });

  const reply =
    completion.choices?.[0]?.message?.content ||
    "Thanks for the details. The next step is scheduling a site visit for an accurate estimate.";

  return json(200, {
    ok: true,
    reply_text: reply,
  });
}
