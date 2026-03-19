import pool from '../models/db.js';

export async function createLead(req, res) {
  const { name, phone, email, project_type, property_size, city, message, source } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO leads (name, phone, email, project_type, property_size, city, message, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, phone, email, project_type, property_size, city, message, source || 'Website']
    );
    res.status(201).json({ success: true, lead: result.rows[0] });
  } catch (err) {
    console.error('createLead error:', err);
    res.status(500).json({ success: false, error: 'Failed to save lead.' });
  }
}

export async function getLeads(req, res) {
  const { status, limit = 50, offset = 0 } = req.query;
  try {
    let query = 'SELECT * FROM leads';
    const params = [];
    if (status) {
      params.push(status);
      query += ` WHERE status = $${params.length}`;
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    const count = await pool.query(
      status ? 'SELECT COUNT(*) FROM leads WHERE status=$1' : 'SELECT COUNT(*) FROM leads',
      status ? [status] : []
    );
    res.json({ success: true, leads: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    console.error('getLeads error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch leads.' });
  }
}

export async function getLead(req, res) {
  try {
    const result = await pool.query('SELECT * FROM leads WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Lead not found.' });
    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch lead.' });
  }
}

export async function updateLead(req, res) {
  const { status, notes, assigned_to } = req.body;
  try {
    const result = await pool.query(
      `UPDATE leads SET status=COALESCE($1,status), notes=COALESCE($2,notes),
       assigned_to=COALESCE($3,assigned_to), updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [status, notes, assigned_to, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Lead not found.' });
    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update lead.' });
  }
}

export async function getLeadStats(req, res) {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status='New') AS new_leads,
        COUNT(*) FILTER (WHERE status='Contacted') AS contacted,
        COUNT(*) FILTER (WHERE status='Quoted') AS quoted,
        COUNT(*) FILTER (WHERE status='Scheduled') AS scheduled,
        COUNT(*) FILTER (WHERE status='Completed') AS completed,
        COUNT(*) FILTER (WHERE status='Lost') AS lost,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS this_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS this_month
      FROM leads
    `);
    res.json({ success: true, stats: stats.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats.' });
  }
}
