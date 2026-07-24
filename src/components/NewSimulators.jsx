import { useState, useEffect, useRef } from 'react'
import { WorkspacePortal, InputCardField, getInitialParam } from './WorkspaceShared'
import { checkRealism, RealismCheckCard } from './RealismCheck'

// ══════════════════════════════════════════════════
//  HELPER: draw arrow with head
// ══════════════════════════════════════════════════
function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth = 2, headSize = 8) {
const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy)
if (len < 2) return
const nx = dx / len, ny = dy / len
ctx.strokeStyle = color; ctx.lineWidth = lineWidth
ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
ctx.fillStyle = color; ctx.beginPath()
ctx.moveTo(x2, y2)
ctx.lineTo(x2 - nx * headSize + ny * headSize * 0.4, y2 - ny * headSize - nx * headSize * 0.4)
ctx.lineTo(x2 - nx * headSize - ny * headSize * 0.4, y2 - ny * headSize + nx * headSize * 0.4)
ctx.fill()
}

// ══════════════════════════════════════════════════
//  1. PROJECTILE MOTION SIMULATOR — FULL PHYSICS
// ══════════════════════════════════════════════════
export function ProjectileSimulator({ initialParams }) {
const canvasRef = useRef(null)
const [v0, setV0] = useState(() => { const v = getInitialParam(initialParams, 'velocity', 25); return v === "" ? 25 : v })
const [angle, setAngle] = useState(() => {
  const val = getInitialParam(initialParams, 'angle', 45)
  if (val === "") return 45
  if (initialParams && typeof val === 'number') return val * 180 / Math.PI
  return val
})
const [localV0, setLocalV0] = useState(25)
const [localAngle, setLocalAngle] = useState(45)
useEffect(() => { setLocalV0(v0); setLocalAngle(angle) }, [v0, angle])

const animRef = useRef()

const isPending = v0 === "" || angle === "";
const realism = checkRealism('projectile', { velocity: v0, angle: angle })

const stateRef = useRef({ v0: 25, angle: 45, t: 0, trail: [], phase: 'flying', isPending: false, isRealistic: true })
useEffect(() => { stateRef.current.v0 = v0; stateRef.current.angle = angle; stateRef.current.t = 0; stateRef.current.trail = []; stateRef.current.phase = 'flying'; stateRef.current.isPending = isPending; stateRef.current.isRealistic = realism.isRealistic }, [v0, angle, isPending, realism.isRealistic])

useEffect(() => {
const canvas = canvasRef.current
if (!canvas) return
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1
const W = 1100, H = 380
canvas.width = W * dpr; canvas.height = H * dpr
canvas.style.width = '100%'; canvas.style.height = `${H}px`
ctx.scale(dpr, dpr)

const draw = () => {
const { isPending, isRealistic } = stateRef.current || {}
if (isPending || !isRealistic) {
ctx.clearRect(0, 0, W, H)
ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
if (isPending) {
ctx.fillText('Awaiting required parameters...', W / 2, H / 2)
} else {
ctx.fillText('Simulation Suspended — Invalid Parameters', W / 2, H / 2)
}
animRef.current = requestAnimationFrame(draw)
return
}
const s = stateRef.current
const g = 9.81
const rad = s.angle * Math.PI / 180
const vx0 = s.v0 * Math.cos(rad), vy0 = s.v0 * Math.sin(rad)
const totalTime = 2 * vy0 / g
const maxRange = vx0 * totalTime
const maxH = (vy0 * vy0) / (2 * g)

// Scaling
const margin = 80
const scaleX = (W - margin * 2) / Math.max(maxRange, 1)
const scaleY = (H - 140) / Math.max(maxH * 1.3, 1)
const groundY = H - 55
const originX = margin

// Advance time
if (s.phase === 'flying') {
s.t += 0.025
if (s.t > totalTime) { s.t = totalTime; s.phase = 'landed' }
} else if (s.phase === 'landed') {
s.t += 0.025
if (s.t > totalTime + 2) { s.t = 0; s.trail = []; s.phase = 'flying' }
}

const curT = Math.min(s.t, totalTime)
const px = originX + vx0 * curT * scaleX
const rawY = vy0 * curT - 0.5 * g * curT * curT
const py = groundY - rawY * scaleY

// Trail
if (s.phase === 'flying' && curT < totalTime) {
s.trail.push({ x: px, y: py, t: curT })
}

ctx.clearRect(0, 0, W, H)

// Grid
ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
for (let x = margin; x < W - margin; x += 60) { ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, groundY); ctx.stroke() }
for (let y = 30; y <= groundY; y += 40) { ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(W - margin, y); ctx.stroke() }

// Ground
ctx.strokeStyle = 'rgba(136,192,184,0.25)'; ctx.lineWidth = 2
ctx.beginPath(); ctx.moveTo(margin - 20, groundY); ctx.lineTo(W - margin + 20, groundY); ctx.stroke()
// Ground hash marks
for (let x = margin; x < W - margin; x += 30) {
ctx.strokeStyle = 'rgba(136,192,184,0.08)'; ctx.lineWidth = 1
ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x - 6, groundY + 8); ctx.stroke()
}

// Ideal parabola (faint dashed)
ctx.beginPath()
ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(196,149,106,0.12)'; ctx.lineWidth = 1
for (let t = 0; t <= totalTime; t += totalTime / 150) {
const x = originX + vx0 * t * scaleX
const y = groundY - (vy0 * t - 0.5 * g * t * t) * scaleY
t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
}
ctx.stroke(); ctx.setLineDash([])

// Apex marker
const apexT = vy0 / g
const apexX = originX + vx0 * apexT * scaleX
const apexY = groundY - maxH * scaleY
ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(196,149,106,0.25)'; ctx.lineWidth = 1
ctx.beginPath(); ctx.moveTo(apexX, apexY); ctx.lineTo(apexX, groundY); ctx.stroke()
ctx.beginPath(); ctx.moveTo(margin, apexY); ctx.lineTo(apexX, apexY); ctx.stroke()
ctx.setLineDash([])
ctx.fillStyle = 'rgba(196,149,106,0.5)'; ctx.font = '10px var(--font-body)'
ctx.textAlign = 'center'; ctx.fillText(`H = ${maxH.toFixed(1)}m`, apexX, apexY - 10)

// Landing marker
const landX = originX + maxRange * scaleX
ctx.fillStyle = 'rgba(136,192,184,0.3)'
ctx.beginPath(); ctx.arc(landX, groundY, 4, 0, Math.PI * 2); ctx.fill()
ctx.fillStyle = 'rgba(136,192,184,0.5)'; ctx.font = '10px var(--font-body)'
ctx.textAlign = 'center'; ctx.fillText(`R = ${maxRange.toFixed(1)}m`, landX, groundY + 18)

// Launch point
ctx.fillStyle = 'rgba(196,149,106,0.5)'
ctx.beginPath(); ctx.arc(originX, groundY, 5, 0, Math.PI * 2); ctx.fill()
// Angle indicator arc
ctx.strokeStyle = 'rgba(196,149,106,0.3)'; ctx.lineWidth = 1.5
ctx.beginPath(); ctx.arc(originX, groundY, 35, -rad, 0); ctx.stroke()
ctx.fillStyle = 'rgba(196,149,106,0.4)'; ctx.font = '10px var(--font-body)'
ctx.fillText(`${s.angle}°`, originX + 42, groundY - 8)

// Trail
if (s.trail.length > 1) {
ctx.beginPath()
ctx.moveTo(s.trail[0].x, s.trail[0].y)
for (let i = 1; i < s.trail.length; i++) {
ctx.lineTo(s.trail[i].x, s.trail[i].y)
}
ctx.strokeStyle = 'rgba(136,192,184,0.5)'; ctx.lineWidth = 2.5; ctx.stroke()
}

// Projectile ball (only during flight or at landing)
if (s.phase === 'flying' || (s.phase === 'landed' && s.t <= totalTime + 0.5)) {
// Glow
ctx.fillStyle = 'rgba(136,192,184,0.15)'; ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.fill()
// Ball
const ballGrad = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, 8)
ballGrad.addColorStop(0, '#a8ddd6'); ballGrad.addColorStop(1, '#88C0B8')
ctx.fillStyle = ballGrad; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill()

// Velocity vectors (only during flight)
if (s.phase === 'flying') {
const vyNow = vy0 - g * curT
const vScale = 1.2
// Horizontal velocity (green-ish)
drawArrow(ctx, px, py, px + vx0 * vScale, py, 'rgba(136,192,184,0.7)', 1.5, 6)
// Vertical velocity (gold)
drawArrow(ctx, px, py, px, py - vyNow * vScale, 'rgba(196,149,106,0.7)', 1.5, 6)
// Resultant velocity (white)
const vMag = Math.sqrt(vx0 * vx0 + vyNow * vyNow)
const vAngle = Math.atan2(-vyNow, vx0)
drawArrow(ctx, px, py, px + Math.cos(vAngle) * vMag * vScale, py + Math.sin(vAngle) * vMag * vScale, 'rgba(232,221,204,0.6)', 2, 7)
}
}

// Time display
ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'
ctx.fillText(`t = ${curT.toFixed(2)} s`, W - 160, 30)
ctx.fillText(`T = ${totalTime.toFixed(2)} s`, W - 160, 50)

// Legend
ctx.fillStyle = 'rgba(136,192,184,0.5)'; ctx.fillRect(40, 20, 8, 8)
ctx.fillStyle = 'rgba(220,200,165,0.4)'; ctx.font = '10px var(--font-body)'
ctx.fillText('vₓ', 52, 28)
ctx.fillStyle = 'rgba(196,149,106,0.5)'; ctx.fillRect(40, 34, 8, 8)
ctx.fillStyle = 'rgba(220,200,165,0.4)'; ctx.fillText('vᵧ', 52, 42)

animRef.current = requestAnimationFrame(draw)
}
draw()
return () => cancelAnimationFrame(animRef.current)
}, [])

const g = 9.81, rad = angle * Math.PI / 180
const vx = v0 * Math.cos(rad), vy = v0 * Math.sin(rad)
const totalTime = 2 * vy / g, maxRange = vx * totalTime, maxH = vy * vy / (2 * g)

const handleCalc = () => {
if (localV0 === "" || localAngle === "") {
if (localV0 === "") setV0("");
if (localAngle === "") setAngle("");
return;
}

let pv = parseFloat(localV0); if (isNaN(pv)) pv = 25; pv = Math.max(1, Math.min(100, pv))
let pa = parseFloat(localAngle); if (isNaN(pa)) pa = 45; pa = Math.max(1, Math.min(89, pa))
setV0(pv); setAngle(pa)
}
const handleReset = () => { setV0(25); setAngle(45) }

