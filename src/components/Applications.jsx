import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import './Applications.css'

// ═══════════════════════════════════════════════════════════════
//  DATA — Industries, Simulations, Future Cards
// ═══════════════════════════════════════════════════════════════

const INDUSTRIES = [
  {
    id: 'aerospace',
    name: 'Aerospace',
    icon: '✈',
    color: '#C4956A',
    physics: 'Navier–Stokes Equations',
    summary: 'Solve Navier–Stokes equations for aerodynamic analysis without costly CFD meshing.',
    shortDesc: 'Predicting aerodynamic forces on aircraft surfaces requires solving high-dimensional Navier–Stokes equations. Traditional CFD solvers take hours per run and demand supercomputing resources.',
    pinnAdvantage: 'PINNs embed the Navier–Stokes equations into the neural loss function, producing physically consistent flow fields from sparse surface pressure data — no mesh generation needed.',
    applications: ['Aircraft design', 'Drone optimization', 'Wind tunnel analysis'],
    overview: 'Aerospace engineering depends on accurate aerodynamic modelling for drag reduction, structural load prediction, and flight envelope expansion. Current CFD pipelines remain bottlenecked by mesh generation and iterative solvers.',
    traditionalAIStruggle: 'Purely data-driven models cannot guarantee conservation of mass, momentum, and energy. They often produce non-physical flow separations and violate Bernoulli\'s principle when extrapolating beyond training regimes.',
    researchOrganizations: ['NASA', 'ESA', 'Boeing Research', 'DLR', 'MIT AeroAstro'],
    futureScope: 'Digital twin of complete aircraft with real-time aerodynamic feedback during flight. Full-engine combustion modelling with PINN-accelerated LES solvers.',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🫀',
    color: '#E07840',
    physics: 'Fluid Dynamics',
    summary: 'Non-invasive blood flow estimation from sparse MRI velocity data using physics-constrained networks.',
    shortDesc: 'Non-invasive blood flow estimation from sparse MRI velocity measurements is an ill-posed inverse problem. Standard methods either ignore physics or require costly 4D flow scans.',
    pinnAdvantage: 'PINNs enforce Navier–Stokes conservation of mass and momentum as soft constraints, recovering full pressure and velocity fields from limited, noisy clinical data.',
    applications: ['Cardiology', 'Medical imaging', 'Patient monitoring'],
    overview: 'Cardiovascular diagnostics increasingly rely on image-based flow estimation. However, clinical acquisition times constrain MRI velocity encoding, leaving large gaps in the measured flow field.',
    traditionalAIStruggle: 'Black-box neural networks trained on labelled flow data fail to enforce no-slip boundary conditions at vessel walls, producing unphysical flow patterns that cannot be used for clinical decisions.',
    researchOrganizations: ['Stanford Bioengineering', 'Johns Hopkins BME', 'Siemens Healthineers', 'NIH'],
    futureScope: 'Real-time intraoperative blood flow monitoring during surgery. Patient-specific digital heart models for surgical planning without invasive catheterisation.',
  },
  {
    id: 'climate',
    name: 'Climate & Weather',
    icon: '🌍',
    color: '#88C0B8',
    physics: 'Heat Transfer + Fluid Dynamics',
    summary: 'Physically consistent forecasts by assimilating sparse observations into governing equations.',
    shortDesc: 'Numerical weather models require dense sensor networks and massive computation. Gaps in observational data lead to forecast drift beyond a few days.',
    pinnAdvantage: 'PINNs assimilate sparse observational data while respecting thermodynamic and fluid conservation laws, producing physically consistent forecasts without full-grid simulation.',
    applications: ['Weather forecasting', 'Climate modelling', 'Ocean simulation'],
    overview: 'Climate models discretise the Navier–Stokes and thermodynamic equations on grids that are too coarse to resolve critical processes like cloud formation and turbulent mixing.',
    traditionalAIStruggle: 'Statistical downscaling and pure ML weather models frequently violate energy conservation, generating unrealistic precipitation patterns and temperature distributions over multi-week forecasts.',
    researchOrganizations: ['ECMWF', 'NOAA', 'NCAR', 'MIT Lorenz Center', 'ETH Zurich'],
    futureScope: 'Global kilometre-scale climate emulators that run orders of magnitude faster than traditional GCMs. PINN-based subgrid parameterisation for cloud and aerosol physics.',
  },
  {
    id: 'structural',
    name: 'Structural Engineering',
    icon: '🏗',
    color: '#C4956A',
    physics: 'Elasticity + Stress-Strain',
    summary: 'Real-time stress field reconstruction from sparse strain-gauge readings without FEM meshing.',
    shortDesc: 'Finite-element analysis of large infrastructure is computationally expensive and requires full boundary condition specification. Real-time health monitoring remains a challenge.',
    pinnAdvantage: 'PINNs solve the elasticity PDEs directly from sparse strain-gauge readings, enabling real-time stress field reconstruction without meshing or full FEM solves.',
    applications: ['Bridge design', 'Building analysis', 'Earthquake engineering'],
    overview: 'Structural health monitoring systems deploy sparse sensor networks on bridges, dams, and buildings. Translating discrete strain measurements into a continuous stress field is an inverse problem that FEM cannot solve in real time.',
    traditionalAIStruggle: 'Regression-based surrogates trained on FEM data fail under damage or degradation scenarios not represented in the training set. They cannot generalise to novel crack patterns or material nonlinearities.',
    researchOrganizations: ['UC Berkeley SEMM', 'MIT Structures', 'ETH Zurich', 'Tsinghua Civil Eng'],
    futureScope: 'Self-diagnosing infrastructure that continuously updates a physics-consistent stress map from cheap vibration sensors. PINN-based fracture propagation models for earthquake resilience.',
  },
  {
    id: 'energy',
    name: 'Renewable Energy',
    icon: '⚡',
    color: '#C4956A',
    physics: 'Fluid Flow + Heat Transfer',
    summary: 'Instant what-if predictions for wind farm layout and solar panel optimisation.',
    shortDesc: 'Optimising wind farm layouts and solar panel efficiency requires high-fidelity flow and thermal simulation. Conventional methods cannot keep pace with real-time operational data.',
    pinnAdvantage: 'PINNs fuse sparse sensor data with the governing flow and heat equations, providing instant what-if predictions for turbine placement and panel orientation.',
    applications: ['Wind farm layout', 'Solar panel optimization', 'Grid integration'],
    overview: 'Wind farm operators face complex wake-turbine interactions that reduce downstream energy capture by 20–40%. Optimising turbine placement requires thousands of expensive LES simulations.',
    traditionalAIStruggle: 'Data-driven wake models trained on historical SCADA data fail outside the specific wind conditions and turbine configurations seen during training, leading to suboptimal real-time control.',
    researchOrganizations: ['NREL', 'DTU Wind Energy', 'Stanford Energy', 'Siemens Gamesa'],
    futureScope: 'Collaborative wind farm control where each turbine\'s PINN communicates wake effects to neighbours in real time. PINN-driven electrolyser optimisation for green hydrogen production.',
  },
  {
    id: 'battery',
    name: 'Battery Technology',
    icon: '🔋',
    color: '#A09CC8',
    physics: 'Electrochemical Equations',
    summary: 'Predict capacity fade and internal states from surface voltage and current data alone.',
    shortDesc: 'Battery degradation models rely on empirical curve-fitting that fails under novel charge cycles. First-principles electrochemical models are too slow for real-time battery management.',
    pinnAdvantage: 'PINNs embed the porous electrode theory and lithium diffusion equations into the network, predicting capacity fade and internal states from surface voltage/current data alone.',
    applications: ['Electric vehicles', 'Energy storage', 'Consumer electronics'],
    overview: 'Lithium-ion battery degradation is governed by coupled electrochemical and thermal processes that are prohibitively expensive to simulate online for battery management systems.',
    traditionalAIStruggle: 'Equivalent circuit models and data-driven degradation predictors lose accuracy under fast-charging, low-temperature, or high-cycle conditions because they ignore the underlying diffusion and reaction kinetics.',
    researchOrganizations: ['MIT Battery Lab', 'Stanford PECASE', 'Tesla', 'Panasonic Energy'],
    futureScope: 'Embedded PINN-based battery management system chips that predict internal states in real time. Physics-constrained fast-charging protocols personalised to each cell\'s degradation trajectory.',
  },
]

