// ═══════════════════════════════════════════════════════
//  PHYSICS PARAMETER EXTRACTION ENGINE
//  Extracts numerical values, converts units, validates
//  physics, and provides scientific interpretations.
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────────────
//  UNIT CONVERSION ENGINE
// ─────────────────────────────────────────────────

const UNIT_PREFIXES = {
  'pico':  1e-12,  'p': 1e-12,
  'nano':  1e-9,   'n': 1e-9,
  'micro': 1e-6,   'µ': 1e-6, 'μ': 1e-6, 'u': 1e-6,
  'milli': 1e-3,   'mm': null, // handled specially
  'centi': 1e-2,
  'kilo':  1e3,    'k': 1e3,
  'mega':  1e6,    'M': 1e6,
  'giga':  1e9,    'G': 1e9,
  'tera':  1e12,   'T': null,  // Tesla, not tera
}

const SI_UNITS = {
  // Length
  'm':   { base: 'm',   factor: 1,      name: 'meters' },
  'meter': { base: 'm', factor: 1,      name: 'meters' },
  'meters': { base: 'm', factor: 1,     name: 'meters' },
  'km':  { base: 'm',   factor: 1e3,    name: 'kilometers' },
  'kilometer': { base: 'm', factor: 1e3, name: 'kilometers' },
  'kilometers': { base: 'm', factor: 1e3, name: 'kilometers' },
  'cm':  { base: 'm',   factor: 1e-2,   name: 'centimeters' },
  'centimeter': { base: 'm', factor: 1e-2, name: 'centimeters' },
  'centimeters': { base: 'm', factor: 1e-2, name: 'centimeters' },
  'mm':  { base: 'm',   factor: 1e-3,   name: 'millimeters' },
  'millimeter': { base: 'm', factor: 1e-3, name: 'millimeters' },
  'millimeters': { base: 'm', factor: 1e-3, name: 'millimeters' },
  'nm':  { base: 'm',   factor: 1e-9,   name: 'nanometers' },
  'nanometer': { base: 'm', factor: 1e-9, name: 'nanometers' },
  'nanometers': { base: 'm', factor: 1e-9, name: 'nanometers' },
  'µm':  { base: 'm',   factor: 1e-6,   name: 'micrometers' },
  'um':  { base: 'm',   factor: 1e-6,   name: 'micrometers' },
  'micrometer': { base: 'm', factor: 1e-6, name: 'micrometers' },
  'micrometers': { base: 'm', factor: 1e-6, name: 'micrometers' },
  'micrometre': { base: 'm', factor: 1e-6, name: 'micrometers' },
  'micrometres': { base: 'm', factor: 1e-6, name: 'micrometers' },
  // Mass
  'kg':  { base: 'kg',  factor: 1,      name: 'kilograms' },
  'kilogram': { base: 'kg', factor: 1, name: 'kilograms' },
  'kilograms': { base: 'kg', factor: 1, name: 'kilograms' },
  'g':   { base: 'kg',  factor: 1e-3,   name: 'grams' },
  'gram': { base: 'kg', factor: 1e-3, name: 'grams' },
  'grams': { base: 'kg', factor: 1e-3, name: 'grams' },
  'mg':  { base: 'kg',  factor: 1e-6,   name: 'milligrams' },
  'milligram': { base: 'kg', factor: 1e-6, name: 'milligrams' },
  'milligrams': { base: 'kg', factor: 1e-6, name: 'milligrams' },
  // Velocity
  'm/s': { base: 'm/s', factor: 1,      name: 'meters/second' },
  'km/h':{ base: 'm/s', factor: 1/3.6,  name: 'km/hour' },
  'kmph':{ base: 'm/s', factor: 1/3.6,  name: 'km/hour' },
  'km/hr':{ base: 'm/s', factor: 1/3.6, name: 'km/hour' },
  'km/hour':{ base: 'm/s', factor: 1/3.6, name: 'km/hour' },
  'km/s':{ base: 'm/s', factor: 1e3,    name: 'km/second' },
  'mph': { base: 'm/s', factor: 0.44704,name: 'miles/hour' },
  'c':   { base: 'm/s', factor: 299792458, name: 'speed of light' },
  // Force
  'N':   { base: 'N',   factor: 1,      name: 'newtons' },
  'newton': { base: 'N', factor: 1,     name: 'newtons' },
  'newtons': { base: 'N', factor: 1,    name: 'newtons' },
  'kN':  { base: 'N',   factor: 1e3,    name: 'kilonewtons' },
  'MN':  { base: 'N',   factor: 1e6,    name: 'meganewtons' },
  // Charge
  'C':   { base: 'C',   factor: 1,      name: 'coulombs' },
  'coulomb': { base: 'C', factor: 1,    name: 'coulombs' },
  'coulombs': { base: 'C', factor: 1,   name: 'coulombs' },
  'µC':  { base: 'C',   factor: 1e-6,   name: 'microcoulombs' },
  'uC':  { base: 'C',   factor: 1e-6,   name: 'microcoulombs' },
  'nC':  { base: 'C',   factor: 1e-9,   name: 'nanocoulombs' },
  'mC':  { base: 'C',   factor: 1e-3,   name: 'millicoulombs' },
  // Magnetic field
  'T':   { base: 'T',   factor: 1,      name: 'tesla' },
  'tesla': { base: 'T', factor: 1,      name: 'tesla' },
  'mT':  { base: 'T',   factor: 1e-3,   name: 'millitesla' },
  // Energy
  'J':   { base: 'J',   factor: 1,      name: 'joules' },
  'joule': { base: 'J', factor: 1,      name: 'joules' },
  'joules': { base: 'J', factor: 1,     name: 'joules' },
  'kJ':  { base: 'J',   factor: 1e3,    name: 'kilojoules' },
  'MJ':  { base: 'J',   factor: 1e6,    name: 'megajoules' },
  'eV':  { base: 'J',   factor: 1.60218e-19, name: 'electronvolts' },
  // Power
  'W':   { base: 'W',   factor: 1,      name: 'watts' },
  'watt': { base: 'W',  factor: 1,      name: 'watts' },
  'watts': { base: 'W', factor: 1,      name: 'watts' },
  'kW':  { base: 'W',   factor: 1e3,    name: 'kilowatts' },
  'MW':  { base: 'W',   factor: 1e6,    name: 'megawatts' },
  // Pressure
  'Pa':  { base: 'Pa',  factor: 1,      name: 'pascals' },
  'pascal': { base: 'Pa', factor: 1,    name: 'pascals' },
  'pascals': { base: 'Pa', factor: 1,   name: 'pascals' },
  'kPa': { base: 'Pa',  factor: 1e3,    name: 'kilopascals' },
  'MPa': { base: 'Pa',  factor: 1e6,    name: 'megapascals' },
  'atm': { base: 'Pa',  factor: 101325, name: 'atmospheres' },
  // Temperature
  'K':   { base: 'K',   factor: 1,      name: 'kelvin' },
  'kelvin': { base: 'K', factor: 1,     name: 'kelvin' },
  // Frequency
  'Hz':  { base: 'Hz',  factor: 1,      name: 'hertz' },
  'hertz': { base: 'Hz', factor: 1,     name: 'hertz' },
  'kHz': { base: 'Hz',  factor: 1e3,    name: 'kilohertz' },
  'MHz': { base: 'Hz',  factor: 1e6,    name: 'megahertz' },
  'GHz': { base: 'Hz',  factor: 1e9,    name: 'gigahertz' },
  // Angle
  '°':       { base: 'rad', factor: Math.PI / 180, name: 'radians' },
  'degrees': { base: 'rad', factor: Math.PI / 180, name: 'radians' },
  'degree':  { base: 'rad', factor: Math.PI / 180, name: 'radians' },
  'deg':     { base: 'rad', factor: Math.PI / 180, name: 'radians' },
  'rad':     { base: 'rad', factor: 1,             name: 'radians' },
  'radian':  { base: 'rad', factor: 1,             name: 'radians' },
  'radians': { base: 'rad', factor: 1,             name: 'radians' },
  // Resistance
  'Ω':   { base: 'Ω',   factor: 1,      name: 'ohms' },
  'ohm':  { base: 'Ω',  factor: 1,      name: 'ohms' },
  'ohms': { base: 'Ω',  factor: 1,      name: 'ohms' },
  'kΩ':  { base: 'Ω',   factor: 1e3,    name: 'kilohms' },
  'MΩ':  { base: 'Ω',   factor: 1e6,    name: 'megaohms' },
  // Voltage
  'V':   { base: 'V',   factor: 1,      name: 'volts' },
  'volt': { base: 'V',  factor: 1,      name: 'volts' },
  'volts': { base: 'V', factor: 1,      name: 'volts' },
  'kV':  { base: 'V',   factor: 1e3,    name: 'kilovolts' },
  'mV':  { base: 'V',   factor: 1e-3,   name: 'millivolts' },
  // Current
  'A':   { base: 'A',   factor: 1,      name: 'amperes' },
  'ampere': { base: 'A', factor: 1,     name: 'amperes' },
  'amperes': { base: 'A', factor: 1,    name: 'amperes' },
  'amp': { base: 'A',   factor: 1,      name: 'amperes' },
  'amps': { base: 'A',  factor: 1,      name: 'amperes' },
  'mA':  { base: 'A',   factor: 1e-3,   name: 'milliamperes' },
  // Spring constant
  'N/m': { base: 'N/m', factor: 1,      name: 'newtons/meter' },
  // Capacitance
  'F':   { base: 'F',   factor: 1,      name: 'farads' },
  'µF':  { base: 'F',   factor: 1e-6,   name: 'microfarads' },
  'uF':  { base: 'F',   factor: 1e-6,   name: 'microfarads' },
  'nF':  { base: 'F',   factor: 1e-9,   name: 'nanofarads' },
  'pF':  { base: 'F',   factor: 1e-12,  name: 'picofarads' },
  'mF':  { base: 'F',   factor: 1e-3,   name: 'millifarads' },
  // Volume
  'm³':  { base: 'm³',  factor: 1,      name: 'cubic meters' },
  'L':   { base: 'm³',  factor: 1e-3,   name: 'liters' },
  // Viscosity
  'Pa·s':{ base: 'Pa·s',factor: 1,      name: 'pascal-seconds' },
  // mol
  'mol': { base: 'mol', factor: 1,      name: 'moles' },
  'mole': { base: 'mol', factor: 1,     name: 'moles' },
  'moles': { base: 'mol', factor: 1,    name: 'moles' },
}

/**
 * Convert a value+unit to SI base units.
 * Returns { original, siValue, siUnit, displayStr, converted }
 */
export function convertToSI(value, unit) {
  const entry = SI_UNITS[unit]
  if (!entry) {
    return { original: `${value} ${unit}`, siValue: value, siUnit: unit, displayStr: null, converted: false }
  }
  const siValue = value * entry.factor
  const isAlreadySI = entry.factor === 1
  const siUnit = entry.base
  return {
    original: `${value} ${unit}`,
    siValue,
    siUnit,
    displayStr: isAlreadySI ? null : `= ${formatSci(siValue)} ${siUnit}`,
    converted: !isAlreadySI,
  }
}

function formatSci(v) {
  if (Math.abs(v) >= 1e6 || (Math.abs(v) < 0.001 && v !== 0)) {
    return v.toExponential(4)
  }
  // Show enough decimals
  if (Math.abs(v) < 1) return v.toPrecision(4)
  return parseFloat(v.toFixed(6)).toString()
}

// ─────────────────────────────────────────────────
//  PARAMETER EXTRACTION
// ─────────────────────────────────────────────────

