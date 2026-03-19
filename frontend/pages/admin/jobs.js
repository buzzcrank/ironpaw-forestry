import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getJobs, updateJob } from '../../services/api';
import toast from 'react-hot-toast';

const JOB_STATUSES = ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];
const STATUS_COLORS = {
  Pending: 'bg-forest-700/50 text-forest-300 border-forest-600',
  Scheduled: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'In Progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs()
      .then(res => setJobs(res.data.jobs || []))
      .catch(() => toast.error('Failed to load jobs.'))
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id, status) {
    try {
      await updateJob(id, { status });
      setJobs(js => js.map(j => j.id === id ? { ...j, status } : j));
      toast.success('Job updated.');
    } catch {
      toast.error('Failed to update.');
    }
  }

  const totalRevenue = jobs.filter(j => j.status === 'Completed').reduce((s, j) => s + (parseFloat(j.revenue) || 0), 0);

  return (
    <AdminLayout title="Jobs">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Jobs', value: jobs.length, color: 'text-white' },
          { label: 'In Progress', value: jobs.filter(j => j.status === 'In Progress').length, color: 'text-amber-400' },
          { label: 'Completed', value: jobs.filter(j => j.status === 'Completed').length, color: 'text-green-400' },
          { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-amber-400' },
        ].map(m => (
          <div key={m.label} className="card">
            <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
            <div className="text-forest-400 text-xs mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-forest-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-forest-400">
            <div className="text-4xl mb-3">🚜</div>
            <p>No jobs yet. Jobs are created when leads are confirmed.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-700 bg-forest-800/50">
                <th className="text-left text-forest-400 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3 hidden sm:table-cell">Title</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3 hidden md:table-cell">Operator</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3 hidden md:table-cell">Scheduled</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3 hidden lg:table-cell">Revenue</th>
                <th className="text-left text-forest-400 font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-forest-800 hover:bg-forest-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{job.customer_name || '—'}</div>
                    <div className="text-forest-500 text-xs">{job.city}</div>
                  </td>
                  <td className="px-4 py-3 text-forest-300 hidden sm:table-cell">{job.title || '—'}</td>
                  <td className="px-4 py-3 text-forest-300 hidden md:table-cell">{job.operator_name || '—'}</td>
                  <td className="px-4 py-3 text-forest-300 hidden md:table-cell">
                    {job.scheduled_start ? new Date(job.scheduled_start).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-amber-400 font-bold hidden lg:table-cell">
                    {job.revenue ? `$${parseInt(job.revenue).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select value={job.status} onChange={e => changeStatus(job.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer ${STATUS_COLORS[job.status] || ''}`}>
                      {JOB_STATUSES.map(s => <option key={s} value={s} className="bg-forest-900 text-white">{s}</option>)}
                    </select>
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
