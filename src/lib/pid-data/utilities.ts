/**
 * Utilities Zone — P&ID Data
 * 
 * WFI generation, clean steam, chiller, compressed air
 * Drawing: PA-PID-UTIL-001 Rev. A
 */

import type { ZonePIDData } from '@/types/pid-zone';

export const utilitiesPID: ZonePIDData = {
  zoneId: 'z-utilities',
  zoneName: 'Utilities',
  zoneType: 'utilities',
  drawingNumber: 'PA-PID-UTIL-001',
  revision: 'Rev. A',

  viewBox: { x: 0, y: 0, width: 700, height: 350 },

  equipment: [
    {
      id: 'E-WFI-01',
      symbolId: 'water-purification',
      name: 'WFI Generation System',
      tag: 'E-030',
      x: 60, y: 60,
      width: 70, height: 70,
      rotation: 0,
      vendor: 'Evoqua',
      specs: { type: 'Distillation', capacity: '500 L/hr', temp: '80°C (hot loop)' },
      zone: 'z-utilities',
    },
    {
      id: 'TK-WFI-HOLD',
      symbolId: 'tank-vertical',
      name: 'WFI Hold Tank',
      tag: 'TK-030',
      x: 220, y: 60,
      width: 55, height: 65,
      rotation: 0,
      specs: { volume: '2000L', material: 'SS316L', temp: '80°C', polish: '0.2μm' },
      zone: 'z-utilities',
    },
    {
      id: 'B-STEAM-01',
      symbolId: 'boiler',
      name: 'Clean Steam Generator',
      tag: 'B-030',
      x: 400, y: 60,
      width: 60, height: 55,
      rotation: 0,
      vendor: 'Spirax Sarco',
      specs: { type: 'Pure steam', capacity: '200 kg/hr', pressure: '3 bar' },
      zone: 'z-utilities',
    },
    {
      id: 'CH-CHILLER-01',
      symbolId: 'chiller',
      name: 'Process Chiller',
      tag: 'CH-030',
      x: 570, y: 60,
      width: 55, height: 50,
      rotation: 0,
      vendor: 'Carrier',
      specs: { capacity: '50 kW', temp: '4-8°C', refrigerant: 'R410A' },
      zone: 'z-utilities',
    },
    {
      id: 'K-COMP-01',
      symbolId: 'compressor',
      name: 'Oil-Free Air Compressor',
      tag: 'K-030',
      x: 400, y: 200,
      width: 55, height: 50,
      rotation: 0,
      vendor: 'Atlas Copco',
      specs: { type: 'Oil-free scroll', pressure: '10 bar', flow: '500 Nl/min' },
      zone: 'z-utilities',
    },
    {
      id: 'TK-CDA-01',
      symbolId: 'tank-vertical',
      name: 'CDA Receiver Tank',
      tag: 'TK-031',
      x: 570, y: 200,
      width: 45, height: 55,
      rotation: 0,
      specs: { volume: '1000L', pressure: '10 bar', drying: 'Desiccant' },
      zone: 'z-utilities',
    },
  ],

  connections: [
    {
      id: 'C-U001',
      lineType: 'process',
      from: { equipmentId: 'E-WFI-01', portId: 'outlet' },
      to: { equipmentId: 'TK-WFI-HOLD', portId: 'inlet' },
      points: [{ x: 130, y: 95 }, { x: 180, y: 95 }, { x: 180, y: 90 }, { x: 220, y: 90 }],
      diameter: 'DN40',
      material: 'SS316L',
      label: 'WFI',
    },
    {
      id: 'C-U002',
      lineType: 'process',
      from: { equipmentId: 'TK-WFI-HOLD', portId: 'outlet' },
      to: { equipmentId: 'EXT-PLANT', portId: 'inlet' },
      points: [{ x: 247, y: 125 }, { x: 300, y: 150 }, { x: 650, y: 150 }],
      diameter: 'DN40',
      material: 'SS316L',
      label: 'WFI Loop → Plant',
    },
    {
      id: 'C-U003',
      lineType: 'steam',
      from: { equipmentId: 'B-STEAM-01', portId: 'outlet' },
      to: { equipmentId: 'EXT-PLANT', portId: 'inlet' },
      points: [{ x: 430, y: 115 }, { x: 430, y: 160 }, { x: 650, y: 160 }],
      diameter: 'DN25',
      label: 'Clean Steam → SIP',
    },
    {
      id: 'C-U004',
      lineType: 'utility',
      from: { equipmentId: 'CH-CHILLER-01', portId: 'outlet' },
      to: { equipmentId: 'EXT-PLANT', portId: 'inlet' },
      points: [{ x: 597, y: 110 }, { x: 597, y: 170 }, { x: 650, y: 170 }],
      diameter: 'DN40',
      label: 'Chilled Water',
    },
    {
      id: 'C-U005',
      lineType: 'instrument',
      from: { equipmentId: 'K-COMP-01', portId: 'outlet' },
      to: { equipmentId: 'TK-CDA-01', portId: 'inlet' },
      points: [{ x: 455, y: 225 }, { x: 520, y: 225 }, { x: 520, y: 225 }, { x: 570, y: 225 }],
      diameter: 'DN25',
      label: 'Compressed Air',
    },
    {
      id: 'C-U006',
      lineType: 'instrument',
      from: { equipmentId: 'TK-CDA-01', portId: 'outlet' },
      to: { equipmentId: 'EXT-PLANT', portId: 'inlet' },
      points: [{ x: 592, y: 255 }, { x: 620, y: 270 }, { x: 650, y: 180 }],
      diameter: 'DN25',
      label: 'CDA → Plant',
    },
  ],

  instruments: [
    { id: 'TT-030', symbolId: 'sensor-temp', tag: 'TT-030', variable: 'WFI Temperature', function: 'Transmitter', loopNumber: 60, mountedOn: 'TK-WFI-HOLD', x: 200, y: 80, range: '0-100°C', signal: '4-20mA' },
    { id: 'CI-030', symbolId: 'sensor-temp', tag: 'CI-030', variable: 'Conductivity', function: 'Indicator', loopNumber: 61, mountedOn: 'E-WFI-01', x: 40, y: 90, range: '0-1.3 μS/cm' },
    { id: 'PI-030', symbolId: 'sensor-pressure', tag: 'PI-030', variable: 'Steam Pressure', function: 'Indicator', loopNumber: 62, mountedOn: 'B-STEAM-01', x: 380, y: 80, range: '0-5 bar' },
    { id: 'TI-030', symbolId: 'sensor-temp', tag: 'TI-030', variable: 'Chilled Temp', function: 'Indicator', loopNumber: 63, mountedOn: 'CH-CHILLER-01', x: 550, y: 80, range: '0-20°C' },
    { id: 'PI-031', symbolId: 'sensor-pressure', tag: 'PI-031', variable: 'Air Pressure', function: 'Indicator', loopNumber: 64, mountedOn: 'TK-CDA-01', x: 550, y: 220, range: '0-12 bar' },
  ],

  controlLoops: [
    { id: 'CL-WFI-TEMP', tag: 'TIC-030', name: 'WFI Loop Temperature', type: 'single', measuredVariable: 'Temperature', setpoint: '80°C', output: 'Heater', instruments: ['TT-030'] },
    { id: 'CL-CHILLER', tag: 'TIC-031', name: 'Chilled Water Temp', type: 'single', measuredVariable: 'Temperature', setpoint: '6°C', output: 'Compressor', instruments: ['TI-030'] },
  ],

  nozzles: [],

  equipmentStatus: [
    { equipmentId: 'E-WFI-01', status: 'running', efficiency: 98, hoursRunning: 6200 },
    { equipmentId: 'TK-WFI-HOLD', status: 'running', efficiency: 100, hoursRunning: 6200 },
    { equipmentId: 'B-STEAM-01', status: 'running', efficiency: 97, hoursRunning: 4800 },
    { equipmentId: 'CH-CHILLER-01', status: 'running', efficiency: 95, hoursRunning: 3200 },
    { equipmentId: 'K-COMP-01', status: 'running', efficiency: 96, hoursRunning: 4100 },
    { equipmentId: 'TK-CDA-01', status: 'running', efficiency: 100, hoursRunning: 4100 },
  ],

  instrumentValues: [
    { instrumentId: 'TT-030', value: 79.5, unit: '°C', setpoint: 80, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'CI-030', value: 0.8, unit: 'μS/cm', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'PI-030', value: 2.8, unit: 'bar', setpoint: 3, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'TI-030', value: 6.2, unit: '°C', setpoint: 6, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'PI-031', value: 9.5, unit: 'bar', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
  ],

  valvePositions: [],
  pipeFlow: [
    { connectionId: 'C-U001', flowing: true, flowRate: 300, animated: true },
    { connectionId: 'C-U002', flowing: true, flowRate: 200, animated: true },
    { connectionId: 'C-U003', flowing: true, flowRate: 100, animated: true },
    { connectionId: 'C-U004', flowing: true, flowRate: 400, animated: true },
    { connectionId: 'C-U005', flowing: true, flowRate: 300, animated: true },
    { connectionId: 'C-U006', flowing: true, flowRate: 300, animated: true },
  ],
};
