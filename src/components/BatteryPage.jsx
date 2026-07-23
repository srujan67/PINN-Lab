import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import './Applications.css'

const c = '#A09CC8'
const c2 = '#88C0B8'

const sections = [
  {
    num: '01', label: 'Engineering Problem', color: c,
    lines: [
      'Battery degradation models rely on empirical curve-fitting that fails under novel charge cycles.',
      'First-principles electrochemical models are too slow for real-time battery management systems.',
    ],
  },
  {
    num: '02', label: 'Physics Used', color: c2,
    lines: [
      'Porous electrode theory with concentrated solution theory governs lithium-ion transport.',
      'Key parameters: lithium diffusion coefficient, electrolyte conductivity, transference number, exchange current density.',
    ],
  },
  {
    num: '03', label: 'Why Traditional AI Struggles', color: c,
    lines: [
      'Data-driven capacity fade models trained on historical cycling data cannot predict degradation under fast-charging or extreme-temperature scenarios never seen during training.',
    ],
  },
  {
    num: '04', label: 'Why PINNs Work', color: c2,
    lines: [
      'PINNs embed the porous electrode and lithium diffusion equations into the network, predicting internal state distributions and capacity fade from surface voltage and current measurements alone.',
    ],
  },
  {
    num: '05', label: 'Real Applications', color: c,
    lines: [
      'Electric vehicle battery health estimation, fast-charging protocol optimisation, solid-state battery design, grid-scale storage lifetime prediction, thermal runaway early warning.',
    ],
  },
]

const orgs = [
  { name: 'MIT Battery Lab', initials: 'MIT', color: c },
  { name: 'Stanford Energy Storage', initials: 'SES', color: c2 },
  { name: 'Imperial Electrochemistry', initials: 'ICE', color: c },
  { name: 'NREL', initials: 'NREL', color: c2 },
  { name: 'Tesla', initials: 'TSLA', color: c },
  { name: 'Panasonic', initials: 'PAN', color: c2 },
]

const keyVars = [
  { sym: 'c', desc: 'Lithium concentration', color: c },
  { sym: 'D', desc: 'Diffusion coefficient', color: c2 },
  { sym: 'j', desc: 'Current density', color: c },
  { sym: 'F', desc: 'Faraday constant', color: c },
  { sym: 'SoC', desc: 'State of charge', color: c2 },
  { sym: 'κ', desc: 'Ionic conductivity', color: c },
  { sym: 't₊', desc: 'Transference number', color: c },
]

