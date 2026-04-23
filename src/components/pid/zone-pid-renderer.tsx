'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { ALL_SYMBOLS, PIPING_LINES } from '@/lib/pid-symbols';
import type { PIDEquipment, PIDInstrument, PIDControlLoop, PIDConnection } from '@/types/pid';
import type {
  ZonePIDData,
  EquipmentLiveData,
  InstrumentLiveData,
  ValveLiveData,
  PipeLiveData,
  AlarmSeverity,
} from '@/types/pid-zone';
import { cn } from '@/lib/utils';

// ============================================================
// ALARM COLORS
// ============================================================

const ALARM_COLORS: Record<AlarmSeverity, { bg: string; border: string; text: string }> = {
  critical: { bg: '#dc2626', border: '#ef4444', text: '#fecaca' },
  warning: { bg: '#d97706', border: '#f59e0b', text: '#fef3c7' },
  info: { bg: '#2563eb', border: '#3b82f6', text: '#bfdbfe' },
  normal: { bg: '#0f0f0f', border: '#6d28d9', text: '#c4b5fd' },
};

const EQUIPMENT_STATUS_COLORS: Record<string, string> = {
  running: '#10b981',
  idle: '#f59e0b',
  maintenance: '#f97316',
  offline: '#6b7280',
  cleaning: '#8b5cf6',
};

// ============================================================
// PROPS
// ============================================================

interface ZonePIDRendererProps {
  zone: ZonePIDData;
  selectedId?: string | null;
  onSelect?: (type: string, id: string) => void;
  showInstruments?: boolean;
  showConnections?: boolean;
  showLabels?: boolean;
  showFlowAnimation?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

function getEquipmentStatus(equipmentId: string, statusData: EquipmentLiveData[]): EquipmentLiveData | undefined {
  return statusData.find(s => s.equipmentId === equipmentId);
}

function getInstrumentValue(instrumentId: string, values: InstrumentLiveData[]): InstrumentLiveData | undefined {
  return values.find(v => v.instrumentId === instrumentId);
}

function getPipeFlow(connectionId: string, pipeData: PipeLiveData[]): PipeLiveData | undefined {
  return pipeData.find(p => p.connectionId === connectionId);
}

function getLineStyle(lineType: string) {
  return PIPING_LINES.find(l => l.id === lineType) || { id: lineType, name: lineType, style: 'solid', color: '#a1a1aa', width: 2 };
}

function formatValue(value: number, unit: string): string {
  if (unit === '%' || unit === 'rpm') return `${Math.round(value)}${unit}`;
  if (value >= 100) return `${Math.round(value)} ${unit}`;
  return `${value.toFixed(1)} ${unit}`;
}

// ============================================================
// SPARKLINE COMPONENT
// ============================================================

function Sparkline({ data, width = 40, height = 12, color = '#8b5cf6' }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block align-middle ml-1">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.7"
      />
    </svg>
  );
}

// ============================================================
// EQUIPMENT SYMBOL RENDERER
// ============================================================

