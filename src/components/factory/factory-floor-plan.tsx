'use client';

import { useState } from 'react';
import { zones, equipment, batches } from '@/lib/mock-data';
import { cn, zoneColor, statusColor } from '@/lib/utils';
import { Equipment, Zone } from '@/types/erp';
import { X, Cog, Thermometer, Wind, Zap, Package, FlaskConical, Box, Layers } from 'lucide-react';

const zoneIcons: Record<string, React.ReactNode> = {
  upstream: <Layers className="w-4 h-4" />,
  downstream: <Zap className="w-4 h-4" />,
  formulation: <FlaskConical className="w-4 h-4" />,
  packaging: <Package className="w-4 h-4" />,
  qc: <FlaskConical className="w-4 h-4" />,
  warehouse: <Box className="w-4 h-4" />,
  utilities: <Wind className="w-4 h-4" />,
};

export function FactoryFloorPlan() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const getZoneEquipment = (zoneId: string) => equipment.filter(e => e.zoneId === zoneId);
  const getZoneBatches = (zoneType: string) =>
    batches.filter(b => {
      const stage = b.currentStage.toLowerCase();
      if (zoneType === 'upstream') return stage.includes('ferment') || stage.includes('seed') || stage.includes('media');
      if (zoneType === 'downstream') return stage.includes('harvest') || stage.includes('centrifuge') || stage.includes('dry');
      if (zoneType === 'formulation') return stage.includes('mix') || stage.includes('formul') || stage.includes('homogeni');
      if (zoneType === 'qc') return stage.includes('qc') || stage.includes('test');
      if (zoneType === 'packaging') return stage.includes('fill') || stage.includes('seal') || stage.includes('label');
      if (zoneType === 'warehouse') return stage.includes('stor') || stage.includes('dispatch') || stage.includes('complete');
      return false;
    });

  const _activeBatches = batches.filter(b => ['in_progress', 'qc_pending'].includes(b.status));

  return (
    <div className="relative">
      {/* SVG Floor Plan */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Pure Advance Facility</h2>
            <p className="text-xs text-zinc-500">500m² • INSEBT Biopesticide Production • Click zones to explore</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-zinc-400">Running</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-zinc-400">Maintenance</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-zinc-400">Offline</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500" /><span className="text-zinc-400">Idle</span></div>
          </div>
        </div>

        <svg viewBox="0 0 1120 440" className="w-full min-w-[800px]" style={{ maxHeight: '500px' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="zoneGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="1120" height="440" fill="url(#grid)" rx="12" />

          {/* Corridor */}
          <rect x="20" y="230" width="1080" height="20" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
          <text x="560" y="244" textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace">MATERIAL TRANSFER CORRIDOR</text>

          {/* Zones */}
          {zones.map((zone) => {
            const _colors = statusColor(zone.type === 'upstream' ? 'running' : 'idle');
            const zoneEquip = getZoneEquipment(zone.id);
            const isHovered = hoveredZone === zone.id;
            const isSelected = selectedZone?.id === zone.id;

            return (
              <g
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                className="cursor-pointer"
                style={{ transition: 'all 0.3s ease' }}
              >
                {/* Zone background */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="8"
                  fill={isHovered || isSelected ? '#1c1917' : '#0f0f0f'}
                  stroke={isHovered || isSelected ? '#a78bfa' : '#27272a'}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Zone label */}
                <text x={zone.x + 12} y={zone.y + 20} fill="#a1a1aa" fontSize="11" fontWeight="600" fontFamily="system-ui">
                  {zone.name}
                </text>
                <text x={zone.x + 12} y={zone.y + 34} fill="#52525b" fontSize="9" fontFamily="monospace">
                  {zone.area}m² {zone.isoClass ? `• ${zone.isoClass}` : ''} {zone.temperature ? `• ${zone.temperature}` : ''}
                </text>

                {/* Equipment dots */}
                {zoneEquip.map((eq, i) => {
                  const col = i % 4;
                  const row = Math.floor(i / 4);
                  const dotX = zone.x + 30 + col * 60;
                  const dotY = zone.y + 55 + row * 40;
                  const dotColor = eq.status === 'running' ? '#10b981' : eq.status === 'maintenance' ? '#f59e0b' : eq.status === 'offline' ? '#ef4444' : '#6b7280';

                  return (
                    <g
                      key={eq.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedEquipment(eq); }}
                      className="cursor-pointer"
                    >
                      <rect
                        x={dotX - 24}
                        y={dotY - 10}
                        width={48}
                        height={22}
                        rx="4"
                        fill="#18181b"
                        stroke={selectedEquipment?.id === eq.id ? '#a78bfa' : '#27272a'}
                        strokeWidth="1"
                      />
                      <circle cx={dotX - 14} cy={dotY + 1} r="4" fill={dotColor}>
                        {eq.status === 'running' && (
                          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                        )}
                      </circle>
                      <text x={dotX - 6} y={dotY + 5} fill="#a1a1aa" fontSize="7" fontFamily="system-ui" fontWeight="500">
                        {eq.name.split(' ').slice(0, 2).join(' ')}
                      </text>
                    </g>
                  );
                })}

                {/* Active batch indicators */}
                {getZoneBatches(zone.type).map((batch, i) => (
                  <g key={batch.id}>
                    <rect
                      x={zone.x + zone.width - 90}
                      y={zone.y + 12 + i * 20}
                      width={78}
                      height={16}
                      rx="3"
                      fill="#8b5cf6"
                      fillOpacity="0.2"
                      stroke="#8b5cf6"
                      strokeOpacity="0.4"
                      strokeWidth="0.5"
                    />
                    <text x={zone.x + zone.width - 84} y={zone.y + 24 + i * 20} fill="#c4b5fd" fontSize="7" fontFamily="monospace">
                      🔄 {batch.id}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* Material flow arrows */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#6d28d9" opacity="0.6" />
            </marker>
          </defs>
          <line x1="400" y1="120" x2="420" y2="120" stroke="#6d28d9" strokeWidth="1.5" markerEnd="url(#arrowhead)" opacity="0.5" />
          <line x1="700" y1="120" x2="720" y2="120" stroke="#6d28d9" strokeWidth="1.5" markerEnd="url(#arrowhead)" opacity="0.5" />
          <line x1="900" y1="220" x2="900" y2="260" stroke="#6d28d9" strokeWidth="1.5" markerEnd="url(#arrowhead)" opacity="0.5" />
          <line x1="550" y1="220" x2="550" y2="260" stroke="#6d28d9" strokeWidth="1.5" markerEnd="url(#arrowhead)" opacity="0.5" />
        </svg>
      </div>

      {/* Zone Detail Panel */}
      {selectedZone && !selectedEquipment && (
        <div className="mt-4 bg-zinc-900/80 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', zoneColor(selectedZone.type).bg)}>
                {zoneIcons[selectedZone.type]}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedZone.name}</h3>
                <p className="text-xs text-zinc-500">{selectedZone.description}</p>
              </div>
            </div>
            <button onClick={() => setSelectedZone(null)} className="text-zinc-500 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Area</div>
              <div className="text-lg font-bold text-white">{selectedZone.area}m²</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Equipment</div>
              <div className="text-lg font-bold text-white">{getZoneEquipment(selectedZone.id).length}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">ISO Class</div>
              <div className="text-lg font-bold text-white">{selectedZone.isoClass || '—'}</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Temperature</div>
              <div className="text-lg font-bold text-white">{selectedZone.temperature || 'Ambient'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Equipment in Zone</div>
            {getZoneEquipment(selectedZone.id).map((eq) => (
              <button
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className="w-full flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800 hover:border-violet-500/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full', eq.status === 'running' ? 'bg-emerald-500 animate-pulse' : eq.status === 'maintenance' ? 'bg-amber-500' : eq.status === 'offline' ? 'bg-red-500' : 'bg-slate-500')} />
                  <div>
                    <div className="text-sm text-white font-medium">{eq.name}</div>
                    <div className="text-xs text-zinc-500">{eq.vendor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor(eq.status))}>
                    {eq.status}
                  </span>
                  <span className="text-xs text-zinc-500">{eq.efficiency}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Detail Panel */}
      {selectedEquipment && (
        <div className="mt-4 bg-zinc-900/80 rounded-xl border border-violet-500/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cog className="w-5 h-5 text-violet-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedEquipment.name}</h3>
                <p className="text-xs text-zinc-500">{selectedEquipment.vendor} • {selectedEquipment.costRange}</p>
              </div>
            </div>
            <button onClick={() => setSelectedEquipment(null)} className="text-zinc-500 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Status</div>
              <div className={cn('text-sm font-bold capitalize', selectedEquipment.status === 'running' ? 'text-emerald-400' : selectedEquipment.status === 'maintenance' ? 'text-amber-400' : selectedEquipment.status === 'offline' ? 'text-red-400' : 'text-slate-400')}>
                {selectedEquipment.status}
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Hours Running</div>
              <div className="text-lg font-bold text-white">{selectedEquipment.hoursRunning.toLocaleString()}h</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Efficiency</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-white">{selectedEquipment.efficiency}%</div>
                <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', selectedEquipment.efficiency >= 95 ? 'bg-emerald-500' : selectedEquipment.efficiency >= 85 ? 'bg-amber-500' : 'bg-red-500')}
                    style={{ width: `${selectedEquipment.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Specifications</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(selectedEquipment.specs).map(([key, value]) => (
              <div key={key} className="bg-zinc-800/30 rounded-lg p-2">
                <div className="text-[10px] text-zinc-600 uppercase">{key}</div>
                <div className="text-xs text-zinc-300 font-medium">{value}</div>
              </div>
            ))}
          </div>

          {selectedEquipment.nextMaintenance && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400/70">
              <Thermometer className="w-3 h-3" />
              Next maintenance: {selectedEquipment.nextMaintenance}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
