import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SimpleSimulator from './SimpleSimulator'
import { WorkspaceContext } from './WorkspaceShared'
import { getInterpretation } from '../lib/parameterExtractor'


// ══════════════════════════
//  EQUATION DATA
// ══════════════════════════
const BRANCHES = [
  { id: 'all', label: 'All Fields', color: '#C4956A' },
  { id: 'quantum', label: 'Quantum Mechanics', color: '#C4956A' },
  { id: 'classical', label: 'Classical Mechanics', color: '#88C0B8' },
  { id: 'thermo', label: 'Thermodynamics', color: '#E07840' },
  { id: 'fluid', label: 'Fluid Mechanics', color: '#88C0B8' },
  { id: 'em', label: 'Electromagnetism', color: '#A09CC8' },
  { id: 'relativity', label: 'Relativity', color: '#C4956A' },
  { id: 'statistical', label: 'Statistical Mech', color: '#E07840' },
]

const EQUATIONS = [
  { id: 'schrodinger', branch: 'quantum', name: 'Schrödinger Equation', formula: 'iℏ ∂ψ/∂t = Ĥψ', color: '#C4956A',
    description: 'Formulates the behavior of quantum particles by describing how their wave functions evolve continuously over time. It serves as the mathematical foundation of non-relativistic quantum mechanics, enabling the prediction of probability densities for electrons in atoms, molecules, and solid-state materials.',
    realWorldApps: 'Quantum computing, semiconductors, and nanotechnology.',
    variables: [{ symbol: 'ψ', def: 'Wave function — quantum probability amplitude' }, { symbol: 'ℏ', def: 'Reduced Planck constant ≈ 1.055 × 10⁻³⁴ J·s' }, { symbol: 'Ĥ', def: 'Hamiltonian operator — total system energy' }],
    Simulator: SimpleSimulator },
  { id: 'uncertainty', branch: 'quantum', name: 'Heisenberg Uncertainty', formula: 'σₓ σₚ ≥ ℏ/2', color: '#C4956A',
    description: 'States that certain pairs of physical properties, such as a particle\'s position and momentum, cannot be simultaneously measured with arbitrary precision. This fundamental limit is not a limitation of instruments, but an intrinsic property of all quantum systems.',
    realWorldApps: 'Scanning tunneling microscopes, laser physics, and particle colliders.',
    variables: [{ symbol: 'σₓ', def: 'Standard deviation in position' }, { symbol: 'σₚ', def: 'Standard deviation in momentum' }, { symbol: 'ℏ', def: 'Reduced Planck constant' }],
    Simulator: SimpleSimulator },
  { id: 'wave', branch: 'classical', name: 'Wave Equation', formula: '∂²u/∂t² = c² ∇²u', color: '#88C0B8',
    description: 'A second-order partial differential equation that governs the propagation of mechanical and electromagnetic waves through a medium. It mathematically represents how disturbances travel over time, describing phenomena like sound waves, vibrating violin strings, and seismic waves.',
    realWorldApps: 'Acoustics, musical instruments, seismic studies, and oceanography.',
    variables: [{ symbol: 'u', def: 'Displacement field u(x,t)' }, { symbol: 'c', def: 'Phase velocity of wave propagation' }, { symbol: '∇²', def: 'Laplacian spatial operator' }],
    Simulator: SimpleSimulator },
  { id: 'newton', branch: 'classical', name: 'Newton\'s Second Law', formula: 'F = ma', color: '#88C0B8',
    description: 'Defines classical dynamics by stating that the acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass. It forms the core foundation of classical mechanics, governing everyday motion from falling apples to orbiting satellites.',
    realWorldApps: 'Rocket propulsion, automotive engineering, structural design, and sports biomechanics.',
    variables: [{ symbol: 'F', def: 'Net force vector (N)' }, { symbol: 'm', def: 'Inertial mass (kg)' }, { symbol: 'a', def: 'Acceleration vector (m/s²)' }],
    Simulator: SimpleSimulator },
  { id: 'heat', branch: 'thermo', name: 'Heat Equation', formula: '∂T/∂t = α ∇²T', color: '#E07840',
    description: 'Describes how thermal energy diffuses through a given region over time, smoothing out temperature gradients. It represents a fundamental transport equation in thermodynamics, explaining heat conduction in solids, fluid thermal dissipation, and geological cooling processes.',
    realWorldApps: 'Metallurgy, climate modeling, electronics cooling, and geophysics.',
    variables: [{ symbol: 'T', def: 'Temperature scalar field T(x,t)' }, { symbol: 'α', def: 'Thermal diffusivity constant' }, { symbol: '∇²T', def: 'Spatial curvature of temperature' }],
    Simulator: SimpleSimulator },
  { id: 'entropy', branch: 'thermo', name: 'Entropy — Second Law', formula: 'dS ≥ dQ/T', color: '#E07840',
    description: 'Formulates the second law of thermodynamics by stating that the total entropy of an isolated system always increases over time, approaching a state of maximum disorder. It establishes the direction of thermodynamic processes, defining the irreversible arrow of time in physical systems.',
    realWorldApps: 'Steam turbines, refrigeration, chemical engineering, and cosmology.',
    variables: [{ symbol: 'S', def: 'Thermodynamic entropy (J/K)' }, { symbol: 'Q', def: 'Heat transferred to system' }, { symbol: 'T', def: 'Absolute temperature (K)' }],
    Simulator: SimpleSimulator },
  { id: 'navier', branch: 'fluid', name: 'Navier–Stokes', formula: 'ρ(∂u/∂t + u·∇u) = −∇p + μ∇²u', color: '#88C0B8',
    description: 'Applies Newton\'s second law to fluid motion, describing how velocity, pressure, temperature, and density are related in a moving viscous fluid. These equations are crucial for simulating atmospheric weather patterns, ocean currents, aerodynamics of aircraft, and pipe flow dynamics.',
    realWorldApps: 'Aerodynamics, weather forecasting, pipe network design, and ocean currents.',
    variables: [{ symbol: 'u', def: 'Velocity vector field' }, { symbol: 'ρ', def: 'Fluid density' }, { symbol: 'p', def: 'Pressure gradient' }, { symbol: 'μ', def: 'Dynamic viscosity' }],
    Simulator: SimpleSimulator },
  { id: 'continuity', branch: 'fluid', name: 'Continuity Equation', formula: '∂ρ/∂t + ∇·(ρu) = 0', color: '#88C0B8',
    description: 'Expresses the fundamental principle of mass conservation in fluid dynamics, stating that the rate of mass entering a system must equal the rate of mass leaving it. It dictates how fluid velocity must increase when flowing through a constricted pipe or channel to maintain steady flow.',
    realWorldApps: 'Hydraulic systems, blood flow analysis, aerodynamics, and chemical reactors.',
    variables: [{ symbol: 'ρ', def: 'Fluid density field' }, { symbol: 'u', def: 'Velocity vector field' }],
    Simulator: SimpleSimulator },
  { id: 'maxwell1', branch: 'em', name: 'Maxwell — Gauss\'s Law', formula: '∇·E = ρ/ε₀', color: '#A09CC8',
    description: 'Gauss\'s law for electricity states that the net electric flux outward through any closed surface is proportional to the total electric charge enclosed within that surface. It describes how electric charges produce electric fields, forming one of the four cornerstone Maxwell\'s equations.',
    realWorldApps: 'Capacitor design, electrostatic precipitators, and field shielding.',
    variables: [{ symbol: 'E', def: 'Electric field vector' }, { symbol: 'ρ', def: 'Charge density (C/m³)' }, { symbol: 'ε₀', def: 'Permittivity of free space' }],
    Simulator: SimpleSimulator },
  { id: 'faraday', branch: 'em', name: 'Faraday\'s Law', formula: '∇×E = −∂B/∂t', color: '#A09CC8',
    description: 'Faraday\'s law of induction states that a time-varying magnetic field induces a circulating electromotive force and electric field. This fundamental electromagnetic principle is the operational basis for electrical generators, transformers, induction motors, and wireless power transfer.',
    realWorldApps: 'Electric generators, transformers, induction stovetops, and wireless charging.',
    variables: [{ symbol: 'E', def: 'Electric field' }, { symbol: 'B', def: 'Magnetic flux density' }],
    Simulator: SimpleSimulator },
  { id: 'lorentz', branch: 'relativity', name: 'Lorentz Factor', formula: 'γ = 1/√(1−v²/c²)', color: '#C4956A',
    description: 'Calculates the relativistic factor by which time dilates, length contracts, and relativistic mass increases for an object moving relative to an observer. It is a cornerstone of Einstein\'s special relativity, showing that physical measurements of space and time depend on the relative speed.',
    realWorldApps: 'GPS satellite clock calibration, cosmic ray detection, and particle accelerators.',
    variables: [{ symbol: 'γ', def: 'Lorentz factor' }, { symbol: 'v', def: 'Relative velocity' }, { symbol: 'c', def: 'Speed of light ≈ 3×10⁸ m/s' }],
    Simulator: SimpleSimulator },
  { id: 'einstein', branch: 'relativity', name: 'Mass–Energy Equivalence', formula: 'E = mc²', color: '#C4956A',
    description: 'States that rest mass and energy are directly equivalent and interchangeable, related by the square of the speed of light. This famous formula underpins nuclear physics, explaining the massive energy released during nuclear fission in reactors and stellar fusion in the core of stars.',
    realWorldApps: 'Nuclear power plants, solar radiation energy source, and stellar physics.',
    variables: [{ symbol: 'E', def: 'Total rest energy (J)' }, { symbol: 'm', def: 'Rest mass (kg)' }, { symbol: 'c', def: 'Speed of light' }],
    Simulator: SimpleSimulator },
  { id: 'boltzmann', branch: 'statistical', name: 'Boltzmann Distribution', formula: 'P ∝ e^(−E/k_BT)', color: '#E07840',
    description: 'Expresses the probability that a thermodynamic system will occupy a specific microstate as a function of that state\'s energy and the system\'s absolute temperature. It forms the foundation of statistical mechanics, bridging microscopic particle energy levels to macroscopic thermodynamic properties.',
    realWorldApps: 'Semiconductor carrier concentration, gas kinetics, and astrophysics.',
    variables: [{ symbol: 'P', def: 'Probability of state' }, { symbol: 'E', def: 'Energy of the state' }, { symbol: 'k_B', def: 'Boltzmann constant ≈ 1.38×10⁻²³ J/K' }],
    Simulator: SimpleSimulator },
  { id: 'projectile', branch: 'classical', name: 'Projectile Motion', formula: "y = v₀t sinθ − ½gt²\nR = (v₀² sin(2θ))/g\nH = (v₀² sin²θ)/(2g)", color: '#88C0B8',
    description: 'Analyzes the trajectory of an object launched into the air at a given angle and velocity. It decomposes motion into independent horizontal and vertical components, where only vertical motion is influenced by gravitational acceleration. This framework predicts the range, maximum height, and time of flight for any projectile.',
    realWorldApps: 'Sports analytics (basketball, football), ballistic trajectory calculation, fireworks displays, and long jump training.',
    variables: [{ symbol: 'v₀', def: 'Initial launch velocity (m/s)' }, { symbol: 'θ', def: 'Launch angle from horizontal' }, { symbol: 'g', def: 'Gravitational acceleration ≈ 9.81 m/s²' }, { symbol: 't', def: 'Time elapsed (s)' }],
    Simulator: SimpleSimulator },
  { id: 'energy', branch: 'classical', name: 'Conservation of Energy', formula: 'KE + PE = E_total', color: '#88C0B8',
    description: 'States that the total mechanical energy of an isolated system remains constant, with energy only converting between kinetic and potential forms. As an object falls from height, its potential energy transforms into kinetic energy while the sum is preserved throughout the motion.',
    realWorldApps: 'Roller coaster design, hydroelectric power generation, bungee jumping safety calculations, and ski jump engineering.',
    variables: [{ symbol: 'KE', def: 'Kinetic energy = ½mv² (J)' }, { symbol: 'PE', def: 'Potential energy = mgh (J)' }, { symbol: 'E', def: 'Total mechanical energy (J)' }],
    Simulator: SimpleSimulator },
  { id: 'momentum', branch: 'classical', name: 'Momentum', formula: 'p = mv', color: '#88C0B8',
    description: 'Defines the quantity of motion of a moving body, measured as the product of its mass and velocity. In isolated systems, total momentum is conserved during collisions, enabling prediction of post-collision velocities for elastic and inelastic impacts.',
    realWorldApps: 'Car crash analysis, billiards physics, rocket propulsion, and Newton\'s cradle.',
    variables: [{ symbol: 'p', def: 'Linear momentum (kg·m/s)' }, { symbol: 'm', def: 'Mass (kg)' }, { symbol: 'v', def: 'Velocity (m/s)' }],
    Simulator: SimpleSimulator },
  { id: 'circular', branch: 'classical', name: 'Circular Motion', formula: 'F = mv²/r', color: '#88C0B8',
    description: 'Describes the centripetal force required to maintain an object moving along a circular path at constant speed. The force always points radially inward toward the center of the circle, and its magnitude depends on the object\'s mass, speed, and the radius of the circular path.',
    realWorldApps: 'Satellite orbits, car cornering physics, centrifuge design, and amusement park rides.',
    variables: [{ symbol: 'F', def: 'Centripetal force (N)' }, { symbol: 'm', def: 'Mass (kg)' }, { symbol: 'v', def: 'Tangential velocity (m/s)' }, { symbol: 'r', def: 'Radius of circular path (m)' }],
    Simulator: SimpleSimulator },
  { id: 'gravitation', branch: 'classical', name: 'Universal Gravitation', formula: 'F = Gm₁m₂/r²', color: '#88C0B8',
    description: 'Newton\'s law of universal gravitation states that every particle attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of the distance between them. It explains planetary orbits, tidal forces, and weight.',
    realWorldApps: 'Space mission planning, satellite trajectories, tidal predictions, and weight calculations on other planets.',
    variables: [{ symbol: 'G', def: 'Gravitational constant ≈ 6.674×10⁻¹¹ N·m²/kg²' }, { symbol: 'm₁,m₂', def: 'Masses of the two bodies' }, { symbol: 'r', def: 'Distance between centers' }],
    Simulator: SimpleSimulator },
  { id: 'bernoulli', branch: 'fluid', name: 'Bernoulli Equation', formula: 'P + ½ρv² + ρgh = const', color: '#88C0B8',
    description: 'Describes the conservation of energy in a flowing fluid, relating pressure, velocity, and elevation. As fluid speeds up (e.g., through a constriction), its static pressure decreases, and vice versa. This principle is fundamental to understanding lift, flow meters, and pipe dynamics.',
    realWorldApps: 'Airplane lift generation, venturi meters, carburetors, pitot tubes, and water tower pressure.',
    variables: [{ symbol: 'P', def: 'Static pressure (Pa)' }, { symbol: 'ρ', def: 'Fluid density (kg/m³)' }, { symbol: 'v', def: 'Flow velocity (m/s)' }, { symbol: 'h', def: 'Elevation height (m)' }],
    Simulator: SimpleSimulator },
  { id: 'reynolds_num', branch: 'fluid', name: 'Reynolds Number', formula: 'Re = ρvL/μ', color: '#88C0B8',
    description: 'A dimensionless quantity that predicts whether fluid flow will be laminar (smooth, orderly) or turbulent (chaotic, mixing). Below ~2300, flow is laminar; above ~4000, it is fully turbulent. The transition regime lies between these values and is highly sensitive to disturbances.',
    realWorldApps: 'Pipe system design, aircraft aerodynamics, blood flow analysis, industrial mixing, and weather modeling.',
    variables: [{ symbol: 'Re', def: 'Reynolds number (dimensionless)' }, { symbol: 'ρ', def: 'Fluid density (kg/m³)' }, { symbol: 'v', def: 'Flow velocity (m/s)' }, { symbol: 'L', def: 'Characteristic length (m)' }, { symbol: 'μ', def: 'Dynamic viscosity (Pa·s)' }],
    Simulator: SimpleSimulator },
  { id: 'coulomb', branch: 'em', name: 'Coulomb\'s Law', formula: 'F = kq₁q₂/r²', color: '#A09CC8',
    description: 'Quantifies the electrostatic force between two point charges. Like charges repel and opposite charges attract, with the force magnitude proportional to the product of charges and inversely proportional to the square of separation distance. It is the electrical analog of Newton\'s gravitational law.',
    realWorldApps: 'Electrostatic interactions in chemistry, crystal bonding, electroscope physics, and charge separation.',
    variables: [{ symbol: 'k', def: 'Coulomb constant ≈ 8.99×10⁹ N·m²/C²' }, { symbol: 'q₁,q₂', def: 'Electric charges (C)' }, { symbol: 'r', def: 'Separation distance (m)' }],
    Simulator: SimpleSimulator },
  { id: 'lorentzforce', branch: 'em', name: 'Lorentz Force', formula: 'F = qv × B', color: '#A09CC8',
    description: 'Describes the force experienced by a charged particle moving through a magnetic field. The force is always perpendicular to both the velocity and the magnetic field, causing the particle to follow a circular or helical trajectory. This is the basis for cyclotrons and mass spectrometers.',
    realWorldApps: 'Mass spectrometers, cyclotron particle accelerators, MRI machines, aurora borealis, and CRT displays.',
    variables: [{ symbol: 'F', def: 'Lorentz force (N)' }, { symbol: 'q', def: 'Particle charge (C)' }, { symbol: 'v', def: 'Particle velocity (m/s)' }, { symbol: 'B', def: 'Magnetic field strength (T)' }],
    Simulator: SimpleSimulator },
  { id: 'idealgas', branch: 'thermo', name: 'Ideal Gas Law', formula: 'PV = nRT', color: '#E07840',
    description: 'Relates the pressure, volume, temperature, and amount of an ideal gas. It combines Boyle\'s, Charles\'s, and Avogadro\'s laws into a single equation of state. While real gases deviate at high pressures or low temperatures, it provides excellent predictions for most practical conditions.',
    realWorldApps: 'Weather balloon behavior, scuba diving gas calculations, internal combustion engines, tire pressure changes, and altitude sickness.',
    variables: [{ symbol: 'P', def: 'Gas pressure (Pa)' }, { symbol: 'V', def: 'Volume (m³)' }, { symbol: 'n', def: 'Amount of substance (mol)' }, { symbol: 'R', def: 'Gas constant = 8.314 J/(mol·K)' }, { symbol: 'T', def: 'Absolute temperature (K)' }],
    Simulator: SimpleSimulator },
  { id: 'hooke', branch: 'classical', name: "Hooke's Law", formula: 'F = −kx', color: '#88C0B8',
    description: 'States that the force needed to extend or compress a spring by some distance is proportional to that distance. The restoring force always acts in the opposite direction to the displacement, making it the foundation of elasticity and the starting point for understanding oscillatory systems.',
    realWorldApps: 'Shock absorbers, spring scales, mattress design, trampoline engineering, and suspension bridges.',
    variables: [{ symbol: 'F', def: 'Restoring force (N)' }, { symbol: 'k', def: 'Spring constant (N/m)' }, { symbol: 'x', def: 'Displacement from equilibrium (m)' }],
    Simulator: SimpleSimulator },
  { id: 'shm', branch: 'classical', name: 'Simple Harmonic Motion', formula: 'x = A cos(ωt + φ)', color: '#88C0B8',
    description: 'Describes the repetitive back-and-forth motion of a system about an equilibrium position, where the restoring force is directly proportional to displacement. The motion is perfectly sinusoidal, with a period that depends only on the system parameters, not the amplitude.',
    realWorldApps: 'Clock pendulums, tuning forks, seismographs, molecular vibrations, and playground swings.',
    variables: [{ symbol: 'A', def: 'Amplitude — maximum displacement (m)' }, { symbol: 'ω', def: 'Angular frequency = 2πf (rad/s)' }, { symbol: 'φ', def: 'Phase constant (rad)' }, { symbol: 't', def: 'Time (s)' }],
    Simulator: SimpleSimulator },
  { id: 'ohm', branch: 'em', name: "Ohm's Law", formula: 'V = IR', color: '#A09CC8',
    description: 'States that the electric current flowing through a conductor between two points is directly proportional to the voltage across the two points and inversely proportional to the resistance. It is the most fundamental law of circuit analysis, governing everything from simple LED circuits to complex power grids.',
    realWorldApps: 'Circuit design, LED resistor calculation, household wiring, battery systems, and multimeter operation.',
    variables: [{ symbol: 'V', def: 'Voltage / potential difference (V)' }, { symbol: 'I', def: 'Electric current (A)' }, { symbol: 'R', def: 'Electrical resistance (Ω)' }],
    Simulator: SimpleSimulator },
  { id: 'debroglie', branch: 'quantum', name: 'de Broglie Wavelength', formula: 'λ = h/p = h/(mv)', color: '#C4956A',
    description: 'Proposes that every particle with momentum has an associated wavelength, establishing the wave–particle duality of matter. For subatomic particles like electrons, this wavelength is significant and experimentally measurable through diffraction, while for macroscopic objects it is immeasurably small.',
    realWorldApps: 'Electron microscopy, neutron diffraction, semiconductor band theory, and quantum tunneling applications.',
    variables: [{ symbol: 'λ', def: 'de Broglie wavelength (m)' }, { symbol: 'h', def: 'Planck constant ≈ 6.626 × 10⁻³⁴ J·s' }, { symbol: 'p', def: 'Momentum = mv (kg·m/s)' }],
    Simulator: SimpleSimulator },
  { id: 'photoelectric', branch: 'quantum', name: 'Photoelectric Effect', formula: 'KE = hf − φ', color: '#C4956A',
    description: 'Explains that when light of sufficient frequency strikes a metal surface, it ejects electrons with kinetic energy equal to the photon energy minus the metal\'s work function. Below the threshold frequency, no electrons are emitted regardless of light intensity — proving the quantized particle nature of light.',
    realWorldApps: 'Solar cells, photomultiplier tubes, camera sensors, night vision devices, and automatic doors.',
    variables: [{ symbol: 'KE', def: 'Kinetic energy of emitted electron (J or eV)' }, { symbol: 'h', def: 'Planck constant' }, { symbol: 'f', def: 'Frequency of incident light (Hz)' }, { symbol: 'φ', def: 'Work function of the metal (eV)' }],
    Simulator: SimpleSimulator },
  { id: 'rc_circuit', branch: 'em', name: 'RC Circuit Charging', formula: 'V_c(t) = V₀(1 − e^(−t/RC))', color: '#A09CC8',
    description: 'Governs the charging behavior of a resistor-capacitor circuit, describing how the capacitor voltage increases exponentially towards the source voltage over time. The rate of charging is determined by the circuit time constant τ = RC, which represents the time required for the capacitor to charge to approximately 63.2% of its maximum value.',
    realWorldApps: 'Electronic timers, noise filters, power supply smoothing, and camera flash units.',
    variables: [{ symbol: 'V_c(t)', def: 'Capacitor voltage at time t (V)' }, { symbol: 'V₀', def: 'Source voltage (V)' }, { symbol: 'R', def: 'Resistance (Ω)' }, { symbol: 'C', def: 'Capacitance (F)' }, { symbol: 't', def: 'Time elapsed (s)' }],
    Simulator: SimpleSimulator },
]

