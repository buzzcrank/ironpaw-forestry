import pool from '../models/db.js';

export async function getDashboard(req, res) {
  try {
    const [leadStats, revenueStats, recentLeads, weeklyLeads, jobStats] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) AS total_leads,
          COUNT(*) FILTER (WHERE status='New') AS new_leads,
          COUNT(*) FILTER (WHERE status='Contacted') AS contacted,
          COUNT(*) FILTER (WHERE status='Quoted') AS quoted,
          COUNT(*) FILTER (WHERE status='Scheduled') AS scheduled,
          COUNT(*) FILTER (WHERE status='Completed') AS completed,
          COUNT(*) FILTER (WHERE status='Lost') AS lost,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS leads_this_week,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS leads_this_month
        FROM leads
      `),
      pool.query(`
        SELECT
          COALESCE(SUM(price_final), 0) AS total_revenue,
          COALESCE(SUM(price_final) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'), 0) AS revenue_this_month,
          COALESCE(AVG(price_final), 0) AS avg_job_value,
          COUNT(*) AS total_quotes
        FROM quotes WHERE status != 'Draft'
      `),
      pool.query(`
        SELECT id, name, phone, city, status, source, created_at
        FROM leads ORDER BY created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT
          DATE_TRUNC('week', created_at) AS week,
          COUNT(*) AS count
        FROM leads
        WHERE created_at > NOW() - INTERVAL '8 weeks'
        GROUP BY week ORDER BY week
      `),
      pool.query(`
        SELECT
          COUNT(*) AS total_jobs,
          COUNT(*) FILTER (WHERE status='Completed') AS completed_jobs,
          COALESCE(SUM(revenue) FILTER (WHERE status='Completed'), 0) AS completed_revenue
        FROM jobs
      `),
    ]);

    const leads = leadStats.rows[0];
    const conversionRate = leads.total_leads > 0
      ? ((parseInt(leads.completed) / parseInt(leads.total_leads)) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      dashboard: {
        leads: { ...leads, conversion_rate: conversionRate },
        revenue: revenueStats.rows[0],
        jobs: jobStats.rows[0],
        recent_leads: recentLeads.rows,
        weekly_leads: weeklyLeads.rows,
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data.' });
  }
}
