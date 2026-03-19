import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import { submitLead } from '../services/api';

const SERVICES = [
  {
    icon: '🌲',
    title: 'Forestry Mulching',
    desc: 'Clear trees, brush, and undergrowth in a single pass. Our mulching equipment turns vegetation into beneficial ground cover — no burning, no hauling.',
    price: 'From $800/acre',
  },
  {
    icon: '🏗️',
    title: 'Land Clearing',
    desc: 'Full site prep for construction, agriculture, or development. We clear and grade to your specifications, ready for the next phase.',
    price: 'Custom quote',
  },
  {
    icon: '🌿',
    title: 'Brush Removal',
    desc: 'Overgrown fence lines, hedgerows, and neglected land brought back to life. Fast, thorough, and affordable.',
    price: 'From $700/acre',
  },
  {
    icon: '🛤️',
    title: 'Trail Cutting',
    desc: 'Hunting trails, ATV paths, and recreational routes cut precisely through your property. Minimal disruption to surrounding trees.',
    price: 'Per linear foot',
  },
  {
    icon: '🌪️',
    title: 'Storm Cleanup',
    desc: 'Fast response for downed trees, debris removal, and storm-damaged land cleanup. We get your property safe and clear.',
    price: 'Call for rate',
  },
  {
    icon: '🏠',
    title: 'Property Cleanup',
    desc: 'Neglected residential or commercial properties transformed. Ideal for real estate investors, developers, and landowners.',
    price: 'Free estimate',
  },
];

const PROCESS = [
  { step: '01', title: 'Request a Quote', desc: 'Tell us about your property — acres, vegetation type, and location. Get an instant estimate.' },
  { step: '02', title: 'Free Site Visit', desc: "We schedule a free on-site estimate at your convenience. We'll walk the property and confirm the scope." },
  { step: '03', title: 'We Get to Work', desc: 'Our equipment arrives on schedule. We complete the job efficiently and clean up after ourselves.' },
  { step: '04', title: "You're Done", desc: 'Final walkthrough, invoice, and follow-up. Most jobs completed in 1–2 days.' },
];

const STATS = [
  { value: '$800–$1,500', label: 'Per Acre', sub: 'Depending on vegetation density' },
  { value: '1–2 Days', label: 'Avg Job Time', sub: 'Most residential projects' },
  { value: 'Same Week', label: 'Booking', sub: 'Fast turnaround available' },
  { value: '100%', label: 'Insured', sub: 'Fully licensed & covered' },
];

function QuickContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await submitLead({ ...form, source: 'Contact Form' });
      setSent(true);
      toast.success("Message received! We'll call you soon.");
    } catch {
      toast.error('Something went wrong. Please call us directly.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center justify-center text-center py-12">
        <div className="text-5xl mb-4">🌲</div>
        <h3 className="text-white font-bold text-xl mb-2">Message Received!</h3>
        <p className="text-forest-300">We'll be in touch shortly to schedule your free estimate.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-white font-bold text-xl">Send a Message</h3>
      <div>
        <label className="label">Your Name *</label>
        <input className="input" placeholder="John Smith" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Phone Number *</label>
        <input className="input" placeholder="(901) 555-0000" type="tel" value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
      </div>
      <div>
        <label className="label">What do you need help with?</label>
        <textarea className="input" rows={4} placeholder="I have 3 acres of overgrown brush..."
          value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Iron Paw Land Clearing & Forestry | Memphis TN</title>
        <meta name="description" content="Professional forestry mulching and land clearing in Memphis, TN. Fast quotes, free estimates. Call 1-346-IRONPAW." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
          <svg viewBox="0 0 1200 120" className="w-full h-full fill-forest-700">
            <path d="M0,60 L100,20 L150,60 L200,10 L260,60 L320,0 L380,60 L440,30 L500,60 L560,15 L620,60 L700,25 L760,60 L820,5 L880,60 L940,35 L1000,60 L1060,20 L1120,60 L1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Hero Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10 shadow-2xl inline-block">
              <img
                src="/ironpaw-logo-color.png"
                alt="Iron Paw Land & Forestry"
                className="h-40 sm:h-52 w-auto drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-forest-800 border border-forest-600 rounded-full px-4 py-1.5 text-sm text-forest-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Memphis, TN Region — Serving the Mid-South
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-none mb-6">
            Professional
            <span className="block text-amber-400">Land Clearing</span>
            <span className="block text-forest-300 text-3xl sm:text-4xl md:text-5xl font-bold">& Forestry Mulching</span>
          </h1>

          <p className="text-forest-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Fast. Affordable. Professional. We clear brush, trees, and overgrowth so you can
            build, farm, or finally enjoy your land. Free estimates. Same-week booking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/quote" className="btn-primary text-lg px-8 py-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Get Free Quote
            </Link>
            <a href="tel:+13464766729" className="btn-outline text-lg px-8 py-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 1-346-IRONPAW
            </a>
            <Link href="/book" className="btn-secondary text-lg px-8 py-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Estimate
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-forest-900/60 border border-forest-700 rounded-xl p-4">
                <div className="text-amber-400 font-black text-xl">{s.value}</div>
                <div className="text-white font-semibold text-sm">{s.label}</div>
                <div className="text-forest-400 text-xs mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-4 bg-forest-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">What We Do</p>
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              From a quarter-acre lot to a 100-acre ranch — we have the equipment and experience to handle it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="card hover:border-forest-500 transition-colors">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-white font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-forest-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="text-amber-400 font-semibold text-sm">{s.price}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/quote" className="btn-primary">Get a Free Quote for Your Property</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 bg-forest-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">From first contact to cleared land — here's what to expect.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS.map((p) => (
              <div key={p.step}>
                <div className="w-12 h-12 rounded-full bg-amber-500 text-forest-950 font-black text-lg flex items-center justify-center mb-4">
                  {p.step}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-forest-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-24 px-4 bg-forest-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Transparent Pricing</p>
            <h2 className="section-title">What Does It Cost?</h2>
            <p className="section-subtitle">Pricing depends on acreage, density, and terrain. Use our quote calculator for an instant estimate.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { tier: 'Light Brush', range: '$700–$900/acre', desc: 'Open fields, thin saplings, light undergrowth', color: 'border-green-500' },
              { tier: 'Medium Brush', range: '$900–$1,200/acre', desc: 'Overgrown fields, mixed brush, moderate density', color: 'border-amber-500', featured: true },
              { tier: 'Heavy Brush', range: '$1,200–$1,600/acre', desc: 'Dense forest, thick brush, heavy vegetation', color: 'border-red-500' },
            ].map((p) => (
              <div key={p.tier} className={`card border-2 ${p.color} relative`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-forest-950 text-xs font-bold px-3 py-1 rounded-full">
                    Most Common
                  </div>
                )}
                <h3 className="text-white font-bold text-lg mb-1">{p.tier}</h3>
                <div className="text-amber-400 font-black text-2xl mb-2">{p.range}</div>
                <p className="text-forest-400 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-forest-400 text-sm mb-6">All pricing includes equipment, operator, and cleanup. No hidden fees.</p>
            <Link href="/quote" className="btn-primary text-lg px-10">Calculate Your Quote</Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-4 bg-forest-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">About Iron Paw</p>
            <h2 className="section-title mb-6">Built Different. Built for the South.</h2>
            <p className="text-forest-300 leading-relaxed mb-4">
              Iron Paw Land Clearing & Forestry is a Memphis-based operation built on one principle:
              show up, do great work, and leave your land better than we found it.
            </p>
            <p className="text-forest-300 leading-relaxed mb-4">
              We run modern forestry mulching equipment that handles brush, trees, and tough terrain efficiently.
              No burning. No hauling debris. Just professional results at competitive rates.
            </p>
            <p className="text-forest-300 leading-relaxed mb-8">
              From small residential lots to large rural acreage — we price fairly, arrive on time,
              and won't leave you hanging.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/quote" className="btn-primary">Get Your Quote</Link>
              <a href="mailto:ironpawforestry@gmail.com" className="btn-secondary">Email Us</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '✅', label: 'Licensed & Insured' },
              { icon: '📞', label: 'Free Site Estimates' },
              { icon: '⚡', label: 'Fast Turnaround' },
              { icon: '💰', label: 'Transparent Pricing' },
              { icon: '🌍', label: 'Memphis TN Region' },
              { icon: '🤖', label: 'AI-Assisted Quoting' },
            ].map((f) => (
              <div key={f.label} className="card flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-forest-200 font-medium text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-forest-950 mb-4">Ready to Clear Your Land?</h2>
          <p className="text-forest-800 text-lg mb-8">
            Get a free estimate today. No obligation. We'll walk your property and tell you exactly what it'll cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="bg-forest-950 text-amber-400 font-bold px-8 py-4 rounded-lg hover:bg-forest-900 transition-colors text-lg">
              Calculate Quote Online
            </Link>
            <a href="tel:+13464766729" className="bg-white/20 text-forest-950 font-bold px-8 py-4 rounded-lg hover:bg-white/30 transition-colors text-lg">
              Call 1-346-IRONPAW
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-4 bg-forest-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Get In Touch</p>
            <h2 className="section-title mb-4">Contact Iron Paw</h2>
            <p className="text-forest-300 mb-8">Call, text, email, or use our chat. We respond fast — usually same day.</p>
            <div className="space-y-4">
              {[
                { icon: '📞', label: 'Phone / Text', value: '1-346-IRONPAW (1-346-476-6729)', href: 'tel:+13464766729' },
                { icon: '📧', label: 'Email', value: 'ironpawforestry@gmail.com', href: 'mailto:ironpawforestry@gmail.com' },
                { icon: '📍', label: 'Service Area', value: 'Memphis TN & surrounding Mid-South region', href: null },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-forest-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">{c.icon}</div>
                  <div>
                    <div className="text-forest-400 text-xs mb-0.5">{c.label}</div>
                    {c.href
                      ? <a href={c.href} className="text-white hover:text-amber-400 font-medium transition-colors">{c.value}</a>
                      : <span className="text-white font-medium">{c.value}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <QuickContactForm />
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </>
  );
}
