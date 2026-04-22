/**
 * Pure Advance P&ID Symbol Library
 * 
 * ISA-5.1 / ISO 10628 compliant symbols for bioprocess equipment.
 * Each symbol is an SVG path/component for rendering on the P&ID canvas.
 * 
 * Reference: ANSI/ISA-5.1-2024 Instrumentation Symbols and Identification
 */

// ============================================================
// SYMBOL TYPES
// ============================================================

export type SymbolCategory = 'equipment' | 'piping' | 'valve' | 'instrument' | 'control' | 'utility';

export interface PIDSymbol {
  id: string;
  name: string;
  category: SymbolCategory;
  description: string;
  isaCode?: string;        // ISA-5.1 letter code
  svgPath: string;          // SVG path data or component identifier
  width: number;            // Default width in SVG units
  height: number;           // Default height in SVG units
  ports: SymbolPort[];      // Connection points
}

export interface SymbolPort {
  id: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  offset: number;           // 0-1 along the edge
  type: 'process' | 'instrument' | 'signal' | 'drain' | 'vent' | 'utility';
  label?: string;
}

// ============================================================
// INSTRUMENT LETTER CODES (ISA-5.1)
// ============================================================

export const ISA_LETTER_CODES: Record<string, { variable: string; modifier: string }> = {
  // First letter (measured variable)
  'A': { variable: 'Analysis', modifier: '' },
  'B': { variable: 'Burner/Combustion', modifier: '' },
  'C': { variable: 'Conductivity', modifier: 'Control' },
  'D': { variable: 'Density', modifier: 'Differential' },
  'E': { variable: 'Voltage', modifier: '' },
  'F': { variable: 'Flow', modifier: '' },
  'G': { variable: 'Gauge/Level', modifier: '' },
  'H': { variable: 'Hand', modifier: 'High' },
  'I': { variable: 'Current', modifier: 'Indicate' },
  'K': { variable: 'Time', modifier: 'Control Station' },
  'L': { variable: 'Level', modifier: 'Low' },
  'M': { variable: 'Moisture', modifier: '' },
  'O': { variable: 'Orifice', modifier: '' },
  'P': { variable: 'Pressure/Vacuum', modifier: '' },
  'Q': { variable: 'Quantity', modifier: '' },
  'R': { variable: 'Radiation', modifier: 'Record' },
  'S': { variable: 'Speed/Frequency', modifier: 'Safety Switch' },
  'T': { variable: 'Temperature', modifier: '' },
  'V': { variable: 'Vibration', modifier: 'Valve' },
  'W': { variable: 'Weight/Force', modifier: '' },
  'Z': { variable: 'Position', modifier: '' },
};

// ============================================================
// EQUIPMENT SYMBOLS
// ============================================================

