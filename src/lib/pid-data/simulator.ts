/**
 * P&ID Data Simulator
 * 
 * Generates realistic process data changes for demo/testing.
 * Simulates: instrument drift, valve actuations, alarm states, batch progression.
 * 
 * Architecture: pure functions — swap this with a real WebSocket/API source
 * by implementing the same updateZoneData signature.
 */

import type { ZonePIDData, InstrumentLiveData, ValveLiveData, PipeLiveData, EquipmentLiveData, AlarmSeverity } from '@/types/pid-zone';

// ============================================================
// DRIFT PROFILES — how each instrument type changes over time
// ============================================================

interface DriftProfile {
  noise: number;      // ± noise range per tick
  drift: number;      // slow drift direction
  maxDrift: number;    // max deviation from setpoint before correction
}

const DRIFT_PROFILES: Record<string, DriftProfile> = {
  '°C': { noise: 0.15, drift: 0.02, maxDrift: 2.0 },
  'pH': { noise: 0.02, drift: 0.005, maxDrift: 0.3 },
  '%': { noise: 1.5, drift: 0.3, maxDrift: 10 },
  'bar': { noise: 0.03, drift: 0.01, maxDrift: 0.5 },
  'L/min': { noise: 0.5, drift: 0.1, maxDrift: 3 },
  'rpm': { noise: 5, drift: 1, maxDrift: 30 },
};

function getDriftProfile(unit: string): DriftProfile {
  return DRIFT_PROFILES[unit] || { noise: 0.5, drift: 0.1, maxDrift: 5 };
}

// ============================================================
// SIMULATOR STATE — persisted across ticks per zone
// ============================================================

interface SimState {
  tickCount: number;
  lastBatchRotation: number;
  driftAccumulators: Record<string, number>;  // instrumentId → accumulated drift
  valveTargets: Record<string, number>;       // valveId → target %open
}

const zoneStates: Record<string, SimState> = {};

function getState(zoneId: string): SimState {
  if (!zoneStates[zoneId]) {
    zoneStates[zoneId] = {
      tickCount: 0,
      lastBatchRotation: 0,
      driftAccumulators: {},
      valveTargets: {},
    };
  }
  return zoneStates[zoneId];
}

// ============================================================
// INSTRUMENT VALUE SIMULATION
// ============================================================

function simulateInstrument(inst: InstrumentLiveData, state: SimState): InstrumentLiveData {
  const profile = getDriftProfile(inst.unit);
  const key = inst.instrumentId;

  // Accumulate drift
  if (!state.driftAccumulators[key]) state.driftAccumulators[key] = 0;
  state.driftAccumulators[key] += (Math.random() - 0.5) * profile.drift;

  // Clamp drift and apply correction when exceeding max
  if (Math.abs(state.driftAccumulators[key]) > profile.maxDrift) {
    state.driftAccumulators[key] *= -0.3; // corrective bounce
  }

  // Calculate new value: setpoint + drift + noise
  const baseValue = inst.setpoint ?? inst.value;
  const drift = state.driftAccumulators[key];
  const noise = (Math.random() - 0.5) * profile.noise * 2;
  let newValue = baseValue + drift + noise;

  // Clamp to physical limits
  if (inst.unit === 'pH') newValue = Math.max(0, Math.min(14, newValue));
  if (inst.unit === '%') newValue = Math.max(0, Math.min(100, newValue));
  if (inst.unit === '°C') newValue = Math.max(-10, Math.min(150, newValue));
  if (inst.unit === 'bar') newValue = Math.max(0, Math.min(10, newValue));
  if (inst.unit === 'L/min') newValue = Math.max(0, newValue);

  // Determine alarm state
  const deviation = Math.abs(newValue - baseValue);
  let alarmState: AlarmSeverity = 'normal';
  if (deviation > profile.maxDrift * 0.7) alarmState = 'critical';
  else if (deviation > profile.maxDrift * 0.4) alarmState = 'warning';

  // Update trend (rolling window of 20)
  const trend = [...(inst.trend || []), newValue].slice(-20);

  return {
    ...inst,
    value: Math.round(newValue * 100) / 100,
    alarmState,
    lastUpdated: new Date().toISOString(),
    trend,
  };
}

// ============================================================
// VALVE POSITION SIMULATION
// ============================================================

