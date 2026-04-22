'use client';

import { zones, equipment, batches, materials, transferGates, orders } from '@/lib/mock-data';
import { cn, statusColor } from '@/lib/utils';
import Link from 'next/link';
import {
  Factory, Cog, Boxes, FlaskConical, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, Map, GitBranch, Package
} from 'lucide-react';

const activeBatches = batches.filter(b => ['in_progress', 'qc_pending'].includes(b.status));
const runningEquipment = equipment.filter(e => e.status === 'running');
const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance');
const offlineEquipment = equipment.filter(e => e.status === 'offline');
const lowStockMaterials = materials.filter(m => m.stockLevel <= m.reorderPoint * 1.5);
const completedGates = transferGates.filter(g => g.status === 'completed');
const activeGates = transferGates.filter(g => g.status === 'in_progress');
const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

const _totalEquipmentValue = equipment.reduce((sum, e) => {
  const match = e.costRange.match(/\$(\d+)K/g);
  if (match && match.length > 0) {
    const avg = match.reduce((s, m) => s + parseInt(m.replace('$', '').replace('K', '')) * 1000, 0) / match.length;
    return sum + avg;
  }
  return sum;
}, 0);

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Boxes className="w-4 h-4" />}
          label="Active Batches"
          value={activeBatches.length.toString()}
          detail={`${batches.length} total`}
          color="text-violet-400"
          href="/batches"
        />
        <StatCard
          icon={<Cog className="w-4 h-4" />}
          label="Equipment Online"
          value={`${runningEquipment.length}/${equipment.length}`}
          detail={`${maintenanceEquipment.length} maintenance`}
          color="text-emerald-400"
          href="/equipment"
        />
        <StatCard
          icon={<FlaskConical className="w-4 h-4" />}
          label="QC Pending"
          value={batches.filter(b => b.status === 'qc_pending').length.toString()}
          detail="Awaiting release"
          color="text-amber-400"
          href="/qc"
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Transfer Gates"
          value={`${completedGates.length}/${transferGates.length}`}
          detail={activeGates[0]?.name || 'All complete'}
          color="text-cyan-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Batches */}
        <div className="lg:col-span-2 bg-zinc-900/50 rounded-xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-violet-400" />
              Active Batches
            </h2>
            <Link href="/batches" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeBatches.map(batch => (
              <div key={batch.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono font-bold text-white">{batch.id}</div>
                  <div className="text-xs text-zinc-500">{batch.product}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-zinc-400">{batch.currentStage}</div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor(batch.status))}>
                    {batch.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {activeBatches.length === 0 && (
              <div className="text-center py-6 text-zinc-500 text-sm">No active batches</div>
            )}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Alerts
            </h2>
            <div className="space-y-2">
              {maintenanceEquipment.map(eq => (
                <div key={eq.id} className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-300">
                  <Cog className="w-3 h-3 flex-shrink-0" />
                  {eq.name} — Under maintenance
                </div>
              ))}
              {offlineEquipment.map(eq => (
                <div key={eq.id} className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-xs text-red-300">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  {eq.name} — Offline
                </div>
              ))}
              {lowStockMaterials.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 text-xs text-orange-300">
                  <Package className="w-3 h-3 flex-shrink-0" />
                  {m.name} — Low stock ({m.stockLevel} {m.unit})
                </div>
              ))}
              {pendingOrders.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-300">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {pendingOrders.length} pending order{pendingOrders.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <Map className="w-4 h-4" />, label: 'Factory Map', href: '/factory' },
                { icon: <GitBranch className="w-4 h-4" />, label: 'Process Flow', href: '/process' },
                { icon: <Boxes className="w-4 h-4" />, label: 'Batches', href: '/batches' },
                { icon: <FlaskConical className="w-4 h-4" />, label: 'QC Lab', href: '/qc' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 p-3 bg-zinc-800/30 rounded-lg border border-zinc-800 hover:border-violet-500/30 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Facility Overview Bar */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Factory className="w-4 h-4 text-violet-400" />
          Facility Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {zones.map(zone => {
            const zoneEq = equipment.filter(e => e.zoneId === zone.id);
            const running = zoneEq.filter(e => e.status === 'running').length;
            return (
              <Link
                key={zone.id}
                href="/factory"
                className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-800 hover:border-violet-500/30 transition-colors"
              >
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{zone.type}</div>
                <div className="text-sm font-semibold text-white mb-1">{zone.area}m²</div>
                <div className="text-xs text-zinc-400">{running}/{zoneEq.length} online</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, detail, color, href }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
      <div className={cn('flex items-center gap-2 mb-3', color)}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-500">{detail}</div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
