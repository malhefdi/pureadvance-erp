import { Zone, Equipment, Batch, Material, BOMEntry, ProcessStage, TransferGate, Order } from '@/types/erp';

// ============================================================
// ZONES — Real facility layout from URS
// 50L: ~3m × 2m, ≥3.5m ceiling | 500L: ~4m × 3m, ≥5m ceiling
// ============================================================

export const zones: Zone[] = [
  {
    id: 'zone-a-upstream',
    name: 'Zone A — Upstream Fermentation',
    type: 'upstream',
    area: 6, // m² (3m × 2m for 50L)
    isoClass: 'ISO 8 (Class 100,000)',
    temperature: '25–40°C',
    description: 'Seed culture through production bioreactor. 380V/50Hz/3Φ, 2-3 bar steam, PW/WFI',
    x: 20,
    y: 20,
    width: 380,
    height: 200,
  },
  {
    id: 'zone-b-downstream',
    name: 'Zone B — Downstream Processing',
    type: 'downstream',
    area: 6, // m²
    isoClass: 'ISO 8',
    temperature: '4°C (harvest)',
    description: 'Centrifugation, spray drying, freeze drying',
    x: 420,
    y: 20,
    width: 280,
    height: 200,
  },
  {
    id: 'zone-c-formulation',
    name: 'Zone C — Formulation & Packaging',
    type: 'formulation',
    area: 12, // m² (4m × 3m for 500L path)
    isoClass: 'ISO 8',
    temperature: '20–25°C',
    description: 'Mixing, homogenization, filling, sealing, labeling',
    x: 720,
    y: 20,
    width: 360,
    height: 200,
  },
  {
    id: 'zone-d-qc',
    name: 'Zone D — QC Laboratory',
    type: 'qc',
    area: 12, // m²
    description: 'Micro (spore count), HPLC, bioassay (LC₅₀), media QC',
    x: 20,
    y: 260,
    width: 340,
    height: 160,
  },
  {
    id: 'zone-e-warehouse',
    name: 'Zone E — Warehouse',
    type: 'warehouse',
    area: 15, // m²
    temperature: '4–8°C (cold)',
    description: 'Cold storage, dry storage, dispatch — GCC/MENA',
    x: 380,
    y: 260,
    width: 340,
    height: 160,
  },
  {
    id: 'zone-f-utilities',
    name: 'Zone F — Utilities',
    type: 'utilities',
    area: 15, // m²
    description: 'Electric boiler (2-3 bar, 100-500 kg/h), chiller, oil-free compressor (6-8 bar), PW/WFI system',
    x: 740,
    y: 260,
    width: 340,
    height: 160,
  },
];

// ============================================================
// EQUIPMENT — Real specs from URS + vendor pricing
// ============================================================