return (
<div className="flex flex-col items-center w-full">
<canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
<WorkspacePortal target="inputs">
<div className="flex flex-col gap-4 w-full">
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<InputCardField label="Initial Velocity" value={localV0} min={1} max={100} step={0.5} onChange={setLocalV0} unit="m/s" />
<InputCardField label="Launch Angle" value={localAngle} min={1} max={89} step={1} onChange={setLocalAngle} unit="°" />
</div>
<div className="flex gap-4 mt-2 w-full">
<button onClick={handleCalc} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200" style={{ background: '#88C0B8', color: '#141210' }}>Calculate</button>
<button onClick={handleReset} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200 border border-[rgba(220,208,188,0.2)] hover:border-[rgba(220,208,188,0.4)] text-[rgba(220,208,188,0.85)] bg-transparent">Reset</button>
</div>
</div>
</WorkspacePortal>

<WorkspacePortal target="results">
<RealismCheckCard equationId="projectile" params={{ velocity: v0, angle: angle }} isPending={isPending} />
{isPending ? (
<div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3" style={{ borderLeft: '3px solid #ef4444' }}>
<span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
Please enter the missing inputs in the Laboratory Inputs card to calculate.
</div>
) : null}
<div className="flex flex-col gap-5 font-mono text-xs w-full">
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Range (R):</span>
<span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `${maxRange.toFixed(2)} m` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Max Height (H):</span>
<span className="font-bold text-[#C4956A]">{(!isPending && realism.isRealistic) ? `${maxH.toFixed(2)} m` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5" style={{ background: 'rgba(196,149,106,0.04)', borderLeft: '2px solid rgba(196,149,106,0.4)', padding: '8px 12px', borderRadius: '6px' }}>
<span className="opacity-50">Time of Flight (T):</span>
<span className="font-bold text-[#E8C880]">{(!isPending && realism.isRealistic) ? `${totalTime.toFixed(3)} s` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Horizontal Vel (vₓ):</span>
<span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `${vx.toFixed(2)} m/s` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Initial Vert Vel (vᵧ):</span>
<span className="font-bold text-[#C4956A]">{(!isPending && realism.isRealistic) ? `${vy.toFixed(2)} m/s` : "[Missing]"}</span>
</div>
<div className="p-3.5 rounded-lg border border-[rgba(196,149,106,0.15)] bg-[rgba(196,149,106,0.04)]" style={{ borderLeft: '3px solid rgba(196,149,106,0.35)' }}>
<span className="opacity-40 block mb-1">Equations:</span>
<span className="font-mono text-xs text-[#E8C880] block">R = v₀²sin(2θ)/g = {(!isPending && realism.isRealistic) ? `${v0}²sin(${2*angle}°)/9.81 = ${maxRange.toFixed(2)} m` : "[Missing]"}</span>
<span className="font-mono text-xs text-[#88C0B8] block mt-1">H = v₀²sin²θ/(2g) = {(!isPending && realism.isRealistic) ? `${maxH.toFixed(2)} m` : "[Missing]"}</span>
<span className="font-mono text-xs text-[#C4956A] block mt-1">T = 2v₀sinθ/g = {(!isPending && realism.isRealistic) ? `${totalTime.toFixed(3)} s` : "[Missing]"}</span>
</div>
</div>
</WorkspacePortal>
</div>
)
}
// ══════════════════════════════════════════════════
export function EnergySimulator({ initialParams }) {
const canvasRef = useRef(null)
const [mass, setMass] = useState(() => { const v = getInitialParam(initialParams, 'mass', 2); return v === "" ? 2 : v })
  const [height, setHeight] = useState(() => { const v = getInitialParam(initialParams, 'height', 10); return v === "" ? 10 : v })
const [localMass, setLocalMass] = useState(2)
const [localHeight, setLocalHeight] = useState(10)
useEffect(() => { setLocalMass(mass); setLocalHeight(height) }, [mass, height])

const animRef = useRef()

const isPending = mass === "" || height === "";
const realism = checkRealism('energy', { mass: mass, height: height })

const stateRef = useRef({ mass: 2, height: 10, t: 0, isPending: false, isRealistic: true })
useEffect(() => { stateRef.current.mass = mass; stateRef.current.height = height; stateRef.current.isPending = isPending; stateRef.current.isRealistic = realism.isRealistic }, [mass, height, isPending, realism.isRealistic])

useEffect(() => {
const canvas = canvasRef.current; if (!canvas) return
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1
const W = 1100, H = 340
canvas.width = W * dpr; canvas.height = H * dpr
canvas.style.width = '100%'; canvas.style.height = `${H}px`
ctx.scale(dpr, dpr)
const draw = () => {
const { isPending, isRealistic } = stateRef.current || {}
if (isPending || !isRealistic) {
ctx.clearRect(0, 0, W, H)
ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
if (isPending) {
ctx.fillText('Awaiting required parameters...', W / 2, H / 2)
} else {
ctx.fillText('Simulation Suspended — Invalid Parameters', W / 2, H / 2)
}
animRef.current = requestAnimationFrame(draw)
return
}
const { mass, height } = stateRef.current
stateRef.current.t += 0.012
const g = 9.81, totalE = mass * g * height
const period = Math.sqrt(2 * height / g) * 2
const phase = (stateRef.current.t % period) / period
const curH = height * Math.abs(Math.cos(phase * Math.PI))
const pe = mass * g * curH, ke = totalE - pe
const curV = Math.sqrt(2 * g * (height - curH))
ctx.clearRect(0, 0, W, H)

// Background
ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
for (let gy = 0; gy <= H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke() }
for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }

// Ramp geometry
const rampTopX = 120, rampTopY = 55
const rampBotX = 580, rampBotY = H - 50
const groundEndX = 750

// Ground surface
ctx.strokeStyle = 'rgba(136,192,184,0.3)'; ctx.lineWidth = 2
ctx.beginPath(); ctx.moveTo(rampBotX, rampBotY); ctx.lineTo(groundEndX, rampBotY); ctx.stroke()
// Ground hatching
for (let hx = rampBotX; hx <= groundEndX; hx += 18) {
  ctx.strokeStyle = 'rgba(136,192,184,0.08)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(hx, rampBotY); ctx.lineTo(hx - 6, rampBotY + 8); ctx.stroke()
}

// Ramp surface (filled triangle)
ctx.fillStyle = 'rgba(136,192,184,0.04)'
ctx.beginPath(); ctx.moveTo(rampTopX, rampTopY); ctx.lineTo(rampBotX, rampBotY); ctx.lineTo(rampTopX, rampBotY); ctx.closePath(); ctx.fill()
// Ramp outline
ctx.strokeStyle = 'rgba(136,192,184,0.25)'; ctx.lineWidth = 2
ctx.beginPath(); ctx.moveTo(rampTopX, rampTopY); ctx.lineTo(rampBotX, rampBotY); ctx.stroke()
ctx.beginPath(); ctx.moveTo(rampTopX, rampTopY); ctx.lineTo(rampTopX, rampBotY); ctx.stroke()
ctx.beginPath(); ctx.moveTo(rampTopX, rampBotY); ctx.lineTo(rampBotX, rampBotY); ctx.stroke()
// Ramp surface texture (lines along slope)
for (let i = 1; i < 8; i++) {
  const frac = i / 8
  const lx = rampTopX + (rampBotX - rampTopX) * frac
  const ly = rampTopY + (rampBotY - rampTopY) * frac
  ctx.strokeStyle = 'rgba(136,192,184,0.06)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rampTopX, rampBotY - (rampBotY - ly)); ctx.stroke()
}

// Height markers
const hFrac = curH / height
ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(196,149,106,0.2)'; ctx.lineWidth = 1
// Max height line
ctx.beginPath(); ctx.moveTo(rampTopX - 30, rampTopY); ctx.lineTo(rampTopX + 30, rampTopY); ctx.stroke()
// Current height line
const curHY = rampBotY - (rampBotY - rampTopY) * hFrac
ctx.strokeStyle = 'rgba(196,149,106,0.3)'
ctx.beginPath(); ctx.moveTo(rampTopX - 30, curHY); ctx.lineTo(rampTopX + 30, curHY); ctx.stroke()
ctx.setLineDash([])
// Height arrow
ctx.strokeStyle = 'rgba(196,149,106,0.4)'; ctx.lineWidth = 1.5
ctx.beginPath(); ctx.moveTo(rampTopX - 15, rampBotY); ctx.lineTo(rampTopX - 15, curHY); ctx.stroke()
ctx.fillStyle = 'rgba(196,149,106,0.5)'; ctx.font = '10px var(--font-body)'; ctx.textAlign = 'right'
ctx.fillText(`h = ${curH.toFixed(1)}m`, rampTopX - 22, (rampBotY + curHY) / 2 + 3)
// Max height label
ctx.fillStyle = 'rgba(196,149,106,0.35)'; ctx.font = '9px var(--font-body)'
ctx.fillText(`H = ${height}m`, rampTopX - 22, rampTopY + 3)

// Ball position on ramp
const ballFrac = 1 - hFrac
const ballR = Math.max(7, Math.min(16, 5 + mass * 1.5))
const bx = rampTopX + (rampBotX - rampTopX) * ballFrac
const by = rampTopY + (rampBotY - rampTopY) * ballFrac - ballR - 2
// Ball shadow
ctx.fillStyle = 'rgba(0,0,0,0.15)'
ctx.beginPath(); ctx.ellipse(bx + 2, by + ballR + 2, ballR * 0.9, ballR * 0.3, 0, 0, Math.PI * 2); ctx.fill()
// Ball glow
ctx.fillStyle = 'rgba(136,192,184,0.12)'
ctx.beginPath(); ctx.arc(bx, by, ballR + 6, 0, Math.PI * 2); ctx.fill()
// Ball gradient
const bGrad = ctx.createRadialGradient(bx - 2, by - 2, 0, bx, by, ballR)
bGrad.addColorStop(0, '#b0e0d8'); bGrad.addColorStop(1, '#88C0B8')
ctx.fillStyle = bGrad; ctx.beginPath(); ctx.arc(bx, by, ballR, 0, Math.PI * 2); ctx.fill()
// Mass label on ball
ctx.fillStyle = 'rgba(20,18,16,0.7)'; ctx.font = `${Math.max(8, ballR - 2)}px var(--font-mono)`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
ctx.fillText(`${mass}`, bx, by)

// Velocity arrow (along slope direction, grows with speed)
if (curV > 0.5) {
  const slopeAngle = Math.atan2(rampBotY - rampTopY, rampBotX - rampTopX)
  const arrLen = Math.min(80, curV * 4)
  const ax2 = bx + Math.cos(slopeAngle) * arrLen
  const ay2 = by + Math.sin(slopeAngle) * arrLen
  drawArrow(ctx, bx, by, ax2, ay2, 'rgba(136,192,184,0.7)', 2, 7)
  ctx.fillStyle = 'rgba(136,192,184,0.5)'; ctx.font = '10px var(--font-body)'; ctx.textAlign = 'left'
  ctx.fillText(`v = ${curV.toFixed(1)} m/s`, ax2 + 5, ay2 - 5)
}

// Energy bar chart (right side)
const barX = 790, barBottom = rampBotY, barWidth = 35, maxBarH = rampBotY - rampTopY - 20
const peBarH = totalE > 0 ? (pe / totalE) * maxBarH : 0
const keBarH = totalE > 0 ? (ke / totalE) * maxBarH : 0

// Total energy reference line
ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(232,200,128,0.3)'; ctx.lineWidth = 1
ctx.beginPath(); ctx.moveTo(barX - 10, barBottom - maxBarH); ctx.lineTo(barX + barWidth * 2 + 25, barBottom - maxBarH); ctx.stroke()
ctx.setLineDash([])
ctx.fillStyle = 'rgba(232,200,128,0.35)'; ctx.font = '9px var(--font-body)'; ctx.textAlign = 'left'
ctx.fillText(`E = ${totalE.toFixed(1)} J`, barX + barWidth * 2 + 28, barBottom - maxBarH + 3)

// PE bar
const peGrad = ctx.createLinearGradient(0, barBottom, 0, barBottom - peBarH)
peGrad.addColorStop(0, 'rgba(196,149,106,0.6)'); peGrad.addColorStop(1, 'rgba(196,149,106,0.3)')
ctx.fillStyle = peGrad
ctx.fillRect(barX, barBottom - peBarH, barWidth, peBarH)
ctx.strokeStyle = 'rgba(196,149,106,0.4)'; ctx.lineWidth = 1
ctx.strokeRect(barX, barBottom - peBarH, barWidth, peBarH)

// KE bar
const keGrad = ctx.createLinearGradient(0, barBottom, 0, barBottom - keBarH)
keGrad.addColorStop(0, 'rgba(136,192,184,0.6)'); keGrad.addColorStop(1, 'rgba(136,192,184,0.3)')
ctx.fillStyle = keGrad
ctx.fillRect(barX + barWidth + 10, barBottom - keBarH, barWidth, keBarH)
ctx.strokeStyle = 'rgba(136,192,184,0.4)'; ctx.lineWidth = 1
ctx.strokeRect(barX + barWidth + 10, barBottom - keBarH, barWidth, keBarH)

// Bar labels
ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
ctx.fillStyle = 'rgba(196,149,106,0.7)'; ctx.fillText('PE', barX + barWidth / 2, barBottom + 14)
ctx.fillStyle = 'rgba(196,149,106,0.5)'; ctx.fillText(`${pe.toFixed(1)}J`, barX + barWidth / 2, barBottom - peBarH - 6)
ctx.fillStyle = 'rgba(136,192,184,0.7)'; ctx.fillText('KE', barX + barWidth + 10 + barWidth / 2, barBottom + 14)
ctx.fillStyle = 'rgba(136,192,184,0.5)'; ctx.fillText(`${ke.toFixed(1)}J`, barX + barWidth + 10 + barWidth / 2, barBottom - keBarH - 6)

// Live readouts (top-left)
ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'
ctx.fillText(`PE = ${pe.toFixed(2)} J`, 40, 25)
ctx.fillText(`KE = ${ke.toFixed(2)} J`, 40, 45)
ctx.fillText(`v = ${curV.toFixed(2)} m/s`, 40, 65)
ctx.fillText(`E_total = ${totalE.toFixed(2)} J`, 40, 85)

animRef.current = requestAnimationFrame(draw)
}
draw()
return () => cancelAnimationFrame(animRef.current)
}, [])

const g = 9.81
const totalE = mass * g * height

const handleCalc = () => {
if (localMass === "" || localHeight === "") {
if (localMass === "") setMass("");
if (localHeight === "") setHeight("");
return;
}
let pm = parseFloat(localMass); if (isNaN(pm)) pm = 2; pm = Math.max(0.1, Math.min(100, pm))
let ph = parseFloat(localHeight); if (isNaN(ph)) ph = 10; ph = Math.max(0.1, Math.min(100, ph))
setMass(pm); setHeight(ph)
}
const handleReset = () => { setMass(2); setHeight(10) }

return (
<div className="flex flex-col items-center w-full">
<canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
<WorkspacePortal target="inputs">
<div className="flex flex-col gap-4 w-full">
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<InputCardField label="Mass" value={localMass} min={0.1} max={100} step={0.1} onChange={setLocalMass} unit="kg" />
<InputCardField label="Height" value={localHeight} min={0.1} max={100} step={0.5} onChange={setLocalHeight} unit="m" />
</div>
<div className="flex gap-4 mt-2 w-full">
<button onClick={handleCalc} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200" style={{ background: '#88C0B8', color: '#141210' }}>Calculate</button>
<button onClick={handleReset} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200 border border-[rgba(220,208,188,0.2)] hover:border-[rgba(220,208,188,0.4)] text-[rgba(220,208,188,0.85)] bg-transparent">Reset</button>
</div>
</div>
</WorkspacePortal>

<WorkspacePortal target="results">
<RealismCheckCard equationId="energy" params={{ mass, height }} isPending={isPending} />
{isPending ? (
<div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3" style={{ borderLeft: '3px solid #ef4444' }}>
<span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
Please enter mass and height.
</div>
) : null}
<div className="flex flex-col gap-5 font-mono text-xs w-full">
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Total Energy (E):</span>
<span className="font-bold text-[#E8C880]">{(!isPending && realism.isRealistic) ? `${totalE.toFixed(2)} J` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Potential Energy (PE):</span>
<span className="font-bold text-[#C4956A]">{(!isPending && realism.isRealistic) ? `${(mass * 9.81 * height).toFixed(2)} J` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center">
<span className="opacity-50">Kinetic Energy (KE):</span>
<span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `0.00 J` : "[Missing]"}</span>
</div>
</div>
</WorkspacePortal>
</div>
)
}

// ══════════════════════════════════════════════════
//  3. MOMENTUM SIMULATOR
// ══════════════════════════════════════════════════
export function MomentumSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [m1, setM1] = useState(() => { const v = getInitialParam(initialParams, 'mass1', 2); return v === "" ? 2 : v })
  const [v1, setV1] = useState(() => { const v = getInitialParam(initialParams, 'velocity1', 5); return v === "" ? 5 : v })
  const [m2, setM2] = useState(() => { const v = getInitialParam(initialParams, 'mass2', 3); return v === "" ? 3 : v })
  const [v2, setV2] = useState(() => { const v = getInitialParam(initialParams, 'velocity2', -2); return v === "" ? -2 : v })
  const [localM1, setLocalM1] = useState(2); const [localV1, setLocalV1] = useState(5)
  const [localM2, setLocalM2] = useState(3); const [localV2, setLocalV2] = useState(-2)
  useEffect(() => { setLocalM1(m1); setLocalV1(v1); setLocalM2(m2); setLocalV2(v2) }, [m1, v1, m2, v2])

  const animRef = useRef()
  const isPending = m1 === "" || v1 === "" || m2 === "" || v2 === ""
  const realism = checkRealism('momentum', { mass1: m1, velocity1: v1, mass2: m2, velocity2: v2 })
  // State machine: APPROACH -> COLLIDE -> SEPARATE -> PAUSE -> APPROACH
  const stateRef = useRef({
  m1: 2, v1: 5, m2: 3, v2: -2,
  p1: 200, p2: 900,
  phase: 'APPROACH', phaseTimer: 0, flashAlpha: 0, isPending: false, isRealistic: true
  })
  useEffect(() => {
  const s = stateRef.current
  Object.assign(s, { m1, v1, m2, v2, p1: 200, p2: 900, phase: 'APPROACH', phaseTimer: 0, flashAlpha: 0, isPending, isRealistic: realism.isRealistic })
  }, [m1, v1, m2, v2, isPending, realism.isRealistic])

useEffect(() => {
const canvas = canvasRef.current; if (!canvas) return
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1
const W = 1100, H = 380
canvas.width = W * dpr; canvas.height = H * dpr
canvas.style.width = '100%'; canvas.style.height = `${H}px`
ctx.scale(dpr, dpr)

const draw = () => {
const { isPending, isRealistic } = stateRef.current || {}
if (isPending || !isRealistic) {
ctx.clearRect(0, 0, W, H)
ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
if (isPending) {
ctx.fillText('Awaiting required parameters...', W / 2, H / 2)
} else {
ctx.fillText('Simulation Suspended — Invalid Parameters', W / 2, H / 2)
}
animRef.current = requestAnimationFrame(draw)
return
}
    const s = stateRef.current
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
    // Background grid
    ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
    for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

    const trackY = H / 2 + 30
    const trackLeft = 60, trackRight = W - 60

    // Air track (metallic rail)
    ctx.fillStyle = 'rgba(136,192,184,0.06)'
    ctx.fillRect(trackLeft, trackY - 2, trackRight - trackLeft, 8)
    ctx.strokeStyle = 'rgba(136,192,184,0.25)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(trackLeft, trackY); ctx.lineTo(trackRight, trackY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(trackLeft, trackY + 4); ctx.lineTo(trackRight, trackY + 4); ctx.stroke()
    // Ruler markings
    for (let rx = trackLeft; rx <= trackRight; rx += 40) {
      ctx.strokeStyle = 'rgba(136,192,184,0.12)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(rx, trackY + 4); ctx.lineTo(rx, trackY + 12); ctx.stroke()
    }
    for (let rx = trackLeft; rx <= trackRight; rx += 200) {
      ctx.strokeStyle = 'rgba(136,192,184,0.2)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(rx, trackY + 4); ctx.lineTo(rx, trackY + 16); ctx.stroke()
    }
    // Track end bumpers
    ctx.fillStyle = 'rgba(196,149,106,0.2)'; ctx.fillRect(trackLeft - 5, trackY - 25, 8, 50)
    ctx.fillRect(trackRight - 3, trackY - 25, 8, 50)

    // Cart dimensions
    const cart1W = 30 + s.m1 * 4, cart1H = 24 + s.m1 * 2
    const cart2W = 30 + s.m2 * 4, cart2H = 24 + s.m2 * 2

    // State machine
    if (s.phase === 'APPROACH') {
      s.p1 += s.v1 * 0.5
      s.p2 += s.v2 * 0.5
      if (s.p1 + cart1W / 2 >= s.p2 - cart2W / 2) {
        s.phase = 'COLLIDE'
        s.flashAlpha = 1.0
        s.phaseTimer = 0
        // Elastic collision formulas
        const v1f = ((s.m1 - s.m2) * s.v1 + 2 * s.m2 * s.v2) / (s.m1 + s.m2)
        const v2f = ((s.m2 - s.m1) * s.v2 + 2 * s.m1 * s.v1) / (s.m1 + s.m2)
        s.v1 = v1f
        s.v2 = v2f
      }
    } else if (s.phase === 'COLLIDE') {
      s.phaseTimer += 1
      s.flashAlpha = Math.max(0, 1 - s.phaseTimer / 15)
      s.p1 += s.v1 * 0.5
      s.p2 += s.v2 * 0.5
      if (s.phaseTimer > 15) s.phase = 'SEPARATE'
    } else {
      s.p1 += s.v1 * 0.5
      s.p2 += s.v2 * 0.5
      if (s.p1 < trackLeft + 30 || s.p2 > trackRight - 30 || s.p1 > trackRight - 30 || s.p2 < trackLeft + 30) {
        s.p1 = 200; s.p2 = 900
        s.v1 = m1 !== "" ? parseFloat(v1) || 5 : 5
        s.v2 = m2 !== "" ? parseFloat(v2) || -2 : -2
        s.phase = 'APPROACH'
        s.phaseTimer = 0
      }
    }

    // Collision flash
    if (s.flashAlpha > 0) {
      const flashX = (s.p1 + s.p2) / 2
      const flashGrad = ctx.createRadialGradient(flashX, trackY - 10, 0, flashX, trackY - 10, 40)
      flashGrad.addColorStop(0, `rgba(232,200,128,${s.flashAlpha * 0.5})`)
      flashGrad.addColorStop(1, 'rgba(232,200,128,0)')
      ctx.fillStyle = flashGrad; ctx.beginPath(); ctx.arc(flashX, trackY - 10, 40, 0, Math.PI * 2); ctx.fill()
    }

    // Cart 1 (teal)
    const c1Left = s.p1 - cart1W / 2, c1Top = trackY - cart1H
    ctx.fillStyle = 'rgba(136,192,184,0.2)'
    ctx.fillRect(c1Left, c1Top, cart1W, cart1H)
    ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 2
    ctx.strokeRect(c1Left, c1Top, cart1W, cart1H)
    // Wheels
    ctx.fillStyle = 'rgba(136,192,184,0.5)'
    ctx.beginPath(); ctx.arc(c1Left + 8, trackY + 2, 4, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(c1Left + cart1W - 8, trackY + 2, 4, 0, Math.PI * 2); ctx.fill()
    // Label
    ctx.fillStyle = 'rgba(232,221,204,0.7)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`m₁`, s.p1, c1Top + cart1H / 2)

    // Cart 2 (orange)
    const c2Left = s.p2 - cart2W / 2, c2Top = trackY - cart2H
    ctx.fillStyle = 'rgba(224,120,64,0.2)'
    ctx.fillRect(c2Left, c2Top, cart2W, cart2H)
    ctx.strokeStyle = '#E07840'; ctx.lineWidth = 2
    ctx.strokeRect(c2Left, c2Top, cart2W, cart2H)
    // Wheels
    ctx.fillStyle = 'rgba(224,120,64,0.5)'
    ctx.beginPath(); ctx.arc(c2Left + 8, trackY + 2, 4, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(c2Left + cart2W - 8, trackY + 2, 4, 0, Math.PI * 2); ctx.fill()
    // Label
    ctx.fillStyle = 'rgba(232,221,204,0.7)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`m₂`, s.p2, c2Top + cart2H / 2)

    // Velocity arrows
    const vArrowY = trackY - Math.max(cart1H, cart2H) - 20
    if (Math.abs(s.v1) > 0.1) {
      const len1 = Math.min(80, Math.abs(s.v1) * 8)
      drawArrow(ctx, s.p1, vArrowY, s.p1 + Math.sign(s.v1) * len1, vArrowY, 'rgba(136,192,184,0.7)', 2, 6)
      ctx.fillStyle = 'rgba(136,192,184,0.5)'; ctx.font = '10px var(--font-body)'; ctx.textAlign = 'center'
      ctx.fillText(`v₁=${s.v1.toFixed(1)}`, s.p1, vArrowY - 10)
    }
    if (Math.abs(s.v2) > 0.1) {
      const len2 = Math.min(80, Math.abs(s.v2) * 8)
      drawArrow(ctx, s.p2, vArrowY, s.p2 + Math.sign(s.v2) * len2, vArrowY, 'rgba(224,120,64,0.7)', 2, 6)
      ctx.fillStyle = 'rgba(224,120,64,0.5)'; ctx.font = '10px var(--font-body)'; ctx.textAlign = 'center'
      ctx.fillText(`v₂=${s.v2.toFixed(1)}`, s.p2, vArrowY - 10)
    }

    // Phase label
    const phaseLabels = { 'APPROACH': 'Approaching...', 'COLLIDE': '💥 Collision!', 'SEPARATE': 'Separating...' }
    ctx.fillStyle = s.phase === 'COLLIDE' ? 'rgba(232,200,128,0.7)' : 'rgba(220,200,165,0.4)'
    ctx.font = s.phase === 'COLLIDE' ? 'bold 14px var(--font-body)' : '13px var(--font-body)'
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText(phaseLabels[s.phase] || '', W / 2, 20)

    // Momentum readouts
    const p1_val = s.m1 * s.v1, p2_val = s.m2 * s.v2
    ctx.fillStyle = 'rgba(220,200,165,0.5)'; ctx.font = '11px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
    ctx.fillText(`p₁ = ${p1_val.toFixed(2)} kg·m/s`, 40, H - 40)
    ctx.fillText(`p₂ = ${p2_val.toFixed(2)} kg·m/s`, 40, H - 22)
    ctx.fillStyle = 'rgba(232,200,128,0.6)'; ctx.font = 'bold 11px var(--font-body)'
    ctx.fillText(`p_total = ${(p1_val + p2_val).toFixed(2)} kg·m/s`, 300, H - 30)

    animRef.current = requestAnimationFrame(draw)
  }
  animRef.current = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(animRef.current)
}, [])

const handleCalc = () => {
  setM1(parseFloat(localM1) || 2)
  setV1(parseFloat(localV1) || 5)
  setM2(parseFloat(localM2) || 3)
  setV2(parseFloat(localV2) || -2)
}
const handleReset = () => { setLocalM1(2); setLocalV1(5); setLocalM2(3); setLocalV2(-2); setM1(2); setV1(5); setM2(3); setV2(-2) }

return (
  <div className="flex flex-col items-center w-full">
    <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
    <WorkspacePortal target="inputs">
      <div className="flex flex-col gap-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputCardField label="Mass 1 (m₁)" value={localM1} min={0.1} max={20} step={0.1} onChange={setLocalM1} unit="kg" />
          <InputCardField label="Velocity 1 (v₁)" value={localV1} min={-20} max={20} step={0.5} onChange={setLocalV1} unit="m/s" />
          <InputCardField label="Mass 2 (m₂)" value={localM2} min={0.1} max={20} step={0.1} onChange={setLocalM2} unit="kg" />
          <InputCardField label="Velocity 2 (v₂)" value={localV2} min={-20} max={20} step={0.5} onChange={setLocalV2} unit="m/s" />
        </div>
        <div className="flex gap-4 mt-2 w-full">
          <button onClick={handleCalc} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
          <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
        </div>
      </div>
    </WorkspacePortal>

    <WorkspacePortal target="results">
      <RealismCheckCard realism={realism} />
      {isPending ? (
        <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
          <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
          Enter values to calculate system momentum.
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
            <span className="opacity-50">Total Momentum:</span>
            <span className="font-bold text-[#88C0B8]">{(m1 * v1 + m2 * v2).toFixed(2)} kg·m/s</span>
          </div>
        </div>
      )}
    </WorkspacePortal>
  </div>
)
}

// ══════════════════════════════════════════════════
//  4. CIRCULAR MOTION SIMULATOR
// ══════════════════════════════════════════════════
export function CircularMotionSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [mass, setMass] = useState(() => { const v = getInitialParam(initialParams, 'mass', 1); return v === "" ? 1 : v })
  const [velocity, setVelocity] = useState(() => { const v = getInitialParam(initialParams, 'velocity', 5); return v === "" ? 5 : v })
  const [radius, setRadius] = useState(() => { const v = getInitialParam(initialParams, 'radius', 3); return v === "" ? 3 : v })
  const [localMass, setLocalMass] = useState(1)
  const [localVel, setLocalVel] = useState(5)
  const [localR, setLocalR] = useState(3)
  useEffect(() => { setLocalMass(mass); setLocalVel(velocity); setLocalR(radius) }, [mass, velocity, radius])

  const animRef = useRef()
  const isPending = mass === "" || velocity === "" || radius === ""
  const realism = checkRealism('circular', isPending ? {} : { mass, velocity, radius })
  const stateRef = useRef({ mass: 1, velocity: 5, radius: 3, angle: 0, trail: [], isPending: false, isRealistic: true })
  useEffect(() => {
    Object.assign(stateRef.current, { mass, velocity, radius, isPending, isRealistic: realism.isRealistic })
  }, [mass, velocity, radius, isPending, realism.isRealistic])
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)
    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }
      const cx = W / 2, cy = H / 2
      const m = s.mass || 1, v = s.velocity || 5, r = s.radius || 3
      const rPx = Math.min(130, Math.max(30, r * 18))
      const omega = v / r
      s.angle = (s.angle || 0) + omega * 0.016

      const px = cx + rPx * Math.cos(s.angle)
      const py = cy + rPx * Math.sin(s.angle)

      // Motion trail
      s.trail.push({ x: px, y: py })
      if (s.trail.length > 45) s.trail.shift()

      // Background grid
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

      // Orbit track (dashed reference circle)
      ctx.strokeStyle = 'rgba(136,192,184,0.2)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])

      // Fading motion trail
      if (s.trail.length > 1) {
        for (let i = 1; i < s.trail.length; i++) {
          const alpha = (i / s.trail.length) * 0.4
          ctx.strokeStyle = `rgba(136,192,184,${alpha})`; ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y)
          ctx.lineTo(s.trail[i].x, s.trail[i].y)
          ctx.stroke()
        }
      }

      // Center pivot post
      ctx.fillStyle = 'rgba(196,149,106,0.3)'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#C4956A'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill()

      // Radius tether line (string)
      ctx.strokeStyle = 'rgba(232,221,204,0.35)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke()
      // Radius label
      const midRx = (cx + px) / 2, midRy = (cy + py) / 2
      ctx.fillStyle = 'rgba(232,221,204,0.5)'; ctx.font = '10px var(--font-body)'; ctx.textAlign = 'center'
      ctx.fillText(`r = ${r}m`, midRx, midRy - 6)

      // Object (ball)
      const objRadius = Math.max(6, Math.min(15, 5 + m * 0.8))
      // Glow
      ctx.fillStyle = 'rgba(136,192,184,0.15)'; ctx.beginPath(); ctx.arc(px, py, objRadius + 5, 0, Math.PI * 2); ctx.fill()
      // Ball gradient
      const bGrad = ctx.createRadialGradient(px - 2, py - 2, 0, px, py, objRadius)
      bGrad.addColorStop(0, '#a8ddd6'); bGrad.addColorStop(1, '#88C0B8')
      ctx.fillStyle = bGrad; ctx.beginPath(); ctx.arc(px, py, objRadius, 0, Math.PI * 2); ctx.fill()

      // Centripetal Force Vector (Fc -> pointing inward toward center, orange)
      const fc = m * v * v / r
      const fcLen = Math.min(70, Math.max(15, fc * 0.8))
      const fcNx = (cx - px) / rPx, fcNy = (cy - py) / rPx
      drawArrow(ctx, px, py, px + fcNx * fcLen, py + fcNy * fcLen, '#E07840', 2, 7)
      ctx.fillStyle = '#E07840'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`F_c`, px + fcNx * (fcLen + 10), py + fcNy * (fcLen + 10))

      // Tangential Velocity Vector (v -> tangent to circle, teal)
      const vLen = Math.min(70, Math.max(15, v * 5))
      const vNx = -Math.sin(s.angle), vNy = Math.cos(s.angle)
      drawArrow(ctx, px, py, px + vNx * vLen, py + vNy * vLen, '#88C0B8', 2, 7)
      ctx.fillStyle = '#88C0B8'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`v`, px + vNx * (vLen + 10), py + vNy * (vLen + 10))

      // Live readouts (top-left)
      const period = 2 * Math.PI * r / v
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'
      ctx.fillText(`F_c = ${fc.toFixed(2)} N`, 40, 25)
      ctx.fillText(`ω = ${omega.toFixed(2)} rad/s`, 40, 45)
      ctx.fillText(`v = ${v.toFixed(2)} m/s`, 40, 65)
      ctx.fillText(`T = ${period.toFixed(2)} s`, 40, 85)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const fc = mass * velocity * velocity / (radius || 1)
  const omega = velocity / (radius || 1)
  const period = 2 * Math.PI * (radius || 1) / (velocity || 1)

  const handleCalc = () => {
    setMass(parseFloat(localMass) || 1)
    setVelocity(parseFloat(localVel) || 5)
    setRadius(parseFloat(localR) || 3)
  }
  const handleReset = () => { setLocalMass(1); setLocalVel(5); setLocalR(3); setMass(1); setVelocity(5); setRadius(3) }

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputCardField label="Mass" value={localMass} min={0.1} max={50} step={0.1} onChange={setLocalMass} unit="kg" />
            <InputCardField label="Velocity" value={localVel} min={0.1} max={50} step={0.5} onChange={setLocalVel} unit="m/s" />
            <InputCardField label="Radius" value={localR} min={0.5} max={20} step={0.1} onChange={setLocalR} unit="m" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleCalc} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter mass, velocity, and radius.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Centripetal Force (F_c):</span>
              <span className="font-bold text-[#88C0B8]">{fc.toFixed(2)} N</span>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Angular Velocity (ω):</span>
              <span className="font-bold text-[#88C0B8]">{omega.toFixed(2)} rad/s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-50">Period (T):</span>
              <span className="font-bold text-[#88C0B8]">{period.toFixed(2)} s</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  5. UNIVERSAL GRAVITATION — VERLET ORBITAL MECHANICS
