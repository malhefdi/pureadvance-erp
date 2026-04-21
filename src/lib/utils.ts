import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusColor(status: string) {
  const colors: Record<string, string> = {
    running: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    idle: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    maintenance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    offline: 'bg-red-500/20 text-red-400 border-red-500/30',
    cleaning: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    // Batch
    queued: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    qc_pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    released: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    on_hold: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    // QC
    pass: 'bg-emerald-500/20 text-emerald-400',
    fail: 'bg-red-500/20 text-red-400',
    pending: 'bg-amber-500/20 text-amber-400',
    adjustment_needed: 'bg-orange-500/20 text-orange-400',
    // Gate
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
    // Order
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

export function zoneColor(type: string) {
  const colors: Record<string, { bg: string; stroke: string; fill: string }> = {
    upstream: { bg: 'bg-emerald-500/10', stroke: 'stroke-emerald-500', fill: 'fill-emerald-500/10' },
    downstream: { bg: 'bg-blue-500/10', stroke: 'stroke-blue-500', fill: 'fill-blue-500/10' },
    formulation: { bg: 'bg-amber-500/10', stroke: 'stroke-amber-500', fill: 'fill-amber-500/10' },
    packaging: { bg: 'bg-purple-500/10', stroke: 'stroke-purple-500', fill: 'fill-purple-500/10' },
    qc: { bg: 'bg-red-500/10', stroke: 'stroke-red-500', fill: 'fill-red-500/10' },
    warehouse: { bg: 'bg-cyan-500/10', stroke: 'stroke-cyan-500', fill: 'fill-cyan-500/10' },
    utilities: { bg: 'bg-slate-500/10', stroke: 'stroke-slate-400', fill: 'fill-slate-500/10' },
  };
  return colors[type] || colors.utilities;
}

export function zoneBorderColor(type: string) {
  const colors: Record<string, string> = {
    upstream: 'border-emerald-500/40',
    downstream: 'border-blue-500/40',
    formulation: 'border-amber-500/40',
    packaging: 'border-purple-500/40',
    qc: 'border-red-500/40',
    warehouse: 'border-cyan-500/40',
    utilities: 'border-slate-500/40',
  };
  return colors[type] || 'border-slate-500/40';
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}