export const equipment: Equipment[] = [
  // Upstream — B. cereus (Bt) fermentation
  {
    id: 'eq-seed-br',
    name: 'Seed Bioreactor',
    category: 'upstream',
    zoneId: 'zone-a-upstream',
    specs: {
      volume: '2–5L',
      material: 'Glass',
      sterilization: 'Autoclavable',
      rpm: '300',
      temp: '30°C',
      '3× impellers': '1/3 vessel diameter',
    },
    vendor: 'Eppendorf / Infors HT',
    costRange: '$5K–$15K',
    status: 'running',
    hoursRunning: 1240,
    efficiency: 94,
  },
  {
    id: 'eq-prod-br-50',
    name: '50L Production Bioreactor',
    category: 'upstream',
    zoneId: 'zone-a-upstream',
    specs: {
      volume: '50L working',
      material: 'SS316L',
      surfaceFinish: '0.8 Ra (ext), 0.4 Ra (int)',
      sterilization: 'SIP (130°C, 2-3 bar)',
      agitation: '100–800 rpm, 3× impellers',
      aeration: 'Air 0.5–2.0 VVM, O₂ 0–0.5 VVM',
      temp: '25–40°C (±0.5°C)',
      pH: '6.5–7.5 (±0.1)',
      DO: '20–80% (±5%)',
      probes: 'pH×2 (Ingold 25mm), DO×2 (optical), Temp×1 (Pt100)',
      ports: 'Addition×6, Sampling×4, Probe×8',
      CIP: 'Yes (spray ball)',
      offGas: 'O₂ 0-25%, CO₂ 0-10%',
      MFC: 'Yes',
      maxPressure: '2.5 bar relief',
    },
    vendor: 'Lab1st BR500-M1',
    costRange: '$39K–$43.6K (standard) / $66K–$70K (Pro-C1 cell culture)',
    status: 'running',
    lastMaintenance: '2026-04-10',
    nextMaintenance: '2026-07-10',
    hoursRunning: 3480,
    efficiency: 91,
  },
  {
    id: 'eq-prod-br-500',
    name: '500L Production Bioreactor',
    category: 'upstream',
    zoneId: 'zone-a-upstream',
    specs: {
      volume: '500L working',
      material: 'SS316L',
      sterilization: 'SIP',
      agitation: '100–800 rpm, 3× impellers',
      aeration: 'Air 0.5–2.0 VVM, O₂ 0–0.5 VVM',
      temp: '25–40°C',
      pH: '6.5–7.5',
      note: 'Geometric similarity to 50L required for scale-up',
      floorSpace: '4m × 3m',
      ceilingHeight: '≥5m',
    },
    vendor: 'Lab1st / Eppendorf / Sartorius',
    costRange: '$50K–$150K (pending vendor)',
    status: 'idle',
    hoursRunning: 890,
    efficiency: 96,
  },
  {
    id: 'eq-media-prep',
    name: 'Media Preparation Tank',
    category: 'upstream',
    zoneId: 'zone-a-upstream',
    specs: { volume: '100L', type: 'Jacketed', agitation: 'Yes', water: 'PW or WFI' },
    vendor: 'Chinese vendors',
    costRange: '$5K–$10K',
    status: 'running',
    hoursRunning: 2100,
    efficiency: 98,
  },
  {
    id: 'eq-autoclave',
    name: 'Autoclave',
    category: 'upstream',
    zoneId: 'zone-a-upstream',
    specs: { volume: '100L', cycle: '121°C, 20min' },
    vendor: 'Tuttnauer',
    costRange: '$5K–$15K',
    status: 'idle',
    hoursRunning: 1560,
    efficiency: 99,
  },
  // Downstream
  {
    id: 'eq-centrifuge',
    name: 'Disc Stack Centrifuge',
    category: 'downstream',
    zoneId: 'zone-b-downstream',
    specs: { type: 'Continuous', rpm: '10,000–15,000', throughput: '10–50 L/h' },
    vendor: 'Alfa Laval / GEA',
    costRange: '$15K–$40K',
    status: 'maintenance',
    hoursRunning: 4200,
    efficiency: 88,
  },
  {
    id: 'eq-spray-dryer',
    name: 'Spray Dryer',
    category: 'downstream',
    zoneId: 'zone-b-downstream',
    specs: { inletTemp: '175°C', outletTemp: '70–80°C', product: 'Wettable Powder' },
    vendor: 'Büchi / Chinese',
    costRange: '$20K–$50K',
    status: 'idle',
    hoursRunning: 1800,
    efficiency: 92,
  },
  {
    id: 'eq-freeze-dryer',
    name: 'Freeze Dryer',
    category: 'downstream',
    zoneId: 'zone-b-downstream',
    specs: { temp: '-40°C', shelf: '0.5 m²', cycle: '48–72h', note: 'Higher viability than spray dry' },
    vendor: 'Labconco / Telstar',
    costRange: '$15K–$30K',
    status: 'offline',
    hoursRunning: 600,
    efficiency: 95,
  },
  // Formulation
  {
    id: 'eq-mixing-tank',
    name: 'Formulation Mixing Tank',
    category: 'formulation',
    zoneId: 'zone-c-formulation',
    specs: { volume: '500L', type: 'Jacketed', rpm: '200–400', temp: '20–25°C' },
    vendor: 'Chinese vendors',
    costRange: '$10K–$25K',
    status: 'running',
    hoursRunning: 3200,
    efficiency: 93,
  },
  {
    id: 'eq-homogenizer',
    name: 'High-Shear Homogenizer',
    category: 'formulation',
    zoneId: 'zone-c-formulation',
    specs: { rpm: '3000–5000', particleSize: '<10 µm', duration: '5–15 min' },
    vendor: 'IKA / Silverson',
    costRange: '$5K–$15K',
    status: 'running',
    hoursRunning: 2800,
    efficiency: 90,
  },
  {
    id: 'eq-filling',
    name: 'Auto Filling Machine',
    category: 'packaging',
    zoneId: 'zone-c-formulation',
    specs: { sizes: '100g / 500g / 1kg', type: 'Automatic' },
    vendor: 'Chinese vendors',
    costRange: '$10K–$25K',
    status: 'running',
    hoursRunning: 4100,
    efficiency: 96,
  },
  {
    id: 'eq-sealer',
    name: 'Heat Sealing Machine',
    category: 'packaging',
    zoneId: 'zone-c-formulation',
    specs: { type: 'Heat seal', automation: 'Automatic' },
    vendor: 'Chinese vendors',
    costRange: '$3K–$8K',
    status: 'running',
    hoursRunning: 4100,
    efficiency: 98,
  },
  {
    id: 'eq-labeler',
    name: 'Labeling Machine',
    category: 'packaging',
    zoneId: 'zone-c-formulation',
    specs: { type: 'Wrap-around', automation: 'Automatic' },
    vendor: 'Chinese vendors',
    costRange: '$3K–$8K',
    status: 'running',
    hoursRunning: 4100,
    efficiency: 97,
  },
  // Utilities — from URS section 12
  {
    id: 'eq-boiler',
    name: 'Clean Steam Generator / Boiler',
    category: 'utilities',
    zoneId: 'zone-f-utilities',
    specs: {
      type: 'Electric',
      pressure: '2–3 bar',
      output: '100–150 kg/h (50L) / 300–500 kg/h (500L)',
      note: 'Plant steam + clean steam generator, or dedicated electric boiler',
    },
    vendor: 'Chinese vendors',
    costRange: '$10K–$25K',
    status: 'running',
    hoursRunning: 8760,
    efficiency: 94,
  },
  {
    id: 'eq-chiller',
    name: 'Chiller',
    category: 'utilities',
    zoneId: 'zone-f-utilities',
    specs: { capacity: '5–10 kW', output: '7°C', coolingRate: '1–2°C/min' },
    vendor: 'Carrier / Chinese',
    costRange: '$5K–$15K',
    status: 'running',
    hoursRunning: 8760,
    efficiency: 91,
  },
  {
    id: 'eq-compressor',
    name: 'Oil-Free Air Compressor',
    category: 'utilities',
    zoneId: 'zone-f-utilities',
    specs: { type: 'Oil-free, dry', pressure: '6–8 bar', flow: '500 L/min' },
    vendor: 'Atlas Copco',
    costRange: '$3K–$8K',
    status: 'running',
    hoursRunning: 8760,
    efficiency: 95,
  },
  {
    id: 'eq-water-purif',
    name: 'Water Purification System',
    category: 'utilities',
    zoneId: 'zone-f-utilities',
    specs: { type: 'PW + WFI capability', capacity: '1000 L/day', note: 'PW or WFI for media prep & CIP' },
    vendor: 'Local suppliers',
    costRange: '$15K–$30K',
    status: 'running',
    hoursRunning: 8760,
    efficiency: 97,
  },
];