function simulateValve(valve: ValveLiveData, state: SimState): ValveLiveData {
  const key = valve.valveId;

  // Occasionally shift target
  if (!state.valveTargets[key] || Math.random() < 0.03) {
    if (valve.position === 'open') {
      state.valveTargets[key] = 90 + Math.random() * 10;
    } else if (valve.position === 'closed') {
      state.valveTargets[key] = Math.random() * 5;
    } else {
      state.valveTargets[key] = 20 + Math.random() * 60;
    }
  }

  // Smooth transition toward target
  const target = state.valveTargets[key];
  const diff = target - valve.percentOpen;
  const step = diff * 0.1 + (Math.random() - 0.5) * 2;
  let newPercent = Math.max(0, Math.min(100, valve.percentOpen + step));

  // Determine position
  let position: 'open' | 'closed' | 'partial';
  if (newPercent > 90) position = 'open';
  else if (newPercent < 10) position = 'closed';
  else position = 'partial';

  return {
    ...valve,
    percentOpen: Math.round(newPercent),
    position,
    lastActuation: Math.abs(diff) > 1 ? new Date().toISOString() : valve.lastActuation,
  };
}

// ============================================================
// PIPE FLOW SIMULATION
// ============================================================

function simulatePipeFlow(pipe: PipeLiveData, state: SimState): PipeLiveData {
  if (!pipe.flowing) return pipe;

  // Flow rate fluctuates slightly
  const baseRate = pipe.flowRate || 10;
  const noise = (Math.random() - 0.5) * baseRate * 0.08;
  const newRate = Math.max(0, baseRate + noise);

  // Temperature fluctuation
  const temp = pipe.temperature ? pipe.temperature + (Math.random() - 0.5) * 0.5 : undefined;

  return {
    ...pipe,
    flowRate: Math.round(newRate * 10) / 10,
    temperature: temp ? Math.round(temp * 10) / 10 : undefined,
    animated: pipe.flowing,
  };
}

// ============================================================
// EQUIPMENT STATUS SIMULATION
// ============================================================

const BATCH_IDS = ['BATCH-2026-001', 'BATCH-2026-002', 'BATCH-2026-003', 'BATCH-2026-004'];

function simulateEquipment(eq: EquipmentLiveData, state: SimState): EquipmentLiveData {
  let { status, efficiency, hoursRunning, batchId } = eq;

  // Running equipment: efficiency fluctuates
  if (status === 'running') {
    efficiency = Math.max(85, Math.min(100, efficiency + (Math.random() - 0.5) * 2));
    hoursRunning += 0.01; // ~36 sec per tick = 1 hour
    if (!batchId && Math.random() < 0.05) {
      batchId = BATCH_IDS[Math.floor(Math.random() * BATCH_IDS.length)];
    }
  }

  // Idle equipment: occasionally starts running
  if (status === 'idle' && Math.random() < 0.02) {
    status = 'running';
    efficiency = 90 + Math.random() * 10;
    batchId = BATCH_IDS[Math.floor(Math.random() * BATCH_IDS.length)];
  }

  // Running equipment: rarely goes idle
  if (status === 'running' && Math.random() < 0.005) {
    status = 'idle';
    batchId = undefined;
  }

  return {
    ...eq,
    status,
    efficiency: Math.round(efficiency * 10) / 10,
    hoursRunning: Math.round(hoursRunning * 100) / 100,
    batchId,
  };
}

// ============================================================
// MAIN UPDATE FUNCTION
// ============================================================

export function simulateZoneTick(zone: ZonePIDData): ZonePIDData {
  const state = getState(zone.zoneId);
  state.tickCount++;

  return {
    ...zone,
    instrumentValues: zone.instrumentValues.map(iv => simulateInstrument(iv, state)),
    valvePositions: zone.valvePositions.map(vv => simulateValve(vv, state)),
    pipeFlow: zone.pipeFlow.map(pf => simulatePipeFlow(pf, state)),
    equipmentStatus: zone.equipmentStatus.map(es => simulateEquipment(es, state)),
  };
}

// ============================================================
// RESET SIMULATOR STATE
// ============================================================

export function resetSimulator(zoneId?: string) {
  if (zoneId) {
    delete zoneStates[zoneId];
  } else {
    Object.keys(zoneStates).forEach(k => delete zoneStates[k]);
  }
}
