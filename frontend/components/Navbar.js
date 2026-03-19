import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-forest-950/95 backdrop-blur-sm border-b border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/ironpaw-logo-simple.png"
              alt="Iron Paw Land & Forestry"
              className="h-10 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#services" className="text-forest-300 hover:text-white transition-colors text-sm font-medium">Services</Link>
            <Link href="/#about" className="text-forest-300 hover:text-white transition-colors text-sm font-medium">About</Link>
            <Link href="/quote" className="text-forest-300 hover:text-white transition-colors text-sm font-medium">Quote</Link>
            <Link href="/book" className="text-forest-300 hover:text-white transition-colors text-sm font-medium">Book</Link>
            <a href="tel:+13464766729" className="btn-secondary text-sm !py-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              1-346-IRONPAW
            </a>
            <Link href="/quote" className="btn-primary text-sm !py-2">Get Quote</Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-forest-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-forest-900 border-t border-forest-800 px-4 py-4 flex flex-col gap-4">
          <Link href="/#services" onClick={() => setOpen(false)} className="text-forest-300 hover:text-white font-medium">Services</Link>
          <Link href="/#about" onClick={() => setOpen(false)} className="text-forest-300 hover:text-white font-medium">About</Link>
          <Link href="/quote" onClick={() => setOpen(false)} className="text-forest-300 hover:text-white font-medium">Get a Quote</Link>
          <Link href="/book" onClick={() => setOpen(false)} className="text-forest-300 hover:text-white font-medium">Book Estimate</Link>
          <a href="tel:+13464766729" className="btn-secondary text-sm text-center justify-center">Call 1-346-IRONPAW</a>
          <Link href="/quote" onClick={() => setOpen(false)} className="btn-primary text-sm text-center justify-center">Get Free Quote</Link>
        </div>
      )}
    </nav>
  );
}
