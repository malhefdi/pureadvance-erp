/**
 * Pure Advance Bioprocess Engineering Calculator
 * 
 * All calculations based on established bioprocess engineering correlations.
 * References:
 * - Van't Riet (1979) for kLa correlations
 * - Shuler & Kargi, "Bioprocess Engineering" 
 * - Doran, "Bioprocess Engineering Principles"
 * - Garcia-Ochoa & Gomez (2009) for OTR
 */

// ============================================================
// CONSTANTS
// ============================================================

export const CONSTANTS = {
  g: 9.81,              // m/s²
  rho_water: 998,       // kg/m³ at 25°C
  mu_water: 8.9e-4,     // Pa·s at 25°C
  O2_solubility: 7.8,   // mg/L at 25°C, 1 atm in water
  O2_mol_weight: 32,    // g/mol
  N2_mol_weight: 28,    // g/mol
  air_O2_fraction: 0.21,
  air_N2_fraction: 0.79,
  R: 8.314,             // J/(mol·K)
  atm_pressure: 101325, // Pa
};

// ============================================================
// SCALE-UP CALCULATOR
// ============================================================

export interface BioreactorGeometry {
  volume: number;        // L (working volume)
  tankDiameter: number;  // m
  impellerDiameter: number; // m
  impellerType: 'rushton' | 'pitched_blade' | 'marine' | 'hydrofoil';
  numImpellers: number;
  rpm: number;
  gasFlowRate: number;   // vvm (volume of gas per volume of liquid per minute)
}

export interface ScaleUpResult {
  criterion: string;
  labValue: number;
  prodValue: number;
  targetRPM: number;
  notes: string;
  unit: string;
}

/**
 * Power number (Np) for different impeller types
 * Reference: Hemrajani & Tatterson (2004)
 */
export function getPowerNumber(type: string): number {
  const Np: Record<string, number> = {
    rushton: 5.0,
    pitched_blade: 1.27,
    marine: 0.35,
    hydrofoil: 0.3,
  };
  return Np[type] || 5.0;
}

/**
 * Calculate ungassed power input: P = Np × ρ × N³ × Di⁵
 */
export function calcUngassedPower(
  Np: number,
  rho: number,
  N: number,    // rps
  Di: number    // m
): number {
  return Np * rho * Math.pow(N, 3) * Math.pow(Di, 5); // Watts
}

/**
 * Hughmark (1967) correlation for gassed power reduction
 * Pg/P ≈ 0.157 * log(P²/(N*Di³*Qg)) + ...
 * Simplified: Pg ≈ 0.5 * P for typical operating conditions
 */
export function calcGassedPower(ungassedPower: number, gasFlowM3s: number, N: number, Di: number): number {
  const Qa = gasFlowM3s / (N * Math.pow(Di, 3)); // aeration number
  if (Qa < 0.01) return ungassedPower * 0.6;
  // Hughmark approximation
  const ratio = Math.max(0.3, Math.min(0.7, 0.6 - 0.1 * Math.log10(Qa + 0.01)));
  return ungassedPower * ratio;
}

/**
 * Superficial gas velocity: vs = Q / A
 */
export function calcSuperficialGasVelocity(
  gasFlowRateM3s: number,
  tankDiameterM: number
): number {
  const area = (Math.PI / 4) * Math.pow(tankDiameterM, 2);
  return gasFlowRateM3s / area; // m/s
}

/**
 * Van't Riet (1979) kLa correlation for non-coalescing systems
 * kLa = 0.002 × (P/V)^0.7 × (vs)^0.2  [s⁻¹]
 * 
 * For coalescing systems (air/water):
 * kLa = 0.026 × (P/V)^0.4 × (vs)^0.5  [s⁻¹]
 */
