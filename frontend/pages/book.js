import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAvailableSlots, createAppointment, submitLead } from '../services/api';

export default function BookPage() {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', notes: '' });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  useEffect(() => {
    getAvailableSlots()
      .then(res => setSlots(res.data.slots || []))
      .catch(() => {
        // Generate client-side fallback slots
        const fallback = [];
        const now = new Date();
        for (let d = 1; d <= 14; d++) {
          const date = new Date(now);
          date.setDate(date.getDate() + d);
          if (date.getDay() === 0 || date.getDay() === 6) continue;
          for (const hour of [8, 10, 13, 15]) {
            const slot = new Date(date);
            slot.setHours(hour, 0, 0, 0);
            fallback.push({
              datetime: slot.toISOString(),
              label: slot.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', hour12: true }),
            });
          }
        }
        setSlots(fallback);
      })
      .finally(() => setLoadingSlots(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) { toast.error('Please select an appointment time.'); return; }
    if (!form.name || !form.phone) { toast.error('Name and phone are required.'); return; }
    setSubmitting(true);
    try {
      // Create lead first
      const leadRes = await submitLead({
        ...form,
        source: 'Booking',
        project_type: 'Estimate',
        message: `Requested estimate slot: ${selectedSlot.label}. ${form.notes}`,
      });
      const leadId = leadRes.data.lead?.id;
      // Create appointment
      await createAppointment({
        lead_id: leadId,
        appointment_type: 'Estimate',
        scheduled_at: selectedSlot.datetime,
        location: form.city,
        notes: form.notes,
      });
      setSubmitted(true);
      toast.success('Estimate booked! We\'ll confirm by phone.');
    } catch {
      toast.error('Booking failed. Please call us at 1-346-IRONPAW.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Head><title>Estimate Booked | Iron Paw Forestry</title></Head>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
          <div className="max-w-lg w-full text-center">
            <div className="text-6xl mb-6">📅</div>
            <h1 className="text-3xl font-black text-white mb-4">Estimate Booked!</h1>
            <div className="card mb-6 text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🗓️</span>
                <div>
                  <div className="text-forest-400 text-xs">Appointment Time</div>
                  <div className="text-white font-bold">{selectedSlot?.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <div className="text-forest-400 text-xs">We'll confirm at</div>
                  <div className="text-white font-bold">{form.phone}</div>
                </div>
              </div>
            </div>
            <p className="text-forest-300 mb-6">We'll call to confirm your appointment and discuss your property before arrival.</p>
            <div className="flex gap-3 justify-center">
              <a href="tel:+13464766729" className="btn-primary">Call Us Now</a>
              <Link href="/" className="btn-secondary">Back to Home</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Group slots by date
  const slotsByDay = slots.reduce((acc, slot) => {
    const day = new Date(slot.datetime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>Book a Free Estimate | Iron Paw Land Clearing</title>
        <meta name="description" content="Schedule your free on-site estimate with Iron Paw Land Clearing. Pick a time that works for you." />
      </Head>
      <Navbar />

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Free On-Site Visit</p>
            <h1 className="text-4xl font-black text-white mb-3">Schedule Your Free Estimate</h1>
            <p className="text-forest-300">Pick a time below. We'll come to your property, walk the site, and give you a firm quote — no obligation.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Slot Picker */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4">Select a Time</h2>
              {loadingSlots ? (
                <div className="text-forest-400 text-center py-12">Loading available times...</div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {Object.entries(slotsByDay).map(([day, daySlots]) => (
                    <div key={day}>
                      <p className="text-forest-400 text-xs font-semibold uppercase tracking-widest mb-2">{day}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {daySlots.map((slot) => {
                          const timeLabel = new Date(slot.datetime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                          return (
                            <button key={slot.datetime} type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all
                                ${selectedSlot?.datetime === slot.datetime
                                  ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                  : 'border-forest-700 bg-forest-800 text-forest-200 hover:border-forest-500'}`}>
                              {timeLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedSlot && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500 rounded-lg p-3 text-sm text-amber-300">
                  Selected: <span className="font-bold">{selectedSlot.label}</span>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="card space-y-4">
              <h2 className="text-white font-bold text-lg">Your Information</h2>
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="John Smith" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input className="input" placeholder="(901) 555-0000" type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)} required />
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input className="input" placeholder="john@example.com" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Property City / Town *</label>
                <input className="input" placeholder="Memphis, TN" value={form.city}
                  onChange={e => set('city', e.target.value)} required />
              </div>
              <div>
                <label className="label">Additional Notes</label>
                <textarea className="input" rows={3} placeholder="Gate code, specific area, acreage estimate..."
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              <button type="submit" disabled={submitting || !selectedSlot} className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Booking...' : selectedSlot ? `Book ${selectedSlot.label}` : 'Select a Time First'}
              </button>

              <p className="text-forest-500 text-xs text-center">
                We'll call to confirm your appointment. Free, no obligation.
              </p>
            </div>
          </form>

          {/* Alternative contact */}
          <div className="mt-12 text-center card">
            <p className="text-forest-300 mb-3">Prefer to call or text?</p>
            <a href="tel:+13464766729" className="text-amber-400 font-black text-2xl hover:text-amber-300 transition-colors">
              1-346-IRONPAW
            </a>
            <p className="text-forest-500 text-sm mt-1">(1-346-476-6729) · Available Mon–Sat 7am–6pm</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
