import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { getDashboard } from '../../services/api';

const STATUS_COLORS = {
  New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Quoted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Scheduled: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Lost: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64 text-forest-400">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  const leads = data?.leads || {};
  const revenue = data?.revenue || {};
  const jobs = data?.jobs || {};

  const METRIC_CARDS = [
    { label: 'Total Leads', value: leads.total_leads || 0, sub: `${leads.leads_this_week || 0} this week`, color: 'text-white', icon: '👥' },
    { label: 'New Leads', value: leads.new_leads || 0, sub: 'Awaiting contact', color: 'text-blue-400', icon: '🆕' },
    { label: 'Quotes Sent', value: leads.quoted || 0, sub: `${revenue.total_quotes || 0} total quotes`, color: 'text-amber-400', icon: '📋' },
    { label: 'Jobs Booked', value: jobs.completed_jobs || 0, sub: `${leads.scheduled || 0} scheduled`, color: 'text-green-400', icon: '🚜' },
    { label: 'Conversion Rate', value: `${leads.conversion_rate || 0}%`, sub: 'Lead to completed', color: 'text-purple-400', icon: '📈' },
    { label: 'Revenue (Est.)', value: `$${(parseFloat(revenue.total_revenue) || 0).toLocaleString()}`, sub: `Avg $${Math.round(parseFloat(revenue.avg_job_value) || 0).toLocaleString()}/job`, color: 'text-amber-400', icon: '💰' },
  ];

  const PIPELINE = [
    { status: 'New', count: leads.new_leads || 0 },
    { status: 'Contacted', count: leads.contacted || 0 },
    { status: 'Quoted', count: leads.quoted || 0 },
    { status: 'Scheduled', count: leads.scheduled || 0 },
    { status: 'Completed', count: leads.completed || 0 },
    { status: 'Lost', count: leads.lost || 0 },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {METRIC_CARDS.map(m => (
          <div key={m.label} className="card">
            <div className="text-2xl mb-1">{m.icon}</div>
            <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
            <div className="text-white text-xs font-semibold mt-0.5">{m.label}</div>
            <div className="text-forest-500 text-xs">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="card lg:col-span-1">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🔄</span> Sales Pipeline
          </h2>
          <div className="space-y-3">
            {PIPELINE.map(p => {
              const total = parseInt(leads.total_leads) || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || 'text-forest-300'}`}>
                      {p.status}
                    </span>
                    <span className="text-white font-bold text-sm">{p.count}</span>
                  </div>
                  <div className="h-1.5 bg-forest-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/admin/leads" className="btn-secondary text-xs mt-4 w-full justify-center">
            View All Leads
          </Link>
        </div>

        {/* Recent Leads */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2"><span>🕐</span> Recent Leads</h2>
            <Link href="/admin/leads" className="text-amber-400 text-xs hover:text-amber-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {(data?.recent_leads || []).length === 0 ? (
              <p className="text-forest-400 text-sm text-center py-8">No leads yet. Share your website to get started!</p>
            ) : (
              data.recent_leads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between bg-forest-800 rounded-lg px-3 py-2.5">
                  <div>
                    <div className="text-white font-medium text-sm">{lead.name || 'Unknown'}</div>
                    <div className="text-forest-400 text-xs">{lead.city || '—'} · {lead.source}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] || ''}`}>
                      {lead.status}
                    </span>
                    <Link href={`/admin/leads?id=${lead.id}`} className="text-forest-400 hover:text-amber-400 text-xs transition-colors">
                      View →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card lg:col-span-3">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><span>⚡</span> Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/admin/leads', label: 'Manage Leads', icon: '👥', color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40' },
              { href: '/admin/quotes', label: 'Quotes', icon: '📋', color: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40' },
              { href: '/admin/jobs', label: 'Jobs', icon: '🚜', color: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40' },
              { href: '/admin/calendar', label: 'Calendar', icon: '📅', color: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`border rounded-xl p-4 text-center transition-all ${a.color}`}>
                <div className="text-3xl mb-2">{a.icon}</div>
                <div className="text-white text-sm font-medium">{a.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
