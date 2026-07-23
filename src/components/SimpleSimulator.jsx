import { useState, useEffect, useRef, useContext } from 'react'
import { WorkspaceContext, WorkspacePortal } from './WorkspaceShared'

const PLOT_CONFIG = {
  schrodinger: {
    fn: (x, p) => Math.sin(p.n * Math.PI * x) ** 2,
    defaults: { n: 2 }, ranges: { n: [1, 10, 1] }, xRange: [0, 1],
    yLabel: 'Probability Density |ψ(x)|²',
    resultFn: (p) => [
      { label: 'Quantum Number (n)', value: p.n },
      { label: 'Peak Probability', value: (1).toFixed(2) },
    ]
  },
  uncertainty: {
    fn: (x, p) => Math.exp(-x * x / (2 * p.s * p.s)),
    defaults: { s: 0.3 }, ranges: { s: [0.05, 1, 0.05] }, xRange: [-2, 2],
    yLabel: 'Probability Amplitude',
    resultFn: (p) => [
      { label: 'σ (width)', value: p.s.toFixed(3) },
      { label: 'Δx·Δp ≈ ℏ/2', value: ((0.5 / p.s) * p.s).toFixed(3) + '·ℏ' },
    ]
  },
  wave: {
    fn: (x, p) => Math.sin(p.k * x),
    defaults: { k: 2 }, ranges: { k: [1, 10, 1] }, xRange: [0, 2 * Math.PI],
    yLabel: 'Displacement u(x)',
    resultFn: (p) => [
      { label: 'Wave Number (k)', value: p.k.toFixed(1) },
      { label: 'Wavelength (λ)', value: (2 * Math.PI / p.k).toFixed(3) + ' m' },
    ]
  },
  newton: {
    fn: (x, p) => 0.5 * p.a * x * x,
    defaults: { a: 2 }, ranges: { a: [0.5, 10, 0.5] }, xRange: [0, 5],
    yLabel: 'Displacement x(t)',
    resultFn: (p) => [
      { label: 'Acceleration', value: p.a.toFixed(1) + ' m/s²' },
      { label: 'Force (m=1kg)', value: p.a.toFixed(1) + ' N' },
    ]
  },
  heat: {
    fn: (x, p) => Math.exp(-x * x / (4 * p.t)) / Math.sqrt(4 * Math.PI * p.t),
    defaults: { t: 0.5 }, ranges: { t: [0.05, 5, 0.05] }, xRange: [-3, 3],
    yLabel: 'Temperature T(x)',
    resultFn: (p) => [
      { label: 'Time (t)', value: p.t.toFixed(2) + ' s' },
      { label: 'Peak Temperature', value: (1 / Math.sqrt(4 * Math.PI * p.t)).toFixed(3) + ' K' },
    ]
  },
  entropy: {
    fn: (x, p) => p.k * Math.log(x + 1),
    defaults: { k: 1 }, ranges: { k: [0.5, 5, 0.5] }, xRange: [0, 20],
    yLabel: 'Entropy S',
    resultFn: (p) => [
      { label: 'Boltzmann Constant', value: p.k.toFixed(1) + ' k_B' },
      { label: 'S at max', value: (p.k * Math.log(21)).toFixed(2) + ' J/K' },
    ]
  },
  navier: {
    fn: (x, p) => p.vmax * (1 - x * x / (p.r * p.r)),
    defaults: { vmax: 2, r: 1 }, ranges: { vmax: [0.5, 5, 0.5], r: [0.5, 2, 0.1] }, xRange: [-1, 1],
    yLabel: 'Velocity Profile',
    resultFn: (p) => [
      { label: 'Max Velocity', value: p.vmax.toFixed(1) + ' m/s' },
      { label: 'Flow Rate', value: (p.vmax * p.r * 1.5).toFixed(2) + ' m³/s' },
    ]
  },
  continuity: {
    fn: (x, p) => p.A1 * p.v1 / (p.A1 + (p.A2 - p.A1) * x),
    defaults: { A1: 2, A2: 0.5, v1: 1 }, ranges: { A1: [1, 5, 0.5], A2: [0.2, 2, 0.1], v1: [0.5, 3, 0.5] }, xRange: [0, 1],
    yLabel: 'Velocity v(x)',
    resultFn: (p) => [
      { label: 'Inlet Area', value: p.A1.toFixed(1) + ' m²' },
      { label: 'Outlet Velocity', value: (p.A1 * p.v1 / p.A2).toFixed(2) + ' m/s' },
    ]
  },
  maxwell1: {
    fn: (x, p) => p.Q / (x * x + 0.01),
    defaults: { Q: 1 }, ranges: { Q: [0.5, 5, 0.5] }, xRange: [0.1, 3],
    yLabel: 'Electric Field E(r)',
    resultFn: (p) => [
      { label: 'Charge (Q)', value: p.Q.toFixed(1) + ' C' },
      { label: 'E at r=0.5', value: (p.Q / (0.26)).toFixed(2) + ' N/C' },
    ]
  },
  faraday: {
    fn: (x, p) => Math.sin(x) * Math.cos(p.omega * x),
    defaults: { omega: 2 }, ranges: { omega: [1, 10, 1] }, xRange: [0, 4 * Math.PI],
    yLabel: 'EMF (V) / Flux (Φ)',
    resultFn: (p) => [
      { label: 'Frequency', value: p.omega.toFixed(1) + ' Hz' },
      { label: 'Peak EMF', value: '1.00 V' },
    ]
  },
  lorentz: {
    fn: (x, p) => 1 / Math.sqrt(1 - x * x),
    defaults: {}, ranges: {}, xRange: [0, 0.95],
    yLabel: 'Lorentz Factor γ',
    resultFn: (p) => [
      { label: 'γ at v=0.5c', value: (1 / Math.sqrt(1 - 0.25)).toFixed(3) },
      { label: 'γ at v=0.9c', value: (1 / Math.sqrt(1 - 0.81)).toFixed(3) },
    ]
  },
  einstein: {
    fn: (x, p) => x * 9e16,
    defaults: {}, ranges: {}, xRange: [0, 1e-6],
    yLabel: 'Energy E (J)',
    resultFn: (p) => [
      { label: 'c²', value: '9 × 10¹⁶ m²/s²' },
      { label: '1 kg → Energy', value: '9 × 10¹⁶ J' },
    ]
  },
  boltzmann: {
    fn: (x, p) => Math.exp(-x / (p.k * p.T)),
    defaults: { k: 1, T: 1 }, ranges: { T: [0.5, 5, 0.5] }, xRange: [0, 5],
    yLabel: 'Probability P(E)',
    resultFn: (p) => [
      { label: 'Temperature', value: p.T.toFixed(1) + ' K' },
      { label: 'P(E=1) / P(E=0)', value: Math.exp(-1 / p.T).toFixed(4) },
    ]
  },
  projectile: {
    fn: (x, p) => x * Math.tan(p.theta) - 9.81 * x * x / (2 * p.v * p.v * Math.cos(p.theta) ** 2),
    defaults: { v: 25, theta: Math.PI / 4 }, ranges: { v: [5, 50, 5], theta: [0.1, Math.PI / 2 - 0.1, 0.05] }, xRange: [0, 1],
    yLabel: 'Height y(x)',
    resultFn: (p) => {
      const R = p.v * p.v * Math.sin(2 * p.theta) / 9.81
      return [
        { label: 'Range', value: R.toFixed(1) + ' m' },
        { label: 'Max Height', value: (p.v * p.v * Math.sin(p.theta) ** 2 / (2 * 9.81)).toFixed(1) + ' m' },
      ]
    }
  },
  energy: {
    fn: (x, p) => {
      const h = p.h * (1 - x)
      const ke = 0.5 * p.m * (2 * 9.81 * (p.h - h)) ** 0.5 ** 2
      return ke
    },
    defaults: { m: 1, h: 10 }, ranges: { m: [0.5, 5, 0.5], h: [2, 20, 1] }, xRange: [0, 1],
    yLabel: 'Energy (J)',
    resultFn: (p) => [
      { label: 'PE at top', value: (p.m * 9.81 * p.h).toFixed(1) + ' J' },
      { label: 'KE at bottom', value: (p.m * 9.81 * p.h).toFixed(1) + ' J' },
    ]
  },
  momentum: {
    fn: (x, p) => p.m * x,
    defaults: { m: 2 }, ranges: { m: [0.5, 10, 0.5] }, xRange: [0, 10],
    yLabel: 'Momentum p (kg·m/s)',
    resultFn: (p) => [
      { label: 'Mass', value: p.m.toFixed(1) + ' kg' },
      { label: 'p at v=10 m/s', value: (p.m * 10).toFixed(1) + ' kg·m/s' },
    ]
  },
  circular: {
    fn: (x, p) => p.m * p.v * p.v / x,
    defaults: { m: 1, v: 3 }, ranges: { m: [0.5, 5, 0.5], v: [1, 10, 1] }, xRange: [0.5, 5],
    yLabel: 'Centripetal Force F (N)',
    resultFn: (p) => [
      { label: 'Mass', value: p.m.toFixed(1) + ' kg' },
      { label: 'Speed', value: p.v.toFixed(1) + ' m/s' },
    ]
  },
  gravitation: {
    fn: (x, p) => 6.674e-11 * p.m1 * p.m2 / (x * x),
    defaults: { m1: 5.97e24, m2: 1000 }, ranges: { m2: [100, 10000, 100] }, xRange: [6.37e6, 3e7],
    yLabel: 'Gravitational Force F (N)',
    resultFn: (p) => [
      { label: 'Mass 1', value: p.m1.toExponential(2) + ' kg' },
      { label: 'Mass 2', value: p.m2.toFixed(0) + ' kg' },
    ]
  },
  bernoulli: {
    fn: (x, p) => p.P0 - 0.5 * p.rho * (p.v0 / (1 - x * 0.5)) ** 2,
    defaults: { P0: 1e5, rho: 1000, v0: 1 }, ranges: { v0: [0.5, 5, 0.5] }, xRange: [0, 1],
    yLabel: 'Pressure P (Pa)',
    resultFn: (p) => [
      { label: 'Stagnation Pressure', value: p.P0.toExponential(1) + ' Pa' },
      { label: 'Dynamic Pressure', value: (0.5 * p.rho * p.v0 * p.v0).toFixed(0) + ' Pa' },
    ]
  },
  reynolds_num: {
    fn: (x, p) => p.rho * x * p.L / p.mu,
    defaults: { rho: 1000, L: 0.1, mu: 0.001 }, ranges: { rho: [100, 2000, 100], L: [0.01, 1, 0.01], mu: [0.0001, 0.01, 0.0001] }, xRange: [0, 10],
    yLabel: 'Reynolds Number Re',
    resultFn: (p) => {
      const Re = p.rho * 1 * p.L / p.mu
      return [
        { label: 'Re at v=1', value: Re.toFixed(0) },
        { label: 'Flow Regime', value: Re < 2300 ? 'Laminar' : Re < 4000 ? 'Transition' : 'Turbulent' },
      ]
    }
  },
  coulomb: {
    fn: (x, p) => 8.99e9 * p.q1 * p.q2 / (x * x + 0.01),
    defaults: { q1: 1e-6, q2: 1e-6 }, ranges: { q1: [0.1e-6, 10e-6, 0.1e-6], q2: [0.1e-6, 10e-6, 0.1e-6] }, xRange: [0.05, 0.5],
    yLabel: 'Force F (N)',
    resultFn: (p) => {
      const r = 0.1
      const F = 8.99e9 * p.q1 * p.q2 / (r * r)
      return [
        { label: 'Force at r=0.1m', value: F.toExponential(2) + ' N' },
        { label: 'Charge 1', value: (p.q1 * 1e6).toFixed(1) + ' μC' },
      ]
    }
  },
  lorentzforce: {
    fn: (x, p) => p.q * x * p.B,
    defaults: { q: 1.6e-19, B: 0.5 }, ranges: { B: [0.1, 2, 0.1] }, xRange: [0, 1e7],
    yLabel: 'Lorentz Force F (N)',
    resultFn: (p) => [
      { label: 'Charge', value: p.q.toExponential(2) + ' C' },
      { label: 'Field Strength', value: p.B.toFixed(1) + ' T' },
    ]
  },
  idealgas: {
    fn: (x, p) => p.n * 8.314 * x / p.V,
    defaults: { n: 1, V: 0.0224 }, ranges: { n: [0.5, 5, 0.5], V: [0.01, 0.1, 0.005] }, xRange: [250, 400],
    yLabel: 'Pressure P (Pa)',
    resultFn: (p) => [
      { label: 'Moles', value: p.n.toFixed(1) + ' mol' },
      { label: 'Volume', value: (p.V * 1000).toFixed(1) + ' L' },
    ]
  },
  hooke: {
    fn: (x, p) => -p.k * x,
    defaults: { k: 50 }, ranges: { k: [10, 200, 10] }, xRange: [-0.5, 0.5],
    yLabel: 'Restoring Force F (N)',
    resultFn: (p) => [
      { label: 'Spring Constant', value: p.k.toFixed(1) + ' N/m' },
      { label: 'F at x=0.3m', value: (-p.k * 0.3).toFixed(1) + ' N' },
    ]
  },
  shm: {
    fn: (x, p) => p.A * Math.cos(p.omega * x + p.phi),
    defaults: { A: 1, omega: 2, phi: 0 }, ranges: { A: [0.5, 3, 0.5], omega: [1, 10, 1], phi: [0, Math.PI, 0.1] }, xRange: [0, 4 * Math.PI],
    yLabel: 'Displacement x(t)',
    resultFn: (p) => [
      { label: 'Amplitude', value: p.A.toFixed(1) + ' m' },
      { label: 'Period', value: (2 * Math.PI / p.omega).toFixed(2) + ' s' },
    ]
  },
  ohm: {
    fn: (x, p) => x * p.R,
    defaults: { R: 10 }, ranges: { R: [1, 100, 1] }, xRange: [0, 20],
    yLabel: 'Voltage V (V)',
    resultFn: (p) => [
      { label: 'Resistance', value: p.R.toFixed(1) + ' Ω' },
      { label: 'Power at V=20V', value: (20 * 20 / p.R).toFixed(1) + ' W' },
    ]
  },
  debroglie: {
    fn: (x, p) => 6.626e-34 / x,
    defaults: {}, ranges: {}, xRange: [1e-25, 1e-22],
    yLabel: 'Wavelength λ (m)',
    resultFn: (p) => [
      { label: 'λ at p=1e-24', value: (6.626e-34 / 1e-24).toExponential(2) + ' m' },
      { label: 'λ at p=1e-23', value: (6.626e-34 / 1e-23).toExponential(2) + ' m' },
    ]
  },
  photoelectric: {
    fn: (x, p) => 6.626e-34 * x - p.phi,
    defaults: { phi: 2e-19 }, ranges: { phi: [1e-19, 5e-19, 0.5e-19] }, xRange: [3e14, 1e15],
    yLabel: 'KE of ejected e⁻ (J)',
    resultFn: (p) => {
      const f0 = p.phi / 6.626e-34
      return [
        { label: 'Threshold freq', value: f0.toExponential(2) + ' Hz' },
        { label: 'Work function', value: (p.phi / 1.602e-19).toFixed(2) + ' eV' },
      ]
    }
  },
  rc_circuit: {
    fn: (x, p) => p.V0 * (1 - Math.exp(-x / (p.R * p.C))),
    defaults: { V0: 12, R: 1000, C: 0.001 }, ranges: { V0: [5, 24, 1], R: [100, 10000, 100], C: [0.0001, 0.01, 0.0001] }, xRange: [0, 5],
    yLabel: 'Capacitor Voltage V_c (V)',
    resultFn: (p) => {
      const tau = p.R * p.C
      return [
        { label: 'Time Constant τ', value: tau.toFixed(2) + ' s' },
        { label: 'V_c at τ', value: (p.V0 * (1 - Math.exp(-1))).toFixed(2) + ' V' },
      ]
    }
  },
}

