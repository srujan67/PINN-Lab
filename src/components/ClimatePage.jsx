import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import './Applications.css'

const c = '#88C0B8'
const c2 = '#E07840'

const sections = [
  {
    num: '01', label: 'Engineering Problem', color: c,
    lines: [
      'Numerical weather models require dense sensor networks and massive computation.',
      'Gaps in observational data lead to forecast drift beyond a few days, making long-term prediction unreliable.',
      'Traditional data assimilation methods struggle with sparse atmospheric measurements over oceans and polar regions.',
      'Coupled ocean–atmosphere models demand exascale computing resources for operationally useful resolution.',
      'This limits our ability to predict extreme weather events with sufficient lead time for effective preparation.',
    ],
  },
  {
    num: '02', label: 'Physics Used', color: c2,
    lines: [
      'The Navier–Stokes equations coupled with the thermodynamic energy equation govern atmospheric flow.',
      'Key parameters: Rossby number (Coriolis vs inertial), Richardson number (turbulence), Brunt–Väisälä frequency (stratification).',
      'The thermodynamic equation tracks potential temperature advection, radiation, and latent heating from phase changes.',
      'Hydrostatic balance approximates vertical motion in large-scale flows, while non-hydrostatic effects dominate convection.',
      'Surface energy and momentum fluxes couple the atmosphere to the underlying ocean and land surfaces.',
    ],
  },
  {
    num: '03', label: 'Why Traditional AI Struggles', color: c,
    lines: [
      'Statistical downscaling and pure ML weather models frequently violate energy conservation.',
      'Generating unrealistic precipitation patterns and temperature distributions over multi-week forecasts.',
      'Black-box emulators trained on reanalysis data fail to generalise to unseen climate regimes and extreme events.',
      'Data-driven approaches cannot guarantee physical consistency across the coupled atmosphere–ocean system.',
      'Training requires petabytes of observational and reanalysis data with no built-in physics safeguards.',
    ],
  },
  {
    num: '04', label: 'Why PINNs Work', color: c2,
    lines: [
      'PINNs assimilate sparse observational data while respecting thermodynamic and fluid conservation laws.',
      'Producing physically consistent forecasts without requiring full-grid numerical simulation.',
      'The PDE residual provides strong supervision at every collocation point, eliminating the need for dense training data.',
      'PINNs can incorporate satellite radiance measurements directly as soft constraints without complex operators.',
      'Training converges efficiently for regional domains, enabling rapid model spin-up for extreme event forecasting.',
    ],
  },
  {
    num: '05', label: 'Real Applications', color: c,
    lines: [
      'Hurricane track and intensity prediction, ocean circulation modelling, atmospheric boundary layer parametrisation.',
      'Sea-ice dynamics forecasting, urban microclimate simulation, and renewable energy resource assessment.',
      'Wildfire smoke transport modelling — predicting aerosol dispersal with coupled fire–atmosphere dynamics.',
      'Climate downscaling — bridging coarse global model output to kilometre-scale resolution for impact studies.',
      'Carbon cycle data assimilation — constraining sources and sinks of CO₂ and methane from sparse flux tower networks.',
    ],
  },
]

const orgs = [
  { name: 'ECMWF', initials: 'ECMWF', color: c },
  { name: 'NOAA', initials: 'NOAA', color: c2 },
  { name: 'NCAR', initials: 'NCAR', color: c },
  { name: 'MIT Lorenz Center', initials: 'MIT', color: c2 },
  { name: 'ETH Zurich', initials: 'ETH', color: c },
  { name: 'Met Office', initials: 'MET', color: c2 },
]

const keyVars = [
  { sym: 'θ', desc: 'Potential temperature', color: c },
  { sym: 'κ', desc: 'Thermal diffusivity', color: c2 },
  { sym: 'Q', desc: 'Heating rate', color: c },
  { sym: 'cₚ', desc: 'Specific heat capacity', color: c },
  { sym: 'Ro', desc: 'Rossby number', color: c2 },
  { sym: 'Ri', desc: 'Richardson number', color: c },
  { sym: 'N', desc: 'Brunt–Väisälä frequency', color: c2 },
]