// ══════════════════════════
//  FLOATING ORB ANIMATION
// ══════════════════════════
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 350, x: '10%', y: '20%', color: 'rgba(196,149,106,0.025)', dur: 22, delay: 0 },
        { size: 280, x: '75%', y: '60%', color: 'rgba(136,192,184,0.02)', dur: 28, delay: -5 },
        { size: 200, x: '50%', y: '80%', color: 'rgba(224,120,64,0.015)', dur: 18, delay: -10 },
        { size: 320, x: '85%', y: '15%', color: 'rgba(160,156,200,0.02)', dur: 25, delay: -8 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  )
}

function CornerAnimations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {/* Top Left: Concentric Orbits / Radar / Astrolabe */}
      <div
        className="absolute top-10 left-10 opacity-30 flex items-center justify-center animate-fade-in-corner"
        style={{ width: '180px', height: '180px' }}
      >
        <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="#C4956A" strokeWidth="0.5">
          <circle cx="50" cy="50" r="45" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="35" strokeWidth="0.3" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="22" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="10" strokeDasharray="1 1" />
          <line x1="5" y1="50" x2="95" y2="50" strokeDasharray="2 2" strokeWidth="0.3" />
          <line x1="50" y1="5" x2="50" y2="95" strokeDasharray="2 2" strokeWidth="0.3" />
          <g
            style={{ transformOrigin: '50px 50px' }}
            className="animate-spin-clockwise"
          >
            <line x1="50" y1="50" x2="85" y2="15" strokeWidth="0.8" />
            <circle cx="85" cy="15" r="2.5" fill="#C4956A" />
            <line x1="50" y1="50" x2="15" y2="85" strokeWidth="0.4" />
          </g>
          <g
            style={{ transformOrigin: '50px 50px' }}
            className="animate-spin-counterclockwise"
          >
            <circle cx="50" cy="15" r="1.5" fill="#88C0B8" stroke="none" />
            <circle cx="50" cy="85" r="1.5" fill="#88C0B8" stroke="none" />
            <path d="M 50 15 A 35 35 0 0 1 85 50" stroke="#88C0B8" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        </svg>
      </div>

      {/* Top Right: Fourier/Wave Oscilloscope */}
      <div
        className="absolute top-10 right-10 opacity-30 flex items-center justify-center animate-fade-in-corner"
        style={{ width: '180px', height: '180px' }}
      >
        <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="#88C0B8" strokeWidth="0.5">
          <path d="M10,10 H90 V90 H10 Z" strokeWidth="0.3" strokeDasharray="1 4" />
          <line x1="10" y1="50" x2="90" y2="50" strokeWidth="0.4" strokeDasharray="3 3" />
          <line x1="50" y1="10" x2="50" y2="90" strokeWidth="0.4" strokeDasharray="3 3" />
          <path
            d="M 10 50 Q 25 30 40 50 T 70 50 T 90 50"
            stroke="#88C0B8"
            strokeWidth="0.8"
          />
          <path
            d="M 10 50 C 25 70 35 30 50 50 C 65 70 75 30 90 50"
            stroke="#C4956A"
            strokeWidth="0.6"
          />
          <circle
            cx="50" cy="50" r="30"
            stroke="rgba(224,120,64,0.15)"
            strokeDasharray="2 5"
            style={{ transformOrigin: '50px 50px' }}
            className="animate-spin-clockwise-fast"
          />
        </svg>
      </div>
    </div>
  )
}

