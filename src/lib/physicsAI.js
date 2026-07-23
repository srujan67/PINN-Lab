// ══════════════════════════════════════════════════════════════════
//  PHYSICS AI — Intelligence Engine (Upgraded Semantic Classifier)
// ══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────
//  SPELLING CORRECTION ENGINE
//  Fuzzy mapping only for physics terms
// ─────────────────────────────────────────────────

const MISSPELLED_MAP = {
  'projecile': 'projectile',
  'momemtum': 'momentum',
  'lorenz': 'lorentz',
  'gravty': 'gravity',
  'velcity': 'velocity',
  'accelaration': 'acceleration',
  'accleration': 'acceleration',
  'diffusivty': 'diffusivity',
  'tempature': 'temperature',
  'magetic': 'magnetic',
  'electon': 'electron',
}

/**
 * Attempt to correct misspelled physics terms.
 * Returns { correctedText, corrections: [{ original, corrected }] }
 */
export function correctSpelling(text) {
  if (!text) return { correctedText: text, corrections: [] }
  const corrections = []
  
  const tokens = text.split(/([a-zA-Z]+)/)
  const correctedTokens = tokens.map(token => {
    const lower = token.toLowerCase()
    if (MISSPELLED_MAP[lower]) {
      const corrected = MISSPELLED_MAP[lower]
      corrections.push({ original: token, corrected })
      if (token[0] === token[0].toUpperCase()) {
        return corrected.charAt(0).toUpperCase() + corrected.slice(1)
      }
      return corrected
    }
    return token
  })

  return {
    correctedText: correctedTokens.join(''),
    corrections,
  }
}

// ─────────────────────────────────────────────────
//  SEMANTIC KNOWLEDGE MAP (All 29 Equations)
// ─────────────────────────────────────────────────

