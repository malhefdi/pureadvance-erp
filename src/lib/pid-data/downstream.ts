/**
 * Downstream Processing Zone — P&ID Data
 * 
 * Equipment: Centrifuge → Buffer Tank → Spray Dryer
 * With: CIP, condensate, product collection
 * 
 * Drawing: PA-PID-DSP-001 Rev. A
 */

import type { ZonePIDData } from '@/types/pid-zone';

export const downstreamPID: ZonePIDData = {
  zoneId: 'z-downstream',
  zoneName: 'Downstream Processing',
  zoneType: 'downstream',
  isoClass: 'ISO 7',
  drawingNumber: 'PA-PID-DSP-001',
  revision: 'Rev. A',

  viewBox: { x: 0, y: 0, width: 700, height: 400 },

  equipment: [
    // Disc Stack Centrifuge
    {
      id: 'C-001',
      symbolId: 'centrifuge',
      name: 'Disc Stack Centrifuge',
      tag: 'C-001',
      x: 80, y: 80,
      width: 70, height: 70,
      rotation: 0,
      vendor: 'Alfa Laval',
      model: 'BTPX 205',
      specs: { capacity: '500 L/hr', type: 'Self-cleaning', bowlspeed: '7200 RPM' },
      zone: 'z-downstream',
    },
    // Harvest Buffer Tank
    {
      id: 'TK-BUFFER-01',
      symbolId: 'tank-vertical',
      name: 'Harvest Buffer Tank',
      tag: 'TK-010',
      x: 250, y: 80,
      width: 55, height: 65,
      rotation: 0,
      specs: { volume: '300L', material: 'SS316L', temp: '4-8°C' },
      zone: 'z-downstream',
    },
    // Feed Pump to Dryer
    {
      id: 'P-FEED-01',
      symbolId: 'pump-centrifugal',
      name: 'Feed Pump',
      tag: 'P-010',
      x: 370, y: 120,
      width: 40, height: 35,
      rotation: 0,
      specs: { type: 'Peristaltic', flow: '100 L/hr', pressure: '2 bar' },
      zone: 'z-downstream',
    },
    // Spray Dryer
    {
      id: 'DR-SPRAY-01',
      symbolId: 'spray-dryer',
      name: 'Spray Dryer SD-1000',
      tag: 'DR-001',
      x: 480, y: 60,
      width: 80, height: 100,
      rotation: 0,
      vendor: 'Buchi',
      model: 'B-290',
      specs: { capacity: '50 kg/hr', inletTemp: '180°C', outletTemp: '65°C' },
      zone: 'z-downstream',
    },
    // Product Collection
    {
      id: 'TK-PRODUCT-01',
      symbolId: 'tank-vertical',
      name: 'Product Collection Bin',
      tag: 'TK-011',
      x: 520, y: 220,
      width: 50, height: 55,
      rotation: 0,
      specs: { volume: '100L', material: 'SS316L' },
      zone: 'z-downstream',
    },
    // CIP Supply (reference)
    {
      id: 'TK-CIP-01',
      symbolId: 'tank-vertical',
      name: 'CIP Supply Tank',
      tag: 'TK-012',
      x: 80, y: 260,
      width: 50, height: 55,
      rotation: 0,
      specs: { volume: '200L', temp: '75°C', solution: 'NaOH 2%' },
      zone: 'z-downstream',
    },
  ],

  connections: [
    // Broth from upstream → Centrifuge
    {
      id: 'C-D001',
      lineType: 'process',
      from: { equipmentId: 'EXT-UPSTREAM', portId: 'outlet' },
      to: { equipmentId: 'C-001', portId: 'inlet' },
      points: [
        { x: 20, y: 110 },
        { x: 80, y: 110 },
      ],
      diameter: 'DN50',
      material: 'SS316L',
      label: 'Fermentation Broth',
    },
    // Centrifuge → Buffer Tank
    {
      id: 'C-D002',
      lineType: 'process',
      from: { equipmentId: 'C-001', portId: 'outlet' },
      to: { equipmentId: 'TK-BUFFER-01', portId: 'inlet' },
      points: [
        { x: 150, y: 110 },
        { x: 200, y: 110 },
        { x: 200, y: 100 },
        { x: 250, y: 100 },
      ],
      diameter: 'DN40',
      material: 'SS316L',
      label: 'Clarified Broth',
    },
    // Centrifuge → Waste
    {
      id: 'C-D003',
      lineType: 'process',
      from: { equipmentId: 'C-001', portId: 'outlet' },
      to: { equipmentId: 'EXT-WASTE', portId: 'inlet' },
      points: [
        { x: 115, y: 150 },
        { x: 115, y: 200 },
        { x: 200, y: 200 },
      ],
      diameter: 'DN40',
      label: 'Centrate (Waste)',
    },
    // Buffer Tank → Feed Pump
    {
      id: 'C-D004',
      lineType: 'process',
      from: { equipmentId: 'TK-BUFFER-01', portId: 'outlet' },
      to: { equipmentId: 'P-FEED-01', portId: 'inlet' },
      points: [
        { x: 280, y: 145 },
        { x: 320, y: 145 },
        { x: 320, y: 135 },
        { x: 370, y: 135 },
      ],
      diameter: 'DN25',
      material: 'SS316L',
    },
    // Feed Pump → Spray Dryer
    {
      id: 'C-D005',
      lineType: 'process',
      from: { equipmentId: 'P-FEED-01', portId: 'outlet' },
      to: { equipmentId: 'DR-SPRAY-01', portId: 'inlet' },
      points: [
        { x: 410, y: 135 },
        { x: 450, y: 135 },
        { x: 450, y: 100 },
        { x: 480, y: 100 },
      ],
      diameter: 'DN25',
      material: 'SS316L',
      label: 'Concentrate Feed',
    },
    // Spray Dryer → Product Collection
    {
      id: 'C-D006',
      lineType: 'process',
      from: { equipmentId: 'DR-SPRAY-01', portId: 'outlet' },
      to: { equipmentId: 'TK-PRODUCT-01', portId: 'inlet' },
      points: [
        { x: 540, y: 160 },
        { x: 540, y: 190 },
        { x: 545, y: 220 },
      ],
      diameter: 'DN50',
      label: 'Dried Product',
    },
    // Spray Dryer exhaust
    {
      id: 'C-D007',
      lineType: 'process',
      from: { equipmentId: 'DR-SPRAY-01', portId: 'outlet' },
      to: { equipmentId: 'EXT-EXHAUST', portId: 'inlet' },
      points: [
        { x: 560, y: 60 },
        { x: 600, y: 60 },
        { x: 650, y: 60 },
      ],
      diameter: 'DN100',
      label: 'Exhaust Air',
    },
    // CIP → Centrifuge
    {
      id: 'C-D008',
      lineType: 'process',
      from: { equipmentId: 'TK-CIP-01', portId: 'outlet' },
      to: { equipmentId: 'C-001', portId: 'inlet' },
      points: [
        { x: 105, y: 260 },
        { x: 105, y: 200 },
        { x: 105, y: 150 },
      ],
      diameter: 'DN25',
      label: 'CIP Solution',
    },
  ],

  instruments: [
    {
      id: 'SI-001',
      symbolId: 'sensor-temp',
      tag: 'SI-001',
      variable: 'Speed',
      function: 'Indicator',
      loopNumber: 40,
      mountedOn: 'C-001',
      x: 60, y: 100,
      range: '0-8000 RPM',
    },
    {
      id: 'PI-010',
      symbolId: 'sensor-pressure',
      tag: 'PI-010',
      variable: 'Pressure',
      function: 'Indicator',
      loopNumber: 41,
      mountedOn: 'C-001',
      x: 60, y: 125,
      range: '0-5 bar',
    },
    {
      id: 'TT-010',
      symbolId: 'sensor-temp',
      tag: 'TT-010',
      variable: 'Temperature',
      function: 'Transmitter',
      loopNumber: 42,
      mountedOn: 'TK-BUFFER-01',
      x: 230, y: 100,
      range: '0-50°C',
      signal: '4-20mA',
    },
    {
      id: 'LI-010',
      symbolId: 'sensor-level',
      tag: 'LI-010',
      variable: 'Level',
      function: 'Indicator',
      loopNumber: 43,
      mountedOn: 'TK-BUFFER-01',
      x: 230, y: 125,
      range: '0-100%',
    },
    {
      id: 'TIC-010',
      symbolId: 'sensor-temp',
      tag: 'TIC-010',
      variable: 'Inlet Temperature',
      function: 'Indicating Controller',
      loopNumber: 44,
      mountedOn: 'DR-SPRAY-01',
      x: 460, y: 80,
      range: '0-250°C',
      signal: '4-20mA',
    },
    {
      id: 'TT-011',
      symbolId: 'sensor-temp',
      tag: 'TT-011',
      variable: 'Outlet Temperature',
      function: 'Transmitter',
      loopNumber: 45,
      mountedOn: 'DR-SPRAY-01',
      x: 460, y: 105,
      range: '0-150°C',
    },
    {
      id: 'FI-010',
      symbolId: 'sensor-flow',
      tag: 'FI-010',
      variable: 'Feed Rate',
      function: 'Indicator',
      loopNumber: 46,
      mountedOn: 'P-FEED-01',
      x: 350, y: 155,
      range: '0-200 L/hr',
    },
  ],

  controlLoops: [
    {
      id: 'CL-DRYER-TEMP',
      tag: 'TIC-010',
      name: 'Dryer Inlet Temperature',
      type: 'single',
      measuredVariable: 'Temperature',
      setpoint: '180°C',
      output: 'Gas burner valve',
      instruments: ['TIC-010'],
      alarmHigh: '200°C',
      alarmLow: '160°C',
    },
    {
      id: 'CL-BUFFER-LEVEL',
      tag: 'LIC-010',
      name: 'Buffer Tank Level',
      type: 'single',
      measuredVariable: 'Level',
      setpoint: '70%',
      output: 'Feed pump speed',
      instruments: ['LI-010'],
      alarmHigh: '90%',
      alarmLow: '20%',
    },
  ],

  nozzles: [
    { id: 'N-C-IN', equipmentId: 'C-001', name: 'Feed Inlet', size: 'DN50', type: 'Tri-clamp', rating: 'BPE', service: 'Broth' },
    { id: 'N-C-OUT', equipmentId: 'C-001', name: 'Centrate Outlet', size: 'DN40', type: 'Tri-clamp', rating: 'BPE', service: 'Clarified broth' },
    { id: 'N-DR-IN', equipmentId: 'DR-SPRAY-01', name: 'Feed Inlet', size: 'DN25', type: 'Tri-clamp', rating: 'BPE', service: 'Concentrate' },
    { id: 'N-DR-OUT', equipmentId: 'DR-SPRAY-01', name: 'Product Outlet', size: 'DN50', type: 'Tri-clamp', rating: 'BPE', service: 'Dried powder' },
  ],

  equipmentStatus: [
    { equipmentId: 'C-001', status: 'maintenance', efficiency: 88, hoursRunning: 3600 },
    { equipmentId: 'TK-BUFFER-01', status: 'idle', efficiency: 100, hoursRunning: 1200 },
    { equipmentId: 'P-FEED-01', status: 'idle', efficiency: 95, hoursRunning: 800 },
    { equipmentId: 'DR-SPRAY-01', status: 'running', efficiency: 91, hoursRunning: 800 },
    { equipmentId: 'TK-PRODUCT-01', status: 'idle', efficiency: 100, hoursRunning: 500 },
    { equipmentId: 'TK-CIP-01', status: 'running', efficiency: 99, hoursRunning: 2100 },
  ],

  instrumentValues: [
    { instrumentId: 'SI-001', value: 0, unit: 'RPM', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'PI-010', value: 0, unit: 'bar', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'TT-010', value: 6.2, unit: '°C', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'LI-010', value: 45, unit: '%', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'TIC-010', value: 178, unit: '°C', setpoint: 180, alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z', trend: [176, 177, 178, 179, 178, 178, 178] },
    { instrumentId: 'TT-011', value: 64, unit: '°C', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
    { instrumentId: 'FI-010', value: 0, unit: 'L/hr', alarmState: 'normal', lastUpdated: '2026-04-22T23:00:00Z' },
  ],

  valvePositions: [
    { valveId: 'V-FEED-01', position: 'closed', percentOpen: 0, mode: 'manual' },
    { valveId: 'V-CIP-01', position: 'open', percentOpen: 100, mode: 'auto' },
    { valveId: 'V-EXHAUST-01', position: 'open', percentOpen: 80, mode: 'auto' },
  ],

  pipeFlow: [
    { connectionId: 'C-D001', flowing: false, animated: false },
    { connectionId: 'C-D002', flowing: false, animated: false },
    { connectionId: 'C-D003', flowing: false, animated: false },
    { connectionId: 'C-D004', flowing: false, animated: false },
    { connectionId: 'C-D005', flowing: false, animated: false },
    { connectionId: 'C-D006', flowing: true, flowRate: 25, animated: true },
    { connectionId: 'C-D007', flowing: true, flowRate: 200, animated: true },
    { connectionId: 'C-D008', flowing: true, flowRate: 10, animated: true },
  ],
};
