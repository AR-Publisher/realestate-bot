'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100)
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0F] relative overflow-hidden flex flex-col">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(76,168,232,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #9C7A35)' }}>
            <span className="text-black font-bold text-sm">P</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', color: '#C9A84C', fontSize: '1.1rem', fontWeight: 600 }}>
            PropMatch AI
          </span>
        </div>
        <Link href="/dashboard"
          className="text-sm px-4 py-2 rounded-lg transition-all"
          style={{ color: '#A8A4A0', border: '1px solid #2E2E3E' }}
          onMouseEnter={e => { e.target.style.color = '#C9A84C'; e.target.style.borderColor = '#C9A84C' }}
          onMouseLeave={e => { e.target.style.color = '#A8A4A0'; e.target.style.borderColor = '#2E2E3E' }}>
          CRM Dashboard →
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-medium tracking-widest uppercase"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
          AI Property Consultant · Available 24/7
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Find Your Perfect<br />
          <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Property Match
          </span>
        </h1>

        <p style={{ color: '#A8A4A0', fontSize: '1.1rem', maxWidth: '480px', lineHeight: 1.7, marginBottom: '3rem' }}>
          Chat with our AI consultant to discover properties tailored to your budget, location, and lifestyle — and get matched in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/chat"
            className="group relative px-8 py-4 rounded-xl font-medium text-black transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96A)', fontSize: '1rem' }}>
            <span className="relative z-10">Start Property Search</span>
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)' }} />
          </Link>
          <Link href="/dashboard"
            className="px-8 py-4 rounded-xl font-medium transition-all duration-300"
            style={{ color: '#F0EDE8', border: '1px solid #2E2E3E', fontSize: '1rem' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2E2E3E'}>
            View CRM Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 pt-12" style={{ borderTop: '1px solid #1A1A24' }}>
          {[
            { value: '15+', label: 'Properties Listed' },
            { value: 'AI', label: 'Powered Matching' },
            { value: '3', label: 'Lead Classifications' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#C9A84C', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ color: '#6B6870', fontSize: '0.8rem', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
