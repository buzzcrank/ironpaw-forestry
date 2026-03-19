import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getLeads, updateLead } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['New', 'Contacted', 'Quoted', 'Scheduled', 'Completed', 'Lost'];

const STATUS_COLORS = {
  New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Quoted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Scheduled: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Lost: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await getLeads({ status: filterStatus || undefined, limit: 100 });
      setLeads(res.data.leads || []);
    } catch {
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterStatus]);

  async function handleStatusChange(leadId, status) {
    setUpdating(true);
    try {
      await updateLead(leadId, { status });
      setLeads(ls => ls.map(l => l.id === leadId ? { ...l, status } : l));
      if (selected?.id === leadId) setSelected(s => ({ ...s, status }));
      toast.success('Status updated.');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveNotes() {
    if (!selected) return;
    setUpdating(true);
    try {
      await updateLead(selected.id, { notes });
      setLeads(ls => ls.map(l => l.id === selected.id ? { ...l, notes } : l));
      setSelected(s => ({ ...s, notes }));
      toast.success('Notes saved.');
    } catch {
      toast.error('Failed to save notes.');
    } finally {
      setUpdating(false);
    }
  }

  function openLead(lead) {
    setSelected(lead);
    setNotes(lead.notes || '');
  }

  return (
    <AdminLayout title="Leads / CRM">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Lead List */}
        <div className="lg:w-2/3">
          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setFilterStatus('')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium
                ${!filterStatus ? 'bg-amber-500 text-forest-950 border-amber-500' : 'border-forest-600 text-forest-300 hover:border-forest-400'}`}>
              All ({leads.length})
            </button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilterStatus(s === filterStatus ? '' : s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium
                  ${filterStatus === s ? 'bg-amber-500 text-forest-950 border-amber-500' : `${STATUS_COLORS[s]} hover:opacity-80`}`}>
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="card overflow-hidden p-0">
            {loading ? (
              <div className="p-8 text-center text-forest-400">Loading leads...</div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-forest-400">
                <div className="text-4xl mb-3">👥</div>
                <p>No leads found. {filterStatus && 'Try clearing the filter.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-forest-700 bg-forest-800/50">
                      <th className="text-left text-forest-400 font-medium px-4 py-3">Name</th>
                      <th className="text-left text-forest-400 font-medium px-4 py-3 hidden sm:table-cell">Phone</th>
                      <th className="text-left text-forest-400 font-medium px-4 py-3 hidden md:table-cell">City</th>
                      <th className="text-left text-forest-400 font-medium px-4 py-3 hidden md:table-cell">Source</th>
                      <th className="text-left text-forest-400 font-medium px-4 py-3">Status</th>
                      <th className="text-left text-forest-400 font-medium px-4 py-3 hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id}
                        onClick={() => openLead(lead)}
                        className={`border-b border-forest-800 cursor-pointer hover:bg-forest-800/40 transition-colors
                          ${selected?.id === lead.id ? 'bg-forest-800/60' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">{lead.name || '—'}</div>
                          <div className="text-forest-500 text-xs sm:hidden">{lead.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-forest-300 hidden sm:table-cell">
                          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()}
                            className="hover:text-amber-400 transition-colors">{lead.phone}</a>
                        </td>
                        <td className="px-4 py-3 text-forest-400 hidden md:table-cell">{lead.city || '—'}</td>
                        <td className="px-4 py-3 text-forest-400 hidden md:table-cell">{lead.source}</td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e => handleStatusChange(lead.id, e.target.value)}
                            disabled={updating}
                            className={`text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer ${STATUS_COLORS[lead.status]}`}>
                            {STATUSES.map(s => <option key={s} value={s} className="bg-forest-900 text-white">{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-forest-500 text-xs hidden lg:table-cell">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lead Detail Panel */}
        <div className="lg:w-1/3">
          {selected ? (
            <div className="card space-y-4 sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold">Lead Detail</h2>
                <button onClick={() => setSelected(null)} className="text-forest-400 hover:text-white text-xs">✕ Close</button>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Phone', value: selected.phone, href: `tel:${selected.phone}` },
                  { label: 'Email', value: selected.email, href: `mailto:${selected.email}` },
                  { label: 'City', value: selected.city },
                  { label: 'Project Type', value: selected.project_type },
                  { label: 'Property Size', value: selected.property_size },
                  { label: 'Source', value: selected.source },
                  { label: 'Created', value: new Date(selected.created_at).toLocaleString() },
                ].map(f => f.value ? (
                  <div key={f.label} className="flex justify-between items-start gap-2">
                    <span className="text-forest-400 text-xs flex-shrink-0">{f.label}</span>
                    {f.href
                      ? <a href={f.href} className="text-amber-400 text-xs font-medium text-right hover:text-amber-300">{f.value}</a>
                      : <span className="text-white text-xs text-right">{f.value}</span>}
                  </div>
                ) : null)}
              </div>

              {selected.message && (
                <div className="bg-forest-800 rounded-lg p-3">
                  <div className="text-forest-400 text-xs mb-1">Message</div>
                  <p className="text-white text-xs leading-relaxed">{selected.message}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="label">Status</label>
                <select value={selected.status} onChange={e => handleStatusChange(selected.id, e.target.value)}
                  disabled={updating} className="input text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea className="input text-sm" rows={4} value={notes}
                  onChange={e => setNotes(e.target.value)} placeholder="Add notes about this lead..." />
                <button onClick={handleSaveNotes} disabled={updating} className="btn-primary text-xs mt-2 !py-1.5 w-full justify-center">
                  Save Notes
                </button>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-forest-700">
                <a href={`tel:${selected.phone}`} className="btn-secondary text-xs !py-2 justify-center">📞 Call</a>
                <a href={`sms:${selected.phone}`} className="btn-secondary text-xs !py-2 justify-center">💬 Text</a>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-forest-400">
              <div className="text-4xl mb-3">👆</div>
              <p className="text-sm">Click a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