function EquipmentSymbol({ eq, status, isSelected, onClick }: {
  eq: PIDEquipment;
  status?: EquipmentLiveData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColor = status ? EQUIPMENT_STATUS_COLORS[status.status] : '#3f3f46';
  const borderColor = isSelected ? '#a78bfa' : statusColor;

  const renderSymbolBody = () => {
    switch (eq.symbolId) {
      case 'bioreactor':
        return (
          <>
            {/* Vessel body */}
            <rect x={eq.x + 8} y={eq.y + 12} width={eq.width - 16} height={eq.height - 30} rx="6" fill="none" stroke="#52525b" strokeWidth="1.5" />
            {/* Agitator shaft */}
            <line x1={eq.x + eq.width / 2} y1={eq.y + 2} x2={eq.x + eq.width / 2} y2={eq.y + 12} stroke="#52525b" strokeWidth="1.5" />
            {/* Impeller 1 */}
            <line x1={eq.x + eq.width / 2 - 10} y1={eq.y + eq.height * 0.4} x2={eq.x + eq.width / 2 + 10} y2={eq.y + eq.height * 0.4} stroke="#52525b" strokeWidth="1" />
            {/* Impeller 2 */}
            <line x1={eq.x + eq.width / 2 - 8} y1={eq.y + eq.height * 0.55} x2={eq.x + eq.width / 2 + 8} y2={eq.y + eq.height * 0.55} stroke="#52525b" strokeWidth="1" />
            {/* Bottom curve */}
            <path d={`M${eq.x + 8},${eq.y + eq.height - 18} Q${eq.x + eq.width / 2},${eq.y + eq.height - 8} ${eq.x + eq.width - 8},${eq.y + eq.height - 18}`} fill="none" stroke="#52525b" strokeWidth="1" />
          </>
        );

      case 'tank-vertical':
      case 'mixing-tank':
        return (
          <>
            <rect x={eq.x + 6} y={eq.y + 6} width={eq.width - 12} height={eq.height - 12} rx="4" fill="none" stroke="#52525b" strokeWidth="1" />
            {eq.symbolId === 'mixing-tank' && (
              <>
                <line x1={eq.x + eq.width / 2} y1={eq.y + 2} x2={eq.x + eq.width / 2} y2={eq.y + 10} stroke="#52525b" strokeWidth="1" />
                <line x1={eq.x + eq.width / 2 - 6} y1={eq.y + eq.height * 0.5} x2={eq.x + eq.width / 2 + 6} y2={eq.y + eq.height * 0.5} stroke="#52525b" strokeWidth="1" />
              </>
            )}
            {/* Level indicator (if live data) */}
            {status && (
              <rect
                x={eq.x + 7}
                y={eq.y + 7 + (eq.height - 14) * (1 - (status.efficiency || 50) / 100)}
                width={eq.width - 14}
                height={(eq.height - 14) * (status.efficiency || 50) / 100}
                rx="3"
                fill="#3b82f6"
                fillOpacity={0.15}
              />
            )}
          </>
        );

      case 'pump-centrifugal':
      case 'pump-peristaltic':
        return (
          <>
            <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height / 2} r={Math.min(eq.width, eq.height) / 3} fill="none" stroke="#52525b" strokeWidth="1.5" />
            {eq.symbolId === 'pump-centrifugal' && (
              <path d={`M${eq.x + eq.width / 2 - 5},${eq.y + eq.height / 2} L${eq.x + eq.width / 2 + 8},${eq.y + eq.height / 2 - 5} L${eq.x + eq.width / 2 + 8},${eq.y + eq.height / 2 + 5} Z`} fill="#52525b" fillOpacity={0.3} stroke="#52525b" strokeWidth="0.5" />
            )}
          </>
        );

      case 'heat-exchanger':
        return (
          <>
            <rect x={eq.x + 4} y={eq.y + 4} width={eq.width - 8} height={eq.height - 8} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            {[0.25, 0.4, 0.55, 0.7].map(pct => (
              <line key={pct} x1={eq.x + 4} y1={eq.y + eq.height * pct} x2={eq.x + eq.width - 4} y2={eq.y + eq.height * pct} stroke="#52525b" strokeWidth="0.5" opacity={0.5} />
            ))}
          </>
        );

      case 'centrifuge':
        return (
          <>
            <path d={`M${eq.x + 10},${eq.y + eq.height / 2} L${eq.x + 20},${eq.y + 10} L${eq.x + eq.width - 10},${eq.y + 10} L${eq.x + eq.width - 10},${eq.y + eq.height - 10} L${eq.x + 20},${eq.y + eq.height - 10} Z`} fill="none" stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + 20} y1={eq.y + 10} x2={eq.x + 20} y2={eq.y + eq.height - 10} stroke="#52525b" strokeWidth="0.5" opacity={0.5} />
          </>
        );

      case 'filter':
        return (
          <>
            <rect x={eq.x + 5} y={eq.y + 5} width={eq.width - 10} height={eq.height - 10} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            {[0.25, 0.4, 0.55, 0.7].map(pct => (
              <line key={pct} x1={eq.x + 5} y1={eq.y + eq.height * pct} x2={eq.x + eq.width - 5} y2={eq.y + eq.height * pct} stroke="#52525b" strokeWidth="0.5" opacity={0.5} />
            ))}
          </>
        );

      case 'boiler':
        return (
          <>
            <rect x={eq.x + 5} y={eq.y + eq.height * 0.3} width={eq.width - 10} height={eq.height * 0.6} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <path d={`M${eq.x + 10},${eq.y + eq.height * 0.3} Q${eq.x + eq.width / 2},${eq.y + 5} ${eq.x + eq.width - 10},${eq.y + eq.height * 0.3}`} fill="none" stroke="#52525b" strokeWidth="1" />
            {/* Steam lines */}
            {status?.status === 'running' && (
              <>
                <path d={`M${eq.x + eq.width * 0.35},${eq.y + 3} Q${eq.x + eq.width * 0.3},${eq.y - 5} ${eq.x + eq.width * 0.35},${eq.y - 10}`} fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity={0.4} />
                <path d={`M${eq.x + eq.width * 0.55},${eq.y + 1} Q${eq.x + eq.width * 0.6},${eq.y - 7} ${eq.x + eq.width * 0.55},${eq.y - 12}`} fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity={0.4} />
              </>
            )}
          </>
        );

      case 'chiller':
        return (
          <>
            <rect x={eq.x + 4} y={eq.y + 4} width={eq.width - 8} height={eq.height - 8} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <polygon points={`${eq.x + eq.width * 0.3},${eq.y + eq.height * 0.3} ${eq.x + eq.width * 0.5},${eq.y + eq.height * 0.65} ${eq.x + eq.width * 0.7},${eq.y + eq.height * 0.3}`} fill="none" stroke="#3b82f6" strokeWidth="1" />
          </>
        );

      case 'compressor':
        return (
          <>
            <rect x={eq.x + 5} y={eq.y + eq.height * 0.35} width={eq.width - 10} height={eq.height * 0.4} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + eq.width / 2} y1={eq.y + eq.height * 0.2} x2={eq.x + eq.width / 2} y2={eq.y + eq.height * 0.35} stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + eq.width / 2 - 5} y1={eq.y + eq.height * 0.2} x2={eq.x + eq.width / 2 + 5} y2={eq.y + eq.height * 0.2} stroke="#52525b" strokeWidth="1" />
          </>
        );

      case 'water-purification':
        return (
          <>
            <rect x={eq.x + 4} y={eq.y + 4} width={eq.width - 8} height={eq.height - 8} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + 10} y1={eq.y + eq.height * 0.4} x2={eq.x + eq.width - 10} y2={eq.y + eq.height * 0.4} stroke="#52525b" strokeWidth="0.5" />
            <line x1={eq.x + 10} y1={eq.y + eq.height * 0.6} x2={eq.x + eq.width - 10} y2={eq.y + eq.height * 0.6} stroke="#52525b" strokeWidth="0.5" />
          </>
        );

      case 'spray-dryer':
        return (
          <>
            <path d={`M${eq.x + 10},${eq.y + 5} L${eq.x + eq.width - 10},${eq.y + 5} Q${eq.x + eq.width - 5},${eq.y + eq.height / 2} ${eq.x + eq.width - 10},${eq.y + eq.height - 5} L${eq.x + 10},${eq.y + eq.height - 5} Q${eq.x + 5},${eq.y + eq.height / 2} ${eq.x + 10},${eq.y + 5} Z`} fill="none" stroke="#52525b" strokeWidth="1" />
          </>
        );

      case 'cold-storage':
        return (
          <>
            <rect x={eq.x + 3} y={eq.y + 3} width={eq.width - 6} height={eq.height - 6} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + 3} y1={eq.y + eq.height * 0.45} x2={eq.x + eq.width - 3} y2={eq.y + eq.height * 0.45} stroke="#3b82f6" strokeWidth="0.5" opacity={0.4} />
            {/* Snowflake */}
            <text x={eq.x + eq.width / 2} y={eq.y + eq.height / 2 + 3} textAnchor="middle" fill="#3b82f6" fontSize="8" opacity={0.5}>❄</text>
          </>
        );

      case 'filling-machine':
        return (
          <>
            <rect x={eq.x + 5} y={eq.y + 10} width={eq.width * 0.35} height={eq.height - 20} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <rect x={eq.x + eq.width * 0.5} y={eq.y + 8} width={eq.width * 0.4} height={eq.height - 16} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + eq.width * 0.4} y1={eq.y + eq.height / 2} x2={eq.x + eq.width * 0.5} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1" />
          </>
        );

      // Valves
      case 'valve-gate':
      case 'valve-ball':
      case 'valve-check':
      case 'valve-control':
      case 'valve-safety-relief':
      case 'valve-pneumatic':
        return (
          <>
            {eq.symbolId === 'valve-gate' && (
              <path d={`M${eq.x + 5},${eq.y + eq.height / 2} L${eq.x + eq.width * 0.35},${eq.y + eq.height / 2} L${eq.x + eq.width / 2},${eq.y + 10} L${eq.x + eq.width * 0.65},${eq.y + eq.height / 2} L${eq.x + eq.width - 5},${eq.y + eq.height / 2}`} fill="none" stroke="#52525b" strokeWidth="1.5" />
            )}
            {eq.symbolId === 'valve-ball' && (
              <>
                <line x1={eq.x + 5} y1={eq.y + eq.height / 2} x2={eq.x + 15} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
                <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height / 2} r={Math.min(eq.width, eq.height) / 4} fill="none" stroke="#52525b" strokeWidth="1.5" />
                <line x1={eq.x + eq.width - 15} y1={eq.y + eq.height / 2} x2={eq.x + eq.width - 5} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
              </>
            )}
            {eq.symbolId === 'valve-check' && (
              <>
                <line x1={eq.x + 5} y1={eq.y + eq.height / 2} x2={eq.x + 15} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
                <polygon points={`${eq.x + 15},${eq.y + eq.height / 2} ${eq.x + eq.width / 2},${eq.y + 10} ${eq.x + eq.width / 2},${eq.y + eq.height - 10}`} fill="none" stroke="#52525b" strokeWidth="1" />
                <line x1={eq.x + eq.width / 2} y1={eq.y + eq.height / 2} x2={eq.x + eq.width - 5} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
              </>
            )}
            {(eq.symbolId === 'valve-control' || eq.symbolId === 'valve-pneumatic') && (
              <>
                <path d={`M${eq.x + 5},${eq.y + eq.height * 0.55} L${eq.x + eq.width * 0.35},${eq.y + eq.height * 0.55} L${eq.x + eq.width / 2},${eq.y + eq.height * 0.35} L${eq.x + eq.width * 0.65},${eq.y + eq.height * 0.55} L${eq.x + eq.width - 5},${eq.y + eq.height * 0.55}`} fill="none" stroke="#52525b" strokeWidth="1.5" />
                {/* Actuator */}
                <line x1={eq.x + eq.width / 2} y1={eq.y + eq.height * 0.35} x2={eq.x + eq.width / 2} y2={eq.y + 5} stroke="#52525b" strokeWidth="1" />
                <rect x={eq.x + eq.width / 2 - 8} y={eq.y + 2} width={16} height={6} rx="1" fill="none" stroke="#52525b" strokeWidth="1" />
                {eq.symbolId === 'valve-pneumatic' && (
                  <circle cx={eq.x + eq.width / 2} cy={eq.y + 5} r={3} fill="none" stroke="#a855f7" strokeWidth="0.5" />
                )}
              </>
            )}
            {eq.symbolId === 'valve-safety-relief' && (
              <>
                <line x1={eq.x + 5} y1={eq.y + eq.height * 0.7} x2={eq.x + eq.width * 0.35} y2={eq.y + eq.height * 0.7} stroke="#52525b" strokeWidth="1.5" />
                <polygon points={`${eq.x + eq.width * 0.35},${eq.y + eq.height * 0.7} ${eq.x + eq.width / 2},${eq.y + 15} ${eq.x + eq.width * 0.65},${eq.y + eq.height * 0.7}`} fill="none" stroke="#ef4444" strokeWidth="1.5" />
                <line x1={eq.x + eq.width * 0.65} y1={eq.y + eq.height * 0.7} x2={eq.x + eq.width - 5} y2={eq.y + eq.height * 0.7} stroke="#52525b" strokeWidth="1.5" />
                <line x1={eq.x + eq.width / 2} y1={eq.y + 15} x2={eq.x + eq.width / 2} y2={eq.y + 2} stroke="#ef4444" strokeWidth="1" />
              </>
            )}
          </>
        );

      default:
        return (
          <rect x={eq.x + 4} y={eq.y + 4} width={eq.width - 8} height={eq.height - 8} rx="3" fill="none" stroke="#52525b" strokeWidth="1" />
        );
    }
  };

  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Selection highlight */}
      <rect
        x={eq.x - 4} y={eq.y - 4}
        width={eq.width + 8} height={eq.height + 8}
        rx="6"
        fill={isSelected ? '#6d28d9' : 'transparent'}
        fillOpacity={isSelected ? 0.12 : 0}
        stroke={isSelected ? '#8b5cf6' : 'transparent'}
        strokeWidth="1"
      />
      {/* Equipment body */}
      <rect
        x={eq.x} y={eq.y}
        width={eq.width} height={eq.height}
        rx="4"
        fill="#0f0f0f"
        stroke={borderColor}
        strokeWidth={isSelected ? 2 : 1.5}
      />
      {/* Symbol-specific drawing */}
      {renderSymbolBody()}
      {/* Tag label */}
      <text x={eq.x + 4} y={eq.y - 5} fill="#a78bfa" fontSize="10" fontWeight="bold" fontFamily="monospace">
        {eq.tag}
      </text>
      {/* Status dot */}
      {status && (
        <circle
          cx={eq.x + eq.width - 4}
          cy={eq.y + 4}
          r="3"
          fill={statusColor}
          stroke="#0f0f0f"
          strokeWidth="1"
        />
      )}
    </g>
  );
}