const SEMANTIC_MAP = {
  schrodinger: {
    name: 'Schrödinger Equation',
    objects: ['particle', 'electron', 'quantum particle', 'potential well', 'quantum box', 'wavefunction', 'wave function'],
    actions: ['evolve', 'confine', 'propagate'],
    quantities: ['energy state', 'energy level', 'probability density', 'wavefunction', 'hamiltonian'],
    units: ['eV', 'joule', 'J'],
    concepts: ['schrodinger', 'schrödinger', 'quantum mechanics', 'infinite potential well', 'wave function']
  },
  uncertainty: {
    name: 'Heisenberg Uncertainty',
    objects: ['particle', 'electron', 'photon'],
    actions: ['measure', 'determine', 'restrict'],
    quantities: ['uncertainty in position', 'uncertainty in momentum', 'position uncertainty', 'momentum uncertainty', 'standard deviation', 'delta x', 'delta p'],
    units: ['m', 'kg·m/s', 'kg m/s'],
    concepts: ['heisenberg', 'uncertainty principle', 'uncertainty relation']
  },
  wave: {
    name: 'Wave Equation',
    objects: ['string', 'rope', 'wire', 'membrane', 'medium'],
    actions: ['vibrate', 'oscillate', 'propagate', 'travel'],
    quantities: ['wavelength', 'frequency', 'amplitude', 'wave speed', 'tension', 'velocity'],
    units: ['Hz', 'hertz', 'm', 'm/s', 'lambda', 'λ'],
    concepts: ['wave equation', 'standing wave', 'harmonics', 'transverse wave', 'longitudinal wave']
  },
  newton: {
    name: "Newton's Second Law",
    objects: ['block', 'box', 'crate', 'object', 'mass', 'elevator', 'rocket', 'car', 'vehicle', 'engine'],
    actions: ['accelerate', 'acceleration', 'push', 'pull', 'lift', 'drag', 'friction', 'slide'],
    quantities: ['force', 'net force', 'applied force', 'tension', 'friction', 'mass', 'acceleration'],
    units: ['N', 'newton', 'newtons', 'kg', 'm/s²'],
    concepts: ['newton second law', 'second law', 'f=ma', 'f = ma', 'dynamics']
  },
  heat: {
    name: 'Heat Equation',
    objects: ['rod', 'bar', 'plate', 'sheet', 'block', 'material', 'metal', 'medium'],
    actions: ['heat', 'cool', 'diffuse', 'conduct', 'spread', 'transfer', 'dissipate'],
    quantities: ['temperature', 'thermal diffusivity', 'diffusivity', 'length'],
    units: ['K', 'kelvin', '°C', 'celsius', 'm²/s'],
    concepts: ['heat equation', 'heat diffusion', 'thermal diffusion', 'fourier conduction']
  },
  entropy: {
    name: 'Entropy — Second Law',
    objects: ['system', 'gas', 'engine', 'universe', 'environment'],
    actions: ['increase', 'expand', 'transfer heat'],
    quantities: ['entropy', 'heat transfer', 'temperature', 'change in entropy'],
    units: ['J/K', 'joules/kelvin'],
    concepts: ['second law of thermodynamics', 'entropy increase', 'irreversibility', 'thermodynamic cycle']
  },
  navier: {
    name: 'Navier–Stokes',
    objects: ['fluid', 'liquid', 'water', 'air', 'flow', 'pipe'],
    actions: ['flow', 'stream', 'drag', 'shear'],
    quantities: ['viscosity', 'dynamic viscosity', 'pressure gradient', 'velocity field', 'density'],
    units: ['Pa·s', 'kg/m³', 'm/s'],
    concepts: ['navier-stokes', 'navier stokes', 'viscous flow', 'fluid dynamics', 'fluid motion']
  },
  continuity: {
    name: 'Continuity Equation',
    objects: ['pipe', 'tube', 'nozzle', 'hose', 'channel', 'duct'],
    actions: ['flow', 'contract', 'narrow', 'expand', 'enter', 'exit'],
    quantities: ['flow velocity', 'area ratio', 'cross section', 'pipe diameter', 'diameter ratio'],
    units: ['m/s', 'm²', 'ratio'],
    concepts: ['continuity equation', 'conservation of mass', 'fluid continuity']
  },
  maxwell1: {
    name: "Maxwell — Gauss's Law",
    objects: ['charge', 'sphere', 'shell', 'surface', 'cylinder'],
    actions: ['enclose', 'surround', 'flux'],
    quantities: ['electric flux', 'charge density', 'permittivity', 'enclosed charge'],
    units: ['C', 'coulomb', 'N/C', 'F/m'],
    concepts: ['gauss law', 'gauss\'s law', 'maxwell first equation']
  },
  faraday: {
    name: "Faraday's Law",
    objects: ['coil', 'loop', 'magnet', 'wire', 'solenoid'],
    actions: ['rotate', 'move', 'induce', 'change', 'vary'],
    quantities: ['induced emf', 'electromotive force', 'magnetic flux', 'magnetic field', 'frequency'],
    units: ['V', 'volt', 'weber', 'Wb', 'T', 'Tesla', 'Hz'],
    concepts: ['faraday law', 'faraday\'s law of induction', 'electromagnetic induction', 'lenz law']
  },
  lorentz: {
    name: 'Lorentz Factor',
    objects: ['spaceship', 'rocket', 'clock', 'muon', 'observer', 'particle'],
    actions: ['travel', 'fly', 'move near speed of light', 'dilate', 'contract'],
    quantities: ['lorentz factor', 'gamma', 'time dilation', 'length contraction', 'relative velocity'],
    units: ['c', 'speed of light'],
    concepts: ['special relativity', 'relativistic speed', 'dilation', 'contraction']
  },
  einstein: {
    name: 'Mass–Energy Equivalence',
    objects: ['mass', 'matter', 'nucleus', 'atom', 'sun', 'star'],
    actions: ['convert', 'annihilate', 'fuse', 'fission', 'release energy'],
    quantities: ['mass energy', 'rest mass', 'energy equivalence', 'conversion of mass', 'rest energy'],
    units: ['J', 'joules', 'MeV', 'kg'],
    concepts: ['mass-energy equivalence', 'e=mc2', 'e = mc2', 'einstein relation']
  },
  boltzmann: {
    name: 'Boltzmann Distribution',
    objects: ['molecules', 'atoms', 'particles', 'gas', 'energy states'],
    actions: ['occupy', 'distribute', 'populate'],
    quantities: ['probability of state', 'energy levels', 'partition function', 'temperature'],
    units: ['J', 'eV', 'K', 'kelvin'],
    concepts: ['boltzmann distribution', 'statistical mechanics', 'thermal distribution']
  },
  projectile: {
    name: 'Projectile Motion',
    objects: ['ball', 'sphere', 'stone', 'rock', 'football', 'cricket ball', 'baseball', 'tennis ball', 'bullet', 'arrow', 'shell', 'projectile', 'cannon'],
    actions: ['throw', 'launch', 'kick', 'fire', 'shoot', 'project', 'pitch', 'toss', 'leave'],
    quantities: ['launch angle', 'angle of projection', 'launch speed', 'initial velocity', 'elevation angle', 'range', 'height', 'horizontal range', 'time of flight'],
    units: ['°', 'degrees', 'degree', 'deg', 'm/s', 'm', 's'],
    concepts: ['projectile motion', 'trajectory', 'parabola', 'parabolic', 'airborne']
  },
  energy: {
    name: 'Conservation of Energy',
    objects: ['block', 'ball', 'roller coaster', 'pendulum', 'spring', 'height'],
    actions: ['slide down', 'fall', 'drop', 'release', 'descend', 'roll down', 'frictionless'],
    quantities: ['potential energy', 'kinetic energy', 'height', 'mechanical energy', 'conservation of energy', 'gravity', 'velocity', 'mass'],
    units: ['J', 'joule', 'joules', 'm', 'kg', 'm/s'],
    concepts: ['frictionless ramp', 'inclined plane', 'free fall', 'conservation of energy', 'mechanical energy conservation']
  },
  momentum: {
    name: 'Momentum',
    objects: ['vehicle', 'car', 'truck', 'ball', 'billiard ball', 'block', 'bullet', 'body'],
    actions: ['collide', 'collision', 'crash', 'impact', 'hit', 'strike', 'recoil', 'bounce'],
    quantities: ['momentum', 'conservation of momentum', 'impulse', 'mass', 'velocity', 'speed'],
    units: ['kg·m/s', 'kg m/s', 'kg', 'm/s'],
    concepts: ['conservation of momentum', 'elastic collision', 'inelastic collision', 'momentum conservation']
  },
  circular: {
    name: 'Circular Motion',
    objects: ['satellite', 'car', 'stone', 'string', 'rotor', 'wheel', 'particle'],
    actions: ['rotate', 'revolve', 'spin', 'turn', 'circle', 'loop'],
    quantities: ['centripetal force', 'radius', 'tangential velocity', 'centripetal acceleration'],
    units: ['N', 'newtons', 'm', 'm/s', 'rad/s'],
    concepts: ['circular motion', 'centripetal force', 'curved path', 'orbit']
  },
  gravitation: {
    name: 'Universal Gravitation',
    objects: ['planet', 'star', 'moon', 'satellite', 'earth', 'sun', 'asteroid', 'body', 'masses'],
    actions: ['orbit', 'attract', 'pull', 'revolve'],
    quantities: ['gravitational force', 'attraction force', 'separation distance', 'orbital period'],
    units: ['N', 'kg', 'm'],
    concepts: ['universal gravitation', 'newton\'s law of gravity', 'gravitational attraction']
  },
  bernoulli: {
    name: 'Bernoulli Equation',
    objects: ['fluid', 'water', 'air', 'pipe', 'wing', 'venturi'],
    actions: ['flow', 'lift', 'pump', 'speed up'],
    quantities: ['fluid speed', 'static pressure', 'dynamic pressure', 'pressure difference', 'elevation height', 'density'],
    units: ['Pa', 'pascal', 'm/s', 'm', 'kg/m³'],
    concepts: ['bernoulli equation', 'bernoulli principle', 'fluid pressure']
  },
  reynolds_num: {
    name: 'Reynolds Number',
    objects: ['fluid', 'pipe', 'sphere', 'channel', 'flow'],
    actions: ['flow', 'transition', 'mix'],
    quantities: ['reynolds number', 'laminar flow', 'turbulent flow', 'viscosity', 'characteristic length', 'density', 'velocity'],
    units: ['dimensionless', 'Pa·s', 'kg/m³', 'm/s', 'm'],
    concepts: ['reynolds number', 'laminar to turbulent', 'flow regime']
  },
  coulomb: {
    name: "Coulomb's Law",
    objects: ['charge', 'charges', 'point charges', 'ions', 'spheres', 'electrons'],
    actions: ['attract', 'repel', 'exert force'],
    quantities: ['electrostatic force', 'coulomb force', 'attraction', 'repulsion', 'separation distance'],
    units: ['N', 'C', 'coulomb', 'm'],
    concepts: ['coulomb\'s law', 'electrostatic attraction', 'electrostatic repulsion']
  },
  lorentzforce: {
    name: 'Lorentz Force',
    objects: ['charge', 'charged particle', 'particle', 'electron', 'proton', 'ion'],
    actions: ['move', 'enter', 'deflect', 'travel', 'pass through'],
    quantities: ['magnetic field', 'electric field', 'lorentz force', 'magnetic force', 'tesla', 'deflection'],
    units: ['T', 'Tesla', 'C', 'coulomb', 'm/s', 'N'],
    concepts: ['lorentz force', 'magnetic deflection', 'cyclotron path', 'charge in magnetic field']
  },
  idealgas: {
    name: 'Ideal Gas Law',
    objects: ['gas', 'air', 'container', 'cylinder', 'piston', 'balloon'],
    actions: ['expand', 'compress', 'heat', 'cool', 'fill'],
    quantities: ['pressure', 'volume', 'temperature', 'moles', 'gas constant'],
    units: ['atm', 'Pa', 'pascal', 'L', 'liters', 'm³', 'K', 'kelvin', 'mol'],
    concepts: ['ideal gas law', 'pv=nrt', 'gas expansion', 'gas compression']
  },
  hooke: {
    name: "Hooke's Law",
    objects: ['spring', 'wire', 'elastic band', 'coil', 'shock absorber'],
    actions: ['stretch', 'compress', 'hang', 'load', 'deform', 'restore'],
    quantities: ['spring constant', 'stiffness', 'restoring force', 'displacement', 'stretch distance'],
    units: ['N/m', 'm', 'N'],
    concepts: ['hooke\'s law', 'spring force', 'elastic restoring']
  },
  shm: {
    name: 'Simple Harmonic Motion',
    objects: ['pendulum', 'spring-mass', 'oscillator', 'swing'],
    actions: ['oscillate', 'swing', 'vibrate', 'cycle'],
    quantities: ['amplitude', 'frequency', 'period', 'angular frequency', 'phase constant', 'displacement'],
    units: ['s', 'seconds', 'Hz', 'hertz', 'rad/s', 'm'],
    concepts: ['simple harmonic motion', 'sinusoidal oscillation', 'harmonic oscillator']
  },
  ohm: {
    name: "Ohm's Law",
    objects: ['resistor', 'wire', 'battery', 'circuit', 'conductor'],
    actions: ['connect', 'apply voltage', 'flow current'],
    quantities: ['resistance', 'voltage', 'current', 'potential difference', 'voltage drop'],
    units: ['V', 'volt', 'volts', 'A', 'ampere', 'amperes', 'Ω', 'ohm', 'ohms', 'mA'],
    concepts: ['ohm\'s law', 'electric circuit', 'resistance check']
  },
  debroglie: {
    name: 'de Broglie Wavelength',
    objects: ['electron', 'proton', 'neutron', 'particle', 'molecule'],
    actions: ['move', 'travel', 'accelerate'],
    quantities: ['de broglie wavelength', 'wavelength', 'matter wave', 'momentum', 'velocity', 'mass'],
    units: ['m', 'nm', 'kg·m/s', 'm/s'],
    concepts: ['de broglie relations', 'wave-particle duality', 'matter wave wavelength']
  },
  photoelectric: {
    name: 'Photoelectric Effect',
    objects: ['metal surface', 'cathode', 'electron', 'photon', 'light', 'laser'],
    actions: ['shine', 'illuminate', 'eject', 'emit', 'strike'],
    quantities: ['threshold frequency', 'work function', 'kinetic energy', 'photon energy', 'photoelectron'],
    units: ['eV', 'electronvolt', 'J', 'Hz', 'nm'],
    concepts: ['photoelectric effect', 'threshold wavelength', 'stopping potential']
  },
  rc_circuit: {
    name: 'RC Circuit Charging',
    objects: ['capacitor', 'resistor', 'battery', 'switch', 'circuit'],
    actions: ['charge', 'discharge', 'connect', 'close switch'],
    quantities: ['time constant', 'charging voltage', 'capacitance', 'resistance', 'elapsed time'],
    units: ['F', 'µF', 'uF', 'Ω', 'ohms', 'kΩ', 's', 'seconds', 'V'],
    concepts: ['rc circuit charging', 'rc time constant', 'exponential charging']
  }
}