const GRAPH_METADATA = {
  schrodinger: {
    title: "Quantum Wave Probability Density",
    xAxis: "Position (x)",
    yAxis: "Probability Density |ψ(x)|²",
    units: "Position: arbitrary, Probability: dimensionless",
    explanation: "Visualizes the spatial probability distribution of a particle in an infinite potential well under a superposed quantum state.",
    simInfo: { currentState: "Particle confined in a 1D infinite potential well", interpretation: "The peaks show where the particle is most likely found. In superposition states, the wave function oscillates between different spatial distributions, illustrating quantum interference." }
  },
  uncertainty: {
    title: "Heisenberg Wavepacket Widths",
    xAxis: "Position (x) / Momentum (p)",
    yAxis: "Wave Intensity / Probability",
    units: "Position: meters (m), Momentum: kg·m/s",
    explanation: "Demonstrates the reciprocal relationship between positional localization and momentum spread; narrow wavepackets in position correspond to broad momentum spreads.",
    simInfo: { currentState: "Gaussian wavepackets in position and momentum space", interpretation: "As you narrow the position wavepacket, the momentum wavepacket broadens — and vice versa. This is the fundamental uncertainty principle: σₓ·σₚ ≥ ℏ/2." }
  },
  wave: {
    title: "1D String Vibration Harmonic Modes",
    xAxis: "Position along String (x)",
    yAxis: "Displacement (y)",
    units: "Length: meters (m), Displacement: pixels (px)",
    explanation: "Shows the spatial standing wave patterns of a vibrating string under tension at a selected harmonic mode.",
    simInfo: { currentState: "Standing wave at selected harmonic mode", interpretation: "Higher harmonics have more nodes (zero-displacement points). The wave speed c and string length L determine the allowed frequencies: fₙ = nc/(2L)." }
  },
  newton: {
    title: "Inertial Mass Acceleration Motion",
    xAxis: "Time (t)",
    yAxis: "Displacement (x)",
    units: "Time: seconds (s), Displacement: meters (m)",
    explanation: "Simulates the constant acceleration of a mass block subjected to a continuous applied force on a frictionless track.",
    simInfo: { currentState: "Mass accelerating under constant applied force", interpretation: "The block accelerates proportionally to force and inversely to mass. Doubling force doubles acceleration; doubling mass halves it." }
  },
  heat: {
    title: "1D Heat Diffusion Profile",
    xAxis: "Spatial Domain (x)",
    yAxis: "Temperature (T)",
    units: "Domain: dimensionless, Temperature: Kelvin (K)",
    explanation: "Visualizes the smoothing and flattening of a localized temperature peak over time through thermal diffusion.",
    simInfo: { currentState: "Temperature profile evolving via thermal diffusion", interpretation: "Heat flows from hot to cold regions. Higher thermal diffusivity (α) causes faster spreading. The initial peak flattens over time as the system approaches thermal equilibrium." }
  },
  entropy: {
    title: "Gas Particle Microstates and Disorder",
    xAxis: "Container Width (x)",
    yAxis: "Container Height (y)",
    units: "Dimensions: arbitrary, Entropy: Joules/Kelvin (J/K)",
    explanation: "Illustrates particle dispersal in a thermodynamic system, showing the progression toward maximum entropy and chaotic equilibrium.",
    simInfo: { currentState: "Gas particles dispersing toward maximum entropy", interpretation: "Particles naturally spread to occupy all available space. Entropy increases as the system explores more microstates — this is the thermodynamic arrow of time." }
  },
  navier: {
    title: "Viscous Fluid Flow & Velocity Fields",
    xAxis: "Horizontal Position (x)",
    yAxis: "Vertical Velocity Profile (v_y)",
    units: "Position: meters (m), Velocity: m/s",
    explanation: "Visualizes the velocity boundary layer profiles of a viscous fluid flowing through a narrow channel under shear stress.",
    simInfo: { currentState: "Viscous flow developing a parabolic velocity profile", interpretation: "Fluid at the wall has zero velocity (no-slip condition). Maximum velocity occurs at the channel center. Higher viscosity creates a flatter, slower profile." }
  },
  continuity: {
    title: "Fluid Continuity in Constricted Pipe",
    xAxis: "Length along Pipe (x)",
    yAxis: "Inlet and Outlet Velocity Vectors",
    units: "Length: meters (m), Velocity: m/s",
    explanation: "Demonstrates mass conservation in fluid dynamics where narrowing the pipe cross-section accelerates flow velocity proportionately.",
    simInfo: { currentState: "Incompressible fluid through a variable-width channel", interpretation: "When the pipe narrows, fluid must speed up to conserve mass flow rate: A₁v₁ = A₂v₂. Halving the area doubles the velocity." }
  },
  maxwell1: {
    title: "Electrostatic Field Divergence",
    xAxis: "Radial Distance (r)",
    yAxis: "Electric Field Intensity (E)",
    units: "Distance: meters (m), Electric Field: N/C",
    explanation: "Visualizes the radiating electric field lines surrounding a point charge, illustrating how flux density falls off with distance.",
    simInfo: { currentState: "Electric field radiating from a point charge", interpretation: "Field strength falls off as 1/r². The total flux through any closed surface enclosing the charge equals Q/ε₀ — regardless of surface shape." }
  },
  faraday: {
    title: "Induced Electromotive Force (EMF) Cycle",
    xAxis: "Time (t)",
    yAxis: "Magnetic Flux (Φ) vs Induced EMF (V)",
    units: "Time: seconds (s), EMF: Volts (V), Flux: Webers (Wb)",
    explanation: "Simulates a rotating magnet creating a time-varying magnetic field to induce a sinusoidal alternating electric current.",
    simInfo: { currentState: "Time-varying magnetic flux inducing EMF", interpretation: "The induced EMF is proportional to the rate of change of magnetic flux. When flux changes fastest (zero crossings), EMF peaks. This is how generators convert mechanical rotation to electricity." }
  },
  lorentz: {
    title: "Relativistic Time Dilation & Contraction",
    xAxis: "Relative Velocity (v/c)",
    yAxis: "Lorentz Dilation Factor (γ)",
    units: "Velocity: fraction of c, Factor: dimensionless",
    explanation: "Plots the exponential rise in the Lorentz factor as relative speed approaches the speed of light, showing key relativistic limits.",
    simInfo: { currentState: "Lorentz factor γ vs relative velocity", interpretation: "At low speeds, γ ≈ 1 (classical regime). As v approaches c, γ diverges to infinity — time slows, lengths contract, and mass increases without bound. No massive object can reach c." }
  },
  einstein: {
    title: "Mass to Energy Conversion Sandbox",
    xAxis: "Mass Conversion Scale (m)",
    yAxis: "Equivalent Rest Energy (E)",
    units: "Mass: kilograms (kg), Energy: Joules (J)",
    explanation: "Visualizes the conversion of rest mass into electromagnetic energy burst radiation according to E = mc².",
    simInfo: { currentState: "Rest mass converting to electromagnetic energy", interpretation: "Even a tiny mass contains enormous energy due to c² ≈ 9×10¹⁶. One kilogram of matter, if fully converted, releases ~90 petajoules — equivalent to a 21-megaton nuclear explosion." }
  },
  boltzmann: {
    title: "Boltzmann Thermal State Distribution",
    xAxis: "State Energy Level (E)",
    yAxis: "Occupancy Probability P(E)",
    units: "Energy: arbitrary, Probability: dimensionless",
    explanation: "Plots the exponential probability distribution of system states at thermal equilibrium for a given absolute temperature.",
    simInfo: { currentState: "Thermal probability distribution across energy states", interpretation: "Lower energy states are exponentially more probable. Higher temperature flattens the distribution, populating higher energy states. At T→0, only the ground state is occupied." }
  },
  projectile: {
    title: "Projectile Trajectory Arc",
    xAxis: "Horizontal Distance (m)",
    yAxis: "Vertical Height (m)",
    units: "Distance: meters (m), Time: seconds (s)",
    explanation: "Traces the parabolic trajectory of a launched projectile under gravitational acceleration, showing range and maximum height.",
    simInfo: { currentState: "Projectile tracing a parabolic arc under gravity", interpretation: "Horizontal motion is uniform (no air resistance), while vertical motion decelerates upward and accelerates downward. Maximum range occurs at 45° launch angle." }
  },
  energy: {
    title: "Kinetic ↔ Potential Energy Transfer",
    xAxis: "Position along Ramp",
    yAxis: "Energy (J)",
    units: "Energy: Joules (J), Height: meters (m)",
    explanation: "Visualizes the continuous conversion between kinetic and potential energy as a mass slides along an inclined ramp.",
    simInfo: { currentState: "Mass sliding on a frictionless ramp", interpretation: "At the top, energy is all potential (mgh). At the bottom, it's all kinetic (½mv²). The total mechanical energy remains constant throughout — energy is only transformed, never created or destroyed." }
  },
  momentum: {
    title: "Elastic Collision Momentum Transfer",
    xAxis: "Position (x)",
    yAxis: "Collision Dynamics",
    units: "Mass: kg, Velocity: m/s, Momentum: kg·m/s",
    explanation: "Simulates a 1D elastic collision between two masses, demonstrating conservation of total momentum before and after impact.",
    simInfo: { currentState: "Two masses approaching and colliding elastically", interpretation: "Total momentum p₁+p₂ is identical before and after collision. In elastic collisions, kinetic energy is also conserved. Heavier objects transfer more momentum per collision." }
  },
  circular: {
    title: "Uniform Circular Motion Track",
    xAxis: "Position (x)",
    yAxis: "Position (y)",
    units: "Force: Newtons (N), Velocity: m/s, Radius: m",
    explanation: "Visualizes an object moving along a circular path with a centripetal force vector always pointing toward the center.",
    simInfo: { currentState: "Object in uniform circular motion with centripetal force", interpretation: "The centripetal force always points radially inward. If this force vanishes, the object flies off tangentially. Higher speed or smaller radius requires stronger centripetal force." }
  },
  gravitation: {
    title: "Gravitational Field & Orbital Motion",
    xAxis: "Radial Distance",
    yAxis: "Gravitational Force",
    units: "Force: Newtons (N), Distance: ×10⁶ m, Mass: ×10²⁴ kg",
    explanation: "Simulates the gravitational interaction between two bodies with field lines and orbital dynamics.",
    simInfo: { currentState: "Two-body gravitational interaction with orbital motion", interpretation: "Gravitational force follows an inverse-square law: doubling the distance reduces force to one quarter. Stable orbits form when gravitational pull exactly provides the centripetal acceleration needed." }
  },
  bernoulli: {
    title: "Bernoulli Pressure-Velocity in Pipe",
    xAxis: "Length along Pipe (x)",
    yAxis: "Pressure (Pa) & Velocity (m/s)",
    units: "Pressure: Pascals (Pa), Velocity: m/s",
    explanation: "Demonstrates how fluid velocity increases and pressure decreases in a constricted pipe section according to Bernoulli's principle.",
    simInfo: { currentState: "Fluid flowing through a variable-width pipe", interpretation: "Where the pipe narrows, velocity increases and pressure drops (Bernoulli effect). This creates lift on airplane wings and draws fluid through spray bottles." }
  },
  reynolds_num: {
    title: "Laminar vs Turbulent Flow Visualization",
    xAxis: "Flow Direction (x)",
    yAxis: "Flow Pattern",
    units: "Reynolds Number: dimensionless",
    explanation: "Visualizes the transition from smooth laminar flow to chaotic turbulent flow as Reynolds number increases past the critical value.",
    simInfo: { currentState: "Flow pattern at current Reynolds number", interpretation: "Below Re ≈ 2300, flow is smooth and laminar. Above Re ≈ 4000, chaotic vortices dominate (turbulent). The transition depends on velocity, pipe size, and fluid viscosity." }
  },
  coulomb: {
    title: "Electrostatic Force Between Charges",
    xAxis: "Separation Distance (m)",
    yAxis: "Electrostatic Force (N)",
    units: "Force: Newtons (N), Charge: microcoulombs (μC)",
    explanation: "Visualizes the attractive or repulsive electrostatic force between two point charges with electric field lines.",
    simInfo: { currentState: "Electrostatic interaction between two point charges", interpretation: "Like charges repel, opposite charges attract. Force follows an inverse-square law identical in form to gravity, but ~10³⁶ times stronger for elementary particles." }
  },
  lorentzforce: {
    title: "Charged Particle in Magnetic Field",
    xAxis: "Position (x)",
    yAxis: "Position (y)",
    units: "Force: Newtons (N), Radius: μm, Field: Tesla (T)",
    explanation: "Shows a charged particle spiraling in a uniform magnetic field (into the page), demonstrating the Lorentz force creating circular orbits.",
    simInfo: { currentState: "Charged particle spiraling in a uniform magnetic field", interpretation: "The magnetic force is always perpendicular to velocity, so it changes direction but not speed. This creates circular or helical orbits whose radius depends on mass, charge, speed, and field strength." }
  },
  idealgas: {
    title: "Ideal Gas Particle Dynamics",
    xAxis: "Container Width",
    yAxis: "Container Height",
    units: "Pressure: kPa, Volume: m³, Temperature: Kelvin (K)",
    explanation: "Simulates gas molecules bouncing inside a container, with particle speed and container size reflecting temperature and volume changes.",
    simInfo: { currentState: "Gas molecules in thermal equilibrium within a container", interpretation: "Temperature determines average molecular speed. Pressure arises from molecular collisions with container walls. Reducing volume (at constant T) increases collision frequency, raising pressure." }
  },
  hooke: {
    title: "Spring-Mass Oscillation System",
    xAxis: "Time (s)",
    yAxis: "Displacement (m)",
    units: "Force: Newtons (N), Displacement: meters (m)",
    explanation: "Visualizes a spring-mass system oscillating about equilibrium with force vectors and a real-time position-time graph.",
    simInfo: { currentState: "Mass oscillating on a spring with restoring force", interpretation: "The spring force always opposes displacement — stretching produces a pulling force, compression produces a pushing force. This linear restoring force produces simple harmonic motion." }
  },
  shm: {
    title: "Simple Harmonic Motion — Pendulum & Waveform",
    xAxis: "Time (s)",
    yAxis: "Position x(t) (m)",
    units: "Amplitude: meters (m), Frequency: Hertz (Hz)",
    explanation: "Shows a pendulum swinging with a synchronized sinusoidal position-time graph, demonstrating the fundamental periodic motion.",
    simInfo: { currentState: "Pendulum oscillating with sinusoidal displacement", interpretation: "The motion is perfectly sinusoidal. Period depends only on length and gravity (not amplitude) for small angles. All SHM can be described by a single cosine function." }
  },
  ohm: {
    title: "Electric Circuit — Voltage, Current & Resistance",
    xAxis: "Circuit Position",
    yAxis: "Current Flow",
    units: "Voltage: Volts (V), Current: Amperes (A), Resistance: Ohms (Ω)",
    explanation: "Animates electron flow through a simple battery-resistor circuit, with speed proportional to current magnitude.",
    simInfo: { currentState: "Steady-state DC current flowing through a resistor", interpretation: "Higher voltage drives more current. Higher resistance impedes flow. Power dissipated as heat equals I²R. Electrons move slowly (drift velocity) but the electric field propagates at near light speed." }
  },
  debroglie: {
    title: "Matter Wave — de Broglie Wave Packet",
    xAxis: "Position (m)",
    yAxis: "Wave Amplitude",
    units: "Wavelength: meters (m), Momentum: kg·m/s",
    explanation: "Visualizes the quantum wave packet of a particle, showing how wavelength scales inversely with momentum.",
    simInfo: { currentState: "Quantum wave packet propagating in free space", interpretation: "Larger momentum means shorter wavelength. For electrons, the de Broglie wavelength is on the order of atomic dimensions (~0.1 nm), enabling electron diffraction and microscopy." }
  },
  photoelectric: {
    title: "Photoelectric Effect — Photon-Metal Interaction",
    xAxis: "Position",
    yAxis: "Energy",
    units: "Energy: electronvolts (eV), Frequency: Hertz (Hz)",
    explanation: "Simulates photons striking a metal surface. Above the threshold frequency, electrons are ejected; below it, no emission occurs regardless of intensity.",
    simInfo: { currentState: "Photons impacting a metal surface", interpretation: "Each photon carries energy E = hf. If hf > φ (work function), an electron is ejected with kinetic energy KE = hf - φ. This proved light behaves as discrete particles (photons), not just waves." }
  }
};

