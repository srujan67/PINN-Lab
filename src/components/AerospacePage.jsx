import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import './Applications.css'

const c = '#C4956A'
const c2 = '#A09CC8'

const sections = [
  {
    num: '01', label: 'Engineering Problem', color: c,
    lines: [
      'Predicting aerodynamic forces requires solving high-dimensional Navier–Stokes equations.',
      'Traditional CFD takes hours per run and demands supercomputing resources.',
      'Iterative design exploration is prohibitively slow — a single configuration takes 8–12 hours.',
      'Wind tunnel testing is expensive and cannot capture the full flight envelope.',
      'This bottleneck limits how many designs engineers can evaluate before committing to production.',
    ],
  },
  {
    num: '02', label: 'Physics Used', color: c2,
    lines: [
      'The Navier–Stokes equations govern conservation of momentum in viscous fluid flows.',
      'Reynolds number (inertial vs. viscous forces) and Mach number (compressibility) are key.',
      'Pressure-velocity coupling determines lift, drag, and moment coefficients on aerodynamic surfaces.',
      'Boundary layer dynamics transition from laminar to turbulent, affecting skin friction drag.',
      'Vorticity transport and wake formation govern unsteady phenomena like flutter and buffet.',
    ],
  },
  {
    num: '03', label: 'Why Traditional AI Struggles', color: c,
    lines: [
      'Data-driven models cannot guarantee conservation of mass, momentum, and energy.',
      'Networks trained on CFD snapshots produce non-physical flow separations and violate Bernoulli.',
      'Extrapolation beyond training regimes yields unreliable predictions for safety-critical flight.',
      'Black-box models lack interpretability, making aviation authority certification impossible.',
      'Data requirements are enormous — millions of training samples for full flow field capture.',
    ],
  },
  {
    num: '04', label: 'Why PINNs Work', color: c2,
    lines: [
      'PINNs embed the Navier–Stokes equations directly into the neural network loss function.',
      'Solutions respect conservation laws by construction, even when extrapolating beyond data.',
      'No mesh generation is needed; PINNs work on arbitrary point clouds, eliminating grid bottlenecks.',
      'Sparse surface pressure data is sufficient to reconstruct full 3D flow fields with physical consistency.',
      'Training converges in minutes instead of hours, enabling rapid iterative design exploration.',
    ],
  },
  {
    num: '05', label: 'Real Applications', color: c,
    lines: [
      'Aircraft wing design optimisation — evaluate thousands of airfoil profiles in hours not weeks.',
      'Drone aerodynamics — real-time flow prediction for gust response and stability control.',
      'Wind tunnel digital twins — PINN-augmented CFD matching experimental data with under 5% error.',
      'Propulsion system design — combustion chamber flow modelling with chemical reaction coupling.',
      'Spacecraft re-entry — hypersonic flow prediction with real-gas and thermal protection effects.',
    ],
  },
]

const orgs = [
  { name: 'NASA', initials: 'NASA', color: c },
  { name: 'Boeing', initials: 'BOE', color: c2 },
  { name: 'Airbus', initials: 'AIR', color: c },
  { name: 'GE Aerospace', initials: 'GE', color: c2 },
]

const keyVars = [
  { sym: 'ρ', desc: 'Fluid density', color: c },
  { sym: 'u', desc: 'Velocity vector field', color: c2 },
  { sym: 'p', desc: 'Pressure field', color: c },
  { sym: 'μ', desc: 'Dynamic viscosity', color: c },
  { sym: 'f', desc: 'External body forces', color: c2 },
  { sym: '∇', desc: 'Gradient operator', color: c },
  { sym: '∇²', desc: 'Laplacian operator', color: c },
]

