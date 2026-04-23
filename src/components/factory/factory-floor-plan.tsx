'use client';

import { useState, useMemo } from 'react';
import { zones, equipment, batches, materials, orders } from '@/lib/mock-data';
import { cn, zoneColor, statusColor } from '@/lib/utils';
import { Equipment, Zone, Batch } from '@/types/erp';
import {
  X, Cog, Thermometer, Wind, Zap, Package, FlaskConical,
  Box, Layers, Droplets, Gauge, Users, ArrowRight, AlertTriangle,
  Activity, Clock, ChevronRight, Maximize2, Minimize2, MapPin,
  Wrench, TrendingUp, BarChart3
} from 'lucide-react';

// ============================================================
// CONSTANTS
// ============================================================

const ISO_COLORS: Record<string, { border: string; label: string; bg: string }> = {
  'ISO 5': { border: '#eab308', label: 'ISO 5', bg: 'rgba(234,179,8,0.08)' },
  'ISO 6': { border: '#f97316', label: 'ISO 6', bg: 'rgba(249,115,22,0.06)' },
  'ISO 7': { border: '#3b82f6', label: 'ISO 7', bg: 'rgba(59,130,246,0.06)' },
  'ISO 8': { border: '#6b7280', label: 'ISO 8', bg: 'rgba(107,114,128,0.06)' },
};

const ZONE_ICONS: Record<string, React.ReactNode> = {
  upstream: <Layers className="w-4 h-4" />,
  downstream: <Zap className="w-4 h-4" />,
  formulation: <FlaskConical className="w-4 h-4" />,
  packaging: <Package className="w-4 h-4" />,
  qc: <FlaskConical className="w-4 h-4" />,
  warehouse: <Box className="w-4 h-4" />,
  utilities: <Wind className="w-4 h-4" />,
};

// Equipment type icons
const EQUIP_ICONS: Record<string, string> = {
  'BioFlo': '🧫',
  'Seed': '🌱',
  'Centrifuge': '🔄',
  'Spray': '💨',
  'Blender': '🌀',
  'Autoclave': '🔥',
  'HPLC': '📊',
  'Freeze': '❄️',
};

function getEquipIcon(name: string): string {
  for (const [key, icon] of Object.entries(EQUIP_ICONS)) {
    if (name.includes(key)) return icon;
  }
  return '⚙️';
}

// ============================================================
// FACILITY HEADER KPIs
// ============================================================

function FacilityHeader() {
  const activeBatches = batches.filter(b => ['in_progress', 'qc_pending'].includes(b.status));
  const runningEquip = equipment.filter(e => e.status === 'running');
  const maintenanceEquip = equipment.filter(e => e.status === 'maintenance');
  const offlineEquip = equipment.filter(e => e.status === 'offline');
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

  const oee = Math.round(
    equipment.reduce((sum, e) => sum + e.efficiency, 0) / equipment.length
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">OEE</span>
        </div>
        <div className="text-xl font-bold text-white">{oee}%</div>
        <div className="text-[10px] text-zinc-500">Overall Equipment Effectiveness</div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Batches</span>
        </div>
        <div className="text-xl font-bold text-white">{activeBatches.length}</div>
        <div className="text-[10px] text-zinc-500">{batches.length} total</div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Cog className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Equipment</span>
        </div>
        <div className="text-xl font-bold text-white">
          <span className="text-emerald-400">{runningEquip.length}</span>
          <span className="text-zinc-600">/{equipment.length}</span>
        </div>
        <div className="text-[10px] text-zinc-500">
          {maintenanceEquip.length > 0 && `${maintenanceEquip.length} maintenance`}
          {offlineEquip.length > 0 && ` • ${offlineEquip.length} offline`}
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Orders</span>
        </div>
        <div className="text-xl font-bold text-white">{pendingOrders.length}</div>
        <div className="text-[10px] text-zinc-500">pending fulfillment</div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Facility</span>
        </div>
        <div className="text-xl font-bold text-white">500m²</div>
        <div className="text-[10px] text-zinc-500">6 zones • INSEBT</div>
      </div>
    </div>
  );
}

