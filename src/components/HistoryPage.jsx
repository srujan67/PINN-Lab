import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateResult } from '../lib/parameterExtractor'

export default function HistoryPage({ currentUser, setCurrentUser, onNavigateToEquation }) {
  const [isLoginTab, setIsLoginTab] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [historyItems, setHistoryItems] = useState([])

  // Load history when user changes
  useEffect(() => {
    if (currentUser) {
      const historyKey = `pinn_history_${currentUser.username}`
      const items = JSON.parse(localStorage.getItem(historyKey) || '[]')
      setHistoryItems(items)
    } else {
      setHistoryItems([])
    }
  }, [currentUser])

  // Handle Authentication
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setAuthError('')

    if (!username.trim() || !password.trim()) {
      setAuthError('Please fill in all fields.')
      return
    }

    const users = JSON.parse(localStorage.getItem('pinn_users') || '[]')

    if (isLoginTab) {
      // Login Flow
      const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password)
      if (foundUser) {
        const sessionUser = { username: foundUser.username }
        localStorage.setItem('pinn_session_user', JSON.stringify(sessionUser))
        setCurrentUser(sessionUser)
      } else {
        setAuthError('Invalid username or password.')
      }
    } else {
      // Signup Flow
      const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase())
      if (userExists) {
        setAuthError('Username is already taken.')
      } else {
        const newUser = { username, password }
        users.push(newUser)
        localStorage.setItem('pinn_users', JSON.stringify(users))

        const sessionUser = { username }
        localStorage.setItem('pinn_session_user', JSON.stringify(sessionUser))
        setCurrentUser(sessionUser)
      }
    }
  }

  // Delete a single item
  const handleDeleteItem = (itemId) => {
    if (!currentUser) return
    const historyKey = `pinn_history_${currentUser.username}`
    const updated = historyItems.filter(item => item.id !== itemId)
    localStorage.setItem(historyKey, JSON.stringify(updated))
    setHistoryItems(updated)
  }

  // Clear all items
  const handleClearAll = () => {
    if (!currentUser) return
    const confirmClear = window.confirm('Are you sure you want to clear your entire history?')
    if (confirmClear) {
      const historyKey = `pinn_history_${currentUser.username}`
      localStorage.setItem(historyKey, '[]')
      setHistoryItems([])
    }
  }

  // Auth Form Render
  if (!currentUser) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4" style={{ background: 'transparent' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 rounded-2xl border"
          style={{
            background: 'rgba(12, 24, 53, 0.40)',
            border: '1px solid rgba(196, 149, 106, 0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div className="text-center mb-6">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'rgba(220, 210, 195, 0.95)' }}>
              {isLoginTab ? 'PINN Dashboard Sign In' : 'Create PINN Account'}
            </h2>
            <p className="text-xs mt-1.5" style={{ fontFamily: 'var(--font-body)', color: 'rgba(220, 210, 195, 0.45)' }}>
              Local Browser Storage
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-[rgba(196,149,106,0.15)] mb-6 font-mono text-[11px] uppercase tracking-wider">
            <button
              onClick={() => { setIsLoginTab(true); setAuthError('') }}
              className={`flex-1 pb-3 transition-colors ${isLoginTab ? 'text-[#C4956A] border-b-2 border-[#C4956A] font-bold' : 'text-[rgba(220,208,188,0.45)] hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setAuthError('') }}
              className={`flex-1 pb-3 transition-colors ${!isLoginTab ? 'text-[#C4956A] border-b-2 border-[#C4956A] font-bold' : 'text-[rgba(220,208,188,0.45)] hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5 font-mono text-xs">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-wider text-[rgba(220,208,188,0.45)]">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[rgba(0,0,0,0.25)] border border-[rgba(220,200,165,0.15)] rounded-lg text-[#E8DDCC] px-3.5 py-2.5 outline-none focus:border-[#C4956A] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-wider text-[rgba(220,208,188,0.45)]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[rgba(0,0,0,0.25)] border border-[rgba(220,200,165,0.15)] rounded-lg text-[#E8DDCC] px-3.5 py-2.5 outline-none focus:border-[#C4956A] transition-all"
              />
            </div>

            {authError && (
              <div className="text-red-400 text-[11px] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.18)] rounded-md px-3 py-2">
                ⚠ {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider text-[#141210] transition hover:brightness-110 cursor-pointer"
              style={{ background: '#C4956A' }}
            >
              {isLoginTab ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Dashboard History Render
  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <div
        style={{
          maxWidth: '1100px',
          width: 'min(1100px, calc(100% - 48px))',
          margin: '0 auto',
          padding: '120px 0 64px',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[rgba(196,149,106,0.3)] pb-6 mb-8">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'rgba(220, 210, 195, 0.95)', letterSpacing: '-0.02em' }}>
              My Analysis History
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(220, 210, 195, 0.45)', marginTop: '4px' }}>
              Logged in as <span className="font-bold text-[#C4956A]">{currentUser.username}</span> • Local Browser Storage
            </p>
          </div>
          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg border border-red-500/30 hover:border-red-500/60 bg-red-500/5 text-red-400 cursor-pointer transition"
            >
              Clear History
            </button>
          )}
        </div>

        {/* History List */}
        <AnimatePresence mode="popLayout">
          {historyItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 rounded-xl border border-dashed border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]"
            >
              <span className="text-3xl">📝</span>
              <p className="font-body text-[13px] text-[rgba(220,208,188,0.45)] mt-3">
                No physics problems analyzed yet.
              </p>
              <p className="font-body text-[11px] text-[rgba(220,208,188,0.3)] mt-1">
                Go back to the Home page and describe your physics problem to see history logs here.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-6">
              {historyItems.map((item) => {
                const calculation = calculateResult(item.equationId, item.params)
                const isPending = calculation?.isPending || false

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="p-7 rounded-xl border flex flex-col gap-5 text-left shadow-lg"
                    style={{
                      background: 'rgba(12, 24, 53, 0.40)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Top Row: Title, Branch, Time */}
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-[rgba(255,255,255,0.05)] pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(220,208,188,0.45)] mr-2">
                          {item.branchLabel || 'Physics'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border bg-[rgba(136,192,184,0.08)] border-[#88C0B8]/20 text-[#88C0B8]">
                          {item.equationName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[rgba(220,208,188,0.3)]">
                        {item.timestamp}
                      </span>
                    </div>

                    {/* Problem Description */}
                    <div>
                      <p className="text-[11px] font-mono text-[rgba(220,208,188,0.45)] mb-1 uppercase tracking-wider">Problem Statement:</p>
                      <p className="font-body text-[13px] text-white font-medium italic">
                        "{item.problem}"
                      </p>
                    </div>

                    {/* Grid: Params and Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Parameters list */}
                      <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.12)] flex flex-col gap-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(220,208,188,0.45)] block mb-1">Extracted Parameters:</span>
                        <div className="flex flex-col gap-1.5">
                          {Object.entries(item.paramDetails || {}).map(([key, detail]) => {
                            if (detail.source === 'Default Constant') return null
                            return (
                              <div key={key} className="flex justify-between items-center text-[11px] font-mono">
                                <span className="opacity-50 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span>
                                  {detail.source === 'Missing' ? (
                                    <span className="text-red-400 font-bold uppercase text-[9px] tracking-wider bg-red-400/5 px-1.5 py-0.5 rounded border border-red-400/10">Missing</span>
                                  ) : (
                                    <span className="text-[#88C0B8] font-bold">
                                      {detail.val} {detail.unit}
                                      {detail.source === 'Converted to SI' && ` → ${typeof detail.siVal === 'number' ? (Math.abs(detail.siVal) < 0.001 || Math.abs(detail.siVal) > 1e6 ? detail.siVal.toExponential(4) : parseFloat(detail.siVal.toFixed(6))) : detail.siVal} ${detail.siUnit}`}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Calculated result */}
                      <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.12)] flex flex-col gap-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(220,208,188,0.45)] block mb-1">Calculated Output:</span>
                        {isPending ? (
                          <div className="text-red-400 text-[10px] font-mono bg-red-400/5 border border-red-400/10 rounded px-2.5 py-1.5 flex items-center gap-1.5">
                            <span>⚠️</span>
                            <span>Missing parameter</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-[rgba(220,208,188,0.3)] uppercase tracking-wider">SI Values Output:</span>
                            <p className="font-mono text-xs text-[#E8C880] font-bold" style={{ whiteSpace: 'pre-line' }}>
                              {calculation?.displayStr}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation warning */}
                    {item.validation?.warnings?.length > 0 && (
                      <div className="px-4 py-3 rounded-lg bg-orange-500/5 border border-orange-500/15 text-orange-400 font-mono text-[10px]">
                        <span className="font-bold block mb-1">⚠ PHYSICS VALIDATION WARNING:</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {item.validation.warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.04)] pt-3.5 mt-1 font-mono text-[10px] uppercase tracking-wider">
                      <button
                        onClick={() => onNavigateToEquation(item.equationId, item.params)}
                        className="px-4 py-2 rounded-lg bg-[#88C0B8] hover:bg-[#a8ddd6] text-[#141210] font-bold cursor-pointer transition flex items-center gap-1"
                      >
                        <span>▶</span> Launch Simulator
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:border-red-500/50 hover:bg-red-500/5 text-[rgba(220,208,188,0.45)] hover:text-red-400 cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
