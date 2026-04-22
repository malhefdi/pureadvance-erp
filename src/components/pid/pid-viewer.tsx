'use client';

import { useState, useMemo } from 'react';
import { ALL_SYMBOLS, PIPING_LINES, ISA_LETTER_CODES, PIDSymbol } from '@/lib/pid-symbols';
import { PIDEquipment, PIDConnection, PIDInstrument, PIDControlLoop, PIDDrawing, TAG_PREFIXES, TYPICAL_LOOPS } from '@/types/pid';
import { cn } from '@/lib/utils';
import { X, Layers, GitBranch, Cog, Target, Info, ChevronRight, FileText } from 'lucide-react';

// ============================================================
// PRE-BUILT: 50L BIOREACTOR P&ID (based on Bailun/Lab1st specs)
// ============================================================

const bioreactorPID: PIDDrawing = {
  id: 'PA-PID-001',
  title: '50L Bioreactor System — Bt Fermentation',
  drawingNumber: 'PA-PID-001',
  revision: 'Rev. A',
  scale: 'NTS',
  drawnBy: 'Hermes (Pure Advance ERP)',
  date: '2026-04-21',
  equipment: [
    { id: 'BR-001', symbolId: 'bioreactor', name: '50L Production Bioreactor', tag: 'BR-001', x: 400, y: 80, width: 160, height: 200, rotation: 0, vendor: 'Bailun', model: 'BL-50L-SIP', specs: { volume: '50L', material: 'SS316L', sterilization: 'SIP', impeller: 'Rushton ×2' } },
    { id: 'TK-MEDIA', symbolId: 'tank-vertical', name: 'Media Prep Tank', tag: 'TK-001', x: 80, y: 80, width: 100, height: 140, rotation: 0, vendor: 'Bailun', specs: { volume: '100L', material: 'SS316L' } },
    { id: 'TK-ACID', symbolId: 'tank-vertical', name: 'Acid Tank', tag: 'TK-002', x: 80, y: 340, width: 60, height: 80, rotation: 0 },
    { id: 'TK-BASE', symbolId: 'tank-vertical', name: 'Base Tank', tag: 'TK-003', x: 180, y: 340, width: 60, height: 80, rotation: 0 },
    { id: 'TK-ANTIFOAM', symbolId: 'tank-vertical', name: 'Antifoam Tank', tag: 'TK-004', x: 280, y: 340, width: 60, height: 80, rotation: 0 },
    { id: 'TK-FEED', symbolId: 'tank-vertical', name: 'Feed Tank', tag: 'TK-005', x: 380, y: 340, width: 60, height: 80, rotation: 0 },
    { id: 'TK-HARVEST', symbolId: 'tank-vertical', name: 'Harvest Tank', tag: 'TK-006', x: 620, y: 80, width: 100, height: 140, rotation: 0 },
    { id: 'P-001', symbolId: 'pump-peristaltic', name: 'Media Transfer Pump', tag: 'P-001', x: 240, y: 150, width: 60, height: 40, rotation: 0 },
    { id: 'P-002', symbolId: 'pump-peristaltic', name: 'Acid Dosing Pump', tag: 'P-002', x: 140, y: 320, width: 50, height: 35, rotation: 0 },
    { id: 'P-003', symbolId: 'pump-peristaltic', name: 'Base Dosing Pump', tag: 'P-003', x: 240, y: 320, width: 50, height: 35, rotation: 0 },
    { id: 'P-004', symbolId: 'pump-peristaltic', name: 'Antifoam Pump', tag: 'P-004', x: 340, y: 320, width: 50, height: 35, rotation: 0 },
    { id: 'P-005', symbolId: 'pump-peristaltic', name: 'Feed Pump', tag: 'P-005', x: 440, y: 320, width: 50, height: 35, rotation: 0 },
    { id: 'P-006', symbolId: 'pump-centrifugal', name: 'Harvest Pump', tag: 'P-006', x: 570, y: 150, width: 50, height: 50, rotation: 0 },
    { id: 'E-001', symbolId: 'heat-exchanger', name: 'Condenser (Exhaust)', tag: 'E-001', x: 440, y: 20, width: 80, height: 50, rotation: 0 },
    { id: 'E-002', symbolId: 'heat-exchanger', name: 'Jacket Heat Exchanger', tag: 'E-002', x: 600, y: 350, width: 80, height: 60, rotation: 0 },
    { id: 'V-PSV', symbolId: 'valve-safety-relief', name: 'Safety Relief Valve', tag: 'PSV-001', x: 360, y: 30, width: 50, height: 50, rotation: 0 },
  ],
  connections: [
    // Media → Pump → Bioreactor
    { id: 'C-001', lineType: 'process', from: { equipmentId: 'TK-MEDIA', portId: 'outlet' }, to: { equipmentId: 'P-001', portId: 'inlet' }, points: [], diameter: 'DN25', material: 'SS316L' },
    { id: 'C-002', lineType: 'process', from: { equipmentId: 'P-001', portId: 'outlet' }, to: { equipmentId: 'BR-001', portId: 'inlet' }, points: [], diameter: 'DN25', material: 'SS316L' },
    // Acid → Pump → Bioreactor
    { id: 'C-003', lineType: 'process', from: { equipmentId: 'TK-ACID', portId: 'outlet' }, to: { equipmentId: 'P-002', portId: 'inlet' }, points: [], diameter: 'DN10' },
    { id: 'C-004', lineType: 'process', from: { equipmentId: 'P-002', portId: 'outlet' }, to: { equipmentId: 'BR-001', portId: 'sample' }, points: [], diameter: 'DN10' },
    // Base → Pump → Bioreactor
    { id: 'C-005', lineType: 'process', from: { equipmentId: 'TK-BASE', portId: 'outlet' }, to: { equipmentId: 'P-003', portId: 'inlet' }, points: [], diameter: 'DN10' },
    // Antifoam → Pump → Bioreactor
    { id: 'C-006', lineType: 'process', from: { equipmentId: 'TK-ANTIFOAM', portId: 'outlet' }, to: { equipmentId: 'P-004', portId: 'inlet' }, points: [], diameter: 'DN10' },
    // Feed → Pump → Bioreactor
    { id: 'C-007', lineType: 'process', from: { equipmentId: 'TK-FEED', portId: 'outlet' }, to: { equipmentId: 'P-005', portId: 'inlet' }, points: [], diameter: 'DN15' },
    // Bioreactor → Harvest Pump → Harvest Tank
    { id: 'C-008', lineType: 'process', from: { equipmentId: 'BR-001', portId: 'outlet' }, to: { equipmentId: 'P-006', portId: 'suction' }, points: [], diameter: 'DN25', material: 'SS316L' },
    { id: 'C-009', lineType: 'process', from: { equipmentId: 'P-006', portId: 'discharge' }, to: { equipmentId: 'TK-HARVEST', portId: 'inlet' }, points: [], diameter: 'DN25' },
    // Exhaust → Condenser
    { id: 'C-010', lineType: 'process', from: { equipmentId: 'BR-001', portId: 'exhaust' }, to: { equipmentId: 'E-001', portId: 'hot-in' }, points: [], diameter: 'DN25' },
    // Safety Relief
    { id: 'C-011', lineType: 'process', from: { equipmentId: 'BR-001', portId: 'exhaust' }, to: { equipmentId: 'V-PSV', portId: 'inlet' }, points: [], diameter: 'DN25' },
    // Jacket connections
    { id: 'C-012', lineType: 'cooling-water', from: { equipmentId: 'E-002', portId: 'cold-out' }, to: { equipmentId: 'BR-001', portId: 'jacket-in' }, points: [], diameter: 'DN20', label: 'CW Supply' },
    { id: 'C-013', lineType: 'cooling-water', from: { equipmentId: 'BR-001', portId: 'jacket-out' }, to: { equipmentId: 'E-002', portId: 'cold-in' }, points: [], diameter: 'DN20', label: 'CW Return' },
    // Steam to heat exchanger
    { id: 'C-014', lineType: 'steam', from: { equipmentId: 'E-002', portId: 'hot-in' }, to: { equipmentId: 'E-002', portId: 'hot-out' }, points: [], diameter: 'DN15', label: 'Steam' },
  ],
  instruments: [
    { id: 'AT-pH-001', symbolId: 'sensor-ph', tag: 'AIC-001', variable: 'pH', function: 'Controller', loopNumber: 1, mountedOn: 'BR-001', x: 430, y: 130, vendor: 'Hamilton', model: 'Polilyte Plus', range: '0-14 pH', signal: '4-20mA' },
    { id: 'AT-DO-001', symbolId: 'sensor-do', tag: 'AIC-002', variable: 'DO', function: 'Controller', loopNumber: 2, mountedOn: 'BR-001', x: 510, y: 130, vendor: 'PreSens', model: 'Fibox 4', range: '0-100% DO', signal: '4-20mA' },
    { id: 'TT-001', symbolId: 'sensor-temp', tag: 'TIC-001', variable: 'Temperature', function: 'Controller', loopNumber: 3, mountedOn: 'BR-001', x: 430, y: 200, vendor: 'Pt100 RTD', range: '0-50°C', signal: '4-20mA' },
    { id: 'PI-001', symbolId: 'sensor-pressure', tag: 'PI-001', variable: 'Pressure', function: 'Indicator', loopNumber: 4, mountedOn: 'BR-001', x: 510, y: 200, range: '0-2 bar', signal: '4-20mA' },
    { id: 'FI-001', symbolId: 'sensor-flow', tag: 'FI-001', variable: 'Air Flow', function: 'Indicator', loopNumber: 5, x: 430, y: 270, range: '0-50 L/min', signal: '4-20mA' },
    { id: 'FC-001', symbolId: 'mfc', tag: 'FC-001', variable: 'O₂/Air', function: 'Controller', loopNumber: 6, x: 510, y: 270, vendor: 'Bronkhorst', range: '0-20 L/min', signal: '4-20mA' },
    { id: 'LI-001', symbolId: 'sensor-level', tag: 'LI-001', variable: 'Level', function: 'Indicator', loopNumber: 7, mountedOn: 'BR-001', x: 430, y: 340, range: '0-100%', signal: '4-20mA' },
    { id: 'SI-001', symbolId: 'sensor-flow', tag: 'SI-001', variable: 'Agitation', function: 'Indicator', loopNumber: 8, mountedOn: 'BR-001', x: 510, y: 340, range: '0-1000 rpm', signal: '4-20mA' },
  ],
  controlLoops: [
    { id: 'CL-TEMP', tag: 'TIC-001', name: 'Reactor Temperature Control', type: 'single', measuredVariable: 'Temperature', setpoint: '30°C', output: 'Jacket CW valve', instruments: ['TT-001'] },
    { id: 'CL-PH', tag: 'AIC-001', name: 'pH Control', type: 'single', measuredVariable: 'pH', setpoint: '7.0 ± 0.1', output: 'Acid (P-002) / Base (P-003)', instruments: ['AT-pH-001', 'P-002', 'P-003'], alarmHigh: '7.5', alarmLow: '6.5' },
    { id: 'CL-DO', tag: 'AIC-002', name: 'DO Cascade Control', type: 'cascade', measuredVariable: 'Dissolved Oxygen', setpoint: '30%', output: 'Agitation → Air → O₂', instruments: ['AT-DO-001', 'SI-001', 'FI-001', 'FC-001'], alarmLow: '20%' },
    { id: 'CL-FEED', tag: 'FIC-001', name: 'Fed-Batch Feed Control', type: 'single', measuredVariable: 'Feed Rate', setpoint: 'Per exponential curve', output: 'Feed Pump P-005', instruments: ['P-005'] },
    { id: 'CL-FOAM', tag: 'AL-001', name: 'Anti-Foam Control', type: 'single', measuredVariable: 'Foam', setpoint: 'On/Off', output: 'Antifoam Pump P-004', instruments: ['P-004'] },
  ],
  nozzles: [
    { id: 'N1', equipmentId: 'BR-001', name: 'Medium Inlet', size: 'DN25', type: 'Tri-clamp', rating: 'ASME BPE', service: 'Sterile medium' },
    { id: 'N2', equipmentId: 'BR-001', name: 'Harvest Outlet', size: 'DN25', type: 'Tri-clamp', rating: 'ASME BPE', service: 'Broth' },
    { id: 'N3', equipmentId: 'BR-001', name: 'Drain', size: 'DN15', type: 'Tri-clamp', rating: 'ASME BPE', service: 'CIP drain' },
    { id: 'N4', equipmentId: 'BR-001', name: 'Exhaust', size: 'DN25', type: 'Tri-clamp', rating: 'ASME BPE', service: 'Off-gas + condensate' },
    { id: 'N5', equipmentId: 'BR-001', name: 'Jacket In', size: 'DN20', type: 'Flange', rating: 'PN16', service: 'Cooling water / Steam' },
    { id: 'N6', equipmentId: 'BR-001', name: 'Jacket Out', size: 'DN20', type: 'Flange', rating: 'PN16', service: 'Return' },
    { id: 'N7', equipmentId: 'BR-001', name: 'Sample Port', size: 'DN10', type: 'Tri-clamp', rating: 'ASME BPE', service: 'Aseptic sample' },
    { id: 'N8', equipmentId: 'BR-001', name: 'pH Port', size: 'DN25', type: 'Ingold', rating: 'ASME BPE', service: 'pH probe' },
    { id: 'N9', equipmentId: 'BR-001', name: 'DO Port', size: 'DN25', type: 'Ingold', rating: 'ASME BPE', service: 'DO probe' },
  ],
  notes: [
    'All process piping SS316L per ASME BPE.',
    'SIP sequence: Steam at 121°C, 20 min, F₀ ≥ 15 min.',
    'CIP sequence: Pre-rinse → 2% NaOH @ 60°C → Rinse → Acid → Final WFI rinse.',
    'DO cascade: Agitation (150-500 rpm) → Air (0-2 vvm) → O₂ enrichment (0-30%).',
    'pH control: ±0.1 pH units, deadband 0.2 pH.',
  ],
  titleBlock: {
    projectName: 'Pure Advance — INSEBT Biopesticide',
    facility: 'Bt Production Facility',
    system: '50L Bioreactor System',
    sheet: '1',
    of: '1',
  },
};

