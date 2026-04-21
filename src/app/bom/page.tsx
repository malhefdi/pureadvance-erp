'use client';

import { useState } from 'react';
import { materials, bomEntries } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Sidebar } from '@/components/ui/sidebar';
import { FileText, Calculator, Package, AlertTriangle, TrendingUp } from 'lucide-react';

export default function BOMPage() {
  const [batchSize, setBatchSize] = useState(100);

  const totalCostPerKg = materials.reduce((sum, m) => {
    const mid = (m.usagePercentMin + m.usagePercentMax) / 2 / 100;
    return sum + m.pricePerKg * mid;
  }, 0);

  const lowStock = materials.filter(m => m.stockLevel <= m.reorderPoint * 1.5);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="pl-64"><Sidebar /></div>
      <main className="pl-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Bill of Materials</h1>
            <p className="text-sm text-zinc-500 mt-1">Formulation materials — INSEBT Bt Biopesticide WP</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Materials</span>
              </div>
              <div className="text-2xl font-bold text-white">{materials.length}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Cost/kg</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalCostPerKg)}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Cost/batch</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalCostPerKg * batchSize)}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Low Stock</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">{lowStock.length}</div>
            </div>
          </div>

          {/* Batch Size Calculator */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5 mb-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-violet-400" />
              Batch Calculator
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-xs text-zinc-400">Batch Size (kg):</label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="flex-1 accent-violet-500"
              />
              <span className="text-lg font-bold text-white w-16 text-right">{batchSize}kg</span>
            </div>
          </div>

          {/* BOM Table */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Material</th>
                    <th className="text-left py-3 px-4">Function</th>
                    <th className="text-left py-3 px-4">Usage %</th>
                    <th className="text-right py-3 px-4">kg/batch</th>
                    <th className="text-right py-3 px-4">Cost/kg</th>
                    <th className="text-right py-3 px-4">Cost/batch</th>
                    <th className="text-left py-3 px-4">Supplier</th>
                    <th className="text-right py-3 px-4">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => {
                    const midPercent = (m.usagePercentMin + m.usagePercentMax) / 2;
                    const kgPerBatch = (midPercent / 100) * batchSize;
                    const costPerBatch = kgPerBatch * m.pricePerKg;
                    const isLow = m.stockLevel <= m.reorderPoint * 1.5;

                    return (
                      <tr key={m.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/20">
                        <td className="py-3 px-4">
                          <div className="text-zinc-200 font-medium">{m.name}</div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{m.function}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${(midPercent / 15) * 100}%` }}
                              />
                            </div>
                            <span className="text-zinc-300 font-mono">{m.usagePercentMin}–{m.usagePercentMax}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-300 font-mono">{kgPerBatch.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-zinc-400">{formatCurrency(m.pricePerKg)}</td>
                        <td className="py-3 px-4 text-right text-zinc-200 font-semibold">{formatCurrency(costPerBatch)}</td>
                        <td className="py-3 px-4 text-zinc-500 truncate max-w-[150px]">{m.supplier}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={isLow ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
                            {m.stockLevel} {m.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Water row */}
                  <tr className="border-t border-zinc-800/50 bg-zinc-800/10">
                    <td className="py-3 px-4 text-zinc-300 font-medium">Water (q.s.)</td>
                    <td className="py-3 px-4 text-zinc-400">Balance</td>
                    <td className="py-3 px-4 text-zinc-400 font-mono">q.s. to 100%</td>
                    <td className="py-3 px-4 text-right text-zinc-400 font-mono">
                      {(batchSize - materials.reduce((sum, m) => sum + ((m.usagePercentMin + m.usagePercentMax) / 2 / 100) * batchSize, 0)).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500">—</td>
                    <td className="py-3 px-4 text-right text-zinc-500">—</td>
                    <td className="py-3 px-4 text-zinc-500">—</td>
                    <td className="py-3 px-4 text-right text-zinc-500">—</td>
                  </tr>
                  {/* Total */}
                  <tr className="border-t-2 border-zinc-700 bg-zinc-800/30">
                    <td className="py-3 px-4 text-white font-bold">TOTAL</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 text-zinc-300 font-mono">100%</td>
                    <td className="py-3 px-4 text-right text-white font-bold font-mono">{batchSize.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-zinc-500">—</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold text-sm">
                      {formatCurrency(totalCostPerKg * batchSize)}
                    </td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <div className="mt-6 bg-amber-500/10 rounded-xl border border-amber-500/20 p-5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Low Stock Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lowStock.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                    <div>
                      <div className="text-sm text-zinc-200">{m.name}</div>
                      <div className="text-xs text-zinc-500">{m.supplier}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-400">{m.stockLevel} {m.unit}</div>
                      <div className="text-xs text-zinc-500">Reorder at {m.reorderPoint} {m.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