// ══════════════════════════════════════════════════
export function GravitationSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [planetMass, setPlanetMass] = useState(() => { const v = getInitialParam(initialParams, 'mass1', 5.97); return v === "" ? 5.97 : v })
  const [satMass, setSatMass] = useState(() => { const v = getInitialParam(initialParams, 'mass2', 1); return v === "" ? 1 : v })
  const [orbRadius, setOrbRadius] = useState(() => { const v = getInitialParam(initialParams, 'distance', 6.37); return v === "" ? 6.37 : v })
  const [orbSpeed, setOrbSpeed] = useState(1.0)
  const [localPM, setLocalPM] = useState(5.97); const [localSM, setLocalSM] = useState(1)
  const [localOR, setLocalOR] = useState(6.37); const [localOS, setLocalOS] = useState(1.0)
  useEffect(() => { setLocalPM(planetMass); setLocalSM(satMass); setLocalOR(orbRadius); setLocalOS(orbSpeed) }, [planetMass, satMass, orbRadius, orbSpeed])

  const animRef = useRef()
  const stateRef = useRef(null)
  const isPending = planetMass === "" || satMass === "" || orbRadius === "";
  const realism = checkRealism('gravitation', isPending ? {} : { planetMass, satMass, orbRadius })

  // Initialize orbital state
  const initOrbit = (pM, r, spdMul) => {
    const G_sim = 800
    const vCircular = Math.sqrt(G_sim * (pM || 5.97) / ((r || 6.37) * 30))
    return {
      pM: pM || 5.97, r: r || 6.37,
      x: (r || 6.37) * 30, y: 0,
      vx: 0, vy: -vCircular * (spdMul || 1.0),
      trail: [], G_sim
    }
  }

  useEffect(() => {
    stateRef.current = initOrbit(planetMass, orbRadius, orbSpeed)
  }, [planetMass, orbRadius, orbSpeed])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#100e0a'; ctx.fillRect(0, 0, W, H)
      if (isPending || !realism.isRealistic || !s) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const cx = W / 2, cy = H / 2
      const planetR = Math.max(16, Math.min(35, 18 + (s.pM || 5.97) * 1.5))
      const dt = 0.016

      // Stars background (subtle static dots)
      ctx.fillStyle = 'rgba(232,221,204,0.15)'
      const starSeed = [
        {x: 80, y: 50}, {x: 200, y: 120}, {x: 450, y: 40}, {x: 800, y: 90}, {x: 950, y: 60},
        {x: 140, y: 300}, {x: 320, y: 340}, {x: 650, y: 320}, {x: 880, y: 280}, {x: 1020, y: 330}
      ]
      for (const st of starSeed) { ctx.beginPath(); ctx.arc(st.x, st.y, 1, 0, Math.PI * 2); ctx.fill() }

      // Physics integration (Verlet)
      const dist = Math.max(20, Math.sqrt(s.x * s.x + s.y * s.y))
      const Fg_sim = (s.G_sim * s.pM) / (dist * dist)
      const ax = -Fg_sim * (s.x / dist)
      const ay = -Fg_sim * (s.y / dist)

      s.vx += ax * dt
      s.vy += ay * dt
      s.x += s.vx * dt
      s.y += s.vy * dt

      s.trail.push({ x: s.x, y: s.y })
      if (s.trail.length > 250) s.trail.shift()

      // Orbital path trail (fading)
      if (s.trail.length > 1) {
        for (let i = 1; i < s.trail.length; i++) {
          const alpha = (i / s.trail.length) * 0.4
          ctx.strokeStyle = `rgba(136,192,184,${alpha})`; ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(cx + s.trail[i-1].x, cy + s.trail[i-1].y)
          ctx.lineTo(cx + s.trail[i].x, cy + s.trail[i].y)
          ctx.stroke()
        }
      }

      // Distance line from planet to satellite
      const satX = cx + s.x, satY = cy + s.y
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(196,149,106,0.2)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(satX, satY); ctx.stroke(); ctx.setLineDash([])

      // Planet atmosphere glow
      const atmGrad = ctx.createRadialGradient(cx, cy, planetR * 0.8, cx, cy, planetR * 1.6)
      atmGrad.addColorStop(0, 'rgba(196,149,106,0.3)')
      atmGrad.addColorStop(1, 'rgba(196,149,106,0)')
      ctx.fillStyle = atmGrad; ctx.beginPath(); ctx.arc(cx, cy, planetR * 1.6, 0, Math.PI * 2); ctx.fill()

      // Central Planet
      const pGrad = ctx.createRadialGradient(cx - planetR * 0.3, cy - planetR * 0.3, 0, cx, cy, planetR)
      pGrad.addColorStop(0, '#e5b88f'); pGrad.addColorStop(1, '#C4956A')
      ctx.fillStyle = pGrad; ctx.beginPath(); ctx.arc(cx, cy, planetR, 0, Math.PI * 2); ctx.fill()

      // Satellite
      ctx.fillStyle = 'rgba(136,192,184,0.2)'; ctx.beginPath(); ctx.arc(satX, satY, 10, 0, Math.PI * 2); ctx.fill()
      const satGrad = ctx.createRadialGradient(satX - 2, satY - 2, 0, satX, satY, 5)
      satGrad.addColorStop(0, '#b8eee8'); satGrad.addColorStop(1, '#88C0B8')
      ctx.fillStyle = satGrad; ctx.beginPath(); ctx.arc(satX, satY, 5, 0, Math.PI * 2); ctx.fill()

      // Vectors at satellite
      const vMag = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
      // Velocity vector (tangent, teal)
      if (vMag > 0.1) {
        const vxNorm = s.vx / vMag, vyNorm = s.vy / vMag
        drawArrow(ctx, satX, satY, satX + vxNorm * 35, satY + vyNorm * 35, '#88C0B8', 2, 6)
        ctx.fillStyle = '#88C0B8'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
        ctx.fillText(`v`, satX + vxNorm * 42, satY + vyNorm * 42)
      }
      // Gravitational Force vector (toward planet center, orange)
      const FxNorm = -s.x / dist, FyNorm = -s.y / dist
      drawArrow(ctx, satX, satY, satX + FxNorm * 35, satY + FyNorm * 35, '#E07840', 2, 6)
      ctx.fillStyle = '#E07840'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`F_g`, satX + FxNorm * 42, satY + FyNorm * 42)

      // Real-world calculations
      const G_const = 6.674e-11
      const F_real = G_const * (planetMass * 1e24) * satMass / Math.pow((orbRadius || 1) * 1e6, 2)
      const v_real = Math.sqrt(G_const * (planetMass * 1e24) / ((orbRadius || 1) * 1e6))

      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'
      ctx.fillText(`F_g = ${F_real.toExponential(3)} N`, 40, 25)
      ctx.fillText(`v_orbital = ${(v_real / 1000).toFixed(2)} km/s`, 40, 45)
      ctx.fillText(`r = ${(dist / 30).toFixed(2)} ×10⁶ m`, 40, 65)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [planetMass, satMass, orbRadius, orbSpeed, isPending, realism.isRealistic])

  const handleApply = () => {
    setPlanetMass(parseFloat(localPM) || 5.97)
    setSatMass(parseFloat(localSM) || 1)
    setOrbRadius(parseFloat(localOR) || 6.37)
    setOrbSpeed(parseFloat(localOS) || 1.0)
  }
  const handleReset = () => {
    setLocalPM(5.97); setLocalSM(1); setLocalOR(6.37); setLocalOS(1.0)
    setPlanetMass(5.97); setSatMass(1); setOrbRadius(6.37); setOrbSpeed(1.0)
  }

  const G = 6.674e-11
  const force = G * (planetMass * 1e24) * satMass / Math.pow((orbRadius || 1) * 1e6, 2)

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputCardField label="Planet Mass (×10²⁴ kg)" value={localPM} min={0.1} max={100} step={0.1} onChange={setLocalPM} unit="10²⁴ kg" />
            <InputCardField label="Satellite Mass (kg)" value={localSM} min={0.1} max={10000} step={10} onChange={setLocalSM} unit="kg" />
            <InputCardField label="Orbital Distance (×10⁶ m)" value={localOR} min={1} max={50} step={0.1} onChange={setLocalOR} unit="10⁶ m" />
            <InputCardField label="Speed Multiplier" value={localOS} min={0.1} max={3} step={0.1} onChange={setLocalOS} unit="×" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleApply} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter valid masses and distance.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Gravitational Force (F):</span>
              <span className="font-bold text-[#88C0B8]">{force.toExponential(3)} N</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  6. BERNOULLI EQUATION SIMULATOR
// ══════════════════════════════════════════════════
export function BernoulliSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [v1, setV1] = useState(() => { const v = getInitialParam(initialParams, 'velocity1', 2); return v === "" ? 2 : v })
  const [p1, setP1] = useState(() => { const v = getInitialParam(initialParams, 'pressure1', 101325); return v === "" ? 101325 : v })
  const [h1, setH1] = useState(0)
  const [areaRatio, setAreaRatio] = useState(0.5)

  const [localV1, setLocalV1] = useState(2)
  const [localP1, setLocalP1] = useState(101325)
  const [localH1, setLocalH1] = useState(0)
  const [localAR, setLocalAR] = useState(0.5)

  useEffect(() => { setLocalV1(v1); setLocalP1(p1); setLocalH1(h1); setLocalAR(areaRatio) }, [v1, p1, h1, areaRatio])
  const animRef = useRef()

  const isPending = v1 === "" || p1 === "";
  const realism = checkRealism('bernoulli', isPending ? {} : { velocity1: v1, pressure1: p1, height1: h1, areaRatio })

  const stateRef = useRef({
    v1: 2, p1: 101325, h1: 0, areaRatio: 0.5, t: 0,
    particles: Array.from({ length: 90 }, () => ({
      x: 50 + Math.random() * 1000,
      yOffset: (Math.random() - 0.5) * 0.8 // relative height -0.4 to 0.4
    })),
    isPending: false, isRealistic: true
  })
  useEffect(() => {
    Object.assign(stateRef.current, { v1, p1, h1, areaRatio, isPending, isRealistic: realism.isRealistic })
  }, [v1, p1, h1, areaRatio, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      s.t += 0.016
      const cy = H / 2 + 20
      const pipeLeft = 80, pipeRight = W - 80
      const wideH = 100
      const constrRatio = Math.max(0.2, Math.min(0.9, s.areaRatio || 0.5))
      const constrH = wideH * constrRatio

      const sec1Right = 360
      const taper1Right = 480
      const sec2Right = 680
      const taper2Right = 800

      // Pipe profile helper
      const getPipeHalfH = (x) => {
        if (x < sec1Right) return wideH / 2
        if (x < taper1Right) {
          const t = (x - sec1Right) / (taper1Right - sec1Right)
          return (wideH / 2) + (constrH / 2 - wideH / 2) * (3 * t * t - 2 * t * t * t)
        }
        if (x < sec2Right) return constrH / 2
        if (x < taper2Right) {
          const t = (x - sec2Right) / (taper2Right - sec2Right)
          return (constrH / 2) + (wideH / 2 - constrH / 2) * (3 * t * t - 2 * t * t * t)
        }
        return wideH / 2
      }

      // Physics calculations
      const rho = 1000 // water density
      const v1_val = s.v1 || 2
      const v2_val = v1_val / constrRatio
      const p1_val = s.p1 || 101325
      const p2_val = p1_val + 0.5 * rho * (v1_val * v1_val - v2_val * v2_val)

      // Fluid interior fill
      ctx.beginPath()
      ctx.moveTo(pipeLeft, cy - wideH / 2)
      for (let x = pipeLeft; x <= pipeRight; x += 10) {
        ctx.lineTo(x, cy - getPipeHalfH(x))
      }
      ctx.lineTo(pipeRight, cy + getPipeHalfH(pipeRight))
      for (let x = pipeRight; x >= pipeLeft; x -= 10) {
        ctx.lineTo(x, cy + getPipeHalfH(x))
      }
      ctx.closePath()
      ctx.fillStyle = 'rgba(136,192,184,0.08)'
      ctx.fill()

      // Pipe boundaries
      ctx.strokeStyle = 'rgba(136,192,184,0.4)'; ctx.lineWidth = 2.5
      // Top wall
      ctx.beginPath(); ctx.moveTo(pipeLeft, cy - wideH / 2)
      for (let x = pipeLeft; x <= pipeRight; x += 5) ctx.lineTo(x, cy - getPipeHalfH(x))
      ctx.stroke()
      // Bottom wall
      ctx.beginPath(); ctx.moveTo(pipeLeft, cy + wideH / 2)
      for (let x = pipeLeft; x <= pipeRight; x += 5) ctx.lineTo(x, cy + getPipeHalfH(x))
      ctx.stroke()

      // Manometer tubes (pressure gauges)
      const mono1X = 220, mono2X = 580, mono3X = 900
      const tubeW = 16, tubeTopY = 40

      // Pressure levels (height of column proportional to pressure)
      const pRef = 101325
      const h1_tube = Math.max(15, Math.min(120, 60 + (p1_val - pRef) / 2000))
      const h2_tube = Math.max(10, Math.min(120, 60 + (p2_val - pRef) / 2000))

      // Draw Manometer 1 (Section 1)
      const m1PipeY = cy - getPipeHalfH(mono1X)
      ctx.strokeStyle = 'rgba(136,192,184,0.3)'; ctx.lineWidth = 1.5
      ctx.strokeRect(mono1X - tubeW / 2, tubeTopY, tubeW, m1PipeY - tubeTopY)
      ctx.fillStyle = 'rgba(136,192,184,0.3)'
      ctx.fillRect(mono1X - tubeW / 2 + 2, m1PipeY - h1_tube, tubeW - 4, h1_tube)
      // Level line & readout
      ctx.fillStyle = 'rgba(196,149,106,0.8)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText(`P₁ = ${(p1_val / 1000).toFixed(1)} kPa`, mono1X, tubeTopY - 8)

      // Draw Manometer 2 (Constriction Section 2)
      const m2PipeY = cy - getPipeHalfH(mono2X)
      ctx.strokeStyle = 'rgba(136,192,184,0.3)'; ctx.lineWidth = 1.5
      ctx.strokeRect(mono2X - tubeW / 2, tubeTopY, tubeW, m2PipeY - tubeTopY)
      ctx.fillStyle = p2_val < p1_val ? 'rgba(224,120,64,0.35)' : 'rgba(136,192,184,0.3)'
      ctx.fillRect(mono2X - tubeW / 2 + 2, m2PipeY - h2_tube, tubeW - 4, h2_tube)
      // Level line & readout
      ctx.fillStyle = p2_val < p1_val ? '#E07840' : 'rgba(196,149,106,0.8)'
      ctx.fillText(`P₂ = ${(p2_val / 1000).toFixed(1)} kPa`, mono2X, tubeTopY - 8)

      // Animated Particles
      for (const p of s.particles) {
        const halfH = getPipeHalfH(p.x)
        // Local velocity increases as pipe cross-section decreases (A1*v1 = A2*v2)
        const localV = v1_val * (wideH / 2 / halfH)
        p.x += localV * 0.8

        if (p.x > pipeRight) p.x = pipeLeft + Math.random() * 20

        const py = cy + p.yOffset * (halfH - 6)

        // Color shifts with speed: faster = brighter teal
        const speedRatio = localV / v1_val
        ctx.fillStyle = speedRatio > 1.3 ? `rgba(180,240,230,0.7)` : `rgba(136,192,184,0.5)`
        ctx.beginPath(); ctx.arc(p.x, py, 2.5, 0, Math.PI * 2); ctx.fill()
      }

      // Velocity vectors at key points
      // Section 1 Velocity Vector
      drawArrow(ctx, 160, cy, 160 + v1_val * 15, cy, '#88C0B8', 2, 6)
      ctx.fillStyle = '#88C0B8'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`v₁ = ${v1_val.toFixed(1)} m/s`, 160, cy + 20)

      // Constriction Velocity Vector (longer arrow demonstrating acceleration!)
      drawArrow(ctx, 520, cy, 520 + v2_val * 15, cy, '#88C0B8', 2, 6)
      ctx.fillStyle = '#88C0B8'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`v₂ = ${v2_val.toFixed(1)} m/s`, 520, cy + 16)

      // Streamlines
      ctx.strokeStyle = 'rgba(136,192,184,0.1)'; ctx.lineWidth = 1
      for (const factor of [-0.6, -0.2, 0.2, 0.6]) {
        ctx.beginPath(); ctx.moveTo(pipeLeft, cy + (wideH / 2) * factor)
        for (let x = pipeLeft; x <= pipeRight; x += 20) {
          ctx.lineTo(x, cy + getPipeHalfH(x) * factor)
        }
        ctx.stroke()
      }

      // Bernoulli Principle Note
      ctx.fillStyle = 'rgba(220,200,165,0.5)'; ctx.font = '11px var(--font-body)'; ctx.textAlign = 'left'
      ctx.fillText(`Bernoulli: P₁ + ½ρv₁² = P₂ + ½ρv₂²`, 40, H - 20)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const rho = 1000
  const v2 = (v1 || 2) / (areaRatio || 0.5)
  const p2 = (p1 || 101325) + 0.5 * rho * ((v1 || 2) * (v1 || 2) - v2 * v2)

  const handleCalc = () => {
    setV1(parseFloat(localV1) || 2)
    setP1(parseFloat(localP1) || 101325)
    setH1(parseFloat(localH1) || 0)
    setAreaRatio(parseFloat(localAR) || 0.5)
  }
  const handleReset = () => {
    setLocalV1(2); setLocalP1(101325); setLocalH1(0); setLocalAR(0.5)
    setV1(2); setP1(101325); setH1(0); setAreaRatio(0.5)
  }

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InputCardField label="Velocity (v₁)" value={localV1} min={0.1} max={50} step={0.1} onChange={setLocalV1} unit="m/s" />
            <InputCardField label="Pressure (P₁)" value={localP1} min={1000} max={500000} step={1000} onChange={setLocalP1} unit="Pa" />
            <InputCardField label="Height (h₁)" value={localH1} min={0} max={100} step={0.5} onChange={setLocalH1} unit="m" />
            <InputCardField label="Area Ratio (A₂/A₁)" value={localAR} min={0.1} max={1.0} step={0.05} onChange={setLocalAR} />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleCalc} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter velocity and pressure.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Velocity at Constriction (v₂):</span>
              <span className="font-bold text-[#88C0B8]">{v2.toFixed(2)} m/s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-50">Pressure at Constriction (P₂):</span>
              <span className="font-bold text-[#88C0B8]">{(p2 / 1000).toFixed(2)} kPa</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  7. REYNOLDS NUMBER SIMULATOR
