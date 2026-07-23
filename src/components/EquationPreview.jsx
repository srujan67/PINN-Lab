import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const equations = [
  {
    title: 'Navier-Stokes',
    equation: '∂u/∂t + (u·∇)u = −∇p/ρ + ν∇²u',
    description: 'Fluid dynamics',
    floatDuration: 5.5,
  },
  {
    title: "Maxwell's Equations",
    equation: '∇ × E = −∂B/∂t',
    description: 'Electrodynamics',
    floatDuration: 6.2,
  },
  {
    title: 'Schrödinger',
    equation: 'iℏ ∂ψ/∂t = Ĥψ',
    description: 'Quantum mechanics',
    floatDuration: 5.0,
  },
  {
    title: 'Heat Equation',
    equation: '∂T/∂t = α∇²T',
    description: 'Thermal diffusion',
    floatDuration: 7.0,
  },
]

function EquationCard({ title, equation, description, floatDuration, index }) {
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={cardRef}
      className="relative px-7 py-7 rounded-2xl cursor-default select-none overflow-hidden"
      style={{
        background: 'rgba(10, 14, 23, 0.7)',
        border: '1px solid rgba(26, 31, 48, 0.8)',
        animationName: isInView ? 'floatCard' : 'none',
        animationDuration: `${floatDuration}s`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationDelay: `${index * 0.6}s`,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: 1.03,
        borderColor: 'rgba(74, 144, 217, 0.3)',
        boxShadow: '0 8px 40px rgba(74, 144, 217, 0.08)',
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {/* Subtle top-left glow accent */}
      <div
        className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top left, rgba(74, 144, 217, 0.06), transparent 70%)',
        }}
      />

      <span
        className="relative text-[10px] font-medium tracking-[0.15em] uppercase mb-3 block"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-accent-blue)',
          opacity: 0.65,
        }}
      >
        {description}
      </span>
      <h3
        className="relative text-sm font-semibold mb-3"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h3>
      <p
        className="relative text-sm font-light break-words"
        style={{
          fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          letterSpacing: '0.01em',
        }}
      >
        {equation}
      </p>
    </motion.div>
  )
}

export default function EquationPreview() {
  return (
    <section
      className="relative w-full py-28 overflow-hidden"
      style={{
        background: 'var(--color-bg-primary)',
        minHeight: '50vh',
      }}
      id="explore"
    >
      {/* Section header */}
      <motion.div
        className="text-center mb-16 px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span
          className="text-[11px] font-medium tracking-[0.2em] uppercase mb-4 block"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-accent-blue)',
            opacity: 0.55,
          }}
        >
          Explore
        </span>
        <h2
          className="text-3xl md:text-4xl font-semibold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          The Language of the Universe
        </h2>
        <p
          className="mt-4 text-base font-light max-w-lg mx-auto"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
          }}
        >
          Fundamental equations that govern every physical phenomenon,
          ready to be simulated and explored.
        </p>
      </motion.div>

      {/* Equation Cards Grid */}
      <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {equations.map((eq, i) => (
          <EquationCard key={eq.title} {...eq} index={i} />
        ))}
      </div>

      {/* Bottom fade - content continues */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--color-bg-primary), transparent)',
        }}
      />
    </section>
  )
}
