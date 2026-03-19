import pool from '../models/db.js';

export async function createAppointment(req, res) {
  const { lead_id, quote_id, appointment_type, scheduled_at, duration_minutes, location, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO appointments (lead_id, quote_id, appointment_type, scheduled_at, duration_minutes, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [lead_id, quote_id, appointment_type || 'Estimate', scheduled_at, duration_minutes || 60, location, notes]
    );
    if (lead_id) {
      await pool.query("UPDATE leads SET status='Scheduled', updated_at=NOW() WHERE id=$1", [lead_id]);
    }
    res.status(201).json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    console.error('createAppointment error:', err);
    res.status(500).json({ success: false, error: 'Failed to create appointment.' });
  }
}

export async function getAppointments(req, res) {
  const { from, to, status } = req.query;
  try {
    let query = `
      SELECT a.*, l.name as lead_name, l.phone as lead_phone, l.city as lead_city
      FROM appointments a
      LEFT JOIN leads l ON l.id = a.lead_id
      WHERE 1=1
    `;
    const params = [];
    if (from) { params.push(from); query += ` AND a.scheduled_at >= $${params.length}`; }
    if (to) { params.push(to); query += ` AND a.scheduled_at <= $${params.length}`; }
    if (status) { params.push(status); query += ` AND a.status = $${params.length}`; }
    query += ' ORDER BY a.scheduled_at ASC';
    const result = await pool.query(query, params);
    res.json({ success: true, appointments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch appointments.' });
  }
}

export async function updateAppointment(req, res) {
  const { status, notes, scheduled_at } = req.body;
  try {
    const result = await pool.query(
      `UPDATE appointments SET status=COALESCE($1,status), notes=COALESCE($2,notes),
       scheduled_at=COALESCE($3,scheduled_at) WHERE id=$4 RETURNING *`,
      [status, notes, scheduled_at, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Appointment not found.' });
    res.json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update appointment.' });
  }
}

export async function getAvailableSlots(req, res) {
  // Returns available time slots for the next 14 days
  // In production: integrate with Google Calendar API
  const slots = [];
  const now = new Date();
  for (let d = 1; d <= 14; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
    for (const hour of [8, 10, 13, 15]) {
      const slot = new Date(date);
      slot.setHours(hour, 0, 0, 0);
      slots.push({
        datetime: slot.toISOString(),
        label: slot.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', hour12: true }),
      });
    }
  }
  res.json({ success: true, slots });
}
