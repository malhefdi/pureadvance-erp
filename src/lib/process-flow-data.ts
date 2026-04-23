/**
 * Bioprocess Flow Data Model
 * 
 * ISA-88 aligned process definition for Bt biopesticide production.
 * Each stage has: duration, equipment, material I/O, parameters, QC gates.
 */

// ============================================================
// TYPES
// ============================================================

export type ZoneType = 'upstream' | 'downstream' | 'formulation' | 'qc' | 'packaging' | 'warehouse';

export interface MaterialIO {
  name: string;
  quantity: string;
  unit: string;
}

export interface ProcessParameter {
  name: string;
  setpoint: string;
  range: string;
  unit: string;
  critical: boolean;  // CQA/CPP
}

export interface QCGate {
  id: string;
  name: string;
  criteria: string[];
  passRate: number;  // % historical pass rate
}

export interface ProcessStage {
  id: string;
  name: string;
  shortName: string;
  zone: ZoneType;
  stepNumber: number;
  description: string;
  duration: { min: number; max: number; unit: string };
  equipment: string[];
  inputs: MaterialIO[];
  outputs: MaterialIO[];
  parameters: ProcessParameter[];
  qcGate?: QCGate;
  gmpCritical: boolean;  // CPP/CQA step
  holdTime?: string;     // Max hold time before next step
}

export interface MaterialFlow {
  from: string;
  to: string;
  material: string;
  quantity: string;
  method: string;  // 'pipe', 'manual', 'pneumatic', 'freeze'
}

export interface BatchStatus {
  batchId: string;
  currentStageId: string;
  startTime: string;
  progress: number;  // 0-100
  status: 'active' | 'waiting_qc' | 'on_hold' | 'complete';
}

// ============================================================
// ZONE COLORS
// ============================================================

export const ZONE_COLORS: Record<ZoneType, { bg: string; border: string; text: string; lane: string; label: string }> = {
  upstream: {
    bg: 'rgba(16, 185, 129, 0.06)',
    border: 'rgba(16, 185, 129, 0.25)',
    text: '#10b981',
    lane: '#064e3b',
    label: 'Upstream Fermentation',
  },
  downstream: {
    bg: 'rgba(59, 130, 246, 0.06)',
    border: 'rgba(59, 130, 246, 0.25)',
    text: '#3b82f6',
    lane: '#1e3a5f',
    label: 'Downstream Processing',
  },
  formulation: {
    bg: 'rgba(245, 158, 11, 0.06)',
    border: 'rgba(245, 158, 11, 0.25)',
    text: '#f59e0b',
    lane: '#78350f',
    label: 'Formulation & Blending',
  },
  qc: {
    bg: 'rgba(239, 68, 68, 0.06)',
    border: 'rgba(239, 68, 68, 0.25)',
    text: '#ef4444',
    lane: '#7f1d1d',
    label: 'Quality Control',
  },
  packaging: {
    bg: 'rgba(139, 92, 246, 0.06)',
    border: 'rgba(139, 92, 246, 0.25)',
    text: '#8b5cf6',
    lane: '#4c1d95',
    label: 'Packaging & Labeling',
  },
  warehouse: {
    bg: 'rgba(6, 182, 212, 0.06)',
    border: 'rgba(6, 182, 212, 0.25)',
    text: '#06b6d4',
    lane: '#164e63',
    label: 'Warehouse & Dispatch',
  },
};

// ============================================================
// PROCESS STAGES — Bt Biopesticide Production
// ============================================================

