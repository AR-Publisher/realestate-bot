'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Welcome! I'm Aria, your personal property consultant. 🏡\n\nI'm here to help you find the perfect property match in Pakistan. Whether you're looking to buy or rent, I'll ask you a few questions to understand exactly what you need — and then show you the best matching options.\n\nLet's start simple — could you tell me your name?"
}

export default function ChatPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [leadId, setLeadId] = useState(null)
  const [leadData, setLeadData] = useState({})
  const [properties, setProperties] = useState([])
  const [showProperties, setShowProperties] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          leadId,
          currentLeadData: leadData
        })
      })

      const data = await res.json()

      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      }
      if (data.leadId) setLeadId(data.leadId)
      if (data.leadData) setLeadData(data.leadData)
      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties)
        setShowProperties(true)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I had a connection issue. Please try sending your message again."
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getClassificationStyle = (c) => {
    if (c === 'Hot') return { color: '#E85D4A', bg: 'rgba(232,93,74,0.15)', border: 'rgba(232,93,74,0.3)', emoji: '🔥' }
    if (c === 'Warm') return { color: '#E8A84C', bg: 'rgba(232,168,76,0.15)', border: 'rgba(232,168,76,0.3)', emoji: '🌤️' }
    return { color: '#4CA8E8', bg: 'rgba(76,168,232,0.15)', border: 'rgba(76,168,232,0.3)', emoji: '❄️' }
  }

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>{line}{i < content.split('\n').length - 1 && <br />}</span>
    ))
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0F' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1A1A24' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #9C7A35)' }}>
              <span className="text-black font-bold text-sm">P</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', color: '#C9A84C', fontWeight: 600 }}>PropMatch AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Lead status pills */}
          {leadData.name && (
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#1A1A24', color: '#A8A4A0' }}>
              👤 {leadData.name}
            </span>
          )}
          {leadData.classification && (() => {
            const s = getClassificationStyle(leadData.classification)
            return (
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {s.emoji} {leadData.classification}
              </span>
            )
          })()}
          <Link href="/dashboard"
            className="text-xs px-4 py-2 rounded-lg transition-all"
            style={{ color: '#A8A4A0', border: '1px solid #2E2E3E' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A8A4A0'; e.currentTarget.style.borderColor = '#2E2E3E' }}>
            Dashboard →
          </Link>
        </div>
      </header>

      <div className="flex flex-1 relative z-10 max-w-7xl mx-auto w-full">
        {/* Chat area */}
        <div className={`flex flex-col transition-all duration-500 ${showProperties ? 'w-full lg:w-[55%]' : 'w-full max-w-3xl mx-auto'}`}>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" style={{ minHeight: 0, maxHeight: 'calc(100vh - 160px)' }}>
            {messages.map((msg, i) => (
              <div key={i}
                className="flex animate-fade-up"
                style={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animationDelay: `${i * 0.05}s` }}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #9C7A35)' }}>
                    <span className="text-black text-xs font-bold">A</span>
                  </div>
                )}
                <div className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #C9A84C22, #C9A84C15)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    color: '#F0EDE8',
                    borderBottomRightRadius: '4px'
                  } : {
                    background: '#1A1A24',
                    border: '1px solid #2E2E3E',
                    color: '#E8E4DF',
                    borderBottomLeftRadius: '4px'
                  }}>
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-start animate-fade-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #9C7A35)' }}>
                  <span className="text-black text-xs font-bold">A</span>
                </div>
                <div className="px-4 py-3 rounded-2xl" style={{ background: '#1A1A24', border: '1px solid #2E2E3E' }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full typing-dot"
                        style={{ background: '#C9A84C', animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-4" style={{ borderTop: '1px solid #1A1A24' }}>
            <div className="flex gap-3 items-end p-3 rounded-2xl"
              style={{ background: '#111118', border: '1px solid #2E2E3E' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm"
                style={{ color: '#F0EDE8', maxHeight: '120px', fontFamily: 'var(--font-sans)' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #C9A84C, #9C7A35)' : '#2E2E3E',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke={input.trim() && !loading ? '#000' : '#6B6870'} strokeWidth="2" strokeLinecap="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() && !loading ? '#000' : '#6B6870'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="text-center mt-2 text-xs" style={{ color: '#6B6870' }}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>

        {/* Property Results Panel */}
        {showProperties && (
          <div className="hidden lg:flex flex-col w-[45%] border-l animate-fade-up overflow-y-auto"
            style={{ borderColor: '#1A1A24', maxHeight: 'calc(100vh - 80px)' }}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #1A1A24' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', color: '#C9A84C', fontSize: '1.1rem', fontWeight: 600 }}>
                    Top Matches
                  </h2>
                  <p className="text-xs mt-1" style={{ color: '#6B6870' }}>{properties.length} properties found for you</p>
                </div>
                <button onClick={() => setShowProperties(false)}
                  className="text-xs px-3 py-1 rounded-lg transition-colors"
                  style={{ color: '#6B6870', border: '1px solid #2E2E3E' }}>
                  Hide
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              {properties.map((prop, i) => (
                <PropertyCard key={prop.id} property={prop} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile property results */}
      {showProperties && (
        <div className="lg:hidden px-4 pb-4 space-y-3">
          <h3 className="text-sm font-medium" style={{ color: '#C9A84C' }}>Top Matches</h3>
          {properties.map((prop, i) => (
            <PropertyCard key={prop.id} property={prop} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ property, rank }) {
  const scoreColor = property.fitScore >= 80 ? '#4CE8A8' : property.fitScore >= 60 ? '#C9A84C' : '#E8A84C'

  return (
    <div className="rounded-xl p-4 transition-all duration-300"
      style={{ background: '#111118', border: '1px solid #2E2E3E' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2E2E3E'}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
            {rank}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{ background: '#1A1A24', color: '#A8A4A0', border: '1px solid #2E2E3E' }}>
            {property.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `${scoreColor}22`, border: `1px solid ${scoreColor}44` }}>
            <span className="text-xs font-bold" style={{ color: scoreColor, fontSize: '9px' }}>
              {property.fitScore}
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-medium text-sm mb-1" style={{ color: '#F0EDE8', fontFamily: 'var(--font-display)' }}>
        {property.title}
      </h3>
      <p className="text-xs mb-2" style={{ color: '#6B6870' }}>📍 {property.location}</p>

      <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: '#A8A4A0' }}>
        <span>🛏 {property.bedrooms} beds</span>
        <span>·</span>
        <span style={{ color: '#C9A84C', fontWeight: 600 }}>
          PKR {Number(property.price).toLocaleString()}
        </span>
      </div>

      <p className="text-xs leading-relaxed mb-3" style={{ color: '#6B6870' }}>
        {property.description?.slice(0, 100)}...
      </p>

      <div className="rounded-lg p-3" style={{ background: `${scoreColor}0D`, border: `1px solid ${scoreColor}22` }}>
        <p className="text-xs leading-relaxed" style={{ color: scoreColor }}>
          ✦ {property.fitExplanation}
        </p>
      </div>
    </div>
  )
}