// ══════════════════════════════════════════════════
export function ReynoldsSimulator({ initialParams }) {
const canvasRef = useRef(null)
const [velocity, setVelocity] = useState(() => { const v = getInitialParam(initialParams, 'velocity', 1); return v === "" ? 1 : v })
const [charLen, setCharLen] = useState(() => { const v = getInitialParam(initialParams, 'length', 0.1); return v === "" ? 0.1 : v })
const [viscosity, setViscosity] = useState(() => { const v = getInitialParam(initialParams, 'viscosity', 1e-3); return v === "" ? 1e-3 : v })
const [density, setDensity] = useState(() => { const v = getInitialParam(initialParams, 'density', 1000); return v === "" ? 1000 : v })
const [localV, setLocalV] = useState(1); const [localL, setLocalL] = useState(0.1)
const [localMu, setLocalMu] = useState(1e-3); const [localRho, setLocalRho] = useState(1000)
useEffect(() => { setLocalV(velocity); setLocalL(charLen); setLocalMu(viscosity); setLocalRho(density) }, [velocity, charLen, viscosity, density])
const animRef = useRef()

const isPending = velocity === "" || charLen === "" || viscosity === "" || density === "";
const realism = checkRealism('reynolds', isPending ? {} : { velocity, charLen, viscosity, density })

const stateRef = useRef({
  v: 1, L: 0.1, mu: 1e-3, rho: 1000, t: 0,
  particles: Array.from({ length: 120 }, () => ({
    x: 80 + Math.random() * 940,
    yOffset: (Math.random() - 0.5) * 0.8, // -0.4 to 0.4 relative to pipe height
    vy: (Math.random() - 0.5) * 0.5,
    phase: Math.random() * Math.PI * 2
  })),
  isPending: false, isRealistic: true
})
useEffect(() => { Object.assign(stateRef.current, { v: velocity, L: charLen, mu: viscosity, rho: density, isPending, isRealistic: realism.isRealistic }) }, [velocity, charLen, viscosity, density, isPending, realism.isRealistic])

useEffect(() => {
const canvas = canvasRef.current; if (!canvas) return
const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('Awaiting required parameters...', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      s.t += 0.016
      const cy = H / 2
      const pipeLeft = 80, pipeRight = W - 80, pipeH = 140
      const Re = ((s.rho || 1000) * (s.v || 1) * (s.L || 0.1)) / (s.mu || 1e-3)

      // Background grid
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

      // Pipe interior fill
      ctx.fillStyle = 'rgba(136,192,184,0.04)'
      ctx.fillRect(pipeLeft, cy - pipeH / 2, pipeRight - pipeLeft, pipeH)

      // Pipe walls
      ctx.strokeStyle = 'rgba(136,192,184,0.35)'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(pipeLeft, cy - pipeH / 2); ctx.lineTo(pipeRight, cy - pipeH / 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(pipeLeft, cy + pipeH / 2); ctx.lineTo(pipeRight, cy + pipeH / 2); ctx.stroke()

      // Pipe hatching (outside walls)
      for (let x = pipeLeft; x <= pipeRight; x += 20) {
        ctx.strokeStyle = 'rgba(136,192,184,0.08)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, cy - pipeH / 2); ctx.lineTo(x - 5, cy - pipeH / 2 - 8); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(x, cy + pipeH / 2); ctx.lineTo(x - 5, cy + pipeH / 2 + 8); ctx.stroke()
      }

      // Dye Injector Needle (left side)
      ctx.fillStyle = 'rgba(196,149,106,0.4)'; ctx.fillRect(pipeLeft - 25, cy - 3, 30, 6)
      ctx.strokeStyle = 'rgba(196,149,106,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(pipeLeft - 25, cy - 3, 30, 6)
      ctx.fillStyle = 'rgba(196,149,106,0.5)'; ctx.font = '9px var(--font-body)'; ctx.textAlign = 'right'
      ctx.fillText('Dye Injector', pipeLeft - 30, cy + 3)

      // Draw Dye Streamline & Particle Flow
      const flowSpeed = Math.min(12, Math.max(1, (s.v || 1) * 3))

      if (Re < 2300) {
        // LAMINAR FLOW: Perfectly straight parallel dye stream
        ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(pipeLeft + 5, cy); ctx.lineTo(pipeRight - 5, cy); ctx.stroke()

        // Additional laminar streamlines
        ctx.strokeStyle = 'rgba(136,192,184,0.2)'; ctx.lineWidth = 1
        for (const offset of [-40, -20, 20, 40]) {
          ctx.beginPath(); ctx.moveTo(pipeLeft + 5, cy + offset); ctx.lineTo(pipeRight - 5, cy + offset); ctx.stroke()
        }

        // Parallel fluid particles
        for (const p of s.particles) {
          p.x += flowSpeed
          if (p.x > pipeRight) p.x = pipeLeft + Math.random() * 10
          // Parabolic velocity profile (v max at center)
          const py = cy + p.yOffset * (pipeH / 2 - 10)
          ctx.fillStyle = 'rgba(136,192,184,0.4)'
          ctx.beginPath(); ctx.arc(p.x, py, 2.5, 0, Math.PI * 2); ctx.fill()
        }
      } else if (Re <= 4000) {
        // TRANSITIONAL FLOW: Wavy dye stream that breaks down downstream
        ctx.strokeStyle = 'rgba(232,200,128,0.8)'; ctx.lineWidth = 2.5
        ctx.beginPath()
        for (let x = pipeLeft + 5; x <= pipeRight - 5; x += 4) {
          const distFrac = (x - pipeLeft) / (pipeRight - pipeLeft)
          const waveAmp = distFrac * distFrac * 25 // growing amplitude
          const y = cy + Math.sin((x + s.t * 100) * 0.05) * waveAmp
          if (x === pipeLeft + 5) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()

        // Transitional particles with growing vertical oscillation
        for (const p of s.particles) {
          p.x += flowSpeed
          if (p.x > pipeRight) p.x = pipeLeft + Math.random() * 10
          const distFrac = (p.x - pipeLeft) / (pipeRight - pipeLeft)
          const py = cy + p.yOffset * (pipeH / 2 - 10) + Math.sin(p.x * 0.04 + s.t * 5) * (distFrac * 20)
          ctx.fillStyle = distFrac > 0.5 ? 'rgba(232,200,128,0.5)' : 'rgba(136,192,184,0.4)'
          ctx.beginPath(); ctx.arc(p.x, py, 2.5, 0, Math.PI * 2); ctx.fill()
        }
      } else {
        // TURBULENT FLOW: Chaotic swirling vortices and rapid mixing
        // Swirling dye path
        ctx.strokeStyle = '#E07840'; ctx.lineWidth = 2
        ctx.beginPath()
        for (let x = pipeLeft + 5; x <= pipeRight - 5; x += 3) {
          const distFrac = (x - pipeLeft) / (pipeRight - pipeLeft)
          const swirl1 = Math.sin((x + s.t * 150) * 0.08) * 35 * Math.min(1, distFrac * 2)
          const swirl2 = Math.cos((x - s.t * 100) * 0.12) * 15 * distFrac
          const y = cy + swirl1 + swirl2
          if (x === pipeLeft + 5) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()

        // Chaotic mixing particles with eddy current motions
        for (const p of s.particles) {
          p.x += flowSpeed * (0.7 + Math.sin(p.phase + s.t * 10) * 0.3)
          p.phase += 0.05
          if (p.x > pipeRight) p.x = pipeLeft + Math.random() * 10
          const distFrac = (p.x - pipeLeft) / (pipeRight - pipeLeft)
          const eddyY = Math.sin(p.x * 0.06 + s.t * 8 + p.phase) * (30 * Math.min(1, distFrac * 1.5))
          let py = cy + p.yOffset * (pipeH / 2 - 15) + eddyY
          py = Math.max(cy - pipeH / 2 + 6, Math.min(cy + pipeH / 2 - 6, py))
          ctx.fillStyle = `rgba(224,120,64,${0.3 + Math.sin(p.phase) * 0.3})`
          ctx.beginPath(); ctx.arc(p.x, py, 3, 0, Math.PI * 2); ctx.fill()
        }
      }

      // Regime Badge & Readouts
      const regimeName = Re < 2300 ? 'LAMINAR FLOW' : (Re <= 4000 ? 'TRANSITIONAL FLOW' : 'TURBULENT FLOW')
      const regimeColor = Re < 2300 ? '#88C0B8' : (Re <= 4000 ? '#E8C880' : '#E07840')

      ctx.fillStyle = regimeColor; ctx.font = 'bold 14px var(--font-mono)'; ctx.textAlign = 'right'
      ctx.fillText(regimeName, pipeRight, 35)

      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'
      ctx.fillText(`Re = ${Re.toFixed(0)}`, 40, 25)
      ctx.fillText(`v = ${(s.v || 1).toFixed(2)} m/s`, 40, 45)
      ctx.fillText(`L = ${(s.L || 0.1).toFixed(2)} m`, 40, 65)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])
// ══════════════════════════════════════════════════


const Re = (density || 1000) * (velocity || 1) * (charLen || 0.1) / (viscosity || 1e-3)
const flowType = Re > 2300 ? 'Turbulent' : 'Laminar'

const handleApply = () => {
  setVelocity(parseFloat(localV) || 1)
  setCharLen(parseFloat(localL) || 0.1)
  setViscosity(parseFloat(localMu) || 1e-3)
  setDensity(parseFloat(localRho) || 1000)
}
const handleReset = () => {
  setLocalV(1); setLocalL(0.1); setLocalMu(1e-3); setLocalRho(1000)
  setVelocity(1); setCharLen(0.1); setViscosity(1e-3); setDensity(1000)
}

return (
  <div className="flex flex-col items-center w-full">
    <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
    <WorkspacePortal target="inputs">
      <div className="flex flex-col gap-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputCardField label="Velocity (v)" value={localV} min={0.01} max={100} step={0.1} onChange={setLocalV} unit="m/s" />
          <InputCardField label="Char Length (L)" value={localL} min={0.001} max={10} step={0.01} onChange={setLocalL} unit="m" />
          <InputCardField label="Viscosity (μ)" value={localMu} min={1e-6} max={10} step={1e-4} onChange={setLocalMu} unit="Pa·s" />
          <InputCardField label="Density (ρ)" value={localRho} min={0.1} max={10000} step={10} onChange={setLocalRho} unit="kg/m³" />
        </div>
        <div className="flex gap-4 mt-2 w-full">
          <button onClick={handleApply} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
          <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
        </div>
      </div>
    </WorkspacePortal>

    <WorkspacePortal target="results">
      <RealismCheckCard realism={realism} />
      {isPending ? (
        <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
          <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
          Enter velocity, length, viscosity, and density.
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
            <span className="opacity-50">Reynolds Number (Re):</span>
            <span className="font-bold text-[#88C0B8]">{Re.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-50">Flow Regime:</span>
            <span className="font-bold" style={{ color: Re > 2300 ? '#E07840' : '#88C0B8' }}>{flowType}</span>
          </div>
        </div>
      )}
    </WorkspacePortal>
  </div>
)
}

// ══════════════════════════════════════════════════
//  8. NAVIER–STOKES SIMULATOR — Channel Flow
// ══════════════════════════════════════════════════
export function NavierSimulator({ initialParams }) {
const canvasRef = useRef(null)
const [avgVel, setAvgVel] = useState(() => { const v = getInitialParam(initialParams, 'velocity', 1.5); return v === "" ? 1.5 : v })
const [visc, setVisc] = useState(() => { const v = getInitialParam(initialParams, 'viscosity', 0.001); return v === "" ? 0.001 : v })
const [halfH, setHalfH] = useState(() => { const v = getInitialParam(initialParams, 'halfHeight', 0.05); return v === "" ? 0.05 : v })
const [density, setDensity] = useState(() => { const v = getInitialParam(initialParams, 'density', 1000); return v === "" ? 1000 : v })
const [localVel, setLocalVel] = useState(1.5); const [localVisc, setLocalVisc] = useState(0.001)
const [localHalfH, setLocalHalfH] = useState(0.05); const [localRho, setLocalRho] = useState(1000)
useEffect(() => { setLocalVel(avgVel); setLocalVisc(visc); setLocalHalfH(halfH); setLocalRho(density) }, [avgVel, visc, halfH, density])
const animRef = useRef()

const isPending = avgVel === "" || visc === "" || halfH === "" || density === "";
const Re = (!isPending) ? (density * avgVel * (2 * halfH)) / visc : 0

const stateRef = useRef({
  vAvg: 1.5, mu: 0.001, h: 0.05, rho: 1000, t: 0, Re: 0,
  particles: Array.from({ length: 220 }, () => ({
    x: 60 + Math.random() * 980,
    yFrac: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
    speedFrac: 0,
    turbulentOffset: 0
  })),
  isPending: false
})
useEffect(() => {
  Object.assign(stateRef.current, { vAvg: avgVel, mu: visc, h: halfH, rho: density, Re, isPending })
}, [avgVel, visc, halfH, density, Re, isPending])

useEffect(() => {
const canvas = canvasRef.current; if (!canvas) return
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1
const W = 1100, H = 380
canvas.width = W * dpr; canvas.height = H * dpr
canvas.style.width = '100%'; canvas.style.height = `${H}px`
ctx.scale(dpr, dpr)

const pipeL = 60, pipeR = W - 60
const pipeC = H / 2 + 10

const draw = () => {
  const s = stateRef.current
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
  if (s.isPending) {
    ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Awaiting required parameters...', W / 2, H / 2)
    animRef.current = requestAnimationFrame(draw)
    return
  }

  s.t += 0.016
  const vAvg = s.vAvg || 1.5
  const muVal = s.mu || 0.001
  const hVal = s.h || 0.05
  const rhoVal = s.rho || 1000
  const ReVal = (rhoVal * vAvg * (2 * hVal)) / muVal

  const isLaminar = ReVal < 2300
  const isTransitional = ReVal >= 2300 && ReVal <= 4000
  const isTurbulent = ReVal > 4000

  // Scaling: map channel half-height hVal to pipeHalf on canvas
  const pipeHalf = 130

  // Velocity profile: v(y) = v_max * (1 - (y/h)^2)
  // where y is distance from centerline, h is pipeHalf
  const vMax = vAvg * 1.5

  // Turbulence noise factor
  const turbFactor = isLaminar ? 0 : (isTransitional ? 0.08 + (ReVal - 2300) / 17000 : 0.25 + Math.min(1, (ReVal - 4000) / 10000) * 0.35)

  // Background grid
  ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
  for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
  for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

  // Channel interior fill
  ctx.fillStyle = 'rgba(136,192,184,0.05)'
  ctx.fillRect(pipeL, pipeC - pipeHalf, pipeR - pipeL, pipeHalf * 2)

  // Channel walls
  ctx.strokeStyle = 'rgba(136,192,184,0.35)'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(pipeL, pipeC - pipeHalf); ctx.lineTo(pipeR, pipeC - pipeHalf); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(pipeL, pipeC + pipeHalf); ctx.lineTo(pipeR, pipeC + pipeHalf); ctx.stroke()

  // Wall hatch marks
  ctx.strokeStyle = 'rgba(136,192,184,0.08)'; ctx.lineWidth = 1
  for (let x = pipeL; x <= pipeR; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, pipeC - pipeHalf); ctx.lineTo(x - 5, pipeC - pipeHalf - 8); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, pipeC + pipeHalf); ctx.lineTo(x - 5, pipeC + pipeHalf + 8); ctx.stroke()
  }

  // Streamlines
  ctx.strokeStyle = 'rgba(136,192,184,0.07)'; ctx.lineWidth = 1
  for (let frac = -0.8; frac <= 0.8; frac += 0.4) {
    const yOff = frac * pipeHalf
    ctx.beginPath(); ctx.moveTo(pipeL, pipeC + yOff)
    for (let x = pipeL; x <= pipeR; x += 15) {
      const turbShift = isTurbulent ? Math.sin(x * 0.03 + s.t * 4 + frac * 3) * turbFactor * 5 : (isTransitional ? Math.sin(x * 0.02 + s.t * 2 + frac * 2) * turbFactor * 8 : 0)
      ctx.lineTo(x, pipeC + yOff + turbShift)
    }
    ctx.stroke()
  }

  // Update and draw particles
  const particleCount = s.particles.length
  for (let i = 0; i < particleCount; i++) {
    const p = s.particles[i]
    // y position within channel (yFrac: -1 to 1, 0 = center)
    const yFrac = p.yFrac
    const yPos = yFrac * pipeHalf
    // Parabolic velocity: speedFrac = 1 - yFrac^2 (1 at center, 0 at walls)
    const speedFrac = Math.max(0, 1 - yFrac * yFrac)
    p.speedFrac = speedFrac
    const localVel = vMax * speedFrac

    // Move particle
    let dx = localVel * 2.5
    if (isTurbulent) {
      p.phase += 0.03 + Math.random() * 0.02
      const eddyX = Math.sin(p.phase + s.t * 2) * turbFactor * 8
      const eddyY = Math.sin(p.phase * 1.3 + s.t * 3 + yFrac * 5) * turbFactor * 12
      p.turbulentOffset = eddyY
      dx += eddyX
      p.x += dx
    } else if (isTransitional) {
      p.phase += 0.015
      const waveY = Math.sin(p.x * 0.015 + s.t * 1.5 + p.phase) * turbFactor * 10
      p.turbulentOffset = waveY * (1 - Math.abs(yFrac))
      p.x += dx
    } else {
      p.turbulentOffset = 0
      p.x += dx
    }

    if (p.x > pipeR) p.x = pipeL + Math.random() * 20

    // Particle Y position (clamped within channel)
    const turbY = p.turbulentOffset || 0
    const py = Math.max(pipeC - pipeHalf + 5, Math.min(pipeC + pipeHalf - 5, pipeC + yPos + turbY))

    // Color based on velocity (speedFrac: 0=slow, 1=fast)
    const r = Math.floor(80 + speedFrac * 100)
    const g = Math.floor(150 + speedFrac * 80)
    const b = Math.floor(140 + speedFrac * 60)
    const alpha = 0.35 + speedFrac * 0.4

    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
    const size = 1.8 + speedFrac * 1.8
    ctx.beginPath(); ctx.arc(p.x, py, size, 0, Math.PI * 2); ctx.fill()
  }

  // Velocity profile arrows (show parabolic distribution)
  const arrowX = pipeL + 50
  const arrowSpacing = pipeHalf / 6
  for (let i = 0; i <= 6; i++) {
    const yFrac = -1 + i * (2 / 6)
    const speedFrac = Math.max(0, 1 - yFrac * yFrac)
    const arrowLen = speedFrac * 50
    const ay = pipeC + yFrac * pipeHalf
    if (speedFrac > 0.02) {
      const alpha = 0.3 + speedFrac * 0.5
      drawArrow(ctx, arrowX, ay, arrowX + arrowLen, ay, `rgba(136,192,184,${alpha})`, 1.5 + speedFrac * 1.5, 5)
    }
  }

  // Label for velocity profile
  ctx.fillStyle = 'rgba(136,192,184,0.5)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
  ctx.fillText('Velocity Profile →', arrowX, pipeC - pipeHalf - 15)

  // Flow direction arrow (large, above channel)
  const flowArrowY = pipeC - pipeHalf - 35
  drawArrow(ctx, pipeL + 80, flowArrowY, pipeR - 80, flowArrowY, 'rgba(136,192,184,0.4)', 2.5, 8)
  ctx.fillStyle = 'rgba(136,192,184,0.4)'; ctx.font = '11px var(--font-body)'; ctx.textAlign = 'center'
  ctx.fillText('Flow Direction →', (pipeL + pipeR) / 2, flowArrowY - 10)

  // Regime badge (top right)
  const regimeName = isLaminar ? 'LAMINAR' : (isTransitional ? 'TRANSITIONAL' : 'TURBULENT')
  const regimeColor = isLaminar ? '#88C0B8' : (isTransitional ? '#E8C880' : '#E07840')
  ctx.fillStyle = regimeColor; ctx.font = 'bold 13px var(--font-mono)'; ctx.textAlign = 'right'
  ctx.fillText(regimeName, pipeR, 28)

  // Live readouts (top left)
  ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'
  ctx.fillText(`Re = ${ReVal.toFixed(0)}`, 30, 22)
  ctx.fillText(`v_avg = ${vAvg.toFixed(2)} m/s`, 30, 40)
  ctx.fillText(`v_max = ${vMax.toFixed(2)} m/s`, 30, 58)
  ctx.fillText(`μ = ${muVal.toFixed(4)} Pa·s`, 30, 76)

  // Bottom annotation
  ctx.fillStyle = 'rgba(220,200,165,0.35)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
  ctx.fillText('Poiseuille Flow: Parabolic velocity profile — no-slip at walls', (pipeL + pipeR) / 2, H - 15)

  animRef.current = requestAnimationFrame(draw)
}
draw()
return () => cancelAnimationFrame(animRef.current)
}, [])

const vMaxVal = (avgVel || 1.5) * 1.5
const flowType = Re > 2300 ? (Re > 4000 ? 'Turbulent' : 'Transitional') : 'Laminar'

const handleCalc = () => {
  setAvgVel(parseFloat(localVel) || 1.5)
  setVisc(parseFloat(localVisc) || 0.001)
  setHalfH(parseFloat(localHalfH) || 0.05)
  setDensity(parseFloat(localRho) || 1000)
}
const handleReset = () => {
  setLocalVel(1.5); setLocalVisc(0.001); setLocalHalfH(0.05); setLocalRho(1000)
  setAvgVel(1.5); setVisc(0.001); setHalfH(0.05); setDensity(1000)
}

return (
  <div className="flex flex-col items-center w-full">
    <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
    <WorkspacePortal target="inputs">
      <div className="flex flex-col gap-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputCardField label="Avg Velocity (v_avg)" value={localVel} min={0.01} max={50} step={0.1} onChange={setLocalVel} unit="m/s" />
          <InputCardField label="Viscosity (μ)" value={localVisc} min={0.0001} max={10} step={0.0001} onChange={setLocalVisc} unit="Pa·s" />
          <InputCardField label="Channel Half-Height (h)" value={localHalfH} min={0.001} max={1} step={0.005} onChange={setLocalHalfH} unit="m" />
          <InputCardField label="Density (ρ)" value={localRho} min={0.1} max={10000} step={10} onChange={setLocalRho} unit="kg/m³" />
        </div>
        <div className="flex gap-4 mt-2 w-full">
          <button onClick={handleCalc} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
          <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
        </div>
      </div>
    </WorkspacePortal>

    <WorkspacePortal target="results">
      {isPending ? (
        <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
          <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
          Enter velocity, viscosity, channel height, and density.
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
            <span className="opacity-50">Reynolds Number (Re):</span>
            <span className="font-bold text-[#88C0B8]">{Re.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
            <span className="opacity-50">Max Velocity (v_max):</span>
            <span className="font-bold text-[#88C0B8]">{vMaxVal.toFixed(2)} m/s</span>
          </div>
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
            <span className="opacity-50">Flow Regime:</span>
            <span className="font-bold" style={{ color: Re > 4000 ? '#E07840' : (Re > 2300 ? '#E8C880' : '#88C0B8') }}>{flowType}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="opacity-50">Velocity Profile:</span>
            <span className="text-[#88C0B8]">Parabolic (Poiseuille)</span>
          </div>
        </div>
      )}
    </WorkspacePortal>
  </div>
)
} // NavierSimulator

// ══════════════════════════════════════════════════
//  9. COULOMB'S LAW SIMULATOR
// ══════════════════════════════════════════════════
export function CoulombSimulator({ initialParams }) {
const canvasRef = useRef(null)
const [q1, setQ1] = useState(() => { const v = getInitialParam(initialParams, 'charge1', 1); return v === "" ? 1 : v })
const [q2, setQ2] = useState(() => { const v = getInitialParam(initialParams, 'charge2', -1); return v === "" ? -1 : v })
const [dist, setDist] = useState(() => { const v = getInitialParam(initialParams, 'distance', 0.5); return v === "" ? 0.5 : v })
const [localQ1, setLocalQ1] = useState(1); const [localQ2, setLocalQ2] = useState(-1); const [localD, setLocalD] = useState(0.5)
useEffect(() => { setLocalQ1(q1); setLocalQ2(q2); setLocalD(dist) }, [q1, q2, dist])
const animRef = useRef()

const isPending = q1 === "" || q2 === "" || dist === "";
const realism = checkRealism('coulomb', isPending ? {} : { charge1: q1, charge2: q2, distance: dist })

const stateRef = useRef({ q1: 1, q2: -1, dist: 0.5, t: 0, testParticles: [], isPending: false, isRealistic: true })
useEffect(() => { Object.assign(stateRef.current, { q1, q2, dist, testParticles: [], isPending, isRealistic: realism.isRealistic }) }, [q1, q2, dist, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      s.t += 0.016
      const cx = W / 2, cy = H / 2
      const q1_val = s.q1 || 1, q2_val = s.q2 || -1, d_val = s.dist || 0.5
      const dPx = Math.max(140, Math.min(620, d_val * 250))

      const q1X = cx - dPx / 2, q2X = cx + dPx / 2
      const isAttract = (q1_val * q2_val) < 0

      // Grid background
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

      // ── Electric Field Lines ──
      const numLines = 16
      ctx.lineWidth = 1.2
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2
        ctx.beginPath()

        if (isAttract) {
          // Curved field lines from positive to negative charge
          const posIsQ1 = q1_val > 0
          const startX = posIsQ1 ? q1X : q2X, endX = posIsQ1 ? q2X : q1X
          const cpOffset = Math.sin(angle) * (dPx * 0.55)
          const lineAlpha = 0.2 + Math.abs(Math.cos(angle)) * 0.25
          ctx.strokeStyle = `rgba(136,192,184,${lineAlpha})`
          ctx.moveTo(startX + Math.cos(angle) * 18, cy + Math.sin(angle) * 18)
          ctx.quadraticCurveTo(cx, cy + cpOffset, endX - Math.cos(angle) * 18, cy + Math.sin(angle) * 18)
          ctx.stroke()

          // Animated energy pulse moving along field line
          const pulseT = (s.t * 0.8 + i / numLines) % 1
          const px = (1 - pulseT) * (1 - pulseT) * startX + 2 * (1 - pulseT) * pulseT * cx + pulseT * pulseT * endX
          const py = (1 - pulseT) * (1 - pulseT) * (cy + Math.sin(angle) * 18) + 2 * (1 - pulseT) * pulseT * (cy + cpOffset) + pulseT * pulseT * (cy + Math.sin(angle) * 18)
          ctx.fillStyle = 'rgba(136,192,184,0.6)'
          ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill()
        } else {
          // Repulsive field lines bending outward away from each other
          ctx.strokeStyle = 'rgba(224,120,64,0.22)'
          const bendX1 = q1X + Math.cos(angle) * 70 - (q2X - q1X) * 0.2
          const bendY1 = cy + Math.sin(angle) * 90
          ctx.moveTo(q1X + Math.cos(angle) * 16, cy + Math.sin(angle) * 16)
          ctx.quadraticCurveTo(bendX1, bendY1, q1X + Math.cos(angle) * 160, cy + Math.sin(angle) * 160)
          ctx.stroke()

          const bendX2 = q2X + Math.cos(angle) * 70 + (q2X - q1X) * 0.2
          const bendY2 = cy + Math.sin(angle) * 90
          ctx.moveTo(q2X + Math.cos(angle) * 16, cy + Math.sin(angle) * 16)
          ctx.quadraticCurveTo(bendX2, bendY2, q2X + Math.cos(angle) * 160, cy + Math.sin(angle) * 160)
          ctx.stroke()
        }
      }

      // ── Separation Distance Line & Measurement Ticks ──
      const rulerY = cy + 65
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(232,221,204,0.35)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(q1X, rulerY); ctx.lineTo(q2X, rulerY); ctx.stroke(); ctx.setLineDash([])
      // Ticks at ends
      ctx.beginPath(); ctx.moveTo(q1X, rulerY - 6); ctx.lineTo(q1X, rulerY + 6); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(q2X, rulerY - 6); ctx.lineTo(q2X, rulerY + 6); ctx.stroke()
      // Label pill
      ctx.fillStyle = 'rgba(24,20,16,0.85)'
      ctx.fillRect(cx - 45, rulerY - 10, 90, 20)
      ctx.strokeStyle = 'rgba(196,149,106,0.3)'; ctx.strokeRect(cx - 45, rulerY - 10, 90, 20)
      ctx.fillStyle = '#E8C880'; ctx.font = '11px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`r = ${d_val.toFixed(2)} m`, cx, rulerY)

      // ── Electrostatic Force Calculation ──
      const F = (8.99e9 * Math.abs(q1_val * 1e-6 * q2_val * 1e-6)) / Math.pow(d_val, 2)
      const forceArrowLen = Math.min(100, Math.max(25, Math.log10(F + 1) * 22))

      // Force Vectors (Action-Reaction Pairs F12 & F21)
      const f1Dir = isAttract ? 1 : -1
      const f2Dir = isAttract ? -1 : 1

      // Force on Q1 (orange/gold arrow)
      drawArrow(ctx, q1X, cy, q1X + f1Dir * forceArrowLen, cy, '#E8C880', 2.5, 8)
      ctx.fillStyle = '#E8C880'; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillText(`F₁₂`, q1X + f1Dir * (forceArrowLen / 2), cy - 8)

      // Force on Q2
      drawArrow(ctx, q2X, cy, q2X + f2Dir * forceArrowLen, cy, '#E8C880', 2.5, 8)
      ctx.fillStyle = '#E8C880'; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillText(`F₂₁`, q2X + f2Dir * (forceArrowLen / 2), cy - 8)

      // ── Charge 1 Sphere ──
      const r1 = Math.max(14, Math.min(26, 14 + Math.abs(q1_val) * 0.15))
      const c1Color = q1_val > 0 ? '#E07840' : '#88C0B8'
      ctx.fillStyle = q1_val > 0 ? 'rgba(224,120,64,0.2)' : 'rgba(136,192,184,0.2)'
      ctx.beginPath(); ctx.arc(q1X, cy, r1 + 8, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = c1Color; ctx.beginPath(); ctx.arc(q1X, cy, r1, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(232,221,204,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q1X, cy, r1, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = '#141210'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(q1_val > 0 ? `+${q1_val}µC` : `${q1_val}µC`, q1X, cy)
      ctx.fillStyle = 'rgba(232,221,204,0.6)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('q₁', q1X, cy - r1 - 10)

      // ── Charge 2 Sphere ──
      const r2 = Math.max(14, Math.min(26, 14 + Math.abs(q2_val) * 0.15))
      const c2Color = q2_val > 0 ? '#E07840' : '#88C0B8'
      ctx.fillStyle = q2_val > 0 ? 'rgba(224,120,64,0.2)' : 'rgba(136,192,184,0.2)'
      ctx.beginPath(); ctx.arc(q2X, cy, r2 + 8, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = c2Color; ctx.beginPath(); ctx.arc(q2X, cy, r2, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(232,221,204,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q2X, cy, r2, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = '#141210'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(q2_val > 0 ? `+${q2_val}µC` : `${q2_val}µC`, q2X, cy)
      ctx.fillStyle = 'rgba(232,221,204,0.6)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('q₂', q2X, cy - r2 - 10)

      // ── Banner / Equation Badge (bottom-center) ──
      ctx.fillStyle = 'rgba(196,149,106,0.12)'; ctx.fillRect(W / 2 - 130, H - 38, 260, 26)
      ctx.strokeStyle = 'rgba(196,149,106,0.25)'; ctx.strokeRect(W / 2 - 130, H - 38, 260, 26)
      ctx.fillStyle = isAttract ? '#88C0B8' : '#E07840'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(isAttract ? 'ATTRACTIVE FORCE (Opposite Charges)' : 'REPULSIVE FORCE (Like Charges)', W / 2, H - 25)

      // ── Live Readouts (top-left) ──
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(`F_e = k · |q₁q₂| / r² = ${F.toExponential(3)} N`, 40, 25)
      ctx.fillText(`q₁ = ${q1_val} µC, q₂ = ${q2_val} µC`, 40, 45)
      ctx.fillText(`r = ${d_val.toFixed(2)} m`, 40, 65)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const handleApply = () => {
    setQ1(parseFloat(localQ1) || 1)
    setQ2(parseFloat(localQ2) || -1)
    setDist(parseFloat(localD) || 0.5)
  }
  const handleReset = () => {
    setLocalQ1(1); setLocalQ2(-1); setLocalD(0.5)
    setQ1(1); setQ2(-1); setDist(0.5)
  }

  const force = (8.99e9 * Math.abs(q1 * 1e-6 * q2 * 1e-6)) / Math.pow(dist || 0.5, 2)

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputCardField label="Charge 1 (μC)" value={localQ1} min={-100} max={100} step={1} onChange={setLocalQ1} unit="μC" />
            <InputCardField label="Charge 2 (μC)" value={localQ2} min={-100} max={100} step={1} onChange={setLocalQ2} unit="μC" />
            <InputCardField label="Distance (m)" value={localD} min={0.01} max={10} step={0.05} onChange={setLocalD} unit="m" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleApply} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter charges and distance.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Electrostatic Force (F):</span>
              <span className="font-bold text-[#88C0B8]">{force.toExponential(3)} N</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  9. IDEAL GAS LAW SIMULATOR
// ══════════════════════════════════════════════════
export function IdealGasSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [moles, setMoles] = useState(() => { const v = getInitialParam(initialParams, 'moles', 1); return v === "" ? 1 : v })
  const [temp, setTemp] = useState(() => { const v = getInitialParam(initialParams, 'temp', 300); return v === "" ? 300 : v })
  const [volume, setVolume] = useState(() => { const v = getInitialParam(initialParams, 'volume', 0.0224); return v === "" ? 0.0224 : v })

  const [localN, setLocalN] = useState(1)
  const [localT, setLocalT] = useState(300)
  const [localV, setLocalV] = useState(0.0224)

  useEffect(() => { setLocalN(moles); setLocalT(temp); setLocalV(volume) }, [moles, temp, volume])
  const animRef = useRef()

  const isPending = moles === "" || temp === "" || volume === "";
  const realism = checkRealism('idealGas', isPending ? {} : { moles, temp, volume })

  const stateRef = useRef({ n: 1, T: 300, V: 0.0224, particles: [], isPending: false, isRealistic: true })
  useEffect(() => {
    Object.assign(stateRef.current, { n: moles, T: temp, V: volume, isPending, isRealistic: realism.isRealistic })
  }, [moles, temp, volume, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const particles = Array.from({ length: 80 }, () => ({
      x: 350 + Math.random() * 400,
      y: 100 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4
    }))
    stateRef.current.particles = particles

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      // Background grid
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

      // Container Dimensions (Volume changes piston height!)
      const containerW = 420
      const minH = 70, maxH = 260
      const vNorm = Math.max(0.001, Math.min(0.5, s.V || 0.0224))
      const containerH = minH + (vNorm / 0.1) * (maxH - minH)
      const cx = W / 2 - containerW / 2
      const botY = H - 60
      const topY = botY - containerH
      const cy = (topY + botY) / 2

      // Cylinder fill
      const tNorm = Math.max(50, Math.min(2000, s.T || 300))
      const tRatio = (tNorm - 50) / 1950
      const bgR = Math.floor(24 + tRatio * 80), bgG = Math.floor(20 + (1 - tRatio) * 40), bgB = Math.floor(30 + (1 - tRatio) * 60)
      ctx.fillStyle = `rgba(${bgR},${bgG},${bgB},0.35)`
      ctx.fillRect(cx, topY, containerW, containerH)

      // Glass Cylinder Walls (left, right, bottom)
      ctx.strokeStyle = 'rgba(136,192,184,0.4)'; ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(cx, topY - 30); ctx.lineTo(cx, botY); ctx.lineTo(cx + containerW, botY); ctx.lineTo(cx + containerW, topY - 30)
      ctx.stroke()

      // Sliding Piston Head & Rod
      ctx.fillStyle = '#C4956A'
      ctx.fillRect(cx - 2, topY - 12, containerW + 4, 14)
      ctx.strokeStyle = 'rgba(232,221,204,0.6)'; ctx.lineWidth = 1
      ctx.strokeRect(cx - 2, topY - 12, containerW + 4, 14)
      // Piston Rod extending up
      ctx.fillStyle = 'rgba(196,149,106,0.6)'
      ctx.fillRect(W / 2 - 10, 20, 20, topY - 32)

      // Particles Motion & Collision
      const speedFactor = Math.max(0.2, Math.sqrt(tNorm / 300))
      // Particle color based on temperature (blue cold -> red hot)
      const pColor = `rgb(${Math.floor(100 + tRatio * 155)},${Math.floor(180 - tRatio * 100)},${Math.floor(220 - tRatio * 180)})`

      for (const p of s.particles) {
        // Clamp particles inside current piston height
        if (p.x < cx + 8) { p.x = cx + 8; p.vx *= -1 }
        if (p.x > cx + containerW - 8) { p.x = cx + containerW - 8; p.vx *= -1 }
        if (p.y < topY + 8) { p.y = topY + 8; p.vy *= -1 }
        if (p.y > botY - 8) { p.y = botY - 8; p.vy *= -1 }

        p.x += p.vx * speedFactor
        p.y += p.vy * speedFactor

        // Particle trail
        ctx.strokeStyle = `rgba(${Math.floor(100 + tRatio * 155)},180,220,0.25)`
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * speedFactor * 3, p.y - p.vy * speedFactor * 3); ctx.stroke()

        // Particle dot
        ctx.fillStyle = pColor
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill()
      }

      // Pressure Gauge on right side
      const R_const = 8.314
      const P_val = (s.n || 1) * R_const * (s.T || 300) / (s.V || 0.0224)
      const gaugeX = cx + containerW + 60, gaugeY = cy
      const gaugeR = 30

      // Gauge dial
      ctx.fillStyle = 'rgba(24,20,16,0.9)'; ctx.beginPath(); ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2); ctx.stroke()
      // Gauge needle angle (proportional to pressure)
      const pMax = 500000 // 500 kPa
      const needleAngle = -Math.PI * 0.75 + Math.min(1, P_val / pMax) * (Math.PI * 1.5)
      ctx.strokeStyle = '#E07840'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(gaugeX, gaugeY); ctx.lineTo(gaugeX + Math.cos(needleAngle) * (gaugeR - 6), gaugeY + Math.sin(needleAngle) * (gaugeR - 6)); ctx.stroke()
      ctx.fillStyle = '#E07840'; ctx.beginPath(); ctx.arc(gaugeX, gaugeY, 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(232,221,204,0.7)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText(`PRESSURE`, gaugeX, gaugeY + gaugeR + 14)

      // Live Readouts (top-left)
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'
      ctx.fillText(`P = ${(P_val / 1000).toFixed(2)} kPa`, 40, 25)
      ctx.fillText(`T = ${s.T} K`, 40, 45)
      ctx.fillText(`V = ${s.V} m³`, 40, 65)
      ctx.fillText(`n = ${s.n} mol`, 40, 85)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const R = 8.314
  const pressure = (moles || 1) * R * (temp || 300) / (volume || 0.0224)

  const handleApply = () => {
    setMoles(parseFloat(localN) || 1)
    setTemp(parseFloat(localT) || 300)
    setVolume(parseFloat(localV) || 0.0224)
  }
  const handleReset = () => {
    setLocalN(1); setLocalT(300); setLocalV(0.0224)
    setMoles(1); setTemp(300); setVolume(0.0224)
  }

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputCardField label="Moles (n)" value={localN} min={0.1} max={50} step={0.1} onChange={setLocalN} unit="mol" />
            <InputCardField label="Temperature (T)" value={localT} min={50} max={2000} step={10} onChange={setLocalT} unit="K" />
            <InputCardField label="Volume (V)" value={localV} min={0.001} max={0.5} step={0.005} onChange={setLocalV} unit="m³" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleApply} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter moles, temperature, and volume.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Pressure (P):</span>
              <span className="font-bold text-[#88C0B8]">{(pressure / 1000).toFixed(2)} kPa</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  10. LORENTZ FORCE SIMULATOR
// ══════════════════════════════════════════════════
export function LorentzForceSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [charge, setCharge] = useState(() => { const v = getInitialParam(initialParams, 'charge', 1.60218e-19); return v === "" ? 1.60218e-19 : v })
  const [vel, setVel] = useState(() => { const v = getInitialParam(initialParams, 'velocity', 1e6); return v === "" ? 1e6 : v })
  const [bField, setBField] = useState(() => { const v = getInitialParam(initialParams, 'magneticField', 0.5); return v === "" ? 0.5 : v })
  const [mass, setMass] = useState(() => { const v = getInitialParam(initialParams, 'mass', 9.10938e-31); return v === "" ? 9.10938e-31 : v })

  const [localQ, setLocalQ] = useState(() => String(charge))
  const [localV, setLocalV] = useState(() => String(vel))
  const [localB, setLocalB] = useState(() => String(bField))
  const [localM, setLocalM] = useState(() => String(mass))

  useEffect(() => {
    setLocalQ(String(charge))
    setLocalV(String(vel))
    setLocalB(String(bField))
    setLocalM(String(mass))
  }, [charge, vel, bField, mass])

  const animRef = useRef()
  const isPending = charge === "" || vel === "" || bField === "" || mass === "";
  const realism = checkRealism('lorentzforce', isPending ? {} : { charge, velocity: vel, magneticField: bField, mass })

  const stateRef = useRef({ q: 1.6e-19, v: 1e6, B: 0.5, mass: 9.1e-31, angle: 0, trail: [], isPending: false, isRealistic: true })
  useEffect(() => {
    Object.assign(stateRef.current, {
      q: charge === "" ? 0 : Number(charge),
      v: vel === "" ? 0 : Number(vel),
      B: bField === "" ? 0 : Number(bField),
      mass: mass === "" ? 0 : Number(mass),
      isPending,
      isRealistic: realism.isRealistic
    })
  }, [charge, vel, bField, mass, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const q_val = Math.abs(s.q) > 0 ? s.q : 1.6e-19
      const v_val = Math.max(1, s.v)
      const B_val = Math.max(0.01, s.B)
      const m_val = Math.max(1e-35, s.mass)

      // Physical gyroradius r = mv / (qB)
      const r_phys = (m_val * v_val) / (Math.abs(q_val) * B_val)
      // Visual scale mapping for canvas
      const rPx = Math.max(35, Math.min(140, 80 + Math.log10(r_phys + 1e-20) * 8))

      const cx = W / 2, cy = H / 2
      const omega = (Math.abs(q_val) * B_val) / m_val
      const dir = s.q >= 0 ? 1 : -1
      s.angle = (s.angle || 0) + dir * Math.min(0.08, Math.max(0.01, omega * 1e-12)) * 0.016 * 1000

      const px = cx + rPx * Math.cos(s.angle)
      const py = cy + rPx * Math.sin(s.angle)

      // Motion trail
      s.trail.push({ x: px, y: py })
      if (s.trail.length > 50) s.trail.shift()

      // Magnetic Field Chamber Boundary (visualized with B-field crosses)
      const chamberX = 120, chamberY = 35, chamberW = W - 240, chamberH = H - 70
      ctx.fillStyle = 'rgba(160,156,200,0.03)'
      ctx.fillRect(chamberX, chamberY, chamberW, chamberH)
      ctx.strokeStyle = 'rgba(160,156,200,0.2)'; ctx.lineWidth = 1.5
      ctx.strokeRect(chamberX, chamberY, chamberW, chamberH)

      // B-field indicators ('⊗' pattern into page)
      ctx.fillStyle = 'rgba(160,156,200,0.25)'; ctx.font = '11px var(--font-mono)'; ctx.textAlign = 'center'
      for (let bx = chamberX + 40; bx <= chamberX + chamberW - 40; bx += 60) {
        for (let by = chamberY + 35; by <= chamberY + chamberH - 25; by += 45) {
          ctx.fillText('⊗ B', bx, by)
        }
      }
      ctx.fillStyle = 'rgba(160,156,200,0.4)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'right'
      ctx.fillText('MAGNETIC FIELD CHAMBER (B ⊗ INTO PAGE)', chamberX + chamberW - 12, chamberY + 16)

      // ── Particle Launcher Nozzle (left margin) ──
      const gunX = chamberX - 35, gunY = cy
      ctx.fillStyle = 'rgba(136,192,184,0.15)'
      ctx.fillRect(gunX - 20, gunY - 18, 35, 36)
      ctx.strokeStyle = 'rgba(136,192,184,0.4)'; ctx.lineWidth = 1.5; ctx.strokeRect(gunX - 20, gunY - 18, 35, 36)
      ctx.fillStyle = 'rgba(136,192,184,0.3)'; ctx.fillRect(gunX + 15, gunY - 8, 12, 16)
      ctx.fillStyle = 'rgba(232,221,204,0.6)'; ctx.font = '8px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('LAUNCHER', gunX - 2, gunY)

      // ── Gyroradius & Orbital Center Indicator ──
      // Center crosshair
      ctx.strokeStyle = 'rgba(232,200,128,0.4)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(232,200,128,0.5)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText('Center (c)', cx, cy + 10)

      // Dashed Radius Line from Center to Particle Position
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(232,200,128,0.4)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([])
      // Radius Label at midpoint
      const midRx = (cx + px) / 2, midRy = (cy + py) / 2
      ctx.fillStyle = '#E8C880'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`r = ${r_phys.toExponential(2)} m`, midRx, midRy - 10)

      // Orbital Path Line
      ctx.strokeStyle = 'rgba(136,192,184,0.18)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])

      // Fading Motion Trail
      if (s.trail.length > 1) {
        for (let i = 1; i < s.trail.length; i++) {
          const alpha = (i / s.trail.length) * 0.6
          ctx.strokeStyle = `rgba(136,192,184,${alpha})`; ctx.lineWidth = 2.2
          ctx.beginPath()
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y)
          ctx.lineTo(s.trail[i].x, s.trail[i].y)
          ctx.stroke()
        }
      }

      // Charged Particle Sphere
      const pColor = s.q >= 0 ? '#E07840' : '#88C0B8'
      ctx.fillStyle = s.q >= 0 ? 'rgba(224,120,64,0.25)' : 'rgba(136,192,184,0.25)'
      ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = pColor; ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(232,221,204,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = '#141210'; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(s.q >= 0 ? '+' : '−', px, py)

      // Velocity Vector (tangential, cyan/teal arrow)
      const vNx = -dir * Math.sin(s.angle), vNy = dir * Math.cos(s.angle)
      drawArrow(ctx, px, py, px + vNx * 45, py + vNy * 45, '#88C0B8', 2.2, 7)
      ctx.fillStyle = '#88C0B8'; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`v`, px + vNx * 52, py + vNy * 52)

      // Lorentz Force Vector (centripetal, orange arrow pointing to center)
      const fNx = (cx - px) / rPx, fNy = (cy - py) / rPx
      drawArrow(ctx, px, py, px + fNx * 45, py + fNy * 45, '#E07840', 2.2, 7)
      ctx.fillStyle = '#E07840'; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`F_L`, px + fNx * 52, py + fNy * 52)

      // Physics Equations & Live Readout
      const F_lorentz = Math.abs(s.q) * s.v * s.B
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(`F = q(v × B) = ${F_lorentz.toExponential(4)} N`, 40, 25)
      ctx.fillText(`r_gyro = ${r_phys.toExponential(4)} m`, 40, 45)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const handleApply = () => {
    setCharge(parseFloat(localQ) || 1.60218e-19)
    setVel(parseFloat(localV) || 1e6)
    setBField(parseFloat(localB) || 0.5)
    setMass(parseFloat(localM) || 9.10938e-31)
  }
  const handleReset = () => {
    setLocalQ("1.60218e-19"); setLocalV("1000000"); setLocalB("0.5"); setLocalM("9.10938e-31")
    setCharge(1.60218e-19); setVel(1e6); setBField(0.5); setMass(9.10938e-31)
  }

  const F = Math.abs(charge || 0) * (vel || 0) * (bField || 0)
  const r = (mass > 0 && Math.abs(charge) > 0 && bField > 0) ? (mass * vel) / (Math.abs(charge) * bField) : 0

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputCardField label="Charge (C)" value={localQ} onChange={setLocalQ} unit="C" />
            <InputCardField label="Velocity (m/s)" value={localV} onChange={setLocalV} unit="m/s" />
            <InputCardField label="B Field (T)" value={localB} onChange={setLocalB} unit="T" />
            <InputCardField label="Mass (kg)" value={localM} onChange={setLocalM} unit="kg" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleApply} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter charge, velocity, B-field, and mass.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Lorentz Force (F):</span>
              <span className="font-bold text-[#88C0B8]">{F.toExponential(4)} N</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-50">Orbital Radius (r):</span>
              <span className="font-bold text-[#C4956A]">{r > 0 ? r.toExponential(4) + ' m' : 'N/A'}</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  11. HOOKE'S LAW SIMULATOR
// ══════════════════════════════════════════════════
export function HookeSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [k, setK] = useState(() => { const v = getInitialParam(initialParams, 'springConstant', 50); return v === "" ? 50 : v })
  const [x, setX] = useState(() => { const v = getInitialParam(initialParams, 'displacement', 0.15); return v === "" ? 0.15 : v })

  const [localK, setLocalK] = useState(50)
  const [localX, setLocalX] = useState(0.15)
  useEffect(() => { setLocalK(k); setLocalX(x) }, [k, x])
  const animRef = useRef()

  const isPending = k === "" || x === "";
  const realism = checkRealism('hooke', isPending ? {} : { springConstant: k, displacement: x })

  const stateRef = useRef({ k: 50, x: 0.15, t: 0, isPending: false, isRealistic: true })
  useEffect(() => { Object.assign(stateRef.current, { k, x, isPending, isRealistic: realism.isRealistic }) }, [k, x, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      s.t += 0.016
      const cy = H / 2 + 20
      const wallX = 100, floorY = cy + 30
      const eqX = 500 // Equilibrium position

      // Physics oscillation: x(t) = A * cos(omega * t)
      const maxDispPx = Math.max(30, Math.min(220, (s.x || 0.15) * 600))
      const omega = Math.sqrt((s.k || 50) / 2.0)
      const currentDisp = Math.cos(s.t * omega) * maxDispPx
      const blockX = eqX + currentDisp

      // Grid background
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

      // Floor line with hatching
      ctx.strokeStyle = 'rgba(136,192,184,0.3)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(wallX, floorY); ctx.lineTo(W - 80, floorY); ctx.stroke()
      for (let fx = wallX; fx <= W - 80; fx += 20) {
        ctx.strokeStyle = 'rgba(136,192,184,0.08)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(fx, floorY); ctx.lineTo(fx - 6, floorY + 8); ctx.stroke()
      }

      // Vertical Wall on Left
      ctx.fillStyle = 'rgba(196,149,106,0.15)'
      ctx.fillRect(wallX - 25, cy - 80, 25, 110)
      ctx.strokeStyle = 'rgba(196,149,106,0.4)'; ctx.lineWidth = 2
      ctx.strokeRect(wallX - 25, cy - 80, 25, 110)
      for (let wy = cy - 75; wy <= cy + 25; wy += 12) {
        ctx.strokeStyle = 'rgba(196,149,106,0.2)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(wallX - 25, wy); ctx.lineTo(wallX - 5, wy + 10); ctx.stroke()
      }

      // Equilibrium Position Dashed Line
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(232,200,128,0.35)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(eqX, cy - 80); ctx.lineTo(eqX, floorY); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle = 'rgba(232,200,128,0.5)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('Equilibrium (x = 0)', eqX, cy - 88)

      // Coiled Spring (Zigzag coils from wallX to blockX)
      const blockW = 55, blockH = 50
      const springStartX = wallX, springEndX = blockX - blockW / 2
      const springLength = springEndX - springStartX
      const numCoils = 14
      const coilH = 22

      ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(springStartX, cy)
      for (let i = 0; i <= numCoils; i++) {
        const segX = springStartX + (springLength / numCoils) * i
        const segY = cy + (i % 2 === 0 ? -coilH / 2 : coilH / 2)
        if (i === 0) ctx.lineTo(segX, cy); else if (i === numCoils) ctx.lineTo(segX, cy); else ctx.lineTo(segX, segY)
      }
      ctx.stroke()

      // Mass Block
      const bLeft = blockX - blockW / 2, bTop = floorY - blockH
      ctx.fillStyle = 'rgba(224,120,64,0.15)'
      ctx.fillRect(bLeft, bTop, blockW, blockH)
      const bGrad = ctx.createLinearGradient(bLeft, bTop, bLeft + blockW, bTop + blockH)
      bGrad.addColorStop(0, '#e58852'); bGrad.addColorStop(1, '#E07840')
      ctx.fillStyle = bGrad; ctx.fillRect(bLeft, bTop, blockW, blockH)
      ctx.strokeStyle = 'rgba(232,221,204,0.6)'; ctx.lineWidth = 1.5
      ctx.strokeRect(bLeft, bTop, blockW, blockH)

      ctx.fillStyle = '#141210'; ctx.font = 'bold 12px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('m', blockX, bTop + blockH / 2)

      // Displacement Arrow (x, teal)
      if (Math.abs(currentDisp) > 5) {
        const arrowY = floorY + 22
        drawArrow(ctx, eqX, arrowY, blockX, arrowY, '#88C0B8', 2, 6)
        ctx.fillStyle = '#88C0B8'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillText(`x = ${(currentDisp / 600).toFixed(3)} m`, (eqX + blockX) / 2, arrowY + 6)
      }

      // Restoring Force Vector (F_restoring = -kx, orange)
      const forceMag = (s.k || 50) * (s.x || 0.15)
      const forceDir = currentDisp > 0 ? -1 : 1
      const forceArrowLen = Math.min(80, Math.max(20, forceMag * 2))

      drawArrow(ctx, blockX, bTop - 15, blockX + forceDir * forceArrowLen, bTop - 15, '#E07840', 2.5, 7)
      ctx.fillStyle = '#E07840'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillText(`F_restoring`, blockX + forceDir * (forceArrowLen / 2), bTop - 20)

      // Live Readouts (top-left)
      const PE_val = 0.5 * (s.k || 50) * Math.pow((s.x || 0.15), 2)
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(`F_max = ${forceMag.toFixed(2)} N`, 40, 25)
      ctx.fillText(`PE_max = ${PE_val.toFixed(3)} J`, 40, 45)
      ctx.fillText(`k = ${s.k} N/m`, 40, 65)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const F = (k || 50) * (x || 0.15)
  const PE = 0.5 * (k || 50) * (x || 0.15) * (x || 0.15)

  const handleApply = () => {
    setK(parseFloat(localK) || 50)
    setX(parseFloat(localX) || 0.15)
  }
  const handleReset = () => {
    setLocalK(50); setLocalX(0.15)
    setK(50); setX(0.15)
  }

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputCardField label="Spring Constant (k)" value={localK} min={1} max={500} step={1} onChange={setLocalK} unit="N/m" />
            <InputCardField label="Displacement (x)" value={localX} min={0.01} max={0.5} step={0.01} onChange={setLocalX} unit="m" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleApply} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter spring constant and displacement.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Restoring Force (F):</span>
              <span className="font-bold text-[#88C0B8]">{F.toFixed(3)} N</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-50">Potential Energy (U):</span>
              <span className="font-bold text-[#88C0B8]">{PE.toFixed(4)} J</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  12. SIMPLE HARMONIC MOTION SIMULATOR
// ══════════════════════════════════════════════════
export function SHMSimulator({ initialParams }) {
const canvasRef = useRef(null)
const [amp, setAmp] = useState(() => { const v = getInitialParam(initialParams, 'amplitude', 0.1); return v === "" ? 0.1 : v })
const [freq, setFreq] = useState(() => { const v = getInitialParam(initialParams, 'frequency', 2); return v === "" ? 2 : v })
const [localA, setLocalA] = useState(0.1)
const [localF, setLocalF] = useState(2)
useEffect(() => { setLocalA(amp); setLocalF(freq) }, [amp, freq])
const animRef = useRef()

const isPending = amp === "" || freq === "";
const realism = checkRealism('shm', isPending ? {} : { amplitude: amp, frequency: freq })

const stateRef = useRef({ amp: 0.1, freq: 2, t: 0, trail: [], isPending: false, isRealistic: true })
useEffect(() => { Object.assign(stateRef.current, { amp, freq, isPending, isRealistic: realism.isRealistic }) }, [amp, freq, isPending, realism.isRealistic])

useEffect(() => {
const canvas = canvasRef.current; if (!canvas) return
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1
const W = 1100, H = 380
canvas.width = W * dpr; canvas.height = H * dpr
canvas.style.width = '100%'; canvas.style.height = `${H}px`
ctx.scale(dpr, dpr)
const draw = () => {
const { isPending, isRealistic } = stateRef.current || {}
if (isPending || !isRealistic) {
ctx.clearRect(0, 0, W, H)
ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
ctx.fillText(isPending ? 'Awaiting required parameters...' : 'Simulation suspended due to physical invalidity', W / 2, H / 2)
animRef.current = requestAnimationFrame(draw)
return
}
const s = stateRef.current; s.t += 0.016
ctx.clearRect(0, 0, W, H)
ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)

// Background grid
ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

// Pendulum Geometry
const pivotX = W / 2, pivotY = 50
const L_px = 220
const A_rad = Math.max(0.05, Math.min(0.7, (s.amp || 0.1) * 3))
const omega = 2 * Math.PI * (s.freq || 2)

// SHM kinematics: θ(t) = A * cos(ωt)
const theta = A_rad * Math.cos(omega * s.t)
const omega_t = -A_rad * omega * Math.sin(omega * s.t) // angular velocity
const alpha_t = -A_rad * omega * omega * Math.cos(omega * s.t) // angular acceleration

const bobX = pivotX + L_px * Math.sin(theta)
const bobY = pivotY + L_px * Math.cos(theta)

// Motion trail
s.trail.push({ x: bobX, y: bobY })
if (s.trail.length > 35) s.trail.shift()

// Ceiling Mount Plate
ctx.fillStyle = 'rgba(196,149,106,0.2)'; ctx.fillRect(pivotX - 50, pivotY - 12, 100, 12)
ctx.strokeStyle = 'rgba(196,149,106,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(pivotX - 50, pivotY - 12, 100, 12)
ctx.fillStyle = '#C4956A'; ctx.beginPath(); ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2); ctx.fill()

// Equilibrium reference line (vertical dashed line)
ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(232,200,128,0.3)'; ctx.lineWidth = 1
ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(pivotX, pivotY + L_px + 20); ctx.stroke(); ctx.setLineDash([])
ctx.fillStyle = 'rgba(232,200,128,0.4)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
ctx.fillText('Equilibrium', pivotX, pivotY + L_px + 34)

// Trajectory Arc (dashed)
ctx.strokeStyle = 'rgba(136,192,184,0.15)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
ctx.beginPath(); ctx.arc(pivotX, pivotY, L_px, Math.PI / 2 - A_rad, Math.PI / 2 + A_rad); ctx.stroke(); ctx.setLineDash([])

// Fading Motion Trail
if (s.trail.length > 1) {
  for (let i = 1; i < s.trail.length; i++) {
    const alpha = (i / s.trail.length) * 0.4
    ctx.strokeStyle = `rgba(136,192,184,${alpha})`; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y); ctx.lineTo(s.trail[i].x, s.trail[i].y); ctx.stroke()
  }
}

// Pendulum String
ctx.strokeStyle = 'rgba(232,221,204,0.6)'; ctx.lineWidth = 2
ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY); ctx.stroke()

// Pendulum Bob (metallic sphere with glow)
const bobR = 14
ctx.fillStyle = 'rgba(136,192,184,0.15)'
ctx.beginPath(); ctx.arc(bobX, bobY, bobR + 6, 0, Math.PI * 2); ctx.fill()
const bGrad = ctx.createRadialGradient(bobX - 3, bobY - 3, 0, bobX, bobY, bobR)
bGrad.addColorStop(0, '#b8eee8'); bGrad.addColorStop(1, '#88C0B8')
ctx.fillStyle = bGrad; ctx.beginPath(); ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2); ctx.fill()

// Kinematic Vectors on Bob
// Tangential Velocity Vector (v, teal)
const vMagPx = Math.min(65, Math.abs(omega_t) * 45)
if (vMagPx > 2) {
  const vNx = Math.cos(theta) * Math.sign(omega_t), vNy = -Math.sin(theta) * Math.sign(omega_t)
  drawArrow(ctx, bobX, bobY, bobX + vNx * vMagPx, bobY + vNy * vMagPx, '#88C0B8', 2, 6)
  ctx.fillStyle = '#88C0B8'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
  ctx.fillText('v', bobX + vNx * (vMagPx + 10), bobY + vNy * (vMagPx + 10))
}

// Tangential Restoring Acceleration Vector (a, orange -> pointing toward equilibrium)
const aMagPx = Math.min(65, Math.abs(alpha_t) * 12)
if (aMagPx > 2) {
  const aNx = -Math.cos(theta) * Math.sign(theta), aNy = Math.sin(theta) * Math.sign(theta)
  drawArrow(ctx, bobX, bobY, bobX + aNx * aMagPx, bobY + aNy * aMagPx, '#E07840', 2, 6)
  ctx.fillStyle = '#E07840'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'left'
  ctx.fillText('a_restoring', bobX + aNx * (aMagPx + 10), bobY + aNy * (aMagPx + 10))
}

// Live Readouts (top-left)
const currentDisp = (s.amp || 0.1) * Math.cos(omega * s.t)
const currentVel = -omega * (s.amp || 0.1) * Math.sin(omega * s.t)
const currentAccel = -omega * omega * (s.amp || 0.1) * Math.cos(omega * s.t)

ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
ctx.fillText(`x(t) = ${currentDisp.toFixed(4)} m`, 40, 25)
ctx.fillText(`v(t) = ${currentVel.toFixed(4)} m/s`, 40, 45)
ctx.fillText(`a(t) = ${currentAccel.toFixed(4)} m/s²`, 40, 65)
ctx.fillText(`f = ${s.freq} Hz (T = ${(1 / s.freq).toFixed(2)} s)`, 40, 85)

animRef.current = requestAnimationFrame(draw)
}
draw()
return () => cancelAnimationFrame(animRef.current)
}, [])

const period = 1 / (freq || 1)
const omega = 2 * Math.PI * freq
const vMax = omega * amp
const aMax = omega * omega * amp

const handleCalc = () => {
if (localA === "" || localF === "") {
if (localA === "") setAmp("");
if (localF === "") setFreq("");
return;
}
let pa = parseFloat(localA); if (isNaN(pa)) pa = 0.1; pa = Math.max(0.01, Math.min(1, pa))
let pf = parseFloat(localF); if (isNaN(pf)) pf = 2; pf = Math.max(0.1, Math.min(20, pf))
setAmp(pa); setFreq(pf)
}
const handleReset = () => { setAmp(0.1); setFreq(2) }

return (
<div className="flex flex-col items-center w-full">
<canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
<WorkspacePortal target="inputs">
<div className="flex flex-col gap-4 w-full">
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<InputCardField label="Amplitude (A)" value={localA} min={0.01} max={1} step={0.01} onChange={setLocalA} unit="m" />
<InputCardField label="Frequency (f)" value={localF} min={0.1} max={20} step={0.1} onChange={setLocalF} unit="Hz" />
</div>
<div className="flex gap-4 mt-2 w-full">
<button onClick={handleCalc} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200" style={{ background: '#88C0B8', color: '#141210' }}>Calculate</button>
<button onClick={handleReset} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200 border border-[rgba(220,208,188,0.2)] hover:border-[rgba(220,208,188,0.4)] text-[rgba(220,208,188,0.85)] bg-transparent">Reset</button>
</div>
</div>
</WorkspacePortal>

<WorkspacePortal target="results">
<RealismCheckCard equationId="shm" params={{ amplitude: amp, frequency: freq }} isPending={isPending} />
{isPending ? (
<div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3" style={{ borderLeft: '3px solid #ef4444' }}>
<span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
Please enter amplitude and frequency.
</div>
) : null}
<div className="flex flex-col gap-5 font-mono text-xs w-full">
<div className="flex justify-between items-center pb-2.5" style={{ background: 'rgba(196,149,106,0.04)', borderLeft: '2px solid rgba(196,149,106,0.4)', padding: '8px 12px', borderRadius: '6px' }}>
<span className="opacity-50">Period (T):</span>
<span className="font-bold text-[#E8C880]">{(!isPending && realism.isRealistic) ? `${period.toFixed(4)} s` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Angular Frequency (ω):</span>
<span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `${omega.toFixed(2)} rad/s` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Max Velocity:</span>
<span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `${vMax.toFixed(4)} m/s` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center">
<span className="opacity-50">Max Acceleration:</span>
<span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `${aMax.toFixed(4)} m/s²` : "[Missing]"}</span>
</div>
</div>
</WorkspacePortal>
</div>
)
}

// ══════════════════════════════════════════════════
//  13. OHM'S LAW SIMULATOR
// ══════════════════════════════════════════════════
export function OhmSimulator({ initialParams }) {
const canvasRef = useRef(null)
const [voltage, setVoltage] = useState(() => { const v = getInitialParam(initialParams, 'voltage', 12); return v === "" ? 12 : v })
const [resistance, setResistance] = useState(() => { const v = getInitialParam(initialParams, 'resistance', 100); return v === "" ? 100 : v })
const [localV, setLocalV] = useState(12)
const [localR, setLocalR] = useState(100)
useEffect(() => { setLocalV(voltage); setLocalR(resistance) }, [voltage, resistance])
const animRef = useRef()

const isPending = voltage === "" || resistance === "";
const realism = checkRealism('ohm', isPending ? {} : { voltage, resistance })

const stateRef = useRef({ V: 12, R: 100, t: 0, isPending: false, isRealistic: true })
useEffect(() => {
stateRef.current.V = voltage;
stateRef.current.R = resistance;
stateRef.current.t = 0;
stateRef.current.isPending = isPending;
stateRef.current.isRealistic = realism.isRealistic;
}, [voltage, resistance, isPending, realism.isRealistic])

useEffect(() => {
const canvas = canvasRef.current; if (!canvas) return
const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1
const W = 1100, H = 380
canvas.width = W * dpr; canvas.height = H * dpr
canvas.style.width = '100%'; canvas.style.height = `${H}px`
ctx.scale(dpr, dpr)
const electrons = Array.from({length: 32}, (_, i) => ({ pos: i / 32 }))

const draw = () => {
  const { isPending, isRealistic } = stateRef.current || {}
  if (isPending || !isRealistic) {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
    for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(isPending ? 'Awaiting required parameters...' : 'Simulation suspended due to physical invalidity', W / 2, H / 2)
    animRef.current = requestAnimationFrame(draw)
    return
  }

  const s = stateRef.current; s.t += 0.016
  const I = s.R !== 0 ? s.V / s.R : 0
  const P = s.V * I
  const currentMag = Math.abs(I)
  const dir = I >= 0 ? 1 : -1
  const driftSpeed = Math.min(0.006, Math.max(0.0002, currentMag * 0.008))

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)

  // Grid background
  ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
  for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
  for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }

  // Circuit geometry
  const cx = 140, cy = 60, cw = 540, ch = 240

  // ── Wire Glow Effect (under high current) ──
  const wireGlowAlpha = Math.min(0.4, currentMag * 0.5)
  if (wireGlowAlpha > 0.02) {
    ctx.strokeStyle = `rgba(232,200,128,${wireGlowAlpha})`
    ctx.lineWidth = 8; ctx.lineJoin = 'round'
    ctx.strokeRect(cx, cy, cw, ch)
  }

  // ── Main Circuit Wires ──
  ctx.strokeStyle = 'rgba(136,192,184,0.35)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'
  const resX1 = cx + 120, resX2 = cx + 280
  const bulbX = cx + cw

  // Top wire (with gap for resistor)
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(resX1, cy); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(resX2, cy); ctx.lineTo(cx + cw, cy); ctx.stroke()

  // Right wire (with gap for light bulb)
  const bulbY = cy + ch / 2
  ctx.beginPath(); ctx.moveTo(cx + cw, cy); ctx.lineTo(cx + cw, bulbY - 30); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + cw, bulbY + 30); ctx.lineTo(cx + cw, cy + ch); ctx.stroke()

  // Bottom wire (with gap for Ammeter)
  const ammeterX = cx + cw / 2
  ctx.beginPath(); ctx.moveTo(cx + cw, cy + ch); ctx.lineTo(ammeterX + 25, cy + ch); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(ammeterX - 25, cy + ch); ctx.lineTo(cx, cy + ch); ctx.stroke()

  // Left wire (with gap for Battery)
  const batY = cy + ch / 2
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, batY - 28); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, batY + 28); ctx.lineTo(cx, cy + ch); ctx.stroke()

  // ── DC Battery Source (left) ──
  ctx.strokeStyle = '#E8C880'; ctx.lineWidth = 3.5
  ctx.beginPath(); ctx.moveTo(cx - 16, batY - 25); ctx.lineTo(cx + 16, batY - 25); ctx.stroke()
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(cx - 8, batY - 10); ctx.lineTo(cx + 8, batY - 10); ctx.stroke()
  ctx.lineWidth = 3.5
  ctx.beginPath(); ctx.moveTo(cx - 16, batY + 10); ctx.lineTo(cx + 16, batY + 10); ctx.stroke()
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(cx - 8, batY + 25); ctx.lineTo(cx + 8, batY + 25); ctx.stroke()
  ctx.fillStyle = '#E8C880'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'center'
  ctx.fillText('+', cx - 22, batY - 18)
  ctx.fillText('−', cx - 22, batY + 22)
  ctx.fillText(`${s.V} V`, cx + 32, batY + 4)

  // ── Variable Resistor (Rheostat, top) ──
  ctx.strokeStyle = 'rgba(224,120,64,0.6)'; ctx.lineWidth = 2; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(resX1, cy)
  const numCoils = 10, coilW = (resX2 - resX1) / numCoils
  for (let i = 0; i < numCoils; i++) {
    const rx = resX1 + i * coilW + coilW / 2
    ctx.lineTo(rx, cy + (i % 2 === 0 ? -12 : 12))
  }
  ctx.lineTo(resX2, cy); ctx.stroke()
  ctx.fillStyle = 'rgba(224,120,64,0.6)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
  ctx.fillText(`R = ${s.R} Ω`, (resX1 + resX2) / 2, cy - 20)

  // Resistor heat glow indicator
  const heatRatio = Math.min(1, P / 50)
  if (heatRatio > 0.05) {
    ctx.fillStyle = `rgba(224,120,64,${heatRatio * 0.35})`
    ctx.fillRect(resX1, cy - 14, resX2 - resX1, 28)
  }

  // ── Incandescent Light Bulb (right) ──
  const bulbR = 25
  // Outer illumination aura scaling with current / brightness
  const bulbGlow = Math.min(1, currentMag * 4)
  if (bulbGlow > 0.05) {
    const bRadGrad = ctx.createRadialGradient(bulbX, bulbY, 5, bulbX, bulbY, bulbR * 2.5)
    bRadGrad.addColorStop(0, `rgba(255,220,100,${bulbGlow * 0.7})`)
    bRadGrad.addColorStop(1, 'rgba(255,200,50,0)')
    ctx.fillStyle = bRadGrad
    ctx.beginPath(); ctx.arc(bulbX, bulbY, bulbR * 2.5, 0, Math.PI * 2); ctx.fill()
  }
  // Glass bulb envelope
  ctx.fillStyle = `rgba(255,240,180,${0.05 + bulbGlow * 0.25})`
  ctx.beginPath(); ctx.arc(bulbX, bulbY, bulbR, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = 'rgba(232,221,204,0.5)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(bulbX, bulbY, bulbR, 0, Math.PI * 2); ctx.stroke()
  // Filament wire inside bulb
  ctx.strokeStyle = bulbGlow > 0.1 ? '#FFE060' : 'rgba(196,149,106,0.6)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(bulbX - 8, bulbY + 12); ctx.lineTo(bulbX - 4, bulbY - 4)
  ctx.lineTo(bulbX, bulbY - 10); ctx.lineTo(bulbX + 4, bulbY - 4); ctx.lineTo(bulbX + 8, bulbY + 12); ctx.stroke()
  ctx.fillStyle = 'rgba(232,221,204,0.6)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
  ctx.fillText('BULB', bulbX, bulbY + bulbR + 14)

  // ── Series Ammeter (bottom) ──
  const amR = 20
  ctx.fillStyle = 'rgba(24,20,16,0.9)'; ctx.beginPath(); ctx.arc(ammeterX, cy + ch, amR, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ammeterX, cy + ch, amR, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = '#88C0B8'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('A', ammeterX, cy + ch - 2)
  ctx.fillStyle = 'rgba(136,192,184,0.8)'; ctx.font = '9px var(--font-mono)'
  ctx.fillText(`${I.toFixed(3)}A`, ammeterX, cy + ch + amR + 12)

  // ── Parallel Voltmeter (hooked across resistor) ──
  const voltX = (resX1 + resX2) / 2, voltY = cy - 60
  // Connecting lead wires
  ctx.strokeStyle = 'rgba(232,200,128,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2])
  ctx.beginPath(); ctx.moveTo(resX1 - 10, cy); ctx.lineTo(resX1 - 10, voltY); ctx.lineTo(voltX - 20, voltY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(resX2 + 10, cy); ctx.lineTo(resX2 + 10, voltY); ctx.lineTo(voltX + 20, voltY); ctx.stroke()
  ctx.setLineDash([])
  // Voltmeter dial
  ctx.fillStyle = 'rgba(24,20,16,0.9)'; ctx.beginPath(); ctx.arc(voltX, voltY, 18, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#E8C880'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(voltX, voltY, 18, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = '#E8C880'; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('V', voltX, voltY)
  ctx.font = '8px var(--font-mono)'; ctx.fillText(`${s.V}V`, voltX, voltY + 12)

  // ── Drifting Electrons ──
  const perimeter = 2 * cw + 2 * ch
  for (const e of electrons) {
    e.pos += dir * driftSpeed
    if (e.pos > 1) e.pos -= 1
    if (e.pos < 0) e.pos += 1
    const dist = e.pos * perimeter
    let ex, ey
    if (dist < cw) { ex = cx + dist; ey = cy }
    else if (dist < cw + ch) { ex = cx + cw; ey = cy + (dist - cw) }
    else if (dist < 2 * cw + ch) { ex = cx + cw - (dist - cw - ch); ey = cy + ch }
    else { ex = cx; ey = cy + ch - (dist - 2 * cw - ch) }

    const alpha = 0.4 + Math.min(0.5, currentMag * 0.8)
    ctx.fillStyle = `rgba(136,192,184,${alpha})`
    ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill()
  }

  // ── Formula Banner (bottom-right) ──
  const eqX = 840, eqY = 280
  ctx.fillStyle = 'rgba(196,149,106,0.1)'; roundRect(ctx, eqX, eqY, 210, 60, 8); ctx.fill()
  ctx.strokeStyle = 'rgba(196,149,106,0.2)'; roundRect(ctx, eqX, eqY, 210, 60, 8); ctx.stroke()
  ctx.fillStyle = '#E8C880'; ctx.font = 'bold 12px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('I = V / R', eqX + 105, eqY + 18)
  ctx.font = '10px var(--font-mono)'; ctx.fillStyle = 'rgba(232,221,204,0.6)'
  ctx.fillText(`P = V · I = ${P.toFixed(2)} W`, eqX + 105, eqY + 40)

  // ── Live Readouts (top-left) ──
  ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  ctx.fillText(`Voltage (V) = ${s.V} V`, 40, 25)
  ctx.fillText(`Resistance (R) = ${s.R} Ω`, 40, 45)
  ctx.fillText(`Current (I) = ${I.toFixed(4)} A`, 40, 65)
  ctx.fillText(`Power Dissipated (P) = ${P.toFixed(3)} W`, 40, 85)

  animRef.current = requestAnimationFrame(draw)
}

function roundRect(c, x, y, w, hh, r) {
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y)
  c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + hh - r)
  c.quadraticCurveTo(x + w, y + hh, x + w - r, y + hh); c.lineTo(x + r, y + hh)
  c.quadraticCurveTo(x, y + hh, x, y + hh - r); c.lineTo(x, y + r)
  c.quadraticCurveTo(x, y, x + r, y); c.closePath()
}
}, [])
const I = voltage / resistance
const P = voltage * I
const handleCalc = () => {
if (localV === "" || localR === "") {
if (localV === "") setVoltage("");
if (localR === "") setResistance("");
return;
}
let pv = parseFloat(localV); if (isNaN(pv)) pv = 12;
let pr = parseFloat(localR); if (isNaN(pr)) pr = 100;
setVoltage(pv); setResistance(pr)
}
const handleReset = () => { setVoltage(12); setResistance(100) }
return (
<div className="flex flex-col items-center w-full">
<canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(160,156,200,0.1)' }} />
<WorkspacePortal target="inputs"><div className="flex flex-col gap-4 w-full"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><InputCardField label="Voltage (V)" value={localV} min={-1000} max={1000} step={0.1} onChange={setLocalV} unit="V" /><InputCardField label="Resistance (R)" value={localR} min={-1000000} max={1000000} step={1} onChange={setLocalR} unit="Ω" /></div><div className="flex gap-4 mt-2 w-full"><button onClick={handleCalc} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200" style={{ background: '#A09CC8', color: '#141210' }}>Calculate</button><button onClick={handleReset} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200 border border-[rgba(220,208,188,0.2)] text-[rgba(220,208,188,0.85)] bg-transparent">Reset</button></div></div></WorkspacePortal>

<WorkspacePortal target="results">
<RealismCheckCard equationId="ohm" params={{ voltage, resistance }} isPending={isPending} />
{isPending ? (
<div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3" style={{ borderLeft: '3px solid #ef4444' }}>
<span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
Please enter the missing inputs in the Laboratory Inputs card to calculate.
</div>
) : null}
<div className="flex flex-col gap-5 font-mono text-xs w-full">
<div className="flex justify-between items-center pb-2.5" style={{ background: 'rgba(196,149,106,0.04)', borderLeft: '2px solid rgba(196,149,106,0.4)', padding: '8px 12px', borderRadius: '6px' }}>
<span className="opacity-50">Current (I):</span>
<span className="font-bold text-[#E8C880]">{(!isPending && realism.isRealistic) ? `${parseFloat(I.toFixed(4))} A` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Power (P):</span>
<span className="font-bold text-[#A09CC8]">{(!isPending && realism.isRealistic) ? `${parseFloat(P.toFixed(4))} W` : "[Missing]"}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Energy/min:</span>
<span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `${parseFloat((P * 60).toFixed(2))} J/min` : "[Missing]"}</span>
</div>
<div className="p-3.5 rounded-lg border border-[rgba(160,156,200,0.15)] bg-[rgba(160,156,200,0.04)]" style={{ borderLeft: '3px solid rgba(160,156,200,0.35)' }}>
<span className="opacity-40 block mb-1">Formula:</span>
<span className="font-mono text-xs text-[#E8C880]">I = V/R = {voltage}/{resistance} = {(!isPending && realism.isRealistic) ? `${parseFloat(I.toFixed(4))} A` : "[Missing]"}</span>
</div>
</div>
</WorkspacePortal>
</div>
)
}

// ══════════════════════════════════════════════════
//  14. DE BROGLIE WAVELENGTH SIMULATOR
// ══════════════════════════════════════════════════
export function DeBroglieSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [mass, setMass] = useState(() => { const v = getInitialParam(initialParams, 'mass', 9.109e-31); return v === "" ? 9.109e-31 : v })
  const [vel, setVel] = useState(() => { const v = getInitialParam(initialParams, 'velocity', 1e6); return v === "" ? 1e6 : v })
  const [localM, setLocalM] = useState('9.109e-31')
  const [localV, setLocalV] = useState('1e6')
  useEffect(() => { setLocalM(String(mass)); setLocalV(String(vel)) }, [mass, vel])
  const animRef = useRef()
  const isPending = mass === "" || vel === "";
  const realism = checkRealism('debroglie', isPending ? {} : { mass, velocity: vel })
  const stateRef = useRef({ mass: 9.109e-31, vel: 1e6, t: 0, isPending: false, isRealistic: true })
  useEffect(() => { Object.assign(stateRef.current, { mass, vel, isPending, isRealistic: realism.isRealistic }) }, [mass, vel, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)
    // Particle pool for the beam
    const particles = []
    const detectorBins = new Array(60).fill(0)

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }
      s.t += 0.02
      const h_const = 6.626e-34
      const p_val = (s.mass || 9.109e-31) * (s.vel || 1e6)
      const lambda = h_const / p_val

      // Grid background
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }

      // Layout constants
      const gunX = 60, gunY = H / 2
      const barrierX = 340
      const screenX = 820
      const slitGap = 50, slitW = 6

      // ── Electron Gun (left) ──
      ctx.fillStyle = 'rgba(136,192,184,0.12)'
      ctx.fillRect(gunX - 30, gunY - 30, 60, 60)
      const gunGrad = ctx.createLinearGradient(gunX - 25, gunY - 25, gunX + 25, gunY + 25)
      gunGrad.addColorStop(0, 'rgba(136,192,184,0.35)'); gunGrad.addColorStop(1, 'rgba(136,192,184,0.1)')
      ctx.fillStyle = gunGrad; ctx.fillRect(gunX - 25, gunY - 25, 50, 50)
      ctx.strokeStyle = 'rgba(136,192,184,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(gunX - 25, gunY - 25, 50, 50)
      // Nozzle
      ctx.fillStyle = 'rgba(136,192,184,0.3)'; ctx.fillRect(gunX + 25, gunY - 8, 20, 16)
      ctx.strokeStyle = 'rgba(136,192,184,0.4)'; ctx.strokeRect(gunX + 25, gunY - 8, 20, 16)
      ctx.fillStyle = 'rgba(232,221,204,0.6)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('e⁻ GUN', gunX, gunY)

      // ── Double-Slit Barrier ──
      ctx.fillStyle = 'rgba(196,149,106,0.25)'
      ctx.fillRect(barrierX - slitW / 2, 20, slitW, gunY - slitGap / 2 - 20 - 8)
      ctx.fillRect(barrierX - slitW / 2, gunY - slitGap / 2 + 8, slitW, slitGap - 16)
      ctx.fillRect(barrierX - slitW / 2, gunY + slitGap / 2 + 8, slitW, H - 20 - gunY - slitGap / 2 - 8)
      ctx.strokeStyle = 'rgba(196,149,106,0.5)'; ctx.lineWidth = 1
      ctx.strokeRect(barrierX - slitW / 2, 20, slitW, gunY - slitGap / 2 - 20 - 8)
      ctx.strokeRect(barrierX - slitW / 2, gunY - slitGap / 2 + 8, slitW, slitGap - 16)
      ctx.strokeRect(barrierX - slitW / 2, gunY + slitGap / 2 + 8, slitW, H - 20 - gunY - slitGap / 2 - 8)
      // Slit openings glow
      ctx.fillStyle = 'rgba(232,200,128,0.25)'
      ctx.fillRect(barrierX - slitW / 2, gunY - slitGap / 2 - 8, slitW, 16)
      ctx.fillRect(barrierX - slitW / 2, gunY + slitGap / 2 - 8, slitW, 16)
      ctx.fillStyle = 'rgba(232,200,128,0.5)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('SLIT', barrierX, gunY - slitGap / 2 - 14)
      ctx.fillText('SLIT', barrierX, gunY + slitGap / 2 + 20)
      ctx.fillStyle = 'rgba(196,149,106,0.4)'; ctx.font = '10px var(--font-mono)'
      ctx.fillText('BARRIER', barrierX, 16)

      // ── Detector Screen (right) ──
      ctx.fillStyle = 'rgba(136,192,184,0.08)'
      ctx.fillRect(screenX, 30, 30, H - 60)
      ctx.strokeStyle = 'rgba(136,192,184,0.25)'; ctx.lineWidth = 1
      ctx.strokeRect(screenX, 30, 30, H - 60)
      ctx.fillStyle = 'rgba(136,192,184,0.4)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.save(); ctx.translate(screenX + 45, H / 2); ctx.rotate(-Math.PI / 2)
      ctx.fillText('PHOSPHOR SCREEN', 0, 0); ctx.restore()

      // Draw interference pattern on detector
      const binH = (H - 60) / detectorBins.length
      const maxBin = Math.max(1, ...detectorBins)
      for (let i = 0; i < detectorBins.length; i++) {
        const intensity = detectorBins[i] / maxBin
        if (intensity > 0.01) {
          ctx.fillStyle = `rgba(136,192,184,${Math.min(0.8, intensity * 0.8)})`
          ctx.fillRect(screenX + 1, 30 + i * binH, 28, binH)
        }
      }

      // ── Spawn particles from gun ──
      if (Math.random() < 0.15) {
        particles.push({
          x: gunX + 45, y: gunY,
          vx: 3 + Math.random() * 2, vy: (Math.random() - 0.5) * 0.3,
          phase: 0, passed: false, slitY: 0
        })
      }

      // ── Update & draw particles + matter waves ──
      const lambdaPx = Math.max(12, Math.min(80, lambda * 1e10 * 8))
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i]
        pt.x += pt.vx; pt.y += pt.vy; pt.phase += 0.15

        // Particle hits barrier
        if (!pt.passed && pt.x >= barrierX - slitW / 2) {
          const inSlit1 = Math.abs(pt.y - (gunY - slitGap / 2)) < 10
          const inSlit2 = Math.abs(pt.y - (gunY + slitGap / 2)) < 10
          if (inSlit1 || inSlit2) {
            pt.passed = true
            pt.slitY = inSlit1 ? gunY - slitGap / 2 : gunY + slitGap / 2
            // Diffraction spread (quantum)
            pt.vy += (Math.random() - 0.5) * 2.5
          } else {
            particles.splice(i, 1); continue
          }
        }

        // Particle hits detector screen
        if (pt.x >= screenX) {
          const binIdx = Math.floor((pt.y - 30) / binH)
          if (binIdx >= 0 && binIdx < detectorBins.length) detectorBins[binIdx]++
          particles.splice(i, 1); continue
        }

        // Remove if off-screen
        if (pt.x > W + 10 || pt.y < -20 || pt.y > H + 20) { particles.splice(i, 1); continue }

        // Draw particle dot
        ctx.fillStyle = 'rgba(232,200,128,0.8)'
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill()

        // Draw de Broglie matter-wave rings around moving particle
        if (pt.passed) {
          for (let r = 1; r <= 3; r++) {
            const waveR = r * lambdaPx * 0.5 + pt.phase * 3
            const alpha = Math.max(0, 0.2 - r * 0.06)
            ctx.strokeStyle = `rgba(136,192,184,${alpha})`; ctx.lineWidth = 1
            ctx.beginPath(); ctx.arc(pt.x, pt.y, waveR % (lambdaPx * 2), 0, Math.PI * 2); ctx.stroke()
          }
        }
      }

      // ── Wavefronts expanding from both Slits (Interference Pattern) ──
      const slit1Y = gunY - slitGap / 2, slit2Y = gunY + slitGap / 2
      const numArcs = 8
      for (let k = 0; k < numArcs; k++) {
        const arcR = ((s.t * 80 + k * lambdaPx) % (screenX - barrierX))
        const alphaArc = Math.max(0, 0.25 * (1 - arcR / (screenX - barrierX)))
        ctx.strokeStyle = `rgba(136,192,184,${alphaArc})`; ctx.lineWidth = 1.2
        // Arc from slit 1
        ctx.beginPath(); ctx.arc(barrierX + 3, slit1Y, arcR, -Math.PI * 0.45, Math.PI * 0.45); ctx.stroke()
        // Arc from slit 2
        ctx.beginPath(); ctx.arc(barrierX + 3, slit2Y, arcR, -Math.PI * 0.45, Math.PI * 0.45); ctx.stroke()
      }

      // ── De Broglie wave overlay between gun and barrier ──
      const waveY = gunY
      ctx.strokeStyle = 'rgba(136,192,184,0.25)'; ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let wx = gunX + 45; wx < barrierX - slitW / 2; wx += 2) {
        const wy = waveY + 18 * Math.sin((wx + s.t * 80) * (2 * Math.PI / lambdaPx))
        if (wx === gunX + 45) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy)
      }
      ctx.stroke()

      // λ annotation arrow
      const annY = gunY + 50
      const lambdaStart = 150, lambdaEnd = 150 + lambdaPx
      ctx.setLineDash([2, 2]); ctx.strokeStyle = 'rgba(232,200,128,0.35)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(lambdaStart, annY - 8); ctx.lineTo(lambdaStart, annY + 8); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(lambdaEnd, annY - 8); ctx.lineTo(lambdaEnd, annY + 8); ctx.stroke()
      ctx.setLineDash([])
      drawArrow(ctx, lambdaStart, annY, lambdaEnd, annY, 'rgba(232,200,128,0.5)', 1.5, 5)
      ctx.fillStyle = 'rgba(232,200,128,0.5)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('λ', (lambdaStart + lambdaEnd) / 2, annY - 10)

      // ── Equation Banner ──
      ctx.fillStyle = 'rgba(196,149,106,0.12)'; roundRect(ctx, W / 2 - 110, H - 40, 220, 28, 6); ctx.fill()
      ctx.fillStyle = 'rgba(232,200,128,0.7)'; ctx.font = '12px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('λ = h / (m · v)', W / 2, H - 26)

      // ── Live Readouts (top-left) ──
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(`λ = ${lambda.toExponential(3)} m`, 40, 25)
      ctx.fillText(`p = ${p_val.toExponential(3)} kg·m/s`, 40, 45)
      ctx.fillText(`v = ${(s.vel || 1e6).toExponential(2)} m/s`, 40, 65)
      ctx.fillText(`m = ${(s.mass || 9.109e-31).toExponential(3)} kg`, 40, 85)

      animRef.current = requestAnimationFrame(draw)
    }

    // Rounded rect helper
    function roundRect(c, x, y, w, hh, r) {
      c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y)
      c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + hh - r)
      c.quadraticCurveTo(x + w, y + hh, x + w - r, y + hh); c.lineTo(x + r, y + hh)
      c.quadraticCurveTo(x, y + hh, x, y + hh - r); c.lineTo(x, y + r)
      c.quadraticCurveTo(x, y, x + r, y); c.closePath()
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const h = 6.626e-34
  const p = mass * vel
  const lambda = h / (p || 1)
  const E = 0.5 * mass * vel * vel

  const handleCalc = () => {
    if (localM === "" || localV === "") {
      if (localM === "") setMass("");
      if (localV === "") setVel("");
      return;
    }
    let pm = parseFloat(localM); if (isNaN(pm)) pm = 9.109e-31; pm = Math.max(1e-35, Math.min(1, pm))
    let pv = parseFloat(localV); if (isNaN(pv)) pv = 1e6; pv = Math.max(1, Math.min(3e8, pv))
    setMass(pm); setVel(pv)
  }
  const handleReset = () => { setMass(9.109e-31); setVel(1e6) }

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputCardField label="Mass (kg)" value={localM} onChange={setLocalM} unit="kg" />
            <InputCardField label="Velocity (m/s)" value={localV} onChange={setLocalV} unit="m/s" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleCalc} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard equationId="debroglie" params={{ mass, velocity: vel }} isPending={isPending} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter mass and velocity.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Wavelength (λ):</span>
              <span className="font-bold text-[#E8C880]">{lambda.toExponential(4)} m</span>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Momentum (p):</span>
              <span className="font-bold text-[#C4956A]">{p.toExponential(4)} kg·m/s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-50">Kinetic Energy (KE):</span>
              <span className="font-bold text-[#88C0B8]">{E.toExponential(4)} J</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  15. PHOTOELECTRIC EFFECT SIMULATOR
