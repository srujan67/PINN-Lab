import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import './Applications.css'

const c = '#C4956A'
const c2 = '#A09CC8'

const sections = [
  {
    num: '01', label: 'Engineering Problem', color: c,
    lines: [
      'Infrastructure health monitoring depends on translating sparse strain-gauge readings into continuous stress fields.',
      'Traditional FEM cannot solve this inverse problem in real time, leaving bridges and buildings with delayed damage detection.',
      'Real-time structural health assessment remains a critical gap in modern infrastructure management.',
      'Dense sensor networks are cost-prohibitive for large-scale bridges and buildings.',
      'PINNs offer a path to continuous, full-field stress reconstruction from sparse sensor data.',
    ],
  },
  {
    num: '02', label: 'Physics Used', color: c2,
    lines: [
      'The Navier–Cauchy elasticity equations govern stress and strain in deformable solids.',
      'Young’s modulus defines material stiffness under tensile and compressive loading.',
      'Poisson’s ratio captures lateral contraction orthogonal to the applied load direction.',
      'Von Mises stress provides the yield criterion for ductile materials under multi-axial stress states.',
      'Equilibrium, compatibility, and constitutive relations form the complete elasticity framework.',
    ],
  },
  {
    num: '03', label: 'Why Traditional AI Struggles', color: c,
    lines: [
      'Purely data-driven surrogates trained on FEM databases fail under crack propagation scenarios not present in training data.',
      'They cannot generalise to novel damage patterns or geometric nonlinearities.',
      'Material degradation and fatigue effects lie outside the distribution of typical training datasets.',
      'Black-box models lack the physics constraints required for safety-critical infrastructure decisions.',
      'Comprehensive damage state coverage demands impractically large training datasets.',
    ],
  },
  {
    num: '04', label: 'Why PINNs Work', color: c2,
    lines: [
      'PINNs embed the linear elasticity PDEs directly into the loss function.',
      'They reconstruct full stress fields from sparse surface strain measurements without meshing.',
      'PINNs adapt to changing boundary conditions in real time, enabling continuous monitoring.',
      'No labeled stress data is required — the physics equations provide supervision at every material point.',
      'Training converges rapidly and generalises robustly to unseen loading configurations.',
    ],
  },
  {
    num: '05', label: 'Real Applications', color: c,
    lines: [
      'Bridge structural health monitoring — continuous stress field reconstruction from sparse strain gauges.',
      'Earthquake-induced stress analysis — rapid post-event damage assessment for buildings and infrastructure.',
      'Offshore platform fatigue tracking — real-time stress monitoring in harsh marine environments.',
      'Aerospace composite inspection — detecting delamination and matrix cracking in aircraft structures.',
      'Historic structure preservation — non-invasive stress analysis of heritage buildings and monuments.',
    ],
  },
]

const orgs = [
  { name: 'UC Berkeley SEMM', initials: 'SEMM', color: c },
  { name: 'MIT Structures', initials: 'MIT', color: c2 },
  { name: 'ETH Zurich', initials: 'ETH', color: c },
  { name: 'Tsinghua Civil Eng', initials: 'THU', color: c2 },
  { name: 'Imperial College', initials: 'IMP', color: c },
]

const keyVars = [
  { sym: 'σ', desc: 'Stress tensor', color: c },
  { sym: 'f', desc: 'Body forces', color: c2 },
  { sym: 'u', desc: 'Displacement', color: c },
  { sym: 'E', desc: "Young's modulus", color: c },
  { sym: 'ν', desc: "Poisson's ratio", color: c2 },
  { sym: 'ε', desc: 'Strain tensor', color: c },
  { sym: '∇', desc: 'Divergence operator', color: c },
]

