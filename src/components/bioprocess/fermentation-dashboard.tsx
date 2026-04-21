'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Upload, LineChart, AlertTriangle, TrendingUp, TrendingDown, FileSpreadsheet, X } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface DataPoint {
  timestamp: number;
  [key: string]: number;
}

interface ColumnMeta {
  name: string;
  unit: string;
  min: number;
  max: number;
  avg: number;
  color: string;
}

interface Alert {
  type: 'warning' | 'critical';
  column: string;
  message: string;
  time: number;
  value: number;
}

// Known column mappings (auto-detect from CSV headers)
const COLUMN_UNITS: Record<string, string> = {
  'do': '%', 'dissolved_oxygen': '%', 'dissolved oxygen': '%', 'po2': '%', 'o2': '%',
  'ph': '', 'pH': '',
  'temp': '°C', 'temperature': '°C', 't': '°C',
  'od600': '', 'od': '', 'biomass': 'g/L', 'vcd': 'cells/mL', 'cell_count': 'cells/mL',
  'glucose': 'g/L', 'glc': 'g/L', 'sugar': 'g/L',
  'lactate': 'g/L', 'lac': 'g/L',
  'pressure': 'bar', 'head_pressure': 'bar',
  'agitation': 'rpm', 'stirrer': 'rpm', 'rpm': 'rpm',
  'air_flow': 'L/min', 'air flow': 'L/min', 'gas_flow': 'L/min', 'vvm': '',
  'co2': '%', 'offgas_co2': '%', 'exit_co2': '%',
  'nh3': 'mM', 'ammonia': 'mM', 'nh4': 'mM',
  'time': 'h', 'hour': 'h', 'hours': 'h', 'duration': 'h',
};

const COLUMN_COLORS: Record<string, string> = {
  'do': '#10b981', 'dissolved_oxygen': '#10b981', 'dissolved oxygen': '#10b981', 'po2': '#10b981',
  'ph': '#f59e0b', 'pH': '#f59e0b',
  'temp': '#ef4444', 'temperature': '#ef4444',
  'od600': '#8b5cf6', 'od': '#8b5cf6', 'biomass': '#8b5cf6', 'vcd': '#8b5cf6',
  'glucose': '#3b82f6', 'glc': '#3b82f6',
  'lactate': '#f97316', 'lac': '#f97316',
  'pressure': '#6b7280', 'agitation': '#06b6d4', 'rpm': '#06b6d4',
  'air_flow': '#14b8a6', 'vvm': '#14b8a6',
  'co2': '#a855f7', 'offgas_co2': '#a855f7',
  'nh3': '#ec4899', 'ammonia': '#ec4899',
};

// ============================================================
// CSV PARSER
// ============================================================

