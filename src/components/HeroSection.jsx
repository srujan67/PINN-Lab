import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { classifyAndExtract } from '../lib/physicsClassifier'
import { calculateResult } from '../lib/parameterExtractor'

// ─── Example prompt chips ───
const CRITICAL_EXAMPLES = [
  { label: 'REALISTIC', text: 'A ball is thrown at 55° with initial velocity 60 km/h.' },
  { label: 'EXTREME BUT POSSIBLE', text: 'A charged particle moves at 0.9c in a magnetic field.' },
  { label: 'UNREALISTIC / INVALID', text: 'A particle moves at 1.2c.' },
]

// ─── Branch color map (matching Explore) ───
const BRANCH_COLORS = {
  quantum: '#C4956A',
  classical: '#88C0B8',
  thermo: '#E07840',
  fluid: '#88C0B8',
  em: '#A09CC8',
  relativity: '#C4956A',
  statistical: '#E07840',
}

export default function HeroSection({ onEnterExplore, onNavigateToEquation }) {
  const sectionRef = useRef(null)
  const tagRef = useRef(null)
  const headlineRef = useRef(null)
  const subtitleRef = useRef(null)
  const subtextRef = useRef(null)

  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [results, setResults] = useState(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  // Track when user starts/stops typing
  useEffect(() => {
    setIsTyping(inputText.trim().length > 0)
  }, [inputText])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      tl.fromTo(headlineRef.current,
        { y: 55, opacity: 0, skewY: 2 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.3, delay: 0.4 }
      )
      .fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0 },
        '-=0.85'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = useCallback(() => {
    if (!inputText.trim()) return
    setIsAnalyzing(true)
    setHasAnalyzed(false)
    setResults(null)
    setTimeout(() => {
      const result = classifyAndExtract(inputText)
      setResults(result)
      setHasAnalyzed(true)
      setIsAnalyzing(false)

      // Save to history if logged in AND validation passed
      const currentUser = localStorage.getItem('pinn_session_user')
      if (currentUser && result.primaryEquation && result.status === 'VALID INPUT') {
        try {
          const userObj = JSON.parse(currentUser)
          const historyKey = `pinn_history_${userObj.username}`
          const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]')
          
          const newHistoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleString(),
            problem: inputText,
            equationId: result.primaryEquation.id,
            equationName: result.primaryEquation.name,
            branchLabel: result.primaryEquation.branchLabel,
            params: result.extractedParams?.params || {},
            paramDetails: result.extractedParams?.paramDetails || {},
            validation: result.validation || { valid: true, warnings: [] },
            accuracy: 1.0
          }
          
          existingHistory.unshift(newHistoryItem)
          localStorage.setItem(historyKey, JSON.stringify(existingHistory))
        } catch (e) {
          console.error('Failed to save history:', e)
        }
      }
    }, 600)
  }, [inputText])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAnalyze()
    }
  }, [handleAnalyze])

  const handleExampleClick = useCallback((prompt) => {
    setInputText(prompt)
    setIsAnalyzing(true)
    setHasAnalyzed(false)
    setResults(null)
    setTimeout(() => {
      const result = classifyAndExtract(prompt)
      setResults(result)
      setHasAnalyzed(true)
      setIsAnalyzing(false)

      // Save to history if logged in AND validation passed
      const currentUser = localStorage.getItem('pinn_session_user')
      if (currentUser && result.primaryEquation && result.status === 'VALID INPUT') {
        try {
          const userObj = JSON.parse(currentUser)
          const historyKey = `pinn_history_${userObj.username}`
          const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]')
          
          const newHistoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleString(),
            problem: prompt,
            equationId: result.primaryEquation.id,
            equationName: result.primaryEquation.name,
            branchLabel: result.primaryEquation.branchLabel,
            params: result.extractedParams?.params || {},
            paramDetails: result.extractedParams?.paramDetails || {},
            validation: result.validation || { valid: true, warnings: [] },
            accuracy: 1.0
          }
          
          existingHistory.unshift(newHistoryItem)
          localStorage.setItem(historyKey, JSON.stringify(existingHistory))
        } catch (e) {
          console.error('Failed to save history:', e)
        }
      }
    }, 600)
  }, [])

  const handleEquationClick = useCallback((eqId) => {
    if (onNavigateToEquation) {
      // Pass the entire extractedParams object
      onNavigateToEquation(eqId, results?.extractedParams || null)
    }
  }, [onNavigateToEquation, results])

  const handleReset = useCallback(() => {
    setInputText('')
    setResults(null)
    setHasAnalyzed(false)
    setIsAnalyzing(false)
  }, [])

  const showTitles = !isTyping && !hasAnalyzed && !isAnalyzing

  return (
    <section
      ref={sectionRef}
      className="relative w-full flex items-center justify-center overflow-hidden"
      id="hero"
      style={{ minHeight: '100vh' }}
    >
      {/* Subtle depth vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 65% at 50% 50%, transparent 0%, rgba(5,7,11,0.55) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl" style={{ paddingTop: '80px', paddingBottom: '60px' }}>

        {/* ═══ Title Block (fades out when typing) ═══ */}
        <div
          style={{
            transition: 'opacity 0.5s ease, transform 0.5s ease, max-height 0.5s ease',
            opacity: showTitles ? 1 : 0,
            transform: showTitles ? 'translateY(0)' : 'translateY(-20px)',
            maxHeight: showTitles ? '400px' : '0px',
            overflow: 'hidden',
            pointerEvents: showTitles ? 'auto' : 'none',
          }}
        >
          {/* Main Headline */}
          <div className="overflow-hidden mb-10">
            <h1
              ref={headlineRef}
              style={{
                opacity: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(3.2rem, 8vw, 7.5rem)',
                letterSpacing: '-0.035em',
                lineHeight: 1.02,
                background: 'linear-gradient(135deg, #EEEEF2 0%, #C4A882 50%, #E8D5B0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              PINN
            </h1>
          </div>

          {/* Subtitle line */}
          <p
            ref={subtitleRef}
            style={{
              opacity: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(0.9rem, 1.8vw, 1.25rem)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(220, 185, 140, 0.95)',
              marginBottom: '56px',
            }}
          >
            Physics-Informed Neural Networks for Realistic Predictions
          </p>
        </div>

        {/* ═══ Problem Assistant Input ═══ */}
        <div
          style={{
            width: '100%',
            maxWidth: '720px',
            marginTop: showTitles ? '48px' : '40px',
            transition: 'margin-top 0.5s ease',
          }}
        >
          {/* Input label (shows when titles are hidden) */}
          <AnimatePresence>
            {!showTitles && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: '24px' }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                    background: 'linear-gradient(135deg, #EEEEF2 0%, #C4A882 50%, #E8D5B0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '6px',
                  }}
                >
                  PINN Problem Analyzer
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'rgba(220, 185, 140, 0.7)',
                    fontSize: '0.9rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  Describe your problem — we'll identify the equations
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.22)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              boxShadow: isTyping
                ? '0 0 24px rgba(196, 149, 106, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              borderColor: isTyping ? 'rgba(196, 149, 106, 0.65)' : 'rgba(255,255,255,0.22)',
            }}
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your physics problem…"
              rows={3}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '20px 24px',
                fontFamily: 'var(--font-body)',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: 'rgba(230, 230, 240, 0.95)',
                letterSpacing: '0.01em',
              }}
            />

            {/* Action buttons inside textarea container */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 16px 14px 16px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  color: 'rgba(180, 180, 200, 0.4)',
                  letterSpacing: '0.04em',
                }}
              >
                Press Enter to analyze
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(inputText.trim() || hasAnalyzed || isAnalyzing) && (
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(220, 220, 240, 0.7)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.08)'
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.04)'
                      e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                    }}
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim()}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: inputText.trim()
                      ? 'linear-gradient(135deg, #C4956A 0%, #A87A50 100%)'
                      : 'rgba(255,255,255,0.06)',
                    color: inputText.trim() ? '#0D0B09' : 'rgba(180,180,200,0.35)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: inputText.trim() ? 'pointer' : 'default',
                    letterSpacing: '0.04em',
                    transition: 'all 0.25s ease',
                    boxShadow: inputText.trim()
                      ? '0 2px 12px rgba(196, 149, 106, 0.3)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (inputText.trim()) {
                      e.target.style.transform = 'translateY(-1px)'
                      e.target.style.boxShadow = '0 4px 20px rgba(196, 149, 106, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    if (inputText.trim()) {
                      e.target.style.boxShadow = '0 2px 12px rgba(196, 149, 106, 0.3)'
                    }
                  }}
                >
                  Analyze Problem
                </button>
              </div>
            </div>
          </div>

          {/* Example chips */}
          {true && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center',
                marginTop: '20px',
              }}
            >
              {CRITICAL_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => handleExampleClick(ex.text)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.22)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'rgba(220, 210, 195, 0.75)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%',
                    maxWidth: '600px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(196, 149, 106, 0.45)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor:
                        ex.label === 'REALISTIC'
                          ? 'rgba(136, 192, 184, 0.15)'
                          : ex.label === 'EXTREME BUT POSSIBLE'
                          ? 'rgba(232, 200, 128, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                      color:
                        ex.label === 'REALISTIC'
                          ? '#88C0B8'
                          : ex.label === 'EXTREME BUT POSSIBLE'
                          ? '#E8C880'
                          : '#EF4444',
                      border: `1px solid ${
                        ex.label === 'REALISTIC'
                          ? 'rgba(136, 192, 184, 0.3)'
                          : ex.label === 'EXTREME BUT POSSIBLE'
                          ? 'rgba(232, 200, 128, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)'
                      }`,
                    }}
                  >
                    {ex.label}
                  </span>
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)' }}>{ex.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spelling Correction Notice */}
        {hasAnalyzed && results?.spellingCorrections?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              width: '100%',
              maxWidth: '720px',
              marginTop: '10px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(160, 156, 200, 0.06)',
              border: '1px solid rgba(160, 156, 200, 0.15)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                color: 'rgba(160, 156, 200, 0.7)',
                letterSpacing: '0.02em',
              }}
            >
              Auto-corrected: {results.spellingCorrections.map((c, i) => (
                <span key={i}>
                  <span style={{ textDecoration: 'line-through', color: 'rgba(220,220,240,0.35)' }}>{c.original}</span>
                  {' → '}
                  <span style={{ color: '#A09CC8', fontWeight: 600 }}>{c.corrected}</span>
                  {i < results.spellingCorrections.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </motion.div>
        )}

        {/* Loader State */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              width: '100%',
              maxWidth: '800px',
              marginTop: '36px',
              padding: '48px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid rgba(196, 149, 106, 0.15)',
                borderTopColor: '#C4956A',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(220, 200, 165, 0.7)',
              }}
            >
              Analyzing Problem Physics...
            </span>
          </motion.div>
        )}

        {/* ═══ Results Panel ═══ */}
        <AnimatePresence>
          {hasAnalyzed && results && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                maxWidth: '800px',
                marginTop: '36px',
              }}
            >
              {results.status === 'UNSUPPORTED TOPIC' ? (
                /* Unsupported Card */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '28px 32px',
                      borderRadius: '14px',
                      background: 'rgba(224, 120, 64, 0.08)',
                      border: '1px solid rgba(224, 120, 64, 0.55)',
                      textAlign: 'left',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#E07840',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}>
                        Analysis Status
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#E07840',
                        background: 'rgba(224, 120, 64, 0.1)',
                        border: '1px solid rgba(224, 120, 64, 0.3)',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        letterSpacing: '0.05em'
                      }}>
                        UNSUPPORTED TOPIC
                      </span>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.88rem',
                      color: 'rgba(220, 220, 240, 0.95)',
                      lineHeight: '1.6',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: '12px',
                      marginTop: '12px'
                    }}>
                      {results.validationMessage}
                    </p>
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Detected branches */}
                  <div style={{ marginBottom: '20px' }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.72rem',
                        color: 'rgba(180, 180, 200, 0.5)',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        marginBottom: '10px',
                      }}
                    >
                      Detected Branches
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {results.detectedBranches.map((b) => (
                        <span
                          key={b.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 14px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500,
                            letterSpacing: '0.04em',
                            color: BRANCH_COLORS[b.id] || '#C4956A',
                            background: `${BRANCH_COLORS[b.id] || '#C4956A'}14`,
                            border: `1px solid ${BRANCH_COLORS[b.id] || '#C4956A'}30`,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: BRANCH_COLORS[b.id] || '#C4956A',
                            }}
                          />
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detected equations */}
                  {results.detectedEquations && results.detectedEquations.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.72rem',
                          color: 'rgba(180, 180, 200, 0.5)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          marginBottom: '12px',
                        }}
                      >
                        Matching Equations
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {results.detectedEquations.map((eq, idx) => {
                          const color = BRANCH_COLORS[eq.branch] || '#C4956A'
                          const isPrimary = idx === 0
                          const isValid = results.status === 'VALID INPUT'
                          
                          const displayKeywords = (eq.detectedKeywords || eq.matchedKeywords || [])
                            .map(kw => {
                              if (kw.startsWith('~')) return kw.split('≈')[1] || kw
                              if (kw.startsWith('[app]')) return kw.slice(5)
                              if (kw.includes('→')) return kw.split('→')[1]
                              return kw
                            })
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .slice(0, 5)
                          
                          return (
                            <motion.button
                              key={eq.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.08, duration: 0.4 }}
                              onClick={isValid ? () => handleEquationClick(eq.id) : undefined}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '22px 26px',
                                borderRadius: '14px',
                                background: isPrimary ? `${color}18` : `${color}0A`,
                                border: `1px solid ${isPrimary ? `${color}77` : `${color}50`}`,
                                cursor: isValid ? 'pointer' : 'default',
                                textAlign: 'left',
                                transition: 'all 0.25s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isPrimary
                                  ? `0 2px 20px ${color}15, inset 0 1px 0 ${color}15`
                                  : `0 1px 12px ${color}08, inset 0 1px 0 ${color}0A`,
                              }}
                              onMouseEnter={(e) => {
                                if (isValid) {
                                  e.currentTarget.style.background = `${color}25`
                                  e.currentTarget.style.borderColor = `${color}99`
                                  e.currentTarget.style.transform = 'translateX(4px)'
                                  e.currentTarget.style.boxShadow = `0 4px 24px ${color}15, inset 0 1px 0 ${color}12`
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (isValid) {
                                  e.currentTarget.style.background = isPrimary ? `${color}18` : `${color}0A`
                                  e.currentTarget.style.borderColor = isPrimary ? `${color}77` : `${color}50`
                                  e.currentTarget.style.transform = 'translateX(0)'
                                  e.currentTarget.style.boxShadow = isPrimary
                                    ? `0 2px 20px ${color}15, inset 0 1px 0 ${color}15`
                                    : `0 1px 12px ${color}08, inset 0 1px 0 ${color}0A`
                                }
                              }}
                            >
                              <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                  {isPrimary && (
                                    <span
                                      style={{
                                        fontSize: '0.6rem',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: `${color}30`,
                                        color: color,
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      Primary Match
                                    </span>
                                  )}
                                  {isPrimary && results.confidence && (
                                    <span
                                      style={{
                                        fontSize: '0.6rem',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: 'rgba(136, 192, 184, 0.15)',
                                        color: '#88C0B8',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 700,
                                        letterSpacing: '0.05em',
                                      }}
                                    >
                                      {results.confidence}% match
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-display)',
                                      fontWeight: 600,
                                      fontSize: '1rem',
                                      color: 'rgba(230, 230, 240, 0.95)',
                                    }}
                                  >
                                    {eq.name}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      background: `${color}18`,
                                      color: color,
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {eq.branchLabel}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                                    fontSize: '0.82rem',
                                    color: `${color}CC`,
                                    letterSpacing: '0.03em',
                                    display: 'block',
                                    marginBottom: displayKeywords.length > 0 ? '8px' : '0',
                                    whiteSpace: 'pre-line',
                                  }}
                                >
                                  {eq.formula}
                                </span>
                                {displayKeywords.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {displayKeywords.map((kw, ki) => (
                                      <span
                                        key={ki}
                                        style={{
                                          fontSize: '0.6rem',
                                          padding: '1px 7px',
                                          borderRadius: '3px',
                                          background: 'rgba(255,255,255,0.05)',
                                          color: 'rgba(220,210,195,0.55)',
                                          fontFamily: 'var(--font-body)',
                                          border: '1px solid rgba(255,255,255,0.06)',
                                        }}
                                      >
                                        {kw}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {isValid && (
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '12px' }}>
                                  <span
                                    style={{
                                      color: `${color}70`,
                                      fontSize: '1.1rem',
                                      transition: 'color 0.2s ease',
                                    }}
                                  >
                                    →
                                  </span>
                                </div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selection Explanation */}
                  {results.selectionExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      style={{
                        padding: '18px 24px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginBottom: '16px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.72rem',
                          color: 'rgba(180, 180, 200, 0.5)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        Why This Equation
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem',
                          color: 'rgba(220, 220, 240, 0.8)',
                          lineHeight: '1.6',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {results.selectionExplanation}
                      </p>
                    </motion.div>
                  )}

                  {/* Related Equations */}
                  {results.status === 'VALID INPUT' && results.relatedEquations && results.relatedEquations.length > 0 && (
                    <div
                      style={{
                        padding: '20px 24px',
                        borderRadius: '10px',
                        background: 'rgba(196, 149, 106, 0.04)',
                        border: '1px solid rgba(196, 149, 106, 0.12)',
                        marginBottom: '16px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.72rem',
                          color: 'rgba(196, 149, 106, 0.6)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        Related Equations
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {results.relatedEquations.map((rel) => {
                          const relColor = BRANCH_COLORS[rel.branch] || '#C4956A'
                          return (
                            <button
                              key={rel.id}
                              onClick={() => handleEquationClick(rel.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                border: `1px solid ${relColor}30`,
                                background: `${relColor}08`,
                                color: `${relColor}DD`,
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${relColor}18`
                                e.currentTarget.style.borderColor = `${relColor}50`
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `${relColor}08`
                                e.currentTarget.style.borderColor = `${relColor}30`
                              }}
                            >
                              <span style={{ fontSize: '0.7rem' }}>▶</span>
                              {rel.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommended Simulations */}
                  {results.status === 'VALID INPUT' && (
                    <div
                      style={{
                        padding: '20px 24px',
                        borderRadius: '10px',
                        background: 'rgba(196, 149, 106, 0.04)',
                        border: '1px solid rgba(196, 149, 106, 0.12)',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.72rem',
                          color: 'rgba(196, 149, 106, 0.6)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        Recommended Simulations
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {results.recommendedSimulations.map((sim) => (
                          <button
                            key={sim.id}
                            onClick={() => handleEquationClick(sim.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(196, 149, 106, 0.2)',
                              background: 'rgba(196, 149, 106, 0.06)',
                              color: 'rgba(220, 185, 140, 0.85)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(196, 149, 106, 0.14)'
                              e.target.style.borderColor = 'rgba(196, 149, 106, 0.35)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(196, 149, 106, 0.06)'
                              e.target.style.borderColor = 'rgba(196, 149, 106, 0.2)'
                            }}
                          >
                            <span style={{ fontSize: '0.7rem' }}>▶</span>
                            {sim.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ═══ Analysis Status Card ═══ */}
                  {(results.status === 'VALID INPUT' || results.status === 'REALISTIC' || results.status === 'RELATIVISTIC REGIME') ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      style={{
                        padding: '20px 24px',
                        borderRadius: '14px',
                        background: 'rgba(12, 24, 53, 0.4)',
                        border: '1px solid rgba(136, 192, 184, 0.65)',
                        marginTop: '16px',
                        textAlign: 'left',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#88C0B8',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}>
                        Analysis Status
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#88C0B8',
                        background: 'rgba(136, 192, 184, 0.1)',
                        border: '1px solid rgba(136, 192, 184, 0.3)',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        letterSpacing: '0.05em'
                      }}>
                        {results.status}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      style={{
                        padding: '28px 32px',
                        borderRadius: '14px',
                        background: 'rgba(224, 120, 64, 0.08)',
                        border: '1px solid rgba(224, 120, 64, 0.55)',
                        marginTop: '16px',
                        textAlign: 'left',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#E07840',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}>
                          Analysis Status
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#E07840',
                          background: 'rgba(224, 120, 64, 0.1)',
                          border: '1px solid rgba(224, 120, 64, 0.3)',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          letterSpacing: '0.05em'
                        }}>
                          {results.status}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.88rem',
                        color: 'rgba(220, 220, 240, 0.95)',
                        lineHeight: '1.6',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '12px',
                        marginTop: '12px'
                      }}>
                        {results.validationMessage}
                      </p>
                    </motion.div>
                  )}

                  {/* Extracted Parameters */}
                  {results.extractedParams && results.extractedParams.paramDetails && Object.keys(results.extractedParams.paramDetails).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      style={{
                        padding: '28px 32px',
                        borderRadius: '14px',
                        background: 'rgba(12, 24, 53, 0.4)',
                        border: '1px solid rgba(196, 149, 106, 0.65)',
                        marginTop: '16px',
                        textAlign: 'left',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600,
                        color: '#C4956A', letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: '16px',
                      }}>
                        Extracted Parameters
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.entries(results.extractedParams.paramDetails).map(([key, detail]) => {
                          if (detail.source === 'Default Constant') return null;
                          let badgeStyle = {
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          };
                          if (detail.source === 'User Input') {
                            badgeStyle = { ...badgeStyle, color: '#88C0B8', background: 'rgba(136, 192, 184, 0.12)', border: '1px solid rgba(136, 192, 184, 0.25)' };
                          } else if (detail.source === 'Converted to SI') {
                            badgeStyle = { ...badgeStyle, color: '#A09CC8', background: 'rgba(160, 156, 200, 0.12)', border: '1px solid rgba(160, 156, 200, 0.25)' };
                          } else { // Missing
                            badgeStyle = { ...badgeStyle, color: '#E07840', background: 'rgba(224, 120, 64, 0.12)', border: '1px solid rgba(224, 120, 64, 0.25)' };
                          }

                          return (
                            <div key={key} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.22)',
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(220,220,240,0.85)', textTransform: 'capitalize' }}>
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div>
                                  <span style={badgeStyle}>{detail.source}</span>
                                </div>
                              </div>
                              
                              <div style={{ textAlign: 'right' }}>
                                {detail.source === 'Missing' ? (
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#E07840' }}>
                                    Missing
                                  </span>
                                ) : (
                                  <>
                                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.88rem', fontWeight: 600, color: '#88C0B8' }}>
                                      {typeof detail.val === 'number' ? (Math.abs(detail.val) < 0.001 || Math.abs(detail.val) > 1e6 ? detail.val.toExponential(4) : parseFloat(detail.val.toFixed(6))) : detail.val} {detail.unit}
                                    </span>
                                    {detail.source === 'Converted to SI' && (
                                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'rgba(136,192,184,0.65)', display: 'block', marginTop: '2px' }}>
                                        {detail.val} {detail.unit} → {typeof detail.siVal === 'number' ? (Math.abs(detail.siVal) < 0.001 || Math.abs(detail.siVal) > 1e6 ? detail.siVal.toExponential(4) : parseFloat(detail.siVal.toFixed(6))) : detail.siVal} {detail.siUnit}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {/* Unit conversions */}
                      {results.extractedParams.conversions?.length > 0 && (
                        <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(136,192,184,0.03)', border: '1px solid rgba(136,192,184,0.08)' }}>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'rgba(136,192,184,0.5)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Unit Conversions Applied</p>
                          {results.extractedParams.conversions.map((c, i) => (
                            <p key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.75rem', color: 'rgba(136,192,184,0.7)', margin: '2px 0' }}>
                              {c.original} {c.displayStr}
                            </p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Calculated Result */}
                  {((results.status === 'VALID INPUT' && results.primaryEquation) ||
                    ((results.status === 'REALISTIC' || results.status === 'RELATIVISTIC REGIME') && !results.primaryEquation)) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55, duration: 0.5 }}
                      style={{
                        padding: '28px 32px',
                        borderRadius: '14px',
                        background: 'rgba(12, 24, 53, 0.4)',
                        border: '1px solid rgba(196, 149, 106, 0.65)',
                        marginTop: '16px',
                        textAlign: 'left',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600,
                        color: '#88C0B8', letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: '16px',
                      }}>
                        Calculated Result
                      </p>
                      
                      {results.primaryEquation ? (
                        (() => {
                          const calculation = calculateResult(results.primaryEquation.id, results.extractedParams?.params || {})
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(136,192,184,0.04)', border: '1px solid rgba(136,192,184,0.1)' }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(220,220,240,0.5)', display: 'block', marginBottom: '4px' }}>Formula:</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600, color: '#E8C880', whiteSpace: 'pre-line' }}>
                                  {results.primaryEquation.formula}
                                </span>
                              </div>
                              
                              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(220,220,240,0.5)', display: 'block', marginBottom: '4px' }}>Result:</span>
                                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '1.05rem', fontWeight: 700, color: '#88C0B8', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                                  {calculation ? calculation.displayStr : 'Calculation Error'}
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div style={{ padding: '20px 24px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(220,220,240,0.5)', display: 'block', marginBottom: '4px' }}>Result:</span>
                          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '1.1rem', fontWeight: 700, color: '#88C0B8', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                            {results.validationMessage}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Result Explanation */}
                  {results.resultExplanation && results.status === 'VALID INPUT' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      style={{
                        padding: '18px 24px',
                        borderRadius: '10px',
                        background: 'rgba(136, 192, 184, 0.04)',
                        border: '1px solid rgba(136, 192, 184, 0.12)',
                        marginTop: '16px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.72rem',
                          color: 'rgba(136, 192, 184, 0.5)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        Physical Interpretation
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem',
                          color: 'rgba(220, 220, 240, 0.8)',
                          lineHeight: '1.6',
                          letterSpacing: '0.01em',
                        }}
                      >
                        {results.resultExplanation}
                      </p>
                    </motion.div>
                  )}

                  {/* Physics Insight */}
                  {results.physicsInsight && results.status === 'VALID INPUT' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65, duration: 0.5 }}
                      style={{
                        padding: '28px 32px',
                        borderRadius: '14px',
                        background: 'rgba(12, 24, 53, 0.4)',
                        border: '1px solid rgba(196, 149, 106, 0.65)',
                        marginTop: '16px',
                        textAlign: 'left',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600,
                        color: '#C4956A', letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: '16px',
                      }}>
                        Physics Insight
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { label: 'Selection', text: results.physicsInsight.whySelected },
                          { label: 'Assumptions', text: results.physicsInsight.assumptions },
                          { label: 'Applications', text: results.physicsInsight.applications },
                          { label: 'Related', text: results.physicsInsight.relatedEquations },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{
                              fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 700,
                              color: 'rgba(196, 149, 106, 0.6)', letterSpacing: '0.06em',
                              textTransform: 'uppercase', minWidth: '90px', flexShrink: 0, paddingTop: '2px',
                            }}>
                              {item.label}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                              color: 'rgba(220, 220, 240, 0.75)', lineHeight: '1.5',
                            }}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Follow-Up Questions */}
                  {results.followUpQuestions && results.followUpQuestions.length > 0 && results.status === 'VALID INPUT' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75, duration: 0.4 }}
                      style={{
                        marginTop: '16px',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.72rem',
                          color: 'rgba(180, 180, 200, 0.5)',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          marginBottom: '10px',
                        }}
                      >
                        Explore Further
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {results.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleExampleClick(q)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.22)',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'rgba(220, 210, 195, 0.75)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              textAlign: 'left',
                              width: '100%',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                              e.currentTarget.style.borderColor = 'rgba(196, 149, 106, 0.45)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                            }}
                          >
                            <span style={{ color: 'rgba(196, 149, 106, 0.5)', fontSize: '0.7rem' }}>→</span>
                            {q}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* PINN Engine Workflow */}
                  {results.primaryEquation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      style={{
                        padding: '28px 32px',
                        borderRadius: '14px',
                        background: 'rgba(12, 24, 53, 0.2)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginTop: '16px',
                        textAlign: 'left',
                      }}
                    >
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600,
                        color: 'rgba(220, 185, 140, 0.9)', letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: '16px',
                      }}>
                        PINN Analysis Engine
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {[
                          { step: 'User Problem', detail: `"${inputText.slice(0, 50)}${inputText.length > 50 ? '…' : ''}"`, icon: '📝', done: true },
                          { step: 'Physics Branch Detection', detail: results.detectedBranches.map(b => b.label).join(', '), icon: '🔬', done: true },
                          { step: 'Equation Selection', detail: results.primaryEquation.name, icon: '📐', done: true },
                          { step: 'Parameter Extraction', detail: `${Object.keys(results.extractedParams?.params || {}).length} parameters detected`, icon: '🔢', done: Object.keys(results.extractedParams?.params || {}).length > 0 },
                          { step: 'Calculation Engine', detail: 'Ready to compute', icon: '⚡', done: true },
                          { step: 'Simulation Engine', detail: 'Interactive visualization', icon: '📊', done: results.status === 'VALID INPUT' },
                          { step: 'Scientific Interpretation', detail: results.interpretation?.[0]?.slice(0, 60) || 'Available', icon: '🎓', done: true },
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                          >
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '8px 0',
                            }}>
                              <span style={{ fontSize: '0.9rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(220,220,240,0.85)' }}>{item.step}</span>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(220,220,240,0.4)', marginLeft: '8px' }}>{item.detail}</span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: item.done ? '#88C0B8' : 'rgba(220,220,240,0.3)' }}>
                                {item.done ? '✓' : '○'}
                              </span>
                            </div>
                            {i < 6 && (
                              <div style={{ marginLeft: '11px', width: '2px', height: '12px', background: 'rgba(196,149,106,0.15)' }} />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Bottom fade edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(5,7,11,0.6) 0%, transparent 100%)',
          zIndex: 2,
        }}
      />
    </section>
  )
}