export function calcKLaVanTRiet(
  PV: number,      // W/m³
  vs: number,      // m/s
  coalescing: boolean = false
): number {
  if (coalescing) {
    return 0.026 * Math.pow(PV, 0.4) * Math.pow(vs, 0.5); // s⁻¹
  }
  return 0.002 * Math.pow(PV, 0.7) * Math.pow(vs, 0.2); // s⁻¹
}

/**
 * Garcia-Ochoa & Gomez (2009) kLa — more accurate for viscous systems
 */
export function calcKLaGarciaOchoa(
  PV: number,      // W/m³
  vs: number,      // m/s
  viscosity: number = 0.001 // Pa·s (default: water)
): number {
  const viscRatio = Math.pow(CONSTANTS.mu_water / viscosity, 0.84);
  return 0.0232 * Math.pow(PV, 0.464) * Math.pow(vs, 0.442) * viscRatio; // s⁻¹
}

/**
 * OTR (Oxygen Transfer Rate): OTR = kLa × (C* - CL)
 * C* = saturated O₂ concentration
 * CL = dissolved O₂ concentration
 */
export function calcOTR(
  kLa: number,     // s⁻¹
  Cstar: number,   // mg/L (saturated)
  CL: number       // mg/L (current DO)
): number {
  return kLa * (Cstar - CL); // mg/(L·s)
}

/**
 * OUR (Oxygen Uptake Rate) typical values:
 * E. coli HCDC: 10-20 mmol O₂/(L·h)
 * Bt (Bacillus thuringiensis): 5-15 mmol O₂/(L·h)
 * CHO cells: 1-5 mmol O₂/(L·h)
 * Yeast: 5-10 mmol O₂/(L·h)
 */

/**
 * Calculate all scale-up criteria for lab → production
 */
