import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { estimateQuote, submitLead, createQuote } from '../services/api';

const DENSITY_OPTIONS = [
  { value: 'light', label: 'Light Brush', desc: 'Thin grass, weeds, small saplings under 2"', range: '$700–$900/acre' },
  { value: 'medium', label: 'Medium Brush', desc: 'Mixed brush, shrubs, trees up to 4"', range: '$900–$1,200/acre' },
  { value: 'heavy', label: 'Heavy Brush', desc: 'Dense brush, trees 4–8", thick undergrowth', range: '$1,200–$1,600/acre' },
  { value: 'very_heavy', label: 'Very Dense / Trees', desc: 'Mature trees 8"+, dense forest, extremely thick brush', range: '$1,500–$2,000/acre' },
];

const TERRAIN_OPTIONS = [
  { value: 'flat', label: 'Flat', desc: 'No slope, easy machine access' },
  { value: 'rolling', label: 'Rolling', desc: 'Gentle hills, some slope' },
  { value: 'steep', label: 'Steep / Rough', desc: 'Significant grade, challenging terrain' },
];

const ACCESS_OPTIONS = [
  { value: 'easy', label: 'Easy', desc: 'Wide access road or open entry' },
  { value: 'moderate', label: 'Moderate', desc: 'Some obstacles but passable' },
  { value: 'difficult', label: 'Difficult', desc: 'Tight access, gates, or tight areas' },
];

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    acreage: '',
    vegetation_density: '',
    terrain: 'flat',
    access_difficulty: 'easy',
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleCalculate(e) {
    e.preventDefault();
    if (!form.acreage || !form.vegetation_density) {
      toast.error('Please fill in acreage and vegetation density.');
      return;
    }
    setLoading(true);
    try {
      const res = await estimateQuote({
        acreage: parseFloat(form.acreage),
        vegetation_density: form.vegetation_density,
        terrain: form.terrain,
        access_difficulty: form.access_difficulty,
      });
      setEstimate(res.data.estimate);
      setStep(2);
    } catch {
      // Fallback client-side calculation
      const tier = { light: [700, 900], medium: [900, 1200], heavy: [1200, 1600], very_heavy: [1500, 2000] };
      const tMult = { flat: 1.0, rolling: 1.1, steep: 1.3 };
      const aMult = { easy: 1.0, moderate: 1.1, difficult: 1.25 };
      const [lo, hi] = tier[form.vegetation_density] || tier.medium;
      const acres = parseFloat(form.acreage) || 1;
      const mult = (tMult[form.terrain] || 1) * (aMult[form.access_difficulty] || 1);
      setEstimate({ low: Math.round(lo * acres * mult), high: Math.round(hi * acres * mult), acreage: acres });
      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required.');
      return;
    }
    setLoading(true);
    try {
      await submitLead({
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        project_type: 'Land Clearing / Forestry Mulching',
        property_size: `${form.acreage} acres`,
        message: `Density: ${form.vegetation_density}, Terrain: ${form.terrain}, Access: ${form.access_difficulty}. ${form.message}`,
        source: 'Quote Calculator',
      });
      setSubmitted(true);
      toast.success("Quote request submitted! We'll be in touch shortly.");
    } catch {
      toast.error('Submission failed. Please call us directly at 1-346-IRONPAW.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Head><title>Quote Submitted | Iron Paw Forestry</title></Head>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
          <div className="max-w-lg w-full text-center">
            <div className="text-6xl mb-6">🌲</div>
            <h1 className="text-3xl font-black text-white mb-4">Quote Request Received!</h1>
            <p className="text-forest-300 text-lg mb-2">
              We'll review your property details and reach out to <span className="text-amber-400 font-semibold">{form.phone}</span> shortly.
            </p>
            {estimate && (
              <div className="card my-6 text-left">
                <p className="text-forest-400 text-sm mb-1">Your estimated range:</p>
                <div className="text-amber-400 font-black text-3xl">${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}</div>
                <p className="text-forest-400 text-xs mt-1">For {form.acreage} acres · {form.vegetation_density} brush</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Link href="/book" className="btn-primary">Book an Estimate</Link>
              <Link href="/" className="btn-secondary">Back to Home</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Get a Free Quote | Iron Paw Land Clearing</title>
        <meta name="description" content="Get an instant land clearing and forestry mulching quote. Tell us about your property and get a same-day estimate." />
      </Head>
      <Navbar />

      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-2">Free Estimate</p>
            <h1 className="text-4xl font-black text-white mb-3">Get Your Quote</h1>
            <p className="text-forest-300">Answer a few quick questions and get an instant price estimate for your property.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {['Property Details', 'Your Estimate', 'Contact Info'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-amber-500 text-forest-950' : 'bg-forest-700 text-forest-400'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-white' : 'text-forest-500'}`}>{s}</span>
                {i < 2 && <div className={`h-0.5 flex-1 ${step > i + 1 ? 'bg-green-500' : 'bg-forest-700'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Property Details */}
          {step === 1 && (
            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="card">
                <h2 className="text-white font-bold text-xl mb-6">Tell Us About Your Property</h2>

                <div className="mb-6">
                  <label className="label">How many acres? *</label>
                  <input
                    type="number" min="0.1" max="10000" step="0.1"
                    className="input text-2xl font-bold"
                    placeholder="e.g. 2.5"
                    value={form.acreage}
                    onChange={e => set('acreage', e.target.value)}
                    required
                  />
                  <p className="text-forest-500 text-xs mt-1">Not sure? Estimate — we'll confirm on-site.</p>
                </div>

                <div className="mb-6">
                  <label className="label">Vegetation Density *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DENSITY_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => set('vegetation_density', opt.value)}
                        className={`text-left p-4 rounded-lg border-2 transition-all
                          ${form.vegetation_density === opt.value
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-forest-700 bg-forest-800 hover:border-forest-500'}`}>
                        <div className="text-white font-semibold text-sm">{opt.label}</div>
                        <div className="text-forest-400 text-xs mt-0.5">{opt.desc}</div>
                        <div className="text-amber-400 font-bold text-xs mt-1">{opt.range}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="label">Terrain</label>
                    <div className="space-y-2">
                      {TERRAIN_OPTIONS.map(opt => (
                        <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                          ${form.terrain === opt.value ? 'border-amber-500 bg-amber-500/10' : 'border-forest-700 bg-forest-800'}`}>
                          <input type="radio" name="terrain" value={opt.value} checked={form.terrain === opt.value}
                            onChange={() => set('terrain', opt.value)} className="mt-1 accent-amber-500" />
                          <div>
                            <div className="text-white text-sm font-medium">{opt.label}</div>
                            <div className="text-forest-400 text-xs">{opt.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Equipment Access</label>
                    <div className="space-y-2">
                      {ACCESS_OPTIONS.map(opt => (
                        <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all
                          ${form.access_difficulty === opt.value ? 'border-amber-500 bg-amber-500/10' : 'border-forest-700 bg-forest-800'}`}>
                          <input type="radio" name="access" value={opt.value} checked={form.access_difficulty === opt.value}
                            onChange={() => set('access_difficulty', opt.value)} className="mt-1 accent-amber-500" />
                          <div>
                            <div className="text-white text-sm font-medium">{opt.label}</div>
                            <div className="text-forest-400 text-xs">{opt.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-lg py-4">
                {loading ? 'Calculating...' : 'Calculate My Estimate →'}
              </button>
            </form>
          )}

          {/* Step 2: Estimate Result */}
          {step === 2 && estimate && (
            <div className="space-y-6">
              <div className="card border-2 border-amber-500">
                <div className="text-center">
                  <p className="text-forest-300 text-sm mb-2">Your Estimated Project Cost</p>
                  <div className="text-amber-400 font-black text-5xl mb-2">
                    ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
                  </div>
                  <p className="text-forest-400 text-sm">
                    For {form.acreage} acres · {DENSITY_OPTIONS.find(d => d.value === form.vegetation_density)?.label}
                    {form.terrain !== 'flat' && ` · ${form.terrain} terrain`}
                  </p>
                </div>

                <div className="mt-6 border-t border-forest-700 pt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-white font-bold">{form.acreage} acres</div>
                    <div className="text-forest-400 text-xs">Property Size</div>
                  </div>
                  <div>
                    <div className="text-white font-bold capitalize">{form.vegetation_density.replace('_', ' ')}</div>
                    <div className="text-forest-400 text-xs">Vegetation</div>
                  </div>
                  <div>
                    <div className="text-white font-bold capitalize">{form.terrain}</div>
                    <div className="text-forest-400 text-xs">Terrain</div>
                  </div>
                </div>

                <p className="text-forest-400 text-xs mt-4 text-center">
                  * Final price confirmed after free on-site estimate. No obligation.
                </p>
              </div>

              <div className="card">
                <h2 className="text-white font-bold text-xl mb-1">Claim Your Free Quote</h2>
                <p className="text-forest-400 text-sm mb-6">Enter your info and we'll follow up to schedule a free on-site estimate.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Email (optional)</label>
                      <input className="input" placeholder="john@example.com" type="email" value={form.email}
                        onChange={e => set('email', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Property City</label>
                      <input className="input" placeholder="Memphis" value={form.city}
                        onChange={e => set('city', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Additional Notes (optional)</label>
                    <textarea className="input" rows={3} placeholder="Any details about your property..."
                      value={form.message} onChange={e => set('message', e.target.value)} />
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-shrink-0">← Back</button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                      {loading ? 'Submitting...' : 'Submit Quote Request'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="text-center">
                <p className="text-forest-400 text-sm">Prefer to talk? Call us now:</p>
                <a href="tel:+13464766729" className="text-amber-400 font-bold text-lg hover:text-amber-300 transition-colors">
                  1-346-IRONPAW (1-346-476-6729)
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