// ─────────────────────────────────────────────────
//  REQUIRED KEYWORDS REGISTRY (Protects against false matches)
// ─────────────────────────────────────────────────

const REQUIRED_KEYWORDS = {
  schrodinger: ['schrodinger', 'schrödinger', 'wavefunction', 'wave function', 'quantum', 'hamiltonian', 'potential well'],
  uncertainty: ['uncertainty', 'heisenberg', 'delta x', 'delta p'],
  debroglie: ['de broglie', 'debroglie', 'matter wave', 'wavelength', 'λ'],
  photoelectric: ['photoelectric', 'work function', 'threshold frequency', 'photon', 'laser', 'stopping potential'],
  lorentz: ['lorentz', 'gamma', 'time dilation', 'length contraction', 'speed of light', 'relativistic', 'special relativity'],
  einstein: ['einstein', 'mass-energy', 'mc2', 'e=mc2', 'e = mc2', 'nuclear', 'fission', 'fusion', 'annihilat'],
  entropy: ['entropy', 'thermodynamic', 'second law', 'disorder'],
  heat: ['heat', 'temperature', 'thermal', 'diffusivity', 'cooling', 'heating', 'conduction', 'hot', 'cold'],
  bernoulli: ['bernoulli', 'fluid', 'pressure', 'venturi', 'wing', 'lift'],
  reynolds_num: ['reynolds', 'laminar', 'turbulent', 'viscosity'],
  navier: ['navier', 'stokes', 'viscosity', 'viscous', 'fluid', 'pressure gradient'],
  continuity: ['continuity', 'flow', 'pipe', 'area ratio', 'contraction', 'velocity ratio'],
  maxwell1: ['maxwell', 'gauss', 'electric flux', 'charge density', 'enclosed charge'],
  faraday: ['faraday', 'induction', 'induced emf', 'magnetic flux', 'magnetic field', 'coil', 'loop'],
  rc_circuit: ['rc circuit', 'rc time', 'capacitor', 'capacitance'],
  lorentzforce: ['charge', 'charged', 'electron', 'proton', 'ion', 'magnetic', 'electric', 'tesla', 'field', 'current', 'lorentz', 'b-field'],
  coulomb: ['charge', 'coulomb', 'electrostatic', 'attract', 'repel', 'force', 'separated'],
  ohm: ['voltage', 'current', 'resistance', 'resistor', 'battery', 'circuit', 'V', 'I', 'R', 'ohm', 'Ω'],
  hooke: ['spring', 'stiffness', 'hooke', 'stretch', 'compress', 'deform', 'extension'],
  shm: ['harmonic', 'shm', 'oscillat', 'pendulum', 'swing', 'amplitude', 'period'],
  gravitation: ['gravitat', 'gravity', 'planet', 'moon', 'sun', 'star', 'orbit', 'masses', 'attract'],
  circular: ['circular', 'centripetal', 'radius', 'orbit', 'rotate', 'spin', 'revolve', 'curve', 'turn'],
  wave: ['wave', 'frequency', 'wavelength', 'amplitude', 'harmonics', 'vibrate', 'oscillation']
};

