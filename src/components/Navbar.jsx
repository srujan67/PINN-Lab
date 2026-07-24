import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home', id: 'home' },
  { label: 'Explore', id: 'explore' },
  { label: 'Applications', id: 'applications' },
  { label: 'About', id: 'about' },
  { label: 'History', id: 'history' },
]

export default function Navbar({ currentPage, setCurrentPage, currentUser, setCurrentUser }) {
  const [hoveredLink, setHoveredLink] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const textPrimary = 'rgba(240,240,245,0.92)'
  const textSecondary = 'rgba(240,240,245,0.38)'

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId)
    setMobileMenuOpen(false)
  }

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
          onClick={() => handleNavClick('home')}
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

        {/* Divider (desktop only) */}
        <div className="navbar-desktop-links" style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)', marginRight: '8px' }} />

        {/* Nav Links — desktop */}
        <div className="navbar-desktop-links" style={{ display: 'flex', alignItems: 'center' }}>
          {navLinks.map(link => {
            const isActive = currentPage === link.id
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
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
        </div>

        {/* Divider (desktop only) */}
        <div className="navbar-desktop-links" style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)', marginRight: '8px', marginLeft: '8px' }} />

        {/* Auth Button — desktop */}
        <div className="navbar-desktop-links" style={{ display: 'flex', alignItems: 'center' }}>
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
              onClick={() => handleNavClick('history')}
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
        </div>

        {/* Status dot (desktop only) */}
        <div
          className="navbar-desktop-links items-center gap-1.5 ml-2 flex"
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

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="navbar-hamburger bg-transparent border-none cursor-pointer outline-none touch-target flex items-center justify-center"
          style={{
            color: textPrimary,
            marginLeft: '8px',
            padding: '8px',
            borderRadius: '9999px',
          }}
          aria-label="Toggle menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="navbar-mobile-drawer fixed left-4 right-4 pointer-events-auto"
            style={{
              top: '72px',
              background: 'rgba(6, 10, 24, 0.95)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '12px 8px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              transformOrigin: 'top center',
            }}
          >
            {navLinks.map(link => {
              const isActive = currentPage === link.id
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="w-full bg-transparent border-none cursor-pointer outline-none text-left touch-target"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? textPrimary : textSecondary,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(196,149,106,0.1)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isActive && (
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C4956A', flexShrink: 0 }} />
                    )}
                    {link.label}
                  </div>
                </button>
              )
            })}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 12px' }} />
            {currentUser ? (
              <button
                onClick={() => {
                  localStorage.removeItem('pinn_session_user')
                  setCurrentUser(null)
                  setCurrentPage('home')
                  setMobileMenuOpen(false)
                }}
                className="w-full bg-transparent border-none cursor-pointer outline-none text-left touch-target"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'rgba(239, 68, 68, 0.8)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                }}
              >
                Logout ({currentUser.username})
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('history')}
                className="w-full bg-transparent border-none cursor-pointer outline-none text-left touch-target"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: textSecondary,
                  padding: '12px 16px',
                  borderRadius: '10px',
                }}
              >
                Sign In
              </button>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
            }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                LIVE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
