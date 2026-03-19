import pool from '../models/db.js';

// Pricing table per acre
const PRICING = {
  light: { min: 700, max: 900 },
  medium: { min: 900, max: 1200 },
  heavy: { min: 1200, max: 1600 },
  very_heavy: { min: 1500, max: 2000 },
};

const TERRAIN_MULTIPLIER = {
  flat: 1.0,
  rolling: 1.1,
  steep: 1.3,
};

const ACCESS_MULTIPLIER = {
  easy: 1.0,
  moderate: 1.1,
  difficult: 1.25,
};

export function calculatePrice(acreage, density, terrain, access) {
  const tier = PRICING[density] || PRICING.medium;
  const terrainMult = TERRAIN_MULTIPLIER[terrain] || 1.0;
  const accessMult = ACCESS_MULTIPLIER[access] || 1.0;
  const acres = parseFloat(acreage) || 1;

  const low = Math.round(tier.min * acres * terrainMult * accessMult);
  const high = Math.round(tier.max * acres * terrainMult * accessMult);
  return { low, high };
}

export async function createQuote(req, res) {
  const { lead_id, acreage, vegetation_density, equipment_type, terrain, access_difficulty, notes } = req.body;
  try {
    const { low, high } = calculatePrice(acreage, vegetation_density, terrain, access_difficulty);
    const result = await pool.query(
      `INSERT INTO quotes (lead_id, acreage, vegetation_density, equipment_type, terrain, access_difficulty, price_low, price_high, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [lead_id, acreage, vegetation_density, equipment_type, terrain, access_difficulty, low, high, notes]
    );
    // Update lead status
    if (lead_id) {
      await pool.query("UPDATE leads SET status='Quoted', updated_at=NOW() WHERE id=$1", [lead_id]);
    }
    res.status(201).json({ success: true, quote: result.rows[0], price_range: { low, high } });
  } catch (err) {
    console.error('createQuote error:', err);
    res.status(500).json({ success: false, error: 'Failed to create quote.' });
  }
}

export async function estimateQuote(req, res) {
  const { acreage, vegetation_density, terrain, access_difficulty } = req.body;
  try {
    const { low, high } = calculatePrice(acreage, vegetation_density, terrain, access_difficulty);
    res.json({ success: true, estimate: { low, high, acreage, vegetation_density } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to calculate estimate.' });
  }
}

export async function getQuotes(req, res) {
  try {
    const result = await pool.query(`
      SELECT q.*, l.name as lead_name, l.phone as lead_phone
      FROM quotes q
      LEFT JOIN leads l ON l.id = q.lead_id
      ORDER BY q.created_at DESC
    `);
    res.json({ success: true, quotes: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch quotes.' });
  }
}

export async function updateQuote(req, res) {
  const { status, price_final, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE quotes SET status=COALESCE($1,status), price_final=COALESCE($2,price_final),
       notes=COALESCE($3,notes) WHERE id=$4 RETURNING *`,
      [status, price_final, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Quote not found.' });
    res.json({ success: true, quote: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update quote.' });
  }
}
