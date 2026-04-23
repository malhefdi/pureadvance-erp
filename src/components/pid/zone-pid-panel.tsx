'use client';

import { useState, useCallback } from 'react';
import { ZonePIDRenderer } from './zone-pid-renderer';
import { ZONE_LABELS } from '@/lib/pid-data';
import { useZoneLiveData } from '@/hooks/use-zone-live-data';
import { useBreakpoints } from '@/hooks/use-breakpoints';
import type { ZonePIDData, ZoneKPISummary, EquipmentLiveData, AlarmSeverity } from '@/types/pid-zone';
import { cn } from '@/lib/utils';
import {
  Activity, AlertTriangle, Cog, Gauge, GitBranch, Layers, Package,
  Play, Pause, Wrench, XCircle, RotateCcw, Radio, Timer
} from 'lucide-react';
import { TrendChart } from './trend-chart';
import { ControlLoopDiagram } from './control-loop-diagram';

// ============================================================
// ALARM / STATUS HELPERS
// ============================================================

const ALARM_BG: Record<AlarmSeverity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  normal: '',
};

const STATUS_ICON: Record<string, typeof Play> = {
  running: Play,
  idle: Pause,
  maintenance: Wrench,
  offline: XCircle,
  cleaning: Activity,
};

const STATUS_COLOR: Record<string, string> = {
  running: 'text-emerald-400 bg-emerald-500/10',
  idle: 'text-amber-400 bg-amber-500/10',
  maintenance: 'text-orange-400 bg-orange-500/10',
  offline: 'text-zinc-500 bg-zinc-500/10',
  cleaning: 'text-violet-400 bg-violet-500/10',
};

// ============================================================
// KPI HEADER
// ============================================================

function KPIHeader({ kpi, zoneName }: { kpi: ZoneKPISummary; zoneName: string }) {
  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          {zoneName} — Live Status
        </h3>
        {kpi.criticalAlarms > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            {kpi.criticalAlarms} Critical
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard label="Equipment" value={kpi.totalEquipment} icon={<Cog className="w-3.5 h-3.5" />} />
        <KPICard label="Running" value={kpi.runningEquipment} icon={<Play className="w-3.5 h-3.5" />} color="text-emerald-400" />
        <KPICard label="Maintenance" value={kpi.maintenanceEquipment} icon={<Wrench className="w-3.5 h-3.5" />} color="text-orange-400" />
        <KPICard label="Offline" value={kpi.offlineEquipment} icon={<XCircle className="w-3.5 h-3.5" />} color="text-zinc-500" />
        <KPICard label="Efficiency" value={`${kpi.avgEfficiency}%`} icon={<Gauge className="w-3.5 h-3.5" />} color="text-blue-400" />
        <KPICard label="Batches" value={kpi.activeBatches} icon={<Package className="w-3.5 h-3.5" />} color="text-violet-400" />
        <KPICard label="Alarms" value={kpi.activeAlarms} icon={<AlertTriangle className="w-3.5 h-3.5" />} color={kpi.activeAlarms > 0 ? 'text-amber-400' : 'text-zinc-500'} />
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color = 'text-zinc-300' }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-zinc-800/30 rounded-lg px-3 py-2 border border-zinc-800/50">
      <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className={cn('text-lg font-bold font-mono', color)}>{value}</div>
    </div>
  );
}

// ============================================================
// EQUIPMENT DETAIL TABLE
// ============================================================