export function calcScaleUp(
  lab: BioreactorGeometry,
  prod: BioreactorGeometry
): ScaleUpResult[] {
  const results: ScaleUpResult[] = [];

  const _scaleRatio = prod.volume / lab.volume;
  const labV_L = lab.volume;
  const prodV_L = prod.volume;
  const labV = labV_L / 1000; // m³
  const prodV = prodV_L / 1000;

  const labN = lab.rpm / 60; // rps
  const prodN_current = prod.rpm / 60;
  const labNp = getPowerNumber(lab.impellerType);
  const prodNp = getPowerNumber(prod.impellerType);
  const rho = CONSTANTS.rho_water;

  const labP = calcUngassedPower(labNp, rho, labN, lab.impellerDiameter);
  const prodP_current = calcUngassedPower(prodNp, rho, prodN_current, prod.impellerDiameter);

  const _labPV = labP / labV;
  const _prodPV_current = prodP_current / prodV;

  // Lab gas flow
  const labQ = lab.gasFlowRate * labV_L / 1000 / 60; // m³/s
  const prodQ_current = prod.gasFlowRate * prodV_L / 1000 / 60;

  const labVs = calcSuperficialGasVelocity(labQ, lab.tankDiameter);
  const prodVs_current = calcSuperficialGasVelocity(prodQ_current, prod.tankDiameter);

  const labPg = calcGassedPower(labP, labQ, labN, lab.impellerDiameter);
  const labPgV = labPg / labV;

  const prodPg = calcGassedPower(prodP_current, prodQ_current, prodN_current, prod.impellerDiameter);
  const prodPgV = prodPg / prodV;

  // Criterion 1: Constant P/V (gassed)
  const targetRPM_PV = prod.rpm * Math.pow(labPgV / (prodPgV || labPgV), 1/3);
  results.push({
    criterion: 'Constant P/V (gassed)',
    labValue: labPgV,
    prodValue: labPgV, // target: match lab
    targetRPM: Math.round(targetRPM_PV),
    notes: 'Most common for aerobic fermentations. Maintains similar mixing & mass transfer.',
    unit: 'W/m³',
  });

  // Criterion 2: Constant tip speed (π × Di × N)
  const labTipSpeed = Math.PI * lab.impellerDiameter * labN;
  const targetRPM_tipSpeed = (labTipSpeed / (Math.PI * prod.impellerDiameter)) * 60;
  results.push({
    criterion: 'Constant Tip Speed',
    labValue: labTipSpeed,
    prodValue: labTipSpeed,
    targetRPM: Math.round(targetRPM_tipSpeed),
    notes: 'Avoids shear damage at scale. Good for shear-sensitive cells.',
    unit: 'm/s',
  });

  // Criterion 3: Constant kLa
  const lab_kLa = calcKLaVanTRiet(labPgV, labVs, false);
  // Need to find RPM that gives same kLa in production
  // Iterate: try different RPMs and find matching kLa
  let bestRPM_kLa = prod.rpm;
  let bestDiff = Infinity;
  for (let testRPM = 50; testRPM <= 1500; testRPM += 5) {
    const testN = testRPM / 60;
    const testP = calcUngassedPower(prodNp, rho, testN, prod.impellerDiameter);
    const testPg = calcGassedPower(testP, prodQ_current, testN, prod.impellerDiameter);
    const testPgV = testPg / prodV;
    const test_kLa = calcKLaVanTRiet(testPgV, prodVs_current, false);
    const diff = Math.abs(test_kLa - lab_kLa);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestRPM_kLa = testRPM;
    }
  }
  results.push({
    criterion: 'Constant kLa',
    labValue: lab_kLa,
    prodValue: lab_kLa,
    targetRPM: bestRPM_kLa,
    notes: 'Maintains oxygen transfer capability. Critical for aerobic processes like Bt.',
    unit: 's⁻¹',
  });

  // Criterion 4: Constant Re (Reynolds number)
  const labRe = (rho * labN * Math.pow(lab.impellerDiameter, 2)) / CONSTANTS.mu_water;
  const targetRPM_Re = (labRe * CONSTANTS.mu_water) / (rho * Math.pow(prod.impellerDiameter, 2)) * 60;
  results.push({
    criterion: 'Constant Reynolds Number',
    labValue: labRe,
    prodValue: labRe,
    targetRPM: Math.round(targetRPM_Re),
    notes: 'Maintains flow regime. Often gives very low RPM at large scale.',
    unit: 'dimensionless',
  });

  // Criterion 5: Constant mixing time
  // θ_m ≈ 5.3 / (N × (Di/Dt)²) for turbulent regime
  const labMixTime = 5.3 / (labN * Math.pow(lab.impellerDiameter / lab.tankDiameter, 2));
  const targetRPM_mixTime = (5.3 / labMixTime) / Math.pow(prod.impellerDiameter / prod.tankDiameter, 2) * 60;
  results.push({
    criterion: 'Constant Mixing Time',
    labValue: labMixTime,
    prodValue: labMixTime,
    targetRPM: Math.round(Math.min(targetRPM_mixTime, 1500)),
    notes: 'Ensures uniformity. May require very high RPM at production scale.',
    unit: 'seconds',
  });

  // Criterion 6: Constant tip speed + max power limit
  const maxPowerDensity = 5000; // W/m³ practical limit
  const maxRPM_power = Math.pow(
    (maxPowerDensity * prodV) / (prodNp * rho * Math.pow(prod.impellerDiameter, 5)),
    1/3
  ) * 60;
  results.push({
    criterion: 'Max Power Limit',
    labValue: labPgV,
    prodValue: maxPowerDensity,
    targetRPM: Math.round(Math.min(maxRPM_power, 1500)),
    notes: 'Practical power constraint. Prevents motor overload at scale.',
    unit: 'W/m³',
  });

  return results;
}

// ============================================================
// MEDIA ESTIMATOR
// ============================================================

export interface MediaComponent {
  name: string;
  concentration_gL: number;  // g/L
  cost_per_kg: number;       // $/kg
  supplier: string;
  stock_kg: number;
  reorder_point_kg: number;
}

