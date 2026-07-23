import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

const topics = [
  'Heat Transfer',
  'Wave Propagation',
  'Fluid Flow',
  'Schrödinger Equation',
  'Maxwell Equations',
]

function MagneticPill({ label, delay }) {
  const ref = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = (e.clientX - centerX) * 0.15
    const dy = (e.clientY - centerY) * 0.15
    setOffset({ x: dx, y: dy })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="px-4 py-2 rounded-full text-sm cursor-pointer transition-colors duration-300"
      style={{
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-secondary)',
        background: 'rgba(10, 14, 23, 0.6)',
        border: '1px solid var(--color-border-subtle)',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s, border-color 0.3s, color 0.3s',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 1.2 + delay * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        borderColor: 'rgba(74, 144, 217, 0.35)',
        color: '#F0F0F5',
        background: 'rgba(74, 144, 217, 0.08)',
      }}
    >
      {label}
    </motion.button>
  )
}

export default function SearchBar() {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto mt-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.7,
        delay: 1.0,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Search Input */}
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-500"
        style={{
          boxShadow: focused
            ? '0 0 30px rgba(74, 144, 217, 0.2), 0 0 80px rgba(74, 144, 217, 0.06), inset 0 1px 0 rgba(255,255,255,0.03)'
            : '0 0 0 rgba(74, 144, 217, 0), inset 0 1px 0 rgba(255,255,255,0.03)',
          border: focused
            ? '1px solid rgba(74, 144, 217, 0.35)'
            : '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'var(--color-bg-input)' }}>
          {/* Search Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={focused ? '#4A90D9' : '#505570'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300 shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          
          <input
            type="text"
            placeholder="What physical system would you like to explore?"
            className="flex-1 bg-transparent border-none outline-none text-base"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              caretColor: 'var(--color-accent-blue)',
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            id="search-input"
          />
        </div>
      </div>

      {/* Topic Pills */}
      <div className="flex flex-wrap justify-center gap-2.5 mt-5">
        {topics.map((topic, i) => (
          <MagneticPill key={topic} label={topic} delay={i} />
        ))}
      </div>
    </motion.div>
  )
}
