import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 15000
const STAR_COUNT = 60

// Custom Vertex Shader: Computes mathematical wave coordinates and mouse ripples on the GPU
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;

  varying float vVelocity;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Quantum wave equations (superposition of sine and cosine fields)
    float waveX = sin(pos.y * 0.15 + uTime * 0.35) * cos(pos.z * 0.1 + uTime * 0.2) * 1.8;
    float waveY = cos(pos.x * 0.18 + uTime * 0.45) * sin(pos.z * 0.12 + uTime * 0.25) * 1.5;
    float waveZ = sin(pos.x * 0.1 + pos.y * 0.08 + uTime * 0.3) * 2.2;

    pos.x += waveX;
    pos.y += waveY;
    pos.z += waveZ;

    // Mouse gravity well ripple interaction
    vec2 particleXY = pos.xy;
    float dist = distance(particleXY, uMouse);
    if (dist < uMouseRadius) {
      // Quadratic falloff force
      float force = pow(1.0 - (dist / uMouseRadius), 2.0) * uMouseStrength;
      
      // Ripple wave effect pushing/pulling particles
      float ripple = sin(dist * 2.5 - uTime * 4.0) * 0.35;
      pos.xy += normalize(particleXY - uMouse) * (force + ripple);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation: larger when closer to camera
    float depth = -mvPosition.z;
    gl_PointSize = mix(2.5, 5.5, smoothstep(22.0, 2.0, depth));

    // Depth fading — brighter overall
    vAlpha = smoothstep(30.0, 1.0, depth) * 0.97;

    // Calculate a pseudo-velocity magnitude for color mapping
    vVelocity = clamp((abs(waveX) + abs(waveY) + abs(waveZ)) / 5.5, 0.0, 1.0);
  }
`

// Custom Fragment Shader: Renders anti-aliased circles with spectral colors
const fragmentShader = /* glsl */ `
  varying float vVelocity;
  varying float vAlpha;

  void main() {
    // Render soft anti-aliased circle
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, dist);

    // Color gradient mapping: deep cosmic indigo -> soft electric violet -> near-white
    vec3 colorSlow = vec3(0.12, 0.30, 0.72); // Rich Indigo
    vec3 colorMid  = vec3(0.40, 0.32, 0.82); // Violet
    vec3 colorFast = vec3(0.95, 0.97, 1.00); // Pure white

    vec3 color = mix(colorSlow, colorMid, smoothstep(0.0, 0.45, vVelocity));
    color = mix(color, colorFast, smoothstep(0.45, 1.0, vVelocity));

    gl_FragColor = vec4(color, alpha * vAlpha);
  }
`

// ── Star shaders ──
const starVertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  varying float vTwinkle;

  void main() {
    vec3 pos = position;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Twinkle: gentle sinusoidal brightness oscillation
    float twinkle = 0.55 + 0.45 * sin(uTime * 1.2 + aPhase * 6.28);
    vTwinkle = twinkle;

    float depth = -mvPosition.z;
    gl_PointSize = aSize * smoothstep(30.0, 2.0, depth);
  }
`

const starFragmentShader = /* glsl */ `
  varying float vTwinkle;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Bright core with soft glow falloff
    float core = smoothstep(0.5, 0.0, dist);
    float glow = smoothstep(0.5, 0.15, dist);
    float alpha = mix(glow * 0.4, core, 0.6) * vTwinkle;

    // Warm white/gold star color
    vec3 color = vec3(1.0, 0.96, 0.88);
    gl_FragColor = vec4(color, alpha);
  }
`

function WaveParticles() {
  const meshRef = useRef()
  const materialRef = useRef()
  const mouseRef = useRef(new THREE.Vector2(-999, -999)) // Off-screen by default
  const { viewport } = useThree()

  // Generate uniform initial positions across the full viewport
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3
      // Distribute wide enough to fully cover any screen aspect ratio
      pos[idx]     = (Math.random() - 0.5) * viewport.width * 1.5
      pos[idx + 1] = (Math.random() - 0.5) * viewport.height * 1.5
      pos[idx + 2] = (Math.random() - 0.5) * 8.0 // Depth range
    }
    return pos
  }, [viewport])

  // Track mouse coordinates in 3D scene space
  useEffect(() => {
    const handlePointerMove = (e) => {
      // Normalize mouse to [-1, 1] range
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      
      // Map to viewport dimensions at depth = 0
      mouseRef.current.x = nx * viewport.width * 0.5
      mouseRef.current.y = ny * viewport.height * 0.5
    }

    const handlePointerLeave = () => {
      // Move mouse influence off-screen
      mouseRef.current.set(-999, -999)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [viewport])

  useFrame((state) => {
    if (!materialRef.current) return
    const time = state.clock.getElapsedTime()
    
    // Update uniforms
    materialRef.current.uniforms.uTime.value = time
    materialRef.current.uniforms.uMouse.value.copy(mouseRef.current)
  })

  // Set up custom shader material uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(-999, -999) },
    uMouseRadius: { value: 1.2 },   // Very small radius — only nearby particles
    uMouseStrength: { value: 0.18 }, // Very gentle nudge — slow drift
  }), [])

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function TwinklingStars() {
  const meshRef = useRef()
  const materialRef = useRef()
  const { viewport } = useThree()

  const { positions, sizes, phases } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3)
    const sz = new Float32Array(STAR_COUNT)
    const ph = new Float32Array(STAR_COUNT)
    for (let i = 0; i < STAR_COUNT; i++) {
      const idx = i * 3
      pos[idx]     = (Math.random() - 0.5) * viewport.width * 1.4
      pos[idx + 1] = (Math.random() - 0.5) * viewport.height * 1.4
      pos[idx + 2] = (Math.random() - 0.5) * 6.0
      sz[i] = 3.5 + Math.random() * 6.0
      ph[i] = Math.random()
    }
    return { positions: pos, sizes: sz, phases: ph }
  }, [viewport])

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
  }), [])

  useFrame((state) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={STAR_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={STAR_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={STAR_COUNT} array={phases} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function ParticleUniverse() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60, near: 0.1, far: 50 }}
        dpr={[1, 1]} // Force 1x pixel ratio for perf
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          depth: false,
          stencil: false,
        }}
        style={{ background: 'transparent' }}
      >
        <WaveParticles />
        <TwinklingStars />
      </Canvas>
    </div>
  )
}