// ============================================================
// MATERIALS — Fermentation media + control chemicals from URS
// ============================================================

export const materials: Material[] = [
  // Fermentation media components
  { id: 'mat-soy-flour', name: 'Soy Flour', function: 'Carbon/Nitrogen source', usagePercentMin: 10, usagePercentMax: 20, supplier: 'Local / Multiple', pricePerKg: 0.80, currency: 'USD', stockLevel: 500, reorderPoint: 100, unit: 'kg' },
  { id: 'mat-glucose', name: 'Glucose', function: 'Carbon source', usagePercentMin: 2, usagePercentMax: 5, supplier: 'Local', pricePerKg: 0.60, currency: 'USD', stockLevel: 300, reorderPoint: 80, unit: 'kg' },
  { id: 'mat-corn-steep', name: 'Corn Steep Liquor', function: 'Nitrogen/vitamin source', usagePercentMin: 1, usagePercentMax: 3, supplier: 'Multiple', pricePerKg: 0.50, currency: 'USD', stockLevel: 200, reorderPoint: 50, unit: 'kg' },
  { id: 'mat-k2hpo4', name: 'K₂HPO₄', function: 'Buffer/mineral', usagePercentMin: 0.5, usagePercentMax: 1, supplier: 'Local', pricePerKg: 2.50, currency: 'USD', stockLevel: 100, reorderPoint: 20, unit: 'kg' },
  { id: 'mat-mgso4', name: 'MgSO₄·7H₂O', function: 'Mineral cofactor', usagePercentMin: 0.05, usagePercentMax: 0.1, supplier: 'Local', pricePerKg: 1.20, currency: 'USD', stockLevel: 50, reorderPoint: 10, unit: 'kg' },
  { id: 'mat-fecl3', name: 'FeCl₃', function: 'Trace mineral', usagePercentMin: 0.01, usagePercentMax: 0.05, supplier: 'Local', pricePerKg: 5.00, currency: 'USD', stockLevel: 10, reorderPoint: 3, unit: 'kg' },
  { id: 'mat-mnso4', name: 'MnSO₄·H₂O', function: 'Trace mineral', usagePercentMin: 0.01, usagePercentMax: 0.05, supplier: 'Local', pricePerKg: 3.00, currency: 'USD', stockLevel: 10, reorderPoint: 3, unit: 'kg' },
  // Control chemicals from URS section 6 & 7
  { id: 'mat-hcl', name: 'HCl (1M)', function: 'pH down (acid)', usagePercentMin: 0.1, usagePercentMax: 0.5, supplier: 'Local', pricePerKg: 1.50, currency: 'USD', stockLevel: 50, reorderPoint: 10, unit: 'L' },
  { id: 'mat-naoh', name: 'NaOH (1M)', function: 'pH up (base)', usagePercentMin: 0.1, usagePercentMax: 0.5, supplier: 'Local', pricePerKg: 1.00, currency: 'USD', stockLevel: 50, reorderPoint: 10, unit: 'L' },
  { id: 'mat-antifoam', name: 'Antifoam (silicone-based)', function: 'Foam control', usagePercentMin: 0.01, usagePercentMax: 0.1, supplier: 'Multiple', pricePerKg: 15.00, currency: 'USD', stockLevel: 20, reorderPoint: 5, unit: 'L' },
  // Formulation components (WP = Wettable Powder)
  { id: 'mat-sipernat', name: 'SIPERNAT® 22 S', function: 'Skeleton / Carrier', usagePercentMin: 5, usagePercentMax: 15, supplier: 'Evonik (Germany)', pricePerKg: 0.44, currency: 'USD', stockLevel: 500, reorderPoint: 100, unit: 'kg' },
  { id: 'mat-mono-glycol', name: 'Monopropylene Glycol', function: 'Anti-freeze / Co-solvent', usagePercentMin: 5, usagePercentMax: 10, supplier: 'Multiple', pricePerKg: 0.99, currency: 'USD', stockLevel: 300, reorderPoint: 80, unit: 'kg' },
  { id: 'mat-unitop-fl', name: 'Unitop-FL', function: 'Suspending / Wetting', usagePercentMin: 1, usagePercentMax: 3, supplier: 'Rossari Biotech (India)', pricePerKg: 10.0, currency: 'USD', stockLevel: 50, reorderPoint: 20, unit: 'kg' },
  { id: 'mat-unitop-203', name: 'Unitop-203', function: 'Dispersing Agent', usagePercentMin: 1, usagePercentMax: 3, supplier: 'Unitop Chemicals (India)', pricePerKg: 12.0, currency: 'USD', stockLevel: 50, reorderPoint: 20, unit: 'kg' },
  { id: 'mat-unitop-mso', name: 'Unitop-MSO', function: 'Rain-fastness Adjuvant', usagePercentMin: 2, usagePercentMax: 5, supplier: 'Rossari Biotech (India)', pricePerKg: 14.0, currency: 'USD', stockLevel: 40, reorderPoint: 15, unit: 'kg' },
  { id: 'mat-xanthan', name: 'Xanthan Gum', function: 'Thickener / Suspending', usagePercentMin: 0.5, usagePercentMax: 2, supplier: 'Multiple', pricePerKg: 4.75, currency: 'USD', stockLevel: 100, reorderPoint: 30, unit: 'kg' },
  { id: 'mat-sucrose', name: 'Sucrose', function: 'UV Protectant', usagePercentMin: 2, usagePercentMax: 5, supplier: 'Local', pricePerKg: 0.45, currency: 'USD', stockLevel: 400, reorderPoint: 100, unit: 'kg' },
  { id: 'mat-nacl', name: 'Sodium Chloride', function: 'Osmotic Stabilizer', usagePercentMin: 0.5, usagePercentMax: 1, supplier: 'Local', pricePerKg: 0.09, currency: 'USD', stockLevel: 1000, reorderPoint: 200, unit: 'kg' },
  { id: 'mat-bht', name: 'BHT', function: 'Antioxidant', usagePercentMin: 0.01, usagePercentMax: 0.1, supplier: 'Multiple', pricePerKg: 7.0, currency: 'USD', stockLevel: 20, reorderPoint: 5, unit: 'kg' },
];

