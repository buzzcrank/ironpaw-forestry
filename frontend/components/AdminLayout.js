import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/leads', label: 'Leads / CRM', icon: '👥' },
  { href: '/admin/quotes', label: 'Quotes', icon: '📋' },
  { href: '/admin/jobs', label: 'Jobs', icon: '🚜' },
  { href: '/admin/calendar', label: 'Calendar', icon: '📅' },
];

export default function AdminLayout({ children, title = 'Admin' }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{title} | Iron Paw Admin</title>
      </Head>
      <div className="flex h-screen bg-forest-950 overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-forest-900 border-r border-forest-700 flex flex-col transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
          {/* Logo */}
          <div className="p-4 border-b border-forest-700 flex items-center gap-3">
            <img src="/ironpaw-logo-simple.png" alt="Iron Paw" className="h-10 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${router.pathname === item.href
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-forest-300 hover:bg-forest-800 hover:text-white'}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-forest-700 space-y-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest-400 hover:text-white hover:bg-forest-800 transition-colors">
              <span>🌐</span> View Website
            </Link>
            <a href="tel:+13464766729" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-forest-400 hover:text-white hover:bg-forest-800 transition-colors">
              <span>📞</span> 1-346-IRONPAW
            </a>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="bg-forest-900 border-b border-forest-700 px-4 py-3 flex items-center gap-4 flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-forest-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-white font-bold text-lg flex-1">{title}</h1>
            <Link href="/quote" className="btn-primary text-xs !py-1.5 !px-3">+ New Lead</Link>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
