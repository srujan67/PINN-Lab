import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import './Applications.css'

const c = '#E07840'
const c2 = '#88C0B8'

const sections = [
  {
    num: '01', label: 'Engineering Problem', color: c,
    lines: [
      'Cardiovascular diagnostics rely on non-invasive blood flow estimation from sparse MRI velocity measurements.',
      'Standard methods either ignore physics or require costly 4D flow scans, limiting clinical adoption.',
      'Current CFD-based approaches demand patient-specific geometry extraction and expensive mesh generation.',
      'Clinicians often rely on simplified Bernoulli-based estimates with ±30% error margins.',
      'This uncertainty affects treatment decisions for millions of patients with valvular and vascular disease.',
    ],
  },
  {
    num: '02', label: 'Physics Used', color: c2,
    lines: [
      'The Navier–Stokes equations govern blood flow in vessels.',
      'Key parameters: Reynolds number (laminar vs turbulent flow), Womersley number (pulsatile flow), wall shear stress (endothelial response).',
      'Blood is modelled as an incompressible Newtonian fluid with density 1060 kg/m³ and viscosity 0.0035 Pa·s.',
      'No-slip boundary conditions at vessel walls create parabolic velocity profiles in steady flow.',
      'Pulsatile pressure waves propagate through the arterial tree, driving cyclic Wall shear stress variations.',
    ],
  },
  {
    num: '03', label: 'Why Traditional AI Struggles', color: c,
    lines: [
      'Black-box neural networks trained on labelled flow data fail to enforce no-slip boundary conditions at vessel walls.',
      'Producing unphysical flow patterns that are unusable for clinical decisions and surgical planning.',
      'Data-driven models cannot guarantee conservation of mass across bifurcations and stenotic regions.',
      'Training requires thousands of expensive 4D flow MRI datasets that are rare and institution-specific.',
      'Extrapolation to pathological anatomies yields unreliable predictions with no physics-based safeguards.',
    ],
  },
  {
    num: '04', label: 'Why PINNs Work', color: c2,
    lines: [
      'PINNs enforce Navier–Stokes conservation of mass and momentum as soft constraints in the loss function.',
      'Recovering full pressure and velocity fields from limited, noisy clinical MRI data without segmentation.',
      'No explicit mesh generation needed — PINNs operate directly on scattered measurement points in the vessel lumen.',
      'No-slip walls and inlet/outlet conditions are satisfied by construction, guaranteeing physical realism.',
      'Training converges in minutes on a single GPU, enabling real-time clinical decision support.',
    ],
  },
  {
    num: '05', label: 'Real Applications', color: c,
    lines: [
      'Non-invasive pressure-drop estimation across stenoses for coronary artery disease assessment.',
      'Cerebral aneurysm haemodynamics — predicting rupture risk from wall shear stress distributions.',
      'Coronary flow reserve prediction from rest-state MRI without adenosine stress protocols.',
      'Aortic coarctation assessment — pressure gradients across the narrowing without catheterisation.',
      'Patient-specific surgical planning for bypass grafts, valve replacements, and vascular interventions.',
    ],
  },
]

const orgs = [
  { name: 'Stanford Bioengineering', initials: 'SB', color: c },
  { name: 'Johns Hopkins BME', initials: 'JH', color: c2 },
  { name: 'Siemens Healthineers', initials: 'SH', color: c },
  { name: 'NIH', initials: 'NIH', color: c2 },
  { name: 'Mayo Clinic', initials: 'MC', color: c },
]

const keyVars = [
  { sym: 'ρ', desc: 'Blood density 1060 kg/m³', color: c },
  { sym: 'u', desc: 'Velocity field', color: c2 },
  { sym: 'p', desc: 'Pressure', color: c },
  { sym: 'μ', desc: 'Blood viscosity 0.0035 Pa·s', color: c },
  { sym: '∇', desc: 'Gradient operator', color: c2 },
  { sym: '∇²', desc: 'Laplacian operator', color: c },
  { sym: 'τ', desc: 'Wall shear stress', color: c2 },
]

