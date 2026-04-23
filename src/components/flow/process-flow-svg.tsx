'use client';

import { useState, useMemo } from 'react';
import {
  processStages,
  materialFlows,
  ZONE_ORDER,
  ZONE_COLORS,
  getStagesByZone,
  type ProcessStage,
  type ZoneType,
} from '@/lib/process-flow-data';
import { cn } from '@/lib/utils';
import { Clock, Cog, FlaskConical, AlertTriangle, CheckCircle2, ChevronRight, Zap, Package } from 'lucide-react';

// ============================================================
// LAYOUT CONSTANTS
// ============================================================

const LAYOUT = {
  stageWidth: 140,
  stageHeight: 90,
  stageGapX: 30,
  stageGapY: 16,
  lanePaddingX: 24,
  lanePaddingY: 20,
  headerHeight: 80,
  qcGateSize: 28,
};

// ============================================================
// STAGE CARD
// ============================================================

function StageCard({
  stage,
  x,
  y,
  isSelected,
  onClick,
  hasActiveBatch,
  batchCount,
}: {
  stage: ProcessStage;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
  hasActiveBatch: boolean;
  batchCount: number;
}) {
  const colors = ZONE_COLORS[stage.zone];
  const critParams = stage.parameters.filter(p => p.critical);

  return (
    <g onClick={onClick} className="cursor-pointer" style={{ transition: 'transform 0.2s' }}>
      {/* Selection glow */}
      {isSelected && (
        <rect
          x={x - 3} y={y - 3}
          width={LAYOUT.stageWidth + 6} height={LAYOUT.stageHeight + 6}
          rx="10" fill="none"
          stroke={colors.text} strokeWidth="2" opacity="0.5"
        />
      )}

      {/* Card background */}
      <rect
        x={x} y={y}
        width={LAYOUT.stageWidth} height={LAYOUT.stageHeight}
        rx="8" fill="#0f0f0f" stroke={isSelected ? colors.text : colors.border}
        strokeWidth={isSelected ? 1.5 : 1}
      />

      {/* Active batch pulse */}
      {hasActiveBatch && (
        <circle
          cx={x + LAYOUT.stageWidth - 8} cy={y + 8} r="4"
          fill={colors.text} opacity="0.8"
        >
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* GMP critical badge */}
      {stage.gmpCritical && (
        <rect x={x + 4} y={y + 4} width="4" height="12" rx="1" fill="#ef4444" opacity="0.8" />
      )}

      {/* Step number */}
      <text x={x + (stage.gmpCritical ? 14 : 8)} y={y + 14} fill="#52525b" fontSize="8" fontFamily="monospace" fontWeight="bold">
        {String(stage.stepNumber).padStart(2, '0')}
      </text>

      {/* Zone label */}
      <text x={x + LAYOUT.stageWidth - 8} y={y + 14} textAnchor="end" fill={colors.text} fontSize="7" fontWeight="bold" fontFamily="monospace" opacity="0.7">
        {stage.zone.toUpperCase().slice(0, 3)}
      </text>

      {/* Stage name */}
      <text x={x + 8} y={y + 30} fill="#e4e4e7" fontSize="10" fontWeight="600" fontFamily="system-ui">
        {stage.shortName.length > 16 ? stage.shortName.slice(0, 14) + '…' : stage.shortName}
      </text>

      {/* Duration */}
      <text x={x + 8} y={y + 44} fill="#71717a" fontSize="8" fontFamily="monospace">
        ⏱ {stage.duration.min}-{stage.duration.max}{stage.duration.unit}
      </text>

      {/* Critical parameters (first 2) */}
      {critParams.slice(0, 2).map((p, i) => (
        <text key={p.name} x={x + 8} y={y + 56 + i * 10} fill="#a1a1aa" fontSize="7" fontFamily="monospace">
          {p.name}: {p.setpoint}{p.unit}
        </text>
      ))}

      {/* Equipment count */}
      <text x={x + 8} y={y + LAYOUT.stageHeight - 8} fill="#52525b" fontSize="7" fontFamily="monospace">
        ⚙ {stage.equipment.length}
      </text>

      {/* Batch count */}
      {batchCount > 0 && (
        <g>
          <rect
            x={x + LAYOUT.stageWidth - 28} y={y + LAYOUT.stageHeight - 18}
            width="20" height="14" rx="7"
            fill={colors.text} fillOpacity="0.2"
            stroke={colors.border} strokeWidth="0.5"
          />
          <text
            x={x + LAYOUT.stageWidth - 18} y={y + LAYOUT.stageHeight - 8}
            textAnchor="middle" fill={colors.text}
            fontSize="8" fontWeight="bold" fontFamily="monospace"
          >
            {batchCount}
          </text>
        </g>
      )}

      {/* QC gate indicator */}
      {stage.qcGate && (
        <g>
          <circle cx={x + LAYOUT.stageWidth / 2} cy={y + LAYOUT.stageHeight + 6} r="4" fill="none" stroke="#ef4444" strokeWidth="1" />
          <text x={x + LAYOUT.stageWidth / 2} y={y + LAYOUT.stageHeight + 9} textAnchor="middle" fill="#ef4444" fontSize="6" fontWeight="bold">QC</text>
        </g>
      )}
    </g>
  );
}

// ============================================================
// FLOW CONNECTION ARROW
// ============================================================

function FlowArrow({
  fromX, fromY, toX, toY,
  material,
  active,
  method,
}: {
  fromX: number; fromY: number;
  toX: number; toY: number;
  material: string;
  active: boolean;
  method: string;
}) {
  const midX = (fromX + toX) / 2;
  const color = active ? '#8b5cf6' : '#3f3f46';

  // Curved path
  const path = `M${fromX},${fromY} C${midX},${fromY} ${midX},${toY} ${toX},${toY}`;

  return (
    <g>
      <path d={path} fill="none" stroke={color} strokeWidth={active ? 2 : 1} opacity={active ? 0.8 : 0.3} />

      {/* Flow animation */}
      {active && (
        <path d={path} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4,8" opacity="0.5">
          <animate attributeName="stroke-dashoffset" values="12;0" dur="1.5s" repeatCount="indefinite" />
        </path>
      )}

      {/* Arrow head */}
      <polygon
        points={`${toX},${toY} ${toX - 6},${toY - 3} ${toX - 6},${toY + 3}`}
        fill={color} opacity={active ? 0.8 : 0.4}
      />

      {/* Material label */}
      {active && (
        <text x={midX} y={(fromY + toY) / 2 - 6} textAnchor="middle" fill="#8b5cf6" fontSize="6" fontFamily="monospace" opacity="0.6">
          {material}
        </text>
      )}
    </g>
  );
}

// ============================================================
// SWIM LANE
// ============================================================

function SwimLane({
  zone,
  x,
  y,
  width,
  height,
}: {
  zone: ZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const colors = ZONE_COLORS[zone];

  return (
    <g>
      {/* Lane background */}
      <rect x={x} y={y} width={width} height={height} rx="8" fill={colors.bg} stroke={colors.border} strokeWidth="0.5" />

      {/* Zone label */}
      <text x={x + 8} y={y + 14} fill={colors.text} fontSize="10" fontWeight="bold" fontFamily="system-ui" opacity="0.6">
        {colors.label}
      </text>
    </g>
  );
}

// ============================================================
// KPI HEADER
// ============================================================

function ProcessKPI({ stages }: { stages: ProcessStage[] }) {
  const totalDuration = stages.reduce((sum, s) => sum + s.duration.max, 0);
  const critSteps = stages.filter(s => s.gmpCritical).length;
  const qcGates = stages.filter(s => s.qcGate).length;
  const totalEquip = stages.reduce((sum, s) => sum + s.equipment.length, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPICard label="Total Steps" value={stages.length.toString()} icon="01" color="text-violet-400" />
      <KPICard label="Est. Duration" value={`${totalDuration}h`} icon="⏱" color="text-blue-400" />
      <KPICard label="GMP Critical" value={critSteps.toString()} icon="⚠" color="text-red-400" />
      <KPICard label="QC Gates" value={qcGates.toString()} icon="🔬" color="text-amber-400" />
    </div>
  );
}

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 px-3 py-2">
      <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">{icon} {label}</div>
      <div className={cn('text-lg font-bold font-mono', color)}>{value}</div>
    </div>
  );
}

