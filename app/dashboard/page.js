'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selectedLead, setSelectedLead] = useState(null)
  const [conversations, setConversations] = useState([])
  const [convLoading, setConvLoading] = useState(false)
  const [hotAlert, setHotAlert] = useState(null)
  const [prevHotCount, setPrevHotCount] = useState(0)

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      const newLeads = data.leads || []

      // Hot lead alert
      const hotLeads = newLeads.filter(l => l.classification === 'Hot')
      if (hotLeads.length > prevHotCount && prevHotCount !== 0) {
        setHotAlert(hotLeads[0])
        setTimeout(() => setHotAlert(null), 6000)
      }
      setPrevHotCount(hotLeads.length)
      setLeads(newLeads)
    } catch (e) {
      console.error('Failed to fetch leads', e)
    } finally {
      setLoading(false)
    }
  }, [prevHotCount])

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 15000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const fetchConversations = async (leadId) => {
    setConvLoading(true)
    try {
      const res = await fetch(`/api/conversations?leadId=${leadId}`)
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {
      setConversations([])
    } finally {
      setConvLoading(false)
    }
  }

  const openLead = (lead) => {
    setSelectedLead(lead)
    fetchConversations(lead.id)
  }

  const closeLead = () => {
    setSelectedLead(null)
    setConversations([])
  }

  const filtered = filter === 'All' ? leads : leads.filter(l => l.classification === filter)

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.classification === 'Hot').length,
    warm: leads.filter(l => l.classification === 'Warm').length,
    cold: leads.filter(l => l.classification === 'Cold').length,
  }

  const getBadgeStyle = (c) => {
    if (c === 'Hot') return 'badge-hot'
    if (c === 'Warm') return 'badge-warm'
    return 'badge-cold'
  }

  const getEmoji = (c) => c === 'Hot' ? '🔥' : c === 'Warm' ? '🌤️' : '❄️'

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      {/* Hot Lead Alert */}
      {hotAlert && (
        <div className="fixed top-4 right-4 z-50 animate-fade-up max-w-sm p-4 rounded-2xl"
          style={{ background: 'rgba(232,93,74,0.15)', border: '2px solid rgba(232,93,74,0.5)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#E85D4A' }}>Hot Lead Alert!</p>
              <p className="text-xs mt-1" style={{ color: '#A8A4A0' }}>
                {hotAlert.name || 'A new lead'} is ready to buy — Budget: PKR {hotAlert.budget?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <button onClick={() => setHotAlert(null)} style={{ color: '#6B6870', marginLeft: 'auto' }}>✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1A1A24' }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #9C7A35)' }}>
              <span className="text-black font-bold text-sm">P</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', color: '#C9A84C', fontWeight: 600 }}>PropMatch AI</span>
          </Link>
          <span style={{ color: '#2E2E3E' }}>|</span>
          <span style={{ color: '#A8A4A0', fontSize: '0.875rem' }}>CRM Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLeads}
            className="text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            style={{ color: '#A8A4A0', border: '1px solid #2E2E3E' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A8A4A0'; e.currentTarget.style.borderColor = '#2E2E3E' }}>
            ↻ Refresh
          </button>
          <Link href="/chat"
            className="text-xs px-4 py-2 rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #9C7A35)', color: '#000' }}>
            + New Chat
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: stats.total, color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.2)' },
            { label: '🔥 Hot Leads', value: stats.hot, color: '#E85D4A', bg: 'rgba(232,93,74,0.1)', border: 'rgba(232,93,74,0.2)' },
            { label: '🌤️ Warm Leads', value: stats.warm, color: '#E8A84C', bg: 'rgba(232,168,76,0.1)', border: 'rgba(232,168,76,0.2)' },
            { label: '❄️ Cold Leads', value: stats.cold, color: '#4CA8E8', bg: 'rgba(76,168,232,0.1)', border: 'rgba(76,168,232,0.2)' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-5 transition-all"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <p className="text-xs mb-2" style={{ color: '#6B6870' }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Title + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#F0EDE8', fontWeight: 600 }}>
            All Leads
          </h1>
          <div className="flex gap-2">
            {['All', 'Hot', 'Warm', 'Cold'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-xs px-4 py-2 rounded-lg transition-all font-medium"
                style={{
                  background: filter === f ? 'linear-gradient(135deg, #C9A84C, #9C7A35)' : '#1A1A24',
                  color: filter === f ? '#000' : '#A8A4A0',
                  border: filter === f ? 'none' : '1px solid #2E2E3E'
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1A1A24' }}>
          {/* Table header */}
          <div className="grid grid-cols-7 px-5 py-3 text-xs font-medium uppercase tracking-wider"
            style={{ background: '#111118', color: '#6B6870', borderBottom: '1px solid #1A1A24' }}>
            <span className="col-span-2">Contact</span>
            <span>Status</span>
            <span>Budget</span>
            <span>Preference</span>
            <span>Timeline</span>
            <span>Date</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full typing-dot" style={{ background: '#C9A84C', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ fontFamily: 'var(--font-display)', color: '#2E2E3E', fontSize: '1.5rem' }}>No leads yet</p>
              <p className="text-sm mt-2" style={{ color: '#6B6870' }}>Start a chat to capture your first lead</p>
              <Link href="/chat" className="inline-block mt-4 text-sm px-6 py-3 rounded-xl font-medium"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #9C7A35)', color: '#000' }}>
                Open Chat
              </Link>
            </div>
          ) : (
            filtered.map((lead, i) => (
              <div key={lead.id}
                className="grid grid-cols-7 px-5 py-4 cursor-pointer transition-all items-center"
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid #111118' : 'none',
                  background: i % 2 === 0 ? '#0A0A0F' : '#0D0D13'
                }}
                onClick={() => openLead(lead)}
                onMouseEnter={e => e.currentTarget.style.background = '#1A1A24'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0A0A0F' : '#0D0D13'}>

                {/* Contact */}
                <div className="col-span-2">
                  <p className="text-sm font-medium" style={{ color: '#F0EDE8' }}>{lead.name || '—'}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6870' }}>{lead.email || 'No email'}</p>
                  {lead.phone && <p className="text-xs" style={{ color: '#6B6870' }}>{lead.phone}</p>}
                </div>

                {/* Status */}
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeStyle(lead.classification)}`}>
                    {getEmoji(lead.classification)} {lead.classification || 'Cold'}
                  </span>
                </div>

                {/* Budget */}
                <div>
                  <p className="text-sm" style={{ color: '#C9A84C' }}>
                    {lead.budget ? `PKR ${Number(lead.budget).toLocaleString()}` : '—'}
                  </p>
                </div>

                {/* Preference */}
                <div>
                  <p className="text-xs" style={{ color: '#A8A4A0' }}>{lead.location_preference || '—'}</p>
                  {lead.bedrooms && <p className="text-xs" style={{ color: '#6B6870' }}>{lead.bedrooms} bed · {lead.deal_type || '—'}</p>}
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-xs" style={{ color: '#A8A4A0' }}>{lead.timeline || '—'}</p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs" style={{ color: '#6B6870' }}>{formatDate(lead.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lead detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && closeLead()}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl animate-fade-up"
            style={{ background: '#111118', border: '1px solid #2E2E3E' }}>
            {/* Modal header */}
            <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid #1A1A24' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: '#F0EDE8', fontSize: '1.3rem', fontWeight: 600 }}>
                  {selectedLead.name || 'Unknown Lead'}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#6B6870' }}>{selectedLead.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getBadgeStyle(selectedLead.classification)}`}>
                  {getEmoji(selectedLead.classification)} {selectedLead.classification}
                </span>
                <button onClick={closeLead} style={{ color: '#6B6870', fontSize: '1.2rem' }}>✕</button>
              </div>
            </div>

            {/* Lead details */}
            <div className="p-6 grid grid-cols-2 gap-4" style={{ borderBottom: '1px solid #1A1A24' }}>
              {[
                { label: 'Budget', value: selectedLead.budget ? `PKR ${Number(selectedLead.budget).toLocaleString()}` : '—' },
                { label: 'Deal Type', value: selectedLead.deal_type || '—' },
                { label: 'Location', value: selectedLead.location_preference || '—' },
                { label: 'Bedrooms', value: selectedLead.bedrooms || '—' },
                { label: 'Timeline', value: selectedLead.timeline || '—' },
                { label: 'Phone', value: selectedLead.phone || '—' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: '#1A1A24' }}>
                  <p className="text-xs" style={{ color: '#6B6870' }}>{item.label}</p>
                  <p className="text-sm font-medium mt-1" style={{ color: '#F0EDE8' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Conversation history */}
            <div className="p-6">
              <h3 className="text-sm font-medium mb-4" style={{ color: '#C9A84C' }}>Conversation History</h3>
              {convLoading ? (
                <div className="flex justify-center py-6">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full typing-dot" style={{ background: '#C9A84C', animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-sm" style={{ color: '#6B6870' }}>No conversation recorded.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {conversations.map((conv) => (
                    <div key={conv.id}
                      className="flex"
                      style={{ justifyContent: conv.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div className="max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                        style={conv.role === 'user' ? {
                          background: 'rgba(201,168,76,0.15)',
                          border: '1px solid rgba(201,168,76,0.2)',
                          color: '#F0EDE8'
                        } : {
                          background: '#1A1A24',
                          border: '1px solid #2E2E3E',
                          color: '#A8A4A0'
                        }}>
                        {conv.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
