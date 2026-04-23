'use client';

import { batches } from '@/lib/mock-data';
import { cn, statusColor } from '@/lib/utils';
import { AppShell } from '@/components/ui/app-shell';
import { FlaskConical, CheckCircle2, XCircle, AlertCircle, BarChart3 } from 'lucide-react';

export default function QCPage() {
  const batchesWithQC = batches.filter(b => b.qcResults.length > 0);

  const allTests = batchesWithQC.flatMap(b => b.qcResults);
  const passedTests = allTests.filter(t => t.result === 'pass').length;
  const failedTests = allTests.filter(t => t.result === 'fail').length;
  const pendingTests = allTests.filter(t => t.result === 'pending').length;

  return (
    <AppShell>

      <div>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Quality Control</h1>
            <p className="text-sm text-zinc-500 mt-1">Batch release decisions — spore count, pH, bioassay, stability</p>
          </div>

          {/* QC Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Passed</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{passedTests}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Failed</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{failedTests}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Pending</span>
              </div>
              <div className="text-2xl font-bold text-amber-400">{pendingTests}</div>
            </div>
          </div>

          {/* QC Decision Tree Visualization */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 mb-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              Release Decision Logic
            </h2>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {['Spore Count', 'pH', 'Suspensibility', 'Wetting Time', 'Moisture', 'Particle Size', 'Bioassay', 'Stability'].map((test, i) => (
                <div key={test} className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700 text-xs text-zinc-300">
                    {test}
                  </div>
                  {i < 7 && <div className="text-zinc-600">→</div>}
                </div>
              ))}
              <div className="text-zinc-600">→</div>
              <div className="px-4 py-2 bg-violet-600/20 rounded-lg border border-violet-500/30 text-xs text-violet-400 font-semibold">
                RELEASE DECISION
              </div>
            </div>
          </div>

          {/* Batch QC Results */}
          {batchesWithQC.map(batch => (
            <div key={batch.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-red-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{batch.id}</h3>
                    <p className="text-xs text-zinc-500">{batch.product} — {batch.size}kg</p>
                  </div>
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full border', statusColor(batch.status))}>
                  {batch.status.replace('_', ' ')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500 uppercase tracking-wider">
                      <th className="text-left py-2 px-3">Test</th>
                      <th className="text-left py-2 px-3">Target</th>
                      <th className="text-left py-2 px-3">Actual</th>
                      <th className="text-left py-2 px-3">Result</th>
                      <th className="text-left py-2 px-3">Tested By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.qcResults.map(qc => (
                      <tr key={qc.id} className="border-t border-zinc-800/50">
                        <td className="py-2.5 px-3 text-zinc-300 font-medium">{qc.testName}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{qc.targetValue}</td>
                        <td className="py-2.5 px-3 text-white font-semibold">{qc.actualValue} {qc.unit}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn(
                            'flex items-center gap-1 font-semibold',
                            qc.result === 'pass' ? 'text-emerald-400' :
                            qc.result === 'fail' ? 'text-red-400' :
                            'text-amber-400'
                          )}>
                            {qc.result === 'pass' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {qc.result === 'fail' && <XCircle className="w-3.5 h-3.5" />}
                            {qc.result === 'pending' && <AlertCircle className="w-3.5 h-3.5" />}
                            {qc.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-500">{qc.testedBy || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {batch.yield && (
                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Overall Yield</span>
                  <span className="text-emerald-400 font-bold">{batch.yield}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