// ============================================================
// ZONE BLOCK (Enhanced)
// ============================================================

function ZoneBlock({
  zone,
  zoneEquipment,
  zoneBatches,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onEquipmentClick,
  onExpand,
}: {
  zone: Zone;
  zoneEquipment: Equipment[];
  zoneBatches: Batch[];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (v: boolean) => void;
  onEquipmentClick: (eq: Equipment) => void;
  onExpand: () => void;
}) {
  const isoInfo = ISO_COLORS[zone.isoClass || ''] || ISO_COLORS['ISO 8'];
  const activeCount = zoneEquipment.filter(e => e.status === 'running').length;
  const totalCount = zoneEquipment.length;
  const activityLevel = totalCount > 0 ? activeCount / totalCount : 0;

  return (
    <g
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="cursor-pointer"
      style={{ transition: 'all 0.3s ease' }}
    >
      {/* Zone background with activity-based opacity */}
      <rect
        x={zone.x}
        y={zone.y}
        width={zone.width}
        height={zone.height}
        rx="10"
        fill={activityLevel > 0.5 ? 'rgba(139,92,246,0.06)' : isoInfo.bg}
        stroke={isHovered || isSelected ? '#a78bfa' : isoInfo.border}
        strokeWidth={isSelected ? 2 : 1}
        strokeOpacity={isHovered || isSelected ? 1 : 0.4}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Zone header */}
      <g>
        {/* ISO badge */}
        <rect
          x={zone.x + zone.width - 60}
          y={zone.y + 8}
          width={50}
          height={18}
          rx="4"
          fill={isoInfo.border}
          fillOpacity={0.15}
          stroke={isoInfo.border}
          strokeWidth={0.5}
          strokeOpacity={0.5}
        />
        <text
          x={zone.x + zone.width - 35}
          y={zone.y + 20}
          textAnchor="middle"
          fill={isoInfo.border}
          fontSize="8"
          fontWeight="600"
          fontFamily="monospace"
        >
          {isoInfo.label}
        </text>

      {/* Zone label */}
                <text x={zone.x + 12} y={zone.y + 20} fill="#e4e4e7" fontSize="12" fontWeight="600" fontFamily="system-ui">
                  {zone.name}
                </text>
                <text x={zone.x + 12} y={zone.y + 34} fill="#71717a" fontSize="9" fontFamily="monospace">
                  {zone.area}m² {zone.isoClass ? `• ${zone.isoClass}` : ''} {zone.temperature ? `• ${zone.temperature}` : ''}
                </text>

                {/* Expand button */}
                <g
                  onClick={(e) => { e.stopPropagation(); onExpand(); }}
                  className="cursor-pointer"
                  opacity={0.5}
                >
                  <rect
                    x={zone.x + zone.width - 28}
                    y={zone.y + zone.height - 20}
                    width={18}
                    height={14}
                    rx="3"
                    fill="#27272a"
                    stroke="#3f3f46"
                    strokeWidth="0.5"
                  />
                  <text x={zone.x + zone.width - 19} y={zone.y + zone.height - 10} textAnchor="middle" fill="#71717a" fontSize="7">
                    ⛶
                  </text>
                </g>

        {/* Activity indicator */}
        {totalCount > 0 && (
          <g>
            <rect
              x={zone.x + 12}
              y={zone.y + 40}
              width={40}
              height={4}
              rx="2"
              fill="#27272a"
            />
            <rect
              x={zone.x + 12}
              y={zone.y + 40}
              width={40 * activityLevel}
              height={4}
              rx="2"
              fill={activityLevel >= 0.8 ? '#10b981' : activityLevel >= 0.5 ? '#eab308' : '#6b7280'}
            />
            <text x={zone.x + 56} y={zone.y + 44} fill="#71717a" fontSize="7" fontFamily="monospace">
              {activeCount}/{totalCount}
            </text>
          </g>
        )}
      </g>

      {/* Pressure arrow (simplified GMP visualization) */}
      {zone.type !== 'warehouse' && zone.type !== 'utilities' && (
        <g opacity={0.3}>
          <line
            x1={zone.x + zone.width / 2 - 15}
            y1={zone.y + zone.height - 8}
            x2={zone.x + zone.width / 2 + 15}
            y2={zone.y + zone.height - 8}
            stroke={isoInfo.border}
            strokeWidth="1"
            strokeDasharray="3,2"
          />
          <polygon
            points={`${zone.x + zone.width / 2 + 15},${zone.y + zone.height - 11} ${zone.x + zone.width / 2 + 20},${zone.y + zone.height - 8} ${zone.x + zone.width / 2 + 15},${zone.y + zone.height - 5}`}
            fill={isoInfo.border}
            opacity={0.5}
          />
        </g>
      )}

      {/* Equipment cards */}
      {zoneEquipment.map((eq, i) => {
        const cols = Math.min(4, zoneEquipment.length);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cardW = Math.min(120, (zone.width - 40) / cols);
        const cardH = 36;
        const startX = zone.x + 16;
        const startY = zone.y + 55;
        const cardX = startX + col * (cardW + 8);
        const cardY = startY + row * (cardH + 8);

        if (cardY + cardH > zone.y + zone.height - 15) return null; // Don't overflow

        const statusColor = eq.status === 'running' ? '#10b981' : eq.status === 'maintenance' ? '#f59e0b' : eq.status === 'offline' ? '#ef4444' : '#6b7280';

        return (
          <g
            key={eq.id}
            onClick={(e) => { e.stopPropagation(); onEquipmentClick(eq); }}
            className="cursor-pointer"
            style={{ transition: 'all 0.2s ease' }}
          >
            {/* Card background */}
            <rect
              x={cardX}
              y={cardY}
              width={cardW}
              height={cardH}
              rx="6"
              fill="#18181b"
              stroke={eq.status === 'running' ? '#22c55e33' : '#27272a'}
              strokeWidth="1"
            />

            {/* Status ring */}
            <circle
              cx={cardX + 14}
              cy={cardY + 12}
              r="5"
              fill="none"
              stroke={statusColor}
              strokeWidth="1.5"
            />
            <circle
              cx={cardX + 14}
              cy={cardY + 12}
              r="2.5"
              fill={statusColor}
            >
              {eq.status === 'running' && (
                <animate attributeName="r" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
              )}
            </circle>

            {/* Equipment icon */}
            <text x={cardX + 14} y={cardY + 16} textAnchor="middle" fontSize="8">
              {getEquipIcon(eq.name)}
            </text>

            {/* Name */}
            <text x={cardX + 26} y={cardY + 14} fill="#e4e4e7" fontSize="8" fontWeight="500" fontFamily="system-ui">
              {eq.name.split(' ').slice(0, 2).join(' ')}
            </text>

            {/* Efficiency bar */}
            <rect x={cardX + 26} y={cardY + 20} width={cardW - 34} height="3" rx="1.5" fill="#27272a" />
            <rect
              x={cardX + 26}
              y={cardY + 20}
              width={(cardW - 34) * (eq.efficiency / 100)}
              height="3"
              rx="1.5"
              fill={eq.efficiency >= 95 ? '#10b981' : eq.efficiency >= 85 ? '#eab308' : '#ef4444'}
            />
            <text x={cardX + cardW - 8} y={cardY + 28} fill="#71717a" fontSize="6" textAnchor="end" fontFamily="monospace">
              {eq.efficiency}%
            </text>
          </g>
        );
      })}

      {/* Active batch badges */}
      {zoneBatches.slice(0, 3).map((batch, i) => (
        <g key={batch.id}>
          <rect
            x={zone.x + zone.width - 90}
            y={zone.y + zone.height - 24 - i * 20}
            width={80}
            height="16"
            rx="4"
            fill="#8b5cf6"
            fillOpacity={0.15}
            stroke="#8b5cf6"
            strokeOpacity={0.3}
            strokeWidth="0.5"
          />
          <text
            x={zone.x + zone.width - 86}
            y={zone.y + zone.height - 13 - i * 20}
            fill="#c4b5fd"
            fontSize="7"
            fontFamily="monospace"
          >
            {batch.id.slice(-6)} • {batch.currentStage.slice(0, 12)}
          </text>
        </g>
      ))}
    </g>
  );
}