// ─────────────────────────────────────────────────
//  CONFIDENCE-BASED SEMANTIC CLASSIFIER
// ─────────────────────────────────────────────────

export function scoreEquations(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const scores = []

  for (const [eqId, eqData] of Object.entries(SEMANTIC_MAP)) {
    // 1. Mandatory keyword validation (protects against unrelated terms)
    if (REQUIRED_KEYWORDS[eqId]) {
      const hasReq = REQUIRED_KEYWORDS[eqId].some(k => lower.includes(k));
      if (!hasReq) {
        continue; // skip this equation completely
      }
    }

    let score = 0
    const matchedConcepts = []
    const matchedCategories = {
      objects: 0,
      actions: 0,
      quantities: 0,
      units: 0,
      concepts: 0
    }

    const checkMatch = (term) => {
      const escaped = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      if (term.includes(' ') || term.length > 3) {
        return lower.includes(term)
      } else {
        return new RegExp('\\b' + escaped + '\\b', 'i').test(lower)
      }
    }

    // 1. Concepts: 8 pts
    if (eqData.concepts) {
      for (const term of eqData.concepts) {
        if (checkMatch(term)) {
          score += 8
          matchedConcepts.push(term)
          matchedCategories.concepts++
        }
      }
    }

    // 2. Quantities: 5 pts
    if (eqData.quantities) {
      for (const term of eqData.quantities) {
        if (checkMatch(term)) {
          score += 5
          matchedConcepts.push(term)
          matchedCategories.quantities++
        }
      }
    }

    // 3. Units: 4 pts
    if (eqData.units) {
      for (const term of eqData.units) {
        if (checkMatch(term)) {
          score += 4
          matchedConcepts.push(term)
          matchedCategories.units++
        }
      }
    }

    // 4. Objects: 3 pts
    if (eqData.objects) {
      for (const term of eqData.objects) {
        if (checkMatch(term)) {
          score += 3
          matchedConcepts.push(term)
          matchedCategories.objects++
        }
      }
    }

    // 5. Actions: 3 pts
    if (eqData.actions) {
      for (const term of eqData.actions) {
        if (checkMatch(term)) {
          score += 3
          matchedConcepts.push(term)
          matchedCategories.actions++
        }
      }
    }

    let hasPriorityBoost = false
    let penalty = 0

    // Priority Rules
    if (eqId === 'lorentzforce') {
      if (lower.includes('magnetic field') || lower.includes('tesla') || lower.includes('lorentz') || lower.includes('magnetic force') || lower.includes('b-field')) {
        hasPriorityBoost = true
        score += 100
      }
    }

    if (eqId === 'momentum') {
      if (lower.includes('collision') || lower.includes('collide') || lower.includes('crash') || lower.includes('impact') || lower.includes('recoil') || lower.includes('strike') || lower.includes('struck')) {
        hasPriorityBoost = true
        score += 100
      }
      if (lower.includes('mass') && (lower.includes('velocity') || lower.includes('speed') || lower.includes('moves at') || lower.includes('travels at')) && !lower.includes('accelerat') && !lower.includes('force')) {
        hasPriorityBoost = true
        score += 80
      }
    }

    if (eqId === 'projectile') {
      const hasLaunch = lower.includes('launch') || lower.includes('throw') || lower.includes('kick') || 
                        lower.includes('fire') || lower.includes('shoot') || lower.includes('shot') || 
                        lower.includes('projectile') || lower.includes('leave') || lower.includes('hit') || 
                        lower.includes('pitch') || lower.includes('toss');
      const hasAngle = lower.includes('angle') || lower.includes('degree') || lower.includes('deg') || 
                       lower.includes('trajectory') || lower.includes('airborne') || lower.includes('parabola') || 
                       lower.includes('°');
      if (hasLaunch && hasAngle) {
        hasPriorityBoost = true
        score += 100
      }
      const hasFall = lower.includes('fall') || lower.includes('drop') || lower.includes('free fall') || lower.includes('falls') || lower.includes('dropped');
      if (hasFall && !hasLaunch && !hasAngle) {
        penalty = 150
      }
    }

    if (eqId === 'energy') {
      const hasFall = lower.includes('fall') || lower.includes('drop') || lower.includes('free fall') || lower.includes('falls') || lower.includes('dropped');
      const hasLaunch = lower.includes('launch') || lower.includes('throw') || lower.includes('kick') || lower.includes('fire') || lower.includes('shoot') || lower.includes('projectile');
      if (hasFall && !hasLaunch) {
        hasPriorityBoost = true
        score += 100
      }
      if (lower.includes('frictionless ramp') || lower.includes('roller coaster') || lower.includes('inclined plane') || (lower.includes('slide') && lower.includes('ramp'))) {
        hasPriorityBoost = true
        score += 80
      }
      if (lower.includes('frictionless')) {
        hasPriorityBoost = true
        score += 50
      }
    }

    if (eqId === 'newton') {
      const hasElevatorOrRocket = lower.includes('elevator') || lower.includes('rocket') || lower.includes('engine');
      if (hasElevatorOrRocket && lower.includes('accelerat')) {
        hasPriorityBoost = true
        score += 100
      }
      if (lower.includes('ramp') || lower.includes('slide') || lower.includes('incline')) {
        hasPriorityBoost = true
        score += 80
      }
      if (lower.includes('magnetic field') || lower.includes('tesla')) {
        penalty = 80
      }
    }

    if (eqId === 'heat') {
      if (lower.includes('heat') || lower.includes('temperature') || lower.includes('diffusivity') || lower.includes('thermal') || lower.includes('conduction') || lower.includes('heated') || lower.includes('cools') || lower.includes('cooling')) {
        hasPriorityBoost = true
        score += 100
      }
    }

    // Apply penalties
    score = Math.max(0, score - penalty)

    let categoriesMatchedCount = 0
    if (matchedCategories.objects > 0) categoriesMatchedCount++
    if (matchedCategories.actions > 0) categoriesMatchedCount++
    if (matchedCategories.quantities > 0) categoriesMatchedCount++
    if (matchedCategories.units > 0) categoriesMatchedCount++
    if (matchedCategories.concepts > 0) categoriesMatchedCount++

    let confidence = 0
    if (score > 0) {
      if (hasPriorityBoost) {
        confidence = 96
      } else if (categoriesMatchedCount >= 3) {
        confidence = 92
      } else if (categoriesMatchedCount === 2) {
        confidence = 85
      } else if (categoriesMatchedCount === 1) {
        confidence = 68
      } else {
        confidence = 45
      }
    }

    if (score > 0) {
      scores.push({
        id: eqId,
        name: eqData.name,
        score,
        confidence,
        matchedConcepts,
      })
    }
  }

  scores.sort((a, b) => b.score - a.score)
  return scores
}

