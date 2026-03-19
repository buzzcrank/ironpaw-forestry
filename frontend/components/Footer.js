import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-forest-950 border-t border-forest-800 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="mb-4">
            <img
              src="/ironpaw-logo-simple.png"
              alt="Iron Paw Land & Forestry"
              className="h-14 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <p className="text-forest-400 text-sm leading-relaxed mb-4">
            Professional land clearing and forestry mulching services in the Memphis, TN region.
            Licensed, insured, and ready to tackle any terrain.
          </p>
          <div className="flex gap-3">
            <a href="https://facebook.com/ironpawforestry" target="_blank" rel="noreferrer"
              className="text-forest-400 hover:text-amber-400 transition-colors text-sm">Facebook</a>
            <span className="text-forest-700">|</span>
            <a href="https://youtube.com/@ironpawforestry" target="_blank" rel="noreferrer"
              className="text-forest-400 hover:text-amber-400 transition-colors text-sm">YouTube</a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-semibold mb-3">Services</h3>
          <ul className="space-y-2 text-forest-400 text-sm">
            {['Forestry Mulching', 'Land Clearing', 'Brush Removal', 'Trail Cutting', 'Property Cleanup'].map(s => (
              <li key={s}><Link href="/#services" className="hover:text-amber-400 transition-colors">{s}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-forest-400 text-sm">
            <li>
              <a href="tel:+13464766729" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                1-346-IRONPAW
              </a>
            </li>
            <li>
              <a href="mailto:ironpawforestry@gmail.com" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                ironpawforestry@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Memphis, TN Region
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Link href="/quote" className="btn-primary text-xs !py-2 !px-3">Get Quote</Link>
            <Link href="/book" className="btn-secondary text-xs !py-2 !px-3">Book Now</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-forest-800 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-forest-600 text-xs">© {new Date().getFullYear()} Iron Paw Land Clearing & Forestry. All rights reserved.</p>
        <p className="text-forest-600 text-xs">Memphis, TN · Serving the Mid-South Region</p>
      </div>
    </footer>
  );
}
