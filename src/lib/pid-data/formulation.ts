/**
 * Formulation Zone — P&ID Data
 * 
 * Equipment: Blender → Homogenizer → Holding Tank
 * Drawing: PA-PID-FORM-001 Rev. A
 */

import type { ZonePIDData } from '@/types/pid-zone';

export const formulationPID: ZonePIDData = {
  zoneId: 'z-formulation',
  zoneName: 'Formulation & Blending',
  zoneType: 'formulation',
  isoClass: 'ISO 8',
  drawingNumber: 'PA-PID-FORM-001',
  revision: 'Rev. A',

  viewBox: { x: 0, y: 0, width: 600, height: 350 },

  equipment: [
    {
      id: 'MX-BLEND-01',
      symbolId: 'mixing-tank',
      name: 'Ribbon Blender 500L',
      tag: 'MX-001',
      x: 80, y: 60,
      width: 70, height: 65,
      rotation: 0,
      vendor: 'Munson',
      specs: { volume: '500L', type: 'Horizontal ribbon', speed: '30-120 RPM' },
      zone: 'z-formulation',
    },
    {
      id: 'TK-ACTIVE-01',
      symbolId: 'tank-vertical',
      name: 'Active Ingredient Tank',
      tag: 'TK-020',
      x: 80, y: 210,
      width: 45, height: 55,
      rotation: 0,
      specs: { volume: '100L', material: 'SS316L', contents: 'Btk concentrate' },
      zone: 'z-formulation',
    },
    {
      id: 'TK-EXCIPIENT-01',
      symbolId: 'tank-vertical',
      name: 'Excipient Tank',
      tag: 'TK-021',
      x: 200, y: 210,
      width: 45, height: 55,
      rotation: 0,
      specs: { volume: '200L', contents: 'Lignosulfonate + carriers' },
      zone: 'z-formulation',
    },
    {
      id: 'TK-HOLD-01',
      symbolId: 'tank-vertical',
      name: 'Holding Tank',
      tag: 'TK-022',
      x: 350, y: 60,
      width: 55, height: 65,
      rotation: 0,
      specs: { volume: '600L', material: 'SS316L', agitation: 'Low-shear' },
      zone: 'z-formulation',
    },
    {
      id: 'P-TRANSFER-01',
      symbolId: 'pump-centrifugal',
      name: 'Transfer Pump',
      tag: 'P-020',
      x: 250, y: 100,
      width: 40, height: 35,
      rotation: 0,
      specs: { type: 'Centrifugal', flow: '500 L/hr' },
      zone: 'z-formulation',
    },
  ],

  connections: [
    {
      id: 'C-F001',
      lineType: 'process',
      from: { equipmentId: 'TK-ACTIVE-01', portId: 'outlet' },
      to: { equipmentId: 'MX-BLEND-01', portId: 'inlet' },
      points: [{ x: 102, y: 210 }, { x: 102, y: 170 }, { x: 115, y: 125 }],
      diameter: 'DN25',
      label: 'Btk Concentrate',
    },
    {
      id: 'C-F002',
      lineType: 'process',
      from: { equipmentId: 'TK-EXCIPIENT-01', portId: 'outlet' },
      to: { equipmentId: 'MX-BLEND-01', portId: 'inlet' },
      points: [{ x: 222, y: 210 }, { x: 222, y: 150 }, { x: 140, y: 125 }],
      diameter: 'DN25',
      label: 'Excipients',
    },
    {
      id: 'C-F003',
      lineType: 'process',
      from: { equipmentId: 'MX-BLEND-01', portId: 'outlet' },
      to: { equipmentId: 'P-TRANSFER-01', portId: 'inlet' },
      points: [{ x: 150, y: 125 }, { x: 200, y: 125 }, { x: 250, y: 115 }],
      diameter: 'DN40',
    },
    {
      id: 'C-F004',
      lineType: 'process',
      from: { equipmentId: 'P-TRANSFER-01', portId: 'outlet' },
      to: { equipmentId: 'TK-HOLD-01', portId: 'inlet' },
      points: [{ x: 290, y: 115 }, { x: 330, y: 115 }, { x: 330, y: 90 }, { x: 350, y: 90 }],
      diameter: 'DN40',
      label: 'Formulated Product',
    },
    {
      id: 'C-F005',
      lineType: 'process',
      from: { equipmentId: 'TK-HOLD-01', portId: 'outlet' },
      to: { equipmentId: 'EXT-PACKAGING', portId: 'inlet' },
      points: [{ x: 377, y: 125 }, { x: 450, y: 125 }, { x: 550, y: 125 }],
      diameter: 'DN40',
      label: '→ Filling',
    },
  ],

  instruments: [
    { id: 'WIC-001', symbolId: 'sensor-level', tag: 'WIC-001', variable: 'Weight', function: 'Indicating Controller', loopNumber: 50, mountedOn: 'MX-BLEND-01', x: 60, y: 80, range: '0-600 kg' },
    { id: 'SI-020', symbolId: 'sensor-temp', tag: 'SI-020', variable: 'Speed', function: 'Indicator', loopNumber: 51, mountedOn: 'MX-BLEND-01', x: 60, y: 105, range: '0-150 RPM' },
    { id: 'LI-020', symbolId: 'sensor-level', tag: 'LI-020', variable: 'Level', function: 'Indicator', loopNumber: 52, mountedOn: 'TK-ACTIVE-01', x: 60, y: 235, range: '0-100%' },
    { id: 'LI-021', symbolId: 'sensor-level', tag: 'LI-021', variable: 'Level', function: 'Indicator', loopNumber: 53, mountedOn: 'TK-EXCIPIENT-01', x: 180, y: 235, range: '0-100%' },
    { id: 'LI-022', symbolId: 'sensor-level', tag: 'LI-022', variable: 'Level', function: 'Indicator', loopNumber: 54, mountedOn: 'TK-HOLD-01', x: 330, y: 80, range: '0-100%' },
    { id: 'FI-020', symbolId: 'sensor-flow', tag: 'FI-020', variable: 'Transfer Flow', function: 'Indicator', loopNumber: 55, mountedOn: 'P-TRANSFER-01', x: 230, y: 140, range: '0-1000 L/hr' },
  ],

  controlLoops: [
    {
      id: 'CL-BLEND',
      tag: 'KIC-001',
      name: 'Blend Time Control',
      type: 'single',
      measuredVariable: 'Time',
      setpoint: '15 min',
      output: 'Blender motor',
      instruments: ['WIC-001', 'SI-020'],
    },
  ],

  nozzles: [
    { id: 'N-MX-IN', equipmentId: 'MX-BLEND-01', name: 'Inlet', size: 'DN40', type: 'Tri-clamp', rating: 'BPE', service: 'Ingredients' },
    { id: 'N-MX-OUT', equipmentId: 'MX-BLEND-01', name: 'Outlet', size: 'DN40', type: 'Tri-clamp', rating: 'BPE', service: 'Mixed product' },
  ],

  equipmentStatus: [
    { equipmentId: 'MX-BLEND-01', status: 'running', efficiency: 96, hoursRunning: 600 },
    { equipmentId: 'TK-ACTIVE-01', status: 'running', efficiency: 99, hoursRunning: 1500 },
    { equipmentId: 'TK-EXCIPIENT-01', status: 'running', efficiency: 99, hoursRunning: 1500 },
    { equipmentId: 'TK-HOLD-01', status: 'running', efficiency: 98, hoursRunning: 900 },
    { equipmentId: 'P-TRANSFER-01', status: 'running', efficiency: 94, hoursRunning: 700 },
  ],

  instrumentValues: [
    { instrumentId: 'WIC-001', value: 320, unit: 'kg', setpoint: 350, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'SI-020', value: 85, unit: 'RPM', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'LI-020', value: 35, unit: '%', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'LI-021', value: 55, unit: '%', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'LI-022', value: 70, unit: '%', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'FI-020', value: 280, unit: 'L/hr', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
  ],

  valvePositions: [
    { valveId: 'V-ACTIVE-01', position: 'open', percentOpen: 60, mode: 'auto' },
    { valveId: 'V-EXCIPIENT-01', position: 'open', percentOpen: 40, mode: 'auto' },
    { valveId: 'V-TRANSFER-01', position: 'open', percentOpen: 100, mode: 'auto' },
  ],

  pipeFlow: [
    { connectionId: 'C-F001', flowing: true, flowRate: 15, animated: true },
    { connectionId: 'C-F002', flowing: true, flowRate: 10, animated: true },
    { connectionId: 'C-F003', flowing: true, flowRate: 25, animated: true },
    { connectionId: 'C-F004', flowing: true, flowRate: 25, animated: true },
    { connectionId: 'C-F005', flowing: false, animated: false },
  ],
};