/**
 * Classify with confidence. Returns { primary, related, allScores }
 */
export function classifyWithConfidence(text) {
  const scores = scoreEquations(text)

  if (scores.length === 0) {
    return { primary: null, related: [], allScores: [] }
  }

  const primary = scores[0]
  const related = scores.slice(1).filter(s => s.confidence >= 40)

  return { primary, related, allScores: scores }
}

// ─────────────────────────────────────────────────
//  EQUATION SELECTION EXPLANATION TEMPLATES
// ─────────────────────────────────────────────────

const SELECTION_TEMPLATES = {
  schrodinger: () => 'This problem describes a quantum particle\'s wavefunction or state evolution. The Schrödinger Equation is the fundamental model for predicting quantum probability densities.',
  uncertainty: () => 'This problem deals with the simultaneous measurement limits of position and momentum, which is described by Heisenberg\'s Uncertainty Principle.',
  wave: () => 'This problem involves wave propagation, frequency, or string vibrations, governed by the Wave Equation.',
  newton: () => 'This problem relates force, mass, and acceleration. Newton\'s Second Law models the acceleration resulting from a net force.',
  heat: () => 'This problem involves temperature variations and thermal conduction over a spatial length, modeled by the Heat Equation.',
  entropy: () => 'This problem involves thermodynamic processes, heat transfer, or disorder changes, which are governed by the Second Law of Thermodynamics (Entropy).',
  navier: () => 'This problem describes the velocity and pressure dynamics of a viscous fluid flow, governed by the Navier-Stokes equations.',
  continuity: () => 'This problem relates flow velocity and cross-sectional area changes in a conduit, governed by the mass-conserving Continuity Equation.',
  maxwell1: () => 'This problem concerns electric fields, enclosed charges, or electric flux, modeled by Maxwell\'s first equation (Gauss\'s Law for electricity).',
  faraday: () => 'This problem describes an induced electromotive force resulting from a time-varying magnetic field, governed by Faraday\'s Law of induction.',
  lorentz: () => 'This problem involves velocities approaching the speed of light, where time dilation or length contraction is modeled by the Lorentz Factor.',
  einstein: () => 'This problem describes the conversion or equivalence of mass and energy, modeled by Einstein\'s mass-energy equivalence (E = mc²).',
  boltzmann: () => 'This problem describes particle distribution over energy states at a given temperature, modeled by the Boltzmann Distribution.',
  projectile: () => 'This problem describes an object launched through the air under gravity. Projectile Motion best models the resulting trajectory.',
  energy: () => 'This problem concerns height variations, free falls, or frictionless ramps. Since potential and kinetic energy convert without loss, Conservation of Energy applies.',
  momentum: () => 'This problem involves moving bodies, collisions, or crashes. Momentum is conserved during impact, making Momentum equations the correct match.',
  circular: () => 'This problem describes an object moving in a circular path at constant speed, requiring a centripetal force.',
  gravitation: () => 'This problem involves the gravitational attraction between two massive bodies separated by a distance.',
  bernoulli: () => 'This problem describes fluid flow where pressure, velocity, and elevation change along a streamline, modeled by the Bernoulli Equation.',
  reynolds_num: () => 'This problem analyzes fluid flow characteristics to determine if the flow is laminar or turbulent using the Reynolds Number.',
  coulomb: () => 'This problem calculates the electrostatic force of attraction or repulsion between two point charges.',
  lorentzforce: () => 'This problem describes a charged particle moving inside a magnetic field. It experiences a perpendicular Lorentz force, causing deflection.',
  idealgas: () => 'This problem relates the pressure, volume, temperature, and moles of a gas, modeled by the Ideal Gas Law.',
  hooke: () => 'This problem describes the restoring force of a stretched or compressed spring, governed by Hooke\'s Law.',
  shm: () => 'This problem describes simple harmonic motion or sinusoidal back-and-forth oscillations about an equilibrium point.',
  ohm: () => 'This problem relates voltage, current, and resistance in an electrical circuit, governed by Ohm\'s Law.',
  debroglie: () => 'This problem relates a particle\'s momentum to its quantum wavelength, modeled by the de Broglie relation.',
  photoelectric: () => 'This problem describes electrons ejected from a metal surface by incident light photons, governed by the Photoelectric Effect.',
  rc_circuit: () => 'This problem describes the transient charging or discharging behavior of a resistor-capacitor circuit.'
}

