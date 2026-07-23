import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import './Applications.css'

const c = '#E07840'
const c2 = '#88C0B8'

const sections = [
  {
    num: '01', label: 'Engineering Problem', color: c,
    lines: [
      'Wind farm operators face complex wake-turbine interactions that reduce downstream energy capture by 20–40%.',
      'Optimising turbine placement requires thousands of expensive LES simulations.',
      'Each simulation takes hours on high-performance computing clusters.',
      'Real-time control decisions for yaw and pitch must be made in seconds, not days.',
      'This computational bottleneck limits both farm layout optimization and operational efficiency.',
    ],
  },
  {
    num: '02', label: 'Physics Used', color: c2,
    lines: [
      'Actuator disk theory models turbines as momentum sinks in the flow field.',
      'The Navier–Stokes equations govern wake recovery and turbulent mixing downstream.',
      'Key parameters: thrust coefficient Cₜ, tip-speed ratio λ, turbulence intensity I, atmospheric stability.',
      'Reynolds-averaged Navier–Stokes (RANS) with k-ε turbulence closure models the far wake.',
      'Boundary layer meteorology governs the vertical wind shear and surface roughness effects.',
    ],
  },
  {
    num: '03', label: 'Why Traditional AI Struggles', color: c,
    lines: [
      'Data-driven wake models trained on historical SCADA data fail outside specific wind conditions.',
      'Turbine configurations and atmospheric regimes seen during training limit generalisation.',
      'Neural networks without physics constraints produce non-physical power predictions.',
      'Black-box models cannot guarantee safety margins for structural load calculations.',
      'Millions of data points are required to cover the full wind rose and stability classes.',
    ],
  },
  {
    num: '04', label: 'Why PINNs Work', color: c2,
    lines: [
      'PINNs fuse sparse LiDAR and SCADA sensor data with the governing flow equations.',
      'Instant what-if predictions for turbine placement and yaw optimisation without full CFD.',
      'Physical conservation laws are baked into the loss function, ensuring physically consistent outputs.',
      'Training converges in minutes, enabling rapid iterative layout exploration.',
      'Sparse measurements are sufficient — a few met masts and turbine SCADA data cover the farm.',
    ],
  },
  {
    num: '05', label: 'Real Applications', color: c,
    lines: [
      'Wind farm layout optimisation — maximise annual energy production while minimising wake losses.',
      'Yaw-based wake steering — deflect wakes away from downstream turbines for 5–15% gain.',
      'Solar PV thermal management — predicting panel temperatures from environmental data.',
      'Hydroelectric flow modelling — optimising dam release schedules and turbine efficiency.',
      'Tidal turbine array design — predicting wake interactions in tidal stream environments.',
    ],
  },
]

const orgs = [
  { name: 'NREL', initials: 'NREL', color: c },
  { name: 'DTU Wind Energy', initials: 'DTU', color: c2 },
  { name: 'Stanford Energy', initials: 'SU', color: c },
  { name: 'Siemens Gamesa', initials: 'SG', color: c2 },
  { name: 'Vestas', initials: 'VES', color: c },
  { name: 'Ørsted', initials: 'ØR', color: c2 },
]

const keyVars = [
  { sym: 'ρ', desc: 'Air density', color: c },
  { sym: 'A', desc: 'Rotor area', color: c2 },
  { sym: 'U', desc: 'Free-stream velocity', color: c },
  { sym: 'Cₚ', desc: 'Power coefficient', color: c },
  { sym: 'Cₜ', desc: 'Thrust coefficient', color: c2 },
  { sym: 'TSR', desc: 'Tip-speed ratio', color: c },
  { sym: 'ε', desc: 'Turbulence dissipation', color: c },
]