function parseCSV(text: string): { headers: string[]; rows: number[][] } {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(/[,\t;]/).map(h => h.trim().replace(/"/g, ''));
  const rows: number[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/[,\t;]/).map(v => parseFloat(v.trim().replace(/"/g, '')));
    if (values.some(v => !isNaN(v))) {
      rows.push(values);
    }
  }

  return { headers, rows };
}

function detectColumns(headers: string[]): ColumnMeta[] {
  return headers.map((name, i) => {
    const key = name.toLowerCase().replace(/[\s_]+/g, '_');
    const unit = COLUMN_UNITS[key] || COLUMN_UNITS[name.toLowerCase()] || '';
    const color = COLUMN_COLORS[key] || COLUMN_COLORS[name.toLowerCase()] || `hsl(${(i * 47) % 360}, 70%, 60%)`;

    return { name, unit, min: 0, max: 0, avg: 0, color };
  });
}

// ============================================================
// SVG CHART COMPONENT
// ============================================================

function MiniChart({
  data,
  columns,
  width = 800,
  height = 200,
  xLabel = 'Time (h)',
  activeColumns,
}: {
  data: DataPoint[];
  columns: ColumnMeta[];
  width?: number;
  height?: number;
  xLabel?: string;
  activeColumns: string[];
}) {
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (data.length === 0 || activeColumns.length === 0) return null;

  const xMin = data[0].timestamp;
  const xMax = data[data.length - 1].timestamp;
  const xRange = xMax - xMin || 1;

  const toX = (v: number) => padding.left + ((v - xMin) / xRange) * chartW;

  // Get Y ranges for active columns
  const yRanges = activeColumns.map(col => {
    const values = data.map(d => d[col]).filter(v => v !== undefined && !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return { min: min - range * 0.1, max: max + range * 0.1, range: range * 1.2 };
  });

  // Use first column's Y scale (or composite)
  const yMin = Math.min(...yRanges.map(y => y.min));
  const yMax = Math.max(...yRanges.map(y => y.max));
  const yRange = yMax - yMin || 1;
  const toY = (v: number) => padding.top + chartH - ((v - yMin) / yRange) * chartH;

  // Generate grid lines
  const xTicks = 6;
  const yTicks = 5;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* Grid */}
      {Array.from({ length: xTicks }, (_, i) => {
        const x = padding.left + (i / (xTicks - 1)) * chartW;
        const val = xMin + (i / (xTicks - 1)) * xRange;
        return (
          <g key={`x-${i}`}>
            <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#27272a" strokeWidth="1" />
            <text x={x} y={height - 5} textAnchor="middle" fill="#52525b" fontSize="10">{val.toFixed(1)}</text>
          </g>
        );
      })}
      {Array.from({ length: yTicks }, (_, i) => {
        const y = padding.top + (i / (yTicks - 1)) * chartH;
        const val = yMax - (i / (yTicks - 1)) * yRange;
        return (
          <g key={`y-${i}`}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#27272a" strokeWidth="1" />
            <text x={padding.left - 5} y={y + 3} textAnchor="end" fill="#52525b" fontSize="10">{val.toFixed(1)}</text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text x={width / 2} y={height - 2} textAnchor="middle" fill="#71717a" fontSize="10">{xLabel}</text>

      {/* Lines */}
      {activeColumns.map(col => {
        const colMeta = columns.find(c => c.name === col);
        const points = data
          .filter(d => d[col] !== undefined && !isNaN(d[col]))
          .map(d => `${toX(d.timestamp).toFixed(1)},${toY(d[col]).toFixed(1)}`)
          .join(' ');

        return (
          <g key={col}>
            <polyline
              points={points}
              fill="none"
              stroke={colMeta?.color || '#8b5cf6'}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Glow effect */}
            <polyline
              points={points}
              fill="none"
              stroke={colMeta?.color || '#8b5cf6'}
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.2"
            />
          </g>
        );
      })}

      {/* Legend */}
      {activeColumns.map((col, i) => {
        const colMeta = columns.find(c => c.name === col);
        return (
          <g key={`legend-${col}`} transform={`translate(${padding.left + i * 100}, ${padding.top - 5})`}>
            <rect x={0} y={-8} width={12} height={3} rx={1} fill={colMeta?.color || '#8b5cf6'} />
            <text x={16} y={-3} fill="#a1a1aa" fontSize="9">{col} ({colMeta?.unit})</text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// ANOMALY DETECTION
// ============================================================

function detectAnomalies(data: DataPoint[], columns: ColumnMeta[]): Alert[] {
  const alerts: Alert[] = [];

  for (const col of columns) {
    if (col.name.toLowerCase().includes('time') || col.name.toLowerCase().includes('hour')) continue;

    const values = data.map(d => d[col.name]).filter(v => v !== undefined && !isNaN(v));
    if (values.length === 0) continue;

    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const std = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length);

    // Check for out-of-range values
    const thresholds: Record<string, { min: number; max: number }> = {
      'do': { min: 20, max: 100 },
      'dissolved_oxygen': { min: 20, max: 100 },
      'ph': { min: 6.0, max: 8.0 },
      'pH': { min: 6.0, max: 8.0 },
      'temp': { min: 25, max: 37 },
      'temperature': { min: 25, max: 37 },
      'od600': { min: 0, max: 100 },
      'lactate': { min: 0, max: 5 },
    };

    const key = col.name.toLowerCase().replace(/[\s_]+/g, '_');
    const threshold = thresholds[key];

    for (const d of data) {
      const val = d[col.name];
      if (val === undefined || isNaN(val)) continue;

      if (threshold) {
        if (val < threshold.min || val > threshold.max) {
          alerts.push({
            type: val < threshold.min * 0.8 || val > threshold.max * 1.2 ? 'critical' : 'warning',
            column: col.name,
            message: `${col.name} = ${val.toFixed(1)} ${col.unit} (expected ${threshold.min}–${threshold.max})`,
            time: d.timestamp,
            value: val,
          });
        }
      }

      // Statistical anomaly (3 sigma)
      if (std > 0 && Math.abs(val - avg) > 3 * std) {
        alerts.push({
          type: 'warning',
          column: col.name,
          message: `${col.name} spike: ${val.toFixed(1)} (avg: ${avg.toFixed(1)} ± ${std.toFixed(1)})`,
          time: d.timestamp,
          value: val,
        });
      }
    }
  }

  // Deduplicate and limit
  return alerts.slice(0, 20);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function FermentationDashboard() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [activeColumns, setActiveColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const alerts = useMemo(() => {
    if (data.length === 0 || columns.length === 0) return [];
    return detectAnomalies(data, columns);
  }, [data, columns]);

  const handleFile = useCallback((file: File) => {
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, rows } = parseCSV(text);

        if (headers.length === 0 || rows.length === 0) {
          setError('Could not parse CSV. Ensure it has headers and data rows.');
          return;
        }

        const colMetas = detectColumns(headers);

        // Find time column
        const timeIdx = headers.findIndex(h =>
          h.toLowerCase().includes('time') || h.toLowerCase().includes('hour') || h.toLowerCase() === 't'
        );

        // Convert to DataPoints
        const points: DataPoint[] = rows.map(row => {
          const point: DataPoint = { timestamp: timeIdx >= 0 ? row[timeIdx] : rows.indexOf(row) };
          headers.forEach((h, i) => {
            if (i !== timeIdx) point[h] = row[i];
          });
          return point;
        });

        // Update column metadata with actual data ranges
        colMetas.forEach(col => {
          const vals = points.map(p => p[col.name]).filter(v => v !== undefined && !isNaN(v));
          col.min = Math.min(...vals);
          col.max = Math.max(...vals);
          col.avg = vals.reduce((s, v) => s + v, 0) / vals.length;
        });

        setColumns(colMetas);
        setData(points);
        setFileName(file.name);

        // Auto-select first 3 non-time columns
        const dataCols = colMetas.filter(c =>
          !c.name.toLowerCase().includes('time') && !c.name.toLowerCase().includes('hour')
        );
        setActiveColumns(dataCols.slice(0, 4).map(c => c.name));
      } catch (err) {
        setError('Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt'))) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-700 hover:border-violet-500/50 transition-colors p-8 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
        <div className="text-sm text-zinc-300 font-medium mb-1">
          {fileName ? `Loaded: ${fileName}` : 'Drop your bioreactor CSV here or click to upload'}
        </div>
        <div className="text-xs text-zinc-500">
          Supports: CSV, TSV • Auto-detects DO, pH, temp, OD600, glucose, lactate columns • Data stays in your browser
        </div>
        {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
      </div>

      {/* Demo Data Button */}
      {data.length === 0 && (
        <div className="text-center">
          <button
            onClick={() => {
              // Generate realistic Bt fermentation demo data
              const hours = 72;
              const demoData: DataPoint[] = [];
              for (let h = 0; h <= hours; h += 0.5) {
                const phase = h < 8 ? 'lag' : h < 36 ? 'exp' : h < 60 ? 'stat' : 'death';
                const biomass = phase === 'lag' ? 0.5 + h * 0.02 : phase === 'exp' ? 0.5 + Math.exp((h - 8) * 0.12) * 0.3 : phase === 'stat' ? 25 - (h - 36) * 0.1 : 22 - (h - 60) * 0.3;
                const glucose = 20 - h * 0.25 + Math.random() * 0.5;
                const do_level = phase === 'exp' ? 40 - (h - 8) * 0.8 + Math.random() * 5 : phase === 'stat' ? 15 + (h - 36) * 0.5 : 60;
                const ph = 7.0 - h * 0.015 + Math.random() * 0.1;
                const temp = 30 + Math.random() * 0.5 - 0.25;
                const lactate = phase === 'exp' ? Math.min(3, (h - 8) * 0.08) : phase === 'stat' ? 3 - (h - 36) * 0.05 : 1.5;

                demoData.push({
                  timestamp: h,
                  'OD600': Math.max(0.1, biomass + Math.random() * 0.5),
                  'DO (%)': Math.max(5, Math.min(100, do_level)),
                  'pH': Math.max(5.5, Math.min(8, ph)),
                  'Temp (°C)': temp,
                  'Glucose (g/L)': Math.max(0, glucose),
                  'Lactate (g/L)': Math.max(0, lactate),
                });
              }

              const colMetas: ColumnMeta[] = [
                { name: 'OD600', unit: '', min: 0.1, max: 25, avg: 12, color: '#8b5cf6' },
                { name: 'DO (%)', unit: '%', min: 5, max: 100, avg: 40, color: '#10b981' },
                { name: 'pH', unit: '', min: 5.5, max: 8, avg: 6.8, color: '#f59e0b' },
                { name: 'Temp (°C)', unit: '°C', min: 29.5, max: 30.5, avg: 30, color: '#ef4444' },
                { name: 'Glucose (g/L)', unit: 'g/L', min: 0, max: 20, avg: 10, color: '#3b82f6' },
                { name: 'Lactate (g/L)', unit: 'g/L', min: 0, max: 3, avg: 1.5, color: '#f97316' },
              ];

              setData(demoData);
              setColumns(colMetas);
              setFileName('demo-bt-fermentation-72h.csv');
              setActiveColumns(['OD600', 'DO (%)', 'pH', 'Glucose (g/L)']);
            }}
            className="text-xs text-violet-400 hover:text-violet-300 underline"
          >
            or load demo Bt fermentation data (72h run)
          </button>
        </div>
      )}

      {/* Dashboard */}
      {data.length > 0 && (
        <>
          {/* Column Selector */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white">{fileName}</span>
                <span className="text-xs text-zinc-500">({data.length} data points)</span>
              </div>
              <button onClick={() => { setData([]); setColumns([]); setActiveColumns([]); setFileName(''); }} className="text-xs text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {columns.filter(c =>
                !c.name.toLowerCase().includes('time') && !c.name.toLowerCase().includes('hour')
              ).map(col => (
                <button
                  key={col.name}
                  onClick={() => setActiveColumns(prev =>
                    prev.includes(col.name) ? prev.filter(c => c !== col.name) : [...prev, col.name]
                  )}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    activeColumns.includes(col.name)
                      ? 'border-violet-500/30 bg-violet-600/20'
                      : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                  )}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className={activeColumns.includes(col.name) ? 'text-violet-300' : 'text-zinc-400'}>
                    {col.name}
                  </span>
                  <span className="text-zinc-600">({col.unit})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">Time Series</span>
            </div>
            <MiniChart
              data={data}
              columns={columns}
              activeColumns={activeColumns}
              height={300}
              xLabel="Time (hours)"
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {columns.filter(c => activeColumns.includes(c.name)).map(col => (
              <div key={col.name} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{col.name}</span>
                </div>
                <div className="text-lg font-bold text-white">{col.avg.toFixed(1)} <span className="text-xs text-zinc-500">{col.unit}</span></div>
                <div className="text-[10px] text-zinc-500">
                  Range: {col.min.toFixed(1)} – {col.max.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Detected Anomalies</span>
                <span className="text-xs text-zinc-500">({alerts.length} events)</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {alerts.map((a, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg text-xs',
                      a.type === 'critical'
                        ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                    )}
                  >
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span className="flex-1">{a.message}</span>
                    <span className="text-zinc-500">@{a.time.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
