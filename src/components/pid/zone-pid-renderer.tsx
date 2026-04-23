'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
// VIEWBOX ANIMATION
// ============================================================

function animateViewBox(
  svgRef: React.RefObject<SVGSVGElement | null>,
  targetVB: { x: number; y: number; width: number; height: number },
  duration = 400
) {
  const svg = svgRef.current;
  if (!svg) return;

  const currentVB = svg.viewBox.baseVal;
  const start = { x: currentVB.x, y: currentVB.y, width: currentVB.width, height: currentVB.height };
  const startTime = performance.now();

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    currentVB.x = start.x + (targetVB.x - start.x) * ease;
    currentVB.y = start.y + (targetVB.y - start.y) * ease;
    currentVB.width = start.width + (targetVB.width - start.width) * ease;
    currentVB.height = start.height + (targetVB.height - start.height) * ease;

    if (t < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

// ============================================================
// SPARKLINE
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
      <polyline points={points} fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

// ============================================================
// VALVE INDICATOR ON PIPES
// ============================================================

function ValveIndicator({ valve, conn }: { valve: ValveLiveData; conn: PIDConnection }) {
  if (!conn.points || conn.points.length < 2) return null;
  const mx = conn.points[Math.floor(conn.points.length / 2)];
  const my = conn.points[Math.floor(conn.points.length / 2)];

  const positionColor = valve.position === 'open' ? '#10b981' : valve.position === 'closed' ? '#ef4444' : '#f59e0b';

  return (
    <g>
      {/* Valve body */}
      <polygon
        points={`${mx.x},${my.y - 6} ${mx.x - 5},${my.y} ${mx.x},${my.y + 6} ${mx.x + 5},${my.y}`}
        fill="#0f0f0f"
        stroke={positionColor}
        strokeWidth="1.5"
      />
      {/* Position indicator */}
      <circle cx={mx.x} cy={my.y} r="2" fill={positionColor} />
      {/* Mode badge */}
      {valve.mode === 'auto' && (
        <text x={mx.x + 8} y={my.y - 4} fill="#6b7280" fontSize="5" fontFamily="monospace">A</text>
      )}
      {/* % open */}
      <text x={mx.x + 8} y={my.y + 6} fill={positionColor} fontSize="6" fontFamily="monospace">
        {valve.percentOpen}%
      </text>
    </g>
  );
}

// ============================================================
// INTER-ZONE FLOW REFERENCE
// ============================================================

function InterZoneArrow({ conn, zone }: { conn: PIDConnection; zone: ZonePIDData }) {
  if (!conn.points || conn.points.length < 2) return null;
  const lastPt = conn.points[conn.points.length - 1];
  const isOffRight = lastPt.x >= zone.viewBox.width - 20;
  const isOffLeft = lastPt.x <= 20;
  const isOffBottom = lastPt.y >= zone.viewBox.height - 20;
  const isOffTop = lastPt.y <= 20;

  if (!isOffRight && !isOffLeft && !isOffBottom && !isOffTop) return null;

  const label = conn.label || conn.diameter || '';
  let arrowAngle = 0;
  if (isOffRight) arrowAngle = 0;
  else if (isOffLeft) arrowAngle = 180;
  else if (isOffBottom) arrowAngle = 90;
  else arrowAngle = -90;

  return (
    <g transform={`translate(${lastPt.x}, ${lastPt.y})`}>
      <polygon
        points="0,-4 8,0 0,4"
        fill="#8b5cf6"
        opacity="0.6"
        transform={`rotate(${arrowAngle})`}
      />
      <text
        x={isOffRight ? 12 : isOffLeft ? -12 : 0}
        y={isOffBottom ? 12 : isOffTop ? -8 : 4}
        textAnchor={isOffRight ? 'start' : isOffLeft ? 'end' : 'middle'}
        fill="#8b5cf6"
        fontSize="6"
        fontFamily="monospace"
        opacity="0.7"
      >
        {label}
      </text>
    </g>
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
            <rect x={eq.x + 8} y={eq.y + 12} width={eq.width - 16} height={eq.height - 30} rx="6" fill="none" stroke="#52525b" strokeWidth="1.5" />
            <line x1={eq.x + eq.width / 2} y1={eq.y + 2} x2={eq.x + eq.width / 2} y2={eq.y + 12} stroke="#52525b" strokeWidth="1.5" />
            <line x1={eq.x + eq.width / 2 - 10} y1={eq.y + eq.height * 0.4} x2={eq.x + eq.width / 2 + 10} y2={eq.y + eq.height * 0.4} stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + eq.width / 2 - 8} y1={eq.y + eq.height * 0.55} x2={eq.x + eq.width / 2 + 8} y2={eq.y + eq.height * 0.55} stroke="#52525b" strokeWidth="1" />
            <path d={`M${eq.x + 8},${eq.y + eq.height - 18} Q${eq.x + eq.width / 2},${eq.y + eq.height - 8} ${eq.x + eq.width - 8},${eq.y + eq.height - 18}`} fill="none" stroke="#52525b" strokeWidth="1" />
            {/* Running indicator — agitator spin */}
            {status?.status === 'running' && (
              <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height * 0.3} r="2" fill="#10b981" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
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
            {status?.status === 'running' && (
              <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height / 2} r="2" fill="#10b981" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.8s" repeatCount="indefinite" />
              </circle>
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
          <path d={`M${eq.x + 10},${eq.y + 5} L${eq.x + eq.width - 10},${eq.y + 5} Q${eq.x + eq.width - 5},${eq.y + eq.height / 2} ${eq.x + eq.width - 10},${eq.y + eq.height - 5} L${eq.x + 10},${eq.y + eq.height - 5} Q${eq.x + 5},${eq.y + eq.height / 2} ${eq.x + 10},${eq.y + 5} Z`} fill="none" stroke="#52525b" strokeWidth="1" />
        );

      case 'cold-storage':
        return (
          <>
            <rect x={eq.x + 3} y={eq.y + 3} width={eq.width - 6} height={eq.height - 6} rx="2" fill="none" stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + 3} y1={eq.y + eq.height * 0.45} x2={eq.x + eq.width - 3} y2={eq.y + eq.height * 0.45} stroke="#3b82f6" strokeWidth="0.5" opacity={0.4} />
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
        return (
          <path d={`M${eq.x + 5},${eq.y + eq.height / 2} L${eq.x + eq.width * 0.35},${eq.y + eq.height / 2} L${eq.x + eq.width / 2},${eq.y + 10} L${eq.x + eq.width * 0.65},${eq.y + eq.height / 2} L${eq.x + eq.width - 5},${eq.y + eq.height / 2}`} fill="none" stroke="#52525b" strokeWidth="1.5" />
        );

      case 'valve-ball':
        return (
          <>
            <line x1={eq.x + 5} y1={eq.y + eq.height / 2} x2={eq.x + 15} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
            <circle cx={eq.x + eq.width / 2} cy={eq.y + eq.height / 2} r={Math.min(eq.width, eq.height) / 4} fill="none" stroke="#52525b" strokeWidth="1.5" />
            <line x1={eq.x + eq.width - 15} y1={eq.y + eq.height / 2} x2={eq.x + eq.width - 5} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
          </>
        );

      case 'valve-check':
        return (
          <>
            <line x1={eq.x + 5} y1={eq.y + eq.height / 2} x2={eq.x + 15} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
            <polygon points={`${eq.x + 15},${eq.y + eq.height / 2} ${eq.x + eq.width / 2},${eq.y + 10} ${eq.x + eq.width / 2},${eq.y + eq.height - 10}`} fill="none" stroke="#52525b" strokeWidth="1" />
            <line x1={eq.x + eq.width / 2} y1={eq.y + eq.height / 2} x2={eq.x + eq.width - 5} y2={eq.y + eq.height / 2} stroke="#52525b" strokeWidth="1.5" />
          </>
        );

      case 'valve-control':
      case 'valve-pneumatic':
        return (
          <>
            <path d={`M${eq.x + 5},${eq.y + eq.height * 0.55} L${eq.x + eq.width * 0.35},${eq.y + eq.height * 0.55} L${eq.x + eq.width / 2},${eq.y + eq.height * 0.35} L${eq.x + eq.width * 0.65},${eq.y + eq.height * 0.55} L${eq.x + eq.width - 5},${eq.y + eq.height * 0.55}`} fill="none" stroke="#52525b" strokeWidth="1.5" />
            <line x1={eq.x + eq.width / 2} y1={eq.y + eq.height * 0.35} x2={eq.x + eq.width / 2} y2={eq.y + 5} stroke="#52525b" strokeWidth="1" />
            <rect x={eq.x + eq.width / 2 - 8} y={eq.y + 2} width={16} height={6} rx="1" fill="none" stroke="#52525b" strokeWidth="1" />
            {eq.symbolId === 'valve-pneumatic' && (
              <circle cx={eq.x + eq.width / 2} cy={eq.y + 5} r={3} fill="none" stroke="#a855f7" strokeWidth="0.5" />
            )}
          </>
        );

      case 'valve-safety-relief':
        return (
          <>
            <line x1={eq.x + 5} y1={eq.y + eq.height * 0.7} x2={eq.x + eq.width * 0.35} y2={eq.y + eq.height * 0.7} stroke="#52525b" strokeWidth="1.5" />
            <polygon points={`${eq.x + eq.width * 0.35},${eq.y + eq.height * 0.7} ${eq.x + eq.width / 2},${eq.y + 15} ${eq.x + eq.width * 0.65},${eq.y + eq.height * 0.7}`} fill="none" stroke="#ef4444" strokeWidth="1.5" />
            <line x1={eq.x + eq.width * 0.65} y1={eq.y + eq.height * 0.7} x2={eq.x + eq.width - 5} y2={eq.y + eq.height * 0.7} stroke="#52525b" strokeWidth="1.5" />
            <line x1={eq.x + eq.width / 2} y1={eq.y + 15} x2={eq.x + eq.width / 2} y2={eq.y + 2} stroke="#ef4444" strokeWidth="1" />
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
      <rect
        x={eq.x - 4} y={eq.y - 4}
        width={eq.width + 8} height={eq.height + 8}
        rx="6"
        fill={isSelected ? '#6d28d9' : 'transparent'}
        fillOpacity={isSelected ? 0.12 : 0}
        stroke={isSelected ? '#8b5cf6' : 'transparent'}
        strokeWidth="1"
      />
      <rect
        x={eq.x} y={eq.y}
        width={eq.width} height={eq.height}
        rx="4"
        fill="#0f0f0f"
        stroke={borderColor}
        strokeWidth={isSelected ? 2 : 1.5}
      />
      {renderSymbolBody()}
      <text x={eq.x + 4} y={eq.y - 5} fill="#a78bfa" fontSize="10" fontWeight="bold" fontFamily="monospace">
        {eq.tag}
      </text>
      {status && (
        <circle cx={eq.x + eq.width - 4} cy={eq.y + 4} r="3" fill={statusColor} stroke="#0f0f0f" strokeWidth="1" />
      )}
    </g>
  );
}

// ============================================================
// INSTRUMENT BUBBLE
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
      <circle cx={inst.x} cy={inst.y} r="16" fill="#0f0f0f" stroke={isSelected ? '#a78bfa' : alarmColors.border} strokeWidth={isSelected ? 2 : 1.5} />
      {isControlRoom && (
        <circle cx={inst.x} cy={inst.y} r="12" fill="none" stroke={isSelected ? '#a78bfa' : '#52525b'} strokeWidth="0.5" />
      )}
      {value?.alarmState === 'critical' && (
        <circle cx={inst.x} cy={inst.y} r="18" fill="none" stroke="#ef4444" strokeWidth="1" opacity={0.6} className="animate-pulse" />
      )}
      <text x={inst.x} y={inst.y + 2} textAnchor="middle" fill={alarmColors.text} fontSize="6" fontWeight="bold" fontFamily="monospace">
        {inst.tag}
      </text>
      {value && (
        <text x={inst.x} y={inst.y + 30} textAnchor="middle" fill={alarmColors.border} fontSize="7" fontFamily="monospace">
          {value.value.toFixed(1)} {value.unit}
        </text>
      )}
      {inst.mountedOn && (
        <line x1={inst.x} y1={inst.y + 16} x2={inst.x} y2={inst.y + 24} stroke="#f97316" strokeWidth="1" strokeDasharray="2,2" />
      )}
    </g>
  );
}

// ============================================================
// PIPE CONNECTION
// ============================================================

function PipeConnection({ conn, flowData, showAnimation, equipment }: {
  conn: PIDConnection;
  flowData?: PipeLiveData;
  showAnimation: boolean;
  equipment: PIDEquipment[];
}) {
  const lineStyle = PIPING_LINES.find(l => l.id === conn.lineType) || { id: conn.lineType, name: conn.lineType, style: 'solid', color: '#a1a1aa', width: 2 };
  const dashArray = lineStyle.style === 'dashed' ? '8,4' : lineStyle.style === 'dotted' ? '2,4' : undefined;
  const allPoints = conn.points || [];
  if (allPoints.length < 2) return null;

  const pathD = allPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <g>
      <path d={pathD} fill="none" stroke={lineStyle.color} strokeWidth={lineStyle.width} strokeDasharray={dashArray} opacity={flowData?.flowing ? 0.9 : 0.4} />
      {showAnimation && flowData?.flowing && flowData.animated && (
        <path d={pathD} fill="none" stroke={lineStyle.color} strokeWidth={lineStyle.width * 0.5} strokeDasharray="4,12" opacity={0.6}>
          <animate attributeName="stroke-dashoffset" values="16;0" dur="1s" repeatCount="indefinite" />
        </path>
      )}
      {conn.diameter && allPoints.length >= 2 && (
        <text
          x={(allPoints[0].x + allPoints[allPoints.length - 1].x) / 2}
          y={(allPoints[0].y + allPoints[allPoints.length - 1].y) / 2 - 6}
          textAnchor="middle" fill="#52525b" fontSize="7" fontFamily="monospace"
        >
          {conn.diameter}
        </text>
      )}
      {flowData?.flowRate && allPoints.length >= 2 && (
        <text
          x={(allPoints[0].x + allPoints[allPoints.length - 1].x) / 2}
          y={(allPoints[0].y + allPoints[allPoints.length - 1].y) / 2 + 8}
          textAnchor="middle" fill={lineStyle.color} fontSize="7" fontFamily="monospace" opacity={0.7}
        >
          {flowData.flowRate.toFixed(1)} L/min
        </text>
      )}
    </g>
  );
}