export interface BatchPlan {
  volume_L: number;
  numBatches: number;
  feedVolumePercent: number; // % of batch volume
  feedMediaCostPerL: number; // $/L
}

export interface MediaCostResult {
  component: string;
  gPerBatch: number;
  kgPerBatch: number;
  costPerBatch: number;
  kgPerYear: number;
  costPerYear: number;
  stockStatus: 'ok' | 'low' | 'critical';
}

export function calcMediaCost(
  components: MediaComponent[],
  plan: BatchPlan
): MediaCostResult[] {
  return components.map(c => {
    const gPerBatch = c.concentration_gL * plan.volume_L;
    const kgPerBatch = gPerBatch / 1000;
    const costPerBatch = kgPerBatch * c.cost_per_kg;
    const kgPerYear = kgPerBatch * plan.numBatches;
    const costPerYear = costPerBatch * plan.numBatches;
    const batchesUntilReorder = c.stock_kg / kgPerBatch;

    let stockStatus: 'ok' | 'low' | 'critical' = 'ok';
    if (batchesUntilReorder < plan.numBatches * 0.25) stockStatus = 'critical';
    else if (batchesUntilReorder < plan.numBatches * 0.5) stockStatus = 'low';

    return {
      component: c.name,
      gPerBatch: Math.round(gPerBatch * 100) / 100,
      kgPerBatch: Math.round(kgPerBatch * 1000) / 1000,
      costPerBatch: Math.round(costPerBatch * 100) / 100,
      kgPerYear: Math.round(kgPerYear * 100) / 100,
      costPerYear: Math.round(costPerYear * 100) / 100,
      stockStatus,
    };
  });
}

// ============================================================
// SENSOR SELECTION ENGINE
// ============================================================

export interface SensorCriteria {
  scale: 'lab' | 'pilot' | 'production' | 'commercial';
  modality: 'microbial' | 'mammalian' | 'cell_therapy' | 'viral_vector';
  vesselType: 'stainless' | 'single_use';
  parameters: ('DO' | 'pH' | 'CO2' | 'biomass' | 'glucose' | 'temperature' | 'pressure' | 'offgas')[];
  environment: 'rd' | 'gmp' | 'clinical';
  budget: 'low' | 'medium' | 'high';
}

export interface SensorRecommendation {
  sensor: string;
  category: string;
  score: number;
  priority: 'essential' | 'recommended' | 'optional';
  vendors: string[];
  priceRange: string;
  notes: string;
}