// ══════════════════════════════════════════════════
export function PhotoelectricSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [frequency, setFrequency] = useState(() => { const v = getInitialParam(initialParams, 'frequency', 1e15); return v === "" ? 1e15 : v })
  const [workFn, setWorkFn] = useState(() => { const v = getInitialParam(initialParams, 'workFunction', 4.2); return v === "" ? 4.2 : v })
  const [localFreq, setLocalFreq] = useState('1e15')
  const [localPhi, setLocalPhi] = useState('4.2')
  useEffect(() => { setLocalFreq(String(frequency)); setLocalPhi(String(workFn)) }, [frequency, workFn])
  const animRef = useRef()
  const isPending = frequency === "" || workFn === "";
  const realism = checkRealism('photoelectric', isPending ? {} : { frequency, workFunction: workFn })
  const stateRef = useRef({ freq: 1e15, phi: 4.2, t: 0, electrons: [], isPending: false, isRealistic: true })
  useEffect(() => { Object.assign(stateRef.current, { freq: frequency, phi: workFn, isPending, isRealistic: realism.isRealistic }) }, [frequency, workFn, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)
    // Photon and electron particle arrays
    const photons = []
    const ejectedElectrons = []

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }
      s.t += 0.02
      const h = 6.626e-34, eV = 1.602e-19
      const photonE = h * s.freq / eV
      const emit = photonE > s.phi
      const KE_max = emit ? photonE - s.phi : 0

      // Grid background
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }

      // Layout
      const lampX = 80, lampY = H / 2
      const cathodeX = 370, cathodeH = 200
      const anodeX = 700, anodeH = 160

      // ── UV Light Source (lamp housing) ──
      ctx.fillStyle = 'rgba(160,130,210,0.1)'
      ctx.beginPath(); ctx.arc(lampX, lampY, 40, 0, Math.PI * 2); ctx.fill()
      const lampGrad = ctx.createRadialGradient(lampX, lampY, 5, lampX, lampY, 35)
      // Color based on frequency: UV = violet, visible = yellow-green, IR = red
      const freqNorm = Math.min(1, Math.max(0, (Math.log10(s.freq) - 14) / 2))
      const lampColor = freqNorm > 0.5 ? `rgba(160,130,230,${0.3 + freqNorm * 0.3})` : `rgba(230,200,100,${0.3 + freqNorm * 0.2})`
      lampGrad.addColorStop(0, lampColor); lampGrad.addColorStop(1, 'rgba(160,130,210,0.05)')
      ctx.fillStyle = lampGrad; ctx.beginPath(); ctx.arc(lampX, lampY, 35, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(160,130,210,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lampX, lampY, 36, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(232,221,204,0.6)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('LIGHT', lampX, lampY - 5)
      ctx.fillText('SOURCE', lampX, lampY + 6)
      // Frequency label
      ctx.fillStyle = 'rgba(160,130,210,0.6)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText(`f = ${(s.freq).toExponential(1)} Hz`, lampX, lampY + 52)

      // ── Photon Beam (wavy photons from lamp to cathode) ──
      // Spawn photons
      if (Math.random() < 0.2) {
        photons.push({
          x: lampX + 40, y: lampY + (Math.random() - 0.5) * 30,
          vx: 4 + Math.random() * 2, vy: (Math.random() - 0.5) * 0.5,
          phase: Math.random() * Math.PI * 2
        })
      }

      // Draw & update photons
      for (let i = photons.length - 1; i >= 0; i--) {
        const ph = photons[i]
        ph.x += ph.vx; ph.y += ph.vy; ph.phase += 0.2
        // Hit cathode
        if (ph.x >= cathodeX - 10) {
          // Spawn electron if above threshold
          if (emit && Math.random() < 0.4) {
            ejectedElectrons.push({
              x: cathodeX + 8, y: ph.y,
              vx: 2 + Math.random() * (KE_max * 2), vy: (Math.random() - 0.5) * 1.5,
              life: 80
            })
          }
          // Impact flash
          ctx.fillStyle = freqNorm > 0.5 ? 'rgba(160,130,230,0.4)' : 'rgba(230,200,100,0.3)'
          ctx.beginPath(); ctx.arc(cathodeX - 5, ph.y, 6, 0, Math.PI * 2); ctx.fill()
          photons.splice(i, 1); continue
        }
        // Draw photon as wavy packet
        const pColor = freqNorm > 0.5 ? `rgba(160,130,230,0.7)` : `rgba(230,200,100,0.6)`
        ctx.fillStyle = pColor; ctx.beginPath(); ctx.arc(ph.x, ph.y + Math.sin(ph.phase) * 3, 3, 0, Math.PI * 2); ctx.fill()
        // Wave trail
        ctx.strokeStyle = pColor.replace('0.7', '0.15').replace('0.6', '0.1'); ctx.lineWidth = 1
        ctx.beginPath()
        for (let w = 0; w < 20; w += 2) {
          const wx = ph.x - w, wy = ph.y + Math.sin(ph.phase - w * 0.3) * 3
          if (w === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy)
        }
        ctx.stroke()
      }
      // Cap photon count
      if (photons.length > 40) photons.splice(0, photons.length - 40)

      // ── Metal Cathode Plate ──
      ctx.fillStyle = 'rgba(196,149,106,0.2)'
      ctx.fillRect(cathodeX - 8, lampY - cathodeH / 2, 16, cathodeH)
      const cathGrad = ctx.createLinearGradient(cathodeX - 8, 0, cathodeX + 8, 0)
      cathGrad.addColorStop(0, 'rgba(180,170,150,0.3)'); cathGrad.addColorStop(1, 'rgba(140,130,110,0.15)')
      ctx.fillStyle = cathGrad; ctx.fillRect(cathodeX - 8, lampY - cathodeH / 2, 16, cathodeH)
      ctx.strokeStyle = 'rgba(196,149,106,0.5)'; ctx.lineWidth = 1.5
      ctx.strokeRect(cathodeX - 8, lampY - cathodeH / 2, 16, cathodeH)
      ctx.fillStyle = 'rgba(232,221,204,0.5)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('CATHODE', cathodeX, lampY - cathodeH / 2 - 8)
      ctx.fillText('(−)', cathodeX, lampY + cathodeH / 2 + 14)

      // ── Collector Anode ──
      ctx.fillStyle = 'rgba(136,192,184,0.15)'
      ctx.fillRect(anodeX - 6, lampY - anodeH / 2, 12, anodeH)
      ctx.strokeStyle = 'rgba(136,192,184,0.4)'; ctx.lineWidth = 1.5
      ctx.strokeRect(anodeX - 6, lampY - anodeH / 2, 12, anodeH)
      ctx.fillStyle = 'rgba(136,192,184,0.5)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('ANODE', anodeX, lampY - anodeH / 2 - 8)
      ctx.fillText('(+)', anodeX, lampY + anodeH / 2 + 14)

      // Wire connecting cathode and anode (bottom arc)
      ctx.strokeStyle = 'rgba(196,149,106,0.2)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(cathodeX, lampY + cathodeH / 2)
      ctx.quadraticCurveTo((cathodeX + anodeX) / 2, lampY + cathodeH / 2 + 40, anodeX, lampY + anodeH / 2)
      ctx.stroke(); ctx.setLineDash([])

      // Ammeter on wire
      const amX = (cathodeX + anodeX) / 2, amY = lampY + cathodeH / 2 + 28
      ctx.strokeStyle = 'rgba(232,200,128,0.4)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(amX, amY, 14, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(232,200,128,0.3)'; ctx.beginPath(); ctx.arc(amX, amY, 13, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(232,200,128,0.8)'; ctx.font = 'bold 9px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('A', amX, amY)

      // ── Ejected Electrons ──
      for (let i = ejectedElectrons.length - 1; i >= 0; i--) {
        const el = ejectedElectrons[i]
        el.x += el.vx; el.y += el.vy; el.life--
        if (el.life <= 0 || el.x > anodeX + 20) { ejectedElectrons.splice(i, 1); continue }
        const alpha = Math.min(0.8, el.life / 80)
        ctx.fillStyle = `rgba(136,192,184,${alpha})`
        ctx.beginPath(); ctx.arc(el.x, el.y, 3, 0, Math.PI * 2); ctx.fill()
        // Trail
        ctx.fillStyle = `rgba(136,192,184,${alpha * 0.3})`
        ctx.beginPath(); ctx.arc(el.x - el.vx * 2, el.y - el.vy * 2, 2, 0, Math.PI * 2); ctx.fill()
      }
      if (ejectedElectrons.length > 60) ejectedElectrons.splice(0, ejectedElectrons.length - 60)

      // ── Energy Level Diagram (top-right) ──
      const edX = 880, edY = 30, edW = 180, edH = 140
      ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(edX, edY, edW, edH)
      ctx.strokeStyle = 'rgba(196,149,106,0.2)'; ctx.lineWidth = 1; ctx.strokeRect(edX, edY, edW, edH)
      ctx.fillStyle = 'rgba(232,221,204,0.4)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('ENERGY DIAGRAM', edX + edW / 2, edY + 12)
      // Work function level
      const phiBarY = edY + edH - 25
      const ePhotonBarY = edY + edH - 25 - Math.min(100, photonE * 15)
      ctx.strokeStyle = 'rgba(224,120,64,0.5)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(edX + 20, phiBarY); ctx.lineTo(edX + edW - 20, phiBarY); ctx.stroke()
      ctx.fillStyle = 'rgba(224,120,64,0.6)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'right'
      ctx.fillText(`φ = ${s.phi} eV`, edX + edW - 22, phiBarY - 4)
      // Photon energy level
      ctx.strokeStyle = emit ? 'rgba(136,192,184,0.6)' : 'rgba(160,130,210,0.4)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(edX + 20, ePhotonBarY); ctx.lineTo(edX + edW - 20, ePhotonBarY); ctx.stroke()
      ctx.fillStyle = emit ? 'rgba(136,192,184,0.6)' : 'rgba(160,130,210,0.5)'; ctx.font = '9px var(--font-mono)'
      ctx.fillText(`hf = ${photonE.toFixed(2)} eV`, edX + edW - 22, ePhotonBarY - 4)
      // KE arrow if emission
      if (emit) {
        drawArrow(ctx, edX + edW / 2, phiBarY, edX + edW / 2, ePhotonBarY, '#88C0B8', 1.5, 5)
        ctx.fillStyle = '#88C0B8'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'left'
        ctx.fillText(`KE = ${KE_max.toFixed(2)} eV`, edX + edW / 2 + 6, (phiBarY + ePhotonBarY) / 2)
      }

      // ── Status Banner ──
      ctx.fillStyle = emit ? 'rgba(136,192,184,0.12)' : 'rgba(224,120,64,0.1)'
      ctx.fillRect(W / 2 - 140, H - 38, 280, 26)
      ctx.fillStyle = emit ? '#88C0B8' : '#E07840'; ctx.font = 'bold 12px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(emit ? `✓ ELECTRONS EMITTED — KE_max = ${KE_max.toFixed(2)} eV` : '✗ NO EMISSION — hf < φ (Below Threshold)', W / 2, H - 25)

      // ── Live Readouts (top-left) ──
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(`hf = ${photonE.toFixed(3)} eV`, 40, 25)
      ctx.fillText(`φ = ${s.phi} eV`, 40, 45)
      ctx.fillText(`KE_max = ${KE_max.toFixed(3)} eV`, 40, 65)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const hPlank = 6.626e-34, eVConst = 1.602e-19
  const photonE = hPlank * frequency / eVConst
  const emission = photonE > workFn
  const KE = emission ? photonE - workFn : 0
  const thresholdFreq = workFn * eVConst / hPlank

  const handleCalc = () => {
    if (localFreq === "" || localPhi === "") {
      if (localFreq === "") setFrequency("");
      if (localPhi === "") setWorkFn("");
      return;
    }
    let pf = parseFloat(localFreq); if (isNaN(pf)) pf = 1e15; pf = Math.max(1e12, Math.min(1e18, pf))
    let pp = parseFloat(localPhi); if (isNaN(pp)) pp = 4.2; pp = Math.max(0.1, Math.min(20, pp))
    setFrequency(pf); setWorkFn(pp)
  }
  const handleReset = () => { setFrequency(1e15); setWorkFn(4.2) }

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputCardField label="Frequency (Hz)" value={localFreq} onChange={setLocalFreq} unit="Hz" />
            <InputCardField label="Work Function (eV)" value={localPhi} onChange={setLocalPhi} unit="eV" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleCalc} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
            <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
          </div>
        </div>
      </WorkspacePortal>

      <WorkspacePortal target="results">
        <RealismCheckCard equationId="photoelectric" params={{ frequency, workFunction: workFn }} isPending={isPending} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter frequency and work function.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Photon Energy (E):</span>
              <span className="font-bold text-[#E8C880]">{photonE.toFixed(3)} eV</span>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Emission:</span>
              <span className="font-bold" style={{ color: emission ? '#88C0B8' : '#E07840' }}>{emission ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Max KE:</span>
              <span className="font-bold text-[#88C0B8]">{KE.toFixed(4)} eV</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="opacity-50">Threshold Freq:</span>
              <span className="font-bold text-[#C4956A]">{thresholdFreq.toExponential(4)} Hz</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}

// ══════════════════════════════════════════════════
//  16. RC CIRCUIT SIMULATOR
// ══════════════════════════════════════════════════
export function RCCircuitSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [voltage, setVoltage] = useState(() => { const v = getInitialParam(initialParams, 'voltage', 10); return v === "" ? 10 : v })
  const [resistance, setResistance] = useState(() => { const v = getInitialParam(initialParams, 'resistance', 1000); return v === "" ? 1000 : v })
  const [capacitance, setCapacitance] = useState(() => { const v = getInitialParam(initialParams, 'capacitance', 1e-4); return v === "" ? 1e-4 : v })

  const [localV, setLocalV] = useState(10)
  const [localR, setLocalR] = useState(1000)
  const [localC, setLocalC] = useState(100)

  useEffect(() => { setLocalV(voltage); setLocalR(resistance); setLocalC(capacitance * 1e6) }, [voltage, resistance, capacitance])

  const animRef = useRef()
  const isPending = voltage === "" || resistance === "" || capacitance === ""
  const realism = checkRealism('rc_circuit', isPending ? {} : { voltage, resistance, capacitance })

  const stateRef = useRef({ V: 10, R: 1000, C: 1e-4, t: 0, isPending: false, isRealistic: true })
  useEffect(() => {
    stateRef.current.V = voltage
    stateRef.current.R = resistance
    stateRef.current.C = capacitance
    stateRef.current.isPending = isPending
    stateRef.current.isRealistic = realism.isRealistic
  }, [voltage, resistance, capacitance, isPending, realism.isRealistic])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)
    // Circuit electron particles
    const circElectrons = Array.from({length: 24}, (_, i) => ({ pos: i / 24 }))

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }
      s.t += 0.016
      const tau = s.R * s.C
      const tauSafe = tau || 0.001
      const vc = s.V * (1 - Math.exp(-s.t / tauSafe))
      const ic = (s.V / s.R) * Math.exp(-s.t / tauSafe)
      const chargeRatio = vc / s.V // 0 to 1

      // Grid background
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }

      // Circuit layout
      const cx = 120, cy = 70, cw = 480, ch = 240

      // ── Circuit Wires ──
      ctx.strokeStyle = 'rgba(136,192,184,0.3)'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'
      // Top wire (cx -> cx+cw) with gap for resistor
      const resStart = cx + 140, resEnd = cx + 340
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(resStart, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(resEnd, cy); ctx.lineTo(cx + cw, cy); ctx.stroke()
      // Right wire
      ctx.beginPath(); ctx.moveTo(cx + cw, cy); ctx.lineTo(cx + cw, cy + ch); ctx.stroke()
      // Bottom wire
      ctx.beginPath(); ctx.moveTo(cx + cw, cy + ch); ctx.lineTo(cx, cy + ch); ctx.stroke()
      // Left wire (with gap for battery)
      const batTopY = cy + ch / 2 - 30, batBotY = cy + ch / 2 + 30
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, batTopY); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, batBotY); ctx.lineTo(cx, cy + ch); ctx.stroke()

      // ── Battery (left side) ──
      const batX = cx
      ctx.strokeStyle = 'rgba(232,200,128,0.6)'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(batX - 14, batTopY); ctx.lineTo(batX + 14, batTopY); ctx.stroke()
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(batX - 8, batTopY + 10); ctx.lineTo(batX + 8, batTopY + 10); ctx.stroke()
      // Repeat for visual
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(batX - 14, batBotY - 10); ctx.lineTo(batX + 14, batBotY - 10); ctx.stroke()
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(batX - 8, batBotY); ctx.lineTo(batX + 8, batBotY); ctx.stroke()
      ctx.fillStyle = 'rgba(232,200,128,0.6)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('+', batX - 20, batTopY + 4)
      ctx.fillText('−', batX - 20, batBotY)
      ctx.fillText(`${s.V}V`, batX + 26, cy + ch / 2 + 4)

      // ── Resistor (top wire, zigzag) ──
      const resY = cy, numZig = 8, zigH = 14
      ctx.strokeStyle = 'rgba(224,120,64,0.5)'; ctx.lineWidth = 2; ctx.lineJoin = 'round'
      ctx.beginPath(); ctx.moveTo(resStart, resY)
      const zigW = (resEnd - resStart) / numZig
      for (let i = 0; i < numZig; i++) {
        const zx = resStart + zigW * i + zigW / 2
        ctx.lineTo(zx, resY + (i % 2 === 0 ? -zigH : zigH))
      }
      ctx.lineTo(resEnd, resY); ctx.stroke()
      ctx.fillStyle = 'rgba(224,120,64,0.5)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText(`R = ${s.R} Ω`, (resStart + resEnd) / 2, resY - 22)

      // ── Capacitor (right side) ──
      const capX = cx + cw, capW = 70
      const capTopY = cy + ch / 2 - 30, capBotY = cy + ch / 2 + 30
      // Plate gap in right wire
      ctx.fillStyle = '#181410'; ctx.fillRect(capX - 4, capTopY, 8, capBotY - capTopY)

      // Top Plate (+Q) & Bottom Plate (-Q)
      ctx.strokeStyle = '#E8C880'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(capX - capW / 2, capTopY); ctx.lineTo(capX + capW / 2, capTopY); ctx.stroke()
      ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(capX - capW / 2, capBotY); ctx.lineTo(capX + capW / 2, capBotY); ctx.stroke()

      // Polarity Labels
      ctx.fillStyle = '#E8C880'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText('+Q', capX + capW / 2 + 8, capTopY + 4)
      ctx.fillStyle = '#88C0B8'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText('−Q', capX + capW / 2 + 8, capBotY + 4)

      // Accumulated Charges on Plates (+ signs on top, - signs on bottom)
      const numCharges = Math.floor(chargeRatio * 8)
      ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'center'
      for (let i = 0; i < numCharges; i++) {
        const qx = capX - capW / 2 + 10 + (i / 7) * (capW - 20)
        // Top plate +
        ctx.fillStyle = '#E8C880'
        ctx.fillText('+', qx, capTopY - 6)
        // Bottom plate -
        ctx.fillStyle = '#88C0B8'
        ctx.fillText('−', qx, capBotY + 12)
      }

      // Electric Field Lines between Capacitor Plates
      if (chargeRatio > 0.05) {
        const numFieldLines = 7
        ctx.lineWidth = 1.2
        ctx.strokeStyle = `rgba(232,200,128,${chargeRatio * 0.5})`
        for (let i = 0; i < numFieldLines; i++) {
          const fx = capX - capW / 2 + 8 + (i / (numFieldLines - 1)) * (capW - 16)
          ctx.beginPath(); ctx.moveTo(fx, capTopY + 4); ctx.lineTo(fx, capBotY - 4); ctx.stroke()
          // Arrowhead pointing down
          if (chargeRatio > 0.2) {
            drawArrow(ctx, fx, capTopY + 4, fx, (capTopY + capBotY) / 2 + 4, `rgba(232,200,128,${chargeRatio * 0.6})`, 1, 4)
          }
        }
      }

      // Dielectric gap voltage gradient fill
      const fillAlpha = chargeRatio * 0.25
      if (fillAlpha > 0.01) {
        const capGrad = ctx.createLinearGradient(capX, capTopY, capX, capBotY)
        capGrad.addColorStop(0, `rgba(232,200,128,${fillAlpha})`)
        capGrad.addColorStop(1, `rgba(136,192,184,${fillAlpha})`)
        ctx.fillStyle = capGrad
        ctx.fillRect(capX - capW / 2 + 2, capTopY + 2, capW - 4, capBotY - capTopY - 4)
      }
      ctx.fillStyle = 'rgba(136,192,184,0.7)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText(`C = ${(s.C * 1e6).toFixed(0)} µF`, capX, capBotY + 26)

      // ── Knife Switch (top-left wire) ──
      const swX = cx + 50, swY = cy
      ctx.fillStyle = 'rgba(232,200,128,0.15)'
      ctx.beginPath(); ctx.arc(swX, swY, 12, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#E8C880'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(swX, swY, 12, 0, Math.PI * 2); ctx.stroke()
      // Closed blade indicator
      ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.moveTo(swX - 8, swY); ctx.lineTo(swX + 8, swY); ctx.stroke()
      ctx.fillStyle = '#88C0B8'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('SWITCH CLOSED', swX, swY - 16)

      // ── Animated Drift Electrons ──
      const speedFactor = Math.max(0.0002, (1 - chargeRatio) * 0.004)
      const perimeter = 2 * cw + 2 * ch
      for (const el of circElectrons) {
        el.pos += speedFactor
        if (el.pos > 1) el.pos -= 1
        const dist = el.pos * perimeter
        let ex, ey
        if (dist < cw) { ex = cx + dist; ey = cy }
        else if (dist < cw + ch) { ex = cx + cw; ey = cy + (dist - cw) }
        else if (dist < 2 * cw + ch) { ex = cx + cw - (dist - cw - ch); ey = cy + ch }
        else { ex = cx; ey = cy + ch - (dist - 2 * cw - ch) }
        const alpha = 0.25 + (1 - chargeRatio) * 0.55
        ctx.fillStyle = `rgba(136,192,184,${alpha})`
        ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill()
      }

      // ── Analog Voltmeter Gauge (across Capacitor) ──
      const gaugeX = 810, gaugeY = 220, gaugeR = 55
      ctx.fillStyle = 'rgba(24,20,16,0.9)'
      ctx.beginPath(); ctx.arc(gaugeX, gaugeY, gaugeR, Math.PI, 2 * Math.PI); ctx.fill()
      ctx.strokeStyle = 'rgba(136,192,184,0.3)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(gaugeX, gaugeY, gaugeR, Math.PI, 2 * Math.PI); ctx.stroke()
      // Arc fill proportional to Vc
      const gaugeAngle = Math.PI + chargeRatio * Math.PI
      ctx.strokeStyle = '#88C0B8'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.arc(gaugeX, gaugeY, gaugeR - 4, Math.PI, gaugeAngle); ctx.stroke()
      // Needle
      ctx.strokeStyle = '#E8C880'; ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.moveTo(gaugeX, gaugeY)
      ctx.lineTo(gaugeX + (gaugeR - 12) * Math.cos(gaugeAngle), gaugeY + (gaugeR - 12) * Math.sin(gaugeAngle))
      ctx.stroke()
      ctx.fillStyle = '#E8C880'; ctx.beginPath(); ctx.arc(gaugeX, gaugeY, 5, 0, Math.PI * 2); ctx.fill()
      // Gauge Labels
      ctx.fillStyle = 'rgba(232,221,204,0.6)'; ctx.font = '10px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('0V', gaugeX - gaugeR + 12, gaugeY + 14)
      ctx.fillText(`${s.V}V`, gaugeX + gaugeR - 12, gaugeY + 14)
      ctx.fillStyle = '#88C0B8'; ctx.font = 'bold 11px var(--font-mono)'
      ctx.fillText(`V_c = ${vc.toFixed(2)} V`, gaugeX, gaugeY + 28)
      ctx.fillStyle = 'rgba(232,221,204,0.5)'; ctx.font = '9px var(--font-mono)'
      ctx.fillText('VOLTMETER (Capacitor)', gaugeX, gaugeY - gaugeR - 8)

      // ── Status Banner (bottom-left) ──
      const chgPercent = (chargeRatio * 100).toFixed(1)
      ctx.fillStyle = 'rgba(196,149,106,0.1)'; roundRect(ctx, 680, 50, 260, 50, 8); ctx.fill()
      ctx.strokeStyle = 'rgba(196,149,106,0.2)'; roundRect(ctx, 680, 50, 260, 50, 8); ctx.stroke()
      ctx.fillStyle = '#E8C880'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`CAPACITOR CHARGE: ${chgPercent}%`, 810, 68)
      ctx.fillStyle = 'rgba(136,192,184,0.8)'; ctx.font = '10px var(--font-mono)'
      ctx.fillText(`Q(t) = ${(chargeRatio * s.C * s.V * 1e6).toFixed(2)} µC`, 810, 86)

      // ── Live Readouts (top-left) ──
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(`V_c(t) = ${vc.toFixed(3)} V`, 40, 25)
      ctx.fillText(`I(t) = ${(ic * 1000).toFixed(2)} mA`, 40, 45)
      ctx.fillText(`τ = RC = ${(tau * 1000).toFixed(2)} ms`, 40, 65)
      ctx.fillText(`t = ${s.t.toFixed(3)} s`, 40, 85)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const tau = resistance * capacitance
  const maxQ = capacitance * voltage
  const maxE = 0.5 * capacitance * voltage * voltage

  const handleCalc = () => {
if (localV === "" || localR === "" || localC === "") {
if (localV === "") setVoltage("");
if (localR === "") setResistance("");
if (localC === "") setCapacitance("");
return;
}
let pv = parseFloat(localV); if (isNaN(pv)) pv = 10; pv = Math.max(0.1, Math.min(100, pv))
let pr = parseFloat(localR); if (isNaN(pr)) pr = 1000; pr = Math.max(1, Math.min(1e6, pr))
let pc = parseFloat(localC); if (isNaN(pc)) pc = 10; pc = Math.max(0.1, Math.min(1000, pc))
setVoltage(pv)
setResistance(pr)
setCapacitance(pc * 1e-6)
}
const handleReset = () => {
setLocalV(10); setLocalR(1000); setLocalC(100)
setVoltage(10); setResistance(1000); setCapacitance(1e-4)
}