export const EQUIPMENT_SYMBOLS: PIDSymbol[] = [
  {
    id: 'tank-vertical',
    name: 'Vertical Tank/Vessel',
    category: 'equipment',
    description: 'Vertical storage or process tank',
    svgPath: 'M10,5 L50,5 L50,55 Q30,65 10,55 Z',
    width: 60,
    height: 70,
    ports: [
      { id: 'inlet', position: 'top', offset: 0.5, type: 'process', label: 'Inlet' },
      { id: 'outlet', position: 'bottom', offset: 0.5, type: 'process', label: 'Outlet' },
      { id: 'drain', position: 'bottom', offset: 0.2, type: 'drain', label: 'Drain' },
    ],
  },
  {
    id: 'bioreactor',
    name: 'Bioreactor/Fermenter',
    category: 'equipment',
    description: 'Stirred tank bioreactor with agitation and jacket',
    isaCode: 'TK',
    svgPath: 'M8,5 L52,5 L52,55 Q30,65 8,55 Z',  // tank body
    width: 60,
    height: 70,
    ports: [
      { id: 'inlet', position: 'top', offset: 0.3, type: 'process', label: 'Medium In' },
      { id: 'exhaust', position: 'top', offset: 0.7, type: 'vent', label: 'Exhaust' },
      { id: 'outlet', position: 'bottom', offset: 0.5, type: 'process', label: 'Harvest' },
      { id: 'drain', position: 'bottom', offset: 0.2, type: 'drain', label: 'Drain' },
      { id: 'jacket-in', position: 'right', offset: 0.3, type: 'utility', label: 'Jacket In' },
      { id: 'jacket-out', position: 'right', offset: 0.7, type: 'utility', label: 'Jacket Out' },
      { id: 'sample', position: 'left', offset: 0.5, type: 'process', label: 'Sample' },
    ],
  },
  {
    id: 'pump-centrifugal',
    name: 'Centrifugal Pump',
    category: 'equipment',
    description: 'Centrifugal pump for liquid transfer',
    isaCode: 'P',
    svgPath: 'M5,30 L30,30 A15,15 0 1,1 30,31 Z M30,30 L55,30',
    width: 60,
    height: 60,
    ports: [
      { id: 'suction', position: 'left', offset: 0.5, type: 'process', label: 'Suction' },
      { id: 'discharge', position: 'right', offset: 0.5, type: 'process', label: 'Discharge' },
    ],
  },
  {
    id: 'pump-peristaltic',
    name: 'Peristaltic Pump',
    category: 'equipment',
    description: 'Peristaltic pump for dosing/feeding',
    isaCode: 'P',
    svgPath: 'M5,30 L15,30 A12,12 0 1,1 15,31 L45,30 A12,12 0 1,1 45,31 L55,30',
    width: 60,
    height: 50,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process', label: 'Inlet' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process', label: 'Outlet' },
    ],
  },
  {
    id: 'heat-exchanger',
    name: 'Heat Exchanger (Plate)',
    category: 'equipment',
    description: 'Plate heat exchanger for heating/cooling',
    isaCode: 'E',
    svgPath: 'M10,10 L50,10 L50,50 L10,50 Z M10,20 L50,20 M10,30 L50,30 M10,40 L50,40',
    width: 60,
    height: 60,
    ports: [
      { id: 'hot-in', position: 'top', offset: 0.3, type: 'process', label: 'Hot In' },
      { id: 'hot-out', position: 'bottom', offset: 0.3, type: 'process', label: 'Hot Out' },
      { id: 'cold-in', position: 'top', offset: 0.7, type: 'process', label: 'Cold In' },
      { id: 'cold-out', position: 'bottom', offset: 0.7, type: 'process', label: 'Cold Out' },
    ],
  },
  {
    id: 'heat-exchanger-coil',
    name: 'Coil Heat Exchanger',
    category: 'equipment',
    description: 'Jacketed vessel with cooling/heating coil',
    svgPath: 'M10,5 L50,5 L50,55 L10,55 Z M15,15 Q30,20 45,15 M15,25 Q30,30 45,25 M15,35 Q30,40 45,35',
    width: 60,
    height: 65,
    ports: [
      { id: 'coil-in', position: 'right', offset: 0.2, type: 'utility', label: 'Coil In' },
      { id: 'coil-out', position: 'right', offset: 0.8, type: 'utility', label: 'Coil Out' },
    ],
  },
  {
    id: 'centrifuge',
    name: 'Centrifuge',
    category: 'equipment',
    description: 'Disc stack or tubular centrifuge',
    isaCode: 'C',
    svgPath: 'M10,30 L25,15 L45,15 L45,45 L25,45 Z M25,15 L25,45',
    width: 55,
    height: 60,
    ports: [
      { id: 'feed', position: 'top', offset: 0.5, type: 'process', label: 'Feed' },
      { id: 'concentrate', position: 'bottom', offset: 0.3, type: 'process', label: 'Concentrate' },
      { id: 'centrate', position: 'bottom', offset: 0.7, type: 'process', label: 'Centrate' },
    ],
  },
  {
    id: 'spray-dryer',
    name: 'Spray Dryer',
    category: 'equipment',
    description: 'Spray dryer for powder production',
    svgPath: 'M15,5 L45,5 Q50,30 45,55 L15,55 Q10,30 15,5 Z',
    width: 60,
    height: 65,
    ports: [
      { id: 'feed', position: 'top', offset: 0.5, type: 'process', label: 'Feed' },
      { id: 'hot-air', position: 'right', offset: 0.3, type: 'utility', label: 'Hot Air' },
      { id: 'powder', position: 'bottom', offset: 0.5, type: 'process', label: 'Powder Out' },
      { id: 'exhaust', position: 'left', offset: 0.3, type: 'vent', label: 'Exhaust' },
    ],
  },
  {
    id: 'filter',
    name: 'Filter (Cartridge/Bag)',
    category: 'equipment',
    description: 'Depth or membrane filter',
    svgPath: 'M10,15 L50,15 L50,45 L10,45 Z M15,15 L15,45 M25,15 L25,45 M35,15 L35,45',
    width: 60,
    height: 60,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process', label: 'Inlet' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process', label: 'Outlet' },
    ],
  },
  {
    id: 'mixing-tank',
    name: 'Mixing Tank',
    category: 'equipment',
    description: 'Agitated formulation mixing tank',
    svgPath: 'M8,5 L52,5 L52,55 Q30,65 8,55 Z',
    width: 60,
    height: 70,
    ports: [
      { id: 'inlet-1', position: 'top', offset: 0.3, type: 'process', label: 'Inlet 1' },
      { id: 'inlet-2', position: 'top', offset: 0.7, type: 'process', label: 'Inlet 2' },
      { id: 'outlet', position: 'bottom', offset: 0.5, type: 'process', label: 'Outlet' },
      { id: 'drain', position: 'bottom', offset: 0.2, type: 'drain', label: 'Drain' },
    ],
  },
  {
    id: 'boiler',
    name: 'Steam Boiler',
    category: 'utility',
    description: 'Steam generator for SIP/heating',
    svgPath: 'M5,20 L55,20 L55,50 L5,50 Z M10,15 Q30,5 50,15',
    width: 60,
    height: 60,
    ports: [
      { id: 'feed-water', position: 'left', offset: 0.7, type: 'process', label: 'Feed Water' },
      { id: 'steam-out', position: 'top', offset: 0.5, type: 'process', label: 'Steam' },
      { id: 'blowdown', position: 'bottom', offset: 0.5, type: 'drain', label: 'Blowdown' },
    ],
  },
  {
    id: 'chiller',
    name: 'Chiller',
    category: 'utility',
    description: 'Refrigeration unit for cooling',
    svgPath: 'M10,10 L50,10 L50,50 L10,50 Z M20,20 L40,20 L30,40 Z',
    width: 60,
    height: 60,
    ports: [
      { id: 'return', position: 'left', offset: 0.3, type: 'process', label: 'Return' },
      { id: 'supply', position: 'right', offset: 0.3, type: 'process', label: 'Supply (7°C)' },
    ],
  },
  {
    id: 'compressor',
    name: 'Air Compressor',
    category: 'utility',
    description: 'Compressed air supply',
    svgPath: 'M10,20 L50,20 L50,40 L10,40 Z M20,15 L40,15 L40,20 M30,20 L30,40',
    width: 60,
    height: 55,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process', label: 'Air In' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process', label: '6-8 bar' },
    ],
  },
  {
    id: 'water-purification',
    name: 'Water Purification (PW/WFI)',
    category: 'utility',
    description: 'Purified water or WFI system',
    svgPath: 'M10,10 L50,10 L50,50 L10,50 Z M15,25 L45,25 M15,35 L45,35',
    width: 60,
    height: 60,
    ports: [
      { id: 'raw-in', position: 'left', offset: 0.5, type: 'process', label: 'Raw Water' },
      { id: 'pw-out', position: 'right', offset: 0.3, type: 'process', label: 'PW' },
      { id: 'wfi-out', position: 'right', offset: 0.7, type: 'process', label: 'WFI' },
    ],
  },
  {
    id: 'cold-storage',
    name: 'Cold Storage',
    category: 'equipment',
    description: 'Refrigerated storage (4-8°C)',
    svgPath: 'M5,5 L55,5 L55,55 L5,55 Z M5,30 L55,30',
    width: 60,
    height: 60,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process', label: 'Inlet' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process', label: 'Outlet' },
    ],
  },
  {
    id: 'filling-machine',
    name: 'Filling Machine',
    category: 'equipment',
    description: 'Automatic filling/sealing line',
    svgPath: 'M5,15 L25,15 L25,45 L5,45 Z M30,20 L55,20 L55,40 L30,40 Z M25,30 L30,30',
    width: 60,
    height: 60,
    ports: [
      { id: 'product-in', position: 'left', offset: 0.5, type: 'process', label: 'Product' },
      { id: 'packages-out', position: 'right', offset: 0.5, type: 'process', label: 'Packages' },
    ],
  },
];