/**
 * Generate a selection explanation for a matched equation.
 */
export function generateSelectionExplanation(equationId, matchedConcepts) {
  const generator = SELECTION_TEMPLATES[equationId]
  if (!generator) return 'This equation was selected based on semantic analysis of your physics problem.'
  return generator(matchedConcepts || [])
}

// ─────────────────────────────────────────────────
//  RESULT INTERPRETATION
// ─────────────────────────────────────────────────

export function generateResultExplanation(equationId, params, calculationResult) {
  if (!calculationResult || calculationResult.isPending) return null

  switch (equationId) {
    case 'projectile': {
      const v0 = params.velocity
      const theta = params.angle
      const g = 9.81
      const T = (2 * v0 * Math.sin(theta)) / g
      const H = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g)
      const R = (v0 * v0 * Math.sin(2 * theta)) / g
      return `The projectile travels a range of ${R.toFixed(2)} m, reaching a maximum height of ${H.toFixed(2)} m. It remains airborne for a total flight time of ${T.toFixed(2)} seconds.`
    }
    case 'newton': {
      const m = params.mass, a = params.acceleration, F = params.force
      return `Newton's Second Law links these values: Force = ${parseFloat(F).toFixed(2)} N, Mass = ${parseFloat(m).toFixed(2)} kg, Acceleration = ${parseFloat(a).toFixed(2)} m/s².`
    }
    case 'lorentzforce': {
      const F = Math.abs(params.charge) * params.velocity * params.magneticField
      return `The charged particle experiences a deflecting Lorentz force of ${F.toExponential(4)} N acting perpendicularly to its trajectory.`
    }
    case 'heat': {
      return `Thermal diffusivity determines how fast heat conducts. The heat equation calculates the temperature profile along the rod.`
    }
    case 'momentum': {
      const p = params.momentum || (params.mass * params.velocity)
      return `The momentum of the moving mass is calculated as ${parseFloat(p).toFixed(2)} kg·m/s. This represents its inertial motion quantity.`
    }
    case 'energy': {
      const m = params.mass
      const h = params.height
      const PE = m * 9.81 * h
      const v = Math.sqrt(2 * 9.81 * h)
      return `At height ${h} m, potential energy is ${PE.toFixed(2)} J. If dropped from rest, conservation of energy yields a final impact velocity of ${v.toFixed(2)} m/s.`
    }
    case 'wave': {
      return `The wave propagates with wavelength and frequency corresponding to the physical properties of the medium.`
    }
    case 'ohm': {
      const V = params.voltage, R = params.resistance
      const I = V / R
      return `Voltage is ${parseFloat(V).toFixed(2)} V and Resistance is ${parseFloat(R).toFixed(2)} Ω, resulting in a current of ${I.toFixed(2)} A.`
    }
    default:
      return null
  }
}