// ============================================================
// DETAIL PANEL
// ============================================================

function StageDetail({ stage, onClose }: { stage: ProcessStage; onClose: () => void }) {
  const colors = ZONE_COLORS[stage.zone];

  return (
    <div className="bg-zinc-900/80 rounded-xl border border-zinc-700 p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}` }}>
            Step {String(stage.stepNumber).padStart(2, '0')}
          </span>
          <h3 className="text-sm font-semibold text-white">{stage.name}</h3>
          {stage.gmpCritical && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">GMP</span>
          )}
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-xs">✕</button>
      </div>

      <p className="text-xs text-zinc-400 mb-3">{stage.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] mb-3">
        <InfoBox label="Duration" value={`${stage.duration.min}-${stage.duration.max} ${stage.duration.unit}`} />
        <InfoBox label="Equipment" value={stage.equipment.join(', ')} />
        {stage.holdTime && <InfoBox label="Hold Time" value={stage.holdTime} highlight />}
      </div>

      {/* Parameters */}
      <div className="mb-3">
        <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Parameters</div>
        <div className="grid grid-cols-2 gap-1">
          {stage.parameters.map(p => (
            <div key={p.name} className={cn(
              'flex items-center justify-between px-2 py-1 rounded text-[10px]',
              p.critical ? 'bg-red-500/5 border border-red-500/10' : 'bg-zinc-800/30'
            )}>
              <span className="text-zinc-400">{p.name}</span>
              <span className="font-mono text-zinc-200">{p.setpoint} {p.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Material I/O */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Inputs ↓</div>
          {stage.inputs.map(m => (
            <div key={m.name} className="text-[10px] text-zinc-300 flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5 text-emerald-500" />
              {m.name}: {m.quantity} {m.unit}
            </div>
          ))}
        </div>
        <div>
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Outputs →</div>
          {stage.outputs.map(m => (
            <div key={m.name} className="text-[10px] text-zinc-300 flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5 text-blue-500" />
              {m.name}: {m.quantity} {m.unit}
            </div>
          ))}
        </div>
      </div>

      {/* QC Gate */}
      {stage.qcGate && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
          <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold mb-1">
            <FlaskConical className="w-3 h-3" />
            {stage.qcGate.name}
          </div>
          {stage.qcGate.criteria.map((c, i) => (
            <div key={i} className="text-[9px] text-zinc-400 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-zinc-600" /> {c}
            </div>
          ))}
          <div className="text-[9px] text-zinc-500 mt-1">Historical pass rate: {stage.qcGate.passRate}%</div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      'bg-zinc-800/30 rounded px-2 py-1 border',
      highlight ? 'border-amber-500/20' : 'border-zinc-800/50'
    )}>
      <div className="text-zinc-500 text-[8px] uppercase">{label}</div>
      <div className={cn('font-medium', highlight ? 'text-amber-400' : 'text-zinc-200')}>{value}</div>
    </div>
  );
}

// ============================================================
// MAIN RENDERER
// ============================================================

export function ProcessFlowSVG() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Layout calculation — arrange stages by zone in swim lanes
  const layout = useMemo(() => {
    const laneHeight = LAYOUT.stageHeight + LAYOUT.stageGapY * 2 + LAYOUT.lanePaddingY * 2;
    const totalHeight = LAYOUT.headerHeight + laneHeight * ZONE_ORDER.length + 40;

    // Find max stages in any zone
    const maxStages = Math.max(...ZONE_ORDER.map(z => getStagesByZone(z).length));
    const totalWidth = LAYOUT.lanePaddingX * 2 + maxStages * (LAYOUT.stageWidth + LAYOUT.stageGapX);

    const stagePositions: Record<string, { x: number; y: number }> = {};
    const lanePositions: Record<ZoneType, { x: number; y: number; width: number; height: number }> = {} as any;

    ZONE_ORDER.forEach((zone, zoneIndex) => {
      const zoneStages = getStagesByZone(zone);
      const laneY = LAYOUT.headerHeight + zoneIndex * laneHeight + LAYOUT.stageGapY;
      const laneX = LAYOUT.lanePaddingX;

      lanePositions[zone] = {
        x: laneX,
        y: laneY,
        width: totalWidth - LAYOUT.lanePaddingX * 2,
        height: laneHeight - LAYOUT.stageGapY,
      };

      zoneStages.forEach((stage, stageIndex) => {
        stagePositions[stage.id] = {
          x: laneX + LAYOUT.lanePaddingX + stageIndex * (LAYOUT.stageWidth + LAYOUT.stageGapX),
          y: laneY + LAYOUT.lanePaddingY,
        };
      });
    });

    return { stagePositions, lanePositions, totalWidth, totalHeight };
  }, []);

  const selected = selectedStage ? processStages.find(s => s.id === selectedStage) : null;

  // Simulate active batches (2-3 random stages)
  const activeBatchStages = useMemo(() => {
    return ['usp-prod', 'dsp-harvest', 'frm-mixing'];
  }, []);

  return (
    <div className="space-y-4">
      {/* KPI Header */}
      <ProcessKPI stages={processStages} />

      {/* SVG Flow */}
      <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}
          className="w-full"
          style={{ minWidth: '900px', minHeight: `${layout.totalHeight}px`, maxHeight: `${layout.totalHeight + 100}px` }}
        >
          <defs>
            <pattern id="flow-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#141418" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width={layout.totalWidth} height={layout.totalHeight} fill="url(#flow-grid)" />

          {/* Title */}
          <text x="16" y="20" fill="#71717a" fontSize="11" fontWeight="bold" fontFamily="system-ui">
            Bt Biopesticide — End-to-End Process Flow
          </text>
          <text x="16" y="34" fill="#52525b" fontSize="8" fontFamily="monospace">
            ISA-88 Batch Process • INSEBT Facility • 500m²
          </text>

          {/* Zone lanes */}
          {ZONE_ORDER.map(zone => {
            const lane = layout.lanePositions[zone];
            return (
              <SwimLane
                key={zone}
                zone={zone}
                x={lane.x} y={lane.y}
                width={lane.width} height={lane.height}
              />
            );
          })}

          {/* Flow connections */}
          {materialFlows.map((flow, i) => {
            const fromPos = layout.stagePositions[flow.from];
            const toPos = layout.stagePositions[flow.to];
            if (!fromPos || !toPos) return null;

            const active = activeBatchStages.includes(flow.from);

            return (
              <FlowArrow
                key={i}
                fromX={fromPos.x + LAYOUT.stageWidth}
                fromY={fromPos.y + LAYOUT.stageHeight / 2}
                toX={toPos.x}
                toY={toPos.y + LAYOUT.stageHeight / 2}
                material={flow.material}
                active={active}
                method={flow.method}
              />
            );
          })}

          {/* Stage cards */}
          {processStages.map(stage => {
            const pos = layout.stagePositions[stage.id];
            return (
              <StageCard
                key={stage.id}
                stage={stage}
                x={pos.x} y={pos.y}
                isSelected={selectedStage === stage.id}
                onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                hasActiveBatch={activeBatchStages.includes(stage.id)}
                batchCount={activeBatchStages.includes(stage.id) ? 1 : 0}
              />
            );
          })}
        </svg>
      </div>

      {/* Selected stage detail */}
      {selected && <StageDetail stage={selected} onClose={() => setSelectedStage(null)} />}
    </div>
  );
}
