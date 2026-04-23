/**
 * QC Laboratory — P&ID Data
 * Simplified — lab layout, not process piping
 * Drawing: PA-PID-QC-001 Rev. A
 */

import type { ZonePIDData } from '@/types/pid-zone';

export const qcPID: ZonePIDData = {
  zoneId: 'z-qc',
  zoneName: 'Quality Control Lab',
  zoneType: 'qc',
  isoClass: 'ISO 8',
  drawingNumber: 'PA-PID-QC-001',
  revision: 'Rev. A',

  viewBox: { x: 0, y: 0, width: 500, height: 300 },

  equipment: [
    {
      id: 'E-HPLC-01',
      symbolId: 'filter',
      name: 'HPLC System',
      tag: 'E-050',
      x: 60, y: 60,
      width: 60, height: 55,
      rotation: 0,
      vendor: 'Agilent',
      model: '1260 Infinity II',
      specs: { detector: 'UV-Vis', columns: 'C18, HILIC', autosampler: '120 vials' },
      zone: 'z-qc',
    },
    {
      id: 'TK-INCUB-01',
      symbolId: 'cold-storage',
      name: 'Incubator 30°C',
      tag: 'TK-050',
      x: 220, y: 60,
      width: 55, height: 55,
      rotation: 0,
      specs: { temp: '30°C ±0.5°C', type: 'BOD incubator', capacity: '150L' },
      zone: 'z-qc',
    },
    {
      id: 'E-LAF-01',
      symbolId: 'filter',
      name: 'Laminar Flow Hood',
      tag: 'E-051',
      x: 380, y: 60,
      width: 55, height: 55,
      rotation: 0,
      specs: { class: 'ISO 5', airflow: '0.45 m/s', HEPA: 'H14' },
      zone: 'z-qc',
    },
    {
      id: 'E-COUNT-01',
      symbolId: 'filter',
      name: 'Particle Counter',
      tag: 'E-052',
      x: 60, y: 180,
      width: 55, height: 50,
      rotation: 0,
      vendor: 'Lighthouse',
      specs: { channels: '0.3-10 μm', flow: '1 CFM' },
      zone: 'z-qc',
    },
    {
      id: 'E-BAL-01',
      symbolId: 'filter',
      name: 'Analytical Balance',
      tag: 'E-053',
      x: 220, y: 180,
      width: 55, height: 50,
      rotation: 0,
      specs: { capacity: '220g', readability: '0.1mg' },
      zone: 'z-qc',
    },
  ],

  connections: [], // Lab — no process piping between instruments

  instruments: [
    { id: 'TI-050', symbolId: 'sensor-temp', tag: 'TI-050', variable: 'Incubator Temp', function: 'Indicator', loopNumber: 80, mountedOn: 'TK-INCUB-01', x: 200, y: 80, range: '0-60°C' },
    { id: 'AI-050', symbolId: 'sensor-flow', tag: 'AI-050', variable: 'Airflow', function: 'Indicator', loopNumber: 81, mountedOn: 'E-LAF-01', x: 360, y: 80, range: '0-1 m/s' },
  ],

  controlLoops: [
    { id: 'CL-INCUB', tag: 'TIC-050', name: 'Incubator Temperature', type: 'single', measuredVariable: 'Temperature', setpoint: '30°C', output: 'Heater', instruments: ['TI-050'] },
  ],

  nozzles: [],

  equipmentStatus: [
    { equipmentId: 'E-HPLC-01', status: 'running', efficiency: 95, hoursRunning: 1800 },
    { equipmentId: 'TK-INCUB-01', status: 'running', efficiency: 99, hoursRunning: 5200 },
    { equipmentId: 'E-LAF-01', status: 'running', efficiency: 100, hoursRunning: 3100 },
    { equipmentId: 'E-COUNT-01', status: 'idle', efficiency: 100, hoursRunning: 800 },
    { equipmentId: 'E-BAL-01', status: 'running', efficiency: 100, hoursRunning: 2200 },
  ],

  instrumentValues: [
    { instrumentId: 'TI-050', value: 30.1, unit: '°C', setpoint: 30, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'AI-050', value: 0.44, unit: 'm/s', setpoint: 0.45, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
  ],

  valvePositions: [],
  pipeFlow: [],
};