export default function ClimatePage({ onNavigateToExplore }) {
  const [tempGrad, setTempGrad] = useState(15)
  const [rotationRate, setRotationRate] = useState(1)

  return (
    <div className="app-page">

      {/* ═══════════════════════════════════════
          HEADER — Title + Subtitle + Info Cards + Scroll Indicator
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 30px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', '--color-accent': '#6AB0A8' }}>
        {/* Subtle animated background — weather contour lines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03 }}>
          <svg viewBox="0 0 1440 600" style={{ width: '100%', height: '100%' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.path
                key={i}
                d={`M-100,${60 + i * 110} Q200,${140 + i * 50 + Math.sin(i) * 30} 500,${60 + i * 110} T1100,${60 + i * 110} T1540,${100 + i * 110}`}
                fill="none"
                stroke="#88C0B8"
                strokeWidth={0.6}
                animate={{ d: [
                  `M-100,${60 + i * 110} Q200,${140 + i * 50 + Math.sin(i) * 30} 500,${60 + i * 110} T1100,${60 + i * 110} T1540,${100 + i * 110}`,
                  `M-100,${80 + i * 110} Q200,${100 + i * 50 + Math.sin(i) * 30} 500,${80 + i * 110} T1100,${80 + i * 110} T1540,${60 + i * 110}`,
                ]}}
                transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
              />
            ))}
          </svg>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(136,192,184,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(224,120,64,0.06) 0%, transparent 50%)',
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
              Climate{' '}
              <span className="gradient-text-blue">& Weather</span>
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
              Physics-Informed Neural Networks for Climate Modelling
            </motion.p>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}
            >
              {[
                { label: 'Primary Physics', value: 'Thermodynamics + Fluid Dynamics' },
                { label: 'Industry', value: 'Weather & Climate Modelling' },
                { label: 'PINN Advantage', value: 'Physics-Consistent Assimilation' },
                { label: 'Engineering Goal', value: 'High-Resolution Emulation' },
              ].map((card, i) => (
                <div key={i} style={{
                  flex: '1 1 180px', maxWidth: 210,
                  padding: '20px 24px', borderRadius: 12,
                  background: 'rgba(13, 18, 32, 0.7)',
                  border: '1px solid rgba(136,192,184,0.15)',
                  textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 10,
                    color: 'rgba(136,192,184,0.75)',
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
              Thermodynamic Energy + Navier–Stokes: conservation of heat and momentum in the atmosphere
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
              <span style={{ color: c }}>D</span>
              <span style={{ color: c2 }}>θ</span>/<span style={{ color: c }}>Dt</span>
              <span> = </span>
              <span style={{ color: c }}>κ</span>
              <span style={{ color: c }}>∇²</span>
              <span style={{ color: c2 }}>θ</span>
              <span> + </span>
              <span style={{ color: c2 }}>Q</span>/<span style={{ color: c }}>cₚ</span>
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
                The material derivative of potential temperature{' '}
                <span style={{ color: c }}>Dθ/Dt</span> describes how heat is transported and modified along air parcel trajectories.
                Thermal diffusion <span style={{ color: c }}>κ∇²θ</span> represents the smoothing of temperature gradients by molecular and turbulent mixing.
                The diabatic heating term <span style={{ color: c2 }}>Q/cₚ</span> captures radiative heating, latent heat release,
                and surface sensible heat fluxes. The Rossby number <span style={{ color: c2 }}>Ro</span> = U/(fL) measures the
                importance of Earth's rotation, while the Richardson number <span style={{ color: c }}>Ri</span> diagnoses
                atmospheric stability and turbulence.
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
          INTERACTIVE CONVECTION VISUALIZATION
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
              Interactive <span className="gradient-text-blue">Atmospheric Convection</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Adjust temperature gradient and rotation rate to see how atmospheric convection responds.
            </p>
          </motion.div>

          <div className="glass-card" style={{
            maxWidth: 900, margin: '0 auto', padding: 32,
          }}>
            <ClimateCanvas tempGrad={tempGrad} rotationRate={rotationRate} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Temperature Gradient</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{tempGrad}°C</span>
                </div>
                <input
                  type="range" min={5} max={30} value={tempGrad}
                  onChange={e => setTempGrad(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c}40 0%, ${c}40 ${((tempGrad - 5) / 25) * 100}%, rgba(255,255,255,0.08) ${((tempGrad - 5) / 25) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Rotation Rate</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c2, fontWeight: 600 }}>{rotationRate}</span>
                </div>
                <input
                  type="range" min={0} max={5} step={0.1} value={rotationRate}
                  onChange={e => setRotationRate(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c2}40 0%, ${c2}40 ${(rotationRate / 5) * 100}%, rgba(255,255,255,0.08) ${(rotationRate / 5) * 100}%, rgba(255,255,255,0.08) 100%)`,
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
              Run the thermodynamic PINN example in the interactive analyzer.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onNavigateToExplore) {
                  onNavigateToExplore('heat', { context: 'climate' })
                }
              }}
              style={{
                padding: '14px 40px', borderRadius: 10,
                background: 'linear-gradient(135deg, #88C0B8, #68A098)',
                border: 'none', color: '#fff',
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(136,192,184,0.3)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(136,192,184,0.45)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(136,192,184,0.3)'}
            >
              Try Climate Example →
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  CLIMATE SIMULATION — SVG + rAF Atmospheric Convection
// ═══════════════════════════════════════════════════════════════

function computeStats(tempGrad, rotationRate) {
  const height = 500
  const convVelocity = Math.sqrt(9.81 * tempGrad / 300 * height)
  const omega = 7.29e-5
  const f = 2 * omega * rotationRate
  const rossby = f > 0 ? convVelocity / f : Infinity
  const richardson = 9.81 * 0.01 / (convVelocity * convVelocity / (height * height))
  const pinn = 85 + Math.sin(Date.now() * 0.0005) * 3 + (tempGrad / 30) * 10
  const conv = Math.min(99.5, 80 + tempGrad * 0.4 + rotationRate * 2)
  return { convVelocity, rossby, richardson, pinn, conv }
}

function ClimateCanvas({ tempGrad, rotationRate }) {
  const svgRef = useRef(null)
  const statsRef = useRef(null)
  const animRef = useRef(null)
  const propsRef = useRef({ tempGrad, rotationRate })

  useEffect(() => { propsRef.current = { tempGrad, rotationRate } }, [tempGrad, rotationRate])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const VW = 1000, VH = 500
    const ns = 'http://www.w3.org/2000/svg'
    const SURFACE_Y = VH * 0.82
    const NUM_CELLS = 3
    const CELL_W = VW / NUM_CELLS

    function getStreamValue(x, y) {
      const { tempGrad: tg } = propsRef.current
      let psi = 0
      for (let c = 0; c < NUM_CELLS; c++) {
        const cx = (c + 0.5) * CELL_W
        const cy = SURFACE_Y - (SURFACE_Y * 0.55)
        const rx = CELL_W * 0.45
        const ry = SURFACE_Y * 0.48
        const nx = (x - cx) / rx
        const ny = (y - cy) / ry
        const direction = c % 2 === 0 ? 1 : -1
        psi += direction * Math.sin(Math.PI * nx) * Math.sin(Math.PI * ny) * 0.3 * (tg / 15)
      }
      return psi
    }

    function getVelocity(x, y) {
      const { rotationRate: rr } = propsRef.current
      const d = 1.5
      const psiDx = (getStreamValue(x + d, y) - getStreamValue(x - d, y)) / (2 * d)
      const psiDy = (getStreamValue(x, y + d) - getStreamValue(x, y - d)) / (2 * d)
      let u = -psiDy * 6
      let v = psiDx * 6
      const cor = rr * 0.08
      const uRot = -cor * v
      const vRot = cor * u
      u += uRot; v += vRot
      return { u, v }
    }

    while (svg.firstChild) svg.removeChild(svg.firstChild)

    // ─── Defs ───
    const defs = document.createElementNS(ns, 'defs')

    const tgGrad = document.createElementNS(ns, 'linearGradient')
    tgGrad.id = 'tmpGrad'
    tgGrad.setAttribute('x1','0'); tgGrad.setAttribute('y1','1')
    tgGrad.setAttribute('x2','0'); tgGrad.setAttribute('y2','0')
    ;[['0%','rgba(224,120,64,0.35)'],['30%','rgba(200,160,80,0.2)'],['65%','rgba(136,192,184,0.12)'],['100%','rgba(60,100,200,0.25)']].forEach(([o,c])=>{
      const s=document.createElementNS(ns,'stop'); s.setAttribute('offset',o); s.setAttribute('stop-color',c)
      tgGrad.appendChild(s)
    })
    defs.appendChild(tgGrad)

    const glow=document.createElementNS(ns,'filter')
    glow.id='gGlw'
    const gb=document.createElementNS(ns,'feGaussianBlur')
    gb.setAttribute('stdDeviation','2.5'); gb.setAttribute('result','blur')
    const merge=document.createElementNS(ns,'feMerge')
    const mn1=document.createElementNS(ns,'feMergeNode'); mn1.setAttribute('in','blur')
    const mn2=document.createElementNS(ns,'feMergeNode'); mn2.setAttribute('in','SourceGraphic')
    merge.appendChild(mn1); merge.appendChild(mn2)
    glow.appendChild(gb); glow.appendChild(merge)
    defs.appendChild(glow)

    const cGrad=document.createElementNS(ns,'radialGradient')
    cGrad.id='cGrd'
    ;[['0%','rgba(230,240,250,0.7)'],['50%','rgba(200,215,235,0.35)'],['100%','rgba(180,200,220,0)']].forEach(([o,c])=>{
      const s=document.createElementNS(ns,'stop'); s.setAttribute('offset',o); s.setAttribute('stop-color',c)
      cGrad.appendChild(s)
    })
    defs.appendChild(cGrad)
    svg.insertBefore(defs, svg.firstChild)

    // ─── Background temp gradient ───
    const bg=document.createElementNS(ns,'rect')
    bg.setAttribute('x','0'); bg.setAttribute('y','0')
    bg.setAttribute('width',VW); bg.setAttribute('height',SURFACE_Y)
    bg.setAttribute('fill','url(#tmpGrad)'); bg.setAttribute('pointer-events','none')
    svg.appendChild(bg)

    // ─── Surface ───
    const sfc=document.createElementNS(ns,'rect')
    sfc.setAttribute('x','0'); sfc.setAttribute('y',SURFACE_Y)
    sfc.setAttribute('width',VW); sfc.setAttribute('height',VH-SURFACE_Y)
    sfc.setAttribute('fill','#1a2a1a')
    sfc.setAttribute('stroke','rgba(136,192,184,0.15)'); sfc.setAttribute('stroke-width','1')
    svg.appendChild(sfc)

    const sfcTex=document.createElementNS(ns,'path')
    sfcTex.setAttribute('fill','none'); sfcTex.setAttribute('stroke','rgba(136,192,184,0.08)')
    sfcTex.setAttribute('stroke-width','1')
    let stP=''
    for(let i=0;i<=200;i++){
      const sx=(i/200)*VW, sy=SURFACE_Y+4+Math.sin(i*0.2)*3+Math.sin(i*0.07)*6
      stP+=(i===0?`M ${sx},${sy}`:` L ${sx},${sy}`)
    }
    sfcTex.setAttribute('d',stP); svg.appendChild(sfcTex)

    // ─── Cell edges (rise/sink per convection cell) ───
    const cellEdges=[]
    for(let c=0;c<NUM_CELLS;c++){
      const dir=c%2===0?1:-1
      cellEdges.push({
        riseX: dir>0?c*CELL_W+CELL_W*0.15:c*CELL_W+CELL_W*0.85,
        sinkX: dir>0?c*CELL_W+CELL_W*0.85:c*CELL_W+CELL_W*0.15
      })
    }

    // ─── Thermal plumes (rising warm columns) ───
    const plumeEls=[]
    cellEdges.forEach((ed,ci)=>{
      for(let lay=0;lay<6;lay++){
        const p=document.createElementNS(ns,'path')
        p.setAttribute('fill','none')
        p.setAttribute('stroke',`rgba(224,140,60,${0.04+lay*0.035})`)
        p.setAttribute('stroke-width',`${2+lay*1.8}`)
        p.setAttribute('stroke-linecap','round')
        svg.appendChild(p)
        plumeEls.push({el:p,baseX:ed.riseX,lay,ci})
      }
    })

    // ─── Sinking cold streams ───
    const sinkEls=[]
    cellEdges.forEach((ed,ci)=>{
      for(let lay=0;lay<4;lay++){
        const p=document.createElementNS(ns,'path')
        p.setAttribute('fill','none')
        p.setAttribute('stroke',`rgba(60,120,210,${0.03+lay*0.03})`)
        p.setAttribute('stroke-width',`${1.5+lay*1.2}`)
        p.setAttribute('stroke-linecap','round')
        svg.appendChild(p)
        sinkEls.push({el:p,baseX:ed.sinkX,lay,ci})
      }
    })

    // ─── Clouds (7 puffs that drift and morph) ───
    const NUM_CLOUDS=7
    const clouds=[]
    for(let i=0;i<NUM_CLOUDS;i++){
      const g=document.createElementNS(ns,'g')
      const cx=(i/NUM_CLOUDS)*VW*0.9+VW*0.05+(Math.random()-0.5)*30
      const cy=18+Math.random()*50
      const w=55+Math.random()*70; const h=22+Math.random()*25
      const numPuffs=3+Math.floor(Math.random()*3)
      const puffs=[]
      for(let p=0;p<numPuffs;p++){
        const e=document.createElementNS(ns,'ellipse')
        const ox=(p/numPuffs-0.5)*w*0.7+(Math.random()-0.5)*12
        const oy=(Math.random()-0.5)*12
        const rx=w*(0.25+Math.random()*0.2); const ry=h*(0.25+Math.random()*0.2)
        e.setAttribute('cx',cx+ox); e.setAttribute('cy',cy+oy)
        e.setAttribute('rx',rx); e.setAttribute('ry',ry)
        e.setAttribute('fill','url(#cGrd)')
        e.setAttribute('opacity',(0.25+Math.random()*0.35).toString())
        g.appendChild(e)
        puffs.push({el:e,ox,oy,rx,ry})
      }
      svg.appendChild(g)
      clouds.push({g,cx,cy,w,h,puffs,phase:i*1.3,speed:0.1+Math.random()*0.15,bSpeed:0.6+Math.random()*0.3,dAmp:20+Math.random()*25})
    }

    // ─── Streamlines (pulsing) ───
    const NUM_STREAMS=20
    const streamEls=[]
    for(let i=0;i<NUM_STREAMS;i++){
      const p=document.createElementNS(ns,'path')
      p.setAttribute('fill','none')
      p.setAttribute('stroke','rgba(136,192,184,0.2)')
      p.setAttribute('stroke-width','1.2')
      p.setAttribute('stroke-dasharray','5 10')
      svg.appendChild(p)
      streamEls.push({el:p,sx:30+(i%4)*250,sy:20+(i/(NUM_STREAMS-1))*(SURFACE_Y-30)})
    }

    // ─── Particles (200 circulating tracers) ───
    const NUM_PARTICLES=200
    const parts=[]; const partEls=[]
    for(let i=0;i<NUM_PARTICLES;i++){
      const p={x:Math.random()*VW,y:10+Math.random()*(SURFACE_Y-20),size:1+Math.random()*2.5,phase:Math.random()*Math.PI*2}
      parts.push(p)
      const c=document.createElementNS(ns,'circle')
      c.setAttribute('r',p.size); c.setAttribute('fill','#E07840')
      c.setAttribute('opacity','0.8'); c.setAttribute('filter','url(#gGlw)')
      svg.appendChild(c); partEls.push(c)
    }

    // ─── Thermal bubbles (periodic rising groups) ───
    const bubblePool=[]
    let lastBubbleTime=0
    function spawnBubble(time){
      const ci=Math.floor(Math.random()*NUM_CELLS)
      const bx=cellEdges[ci].riseX+(Math.random()-0.5)*20
      const num=8+Math.floor(Math.random()*8)
      const group=[]
      for(let i=0;i<num;i++){
        const c=document.createElementNS(ns,'circle')
        const ox=(Math.random()-0.5)*15; const oy=-Math.random()*10
        const sz=2+Math.random()*3
        c.setAttribute('r',sz.toString()); c.setAttribute('fill','#E07840')
        c.setAttribute('opacity','0.9'); c.setAttribute('filter','url(#gGlw)')
        c.setAttribute('cx',bx+ox); c.setAttribute('cy',SURFACE_Y+oy)
        svg.appendChild(c)
        group.push({el:c,ox,oy,sz,baseX:bx,baseY:SURFACE_Y,life:0,maxLife:3+Math.random()*2,phase:Math.random()*Math.PI*2})
      }
      bubblePool.push({particles:group,spawnTime:time})
    }

    // ─── Wind arrows ───
    const NUM_ARROWS=10
    const arrowEls=[]
    for(let i=0;i<NUM_ARROWS;i++){
      const g=document.createElementNS(ns,'g')
      const l=document.createElementNS(ns,'line')
      l.setAttribute('stroke','rgba(136,192,184,0.2)')
      l.setAttribute('stroke-width','1.2'); l.setAttribute('stroke-linecap','round')
      const h=document.createElementNS(ns,'polygon')
      h.setAttribute('fill','rgba(136,192,184,0.25)')
      g.appendChild(l); g.appendChild(h); svg.appendChild(g)
      arrowEls.push({el:g,line:l,head:h,t:i/NUM_ARROWS})
    }

    // ─── Labels ───
    const mkL=(x,y,txt,col,sz)=>{
      const el=document.createElementNS(ns,'text')
      el.setAttribute('x',x); el.setAttribute('y',y)
      el.setAttribute('fill',col); el.setAttribute('font-size',sz||'10')
      el.setAttribute('font-family','system-ui'); el.setAttribute('font-weight','600')
      el.textContent=txt
      if(typeof x==='number'&&x>500)el.setAttribute('text-anchor','end')
      svg.appendChild(el); return el
    }
    mkL(14,22,'LIVE OUTPUT','rgba(136,192,184,0.12)','18')
    mkL(940,SURFACE_Y-12,'WARM (surface)','rgba(224,120,64,0.3)')
    mkL(940,22,'COOL (upper atmosphere)','rgba(60,100,200,0.3)')

    // ─── Animation loop (60fps) ───
    const loop=(time)=>{
      const {tempGrad:tg,rotationRate:rr}=propsRef.current
      const sf=Math.max(0.2,tg/15)
      const ta=time*0.001

      // 1. Thermal plumes — wavy rising columns
      for(const p of plumeEls){
        const xOff=Math.sin(ta*1.2+p.ci+p.lay)*10
        let d=''
        for(let s=0;s<22;s++){
          const t=s/22
          const px=p.baseX+xOff+Math.sin(t*10+ta*1.8+p.lay)*6
          const py=SURFACE_Y-(SURFACE_Y-8)*t
          d+=(s===0?`M ${px},${py}`:` L ${px},${py}`)
        }
        p.el.setAttribute('d',d)
        const a=0.04+p.lay*0.035+Math.sin(ta*0.6+p.ci)*0.015
        p.el.setAttribute('stroke',`rgba(224,140,60,${a})`)
      }

      // 2. Sinking cold streams
      for(const p of sinkEls){
        let d=''
        for(let s=0;s<18;s++){
          const t=s/18
          const px=p.baseX+Math.sin(t*8+ta*1.2+p.lay)*5
          const py=10+(SURFACE_Y-10)*t
          d+=(s===0?`M ${px},${py}`:` L ${px},${py}`)
        }
        p.el.setAttribute('d',d)
        const a=0.03+p.lay*0.03+Math.sin(ta*0.5+p.ci)*0.012
        p.el.setAttribute('stroke',`rgba(60,120,210,${a})`)
      }

      // 3. Clouds — drift and morph continuously
      for(const cl of clouds){
        const driftX=Math.sin(ta*cl.speed+cl.phase)*cl.dAmp
        const driftY=Math.sin(ta*cl.speed*0.7+cl.phase*1.4)*5
        const morph=1+Math.sin(ta*cl.bSpeed+cl.phase)*0.1
        for(let pi=0;pi<cl.puffs.length;pi++){
          const pu=cl.puffs[pi]
          const nx=cl.cx+driftX+pu.ox*morph; const ny=cl.cy+driftY+pu.oy*morph
          pu.el.setAttribute('cx',nx); pu.el.setAttribute('cy',ny)
          pu.el.setAttribute('rx',pu.rx*morph); pu.el.setAttribute('ry',pu.ry*morph)
          const op=0.3+0.3*Math.sin(ta*cl.bSpeed*0.5+cl.phase+pi)
          pu.el.setAttribute('opacity',Math.min(0.8,op).toString())
        }
      }

      // 4. Streamlines — pulse with flow speed
      for(let si=0;si<NUM_STREAMS;si++){
        const st=streamEls[si]
        let x=st.sx,y=st.sy; let d=`M ${x},${y}`
        for(let s=0;s<35;s++){
          const vel=getVelocity(x,y)
          x+=vel.u*6; y+=vel.v*6
          if(x<-10||x>VW+10||y<0||y>SURFACE_Y)break
          d+=` L ${x},${y}`
        }
        st.el.setAttribute('d',d)
        const pulse=0.4+Math.sin(ta*0.5+si*0.3)*0.4
        st.el.setAttribute('opacity',(0.06+pulse*0.15).toString())
        st.el.setAttribute('stroke-dashoffset',(-ta*25*sf).toString())
      }

      // 5. Particles — circulate with thermal buoyancy
      for(let i=0;i<NUM_PARTICLES;i++){
        const p=parts[i]
        const vel=getVelocity(p.x,p.y)
        const hf=p.y/SURFACE_Y
        const thermal=(1-hf)*tg*0.015*sf
        p.x+=vel.u*sf*0.5+Math.sin(ta*0.3+p.phase)*0.1
        p.y+=vel.v*sf*0.5-thermal
        if(p.y<SURFACE_Y*0.08)p.y+=0.4
        if(p.x<-20||p.x>VW+20||p.y<-10||p.y>SURFACE_Y+5){
          p.x=50+Math.random()*(VW-100)
          p.y=SURFACE_Y*(0.2+Math.random()*0.5)
        }
        partEls[i].setAttribute('cx',p.x); partEls[i].setAttribute('cy',p.y)
        const r=Math.round(200+(1-hf)*55)
        const g=Math.round(100+hf*80)
        const b=Math.round(80+hf*140)
        partEls[i].setAttribute('fill',`rgb(${r},${g},${b})`)
        const bright=0.4+sf*0.4+Math.sin(ta+p.phase)*0.1
        partEls[i].setAttribute('opacity',Math.min(1,bright).toString())
      }

      // 6. Thermal bubbles — spawn and rise
      if(time-lastBubbleTime>2000+Math.random()*3000){
        lastBubbleTime=time
        spawnBubble(time)
      }
      for(let bi=bubblePool.length-1;bi>=0;bi--){
        const bg=bubblePool[bi]; let allDead=true
        for(const bp of bg.particles){
          const age=(time-bg.spawnTime)/1000
          if(age<bp.maxLife){
            allDead=false
            const progress=age/bp.maxLife
            const ex=bp.baseX+bp.ox+Math.sin(age*2+bp.phase)*8
            const ey=bp.baseY+bp.oy-(SURFACE_Y-20)*progress
            bp.el.setAttribute('cx',ex); bp.el.setAttribute('cy',ey)
            const fade=1-progress
            bp.el.setAttribute('opacity',(fade*0.9).toString())
            bp.el.setAttribute('r',(bp.sz*(1+progress*0.5)).toString())
          }else bp.el.setAttribute('opacity','0')
        }
        if(allDead){
          for(const bp of bg.particles) svg.removeChild(bp.el)
          bubblePool.splice(bi,1)
        }
      }

      // 7. Wind arrows — follow convection cell pattern
      for(const arr of arrowEls){
        arr.t+=0.0015*sf
        if(arr.t>1)arr.t-=1
        const sx=arr.t*VW; const sy=SURFACE_Y*0.4
        const vel=getVelocity(sx,sy)
        const angle=Math.atan2(vel.v,vel.u)
        const len=18
        arr.line.setAttribute('x1',sx); arr.line.setAttribute('y1',sy)
        arr.line.setAttribute('x2',sx+Math.cos(angle)*len); arr.line.setAttribute('y2',sy+Math.sin(angle)*len)
        const hs=5
        const hx=sx+Math.cos(angle)*len; const hy=sy+Math.sin(angle)*len
        const a1=angle+2.3; const a2=angle-2.3
        arr.head.setAttribute('points',`${hx},${hy} ${hx+Math.cos(a1)*hs},${hy+Math.sin(a1)*hs} ${hx+Math.cos(a2)*hs},${hy+Math.sin(a2)*hs}`)
        const aa=0.08+Math.min(1,Math.abs(vel.u)*0.3)*0.3
        arr.line.setAttribute('stroke',`rgba(136,192,184,${aa})`)
        arr.head.setAttribute('fill',`rgba(136,192,184,${aa+0.05})`)
      }

      // 8. Live stats
      if(statsRef.current){
        const els=statsRef.current; const st=computeStats(tg,rr)
        els.tempGrad.textContent=`${tg.toFixed(0)} °C`
        els.convVelocity.textContent=`${st.convVelocity.toFixed(1)} m/s`
        els.rossby.textContent=st.rossby===Infinity?'∞':st.rossby<1000?`${st.rossby.toFixed(2)}`:`${(st.rossby/1000).toFixed(1)}k`
        els.richardson.textContent=`${st.richardson.toFixed(3)}`
        els.pinn.textContent=`${Math.min(99.9,85+Math.sin(time*0.0005)*3+(tg/30)*10).toFixed(1)}%`
        els.convergence.textContent=`${Math.min(99.5,80+tg*0.4+rr*2).toFixed(1)}%`
      }

      animRef.current=requestAnimationFrame(loop)
    }
    animRef.current=requestAnimationFrame(loop)
    return ()=>{cancelAnimationFrame(animRef.current)}
  },[])

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: 'relative', width: '100%', borderRadius: 10, overflow: 'hidden' }}>
        <svg ref={svgRef} viewBox="0 0 1000 500" style={{ width: '100%', display: 'block', background: '#070a14' }} />
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
          { label: 'Temp. Gradient', key: 'tempGrad', icon: '\u0394', color: c },
          { label: 'Conv. Velocity', key: 'convVelocity', icon: '\u2191', color: c2 },
          { label: 'Rossby #', key: 'rossby', icon: 'Ro', color: c },
          { label: 'Richardson #', key: 'richardson', icon: 'Ri', color: c2 },
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
              0.0
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