// ============================================================
// MATERIAL FLOW LINES (Animated)
// ============================================================

function MaterialFlowLines() {
  const activeBatches = batches.filter(b => b.status === 'in_progress');

  return (
    <g>
      <defs>
        <marker id="flowArrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#8b5cf6" opacity="0.6" />
        </marker>
      </defs>

      {/* Main process flow: Upstream → Downstream → Formulation → QC → Packaging → Warehouse */}
      {/* Horizontal flow across top */}
      <line x1="350" y1="120" x2="400" y2="120" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6,4" markerEnd="url(#flowArrow)" opacity="0.4">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="700" y1="120" x2="750" y2="120" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6,4" markerEnd="url(#flowArrow)" opacity="0.4">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
      </line>

      {/* Vertical flow: top → bottom (via corridor) */}
      <line x1="550" y1="220" x2="550" y2="260" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6,4" markerEnd="url(#flowArrow)" opacity="0.4">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="900" y1="220" x2="900" y2="260" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6,4" markerEnd="url(#flowArrow)" opacity="0.4">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
      </line>

      {/* QC → Packaging flow */}
      <line x1="850" y1="370" x2="900" y2="370" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6,4" markerEnd="url(#flowArrow)" opacity="0.4">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
      </line>

      {/* Batch flow badges */}
      {activeBatches.map((batch, i) => {
        const batchColor = ['#8b5cf6', '#3b82f6', '#10b981'][i % 3];
        const yPos = 115 + i * 14;
        return (
          <g key={batch.id}>
            <rect x="365" y={yPos - 7} width="60" height="14" rx="4" fill={batchColor} fillOpacity="0.2" stroke={batchColor} strokeOpacity="0.4" strokeWidth="0.5" />
            <text x="370" y={yPos + 3} fill={batchColor} fontSize="7" fontFamily="monospace">
              {batch.id.slice(-6)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ============================================================
// CORRIDOR (Enhanced)
// ============================================================

function Corridor() {
  return (
    <g>
      {/* Material corridor */}
      <rect x="20" y="230" width="1080" height="22" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="0.5" />
      <text x="560" y="244" textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace" letterSpacing="2">
        ◄ MATERIAL TRANSFER CORRIDOR ►
      </text>

      {/* Personnel corridor (smaller, separate) */}
      <rect x="20" y="256" width="1080" height="14" rx="3" fill="#0f0f0f" stroke="#27272a" strokeWidth="0.5" />
      <text x="560" y="266" textAnchor="middle" fill="#3f3f46" fontSize="7" fontFamily="monospace" letterSpacing="1">
        PERSONNEL CORRIDOR (GOWNING →)
      </text>
    </g>
  );
}

// ============================================================
// EXPANDED ZONE VIEW (Full-page drill-down)
// ============================================================

function ExpandedZoneView({
  zone,
  zoneEquipment,
  zoneBatches,
  onClose,
  onEquipmentClick,
}: {
  zone: Zone;
  zoneEquipment: Equipment[];
  zoneBatches: Batch[];
  onClose: () => void;
  onEquipmentClick: (eq: Equipment) => void;
}) {
  const isoInfo = ISO_COLORS[zone.isoClass || ''] || ISO_COLORS['ISO 8'];
  const runningCount = zoneEquipment.filter(e => e.status === 'running').length;
  const maintenanceCount = zoneEquipment.filter(e => e.status === 'maintenance').length;
  const offlineCount = zoneEquipment.filter(e => e.status === 'offline').length;
  const avgEfficiency = zoneEquipment.length > 0
    ? Math.round(zoneEquipment.reduce((s, e) => s + e.efficiency, 0) / zoneEquipment.length)
    : 0;
  const totalHours = zoneEquipment.reduce((s, e) => s + e.hoursRunning, 0);

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/98 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: isoInfo.bg, border: `1px solid ${isoInfo.border}40` }}
              >
                {ZONE_ICONS[zone.type]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{zone.name}</h2>
                <p className="text-sm text-zinc-400">{zone.description}</p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-semibold"
                style={{ backgroundColor: `${isoInfo.border}20`, color: isoInfo.border, border: `1px solid ${isoInfo.border}40` }}
              >
                {isoInfo.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="text-sm">Back to Overview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto p-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Area</div>
            <div className="text-2xl font-bold text-white">{zone.area}m²</div>
          </div>
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Equipment</div>
            <div className="text-2xl font-bold text-white">{zoneEquipment.length}</div>
          </div>
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Online</div>
            <div className="text-2xl font-bold text-emerald-400">
              {runningCount}<span className="text-zinc-600 text-lg">/{zoneEquipment.length}</span>
            </div>
          </div>
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Avg Efficiency</div>
            <div className="text-2xl font-bold text-white">{avgEfficiency}%</div>
          </div>
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-white">{totalHours.toLocaleString()}h</div>
          </div>
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Temperature</div>
            <div className="text-2xl font-bold text-white">{zone.temperature || 'Ambient'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Detail Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-violet-400" />
              Equipment ({zoneEquipment.length})
              {maintenanceCount > 0 && (
                <span className="text-amber-400 text-xs">• {maintenanceCount} in maintenance</span>
              )}
              {offlineCount > 0 && (
                <span className="text-red-400 text-xs">• {offlineCount} offline</span>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {zoneEquipment.map(eq => {
                const statusCol = eq.status === 'running' ? 'emerald' : eq.status === 'maintenance' ? 'amber' : eq.status === 'offline' ? 'red' : 'slate';
                return (
                  <button
                    key={eq.id}
                    onClick={() => onEquipmentClick(eq)}
                    className="text-left p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 hover:border-violet-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getEquipIcon(eq.name)}</span>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">
                            {eq.name}
                          </div>
                          <div className="text-xs text-zinc-500">{eq.vendor}</div>
                        </div>
                      </div>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border font-medium',
                        statusColor(eq.status)
                      )}>
                        {eq.status}
                      </span>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.entries(eq.specs).slice(0, 4).map(([k, v]) => (
                        <div key={k} className="bg-zinc-800/50 rounded-lg px-2 py-1.5">
                          <div className="text-[9px] text-zinc-600 uppercase">{k}</div>
                          <div className="text-xs text-zinc-300 font-medium truncate">{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Clock className="w-3 h-3" />
                        {eq.hoursRunning.toLocaleString()}h
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full',
                              eq.efficiency >= 95 ? 'bg-emerald-500' :
                              eq.efficiency >= 85 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${eq.efficiency}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 font-mono">{eq.efficiency}%</span>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{eq.costRange}</span>
                      {eq.nextMaintenance && (
                        <span className="text-amber-400/70 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Next: {eq.nextMaintenance}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar: Batches & Environmental */}
          <div className="space-y-6">
            {/* Active Batches */}
            {zoneBatches.length > 0 && (
              <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-violet-400" />
                  Active Batches ({zoneBatches.length})
                </h3>
                <div className="space-y-2">
                  {zoneBatches.map(batch => (
                    <div key={batch.id} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono font-bold text-white">{batch.id}</span>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', statusColor(batch.status))}>
                          {batch.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">{batch.product} — {batch.size}kg</div>
                      <div className="text-xs text-zinc-500 mt-1">{batch.currentStage}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">
                        {batch.startDate} → {batch.estimatedCompletion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Environmental Monitoring (Placeholder) */}
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                Environmental Monitoring
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-xs text-zinc-400">Temperature</span>
                  <span className="text-sm font-mono text-white">{zone.temperature || '22°C'}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-xs text-zinc-400">Humidity</span>
                  <span className="text-sm font-mono text-white">45% RH</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-xs text-zinc-400">Pressure Diff</span>
                  <span className="text-sm font-mono text-emerald-400">+12 Pa</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-xs text-zinc-400">Particle Count</span>
                  <span className="text-sm font-mono text-white">ISO {zone.isoClass?.slice(-1) || '8'}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                  <span className="text-xs text-zinc-400">Air Changes/hr</span>
                  <span className="text-sm font-mono text-white">
                    {zone.isoClass === 'ISO 7' ? '≥30' : zone.isoClass === 'ISO 5' ? '240-300' : '15-20'}
                  </span>
                </div>
              </div>
            </div>

            {/* Capacity & Utilization */}
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Utilization
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Equipment Utilization</span>
                    <span className="text-white font-mono">{runningCount}/{zoneEquipment.length}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${zoneEquipment.length > 0 ? (runningCount / zoneEquipment.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Batch Capacity</span>
                    <span className="text-white font-mono">{zoneBatches.length}/3</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (zoneBatches.length / 3) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function FactoryFloorPlan() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [expandedZone, setExpandedZone] = useState<Zone | null>(null);

  const getZoneEquipment = (zoneId: string) => equipment.filter(e => e.zoneId === zoneId);
  const getZoneBatches = (zoneType: string) =>
    batches.filter(b => {
      const stage = b.currentStage.toLowerCase();
      if (zoneType === 'upstream') return stage.includes('ferment') || stage.includes('seed') || stage.includes('media');
      if (zoneType === 'downstream') return stage.includes('harvest') || stage.includes('centrifuge') || stage.includes('dry');
      if (zoneType === 'formulation') return stage.includes('mix') || stage.includes('formul');
      if (zoneType === 'qc') return stage.includes('qc') || stage.includes('test');
      if (zoneType === 'packaging') return stage.includes('fill') || stage.includes('seal') || stage.includes('label');
      if (zoneType === 'warehouse') return stage.includes('stor') || stage.includes('dispatch');
      return false;
    });

  // Sort zones by process flow order
  const zoneOrder = ['upstream', 'downstream', 'formulation', 'qc', 'packaging', 'warehouse', 'utilities'];
  const sortedZones = [...zones].sort((a, b) => zoneOrder.indexOf(a.type) - zoneOrder.indexOf(b.type));

  return (
    <div className="relative">
      {/* KPI Header */}
      <FacilityHeader />

      {/* SVG Floor Plan */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              Pure Advance Facility
            </h2>
            <p className="text-xs text-zinc-500">INSEBT Biopesticide Production • GMP-Compliant Layout • Click zones to explore</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {/* Legend */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Running</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-zinc-400">Maintenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-zinc-400">Offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 border-t border-dashed border-violet-500" />
              <span className="text-zinc-400">Material Flow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded border border-yellow-500/50" />
              <span className="text-zinc-400">ISO 5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded border border-blue-500/50" />
              <span className="text-zinc-400">ISO 7</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded border border-gray-500/50" />
              <span className="text-zinc-400">ISO 8</span>
            </div>
          </div>
        </div>

        <svg viewBox="0 0 1120 500" className="w-full min-w-[900px]" style={{ maxHeight: '560px' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f1f23" strokeWidth="0.5" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="1120" height="500" fill="url(#grid)" rx="12" />

          {/* Corridors */}
          <Corridor />

          {/* Material flow lines */}
          <MaterialFlowLines />

          {/* Zones */}
          {sortedZones.map((zone) => (
            <ZoneBlock
              key={zone.id}
              zone={zone}
              zoneEquipment={getZoneEquipment(zone.id)}
              zoneBatches={getZoneBatches(zone.type)}
              isSelected={selectedZone?.id === zone.id}
              isHovered={hoveredZone === zone.id}
              onSelect={() => {
                setSelectedZone(zone);
                setSelectedEquipment(null);
              }}
              onHover={(v) => setHoveredZone(v ? zone.id : null)}
              onEquipmentClick={(eq) => setSelectedEquipment(eq)}
              onExpand={() => setExpandedZone(zone)}
            />
          ))}
        </svg>
      </div>

      {/* Zone Detail Panel */}
      {selectedZone && !selectedEquipment && (
        <div className="mt-4 bg-zinc-900/80 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', zoneColor(selectedZone.type).bg)}>
                {ZONE_ICONS[selectedZone.type]}
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
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
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Batches</div>
              <div className="text-lg font-bold text-white">{getZoneBatches(selectedZone.type).length}</div>
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
                  <span className="text-base">{getEquipIcon(eq.name)}</span>
                  <div className={cn('w-2.5 h-2.5 rounded-full', eq.status === 'running' ? 'bg-emerald-500 animate-pulse' : eq.status === 'maintenance' ? 'bg-amber-500' : eq.status === 'offline' ? 'bg-red-500' : 'bg-slate-500')} />
                  <div>
                    <div className="text-sm text-white font-medium">{eq.name}</div>
                    <div className="text-xs text-zinc-500">{eq.vendor} • {eq.costRange}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', eq.efficiency >= 95 ? 'bg-emerald-500' : eq.efficiency >= 85 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${eq.efficiency}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{eq.efficiency}%</span>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor(eq.status))}>
                    {eq.status}
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
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
              <span className="text-xl">{getEquipIcon(selectedEquipment.name)}</span>
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedEquipment.name}</h3>
                <p className="text-xs text-zinc-500">{selectedEquipment.vendor} • {selectedEquipment.costRange}</p>
              </div>
            </div>
            <button onClick={() => setSelectedEquipment(null)} className="text-zinc-500 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Zone</div>
              <div className="text-sm font-bold text-white">
                {zones.find(z => z.id === selectedEquipment.zoneId)?.name || '—'}
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Specifications</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {Object.entries(selectedEquipment.specs).map(([key, value]) => (
              <div key={key} className="bg-zinc-800/30 rounded-lg p-2">
                <div className="text-[10px] text-zinc-600 uppercase">{key}</div>
                <div className="text-xs text-zinc-300 font-medium">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            {selectedEquipment.lastMaintenance && (
              <div className="flex items-center gap-1 text-zinc-500">
                <Clock className="w-3 h-3" />
                Last maintenance: {selectedEquipment.lastMaintenance}
              </div>
            )}
            {selectedEquipment.nextMaintenance && (
              <div className="flex items-center gap-1 text-amber-400/70">
                <AlertTriangle className="w-3 h-3" />
                Next maintenance: {selectedEquipment.nextMaintenance}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Expanded Zone View */}
      {expandedZone && (
        <ExpandedZoneView
          zone={expandedZone}
          zoneEquipment={getZoneEquipment(expandedZone.id)}
          zoneBatches={getZoneBatches(expandedZone.type)}
          onClose={() => setExpandedZone(null)}
          onEquipmentClick={(eq) => {
            setExpandedZone(null);
            setSelectedEquipment(eq);
          }}
        />
      )}
    </div>
  );
}
