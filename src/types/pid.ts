/**
 * Pure Advance P&ID Data Model
 * 
 * Types for representing a complete Piping and Instrumentation Diagram.
 * Equipment instances, connections, instruments, and control loops.
 */

// ============================================================
// EQUIPMENT INSTANCE ON THE P&ID
// ============================================================

export interface PIDEquipment {
  id: string;               // Unique ID: 'BR-50L-01', 'P-001', 'TK-MEDIA-01'
  symbolId: string;          // Reference to PIDSymbol.id
  name: string;              // Human-readable: '50L Production Bioreactor'
  tag: string;               // ISA tag: 'BR-001', 'P-001', 'E-001'
  x: number;                 // Position on canvas
  y: number;
  width: number;
  height: number;
  rotation: number;          // 0, 90, 180, 270
  vendor?: string;           // e.g., 'Bailun', 'Lab1st'
  model?: string;            // e.g., 'BR500-M1'
  specs?: Record<string, string>;
  zone?: string;             // Factory zone ID
}

// ============================================================
// PIPING CONNECTION
// ============================================================

export interface PIDConnection {
  id: string;
  lineType: string;          // PIPING_LINES.id: 'process', 'steam', etc.
  from: {
    equipmentId: string;
    portId: string;
  };
  to: {
    equipmentId: string;
    portId: string;
  };
  points: { x: number; y: number }[];  // Waypoints for routing
  diameter?: string;         // e.g., 'DN25', '1 inch'
  material?: string;         // e.g., 'SS316L', 'Silicone'
  spec?: string;             // e.g., 'ASME BPE'
  label?: string;
}

// ============================================================
// INSTRUMENT TAG (ISA-5.1)
// ============================================================

// ISA tag format: XX-YYYY
// XX = variable code (pH, DO, TT, PI, FI, etc.)
// YYYY = loop number (001, 002, etc.)

export interface PIDInstrument {
  id: string;                // 'pH-001', 'DO-001', 'TT-001', 'PI-001'
  symbolId: string;          // Reference to PIDSymbol.id
  tag: string;               // ISA tag: 'pHIC-001', 'DOIC-001'
  variable: string;          // 'pH', 'DO', 'Temperature', 'Pressure', 'Flow'
  function: string;          // 'Controller', 'Indicator', 'Transmitter', 'Recorder'
  loopNumber: number;        // Loop number (001, 002, ...)
  mountedOn?: string;        // Equipment ID this is mounted on
  x: number;
  y: number;
  vendor?: string;
  model?: string;
  range?: string;            // e.g., '0-14 pH', '0-100% DO'
  signal?: string;           // '4-20mA', 'HART', 'Modbus'
}

// ============================================================
// CONTROL LOOP
// ============================================================

export interface PIDControlLoop {
  id: string;                // 'CL-001'
  tag: string;               // 'pHIC-001'
  name: string;              // 'pH Control Loop'
  type: 'single' | 'cascade' | 'ratio' | 'split-range';
  measuredVariable: string;  // 'pH', 'DO', 'Temperature'
  setpoint: string;          // '7.0', '30%', '30°C'
  output: string;            // 'Acid/Base pump', 'O₂ valve', 'Cooling valve'
  instruments: string[];     // PIDInstrument.id array
  alarmHigh?: string;
  alarmLow?: string;
  interlock?: string;
}

// ============================================================
// NOZZLE / CONNECTION POINT
// ============================================================

export interface PIDNozzle {
  id: string;
  equipmentId: string;
  name: string;              // 'N1 - Medium Inlet', 'N2 - Harvest Outlet'
  size: string;              // 'DN25', 'DN50', '1 inch'
  type: string;              // 'Flange', 'Tri-clamp', 'Threaded'
  rating: string;            // 'PN16', 'ASME 150', 'BPE'
  service: string;           // 'Medium', 'Harvest', 'Steam', 'Cooling Water'
  elevation?: string;        // Height from grade
}

// ============================================================
// COMPLETE P&ID
// ============================================================

export interface PIDDrawing {
  id: string;
  title: string;
  drawingNumber: string;     // 'PA-PID-001'
  revision: string;          // 'Rev. A', 'Rev. B'
  scale: string;             // 'NTS' (Not To Scale)
  drawnBy: string;
  approvedBy?: string;
  date: string;
  
