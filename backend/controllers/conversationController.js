import pool from '../models/db.js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STEPS = ['start', 'acreage', 'density', 'terrain', 'access', 'location', 'name', 'phone', 'complete'];

const QUESTIONS = {
  start:    "Hi! I'm the Iron Paw AI assistant. About how many acres are you looking to clear or mulch?",
  acreage:  "How would you describe the vegetation density — light brush, medium brush, heavy brush, or dense trees?",
  density:  "What's the terrain like — flat, rolling hills, or steep?",
  terrain:  "Is the area easily accessible for heavy equipment?",
  access:   "What city or town is the property located in?",
  location: "Great! What's your name?",
  name:     "And the best phone number to reach you?",
  phone:    null, // triggers lead creation
};

export async function chat(req, res) {
  const { session_id, message } = req.body;
  if (!session_id || !message) {
    return res.status(400).json({ success: false, error: 'session_id and message required.' });
  }

  try {
    // Load or create conversation
    let conv;
    const existing = await pool.query('SELECT * FROM conversations WHERE session_id=$1', [session_id]);
    if (existing.rows.length === 0) {
      const r = await pool.query(
        'INSERT INTO conversations (session_id, messages) VALUES ($1, $2) RETURNING *',
        [session_id, JSON.stringify([])]
      );
      conv = r.rows[0];
    } else {
      conv = existing.rows[0];
    }

    const step = conv.current_step || 'start';

    if (step === 'complete') {
      return res.json({ success: true, reply: "Thanks! We'll be in touch shortly to schedule your free estimate." });
    }

    // Store answer for current step
    const updates = {};
    if (step === 'start') updates.acreage = message;
    if (step === 'acreage') updates.density = message;
    if (step === 'density') updates.terrain = message;
    if (step === 'terrain') updates.access = message;
    if (step === 'access') updates.location = message;
    if (step === 'location') updates.name = message;
    if (step === 'name') updates.phone = message;

    const nextStep = STEPS[STEPS.indexOf(step) + 1];
    updates.current_step = nextStep;

    // Build updated messages log
    const messages = Array.isArray(conv.messages) ? conv.messages : JSON.parse(conv.messages || '[]');
    messages.push({ role: 'user', content: message, step, ts: new Date().toISOString() });

    const setClause = Object.keys(updates).map((k, i) => `${k}=$${i + 1}`).join(', ');
    const values = [...Object.values(updates), JSON.stringify(messages), session_id];
    await pool.query(
      `UPDATE conversations SET ${setClause}, messages=$${values.length - 1}, updated_at=NOW() WHERE session_id=$${values.length}`,
      values
    );

    // Reload conversation for lead creation
    const refreshed = await pool.query('SELECT * FROM conversations WHERE session_id=$1', [session_id]);
    const updatedConv = refreshed.rows[0];

    // Create lead on completion
    if (nextStep === 'complete') {
      const leadResult = await pool.query(
        `INSERT INTO leads (name, phone, city, source, notes, status)
         VALUES ($1,$2,$3,'AI Chat',$4,'New') RETURNING *`,
        [
          updatedConv.name,
          updatedConv.phone,
          updatedConv.location,
          `AI Intake:\n• Acreage: ${updatedConv.acreage}\n• Density: ${updatedConv.density}\n• Terrain: ${updatedConv.terrain}\n• Access: ${updatedConv.access}\n• Location: ${updatedConv.location}`,
        ]
      );
      await pool.query('UPDATE conversations SET lead_id=$1, status=$2 WHERE session_id=$3',
        [leadResult.rows[0].id, 'completed', session_id]);

      return res.json({
        success: true,
        reply: `Perfect, ${updatedConv.name}! We have your info and will call you at ${updatedConv.phone} to schedule your free estimate. Talk soon! 🌲`,
        lead_created: true,
      });
    }

    const reply = QUESTIONS[nextStep] || "Thanks! We'll be in touch.";
    messages.push({ role: 'assistant', content: reply, ts: new Date().toISOString() });

    res.json({ success: true, reply, step: nextStep });
  } catch (err) {
    console.error('chat error:', err);
    res.status(500).json({ success: false, error: 'Failed to process message.' });
  }
}

export async function startChat(req, res) {
  res.json({ success: true, reply: QUESTIONS.start, step: 'start' });
}

export async function getConversations(req, res) {
  try {
    const result = await pool.query(`
      SELECT c.*, l.name as lead_name
      FROM conversations c
      LEFT JOIN leads l ON l.id = c.lead_id
      ORDER BY c.updated_at DESC LIMIT 100
    `);
    res.json({ success: true, conversations: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch conversations.' });
  }
}
