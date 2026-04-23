/**
 * Zone-Level P&ID Data Model
 * 
 * Extends the base P&ID types with live data, alarms, and zone grouping.
 * Each zone's expanded view renders from this model.
 */

import type {
  PIDEquipment,
  PIDConnection,
  PIDInstrument,
  PIDControlLoop,
  PIDNozzle,
} from './pid';

// ============================================================
// LIVE DATA (overlaid on P&ID)
// ============================================================

export type EquipmentLiveStatus = 'running' | 'idle' | 'maintenance' | 'offline' | 'cleaning';

export interface EquipmentLiveData {
  equipmentId: string;
  status: EquipmentLiveStatus;
  efficiency: number;          // 0-100
  hoursRunning: number;
  batchId?: string;            // Currently processing batch
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export type AlarmSeverity = 'critical' | 'warning' | 'info' | 'normal';

export interface InstrumentLiveData {
  instrumentId: string;
  value: number;
  unit: string;
  setpoint?: number;
  alarmState: AlarmSeverity;
  lastUpdated: string;         // ISO timestamp
  trend?: number[];            // Last N values for sparkline
}

export interface ValveLiveData {
  valveId: string;
  position: 'open' | 'closed' | 'partial';
  percentOpen: number;         // 0-100
  mode: 'auto' | 'manual';
  lastActuation?: string;
}

export interface PipeLiveData {
  connectionId: string;
  flowing: boolean;
  flowRate?: number;           // L/min or kg/h
  temperature?: number;        // °C
  animated: boolean;           // Whether to show flow animation
}

// ============================================================
// ZONE P&ID (the complete data for one zone's expanded view)
// ============================================================

export interface ZonePIDData {
  zoneId: string;
  zoneName: string;
  zoneType: string;
  isoClass?: string;
  drawingNumber: string;       // e.g., 'PA-PID-USP-001'
  revision: string;

  // P&ID elements
  equipment: PIDEquipment[];
  connections: PIDConnection[];
  instruments: PIDInstrument[];
  controlLoops: PIDControlLoop[];
  nozzles: PIDNozzle[];

  // Live data (mock or real)
  equipmentStatus: EquipmentLiveData[];
  instrumentValues: InstrumentLiveData[];
  valvePositions: ValveLiveData[];
  pipeFlow: PipeLiveData[];

  // Layout hints for the renderer
  viewBox: { x: number; y: number; width: number; height: number };
  backgroundGrid?: boolean;
}

// ============================================================
// ZONE KPI SUMMARY (for the header bar)
// ============================================================

export interface ZoneKPISummary {
  zoneId: string;
  totalEquipment: number;
  runningEquipment: number;
  maintenanceEquipment: number;
  offlineEquipment: number;
  avgEfficiency: number;
  totalHours: number;
  activeBatches: number;
  activeAlarms: number;
  criticalAlarms: number;
}

// ============================================================
// ALL ZONES DATA
// ============================================================

export type AllZonePIDData = Record<string, ZonePIDData>;
