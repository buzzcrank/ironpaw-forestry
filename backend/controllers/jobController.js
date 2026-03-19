import pool from '../models/db.js';

export async function createJob(req, res) {
  const { lead_id, quote_id, title, scheduled_start, scheduled_end, operator_name, revenue, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO jobs (lead_id, quote_id, title, scheduled_start, scheduled_end, operator_name, revenue, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [lead_id, quote_id, title, scheduled_start, scheduled_end, operator_name, revenue, notes]
    );
    if (lead_id) {
      await pool.query("UPDATE leads SET status='Scheduled', updated_at=NOW() WHERE id=$1", [lead_id]);
    }
    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create job.' });
  }
}

export async function getJobs(req, res) {
  const { status } = req.query;
  try {
    let query = `
      SELECT j.*, l.name as customer_name, l.phone as customer_phone, l.city
      FROM jobs j LEFT JOIN leads l ON l.id = j.lead_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { params.push(status); query += ` AND j.status=$${params.length}`; }
    query += ' ORDER BY j.scheduled_start ASC NULLS LAST';
    const result = await pool.query(query, params);
    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch jobs.' });
  }
}

export async function updateJob(req, res) {
  const { status, actual_start, actual_end, revenue, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE jobs SET status=COALESCE($1,status), actual_start=COALESCE($2,actual_start),
       actual_end=COALESCE($3,actual_end), revenue=COALESCE($4,revenue), notes=COALESCE($5,notes)
       WHERE id=$6 RETURNING *`,
      [status, actual_start, actual_end, revenue, notes, req.params.id]
    );
    // If job completed, update lead
    if (status === 'Completed' && result.rows.length) {
      await pool.query("UPDATE leads SET status='Completed', updated_at=NOW() WHERE id=$1", [result.rows[0].lead_id]);
    }
    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update job.' });
  }
}