// ============================================================
// P&ID RENDERER
// ============================================================

export function PIDViewer() {
  const [selectedItem, setSelectedItem] = useState<{ type: string; id: string } | null>(null);
  const [showInstruments, setShowInstruments] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeTab, setActiveTab] = useState<'drawing' | 'equipment' | 'instruments' | 'loops' | 'nozzles' | 'symbols'>('drawing');

  const pid = bioreactorPID;

  const selectedItemData = useMemo(() => {
    if (!selectedItem) return null;
    if (selectedItem.type === 'equipment') return pid.equipment.find(e => e.id === selectedItem.id);
    if (selectedItem.type === 'instrument') return pid.instruments.find(i => i.id === selectedItem.id);
    if (selectedItem.type === 'loop') return pid.controlLoops.find(l => l.id === selectedItem.id);
    if (selectedItem.type === 'nozzle') return pid.nozzles.find(n => n.id === selectedItem.id);
    return null;
  }, [selectedItem, pid]);

  const getSymbol = (symbolId: string): PIDSymbol | undefined => ALL_SYMBOLS.find(s => s.id === symbolId);

  return (
    <div className="space-y-6">
      {/* Title Block */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">{pid.title}</h2>
            <p className="text-xs text-zinc-500">
              {pid.drawingNumber} • {pid.revision} • {pid.scale} • Drawn by: {pid.drawnBy}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <div>{pid.titleBlock?.projectName}</div>
            <div>Sheet {pid.titleBlock?.sheet} of {pid.titleBlock?.of}</div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 bg-zinc-900/50 rounded-xl border border-zinc-800 p-2">
        {[
          { id: 'drawing' as const, label: 'P&ID Drawing', icon: <Layers className="w-4 h-4" /> },
          { id: 'equipment' as const, label: 'Equipment List', icon: <Cog className="w-4 h-4" /> },
          { id: 'instruments' as const, label: 'Instruments', icon: <Target className="w-4 h-4" /> },
          { id: 'loops' as const, label: 'Control Loops', icon: <GitBranch className="w-4 h-4" /> },
          { id: 'nozzles' as const, label: 'Nozzles', icon: <FileText className="w-4 h-4" /> },
          { id: 'symbols' as const, label: 'Symbol Library', icon: <Info className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* P&ID Drawing */}
      {activeTab === 'drawing' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 overflow-x-auto">
          {/* Controls */}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input type="checkbox" checked={showInstruments} onChange={e => setShowInstruments(e.target.checked)} className="accent-violet-500" />
              Instruments
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input type="checkbox" checked={showConnections} onChange={e => setShowConnections(e.target.checked)} className="accent-violet-500" />
              Connections
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} className="accent-violet-500" />
              Labels
            </label>
          </div>

          {/* SVG Canvas */}
          <svg viewBox="0 0 780 480" className="w-full min-w-[700px]" style={{ maxHeight: '550px' }}>
            <defs>
              <pattern id="pid-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f1f23" strokeWidth="0.5" />
              </pattern>
              <marker id="pid-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#6d28d9" opacity="0.6" />
              </marker>
            </defs>
            <rect width="780" height="480" fill="url(#pid-grid)" rx="8" />

            {/* Connections */}
            {showConnections && pid.connections.map(conn => {
              const fromEq = pid.equipment.find(e => e.id === conn.from.equipmentId);
              const toEq = pid.equipment.find(e => e.id === conn.to.equipmentId);
              if (!fromEq || !toEq) return null;

              const lineStyle = PIPING_LINES.find(l => l.id === conn.lineType);
              const color = lineStyle?.color || '#a1a1aa';
              const dashArray = lineStyle?.style === 'dashed' ? '8,4' : lineStyle?.style === 'dotted' ? '2,4' : 'none';

              // Simple midpoint routing
              const x1 = fromEq.x + fromEq.width / 2;
              const y1 = fromEq.y + fromEq.height / 2;
              const x2 = toEq.x + toEq.width / 2;
              const y2 = toEq.y + toEq.height / 2;

              return (
                <g key={conn.id}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={color}
                    strokeWidth={lineStyle?.width || 2}
                    strokeDasharray={dashArray}
                    opacity={0.7}
                  />
                  {conn.diameter && showLabels && (
                    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace">
                      {conn.diameter} {conn.material ? `(${conn.material})` : ''}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Equipment */}
            {pid.equipment.map(eq => {
              const symbol = getSymbol(eq.symbolId);
              const isSelected = selectedItem?.id === eq.id;
              return (
                <g
                  key={eq.id}
                  onClick={() => setSelectedItem({ type: 'equipment', id: eq.id })}
                  className="cursor-pointer"
                >
                  {/* Background highlight */}
                  <rect
                    x={eq.x - 4} y={eq.y - 4}
                    width={eq.width + 8} height={eq.height + 8}
                    rx="6"
                    fill={isSelected ? '#6d28d9' : 'transparent'}
                    fillOpacity={isSelected ? 0.15 : 0}
                    stroke={isSelected ? '#8b5cf6' : 'transparent'}
                    strokeWidth="1"
                  />
                  {/* Symbol body */}
                  <rect
                    x={eq.x} y={eq.y}
                    width={eq.width} height={eq.height}
                    rx="4"
                    fill="#0f0f0f"
                    stroke={isSelected ? '#a78bfa' : '#3f3f46'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  {/* Equipment symbol representation */}
                  {eq.symbolId === 'bioreactor' && (
                    <>
                      <rect x={eq.x + 10} y={eq.y + 10} width={eq.width - 20} height={eq.height - 30} rx="8" fill="none" stroke="#52525b" strokeWidth="1" />
                      <line x1={eq.x + eq.width / 2} y1={eq.y + 10} x2={eq.x + eq.width / 2} y2={eq.y + eq.height - 30} stroke="#52525b" strokeWidth="1" />
                      <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height - 25} r="3" fill="#52525b" />
                    </>
                  )}
                  {eq.symbolId === 'tank-vertical' && (
                    <>
                      <rect x={eq.x + 8} y={eq.y + 8} width={eq.width - 16} height={eq.height - 16} rx="4" fill="none" stroke="#52525b" strokeWidth="1" />
                    </>
                  )}
                  {eq.symbolId === 'pump-peristaltic' && (
                    <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height / 2} r={Math.min(eq.width, eq.height) / 3} fill="none" stroke="#52525b" strokeWidth="1" />
                  )}
                  {eq.symbolId === 'pump-centrifugal' && (
                    <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height / 2} r={Math.min(eq.width, eq.height) / 3} fill="none" stroke="#52525b" strokeWidth="1" />
                  )}
                  {eq.symbolId === 'heat-exchanger' && (
                    <>
                      {[0.3, 0.5, 0.7].map(pct => (
                        <line key={pct} x1={eq.x + 5} y1={eq.y + eq.height * pct} x2={eq.x + eq.width - 5} y2={eq.y + eq.height * pct} stroke="#52525b" strokeWidth="1" />
                      ))}
                    </>
                  )}
                  {eq.symbolId === 'valve-safety-relief' && (
                    <>
                      <polygon points={`${eq.x + eq.width / 2},${eq.y + 5} ${eq.x + 5},${eq.y + eq.height - 10} ${eq.x + eq.width - 5},${eq.y + eq.height - 10}`} fill="none" stroke="#52525b" strokeWidth="1" />
                    </>
                  )}
                  {/* Tag label */}
                  <text x={eq.x + 4} y={eq.y - 6} fill="#a78bfa" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    {eq.tag}
                  </text>
                  {/* Name label */}
                  {showLabels && (
                    <text x={eq.x + eq.width / 2} y={eq.y + eq.height + 14} textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="system-ui">
                      {eq.name.length > 25 ? eq.name.slice(0, 22) + '...' : eq.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Instruments */}
            {showInstruments && pid.instruments.map(inst => {
              const isSelected = selectedItem?.id === inst.id;
              return (
                <g
                  key={inst.id}
                  onClick={() => setSelectedItem({ type: 'instrument', id: inst.id })}
                  className="cursor-pointer"
                >
                  {/* Instrument bubble (ISA circle) */}
                  <circle
                    cx={inst.x} cy={inst.y}
                    r="16"
                    fill="#0f0f0f"
                    stroke={isSelected ? '#a78bfa' : '#6d28d9'}
                    strokeWidth={isSelected ? 2 : 1.5}
                  />
                  <circle
                    cx={inst.x} cy={inst.y}
                    r="12"
                    fill="none"
                    stroke={isSelected ? '#a78bfa' : '#52525b'}
                    strokeWidth="0.5"
                  />
                  {/* Tag text */}
                  <text x={inst.x} y={inst.y + 3} textAnchor="middle" fill="#c4b5fd" fontSize="7" fontWeight="bold" fontFamily="monospace">
                    {inst.tag}
                  </text>
                  {/* Signal line down */}
                  <line x1={inst.x} y1={inst.y + 16} x2={inst.x} y2={inst.y + 30} stroke="#f97316" strokeWidth="1" strokeDasharray="2,2" />
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(620, 400)">
              <rect x={0} y={0} width={140} height={70} rx="4" fill="#0f0f0f" stroke="#27272a" />
              <text x={8} y={14} fill="#71717a" fontSize="8" fontWeight="bold">LEGEND</text>
              {PIPING_LINES.slice(0, 5).map((line, i) => (
                <g key={line.id} transform={`translate(8, ${22 + i * 10})`}>
                  <line x1={0} y1={0} x2={20} y2={0} stroke={line.color} strokeWidth="2" strokeDasharray={line.style === 'dashed' ? '4,2' : line.style === 'dotted' ? '1,2' : 'none'} />
                  <text x={25} y={3} fill="#71717a" fontSize="7">{line.name}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* Equipment Table */}
      {activeTab === 'equipment' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Tag</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Vendor</th>
                <th className="text-left py-3 px-4">Model</th>
                <th className="text-left py-3 px-4">Key Specs</th>
              </tr>
            </thead>
            <tbody>
              {pid.equipment.map(eq => (
                <tr
                  key={eq.id}
                  className={cn('border-t border-zinc-800/50 hover:bg-zinc-800/20 cursor-pointer', selectedItem?.id === eq.id && 'bg-violet-500/10')}
                  onClick={() => setSelectedItem({ type: 'equipment', id: eq.id })}
                >
                  <td className="py-2.5 px-4 font-mono font-bold text-violet-400">{eq.tag}</td>
                  <td className="py-2.5 px-4 text-zinc-200">{eq.name}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{eq.vendor || '—'}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{eq.model || '—'}</td>
                  <td className="py-2.5 px-4 text-zinc-500">
                    {eq.specs ? Object.entries(eq.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Instruments Table */}
      {activeTab === 'instruments' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Tag</th>
                <th className="text-left py-3 px-4">Variable</th>
                <th className="text-left py-3 px-4">Function</th>
                <th className="text-left py-3 px-4">Vendor</th>
                <th className="text-left py-3 px-4">Model</th>
                <th className="text-left py-3 px-4">Range</th>
                <th className="text-left py-3 px-4">Signal</th>
              </tr>
            </thead>
            <tbody>
              {pid.instruments.map(inst => (
                <tr
                  key={inst.id}
                  className={cn('border-t border-zinc-800/50 hover:bg-zinc-800/20 cursor-pointer', selectedItem?.id === inst.id && 'bg-violet-500/10')}
                  onClick={() => setSelectedItem({ type: 'instrument', id: inst.id })}
                >
                  <td className="py-2.5 px-4 font-mono font-bold text-violet-400">{inst.tag}</td>
                  <td className="py-2.5 px-4 text-zinc-200">{inst.variable}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{inst.function}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{inst.vendor || '—'}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{inst.model || '—'}</td>
                  <td className="py-2.5 px-4 text-zinc-400 font-mono">{inst.range}</td>
                  <td className="py-2.5 px-4 text-zinc-500">{inst.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Control Loops */}
      {activeTab === 'loops' && (
        <div className="space-y-3">
          {pid.controlLoops.map(loop => (
            <div
              key={loop.id}
              className={cn(
                'bg-zinc-900/50 rounded-xl border p-4 cursor-pointer transition-colors',
                selectedItem?.id === loop.id ? 'border-violet-500/30 bg-violet-500/5' : 'border-zinc-800 hover:border-zinc-700'
              )}
              onClick={() => setSelectedItem({ type: 'loop', id: loop.id })}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-violet-400 text-sm">{loop.tag}</span>
                  <span className="text-sm text-zinc-200">{loop.name}</span>
                </div>
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                  loop.type === 'cascade' ? 'bg-amber-500/20 text-amber-400' :
                  loop.type === 'single' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-zinc-700 text-zinc-400'
                )}>
                  {loop.type}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-zinc-500 uppercase tracking-wider text-[10px]">Measured</div>
                  <div className="text-zinc-300">{loop.measuredVariable}</div>
                </div>
                <div>
                  <div className="text-zinc-500 uppercase tracking-wider text-[10px]">Setpoint</div>
                  <div className="text-zinc-300 font-mono">{loop.setpoint}</div>
                </div>
                <div>
                  <div className="text-zinc-500 uppercase tracking-wider text-[10px]">Output</div>
                  <div className="text-zinc-300">{loop.output}</div>
                </div>
                <div>
                  <div className="text-zinc-500 uppercase tracking-wider text-[10px]">Alarms</div>
                  <div className="text-zinc-300">
                    {loop.alarmHigh ? `H: ${loop.alarmHigh}` : ''} {loop.alarmLow ? `L: ${loop.alarmLow}` : ''}
                    {!loop.alarmHigh && !loop.alarmLow && '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nozzle Table */}
      {activeTab === 'nozzles' && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Nozzle</th>
                <th className="text-left py-3 px-4">Equipment</th>
                <th className="text-left py-3 px-4">Service</th>
                <th className="text-left py-3 px-4">Size</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody>
              {pid.nozzles.map(n => {
                const eq = pid.equipment.find(e => e.id === n.equipmentId);
                return (
                  <tr key={n.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="py-2.5 px-4 font-mono font-bold text-violet-400">{n.id}</td>
                    <td className="py-2.5 px-4 text-zinc-300">{eq?.tag} — {n.name}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{n.service}</td>
                    <td className="py-2.5 px-4 font-mono text-zinc-300">{n.size}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{n.type}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{n.rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Symbol Library Reference */}
      {activeTab === 'symbols' && (
        <div className="space-y-4">
          {['equipment', 'valve', 'instrument'].map(cat => (
            <div key={cat}>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{cat} Symbols</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {ALL_SYMBOLS.filter(s => s.category === cat).map(sym => (
                  <div key={sym.id} className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-3">
                    <div className="text-xs font-semibold text-white mb-1">{sym.name}</div>
                    <div className="text-[10px] text-zinc-500 mb-1">{sym.description}</div>
                    {sym.isaCode && (
                      <div className="text-[10px] text-violet-400 font-mono">ISA: {sym.isaCode}</div>
                    )}
                    <div className="text-[10px] text-zinc-600">{sym.ports.length} connection ports</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Piping Line Types</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PIPING_LINES.map(line => (
                <div key={line.id} className="flex items-center gap-2 bg-zinc-900/50 rounded-lg border border-zinc-800 p-2">
                  <div className="w-8 h-0.5" style={{ backgroundColor: line.color, borderStyle: line.style === 'dashed' ? 'dashed' : line.style === 'dotted' ? 'dotted' : 'solid' }} />
                  <span className="text-xs text-zinc-400">{line.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedItemData && (
        <div className="bg-zinc-900/80 rounded-xl border border-violet-500/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">
                {selectedItem?.type === 'equipment' && (selectedItemData as PIDEquipment).name}
                {selectedItem?.type === 'instrument' && (selectedItemData as PIDInstrument).tag}
                {selectedItem?.type === 'loop' && (selectedItemData as PIDControlLoop).name}
                {selectedItem?.type === 'nozzle' && (selectedItemData as any).name}
              </span>
            </div>
            <button onClick={() => setSelectedItem(null)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <pre className="text-xs text-zinc-400 font-mono bg-zinc-800/30 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(selectedItemData, null, 2)}
          </pre>
        </div>
      )}

      {/* Notes */}
      {pid.notes && pid.notes.length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Notes</div>
          <ol className="list-decimal list-inside space-y-1">
            {pid.notes.map((note, i) => (
              <li key={i} className="text-xs text-zinc-400">{note}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