// ============================================================
// VALVE SYMBOLS (ISA-5.1)
// ============================================================

export const VALVE_SYMBOLS: PIDSymbol[] = [
  {
    id: 'valve-gate',
    name: 'Gate Valve',
    category: 'valve',
    description: 'Manual on/off gate valve',
    svgPath: 'M5,30 L20,30 L30,15 L30,45 L40,30 L55,30',
    width: 60,
    height: 60,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process' },
    ],
  },
  {
    id: 'valve-ball',
    name: 'Ball Valve',
    category: 'valve',
    description: 'Quarter-turn ball valve',
    svgPath: 'M5,30 L15,30 A15,15 0 1,1 45,30 L55,30',
    width: 60,
    height: 60,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process' },
    ],
  },
  {
    id: 'valve-check',
    name: 'Check Valve',
    category: 'valve',
    description: 'Non-return check valve',
    svgPath: 'M5,30 L15,30 L25,15 L45,30 L25,45 L15,30 M45,30 L55,30',
    width: 60,
    height: 60,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process' },
    ],
  },
  {
    id: 'valve-control',
    name: 'Control Valve',
    category: 'valve',
    description: 'Automated control valve with actuator',
    isaCode: 'V',
    svgPath: 'M5,30 L15,30 L25,15 L35,30 L45,15 L55,30 M30,10 L30,5 M25,5 L35,5',
    width: 60,
    height: 65,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process' },
      { id: 'signal', position: 'top', offset: 0.5, type: 'signal', label: 'Control Signal' },
    ],
  },
  {
    id: 'valve-safety-relief',
    name: 'Safety Relief Valve',
    category: 'valve',
    description: 'Pressure safety relief valve (PSV)',
    svgPath: 'M5,40 L25,40 L30,20 L35,40 L55,40 M30,20 L30,5 L25,10 M30,5 L35,10',
    width: 60,
    height: 55,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.7, type: 'process' },
      { id: 'outlet', position: 'right', offset: 0.7, type: 'process' },
      { id: 'vent', position: 'top', offset: 0.5, type: 'vent', label: 'Relief' },
    ],
  },
  {
    id: 'valve-pneumatic',
    name: 'Pneumatic Valve',
    category: 'valve',
    description: 'Pneumatically actuated valve (SIP/CIP)',
    svgPath: 'M5,30 L15,30 L25,15 L35,30 L45,15 L55,30 M30,10 L30,5 M20,3 A20,5 0 0,1 40,3',
    width: 60,
    height: 65,
    ports: [
      { id: 'inlet', position: 'left', offset: 0.5, type: 'process' },
      { id: 'outlet', position: 'right', offset: 0.5, type: 'process' },
      { id: 'air', position: 'top', offset: 0.5, type: 'signal', label: 'Air Signal' },
    ],
  },
];