export function selectSensors(criteria: SensorCriteria): SensorRecommendation[] {
  const sensors: SensorRecommendation[] = [];

  // Base scores
  const scaleWeight = { lab: 1, pilot: 1.5, production: 2, commercial: 2.5 };
  const envWeight = { rd: 1, gmp: 2, clinical: 2.5 };
  const sw = scaleWeight[criteria.scale];
  const ew = envWeight[criteria.environment];

  // DO Sensor
  if (criteria.parameters.includes('DO')) {
    sensors.push({
      sensor: 'Optical DO (PreSens/Hamilton)',
      category: 'Dissolved Oxygen',
      score: 10 * sw,
      priority: 'essential',
      vendors: ['PreSens', 'Hamilton', 'Mettler Toledo', 'Broadley-James'],
      priceRange: '$800–$2,500',
      notes: 'Preferred for single-use. No drift, no calibration needed per batch.',
    });
    sensors.push({
      sensor: 'Polarographic DO (Clark electrode)',
      category: 'Dissolved Oxygen',
      score: 6 * sw,
      priority: criteria.vesselType === 'stainless' ? 'recommended' : 'optional',
      vendors: ['Mettler Toledo', 'Hamilton', 'Broadley-James'],
      priceRange: '$500–$1,500',
      notes: 'Traditional. Requires polarization time, membrane replacement.',
    });
  }

  // pH Sensor
  if (criteria.parameters.includes('pH')) {
    sensors.push({
      sensor: 'Gel-filled pH (Hamilton Polilyte Plus)',
      category: 'pH',
      score: 10 * sw * ew,
      priority: 'essential',
      vendors: ['Hamilton', 'Mettler Toledo', 'Endress+Hauser'],
      priceRange: '$400–$1,200',
      notes: 'Industry standard. 2-point calibration before each batch.',
    });
    if (criteria.scale === 'production' || criteria.scale === 'commercial') {
      sensors.push({
        sensor: 'In-line pH with auto-calibration',
        category: 'pH',
        score: 8 * sw,
        priority: 'recommended',
        vendors: ['Hamilton', 'Mettler Toledo'],
        priceRange: '$2,000–$5,000',
        notes: 'Reduces operator intervention. GMP-preferred.',
      });
    }
  }

  // CO2
  if (criteria.parameters.includes('CO2')) {
    sensors.push({
      sensor: 'Off-gas CO₂ (NDIR analyzer)',
      category: 'CO₂ / Off-gas',
      score: 7 * sw,
      priority: criteria.modality === 'mammalian' ? 'essential' : 'recommended',
      vendors: ['BlueSens', 'Yokogawa', 'ABB'],
      priceRange: '$3,000–$8,000',
      notes: 'Essential for RQ calculation. Connected to exit gas line.',
    });
    sensors.push({
      sensor: 'Dissolved CO₂ (InPro 5000i)',
      category: 'CO₂ / Dissolved',
      score: 5 * sw,
      priority: 'optional',
      vendors: ['Mettler Toledo', 'PreSens'],
      priceRange: '$3,000–$6,000',
      notes: 'Important for mammalian cells. CO₂ accumulation affects growth.',
    });
  }

  // Biomass
  if (criteria.parameters.includes('biomass')) {
    sensors.push({
      sensor: 'Capacitance biomass (Aber Futura)',
      category: 'Biomass',
      score: 9 * sw,
      priority: criteria.modality === 'mammalian' || criteria.modality === 'cell_therapy' ? 'essential' : 'recommended',
      vendors: ['Aber Instruments', 'Fogale'],
      priceRange: '$8,000–$15,000',
      notes: 'Measures viable cell density in real-time. Best for mammalian/perfusion.',
    });
    sensors.push({
      sensor: 'NIR probe (inline)',
      category: 'Biomass / PAT',
      score: 6 * sw,
      priority: criteria.environment === 'gmp' ? 'recommended' : 'optional',
      vendors: ['Metrohm (NIRS)', 'Thermo Fisher', 'FOSS'],
      priceRange: '$15,000–$30,000',
      notes: 'Multi-parameter: biomass, glucose, lactate. Requires calibration model.',
    });
    sensors.push({
      sensor: 'Turbidity (optical density)',
      category: 'Biomass',
      score: 7 * sw,
      priority: criteria.modality === 'microbial' ? 'recommended' : 'optional',
      vendors: ['Mettler Toledo', 'Hamilton', 'Optek'],
      priceRange: '$2,000–$5,000',
      notes: 'Simple, robust for microbial. Less accurate at high cell density.',
    });
  }

  // Glucose / metabolites (Raman)
  if (criteria.parameters.includes('glucose')) {
    sensors.push({
      sensor: 'Raman spectroscopy (Kaiser/Endress+Hauser)',
      category: 'PAT — Glucose & Metabolites',
      score: 7 * sw * ew,
      priority: criteria.environment === 'gmp' ? 'recommended' : 'optional',
      vendors: ['Kaiser Optical (E+H)', 'Tornado Spectral', 'Rigaku'],
      priceRange: '$50,000–$120,000',
      notes: 'Real-time glucose, lactate, glutamine, ammonia. High CAPEX but transformative for fed-batch control.',
    });
  }

  // Temperature
  if (criteria.parameters.includes('temperature')) {
    sensors.push({
      sensor: 'Pt100 RTD temperature probe',
      category: 'Temperature',
      score: 10 * sw,
      priority: 'essential',
      vendors: ['All bioreactor vendors', 'Endress+Hauser'],
      priceRange: '$100–$500',
      notes: 'Standard. Included with all bioreactor systems.',
    });
  }

  // Pressure
  if (criteria.parameters.includes('pressure')) {
    sensors.push({
      sensor: 'In-line pressure transmitter',
      category: 'Pressure',
      score: 6 * sw,
      priority: criteria.scale === 'production' ? 'recommended' : 'optional',
      vendors: ['Endress+Hauser', 'Yokogawa', 'ABB'],
      priceRange: '$500–$2,000',
      notes: 'Needed for headspace pressure control, vessel integrity.',
    });
  }

  // Off-gas O2
  if (criteria.parameters.includes('offgas')) {
    sensors.push({
      sensor: 'Off-gas O₂ (paramagnetic/zirconia)',
      category: 'Off-gas Analysis',
      score: 8 * sw,
      priority: 'recommended',
      vendors: ['BlueSens', 'Yokogawa', 'ABB', 'Servomex'],
      priceRange: '$3,000–$8,000',
      notes: 'Enables CER/OUR calculation and RQ for metabolic monitoring.',
    });
  }

  return sensors.sort((a, b) => b.score - a.score);
}

