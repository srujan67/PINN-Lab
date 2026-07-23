// ══════════════════════════════════════════════════════════════════
//  PHYSICS PROBLEM CLASSIFIER — AI-Enhanced Semantic Matching
// ══════════════════════════════════════════════════════════════════

import { getInterpretation, getPrimaryResultField, calculateResult, extractParameters, EQUATION_PARAMS } from './parameterExtractor.js'
import {
  correctSpelling,
  classifyWithConfidence,
  generateSelectionExplanation,
  generateResultExplanation,
  generatePhysicsInsight,
  generateFollowUpQuestions,
  generateProfessionalError,
} from './physicsAI.js'

export const PHYSICS_KNOWLEDGE_DB = [
  {
    id: 'schrodinger',
    branch: 'quantum',
    branchLabel: 'Quantum Mechanics',
    name: 'Schrödinger Equation',
    formula: 'iℏ ∂ψ/∂t = Ĥψ',
    keywords: ['schrodinger', 'schrödinger', 'wavefunction', 'wave function', 'quantum', 'probability amplitude', 'hamiltonian', 'state', 'potential well'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'uncertainty',
    branch: 'quantum',
    branchLabel: 'Quantum Mechanics',
    name: 'Heisenberg Uncertainty',
    formula: 'σₓ σₚ ≥ ℏ/2',
    keywords: ['uncertainty', 'heisenberg', 'position', 'momentum', 'precision', 'delta x', 'delta p'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'wave',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: 'Wave Equation',
    formula: '∂²u/∂t² = c² ∇²u',
    keywords: ['wave', 'frequency', 'amplitude', 'vibration', 'string', 'oscillation', 'wavelength', 'speed', 'propagate'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'newton',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: "Newton's Second Law",
    formula: 'F = ma',
    keywords: ['force', 'push', 'pull', 'accelerate', 'net force', 'tension', 'friction', 'applied force', 'mass', 'acceleration', 'elevator', 'rocket'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'heat',
    branch: 'thermo',
    branchLabel: 'Thermodynamics',
    name: 'Heat Equation',
    formula: '∂T/∂t = α ∇²T',
    keywords: ['diffusivity', 'heat', 'temperature', 'diffusion', 'thermal', 'cooling', 'heating', 'conduction', 'rod', 'plate'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'entropy',
    branch: 'thermo',
    branchLabel: 'Thermodynamics',
    name: 'Entropy — Second Law',
    formula: 'dS ≥ dQ/T',
    keywords: ['entropy', 'disorder', 'thermodynamic', 'heat transfer', 'second law', 'isolated system'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'navier',
    branch: 'fluid',
    branchLabel: 'Fluid Mechanics',
    name: 'Navier–Stokes',
    formula: 'ρ(∂u/∂t + u·∇u) = −∇p + μ∇²u',
    keywords: ['navier', 'stokes', 'viscosity', 'viscous', 'fluid', 'pressure gradient', 'flow', 'velocity vector'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'continuity',
    branch: 'fluid',
    branchLabel: 'Fluid Mechanics',
    name: 'Continuity Equation',
    formula: '∂ρ/∂t + ∇·(ρu) = 0',
    keywords: ['continuity', 'flow rate', 'conservation of mass', 'pipe ratio', 'area ratio', 'contraction', 'velocity ratio'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'maxwell1',
    branch: 'em',
    branchLabel: 'Electromagnetism',
    name: "Maxwell — Gauss's Law",
    formula: '∇·E = ρ/ε₀',
    keywords: ['maxwell', 'gauss', 'electric flux', 'charge density', 'permittivity', 'enclosed charge'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'faraday',
    branch: 'em',
    branchLabel: 'Electromagnetism',
    name: "Faraday's Law",
    formula: '∇×E = −∂B/∂t',
    keywords: ['faraday', 'induction', 'induced emf', 'electromotive', 'magnetic flux', 'coil', 'loop'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'lorentz',
    branch: 'relativity',
    branchLabel: 'Relativity',
    name: 'Lorentz Factor',
    formula: 'γ = 1/√(1−v²/c²)',
    keywords: ['lorentz factor', 'gamma', 'time dilation', 'length contraction', 'relativity', 'speed of light', 'relativistic'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'einstein',
    branch: 'relativity',
    branchLabel: 'Relativity',
    name: 'Mass–Energy Equivalence',
    formula: 'E = mc²',
    keywords: ['einstein', 'mass-energy', 'equivalence', 'e=mc2', 'mc2', 'nuclear', 'fission', 'fusion', 'mass energy'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'boltzmann',
    branch: 'statistical',
    branchLabel: 'Statistical Mech',
    name: 'Boltzmann Distribution',
    formula: 'P ∝ e^(−E/k_BT)',
    keywords: ['boltzmann', 'distribution', 'probability', 'microstate', 'thermal energy', 'temperature', 'occupy', 'state'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'projectile',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: 'Projectile Motion',
    formula: "y = v₀t sinθ − ½gt²\nR = (v₀² sin(2θ))/g\nH = (v₀² sin²θ)/(2g)",
    keywords: ['projectile', 'angle', 'velocity', 'throw', 'launch', 'kick', 'trajectory', 'airborne', 'cannon', 'ball', 'stone', 'arrow', 'range', 'flight', 'parabola'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'energy',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: 'Conservation of Energy',
    formula: 'KE + PE = E_total',
    keywords: ['energy', 'potential', 'kinetic', 'height', 'fall', 'drop', 'ramp', 'roller coaster', 'frictionless', 'gravity', 'inclined plane', 'free fall'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'momentum',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: 'Momentum',
    formula: 'p = mv',
    keywords: ['momentum', 'velocity', 'mass', 'speed', 'moving', 'travelling', 'collision', 'impact', 'crash', 'car', 'truck', 'football', 'bullet', 'rocket', 'impulse', 'collide', 'recoil', 'billiards', 'hit', 'strike'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'circular',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: 'Circular Motion',
    formula: 'F = mv²/r',
    keywords: ['circular', 'centripetal', 'force', 'radius', 'velocity', 'orbit', 'rotate', 'spin', 'turn', 'curve', 'loop'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'gravitation',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: 'Universal Gravitation',
    formula: 'F = Gm₁m₂/r²',
    keywords: ['gravitation', 'gravity', 'attraction', 'force', 'mass1', 'mass2', 'distance', 'planet', 'moon', 'orbit'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'bernoulli',
    branch: 'fluid',
    branchLabel: 'Fluid Mechanics',
    name: 'Bernoulli Equation',
    formula: 'P + ½ρv² + ρgh = const',
    keywords: ['bernoulli', 'fluid', 'pressure', 'velocity', 'density', 'height', 'flow', 'lift', 'venturi'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'reynolds_num',
    branch: 'fluid',
    branchLabel: 'Fluid Mechanics',
    name: 'Reynolds Number',
    formula: 'Re = ρvL/μ',
    keywords: ['reynolds', 'number', 'laminar', 'turbulent', 'flow', 'viscosity', 'density', 'velocity', 'length'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'coulomb',
    branch: 'em',
    branchLabel: 'Electromagnetism',
    name: "Coulomb's Law",
    formula: 'F = kq₁q₂/r²',
    keywords: ['coulomb', 'electrostatic', 'force', 'charge1', 'charge2', 'distance', 'attract', 'repel'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'lorentzforce',
    branch: 'em',
    branchLabel: 'Electromagnetism',
    name: 'Lorentz Force',
    formula: 'F = qv × B',
    keywords: ['charge', 'charged', 'electron', 'proton', 'ion', 'magnetic', 'electric', 'tesla', 'field', 'current', 'velocity', 'lorentz', 'deflection', 'cyclotron'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'idealgas',
    branch: 'thermo',
    branchLabel: 'Thermodynamics',
    name: 'Ideal Gas Law',
    formula: 'PV = nRT',
    keywords: ['gas', 'ideal gas', 'pressure', 'volume', 'temperature', 'moles', 'piston', 'balloon', 'expand', 'compress'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'hooke',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: "Hooke's Law",
    formula: 'F = −kx',
    keywords: ['hooke', 'spring', 'constant', 'displacement', 'force', 'stretch', 'compress', 'restoring'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'shm',
    branch: 'classical',
    branchLabel: 'Classical Mechanics',
    name: 'Simple Harmonic Motion',
    formula: 'x = A cos(ωt + φ)',
    keywords: ['shm', 'harmonic', 'motion', 'amplitude', 'frequency', 'period', 'oscillation', 'pendulum', 'vibrate'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'ohm',
    branch: 'em',
    branchLabel: 'Electromagnetism',
    name: "Ohm's Law",
    formula: 'V = IR',
    keywords: ['ohm', 'ohms', 'voltage', 'current', 'resistance', 'resistor', 'battery', 'circuit'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'debroglie',
    branch: 'quantum',
    branchLabel: 'Quantum Mechanics',
    name: 'de Broglie Wavelength',
    formula: 'λ = h/p = h/(mv)',
    keywords: ['de broglie', 'wavelength', 'momentum', 'mass', 'velocity', 'particle', 'wave-particle'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'photoelectric',
    branch: 'quantum',
    branchLabel: 'Quantum Mechanics',
    name: 'Photoelectric Effect',
    formula: 'KE = hf − φ',
    keywords: ['photoelectric', 'effect', 'frequency', 'work function', 'kinetic energy', 'photon', 'metal', 'electron', 'eject'],
    synonyms: {}, applications: [], relatedEquations: []
  },
  {
    id: 'rc_circuit',
    branch: 'em',
    branchLabel: 'Electromagnetism',
    name: 'RC Circuit Charging',
    formula: 'V_c(t) = V₀(1 − e^(−t/RC))',
    keywords: ['rc circuit', 'capacitor', 'resistor', 'charging', 'discharging', 'time constant', 'capacitance'],
    synonyms: {}, applications: [], relatedEquations: []
  }
];

export function classifyProblem(text) {
  // Step 1: Spelling correction
  const { correctedText } = correctSpelling(text)
  const workingText = correctedText || text

  // Step 2: AI classification
  const { primary, related } = classifyWithConfidence(workingText)

  if (!primary || primary.confidence < 10) {
    const velRegex = /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(km\/h|km\/hr|km\/hour|kmph|m\/s|mps|c)\b/i;
    const match = workingText.match(velRegex);
    if (match) {
      return {
        detectedBranches: [{ id: 'relativity', label: 'Velocity / Relativity Validation' }],
        detectedEquations: [],
        recommendedSimulations: [],
        primaryEquation: null,
        relatedEquations: []
      };
    }
    return { detectedBranches: [], detectedEquations: [], recommendedSimulations: [], primaryEquation: null };
  }

  const entry = PHYSICS_KNOWLEDGE_DB.find(e => e.id === primary.id);

  // Build related equations list from confidence scoring
  const relatedEntries = related
    .map(r => PHYSICS_KNOWLEDGE_DB.find(e => e.id === r.id))
    .filter(Boolean)

  return {
    detectedBranches: [{ id: entry.branch, label: entry.branchLabel }],
    detectedEquations: [entry],
    recommendedSimulations: [{ id: entry.id, name: entry.name, formula: entry.formula }],
    primaryEquation: entry,
    relatedEquations: relatedEntries,
    confidence: primary.confidence,
  };
}

export function classifyAndExtract(text) {
  // ── Step 1: Spelling Correction ──
  const { correctedText, corrections: spellingCorrections } = correctSpelling(text)
  const workingText = correctedText || text

  // ── Step 2: AI Classification with Confidence ──
  const { primary, related } = classifyWithConfidence(workingText)

  // Handle no-match / velocity-only case
  if (!primary || primary.confidence < 10) {
    const velRegex = /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(km\/h|km\/hr|km\/hour|kmph|m\/s|mps|c)\b/i;
    const match = workingText.match(velRegex);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      const c = 299792458;
      let v_m_s = val;
      
      if (unit.startsWith('km/h') || unit === 'km/hr' || unit === 'km/hour' || unit === 'kmph') {
        v_m_s = val / 3.6;
      } else if (unit === 'c') {
        v_m_s = val * c;
      }
      
      let status = 'REALISTIC';
      let validationMessage = '';
      
      if (v_m_s < 0) {
        status = 'INVALID';
        validationMessage = 'Speed cannot be negative.';
      } else if (v_m_s >= c) {
        status = 'UNREALISTIC / INVALID';
        validationMessage = 'The supplied values violate known physical laws. Velocity exceeds or equals the speed of light.';
      } else if (v_m_s >= 0.9 * c) {
        status = 'EXTREME BUT POSSIBLE';
        validationMessage = 'Velocity is in the relativistic regime. Classical mechanics does not apply.';
      } else {
        if (unit === 'c') {
          status = 'RELATIVISTIC REGIME';
        } else {
          status = 'REALISTIC';
        }
        
        let displayUnit = unit;
        if (unit.startsWith('km/h') || unit === 'km/hr' || unit === 'km/hour' || unit === 'kmph') {
          displayUnit = ' km/h';
        } else if (unit === 'c') {
          displayUnit = 'c';
        } else {
          displayUnit = ' ' + unit;
        }
        
        const formatted_v = unit === 'c' ? v_m_s.toFixed(1) : v_m_s.toFixed(2);
        validationMessage = `Velocity detected: ${val}${displayUnit} = ${formatted_v} m/s`;
      }
      
      const params = { velocity: v_m_s };
      const paramDetails = {
        velocity: {
          val: val,
          unit: unit.startsWith('km/h') || unit === 'km/hr' || unit === 'km/hour' || unit === 'kmph' ? 'km/h' : unit,
          siVal: v_m_s,
          siUnit: 'm/s',
          source: unit === 'm/s' ? 'User Input' : 'Converted to SI'
        }
      };
      
      const conversions = [
        { original: `${val} ${unit.startsWith('km/h') || unit === 'km/hr' || unit === 'km/hour' || unit === 'kmph' ? 'km/h' : unit}`, siValue: v_m_s, displayStr: `= ${v_m_s.toFixed(2)} m/s` }
      ];
      
      return {
        detectedBranches: [{ id: 'relativity', label: 'Velocity / Relativity Validation' }],
        detectedEquations: [],
        recommendedSimulations: [],
        primaryEquation: null,
        extractedParams: { params, paramDetails, conversions },
        validation: { valid: status === 'REALISTIC' || status === 'RELATIVISTIC REGIME', warnings: [validationMessage] },
        status,
        validationMessage,
        spellingCorrections,
      };
    }

    return {
      detectedBranches: [],
      detectedEquations: [],
      recommendedSimulations: [],
      primaryEquation: null,
      extractedParams: null,
      validation: { valid: false, warnings: ['The described topic is not supported by the current analysis engine.'] },
      status: 'UNSUPPORTED TOPIC',
      validationMessage: 'The described topic is not supported by the current analysis engine.',
      spellingCorrections,
    };
  }

  const moduleId = primary.id
  const entry = PHYSICS_KNOWLEDGE_DB.find(e => e.id === moduleId);

  // Build related equations from confidence scoring
  const relatedEntries = related
    .map(r => PHYSICS_KNOWLEDGE_DB.find(e => e.id === r.id))
    .filter(Boolean)

  // ── Step 3: Selection Explanation ──
  const selectionExplanation = generateSelectionExplanation(moduleId, primary.matchedConcepts)

  // Helper to enrich result with AI fields
  const enrichResult = (baseResult) => {
    // Generate professional error if applicable
    const professionalError = generateProfessionalError(
      baseResult.status,
      moduleId,
      baseResult.extractedParams?.params || {},
      baseResult.extractedParams?.paramDetails || {}
    )
    if (professionalError) {
      baseResult.validationMessage = professionalError
      if (baseResult.validation && baseResult.validation.warnings?.length > 0) {
        baseResult.validation.warnings = [professionalError]
      }
    }

    // Attach AI enrichments
    baseResult.spellingCorrections = spellingCorrections
    baseResult.confidence = primary.confidence
    baseResult.selectionExplanation = selectionExplanation
    baseResult.relatedEquations = relatedEntries

    // Only generate insights/followups/result explanation for valid inputs
    if (baseResult.status === 'VALID INPUT') {
      baseResult.physicsInsight = generatePhysicsInsight(moduleId)
      baseResult.followUpQuestions = generateFollowUpQuestions(moduleId, baseResult.extractedParams?.params || {})

      // Generate result explanation
      const calcResult = calculateResult(moduleId, baseResult.extractedParams?.params || {})
      if (calcResult && !calcResult.isPending) {
        baseResult.resultExplanation = generateResultExplanation(moduleId, baseResult.extractedParams?.params || {}, calcResult)
      }
    }

    return baseResult
  }

  // ── Step 4: Parameter Extraction ──
  const extracted = extractParameters(workingText, moduleId);
  const params = extracted.params || {};
  const paramDetails = extracted.paramDetails || {};
  const conversions = extracted.conversions || [];

  // SPECIAL CONSTANTS AND FALLBACKS
  if (moduleId === 'lorentzforce' && params.charge === undefined) {
    if (/electron/i.test(workingText)) {
      params.charge = -1.60218e-19;
      paramDetails.charge = { val: -1.60218e-19, unit: 'C', siVal: -1.60218e-19, siUnit: 'C', source: 'Default Constant' };
    } else if (/proton/i.test(workingText)) {
      params.charge = 1.60218e-19;
      paramDetails.charge = { val: 1.60218e-19, unit: 'C', siVal: 1.60218e-19, siUnit: 'C', source: 'Default Constant' };
    }
  }
  if (moduleId === 'heat' && params.length === undefined) {
    params.length = 1.0;
    paramDetails.length = { val: 1.0, unit: 'm', siVal: 1.0, siUnit: 'm', source: 'Default Constant' };
  }

  let status = 'VALID INPUT';
  let validationMessage = '';

  // VALIDATION CHECKS
  // 1. Negative Mass
  const massKeys = ['mass', 'mass1', 'mass2'];
  for (const k of massKeys) {
    if (params[k] !== undefined && params[k] !== null && params[k] < 0) {
      status = 'PHYSICALLY IMPOSSIBLE';
      validationMessage = 'Mass must be strictly positive.';
    }
  }

  // 2. Negative Height
  if (params.height !== undefined && params.height !== null && params.height < 0) {
    status = 'PHYSICALLY IMPOSSIBLE';
    validationMessage = 'Height cannot be negative.';
  }

  // 3. Negative Distance / Radius / Length
  const distKeys = ['distance', 'radius', 'length', 'displacement'];
  for (const k of distKeys) {
    if (params[k] !== undefined && params[k] !== null && params[k] < 0) {
      status = 'PHYSICALLY IMPOSSIBLE';
      validationMessage = 'Distance must be positive.';
    }
  }

  // 4. Velocity >= c
  const c = 299792458;
  const velKeys = ['velocity', 'velocity1', 'velocity2', 'waveSpeed'];
  for (const k of velKeys) {
    if (params[k] !== undefined && params[k] !== null) {
      const vVal = Math.abs(params[k]);
      if (vVal >= c) {
        status = 'PHYSICALLY IMPOSSIBLE';
        validationMessage = 'Velocity cannot exceed or equal the speed of light (2.998 × 10⁸ m/s).';
      } else if (vVal > 1000 && (moduleId === 'projectile' || moduleId === 'newton' || moduleId === 'momentum' || moduleId === 'circular')) {
        status = 'OUTSIDE MODEL VALIDITY RANGE';
        validationMessage = 'Velocity is outside the validity range of this model.';
      }
    }
  }

  // 5. Temperature below absolute zero
  if (params.temperature !== undefined && params.temperature !== null) {
    const unit = paramDetails.temperature?.unit || 'K';
    if (unit.toUpperCase() === 'C' && params.temperature < -273.15) {
      status = 'PHYSICALLY IMPOSSIBLE';
      validationMessage = 'Temperature cannot be below absolute zero.';
    } else if (unit.toUpperCase() === 'K' && params.temperature < 0) {
      status = 'PHYSICALLY IMPOSSIBLE';
      validationMessage = 'Temperature cannot be below absolute zero.';
    }
  }

  // Check if we are missing parameters to solve the equation
  if (status === 'VALID INPUT') {
    const calcResult = calculateResult(moduleId, params);
    if (calcResult && calcResult.isPending) {
      status = 'MISSING PARAMETER';
      const expectedParams = EQUATION_PARAMS[entry.id]?.params || [];
      const missing = expectedParams.filter(p => params[p] === undefined || params[p] === null || params[p] === "");
      
      if (missing.length === 1) {
        validationMessage = `Missing required parameter: ${missing[0].replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
      } else {
        validationMessage = `Missing required parameters: ${missing.map(p => p.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}.`;
      }
    }
  }

  const interpretation = getInterpretation(entry.id, params);
  const primaryResultField = getPrimaryResultField(entry.id);

  return enrichResult({
    detectedBranches: [{ id: entry.branch, label: entry.branchLabel }],
    detectedEquations: [entry],
    recommendedSimulations: [{ id: entry.id, name: entry.name, formula: entry.formula }],
    primaryEquation: entry,
    extractedParams: { params, paramDetails, conversions },
    validation: { valid: status === 'VALID INPUT', warnings: validationMessage ? [validationMessage] : [] },
    interpretation,
    primaryResultField,
    status,
    validationMessage
  });
}
