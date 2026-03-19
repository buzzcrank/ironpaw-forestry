import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAppointments, updateAppointment } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Scheduled: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Completed: 'bg-forest-700/50 text-forest-300 border-forest-600',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments()
      .then(res => setAppointments(res.data.appointments || []))
      .catch(() => toast.error('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id, status) {
    try {
      await updateAppointment(id, { status });
      setAppointments(as => as.map(a => a.id === id ? { ...a, status } : a));
      toast.success('Appointment updated.');
    } catch {
      toast.error('Failed to update.');
    }
  }

  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= new Date());
  const past = appointments.filter(a => new Date(a.scheduled_at) < new Date());

  return (
    <AdminLayout title="Calendar">
      <div className="space-y-6">
        {/* Upcoming */}
        <div>
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>📅</span> Upcoming Appointments ({upcoming.length})
          </h2>
          {loading ? (
            <div className="card text-center text-forest-400 py-8">Loading...</div>
          ) : upcoming.length === 0 ? (
            <div className="card text-center py-10 text-forest-400">
              <div className="text-4xl mb-3">📅</div>
              <p>No upcoming appointments. Share the booking link to get scheduled!</p>
              <p className="text-sm mt-2 text-forest-500">/book on your website</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(appt => (
                <div key={appt.id} className="card border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white font-bold">{appt.lead_name || 'Unknown'}</div>
                      <div className="text-forest-400 text-xs">{appt.appointment_type}</div>
                    </div>
                    <select value={appt.status} onChange={e => changeStatus(appt.id, e.target.value)}
                      className={`text-xs px-2 py-0.5 rounded-full border bg-transparent cursor-pointer ${STATUS_COLORS[appt.status] || ''}`}>
                      {['Scheduled', 'Confirmed', 'Completed', 'Cancelled'].map(s =>
                        <option key={s} value={s} className="bg-forest-900 text-white">{s}</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <span>🗓️</span>
                      {new Date(appt.scheduled_at).toLocaleString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit', hour12: true
                      })}
                    </div>
                    {appt.location && <div className="flex items-center gap-2 text-forest-400"><span>📍</span> {appt.location}</div>}
                    {appt.lead_phone && (
                      <a href={`tel:${appt.lead_phone}`} className="flex items-center gap-2 text-forest-400 hover:text-amber-400 transition-colors">
                        <span>📞</span> {appt.lead_phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="text-forest-400 font-bold mb-3 text-sm uppercase tracking-widest">Past ({past.length})</h2>
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-forest-700 bg-forest-800/50">
                    <th className="text-left text-forest-400 font-medium px-4 py-2">Customer</th>
                    <th className="text-left text-forest-400 font-medium px-4 py-2 hidden sm:table-cell">Date</th>
                    <th className="text-left text-forest-400 font-medium px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {past.slice(0, 20).map(appt => (
                    <tr key={appt.id} className="border-b border-forest-800 opacity-60">
                      <td className="px-4 py-2 text-white">{appt.lead_name || '—'}</td>
                      <td className="px-4 py-2 text-forest-400 hidden sm:table-cell text-xs">
                        {new Date(appt.scheduled_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status] || ''}`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