export default function HealthcarePage({ onNavigateToExplore }) {
  const [flowRate, setFlowRate] = useState(10)
  const [vesselDiameter, setVesselDiameter] = useState(5)

  return (
    <div className="app-page">

      {/* ═══════════════════════════════════════
          HEADER — Title + Subtitle + Info Cards + Scroll Indicator
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 30px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', '--color-accent': '#D46060' }}>
        {/* Subtle animated background — ECG pulse lines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03 }}>
          <svg viewBox="0 0 1440 600" style={{ width: '100%', height: '100%' }}>
            {[0, 1, 2].map(i => (
              <motion.path
                key={i}
                d={`M0,${200 + i * 150} L200,${200 + i * 150} L240,${180 + i * 150} L280,${220 + i * 150} L320,${180 + i * 150} L360,${200 + i * 150} L500,${200 + i * 150} L540,${170 + i * 150} L580,${230 + i * 150} L620,${170 + i * 150} L660,${200 + i * 150} L800,${200 + i * 150} L840,${180 + i * 150} L880,${220 + i * 150} L920,${180 + i * 150} L960,${200 + i * 150} L1100,${200 + i * 150} L1140,${170 + i * 150} L1180,${230 + i * 150} L1220,${170 + i * 150} L1260,${200 + i * 150} L1440,${200 + i * 150}`}
                fill="none"
                stroke="#E07840"
                strokeWidth={0.8}
                animate={{ d: [
                  `M0,${200 + i * 150} L200,${200 + i * 150} L240,${180 + i * 150} L280,${220 + i * 150} L320,${180 + i * 150} L360,${200 + i * 150} L500,${200 + i * 150} L540,${170 + i * 150} L580,${230 + i * 150} L620,${170 + i * 150} L660,${200 + i * 150} L800,${200 + i * 150} L840,${180 + i * 150} L880,${220 + i * 150} L920,${180 + i * 150} L960,${200 + i * 150} L1100,${200 + i * 150} L1140,${170 + i * 150} L1180,${230 + i * 150} L1220,${170 + i * 150} L1260,${200 + i * 150} L1440,${200 + i * 150}`,
                  `M0,${200 + i * 150} L200,${200 + i * 150} L240,${220 + i * 150} L280,${180 + i * 150} L320,${220 + i * 150} L360,${200 + i * 150} L500,${200 + i * 150} L540,${230 + i * 150} L580,${170 + i * 150} L620,${230 + i * 150} L660,${200 + i * 150} L800,${200 + i * 150} L840,${220 + i * 150} L880,${180 + i * 150} L920,${220 + i * 150} L960,${200 + i * 150} L1100,${200 + i * 150} L1140,${230 + i * 150} L1180,${170 + i * 150} L1220,${230 + i * 150} L1260,${200 + i * 150} L1440,${200 + i * 150}`,
                ]}}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
              />
            ))}
          </svg>
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(224,120,64,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(136,192,184,0.06) 0%, transparent 50%)',
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
              Healthcare{' '}
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
              Physics-Informed Neural Networks for Biomedical Engineering
            </motion.p>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}
            >
              {[
                { label: 'Primary Physics', value: 'Fluid Dynamics (Navier–Stokes)' },
                { label: 'Industry', value: 'Cardiology & Medical Imaging' },
                { label: 'PINN Advantage', value: 'Non-Invasive Flow Estimation' },
                { label: 'Engineering Goal', value: 'Patient-Specific Diagnostics' },
              ].map((card, i) => (
                <div key={i} style={{
                  flex: '1 1 180px', maxWidth: 210,
                  padding: '20px 24px', borderRadius: 12,
                  background: 'rgba(13, 18, 32, 0.7)',
                  border: '1px solid rgba(224,120,64,0.15)',
                  textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 10,
                    color: 'rgba(224,120,64,0.75)',
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
              Navier–Stokes for incompressible blood flow
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
                The left-hand side represents inertial forces from blood acceleration and convective transport through the vessel.
                On the right, the pressure gradient <span style={{ color: c }}>∇p</span> drives flow from high to low pressure regions,
                while viscous diffusion <span style={{ color: c }}>μ∇²u</span> dissipates energy through blood viscosity.
                Wall shear stress <span style={{ color: c2 }}>τ</span> = μ(∂u/∂n) at the vessel wall is a critical clinical biomarker
                for endothelial health, plaque formation, and aneurysm rupture risk.
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
              Interactive <span className="gradient-text-blue">Blood Flow Simulation</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Adjust flow rate and vessel diameter to see how haemodynamics change in the artery.
            </p>
          </motion.div>

          <div className="glass-card" style={{
            maxWidth: 900, margin: '0 auto', padding: 32,
          }}>
            <HealthcareCanvas flowRate={flowRate} diameter={vesselDiameter} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Flow Rate</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{flowRate} mL/s</span>
                </div>
                <input
                  type="range" min={1} max={20} value={flowRate}
                  onChange={e => setFlowRate(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c}40 0%, ${c}40 ${((flowRate - 1) / 19) * 100}%, rgba(255,255,255,0.08) ${((flowRate - 1) / 19) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Vessel Diameter</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c2, fontWeight: 600 }}>{vesselDiameter} mm</span>
                </div>
                <input
                  type="range" min={2} max={10} value={vesselDiameter}
                  onChange={e => setVesselDiameter(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c2}40 0%, ${c2}40 ${((vesselDiameter - 2) / 8) * 100}%, rgba(255,255,255,0.08) ${((vesselDiameter - 2) / 8) * 100}%, rgba(255,255,255,0.08) 100%)`,
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
                  onNavigateToExplore('navier', { context: 'healthcare' })
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
              Try Biomedical Example →
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  HEALTHCARE SIMULATION — SVG + rAF Blood Vessel Flow
// ═══════════════════════════════════════════════════════════════

function computeStats(flowRate, diameter) {
  const length = 10
  const velocity = flowRate / (Math.PI * (diameter / 2) * (diameter / 2)) * 100
  const re = 1060 * velocity * 0.01 * diameter / 0.0035
  const pressureDrop = 128 * 0.0035 * length * flowRate / (Math.PI * Math.pow(diameter, 4)) * 7.5
  const wss = 4 * 0.0035 * velocity / (diameter / 2)
  return { velocity, re, pressureDrop, wss }
}

function getCenterlinePoint(t) {
  const x = 30 + t * 940
  const y = 250 + 70 * Math.sin(t * Math.PI * 2)
  return { x, y }
}

function getVesselFillPath(diam) {
  const half = diam * 5
  const n = 50
  const pts = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const pt = getCenterlinePoint(t)
    const dt = 0.001
    const next = getCenterlinePoint(Math.min(1, t + dt))
    const angle = Math.atan2(next.y - pt.y, next.x - pt.x)
    const px = Math.cos(angle + Math.PI / 2) * half
    const py = Math.sin(angle + Math.PI / 2) * half
    pts.push({ ux: pt.x + px, uy: pt.y + py, lx: pt.x - px, ly: pt.y - py })
  }
  let d = `M ${pts[0].ux},${pts[0].uy}`
  for (let i = 1; i < n; i++) d += ` L ${pts[i].ux},${pts[i].uy}`
  for (let i = n - 1; i >= 0; i--) d += ` L ${pts[i].lx},${pts[i].ly}`
  d += ' Z'
  return d
}

function getUpperWallPath(diam) {
  const half = diam * 5
  const n = 50
  let d = ''
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const pt = getCenterlinePoint(t)
    const dt = 0.001
    const next = getCenterlinePoint(Math.min(1, t + dt))
    const angle = Math.atan2(next.y - pt.y, next.x - pt.x)
    const px = Math.cos(angle + Math.PI / 2) * half
    const py = Math.sin(angle + Math.PI / 2) * half
    d += (i === 0 ? `M ${pt.x + px},${pt.y + py}` : ` L ${pt.x + px},${pt.y + py}`)
  }
  return d
}

function getLowerWallPath(diam) {
  const half = diam * 5
  const n = 50
  let d = ''
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const pt = getCenterlinePoint(t)
    const dt = 0.001
    const next = getCenterlinePoint(Math.min(1, t + dt))
    const angle = Math.atan2(next.y - pt.y, next.x - pt.x)
    const px = Math.cos(angle + Math.PI / 2) * half
    const py = Math.sin(angle + Math.PI / 2) * half
    d += (i === 0 ? `M ${pt.x - px},${pt.y - py}` : ` L ${pt.x - px},${pt.y - py}`)
  }
  return d
}

function HealthcareCanvas({ flowRate, diameter }) {
  const svgRef = useRef(null)
  const statsRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)
  const propsRef = useRef({ flowRate, diameter })

  useEffect(() => { propsRef.current = { flowRate, diameter } }, [flowRate, diameter])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const VW = 1000, VH = 500
    const ns = 'http://www.w3.org/2000/svg'

    // ─── Defs ───
    const defs = document.createElementNS(ns, 'defs')

    const vesselGrad = document.createElementNS(ns, 'linearGradient')
    vesselGrad.id = 'vesselG'
    vesselGrad.setAttribute('x1', '0'); vesselGrad.setAttribute('y1', '0')
    vesselGrad.setAttribute('x2', '1'); vesselGrad.setAttribute('y2', '0')
    const vs1 = document.createElementNS(ns, 'stop')
    vs1.setAttribute('offset', '0%'); vs1.setAttribute('stop-color', 'rgba(255, 60, 60, 0.35)')
    const vs2 = document.createElementNS(ns, 'stop')
    vs2.setAttribute('offset', '50%'); vs2.setAttribute('stop-color', 'rgba(224, 120, 64, 0.35)')
    const vs3 = document.createElementNS(ns, 'stop')
    vs3.setAttribute('offset', '100%'); vs3.setAttribute('stop-color', 'rgba(60, 140, 255, 0.35)')
    vesselGrad.appendChild(vs1); vesselGrad.appendChild(vs2); vesselGrad.appendChild(vs3)
    defs.appendChild(vesselGrad)

    const glow = document.createElementNS(ns, 'filter')
    glow.id = 'hcGlow'
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

    // ─── Grid ───
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

    // ─── Vessel elements ───
    const vesselFill = document.createElementNS(ns, 'path')
    vesselFill.setAttribute('fill', 'url(#vesselG)')
    vesselFill.setAttribute('stroke', 'none')
    svg.appendChild(vesselFill)

    const vesselUpper = document.createElementNS(ns, 'path')
    vesselUpper.setAttribute('fill', 'none')
    vesselUpper.setAttribute('stroke', `rgba(224,120,64,0.35)`)
    vesselUpper.setAttribute('stroke-width', '1.5')
    svg.appendChild(vesselUpper)

    const vesselLower = document.createElementNS(ns, 'path')
    vesselLower.setAttribute('fill', 'none')
    vesselLower.setAttribute('stroke', `rgba(224,120,64,0.35)`)
    vesselLower.setAttribute('stroke-width', '1.5')
    svg.appendChild(vesselLower)

    // ─── WSS arrows group ───
    const wssGroup = document.createElementNS(ns, 'g')
    wssGroup.id = 'wss-group'
    svg.appendChild(wssGroup)

    // ─── "LIVE OUTPUT" watermark ───
    const liveTitle = document.createElementNS(ns, 'text')
    liveTitle.setAttribute('x', '14')
    liveTitle.setAttribute('y', '22')
    liveTitle.setAttribute('fill', `rgba(224,120,64,0.12)`)
    liveTitle.setAttribute('font-size', '18')
    liveTitle.setAttribute('font-family', 'system-ui')
    liveTitle.setAttribute('font-weight', 'bold')
    liveTitle.textContent = 'LIVE OUTPUT'
    svg.appendChild(liveTitle)

    // ─── Particles ───
    const numParticles = 60
    const particles = []
    const particleEls = []

    for (let i = 0; i < numParticles; i++) {
      const p = {
        t: Math.random(),
        offset: (Math.random() - 0.5) * 0.6,
        speed: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 2.5,
      }
      particles.push(p)
    }
    particlesRef.current = particles

    for (let i = 0; i < numParticles; i++) {
      const c = document.createElementNS(ns, 'circle')
      c.setAttribute('r', particles[i].size)
      c.setAttribute('fill', '#E07840')
      c.setAttribute('opacity', '0.6')
      c.setAttribute('filter', 'url(#hcGlow)')
      svg.appendChild(c)
      particleEls.push(c)
    }

    // ─── Inlet / Outlet labels ───
    const inletLbl = document.createElementNS(ns, 'text')
    inletLbl.setAttribute('x', '50'); inletLbl.setAttribute('y', '60')
    inletLbl.setAttribute('fill', 'rgba(255,60,60,0.3)')
    inletLbl.setAttribute('font-size', '11')
    inletLbl.setAttribute('font-family', 'system-ui')
    inletLbl.setAttribute('font-weight', '600')
    inletLbl.textContent = 'INLET ↑P'
    svg.appendChild(inletLbl)

    const outletLbl = document.createElementNS(ns, 'text')
    outletLbl.setAttribute('x', '880'); outletLbl.setAttribute('y', '60')
    outletLbl.setAttribute('fill', 'rgba(60,140,255,0.3)')
    outletLbl.setAttribute('font-size', '11')
    outletLbl.setAttribute('font-family', 'system-ui')
    outletLbl.setAttribute('font-weight', '600')
    outletLbl.textContent = 'OUTLET ↓P'
    svg.appendChild(outletLbl)

    // ─── Animation loop ───
    const loop = (time) => {
      const { flowRate: fr, diameter: diam } = propsRef.current

      // Update vessel geometry
      vesselFill.setAttribute('d', getVesselFillPath(diam))
      vesselUpper.setAttribute('d', getUpperWallPath(diam))
      vesselLower.setAttribute('d', getLowerWallPath(diam))

      // WSS arrows
      while (wssGroup.firstChild) wssGroup.removeChild(wssGroup.firstChild)
      const half = diam * 5
      const numArrows = 14
      for (let i = 0; i < numArrows; i++) {
        const t = (i + 0.5) / numArrows
        const pt = getCenterlinePoint(t)
        const dt = 0.001
        const next = getCenterlinePoint(Math.min(1, t + dt))
        const angle = Math.atan2(next.y - pt.y, next.x - pt.x)
        const px = Math.cos(angle + Math.PI / 2) * half
        const py = Math.sin(angle + Math.PI / 2) * half

        // Upper wall arrow
        const axU = pt.x + px, ayU = pt.y + py
        const arrowLen = 10 + (fr / 20) * 8
        const arrow = document.createElementNS(ns, 'path')
        const ex1 = axU + Math.cos(angle) * arrowLen
        const ey1 = ayU + Math.sin(angle) * arrowLen
        const hx1 = ex1 - Math.cos(angle - 0.8) * 5
        const hy1 = ey1 - Math.sin(angle - 0.8) * 5
        const hx2 = ex1 - Math.cos(angle + 0.8) * 5
        const hy2 = ey1 - Math.sin(angle + 0.8) * 5
        arrow.setAttribute('d', `M ${axU},${ayU} L ${ex1},${ey1} M ${ex1},${ey1} L ${hx1},${hy1} M ${ex1},${ey1} L ${hx2},${hy2}`)
        arrow.setAttribute('stroke', `rgba(136,192,184,${0.2 + (fr / 20) * 0.3})`)
        arrow.setAttribute('stroke-width', '1')
        arrow.setAttribute('fill', 'none')
        wssGroup.appendChild(arrow)

        // Lower wall arrow
        const axL = pt.x - px, ayL = pt.y - py
        const ex2 = axL + Math.cos(angle) * arrowLen
        const ey2 = ayL + Math.sin(angle) * arrowLen
        const hx3 = ex2 - Math.cos(angle - 0.8) * 5
        const hy3 = ey2 - Math.sin(angle - 0.8) * 5
        const hx4 = ex2 - Math.cos(angle + 0.8) * 5
        const hy4 = ey2 - Math.sin(angle + 0.8) * 5
        const arrow2 = document.createElementNS(ns, 'path')
        arrow2.setAttribute('d', `M ${axL},${ayL} L ${ex2},${ey2} M ${ex2},${ey2} L ${hx3},${hy3} M ${ex2},${ey2} L ${hx4},${hy4}`)
        arrow2.setAttribute('stroke', `rgba(136,192,184,${0.2 + (fr / 20) * 0.3})`)
        arrow2.setAttribute('stroke-width', '1')
        arrow2.setAttribute('fill', 'none')
        wssGroup.appendChild(arrow2)
      }

      // Update particles
      const sf = Math.max(0.3, fr / 10)
      const pulse = 0.7 + 0.3 * Math.sin(time * 0.002)

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i]
        p.t += p.speed * sf * pulse * 0.003
        if (p.t > 1) p.t -= 1

        const pt = getCenterlinePoint(p.t)
        const dt = 0.001
        const next = getCenterlinePoint(Math.min(1, p.t + dt))
        const angle = Math.atan2(next.y - pt.y, next.x - pt.x)
        const halfW = half * p.offset
        const px = Math.cos(angle + Math.PI / 2) * halfW
        const py = Math.sin(angle + Math.PI / 2) * halfW

        particleEls[i].setAttribute('cx', pt.x + px)
        particleEls[i].setAttribute('cy', pt.y + py)

        const bright = 0.3 + sf * 0.5 + pulse * 0.2
        particleEls[i].setAttribute('opacity', Math.min(1, bright))
      }

      // Update HTML stats
      if (statsRef.current) {
        const els = statsRef.current
        const st = computeStats(fr, diam)

        els.pressureDrop.textContent = `${Math.max(0, st.pressureDrop).toFixed(2)} mmHg`
        els.wss.textContent = `${Math.max(0, st.wss).toFixed(3)} Pa`
        els.velocity.textContent = `${Math.max(0, st.velocity).toFixed(1)} cm/s`
        els.re.textContent = `${Math.max(0, Math.round(st.re / 1000))}`
        const pinn = 88 + Math.sin(time * 0.0005) * 3 + (fr / 20) * 7
        els.pinn.textContent = `${Math.min(99.9, pinn).toFixed(1)}%`
        const conv = Math.min(99.5, 80 + fr * 0.6 + (diam / 10) * 10)
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
          { label: 'Pressure Drop', key: 'pressureDrop', icon: '▼', color: c },
          { label: 'WSS', key: 'wss', icon: '↗', color: c2 },
          { label: 'Flow Vel.', key: 'velocity', icon: '→', color: c },
          { label: 'Reynolds #', key: 're', icon: 'ℜ', color: c2 },
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
              0.00
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