// ═══════════════════════════════════════════════════════════════
//  HERO CANVAS — Particles + Floating Equations
// ═══════════════════════════════════════════════════════════════

function HeroCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.parentElement.clientWidth
      h = canvas.parentElement.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Particles
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.1,
    }))

    // Floating equations
    const equations = ['∇²ψ', 'F=ma', 'E=mc²', '∂u/∂t', 'ΔS≥0', 'λ=h/p', 'PV=nRT', '∇×B']
    const floatingEqs = equations.map((eq, i) => ({
      text: eq,
      x: Math.random() * w,
      y: Math.random() * h,
      vy: -0.15 - Math.random() * 0.1,
      alpha: Math.random() * 0.08 + 0.03,
      size: Math.random() * 6 + 12,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(196, 149, 106, ${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196, 149, 106, ${p.alpha})`
        ctx.fill()
      }

      // Draw floating equations
      for (const eq of floatingEqs) {
        eq.y += eq.vy
        if (eq.y < -30) {
          eq.y = h + 20
          eq.x = Math.random() * w
        }
        ctx.font = `${eq.size}px "Space Grotesk", monospace`
        ctx.fillStyle = `rgba(160, 156, 200, ${eq.alpha})`
        ctx.fillText(eq.text, eq.x, eq.y)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
}

// ═══════════════════════════════════════════════════════════════
//  INDUSTRY CANVAS ILLUSTRATIONS
// ═══════════════════════════════════════════════════════════════

function IndustryCanvas({ industryId, color }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = 280
    const h = 140
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    let t = 0

    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)

      const hex2rgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return { r, g, b }
      }
      const c = hex2rgb(color)

      switch (industryId) {
        case 'aerospace': {
          // Airfoil shape
          const cx = w / 2
          const cy = h / 2 + 5
          ctx.beginPath()
          ctx.moveTo(cx - 80, cy)
          ctx.bezierCurveTo(cx - 40, cy - 25, cx + 20, cy - 22, cx + 80, cy - 2)
          ctx.bezierCurveTo(cx + 20, cy + 8, cx - 40, cy + 10, cx - 80, cy)
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.15)`
          ctx.fill()
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.4)`
          ctx.lineWidth = 1.5
          ctx.stroke()
          // Streamlines
          for (let i = 0; i < 8; i++) {
            const yOff = -30 + i * 9
            ctx.beginPath()
            for (let x = 0; x < w; x += 3) {
              const distFromCenter = Math.abs(x - cx) / 80
              const deflection = distFromCenter < 1 ? (yOff < 0 ? -1 : 1) * 6 * (1 - distFromCenter) * Math.sin(t + i) : 0
              const py = cy + yOff + deflection + Math.sin(x * 0.03 + t * 2 + i) * 1.5
              if (x === 0) ctx.moveTo(x, py)
              else ctx.lineTo(x, py)
            }
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.1 + Math.abs(yOff) * 0.003})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
          break
        }
        case 'healthcare': {
          // Artery + flowing particles
          const cy = h / 2
          // Artery walls
          ctx.beginPath()
          for (let x = 0; x < w; x += 2) {
            const wallY = 18 + Math.sin(x * 0.04 + t * 0.5) * 3
            ctx.moveTo(x, cy - wallY)
            ctx.lineTo(x + 2, cy - wallY)
          }
          for (let x = w; x >= 0; x -= 2) {
            const wallY = 18 + Math.sin(x * 0.04 + t * 0.5) * 3
            ctx.lineTo(x, cy + wallY)
          }
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.25)`
          ctx.lineWidth = 2
          ctx.stroke()
          // Blood particles
          for (let i = 0; i < 30; i++) {
            const px = ((i * 37 + t * 60) % (w + 20)) - 10
            const wallAmplitude = 14 + Math.sin(px * 0.04 + t * 0.5) * 3
            const py = cy + (Math.sin(i * 7.3) * 0.8) * wallAmplitude
            const size = 2 + Math.sin(i * 2.1) * 1
            ctx.beginPath()
            ctx.arc(px, py, size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.3 + Math.sin(t + i) * 0.15})`
            ctx.fill()
          }
          break
        }
        case 'climate': {
          // Cloud-like formations + wind vectors
          for (let i = 0; i < 5; i++) {
            const cx2 = 40 + i * 55 + Math.sin(t * 0.3 + i) * 10
            const cy2 = 30 + Math.sin(t * 0.5 + i * 2) * 15
            const r = 18 + Math.sin(i * 1.5) * 8
            ctx.beginPath()
            ctx.arc(cx2, cy2, r, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.06)`
            ctx.fill()
            ctx.beginPath()
            ctx.arc(cx2 + 12, cy2 - 5, r * 0.7, 0, Math.PI * 2)
            ctx.fill()
          }
          // Wind vectors
          for (let r = 0; r < 6; r++) {
            for (let cc = 0; cc < 10; cc++) {
              const x = cc * 28 + 10
              const y = 70 + r * 12
              const len = 10 + Math.sin(t + r + cc * 0.5) * 5
              ctx.beginPath()
              ctx.moveTo(x, y)
              ctx.lineTo(x + len, y - 2 + Math.sin(t * 2 + cc) * 2)
              ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.15)`
              ctx.lineWidth = 0.8
              ctx.stroke()
            }
          }
          break
        }
        case 'structural': {
          // Bridge shape
          const groundY = h - 25
          const archH = 50 + Math.sin(t * 0.8) * 3
          ctx.beginPath()
          ctx.moveTo(20, groundY)
          ctx.quadraticCurveTo(w / 2, groundY - archH, w - 20, groundY)
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.4)`
          ctx.lineWidth = 3
          ctx.stroke()
          // Deck
          ctx.beginPath()
          ctx.moveTo(10, groundY)
          ctx.lineTo(w - 10, groundY)
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`
          ctx.lineWidth = 2
          ctx.stroke()
          // Cables
          for (let i = 0; i < 10; i++) {
            const x = 30 + (i / 9) * (w - 60)
            const archY = groundY - archH * (1 - Math.pow((x - w / 2) / (w / 2 - 20), 2))
            ctx.beginPath()
            ctx.moveTo(x, archY)
            ctx.lineTo(x, groundY)
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.15)`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
          // Load indicator
          const loadX = w / 2
          const loadDeflect = Math.sin(t) * 4
          ctx.beginPath()
          ctx.moveTo(loadX, groundY - 10)
          ctx.lineTo(loadX, groundY + loadDeflect)
          ctx.strokeStyle = `rgba(255, 100, 100, 0.4)`
          ctx.lineWidth = 1.5
          ctx.stroke()
          break
        }
        case 'energy': {
          // Wind turbine
          const hubX = w * 0.3
          const hubY = h * 0.4
          const bladeLen = 35
          for (let i = 0; i < 3; i++) {
            const angle = t * 2 + (i * Math.PI * 2) / 3
            ctx.beginPath()
            ctx.moveTo(hubX, hubY)
            ctx.lineTo(hubX + Math.cos(angle) * bladeLen, hubY + Math.sin(angle) * bladeLen)
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.5)`
            ctx.lineWidth = 3
            ctx.stroke()
          }
          ctx.beginPath()
          ctx.arc(hubX, hubY, 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`
          ctx.fill()
          // Tower
          ctx.beginPath()
          ctx.moveTo(hubX, hubY + 4)
          ctx.lineTo(hubX, h - 15)
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`
          ctx.lineWidth = 2
          ctx.stroke()
          // Sun (solar)
          const sunX = w * 0.75
          const sunY = h * 0.35
          ctx.beginPath()
          ctx.arc(sunX, sunY, 14, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.2)`
          ctx.fill()
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + t * 0.3
            ctx.beginPath()
            ctx.moveTo(sunX + Math.cos(a) * 18, sunY + Math.sin(a) * 18)
            ctx.lineTo(sunX + Math.cos(a) * 26, sunY + Math.sin(a) * 26)
            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.2)`
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
          // Solar panel
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.12)`
          ctx.fillRect(w * 0.62, h * 0.65, 50, 25)
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.2)`
          ctx.strokeRect(w * 0.62, h * 0.65, 50, 25)
          break
        }
        case 'battery': {
          // Battery shape
          const bx = w / 2 - 40
          const by = 20
          const bw = 80
          const bh = h - 40
          ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`
          ctx.lineWidth = 2
          ctx.strokeRect(bx, by, bw, bh)
          // Terminal
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`
          ctx.fillRect(bx + bw / 2 - 10, by - 6, 20, 6)
          // Charge level (animated)
          const chargeLevel = 0.3 + (Math.sin(t * 0.5) + 1) / 2 * 0.6
          const chargeH = bh * chargeLevel - 4
          const grad = ctx.createLinearGradient(bx, by + bh - chargeH - 2, bx, by + bh - 2)
          grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.5)`)
          grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.15)`)
          ctx.fillStyle = grad
          ctx.fillRect(bx + 3, by + bh - chargeH - 2, bw - 6, chargeH)
          // Heat map dots
          for (let i = 0; i < 15; i++) {
            const dotX = bx + 10 + Math.random() * (bw - 20)
            const dotY = by + bh - chargeH + Math.random() * chargeH
            const temp = Math.random()
            ctx.beginPath()
            ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, ${Math.floor(150 * (1 - temp))}, ${Math.floor(50 * (1 - temp))}, ${0.2 + temp * 0.3})`
            ctx.fill()
          }
          break
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [industryId, color])

  return <canvas ref={canvasRef} style={{ width: 280, height: 140, borderRadius: 12 }} />
}