export const bomEntries: BOMEntry[] = materials.map(m => ({
  id: `bom-${m.id}`,
  productId: 'prod-bt-wp',
  materialId: m.id,
  materialName: m.name,
  percentMin: m.usagePercentMin,
  percentMax: m.usagePercentMax,
  percentMid: (m.usagePercentMin + m.usagePercentMax) / 2,
  function: m.function,
  supplier: m.supplier,
  costPerKg: m.pricePerKg,
}));

// ============================================================
// BATCHES — Real batch tracking with QC from URS
// ============================================================

export const batches: Batch[] = [
  {
    id: 'BTH-2026-001',
    product: 'Bt Biopesticide WP',
    size: 50, // kg — 50L batch
    status: 'in_progress',
    startDate: '2026-04-18',
    estimatedCompletion: '2026-04-25',
    currentStage: 'Fermentation (50L)',
    equipmentUsed: ['eq-prod-br-50', 'eq-media-prep'],
    qcResults: [],
    materials: [
      { materialId: 'mat-soy-flour', name: 'Soy Flour', plannedAmount: 8, actualAmount: 0, unit: 'kg' },
      { materialId: 'mat-glucose', name: 'Glucose', plannedAmount: 2, actualAmount: 0, unit: 'kg' },
      { materialId: 'mat-corn-steep', name: 'Corn Steep Liquor', plannedAmount: 1, actualAmount: 0, unit: 'kg' },
    ],
    notes: 'Pilot run — 50L bioreactor batch 1. pH 7.0, DO ≥30%, 30°C, 400-600 rpm, ~60h',
  },
  {
    id: 'BTH-2026-002',
    product: 'Bt Biopesticide WP',
    size: 50,
    status: 'qc_pending',
    startDate: '2026-04-15',
    estimatedCompletion: '2026-04-22',
    currentStage: 'QC Testing',
    equipmentUsed: ['eq-mixing-tank', 'eq-homogenizer', 'eq-filling'],
    qcResults: [
      { id: 'qc-1', batchId: 'BTH-2026-002', testName: 'Spore Count (CFU/g)', targetValue: '≥10⁹', actualValue: '2.3×10⁹', unit: 'CFU/g', result: 'pass', testedBy: 'Dr. Ahmed', testedAt: '2026-04-21T09:00:00Z' },
      { id: 'qc-2', batchId: 'BTH-2026-002', testName: 'pH', targetValue: '6.5–7.5', actualValue: '7.1', unit: 'pH', result: 'pass', testedBy: 'Dr. Ahmed', testedAt: '2026-04-21T09:15:00Z' },
      { id: 'qc-3', batchId: 'BTH-2026-002', testName: 'Suspensibility', targetValue: '≥70%', actualValue: '78%', unit: '%', result: 'pass', testedBy: 'Dr. Ahmed', testedAt: '2026-04-21T09:30:00Z' },
      { id: 'qc-4', batchId: 'BTH-2026-002', testName: 'Wetting Time', targetValue: '≤60 sec', actualValue: '42', unit: 'sec', result: 'pass', testedBy: 'Dr. Ahmed', testedAt: '2026-04-21T09:45:00Z' },
      { id: 'qc-5', batchId: 'BTH-2026-002', testName: 'Moisture Content', targetValue: '≤8%', actualValue: '6.2', unit: '%', result: 'pass', testedBy: 'Dr. Ahmed', testedAt: '2026-04-21T10:00:00Z' },
      { id: 'qc-6', batchId: 'BTH-2026-002', testName: 'Particle Size', targetValue: '<10 µm', actualValue: '7.8', unit: 'µm', result: 'pass', testedBy: 'Dr. Ahmed', testedAt: '2026-04-21T10:15:00Z' },
      { id: 'qc-7', batchId: 'BTH-2026-002', testName: 'Bioassay (LC₅₀)', targetValue: 'Within spec', actualValue: '0.08 mg/L', unit: 'mg/L', result: 'pending', testedBy: '', testedAt: '' },
    ],
    materials: [
      { materialId: 'mat-sipernat', name: 'SIPERNAT® 22 S', plannedAmount: 10, actualAmount: 10.2, unit: 'kg' },
      { materialId: 'mat-mono-glycol', name: 'Monopropylene Glycol', plannedAmount: 7, actualAmount: 6.8, unit: 'kg' },
      { materialId: 'mat-unitop-fl', name: 'Unitop-FL', plannedAmount: 2, actualAmount: 2.1, unit: 'kg' },
      { materialId: 'mat-unitop-mso', name: 'Unitop-MSO', plannedAmount: 3, actualAmount: 3.0, unit: 'kg' },
    ],
    yield: 94.2,
    notes: 'Full formulation run — awaiting bioassay result',
  },
  {
    id: 'BTH-2026-003',
    product: 'Bt Biopesticide WP',
    size: 50,
    status: 'released',
    startDate: '2026-04-10',
    estimatedCompletion: '2026-04-17',
    currentStage: 'Complete',
    equipmentUsed: ['eq-prod-br-50', 'eq-centrifuge', 'eq-spray-dryer', 'eq-mixing-tank', 'eq-homogenizer', 'eq-filling'],
    qcResults: [
      { id: 'qc-10', batchId: 'BTH-2026-003', testName: 'Spore Count (CFU/g)', targetValue: '≥10⁹', actualValue: '3.1×10⁹', unit: 'CFU/g', result: 'pass', testedBy: 'Dr. Ahmed', testedAt: '2026-04-17T09:00:00Z' },
      { id: 'qc-11', batchId: 'BTH-2026-003', testName: 'Bioassay (LC₅₀)', targetValue: 'Within spec', actualValue: '0.06 mg/L', unit: 'mg/L', result: 'pass', testedBy: 'Dr. Fatima', testedAt: '2026-04-17T14:00:00Z' },
    ],
    materials: [],
    yield: 97.1,
    notes: 'First validated batch — 30 units dispatched',
  },
  {
    id: 'BTH-2026-004',
    product: 'Bt Biopesticide WP',
    size: 50,
    status: 'queued',
    startDate: '2026-04-26',
    estimatedCompletion: '2026-05-03',
    currentStage: 'Queued — Media Prep',
    equipmentUsed: [],
    qcResults: [],
    materials: [],
    notes: 'Scheduled after BTH-2026-001 completes',
  },
];

