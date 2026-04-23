/**
 * Zone P&ID Data — Index
 * 
 * Aggregates all zone P&ID definitions and provides lookup functions.
 */

import type { ZonePIDData, AllZonePIDData, ZoneKPISummary } from '@/types/pid-zone';

import { upstreamPID } from './upstream';
import { downstreamPID } from './downstream';
import { formulationPID } from './formulation';
import { utilitiesPID } from './utilities';
import { packagingPID } from './packaging';
import { qcPID } from './qc';
import { warehousePID } from './warehouse';

// ============================================================
// ALL ZONES
// ============================================================

export const allZonePIDData: AllZonePIDData = {
  'z-upstream': upstreamPID,
  'z-downstream': downstreamPID,
  'z-formulation': formulationPID,
  'z-utilities': utilitiesPID,
  'z-packaging': packagingPID,
  'z-qc': qcPID,
  'z-warehouse': warehousePID,
};

// ============================================================
// LOOKUP FUNCTIONS
// ============================================================

export function getZonePID(zoneId: string): ZonePIDData | null {
  return allZonePIDData[zoneId] || null;
}

export function getAllZonePIDs(): ZonePIDData[] {
  return Object.values(allZonePIDData);
}

export function getZoneKPISummary(zoneId: string): ZoneKPISummary | null {
  const pid = getZonePID(zoneId);
  if (!pid) return null;

  const running = pid.equipmentStatus.filter(e => e.status === 'running').length;
  const maintenance = pid.equipmentStatus.filter(e => e.status === 'maintenance').length;
  const offline = pid.equipmentStatus.filter(e => e.status === 'offline').length;
  const avgEff = pid.equipmentStatus.length > 0
    ? Math.round(pid.equipmentStatus.reduce((s, e) => s + e.efficiency, 0) / pid.equipmentStatus.length)
    : 0;
  const totalHours = pid.equipmentStatus.reduce((s, e) => s + e.hoursRunning, 0);
  const activeBatches = pid.equipmentStatus.filter(e => e.batchId).length;
  const alarms = pid.instrumentValues.filter(i => i.alarmState !== 'normal');
  const criticalAlarms = alarms.filter(a => a.alarmState === 'critical');

  return {
    zoneId,
    totalEquipment: pid.equipment.length,
    runningEquipment: running,
    maintenanceEquipment: maintenance,
    offlineEquipment: offline,
    avgEfficiency: avgEff,
    totalHours,
    activeBatches,
    activeAlarms: alarms.length,
    criticalAlarms: criticalAlarms.length,
  };
}

// ============================================================
// ZONE PROCESS FLOW ORDER
// ============================================================

export const ZONE_PROCESS_ORDER = [
  'z-upstream',
  'z-downstream',
  'z-formulation',
  'z-qc',
  'z-packaging',
  'z-warehouse',
  'z-utilities',
];

// ============================================================
// ZONE LABELS
// ============================================================

export const ZONE_LABELS: Record<string, string> = {
  'z-upstream': 'Upstream Fermentation',
  'z-downstream': 'Downstream Processing',
  'z-formulation': 'Formulation & Blending',
  'z-qc': 'Quality Control Lab',
  'z-packaging': 'Packaging & Labeling',
  'z-warehouse': 'Warehouse',
  'z-utilities': 'Utilities',
};