// ============================================================
// INSTRUMENT BUBBLE RENDERER
// ============================================================

function InstrumentBubble({ inst, value, isSelected, onClick }: {
  inst: PIDInstrument;
  value?: InstrumentLiveData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const alarmColors = value ? ALARM_COLORS[value.alarmState] : ALARM_COLORS.normal;
  const isControlRoom = inst.function.includes('Controller') || inst.function.includes('Control');

  return (
    <g onClick={onClick} className="cursor-pointer">
      {/* Outer circle — ISA-5.1 field instrument */}
      <circle
        cx={inst.x} cy={inst.y}
        r="16"
        fill="#0f0f0f"
        stroke={isSelected ? '#a78bfa' : alarmColors.border}
        strokeWidth={isSelected ? 2 : 1.5}
      />
      {/* Inner circle — control room (double circle = controller) */}
      {isControlRoom && (
        <circle
          cx={inst.x} cy={inst.y}
          r="12"
          fill="none"
          stroke={isSelected ? '#a78bfa' : '#52525b'}
          strokeWidth="0.5"
        />
      )}
      {/* Alarm flash */}
      {value?.alarmState === 'critical' && (
        <circle
          cx={inst.x} cy={inst.y}
          r="18"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          opacity={0.6}
          className="animate-pulse"
        />
      )}
      {/* Tag text */}
      <text x={inst.x} y={inst.y + 2} textAnchor="middle" fill={alarmColors.text} fontSize="6" fontWeight="bold" fontFamily="monospace">
        {inst.tag}
      </text>
      {/* Live value */}
      {value && (
        <text x={inst.x} y={inst.y + 30} textAnchor="middle" fill={alarmColors.border} fontSize="7" fontFamily="monospace">
          {formatValue(value.value, value.unit)}
          {value.trend && <Sparkline data={value.trend} color={alarmColors.border} />}
        </text>
      )}
      {/* Signal line to equipment */}
      {inst.mountedOn && (
        <line
          x1={inst.x} y1={inst.y + 16}
          x2={inst.x} y2={inst.y + 24}
          stroke="#f97316"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      )}
    </g>
  );
}

// ============================================================
// PIPE CONNECTION RENDERER
// ============================================================

function PipeConnection({ conn, flowData, showAnimation, equipment }: {
  conn: PIDConnection;
  flowData?: PipeLiveData;
  showAnimation: boolean;
  equipment: PIDEquipment[];
}) {
  const lineStyle = getLineStyle(conn.lineType);
  const dashArray = lineStyle.style === 'dashed' ? '8,4' : lineStyle.style === 'dotted' ? '2,4' : undefined;

  // Build path from waypoints
  const allPoints = conn.points || [];
  if (allPoints.length < 2) return null;

  const pathD = allPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <g>
      {/* Pipe line */}
      <path
        d={pathD}
        fill="none"
        stroke={lineStyle.color}
        strokeWidth={lineStyle.width}
        strokeDasharray={dashArray}
        opacity={flowData?.flowing ? 0.9 : 0.4}
      />
      {/* Flow animation */}
      {showAnimation && flowData?.flowing && flowData.animated && (
        <path
          d={pathD}
          fill="none"
          stroke={lineStyle.color}
          strokeWidth={lineStyle.width * 0.5}
          strokeDasharray="4,12"
          opacity={0.6}
        >
          <animate
            attributeName="stroke-dashoffset"
            values="16;0"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      )}
      {/* Diameter label (midpoint) */}
      {conn.diameter && allPoints.length >= 2 && (
        <text
          x={(allPoints[0].x + allPoints[allPoints.length - 1].x) / 2}
          y={(allPoints[0].y + allPoints[allPoints.length - 1].y) / 2 - 6}
          textAnchor="middle"
          fill="#52525b"
          fontSize="7"
          fontFamily="monospace"
        >
          {conn.diameter}
        </text>
      )}
      {/* Flow rate label */}
      {flowData?.flowRate && allPoints.length >= 2 && (
        <text
          x={(allPoints[0].x + allPoints[allPoints.length - 1].x) / 2}
          y={(allPoints[0].y + allPoints[allPoints.length - 1].y) / 2 + 8}
          textAnchor="middle"
          fill={lineStyle.color}
          fontSize="7"
          fontFamily="monospace"
          opacity={0.7}
        >
          {flowData.flowRate.toFixed(1)} L/min
        </text>
      )}
    </g>
  );
}

