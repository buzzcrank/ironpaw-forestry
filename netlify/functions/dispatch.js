/**
 * Netlify Function: dispatch
 * IronPaw Forestry — Contact Capture (FIXED)
 * FULL FILE REPLACEMENT
 */

import Airtable from "airtable";

// -------------------------
// ENV VARS
// -------------------------
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
    case "location":
      return "Before I prepare an estimate, what’s your full name?";
    case "contact_name":
      return "What’s the best phone number to reach you?";
    case "contact_phone":
      return "What’s a good email for sending the estimate? (Optional)";
    default:
      return null;
  }
}

// -------------------------
// MAIN HANDLER
// -------------------------
export async function handler(event) {
  try {
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
    const step = fields.Step || "start";

    // -------------------------
    // STOP CONDITION
    // -------------------------
    if (step === "complete") {
      return respond(200, {
        reply_text:
          "Thanks — I have everything I need. I’ll follow up shortly with an estimate.",
      });
    }

    // -------------------------
    // STORE JOB DATA ONLY
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
      "contact_name",
      "contact_phone",
      "contact_email",
      "complete",
    ];

    const nextStep =
      stepOrder[stepOrder.indexOf(step) + 1] || "complete";

    updates.Step = nextStep;

    await base("Conversations").update(record.id, updates);

    // -------------------------
    // CREATE LEAD (ON COMPLETE)
    // -------------------------
    if (nextStep === "complete") {
      await base("Leads").create({
        "Last Name": fields["Last Question"] || "Website Lead",
        "City": fields.Location,
        "Lead Source": "AI Website",
        "Status": "New",
        "Notes": `
Website AI intake:
• Acreage: ${fields.Acreage}
• Density: ${fields.Density}
• Terrain: ${fields.Terrain}
• Access: ${fields.Access}
• Location: ${fields.Location}
        `.trim(),
      });

      return respond(200, {
        reply_text:
          "Thanks — I’ve got everything I need and will be in touch shortly.",
      });
    }

    // -------------------------
    // ASK NEXT QUESTION
    // -------------------------
    const nextQuestion = getNextQuestion(nextStep);

    return respond(200, {
      reply_text: nextQuestion || "Thanks — one moment.",
    });
  } catch (err) {
    console.error("DISPATCH ERROR:", err);
    return respond(200, {
      reply_text:
        "I hit a brief issue, but I’m still here. Can you repeat that?",
    });
  }
}
