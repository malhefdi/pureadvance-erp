'use client';

import { useState } from 'react';
import { batches, materials } from '@/lib/mock-data';
import { cn, statusColor } from '@/lib/utils';
import { Batch } from '@/types/erp';
import { Sidebar } from '@/components/ui/sidebar';
import { Boxes, ChevronRight, Clock, Cog, FlaskConical, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function BatchesPage() {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="pl-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Batch Tracking</h1>
            <p className="text-sm text-zinc-500 mt-1">Full batch genealogy — raw materials to finished product</p>
          </div>

          {/* Batch List */}
          <div className="space-y-3 mb-6">
            {batches.map(batch => (
              <button
                key={batch.id}
                onClick={() => setSelectedBatch(selectedBatch?.id === batch.id ? null : batch)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all',
                  selectedBatch?.id === batch.id
                    ? 'bg-violet-950/30 border-violet-500/30'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Boxes className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-mono font-bold text-white">{batch.id}</div>
                      <div className="text-xs text-zinc-500">{batch.product} — {batch.size}kg</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">{batch.currentStage}</div>
                      <div className="text-xs text-zinc-600">{batch.startDate} → {batch.estimatedCompletion}</div>
                    </div>
                    <span className={cn('text-xs px-2.5 py-1 rounded-full border', statusColor(batch.status))}>
                      {batch.status.replace('_', ' ')}
                    </span>
                    <ChevronRight className={cn('w-4 h-4 text-zinc-600 transition-transform', selectedBatch?.id === batch.id && 'rotate-90')} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Batch Detail */}
          {selectedBatch && (
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedBatch.id}</h2>
                  <p className="text-xs text-zinc-500">{selectedBatch.notes}</p>
                </div>
                <button onClick={() => setSelectedBatch(null)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Batch Timeline */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    Production Timeline
                  </h3>
                  <div className="space-y-1">
                    {['Media Prep', 'Seed Culture', 'Fermentation', 'Harvest', 'Drying', 'Formulation', 'Homogenization', 'QC Checkpoint', 'Filling', 'Sealing', 'Labeling', 'Final Release', 'Storage', 'Dispatch'].map((step, i) => {
                      const currentIdx = ['media', 'seed', 'ferment', 'harvest', 'dry', 'formul', 'homogeni', 'qc', 'fill', 'seal', 'label', 'release', 'stor', 'dispatch']
                        .findIndex(k => selectedBatch.currentStage.toLowerCase().includes(k));
                      const isActive = i === currentIdx;
                      const isComplete = i < currentIdx;
                      const isPending = i > currentIdx;

                      return (
                        <div key={step} className="flex items-center gap-3">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                            isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                            isActive ? 'bg-violet-500/20 text-violet-400 ring-2 ring-violet-500/50' :
                            'bg-zinc-800 text-zinc-600'
                          )}>
                            {isComplete ? '✓' : i + 1}
                          </div>
                          <div className={cn(
                            'text-sm',
                            isComplete ? 'text-emerald-400' :
                            isActive ? 'text-violet-400 font-semibold' :
                            'text-zinc-600'
                          )}>
                            {step}
                          </div>
                          {isActive && (
                            <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* QC Results & Materials */}
                <div className="space-y-6">
                  {/* QC Results */}
                  {selectedBatch.qcResults.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                        <FlaskConical className="w-4 h-4 text-red-400" />
                        QC Results
                      </h3>
                      <div className="space-y-2">
                        {selectedBatch.qcResults.map(qc => (
                          <div key={qc.id} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg text-xs">
                            <div>
                              <div className="text-zinc-300 font-medium">{qc.testName}</div>
                              <div className="text-zinc-500">Target: {qc.targetValue}</div>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                'font-bold',
                                qc.result === 'pass' ? 'text-emerald-400' :
                                qc.result === 'fail' ? 'text-red-400' :
                                'text-amber-400'
                              )}>
                                {qc.result === 'pass' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                                {qc.result === 'fail' && <XCircle className="w-4 h-4 inline mr-1" />}
                                {qc.result === 'pending' && <AlertCircle className="w-4 h-4 inline mr-1" />}
                                {qc.actualValue} {qc.unit}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Materials Used */}
                  {selectedBatch.materials.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                        <Cog className="w-4 h-4 text-amber-400" />
                        Materials
                      </h3>
                      <div className="space-y-2">
                        {selectedBatch.materials.map((m, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg text-xs">
                            <div className="text-zinc-300">{m.name}</div>
                            <div className="text-right">
                              <div className="text-zinc-400">{m.actualAmount > 0 ? m.actualAmount : '—'}/{m.plannedAmount} {m.unit}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Batch Info */}
                  <div className="p-3 bg-zinc-800/30 rounded-lg space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Start Date</span>
                      <span className="text-zinc-300">{selectedBatch.startDate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Est. Completion</span>
                      <span className="text-zinc-300">{selectedBatch.estimatedCompletion}</span>
                    </div>
                    {selectedBatch.yield && (
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Yield</span>
                        <span className="text-emerald-400 font-bold">{selectedBatch.yield}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Batch Size</span>
                      <span className="text-zinc-300">{selectedBatch.size} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