// Per-equation parameter mapping: what context words map to which param
export const EQUATION_PARAMS = {
  projectile: {
    params: ['velocity', 'angle', 'range'],
    defaults: { velocity: 20, angle: 45, range: 40.77 },
    contextMap: {
      velocity: ['velocity', 'speed', 'v0', 'v₀', 'initial velocity', 'launch speed', 'thrown at', 'thrown with', 'launched at', 'fired at', 'shot at'],
      angle: ['angle', 'theta', 'θ', 'degrees', 'deg', 'launch angle', 'elevation'],
      range: ['range', 'distance', 'horizontal range', 'R', 'travels a range of', 'covers'],
    },
    unitHints: { velocity: 'm/s', angle: 'deg', range: 'm' },
  },
  newton: {
    params: ['mass', 'acceleration', 'force'],
    defaults: { mass: 10, acceleration: 9.81, force: null },
    contextMap: {
      mass: ['mass', 'weight', 'kg', 'object'],
      acceleration: ['acceleration', 'accel', 'deceleration'],
      force: ['force', 'push', 'pull', 'thrust'],
    },
    unitHints: { mass: 'kg', acceleration: 'm/s²', force: 'N' },
  },
  energy: {
    params: ['mass', 'velocity', 'height', 'energy'],
    defaults: { mass: 1, velocity: 10, height: 5, energy: 50 },
    contextMap: {
      mass: ['mass', 'kg', 'object', 'body'],
      velocity: ['velocity', 'speed', 'v', 'moving at', 'travels at'],
      height: ['height', 'altitude', 'elevation', 'above', 'high', 'drop', 'fall'],
      energy: ['energy', 'potential energy', 'kinetic energy', 'PE', 'KE', 'J', 'joule', 'joules'],
    },
    unitHints: { mass: 'kg', velocity: 'm/s', height: 'm', energy: 'J' },
  },
  momentum: {
    params: ['mass', 'velocity', 'momentum', 'mass1', 'velocity1', 'mass2', 'velocity2'],
    defaults: { mass: 5, velocity: 10, momentum: 50 },
    contextMap: {
      mass: ['mass', 'kg'],
      velocity: ['velocity', 'speed', 'v'],
      momentum: ['momentum', 'p'],
      mass1: ['mass 1', 'mass1', 'm1'],
      velocity1: ['velocity 1', 'velocity1', 'v1'],
      mass2: ['mass 2', 'mass2', 'm2'],
      velocity2: ['second velocity', 'velocity 2', 'other velocity'],
    },
    unitHints: { mass: 'kg', velocity: 'm/s', momentum: 'kg·m/s', mass1: 'kg', velocity1: 'm/s', mass2: 'kg', velocity2: 'm/s' },
  },
  circular: {
    params: ['mass', 'velocity', 'radius'],
    defaults: { mass: 2, velocity: 5, radius: 3 },
    contextMap: {
      mass: ['mass', 'kg'],
      velocity: ['velocity', 'speed', 'v', 'tangential'],
      radius: ['radius', 'r', 'distance', 'circle'],
    },
    unitHints: { mass: 'kg', velocity: 'm/s', radius: 'm' },
  },
  gravitation: {
    params: ['mass1', 'mass2', 'distance'],
    defaults: { mass1: 5.972e24, mass2: 7.348e22, distance: 3.844e8 },
    contextMap: {
      mass1: ['mass', 'first mass', 'mass 1', 'planet', 'star', 'earth'],
      mass2: ['second mass', 'mass 2', 'moon', 'satellite', 'other'],
      distance: ['distance', 'separation', 'apart', 'between', 'r'],
    },
    unitHints: { mass1: 'kg', mass2: 'kg', distance: 'm' },
  },
  coulomb: {
    params: ['charge1', 'charge2', 'distance'],
    defaults: { charge1: 1e-6, charge2: -1e-6, distance: 0.1 },
    contextMap: {
      charge1: ['charge', 'first charge', 'charge 1', 'q1', 'q₁', 'positive charge'],
      charge2: ['second charge', 'charge 2', 'q2', 'q₂', 'negative charge', 'other charge'],
      distance: ['distance', 'separation', 'apart', 'between', 'separated by', 'r'],
    },
    unitHints: { charge1: 'C', charge2: 'C', distance: 'm' },
  },
  lorentzforce: {
    params: ['charge', 'velocity', 'magneticField'],
    defaults: { charge: 1.6e-19, velocity: 1e6, magneticField: 0.5 },
    contextMap: {
      charge: ['charge', 'q', 'electron', 'proton', 'particle charge'],
      velocity: ['velocity', 'speed', 'v', 'moving at', 'travels at'],
      magneticField: ['magnetic field', 'field', 'tesla', 'B', 'magnetic'],
    },
    unitHints: { charge: 'C', velocity: 'm/s', magneticField: 'T' },
  },
  bernoulli: {
    params: ['velocity1', 'velocity2', 'pressure1', 'density'],
    defaults: { velocity1: 2, velocity2: 5, pressure1: 101325, density: 1000 },
    contextMap: {
      velocity1: ['velocity', 'speed', 'v1', 'inlet velocity', 'initial speed'],
      velocity2: ['outlet velocity', 'v2', 'exit velocity', 'final speed'],
      pressure1: ['pressure', 'inlet pressure', 'initial pressure'],
      density: ['density', 'rho', 'ρ', 'fluid density'],
    },
    unitHints: { velocity1: 'm/s', velocity2: 'm/s', pressure1: 'Pa', density: 'kg/m³' },
  },
  reynolds_num: {
    params: ['density', 'velocity', 'length', 'viscosity'],
    defaults: { density: 1000, velocity: 2, length: 0.05, viscosity: 0.001 },
    contextMap: {
      density: ['density', 'rho', 'ρ'],
      velocity: ['velocity', 'speed', 'flow speed', 'v'],
      length: ['diameter', 'length', 'pipe diameter', 'characteristic length', 'L', 'D'],
      viscosity: ['viscosity', 'mu', 'μ', 'dynamic viscosity'],
    },
    unitHints: { density: 'kg/m³', velocity: 'm/s', length: 'm', viscosity: 'Pa·s' },
  },
  einstein: {
    params: ['mass'],
    defaults: { mass: 1 },
    contextMap: {
      mass: ['mass', 'kg', 'rest mass', 'object'],
    },
    unitHints: { mass: 'kg' },
  },
  schrodinger: {
    params: ['quantumNumber', 'wellWidth'],
    defaults: { quantumNumber: 1, wellWidth: 1e-9 },
    contextMap: {
      quantumNumber: ['quantum number', 'n', 'energy level', 'state'],
      wellWidth: ['well width', 'width', 'box size', 'L', 'potential well'],
    },
    unitHints: { quantumNumber: '', wellWidth: 'm' },
  },
  uncertainty: {
    params: ['position', 'momentum'],
    defaults: { position: 1e-10, momentum: null },
    contextMap: {
      position: ['position', 'uncertainty in position', 'delta x', 'σx', 'σₓ'],
      momentum: ['momentum', 'uncertainty in momentum', 'delta p', 'σp', 'σₚ'],
    },
    unitHints: { position: 'm', momentum: 'kg·m/s' },
  },
  idealgas: {
    params: ['pressure', 'volume', 'moles', 'temperature'],
    defaults: { pressure: 101325, volume: 0.0224, moles: 1, temperature: 273.15 },
    contextMap: {
      pressure: ['pressure', 'P', 'atm', 'Pa'],
      volume: ['volume', 'V', 'container', 'tank'],
      moles: ['moles', 'n', 'mol', 'amount'],
      temperature: ['temperature', 'T', 'kelvin', 'K', 'celsius'],
    },
    unitHints: { pressure: 'Pa', volume: 'm³', moles: 'mol', temperature: 'K' },
  },
  heat: {
    params: ['diffusivity', 'length'],
    defaults: { diffusivity: 1.17e-4, length: 1 },
    contextMap: {
      diffusivity: ['diffusivity', 'alpha', 'α', 'thermal diffusivity'],
      length: ['length', 'rod length', 'bar length', 'L'],
    },
    unitHints: { diffusivity: 'm²/s', length: 'm' },
  },
  wave: {
    params: ['frequency', 'amplitude', 'waveSpeed', 'wavelength'],
    defaults: { frequency: 2, amplitude: 1, waveSpeed: 3, wavelength: 1.5 },
    contextMap: {
      frequency: ['frequency', 'f', 'Hz', 'hertz', 'vibrates at'],
      amplitude: ['amplitude', 'A', 'displacement'],
      waveSpeed: ['wave speed', 'speed', 'velocity', 'v', 'c'],
      wavelength: ['wavelength', 'lambda', 'λ'],
    },
    unitHints: { frequency: 'Hz', amplitude: 'm', waveSpeed: 'm/s', wavelength: 'm' },
  },
  hooke: {
    params: ['springConstant', 'displacement'],
    defaults: { springConstant: 50, displacement: 0.1 },
    contextMap: {
      springConstant: ['spring constant', 'k', 'stiffness', 'N/m'],
      displacement: ['displacement', 'stretch', 'compression', 'x', 'extension', 'compressed by', 'stretched by'],
    },
    unitHints: { springConstant: 'N/m', displacement: 'm' },
  },
  shm: {
    params: ['amplitude', 'frequency', 'mass'],
    defaults: { amplitude: 0.1, frequency: 2, mass: 0.5 },
    contextMap: {
      amplitude: ['amplitude', 'A', 'maximum displacement'],
      frequency: ['frequency', 'f', 'Hz', 'oscillation'],
      mass: ['mass', 'kg', 'm'],
    },
    unitHints: { amplitude: 'm', frequency: 'Hz', mass: 'kg' },
  },
  ohm: {
    params: ['voltage', 'resistance'],
    defaults: { voltage: 12, resistance: 100 },
    contextMap: {
      voltage: ['voltage', 'V', 'volts', 'potential', 'emf', 'battery'],
      resistance: ['resistance', 'R', 'ohm', 'ohms', 'Ω', 'resistor'],
      current: ['current', 'I', 'ampere', 'amperes', 'A', 'amps'],
    },
    unitHints: { voltage: 'V', resistance: 'Ω' },
  },
  debroglie: {
    params: ['mass', 'velocity'],
    defaults: { mass: 9.109e-31, velocity: 1e6 },
    contextMap: {
      mass: ['mass', 'particle mass', 'electron mass', 'kg'],
      velocity: ['velocity', 'speed', 'v', 'moving at'],
    },
    unitHints: { mass: 'kg', velocity: 'm/s' },
  },
  photoelectric: {
    params: ['frequency', 'workFunction'],
    defaults: { frequency: 1e15, workFunction: 4.2 },
    contextMap: {
      frequency: ['frequency', 'f', 'Hz', 'light frequency', 'photon frequency'],
      workFunction: ['work function', 'phi', 'φ', 'threshold', 'binding energy'],
    },
    unitHints: { frequency: 'Hz', workFunction: 'eV' },
  },
  boltzmann: {
    params: ['temperature'],
    defaults: { temperature: 300 },
    contextMap: {
      temperature: ['temperature', 'T', 'kelvin', 'K'],
    },
    unitHints: { temperature: 'K' },
  },
  lorentz: {
    params: ['velocity'],
    defaults: { velocity: 0.5 },
    contextMap: {
      velocity: ['velocity', 'speed', 'v', 'fraction of c'],
    },
    unitHints: { velocity: 'c' },
  },
  entropy: {
    params: ['temperature', 'heat'],
    defaults: { temperature: 300, heat: 1000 },
    contextMap: {
      temperature: ['temperature', 'T', 'K', 'kelvin'],
      heat: ['heat', 'Q', 'energy', 'joules'],
    },
    unitHints: { temperature: 'K', heat: 'J' },
  },
  rc_circuit: {
    params: ['voltage', 'resistance', 'capacitance'],
    defaults: { voltage: 10, resistance: 1000, capacitance: 1e-5 },
    contextMap: {
      voltage: ['voltage', 'v0', 'v₀', 'battery', 'voltage source', 'emf'],
      resistance: ['resistance', 'r', 'resistor'],
      capacitance: ['capacitance', 'c', 'capacitor'],
    },
    unitHints: { voltage: 'V', resistance: 'Ω', capacitance: 'F' },
  },
  navier: {
    params: ['viscosity', 'velocity'],
    defaults: { viscosity: 0.4, velocity: 2.0 },
    contextMap: {
      viscosity: ['viscosity', 'dynamic viscosity', 'viscous'],
      velocity: ['velocity', 'speed', 'flow speed'],
    },
    unitHints: { viscosity: 'Pa·s', velocity: 'm/s' },
  },
  continuity: {
    params: ['pipeRatio'],
    defaults: { pipeRatio: 0.5 },
    contextMap: {
      pipeRatio: ['ratio', 'contraction', 'pipe ratio', 'area ratio', 'contraction ratio'],
    },
    unitHints: { pipeRatio: '' },
  },
  maxwell1: {
    params: ['charge'],
    defaults: { charge: 3 },
    contextMap: {
      charge: ['charge', 'electric charge', 'q', 'flux'],
    },
    unitHints: { charge: 'nC' },
  },
  faraday: {
    params: ['bField', 'freq'],
    defaults: { bField: 2.0, freq: 1.5 },
    contextMap: {
      bField: ['magnetic field', 'field', 'b', 'magnetic flux'],
      freq: ['frequency', 'freq', 'hz', 'oscillation', 'hertz'],
    },
    unitHints: { bField: 'T', freq: 'Hz' },
  },
}

const VALUE_UNIT_PATTERN = /(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m\/s|km\/h|km\/hr|km\/hour|kmph|km\/s|mph|kg\/m³|N\/m|Pa·s|m²\/s|µC|uC|nC|mC|kΩ|MΩ|kHz|MHz|GHz|kPa|MPa|kN|MN|kJ|MJ|kW|MW|kV|mV|mT|mA|mm|cm|nm|km|kg|mg|eV|atm|mol|m³|m\/s²|°|degrees|degree|deg|radians?|radian|rad|µm|um|meters?|micrometers?|micrometres?|centimeters?|millimeters?|nanometers?|kilometers?|kilograms?|grams?|milligrams?|newtons?|coulombs?|tesla|hertz|joules?|watts?|pascals?|kelvin|volts?|amperes?|amps?|moles?|c|L|µF|uF|nF|pF|mF|F)\b/gi

// Context words that precede a value to identify parameter role
const CONTEXT_PATTERNS = [
  { pattern: /(?:velocity|speed|v[₀0]?)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m\/s|km\/h|km\/s|mph|c)?/i, param: 'velocity' },
  { pattern: /(?:angle|theta|θ)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*)\s*(°|degrees|degree|deg|radians?|rad)?/i, param: 'angle' },
  { pattern: /(?:mass|weight)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(kg|g|mg|kilograms?|grams?)?/i, param: 'mass' },
  { pattern: /(?:force)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(N|kN|newtons?)?/i, param: 'force' },
  { pattern: /(?:acceleration|accel)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m\/s²)?/i, param: 'acceleration' },
  { pattern: /(?:height|altitude|elevation)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m|km|cm|µm|um|meters?|kilometers?|centimeters?)?/i, param: 'height' },
  { pattern: /(?:distance|separation|separated\s+by|apart)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m|km|cm|mm|µm|um|meters?|kilometers?|centimeters?|millimeters?)?/i, param: 'distance' },
  { pattern: /(?:radius|r)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m|km|cm|µm|um|meters?)?/i, param: 'radius' },
  { pattern: /(?:charge|q[₁₂12]?)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(µC|uC|nC|mC|C|coulombs?)?/i, param: 'charge' },
  { pattern: /(?:magnetic\s+field|field|B)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(T|mT|tesla)?/i, param: 'magneticField' },
  { pattern: /(?:pressure)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(Pa|kPa|MPa|atm|pascals?)?/i, param: 'pressure' },
  { pattern: /(?:temperature|temp)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(K|°C|kelvin)?/i, param: 'temperature' },
  { pattern: /(?:density|rho|ρ)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(kg\/m³)?/i, param: 'density' },
  { pattern: /(?:viscosity|mu|μ)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(Pa·s)?/i, param: 'viscosity' },
  { pattern: /(?:diameter|length|width)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m|cm|mm|km|µm|um|meters?)?/i, param: 'length' },
  { pattern: /(?:frequency|f)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(Hz|kHz|MHz|GHz|hertz)?/i, param: 'frequency' },
  { pattern: /(?:voltage|potential|emf|battery)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(V|kV|mV|volts?)?/i, param: 'voltage' },
  { pattern: /(?:resistance|resistor)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(Ω|ohms?|kΩ|MΩ)?/i, param: 'resistance' },
  { pattern: /(?:current|ampere)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(A|mA|ampere|amperes|amps?)?/i, param: 'current' },
  { pattern: /(?:spring\s+constant|stiffness|k)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(N\/m)?/i, param: 'springConstant' },
  { pattern: /(?:displacement|stretch|extension|compressed|stretched)\s*(?:=|is|of|by|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m|cm|mm|µm|um|meters?|centimeters?|millimeters?)?/i, param: 'displacement' },
  { pattern: /(?:amplitude)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m|cm|mm|µm|um|meters?)?/i, param: 'amplitude' },
  { pattern: /(?:work\s+function|phi|φ)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(eV|J|joules?)?/i, param: 'workFunction' },
  { pattern: /(?:moles?|n)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(mol|moles?)?/i, param: 'moles' },
  { pattern: /(?:volume)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(m³|L)?/i, param: 'volume' },
  { pattern: /(?:capacitance|c)\s*(?:=|is|of|:)?\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(µF|uF|nF|pF|mF|F)?/i, param: 'capacitance' },
]