const FORMULA_STRINGS = {
  schrodinger: '|ψ(x)|² ∝ sin²(nπx/L)',
  uncertainty: 'ψ(x) = e^(−x²/2σ²)',
  wave: 'u(x) = sin(kx)',
  newton: 'x(t) = ½at²',
  heat: 'T(x,t) ∝ e^(−x²/4αt)',
  entropy: 'S = k·ln(Ω)',
  navier: 'Parabolic velocity profile',
  continuity: 'A₁v₁ = A₂v₂',
  maxwell1: 'E ∝ Q/r²',
  faraday: 'ε = −dΦ_B/dt',
  lorentz: 'γ = 1/√(1−v²/c²)',
  einstein: 'E = mc²',
  boltzmann: 'P(E) ∝ e^(−E/kT)',
  projectile: 'y = x·tanθ − gx²/(2v²cos²θ)',
  energy: 'KE + PE = E_total',
  momentum: 'p = mv',
  circular: 'F_c = mv²/r',
  gravitation: 'F = Gm₁m₂/r²',
  bernoulli: 'P + ½ρv² + ρgh = const',
  reynolds_num: 'Re = ρvL/μ',
  coulomb: 'F = kq₁q₂/r²',
  lorentzforce: 'F = qvB',
  idealgas: 'PV = nRT',
  hooke: 'F = −kx',
  shm: 'x = A·cos(ωt+φ)',
  ohm: 'V = IR',
  debroglie: 'λ = h/p',
  photoelectric: 'KE = hf − φ',
  rc_circuit: 'V_c(t) = V₀(1−e^(−t/RC))',
}

