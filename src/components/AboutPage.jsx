import { motion } from 'framer-motion'

const accent = '#C4956A'

const spring = { type: 'spring', stiffness: 280, damping: 24 }
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

const orgs = [
  'NASA', 'ESA', 'Boeing Research', 'DLR', 'MIT AeroAstro',
  'Stanford Bioengineering', 'Johns Hopkins BME', 'Siemens Healthineers', 'NIH',
  'NREL', 'DTU Wind Energy', 'ECMWF', 'NOAA', 'NCAR', 'ETH Zurich',
  'UC Berkeley SEMM', 'MIT Structures', 'Tsinghua Civil Eng',
  'MIT Battery Lab', 'Stanford PECASE', 'Tesla', 'Panasonic Energy',
  'MIT Lorenz Center',
]

const references = [
  { authors: 'Raissi, Perdikaris, Karniadakis', year: '2019', title: 'Physics-Informed Neural Networks: A Deep Learning Framework for Solving Forward and Inverse Problems Involving Nonlinear Partial Differential Equations', journal: 'Journal of Computational Physics', vol: '378', pages: '686–707' },
  { authors: 'Cai, Liu, Wang, Karniadakis', year: '2021', title: 'Physics-Informed Neural Networks (PINNs) for Fluid Mechanics: A Review', journal: 'Acta Mechanica Sinica', vol: '37', pages: '1727–1738' },
  { authors: 'Lu, Meng, Karniadakis', year: '2021', title: 'DeepXDE: A Deep Learning Library for Solving Differential Equations', journal: 'SIAM Review', vol: '63', no: '1', pages: '208–228' },
  { authors: 'Wang, Teng, Perdikaris', year: '2021', title: 'Understanding and Mitigating Gradient Flow Pathologies in Physics-Informed Neural Networks', journal: 'SIAM Journal on Scientific Computing', vol: '43', no: '3' },
  { authors: 'Karniadakis, Kevrekidis, Lu, Perdikaris, Wang, Yang', year: '2021', title: 'Physics-Informed Machine Learning', journal: 'Nature Reviews Physics', vol: '3', pages: '422–440' },
]