// ============================================================
// TITLE BLOCK (ISA-5.1)
// ============================================================

function TitleBlock({ zone }: { zone: ZonePIDData }) {
  return (
    <g transform={`translate(${zone.viewBox.width - 220}, ${zone.viewBox.height - 60})`}>
      <rect x={0} y={0} width={210} height={50} rx="2" fill="#0f0f0f" stroke="#27272a" strokeWidth="1" />
      <line x1={0} y1={15} x2={210} y2={15} stroke="#27272a" strokeWidth="0.5" />
      <line x1={0} y1={32} x2={210} y2={32} stroke="#27272a" strokeWidth="0.5" />
      <line x1={70} y1={15} x2={70} y2={50} stroke="#27272a" strokeWidth="0.5" />
      <line x1={140} y1={15} x2={140} y2={50} stroke="#27272a" strokeWidth="0.5" />

      {/* Drawing title */}
      <text x={6} y={11} fill="#71717a" fontSize="7" fontWeight="bold" fontFamily="monospace">
        {zone.drawingNumber}
      </text>
      <text x={76} y={11} fill="#52525b" fontSize="6" fontFamily="monospace">
        {zone.revision}
      </text>
      <text x={146} y={11} fill="#52525b" fontSize="6" fontFamily="monospace">
        NTS
      </text>

      {/* Zone info */}
      <text x={6} y={26} fill="#a78bfa" fontSize="8" fontWeight="bold" fontFamily="system-ui">
        {zone.zoneName}
      </text>
      <text x={6} y={44} fill="#52525b" fontSize="6" fontFamily="monospace">
        Pure Advance ERP
      </text>
      <text x={76} y={44} fill="#52525b" fontSize="6" fontFamily="monospace">
        {zone.isoClass || '—'}
      </text>
      <text x={146} y={44} fill="#52525b" fontSize="6" fontFamily="monospace">
        Hermes
      </text>
    </g>
  );
}