// ═══════════════════════════════════════════════════════════════
//  INDUSTRY ANIMATION (SVG + Framer Motion)
// ═══════════════════════════════════════════════════════════════

function IndustryGraphic({ industryId, color }) {
  const c = color

  switch (industryId) {
    case 'aerospace': {
      const wingPath = 'M40,160 Q140,60 260,140 Q140,120 40,160'
      const streamlines = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({
        y: 40 + i * 16,
        delay: i * 0.15,
      }))
      return (
        <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16 }}>
          <defs>
            <linearGradient id="wingGradA" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={`${c}30`} />
              <stop offset="100%" stopColor={`${c}60`} />
            </linearGradient>
          </defs>
          {streamlines.map((s, i) => (
            <motion.path
              key={i}
              d="M10,0 Q80,0 160,0 Q240,0 310,0"
              fill="none"
              stroke={`${c}30`}
              strokeWidth={1}
              strokeDasharray="6 4"
              initial={{ pathLength: 0, opacity: 0.1 }}
              animate={{ pathLength: [0, 1, 0], opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, delay: s.delay, ease: 'linear' }}
              style={{ transform: `translateY(${s.y}px)` }}
            />
          ))}
          <motion.path
            d={wingPath}
            fill="url(#wingGradA)"
            stroke={c}
            strokeWidth={1.5}
            animate={{ d: ['M40,160 Q140,60 260,140 Q140,120 40,160', 'M40,160 Q140,55 260,138 Q140,118 40,160', 'M40,160 Q140,60 260,140 Q140,120 40,160'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            r={3} fill={c} cx={40} cy={155}
            animate={{ cx: [40, 260, 40] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <motion.circle
            r={2} fill={c} opacity={0.4} cx={60} cy={130}
            animate={{ cx: [60, 280, 60] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear', delay: 0.5 }}
          />
        </svg>
      )
    }
    case 'healthcare': {
      const particles = Array.from({ length: 20 }, (_, i) => ({
        yOff: Math.sin(i * 1.7) * 35,
        delay: i * 0.3,
        r: 2 + Math.sin(i * 2.3) * 1.5,
      }))
      return (
        <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16 }}>
          <defs>
            <linearGradient id="arteryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`${c}20`} />
              <stop offset="50%" stopColor={`${c}40`} />
              <stop offset="100%" stopColor={`${c}20`} />
            </linearGradient>
          </defs>
          {/* Artery walls */}
          <motion.path
            d="M0,80 Q80,70 160,85 Q240,100 320,85"
            fill="none"
            stroke={`${c}30`}
            strokeWidth={2}
            animate={{ d: ['M0,80 Q80,70 160,85 Q240,100 320,85', 'M0,82 Q80,74 160,87 Q240,98 320,83', 'M0,80 Q80,70 160,85 Q240,100 320,85'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M0,120 Q80,130 160,115 Q240,100 320,115"
            fill="none"
            stroke={`${c}30`}
            strokeWidth={2}
            animate={{ d: ['M0,120 Q80,130 160,115 Q240,100 320,115', 'M0,118 Q80,126 160,113 Q240,102 320,117', 'M0,120 Q80,130 160,115 Q240,100 320,115'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <rect x="0" y="80" width="320" height="40" fill="url(#arteryGrad)" rx="20" ry="20" />
          {/* Blood particles */}
          {particles.map((p, i) => (
            <motion.circle
              key={i}
              r={p.r}
              fill={c}
              opacity={0.6}
              initial={{ x: -10, y: 100 + p.yOff }}
              animate={{ x: [0, 340], y: [100 + p.yOff, 100 - p.yOff * 0.3, 100 + p.yOff] }}
              transition={{ duration: 4, repeat: Infinity, delay: p.delay, ease: 'linear' }}
            />
          ))}
          <text x="16" y="110" fill={`${c}50`} fontSize="11" fontFamily="var(--font-body)" opacity={0.5}>Blood flow direction →</text>
        </svg>
      )
    }
    case 'climate': {
      const vectors = Array.from({ length: 40 }, (_, i) => ({
        row: Math.floor(i / 8),
        col: i % 8,
        len: 10 + Math.sin(i * 1.3) * 6,
        delay: i * 0.1,
      }))
      return (
        <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E07840" />
              <stop offset="50%" stopColor={`${c}`} />
              <stop offset="100%" stopColor="#C4956A" />
            </linearGradient>
          </defs>
          <motion.rect
            x="0" y="0" width="320" height="200" fill="url(#tempGrad)" opacity={0.08}
            animate={{ opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          {vectors.map((v, i) => {
            const x = 20 + v.col * 38
            const y = 20 + v.row * 22
            return (
              <g key={i}>
                <motion.line
                  x1={x} y1={y}
                  x2={x + v.len} y2={y}
                  stroke={`${c}40`}
                  strokeWidth={1}
                  animate={{ x2: [x + v.len, x + v.len - 4, x + v.len] }}
                  transition={{ duration: 2, repeat: Infinity, delay: v.delay, ease: 'easeInOut' }}
                />
                <motion.polygon
                  points={`${x + v.len},${y - 2} ${x + v.len + 4},${y} ${x + v.len},${y + 2}`}
                  fill={`${c}50`}
                  animate={{ x: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: v.delay, ease: 'easeInOut' }}
                />
              </g>
            )
          })}
          <text x="120" y="190" fill={`${c}40`} fontSize="11" fontFamily="var(--font-body)">Wind field + temperature gradient</text>
        </svg>
      )
    }
    case 'structural': {
      return (
        <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16 }}>
          {/* Arch bridge */}
          <motion.path
            d="M20,170 Q160,20 300,170"
            fill="none"
            stroke={c}
            strokeWidth={3}
            animate={{ d: ['M20,170 Q160,20 300,170', 'M20,170 Q160,28 300,170', 'M20,170 Q160,20 300,170'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Deck */}
          <line x1="10" y1="170" x2="310" y2="170" stroke={`${c}40`} strokeWidth={2} />
          {/* Cables */}
          {Array.from({ length: 11 }, (_, i) => i).map(i => {
            const x = 30 + (i / 10) * 260
            const archY = 170 - 150 * (1 - Math.pow((x - 160) / 140, 2))
            return (
              <motion.line
                key={i}
                x1={x} y1={archY} x2={x} y2={170}
                stroke={`${c}20`}
                strokeWidth={0.8}
                animate={{ y1: [archY, archY + 2, archY] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )
          })}
          {/* Load arrow */}
          <motion.g
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <line x1="160" y1="155" x2="160" y2="180" stroke="#E07840" strokeWidth={2} />
            <polygon points="160,153 154,162 166,162" fill="#E07840" />
            <text x="170" y="172" fill="#E07840" fontSize="11" fontFamily="var(--font-body)">Load</text>
          </motion.g>
          {/* Supports */}
          <rect x="14" y="170" width="12" height="20" fill={`${c}25`} rx="1" />
          <rect x="294" y="170" width="12" height="20" fill={`${c}25`} rx="1" />
        </svg>
      )
    }
    case 'energy': {
      return (
        <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16 }}>
          {/* Tower */}
          <rect x="77" y="90" width="6" height="95" fill={`${c}30`} rx="1" />
          {/* Rotating blades */}
          <motion.g
            style={{ originX: 80, originY: 90 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1, 2].map(i => (
              <line
                key={i}
                x1="80" y1="90"
                x2={80 + Math.cos((i * 120 * Math.PI) / 180) * 50}
                y2={90 + Math.sin((i * 120 * Math.PI) / 180) * 50}
                stroke={c}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.6}
              />
            ))}
            <circle cx="80" cy="90" r="5" fill={c} opacity={0.8} />
          </motion.g>
          {/* Flow lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <motion.path
              key={i}
              d={`M${160 + i * 30},${40 + i * 8} Q${180 + i * 30},${50 + i * 8} ${200 + i * 30},${60 + i * 8}`}
              fill="none"
              stroke={`${c}25`}
              strokeWidth={1}
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2, ease: 'linear' }}
            />
          ))}
          {/* Sun */}
          <motion.circle
            cx="260" cy="40" r="20"
            fill="none"
            stroke="#C4956A"
            strokeWidth={1.5}
            opacity={0.4}
            animate={{ r: [20, 24, 20], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="260" cy="40" r="10"
            fill="#C4956A"
            opacity={0.3}
            animate={{ r: [10, 14, 10], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      )
    }
    case 'battery': {
      return (
        <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16 }}>
          <defs>
            <radialGradient id="heatGrad" cx="50%" cy="80%" r="60%">
              <stop offset="0%" stopColor="#E07840" stopOpacity={0.6} />
              <stop offset="50%" stopColor={c} stopOpacity={0.3} />
              <stop offset="100%" stopColor={`${c}10`} stopOpacity={0.05} />
            </radialGradient>
          </defs>
          {/* Battery body */}
          <rect x="100" y="20" width="120" height="160" rx="8" fill="none" stroke={`${c}30`} strokeWidth={2} />
          <rect x="100" y="20" width="120" height="160" rx="8" fill="url(#heatGrad)" />
          {/* Terminal */}
          <rect x="145" y="10" width="30" height="10" rx="2" fill={`${c}30`} />
          {/* Animated heat plume */}
          <motion.rect
            x="104" y="24" width="112" height="152" rx="6"
            fill={`${c}15`}
            animate={{ y: [20, 16, 20], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Level indicator */}
          <motion.rect
            x="108" y={160} width="104" height={12} rx="3"
            fill={c}
            opacity={0.5}
            animate={{ height: [12, 60, 12] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Heat particles */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.circle
              key={i}
              r={2 + Math.sin(i * 2) * 1}
              fill="#E07840"
              opacity={0.4}
              initial={{ x: 110 + i * 18, y: 160 }}
              animate={{ y: [160, 40, 160], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            />
          ))}
          <text x="130" y="195" fill={`${c}40`} fontSize="11" fontFamily="var(--font-body)">Thermal distribution</text>
        </svg>
      )
    }
    default:
      return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  AEROSPACE VISUALIZATION (Wing + Airflow Streamlines)
// ═══════════════════════════════════════════════════════════════
//  MAIN APPLICATIONS COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Applications({
  onNavigateToExplore,
  onNavigateToAerospace,
  onNavigateToStructural,
  onNavigateToHealthcare,
  onNavigateToClimate,
  onNavigateToEnergy,
  onNavigateToBattery,
}) {
  const heroRef = useRef(null)
  const headingRef = useRef(null)
  const subtitleRef = useRef(null)
  const [selectedIndustry, setSelectedIndustry] = useState(null)

  // Hero GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo(headingRef.current,
        { y: 60, opacity: 0, skewY: 2 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.4, delay: 0.3 }
      ).fromTo(subtitleRef.current,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0 },
        '-=0.9'
      )
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedIndustry) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedIndustry])

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const LabelText = ({ color, children }) => (
    <span style={{
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 600,
      color: `${color}99`,
      letterSpacing: '0.08em',
      display: 'block',
      marginBottom: 4,
    }}>
      {children}
    </span>
  )

  const SectionBlock = ({ label, color, children }) => (
    <div style={{ marginBottom: 24 }}>
      <LabelText color={color}>{label}</LabelText>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.7,
        margin: '8px 0 0',
      }}>
        {children}
      </p>
    </div>
  )

  return (
    <div className="app-page">
      {/* ═══════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div className="hero-canvas-container">
          <HeroCanvas />
        </div>

        {/* Aurora gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 30% 20%, rgba(196, 149, 106, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(160, 156, 200, 0.06) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />


        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900, padding: '0 24px' }}>
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              borderRadius: 9999,
              background: 'rgba(196, 149, 106, 0.08)',
              border: '1px solid rgba(196, 149, 106, 0.15)',
              marginBottom: 32,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4956A', animation: 'pulseGlow 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(196, 149, 106, 0.8)', letterSpacing: '0.08em', fontWeight: 500 }}>
              PHYSICS-INFORMED AI
            </span>
          </motion.div>

          <h1
            ref={headingRef}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              marginBottom: 24,
              opacity: 0,
            }}
          >
            Bridging Physics and{' '}
            <span className="gradient-text-blue">Artificial Intelligence</span>
          </h1>

          <p
            ref={subtitleRef}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(15px, 1.8vw, 19px)',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              maxWidth: 700,
              margin: '0 auto',
              opacity: 0,
            }}
          >
            Physics-Informed Neural Networks (PINNs) embed governing physical laws directly into deep learning architectures, enabling engineers to solve complex problems with less data and greater accuracy than traditional AI methods.
          </p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            style={{ marginTop: 60 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 24,
                height: 40,
                borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.15)',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 8,
              }}
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 3, height: 8, borderRadius: 2, background: 'rgba(196,149,106,0.5)' }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — INDUSTRY SHOWCASE
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="app-section">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              marginBottom: 16,
            }}>
              Industry <span className="gradient-text-blue">Applications</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'var(--color-text-secondary)',
              maxWidth: 550,
              margin: '0 auto',
            }}>
              Explore how PINNs are transforming industries with physics-guided intelligence.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 28,
            }}
          >
            {INDUSTRIES.map((ind) => (
              <motion.div
                key={ind.id}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                onClick={() => {
                  const navMap = {
                    aerospace: onNavigateToAerospace,
                    structural: onNavigateToStructural,
                    healthcare: onNavigateToHealthcare,
                    climate: onNavigateToClimate,
                    energy: onNavigateToEnergy,
                    battery: onNavigateToBattery,
                  }
                  const nav = navMap[ind.id]
                  if (nav) { nav() }
                  else { setSelectedIndustry(ind) }
                }}
                className="glass-card"
                style={{ padding: 0, cursor: 'pointer', overflow: 'hidden' }}
              >
                {/* Canvas illustration */}
                <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'center' }}>
                  <IndustryCanvas industryId={ind.id} color={ind.color} />
                </div>

                <div style={{ padding: '24px 32px 32px' }}>
                  {/* Icon + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `${ind.color}15`,
                      border: `1px solid ${ind.color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {ind.icon}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.01em',
                    }}>
                      {ind.name}
                    </h3>
                  </div>

                  {[
                    { label: 'PHYSICS USED', value: ind.physics, color: ind.color },
                    { label: null, value: ind.summary, color: ind.color },
                  ].map((field, i) => (
                    <div key={i} style={{ marginBottom: i < 1 ? 14 : 0 }}>
                      {field.label && (
                        <span style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 10,
                          fontWeight: 600,
                          color: field.color || 'rgba(196, 149, 106, 0.5)',
                          letterSpacing: '0.08em',
                          display: 'block',
                          marginBottom: 4,
                        }}>
                          {field.label}
                        </span>
                      )}
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        display: 'block',
                      }}>
                        {field.value}
                      </span>
                    </div>
                  ))}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'rgba(196, 149, 106, 0.6)',
                    fontWeight: 500,
                    marginTop: 16,
                  }}>
                    Learn more →
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Industry Detail Panel — Fullscreen Modal */}
      <AnimatePresence>
        {selectedIndustry && (
          <motion.div
            className="detail-panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedIndustry(null)}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260, mass: 0.8 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 800,
                height: '100vh',
                background: 'rgba(10, 14, 26, 0.96)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* ───── Top bar ───── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '28px 36px',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${selectedIndustry.color}15`,
                    border: `1px solid ${selectedIndustry.color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {selectedIndustry.icon}
                  </div>
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}>
                      {selectedIndustry.name}
                    </h2>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      color: selectedIndustry.color,
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                    }}>
                      {selectedIndustry.physics}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIndustry(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    width: 38,
                    height: 38,
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                >
                  ✕
                </button>
              </div>

              {/* ───── Animation area (45–50% of modal) ───── */}
              <div style={{
                height: '48vh',
                minHeight: 260,
                flexShrink: 0,
                padding: '20px 36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.15)',
              }}>
                <IndustryGraphic industryId={selectedIndustry.id} color={selectedIndustry.color} />
              </div>

              {/* ───── Scrollable content ───── */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px 36px 36px',
              }}>
                {/* Overview */}
                <SectionBlock label="INDUSTRY OVERVIEW" color={selectedIndustry.color}>
                  {selectedIndustry.overview}
                </SectionBlock>

                {/* Engineering problem */}
                <SectionBlock label="REAL ENGINEERING PROBLEM" color={selectedIndustry.color}>
                  {selectedIndustry.shortDesc}
                </SectionBlock>

                {/* Physics involved */}
                <SectionBlock label="PHYSICS INVOLVED" color={selectedIndustry.color}>
                  {selectedIndustry.physics}
                </SectionBlock>

                {/* Why traditional AI struggles */}
                <SectionBlock label="WHY TRADITIONAL AI STRUGGLES" color={selectedIndustry.color}>
                  {selectedIndustry.traditionalAIStruggle}
                </SectionBlock>

                {/* Why PINNs work */}
                <SectionBlock label="WHY PINNs WORK" color={selectedIndustry.color}>
                  {selectedIndustry.pinnAdvantage}
                </SectionBlock>

                {/* Applications */}
                <div style={{ marginBottom: 24 }}>
                  <LabelText color={selectedIndustry.color}>REAL-WORLD APPLICATIONS</LabelText>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {selectedIndustry.applications.map((app, i) => (
                      <span key={i} style={{
                        padding: '5px 14px',
                        borderRadius: 8,
                        background: `${selectedIndustry.color}10`,
                        border: `1px solid ${selectedIndustry.color}20`,
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        color: selectedIndustry.color,
                      }}>
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Research organisations */}
                <div style={{ marginBottom: 24 }}>
                  <LabelText color={selectedIndustry.color}>RESEARCH ORGANISATIONS</LabelText>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {selectedIndustry.researchOrganizations.map((org, i) => (
                      <span key={i} style={{
                        padding: '5px 14px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        color: 'var(--color-text-secondary)',
                      }}>
                        {org}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Future scope */}
                <SectionBlock label="FUTURE SCOPE" color={selectedIndustry.color}>
                  {selectedIndustry.futureScope}
                </SectionBlock>

                {/* Bottom buttons */}
                <div style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <button
                    onClick={() => setSelectedIndustry(null)}
                    style={{
                      padding: '12px 28px',
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${selectedIndustry.color}, ${selectedIndustry.color}cc)`,
                      border: 'none',
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${selectedIndustry.color}40` }}
                    onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                  >
                    Try Example →
                  </button>
                  <button
                    onClick={() => setSelectedIndustry(null)}
                    style={{
                      padding: '12px 28px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