// ─────────────────────────────────────────────────
//  PHYSICS INSIGHT GENERATOR
// ─────────────────────────────────────────────────

const PHYSICS_INSIGHTS = {
  projectile: {
    whySelected: 'Projectile motion applies whenever an object moves under gravity alone after an initial launch.',
    assumptions: 'Assumes flat Earth, constant gravitational acceleration (g = 9.81 m/s²), no air resistance, and point-mass approximation.',
    applications: 'Used in ballistics, sports science, artillery calculations, spacecraft launch trajectories, and forensic reconstruction.',
    relatedEquations: "Often combined with Newton's Second Law for launch force analysis and Conservation of Energy for velocity at different heights.",
  },
  newton: {
    whySelected: "Newton's Second Law is the foundational equation relating force, mass, and acceleration in classical mechanics.",
    assumptions: 'Assumes an inertial reference frame, constant mass, rigid body, and negligible relativistic effects.',
    applications: 'Fundamental to vehicle dynamics, structural engineering, biomechanics, robotics, and any system involving forces and motion.',
    relatedEquations: 'Frequently paired with friction laws (f = μN), gravitational force (F = mg), and impulse-momentum theorem.',
  },
  lorentzforce: {
    whySelected: 'The Lorentz force governs the motion of any charged particle in electromagnetic fields.',
    assumptions: 'Assumes uniform magnetic field, non-relativistic particle speed, vacuum environment, and negligible radiation losses.',
    applications: 'Core principle in cyclotrons, mass spectrometers, MRI machines, particle accelerators, and cathode ray tubes.',
    relatedEquations: "Links to Coulomb's Law for electric forces, Biot-Savart Law for field generation, and Faraday's Law for induced EMF.",
  },
  heat: {
    whySelected: 'The heat equation describes how temperature evolves through a medium via thermal conduction.',
    assumptions: 'Assumes homogeneous material, constant thermal diffusivity, 1D heat flow, and specified boundary conditions.',
    applications: 'Essential in thermal engineering, building insulation design, semiconductor fabrication, geological modeling, and cooking science.',
    relatedEquations: "Connects to Fourier's Law of conduction, Stefan-Boltzmann Law for radiation, and Newton's Law of Cooling for convection.",
  },
  momentum: {
    whySelected: 'Momentum measures a body\'s resistance to stopping, conserved in isolated system collisions.',
    assumptions: 'Assumes a closed, isolated system with negligible external forces acting during impact.',
    applications: 'Collision safety engineering, astrophysics, fluid dynamics, ballistics, and particle physics.',
    relatedEquations: "Related to impulse (FΔt = Δp) and kinetic energy conservation in elastic collisions.",
  },
  energy: {
    whySelected: 'Mechanical energy conservation relates potential and kinetic energy in conservative fields.',
    assumptions: 'Assumes no dissipative forces (friction or drag), rigid bodies, and constant gravitational fields.',
    applications: 'Roller coasters, pendulum systems, hydroelectric dams, and mechanical springs.',
    relatedEquations: "Pairs with work-energy theorem and gravitational potential equations."
  },
  wave: {
    whySelected: 'Models propagating perturbations transporting energy through elastic media.',
    assumptions: 'Linear wave propagation, constant tension, continuous medium, neglecting dispersion.',
    applications: 'Acoustics, seismology, electromagnetic wave propagation, and musical instruments.',
    relatedEquations: "Relates to wave speed, sound level, and Fourier series analysis."
  }
}