export default function EnergyPage({ onNavigateToExplore }) {
  const [windSpeed, setWindSpeed] = useState(12)
  const [turbineSpacing, setTurbineSpacing] = useState(5)

  return (
    <div className="app-page">

      {/* ═══════════════════════════════════════
          HEADER — Title + Subtitle + Info Cards + Scroll Indicator
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 30px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', '--color-accent': '#6ABF69' }}>
        {/* Subtle animated background — radiating energy arcs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03 }}>
          <svg viewBox="0 0 1440 600" style={{ width: '100%', height: '100%' }}>
            {[0, 1, 2, 3].map(i => (
              <motion.path
                key={i}
                d={`M${300 + i * 280},300 Q${300 + i * 280 + 60},${200 + i * 30} ${300 + i * 280 + 120},300 Q${300 + i * 280 + 60},${400 + i * 30} ${300 + i * 280},300`}
                fill="none"
                stroke="#6ABF69"
                strokeWidth={0.6}
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                style={{ transformOrigin: `${300 + i * 280 + 60}px 300px` }}
              />
            ))}
          </svg>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(106,191,105,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(136,192,184,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        

        <div className="app-section">
          <div style={{ textAlign: 'center', maxWidth: 960, margin: '0 auto' }}>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
                marginBottom: 12,
              }}
            >
              Renewable{' '}
              <span className="gradient-text-blue">Energy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(14px, 1.6vw, 18px)',
                color: 'var(--color-text-secondary)',
                marginBottom: 0,
              }}
            >
              Physics-Informed Neural Networks for Clean Energy Systems
            </motion.p>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}
            >
              {[
                { label: 'Primary Physics', value: 'Fluid Flow + Heat Transfer' },
                { label: 'Industry', value: 'Wind & Solar Energy' },
                { label: 'PINN Advantage', value: 'Instant What-If Predictions' },
                { label: 'Engineering Goal', value: 'Farm-Level Optimisation' },
              ].map((card, i) => (
                <div key={i} style={{
                  flex: '1 1 180px', maxWidth: 210,
                  padding: '20px 24px', borderRadius: 12,
                  background: 'rgba(13, 18, 32, 0.7)',
                  border: '1px solid rgba(106,191,105,0.15)',
                  textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 10,
                    color: 'rgba(106,191,105,0.75)',
                    letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6,
                  }}>
                    {card.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 13,
                    color: 'var(--color-text-primary)',
                    fontWeight: 600, lineHeight: 1.3,
                  }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Scroll to Explore */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <motion.span
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
              >
                SCROLL TO ENGINEERING OVERVIEW
              </motion.span>
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ color: 'var(--color-text-muted)', fontSize: 18, lineHeight: 1, opacity: 0.5 }}
              >
                ↓
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ENGINEERING SECTIONS — Premium Cards
      ═══════════════════════════════════════ */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="app-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: 24,
              maxWidth: 1100,
              margin: '0 auto',
            }}
          >
            {sections.map((sec, i) => (
              <motion.div
                key={sec.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card"
                style={{
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  gridColumn: i === 4 ? '1 / -1' : undefined,
                  maxWidth: i === 4 ? 780 : undefined,
                  justifySelf: i === 4 ? 'center' : undefined,
                }}
              >
                {/* Icon + Heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${sec.color}14`,
                    border: `1px solid ${sec.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: 11, fontWeight: 700, color: sec.color,
                    letterSpacing: '0.02em', flexShrink: 0,
                  }}>
                    {sec.num}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(16px, 1.3vw, 20px)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}>
                    {sec.label}
                  </h3>
                </div>

                {/* Lines */}
                <ul style={{
                  listStyle: 'none', margin: 0, padding: 0,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {sec.lines.map((line, li) => (
                    <li key={li} style={{
                      display: 'flex', gap: 10,
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.55,
                    }}>
                      <span style={{
                        color: sec.color, opacity: 0.5, flexShrink: 0, marginTop: 4,
                      }}>—</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ═══════════════════════════════════════
          GOVERNING PHYSICS EQUATION
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="app-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 2.8vw, 34px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 8,
            }}>
              Governing <span className="gradient-text-blue">Physics Equation</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Actuator disk theory coupled with the Navier–Stokes equations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card"
            style={{ maxWidth: 860, margin: '0 auto', padding: 40 }}
          >
            {/* Equation */}
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(18px, 2.2vw, 28px)',
              color: 'var(--color-text-primary)',
              lineHeight: 2,
              textAlign: 'center',
              padding: '20px 0 32px',
              marginBottom: 28,
            }}>
              <span style={{ color: c, fontWeight: 600 }}>P</span>
              <span> = ½</span>
              <span style={{ color: c }}>ρ</span>
              <span style={{ color: c2 }}>A</span>
              <span style={{ color: c }}>U</span>
              <sup>3</sup>
              <span style={{ color: c2 }}>Cₚ</span>
            </div>

            {/* Key Variables */}
            <div style={{ marginBottom: 24 }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
                color: `${c}99`, letterSpacing: '0.08em', display: 'block', marginBottom: 14,
              }}>
                KEY VARIABLES
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10,
              }}>
                {keyVars.map((v, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <span style={{
                      fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 600, color: v.color, minWidth: 28,
                    }}>
                      {v.sym}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)',
                    }}>
                      {v.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Meaning */}
            <div>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
                color: `${c}99`, letterSpacing: '0.08em', display: 'block', marginBottom: 8,
              }}>
                PHYSICAL MEANING
              </span>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-secondary)',
                lineHeight: 1.7, margin: 0,
              }}>
                The actuator disk model replaces the turbine rotor with a permeable surface that extracts kinetic energy from the flow.
                Power <span style={{ color: c }}>P</span> scales with the cube of wind speed <span style={{ color: c }}>U</span>,
                making small velocity increases disproportionately valuable. The power coefficient <span style={{ color: c2 }}>Cₚ</span>
                captures rotor efficiency (Betz limit: 59.3%). The Navier–Stokes equations govern wake recovery through turbulent
                mixing, where the thrust coefficient <span style={{ color: c2 }}>Cₜ</span> determines the initial velocity deficit
                and the turbulence dissipation rate <span style={{ color: c }}>ε</span> controls how quickly the wake mixes with
                the free stream.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ORGANISATIONS
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="app-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 2.5vw, 30px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}>
              Organisations Using This Technology
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 20,
            maxWidth: 800,
            margin: '0 auto',
          }}>
            {orgs.map((org, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card"
                style={{
                  padding: '32px 24px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${org.color}12`, border: `1px solid ${org.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                  color: org.color, letterSpacing: '0.04em',
                }}>
                  {org.initials}
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>
                  {org.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          INTERACTIVE WAKE VISUALIZATION
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="app-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 8,
            }}>
              Interactive <span className="gradient-text-blue">Wake Simulation</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Adjust wind speed and turbine spacing to see how wake effects propagate through a wind farm.
            </p>
          </motion.div>

          <div className="glass-card" style={{
            maxWidth: 900, margin: '0 auto', padding: 32,
          }}>
            <EnergyCanvas windSpeed={windSpeed} turbineSpacing={turbineSpacing} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Wind Speed</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{windSpeed} m/s</span>
                </div>
                <input
                  type="range" min={3} max={25} value={windSpeed}
                  onChange={e => setWindSpeed(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c}40 0%, ${c}40 ${((windSpeed - 3) / 22) * 100}%, rgba(255,255,255,0.08) ${((windSpeed - 3) / 22) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Turbine Spacing</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{turbineSpacing} D</span>
                </div>
                <input
                  type="range" min={2} max={10} step={0.5} value={turbineSpacing}
                  onChange={e => setTurbineSpacing(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c2}40 0%, ${c2}40 ${((turbineSpacing - 2) / 8) * 100}%, rgba(255,255,255,0.08) ${((turbineSpacing - 2) / 8) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
      ═══════════════════════════════════════ */}
      <section style={{ padding: '40px 0 100px' }}>
        <div className="app-section" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 2.8vw, 34px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 12,
            }}>
              Ready to try it?
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              marginBottom: 32,
              maxWidth: 500,
              margin: '0 auto 32px',
            }}>
              Run the actuator disk PINN example in the interactive analyzer.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onNavigateToExplore) {
                  onNavigateToExplore('bernoulli', { context: 'energy' })
                }
              }}
              style={{
                padding: '14px 40px', borderRadius: 10,
                background: 'linear-gradient(135deg, #E07840, #C06030)',
                border: 'none', color: '#fff',
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(224,120,64,0.3)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(224,120,64,0.45)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(224,120,64,0.3)'}
            >
              Try Energy Example →
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  ENERGY SIMULATION — SVG + Framer Motion + rAF
// ═══════════════════════════════════════════════════════════════

function computeStats(windSpeed, spacing) {
  const rho = 1.225
  const R = 50
  const A = Math.PI * R * R
  const Cp = 0.45
  const power = 0.5 * rho * A * Math.pow(windSpeed, 3) * Cp / 1e6
  const wakeLoss = 20 / spacing
  const turbulence = 0.05 + 0.1 * (windSpeed / 25)
  return { power, wakeLoss, turbulence }
}

function EnergyCanvas({ windSpeed, turbineSpacing }) {
  const svgRef = useRef(null)
  const statsRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)
  const propsRef = useRef({ windSpeed, turbineSpacing })
  const ctxRef = useRef(null)

  useEffect(() => { propsRef.current = { windSpeed, turbineSpacing } }, [windSpeed, turbineSpacing])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const VW = 1000, VH = 500
    const T1_X = 200
    const HUB_Y = 245
    const TOWER_BOTTOM = 470
    const BLADE_LEN = 85
    const HUB_R = 8
    const NAC_W = 36
    const NAC_H = 18
    const MAIN_COLOR = `rgba(224,120,64,1)`
    const TEAL = `rgba(136,192,184,1)`

    const ns = 'http://www.w3.org/2000/svg'

    // ─── Grid group ───
    const gridGroup = document.createElementNS(ns, 'g')
    gridGroup.setAttribute('stroke', 'rgba(255,255,255,0.02)')
    gridGroup.setAttribute('stroke-width', '0.5')
    for (let i = 0; i < 25; i++) {
      const l = document.createElementNS(ns, 'line')
      l.setAttribute('x1', i * 42); l.setAttribute('y1', 0)
      l.setAttribute('x2', i * 42); l.setAttribute('y2', VH)
      gridGroup.appendChild(l)
    }
    for (let i = 0; i < 17; i++) {
      const l = document.createElementNS(ns, 'line')
      l.setAttribute('x1', 0); l.setAttribute('y1', i * 30)
      l.setAttribute('x2', VW); l.setAttribute('y2', i * 30)
      gridGroup.appendChild(l)
    }
    svg.appendChild(gridGroup)

    // ─── Defs ───
    const defs = document.createElementNS(ns, 'defs')

    const wakeGrad = document.createElementNS(ns, 'linearGradient')
    wakeGrad.id = 'wakeGrad'
    wakeGrad.setAttribute('x1', '0'); wakeGrad.setAttribute('y1', '0')
    wakeGrad.setAttribute('x2', '1'); wakeGrad.setAttribute('y2', '0')
    const ws1 = document.createElementNS(ns, 'stop')
    ws1.setAttribute('offset', '0%'); ws1.setAttribute('stop-color', 'rgba(100,180,200,0.35)')
    const ws2 = document.createElementNS(ns, 'stop')
    ws2.setAttribute('offset', '60%'); ws2.setAttribute('stop-color', 'rgba(100,180,200,0.10)')
    const ws3 = document.createElementNS(ns, 'stop')
    ws3.setAttribute('offset', '100%'); ws3.setAttribute('stop-color', 'rgba(100,180,200,0)')
    wakeGrad.appendChild(ws1); wakeGrad.appendChild(ws2); wakeGrad.appendChild(ws3)
    defs.appendChild(wakeGrad)

    const glow = document.createElementNS(ns, 'filter')
    glow.id = 'glow'
    const gb = document.createElementNS(ns, 'feGaussianBlur')
    gb.setAttribute('stdDeviation', '3')
    gb.setAttribute('result', 'blur')
    const merge = document.createElementNS(ns, 'feMerge')
    const mn1 = document.createElementNS(ns, 'feMergeNode')
    mn1.setAttribute('in', 'blur')
    const mn2 = document.createElementNS(ns, 'feMergeNode')
    mn2.setAttribute('in', 'SourceGraphic')
    merge.appendChild(mn1); merge.appendChild(mn2)
    glow.appendChild(gb); glow.appendChild(merge)
    defs.appendChild(glow)

    svg.insertBefore(defs, svg.firstChild)

    // ─── Wake overlay ───
    const wakeOverlay = document.createElementNS(ns, 'rect')
    wakeOverlay.setAttribute('fill', 'url(#wakeGrad)')
    wakeOverlay.setAttribute('rx', '4')
    wakeOverlay.setAttribute('y', HUB_Y - BLADE_LEN * 0.75)
    wakeOverlay.setAttribute('height', BLADE_LEN * 1.5)
    svg.appendChild(wakeOverlay)

    // ─── Blade shape helper ───
    function makeBladePath(cx, cy, angle, len, baseW, tipW) {
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const pc = Math.cos(angle + Math.PI / 2)
      const ps = Math.sin(angle + Math.PI / 2)
      const tx = cx + cosA * len
      const ty = cy + sinA * len
      return `${cx + pc * baseW},${cy + ps * baseW} ${tx + pc * tipW},${ty + ps * tipW} ${tx - pc * tipW},${ty - ps * tipW} ${cx - pc * baseW},${cy - ps * baseW}`
    }

    // ─── Turbine 1 ───
    const t1Group = document.createElementNS(ns, 'g')
    t1Group.id = 'turbine-1'

    const towerEl = document.createElementNS(ns, 'path')
    towerEl.setAttribute('d', `M ${T1_X - 5},${HUB_Y + NAC_H / 2} L ${T1_X - 7},${TOWER_BOTTOM} L ${T1_X + 7},${TOWER_BOTTOM} L ${T1_X + 5},${HUB_Y + NAC_H / 2} Z`)
    towerEl.setAttribute('fill', 'rgba(224,120,64,0.5)')
    towerEl.setAttribute('stroke', 'rgba(224,120,64,0.2)')
    towerEl.setAttribute('stroke-width', '0.5')
    t1Group.appendChild(towerEl)

    const nacelle = document.createElementNS(ns, 'rect')
    nacelle.setAttribute('x', T1_X - NAC_W / 2)
    nacelle.setAttribute('y', HUB_Y - NAC_H / 2)
    nacelle.setAttribute('width', NAC_W)
    nacelle.setAttribute('height', NAC_H)
    nacelle.setAttribute('rx', '4')
    nacelle.setAttribute('fill', 'rgba(224,120,64,0.3)')
    nacelle.setAttribute('stroke', 'rgba(224,120,64,0.4)')
    nacelle.setAttribute('stroke-width', '1')
    t1Group.appendChild(nacelle)

    const rotorGroup = document.createElementNS(ns, 'g')
    rotorGroup.id = 'rotor-1'

    const bladeEls = []
    for (let i = 0; i < 3; i++) {
      const b = document.createElementNS(ns, 'polygon')
      b.setAttribute('fill', 'rgba(224,120,64,0.5)')
      b.setAttribute('stroke', 'rgba(224,120,64,0.3)')
      b.setAttribute('stroke-width', '0.5')
      bladeEls.push(b)
      rotorGroup.appendChild(b)
    }

    const hub = document.createElementNS(ns, 'circle')
    hub.setAttribute('cx', T1_X)
    hub.setAttribute('cy', HUB_Y)
    hub.setAttribute('r', HUB_R)
    hub.setAttribute('fill', 'rgba(224,120,64,0.7)')
    hub.setAttribute('stroke', 'rgba(224,120,64,0.5)')
    hub.setAttribute('stroke-width', '1')
    rotorGroup.appendChild(hub)

    t1Group.appendChild(rotorGroup)
    svg.appendChild(t1Group)

    // ─── Turbine 2 (faint) ───
    const t2Group = document.createElementNS(ns, 'g')
    t2Group.id = 'turbine-2'

    const t2Tower = document.createElementNS(ns, 'path')
    t2Tower.setAttribute('d', `M 0,${HUB_Y + NAC_H / 2} L 0,${TOWER_BOTTOM} L 0,${TOWER_BOTTOM} L 0,${HUB_Y + NAC_H / 2} Z`)
    t2Tower.setAttribute('fill', 'rgba(136,192,184,0.2)')
    t2Group.appendChild(t2Tower)

    const t2Nacelle = document.createElementNS(ns, 'rect')
    t2Nacelle.setAttribute('y', HUB_Y - NAC_H / 2)
    t2Nacelle.setAttribute('width', NAC_W)
    t2Nacelle.setAttribute('height', NAC_H)
    t2Nacelle.setAttribute('rx', '4')
    t2Nacelle.setAttribute('fill', 'rgba(136,192,184,0.15)')
    t2Nacelle.setAttribute('stroke', 'rgba(136,192,184,0.25)')
    t2Nacelle.setAttribute('stroke-width', '0.5')
    t2Group.appendChild(t2Nacelle)

    const t2Rotor = document.createElementNS(ns, 'g')
    t2Rotor.id = 'rotor-2'

    const t2BladeEls = []
    for (let i = 0; i < 3; i++) {
      const b = document.createElementNS(ns, 'polygon')
      b.setAttribute('fill', 'rgba(136,192,184,0.3)')
      b.setAttribute('stroke', 'rgba(136,192,184,0.15)')
      b.setAttribute('stroke-width', '0.5')
      t2BladeEls.push(b)
      t2Rotor.appendChild(b)
    }

    const t2Hub = document.createElementNS(ns, 'circle')
    t2Hub.setAttribute('r', HUB_R * 0.8)
    t2Hub.setAttribute('fill', 'rgba(136,192,184,0.4)')
    t2Rotor.appendChild(t2Hub)

    t2Group.appendChild(t2Rotor)
    svg.appendChild(t2Group)

    // ─── "LIVE OUTPUT" title ───
    const liveTitle = document.createElementNS(ns, 'text')
    liveTitle.setAttribute('x', '14')
    liveTitle.setAttribute('y', '22')
    liveTitle.setAttribute('fill', 'rgba(224,120,64,0.12)')
    liveTitle.setAttribute('font-size', '18')
    liveTitle.setAttribute('font-family', 'system-ui')
    liveTitle.setAttribute('font-weight', 'bold')
    liveTitle.textContent = 'LIVE OUTPUT'
    svg.appendChild(liveTitle)

    // ─── Annotations ───
    const t1Label = document.createElementNS(ns, 'text')
    t1Label.setAttribute('x', T1_X)
    t1Label.setAttribute('y', TOWER_BOTTOM + 18)
    t1Label.setAttribute('fill', 'rgba(224,120,64,0.4)')
    t1Label.setAttribute('font-size', '10')
    t1Label.setAttribute('font-family', 'system-ui')
    t1Label.setAttribute('text-anchor', 'middle')
    t1Label.textContent = 'Turbine 1'
    svg.appendChild(t1Label)

    const t2Label = document.createElementNS(ns, 'text')
    t2Label.setAttribute('text-anchor', 'middle')
    t2Label.setAttribute('fill', 'rgba(136,192,184,0.3)')
    t2Label.setAttribute('font-size', '10')
    t2Label.setAttribute('font-family', 'system-ui')
    t2Label.textContent = 'Turbine 2'
    svg.appendChild(t2Label)

    const wakeLabel = document.createElementNS(ns, 'text')
    wakeLabel.setAttribute('x', T1_X + 120)
    wakeLabel.setAttribute('y', HUB_Y - BLADE_LEN - 12)
    wakeLabel.setAttribute('fill', 'rgba(100,180,200,0.3)')
    wakeLabel.setAttribute('font-size', '9')
    wakeLabel.setAttribute('font-family', 'system-ui')
    wakeLabel.textContent = 'WAKE REGION'
    svg.appendChild(wakeLabel)

    // ─── Particles ───
    const numParticles = 90
    const particles = []
    const particleEls = []
    for (let i = 0; i < numParticles; i++) {
      const p = {
        x: Math.random() * VW,
        baseY: HUB_Y - BLADE_LEN * 0.8 + (i / numParticles) * BLADE_LEN * 1.6,
        speed: 0.3 + Math.random() * 0.4,
        size: 1.5 + Math.random() * 2.5,
      }
      p.y = p.baseY
      particles.push(p)
    }
    particlesRef.current = particles

    for (let i = 0; i < numParticles; i++) {
      const c = document.createElementNS(ns, 'circle')
      c.setAttribute('r', particles[i].size)
      c.setAttribute('fill', '#E07840')
      c.setAttribute('opacity', '0.6')
      c.setAttribute('filter', 'url(#glow)')
      svg.appendChild(c)
      particleEls.push(c)
    }

    // ─── Spacing annotation ───
    const spacingLine = document.createElementNS(ns, 'line')
    spacingLine.setAttribute('y1', TOWER_BOTTOM + 6)
    spacingLine.setAttribute('y2', TOWER_BOTTOM + 6)
    spacingLine.setAttribute('stroke', 'rgba(255,255,255,0.08)')
    spacingLine.setAttribute('stroke-width', '1')
    spacingLine.setAttribute('stroke-dasharray', '3 3')
    svg.appendChild(spacingLine)

    const spacingLabel = document.createElementNS(ns, 'text')
    spacingLabel.setAttribute('y', TOWER_BOTTOM + 16)
    spacingLabel.setAttribute('fill', 'rgba(255,255,255,0.15)')
    spacingLabel.setAttribute('font-size', '8')
    spacingLabel.setAttribute('font-family', 'system-ui')
    spacingLabel.setAttribute('text-anchor', 'middle')
    spacingLabel.textContent = '← Spacing →'
    svg.appendChild(spacingLabel)

    // ─── Wind direction arrow ───
    const windArrow = document.createElementNS(ns, 'text')
    windArrow.setAttribute('x', '40')
    windArrow.setAttribute('y', '30')
    windArrow.setAttribute('fill', 'rgba(106,191,105,0.15)')
    windArrow.setAttribute('font-size', '16')
    windArrow.setAttribute('font-family', 'system-ui')
    windArrow.textContent = '→ Wind'
    svg.appendChild(windArrow)

    // ─── Animation loop ───
    let bladeAngle = 0

    const loop = () => {
      const { windSpeed: ws, turbineSpacing: ts } = propsRef.current
      const sf = Math.max(0.1, ws / 25)
      const t2X = T1_X + ts * 60

      // Blade rotation
      bladeAngle += 0.02 * sf
      const angles = [bladeAngle, bladeAngle + 2 * Math.PI / 3, bladeAngle + 4 * Math.PI / 3]
      for (let i = 0; i < 3; i++) {
        bladeEls[i].setAttribute('points', makeBladePath(T1_X, HUB_Y, angles[i], BLADE_LEN, 7, 1.5))
        t2BladeEls[i].setAttribute('points', makeBladePath(t2X, HUB_Y, angles[i], BLADE_LEN * 0.85, 5, 1))
      }

      // Rotor glow
      rotorGroup.setAttribute('filter', 'url(#glow)')

      // Turbine 2 position
      t2Tower.setAttribute('d', `M ${t2X - 4},${HUB_Y + NAC_H / 2} L ${t2X - 6},${TOWER_BOTTOM} L ${t2X + 6},${TOWER_BOTTOM} L ${t2X + 4},${HUB_Y + NAC_H / 2} Z`)
      t2Nacelle.setAttribute('x', t2X - NAC_W / 2)
      t2Hub.setAttribute('cx', t2X)
      t2Hub.setAttribute('cy', HUB_Y)
      t2Label.setAttribute('x', t2X)
      t2Label.setAttribute('y', TOWER_BOTTOM + 18)

      // Spacing annotation
      spacingLine.setAttribute('x1', T1_X)
      spacingLine.setAttribute('x2', t2X)
      spacingLabel.setAttribute('x', (T1_X + t2X) / 2)

      // Wake overlay
      const wakeX = T1_X + 15
      const wakeW = Math.max(20, t2X - T1_X + 60)
      const wakeAlpha = Math.min(0.6, 0.15 + 0.45 * (1 - (ts - 2) / 8))
      wakeOverlay.setAttribute('x', wakeX)
      wakeOverlay.setAttribute('width', wakeW)
      wakeOverlay.setAttribute('opacity', wakeAlpha)

      // Wake label position
      wakeLabel.setAttribute('x', T1_X + wakeW * 0.4)

      // Update particles
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i]

        // Speed multiplier based on position in wake
        let mult = 1.0
        const inRotorPath = Math.abs(p.baseY - HUB_Y) < BLADE_LEN * 0.9
        if (inRotorPath) {
          if (p.x < T1_X - 15) {
            mult = 1.0
          } else if (p.x < T1_X + 15) {
            const t = (p.x - (T1_X - 15)) / 30
            mult = 1.0 - t * 0.6
          } else if (p.x < t2X) {
            const wakeProgress = (p.x - T1_X) / (t2X - T1_X)
            mult = 0.4 + 0.45 * Math.min(1, wakeProgress)
          } else if (p.x < t2X + 15) {
            const t2 = (p.x - t2X) / 15
            mult = 0.85 - t2 * 0.35
          } else {
            const recovery = Math.min(1, (p.x - t2X) / 200)
            mult = 0.5 + 0.48 * recovery
          }
        }

        p.x += p.speed * sf * 4 * mult
        if (p.x > VW + 30) {
          p.x = -30
          p.baseY = HUB_Y - BLADE_LEN * 0.8 + Math.random() * BLADE_LEN * 1.6
          p.y = p.baseY
        }
        p.y = p.baseY
        particleEls[i].setAttribute('cx', p.x)
        particleEls[i].setAttribute('cy', p.y)
        const bright = 0.2 + sf * 0.6
        particleEls[i].setAttribute('opacity', Math.min(1, bright))
      }

      // Update stats
      if (statsRef.current) {
        const st = computeStats(ws, ts)
        const els = statsRef.current
        els.power.textContent = `${Math.max(0, st.power).toFixed(2)} MW`
        els.windSpeed.textContent = `${ws.toFixed(1)} m/s`
        els.wakeLoss.textContent = `${Math.min(100, st.wakeLoss).toFixed(1)}%`
        els.turbulence.textContent = `${st.turbulence.toFixed(3)}`
        const pinn = 90 + Math.sin(performance.now() * 0.0005) * 3 + (1 - (ts - 2) / 8) * 5
        els.pinn.textContent = `${Math.min(99.9, pinn).toFixed(1)}%`
        const conv = Math.min(99.5, 82 + ws * 0.3 + (ts - 2) * 1.5)
        els.convergence.textContent = `${Math.min(99.9, conv).toFixed(1)}%`
      }

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animRef.current)
      while (svg.firstChild) svg.removeChild(svg.firstChild)
    }
  }, [])

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: 'relative', width: '100%', borderRadius: 10, overflow: 'hidden' }}>
        <svg ref={svgRef} viewBox="0 0 1000 500" style={{ width: '100%', display: 'block', background: '#070a14' }}>
          <defs>
            <linearGradient id="wakeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(100,180,200,0.35)" />
              <stop offset="60%" stopColor="rgba(100,180,200,0.10)" />
              <stop offset="100%" stopColor="rgba(100,180,200,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 10,
        marginTop: 18,
        padding: '18px 20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        {[
          { label: 'Power Output', key: 'power', icon: '⚡', color: c },
          { label: 'Wind Speed', key: 'windSpeed', icon: '→', color: c2 },
          { label: 'Wake Loss', key: 'wakeLoss', icon: '', color: c },
          { label: 'Turbulence', key: 'turbulence', icon: '', color: c2 },
          { label: 'PINN Pred.', key: 'pinn', icon: '', color: c },
          { label: 'Convergence', key: 'convergence', icon: '', color: c2 },
        ].map((s) => (
          <div key={s.key} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
              color: `${s.color}99`, letterSpacing: '0.06em', marginBottom: 4,
            }}>
              {s.icon && <span style={{ marginRight: 3 }}>{s.icon}</span>}{s.label}
            </div>
            <div ref={el => { if (statsRef.current === null) statsRef.current = {};
              statsRef.current[s.key] = el }}
              style={{
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                color: s.color, letterSpacing: '-0.01em',
              }}
            >
              {s.key === 'turbulence' ? '0.000' : s.key === 'power' ? '0.00 MW' : s.key === 'windSpeed' ? '0.0 m/s' : '0.0%'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