// ============================================================
// INSTRUMENT SYMBOLS (ISA-5.1)
// ============================================================

export const INSTRUMENT_SYMBOLS: PIDSymbol[] = [
  {
    id: 'instrument-field',
    name: 'Field Instrument (Circle)',
    category: 'instrument',
    description: 'Primary element or field-mounted instrument',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5',
    width: 60,
    height: 60,
    ports: [
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: '4-20mA' },
    ],
  },
  {
    id: 'instrument-control-room',
    name: 'Control Room Instrument',
    category: 'instrument',
    description: 'DCS/PLC panel-mounted instrument (double circle)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [],
  },
  {
    id: 'instrument-shared',
    name: 'Shared Display/Control',
    category: 'instrument',
    description: 'Shared between DCS and panel (dashed circle)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5',
    width: 60,
    height: 60,
    ports: [],
  },
  {
    id: 'sensor-ph',
    name: 'pH Sensor',
    category: 'instrument',
    description: 'pH probe — typically Hamilton Polilyte Plus or Mettler InPro',
    isaCode: 'A (Analysis)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: '4-20mA' },
    ],
  },
  {
    id: 'sensor-do',
    name: 'Dissolved Oxygen Sensor',
    category: 'instrument',
    description: 'Optical DO probe — PreSens or Hamilton',
    isaCode: 'A (Analysis)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: '4-20mA' },
    ],
  },
  {
    id: 'sensor-temp',
    name: 'Temperature Sensor (RTD)',
    category: 'instrument',
    description: 'Pt100 RTD temperature probe',
    isaCode: 'T (Temperature)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: 'RTD' },
    ],
  },
  {
    id: 'sensor-pressure',
    name: 'Pressure Transmitter',
    category: 'instrument',
    description: 'In-line pressure transmitter',
    isaCode: 'P (Pressure)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [
      { id: 'process', position: 'top', offset: 0.5, type: 'process' },
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: '4-20mA' },
    ],
  },
  {
    id: 'sensor-flow',
    name: 'Flow Transmitter',
    category: 'instrument',
    description: 'Magnetic or Coriolis flow meter',
    isaCode: 'F (Flow)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: '4-20mA' },
    ],
  },
  {
    id: 'sensor-level',
    name: 'Level Transmitter',
    category: 'instrument',
    description: 'Level measurement (ultrasonic, radar, or load cell)',
    isaCode: 'L (Level)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: '4-20mA' },
    ],
  },
  {
    id: 'mfc',
    name: 'Mass Flow Controller (MFC)',
    category: 'instrument',
    description: 'Gas mass flow controller for O₂/Air/N₂/CO₂',
    isaCode: 'FC (Flow Controller)',
    svgPath: 'M30,5 A25,25 0 1,1 30,55 A25,25 0 1,1 30,5 M30,10 A20,20 0 1,1 30,50 A20,20 0 1,1 30,10',
    width: 60,
    height: 60,
    ports: [
      { id: 'process', position: 'top', offset: 0.5, type: 'process' },
      { id: 'signal', position: 'bottom', offset: 0.5, type: 'signal', label: '4-20mA' },
    ],
  },
];