// Fallback: extract bare numbers with units from the entire text
function extractAllValueUnits(text) {
  const matches = []
  let match
  const re = new RegExp(VALUE_UNIT_PATTERN.source, 'gi')
  while ((match = re.exec(text)) !== null) {
    const value = parseFloat(match[1])
    const unit = match[2]
    matches.push({ value, unit, index: match.index })
  }
  return matches
}

const EQUATION_CONSTANTS = {
  projectile: { g: { val: 9.81, unit: 'm/s²', name: 'Gravity' } },
  gravitation: { G: { val: 6.6743e-11, unit: 'N·m²/kg²', name: 'Gravitational Constant' } },
  coulomb: { k_e: { val: 8.98755e9, unit: 'N·m²/C²', name: 'Coulomb Constant' } },
  lorentzforce: {
    q_e: { val: 1.60218e-19, unit: 'C', name: 'Elementary Charge' },
    m_e: { val: 9.10938e-31, unit: 'kg', name: 'Electron Mass' }
  },
  debroglie: { h: { val: 6.62607e-34, unit: 'J·s', name: 'Planck Constant' } },
  photoelectric: {
    h: { val: 6.62607e-34, unit: 'J·s', name: 'Planck Constant' },
    c: { val: 299792458, unit: 'm/s', name: 'Speed of Light' }
  },
  einstein: { c: { val: 299792458, unit: 'm/s', name: 'Speed of Light' } },
  lorentz: { c: { val: 299792458, unit: 'm/s', name: 'Speed of Light' } },
  boltzmann: { k_B: { val: 1.38065e-23, unit: 'J/K', name: 'Boltzmann Constant' } },
  schrodinger: { h_bar: { val: 1.05457e-34, unit: 'J·s', name: 'Reduced Planck Constant' } },
  uncertainty: { h_bar: { val: 1.05457e-34, unit: 'J·s', name: 'Reduced Planck Constant' } },
  maxwell1: { epsilon_0: { val: 8.85419e-12, unit: 'F/m', name: 'Vacuum Permittivity' } }
};

export const UNIT_CATEGORIES_MAP = {
  charge: ['C', 'µC', 'uC', 'nC', 'mC', 'coulomb', 'coulombs'],
  length: ['m', 'km', 'cm', 'mm', 'nm', 'µm', 'um', 'meter', 'meters', 'micrometer', 'micrometers', 'micrometre', 'micrometres', 'centimeter', 'centimeters', 'millimeter', 'millimeters', 'nanometer', 'nanometers', 'kilometer', 'kilometers'],
  velocity: ['m/s', 'km/h', 'kmph', 'km/hr', 'km/hour', 'km/s', 'mph', 'c'],
  mass: ['kg', 'g', 'mg', 'kilogram', 'kilograms', 'gram', 'grams', 'milligram', 'milligrams'],
  force: ['N', 'kN', 'MN', 'newton', 'newtons'],
  angle: ['°', 'degrees', 'degree', 'deg', 'rad', 'radian', 'radians'],
  magneticField: ['T', 'mT', 'tesla'],
  frequency: ['Hz', 'kHz', 'MHz', 'GHz', 'hertz'],
  resistance: ['Ω', 'ohm', 'ohms', 'kΩ', 'MΩ'],
  voltage: ['V', 'kV', 'mV', 'volt', 'volts'],
  current: ['A', 'mA', 'ampere', 'amperes', 'amp', 'amps'],
  springConstant: ['N/m'],
  capacitance: ['F', 'µF', 'uF', 'nF', 'pF', 'mF'],
  volume: ['m³', 'L'],
  viscosity: ['Pa·s'],
  moles: ['mol', 'moles'],
  pressure: ['Pa', 'kPa', 'MPa', 'atm', 'pascal', 'pascals'],
  energy_or_ev: ['J', 'kJ', 'MJ', 'eV'],
  acceleration: ['m/s²', 'acceleration'],
}

/**
 * Preprocess user input text to standardize prefixes and spacing.
 */