function EquipmentTable({ zone, selectedId, onSelect }: {
  zone: ZonePIDData;
  selectedId: string | null;
  onSelect: (type: string, id: string) => void;
}) {
  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto">
      <table className="w-full text-xs min-w-[600px]">
        <thead>
          <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
            <th className="text-left py-2 px-3 w-6" />
            <th className="text-left py-2 px-3">Tag</th>
            <th className="text-left py-2 px-3">Name</th>
            <th className="text-left py-2 px-3">Vendor</th>
            <th className="text-left py-2 px-3">Status</th>
            <th className="text-left py-2 px-3">Eff.</th>
            <th className="text-left py-2 px-3">Batch</th>
          </tr>
        </thead>
        <tbody>
          {zone.equipment.map(eq => {
            const status = zone.equipmentStatus.find(s => s.equipmentId === eq.id);
            const StatusIcon = status ? STATUS_ICON[status.status] : Cog;
            const statusClass = status ? STATUS_COLOR[status.status] : 'text-zinc-500';

            return (
              <tr
                key={eq.id}
                className={cn(
                  'border-t border-zinc-800/50 hover:bg-zinc-800/20 cursor-pointer transition-colors',
                  selectedId === eq.id && 'bg-violet-500/10'
                )}
                onClick={() => onSelect('equipment', eq.id)}
              >
                <td className="py-2 px-3">
                  <StatusIcon className={cn('w-3 h-3', statusClass)} />
                </td>
                <td className="py-2 px-3 font-mono font-bold text-violet-400">{eq.tag}</td>
                <td className="py-2 px-3 text-zinc-200">{eq.name}</td>
                <td className="py-2 px-3 text-zinc-400">{eq.vendor || '—'}</td>
                <td className="py-2 px-3">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize', statusClass)}>
                    {status?.status || 'unknown'}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono text-zinc-300">{status ? `${status.efficiency}%` : '—'}</td>
                <td className="py-2 px-3 text-zinc-400 font-mono">{status?.batchId || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// INSTRUMENT TABLE
// ============================================================

function InstrumentTable({ zone, selectedId, onSelect }: {
  zone: ZonePIDData;
  selectedId: string | null;
  onSelect: (type: string, id: string) => void;
}) {
  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto">
      <table className="w-full text-xs min-w-[600px]">
        <thead>
          <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
            <th className="text-left py-2 px-3">Tag</th>
            <th className="text-left py-2 px-3">Variable</th>
            <th className="text-left py-2 px-3">Value</th>
            <th className="text-left py-2 px-3">Setpoint</th>
            <th className="text-left py-2 px-3">Range</th>
            <th className="text-left py-2 px-3">Alarm</th>
          </tr>
        </thead>
        <tbody>
          {zone.instruments.map(inst => {
            const value = zone.instrumentValues.find(v => v.instrumentId === inst.id);
            return (
              <tr
                key={inst.id}
                className={cn(
                  'border-t border-zinc-800/50 hover:bg-zinc-800/20 cursor-pointer transition-colors',
                  selectedId === inst.id && 'bg-violet-500/10',
                  value?.alarmState === 'critical' && 'bg-red-500/5'
                )}
                onClick={() => onSelect('instrument', inst.id)}
              >
                <td className="py-2 px-3 font-mono font-bold text-violet-400">{inst.tag}</td>
                <td className="py-2 px-3 text-zinc-200">{inst.variable}</td>
                <td className="py-2 px-3 font-mono text-zinc-100">
                  {value ? `${value.value.toFixed(1)} ${value.unit}` : '—'}
                </td>
                <td className="py-2 px-3 font-mono text-zinc-400">
                  {value?.setpoint !== undefined ? `${value.setpoint} ${value.unit}` : '—'}
                </td>
                <td className="py-2 px-3 text-zinc-500 font-mono">{inst.range || '—'}</td>
                <td className="py-2 px-3">
                  {value && value.alarmState !== 'normal' && (
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase border', ALARM_BG[value.alarmState])}>
                      {value.alarmState}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// CONTROL LOOPS
// ============================================================

function ControlLoopsList({ zone }: { zone: ZonePIDData }) {
  return (
    <div className="space-y-2">
      {zone.controlLoops.map(loop => (
        <div
          key={loop.id}
          className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-violet-400 text-xs">{loop.tag}</span>
              <span className="text-xs text-zinc-200">{loop.name}</span>
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
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div>
              <div className="text-zinc-500 uppercase tracking-wider">Measured</div>
              <div className="text-zinc-300 font-medium">{loop.measuredVariable}</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider">Setpoint</div>
              <div className="text-zinc-300 font-mono">{loop.setpoint}</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider">Output</div>
              <div className="text-zinc-300">{loop.output}</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider">Alarms</div>
              <div className="text-zinc-300 font-mono">
                {loop.alarmHigh ? `H:${loop.alarmHigh} ` : ''}{loop.alarmLow ? `L:${loop.alarmLow}` : ''}
                {!loop.alarmHigh && !loop.alarmLow && '—'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// VALVE TABLE
// ============================================================

function ValveTable({ zone }: { zone: ZonePIDData }) {
  return (
    <div className="space-y-3">
      {/* Valve table */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
              <th className="text-left py-2 px-3">Valve</th>
              <th className="text-left py-2 px-3">Position</th>
              <th className="text-left py-2 px-3">% Open</th>
              <th className="text-left py-2 px-3">Mode</th>
              <th className="text-left py-2 px-3">Last Actuation</th>
            </tr>
          </thead>
          <tbody>
            {zone.valvePositions.map(v => (
              <tr key={v.valveId} className="border-t border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="py-2 px-3 font-mono font-bold text-violet-400">{v.valveId}</td>
                <td className="py-2 px-3">
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                    v.position === 'open' ? 'bg-emerald-500/20 text-emerald-400' :
                    v.position === 'closed' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  )}>
                    {v.position}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          v.position === 'open' ? 'bg-emerald-500' :
                          v.position === 'closed' ? 'bg-red-500' :
                          'bg-amber-500'
                        )}
                        style={{ width: `${v.percentOpen}%` }}
                      />
                    </div>
                    <span className="font-mono text-zinc-300">{v.percentOpen}%</span>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-medium',
                    v.mode === 'auto' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-700 text-zinc-400'
                  )}>
                    {v.mode}
                  </span>
                </td>
                <td className="py-2 px-3 text-zinc-500 font-mono text-[10px]">
                  {v.lastActuation || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Valve state cards for quick visual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {zone.valvePositions.map(v => {
          const isOpen = v.position === 'open';
          const isPartial = v.position === 'partial';
          const color = isOpen ? 'border-emerald-500/30' : isPartial ? 'border-amber-500/30' : 'border-red-500/30';
          const iconColor = isOpen ? 'text-emerald-400' : isPartial ? 'text-amber-400' : 'text-red-400';
          return (
            <div key={`card-${v.valveId}`} className={cn('bg-zinc-900/50 rounded-lg border p-3', color)}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-violet-400">{v.valveId}</span>
                <span className={cn('text-[10px] font-bold uppercase', iconColor)}>{v.position}</span>
              </div>
              <div className="relative h-6 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                    isOpen ? 'bg-emerald-500/30' : isPartial ? 'bg-amber-500/30' : 'bg-red-500/30'
                  )}
                  style={{ width: `${v.percentOpen}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-zinc-300">
                  {v.percentOpen}%
                </div>
              </div>
              <div className="mt-1 text-[9px] text-zinc-500 text-center">
                {v.mode === 'auto' ? '⚡ Auto' : '👆 Manual'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// INSTRUMENT TABLE
// ============================================================

function ZoneSelector({ activeZone, onZoneChange }: {
  activeZone: string;
  onZoneChange: (zoneId: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
      {Object.entries(ZONE_LABELS).map(([id, label]) => (
        <button
          key={id}
          onClick={() => onZoneChange(id)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0',
            activeZone === id
              ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
          )}
        >
          {label.split(' ')[0]}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// MAIN PANEL
// ============================================================

type TabId = 'drawing' | 'equipment' | 'instruments' | 'loops' | 'valves';

export function ZonePIDPanel({ initialZone = 'z-upstream' }: { initialZone?: string }) {
  const [activeZone, setActiveZone] = useState(initialZone);
  const [activeTab, setActiveTab] = useState<TabId>('drawing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInstruments, setShowInstruments] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showFlowAnimation, setShowFlowAnimation] = useState(true);
  const { isMobile, isSmall } = useBreakpoints();

  const {
    data: zone,
    kpi,
    isLive,
    isPaused,
    tickCount,
    pause,
    resume,
    reset,
    setInterval: setPollInterval,
  } = useZoneLiveData(activeZone, { interval: 2000, autoStart: true, simulate: true });

  if (!zone || !kpi) {
    return (
      <div className="text-zinc-500 text-sm p-8 text-center">
        Zone not found: {activeZone}
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'drawing', label: 'P&ID Drawing', icon: <Layers className="w-4 h-4" /> },
    { id: 'equipment', label: 'Equipment', icon: <Cog className="w-4 h-4" /> },
    { id: 'instruments', label: 'Instruments', icon: <Gauge className="w-4 h-4" /> },
    { id: 'loops', label: 'Control Loops', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'valves', label: 'Valves', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Zone Selector */}
      <ZoneSelector activeZone={activeZone} onZoneChange={(id) => { setActiveZone(id); setSelectedId(null); }} />

      {/* Live Data Controls */}
      <div className="flex items-center justify-between bg-zinc-900/30 rounded-lg border border-zinc-800/50 px-3 py-2">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            {isLive && !isPaused ? (
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            ) : (
              <Pause className="w-3 h-3 text-amber-400" />
            )}
            <span className={cn('text-[10px] font-bold uppercase', isLive && !isPaused ? 'text-emerald-400' : 'text-amber-400')}>
              {isLive && !isPaused ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          {/* Tick counter */}
          <div className="flex items-center gap-1 text-zinc-500">
            <Timer className="w-3 h-3" />
            <span className="text-[10px] font-mono">{tickCount} ticks</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Speed selector */}
          <select
            onChange={e => setPollInterval(Number(e.target.value))}
            defaultValue={2000}
            className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-400"
          >
            <option value={500}>500ms</option>
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
          </select>
          {/* Pause/Resume */}
          {isPaused ? (
            <button onClick={resume} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
              <Play className="w-3 h-3" /> Resume
            </button>
          ) : (
            <button onClick={pause} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
              <Pause className="w-3 h-3" /> Pause
            </button>
          )}
          {/* Reset */}
          <button onClick={reset} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* KPI Header */}
      <KPIHeader kpi={kpi} zoneName={zone.zoneName} />

      {/* Tab Selector — scrollable on mobile */}
      <div className="flex items-center gap-2 bg-zinc-900/50 rounded-xl border border-zinc-800 p-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              activeTab === tab.id
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
            )}
          >
            {isMobile ? tab.icon : <>{tab.icon} {tab.label}</>}
          </button>
        ))}
      </div>

      {/* Drawing Tab */}
      {activeTab === 'drawing' && (
        <>
          {/* Layer controls — wrap on mobile */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-zinc-400">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={showInstruments} onChange={e => setShowInstruments(e.target.checked)} className="accent-violet-500" />
              {isMobile ? 'Inst.' : 'Instruments'}
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={showConnections} onChange={e => setShowConnections(e.target.checked)} className="accent-violet-500" />
              {isMobile ? 'Pipes' : 'Connections'}
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} className="accent-violet-500" />
              Labels
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={showFlowAnimation} onChange={e => setShowFlowAnimation(e.target.checked)} className="accent-violet-500" />
              {isMobile ? 'Flow' : 'Flow Animation'}
            </label>
          </div>

          {/* Renderer */}
          <ZonePIDRenderer
            zone={zone}
            selectedId={selectedId}
            onSelect={(type, id) => setSelectedId(selectedId === id ? null : id)}
            showInstruments={showInstruments}
            showConnections={showConnections}
            showLabels={showLabels}
            showFlowAnimation={showFlowAnimation}
          />

          {/* Selected item detail panel */}
          {selectedId && (
            <SelectedItemDetail zone={zone} selectedId={selectedId} onClose={() => setSelectedId(null)} />
          )}
        </>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <EquipmentTable zone={zone} selectedId={selectedId} onSelect={(_, id) => setSelectedId(id)} />
      )}

      {/* Instruments Tab — with trend charts */}
      {activeTab === 'instruments' && (
        <div className="space-y-3">
          <InstrumentTable zone={zone} selectedId={selectedId} onSelect={(_, id) => setSelectedId(id)} />
          {/* Trend Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {zone.instrumentValues
              .filter(v => v.trend && v.trend.length >= 2)
              .filter(v => v.alarmState !== 'normal' || selectedId === v.instrumentId)
              .slice(0, 6)
              .map(val => (
                <TrendChart key={val.instrumentId} data={val} />
              ))}
          </div>
        </div>
      )}

      {/* Control Loops Tab — compact on mobile, full on desktop */}
      {activeTab === 'loops' && (
        <div className="space-y-3">
          {zone.controlLoops.map(loop => (
            <ControlLoopDiagram
              key={loop.id}
              loop={loop}
              instrumentValues={zone.instrumentValues}
              equipmentStatus={zone.equipmentStatus}
              compact={isMobile}
            />
          ))}
        </div>
      )}

      {/* Valves Tab */}
      {activeTab === 'valves' && (
        <ValveTable zone={zone} />
      )}
    </div>
  );
}

// ============================================================
// SELECTED ITEM DETAIL
// ============================================================

function SelectedItemDetail({ zone, selectedId, onClose }: {
  zone: ZonePIDData;
  selectedId: string;
  onClose: () => void;
}) {
  const eq = zone.equipment.find(e => e.id === selectedId);
  const inst = zone.instruments.find(i => i.id === selectedId);

  if (!eq && !inst) return null;

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-violet-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-violet-400">
          {eq ? `${eq.tag} — ${eq.name}` : inst ? `${inst.tag} — ${inst.variable}` : ''}
        </h4>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      {eq && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <DetailCard label="Tag" value={eq.tag} />
          <DetailCard label="Vendor" value={eq.vendor || '—'} />
          <DetailCard label="Model" value={eq.model || '—'} />
          <DetailCard label="Zone" value={zone.zoneName} />
          {eq.specs && Object.entries(eq.specs).map(([k, v]) => (
            <DetailCard key={k} label={k} value={v} />
          ))}
        </div>
      )}

      {inst && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <DetailCard label="Tag" value={inst.tag} />
            <DetailCard label="Variable" value={inst.variable} />
            <DetailCard label="Function" value={inst.function} />
            <DetailCard label="Range" value={inst.range || '—'} />
            <DetailCard label="Signal" value={inst.signal || '—'} />
            <DetailCard label="Vendor" value={inst.vendor || '—'} />
            <DetailCard label="Model" value={inst.model || '—'} />
            {(() => {
              const val = zone.instrumentValues.find(v => v.instrumentId === inst.id);
              if (!val) return null;
              return (
                <>
                  <DetailCard label="Value" value={`${val.value.toFixed(1)} ${val.unit}`} />
                  <DetailCard label="Setpoint" value={val.setpoint !== undefined ? `${val.setpoint} ${val.unit}` : '—'} />
                  <DetailCard label="Alarm" value={val.alarmState} highlight={val.alarmState !== 'normal'} />
                </>
              );
            })()}
          </div>
          {/* Trend chart for selected instrument */}
          {(() => {
            const val = zone.instrumentValues.find(v => v.instrumentId === inst.id);
            if (!val || !val.trend || val.trend.length < 2) return null;
            return (
              <div className="mt-3">
                <TrendChart data={val} width={500} height={120} />
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

function DetailCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-zinc-800/30 rounded-lg px-3 py-2 border border-zinc-800/50">
      <div className="text-zinc-500 uppercase tracking-wider text-[9px] mb-0.5">{label}</div>
      <div className={cn('font-medium', highlight ? 'text-amber-400' : 'text-zinc-200')}>{value}</div>
    </div>
  );
}