// ============================================================
// MAIN RENDERER
// ============================================================

export function ZonePIDRenderer({
  zone,
  selectedId,
  onSelect,
  showInstruments = true,
  showConnections = true,
  showLabels = true,
  showFlowAnimation = true,
}: ZonePIDRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
  }, []);

  // Look up equipment symbol
  const getSymbol = (symbolId: string) => ALL_SYMBOLS.find(s => s.id === symbolId);

  return (
    <div className="relative bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-zinc-900/90 backdrop-blur rounded-lg border border-zinc-700 p-1">
        <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors">+</button>
        <span className="text-xs text-zinc-500 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.5, z * 0.8))} className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors">−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors border-l border-zinc-700">Reset</button>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`${zone.viewBox.x} ${zone.viewBox.y} ${zone.viewBox.width} ${zone.viewBox.height}`}
        className="w-full"
        style={{ minHeight: '400px', maxHeight: '600px', cursor: 'grab' }}
        onWheel={handleWheel}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id={`pid-grid-${zone.zoneId}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a1f" strokeWidth="0.5" />
          </pattern>
          {/* Major grid */}
          <pattern id={`pid-grid-major-${zone.zoneId}`} width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill={`url(#pid-grid-${zone.zoneId})`} />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#222228" strokeWidth="0.8" />
          </pattern>
          {/* Flow animation marker */}
          <marker id={`flow-arrow-${zone.zoneId}`} markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#8b5cf6" opacity="0.5" />
          </marker>
        </defs>

        {/* Background grid */}
        <rect
          width={zone.viewBox.width}
          height={zone.viewBox.height}
          fill={`url(#pid-grid-major-${zone.zoneId})`}
          rx="0"
        />

        {/* Scale transform */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Pipe connections */}
          {showConnections && zone.connections.map(conn => (
            <PipeConnection
              key={conn.id}
              conn={conn}
              flowData={zone.pipeFlow.find(p => p.connectionId === conn.id)}
              showAnimation={showFlowAnimation}
              equipment={zone.equipment}
            />
          ))}

          {/* Equipment */}
          {zone.equipment.map(eq => {
            const symbol = getSymbol(eq.symbolId);
            const status = zone.equipmentStatus.find(s => s.equipmentId === eq.id);
            return (
              <EquipmentSymbol
                key={eq.id}
                eq={eq}
                status={status}
                isSelected={selectedId === eq.id}
                onClick={() => onSelect?.('equipment', eq.id)}
              />
            );
          })}

          {/* Name labels */}
          {showLabels && zone.equipment.map(eq => (
            <text
              key={`label-${eq.id}`}
              x={eq.x + eq.width / 2}
              y={eq.y + eq.height + 12}
              textAnchor="middle"
              fill="#52525b"
              fontSize="7"
              fontFamily="system-ui"
            >
              {eq.name.length > 20 ? eq.name.slice(0, 18) + '…' : eq.name}
            </text>
          ))}

          {/* Instruments */}
          {showInstruments && zone.instruments.map(inst => (
            <InstrumentBubble
              key={inst.id}
              inst={inst}
              value={zone.instrumentValues.find(v => v.instrumentId === inst.id)}
              isSelected={selectedId === inst.id}
              onClick={() => onSelect?.('instrument', inst.id)}
            />
          ))}

          {/* Title Block */}
          <TitleBlock zone={zone} />
        </g>
      </svg>
    </div>
  );
}