export const processStages: ProcessStage[] = [
  // === UPSTREAM ===
  {
    id: 'usp-mcb',
    name: 'Master Cell Bank Thaw',
    shortName: 'MCB Thaw',
    zone: 'upstream',
    stepNumber: 1,
    description: 'Thaw frozen MCB vial (-80°C) of Btk HD-1 strain. Aseptic transfer to seed medium.',
    duration: { min: 30, max: 60, unit: 'min' },
    equipment: ['Water bath', 'LAF hood'],
    inputs: [
      { name: 'MCB Vial', quantity: '1', unit: 'vial' },
      { name: 'Seed Medium', quantity: '500', unit: 'mL' },
    ],
    outputs: [
      { name: 'Seed Culture', quantity: '500', unit: 'mL' },
    ],
    parameters: [
      { name: 'Thaw Temp', setpoint: '37', range: '35-40', unit: '°C', critical: false },
    ],
    gmpCritical: false,
  },
  {
    id: 'usp-wcb',
    name: 'Working Cell Bank Prep',
    shortName: 'WCB Prep',
    zone: 'upstream',
    stepNumber: 2,
    description: 'Expand seed culture, create WCB aliquots. Freeze at -80°C for future runs.',
    duration: { min: 48, max: 72, unit: 'h' },
    equipment: ['Shaker incubator', '-80°C freezer'],
    inputs: [
      { name: 'Seed Culture', quantity: '500', unit: 'mL' },
      { name: 'Glycerol', quantity: '15', unit: '%' },
    ],
    outputs: [
      { name: 'WCB Vials', quantity: '50', unit: 'vials' },
    ],
    parameters: [
      { name: 'Temperature', setpoint: '30', range: '28-32', unit: '°C', critical: true },
      { name: 'Shaking Speed', setpoint: '200', range: '180-220', unit: 'rpm', critical: false },
    ],
    gmpCritical: false,
  },
  {
    id: 'usp-seed',
    name: 'Seed Bioreactor',
    shortName: 'Seed BR',
    zone: 'upstream',
    stepNumber: 3,
    description: 'Scale-up in 10L seed fermenter. Establish culture for production inoculum.',
    duration: { min: 24, max: 36, unit: 'h' },
    equipment: ['BR-001 (10L)'],
    inputs: [
      { name: 'WCB Inoculum', quantity: '100', unit: 'mL' },
      { name: 'Seed Medium', quantity: '8', unit: 'L' },
    ],
    outputs: [
      { name: 'Seed Broth', quantity: '8', unit: 'L' },
    ],
    parameters: [
      { name: 'Temperature', setpoint: '30', range: '28-32', unit: '°C', critical: true },
      { name: 'pH', setpoint: '7.0', range: '6.8-7.2', unit: 'pH', critical: true },
      { name: 'DO', setpoint: '30', range: '25-40', unit: '%', critical: true },
      { name: 'Agitation', setpoint: '300', range: '200-400', unit: 'rpm', critical: false },
    ],
    gmpCritical: true,
    holdTime: '< 4h before transfer',
  },
  {
    id: 'usp-prod',
    name: 'Production Bioreactor',
    shortName: 'Prod BR',
    zone: 'upstream',
    stepNumber: 4,
    description: 'Fed-batch fermentation at 500L scale. Glucose feed at 10h + 20h. Harvest at sporulation.',
    duration: { min: 72, max: 96, unit: 'h' },
    equipment: ['BR-003 (500L)'],
    inputs: [
      { name: 'Seed Broth', quantity: '8', unit: 'L' },
      { name: 'Production Medium', quantity: '400', unit: 'L' },
      { name: 'Glucose Feed', quantity: '50', unit: 'L' },
      { name: 'Antifoam', quantity: '500', unit: 'mL' },
    ],
    outputs: [
      { name: 'Harvest Broth', quantity: '450', unit: 'L' },
    ],
    parameters: [
      { name: 'Temperature', setpoint: '30', range: '28-32', unit: '°C', critical: true },
      { name: 'pH', setpoint: '7.0', range: '6.5-7.5', unit: 'pH', critical: true },
      { name: 'DO', setpoint: '30', range: '20-40', unit: '%', critical: true },
      { name: 'Pressure', setpoint: '0.5', range: '0.3-0.7', unit: 'bar', critical: false },
      { name: 'Agitation', setpoint: '350', range: '150-500', unit: 'rpm', critical: false },
    ],
    qcGate: {
      id: 'qc-sporulation',
      name: 'Sporulation Check',
      criteria: ['>90% sporulation', 'Crystal formation confirmed', 'pH stabilized'],
      passRate: 96,
    },
    gmpCritical: true,
  },

  // === DOWNSTREAM ===
  {
    id: 'dsp-harvest',
    name: 'Harvest Centrifugation',
    shortName: 'Harvest',
    zone: 'downstream',
    stepNumber: 5,
    description: 'Disc stack centrifuge. Separate spore/crystal pellet from broth. 10K-15K rpm.',
    duration: { min: 2, max: 4, unit: 'h' },
    equipment: ['Centrifuge C-001'],
    inputs: [
      { name: 'Harvest Broth', quantity: '450', unit: 'L' },
    ],
    outputs: [
      { name: 'Wet Pellet', quantity: '60-90', unit: 'kg' },
      { name: 'Centrate (waste)', quantity: '360-390', unit: 'L' },
    ],
    parameters: [
      { name: 'Bowl Speed', setpoint: '12000', range: '10000-15000', unit: 'rpm', critical: true },
      { name: 'Feed Rate', setpoint: '500', range: '300-700', unit: 'L/h', critical: false },
    ],
    gmpCritical: true,
    holdTime: '< 4h before drying',
  },
  {
    id: 'dsp-drying',
    name: 'Spray Drying',
    shortName: 'Spray Dry',
    zone: 'downstream',
    stepNumber: 6,
    description: 'Spray dry wet pellet. 175°C inlet, 70-80°C outlet. Target <8% moisture.',
    duration: { min: 4, max: 8, unit: 'h' },
    equipment: ['Spray Dryer DR-001'],
    inputs: [
      { name: 'Wet Pellet', quantity: '60-90', unit: 'kg' },
    ],
    outputs: [
      { name: 'Dried Powder', quantity: '20-30', unit: 'kg' },
    ],
    parameters: [
      { name: 'Inlet Temp', setpoint: '175', range: '160-190', unit: '°C', critical: true },
      { name: 'Outlet Temp', setpoint: '75', range: '70-80', unit: '°C', critical: true },
      { name: 'Feed Rate', setpoint: '5', range: '3-8', unit: 'kg/h', critical: false },
    ],
    qcGate: {
      id: 'qc-drying',
      name: 'Moisture Check',
      criteria: ['Moisture ≤ 8%', 'Viability ≥ 80%'],
      passRate: 94,
    },
    gmpCritical: true,
  },

  // === FORMULATION ===
  {
    id: 'frm-mixing',
    name: 'Formulation Mixing',
    shortName: 'Mixing',
    zone: 'formulation',
    stepNumber: 7,
    description: 'Blend dried powder with carrier (SIPERNAT), dispersants, UV protectants per BOM.',
    duration: { min: 30, max: 60, unit: 'min' },
    equipment: ['Blender MX-001'],
    inputs: [
      { name: 'Dried Powder', quantity: '20-30', unit: 'kg' },
      { name: 'SIPERNAT Carrier', quantity: '70-80', unit: 'kg' },
      { name: 'Dispersants', quantity: '2', unit: 'kg' },
    ],
    outputs: [
      { name: 'Formulation Blend', quantity: '100', unit: 'kg' },
    ],
    parameters: [
      { name: 'Mixing Speed', setpoint: '60', range: '40-80', unit: 'rpm', critical: false },
      { name: 'Mixing Time', setpoint: '45', range: '30-60', unit: 'min', critical: true },
    ],
    gmpCritical: false,
  },
  {
    id: 'frm-homogenize',
    name: 'Homogenization',
    shortName: 'Homogenize',
    zone: 'formulation',
    stepNumber: 8,
    description: 'High-shear homogenization. Target particle size <75µm (≥98% pass).',
    duration: { min: 15, max: 30, unit: 'min' },
    equipment: ['Homogenizer MX-002'],
    inputs: [
      { name: 'Formulation Blend', quantity: '100', unit: 'kg' },
    ],
    outputs: [
      { name: 'Homogenized Product', quantity: '100', unit: 'kg' },
    ],
    parameters: [
      { name: 'Shear Speed', setpoint: '4000', range: '3000-5000', unit: 'rpm', critical: true },
      { name: 'Particle Size D90', setpoint: '65', range: '<75', unit: 'µm', critical: true },
    ],
    qcGate: {
      id: 'qc-particle',
      name: 'Particle Size QC',
      criteria: ['D90 < 75µm', '≥98% pass sieve'],
      passRate: 97,
    },
    gmpCritical: true,
  },

  // === QC ===
  {
    id: 'qc-checkpoint1',
    name: 'QC Checkpoint 1',
    shortName: 'QC-1',
    zone: 'qc',
    stepNumber: 9,
    description: 'Full panel: spore count, pH, suspensibility, moisture, particle size, contamination.',
    duration: { min: 4, max: 8, unit: 'h' },
    equipment: ['HPLC', 'Incubator', 'Microscope'],
    inputs: [
      { name: 'Homogenized Product', quantity: '1', unit: 'kg sample' },
    ],
    outputs: [
      { name: 'QC Certificate', quantity: '1', unit: 'doc' },
    ],
    parameters: [
      { name: 'Spore Count', setpoint: '≥1×10⁹', range: '≥1×10⁹', unit: 'CFU/g', critical: true },
      { name: 'pH', setpoint: '7.0', range: '6.5-7.5', unit: 'pH', critical: true },
      { name: 'Suspensibility', setpoint: '≥60', range: '≥60', unit: '%', critical: true },
      { name: 'Moisture', setpoint: '≤8', range: '≤8', unit: '%', critical: true },
    ],
    qcGate: {
      id: 'qc-release1',
      name: 'QC Release Gate',
      criteria: ['All specs met', 'No contaminants', 'Stability baseline OK'],
      passRate: 92,
    },
    gmpCritical: true,
    holdTime: 'Release required before packaging',
  },

  // === PACKAGING ===
  {
    id: 'pkg-filling',
    name: 'Filling',
    shortName: 'Filling',
    zone: 'packaging',
    stepNumber: 10,
    description: 'Auto-fill into retail containers. 100g / 500g / 1kg sizes.',
    duration: { min: 1, max: 3, unit: 'h' },
    equipment: ['Filling Machine FL-001'],
    inputs: [
      { name: 'Released Product', quantity: '100', unit: 'kg' },
      { name: 'Containers', quantity: '200-1000', unit: 'pcs' },
    ],
    outputs: [
      { name: 'Filled Containers', quantity: '200-1000', unit: 'pcs' },
    ],
    parameters: [
      { name: 'Fill Weight', setpoint: '500', range: '495-505', unit: 'g', critical: true },
      { name: 'Line Speed', setpoint: '20', range: '15-25', unit: 'units/min', critical: false },
    ],
    gmpCritical: false,
  },
  {
    id: 'pkg-sealing',
    name: 'Sealing',
    shortName: 'Sealing',
    zone: 'packaging',
    stepNumber: 11,
    description: 'Heat seal containers. Integrity check on sample.',
    duration: { min: 30, max: 60, unit: 'min' },
    equipment: ['Sealer SL-001'],
    inputs: [
      { name: 'Filled Containers', quantity: '200-1000', unit: 'pcs' },
    ],
    outputs: [
      { name: 'Sealed Containers', quantity: '200-1000', unit: 'pcs' },
    ],
    parameters: [
      { name: 'Seal Temp', setpoint: '180', range: '170-190', unit: '°C', critical: true },
      { name: 'Seal Pressure', setpoint: '3', range: '2.5-3.5', unit: 'bar', critical: false },
    ],
    gmpCritical: false,
  },
  {
    id: 'pkg-labeling',
    name: 'Labeling',
    shortName: 'Labeling',
    zone: 'packaging',
    stepNumber: 12,
    description: 'Apply labels with batch number, expiry date, registration info.',
    duration: { min: 20, max: 40, unit: 'min' },
    equipment: ['Labeler LB-001'],
    inputs: [
      { name: 'Sealed Containers', quantity: '200-1000', unit: 'pcs' },
      { name: 'Labels', quantity: '200-1000', unit: 'pcs' },
    ],
    outputs: [
      { name: 'Labeled Product', quantity: '200-1000', unit: 'pcs' },
    ],
    parameters: [
      { name: 'Label Position', setpoint: '±2', range: '±5', unit: 'mm', critical: false },
    ],
    gmpCritical: false,
  },

  // === QC FINAL ===
  {
    id: 'qc-final',
    name: 'QC Final Release',
    shortName: 'QC Final',
    zone: 'qc',
    stepNumber: 13,
    description: 'Final release testing: entomotoxicity, contamination, stability, packaging integrity.',
    duration: { min: 8, max: 24, unit: 'h' },
    equipment: ['Bioassay Lab', 'Stability Chamber'],
    inputs: [
      { name: 'Labeled Product', quantity: '5', unit: 'samples' },
    ],
    outputs: [
      { name: 'Release Certificate', quantity: '1', unit: 'doc' },
    ],
    parameters: [
      { name: 'Entomotoxicity', setpoint: '≥15×10⁶', range: '≥15×10⁶', unit: 'SBU/mL', critical: true },
      { name: 'Pathogen Check', setpoint: 'Negative', range: 'Negative', unit: '—', critical: true },
      { name: 'Shelf Life', setpoint: '≥24', range: '≥24', unit: 'months', critical: true },
    ],
    qcGate: {
      id: 'qc-final-release',
      name: 'Final Release',
      criteria: ['Entomotoxicity PASS', 'No human pathogens', 'Stability ≥2 years', 'Packaging intact'],
      passRate: 98,
    },
    gmpCritical: true,
  },

  // === WAREHOUSE ===
  {
    id: 'wh-storage',
    name: 'Cold Storage',
    shortName: 'Storage',
    zone: 'warehouse',
    stepNumber: 14,
    description: 'Store at 4-8°C. Batch record filed. Quarantine until QC release.',
    duration: { min: 24, max: 168, unit: 'h' },
    equipment: ['Cold Room (4-8°C)'],
    inputs: [
      { name: 'Released Product', quantity: '200-1000', unit: 'pcs' },
    ],
    outputs: [
      { name: 'Stored Product', quantity: '200-1000', unit: 'pcs' },
    ],
    parameters: [
      { name: 'Temperature', setpoint: '6', range: '4-8', unit: '°C', critical: true },
      { name: 'Humidity', setpoint: '40', range: '30-50', unit: '%RH', critical: false },
    ],
    gmpCritical: true,
  },
  {
    id: 'wh-dispatch',
    name: 'Dispatch',
    shortName: 'Dispatch',
    zone: 'warehouse',
    stepNumber: 15,
    description: 'Ship to market — GCC / MENA region. Cold chain maintained.',
    duration: { min: 1, max: 5, unit: 'days' },
    equipment: ['Refrigerated Truck'],
    inputs: [
      { name: 'Stored Product', quantity: '200-1000', unit: 'pcs' },
    ],
    outputs: [
      { name: 'Delivered Product', quantity: '200-1000', unit: 'pcs' },
    ],
    parameters: [
      { name: 'Cold Chain', setpoint: '4-8', range: '2-10', unit: '°C', critical: true },
    ],
    gmpCritical: false,
  },
];