export default function AerospacePage({ onNavigateToExplore }) {
  const [airSpeed, setAirSpeed] = useState(50)
  const [angleOfAttack, setAngleOfAttack] = useState(6)

  return (
    <div className="app-page">

      {/* ═══════════════════════════════════════
          HEADER — Title + Subtitle + Info Cards + Scroll Indicator
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 30px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', '--color-accent': '#C4956A' }}>
        {/* Subtle animated background — airflow streamlines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04 }}>
          <svg viewBox="0 0 1440 600" style={{ width: '100%', height: '100%' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.path
                key={i}
                d={`M-100,${80 + i * 110} Q360,${40 + i * 110} 720,${80 + i * 110} Q1080,${120 + i * 110} 1540,${80 + i * 110}`}
                fill="none"
                stroke="#C4956A"
                strokeWidth={0.8}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }}
                transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
              />
            ))}
          </svg>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(196,149,106,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(160,156,200,0.06) 0%, transparent 50%)',
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
              Aerospace{' '}
              <span className="gradient-text-blue">Engineering</span>
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
              Physics-Informed Neural Networks for Aerodynamics
            </motion.p>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="industry-info-cards"
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}
            >
              {[
                { label: 'Primary Physics', value: 'Navier–Stokes' },
                { label: 'Industry', value: 'Aircraft & Spacecraft' },
                { label: 'PINN Advantage', value: 'Physics-Constrained Learning' },
                { label: 'Engineering Goal', value: 'Real-Time Aerodynamic Prediction' },
              ].map((card, i) => (
                <div key={i} style={{
                  flex: '1 1 180px', maxWidth: 210,
                  padding: '20px 24px', borderRadius: 12,
                  background: 'rgba(13, 18, 32, 0.7)',
                  border: '1px solid rgba(196,149,106,0.15)',
                  textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 10,
                    color: 'rgba(196,149,106,0.75)',
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
              Conservation of momentum in viscous fluid flow
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
              <span style={{ color: c, fontWeight: 600 }}>ρ</span>
              <span>(</span>
              <span style={{ color: c2 }}>∂u</span>/<span style={{ color: c2 }}>∂t</span>
              <span> + </span>
              <span style={{ color: c2 }}>u</span>·<span style={{ color: c }}>∇</span>
              <span style={{ color: c2 }}>u</span>
              <span>) = −</span>
              <span style={{ color: c }}>∇p</span>
              <span> + </span>
              <span style={{ color: c }}>μ</span>
              <span style={{ color: c }}>∇²</span>
              <span style={{ color: c2 }}>u</span>
              <span> + </span>
              <span style={{ color: c2 }}>f</span>
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
                The left-hand side captures inertial forces — how fluid accelerates and convects through the velocity field.
                On the right, the pressure gradient <span style={{ color: c }}>∇p</span> drives flow from high to low pressure,
                viscous diffusion <span style={{ color: c }}>μ∇²u</span> dissipates energy through internal friction,
                and external body forces <span style={{ color: c2 }}>f</span> (like gravity) add momentum sources.
                Together these terms fully describe the motion of Newtonian fluids under any flow condition.
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
          INTERACTIVE FLOW VISUALIZATION
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
              Interactive <span className="gradient-text-blue">Flow Visualization</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Adjust air speed and angle of attack to see how airflow responds around the wing profile.
            </p>
          </motion.div>

          <div className="glass-card" style={{
            maxWidth: 900, margin: '0 auto', padding: 32,
          }}>
            <AerospaceCanvas airSpeed={airSpeed} angleOfAttack={angleOfAttack} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Air Speed</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{airSpeed} m/s</span>
                </div>
                <input
                  type="range" min={10} max={100} value={airSpeed}
                  onChange={e => setAirSpeed(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c}40 0%, ${c}40 ${airSpeed}%, rgba(255,255,255,0.08) ${airSpeed}%, rgba(255,255,255,0.08) 100%)`,
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Angle of Attack</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{angleOfAttack}°</span>
                </div>
                <input
                  type="range" min={-5} max={20} value={angleOfAttack}
                  onChange={e => setAngleOfAttack(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c2}40 0%, ${c2}40 ${((angleOfAttack + 5) / 25) * 100}%, rgba(255,255,255,0.08) ${((angleOfAttack + 5) / 25) * 100}%, rgba(255,255,255,0.08) 100%)`,
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
              Run the Navier–Stokes PINN example in the interactive analyzer.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onNavigateToExplore) {
                  onNavigateToExplore('navier', { context: 'aerospace' })
                }
              }}
              style={{
                padding: '14px 40px', borderRadius: 10,
                background: 'linear-gradient(135deg, #C4956A, #A87A50)',
                border: 'none', color: '#fff',
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(196,149,106,0.3)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(196,149,106,0.45)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(196,149,106,0.3)'}
            >
              Try Aerospace Example →
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  AEROSPACE SIMULATION — SVG + Framer Motion + rAF
// ═══════════════════════════════════════════════════════════════

function computeStats(speed, aoa) {
  const v = speed
  const rho = 1.225
  const area = 16
  const aoaRad = (aoa * Math.PI) / 180
  const cl = 0.4 + Math.abs(aoaRad) * 3.5
  const cd = 0.04 + aoaRad * aoaRad * 8
  const lift = (cl * 0.5 * rho * v * v * area) / 1000
  const drag = (cd * 0.5 * rho * v * v * area) / 1000
  const pressure = (0.5 * rho * v * v) / 1000000
  const flowState = aoa < 8 ? 'Laminar' : aoa < 15 ? 'Transitional' : 'Turbulent'
  return { lift, drag, pressure, flowState }
}

function AerospaceCanvas({ airSpeed, angleOfAttack }) {
  const svgRef = useRef(null)
  const statsRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)
  const propsRef = useRef({ airSpeed, angleOfAttack })
  const ctxRef = useRef(null)

  useEffect(() => { propsRef.current = { airSpeed, angleOfAttack } }, [airSpeed, angleOfAttack])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const parent = svg.parentElement

    const VW = 1000, VH = 500
    const CX = VW / 2, CY = VH / 2
    const CHORD = VW * 0.40
    const MAX_T = CHORD * 0.12
    const LE_X = CX - CHORD / 2
    const TE_X = CX + CHORD / 2
    const BRONZE = `rgba(196,149,106,1)`

    // ─── NACA 0012 airfoil path ───
    function getAirfoilPath() {
      const n = 28
      let upper = '', lower = ''
      for (let i = 0; i <= n; i++) {
        const frac = i / n
        const x = frac * CHORD
        const xc = x / CHORD
        const sqrtX = Math.sqrt(xc)
        const yt = MAX_T * (0.2969 * sqrtX - 0.1260 * xc - 0.3516 * xc * xc + 0.2843 * xc * xc * xc - 0.1015 * xc * xc * xc * xc)
        const px = LE_X + x
        if (i === 0) {
          upper = `M ${px},${CY - yt}`
          lower = ` L ${px},${CY + yt}`
        } else {
          upper += ` L ${px},${CY - yt}`
          lower = ` L ${px},${CY + yt}` + lower
        }
      }
      return upper + ` L ${TE_X},${CY}` + lower + ' Z'
    }

    const wingPath = getAirfoilPath()

    // ─── Streamline deflection ───
    function getDeflection(x, baseY) {
      const { angleOfAttack: aoa } = propsRef.current
      const aoaRad = aoa * Math.PI / 180
      const sf = Math.max(0.2, propsRef.current.airSpeed / 50)

      const dx = (x - CX) / (CHORD * 0.5)
      const influence = Math.exp(-dx * dx * 2.2)
      const relY = (baseY - CY) / MAX_T

      let dir = 0
      if (relY < -1.2) {
        dir = -0.15 * Math.min(1, (Math.abs(relY) - 1.2) * 0.3)
      } else if (relY < -0.3) {
        const t = 1 - Math.abs(relY + 0.75) / 0.45
        dir = -0.9 * Math.max(0, t)
      } else if (relY < 0.4) {
        const t = 1 - Math.abs(relY - 0.05) / 0.35
        dir = -0.95 * Math.max(0, t)
      } else if (relY < 1.5) {
        const t = 1 - (relY - 0.4) / 1.1
        dir = 0.5 * Math.max(0, t)
      } else {
        dir = 0.1 * Math.min(1, (relY - 1.5) * 0.2)
      }

      // Flow separation at high AoA on upper surface aft
      const sep = Math.max(0, Math.min(1, (aoa - 10) / 10))
      if (relY < 0.5 && dx > 0.05) {
        const aft = Math.min(1, Math.max(0, (dx - 0.05) / 0.6))
        dir *= (1 - sep * aft * 0.8)
        if (aoa > 14 && dx > 0.4 && relY < 0) {
          const wake = Math.min(1, (dx - 0.4) / 0.3) * Math.min(1, (aoa - 14) / 6)
          dir = dir * (1 - wake) + Math.sin(x * 0.08 + baseY * 0.02) * wake * 0.4
        }
      }

      return influence * aoaRad * 65 * dir * sf
    }

    // ─── Generate streamline path ───
    function getStreamlinePath(baseY, n) {
      const pts = n || 50
      let path = ''
      for (let i = 0; i <= pts; i++) {
        const x = -40 + (i / pts) * (VW + 80)
        const y = baseY + getDeflection(x, baseY)
        path += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`)
      }
      return path
    }

    // ─── Build SVG content ───
    const ns = 'http://www.w3.org/2000/svg'

    // Grid group
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

    // Pressure overlays
    const pressLow = document.createElementNS(ns, 'rect')
    pressLow.setAttribute('x', CX - CHORD * 0.75)
    pressLow.setAttribute('y', CY - CHORD * 0.3)
    pressLow.setAttribute('width', CHORD * 1.5)
    pressLow.setAttribute('height', CHORD * 0.3)
    pressLow.setAttribute('fill', 'url(#lowP)')
    svg.appendChild(pressLow)

    const pressHigh = document.createElementNS(ns, 'rect')
    pressHigh.setAttribute('x', CX - CHORD * 0.7)
    pressHigh.setAttribute('y', CY + MAX_T * 0.5)
    pressHigh.setAttribute('width', CHORD * 1.4)
    pressHigh.setAttribute('height', CHORD * 0.2)
    pressHigh.setAttribute('fill', 'url(#highP)')
    svg.appendChild(pressHigh)

    // Streamlines
    const numStreamlines = 14
    const streamlineEls = []
    for (let i = 0; i < numStreamlines; i++) {
      const baseY = 18 + (i / (numStreamlines - 1)) * (VH - 36)
      const p = document.createElementNS(ns, 'path')
      p.setAttribute('d', getStreamlinePath(baseY))
      p.setAttribute('fill', 'none')
      p.setAttribute('stroke', `rgba(196,149,106,${i < 5 ? 0.12 : i < 9 ? 0.08 : 0.04})`)
      p.setAttribute('stroke-width', '1.5')
      p.setAttribute('stroke-dasharray', '6 6')
      svg.appendChild(p)
      streamlineEls.push({ el: p, baseY })
    }

    // Wing
    const wingGroup = document.createElementNS(ns, 'g')
    wingGroup.id = 'wing-group'
    const wingDefs = document.createElementNS(ns, 'defs')
    const wingGrad = document.createElementNS(ns, 'linearGradient')
    wingGrad.id = 'wingG'
    wingGrad.setAttribute('x1', '0'); wingGrad.setAttribute('y1', '0')
    wingGrad.setAttribute('x2', '1'); wingGrad.setAttribute('y2', '0')
    const s1 = document.createElementNS(ns, 'stop')
    s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', 'rgba(196,149,106,0.15)')
    const s2 = document.createElementNS(ns, 'stop')
    s2.setAttribute('offset', '40%'); s2.setAttribute('stop-color', 'rgba(196,149,106,0.5)')
    const s3 = document.createElementNS(ns, 'stop')
    s3.setAttribute('offset', '100%'); s3.setAttribute('stop-color', 'rgba(196,149,106,0.1)')
    wingGrad.appendChild(s1); wingGrad.appendChild(s2); wingGrad.appendChild(s3)
    wingDefs.appendChild(wingGrad)

    const wingGlow = document.createElementNS(ns, 'filter')
    wingGlow.id = 'wingGlow'
    const gb = document.createElementNS(ns, 'feGaussianBlur')
    gb.setAttribute('stdDeviation', '4')
    gb.setAttribute('result', 'blur')
    const merge = document.createElementNS(ns, 'feMerge')
    const mn1 = document.createElementNS(ns, 'feMergeNode')
    mn1.setAttribute('in', 'blur')
    const mn2 = document.createElementNS(ns, 'feMergeNode')
    mn2.setAttribute('in', 'SourceGraphic')
    merge.appendChild(mn1); merge.appendChild(mn2)
    wingGlow.appendChild(gb); wingGlow.appendChild(merge)
    wingDefs.appendChild(wingGlow)

    svg.insertBefore(wingDefs, svg.firstChild)

    const wingPathEl = document.createElementNS(ns, 'path')
    wingPathEl.setAttribute('d', wingPath)
    wingPathEl.setAttribute('fill', 'url(#wingG)')
    wingPathEl.setAttribute('stroke', 'rgba(196,149,106,0.4)')
    wingPathEl.setAttribute('stroke-width', '1.5')
    wingPathEl.setAttribute('filter', 'url(#wingGlow)')
    wingGroup.appendChild(wingPathEl)
    svg.appendChild(wingGroup)

    // Vortex sheet indicator (thin lines near trailing edge at high AoA)
    const wakeGroup = document.createElementNS(ns, 'g')
    wakeGroup.id = 'wake-group'
    svg.appendChild(wakeGroup)
    const wakeEls = []

    // Lift arrow group
    const liftGroup = document.createElementNS(ns, 'g')
    liftGroup.id = 'lift-group'
    const liftLine = document.createElementNS(ns, 'line')
    liftLine.setAttribute('stroke', '#64c8ff')
    liftLine.setAttribute('stroke-width', '2.5')
    liftLine.setAttribute('stroke-linecap', 'round')
    const liftHead = document.createElementNS(ns, 'polygon')
    liftHead.setAttribute('fill', '#64c8ff')
    liftGroup.appendChild(liftLine)
    liftGroup.appendChild(liftHead)
    // Label
    const liftLabel = document.createElementNS(ns, 'text')
    liftLabel.setAttribute('fill', 'rgba(100,200,255,0.7)')
    liftLabel.setAttribute('font-size', '11')
    liftLabel.setAttribute('font-family', 'system-ui')
    liftLabel.setAttribute('text-anchor', 'middle')
    liftGroup.appendChild(liftLabel)
    svg.appendChild(liftGroup)

    // Drag arrow group
    const dragGroup = document.createElementNS(ns, 'g')
    dragGroup.id = 'drag-group'
    const dragLine = document.createElementNS(ns, 'line')
    dragLine.setAttribute('stroke', `rgba(196,149,106,0.6)`)
    dragLine.setAttribute('stroke-width', '2')
    dragLine.setAttribute('stroke-linecap', 'round')
    const dragHead = document.createElementNS(ns, 'polygon')
    dragHead.setAttribute('fill', 'rgba(196,149,106,0.7)')
    dragGroup.appendChild(dragLine)
    dragGroup.appendChild(dragHead)
    const dragLabel = document.createElementNS(ns, 'text')
    dragLabel.setAttribute('fill', 'rgba(196,149,106,0.6)')
    dragLabel.setAttribute('font-size', '11')
    dragLabel.setAttribute('font-family', 'system-ui')
    dragLabel.setAttribute('text-anchor', 'middle')
    dragGroup.appendChild(dragLabel)
    svg.appendChild(dragGroup)

    // "LIVE OUTPUT" title in SVG
    const liveTitle = document.createElementNS(ns, 'text')
    liveTitle.setAttribute('x', '14')
    liveTitle.setAttribute('y', '22')
    liveTitle.setAttribute('fill', 'rgba(196,149,106,0.12)')
    liveTitle.setAttribute('font-size', '18')
    liveTitle.setAttribute('font-family', 'system-ui')
    liveTitle.setAttribute('font-weight', 'bold')
    liveTitle.textContent = 'LIVE OUTPUT'
    svg.appendChild(liveTitle)

    // ─── Particles ───
    const numParticles = 80
    const particles = []
    const particleEls = []
    for (let i = 0; i < numParticles; i++) {
      const p = {
        x: Math.random() * VW,
        baseY: 8 + (i / numParticles) * (VH - 16),
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
      c.setAttribute('fill', '#C4956A')
      c.setAttribute('opacity', '0.7')
      c.setAttribute('filter', 'url(#wingGlow)')
      svg.appendChild(c)
      particleEls.push(c)
    }

    // ─── Animation loop ───
    const loop = () => {
      const { airSpeed: spd, angleOfAttack: aoa } = propsRef.current
      const sf = Math.max(0.2, spd / 50)
      const aoaRad = aoa * Math.PI / 180

      // Wing rotation
      wingGroup.setAttribute('transform', `rotate(${-aoa * 0.6}, ${CX}, ${CY})`)

      // Update streamlines (recompute paths)
      for (let i = 0; i < numStreamlines; i++) {
        streamlineEls[i].el.setAttribute('d', getStreamlinePath(streamlineEls[i].baseY))
      }

      // Update particles
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i]
        p.x += p.speed * sf * 5
        if (p.x > VW + 30) {
          p.x = -30
          p.baseY = 8 + Math.random() * (VH - 16)
        }
        const dy = getDeflection(p.x, p.baseY)
        p.y = p.baseY + dy
        particleEls[i].setAttribute('cx', p.x)
        particleEls[i].setAttribute('cy', p.y)
        const bright = 0.3 + sf * 0.5
        particleEls[i].setAttribute('opacity', Math.min(1, bright))
      }

      // Pressure field opacity
      const pressAlpha = Math.min(0.5, Math.abs(aoaRad) * 1.5)
      pressLow.setAttribute('opacity', pressAlpha)
      pressHigh.setAttribute('opacity', Math.min(0.35, Math.abs(aoaRad) * 1.2))

      // Wake at high AoA
      while (wakeGroup.firstChild) wakeGroup.removeChild(wakeGroup.firstChild)
      if (aoa > 10) {
        const wakeCount = Math.floor((aoa - 10) * 2.5)
        for (let i = 0; i < wakeCount; i++) {
          const wLine = document.createElementNS(ns, 'path')
          const wY = CY - MAX_T * 0.5 + (i / wakeCount) * MAX_T * 1.2
          const wX = TE_X + 10 + Math.random() * 40
          const wLen = 20 + Math.random() * (aoa - 10) * 5
          wLine.setAttribute('d', `M ${wX},${wY + Math.sin(i * 2) * 5} Q ${wX + wLen * 0.5},${wY + Math.sin(i * 3 + aoa) * 10} ${wX + wLen},${wY + Math.sin(i * 1.5 + aoa * 0.5) * 8}`)
          wLine.setAttribute('stroke', `rgba(196,149,106,${0.05 + (aoa - 10) * 0.01})`)
          wLine.setAttribute('stroke-width', '1')
          wLine.setAttribute('fill', 'none')
          wakeGroup.appendChild(wLine)
        }
      }

      // Lift / Drag vectors
      const st = computeStats(spd, aoa)
      const liftPx = Math.min(140, 15 + st.lift * 10)
      const dragPx = Math.min(110, 10 + st.drag * 18)

      const liftStartY = CY - MAX_T - 15
      liftLine.setAttribute('x1', CX)
      liftLine.setAttribute('y1', liftStartY)
      liftLine.setAttribute('x2', CX)
      liftLine.setAttribute('y2', liftStartY - liftPx)

      const lhSize = 8
      liftHead.setAttribute('points', `${CX - lhSize},${liftStartY - liftPx + lhSize} ${CX},${liftStartY - liftPx} ${CX + lhSize},${liftStartY - liftPx + lhSize}`)
      liftLabel.setAttribute('x', CX + 28)
      liftLabel.setAttribute('y', liftStartY - liftPx * 0.5 + 4)
      liftLabel.textContent = `Lift  ${st.lift.toFixed(1)} kN`

      const dragStartX = TE_X + 15
      dragLine.setAttribute('x1', dragStartX)
      dragLine.setAttribute('y1', CY)
      dragLine.setAttribute('x2', dragStartX + dragPx)
      dragLine.setAttribute('y2', CY)

      const dhSize = 7
      dragHead.setAttribute('points', `${dragStartX + dragPx - dhSize},${CY - dhSize} ${dragStartX + dragPx},${CY} ${dragStartX + dragPx - dhSize},${CY + dhSize}`)
      dragLabel.setAttribute('x', dragStartX + dragPx * 0.5)
      dragLabel.setAttribute('y', CY - 12)
      dragLabel.textContent = `Drag  ${st.drag.toFixed(1)} kN`

      // Update HTML stats
      if (statsRef.current) {
        const els = statsRef.current
        els.lift.textContent = `${Math.max(0, st.lift).toFixed(1)} kN`
        els.drag.textContent = `${Math.max(0, st.drag).toFixed(1)} kN`
        els.pressure.textContent = `${(0.5 * 1.225 * spd * spd / 1000000).toFixed(2)} MPa`
        els.flow.textContent = st.flowState
        const pinn = 93 + Math.sin(performance.now() * 0.0005) * 2 + Math.abs(aoaRad) * 7
        els.pinn.textContent = `${Math.min(99.9, pinn).toFixed(1)}%`
        const conv = Math.min(99.5, 85 + spd * 0.07 + Math.abs(aoaRad) * 20)
        els.convergence.textContent = `${conv.toFixed(1)}%`
      }

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animRef.current)
      // Clean up DOM elements
      while (svg.firstChild) svg.removeChild(svg.firstChild)
    }
  }, [])

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: 'relative', width: '100%', borderRadius: 10, overflow: 'hidden' }}>
        <svg ref={svgRef} viewBox="0 0 1000 500" style={{ width: '100%', display: 'block', background: '#070a14' }}>
          <defs>
            <linearGradient id="lowP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(40, 140, 255, 0)" />
              <stop offset="40%" stopColor="rgba(40, 140, 255, 0.25)" />
              <stop offset="100%" stopColor="rgba(40, 140, 255, 0)" />
            </linearGradient>
            <linearGradient id="highP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 150, 50, 0)" />
              <stop offset="50%" stopColor="rgba(255, 150, 50, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 150, 50, 0)" />
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
          { label: 'Lift', key: 'lift', icon: '↑', color: '#64c8ff' },
          { label: 'Drag', key: 'drag', icon: '→', color: '#C4956A' },
          { label: 'Pressure', key: 'pressure', icon: '', color: '#A09CC8' },
          { label: 'Flow State', key: 'flow', icon: '', color: '#64c8ff' },
          { label: 'PINN Pred.', key: 'pinn', icon: '', color: '#C4956A' },
          { label: 'Convergence', key: 'convergence', icon: '', color: '#A09CC8' },
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
              {s.key === 'flow' ? '—' : '0.0 ' + (s.key === 'lift' || s.key === 'drag' ? 'kN' : s.key === 'pressure' ? 'MPa' : '%')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