return (
<div className="flex flex-col items-center w-full">
<canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
<WorkspacePortal target="inputs">
<div className="flex flex-col gap-4 w-full">
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
<InputCardField label="Voltage (V₀)" value={localV} min={0.1} max={100} step={0.5} onChange={setLocalV} unit="V" />
<InputCardField label="Resistance (R)" value={localR} min={1} max={1000000} step={10} onChange={setLocalR} unit="Ω" />
<InputCardField label="Capacitance (C)" value={localC} min={0.1} max={1000} step={0.1} onChange={setLocalC} unit="μF" />
            </div>
            <div className="flex gap-4 mt-2 w-full">
              <button onClick={handleCalc} className="flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-[#181410]" style={{ background: 'linear-gradient(135deg, #C4956A 0%, #88C0B8 100%)' }}>Apply Parameters</button>
              <button onClick={handleReset} className="py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer text-[rgba(232,221,204,0.6)] hover:text-[#E8C880]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,149,106,0.15)' }}>Reset</button>
            </div>
          </div>
        </WorkspacePortal>

        <WorkspacePortal target="results">
          <RealismCheckCard realism={realism} />
          {isPending ? (
            <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
              <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
              Enter voltage, resistance, and capacitance.
            </div>
          ) : (
            <div>
            <div className="flex flex-col gap-2 p-4 rounded-xl font-mono text-xs text-[#E8C880] bg-[rgba(255,255,255,0.02)] border border-[rgba(196,149,106,0.1)]">
<span className="opacity-50">Time Constant (τ = RC):</span>
<span className="font-bold text-[#E8C880]">{isPending ? "[Missing]" : `${(tau * 1000).toFixed(2)} ms`}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Max Stored Charge (Q_max):</span>
<span className="font-bold text-[#88C0B8]">{isPending ? "[Missing]" : `${(maxQ * 1e6).toFixed(3)} µC`}</span>
</div>
<div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
<span className="opacity-50">Max Energy Stored (E_max):</span>
<span className="font-bold text-[#C4956A]">{isPending ? "[Missing]" : `${(maxE * 1e3).toFixed(4)} mJ`}</span>
</div>
<div className="p-3.5 rounded-lg border border-[rgba(136,192,184,0.15)] bg-[rgba(136,192,184,0.04)]" style={{ borderLeft: '3px solid rgba(136,192,184,0.35)' }}>
<span className="opacity-40 block mb-1">Formula substitution:</span>
<span className="font-mono text-xs text-[#E8C880]">
State Eq: V_c(t) = V₀(1 − e^(−t/RC)) <br/>
τ = R · C = {isPending ? "[Missing]" : `${resistance} Ω · ${(capacitance * 1e6).toFixed(1)} µF = ${(tau * 1000).toFixed(2)} ms`} <br/>
Q_max = C · V₀ = {isPending ? "[Missing]" : `${(capacitance * 1e6).toFixed(1)} µF · ${voltage} V = ${(maxQ * 1e6).toFixed(2)} µC`}
</span>
</div>
</div>
)}
</WorkspacePortal>
</div>
)
}