export default function BatteryPage({ onNavigateToExplore }) {
  const [cRate, setCRate] = useState(1)
  const [temperature, setTemperature] = useState(25)

  return (
    <div className="app-page">

      {/* ═══════════════════════════════════════
          HEADER — Title + Subtitle + Info Cards + Scroll Indicator
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 30px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', '--color-accent': '#5B8DEF' }}>
        {/* Subtle animated background — ion particle diffusion */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04 }}>
          <svg viewBox="0 0 1440 600" style={{ width: '100%', height: '100%' }}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <motion.circle
                key={i}
                cx={300 + i * 170}
                cy={200 + Math.sin(i * 1.5) * 100}
                r={3 + Math.sin(i * 2) * 1.5}
                fill="#5B8DEF"
                animate={{
                  cx: [300 + i * 170, 300 + i * 170 + Math.sin(i * 1.3) * 80, 300 + i * 170],
                  cy: [200 + Math.sin(i * 1.5) * 100, 300 + Math.sin(i * 2.5) * 80, 200 + Math.sin(i * 1.5) * 100],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 14 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
              />
            ))}
          </svg>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(91,141,239,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(136,192,184,0.06) 0%, transparent 50%)',
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
              Battery{' '}
              <span className="gradient-text-blue">Technology</span>
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
              Physics-Informed Neural Networks for Energy Storage Systems
            </motion.p>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}
            >
              {[
                { label: 'Primary Physics', value: 'Electrochemical Diffusion' },
                { label: 'Industry', value: 'Electric Vehicles & Storage' },
                { label: 'PINN Advantage', value: 'Internal State Estimation' },
                { label: 'Engineering Goal', value: 'Real-Time Degradation Prediction' },
              ].map((card, i) => (
                <div key={i} style={{
                  flex: '1 1 180px', maxWidth: 210,
                  padding: '20px 24px', borderRadius: 12,
                  background: 'rgba(13, 18, 32, 0.7)',
                  border: '1px solid rgba(91,141,239,0.15)',
                  textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 10,
                    color: 'rgba(91,141,239,0.75)',
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
              Porous Electrode Theory + Fick's Law of Diffusion
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
              <span style={{ color: c }}>∂</span>
              <span style={{ color: c2 }}>c</span>/<span style={{ color: c2 }}>∂t</span>
              <span> = </span>
              <span style={{ color: c }}>∇</span>·<span>(</span>
              <span style={{ color: c2 }}>D</span>
              <span style={{ color: c }}>∇</span>
              <span style={{ color: c2 }}>c</span>
              <span>) + </span>
              <span style={{ color: c }}>j</span>/<span>(</span>
              <span style={{ color: c2 }}>F</span>
              <span>)</span>
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
                Fick's law describes how lithium ions diffuse down concentration gradients within the porous electrodes.
                The current density <span style={{ color: c }}>j</span> drives ionic flux across the electrolyte, modulated by the
                transference number <span style={{ color: c }}>t₊</span> and ionic conductivity <span style={{ color: c }}>κ</span>.
                The Faraday constant <span style={{ color: c2 }}>F</span> relates charge to molar flux. State of charge
                <span style={{ color: c2 }}> SoC</span> integrates the current over time, tracking how much lithium is stored
                in each electrode. Together these equations capture the coupled electrochemical-thermal behaviour
                governing battery performance and degradation.
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
          INTERACTIVE BATTERY VISUALIZATION
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
              Interactive <span className="gradient-text-blue">Battery Simulation</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Adjust C-Rate and temperature to observe lithium-ion diffusion across the cell.
            </p>
          </motion.div>

          <div className="glass-card" style={{
            maxWidth: 900, margin: '0 auto', padding: 32,
          }}>
            <BatteryCanvas cRate={cRate} temperature={temperature} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>C-Rate</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{cRate.toFixed(1)}C</span>
                </div>
                <input
                  type="range" min={0.1} max={5} step={0.1} value={cRate}
                  onChange={e => setCRate(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c}40 0%, ${c}40 ${((cRate - 0.1) / 4.9) * 100}%, rgba(255,255,255,0.08) ${((cRate - 0.1) / 4.9) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Temperature</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{temperature}°C</span>
                </div>
                <input
                  type="range" min={0} max={60} value={temperature}
                  onChange={e => setTemperature(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c2}40 0%, ${c2}40 ${(temperature / 60) * 100}%, rgba(255,255,255,0.08) ${(temperature / 60) * 100}%, rgba(255,255,255,0.08) 100%)`,
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
              Run the battery chemistry PINN example in the interactive analyzer.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onNavigateToExplore) {
                  onNavigateToExplore('idealgas', { context: 'battery' })
                }
              }}
              style={{
                padding: '14px 40px', borderRadius: 10,
                background: 'linear-gradient(135deg, #A09CC8, #887BB5)',
                border: 'none', color: '#fff',
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(160,156,200,0.3)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(160,156,200,0.45)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(160,156,200,0.3)'}
            >
              Try Battery Example →
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  BATTERY SIMULATION — SVG + rAF
// ═══════════════════════════════════════════════════════════════

function computeStats(time, cRate, temp) {
  const soc = 50 + 40 * Math.sin(time * 0.001 * cRate)
  const concentration = 1000 + 500 * Math.sin(time * 0.001 * cRate)
  const voltage = 3.7 + 0.3 * Math.sin(time * 0.001 * cRate)
  const capacityFade = 2 + cRate * 0.5 + (temp - 25) * 0.05
  return { soc, concentration, voltage, capacityFade }
}

function BatteryCanvas({ cRate, temperature }) {
  const svgRef = useRef(null)
  const statsRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)
  const propsRef = useRef({ cRate, temperature })
  const timeRef = useRef(0)

  useEffect(() => { propsRef.current = { cRate, temperature } }, [cRate, temperature])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const VW = 1000, VH = 500
    const CY = VH / 2

    // Battery cell geometry
    const CELL_TOP = 110
    const CELL_BOT = 390
    const CELL_H = CELL_BOT - CELL_TOP

    const ANODE_X1 = 100, ANODE_X2 = 330
    const SEP_X1 = 390, SEP_X2 = 470
    const CATHODE_X1 = 530, CATHODE_X2 = 900

    const ns = 'http://www.w3.org/2000/svg'

    // ─── Glow filter ───
    const defs = document.createElementNS(ns, 'defs')
    const glow = document.createElementNS(ns, 'filter')
    glow.id = 'batteryGlow'
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

    const gradLi = document.createElementNS(ns, 'linearGradient')
    gradLi.id = 'liGrad'
    gradLi.setAttribute('x1', '0'); gradLi.setAttribute('y1', '0')
    gradLi.setAttribute('x2', '1'); gradLi.setAttribute('y2', '0')
    const gs1 = document.createElementNS(ns, 'stop')
    gs1.setAttribute('offset', '0%'); gs1.setAttribute('stop-color', 'rgba(91,141,239,0.15)')
    const gs2 = document.createElementNS(ns, 'stop')
    gs2.setAttribute('offset', '50%'); gs2.setAttribute('stop-color', 'rgba(136,192,184,0.25)')
    const gs3 = document.createElementNS(ns, 'stop')
    gs3.setAttribute('offset', '100%'); gs3.setAttribute('stop-color', 'rgba(91,141,239,0.15)')
    gradLi.appendChild(gs1); gradLi.appendChild(gs2); gradLi.appendChild(gs3)
    defs.appendChild(gradLi)
    svg.appendChild(defs)

    // ─── Grid background ───
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

    // ─── Battery cell background ───
    const cellBg = document.createElementNS(ns, 'rect')
    cellBg.setAttribute('x', String(ANODE_X1))
    cellBg.setAttribute('y', String(CELL_TOP))
    cellBg.setAttribute('width', String(CATHODE_X2 - ANODE_X1))
    cellBg.setAttribute('height', String(CELL_H))
    cellBg.setAttribute('fill', 'rgba(255,255,255,0.02)')
    cellBg.setAttribute('rx', '6')
    svg.appendChild(cellBg)

    // ─── Anode region ───
    const anodeRect = document.createElementNS(ns, 'rect')
    anodeRect.setAttribute('x', String(ANODE_X1))
    anodeRect.setAttribute('y', String(CELL_TOP))
    anodeRect.setAttribute('width', String(ANODE_X2 - ANODE_X1))
    anodeRect.setAttribute('height', String(CELL_H))
    anodeRect.setAttribute('fill', 'rgba(91,141,239,0.08)')
    anodeRect.setAttribute('stroke', 'rgba(160,156,200,0.2)')
    anodeRect.setAttribute('stroke-width', '1')
    anodeRect.setAttribute('rx', '4')
    svg.appendChild(anodeRect)

    // ─── Separator region ───
    const sepRect = document.createElementNS(ns, 'rect')
    sepRect.setAttribute('x', String(SEP_X1))
    sepRect.setAttribute('y', String(CELL_TOP))
    sepRect.setAttribute('width', String(SEP_X2 - SEP_X1))
    sepRect.setAttribute('height', String(CELL_H))
    sepRect.setAttribute('fill', 'rgba(255,255,255,0.04)')
    sepRect.setAttribute('stroke', 'rgba(255,255,255,0.08)')
    sepRect.setAttribute('stroke-width', '1')
    sepRect.setAttribute('rx', '2')
    sepRect.setAttribute('stroke-dasharray', '4 4')
    svg.appendChild(sepRect)

    // ─── Cathode region ───
    const cathodeRect = document.createElementNS(ns, 'rect')
    cathodeRect.setAttribute('x', String(CATHODE_X1))
    cathodeRect.setAttribute('y', String(CELL_TOP))
    cathodeRect.setAttribute('width', String(CATHODE_X2 - CATHODE_X1))
    cathodeRect.setAttribute('height', String(CELL_H))
    cathodeRect.setAttribute('fill', 'rgba(136,192,184,0.08)')
    cathodeRect.setAttribute('stroke', 'rgba(136,192,184,0.2)')
    cathodeRect.setAttribute('stroke-width', '1')
    cathodeRect.setAttribute('rx', '4')
    svg.appendChild(cathodeRect)

    // ─── Current collectors ───
    const ccLeft = document.createElementNS(ns, 'rect')
    ccLeft.setAttribute('x', '80')
    ccLeft.setAttribute('y', String(CELL_TOP))
    ccLeft.setAttribute('width', '20')
    ccLeft.setAttribute('height', String(CELL_H))
    ccLeft.setAttribute('fill', 'rgba(200,180,150,0.2)')
    ccLeft.setAttribute('stroke', 'rgba(200,180,150,0.3)')
    ccLeft.setAttribute('stroke-width', '1')
    ccLeft.setAttribute('rx', '2')
    svg.appendChild(ccLeft)

    const ccRight = document.createElementNS(ns, 'rect')
    ccRight.setAttribute('x', '900')
    ccRight.setAttribute('y', String(CELL_TOP))
    ccRight.setAttribute('width', '20')
    ccRight.setAttribute('height', String(CELL_H))
    ccRight.setAttribute('fill', 'rgba(200,180,150,0.2)')
    ccRight.setAttribute('stroke', 'rgba(200,180,150,0.3)')
    ccRight.setAttribute('stroke-width', '1')
    ccRight.setAttribute('rx', '2')
    svg.appendChild(ccRight)

    // ─── Region labels ───
    const labels = [
      { text: 'Anode', x: (ANODE_X1 + ANODE_X2) / 2, y: CELL_BOT + 22, color: c },
      { text: 'Separator', x: (SEP_X1 + SEP_X2) / 2, y: CELL_BOT + 22, color: 'rgba(255,255,255,0.4)' },
      { text: 'Cathode', x: (CATHODE_X1 + CATHODE_X2) / 2, y: CELL_BOT + 22, color: c2 },
    ]
    labels.forEach(lbl => {
      const t = document.createElementNS(ns, 'text')
      t.setAttribute('x', String(lbl.x))
      t.setAttribute('y', String(lbl.y))
      t.setAttribute('fill', lbl.color)
      t.setAttribute('font-size', '11')
      t.setAttribute('font-family', 'system-ui')
      t.setAttribute('text-anchor', 'middle')
      t.setAttribute('font-weight', '600')
      t.setAttribute('opacity', '0.6')
      t.textContent = lbl.text
      svg.appendChild(t)
    })

    // ─── Concentration gradient overlay (strips) ───
    const NUM_STRIPS = 40
    const stripGroup = document.createElementNS(ns, 'g')
    stripGroup.id = 'strip-group'
    svg.appendChild(stripGroup)
    const stripEls = []
    const cellStart = ANODE_X1
    const cellEnd = CATHODE_X2
    const cellWidth = cellEnd - cellStart
    const stripW = cellWidth / NUM_STRIPS
    for (let i = 0; i < NUM_STRIPS; i++) {
      const r = document.createElementNS(ns, 'rect')
      r.setAttribute('x', String(cellStart + i * stripW))
      r.setAttribute('y', String(CELL_TOP))
      r.setAttribute('width', String(stripW + 0.5))
      r.setAttribute('height', String(CELL_H))
      r.setAttribute('fill', 'rgba(80,120,255,0.15)')
      r.setAttribute('opacity', '0.35')
      stripGroup.appendChild(r)
      stripEls.push(r)
    }

    // ─── Particles ───
    const numParticles = 70
    const particles = []
    const particleEls = []
    for (let i = 0; i < numParticles; i++) {
      const region = Math.random()
      let baseX
      if (region < 0.4) {
        baseX = ANODE_X1 + 10 + Math.random() * (ANODE_X2 - ANODE_X1 - 20)
      } else if (region < 0.55) {
        baseX = SEP_X1 + 5 + Math.random() * (SEP_X2 - SEP_X1 - 10)
      } else {
        baseX = CATHODE_X1 + 10 + Math.random() * (CATHODE_X2 - CATHODE_X1 - 20)
      }
      const p = {
        x: baseX,
        baseX,
        y: CELL_TOP + 10 + Math.random() * (CELL_H - 20),
        size: 2 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
      }
      particles.push(p)
    }
    particlesRef.current = particles

    for (let i = 0; i < numParticles; i++) {
      const cEl = document.createElementNS(ns, 'circle')
      cEl.setAttribute('r', String(particles[i].size))
      cEl.setAttribute('fill', '#88C0B8')
      cEl.setAttribute('opacity', '0.85')
      cEl.setAttribute('filter', 'url(#batteryGlow)')
      svg.appendChild(cEl)
      particleEls.push(cEl)
    }

    // ─── "LIVE OUTPUT" title ───
    const liveTitle = document.createElementNS(ns, 'text')
    liveTitle.setAttribute('x', '14')
    liveTitle.setAttribute('y', '22')
    liveTitle.setAttribute('fill', 'rgba(160,156,200,0.12)')
    liveTitle.setAttribute('font-size', '18')
    liveTitle.setAttribute('font-family', 'system-ui')
    liveTitle.setAttribute('font-weight', 'bold')
    liveTitle.textContent = 'LIVE OUTPUT'
    svg.appendChild(liveTitle)

    // ─── Ion flow arrow indication ───
    const arrowGroup = document.createElementNS(ns, 'g')
    arrowGroup.id = 'arrow-group'
    const arrowLine = document.createElementNS(ns, 'line')
    arrowLine.setAttribute('stroke', 'rgba(136,192,184,0.4)')
    arrowLine.setAttribute('stroke-width', '2')
    arrowLine.setAttribute('stroke-linecap', 'round')
    arrowGroup.appendChild(arrowLine)
    const arrowHead = document.createElementNS(ns, 'polygon')
    arrowHead.setAttribute('fill', 'rgba(136,192,184,0.5)')
    arrowGroup.appendChild(arrowHead)
    const arrowLabel = document.createElementNS(ns, 'text')
    arrowLabel.setAttribute('fill', 'rgba(136,192,184,0.5)')
    arrowLabel.setAttribute('font-size', '9')
    arrowLabel.setAttribute('font-family', 'system-ui')
    arrowLabel.setAttribute('text-anchor', 'middle')
    arrowLabel.setAttribute('font-weight', '600')
    arrowGroup.appendChild(arrowLabel)
    svg.appendChild(arrowGroup)

    // ─── Animation loop ───
    const loop = (timestamp) => {
      timeRef.current = timestamp
      const { cRate, temperature } = propsRef.current
      const soc = 50 + 40 * Math.sin(timestamp * 0.001 * cRate)
      const drift = (soc - 50) / 50 * 80
      const tempFactor = 1 + (temperature - 25) / 50

      // Update particles
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i]
        const jitter = (Math.random() - 0.5) * 0.8 * tempFactor
        const targetX = p.baseX + drift
        p.x += (targetX - p.x) * 0.04 + jitter
        p.y += (Math.random() - 0.5) * 0.6 * tempFactor
        const halfH = CELL_H * 0.45
        const midY = CELL_TOP + CELL_H / 2
        p.y = midY + Math.max(-halfH, Math.min(halfH, p.y - midY))

        particleEls[i].setAttribute('cx', String(p.x))
        particleEls[i].setAttribute('cy', String(p.y))
        const bright = 0.5 + Math.abs(drift) / 160 * 0.4
        particleEls[i].setAttribute('opacity', String(Math.min(1, bright)))
        const hue = drift > 0 ? '160,192,184' : '160,156,200'
        particleEls[i].setAttribute('fill', `rgb(${hue})`)
      }

      // Update concentration gradient strips
      const phase = (soc - 50) / 50 * Math.PI
      for (let i = 0; i < NUM_STRIPS; i++) {
        const xi = (i / NUM_STRIPS)
        const conc = 0.5 + 0.4 * Math.sin(xi * Math.PI * 2 - phase)
        const r = Math.round(50 + conc * 200)
        const g = Math.round(100 + (0.5 - Math.abs(conc - 0.5)) * 60)
        const b = Math.round(255 - conc * 200)
        stripEls[i].setAttribute('fill', `rgb(${r},${g},${b})`)
        stripEls[i].setAttribute('opacity', String(0.2 + Math.abs(conc - 0.5) * 0.3))
      }

      // Update flow arrow
      const arrowY = CELL_TOP + CELL_H / 2
      const arrowLen = Math.min(120, 30 + Math.abs(drift) * 1.2)
      const arrowX1 = (ANODE_X2 + SEP_X1) / 2
      const arrowX2 = (SEP_X2 + CATHODE_X1) / 2
      const midArrow = (arrowX1 + arrowX2) / 2
      arrowLine.setAttribute('x1', String(arrowX1))
      arrowLine.setAttribute('y1', String(arrowY))
      arrowLine.setAttribute('x2', String(arrowX2))
      arrowLine.setAttribute('y2', String(arrowY))
      const ahSize = 6
      arrowHead.setAttribute('points', `${arrowX2},${arrowY} ${arrowX2 - ahSize},${arrowY - ahSize} ${arrowX2 - ahSize},${arrowY + ahSize}`)
      arrowLabel.setAttribute('x', String(midArrow))
      arrowLabel.setAttribute('y', String(arrowY - 14))
      arrowLabel.textContent = soc > 50 ? 'Li⁺ → Anode' : 'Li⁺ → Cathode'

      // Update HTML stats
      const st = computeStats(timestamp, cRate, temperature)
      if (statsRef.current) {
        const els = statsRef.current
        els.soc.textContent = `${Math.max(0, Math.min(100, st.soc)).toFixed(1)}%`
        els.concentration.textContent = `${Math.max(0, st.concentration).toFixed(0)} mol/m³`
        els.voltage.textContent = `${st.voltage.toFixed(3)} V`
        els.capacityFade.textContent = `${Math.max(0, st.capacityFade).toFixed(2)}%`
        const pinn = 90 + Math.sin(timestamp * 0.0004) * 3 + Math.abs(soc - 50) * 0.08
        els.pinn.textContent = `${Math.min(99.9, pinn).toFixed(1)}%`
        const conv = Math.min(99.5, 88 + cRate * 1.2 + Math.abs(temperature - 25) * 0.15)
        els.convergence.textContent = `${conv.toFixed(1)}%`
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
            <linearGradient id="lowLi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(50, 100, 255, 0)" />
              <stop offset="40%" stopColor="rgba(50, 100, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(50, 100, 255, 0)" />
            </linearGradient>
            <linearGradient id="highLi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 80, 50, 0)" />
              <stop offset="50%" stopColor="rgba(255, 80, 50, 0.15)" />
              <stop offset="100%" stopColor="rgba(255, 80, 50, 0)" />
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
          { label: 'State of Charge', key: 'soc', icon: '⚡', color: c },
          { label: 'Ion Concentration', key: 'concentration', icon: '', color: c2 },
          { label: 'Voltage', key: 'voltage', icon: '', color: c },
          { label: 'Capacity Fade', key: 'capacityFade', icon: '', color: c2 },
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
              —
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