function GlassCard({ children, style, hoverLift = true, glowColor = accent, ...props }) {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -4, boxShadow: `0 8px 32px ${glowColor}12` } : {}}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card"
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default function AboutPage() {
  return (
    <div className="app-page">

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section style={{ padding: '160px 0 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 30% 20%, ${accent}06 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(136,192,184,0.03) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />
        <div className="app-section">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', maxWidth: 850, margin: '0 auto' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{ marginBottom: 24 }}
            >
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: `${accent}88`, letterSpacing: '0.12em', fontWeight: 500,
              }}>
                EXPLORING THE PLATFORM
              </span>
            </motion.div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 6vw, 80px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              margin: '0 0 24px',
            }}>
              About{' '}
              <span className="gradient-text-blue">PINN Lab</span>
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(17px, 2vw, 21px)',
              color: 'var(--color-text-secondary)',
              maxWidth: 650,
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              A physics problem analyser powered by natural language understanding — from typed questions to interactive simulations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          1. WHAT ARE PINNs?  —  Split Definition
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0 120px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${accent}03 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div className="app-section">
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            What Are PINNs?
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 60px', lineHeight: 1.7,
            }}
          >
            Neural networks that learn from both data and the laws of physics.
          </motion.p>

          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <GlassCard
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
              custom={2}
              style={{ padding: '48px 52px', marginBottom: 32, border: `1px solid ${accent}12` }}
            >
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--color-text-secondary)',
                lineHeight: 1.8, margin: 0,
              }}>
                Physics-Informed Neural Networks embed governing partial differential equations directly into the neural network loss function. Instead of learning solely from labelled data, the network is trained to satisfy both observed measurements and the underlying physical constraints — conservation of mass, momentum, energy — simultaneously.
              </p>
            </GlassCard>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { label: 'CORE CONCEPT', text: 'A standard neural network maps input coordinates to solution fields. The residual of the governing PDE — computed via automatic differentiation — becomes an additional loss term. The network learns to minimise this alongside the data error, producing physically consistent predictions.' },
                { label: 'KEY INNOVATION', text: 'Unlike purely data-driven approaches, PINNs do not require large labelled datasets. The governing equation acts as a built-in regulariser, enabling accurate predictions in regions where no data exists. This makes them powerful for inverse problems and sparse-data engineering scenarios.' },
              ].map((card, ci) => (
                <GlassCard
                  key={ci}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                  custom={3 + ci}
                  style={{ padding: 32 }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: `${accent}99`, letterSpacing: '0.08em', marginBottom: 12 }}>
                    {card.label}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.8, margin: 0 }}>
                    {card.text}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           2. WHY PINNs MATTER  —  Alternating Editorial
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 4.5vw, 54px)',
            fontWeight: 600, letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            margin: '0 auto 16px', maxWidth: 600,
          }}>
            Why PINNs Matter
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 19,
            color: 'var(--color-text-secondary)',
            maxWidth: 560, margin: '0 auto', lineHeight: 1.7,
          }}>
            Three fundamental advantages over purely data-driven machine learning.
          </p>
        </motion.div>

        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          {[
            { number: '10×', label: 'Data Efficiency', desc: 'Traditional neural networks need thousands of labelled examples. PINNs produce accurate solutions from only a handful of measurements because the governing equation constrains the solution space, acting as a powerful prior that dramatically reduces data requirements.' },
            { number: '100%', label: 'Physics Consistency', desc: 'Black-box models can and do violate conservation laws — mass, momentum, and energy may not be preserved. PINN predictions are guaranteed to approximately satisfy these laws by construction, making them trustworthy for engineering decisions where failure is not an option.' },
            { number: '✔', label: 'Verifiable Outputs', desc: 'The internal representations learned by a PINN correspond to physically meaningful quantities — pressure fields, stress distributions, temperature gradients. Engineers can inspect these predicted fields and verify they obey known physical principles, unlike opaque deep learning models.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                flexDirection: i % 2 === 1 ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 40,
                padding: '36px 0',
                border: 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 12px',
                  letterSpacing: '-0.01em',
                }}>
                  {item.label}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 17,
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.8,
                  margin: 0,
                }}>
                  {item.desc}
                </p>
              </div>

              <motion.div
                whileHover={{
                  y: -6,
                  boxShadow: `0 16px 48px ${accent}18, 0 0 60px ${accent}06`,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  width: 180,
                  flexShrink: 0,
                  padding: '36px 20px',
                  borderRadius: 18,
                  background: `linear-gradient(145deg, ${accent}10, ${accent}04)`,
                  border: `1px solid ${accent}18`,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 100, height: 100, borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}12, transparent)`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}
                />
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 52,
                  fontWeight: 700,
                  color: accent,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  display: 'block',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {item.number}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. TRADITIONAL AI vs PINNs  —  Comparison
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${accent}03 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div className="app-section" style={{ maxWidth: 840 }}>
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            Traditional AI <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>vs</span> PINNs
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.7,
            }}
          >
            A direct comparison across the dimensions that matter for engineering and scientific problems.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }}
            custom={2}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}
          >
            <div style={{
              padding: '18px 28px', borderRadius: 12, textAlign: 'center',
              background: 'rgba(224,90,90,0.06)', border: '1px solid rgba(224,90,90,0.1)',
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
              color: '#E07840', letterSpacing: '0.08em',
            }}>
              TRADITIONAL AI
            </div>
            <div style={{
              padding: '18px 28px', borderRadius: 12, textAlign: 'center',
              background: `${accent}08`, border: `1px solid ${accent}12`,
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
              color: accent, letterSpacing: '0.08em',
            }}>
              PINNs
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { ai: 'Needs massive labelled datasets', pinn: 'Works with sparse data + physics' },
              { ai: 'May violate physical conservation laws', pinn: 'Physics-consistent by construction' },
              { ai: 'Poor extrapolation outside training data', pinn: 'Generalises via governing equations' },
              { ai: 'Black-box predictions, hard to debug', pinn: 'Outputs correspond to physical fields' },
              { ai: 'Overfits on noisy measurements', pinn: 'Regularised by physical constraints' },
              { ai: 'Requires retraining for new conditions', pinn: 'Adaptable via equation parameters' },
            ].map((row, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                custom={3 + i}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
              >
                <GlassCard style={{
                  padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 12,
                  border: '1px solid rgba(224,90,90,0.08)',
                  background: 'rgba(224,90,90,0.02)',
                }}>
                  <span style={{ fontSize: 17, flexShrink: 0, opacity: 0.4 }}>✕</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {row.ai}
                  </span>
                </GlassCard>
                <GlassCard style={{
                  padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 12,
                  border: `1px solid ${accent}12`,
                }}>
                  <span style={{ fontSize: 17, flexShrink: 0, color: accent }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                    {row.pinn}
                  </span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. HOW PINNs WORK  —  Horizontal Pipeline
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0 120px', position: 'relative' }}>
        <div className="app-section" style={{ maxWidth: 960 }}>
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            How PINNs Work
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.7,
            }}
          >
            A step-by-step breakdown of the physics-informed learning process.
          </motion.p>

          <div style={{ display: 'flex', gap: 0, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {[
              { num: 1, title: 'Input Coordinates', desc: 'Spatial and temporal coordinates (x, y, z, t) are fed into the network. No mesh required — points can be sampled anywhere in the domain.' },
              { num: 2, title: 'Neural Network', desc: 'Coordinates pass through a fully-connected network. The output represents the solution field — temperature, velocity, or pressure at that point.' },
              { num: 3, title: 'PDE Residual', desc: 'Automatic differentiation computes partial derivatives of the output. These are substituted into the governing PDE to calculate the residual error.' },
              { num: 4, title: 'Loss Function', desc: 'Total loss combines data loss, PDE residual loss, and boundary condition loss. The network is trained to minimise all three simultaneously.' },
              { num: 5, title: 'Solution', desc: 'The trained network outputs the solution for any input coordinate. The result is a differentiable, mesh-free surrogate of the physics.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                custom={2 + i}
                style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}
              >
                <GlassCard hoverLift={false} style={{
                  padding: '32px 36px', width: 220,
                  border: `1px solid ${accent}10`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                    color: accent, opacity: 0.5, letterSpacing: '0.04em',
                  }}>
                    STEP {step.num}
                  </div>
                  <h4 style={{
                    fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
                    color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.01em',
                  }}>
                    {step.title}
                  </h4>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-secondary)',
                    lineHeight: 1.6, margin: 0,
                  }}>
                    {step.desc}
                  </p>
                </GlassCard>
                {i < 4 && (
                  <div style={{
                    width: 32, height: 1,
                    background: `linear-gradient(to right, ${accent}30, ${accent}08)`,
                    margin: '0 6px', flexShrink: 0,
                  }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. PROJECT ARCHITECTURE  —  Split + Detailed Grid
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${accent}03 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div className="app-section" style={{ maxWidth: 960 }}>
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            Project Architecture
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.7,
            }}
          >
            How the platform works — from natural language input to interactive visualisation.
          </motion.p>

          <GlassCard style={{ padding: '40px 44px', marginBottom: 32, border: `1px solid ${accent}10` }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: '⌨', label: 'User Input', sub: 'Type a physics problem' },
                { icon: '⚙', label: 'NLP Analyzer', sub: 'Classifier + extractor' },
                { icon: '▦', label: 'Physics Engine', sub: 'calculateResult()' },
                { icon: '⊞', label: 'Simulation', sub: 'Canvas animation' },
                { icon: '◈', label: 'Results', sub: 'Validation + history' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '20px 24px',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{step.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {step.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {step.sub}
                      </div>
                    </div>
                  </div>
                  {i < 4 && (
                    <span style={{ color: `${accent}30`, fontSize: 18, margin: '0 4px' }}>→</span>
                  )}
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { label: 'NLP ANALYSER', text: 'The classifier matches user text against 29 physics equations using semantic keyword scoring across objects, actions, quantities, units, and concepts. The parameter extractor parses numerical values with unit conversion (60+ unit variants to SI).' },
              { label: 'PHYSICS ENGINE', text: 'Hand-coded JavaScript functions implement formulas for 18 physics equations — Newton, Projectile, Momentum, Energy, Bernoulli, Ohm, and more. A realism checker validates parameters against physical constraints before simulation.' },
              { label: 'SIMULATION LAYER', text: '24 custom canvas-based simulators render real-time animations. Each implements its own requestAnimationFrame loop with domain-specific visuals — wave functions, particle trajectories, field lines, and circuit diagrams.' },
              { label: 'FRONTEND', text: 'React SPA with Framer Motion animations, glassmorphism UI, smooth scroll navigation, and localStorage-based session history. All computation runs client-side — no backend or external API calls.' },
            ].map((card, i) => (
              <GlassCard
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                custom={2 + i}
                style={{ padding: 28 }}
              >
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: `${accent}99`, letterSpacing: '0.08em', marginBottom: 10 }}>
                  {card.label}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.8, margin: 0 }}>
                  {card.text}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. OUR PROJECT FEATURES  —  Hero + Staggered Grid
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <div className="app-section" style={{ maxWidth: 960 }}>
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            Our Project Features
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.7,
            }}
          >
            The real features implemented in this platform — nothing invented.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
            <GlassCard variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }} custom={2} style={{ padding: 32, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>⊞</span>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Interactive PDE Explorer</h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>Browse 24 equations across 7 physics branches. Search by name, formula, or branch. Open any equation to adjust parameters in real time and see the canvas simulation update instantly.</p>
              </div>
            </GlassCard>
            <GlassCard variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }} custom={3} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>⚙</span>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>NLP Problem Analyser</h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>Type a physics problem in natural language. The classifier detects the equation, extracts parameters with unit conversion, and computes the result — all client-side.</p>
              </div>
            </GlassCard>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {[
              { icon: '◈', title: 'Physics Validation', desc: 'Every calculation passes through a realism check: negative mass, superluminal velocity, impossible distances. Invalid inputs show warnings and block simulation.' },
              { icon: '▣', title: 'Industry Showcases', desc: 'Six dedicated pages with domain-specific interactive simulations, parameter tuning, and contextual physics explanations across major engineering fields.' },
              { icon: '⌘', title: 'Session History', desc: 'Equation experiments saved to localStorage per user. Revisit previous parameters and results across sessions without losing context.' },
            ].map((item, i) => (
              <GlassCard
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                custom={4 + i}
                style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.01em' }}>{item.title}</h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. FUTURE OF PINNs  —  Industry Cards with Hover
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${accent}03 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div className="app-section" style={{ maxWidth: 900 }}>
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            Future of PINNs
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.7,
            }}
          >
            Where physics-informed machine learning is heading next.
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '✈', title: 'Aerospace', desc: 'Full-vehicle aerodynamic optimisation, real-time flow field reconstruction from sparse surface sensors, and reduced-order modelling for flight control feedback.', color: '#C4956A' },
              { icon: '🏗', title: 'Structural Engineering', desc: 'Continuous stress-field monitoring of bridges and dams from discrete strain-gauge data. PINN-based crack propagation models for earthquake resilience.', color: '#D4764A' },
              { icon: '🫀', title: 'Healthcare', desc: 'Non-invasive blood flow diagnostics from sparse MRI data. Patient-specific digital heart models for surgical planning without invasive catheterisation.', color: '#D46060' },
              { icon: '🌍', title: 'Climate & Energy', desc: 'High-resolution climate emulators running orders of magnitude faster than GCMs. Wind farm optimisation and grid-scale battery degradation modelling.', color: '#6AB0A8' },
              { icon: '⚡', title: 'Energy Systems', desc: 'Collaborative wind farm control via turbine-to-turbine PINN communication. Real-time electrolyser optimisation for green hydrogen production.', color: '#6ABF69' },
              { icon: '🔋', title: 'Battery Technology', desc: 'Embedded PINN-based battery management predicting internal states in real time. Physics-constrained fast-charging protocols personalised per cell.', color: '#5B8DEF' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                custom={2 + i}
                style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}
              >
                <GlassCard
                  glowColor={item.color}
                  style={{
                    padding: '32px 36px', width: '65%',
                    border: `1px solid ${item.color}18`,
                    display: 'flex', gap: 20, alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${item.color}12`, border: `1px solid ${item.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. ORGANIZATIONS USING PINNs  —  Logo Wall
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <div className="app-section" style={{ maxWidth: 840 }}>
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            Organizations Using PINNs
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.7,
            }}
          >
            Leading institutions worldwide advancing physics-informed machine learning.
          </motion.p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
            {orgs.map((name, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-20px' }}
                custom={i}
                whileHover={{ y: -3, borderColor: `${accent}30`, background: 'rgba(255,255,255,0.05)' }}
                transition={{ duration: 0.2 }}
                style={{
                  padding: '18px 24px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center', fontWeight: 500,
                  cursor: 'default', transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          9. RESEARCH & REFERENCES  —  Premium Papers
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${accent}03 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <div className="app-section" style={{ maxWidth: 800 }}>
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
            custom={0}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              margin: '0 0 16px', textAlign: 'center',
            }}
          >
            Research & References
          </motion.h2>
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            custom={1}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'var(--color-text-secondary)', textAlign: 'center',
              maxWidth: 600, margin: '0 auto 56px', lineHeight: 1.7,
            }}
          >
            Foundational papers that established and advanced the field of physics-informed neural networks.
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {references.map((ref, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }}
                custom={2 + i}
              >
                <GlassCard style={{
                  padding: '32px 36px',
                  border: `1px solid ${accent}08`,
                }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                      color: accent, opacity: 0.4, flexShrink: 0, marginTop: 3, minWidth: 50,
                    }}>
                      [{ref.year}]
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.5, margin: '0 0 6px', fontWeight: 500 }}>
                        {ref.authors}
                      </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                    &ldquo;{ref.title}&rdquo;
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-muted)', margin: '8px 0 0' }}>
                    {ref.journal}{ref.vol ? `, vol. ${ref.vol}` : ''}{ref.no ? ` (${ref.no})` : ''}{ref.pages ? `, pp. ${ref.pages}` : ''}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          10. CLOSING QUOTE
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0 140px', position: 'relative' }}>
        <div className="app-section" style={{ maxWidth: 750 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard style={{
              padding: '68px 60px', textAlign: 'center',
              border: `1px solid ${accent}10`,
            }}>
              <motion.span
                animate={{ opacity: [0.12, 0.25, 0.12] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  fontFamily: 'var(--font-display)', fontSize: 72,
                  color: accent, lineHeight: 0.4, display: 'block', marginBottom: 16,
                }}
              >
                &ldquo;
              </motion.span>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 2.5vw, 30px)',
                fontWeight: 500, fontStyle: 'italic',
                color: 'var(--color-text-primary)',
                lineHeight: 1.5, margin: '0 0 24px',
                letterSpacing: '-0.01em',
              }}>
                Physics-Informed Neural Networks bridge the gap between{' '}
                <span className="gradient-text-blue">Artificial Intelligence</span>{' '}
                and the{' '}
                <span className="gradient-text-warm">laws of nature</span>.
              </p>
              <motion.div
                animate={{ width: ['32px', '48px', '32px'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ height: 2, background: accent, margin: '0 auto 20px', opacity: 0.25 }}
              />
              <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--color-text-muted)', letterSpacing: '0.08em',
                }}>
                  PINN LAB
              </span>
            </GlassCard>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
