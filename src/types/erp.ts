export type ZoneType = 'upstream' | 'downstream' | 'formulation' | 'packaging' | 'qc' | 'warehouse' | 'utilities';

export type EquipmentStatus = 'running' | 'idle' | 'maintenance' | 'offline' | 'cleaning';

export type BatchStatus = 'queued' | 'in_progress' | 'qc_pending' | 'approved' | 'released' | 'rejected' | 'on_hold';

export type QCResult = 'pass' | 'fail' | 'pending' | 'adjustment_needed';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  area: number; // m²
  isoClass?: string;
  temperature?: string;
  description: string;
  x: number; // SVG position
  y: number;
  width: number;
  height: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'upstream' | 'downstream' | 'formulation' | 'utilities' | 'lab' | 'packaging';
  zoneId: string;
  specs: Record<string, string>;
  vendor: string;
  costRange: string;
  status: EquipmentStatus;
  lastMaintenance?: string;
  nextMaintenance?: string;
  hoursRunning: number;
  efficiency: number; // percentage
}

export interface Batch {
  id: string;
  product: string;
  size: number; // kg
  status: BatchStatus;
  startDate: string;
  estimatedCompletion: string;
  currentStage: string;
  parentBatches?: string[];
  equipmentUsed: string[];
  qcResults: QCRecord[];
  materials: MaterialUsage[];
  yield?: number;
  notes?: string;
}

export interface QCRecord {
  id: string;
  batchId: string;
  testName: string;
  targetValue: string;
  actualValue: string;
  unit: string;
  result: QCResult;
  testedBy: string;
  testedAt: string;
  notes?: string;
}

export interface Material {
  id: string;
  name: string;
  function: string;
  usagePercentMin: number;
  usagePercentMax: number;
  supplier: string;
  pricePerKg: number;
  currency: string;
  stockLevel: number;
  reorderPoint: number;
  unit: string;
}

export interface MaterialUsage {
  materialId: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  unit: string;
  lotNumber?: string;
}

export interface BOMEntry {
  id: string;
  productId: string;
  materialId: string;
  materialName: string;
  percentMin: number;
  percentMax: number;
  percentMid: number;
  function: string;
  supplier: string;
  costPerKg: number;
}

export interface ProcessStage {
  id: string;
  name: string;
  zone: ZoneType;
  description: string;
  duration?: string;
  equipment?: string[];
  parameters?: Record<string, string>;
  qcRequired?: boolean;
}

export interface TransferGate {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'blocked';
  description: string;
  dependencies?: string[];
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  unit: string;
  status: OrderStatus;
  orderDate: string;
  shipDate?: string;
  deliveredDate?: string;
}
