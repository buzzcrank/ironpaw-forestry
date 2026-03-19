import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getQuotes, updateQuote } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Draft: 'bg-forest-700/50 text-forest-300 border-forest-600',
  Sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  Declined: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuotes()
      .then(res => setQuotes(res.data.quotes || []))
      .catch(() => toast.error('Failed to load quotes.'))
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id, status) {
    try {
      await updateQuote(id, { status });
      setQuotes(qs => qs.map(q => q.id === id ? { ...q, status } : q));
      toast.success('Quote updated.');
    } catch {
      toast.error('Failed to update.');
    }
  }

  return (
    <AdminLayout title="Quotes">
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-forest-400">Loading quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-forest-400">
            <div className="text-4xl mb-3">📋</div>
            <p>No quotes yet. Quotes are created from the lead calculator.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-700 bg-forest-800/50">
                <th className="text-left text-forest-400 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3 hidden sm:table-cell">Acres</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3 hidden md:table-cell">Density</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3">Price Range</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} className="border-b border-forest-800 hover:bg-forest-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{q.lead_name || '—'}</div>
                    <div className="text-forest-500 text-xs">{q.lead_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-forest-300 hidden sm:table-cell">{q.acreage} ac</td>
                  <td className="px-4 py-3 text-forest-300 capitalize hidden md:table-cell">
                    {q.vegetation_density?.replace('_', ' ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-amber-400 font-bold">
                      ${parseInt(q.price_low).toLocaleString()} – ${parseInt(q.price_high).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={q.status} onChange={e => changeStatus(q.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer ${STATUS_COLORS[q.status] || ''}`}>
                      {['Draft', 'Sent', 'Accepted', 'Declined'].map(s =>
                        <option key={s} value={s} className="bg-forest-900 text-white">{s}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-forest-500 text-xs hidden lg:table-cell">
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