// ============================================================
// PIPING LINE TYPES
// ============================================================

export const PIPING_LINES = [
  { id: 'process', name: 'Process Line', style: 'solid', color: '#a1a1aa', width: 2 },
  { id: 'steam', name: 'Steam', style: 'solid', color: '#ef4444', width: 2 },
  { id: 'cooling-water', name: 'Cooling Water', style: 'solid', color: '#3b82f6', width: 2 },
  { id: 'chilled-water', name: 'Chilled Water', style: 'dashed', color: '#06b6d4', width: 2 },
  { id: 'wfi', name: 'WFI (Water for Injection)', style: 'solid', color: '#8b5cf6', width: 2 },
  { id: 'compressed-air', name: 'Compressed Air', style: 'dashed', color: '#f59e0b', width: 2 },
  { id: 'gas-o2', name: 'Oxygen (O₂)', style: 'solid', color: '#10b981', width: 2 },
  { id: 'gas-n2', name: 'Nitrogen (N₂)', style: 'dotted', color: '#6366f1', width: 2 },
  { id: 'gas-co2', name: 'Carbon Dioxide (CO₂)', style: 'dotted', color: '#ec4899', width: 2 },
  { id: 'drain', name: 'Drain/Sewer', style: 'dashed', color: '#71717a', width: 1.5 },
  { id: 'signal-electric', name: 'Electrical Signal', style: 'dotted', color: '#f97316', width: 1 },
  { id: 'signal-pneumatic', name: 'Pneumatic Signal', style: 'dashed', color: '#a855f7', width: 1 },
];

// ============================================================
// COMBINED SYMBOL LIBRARY
// ============================================================

export const ALL_SYMBOLS: PIDSymbol[] = [
  ...EQUIPMENT_SYMBOLS,
  ...VALVE_SYMBOLS,
  ...INSTRUMENT_SYMBOLS,
];

export const SYMBOLS_BY_CATEGORY: Record<SymbolCategory, PIDSymbol[]> = {
  equipment: EQUIPMENT_SYMBOLS,
  piping: [],
  valve: VALVE_SYMBOLS,
  instrument: INSTRUMENT_SYMBOLS,
  control: [],
  utility: EQUIPMENT_SYMBOLS.filter(s => s.category === 'utility'),
};