function EquationFullView({ equation, onClose, initialParams }) {
  const eq = equation
  const branchLabel = BRANCHES.find(b => b.id === eq.branch)?.label || eq.branch
  const [inputsEl, setInputsEl] = useState(null)
  const [resultsEl, setResultsEl] = useState(null)

  const hasMissingParams = initialParams && initialParams.paramDetails && 
    Object.values(initialParams.paramDetails).some(d => d.source === 'Missing');

  const metadata = GRAPH_METADATA[eq.id] || {
    title: "Simulation Graph Visualization",
    xAxis: "X-Axis",
    yAxis: "Y-Axis",
    units: "Arbitrary units",
    explanation: "Interactive simulation representing the physical system variables in real time."
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.01)',
    borderColor: 'rgba(196,149,106,0.35)',
    padding: '2.5rem',
  };

  return (
    <WorkspaceContext.Provider value={{ inputsTarget: inputsEl, resultsTarget: resultsEl }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full min-h-screen pb-32 relative pt-4"
        style={{ color: '#E8DDCC' }}
      >
        <div className="w-[90%] max-w-[1400px] mx-auto w-full flex flex-col gap-8">
          {/* 1. Top Left Exit Button — gold-accent outlined */}
          <div className="w-full flex justify-start">
            <button
              onClick={onClose}
              className="flex items-center gap-3 cursor-pointer font-mono tracking-widest uppercase text-xs font-bold animate-fade-in"
              style={{
                color: 'rgba(220,208,188,0.7)',
                transition: 'all 0.25s ease',
                padding: '8px 18px',
                borderRadius: '8px',
                border: `1px solid ${eq.color}35`,
                background: `${eq.color}08`,
                outline: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = eq.color
                e.currentTarget.style.borderColor = `${eq.color}60`
                e.currentTarget.style.background = `${eq.color}12`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(220,208,188,0.7)'
                e.currentTarget.style.borderColor = `${eq.color}35`
                e.currentTarget.style.background = `${eq.color}08`
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Exit Workspace
            </button>
          </div>

          {/* 2. Center Header */}
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{ color: eq.color, background: `${eq.color}14`, border: `1px solid ${eq.color}25` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: eq.color }} />
              {branchLabel}
            </span>
            <div className="h-4" />
            <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[#E8DDCC]">{eq.name}</h1>
          </div>

          {/* Row 1: Theory Section (Side by side cards with exactly 32px spacing) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Card: Meaning & Apps */}
            <div className="rounded-2xl border flex flex-col justify-between gap-8" style={cardStyle}>
              <div>
                <h3 className="text-xs font-mono tracking-widest text-[rgba(220,208,188,0.45)] uppercase mb-5 font-bold">Meaning of the Equation</h3>
                <p className="text-sm md:text-base opacity-85 font-body leading-relaxed">{eq.description}</p>
              </div>
              <div>
                <h3 className="text-xs font-mono tracking-widest text-[rgba(220,208,188,0.45)] uppercase mb-5 font-bold">Real-World Applications</h3>
                <ul className="flex flex-col gap-3 text-sm opacity-80 font-body">
                  {eq.realWorldApps ? eq.realWorldApps.split(',').map((app, i) => (
                    <li key={i} className="leading-relaxed flex items-start gap-2.5">
                      <span style={{ color: eq.color, fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                      <span>{app.trim()}</span>
                    </li>
                  )) : (
                    <li className="leading-relaxed flex items-start gap-2.5">
                      <span style={{ color: eq.color, fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                      <span>Advanced scientific research and simulation analysis.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Card: Formula & Variables */}
            <div className="rounded-2xl border flex flex-col gap-4" style={cardStyle}>
              <div>
                <h3 className="text-xs font-mono tracking-widest text-[rgba(220,208,188,0.45)] uppercase mb-3 font-bold">Formula</h3>
                <div className="flex justify-center py-4 px-6 rounded-xl border border-[rgba(196,149,106,0.15)]" style={{ background: `${eq.color}08` }}>
                  <span className="font-display text-2xl md:text-3xl font-bold tracking-wide" style={{ color: eq.color, whiteSpace: 'pre-line' }}>
                    {eq.formula}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-mono tracking-widest text-[rgba(220,208,188,0.45)] uppercase mb-3 font-bold">Variable Glossary</h3>
                <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {eq.variables.map(v => (
                    <div key={v.symbol} className="flex gap-3.5 items-center text-xs py-2.5 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                      <span className="font-display font-bold px-2 py-0.5 rounded text-center min-w-[28px] text-[11px]" style={{ background: `${eq.color}18`, color: eq.color, border: `1px solid ${eq.color}30` }}>
                        {v.symbol}
                      </span>
                      <span className="opacity-85 font-body leading-relaxed">{v.def}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Missing Parameters Warning Banner */}
          {hasMissingParams && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '20px 24px',
                borderRadius: '12px',
                background: 'rgba(224, 120, 64, 0.08)',
                border: '1px solid rgba(224, 120, 64, 0.3)',
                color: '#E07840',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: 500,
                marginTop: '8px'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span>
                <strong>Missing Parameters:</strong> Please enter the missing inputs in the Laboratory Inputs card below to calculate.
              </span>
            </motion.div>
          )}

          {/* Row 2: Inputs and Results Section (Exactly 32px spacing) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Laboratory Inputs Card */}
            <div className="flex flex-col gap-6 rounded-2xl border" style={cardStyle}>
              <h2 className="text-xl md:text-2xl font-bold font-display text-[#E8DDCC] border-b border-[rgba(255,255,255,0.05)] pb-4 mb-1">Laboratory Inputs</h2>
              <div ref={setInputsEl} className="flex flex-col gap-5">
                {/* Dynamic portal content (actual numeric fields with Calc buttons) */}
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="flex flex-col gap-6 rounded-2xl border" style={cardStyle}>
              <h2 className="text-xl md:text-2xl font-bold font-display text-[#E8DDCC] border-b border-[rgba(255,255,255,0.05)] pb-4 mb-1">Calculated Results</h2>
              <div ref={setResultsEl} className="flex flex-col gap-5">
                {/* Dynamic portal content (derived state variables with clear spacing) */}
              </div>
            </div>
          </div>

          {/* Row 3: Simulation Section */}
          <div className="w-full flex flex-col gap-6 rounded-2xl border animate-fade-in" style={{ ...cardStyle, background: 'rgba(255,255,255,0.005)' }}>
            {/* Simulation header */}
            <div className="border-b border-[rgba(196,149,106,0.15)] pb-5">
              <h2 className="text-xl md:text-2xl font-bold font-display text-[#E8DDCC] mb-3">{metadata.title}</h2>
              <p className="text-xs md:text-sm opacity-75 font-body leading-relaxed">{metadata.explanation}</p>
            </div>

            {/* Compact Simulation Info Bar */}
            <div className="flex flex-wrap gap-4 items-center px-5 py-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,149,106,0.08)' }}>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider" style={{ color: `${eq.color}AA` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: eq.color }} />
                <span>X: {metadata.xAxis}</span>
              </div>
              <span className="text-[rgba(220,208,188,0.15)]" style={{ fontSize: '10px' }}>│</span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#88C0B8AA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#88C0B8]" />
                <span>Y: {metadata.yAxis}</span>
              </div>
              <span className="text-[rgba(220,208,188,0.15)]" style={{ fontSize: '10px' }}>│</span>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[rgba(220,208,188,0.4)]">
                Units: {metadata.units}
              </div>
            </div>

            {/* Dynamic Simulation Info Panel */}
            {metadata.simInfo && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(196,149,106,0.1)', borderLeft: `3px solid ${eq.color}40` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: eq.color }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: `${eq.color}99` }}>Current State</span>
                  </div>
                  <p className="text-xs font-body leading-relaxed" style={{ color: 'rgba(232,221,204,0.7)' }}>{metadata.simInfo.currentState}</p>
                </div>
                <div className="flex-1 p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(136,192,184,0.1)', borderLeft: '3px solid rgba(136,192,184,0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#88C0B8]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#88C0B899]">Physical Interpretation</span>
                  </div>
                  <p className="text-xs font-body leading-relaxed" style={{ color: 'rgba(232,221,204,0.7)' }}>{metadata.simInfo.interpretation}</p>
                </div>
              </div>
            )}

            {eq.Simulator ? (
              <div className="w-full relative mt-1">
                {/* Y-Axis Label Annotation */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-[10px] font-mono text-[rgba(220,208,188,0.65)] uppercase tracking-wider bg-[rgba(20,18,16,0.9)] px-3 py-2 rounded-lg border border-[rgba(196,149,106,0.12)] pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#88C0B8]" />
                  <span>Y: {metadata.yAxis}</span>
                </div>

                {/* Scale/Units Annotation */}
                <div className="absolute top-4 right-4 z-20 text-[10px] font-mono text-[rgba(220,208,188,0.55)] uppercase tracking-wider bg-[rgba(20,18,16,0.9)] px-3 py-2 rounded-lg border border-[rgba(196,149,106,0.12)] pointer-events-none">
                  <span>{metadata.units}</span>
                </div>

                {/* Simulator Canvas */}
                <eq.Simulator equation={eq} inputsTarget={inputsEl} resultsTarget={resultsEl} initialParams={initialParams} />

                {/* X-Axis Label Annotation */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 text-[10px] font-mono text-[rgba(220,208,188,0.65)] uppercase tracking-wider bg-[rgba(20,18,16,0.9)] px-3 py-2 rounded-lg border border-[rgba(196,149,106,0.12)] pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: eq.color }} />
                  <span>X: {metadata.xAxis}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center border border-dashed border-[rgba(196,149,106,0.2)] rounded-xl p-12 w-full bg-[rgba(0,0,0,0.2)]">
                <span className="text-sm opacity-40 font-mono">WORKSPACE_ERR: NO_SIMULATOR_INSTANCE_FOUND</span>
              </div>
            )}
          </div>

          {/* Row 4: Scientific Interpretation */}
          <div className="rounded-2xl border" style={cardStyle}>
            <h2 className="text-xl md:text-2xl font-bold font-display text-[#E8DDCC] border-b border-[rgba(255,255,255,0.05)] pb-4 mb-5">Physical Meaning</h2>
            <div className="flex flex-col gap-4">
              {getInterpretation(eq.id, initialParams?.params || {}).map((line, i) => (
                <div key={i} className="flex items-start gap-3" style={{ padding: '10px 14px', borderRadius: '10px', background: i === 0 ? `${eq.color}08` : 'transparent', borderLeft: i === 0 ? `3px solid ${eq.color}40` : '3px solid transparent' }}>
                  <span style={{ color: eq.color, marginTop: '2px', fontSize: '0.7rem' }}>{i === 0 ? '◆' : '◇'}</span>
                  <p className="text-sm font-body leading-relaxed" style={{ color: i === 0 ? 'rgba(232,221,204,0.9)' : 'rgba(232,221,204,0.65)' }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </WorkspaceContext.Provider>
  )
}

// ══════════════════════════
//  MAIN EXPLORE COMPONENT
// ══════════════════════════
export default function Explore({ initialEquationId, initialParams, onEquationConsumed }) {
  const [search, setSearch] = useState('')
  const [activeBranch, setActiveBranch] = useState('all')
  const [selectedEquation, setSelectedEquation] = useState(null)

  // Auto-select equation when navigated from landing page classifier
  useEffect(() => {
    if (initialEquationId) {
      const eq = EQUATIONS.find(e => e.id === initialEquationId)
      if (eq) {
        setSelectedEquation(eq)
        window.scrollTo(0, 0)
      }
      if (onEquationConsumed) onEquationConsumed()
    }
  }, [initialEquationId, onEquationConsumed])

  const hasSearch = search.trim().length > 0

  const listedEquations = useMemo(() =>
    EQUATIONS.filter(eq => activeBranch === 'all' || eq.branch === activeBranch),
  [activeBranch])

  const searchResults = useMemo(() => {
    if (!hasSearch) return []
    const q = search.toLowerCase()
    return EQUATIONS.filter(eq =>
      eq.name.toLowerCase().includes(q) ||
      eq.formula.toLowerCase().includes(q) ||
      eq.branch.toLowerCase().includes(q)
    )
  }, [search, hasSearch])

  const handleSelectEquation = (eq) => {
    setSelectedEquation(eq)
    setSearch('')
    window.scrollTo(0, 0)
  }

  return (
    <div className="w-full min-h-screen relative" style={{ background: 'transparent', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>

      {/* Floating orb background animation */}
      <FloatingOrbs />
      {!selectedEquation && <CornerAnimations />}

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {selectedEquation ? (
            /* ═══ FULL-PAGE EQUATION VIEW ═══ */
            <motion.div
              key="equation-detail"
              className="px-4 md:px-8 pb-24 w-full"
              style={{ paddingTop: '150px' }}
            >
              <EquationFullView
                equation={selectedEquation}
                onClose={() => setSelectedEquation(null)}
                initialParams={initialParams}
              />
            </motion.div>
          ) : (
            /* ═══ BROWSE / SEARCH VIEW ═══ */
            <motion.div
              key="browse-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {/* Header */}
              <div className="text-center w-full" style={{ paddingTop: '130px', paddingBottom: '32px' }}>
                <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                  <span className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full text-xs tracking-widest uppercase"
                    style={{ color: 'rgba(196,149,106,0.65)', border: '1px solid rgba(196,149,106,0.2)', background: 'rgba(196,149,106,0.06)', letterSpacing: '0.18em' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Interactive Equations
                  </span>

                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#E8DDCC', marginBottom: '14px' }}>
                    The Scientific Sandbox
                  </h1>
                </motion.div>

                {/* CENTERED Search bar — LARGER SIZE */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-14 mb-8 px-4"
                  style={{ maxWidth: '820px', margin: '48px auto 20px' }}
                >
                  <div
                    className="flex items-center gap-4 px-7 py-4.5 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(196,149,106,0.25)',
                      padding: '16px 28px',
                      boxShadow: hasSearch ? '0 0 0 3px rgba(196,149,106,0.14)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(196,149,106,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search equations — Schrödinger, E=mc², Entropy..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '16.5px', color: 'var(--color-text-secondary)', caretColor: '#C4956A', letterSpacing: '0.01em' }}
                    />
                    {search && (
                      <button onClick={() => setSearch('')}
                        style={{ color: 'rgba(196,149,106,0.65)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>
                        ×
                      </button>
                    )}
                  </div>
                  {!hasSearch && (
                    <p className="text-center" style={{ marginTop: '14px', fontSize: '13px', color: 'rgba(220,200,165,0.38)', letterSpacing: '0.04em' }}>
                      Search to find equations, or browse by branch below
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {hasSearch && (
                  <motion.div
                    key="search-results"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-8 pb-10"
                  >
                    <div className="max-w-5xl mx-auto">
                      <p style={{ fontSize: '13px', color: 'rgba(220,200,165,0.35)', marginBottom: '20px' }}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
                      </p>
                      <div className="flex flex-col gap-3">
                        {searchResults.map((eq, idx) => (
                           <motion.button
                            key={eq.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => handleSelectEquation(eq)}
                            className="flex items-center justify-between w-full rounded-xl cursor-pointer"
                            style={{ padding: '18px 24px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${eq.color}40`, textAlign: 'left', transition: 'all 0.18s', fontFamily: 'var(--font-body)' }}
                            whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: `${eq.color}80` }}
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: eq.color }} />
                              <div>
                                <span style={{ fontSize: '16.5px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block' }}>{eq.name}</span>
                                <span style={{ fontSize: '12px', color: 'rgba(220,208,188,0.35)', marginTop: '3px', display: 'block' }}>
                                  {BRANCHES.find(b => b.id === eq.branch)?.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: `${eq.color}80`, whiteSpace: 'pre-line' }}>{eq.formula}</span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(220,208,188,0.3)" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                              </svg>
                            </div>
                          </motion.button>
                        ))}
                        {searchResults.length === 0 && (
                          <div className="text-center py-20" style={{ color: 'rgba(220,208,188,0.25)', fontSize: '15px' }}>
                            No equations match "{search}"
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Browse: Branches left, Equation names right */}
              {!hasSearch && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="px-8 pb-20"
                  style={{ marginTop: '30px' }}
                >
                  <div className="max-w-7xl mx-auto flex gap-16 items-start w-full px-4">

                    {/* LEFT: Branches */}
                    <div className="shrink-0" style={{ width: '250px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(196,149,106,0.45)', marginBottom: '20px' }}>
                        Branches
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {BRANCHES.map(branch => {
                          const isActive = activeBranch === branch.id
                          const count = branch.id === 'all' ? EQUATIONS.length : EQUATIONS.filter(e => e.branch === branch.id).length
                          return (
                            <button
                              key={branch.id}
                              onClick={() => setActiveBranch(branch.id)}
                              className="flex items-center justify-between w-full rounded-xl cursor-pointer"
                              style={{
                                padding: '12px 20px',
                                background: isActive ? `${branch.color}15` : 'transparent',
                                border: isActive ? `1px solid ${branch.color}28` : '1px solid transparent',
                                fontFamily: 'var(--font-body)', fontSize: '14px',
                                fontWeight: isActive ? 500 : 400,
                                color: isActive ? branch.color : 'rgba(220,208,188,0.45)',
                                textAlign: 'left', transition: 'all 0.18s',
                              }}
                            >
                              <span>{branch.label}</span>
                              <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 400 }}>{count}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(196,149,106,0.07)', minHeight: '500px' }} />

                    {/* RIGHT: Equation Names */}
                    <div className="flex-1">
                      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(196,149,106,0.45)', marginBottom: '20px' }}>
                        {(BRANCHES.find(b => b.id === activeBranch) || BRANCHES[0]).label} · {listedEquations.length} equations
                      </p>
                      <div className="flex flex-col gap-4">
                        {listedEquations.map((eq, idx) => (
                          <motion.button
                            key={eq.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.04 }}
                            onClick={() => handleSelectEquation(eq)}
                            className="flex items-center justify-between w-full rounded-xl cursor-pointer"
                            style={{
                              padding: '18px 26px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(196,149,106,0.22)',
                              fontFamily: 'var(--font-body)', textAlign: 'left',
                              transition: 'all 0.18s',
                            }}
                            whileHover={{ background: 'rgba(255,255,255,0.04)', borderColor: `${eq.color}55` }}
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: eq.color }} />
                              <span style={{ fontSize: '16.5px', fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '-0.01em' }}>
                                {eq.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-5">
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14.5px', color: 'rgba(220,208,188,0.25)', whiteSpace: 'pre-line' }}>
                                {eq.formula}
                              </span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(220,208,188,0.22)" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                              </svg>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