function formatNumber(num) {
  if (Math.abs(num) < 0.001 || Math.abs(num) > 1e6) {
    return num.toExponential(2)
  }
  return num.toFixed(num < 10 ? 3 : num < 100 ? 2 : 1)
}

export default function SimpleSimulator({ equation, inputsTarget, resultsTarget, initialParams }) {
  const canvasRef = useRef(null)
  const eqId = equation.id
  const config = PLOT_CONFIG[eqId]
  const formula = FORMULA_STRINGS[eqId] || equation.formula

  const [params, setParams] = useState(() => {
    const defaults = { ...config?.defaults }
    if (initialParams?.params) {
      Object.keys(defaults).forEach(k => {
        if (initialParams.params[k] !== undefined) defaults[k] = initialParams.params[k]
      })
    }
    return defaults
  })

  const paramKeys = config ? Object.keys(config.defaults) : []

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !config) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = '100%'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)

    const [xMin, xMax] = config.xRange
    const margin = { top: 40, right: 40, bottom: 50, left: 60 }
    const plotW = W - margin.left - margin.right
    const plotH = H - margin.top - margin.bottom

    let yMin = Infinity, yMax = -Infinity
    const steps = 300
    const data = []
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (xMax - xMin) * i / steps
      let y
      try { y = config.fn(x, params) } catch { y = 0 }
      if (!isFinite(y)) y = 0
      data.push({ x, y })
      if (y < yMin) yMin = y
      if (y > yMax) yMax = y
    }

    const yPad = (yMax - yMin) * 0.1 || 1
    yMin -= yPad
    yMax += yPad
    if (yMin === yMax) { yMin -= 1; yMax += 1 }

    const toScreenX = (x) => margin.left + (x - xMin) / (xMax - xMin) * plotW
    const toScreenY = (y) => margin.top + (yMax - y) / (yMax - yMin) * plotH

    ctx.clearRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = 'rgba(196,149,106,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 8; i++) {
      const x = margin.left + plotW * i / 8
      ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, margin.top + plotH); ctx.stroke()
    }
    for (let i = 0; i <= 6; i++) {
      const y = margin.top + plotH * i / 6
      ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(margin.left + plotW, y); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = 'rgba(196,149,106,0.2)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    const y0 = Math.min(Math.max(toScreenY(0), margin.top), margin.top + plotH)
    ctx.moveTo(margin.left, y0); ctx.lineTo(margin.left + plotW, y0)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top); ctx.lineTo(margin.left, margin.top + plotH)
    ctx.stroke()

    // Curve
    ctx.beginPath()
    ctx.strokeStyle = '#C4956A'
    ctx.lineWidth = 2.5
    for (let i = 0; i < data.length; i++) {
      const sx = toScreenX(data[i].x)
      const sy = toScreenY(data[i].y)
      if (i === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    }
    ctx.stroke()

    // Fill under curve
    ctx.beginPath()
    ctx.moveTo(toScreenX(data[0].x), y0)
    for (let i = 0; i < data.length; i++) {
      ctx.lineTo(toScreenX(data[i].x), toScreenY(data[i].y))
    }
    ctx.lineTo(toScreenX(data[data.length - 1].x), y0)
    ctx.closePath()
    ctx.fillStyle = 'rgba(196,149,106,0.08)'
    ctx.fill()

    // Axis labels
    ctx.fillStyle = 'rgba(232,221,204,0.5)'
    ctx.font = '11px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('X → ' + (config.xLabel || equation.xAxis || 'x'), margin.left + plotW / 2, H - 18)

    ctx.save()
    ctx.translate(14, margin.top + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(config.yLabel + ' ↑', 0, 0)
    ctx.restore()

    // Formula
    ctx.fillStyle = 'rgba(196,149,106,0.15)'
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(formula, margin.left + 8, margin.top + 6)
  }, [params, eqId, config, formula])

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(value) }))
  }

  const resultItems = config ? config.resultFn(params) : []

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="w-full rounded-xl" style={{ background: 'rgba(20,18,16,0.6)' }} />

      <div className="flex flex-wrap gap-4 mt-5" ref={inputsTarget ? undefined : undefined}>
        {paramKeys.length > 0 && (
          <WorkspacePortal target="inputs">
            <div className="flex flex-col gap-4 w-full">
              {paramKeys.map(key => {
                const [min, max, step] = config.ranges[key] || [0, 1, 0.1]
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-[rgba(220,208,188,0.45)]">
                      <span>{key}</span>
                      <span className="text-[#C4956A] font-bold">{formatNumber(params[key])}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={params[key]}
                      onChange={e => updateParam(key, e.target.value)}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: 'rgba(196,149,106,0.2)',
                        accentColor: '#C4956A',
                        outline: 'none',
                      }}
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[rgba(220,200,165,0.25)]">
                      <span>{formatNumber(min)}</span>
                      <span>{formatNumber(max)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </WorkspacePortal>
        )}
      </div>

      {resultItems.length > 0 && (
        <WorkspacePortal target="results">
          <div className="flex flex-col gap-3 w-full">
            {resultItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 px-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,149,106,0.08)' }}>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[rgba(220,208,188,0.5)]">{item.label}</span>
                <span className="text-xs font-mono font-bold text-[#C4956A]">{item.value}</span>
              </div>
            ))}
          </div>
        </WorkspacePortal>
      )}
    </div>
  )
}
