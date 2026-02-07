/**
 * Netlify Function: dispatch
 * IronPaw Forestry — Stable Conversation + Lead Capture
 * FULL FILE REPLACEMENT (NO DRIFT)
 */

import Airtable from "airtable";

/* -------------------------
   Airtable Setup
------------------------- */
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

/* -------------------------
   Helpers
------------------------- */
function respond(body) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

function nextQuestion(step) {
  switch (step) {
    case "start":
      return "About how many acres are you looking to clear?";
    case "acreage":
      return "How dense is the vegetation (light brush, medium, or very dense)?";
    case "density":
      return "What’s the terrain like (flat, rolling, or steep)?";
    case "terrain":
      return "Is the area easily accessible for equipment?";
    case "access":
      return "What city or town is the property located in?";
    case "location":
      return "Thanks — I have everything I need. I’ll prepare an estimate and follow up shortly.";
    default:
      return null;
  }
}

/* -------------------------
   Main Handler
------------------------- */
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return respond({ reply_text: "Invalid request." });
    }

    const sessionId = event.headers["x-session-id"];
    if (!sessionId) {
      return respond({ reply_text: "Session error. Please refresh the page." });
    }

    const { message } = JSON.parse(event.body || "{}");
    if (!message) {
      return respond({ reply_text: "Please enter a response." });
    }

    /* -------------------------
       Load or Create Conversation
    ------------------------- */
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
        Step: "start",
      });
    } else {
      record = existing[0];
    }

    const step = record.fields.Step || "start";

    /* -------------------------
       Stop condition (CRITICAL)
    ------------------------- */
    if (step === "complete") {
      return respond({
        reply_text:
          "Thanks again — I’ll be in touch shortly with your estimate.",
      });
    }

    /* -------------------------
       Store answer for current step
    ------------------------- */
    const updates = {};

    if (step === "start") updates.Acreage = message;
    if (step === "acreage") updates.Density = message;
    if (step === "density") updates.Terrain = message;
    if (step === "terrain") updates.Access = message;
    if (step === "access") updates.Location = message;

    /* -------------------------
       Step progression
    ------------------------- */
    const order = [
      "start",
      "acreage",
      "density",
      "terrain",
      "access",
      "location",
      "complete",
    ];

    const nextStep = order[order.indexOf(step) + 1];
    updates.Step = nextStep;

    await base("Conversations").update(record.id, updates);

    /* -------------------------
       Create Lead ONCE
    ------------------------- */
    if (nextStep === "complete") {
      await base("Leads").create({
        "Last Name": "Website Lead",
        "City": record.fields.Location,
        "Lead Source": "AI Website",
        "Status": "New",
        "Notes": `
AI Intake Summary:
• Acreage: ${record.fields.Acreage}
• Density: ${record.fields.Density}
• Terrain: ${record.fields.Terrain}
• Access: ${record.fields.Access}
• Location: ${record.fields.Location}
        `.trim(),
      });
    }

    /* -------------------------
       Ask next question
    ------------------------- */
    const question = nextQuestion(nextStep);

    return respond({
      reply_text: question || "Thanks — one moment.",
    });
  } catch (err) {
    console.error("DISPATCH ERROR:", err);
    return respond({
      reply_text:
        "I hit a temporary issue — please try again in a moment.",
    });
  }
}
