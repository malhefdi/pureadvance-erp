/**
 * Packaging Zone — P&ID Data
 * Drawing: PA-PID-PACK-001 Rev. A
 */

import type { ZonePIDData } from '@/types/pid-zone';

export const packagingPID: ZonePIDData = {
  zoneId: 'z-packaging',
  zoneName: 'Packaging & Labeling',
  zoneType: 'packaging',
  isoClass: 'ISO 8',
  drawingNumber: 'PA-PID-PACK-001',
  revision: 'Rev. A',

  viewBox: { x: 0, y: 0, width: 600, height: 280 },

  equipment: [
    {
      id: 'FL-FILL-01',
      symbolId: 'filling-machine',
      name: 'Auto Filling Machine',
      tag: 'FL-001',
      x: 80, y: 60,
      width: 70, height: 65,
      rotation: 0,
      vendor: 'IMA',
      specs: { type: 'Volumetric', heads: '4', speed: '60 bottles/min' },
      zone: 'z-packaging',
    },
    {
      id: 'E-SEAL-01',
      symbolId: 'heat-exchanger',
      name: 'Heat Sealer',
      tag: 'E-040',
      x: 250, y: 60,
      width: 55, height: 50,
      rotation: 0,
      specs: { type: 'Induction seal', temp: '180°C' },
      zone: 'z-packaging',
    },
    {
      id: 'MX-LABEL-01',
      symbolId: 'mixing-tank',
      name: 'Labeling Machine',
      tag: 'MX-040',
      x: 400, y: 60,
      width: 60, height: 55,
      rotation: 0,
      specs: { type: 'Self-adhesive', speed: '80 labels/min' },
      zone: 'z-packaging',
    },
    {
      id: 'TK-REJECT-01',
      symbolId: 'tank-vertical',
      name: 'Reject Bin',
      tag: 'TK-040',
      x: 250, y: 190,
      width: 45, height: 50,
      rotation: 0,
      specs: { volume: '50L', purpose: 'QC rejects' },
      zone: 'z-packaging',
    },
  ],

  connections: [
    {
      id: 'C-P001',
      lineType: 'process',
      from: { equipmentId: 'EXT-FORMULATION', portId: 'outlet' },
      to: { equipmentId: 'FL-FILL-01', portId: 'inlet' },
      points: [{ x: 20, y: 90 }, { x: 80, y: 90 }],
      diameter: 'DN25',
      label: 'Formulated Product',
    },
    {
      id: 'C-P002',
      lineType: 'process',
      from: { equipmentId: 'FL-FILL-01', portId: 'outlet' },
      to: { equipmentId: 'E-SEAL-01', portId: 'inlet' },
      points: [{ x: 150, y: 90 }, { x: 200, y: 90 }, { x: 200, y: 80 }, { x: 250, y: 80 }],
      diameter: 'DN25',
      label: 'Filled Bottles',
    },
    {
      id: 'C-P003',
      lineType: 'process',
      from: { equipmentId: 'E-SEAL-01', portId: 'outlet' },
      to: { equipmentId: 'MX-LABEL-01', portId: 'inlet' },
      points: [{ x: 305, y: 80 }, { x: 360, y: 80 }, { x: 360, y: 80 }, { x: 400, y: 80 }],
      label: 'Sealed Bottles',
    },
    {
      id: 'C-P004',
      lineType: 'process',
      from: { equipmentId: 'MX-LABEL-01', portId: 'outlet' },
      to: { equipmentId: 'EXT-WAREHOUSE', portId: 'inlet' },
      points: [{ x: 460, y: 80 }, { x: 550, y: 80 }],
      label: '→ Warehouse',
    },
    {
      id: 'C-P005',
      lineType: 'process',
      from: { equipmentId: 'FL-FILL-01', portId: 'outlet' },
      to: { equipmentId: 'TK-REJECT-01', portId: 'inlet' },
      points: [{ x: 130, y: 125 }, { x: 130, y: 200 }, { x: 250, y: 200 }],
      label: 'Rejects',
    },
  ],

  instruments: [
    { id: 'WIC-040', symbolId: 'sensor-level', tag: 'WIC-040', variable: 'Fill Weight', function: 'Indicating Controller', loopNumber: 70, mountedOn: 'FL-FILL-01', x: 60, y: 80, range: '0-500 g' },
    { id: 'CI-040', symbolId: 'sensor-temp', tag: 'CI-040', variable: 'Seal Quality', function: 'Indicator', loopNumber: 71, mountedOn: 'E-SEAL-01', x: 230, y: 80, range: 'Pass/Fail' },
    { id: 'SI-040', symbolId: 'sensor-temp', tag: 'SI-040', variable: 'Speed', function: 'Indicator', loopNumber: 72, mountedOn: 'MX-LABEL-01', x: 380, y: 80, range: '0-100/min' },
  ],

  controlLoops: [
    { id: 'CL-FILL', tag: 'WIC-040', name: 'Fill Volume Control', type: 'single', measuredVariable: 'Weight', setpoint: '250g', output: 'Fill pump', instruments: ['WIC-040'] },
  ],

  nozzles: [],

  equipmentStatus: [
    { equipmentId: 'FL-FILL-01', status: 'running', efficiency: 93, hoursRunning: 1100 },
    { equipmentId: 'E-SEAL-01', status: 'running', efficiency: 97, hoursRunning: 1100 },
    { equipmentId: 'MX-LABEL-01', status: 'running', efficiency: 95, hoursRunning: 1000 },
    { equipmentId: 'TK-REJECT-01', status: 'idle', efficiency: 100, hoursRunning: 0 },
  ],

  instrumentValues: [
    { instrumentId: 'WIC-040', value: 248, unit: 'g', setpoint: 250, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'CI-040', value: 1, unit: 'Pass', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'SI-040', value: 55, unit: '/min', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
  ],

  valvePositions: [
    { valveId: 'V-FILL-01', position: 'open', percentOpen: 100, mode: 'auto' },
  ],

  pipeFlow: [
    { connectionId: 'C-P001', flowing: true, flowRate: 50, animated: true },
    { connectionId: 'C-P002', flowing: true, flowRate: 55, animated: true },
    { connectionId: 'C-P003', flowing: true, flowRate: 55, animated: true },
    { connectionId: 'C-P004', flowing: true, flowRate: 50, animated: true },
    { connectionId: 'C-P005', flowing: false, animated: false },
  ],
};
