'use client';

import { useMemo } from 'react';
import type { InstrumentLiveData } from '@/types/pid-zone';

// ============================================================
// TREND CHART — full-size time series visualization
// ============================================================

interface TrendChartProps {
  data: InstrumentLiveData;
  width?: number;
  height?: number;
  showSetpoint?: boolean;
  showAlarms?: boolean;
}

export function TrendChart({
  data,
  width = 280,
  height = 100,
  showSetpoint = true,
  showAlarms = true,
}: TrendChartProps) {
  const trend = data.trend || [];
  if (trend.length < 2) {
    return (
      <div className="text-zinc-600 text-xs p-4 text-center">
        Insufficient data for trend
      </div>
    );
  }

  const padding = { top: 12, right: 12, bottom: 24, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const min = Math.min(...trend) * 0.95;
  const max = Math.max(...trend) * 1.05;
  const range = max - min || 1;

  // Generate path
  const points = trend.map((v, i) => ({
    x: padding.left + (i / (trend.length - 1)) * chartW,
    y: padding.top + chartH - ((v - min) / range) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  // Color based on alarm state
  const strokeColor =
    data.alarmState === 'critical' ? '#ef4444' :
    data.alarmState === 'warning' ? '#f59e0b' :
    '#8b5cf6';

  const fillColor = data.alarmState === 'critical' ? 'rgba(239,68,68,0.08)' :
    data.alarmState === 'warning' ? 'rgba(245,158,11,0.08)' :
    'rgba(139,92,246,0.06)';

  // Y-axis ticks
  const yTicks = [min, min + range * 0.25, min + range * 0.5, min + range * 0.75, max];

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-300">{data.instrumentId}</span>
        <span className="text-xs font-mono" style={{ color: strokeColor }}>
          {data.value.toFixed(1)} {data.unit}
          {data.alarmState !== 'normal' && (
            <span className="ml-1 text-[10px] uppercase font-bold">({data.alarmState})</span>
          )}
        </span>
      </div>
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = padding.top + chartH - ((tick - min) / range) * chartH;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#27272a" strokeWidth="0.5" />
              <text x={padding.left - 4} y={y + 3} textAnchor="end" fill="#52525b" fontSize="7" fontFamily="monospace">
                {tick.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={fillColor} />

        {/* Setpoint line */}
        {showSetpoint && data.setpoint !== undefined && (() => {
          const spY = padding.top + chartH - ((data.setpoint - min) / range) * chartH;
          return (
            <line
              x1={padding.left} y1={spY}
              x2={padding.left + chartW} y2={spY}
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="4,3"
              opacity={0.6}
            />
          );
        })()}

        {/* Trend line */}
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" />

        {/* Current value dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={strokeColor}
          stroke="#0f0f0f"
          strokeWidth="1.5"
        />

        {/* X-axis label */}
        <text x={padding.left + chartW / 2} y={height - 4} textAnchor="middle" fill="#52525b" fontSize="7" fontFamily="system-ui">
          Last {trend.length} samples
        </text>
      </svg>
    </div>
  );
}

// ============================================================
// MINI TREND — inline sparkline with context
// ============================================================

export function MiniTrend({ data, label }: { data: InstrumentLiveData; label?: string }) {
  const trend = data.trend || [];
  if (trend.length < 2) return null;

  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const range = max - min || 1;
  const points = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * 60;
    const y = 16 - ((v - min) / range) * 16;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor =
    data.alarmState === 'critical' ? '#ef4444' :
    data.alarmState === 'warning' ? '#f59e0b' :
    '#8b5cf6';

  return (
    <div className="flex items-center gap-2">
      <svg width={60} height={16} className="flex-shrink-0">
        <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1" />
      </svg>
      <span className="text-xs font-mono" style={{ color: strokeColor }}>
        {data.value.toFixed(1)} {data.unit}
      </span>
    </div>
  );
}