// ============================================================
// PROCESS STAGES — Enhanced with URS parameters
// ============================================================

export const processStages: ProcessStage[] = [
  { id: 'ps-mcb', name: 'Master Cell Bank', zone: 'upstream', description: 'Frozen stock (-80°C), Btk HD-1 strain' },
  { id: 'ps-wcb', name: 'Working Cell Bank', zone: 'upstream', description: 'Aliquots from MCB (-80°C)' },
  { id: 'ps-seed', name: 'Seed Bioreactor', zone: 'upstream', description: '2–5L, 30°C, 300 rpm, 12–16h', duration: '12–16h', equipment: ['eq-seed-br'], parameters: { temp: '30°C', rpm: '300', volume: '2–5L' } },
  { id: 'ps-prod', name: 'Production Bioreactor', zone: 'upstream', description: '50L→500L, 30°C, pH 6.5–7.5, DO 20–80%, 100–800 rpm', duration: '48–72h', equipment: ['eq-prod-br-50'], parameters: { temp: '25–40°C', pH: '6.5–7.5', DO: '20–80%', rpm: '100–800', 'air VVM': '0.5–2.0', 'O₂ VVM': '0–0.5', 'probes': 'pH×2, DO×2, Temp×1' } },
  { id: 'ps-harvest', name: 'Harvest', zone: 'downstream', description: 'Continuous centrifuge, 10K–15K rpm', equipment: ['eq-centrifuge'] },
  { id: 'ps-dry', name: 'Drying', zone: 'downstream', description: 'Spray dry (WP) or freeze dry (higher viability)', equipment: ['eq-spray-dryer', 'eq-freeze-dryer'] },
  { id: 'ps-mix', name: 'Formulation Mixing', zone: 'formulation', description: 'Add all components per BOM, 30–60 min', duration: '30–60 min', equipment: ['eq-mixing-tank'] },
  { id: 'ps-homo', name: 'Homogenization', zone: 'formulation', description: 'High-shear, 3000–5000 rpm, particle <10µm', duration: '5–15 min', equipment: ['eq-homogenizer'] },
  { id: 'ps-qc1', name: 'QC Checkpoint 1', zone: 'qc', description: 'Spore count, pH, suspensibility, moisture, particle size', qcRequired: true },
  { id: 'ps-fill', name: 'Filling', zone: 'packaging', description: 'Auto filling — 100g/500g/1kg', equipment: ['eq-filling'] },
  { id: 'ps-seal', name: 'Sealing', zone: 'packaging', description: 'Heat seal, automatic', equipment: ['eq-sealer'] },
  { id: 'ps-label', name: 'Labeling', zone: 'packaging', description: 'Batch #, expiry, registration', equipment: ['eq-labeler'] },
  { id: 'ps-qc2', name: 'QC Final Release', zone: 'qc', description: 'Bioassay (LC₅₀), stability sample, batch release decision', qcRequired: true },
  { id: 'ps-store', name: 'Cold Storage', zone: 'warehouse', description: '4–8°C, batch record filed' },
  { id: 'ps-dispatch', name: 'Dispatch', zone: 'warehouse', description: 'Ship to market — GCC / MENA' },
];