// ══════════════════════════════════════════════════
//  17. NEWTON'S SECOND LAW SIMULATOR
// ══════════════════════════════════════════════════
export function NewtonSimulator({ initialParams }) {
  const canvasRef = useRef(null)
  const [force, setForce] = useState(() => { const v = getInitialParam(initialParams, 'force', 10); return v === "" ? 10 : v })
  const [mass, setMass] = useState(() => { const v = getInitialParam(initialParams, 'mass', 2); return v === "" ? 2 : v })
  const [localF, setLocalF] = useState(10)
  const [localM, setLocalM] = useState(2)
  useEffect(() => { setLocalF(force); setLocalM(mass) }, [force, mass])
  const animRef = useRef()
  const isPending = force === "" || mass === "";
  const accelVal = isPending ? 0 : force / mass
  const realism = checkRealism('newton', isPending ? {} : { mass, force, acceleration: accelVal })
  const stateRef = useRef({ F: 10, m: 2, a: 5, t: 0, isPending: false, isRealistic: true })
  useEffect(() => {
    Object.assign(stateRef.current, { F: force, m: mass, a: accelVal, t: 0, isPending, isRealistic: realism.isRealistic })
  }, [force, mass, accelVal, isPending, realism.isRealistic])
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 1100, H = 380
    canvas.width = W * dpr; canvas.height = H * dpr
    canvas.style.width = '100%'; canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)
    // Trail for block position
    const trail = []

    const draw = () => {
      const s = stateRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#181410'; ctx.fillRect(0, 0, W, H)
      if (s.isPending || !s.isRealistic) {
        ctx.fillStyle = 'rgba(232, 221, 204, 0.4)'; ctx.font = '16px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(s.isPending ? 'Awaiting required parameters...' : '⚠️ Unrealistic parameters — calculation suspended', W / 2, H / 2)
        animRef.current = requestAnimationFrame(draw)
        return
      }
      s.t += 0.016
      const a = s.F / s.m
      const v = a * s.t
      const x = 0.5 * a * s.t * s.t

      // Grid background
      ctx.strokeStyle = 'rgba(196,149,106,0.04)'; ctx.lineWidth = 1
      for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }

      // Track geometry
      const trackLeft = 60, trackRight = W - 60
      const trackW = trackRight - trackLeft
      const trackY = H / 2 + 60

      // Block size proportional to mass
      const blockW = Math.max(35, Math.min(70, 20 + s.m * 5))
      const blockH = Math.max(30, Math.min(55, 18 + s.m * 4))

      // Scale position to fit track (wraps after reaching end)
      const maxTravelM = trackW * 2 // virtual distance in pixels before wrap
      const scale = trackW / Math.max(maxTravelM, 1)
      const rawBlockX = trackLeft + (x * scale) % trackW
      const blockX = rawBlockX

      // ── Air Track (full-width) ──
      // Track surface
      ctx.fillStyle = 'rgba(136,192,184,0.06)'
      ctx.fillRect(trackLeft, trackY, trackW, 8)
      ctx.strokeStyle = 'rgba(136,192,184,0.25)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(trackLeft, trackY); ctx.lineTo(trackRight, trackY); ctx.stroke()
      // Track legs
      ctx.strokeStyle = 'rgba(136,192,184,0.15)'; ctx.lineWidth = 1.5
      for (let lx = trackLeft + 50; lx < trackRight; lx += 200) {
        ctx.beginPath(); ctx.moveTo(lx, trackY + 8); ctx.lineTo(lx - 8, trackY + 30); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(lx + 10, trackY + 8); ctx.lineTo(lx + 18, trackY + 30); ctx.stroke()
      }

      // ── Ruler Markings ──
      ctx.fillStyle = 'rgba(196,149,106,0.3)'; ctx.font = '8px var(--font-mono)'; ctx.textAlign = 'center'
      for (let rx = trackLeft; rx <= trackRight; rx += 50) {
        const isMajor = (rx - trackLeft) % 100 === 0
        ctx.strokeStyle = isMajor ? 'rgba(196,149,106,0.3)' : 'rgba(196,149,106,0.15)'
        ctx.lineWidth = isMajor ? 1.5 : 1
        const tickH = isMajor ? 8 : 5
        ctx.beginPath(); ctx.moveTo(rx, trackY - tickH); ctx.lineTo(rx, trackY); ctx.stroke()
        if (isMajor) {
          const meterVal = ((rx - trackLeft) / trackW * maxTravelM / scale).toFixed(0)
          ctx.fillText(`${meterVal}`, rx, trackY - tickH - 3)
        }
      }
      ctx.fillStyle = 'rgba(196,149,106,0.35)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('position (m)', trackLeft + trackW / 2, trackY + 22)

      // ── Motion Trail ──
      trail.push({ x: blockX, y: trackY - blockH / 2 })
      if (trail.length > 50) trail.shift()
      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.3
        ctx.fillStyle = `rgba(136,192,184,${alpha})`
        ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y + blockH / 2 - 3, 2, 0, Math.PI * 2); ctx.fill()
      }

      // ── Mass Block ──
      const bLeft = blockX - blockW / 2, bTop = trackY - blockH
      // Block glow
      ctx.fillStyle = 'rgba(136,192,184,0.08)'
      ctx.fillRect(bLeft - 4, bTop - 4, blockW + 8, blockH + 8)
      // Block body
      const bGrad = ctx.createLinearGradient(bLeft, bTop, bLeft + blockW, bTop + blockH)
      bGrad.addColorStop(0, '#a8ddd8'); bGrad.addColorStop(1, '#88C0B8')
      ctx.fillStyle = bGrad; ctx.fillRect(bLeft, bTop, blockW, blockH)
      ctx.strokeStyle = 'rgba(232,221,204,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(bLeft, bTop, blockW, blockH)
      // Mass label
      ctx.fillStyle = '#141210'; ctx.font = 'bold 11px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`${s.m} kg`, blockX, bTop + blockH / 2)

      // ── Force Vector (F, orange, pointing right) ──
      const forceLen = Math.min(120, Math.max(25, s.F * 3))
      drawArrow(ctx, blockX + blockW / 2 + 5, bTop + blockH / 2, blockX + blockW / 2 + 5 + forceLen, bTop + blockH / 2, '#E07840', 2.5, 8)
      ctx.fillStyle = '#E07840'; ctx.font = 'bold 10px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`F = ${s.F} N`, blockX + blockW / 2 + forceLen + 10, bTop + blockH / 2 + 4)

      // ── Acceleration Vector (a, gold, smaller, above block) ──
      const accelLen = Math.min(80, Math.max(15, a * 8))
      drawArrow(ctx, blockX, bTop - 15, blockX + accelLen, bTop - 15, '#E8C880', 2, 6)
      ctx.fillStyle = '#E8C880'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText(`a = ${a.toFixed(2)} m/s²`, blockX + accelLen + 8, bTop - 12)

      // ── Velocity Vector (v, teal, below block) ──
      const velLen = Math.min(100, Math.max(0, v * 2))
      if (velLen > 2) {
        drawArrow(ctx, blockX, trackY + 12, blockX + velLen, trackY + 12, '#88C0B8', 1.5, 5)
        ctx.fillStyle = '#88C0B8'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'left'
        ctx.fillText(`v = ${v.toFixed(2)} m/s`, blockX + velLen + 6, trackY + 15)
      }

      // ── Normal & Weight in Free-Body Diagram (top-right) ──
      const fbdX = 900, fbdY = 100, fbdR = 18
      ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(fbdX - 60, fbdY - 65, 120, 130)
      ctx.strokeStyle = 'rgba(196,149,106,0.15)'; ctx.lineWidth = 1; ctx.strokeRect(fbdX - 60, fbdY - 65, 120, 130)
      ctx.fillStyle = 'rgba(232,221,204,0.4)'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
      ctx.fillText('FREE-BODY DIAGRAM', fbdX, fbdY - 55)
      // Object dot
      ctx.fillStyle = 'rgba(136,192,184,0.4)'; ctx.beginPath(); ctx.arc(fbdX, fbdY, fbdR, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(136,192,184,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(fbdX, fbdY, fbdR, 0, Math.PI * 2); ctx.stroke()
      // F applied (right)
      drawArrow(ctx, fbdX + fbdR, fbdY, fbdX + fbdR + 35, fbdY, '#E07840', 2, 5)
      ctx.fillStyle = '#E07840'; ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'left'
      ctx.fillText('F', fbdX + fbdR + 38, fbdY + 3)
      // Weight (down)
      drawArrow(ctx, fbdX, fbdY + fbdR, fbdX, fbdY + fbdR + 25, 'rgba(196,149,106,0.5)', 1.5, 4)
      ctx.fillStyle = 'rgba(196,149,106,0.5)'; ctx.textAlign = 'center'
      ctx.fillText('mg', fbdX + 12, fbdY + fbdR + 28)
      // Normal (up)
      drawArrow(ctx, fbdX, fbdY - fbdR, fbdX, fbdY - fbdR - 25, 'rgba(136,192,184,0.5)', 1.5, 4)
      ctx.fillStyle = 'rgba(136,192,184,0.5)'
      ctx.fillText('N', fbdX + 10, fbdY - fbdR - 28)

      // ── Equation Banner ──
      ctx.fillStyle = 'rgba(196,149,106,0.1)'; ctx.fillRect(W / 2 - 100, H - 38, 200, 26)
      ctx.fillStyle = 'rgba(232,200,128,0.7)'; ctx.font = '13px var(--font-mono)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('F = m · a', W / 2, H - 25)

      // ── Live Readouts (top-left) ──
      ctx.fillStyle = 'rgba(220,200,165,0.6)'; ctx.font = '12px var(--font-body)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(`t = ${s.t.toFixed(2)} s`, 40, 25)
      ctx.fillText(`x(t) = ${x.toFixed(2)} m`, 40, 45)
      ctx.fillText(`v(t) = ${v.toFixed(2)} m/s`, 40, 65)
      ctx.fillText(`a = F/m = ${a.toFixed(2)} m/s²`, 40, 85)
      ctx.fillText(`F = ${s.F} N, m = ${s.m} kg`, 40, 105)

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])
  const a = force / mass
  const handleCalc = () => {
    if (localF === "" || localM === "") {
      if (localF === "") setForce("");
      if (localM === "") setMass("");
      return
    }
    let pf = parseFloat(localF); if (isNaN(pf)) pf = 10; pf = Math.max(0.1, Math.min(1000, pf))
    let pm = parseFloat(localM); if (isNaN(pm)) pm = 2; pm = Math.max(0.1, Math.min(500, pm))
    setForce(pf); setMass(pm)
  }
  const handleReset = () => { setLocalF(10); setLocalM(2); setForce(10); setMass(2) }
  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} style={{ borderRadius: '14px', display: 'block', border: '1px solid rgba(136,192,184,0.1)' }} />
      <WorkspacePortal target="inputs">
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputCardField label="Force (F)" value={localF} min={0.1} max={1000} step={1} onChange={setLocalF} unit="N" />
            <InputCardField label="Mass (m)" value={localM} min={0.1} max={500} step={0.5} onChange={setLocalM} unit="kg" />
          </div>
          <div className="flex gap-4 mt-2 w-full">
            <button onClick={handleCalc} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200" style={{ background: '#88C0B8', color: '#141210' }}>Apply Parameters</button>
            <button onClick={handleReset} className="flex-1 py-3 px-5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono cursor-pointer transition-all duration-200 border border-[rgba(220,208,188,0.2)] hover:border-[rgba(220,208,188,0.4)] text-[rgba(220,208,188,0.85)] bg-transparent">Reset</button>
          </div>
        </div>
      </WorkspacePortal>
      <WorkspacePortal target="results">
        <RealismCheckCard realism={realism} />
        {isPending ? (
          <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3" style={{ borderLeft: '3px solid #ef4444' }}>
            <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Calculation Pending</span>
            Enter force and mass to begin simulation.
          </div>
        ) : (
          <div className="flex flex-col gap-5 font-mono text-xs w-full">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Applied Force (F):</span>
              <span className="font-bold text-[#E8C880]">{(!isPending && realism.isRealistic) ? `${Number(force.toFixed(2))} N` : "[Missing]"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Mass (m):</span>
              <span className="font-bold text-[#88C0B8]">{(!isPending && realism.isRealistic) ? `${Number(mass.toFixed(2))} kg` : "[Missing]"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2.5">
              <span className="opacity-50">Acceleration (a = F/m):</span>
              <span className="font-bold text-[#C4956A]">{(!isPending && realism.isRealistic) ? `${Number(a.toFixed(2))} m/s²` : "[Missing]"}</span>
            </div>
          </div>
        )}
      </WorkspacePortal>
    </div>
  )
}