// ============================================================
// MATERIAL FLOW CONNECTIONS
// ============================================================

export const materialFlows: MaterialFlow[] = [
  { from: 'usp-mcb', to: 'usp-wcb', material: 'Seed Culture', quantity: '500 mL', method: 'manual' },
  { from: 'usp-wcb', to: 'usp-seed', material: 'WCB Inoculum', quantity: '100 mL', method: 'manual' },
  { from: 'usp-seed', to: 'usp-prod', material: 'Seed Broth', quantity: '8 L', method: 'pipe' },
  { from: 'usp-prod', to: 'dsp-harvest', material: 'Harvest Broth', quantity: '450 L', method: 'pipe' },
  { from: 'dsp-harvest', to: 'dsp-drying', material: 'Wet Pellet', quantity: '60-90 kg', method: 'conveyor' },
  { from: 'dsp-drying', to: 'frm-mixing', material: 'Dried Powder', quantity: '20-30 kg', method: 'pneumatic' },
  { from: 'frm-mixing', to: 'frm-homogenize', material: 'Formulation Blend', quantity: '100 kg', method: 'conveyor' },
  { from: 'frm-homogenize', to: 'qc-checkpoint1', material: 'Sample', quantity: '1 kg', method: 'manual' },
  { from: 'qc-checkpoint1', to: 'pkg-filling', material: 'Released Product', quantity: '100 kg', method: 'conveyor' },
  { from: 'pkg-filling', to: 'pkg-sealing', material: 'Filled Containers', quantity: 'pcs', method: 'conveyor' },
  { from: 'pkg-sealing', to: 'pkg-labeling', material: 'Sealed Containers', quantity: 'pcs', method: 'conveyor' },
  { from: 'pkg-labeling', to: 'qc-final', material: 'Samples', quantity: '5 pcs', method: 'manual' },
  { from: 'qc-final', to: 'wh-storage', material: 'Released Product', quantity: 'pcs', method: 'pallet' },
  { from: 'wh-storage', to: 'wh-dispatch', material: 'Stored Product', quantity: 'pcs', method: 'truck' },
];

// ============================================================
// ZONE ORDER (for swim lanes)
// ============================================================

export const ZONE_ORDER: ZoneType[] = ['upstream', 'downstream', 'formulation', 'qc', 'packaging', 'warehouse'];

// ============================================================
// HELPER: get stages by zone
// ============================================================

export function getStagesByZone(zone: ZoneType): ProcessStage[] {
  return processStages.filter(s => s.zone === zone);
}

export function getStageById(id: string): ProcessStage | undefined {
  return processStages.find(s => s.id === id);
}