// ============================================================
// TRANSFER GATES
// ============================================================

export const transferGates: TransferGate[] = [
  { id: 'G0', name: 'MOU Execution', status: 'completed', description: 'Partnership agreement signed' },
  { id: 'G1', name: 'Bioreactor Procurement', status: 'in_progress', description: '50L + 500L bioreactor sourcing (Lab1st $39-44K / Eppendorf $80-200K)' },
  { id: 'G2', name: 'Facility Preparation', status: 'pending', description: 'ISO 8 clean room, utilities (380V/50Hz/3Φ, 6-8 bar air, PW/WFI, 2-3 bar steam)', dependencies: ['G1'] },
  { id: 'G3', name: 'Pilot Validation (50L)', status: 'pending', description: 'First successful 50L pilot run with IQ/OQ', dependencies: ['G1', 'G2'] },
  { id: 'G4', name: 'Production Commissioning (500L)', status: 'pending', description: 'Scale-up to 500L with geometric similarity', dependencies: ['G3'] },
  { id: 'G5', name: 'Process Validation (3 runs)', status: 'pending', description: '3 consecutive validated batches at 500L', dependencies: ['G4'] },
  { id: 'G6', name: 'Regulatory Submission', status: 'pending', description: 'MEWA/EPA dossier submission', dependencies: ['G5'] },
  { id: 'G7', name: 'First Commercial Batch', status: 'pending', description: 'Market-ready production', dependencies: ['G6'] },
  { id: 'G8', name: 'Market Launch — GCC/MENA', status: 'pending', description: 'Commercial distribution', dependencies: ['G7'] },
];

// ============================================================
// ORDERS
// ============================================================

export const orders: Order[] = [
  { id: 'ORD-001', customer: 'Ministry of Agriculture — Riyadh', product: 'Bt Biopesticide WP', quantity: 500, unit: '1L bottles', status: 'pending', orderDate: '2026-04-15' },
  { id: 'ORD-002', customer: 'Al Rajhi Farms', product: 'Bt Biopesticide WP', quantity: 50, unit: '500g bottles', status: 'processing', orderDate: '2026-04-18' },
  { id: 'ORD-003', customer: 'Delta Distributors', product: 'Bt Biopesticide WP', quantity: 2000, unit: '100g sachets', status: 'pending', orderDate: '2026-04-20' },
];