// ============================================================
// SEED TRAIN PLANNER
// ============================================================

export interface SeedStage {
  stage: number;
  vesselType: string;
  volume_L: number;
  expansionRatio: number;
  duration_h: number;
  vesselCount: number;
  temp_C: number;
  rpm: number;
}

export function planSeedTrain(
  targetVolume_L: number,
  seedRatio: number = 10,  // typical 1:10 expansion
  stages: number = 3       // vial → flask → seed BR → production
): SeedStage[] {
  const plan: SeedStage[] = [];
  let currentVol = targetVolume_L;

  // Work backwards from production volume
  for (let i = stages; i >= 1; i--) {
    const prevVol = currentVol / seedRatio;
    let vesselType: string;
    let rpm: number;
    const temp = 30;

    if (i === 1) {
      vesselType = 'Shake Flask';
      rpm = 200;
    } else if (i === 2) {
      vesselType = 'Seed Bioreactor';
      rpm = 300;
    } else {
      vesselType = 'Seed Bioreactor';
      rpm = 300;
    }

    plan.unshift({
      stage: i,
      vesselType,
      volume_L: Math.round(currentVol * 10) / 10,
      expansionRatio: seedRatio,
      duration_h: i === 1 ? 24 : i === 2 ? 16 : 12,
      vesselCount: Math.ceil(currentVol / (currentVol)), // single vessel per stage typically
      temp_C: temp,
      rpm,
    });

    currentVol = prevVol;
  }

  // Add vial thaw stage
  plan.unshift({
    stage: 0,
    vesselType: 'Cryovial (1-2 mL)',
    volume_L: 0.002,
    expansionRatio: 1,
    duration_h: 0,
    vesselCount: 1,
    temp_C: -80,
    rpm: 0,
  });

  return plan;
}

// ============================================================
// FERMENTATION ECONOMICS (COGS)
// ============================================================

export interface COGSInputs {
  // Direct materials
  mediaCostPerBatch: number;
  inoculumCostPerBatch: number;
  utilitiesCostPerBatch: number;  // steam, water, power, gas
  consumablesCostPerBatch: number; // filters, gaskets, probes
  
  // Labor
  operatorCount: number;
  operatorCostPerHour: number;
  batchDurationHours: number;
  shiftsPerDay: number;
  
  // Overhead
  facilityCostPerMonth: number;
  maintenanceCostPerMonth: number;
  depreciationPerMonth: number;
  
  // Yield
  batchVolume_L: number;
  yield_gL: number;
  batchesPerYear: number;
}