  equipment: PIDEquipment[];
  connections: PIDConnection[];
  instruments: PIDInstrument[];
  controlLoops: PIDControlLoop[];
  nozzles: PIDNozzle[];
  
  notes?: string[];
  titleBlock?: {
    projectName: string;
    facility: string;
    system: string;
    sheet: string;
    of: string;
  };
}

// ============================================================
// TAG PREFIX CONVENTIONS (ISA-5.1)
// ============================================================

export const TAG_PREFIXES: Record<string, { prefix: string; description: string }> = {
  // Equipment
  'bioreactor': { prefix: 'BR', description: 'Bioreactor/Fermenter' },
  'tank': { prefix: 'TK', description: 'Tank/Vessel' },
  'pump': { prefix: 'P', description: 'Pump' },
  'heat-exchanger': { prefix: 'E', description: 'Heat Exchanger' },
  'centrifuge': { prefix: 'C', description: 'Centrifuge' },
  'filter': { prefix: 'F', description: 'Filter' },
  'boiler': { prefix: 'B', description: 'Boiler' },
  'chiller': { prefix: 'CH', description: 'Chiller' },
  'compressor': { prefix: 'K', description: 'Compressor/Blower' },
  'dryer': { prefix: 'DR', description: 'Dryer' },
  'mixer': { prefix: 'MX', description: 'Mixer' },
  'filler': { prefix: 'FL', description: 'Filling Machine' },
  
  // Instruments
  'ph-transmitter': { prefix: 'AT', description: 'pH Transmitter' },
  'ph-controller': { prefix: 'AIC', description: 'pH Indicating Controller' },
  'do-transmitter': { prefix: 'AT', description: 'DO Transmitter' },
  'do-controller': { prefix: 'AIC', description: 'DO Indicating Controller' },
  'temp-transmitter': { prefix: 'TT', description: 'Temperature Transmitter' },
  'temp-controller': { prefix: 'TIC', description: 'Temperature Indicating Controller' },
  'pressure-indicator': { prefix: 'PI', description: 'Pressure Indicator' },
  'pressure-transmitter': { prefix: 'PT', description: 'Pressure Transmitter' },
  'flow-indicator': { prefix: 'FI', description: 'Flow Indicator' },
  'flow-controller': { prefix: 'FIC', description: 'Flow Indicating Controller' },
  'level-indicator': { prefix: 'LI', description: 'Level Indicator' },
  'level-controller': { prefix: 'LIC', description: 'Level Indicating Controller' },
  'mfc': { prefix: 'FC', description: 'Mass Flow Controller' },
  'speed-indicator': { prefix: 'SI', description: 'Speed Indicator' },
};

// ============================================================
// TYPICAL BIOPROCESS CONTROL LOOPS
// ============================================================

export const TYPICAL_LOOPS: Partial<PIDControlLoop>[] = [
  { id: 'CL-TEMP', tag: 'TIC-001', name: 'Reactor Temperature Control', type: 'single', measuredVariable: 'Temperature', setpoint: '30°C', output: 'Jacket CW valve' },
  { id: 'CL-PH', tag: 'AIC-001', name: 'pH Control', type: 'single', measuredVariable: 'pH', setpoint: '7.0', output: 'Acid/Base dosing pumps' },
  { id: 'CL-DO', tag: 'AIC-002', name: 'DO Control (Cascade)', type: 'cascade', measuredVariable: 'Dissolved Oxygen', setpoint: '30%', output: 'Agitation → Air/O₂ valve' },
  { id: 'CL-FEED', tag: 'FIC-001', name: 'Fed-Batch Feed Control', type: 'single', measuredVariable: 'Feed Rate', setpoint: 'Per curve', output: 'Feed pump' },
  { id: 'CL-FOAM', tag: 'AL-001', name: 'Anti-Foam Control', type: 'single', measuredVariable: 'Foam', setpoint: 'On/Off', output: 'Antifoam pump' },
  { id: 'CL-PRESSURE', tag: 'PIC-001', name: 'Headspace Pressure Control', type: 'single', measuredVariable: 'Pressure', setpoint: '0.5 bar', output: 'Exhaust valve' },
  { id: 'CL-LEVEL', tag: 'LIC-001', name: 'Tank Level Control', type: 'single', measuredVariable: 'Level', setpoint: '70%', output: 'Inlet valve' },
];
