import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSmoothScroll from './hooks/useSmoothScroll'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import Explore from './components/Explore'
import HistoryPage from './components/HistoryPage'
import ParticleUniverse from './components/ParticleUniverse'
import Applications from './components/Applications'
import AboutPage from './components/AboutPage'
import AerospacePage from './components/AerospacePage'
import StructuralPage from './components/StructuralPage'
import HealthcarePage from './components/HealthcarePage'
import ClimatePage from './components/ClimatePage'
import EnergyPage from './components/EnergyPage'
import BatteryPage from './components/BatteryPage'

// Smooth page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 30,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(4px)',
    transition: {
      duration: 0.45,
      ease: [0.55, 0, 1, 0.45],
    },
  },
}

function Breadcrumb({ navStack, onBreadcrumbClick }) {
  if (navStack.length === 0) return null
  return (
    <div className="breadcrumb-wrapper" style={{
      padding: '88px 48px 8px',
      maxWidth: 1400,
      margin: '0 auto',
      width: '100%',
    }}>
      <div className="breadcrumb-inner" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        borderRadius: 12,
        background: 'rgba(13, 18, 32, 0.7)',
        border: '1px solid rgba(196, 149, 106, 0.12)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        userSelect: 'none',
      }}>
        {navStack.map((item, i) => (
          <React.Fragment key={item.page}>
            {i > 0 && (
              <span style={{ color: 'rgba(196, 149, 106, 0.3)', fontSize: 12, margin: '0 4px' }}>
                →
              </span>
            )}
            {i < navStack.length - 1 ? (
              <button
                onClick={() => onBreadcrumbClick(item, i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(196, 149, 106, 0.6)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  padding: '3px 8px',
                  borderRadius: 6,
                  transition: 'all 0.15s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(196, 149, 106, 0.1)'
                  e.currentTarget.style.color = 'rgba(196, 149, 106, 0.9)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'none'
                  e.currentTarget.style.color = 'rgba(196, 149, 106, 0.6)'
                }}
              >
                {item.label}
              </button>
            ) : (
              <span style={{
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                padding: '3px 8px',
              }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const lenisRef = useSmoothScroll()
  const [currentPage, setCurrentPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('pinn_session_user')
    return user ? JSON.parse(user) : null
  })
  const [pendingEquationId, setPendingEquationId] = useState(null)
  const [pendingParams, setPendingParams] = useState(null)
  const [navStack, setNavStack] = useState([])
  const industryLabel = {
    aerospace: 'Aerospace',
    structural: 'Structural',
    healthcare: 'Healthcare',
    climate: 'Climate & Weather',
    energy: 'Renewable Energy',
    battery: 'Battery',
  }

  // Disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // Always scroll to top on page change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    window.scrollTo(0, 0)
  }, [currentPage, lenisRef])

  // Called from HeroSection when user clicks a detected equation
  const handleNavigateToEquation = useCallback((equationId, params = null) => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    setPendingEquationId(equationId)
    setPendingParams(params)
    setCurrentPage('explore')
    setNavStack(prev => {
      if (prev.length > 0 && prev[prev.length - 1].page !== 'explore') {
        return [...prev, { label: 'Example', page: 'explore' }]
      }
      return prev
    })
  }, [lenisRef])

  // Clear pending equation after Explore has consumed it
  const handleEquationConsumed = useCallback(() => {
    setPendingEquationId(null)
    setPendingParams(null)
  }, [])

  const navigateFromApplications = useCallback((page) => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    setNavStack([
      { label: 'Applications', page: 'applications' },
      { label: industryLabel[page] || page.charAt(0).toUpperCase() + page.slice(1), page },
    ])
    setCurrentPage(page)
  }, [lenisRef])

  const handleNavbarSetPage = useCallback((page) => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    setNavStack([])
    setCurrentPage(page)
  }, [lenisRef])

  const handleBreadcrumbClick = useCallback((item, index) => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    setCurrentPage(item.page)
    setNavStack(prev => prev.slice(0, index + 1))
  }, [lenisRef])

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'var(--color-bg-primary)',
      }}
    >
      {/* Persistent Particle Background — throttled render */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          opacity: 0.25,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div className="w-full h-full" style={{ willChange: 'transform' }}>
          <ParticleUniverse />
        </div>
      </div>

      {/* Navbar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handleNavbarSetPage}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <main className="w-full">
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.div
              key="home-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <HeroSection
                onEnterExplore={() => setCurrentPage('explore')}
                onNavigateToEquation={handleNavigateToEquation}
              />
            </motion.div>
          ) : currentPage === 'about' ? (
            <motion.div
              key="about-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <AboutPage />
            </motion.div>
          ) : currentPage === 'explore' ? (
            <motion.div
              key="explore-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Breadcrumb navStack={navStack} onBreadcrumbClick={handleBreadcrumbClick} />
              <Explore
                initialEquationId={pendingEquationId}
                initialParams={pendingParams}
                onEquationConsumed={handleEquationConsumed}
              />
            </motion.div>
          ) : currentPage === 'applications' ? (
            <motion.div
              key="applications-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Applications
                onNavigateToExplore={handleNavigateToEquation}
                onNavigateToAerospace={() => navigateFromApplications('aerospace')}
                onNavigateToStructural={() => navigateFromApplications('structural')}
                onNavigateToHealthcare={() => navigateFromApplications('healthcare')}
                onNavigateToClimate={() => navigateFromApplications('climate')}
                onNavigateToEnergy={() => navigateFromApplications('energy')}
                onNavigateToBattery={() => navigateFromApplications('battery')}
              />
            </motion.div>
          ) : currentPage === 'aerospace' ? (
            <motion.div
              key="aerospace-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Breadcrumb navStack={navStack} onBreadcrumbClick={handleBreadcrumbClick} />
              <AerospacePage onNavigateToExplore={handleNavigateToEquation} />
            </motion.div>
          ) : currentPage === 'structural' ? (
            <motion.div
              key="structural-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Breadcrumb navStack={navStack} onBreadcrumbClick={handleBreadcrumbClick} />
              <StructuralPage onNavigateToExplore={handleNavigateToEquation} />
            </motion.div>
          ) : currentPage === 'healthcare' ? (
            <motion.div
              key="healthcare-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Breadcrumb navStack={navStack} onBreadcrumbClick={handleBreadcrumbClick} />
              <HealthcarePage onNavigateToExplore={handleNavigateToEquation} />
            </motion.div>
          ) : currentPage === 'climate' ? (
            <motion.div
              key="climate-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Breadcrumb navStack={navStack} onBreadcrumbClick={handleBreadcrumbClick} />
              <ClimatePage onNavigateToExplore={handleNavigateToEquation} />
            </motion.div>
          ) : currentPage === 'energy' ? (
            <motion.div
              key="energy-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Breadcrumb navStack={navStack} onBreadcrumbClick={handleBreadcrumbClick} />
              <EnergyPage onNavigateToExplore={handleNavigateToEquation} />
            </motion.div>
          ) : currentPage === 'battery' ? (
            <motion.div
              key="battery-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Breadcrumb navStack={navStack} onBreadcrumbClick={handleBreadcrumbClick} />
              <BatteryPage onNavigateToExplore={handleNavigateToEquation} />
            </motion.div>
          ) : (
            <motion.div
              key="history-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <HistoryPage
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                onNavigateToEquation={handleNavigateToEquation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