export interface COGSResult {
  directMaterials: number;
  directLabor: number;
  utilities: number;
  overhead: number;
  totalPerBatch: number;
  costPerGram: number;
  costPerLiter: number;
  annualCost: number;
  annualYield_kg: number;
  breakdown: { category: string; amount: number; percent: number }[];
}

export function calcCOGS(inputs: COGSInputs): COGSResult {
  const directMaterials = inputs.mediaCostPerBatch + inputs.inoculumCostPerBatch + inputs.consumablesCostPerBatch;
  const directLabor = inputs.operatorCount * inputs.operatorCostPerHour * inputs.batchDurationHours;
  const utilities = inputs.utilitiesCostPerBatch;
  const monthlyOverhead = inputs.facilityCostPerMonth + inputs.maintenanceCostPerMonth + inputs.depreciationPerMonth;
  const overheadPerBatch = (monthlyOverhead * 12) / inputs.batchesPerYear;
  
  const totalPerBatch = directMaterials + directLabor + utilities + overheadPerBatch;
  const totalYield_g = inputs.batchVolume_L * inputs.yield_gL;
  const costPerGram = totalYield_g > 0 ? totalPerBatch / totalYield_g : 0;
  const costPerLiter = totalPerBatch / inputs.batchVolume_L;
  const annualCost = totalPerBatch * inputs.batchesPerYear;
  const annualYield_kg = (totalYield_g * inputs.batchesPerYear) / 1000;

  const breakdown = [
    { category: 'Direct Materials', amount: Math.round(directMaterials), percent: Math.round((directMaterials / totalPerBatch) * 100) },
    { category: 'Direct Labor', amount: Math.round(directLabor), percent: Math.round((directLabor / totalPerBatch) * 100) },
    { category: 'Utilities', amount: Math.round(utilities), percent: Math.round((utilities / totalPerBatch) * 100) },
    { category: 'Overhead', amount: Math.round(overheadPerBatch), percent: Math.round((overheadPerBatch / totalPerBatch) * 100) },
  ];

  return {
    directMaterials: Math.round(directMaterials),
    directLabor: Math.round(directLabor),
    utilities: Math.round(utilities),
    overhead: Math.round(overheadPerBatch),
    totalPerBatch: Math.round(totalPerBatch),
    costPerGram: Math.round(costPerGram * 1000) / 1000,
    costPerLiter: Math.round(costPerLiter * 100) / 100,
    annualCost: Math.round(annualCost),
    annualYield_kg: Math.round(annualYield_kg * 100) / 100,
    breakdown,
  };
}

// ============================================================
// GAS MIXING CALCULATOR
// ============================================================

export interface GasBlendInput {
  targetO2Percent: number;    // % in headspace
  targetAirFlow: number;      // L/min
  enrichmentNeeded: boolean;
}

export interface GasBlendResult {
  pureO2Flow: number;         // L/min
  airFlow: number;            // L/min
  totalFlow: number;          // L/min
  actualO2Percent: number;    // %
  costPerHour: number;        // $ (assuming O2 at $0.10/L)
  savingsVsFullEnrichment: number;
}

