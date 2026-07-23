import { classifyAndExtract } from '../src/lib/physicsClassifier.js';

const tests = [
  "A ball is thrown at 55° with initial velocity 60 km/h.",
  "A charged particle moves at 0.9c in a magnetic field.",
  "A particle moves at 1.2c."
];

for (const t of tests) {
  console.log("-----------------------------------------");
  console.log("INPUT:", t);
  const res = classifyAndExtract(t);
  console.log("Detected Branch:", res.detectedBranches.map(b => b.label));
  console.log("Primary Equation:", res.primaryEquation?.name, `(Confidence: ${Math.round(res.primaryEquation?.confidence * 100)}%)`);
  console.log("Extracted Params:", res.extractedParams?.params);
  console.log("Details:", JSON.stringify(res.extractedParams?.paramDetails, null, 2));
}