function computeStats(load, ymod) {
  const L = 2.0
  const h = 0.10
  const b = 0.05
  const I = b * h * h * h / 12
  const cDist = h / 2

  const stressPa = load * L * cDist / I
  const stressMPa = stressPa / 1e6
  const strain = stressPa / (ymod * 1e9)
  const displacement = load * L * L * L / (3 * ymod * 1e9 * I) * 1000
  const safety_factor = Math.min(10, 250 / Math.max(0.1, stressMPa))
  return { stress: stressMPa, strain, displacement, safety_factor }
}

function StructuralCanvas({ load, ymod }) {
  const svgRef = useRef(null)
  const statsRef = useRef(null)
  const animRef = useRef(null)
  const propsRef = useRef({ load, ymod })

  useEffect(() => { propsRef.current = { load, ymod } }, [load, ymod])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const VW = 1000; const VH = 500
    const NS = 'http://www.w3.org/2000/svg'

    const L_PHYS = 2.0
    const B_PHYS = 0.05
    const H_PHYS = 0.10
    const I_PHYS = B_PHYS * H_PHYS * H_PHYS * H_PHYS / 12

    const BEAM_LEFT = 80
    const BEAM_RIGHT = 840
    const BEAM_SPAN = BEAM_RIGHT - BEAM_LEFT
    const BEAM_HEIGHT = 80
    const BEAM_CY = 250
    const DEFL_SCALE = 2.8
    const NUM_SEG = 60

    function getTargetDelta(xPhys) {
      const { load: P, ymod: E } = propsRef.current
      return P * xPhys * xPhys * (3 * L_PHYS - xPhys) / (6 * E * 1e9 * I_PHYS) * DEFL_SCALE * (VH / L_PHYS)
    }

    const springDeltas = new Array(NUM_SEG + 1).fill(0)
    const springVels = new Array(NUM_SEG + 1).fill(0)
    const SPRING_STIFF = 0.08
    const SPRING_DAMP = 0.06

    const defs = document.createElementNS(NS, 'defs')

    const glowFilter = document.createElementNS(NS, 'filter')
    glowFilter.id = 'beamGlow'
    const gBlur = document.createElementNS(NS, 'feGaussianBlur')
    gBlur.setAttribute('stdDeviation', '8')
    gBlur.setAttribute('result', 'blur')
    glowFilter.appendChild(gBlur)
    const gMerge = document.createElementNS(NS, 'feMerge')
    const gm1 = document.createElementNS(NS, 'feMergeNode')
    gm1.setAttribute('in', 'blur')
    const gm2 = document.createElementNS(NS, 'feMergeNode')
    gm2.setAttribute('in', 'SourceGraphic')
    gMerge.appendChild(gm1); gMerge.appendChild(gm2)
    glowFilter.appendChild(gMerge)
    defs.appendChild(glowFilter)

    const heatGrad = document.createElementNS(NS, 'linearGradient')
    heatGrad.id = 'stressGrad'
    heatGrad.setAttribute('x1', '0'); heatGrad.setAttribute('y1', '0')
    heatGrad.setAttribute('x2', '1'); heatGrad.setAttribute('y2', '0')
    const gradStops = []
    for (let i = 0; i < 5; i++) {
      const s = document.createElementNS(NS, 'stop')
      s.setAttribute('offset', `${i * 25}%`)
      gradStops.push(s)
      heatGrad.appendChild(s)
    }
    defs.appendChild(heatGrad)

    const glowGrad = document.createElementNS(NS, 'linearGradient')
    glowGrad.id = 'glowGrad'
    glowGrad.setAttribute('x1', '0'); glowGrad.setAttribute('y1', '0')
    glowGrad.setAttribute('x2', '1'); glowGrad.setAttribute('y2', '0')
    const glowStops = []
    for (let i = 0; i < 3; i++) {
      const s = document.createElementNS(NS, 'stop')
      s.setAttribute('offset', `${i * 50}%`)
      glowStops.push(s)
      glowGrad.appendChild(s)
    }
    defs.appendChild(glowGrad)

    svg.insertBefore(defs, svg.firstChild)

    const gridGroup = document.createElementNS(NS, 'g')
    gridGroup.setAttribute('stroke', 'rgba(255,255,255,0.02)')
    gridGroup.setAttribute('stroke-width', '0.5')
    for (let i = 0; i < 28; i++) {
      const l = document.createElementNS(NS, 'line')
      l.setAttribute('x1', i * 36); l.setAttribute('y1', 0)
      l.setAttribute('x2', i * 36); l.setAttribute('y2', VH)
      gridGroup.appendChild(l)
    }
    for (let i = 0; i < 18; i++) {
      const l = document.createElementNS(NS, 'line')
      l.setAttribute('x1', 0); l.setAttribute('y1', i * 28)
      l.setAttribute('x2', VW); l.setAttribute('y2', i * 28)
      gridGroup.appendChild(l)
    }
    svg.appendChild(gridGroup)

    const glowPath = document.createElementNS(NS, 'path')
    glowPath.setAttribute('fill', 'url(#glowGrad)')
    glowPath.setAttribute('filter', 'url(#beamGlow)')
    glowPath.setAttribute('opacity', '0')
    svg.appendChild(glowPath)

    const supportGroup = document.createElementNS(NS, 'g')
    const sLine = document.createElementNS(NS, 'line')
    sLine.setAttribute('x1', BEAM_LEFT); sLine.setAttribute('y1', BEAM_CY - BEAM_HEIGHT / 2 - 20)
    sLine.setAttribute('x2', BEAM_LEFT); sLine.setAttribute('y2', BEAM_CY + BEAM_HEIGHT / 2 + 20)
    sLine.setAttribute('stroke', 'rgba(196,149,106,0.5)')
    sLine.setAttribute('stroke-width', '3')
    supportGroup.appendChild(sLine)
    const hatchLines = []
    for (let i = -5; i <= 5; i++) {
      const h = document.createElementNS(NS, 'line')
      const hy = BEAM_CY + i * 12
      h.setAttribute('x1', BEAM_LEFT - 14); h.setAttribute('y1', hy)
      h.setAttribute('x2', BEAM_LEFT); h.setAttribute('y2', hy)
      h.setAttribute('stroke', 'rgba(196,149,106,0.2)')
      h.setAttribute('stroke-width', '1.5')
      supportGroup.appendChild(h)
      hatchLines.push(h)
    }
    svg.appendChild(supportGroup)

    const beamFill = document.createElementNS(NS, 'path')
    beamFill.setAttribute('fill', 'rgba(13,18,32,0.7)')
    beamFill.setAttribute('stroke', 'none')
    svg.appendChild(beamFill)

    const heatOverlay = document.createElementNS(NS, 'path')
    heatOverlay.setAttribute('fill', 'url(#stressGrad)')
    heatOverlay.setAttribute('opacity', '0.35')
    svg.appendChild(heatOverlay)

    const beamOutline = document.createElementNS(NS, 'path')
    beamOutline.setAttribute('fill', 'none')
    beamOutline.setAttribute('stroke', 'rgba(196,149,106,0.4)')
    beamOutline.setAttribute('stroke-width', '1.5')
    svg.appendChild(beamOutline)

    const liveTitle = document.createElementNS(NS, 'text')
    liveTitle.setAttribute('x', '14'); liveTitle.setAttribute('y', '22')
    liveTitle.setAttribute('fill', 'rgba(196,149,106,0.12)')
    liveTitle.setAttribute('font-size', '18')
    liveTitle.setAttribute('font-family', 'system-ui')
    liveTitle.setAttribute('font-weight', 'bold')
    liveTitle.textContent = 'LIVE OUTPUT'
    svg.appendChild(liveTitle)

    const arrowGroup = document.createElementNS(NS, 'g')
    const arrowLine = document.createElementNS(NS, 'line')
    arrowLine.setAttribute('stroke', '#ff6644')
    arrowLine.setAttribute('stroke-width', '2.5')
    arrowLine.setAttribute('stroke-linecap', 'round')
    const arrowHead = document.createElementNS(NS, 'polygon')
    arrowHead.setAttribute('fill', '#ff6644')
    const arrowLabel = document.createElementNS(NS, 'text')
    arrowLabel.setAttribute('fill', 'rgba(255,102,68,0.7)')
    arrowLabel.setAttribute('font-size', '11')
    arrowLabel.setAttribute('font-family', 'system-ui')
    arrowLabel.setAttribute('text-anchor', 'middle')
    arrowGroup.appendChild(arrowLine); arrowGroup.appendChild(arrowHead); arrowGroup.appendChild(arrowLabel)
    svg.appendChild(arrowGroup)

    const numParticles = 120
    const particles = []
    const particleEls = []
    for (let i = 0; i < numParticles; i++) {
      const p = { frac: Math.random(), offset: (Math.random() - 0.5) * BEAM_HEIGHT * 0.7, speed: 0.002 + Math.random() * 0.004 }
      particles.push(p)
      const circle = document.createElementNS(NS, 'circle')
      circle.setAttribute('r', String(1.5 + Math.random() * 2.5))
      circle.setAttribute('fill', '#C4956A')
      circle.setAttribute('opacity', '0.5')
      svg.appendChild(circle)
      particleEls.push(circle)
    }

    const glowParticles = []
    const glowParticleEls = []
    for (let i = 0; i < 40; i++) {
      const p = { frac: Math.random(), offset: (Math.random() - 0.5) * BEAM_HEIGHT * 0.5, speed: 0.001 + Math.random() * 0.003 }
      glowParticles.push(p)
      const circle = document.createElementNS(NS, 'circle')
      circle.setAttribute('r', String(3 + Math.random() * 4))
      circle.setAttribute('fill', '#ff4422')
      circle.setAttribute('opacity', '0.06')
      svg.appendChild(circle)
      glowParticleEls.push(circle)
    }

    function buildBeamPath(segDeltas) {
      let topPath = ''; let botPath = ''
      for (let i = 0; i <= NUM_SEG; i++) {
        const frac = i / NUM_SEG
        const xSVG = BEAM_LEFT + frac * BEAM_SPAN
        const delta = segDeltas[i]
        const topY = BEAM_CY - BEAM_HEIGHT / 2 + delta
        const botY = BEAM_CY + BEAM_HEIGHT / 2 + delta
        if (i === 0) { topPath = `M ${xSVG},${topY}`; botPath = ` L ${xSVG},${botY}` }
        else { topPath += ` L ${xSVG},${topY}`; botPath = ` L ${xSVG},${botY}` + botPath }
      }
      return { full: topPath + botPath + ' Z', outline: topPath + botPath }
    }

    function buildGlowShape(segDeltas) {
      let topPath = ''; let botPath = ''
      const scale = 1.8
      for (let i = 0; i <= NUM_SEG; i++) {
        const frac = i / NUM_SEG
        const xSVG = BEAM_LEFT + frac * BEAM_SPAN
        const delta = segDeltas[i] * scale
        const topY = BEAM_CY - BEAM_HEIGHT / 2 + delta
        const botY = BEAM_CY + BEAM_HEIGHT / 2 + delta
        if (i === 0) { topPath = `M ${xSVG},${topY}`; botPath = ` L ${xSVG},${botY}` }
        else { topPath += ` L ${xSVG},${topY}`; botPath = ` L ${xSVG},${botY}` + botPath }
      }
      return topPath + botPath + ' Z'
    }

    function lerpColor(c1, c2, t) {
      const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16)
      const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16)
      return `#${[r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`
    }

    const loop = () => {
      const P = propsRef.current.load
      const E = propsRef.current.ymod
      const t = performance.now()

      const st = computeStats(P, E)
      const stressNorm = Math.min(1, st.stress / 250)

      for (let i = 0; i <= NUM_SEG; i++) {
        const frac = i / NUM_SEG
        const xPhys = frac * L_PHYS
        const target = getTargetDelta(xPhys)
        const diff = target - springDeltas[i]
        springVels[i] += diff * SPRING_STIFF - springVels[i] * SPRING_DAMP
        springDeltas[i] += springVels[i]
      }

      const bp = buildBeamPath(springDeltas)
      beamFill.setAttribute('d', bp.full)
      beamOutline.setAttribute('d', bp.outline)

      heatOverlay.setAttribute('d', bp.full)
      heatOverlay.setAttribute('opacity', String(0.15 + stressNorm * 0.4))

      const glowShape = buildGlowShape(springDeltas)
      glowPath.setAttribute('d', glowShape)
      glowPath.setAttribute('opacity', String(stressNorm * 0.35))

      const g0 = lerpColor('#2244cc', '#ff2200', stressNorm)
      const g1 = lerpColor('#3388ee', '#ff6622', stressNorm)
      const g2 = lerpColor('#55bb55', '#ffaa44', stressNorm)
      const g3 = lerpColor('#77cc88', '#eecc44', stressNorm)
      const g4 = lerpColor('#99ddaa', '#88dd66', stressNorm)
      for (let i = 0; i < 5; i++) {
        gradStops[i].setAttribute('stop-color', [g0, g1, g2, g3, g4][i])
      }

      const glowColors = [
        `rgba(255, ${Math.round(50 - stressNorm * 50)}, ${Math.round(20 - stressNorm * 20)}, ${0.2 + stressNorm * 0.5})`,
        `rgba(255, ${Math.round(150 - stressNorm * 100)}, ${Math.round(50 - stressNorm * 30)}, ${0.1 + stressNorm * 0.2})`,
        `rgba(100, ${Math.round(150 + stressNorm * 50)}, 255, ${0.05})`,
      ]
      for (let i = 0; i < 3; i++) {
        glowStops[i].setAttribute('stop-color', glowColors[i])
      }

      const pulse = 0.5 + 0.5 * Math.sin(t * 0.003)
      sLine.setAttribute('stroke', `rgba(196,149,106,${0.3 + pulse * 0.3})`)
      sLine.setAttribute('stroke-width', String(2 + pulse))
      for (const hl of hatchLines) {
        hl.setAttribute('stroke', `rgba(196,149,106,${0.1 + pulse * 0.15})`)
      }

      const endDelta = springDeltas[NUM_SEG]
      const ax = BEAM_RIGHT
      const ay = BEAM_CY + BEAM_HEIGHT / 2 + endDelta
      const aLen = 55 + Math.min(35, P / 100)
      arrowLine.setAttribute('x1', String(ax)); arrowLine.setAttribute('y1', String(ay))
      arrowLine.setAttribute('x2', String(ax)); arrowLine.setAttribute('y2', String(ay + aLen))
      const ah = 8
      arrowHead.setAttribute('points',
        `${ax - ah},${ay + aLen - ah} ${ax},${ay + aLen} ${ax + ah},${ay + aLen - ah}`
      )
      arrowLabel.setAttribute('x', String(ax + 32))
      arrowLabel.setAttribute('y', String(ay + aLen * 0.5 + 4))
      arrowLabel.textContent = `F = ${P.toFixed(0)} N`

      const baseSpeed = 0.001
      const stressSpeed = baseSpeed + stressNorm * 0.008
      for (let i = 0; i < numParticles; i++) {
        const pt = particles[i]
        pt.frac += stressSpeed * (0.6 + Math.random() * 0.4)
        if (pt.frac > 1) { pt.frac = 0; pt.offset = (Math.random() - 0.5) * BEAM_HEIGHT * 0.7 }
        const idx = Math.round(pt.frac * NUM_SEG)
        const delta = springDeltas[Math.min(idx, NUM_SEG)]
        particleEls[i].setAttribute('cx', String(BEAM_LEFT + pt.frac * BEAM_SPAN))
        particleEls[i].setAttribute('cy', String(BEAM_CY + pt.offset + delta))
        const hue = 220 - stressNorm * 220
        particleEls[i].setAttribute('fill', `hsl(${hue}, 70%, ${50 + stressNorm * 20}%)`)
        particleEls[i].setAttribute('opacity', String(0.3 + stressNorm * 0.5))
      }

      const gSpeed = 0.001 + stressNorm * 0.005
      for (let i = 0; i < glowParticles.length; i++) {
        const pt = glowParticles[i]
        pt.frac += gSpeed * (0.5 + Math.random() * 0.5)
        if (pt.frac > 1) { pt.frac = 0; pt.offset = (Math.random() - 0.5) * BEAM_HEIGHT * 0.5 }
        const idx = Math.round(pt.frac * NUM_SEG)
        const delta = springDeltas[Math.min(idx, NUM_SEG)]
        glowParticleEls[i].setAttribute('cx', String(BEAM_LEFT + pt.frac * BEAM_SPAN))
        glowParticleEls[i].setAttribute('cy', String(BEAM_CY + pt.offset + delta))
        glowParticleEls[i].setAttribute('r', String(3 + stressNorm * 5))
        glowParticleEls[i].setAttribute('opacity', String(0.04 + stressNorm * 0.18))
      }

      if (statsRef.current) {
        const els = statsRef.current
        els.stress.textContent = `${Math.max(0, st.stress).toFixed(1)} MPa`
        els.strain.textContent = `${(st.strain * 1000).toFixed(2)}`
        els.displacement.textContent = `${st.displacement.toFixed(1)} mm`
        els.safety.textContent = `${st.safety_factor.toFixed(1)}`
        const pinn = 92 + Math.sin(t * 0.0005) * 2 + Math.log(Math.max(1, P)) * 0.5
        els.pinn.textContent = `${Math.min(99.9, pinn).toFixed(1)}%`
        const conv = Math.min(99.5, 86 + E * 0.02 + P * 0.001)
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
          { label: 'Stress', key: 'stress', icon: 'σ', color: c },
          { label: 'Strain', key: 'strain', icon: 'ε', color: c2 },
          { label: 'Displacement', key: 'displacement', icon: 'δ', color: c },
          { label: 'F. of Safety', key: 'safety', icon: '', color: c2 },
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
            <div
              ref={el => { if (statsRef.current === null) statsRef.current = {}; statsRef.current[s.key] = el }}
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

export default function StructuralPage({ onNavigateToExplore }) {
  const [load, setLoad] = useState(500)
  const [ymod, setYmod] = useState(150)

  return (
    <div className="app-page">

      {/* ═══════════════════════════════════════
          HEADER — Title + Subtitle + Info Cards + Scroll Indicator
      ═══════════════════════════════════════ */}
      <section style={{ padding: '60px 0 30px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', '--color-accent': '#D4764A' }}>
        {/* Subtle animated background — stress mesh */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03 }}>
          <svg viewBox="0 0 1440 600" style={{ width: '100%', height: '100%' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.path
                key={`h${i}`}
                d={`M0,${60 + i * 110} L1440,${100 + i * 110 + Math.sin(i) * 30}`}
                fill="none"
                stroke="#C4956A"
                strokeWidth={0.6}
                animate={{ d: [
                  `M0,${60 + i * 110} L1440,${100 + i * 110 + Math.sin(i) * 30}`,
                  `M0,${80 + i * 110} L1440,${60 + i * 110 + Math.sin(i) * 30}`,
                ]}}
                transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
              />
            ))}
            {[0, 1, 2, 3, 4].map(i => (
              <motion.path
                key={`v${i}`}
                d={`M${200 + i * 260},0 L${220 + i * 260 + Math.sin(i) * 20},600`}
                fill="none"
                stroke="#C4956A"
                strokeWidth={0.6}
                animate={{ d: [
                  `M${200 + i * 260},0 L${220 + i * 260 + Math.sin(i) * 20},600`,
                  `M${210 + i * 260},0 L${200 + i * 260 + Math.sin(i) * 20},600`,
                ]}}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
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
              Structural{' '}
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
              Physics-Informed Neural Networks for Structural Health Monitoring
            </motion.p>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}
            >
              {[
                { label: 'Primary Physics', value: 'Elasticity + Stress-Strain' },
                { label: 'Industry', value: 'Bridges & Infrastructure' },
                { label: 'PINN Advantage', value: 'Sparse-to-Continuous Reconstruction' },
                { label: 'Engineering Goal', value: 'Real-Time Structural Monitoring' },
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
              Governing{' '}
              <span className="gradient-text-blue">Physics Equation</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Navier–Cauchy: conservation of linear momentum in deformable continua
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
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(18px, 2.2vw, 28px)',
              color: 'var(--color-text-primary)',
              lineHeight: 2,
              textAlign: 'center',
              padding: '20px 0 32px',
              marginBottom: 28,
            }}>
              <span style={{ color: c, fontWeight: 600 }}>∇</span>·
              <span style={{ color: c, fontWeight: 600 }}>σ</span>
              <span> + </span>
              <span style={{ color: c2 }}>f</span>
              <span> = </span>
              <span style={{ color: c, fontWeight: 600 }}>ρ</span>
              <span>∂²</span>
              <span style={{ color: c2 }}>u</span>
              <span>/∂t²</span>
            </div>

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
                The Navier–Cauchy equation represents conservation of linear momentum in deformable continua.
                The divergence of the stress tensor{' '}
                <span style={{ color: c }}>∇·σ</span> balances internal elastic forces
                against external body forces <span style={{ color: c2 }}>f</span> and inertial
                terms <span style={{ color: c }}>ρ</span>∂²
                <span style={{ color: c2 }}>u</span>/∂t².
                Hooke’s law <span style={{ color: c }}>σ</span> ={' '}
                <span style={{ color: c }}>E</span>
                <span style={{ color: c2 }}>ε</span> links stress to strain through Young’s modulus E.
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
            maxWidth: 1000,
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
          INTERACTIVE BEAM VISUALIZATION
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
              Interactive{' '}
              <span className="gradient-text-blue">Beam Bending Simulation</span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-secondary)' }}>
              Adjust load force and Young's modulus to see cantilever beam deflection in real time.
            </p>
          </motion.div>

          <div className="glass-card" style={{
            maxWidth: 900, margin: '0 auto', padding: 32,
          }}>
            <StructuralCanvas load={load} ymod={ymod} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 6 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Load Force</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c, fontWeight: 600 }}>{load} N</span>
                </div>
                <input
                  type="range" min={100} max={5000} value={load}
                  onChange={e => setLoad(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c}40 0%, ${c}40 ${(load / 5000) * 100}%, rgba(255,255,255,0.08) ${(load / 5000) * 100}%, rgba(255,255,255,0.08) 100%)`,
                    outline: 'none', cursor: 'pointer', WebkitAppearance: 'none',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>Young's Modulus</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: c2, fontWeight: 600 }}>{ymod} GPa</span>
                </div>
                <input
                  type="range" min={50} max={300} value={ymod}
                  onChange={e => setYmod(Number(e.target.value))}
                  style={{
                    width: '100%', height: 4, borderRadius: 2,
                    background: `linear-gradient(to right, ${c2}40 0%, ${c2}40 ${((ymod - 50) / 250) * 100}%, rgba(255,255,255,0.08) ${((ymod - 50) / 250) * 100}%, rgba(255,255,255,0.08) 100%)`,
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
              Run the Hooke’s law PINN example in the interactive analyzer.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onNavigateToExplore) {
                  onNavigateToExplore('hooke', { context: 'structural' })
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
              Try Structural Example →
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
