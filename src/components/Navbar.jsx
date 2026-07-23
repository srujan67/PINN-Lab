import { useState } from 'react'
import { motion } from 'framer-motion'

const navLinks = [
  { label: 'Home', id: 'home' },
  { label: 'Explore', id: 'explore' },
  { label: 'Applications', id: 'applications' },
  { label: 'About', id: 'about' },
  { label: 'History', id: 'history' },
]

export default function Navbar({ currentPage, setCurrentPage, currentUser, setCurrentUser }) {
  const [hoveredLink, setHoveredLink] = useState(null)
  const textPrimary = 'rgba(240,240,245,0.92)'
  const textSecondary = 'rgba(240,240,245,0.38)'

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex items-center"
        style={{
          background: 'rgba(6, 10, 24, 0.72)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '9999px',
          padding: '9px 8px 9px 22px',
          gap: '0px',
        }}
      >
        {/* Brand — just the name */}
        <button
          onClick={() => setCurrentPage('home')}
          className="bg-transparent border-none cursor-pointer outline-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13.5px',
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: textPrimary,
            paddingRight: '32px',
            whiteSpace: 'nowrap',
          }}
        >
          PINN
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)', marginRight: '8px' }} />

        {/* Nav Links */}
        {navLinks.map(link => {
          const isActive = currentPage === link.id
          return (
            <button
              key={link.id}
              onClick={() => setCurrentPage(link.id)}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative bg-transparent border-none cursor-pointer outline-none"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? textPrimary : textSecondary,
                padding: '6px 16px',
                borderRadius: '9999px',
                transition: 'color 0.2s',
              }}
            >
              {/* hover bg */}
              {hoveredLink === link.id && !isActive && (
                <motion.div
                  layoutId="navhover"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', zIndex: -1 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              )}
              {/* active pill */}
              {isActive && (
                <motion.div
                  layoutId="activepill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'rgba(196,149,106,0.12)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {link.label}
            </button>
          )
        })}

        {/* Divider */}
        <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)', marginRight: '8px', marginLeft: '8px' }} />

        {/* Auth Button */}
        {currentUser ? (
          <button
            onClick={() => {
              localStorage.removeItem('pinn_session_user')
              setCurrentUser(null)
              setCurrentPage('home')
            }}
            className="bg-transparent border-none cursor-pointer outline-none hover:text-red-400"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(239, 68, 68, 0.8)',
              padding: '6px 14px',
              borderRadius: '9999px',
              transition: 'color 0.2s',
              marginRight: '8px',
            }}
          >
            Logout ({currentUser.username})
          </button>
        ) : (
          <button
            onClick={() => setCurrentPage('history')}
            className="bg-transparent border-none cursor-pointer outline-none hover:text-[#C4956A]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: textSecondary,
              padding: '6px 14px',
              borderRadius: '9999px',
              transition: 'color 0.2s',
              marginRight: '8px',
            }}
          >
            Sign In
          </button>
        )}

        {/* Status dot */}
        <div
          className="flex items-center gap-1.5 ml-2"
          style={{
            padding: '5px 12px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            LIVE
          </span>
        </div>
      </motion.nav>
    </div>
  )
}
