/**
 * Warehouse Zone — P&ID Data
 * Drawing: PA-PID-WH-001 Rev. A
 */

import type { ZonePIDData } from '@/types/pid-zone';

export const warehousePID: ZonePIDData = {
  zoneId: 'z-warehouse',
  zoneName: 'Warehouse',
  zoneType: 'warehouse',
  drawingNumber: 'PA-PID-WH-001',
  revision: 'Rev. A',

  viewBox: { x: 0, y: 0, width: 500, height: 280 },

  equipment: [
    {
      id: 'CS-COLD-01',
      symbolId: 'cold-storage',
      name: 'Cold Storage Room',
      tag: 'CS-001',
      x: 60, y: 60,
      width: 80, height: 70,
      rotation: 0,
      specs: { temp: '2-8°C', volume: '50m³', type: 'Walk-in cooler' },
      zone: 'z-warehouse',
    },
    {
      id: 'CS-COLD-02',
      symbolId: 'cold-storage',
      name: 'Freezer Room',
      tag: 'CS-002',
      x: 240, y: 60,
      width: 80, height: 70,
      rotation: 0,
      specs: { temp: '-20°C', volume: '20m³', type: 'Walk-in freezer' },
      zone: 'z-warehouse',
    },
    {
      id: 'TK-RM-01',
      symbolId: 'tank-vertical',
      name: 'Raw Material Storage',
      tag: 'TK-060',
      x: 60, y: 200,
      width: 60, height: 55,
      rotation: 0,
      specs: { type: 'Shelving', temp: '15-25°C', area: '40m²' },
      zone: 'z-warehouse',
    },
    {
      id: 'TK-FG-01',
      symbolId: 'tank-vertical',
      name: 'Finished Goods Storage',
      tag: 'TK-061',
      x: 240, y: 200,
      width: 60, height: 55,
      rotation: 0,
      specs: { type: 'Pallet racking', temp: '15-25°C', area: '60m²' },
      zone: 'z-warehouse',
    },
  ],

  connections: [
    {
      id: 'C-W001',
      lineType: 'process',
      from: { equipmentId: 'EXT-PACKAGING', portId: 'outlet' },
      to: { equipmentId: 'CS-COLD-01', portId: 'inlet' },
      points: [{ x: 20, y: 90 }, { x: 60, y: 90 }],
      label: 'Finished Product',
    },
    {
      id: 'C-W002',
      lineType: 'process',
      from: { equipmentId: 'EXT-PACKAGING', portId: 'outlet' },
      to: { equipmentId: 'TK-FG-01', portId: 'inlet' },
      points: [{ x: 20, y: 90 }, { x: 20, y: 225 }, { x: 240, y: 225 }],
      label: 'Ambient Products',
    },
  ],

  instruments: [
    { id: 'TI-060', symbolId: 'sensor-temp', tag: 'TI-060', variable: 'Cold Room Temp', function: 'Indicator', loopNumber: 90, mountedOn: 'CS-COLD-01', x: 40, y: 80, range: '-5-15°C' },
    { id: 'TI-061', symbolId: 'sensor-temp', tag: 'TI-061', variable: 'Freezer Temp', function: 'Indicator', loopNumber: 91, mountedOn: 'CS-COLD-02', x: 220, y: 80, range: '-30 to 0°C' },
    { id: 'TI-062', symbolId: 'sensor-temp', tag: 'TI-062', variable: 'Ambient Temp', function: 'Indicator', loopNumber: 92, mountedOn: 'TK-RM-01', x: 40, y: 220, range: '0-40°C' },
  ],

  controlLoops: [
    { id: 'CL-COLD', tag: 'TIC-060', name: 'Cold Room Temperature', type: 'single', measuredVariable: 'Temperature', setpoint: '5°C', output: 'Refrigeration', instruments: ['TI-060'] },
    { id: 'CL-FREEZE', tag: 'TIC-061', name: 'Freezer Temperature', type: 'single', measuredVariable: 'Temperature', setpoint: '-20°C', output: 'Compressor', instruments: ['TI-061'] },
  ],

  nozzles: [],

  equipmentStatus: [
    { equipmentId: 'CS-COLD-01', status: 'running', efficiency: 98, hoursRunning: 8500 },
    { equipmentId: 'CS-COLD-02', status: 'running', efficiency: 97, hoursRunning: 8500 },
    { equipmentId: 'TK-RM-01', status: 'idle', efficiency: 100, hoursRunning: 0 },
    { equipmentId: 'TK-FG-01', status: 'idle', efficiency: 100, hoursRunning: 0 },
  ],

  instrumentValues: [
    { instrumentId: 'TI-060', value: 5.2, unit: '°C', setpoint: 5, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z', trend: [5.0, 5.1, 5.3, 5.2, 5.1, 5.2, 5.2] },
    { instrumentId: 'TI-061', value: -19.8, unit: '°C', setpoint: -20, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'TI-062', value: 22.5, unit: '°C', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
  ],

  valvePositions: [],
  pipeFlow: [
    { connectionId: 'C-W001', flowing: true, flowRate: 10, animated: true },
    { connectionId: 'C-W002', flowing: false, animated: false },
  ],
};