// ============================================================
// TITLE BLOCK
// ============================================================

function TitleBlock({ zone }: { zone: ZonePIDData }) {
  return (
    <g transform={`translate(${zone.viewBox.width - 220}, ${zone.viewBox.height - 60})`}>
      <rect x={0} y={0} width={210} height={50} rx="2" fill="#0f0f0f" stroke="#27272a" strokeWidth="1" />
      <line x1={0} y1={15} x2={210} y2={15} stroke="#27272a" strokeWidth="0.5" />
      <line x1={0} y1={32} x2={210} y2={32} stroke="#27272a" strokeWidth="0.5" />
      <line x1={70} y1={15} x2={70} y2={50} stroke="#27272a" strokeWidth="0.5" />
      <line x1={140} y1={15} x2={140} y2={50} stroke="#27272a" strokeWidth="0.5" />
      <text x={6} y={11} fill="#71717a" fontSize="7" fontWeight="bold" fontFamily="monospace">{zone.drawingNumber}</text>
      <text x={76} y={11} fill="#52525b" fontSize="6" fontFamily="monospace">{zone.revision}</text>
      <text x={146} y={11} fill="#52525b" fontSize="6" fontFamily="monospace">NTS</text>
      <text x={6} y={26} fill="#a78bfa" fontSize="8" fontWeight="bold" fontFamily="system-ui">{zone.zoneName}</text>
      <text x={6} y={44} fill="#52525b" fontSize="6" fontFamily="monospace">Pure Advance ERP</text>
      <text x={76} y={44} fill="#52525b" fontSize="6" fontFamily="monospace">{zone.isoClass || '—'}</text>
      <text x={146} y={44} fill="#52525b" fontSize="6" fontFamily="monospace">Hermes</text>
    </g>
  );
}

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
  const originalVB = useRef(zone.viewBox);

  // Reset view when zone changes
  useEffect(() => {
    originalVB.current = zone.viewBox;
    if (svgRef.current) {
      const vb = svgRef.current.viewBox.baseVal;
      vb.x = zone.viewBox.x;
      vb.y = zone.viewBox.y;
      vb.width = zone.viewBox.width;
      vb.height = zone.viewBox.height;
    }
  }, [zone.zoneId]);

  // Click-to-zoom: zoom into selected equipment
  useEffect(() => {
    if (!selectedId || !svgRef.current) return;
    const eq = zone.equipment.find(e => e.id === selectedId);
    if (!eq) return;

    // Calculate viewBox centered on equipment with padding
    const padding = 120;
    const centerX = eq.x + eq.width / 2;
    const centerY = eq.y + eq.height / 2;
    const aspect = zone.viewBox.width / zone.viewBox.height;
    const vbHeight = Math.max(eq.height + padding * 2, 200);
    const vbWidth = vbHeight * aspect;

    animateViewBox(svgRef, {
      x: centerX - vbWidth / 2,
      y: centerY - vbHeight / 2,
      width: vbWidth,
      height: vbHeight,
    });
  }, [selectedId]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
  }, []);

  const handleResetView = useCallback(() => {
    animateViewBox(svgRef, originalVB.current);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div className="relative bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-zinc-900/90 backdrop-blur rounded-lg border border-zinc-700 p-1">
        <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors">+</button>
        <span className="text-xs text-zinc-500 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.5, z * 0.8))} className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors">−</button>
        <button onClick={handleResetView} className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors border-l border-zinc-700">Reset</button>
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
          <pattern id={`pid-grid-${zone.zoneId}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a1f" strokeWidth="0.5" />
          </pattern>
          <pattern id={`pid-grid-major-${zone.zoneId}`} width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill={`url(#pid-grid-${zone.zoneId})`} />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#222228" strokeWidth="0.8" />
          </pattern>
        </defs>

        <rect width={zone.viewBox.width} height={zone.viewBox.height} fill={`url(#pid-grid-major-${zone.zoneId})`} />

        <g>
          {/* Connections */}
          {showConnections && zone.connections.map(conn => (
            <PipeConnection
              key={conn.id}
              conn={conn}
              flowData={zone.pipeFlow.find(p => p.connectionId === conn.id)}
              showAnimation={showFlowAnimation}
              equipment={zone.equipment}
            />
          ))}

          {/* Valve indicators on pipes */}
          {zone.valvePositions.map(valve => {
            const conn = zone.connections.find(c => c.id === valve.valveId);
            if (!conn) return null;
            return <ValveIndicator key={valve.valveId} valve={valve} conn={conn} />;
          })}

          {/* Inter-zone flow references */}
          {zone.connections.filter(c => c.to.equipmentId.startsWith('EXT-')).map(conn => (
            <InterZoneArrow key={conn.id} conn={conn} zone={zone} />
          ))}

          {/* Equipment */}
          {zone.equipment.map(eq => {
            const status = zone.equipmentStatus.find(s => s.equipmentId === eq.id);
            return (
              <EquipmentSymbol
                key={eq.id}
                eq={eq}
                status={status}
                isSelected={selectedId === eq.id}
                onClick={() => {
                  // If clicking same item, reset view; otherwise zoom to it
                  if (selectedId === eq.id) {
                    onSelect?.('', '');
                    handleResetView();
                  } else {
                    onSelect?.('equipment', eq.id);
                  }
                }}
              />
            );
          })}

          {/* Labels */}
          {showLabels && zone.equipment.map(eq => (
            <text key={`label-${eq.id}`} x={eq.x + eq.width / 2} y={eq.y + eq.height + 12} textAnchor="middle" fill="#52525b" fontSize="7" fontFamily="system-ui">
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

          <TitleBlock zone={zone} />
        </g>
      </svg>
    </div>
  );
}