export function calcGasBlend(targetO2Percent: number, totalFlowLpm: number): GasBlendResult {
  // Air is 21% O2, pure O2 is 100%
  // We need: (air_F × 0.21 + O2_F × 1.0) / total = target%
  // air_F + O2_F = total

  const o2CostPerLiter = 0.00017; // ~$0.10/m³ or $0.0001/L

  if (targetO2Percent <= 21) {
    // No enrichment needed, just air
    return {
      pureO2Flow: 0,
      airFlow: totalFlowLpm,
      totalFlow: totalFlowLpm,
      actualO2Percent: 21,
      costPerHour: 0,
      savingsVsFullEnrichment: 0,
    };
  }

  // Solve: air × 0.21 + O2 × 1.0 = target% × total
  // air + O2 = total
  // Substitute: air = total - O2
  // (total - O2) × 0.21 + O2 × 1.0 = target% × total
  // total × 0.21 - O2 × 0.21 + O2 = target% × total
  // total × 0.21 + O2 × 0.79 = target% × total
  // O2 = (target% × total - total × 0.21) / 0.79

  const o2Flow = (targetO2Percent / 100 * totalFlowLpm - 0.21 * totalFlowLpm) / 0.79;
  const airFlow = totalFlowLpm - o2Flow;
  const actualO2 = ((airFlow * 0.21 + o2Flow * 1.0) / totalFlowLpm) * 100;
  const costPerHour = o2Flow * 60 * o2CostPerLiter;
  const fullEnrichCost = totalFlowLpm * 60 * o2CostPerLiter;

  return {
    pureO2Flow: Math.round(o2Flow * 100) / 100,
    airFlow: Math.round(airFlow * 100) / 100,
    totalFlow: totalFlowLpm,
    actualO2Percent: Math.round(actualO2 * 10) / 10,
    costPerHour: Math.round(costPerHour * 100) / 100,
    savingsVsFullEnrichment: Math.round((fullEnrichCost - costPerHour) * 100) / 100,
  };
}

// ============================================================
// GROWTH KINETICS
// ============================================================

export interface GrowthParams {
  muMax: number;          // h⁻¹ (max specific growth rate)
  X0: number;             // g/L (initial biomass)
  Ks: number;             // g/L (Monod constant)
  S0: number;             // g/L (initial substrate)
  Yxs: number;            // g/g (yield coefficient)
}

export interface GrowthResult {
  time_h: number;
  biomass_gL: number;
  substrate_gL: number;
  specificRate_h: number;
  doublingTime_h: number;
}

/**
 * Simple Monod growth model (batch)
 * dX/dt = mu_max × S/(Ks + S) × X
 * dS/dt = -1/Yxs × dX/dt
 */
export function simulateGrowth(params: GrowthParams, duration_h: number, dt: number = 0.1): GrowthResult[] {
  const results: GrowthResult[] = [];
  let X = params.X0;
  let S = params.S0;
  let t = 0;

  while (t <= duration_h && S > 0.01) {
    const mu = params.muMax * (S / (params.Ks + S));
    const dX = mu * X * dt;
    const dS = -(1 / params.Yxs) * dX;

    X += dX;
    S += dS;
    if (S < 0) S = 0;

    results.push({
      time_h: Math.round(t * 100) / 100,
      biomass_gL: Math.round(X * 1000) / 1000,
      substrate_gL: Math.round(S * 1000) / 1000,
      specificRate_h: Math.round(mu * 10000) / 10000,
      doublingTime_h: mu > 0 ? Math.round((Math.LN2 / mu) * 100) / 100 : Infinity,
    });

    t += dt;
  }

  return results;
}

// ============================================================
// STERILIZATION (F0 CALCULATOR)
// ============================================================

export interface SterilizationInput {
  temperature_C: number;
  zValue: number;     // °C (typically 10°C)
  DValue: number;     // minutes at reference temp (typically 121°C)
  targetLogReduction: number; // typically 12 for sterility
}

export interface SterilizationResult {
  F0_minutes: number;
  requiredTime_minutes: number;
  equivalentTimeAt121C: number;
}

export function calcF0(input: SterilizationInput): SterilizationResult {
  // F0 = D121 × log reduction target
  const F0 = input.DValue * input.targetLogReduction;
  
  // t = F0 × 10^((121 - T) / z)
  const requiredTime = F0 * Math.pow(10, (121 - input.temperature_C) / input.zValue);

  return {
    F0_minutes: Math.round(F0 * 100) / 100,
    requiredTime_minutes: Math.round(requiredTime * 100) / 100,
    equivalentTimeAt121C: F0,
  };
}