export function preprocessText(text) {
  if (!text) return ""
  let processed = text
  processed = processed.replace(/μ/g, 'µ')

  // Normalize units to avoid trailing numbers being parsed as separate digits: m/s2 -> m/s², m/s^2 -> m/s²
  processed = processed.replace(/\bm\/s\^?2\b/gi, 'm/s²')
  processed = processed.replace(/\bm\^?2\/s\b/gi, 'm²/s')
  processed = processed.replace(/\bkg\/m\^?3\b/gi, 'kg/m³')

  // Normalize scientific notations: 5x10^6, 5 x 10^6, 5*10^6, 5 * 10^-19 → 5e6, 5e-19
  processed = processed.replace(/(-?\d+\.?\d*)\s*(?:[xX]|\*)\s*10\s*(?:\^|\*\*)\s*([+-]?\d+)/g, '$1e$2')
  
  // Normalize micro variations:
  processed = processed.replace(/(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(?:micro\s*coulombs?|micro-coulombs?|microcoulombs?|uC|µC|uc|µc)\b/gi, '$1 µC')
  processed = processed.replace(/(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(?:micro\s*meters?|micro-meters?|micrometers?|um|µm)\b/gi, '$1 µm')
  processed = processed.replace(/(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(?:micro\s*farads?|micro-farads?|microfarads?|uf|µF|uF|µf)\b/gi, '$1 µF')
  
  // Normalize velocity aliases: kmph, km/hr, km/hour → km/h
  processed = processed.replace(/(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*(?:kmph|km\/hr|km\/hour)\b/gi, '$1 km/h')
  
  // Normalize key = value patterns: "charge = 2 C" or "mass=5kg" → "charge 2 C", "mass 5kg"
  processed = processed.replace(/(\b[a-zA-Z]+)\s*=\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)/gi, '$1 $2')
  
  return processed
}

/**
 * Extract parameters from natural language text for a specific equation.
 * Returns { params, paramDetails, rawMatches, conversions, parameterConfidence }
 */
export function extractParameters(text, equationId) {
  if (!text || !equationId) {
    return { params: {}, paramDetails: {}, rawMatches: [], conversions: [], parameterConfidence: 0 }
  }

  const eqConfig = EQUATION_PARAMS[equationId]
  if (!eqConfig) {
    return { params: {}, paramDetails: {}, rawMatches: [], conversions: [], parameterConfidence: 0 }
  }

  const preprocessedText = preprocessText(text)
  const inputLower = preprocessedText.toLowerCase()

  const extractedParams = {}
  const paramDetails = {}
  const rawMatches = []
  const conversions = []

  // Helper function to resolve parameter
  const resolveParam = (paramName, rawVal, rawUnit) => {
    const conv = rawUnit ? convertToSI(rawVal, rawUnit) : { siValue: rawVal, siUnit: eqConfig.unitHints[paramName] || '', original: `${rawVal}`, converted: false }
    extractedParams[paramName] = conv.siValue
    if (conv.converted) {
      if (!conversions.some(c => c.original === conv.original && c.siValue === conv.siValue)) {
        conversions.push(conv)
      }
    }
    paramDetails[paramName] = {
      val: rawVal,
      unit: rawUnit || eqConfig.unitHints[paramName] || '',
      siVal: conv.siValue,
      siUnit: conv.siUnit,
      source: conv.converted ? 'Converted to SI' : 'User Input'
    }
  }

  // 1. Context-aware extraction using named patterns
  for (const cp of CONTEXT_PATTERNS) {
    const m = preprocessedText.match(cp.pattern)
    if (m) {
      const value = parseFloat(m[1])
      const unit = m[2] || ''
      if (!isNaN(value)) {
        rawMatches.push({ param: cp.param, value, unit, source: 'context' })
      }
    }
  }

  // 2. Extract all bare values and units
  const regex = /(-?\d+\.?\d*(?:e[+-]?\d+)?)\s*([a-zA-Z°Ωµμ\/³²·]+)?/g
  const candidates = []
  let match
  while ((match = regex.exec(preprocessedText)) !== null) {
    const valueStr = match[1]
    const unitStr = match[2] || ''
    const value = parseFloat(valueStr)
    const index = match.index
    
    const startCtx = Math.max(0, index - 35)
    const context = preprocessedText.substring(startCtx, index).toLowerCase()
    
    let category = null
    const cleanedUnit = unitStr.trim()
    if (cleanedUnit) {
      for (const [cat, list] of Object.entries(UNIT_CATEGORIES_MAP)) {
        if (list.some(u => u.toLowerCase() === cleanedUnit.toLowerCase())) {
          category = cat
          break
        }
      }
    }
    
    candidates.push({
      value,
      unit: cleanedUnit,
      category,
      context,
      index,
      assigned: false
    })
  }

  const expectedParams = eqConfig.params
  
  // 3. Map candidates to expected parameters based on category
  for (const paramName of expectedParams) {
    const hintUnit = eqConfig.unitHints[paramName] || ''
    let expectedCategory = null
    if (hintUnit) {
      for (const [cat, list] of Object.entries(UNIT_CATEGORIES_MAP)) {
        if (list.some(u => u.toLowerCase() === hintUnit.toLowerCase())) {
          expectedCategory = cat
          break
        }
      }
    }
    
    const contextHints = eqConfig.contextMap[paramName] || []
    
    const checkHint = (cText, hintList) => {
      return hintList.some(hint => {
        const h = hint.toLowerCase()
        if (h.length <= 2) {
          try {
            // Escape any special regex characters if needed, although context hints are usually alphanumeric
            const escaped = h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
            const regex = new RegExp('\\b' + escaped + '\\b', 'i')
            return regex.test(cText)
          } catch (e) {
            return cText.includes(h)
          }
        }
        return cText.includes(h)
      })
    }

    const matchingCandidates = candidates.filter(c => {
      if (c.assigned) return false
      if (expectedCategory) {
        if (c.category === expectedCategory) return true
        // Allow bare numbers only if they have a matching context hint
        if (!c.category || c.category === '') {
          return checkHint(c.context, contextHints)
        }
        return false
      } else {
        return !c.category
      }
    })
    
    let bestCandidate = null
    // Prioritize candidate containing parameter hints in preceding context
    for (const c of matchingCandidates) {
      if (checkHint(c.context, contextHints)) {
        bestCandidate = c
        break
      }
    }
    
    // Fallback to first available matching candidate of this category (strict category matching only)
    if (!bestCandidate && matchingCandidates.length > 0) {
      const sameCategoryCandidates = matchingCandidates.filter(c => c.category === expectedCategory)
      if (sameCategoryCandidates.length > 0) {
        bestCandidate = sameCategoryCandidates[0]
      }
    }
    
    if (bestCandidate) {
      bestCandidate.assigned = true
      resolveParam(paramName, bestCandidate.value, bestCandidate.unit)
    }
  }

  // 4. Special Fallbacks
  if (equationId === 'coulomb') {
    const chargeCandidates = candidates.filter(c => !c.assigned && c.category === 'charge')
    if (extractedParams.charge1 === undefined && chargeCandidates.length > 0) {
      const c = chargeCandidates.shift()
      c.assigned = true
      resolveParam('charge1', c.value, c.unit)
    }
    if (extractedParams.charge2 === undefined && chargeCandidates.length > 0) {
      const c = chargeCandidates.shift()
      c.assigned = true
      resolveParam('charge2', c.value, c.unit)
    }
  }

  if (equationId === 'projectile') {
    if (extractedParams.velocity === undefined) {
      const vm = preprocessedText.match(/(?:thrown|launched|fired|shot|projected)\s+(?:at|with)?\s*(-?\d+\.?\d*)\s*(m\/s|km\/h)?/i)
      if (vm) {
        resolveParam('velocity', parseFloat(vm[1]), vm[2] || 'm/s')
      }
    }
    if (extractedParams.angle === undefined) {
      const am = preprocessedText.match(/(-?\d+\.?\d*)\s*(?:°|degrees|degree|deg)\b/i)
      if (am) {
        resolveParam('angle', parseFloat(am[1]), 'deg')
      }
    }
    if (extractedParams.angle === undefined) {
      const am = preprocessedText.match(/angle\s+(?:of\s+)?(-?\d+\.?\d*)/i)
      if (am) {
        resolveParam('angle', parseFloat(am[1]), 'deg')
      }
    }
  }

  if (equationId === 'lorentzforce') {
    if (extractedParams.charge === undefined) {
      if (/electron/i.test(preprocessedText)) {
        resolveParam('charge', 1.60218e-19, 'C')
      } else if (/proton/i.test(preprocessedText)) {
        resolveParam('charge', 1.60218e-19, 'C')
      }
    }
  }

  // 5. Fill in missing expected parameters
  for (const paramName of expectedParams) {
    if (extractedParams[paramName] === undefined) {
      paramDetails[paramName] = {
        val: null,
        unit: eqConfig.unitHints[paramName] || '',
        siVal: null,
        siUnit: eqConfig.unitHints[paramName] || '',
        source: 'Missing'
      }
    }
  }

  // Add universal constants
  const constants = EQUATION_CONSTANTS[equationId] || {}
  for (const [constName, constInfo] of Object.entries(constants)) {
    paramDetails[constName] = {
      val: constInfo.val,
      unit: constInfo.unit,
      siVal: constInfo.val,
      siUnit: constInfo.unit,
      source: 'Default Constant'
    }
  }

  const expectedVariables = expectedParams
  const foundVariablesCount = expectedVariables.filter(p => extractedParams[p] !== undefined).length
  const parameterConfidence = expectedVariables.length > 0 ? foundVariablesCount / expectedVariables.length : 0

  return {
    params: extractedParams,
    paramDetails,
    rawMatches,
    conversions,
    parameterConfidence,
  }
}

/**
 * Calculate client-side physics equation results based on extracted parameters.
 */
export function calculateResult(equationId, params) {
  const eqConfig = EQUATION_PARAMS[equationId]
  if (!eqConfig) return null

  let fullParams = { ...params }

  // 1. Flexible required check
  if (equationId === 'newton') {
    const m = params.mass !== undefined && params.mass !== null && params.mass !== "" ? parseFloat(params.mass) : null;
    const a = params.acceleration !== undefined && params.acceleration !== null && params.acceleration !== "" ? parseFloat(params.acceleration) : null;
    const F = params.force !== undefined && params.force !== null && params.force !== "" ? parseFloat(params.force) : null;

    let knownsCount = 0;
    if (m !== null && !isNaN(m)) knownsCount++;
    if (a !== null && !isNaN(a)) knownsCount++;
    if (F !== null && !isNaN(F)) knownsCount++;

    if (knownsCount < 2) {
      return { isPending: true, displayStr: 'Missing required parameter' }
    }

    if (F === null && m !== null && a !== null) {
      fullParams.force = m * a;
    } else if (m === null && F !== null && a !== null) {
      if (a === 0) {
        return { isPending: false, value: null, unit: 'kg', displayStr: 'Calculation Error: acceleration cannot be zero when calculating mass.' }
      }
      fullParams.mass = F / a;
    } else if (a === null && F !== null && m !== null) {
      if (m === 0) {
        return { isPending: false, value: null, unit: 'm/s²', displayStr: 'Calculation Error: mass cannot be zero when calculating acceleration.' }
      }
      fullParams.acceleration = F / m;
    }
  } else if (equationId === 'projectile') {
    const v = params.velocity !== undefined && params.velocity !== null && params.velocity !== "" ? parseFloat(params.velocity) : null;
    const theta = params.angle !== undefined && params.angle !== null && params.angle !== "" ? parseFloat(params.angle) : null; // rad
    const R = params.range !== undefined && params.range !== null && params.range !== "" ? parseFloat(params.range) : null;

    let knownsCount = 0;
    if (v !== null && !isNaN(v)) knownsCount++;
    if (theta !== null && !isNaN(theta)) knownsCount++;
    if (R !== null && !isNaN(R)) knownsCount++;

    if (knownsCount < 2) {
      return { isPending: true, displayStr: 'Missing required parameter' }
    }

    const g = 9.81;
    if (R === null && v !== null && theta !== null) {
      fullParams.range = (v * v * Math.sin(2 * theta)) / g;
    } else if (v === null && R !== null && theta !== null) {
      const denom = Math.sin(2 * theta);
      if (denom <= 0) {
        return { isPending: false, value: null, unit: 'm/s', displayStr: 'Calculation Error: launch angle cannot produce positive range.' }
      }
      fullParams.velocity = Math.sqrt((R * g) / denom);
    } else if (theta === null && R !== null && v !== null) {
      const val = (R * g) / (v * v);
      if (val > 1 || val < -1) {
        return { isPending: false, value: null, unit: 'rad', displayStr: 'Calculation Error: range is physically unreachable at this velocity.' }
      }
      fullParams.angle = 0.5 * Math.asin(val);
    }
  } else if (equationId === 'momentum') {
    const hasTwoBody = params.mass1 !== undefined || params.mass2 !== undefined;
    if (hasTwoBody) {
      for (const p of ['mass1', 'velocity1', 'mass2', 'velocity2']) {
        if (params[p] === undefined || params[p] === null || params[p] === "") {
          return { isPending: true, displayStr: 'Missing required parameter' }
        }
      }
    } else {
      const m = params.mass !== undefined && params.mass !== null && params.mass !== "" ? parseFloat(params.mass) : null;
      const v = params.velocity !== undefined && params.velocity !== null && params.velocity !== "" ? parseFloat(params.velocity) : null;
      const p = params.momentum !== undefined && params.momentum !== null && params.momentum !== "" ? parseFloat(params.momentum) : null;

      let knownsCount = 0;
      if (m !== null && !isNaN(m)) knownsCount++;
      if (v !== null && !isNaN(v)) knownsCount++;
      if (p !== null && !isNaN(p)) knownsCount++;

      if (knownsCount < 2) {
        return { isPending: true, displayStr: 'Missing required parameter' }
      }

      if (p === null && m !== null && v !== null) {
        fullParams.momentum = m * v;
      } else if (m === null && p !== null && v !== null) {
        if (v === 0) return { isPending: false, value: null, unit: 'kg', displayStr: 'Calculation Error: velocity cannot be zero.' }
        fullParams.mass = p / v;
      } else if (v === null && p !== null && m !== null) {
        if (m === 0) return { isPending: false, value: null, unit: 'm/s', displayStr: 'Calculation Error: mass cannot be zero.' }
        fullParams.velocity = p / m;
      }
    }
  } else if (equationId === 'energy') {
    const m = params.mass !== undefined && params.mass !== null && params.mass !== "" ? parseFloat(params.mass) : null;
    const h = params.height !== undefined && params.height !== null && params.height !== "" ? parseFloat(params.height) : null;
    const v = params.velocity !== undefined && params.velocity !== null && params.velocity !== "" ? parseFloat(params.velocity) : null;
    const E = params.energy !== undefined && params.energy !== null && params.energy !== "" ? parseFloat(params.energy) : null;

    let knownsCount = 0;
    if (m !== null && !isNaN(m)) knownsCount++;
    if (h !== null && !isNaN(h)) knownsCount++;
    if (v !== null && !isNaN(v)) knownsCount++;
    if (E !== null && !isNaN(E)) knownsCount++;

    if (knownsCount < 2) {
      return { isPending: true, displayStr: 'Missing required parameter' }
    }

    const g = 9.81;
    if (E === null && m !== null && h !== null) {
      const v_val = v !== null ? v : 0;
      fullParams.energy = 0.5 * m * v_val * v_val + m * g * h;
    } else if (h === null && E !== null && m !== null) {
      const v_val = v !== null ? v : 0;
      fullParams.height = (E - 0.5 * m * v_val * v_val) / (m * g);
    } else if (m === null && E !== null && h !== null) {
      const v_val = v !== null ? v : 0;
      const denom = 0.5 * v_val * v_val + g * h;
      if (denom === 0) return { isPending: false, value: null, unit: 'kg', displayStr: 'Calculation Error: mass cannot be solved.' }
      fullParams.mass = E / denom;
    }
  } else if (equationId === 'wave') {
    const f = params.frequency !== undefined && params.frequency !== null && params.frequency !== "" ? parseFloat(params.frequency) : null;
    const v = params.waveSpeed !== undefined && params.waveSpeed !== null && params.waveSpeed !== "" ? parseFloat(params.waveSpeed) : null;
    const lam = params.wavelength !== undefined && params.wavelength !== null && params.wavelength !== "" ? parseFloat(params.wavelength) : null;

    let knownsCount = 0;
    if (f !== null && !isNaN(f)) knownsCount++;
    if (v !== null && !isNaN(v)) knownsCount++;
    if (lam !== null && !isNaN(lam)) knownsCount++;

    if (knownsCount < 2) {
      return { isPending: true, displayStr: 'Missing required parameter' }
    }

    if (lam === null && v !== null && f !== null) {
      if (f === 0) return { isPending: false, value: null, unit: 'm', displayStr: 'Calculation Error: frequency cannot be zero.' }
      fullParams.wavelength = v / f;
    } else if (v === null && lam !== null && f !== null) {
      fullParams.waveSpeed = f * lam;
    } else if (f === null && lam !== null && v !== null) {
      if (lam === 0) return { isPending: false, value: null, unit: 'Hz', displayStr: 'Calculation Error: wavelength cannot be zero.' }
      fullParams.frequency = v / lam;
    }
  } else {
    // Ensure all required variables are present for other equations
    for (const p of eqConfig.params) {
      if (params[p] === undefined || params[p] === null || params[p] === "") {
        return { isPending: true, displayStr: 'Missing required parameter' }
      }
    }
  }

  // Central validation layer (Rule 3 and Rule 8)
  const realism = checkRealism(equationId, fullParams)
  if (realism.status === 'unrealistic') {
    return {
      isPending: false,
      value: null,
      unit: '',
      displayStr: 'Calculation blocked'
    }
  }

  let resObj = null
  try {
    resObj = (() => {
      switch (equationId) {
        case 'projectile': {
          const v0 = fullParams.velocity
          const theta = fullParams.angle // rad
          const g = 9.81
          const R = (v0 * v0 * Math.sin(2 * theta)) / g
          const H = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g)
          const T = (2 * v0 * Math.sin(theta)) / g
          return {
            isPending: false,
            value: R,
            unit: 'm',
            displayStr: `Range: ${R.toFixed(2)} m\nMax Height: ${H.toFixed(2)} m\nTime of Flight: ${T.toFixed(2)} s`
          }
        }
        case 'newton': {
          const m = parseFloat(fullParams.mass)
          const a = parseFloat(fullParams.acceleration)
          const F = parseFloat(fullParams.force)
          
          if (params.force === undefined || params.force === null || params.force === "") {
            return { isPending: false, value: F, unit: 'N', displayStr: `force = ${Number(F.toFixed(4))} N` }
          } else if (params.mass === undefined || params.mass === null || params.mass === "") {
            return { isPending: false, value: m, unit: 'kg', displayStr: `mass = ${Number(m.toFixed(4))} kg` }
          } else {
            return { isPending: false, value: a, unit: 'm/s²', displayStr: `acceleration = ${Number(a.toFixed(4))} m/s²` }
          }
        }
        case 'energy': {
          const m = parseFloat(fullParams.mass)
          const h = parseFloat(fullParams.height)
          const v_val = fullParams.velocity !== undefined && fullParams.velocity !== null && fullParams.velocity !== "" ? parseFloat(fullParams.velocity) : null;
          
          const PE = m * 9.81 * h
          if (v_val === null) {
            const v_impact = Math.sqrt(2 * 9.81 * h)
            return {
              isPending: false,
              value: PE,
              unit: 'J',
              displayStr: `Potential Energy: ${PE.toFixed(2)} J\nFinal Velocity: ${v_impact.toFixed(2)} m/s`
            }
          } else {
            const KE = 0.5 * m * v_val * v_val
            const E = KE + PE
            return {
              isPending: false,
              value: E,
              unit: 'J',
              displayStr: `Total Energy: ${E.toFixed(2)} J\n(KE: ${KE.toFixed(2)} J, PE: ${PE.toFixed(2)} J)`
            }
          }
        }
        case 'momentum': {
          const hasTwoBody = params.mass1 !== undefined || params.mass2 !== undefined;
          if (hasTwoBody) {
            const m1 = params.mass1, v1 = params.velocity1
            const m2 = params.mass2, v2 = params.velocity2
            const pTotal = m1 * v1 + m2 * v2
            const v1f = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
            const v2f = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
            return {
              isPending: false,
              value: pTotal,
              unit: 'kg·m/s',
              displayStr: `Total Momentum: ${pTotal.toFixed(2)} kg·m/s\nPost-collision:\nv1_final = ${v1f.toFixed(2)} m/s\nv2_final = ${v2f.toFixed(2)} m/s`
            }
          } else {
            const m = parseFloat(fullParams.mass)
            const v = parseFloat(fullParams.velocity)
            const p = parseFloat(fullParams.momentum)
            if (params.momentum === undefined || params.momentum === null || params.momentum === "") {
              return { isPending: false, value: p, unit: 'kg·m/s', displayStr: `momentum = ${p.toFixed(2)} kg·m/s` }
            } else if (params.mass === undefined || params.mass === null || params.mass === "") {
              return { isPending: false, value: m, unit: 'kg', displayStr: `mass = ${m.toFixed(2)} kg` }
            } else {
              return { isPending: false, value: v, unit: 'm/s', displayStr: `velocity = ${v.toFixed(2)} m/s` }
            }
          }
        }
        case 'wave': {
          const f = parseFloat(fullParams.frequency)
          const v = parseFloat(fullParams.waveSpeed)
          const lam = parseFloat(fullParams.wavelength)
          return {
            isPending: false,
            value: lam,
            unit: 'm',
            displayStr: `Wavelength: ${lam.toFixed(4)} m\nWave Speed: ${v.toFixed(2)} m/s\nFrequency: ${f.toFixed(2)} Hz`
          }
        }
        case 'circular': {
          const F = (params.mass * params.velocity * params.velocity) / params.radius
          return { isPending: false, value: F, unit: 'N', displayStr: `${F.toFixed(2)} N` }
        }
        case 'gravitation': {
          const G = 6.6743e-11
          const F = (G * params.mass1 * params.mass2) / (params.distance * params.distance)
          return { isPending: false, value: F, unit: 'N', displayStr: `${F.toExponential(4)} N` }
        }
        case 'coulomb': {
          const k = 8.98755e9
          const F = (k * Math.abs(params.charge1) * Math.abs(params.charge2)) / (params.distance * params.distance)
          return { isPending: false, value: F, unit: 'N', displayStr: `${F.toExponential(4)} N` }
        }
        case 'lorentzforce': {
          const F = Math.abs(params.charge) * params.velocity * params.magneticField
          const r = (params.mass > 0 && Math.abs(params.charge) > 0 && params.magneticField > 0) ? (params.mass * params.velocity) / (Math.abs(params.charge) * params.magneticField) : 0
          const omega = (params.mass > 0) ? (Math.abs(params.charge) * params.magneticField) / params.mass : 0
          return {
            isPending: false,
            value: F,
            unit: 'N',
            displayStr: `Force: ${F.toExponential(4)} N\nRadius: ${r.toExponential(4)} m\nFreq: ${omega.toExponential(4)} rad/s`
          }
        }
        case 'ohm': {
          const I = params.voltage / params.resistance
          return { isPending: false, value: I, unit: 'A', displayStr: `${parseFloat(I.toFixed(4))} A` }
        }
        case 'hooke': {
          const F = -params.springConstant * params.displacement
          return { isPending: false, value: F, unit: 'N', displayStr: `${F.toFixed(2)} N` }
        }
        case 'shm': {
          const T = 1 / params.frequency
          return { isPending: false, value: T, unit: 's', displayStr: `Period: ${T.toFixed(3)} s` }
        }
        case 'debroglie': {
          const h = 6.62607e-34
          const lam = h / (params.mass * params.velocity)
          return { isPending: false, value: lam, unit: 'm', displayStr: `${lam.toExponential(4)} m` }
        }
        case 'photoelectric': {
          const h = 6.62607e-34
          const f = params.frequency
          const workFnJoules = params.workFunction * 1.60218e-19
          const KE = h * f - workFnJoules
          const KEEv = KE / 1.60218e-19
          return { isPending: false, value: KE, unit: 'J', displayStr: `${KEEv.toFixed(3)} eV\n(${KE.toExponential(4)} J)` }
        }
        case 'boltzmann': {
          return { isPending: false, value: 0, unit: '', displayStr: 'Calculated inside Simulator' }
        }
        case 'lorentz': {
          const vFraction = params.velocity / 299792458
          if (vFraction >= 1) {
            return { isPending: false, value: Infinity, unit: '', displayStr: 'γ = Infinity\n(unphysical speed)' }
          }
          const gamma = 1 / Math.sqrt(1 - (vFraction * vFraction))
          return { isPending: false, value: gamma, unit: '', displayStr: `γ = ${gamma.toFixed(4)}` }
        }
        case 'entropy': {
          const dS = params.heat / params.temperature
          return { isPending: false, value: dS, unit: 'J/K', displayStr: `${dS.toFixed(2)} J/K` }
        }
        case 'rc_circuit': {
          const tau = params.resistance * params.capacitance
          return { isPending: false, value: tau, unit: 's', displayStr: `Time Constant (RC): ${tau.toExponential(4)} s` }
        }
        default:
          return null
      }
    })()
  } catch (e) {
    console.error(e)
    return {
      isPending: false,
      value: null,
      unit: '',
      displayStr: 'Calculation blocked'
    }
  }

  if (resObj && !resObj.isPending) {
    if (resObj.value === null || isNaN(resObj.value) || !isFinite(resObj.value)) {
      return {
        isPending: false,
        value: null,
        unit: '',
        displayStr: 'Calculation blocked'
      }
    }
  }
  return resObj
}

// ─────────────────────────────────────────────────
//  PHYSICS VALIDATION
// ─────────────────────────────────────────────────

const VALIDATION_RULES = {
  projectile: (p) => {
    const w = []
    if (p.velocity !== undefined && p.velocity < 0) w.push('Negative velocity detected — using magnitude.')
    if (p.velocity !== undefined && p.velocity > 1e4) w.push('Extremely high velocity — air resistance effects ignored.')
    if (p.angle !== undefined && (p.angle < 0 || p.angle > 90)) w.push('Angle outside 0°–90° range. Adjusting to valid range.')
    return w
  },
  newton: (p) => {
    const w = []
    if (p.mass !== undefined && p.mass <= 0) w.push('Mass must be positive — negative mass is physically invalid.')
    if (p.force !== undefined && p.force < 0) w.push('Negative force indicates opposite direction.')
    return w
  },
  energy: (p) => {
    const w = []
    if (p.mass !== undefined && p.mass <= 0) w.push('Mass must be positive.')
    if (p.height !== undefined && p.height < 0) w.push('Negative height — measuring below reference point.')
    return w
  },
  coulomb: (p) => {
    const w = []
    if (p.distance !== undefined && p.distance <= 0) w.push('Distance must be positive — charges cannot overlap.')
    return w
  },
  lorentzforce: (p) => {
    const w = []
    if (p.velocity !== undefined && p.velocity > 3e8) w.push('Velocity exceeds speed of light — relativistic effects apply.')
    if (p.magneticField !== undefined && p.magneticField < 0) w.push('Negative magnetic field — using magnitude for direction.')
    return w
  },
  gravitation: (p) => {
    const w = []
    if (p.mass1 !== undefined && p.mass1 <= 0) w.push('Mass must be positive.')
    if (p.mass2 !== undefined && p.mass2 <= 0) w.push('Mass must be positive.')
    if (p.distance !== undefined && p.distance <= 0) w.push('Distance must be positive — objects cannot overlap.')
    return w
  },
  circular: (p) => {
    const w = []
    if (p.mass !== undefined && p.mass <= 0) w.push('Mass must be positive.')
    if (p.radius !== undefined && p.radius <= 0) w.push('Radius must be positive.')
    return w
  },
  ohm: (p) => {
    const w = []
    if (p.resistance !== undefined && p.resistance <= 0) w.push('Resistance must be positive for standard resistors.')
    if (p.voltage !== undefined && p.voltage < 0) w.push('Negative voltage indicates reversed polarity.')
    return w
  },
  hooke: (p) => {
    const w = []
    if (p.springConstant !== undefined && p.springConstant <= 0) w.push('Spring constant must be positive.')
    return w
  },
  photoelectric: (p) => {
    const w = []
    if (p.frequency !== undefined && p.workFunction !== undefined) {
      const hf = 6.626e-34 * p.frequency / 1.602e-19 // in eV
      if (hf < p.workFunction) w.push('Photon energy below work function — no electron emission possible.')
    }
    return w
  },
  rc_circuit: (p) => {
    const w = []
    if (p.voltage !== undefined && p.voltage < 0) w.push('Negative voltage indicates reversed polarity.')
    if (p.resistance !== undefined && p.resistance <= 0) w.push('Resistance must be positive.')
    if (p.capacitance !== undefined && p.capacitance <= 0) w.push('Capacitance must be positive.')
    return w
  },
}

/**
 * Validate physics parameters for a given equation.
 * Returns { valid, warnings }
 */
export function validatePhysics(params, equationId) {
  const validator = VALIDATION_RULES[equationId]
  if (!validator) return { valid: true, warnings: [] }
  const warnings = validator(params)
  return { valid: warnings.length === 0, warnings }
}

// ─────────────────────────────────────────────────
//  SCIENTIFIC INTERPRETATION
// ─────────────────────────────────────────────────

const INTERPRETATIONS = {
  projectile: (p) => {
    const lines = []
    lines.push('Projectile motion decomposes into independent horizontal and vertical components.')
    if (p.angle !== undefined) {
      if (Math.abs(p.angle - 45) < 3) lines.push('Maximum range occurs near 45° — this is the optimal launch angle.')
      else if (p.angle < 30) lines.push('Low launch angle produces long range but low maximum height.')
      else if (p.angle > 60) lines.push('High launch angle produces great height but shorter range.')
    }
    lines.push('Air resistance is neglected in this ideal model.')
    return lines
  },
  newton: () => [
    'Force equals mass times acceleration — the foundation of classical dynamics.',
    'The acceleration is always in the direction of the net force.',
    'This law applies in inertial reference frames only.',
  ],
  energy: (p) => {
    const lines = ['Total mechanical energy is conserved in the absence of non-conservative forces.']
    if (p.height !== undefined && p.height > 0) {
      lines.push('As the object falls, potential energy converts to kinetic energy.')
    }
    lines.push('Energy can neither be created nor destroyed, only transformed.')
    return lines
  },
  momentum: () => [
    'Total momentum is conserved in all collisions (elastic and inelastic).',
    'In elastic collisions, kinetic energy is also conserved.',
    'The center of mass velocity remains constant throughout the collision.',
  ],
  circular: () => [
    'Centripetal force always points toward the center of the circular path.',
    'The object\'s speed remains constant, but its velocity direction changes continuously.',
    'Without centripetal force, the object would travel in a straight line (Newton\'s First Law).',
  ],
  gravitation: () => [
    'Gravitational force follows an inverse-square law with distance.',
    'The force is always attractive and acts along the line connecting both centers of mass.',
    'This same law governs planetary orbits, tidal forces, and weight.',
  ],
  coulomb: (p) => {
    const lines = ['Electrostatic force follows an inverse-square law identical in form to gravity.']
    if (p.charge1 !== undefined && p.charge2 !== undefined) {
      if ((p.charge1 > 0 && p.charge2 > 0) || (p.charge1 < 0 && p.charge2 < 0)) {
        lines.push('Like charges repel — the force pushes the charges apart.')
      } else {
        lines.push('Opposite charges attract — the force pulls the charges together.')
      }
    }
    lines.push('The electric force is ~10³⁶ times stronger than gravity at atomic scales.')
    return lines
  },
  lorentzforce: () => [
    'Magnetic force is always perpendicular to the velocity — it changes direction but not speed.',
    'The particle follows a circular or helical path in a uniform magnetic field.',
    'This principle is used in cyclotrons, mass spectrometers, and MRI machines.',
  ],
  bernoulli: () => [
    'As fluid speeds up, its static pressure decreases (Bernoulli effect).',
    'This principle explains airplane lift, venturi meters, and carburetors.',
    'The equation assumes incompressible, non-viscous, steady-state flow along a streamline.',
  ],
  reynolds_num: (p) => {
    const lines = ['Reynolds number predicts whether flow will be laminar or turbulent.']
    if (p.density && p.velocity && p.length && p.viscosity) {
      const Re = (p.density * p.velocity * p.length) / p.viscosity
      if (Re < 2300) lines.push(`Re = ${Re.toFixed(0)} — Flow is laminar (smooth, orderly layers).`)
      else if (Re < 4000) lines.push(`Re = ${Re.toFixed(0)} — Flow is in the transition regime (unstable).`)
      else lines.push(`Re = ${Re.toFixed(0)} — Flow is fully turbulent (chaotic mixing).`)
    }
    return lines
  },
  einstein: () => [
    'A small amount of mass converts to an enormous amount of energy due to c².',
    'This principle powers nuclear reactors and explains stellar energy production.',
    'Even 1 kg of mass contains ~9 × 10¹⁶ joules — equivalent to ~21 megatons of TNT.',
  ],
  schrodinger: () => [
    'The wave function ψ describes the quantum state — its square gives probability density.',
    'Particles are confined to discrete energy levels inside a potential well.',
    'Nodes in the wave function are points where the probability of finding the particle is zero.',
  ],
  uncertainty: () => [
    'Position and momentum cannot be simultaneously known with arbitrary precision.',
    'This is not a measurement limitation — it is a fundamental property of nature.',
    'Tighter position confinement increases momentum uncertainty, and vice versa.',
  ],
  idealgas: () => [
    'PV = nRT unifies Boyle\'s, Charles\'s, and Avogadro\'s gas laws.',
    'Real gases deviate from ideal behavior at high pressures and low temperatures.',
    'At standard conditions (STP), one mole of ideal gas occupies ~22.4 liters.',
  ],
  heat: () => [
    'Heat flows from regions of higher temperature to lower temperature.',
    'The rate of heat conduction depends on thermal diffusivity of the material.',
    'Temperature distribution approaches equilibrium over time.',
  ],
  wave: () => [
    'Waves transport energy without transporting matter.',
    'The wave equation governs sound, light, vibrating strings, and seismic waves.',
    'Superposition allows waves to constructively or destructively interfere.',
  ],
  hooke: (p) => {
    const lines = ['Spring force is proportional to displacement — the foundation of elasticity.']
    if (p.displacement !== undefined && Math.abs(p.displacement) > 0.5) {
      lines.push('Large displacements may exceed the elastic limit where Hooke\'s law breaks down.')
    }
    lines.push('The restoring force always acts opposite to the displacement direction.')
    return lines
  },
  shm: () => [
    'Simple harmonic motion is sinusoidal — the most fundamental periodic motion.',
    'The period depends only on the system properties, not the amplitude.',
    'SHM occurs whenever the restoring force is proportional to displacement.',
  ],
  ohm: (p) => {
    const lines = ['Current is directly proportional to voltage and inversely proportional to resistance.']
    if (p.resistance !== undefined && p.resistance > 1e6) {
      lines.push('Very high resistance — minimal current flow (insulator behavior).')
    }
    lines.push('Power dissipated as heat: P = I²R = V²/R.')
    return lines
  },
  debroglie: (p) => {
    const lines = ['All matter exhibits wave-like behavior — wavelength decreases with increasing momentum.']
    if (p.mass !== undefined && p.mass > 1e-20) {
      lines.push('For macroscopic objects, the de Broglie wavelength is immeasurably small.')
    } else {
      lines.push('For electrons and subatomic particles, wave effects are significant and observable.')
    }
    return lines
  },
  photoelectric: (p) => {
    const lines = ['Photons below the threshold frequency cannot eject electrons regardless of intensity.']
    if (p.frequency !== undefined && p.workFunction !== undefined) {
      const photonE = 6.626e-34 * p.frequency / 1.602e-19
      if (photonE > p.workFunction) {
        lines.push('Photon energy exceeds work function — electrons are ejected with kinetic energy.')
      } else {
        lines.push('Photon energy is below the work function — no photoelectric emission occurs.')
      }
    }
    lines.push('This effect proved the particle nature of light (Einstein, 1905 Nobel Prize).')
    return lines
  },
  boltzmann: () => [
    'Higher-energy states are exponentially less likely to be occupied.',
    'At higher temperatures, the distribution broadens — more states become accessible.',
    'The Boltzmann distribution is the foundation of statistical thermodynamics.',
  ],
  lorentz: (p) => {
    const lines = ['The Lorentz factor γ approaches infinity as velocity approaches the speed of light.']
    if (p.velocity !== undefined) {
      if (p.velocity > 0.9) lines.push('At >90% of c, time dilation and length contraction become dramatic.')
      else if (p.velocity < 0.1) lines.push('At low velocities, relativistic effects are negligible (γ ≈ 1).')
    }
    lines.push('No massive object can reach or exceed the speed of light.')
    return lines
  },
  entropy: () => [
    'Entropy measures the number of microscopic configurations consistent with a macroscopic state.',
    'The Second Law establishes the arrow of time — entropy always increases in isolated systems.',
    'Processes that decrease local entropy must increase it even more elsewhere.',
  ],
  rc_circuit: (p) => {
    const lines = ['An RC circuit describes the exponential charging or discharging of a capacitor through a resistor.']
    if (p.resistance !== undefined && p.capacitance !== undefined) {
      const tau = p.resistance * p.capacitance
      lines.push(`Time constant (τ = RC) is ${formatSci(tau)} seconds.`)
      lines.push(`The capacitor reaches 63.2% of its maximum charge at t = 1τ (${formatSci(tau)} s), and ~99.3% at t = 5τ (${formatSci(5*tau)} s).`)
    }
    return lines
  },
  navier: () => [
    'Navier-Stokes equations govern the motion of viscous fluid substances.',
    'They are the foundation of modern aerodynamics, weather forecasting, and oceanography.',
    'Viscosity measures a fluid\'s internal resistance to flow (thickness).'
  ],
  continuity: () => [
    'The continuity equation represents conservation of mass in a fluid system.',
    'For incompressible fluids, flow speed increases where cross-sectional area decreases (A₁v₁ = A₂v₂).',
    'This explains why water speeds up when passing through a narrow nozzle.'
  ],
  maxwell1: () => [
    'Gauss\'s law relates the net electric flux through any closed surface to the net charge enclosed.',
    'It states that electric field lines originate on positive charges and terminate on negative charges.',
    'This is the first of Maxwell\'s equations for electromagnetism.'
  ],
  faraday: () => [
    'Faraday\'s law of induction states that a changing magnetic field induces an electromotive force (EMF) and electric field.',
    'This physical principle is the basis for electric generators, inductors, and transformers.',
    'The negative sign (Lenz\'s law) indicates that the induced current opposes the change in flux.'
  ],
}

/**
 * Get scientific interpretation lines for an equation with given parameters.
 */
export function getInterpretation(equationId, params = {}) {
  const fn = INTERPRETATIONS[equationId]
  if (!fn) return ['No interpretation available for this equation.']
  return fn(params)
}

/**
 * Get the primary result field name for golden glow highlighting.
 */
export function getPrimaryResultField(equationId) {
  const map = {
    projectile: 'Range',
    newton: 'Force',
    energy: 'Total Energy',
    momentum: 'Final Velocity',
    circular: 'Centripetal Force',
    gravitation: 'Gravitational Force',
    coulomb: 'Electrostatic Force',
    lorentzforce: 'Lorentz Force',
    bernoulli: 'Pressure Difference',
    reynolds_num: 'Reynolds Number',
    einstein: 'Energy',
    schrodinger: 'Energy Level',
    uncertainty: 'Minimum Uncertainty',
    idealgas: 'Volume',
    heat: 'Temperature',
    wave: 'Wavelength',
    hooke: 'Spring Force',
    shm: 'Period',
    ohm: 'Current',
    debroglie: 'Wavelength',
    photoelectric: 'Kinetic Energy',
    boltzmann: 'Probability',
    lorentz: 'Lorentz Factor',
    entropy: 'Entropy Change',
    rc_circuit: 'Capacitor Voltage',
  }
  return map[equationId] || null
}

export function checkRealism(equationId, params) {
  const c = 299792458;

  if (!params) {
    return {
      status: 'incomplete',
      reason: 'Missing required parameter',
      isRealistic: true,
      violatedConstraint: 'Missing parameters',
      correctiveSuggestion: 'Please enter all missing parameters.',
      checklist: {
        params: { passed: false, info: 'Missing required inputs' },
        units: { passed: true, info: 'Pending input' },
        domain: { passed: true, info: 'Pending parameters' },
        assumptions: 'Pending parameters'
      }
    }
  }

  const eqConfig = EQUATION_PARAMS[equationId]
  let hasEnough = true
  if (equationId === 'newton') {
    let kc = 0
    if (params.mass !== undefined && params.mass !== null && params.mass !== '') kc++
    if (params.acceleration !== undefined && params.acceleration !== null && params.acceleration !== '') kc++
    if (params.force !== undefined && params.force !== null && params.force !== '') kc++
    if (kc < 2) hasEnough = false
  } else if (equationId === 'projectile') {
    let kc = 0
    if (params.velocity !== undefined && params.velocity !== null && params.velocity !== '') kc++
    if (params.angle !== undefined && params.angle !== null && params.angle !== '') kc++
    if (params.range !== undefined && params.range !== null && params.range !== '') kc++
    if (kc < 2) hasEnough = false
  } else if (equationId === 'momentum') {
    const hasTwoBody = params.mass1 !== undefined || params.mass2 !== undefined
    if (hasTwoBody) {
      for (const p of ['mass1', 'velocity1', 'mass2', 'velocity2']) {
        if (params[p] === undefined || params[p] === null || params[p] === "") hasEnough = false
      }
    } else {
      let kc = 0
      if (params.mass !== undefined && params.mass !== null && params.mass !== '') kc++
      if (params.velocity !== undefined && params.velocity !== null && params.velocity !== '') kc++
      if (params.momentum !== undefined && params.momentum !== null && params.momentum !== '') kc++
      if (kc < 2) hasEnough = false
    }
  } else if (equationId === 'energy') {
    let kc = 0
    if (params.mass !== undefined && params.mass !== null && params.mass !== '') kc++
    if (params.height !== undefined && params.height !== null && params.height !== '') kc++
    if (params.velocity !== undefined && params.velocity !== null && params.velocity !== '') kc++
    if (params.energy !== undefined && params.energy !== null && params.energy !== '') kc++
    if (kc < 2) hasEnough = false
  } else if (equationId === 'wave') {
    let kc = 0
    if (params.frequency !== undefined && params.frequency !== null && params.frequency !== '') kc++
    if (params.waveSpeed !== undefined && params.waveSpeed !== null && params.waveSpeed !== '') kc++
    if (params.wavelength !== undefined && params.wavelength !== null && params.wavelength !== '') kc++
    if (kc < 2) hasEnough = false
  } else {
    const expected = eqConfig ? eqConfig.params : []
    for (const p of expected) {
      const val = params[p]
      if (val === undefined || val === null || val === '') {
        hasEnough = false
        break
      }
    }
  }

  if (!hasEnough) {
    return {
      status: 'incomplete',
      reason: 'Missing required parameter',
      isRealistic: true,
      violatedConstraint: 'Missing required parameter',
      correctiveSuggestion: 'Please enter all missing parameters.',
      checklist: {
        params: { passed: false, info: 'Missing required inputs' },
        units: { passed: true, info: 'Pending input' },
        domain: { passed: true, info: 'Pending parameters' },
        assumptions: 'Pending parameters'
      }
    }
  }

  for (const k of Object.keys(params)) {
    const val = params[k];
    if (val === undefined || val === null || val === '') continue;
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) {
      return {
        status: 'unrealistic',
        reason: 'Value is mathematically invalid (NaN or Infinity).',
        isRealistic: false,
        violatedConstraint: 'Invalid math: NaN/Infinity',
        correctiveSuggestion: 'Please enter valid finite numbers.',
        checklist: {
          params: { passed: true, info: 'All parameters provided.' },
          units: { passed: true, info: 'All units verified.' },
          domain: { passed: false, info: 'Invalid mathematical value.' },
          assumptions: 'Mathematical assumptions violated.'
        }
      }
    }
  }

  const velocityKeys = ['velocity', 'velocity1', 'velocity2', 'waveSpeed', 'vel'];
  for (const vk of velocityKeys) {
    if (params[vk] !== undefined && params[vk] !== null && params[vk] !== '') {
      const vVal = parseFloat(params[vk]);
      if (vVal >= c) {
        return {
          status: 'unrealistic',
          reason: 'Velocity cannot exceed or equal the speed of light.',
          isRealistic: false,
          violatedConstraint: 'v ≥ c',
          correctiveSuggestion: 'Please enter a velocity below the speed of light (2.998 × 10⁸ m/s).',
          checklist: {
            params: { passed: true, info: 'All parameters provided.' },
            units: { passed: true, info: 'All units verified.' },
            domain: { passed: false, info: 'Velocity outside physical domain.' },
            assumptions: 'Relativistic assumptions violated.'
          }
        }
      }
    }
  }

  let status = 'realistic'
  let reason = 'All parameters are physically realistic and within normal bounds.'
  let isRealistic = true
  let domainPassed = true
  let domainInfo = 'All values within mathematical domain.'
  let assumption = 'Ideal model assumptions apply.'
  let violatedConstraint = ''
  let correctiveSuggestion = ''

  let isConverted = false
  let unitInfo = 'All units verified.'
  if (equationId === 'coulomb') {
    isConverted = true
    unitInfo = 'Charges converted: μC → C (10⁻⁶)'
  } else if (equationId === 'rc_circuit') {
    isConverted = true
    unitInfo = 'Capacitance converted: μF → F (10⁻⁶)'
  } else if (equationId === 'gravitation') {
    isConverted = true
    unitInfo = 'Planet mass (10²⁴ kg) & radius (10⁶ m) converted to SI.'
  }

  switch (equationId) {
    case 'projectile': {
      const v = parseFloat(params.velocity)
      let thetaDeg = Number(params.angle)
      if (thetaDeg > 0 && thetaDeg < 2.0) {
        thetaDeg = thetaDeg * 180 / Math.PI
      }
      assumption = 'Flat Earth model, constant gravity (g = 9.81 m/s²), neglecting air resistance and wind.'
      if (v <= 0 || v >= c) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = v <= 0 ? 'Velocity must be positive.' : 'Velocity cannot exceed or equal the speed of light.'
        violatedConstraint = v <= 0 ? 'v ≤ 0 m/s' : 'v ≥ c'
        correctiveSuggestion = 'Please enter a positive velocity below the speed of light (2.998 × 10⁸ m/s).'
      } else if (thetaDeg <= 0 || thetaDeg >= 90) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Launch angle must be between 0° and 90° non-inclusive.'
        violatedConstraint = 'θ ≤ 0° or θ ≥ 90°'
        correctiveSuggestion = 'Enter a launch angle strictly between 0° and 90°.'
      } else if (v > 150) {
        status = 'extreme'
        reason = `Velocity (${v.toFixed(0)} m/s) is extremely high. High drag would cause vaporization in air.`
        correctiveSuggestion = 'Consider reducing velocity to below 150 m/s for standard air calculations.'
      } else if (thetaDeg < 5 || thetaDeg > 85) {
        status = 'extreme'
        reason = `Angle (${thetaDeg.toFixed(1)}°) is extreme. Near-vertical or near-horizontal trajectories.`
        correctiveSuggestion = 'Consider using an angle between 15° and 75° for stable trajectories.'
      }
      break
    }
    case 'energy': {
      const m = parseFloat(params.mass)
      const h = parseFloat(params.height)
      assumption = 'Classical point mass, constant uniform gravitational field, neglecting friction.'
      if (m <= 0 || h <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = m <= 0 ? 'Mass must be strictly positive.' : 'Height must be strictly positive.'
        domainInfo = 'Negative/zero mass or height is physically invalid.'
        violatedConstraint = m <= 0 ? 'm ≤ 0 kg' : 'h ≤ 0 m'
        correctiveSuggestion = 'Enter positive values for both mass and height.'
      } else if (m > 10000) {
        status = 'extreme'
        reason = `Mass (${m.toFixed(0)} kg) is exceptionally large for standard mechanical experiments.`
        correctiveSuggestion = 'Consider using a mass below 10,000 kg for typical scenarios.'
      } else if (h > 5000) {
        status = 'extreme'
        reason = `Height (${h.toFixed(0)} m) is extreme; variation in gravity and air density would play a role.`
        correctiveSuggestion = 'Consider a height below 5,000 m to neglect gravity variations.'
      }
      break
    }
    case 'momentum': {
      const m1 = parseFloat(params.mass1)
      const v1 = parseFloat(params.velocity1)
      const m2 = parseFloat(params.mass2)
      const v2 = parseFloat(params.velocity2)
      assumption = 'Isolated 1D system, perfectly elastic collision, constant masses.'
      if (m1 <= 0 || m2 <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Both masses must be strictly positive.'
        domainInfo = 'Negative or zero mass is physically invalid.'
        violatedConstraint = m1 <= 0 ? 'm₁ ≤ 0 kg' : 'm₂ ≤ 0 kg'
        correctiveSuggestion = 'Enter strictly positive masses for both colliding bodies.'
      } else if (Math.abs(v1) >= c || Math.abs(v2) >= c) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Velocities cannot meet or exceed the speed of light.'
        domainInfo = 'Velocity violates relativistic limits.'
        violatedConstraint = Math.abs(v1) >= c ? '|v₁| ≥ c' : '|v₂| ≥ c'
        correctiveSuggestion = 'Enter velocities below the speed of light.'
      } else if (Math.abs(v1) > 0.1 * c || Math.abs(v2) > 0.1 * c) {
        status = 'extreme'
        reason = 'Relativistic speeds. Standard Galilean momentum conservation is inaccurate; relativistic momentum required.'
        correctiveSuggestion = 'Consider velocities below 0.1c to apply classical momentum conservation.'
      } else if (m1 > 10000 || m2 > 10000) {
        status = 'extreme'
        reason = 'Extreme masses involved. Structural disintegration likely upon collision.'
        correctiveSuggestion = 'Consider reducing masses to prevent structural failure.'
      } else if (Math.abs(v1) > 1000 || Math.abs(v2) > 1000) {
        status = 'extreme'
        reason = 'Very high velocities; standard collision would lead to thermal explosion or deformation.'
        correctiveSuggestion = 'Consider velocities below 1000 m/s to neglect high-impact deformation.'
      }
      break
    }
    case 'circular': {
      const m = parseFloat(params.mass)
      const v = parseFloat(params.velocity)
      const r = parseFloat(params.radius)
      assumption = 'Rigid planar circular path, constant speed, uniform centripetal force.'
      if (m <= 0 || r <= 0 || v < 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Mass and radius must be positive. Velocity cannot be negative.'
        domainInfo = 'Values outside mathematical definitions.'
        violatedConstraint = m <= 0 ? 'm ≤ 0 kg' : r <= 0 ? 'r ≤ 0 m' : 'v < 0 m/s'
        correctiveSuggestion = 'Provide positive values for mass and radius, and a non-negative velocity.'
      } else if (v >= c) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Velocity cannot exceed the speed of light.'
        domainInfo = 'Velocity violates relativity.'
        violatedConstraint = 'v ≥ c'
        correctiveSuggestion = 'Ensure the circular velocity is below the speed of light.'
      } else if (v > 1000) {
        status = 'extreme'
        reason = `Velocity (${v.toFixed(0)} m/s) is extremely high. Huge centripetal acceleration: ${(v*v/r).toExponential(2)} m/s².`
        correctiveSuggestion = 'Consider lowering velocity to reduce centrifugal stress.'
      } else if (r < 0.01) {
        status = 'extreme'
        reason = 'Microscopic radius. Molecular or quantum confinement effects dominate.'
        correctiveSuggestion = 'Increase radius above 1 cm for macroscopic kinematics.'
      }
      break
    }
    case 'gravitation': {
      const m1 = parseFloat(params.planetMass || params.mass1)
      const m2 = parseFloat(params.satMass || params.mass2)
      const r = parseFloat(params.orbRadius || params.distance)
      assumption = 'Two isolated point masses, classical Newtonian gravity, neglecting relativistic spacetime curvature.'
      const realM1 = m1 * 1e24
      const realR = r * 1e6

      if (m1 <= 0 || m2 <= 0 || r <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Masses and distance must be strictly positive.'
        domainInfo = 'Negative/zero mass or distance is physically invalid.'
        violatedConstraint = m1 <= 0 ? 'm₁ ≤ 0 kg' : m2 <= 0 ? 'm₂ ≤ 0 kg' : 'r ≤ 0 m'
        correctiveSuggestion = 'Provide positive values for planet mass, satellite mass, and distance.'
      } else {
        const G = 6.6743e-11
        const r_s = (2 * G * realM1) / (c * c)
        if (realR < r_s) {
          status = 'unrealistic'
          isRealistic = false
          domainPassed = false
          reason = `Orbital radius (${r.toFixed(2)} ×10⁶ m) is inside the event horizon (Schwarzschild radius = ${(r_s/1e6).toFixed(4)} ×10⁶ m) of the central mass.`
          domainInfo = 'Spacetime singularity. Object collapses into black hole.'
          violatedConstraint = 'r < r_s'
          correctiveSuggestion = 'Increase the orbital radius beyond the Schwarzschild event horizon.'
        } else if (realR < r_s * 3) {
          status = 'extreme'
          reason = `Orbital radius is close to the innermost stable circular orbit (ISCO = ${(3*r_s/1e6).toFixed(4)} ×10⁶ m). General Relativistic corrections mandatory.`
          correctiveSuggestion = 'Increase orbital distance to apply Newtonian approximations.'
        } else if (m1 > 1e6) {
          status = 'extreme'
          reason = `Mass 1 (${m1.toExponential(2)} ×10²⁴ kg) represents a supermassive black hole or star.`
          correctiveSuggestion = 'Consider reducing central mass for standard planetary setups.'
        }
      }
      break
    }
    case 'newton': {
      const m = parseFloat(params.mass)
      const f = parseFloat(params.force)
      assumption = 'Frictionless surface, constant mass, rigid object.'
      if (m <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Mass must be strictly positive.'
        domainInfo = 'Zero or negative mass is physically invalid.'
        violatedConstraint = 'm ≤ 0 kg'
        correctiveSuggestion = 'Enter a positive mass value.'
      } else if (m > 1e7) {
        status = 'extreme'
        reason = `Mass (${m.toExponential(2)} kg) is mega-scale. Extremely high inertia.`
        correctiveSuggestion = 'Consider reducing mass below 10,000,000 kg.'
      } else if (Math.abs(f) > 1e8) {
        status = 'extreme'
        reason = `Force (${f.toExponential(2)} N) is extremely large (rocket thrust scale).`
        correctiveSuggestion = 'Consider force below 10⁸ N to simulate terrestrial dynamics.'
      }
      break
    }
    case 'hooke': {
      const k = parseFloat(params.springConstant)
      const x = parseFloat(params.displacement)
      assumption = 'Perfect linear spring, negligible spring mass, constant k, within elastic limit.'
      if (k <= 0 || x <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Spring constant and displacement must be strictly positive.'
        domainInfo = 'Non-positive parameters are physically invalid.'
        violatedConstraint = k <= 0 ? 'k ≤ 0 N/m' : 'x ≤ 0 m'
        correctiveSuggestion = 'Enter strictly positive values for both spring stiffness and extension.'
      } else if (x > 5.0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = `Displacement (${x.toFixed(2)} m) exceeds structural limits of typical springs, causing permanent deformation.`
        domainInfo = 'Spring exceeded elastic limit (plastic regime).'
        violatedConstraint = 'x > 5.0 m'
        correctiveSuggestion = 'Set the displacement below 5.0 m to keep the spring within its elastic limit.'
      } else if (k > 50000) {
        status = 'extreme'
        reason = `Spring constant (${k.toFixed(0)} N/m) is extremely high (industrial suspension scale).`
        correctiveSuggestion = 'Consider spring constant below 50,000 N/m.'
      }
      break
    }
    case 'shm': {
      const amp = parseFloat(params.amplitude)
      const freq = parseFloat(params.frequency)
      assumption = 'No damping/friction, small-angle approximation for pendulums, stable potential well.'
      if (amp <= 0 || freq <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Amplitude and frequency must be strictly positive.'
        domainInfo = 'Non-positive amplitude/frequency is physically invalid.'
        violatedConstraint = amp <= 0 ? 'A ≤ 0 m' : 'f ≤ 0 Hz'
        correctiveSuggestion = 'Enter positive values for oscillation amplitude and frequency.'
      } else if (freq > 500) {
        status = 'extreme'
        reason = `Frequency (${freq.toFixed(0)} Hz) is in the audible acoustic range. Rapid vibrations.`
        correctiveSuggestion = 'Use a frequency below 500 Hz for standard visual simulation.'
      }
      break
    }
    case 'bernoulli': {
      const v1 = parseFloat(params.velocity1)
      const p1 = parseFloat(params.pressure1)
      const areaRatio = parseFloat(params.areaRatio)
      assumption = 'Incompressible, inviscid fluid, steady-state flow, constant temperature.'
      if (v1 <= 0 || p1 <= 0 || areaRatio <= 0 || areaRatio > 1) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Velocity, pressure, and area ratio must be positive. Area ratio cannot exceed 1.'
        domainInfo = 'Values violate fluid continuity boundaries.'
        violatedConstraint = v1 <= 0 ? 'v₁ ≤ 0 m/s' : p1 <= 0 ? 'p₁ ≤ 0 Pa' : areaRatio <= 0 ? 'A_ratio ≤ 0' : 'A_ratio > 1'
        correctiveSuggestion = 'Provide positive values for pressure/velocity, and an area ratio strictly between 0 and 1.'
      } else {
        const rho = 1000
        const v2 = v1 / areaRatio
        const p2 = p1 + 0.5 * rho * (v1 * v1 - v2 * v2)
        if (p2 < 0) {
          status = 'unrealistic'
          isRealistic = false
          domainPassed = false
          reason = `Cavitation limit exceeded: Outlet pressure drops to negative absolute value (${(p2/1000).toFixed(1)} kPa). Fluid would vaporize.`
          domainInfo = 'Absolute pressure cannot be negative in a stable liquid.'
          violatedConstraint = 'p₂ < 0 Pa'
          correctiveSuggestion = 'Increase inlet pressure or decrease the inlet velocity to avoid cavitation.'
        } else if (v2 > 100) {
          status = 'extreme'
          reason = `Outlet velocity (${v2.toFixed(1)} m/s) is high. Compressibility effects may dominate, violating incompressible flow assumption.`
          correctiveSuggestion = 'Consider reducing velocity or increasing area ratio to keep flow sub-sonic.'
        }
      }
      break
    }
    case 'reynolds_num':
    case 'reynolds': {
      const rho = parseFloat(params.density)
      const v = parseFloat(params.velocity)
      const L = parseFloat(params.charLen || params.length)
      const mu = parseFloat(params.viscosity)
      assumption = 'Newtonian fluid, steady flow, continuous medium.'
      if (rho <= 0 || v <= 0 || L <= 0 || mu <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Density, velocity, length, and viscosity must be strictly positive.'
        domainInfo = 'Non-positive fluid parameters are physically invalid.'
        violatedConstraint = rho <= 0 ? 'ρ ≤ 0 kg/m³' : v <= 0 ? 'v ≤ 0 m/s' : L <= 0 ? 'L ≤ 0 m' : 'μ ≤ 0 Pa·s'
        correctiveSuggestion = 'Ensure all density, velocity, length, and viscosity parameters are positive.'
      } else {
        const Re = (rho * v * L) / mu
        if (Re > 1e8) {
          status = 'extreme'
          reason = `Reynolds number (${Re.toExponential(2)}) is extremely large. Fully turbulent, shockwaves and compressibility might occur.`
          correctiveSuggestion = 'Reduce velocity or length to simulate standard turbulent flow.'
        } else if (Re < 1e-3) {
          status = 'extreme'
          reason = `Reynolds number (${Re.toExponential(2)}) is extremely small (creeping/Stokes flow). Inertial forces are negligible.`
          correctiveSuggestion = 'Increase velocity or pipe dimensions for classical flow regimes.'
        }
      }
      break
    }
    case 'navier': {
      const viscosity = parseFloat(params.viscosity)
      const velocity = parseFloat(params.velocity)
      assumption = 'Incompressible viscous flow, Newtonian fluid, no-slip boundaries.'
      if (viscosity <= 0 || velocity <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Viscosity and velocity must be strictly positive.'
        domainInfo = 'Non-positive parameters are physically invalid.'
        violatedConstraint = viscosity <= 0 ? 'μ ≤ 0 Pa·s' : 'v ≤ 0 m/s'
        correctiveSuggestion = 'Provide positive numbers for fluid viscosity and flow speed.'
      } else if (viscosity > 1000) {
        status = 'extreme'
        reason = `Viscosity (${viscosity.toFixed(0)} Pa·s) is extremely high (pitch/tar scale).`
        correctiveSuggestion = 'Consider viscosity below 1,000 Pa·s for standard liquid calculations.'
      }
      break
    }
    case 'continuity': {
      const pipeRatio = parseFloat(params.pipeRatio)
      assumption = 'Steady-state incompressible flow, mass conservation.'
      if (pipeRatio <= 0 || pipeRatio > 1) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Constriction ratio must be between 0 and 1.'
        domainInfo = 'Pipe ratio must be in range (0, 1].'
        violatedConstraint = pipeRatio <= 0 ? 'ratio ≤ 0' : 'ratio > 1'
        correctiveSuggestion = 'Provide a pipe ratio between 0 and 1.'
      } else if (pipeRatio < 0.05) {
        status = 'extreme'
        reason = `Extremely narrow constriction (${(pipeRatio*100).toFixed(1)}%). Causes speedup of ${(1/(pipeRatio*pipeRatio)).toFixed(0)}×, leading to immense turbulence.`
      }
      break
    }
    case 'coulomb': {
      const q1 = parseFloat(params.charge1)
      const q2 = parseFloat(params.charge2)
      const dist = parseFloat(params.distance)
      assumption = 'Point charges in vacuum, electrostatic forces only, no dielectric medium polarization.'
      if (dist <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Separation distance must be positive.'
        domainInfo = 'Distance must be > 0.'
      } else {
        if (Math.abs(q1) > 10000 || Math.abs(q2) > 10000) {
          status = 'extreme'
          reason = 'Charges are extremely large. Lightning-level electrostatic fields would trigger air breakdown.'
        } else if (dist < 1e-3) {
          status = 'extreme'
          reason = `Distance is very small (${(dist*1000).toFixed(3)} mm). Casimir or quantum effects might interfere.`
        }
      }
      break
    }
    case 'lorentzforce': {
      const q = parseFloat(params.charge)
      const v = parseFloat(params.velocity)
      const B = parseFloat(params.magneticField)
      const m = parseFloat(params.mass)
      assumption = 'Uniform magnetic field, vacuum environment, neglecting radiative energy loss.'
      if (m <= 0 || v < 0 || q === 0 || B === 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = B === 0 ? 'Magnetic field must be non-zero.' : (q === 0 ? 'Charge must be non-zero for electromagnetic force.' : 'Mass must be strictly positive and velocity cannot be negative.')
        violatedConstraint = B === 0 ? 'B = 0 T' : (q === 0 ? 'q = 0 C' : (m <= 0 ? 'm ≤ 0 kg' : 'v < 0 m/s'))
        correctiveSuggestion = B === 0 ? 'Enter a non-zero magnetic field.' : (q === 0 ? 'Enter a non-zero charge.' : 'Enter positive mass and velocity.')
      } else if (v >= c) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Velocity cannot exceed or equal the speed of light.'
        violatedConstraint = 'v ≥ c'
        correctiveSuggestion = 'Ensure velocity is below the speed of light.'
      } else {
        if (v > 0.8 * c) {
          status = 'extreme'
          reason = `Velocity is close to the speed of light (${(v/c*100).toFixed(1)}% c). Relativistic effects must be factored in.`
        } else if (Math.abs(B) > 50) {
          status = 'extreme'
          reason = `Magnetic field (${B.toFixed(1)} T) is extremely strong, similar to magnetar-like fields.`
        }
      }
      break
    }
    case 'ohm': {
      const v = parseFloat(params.voltage)
      const r = parseFloat(params.resistance)
      assumption = 'Ohmic conductor, constant temperature (no Joule heating resistance changes).'
      if (r <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Invalid resistance: resistance must be greater than 0 Ω'
        domainInfo = 'Zero or negative resistance is physically invalid.'
        violatedConstraint = 'R <= 0'
        correctiveSuggestion = 'Please enter a resistance greater than 0 Ω.'
      } else if (v <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Invalid voltage: voltage must be greater than 0 V'
        domainInfo = 'Zero or negative voltage is physically invalid.'
        violatedConstraint = 'V <= 0'
        correctiveSuggestion = 'Please enter a voltage greater than 0 V.'
      } else if (r < 0.5) {
        status = 'extreme'
        reason = `Very low resistance (${r} Ω) represents a short circuit. Current is high: ${(v/r).toFixed(1)} A.`
      } else if (v > 10000) {
        status = 'extreme'
        reason = `Voltage (${v} V) is high voltage scale. Risk of electrical arc discharge.`
      }
      break
    }
    case 'rc_circuit': {
      const v = parseFloat(params.voltage)
      const r = parseFloat(params.resistance)
      const cap = parseFloat(params.capacitance)
      assumption = 'Ideal capacitor (no leakage), constant resistance, standard DC source.'
      if (r <= 0 || cap <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Resistance and capacitance must be strictly positive.'
        domainInfo = 'Non-positive R or C is physically invalid.'
      } else if (r * cap < 1e-6) {
        status = 'extreme'
        reason = `Time constant τ is extremely small (${(r*cap*1e6).toFixed(3)} μs). Hard to measure classically.`
      }
      break
    }
    case 'maxwell1': {
      const q = parseFloat(params.charge)
      assumption = 'Isolated charge in vacuum, static electric field, spherical gaussian surface.'
      if (Math.abs(q) > 10000) {
        status = 'extreme'
        reason = `Charge (${q} nC) is high. Leads to extremely high electric fields.`
      }
      break
    }
    case 'faraday': {
      const bField = parseFloat(params.bField)
      const freq = parseFloat(params.freq)
      assumption = 'Ideal single-loop coil, perpendicular magnetic field oscillating harmonically.'
      if (freq <= 0 || bField <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Magnetic field and frequency must be strictly positive.'
        domainInfo = 'Negative or zero field/frequency is invalid.'
      } else if (freq > 1e5) {
        status = 'extreme'
        reason = `High frequency (${(freq/1e3).toFixed(1)} kHz). Inductive reactance and electromagnetic radiation effects dominate.`
      }
      break
    }
    case 'idealgas': {
      const n = parseFloat(params.moles)
      const t = parseFloat(params.temperature)
      const vol = parseFloat(params.volume)
      assumption = 'Ideal gas law: point-like non-interacting particles. Deviates at high density or cold temperatures.'
      if (n <= 0 || t <= 0 || vol <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Moles, temperature, and volume must be strictly positive.'
        domainInfo = 'Kelvin temperature, moles, and volume must be > 0.'
      } else if (t < 20) {
        status = 'extreme'
        reason = `Temperature (${t.toFixed(1)} K) is near absolute zero. Most gases liquefy or solidify, violating ideal gas assumptions.`
      } else if (t > 10000) {
        status = 'extreme'
        reason = `Temperature (${t.toFixed(0)} K) is extreme. Gas would ionize into plasma.`
      }
      break
    }
    case 'boltzmann': {
      const t = parseFloat(params.temperature)
      assumption = 'Distinguishable non-interacting particles in thermal equilibrium (Maxwell-Boltzmann limit).'
      if (t <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Temperature must be strictly positive.'
        domainInfo = 'Absolute temperature must be > 0 K.'
      } else if (t < 1) {
        status = 'extreme'
        reason = `Temperature (${t.toFixed(2)} K) is extremely low. Quantum statistics (Fermi-Dirac or Bose-Einstein) dominate.`
      }
      break
    }
    case 'heat': {
      const alpha = parseFloat(params.diffusivity)
      const L = parseFloat(params.length)
      const T = params.temperature !== undefined && params.temperature !== null && params.temperature !== '' ? parseFloat(params.temperature) : null
      const TUnit = params.tempUnit || 'C'

      assumption = 'Homogeneous material, constant diffusivity α, 1D heat flow, insulated boundaries.'

      if (alpha <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Thermal diffusivity must be greater than zero for heat diffusion.'
        domainInfo = 'Thermal diffusivity must be greater than zero for heat diffusion.'
        violatedConstraint = 'α ≤ 0'
        correctiveSuggestion = 'Enter a positive thermal diffusivity value.'
      } else if (L <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Length must be strictly positive.'
        domainInfo = 'Rod length must be > 0.'
        violatedConstraint = 'L ≤ 0'
        correctiveSuggestion = 'Enter a positive length value.'
      } else if (T !== null && ((TUnit === 'C' && T < -273.15) || (TUnit === 'K' && T < 0))) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Temperature cannot be below absolute zero.'
        domainInfo = 'Temperature cannot be below absolute zero.'
        violatedConstraint = TUnit === 'C' ? 'T < -273.15 °C' : 'T < 0 K'
        correctiveSuggestion = 'Enter a temperature above or equal to absolute zero.'
      } else if (alpha > 0.1) {
        status = 'extreme'
        reason = `Diffusivity (${alpha} m²/s) is extremely high. Heat diffuses almost instantly.`
      }
      break
    }
    case 'entropy': {
      const t = parseFloat(params.temp || params.temperature)
      assumption = 'Ideal gas particles in a 2D container, thermodynamic equilibrium.'
      if (t <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Temperature must be strictly positive.'
        domainInfo = 'T must be > 0 K.'
      }
      break
    }
    case 'schrodinger': {
      const n = parseFloat(params.quantumNumber)
      const L = parseFloat(params.wellWidth)
      assumption = 'Infinite 1D potential well of width L, zero potential inside.'
      if (n < 1 || !Number.isInteger(n) || (params.wellWidth !== undefined && L <= 0)) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = L <= 0 ? 'Well width must be strictly positive.' : 'Quantum energy state n must be a positive integer.'
        violatedConstraint = L <= 0 ? 'L > 0 m' : 'n ≥ 1'
        correctiveSuggestion = L <= 0 ? 'Enter a positive width for the potential well.' : 'Enter an integer quantum number.'
      } else if (n > 50) {
        status = 'extreme'
        reason = `Energy level n = ${n} is very high. State converges to classical behavior (Correspondence Principle).`
      }
      break
    }
    case 'uncertainty': {
      const dx = parseFloat(params.position)
      const dp = parseFloat(params.momentum)
      assumption = 'Heisenberg uncertainty product: σₓ·σₚ ≥ ℏ/2 (simulated with ℏ = 1, so limit is 0.5).'
      if (dx <= 0 || dp <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Uncertainties in position and momentum must be strictly positive.'
        domainInfo = 'Standard deviations must be > 0.'
      } else {
        const product = dx * dp
        if (product < 0.5) {
          status = 'unrealistic'
          isRealistic = false
          domainPassed = false
          reason = `Heisenberg uncertainty principle violated: product σₓ·σₚ = ${product.toFixed(3)} is less than ℏ/2 (0.50).`
          domainInfo = 'Quantum mechanics forbids uncertainty products below ℏ/2.'
        } else if (product > 100) {
          status = 'extreme'
          reason = `Large uncertainty product (${product.toFixed(0)}). Highly uncoherent or mixed quantum state.`
        }
      }
      break
    }
    case 'debroglie': {
      const m = parseFloat(params.mass)
      const v = parseFloat(params.velocity)
      assumption = 'Matter-wave duality, non-relativistic momentum (p = mv).'
      if (m <= 0 || v <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Mass and velocity must be strictly positive.'
        domainInfo = 'm > 0 and v > 0.'
      } else if (v >= c) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Velocity cannot exceed or equal the speed of light.'
        domainInfo = 'Velocity violates relativistic limit.'
      } else {
        const h = 6.626e-34
        const lambda = h / (m * v)
        if (m > 1e-10) {
          status = 'extreme'
          reason = `Particle mass (${m.toExponential(2)} kg) is macroscopic. Wavelength (λ = ${lambda.toExponential(2)} m) is immeasurably small.`
        } else if (v > 0.8 * c) {
          status = 'extreme'
          reason = 'Relativistic speeds. De Broglie wavelength calculation requires relativistic momentum.'
        }
      }
      break
    }
    case 'photoelectric': {
      const f = parseFloat(params.frequency)
      const phi = parseFloat(params.workFunction)
      assumption = 'Einstein\'s photoelectric model: quantum energy transfer, single-electron interactions.'
      if (f <= 0 || phi <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Incident frequency and work function must be strictly positive.'
        domainInfo = 'f > 0 and phi > 0.'
      } else {
        const h = 6.626e-34
        const eV = 1.602e-19
        const photonE = (h * f) / eV
        if (f > 1e17) {
          status = 'extreme'
          reason = `Frequency (${f.toExponential(2)} Hz) is in the X-ray/Gamma-ray band. Compton scattering dominates.`
        } else if (phi > 15) {
          status = 'extreme'
          reason = `Work function (${phi.toFixed(1)} eV) is extremely high (core shell electron ionization scale).`
        }
      }
      break
    }
    case 'lorentz': {
      const v = parseFloat(params.velocity)
      assumption = 'Special relativity: flat Minkowski spacetime, inertial frames, speed of light c is constant.'
      if (v < 0 || v >= 1.0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Relative velocity must be between 0 (stationary) and 1.0 (speed of light).'
        domainInfo = 'v/c must satisfy 0 <= v/c < 1.0.'
      } else if (v > 0.99) {
        status = 'extreme'
        reason = `Ultra-relativistic speed (${(v*100).toFixed(3)}% c). Kinetic energy approaches infinity.`
      }
      break
    }
    case 'einstein': {
      const m = parseFloat(params.mass)
      assumption = 'Complete conversion of rest mass into pure radiation energy.'
      if (m <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Rest mass must be strictly positive.'
        domainInfo = 'm > 0.'
      } else if (m > 10000) {
        status = 'extreme'
        reason = `Mass (${m.toFixed(0)} kg) converted fully to energy yields ${(m*c*c).toExponential(2)} J, equivalent to massive thermonuclear scales.`
      }
      break
    }
    case 'wave': {
      const mode = parseFloat(params.frequency)
      const tension = parseFloat(params.waveSpeed)
      const amp = parseFloat(params.amplitude)
      assumption = 'Ideal 1D string with fixed boundary conditions, linear wave propagation.'
      if (mode <= 0 || tension <= 0 || amp <= 0) {
        status = 'unrealistic'
        isRealistic = false
        domainPassed = false
        reason = 'Mode, speed/tension, and amplitude must be strictly positive.'
        domainInfo = 'Inputs must be greater than zero.'
      } else if (mode > 8) {
        status = 'extreme'
        reason = `Extremely high harmonic mode (${mode}). Higher frequency modes undergo heavy mechanical dispersion.`
      } else if (tension > 5.0) {
        status = 'extreme'
        reason = `Wave speed (${tension.toFixed(1)} m/s) is high. Violates typical classical string model assumptions.`
      } else if (amp > 80) {
        status = 'extreme'
        reason = `Amplitude (${amp.toFixed(0)} mm) is extremely large for string wave mechanics, causing non-linear tension spikes.`
      }
      break
    }
    default:
      break
  }

  if (typeof window !== 'undefined') {
    window.__pinn_last_status = status;
  }

  return {
    status,
    reason,
    isRealistic,
    violatedConstraint: domainPassed ? (violatedConstraint || null) : (violatedConstraint || domainInfo),
    correctiveSuggestion: correctiveSuggestion || (status === 'unrealistic' ? 'Correct the invalid fields in the Inputs card to resume the simulation.' : null),
    checklist: {
      params: { passed: true, info: 'All required parameters provided.' },
      units: { passed: true, info: unitInfo },
      domain: { passed: domainPassed, info: domainPassed ? 'Values within acceptable physics domain.' : domainInfo },
      assumptions: assumption
    }
  }
}