export function generatePhysicsInsight(equationId) {
  const insight = PHYSICS_INSIGHTS[equationId]
  if (!insight) return null
  return {
    whySelected: insight.whySelected,
    assumptions: insight.assumptions,
    applications: insight.applications,
    relatedEquations: insight.relatedEquations,
  }
}

// ─────────────────────────────────────────────────
//  FOLLOW-UP QUESTION GENERATOR
// ─────────────────────────────────────────────────

const FOLLOWUP_TEMPLATES = {
  projectile: () => [
    'What launch angle gives the maximum possible horizontal range?',
    'How does air resistance change the parabolic trajectory?',
    'What velocity is needed to double the horizontal range?'
  ],
  newton: () => [
    'How does surface friction change the acceleration of the box?',
    'If the mass is doubled, what force is needed for the same acceleration?',
    'What acceleration does a body experience on Mars under this force?'
  ],
  lorentzforce: () => [
    'What happens if we reverse the direction of the magnetic field?',
    'How does a proton track differently from an electron in this field?',
    'What radius of curvature results if the charge is doubled?'
  ],
  heat: () => [
    'How does thermal conductivity change between iron and wood?',
    'What temperature profile arises after long times (steady state)?',
    'How does insulating the ends of the rod affect heat loss?'
  ],
  momentum: () => [
    'What is the difference between elastic and inelastic collisions?',
    'How does a soft wall reduce the force of impact?',
    'If the vehicle speed is doubled, by what factor does momentum increase?'
  ],
  energy: () => [
    'How does friction on the ramp alter the final speed?',
    'By what height must the block drop to double its impact velocity?',
    'Does potential energy depend on the path taken?'
  ],
  wave: () => [
    'How does increasing the string tension affect wave speed?',
    'What is the frequency of the second harmonic mode?',
    'What is the difference between transverse and longitudinal waves?'
  ]
}

export function generateFollowUpQuestions(equationId, params = {}) {
  const generator = FOLLOWUP_TEMPLATES[equationId]
  if (!generator) return []
  return generator(params)
}

// ─────────────────────────────────────────────────
//  PROFESSIONAL ERROR MESSAGES
// ─────────────────────────────────────────────────

export function generateProfessionalError(status, equationId, params = {}, paramDetails = {}) {
  if (status === 'UNSUPPORTED TOPIC') {
    return 'The described topic is not supported by the current analysis engine.'
  }

  if (status === 'MISSING PARAMETER') {
    const missing = Object.entries(paramDetails)
      .filter(([, detail]) => detail.source === 'Missing')
      .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim().toLowerCase())

    if (missing.length === 1) {
      return `Missing required parameter: ${missing[0]}.`
    }
    if (missing.length > 1) {
      return `Missing required parameters: ${missing.join(', ')}.`
    }
    return 'Required parameter not found.'
  }

  if (status === 'PHYSICALLY IMPOSSIBLE') {
    return 'The supplied values violate known physical laws. The entered values cannot produce a physically valid solution.'
  }

  if (status === 'OUTSIDE MODEL VALIDITY RANGE') {
    return 'The entered values fall outside the validity range of this model. Results may be physically inaccurate.'
  }

  return null
}
