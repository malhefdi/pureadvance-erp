'use client';

import { useState, useMemo } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { DollarSign, TrendingDown, BarChart3, Factory, FlaskConical } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type Mode = 'fed-batch' | 'batch' | 'perfusion';

interface FermentationInputs {
  // Upstream
  bioreactorVolume_L: number;
  workingVolumePercent: number;
  titer_gL: number;
  batchDuration_days: number;
  turnaround_days: number;
  mediaCost_L: number;
  feedCost_L: number;
  batchSuccessRate: number;

  // Downstream
  dspYieldPercent: number;
  dspCostPerGram: number;

  // Facility
  facilityCostPerDay: number;
  laborCostPerDay: number;
  qcCostPerBatch: number;
  consumablesPerBatch: number;
  utilizationDaysYear: number;

  // Perfusion
  perfusionRateVVD: number;
  steadyStateTiter_gL: number;
  perfusionRunDuration_days: number;
}

interface EconomicsResult {
  mode: Mode;
  costPerGram: number;
  costPerLiter: number;
  annualYield_kg: number;
  annualCost: number;
  batchesPerYear: number;
  breakdown: { category: string; cost: number; percent: number }[];
  sensitivityData: { titer: number; cogs: number }[];
  annualSummary: {
    totalBatches: number;
    successfulBatches: number;
    totalVolume_L: number;
    totalProduct_kg: number;
    totalUpstreamCost: number;
    totalDownstreamCost: number;
    totalFacilityCost: number;
    totalCOGS: number;
  };
}

// ============================================================
// CALCULATION ENGINE
// ============================================================

function calcFermentationEconomics(inputs: FermentationInputs, mode: Mode): EconomicsResult {
  const workingVolume = inputs.bioreactorVolume_L * (inputs.workingVolumePercent / 100);

  if (mode === 'perfusion') {
    // Perfusion: continuous operation, steady-state production
    const totalRunDays = inputs.perfusionRunDuration_days || 30;
    const runsPerYear = Math.floor(inputs.utilizationDaysYear / (totalRunDays + inputs.turnaround_days));
    const mediaPerRun = workingVolume * inputs.perfusionRateVVD * totalRunDays; // L
    const productPerRun = workingVolume * (inputs.steadyStateTiter_gL || inputs.titer_gL) * (totalRunDays / 1000); // kg

    const upstreamCostPerRun = (mediaPerRun * inputs.mediaCost_L) + (inputs.consumablesPerBatch);
    const downstreamCostPerRun = productPerRun * 1000 * inputs.dspCostPerGram * (inputs.dspYieldPercent / 100);
    const facilityCostPerRun = (inputs.facilityCostPerDay + inputs.laborCostPerDay) * totalRunDays;
    const qcCostPerRun = inputs.qcCostPerBatch * Math.ceil(totalRunDays / 7); // QC weekly

    const totalCostPerRun = upstreamCostPerRun + downstreamCostPerRun + facilityCostPerRun + qcCostPerRun;
    const annualCost = totalCostPerRun * runsPerYear;
    const annualYield = productPerRun * runsPerYear * (inputs.batchSuccessRate / 100);
    const costPerGram = annualYield > 0 ? annualCost / (annualYield * 1000) : 0;

    const breakdown = [
      { category: 'Upstream (Media + Feeds)', cost: Math.round(upstreamCostPerRun), percent: Math.round((upstreamCostPerRun / totalCostPerRun) * 100) },
      { category: 'Downstream (DSP)', cost: Math.round(downstreamCostPerRun), percent: Math.round((downstreamCostPerRun / totalCostPerRun) * 100) },
      { category: 'Facility & Labor', cost: Math.round(facilityCostPerRun), percent: Math.round((facilityCostPerRun / totalCostPerRun) * 100) },
      { category: 'QC/QA & Consumables', cost: Math.round(qcCostPerRun + inputs.consumablesPerBatch), percent: Math.round(((qcCostPerRun + inputs.consumablesPerBatch) / totalCostPerRun) * 100) },
    ];

    // Sensitivity: COGS vs titer
    const sensitivityData = [0.5, 1, 2, 3, 5, 8, 10, 15, 20].map(t => {
      const ppr = workingVolume * t * (totalRunDays / 1000);
      const ac = ppr * runsPerYear * (inputs.batchSuccessRate / 100) * 1000;
      return { titer: t, cogs: ac > 0 ? annualCost / ac : 0 };
    });

    return {
      mode: 'perfusion',
      costPerGram: Math.round(costPerGram * 100) / 100,
      costPerLiter: Math.round(totalCostPerRun / workingVolume * 100) / 100,
      annualYield_kg: Math.round(annualYield * 100) / 100,
      annualCost: Math.round(annualCost),
      batchesPerYear: runsPerYear,
      breakdown,
      sensitivityData,
      annualSummary: {
        totalBatches: runsPerYear,
        successfulBatches: Math.round(runsPerYear * inputs.batchSuccessRate / 100),
        totalVolume_L: Math.round(workingVolume * runsPerYear),
        totalProduct_kg: Math.round(annualYield * 100) / 100,
        totalUpstreamCost: Math.round(upstreamCostPerRun * runsPerYear),
        totalDownstreamCost: Math.round(downstreamCostPerRun * runsPerYear),
        totalFacilityCost: Math.round(facilityCostPerRun * runsPerYear),
        totalCOGS: Math.round(annualCost),
      },
    };
  }

  // Batch or Fed-Batch
  const totalCycleDays = inputs.batchDuration_days + inputs.turnaround_days;
  const batchesPerYear = Math.floor(inputs.utilizationDaysYear / totalCycleDays);
  const successfulBatches = Math.round(batchesPerYear * (inputs.batchSuccessRate / 100));

  // Costs per batch
  const mediaVolume = workingVolume * (mode === 'fed-batch' ? 1.5 : 1); // Fed-batch uses more media
  const feedVolume = mode === 'fed-batch' ? workingVolume * 0.3 : 0; // 30% feed volume for fed-batch
  const mediaCost = mediaVolume * inputs.mediaCost_L;
  const feedCost = feedVolume * inputs.feedCost_L;
  const totalUpstreamPerBatch = mediaCost + feedCost + inputs.consumablesPerBatch;

  // DSP
  const productPerBatch_g = workingVolume * inputs.titer_gL;
  const dspCostPerBatch = productPerBatch_g * inputs.dspCostPerGram;
  const finalProductPerBatch_g = productPerBatch_g * (inputs.dspYieldPercent / 100);

  // Facility
  const facilityCostPerBatch = inputs.facilityCostPerDay * inputs.batchDuration_days;
  const laborCostPerBatch = inputs.laborCostPerDay * inputs.batchDuration_days;
  const qcCostPerBatch = inputs.qcCostPerBatch;

  const totalCostPerBatch = totalUpstreamPerBatch + dspCostPerBatch + facilityCostPerBatch + laborCostPerBatch + qcCostPerBatch;
  const costPerGram = finalProductPerBatch_g > 0 ? totalCostPerBatch / finalProductPerBatch_g : 0;
  const costPerLiter = totalCostPerBatch / workingVolume;

  const annualCost = totalCostPerBatch * successfulBatches;
  const annualYield_kg = (finalProductPerBatch_g * successfulBatches) / 1000;

  const breakdown = [
    { category: 'Upstream (Media + Feeds)', cost: Math.round(totalUpstreamPerBatch), percent: Math.round((totalUpstreamPerBatch / totalCostPerBatch) * 100) },
    { category: 'Downstream (DSP)', cost: Math.round(dspCostPerBatch), percent: Math.round((dspCostPerBatch / totalCostPerBatch) * 100) },
    { category: 'Facility Depreciation', cost: Math.round(facilityCostPerBatch), percent: Math.round((facilityCostPerBatch / totalCostPerBatch) * 100) },
    { category: 'Labor', cost: Math.round(laborCostPerBatch), percent: Math.round((laborCostPerBatch / totalCostPerBatch) * 100) },
    { category: 'QC/QA & Consumables', cost: Math.round(qcCostPerBatch + inputs.consumablesPerBatch), percent: Math.round(((qcCostPerBatch + inputs.consumablesPerBatch) / totalCostPerBatch) * 100) },
  ];

  // Sensitivity: COGS vs titer (the most important economic lever)
  const sensitivityData = [0.1, 0.5, 1, 2, 3, 5, 8, 10, 15, 20, 30].map(t => {
    const fpg = workingVolume * t;
    const fpfg = fpg * (inputs.dspYieldPercent / 100);
    const dspCost = fpg * inputs.dspCostPerGram;
    const totalCost = totalUpstreamPerBatch + dspCost + facilityCostPerBatch + laborCostPerBatch + qcCostPerBatch;
    return { titer: t, cogs: fpfg > 0 ? totalCost / fpfg : 0 };
  });

  return {
    mode,
    costPerGram: Math.round(costPerGram * 100) / 100,
    costPerLiter: Math.round(costPerLiter * 100) / 100,
    annualYield_kg: Math.round(annualYield_kg * 100) / 100,
    annualCost: Math.round(annualCost),
    batchesPerYear,
    breakdown,
    sensitivityData,
    annualSummary: {
      totalBatches: batchesPerYear,
      successfulBatches,
      totalVolume_L: Math.round(workingVolume * successfulBatches),
      totalProduct_kg: Math.round(annualYield_kg * 100) / 100,
      totalUpstreamCost: Math.round(totalUpstreamPerBatch * successfulBatches),
      totalDownstreamCost: Math.round(dspCostPerBatch * successfulBatches),
      totalFacilityCost: Math.round((facilityCostPerBatch + laborCostPerBatch) * successfulBatches),
      totalCOGS: Math.round(annualCost),
    },
  };
}

// ============================================================
// COMPONENT
// ============================================================

export function FermentationEconomics() {
  const [inputs, setInputs] = useState<FermentationInputs>({
    bioreactorVolume_L: 500,
    workingVolumePercent: 70,
    titer_gL: 8, // Bt typical
    batchDuration_days: 3,
    turnaround_days: 1,
    mediaCost_L: 2.50,
    feedCost_L: 5.00,
    batchSuccessRate: 90,

    dspYieldPercent: 85,
    dspCostPerGram: 0.50,

    facilityCostPerDay: 200,
    laborCostPerDay: 100,
    qcCostPerBatch: 150,
    consumablesPerBatch: 200,
    utilizationDaysYear: 300,

    perfusionRateVVD: 1,
    steadyStateTiter_gL: 5,
    perfusionRunDuration_days: 30,
  });

  const [activeMode, setActiveMode] = useState<Mode>('fed-batch');

  const results = useMemo(() => ({
    'fed-batch': calcFermentationEconomics(inputs, 'fed-batch'),
    'batch': calcFermentationEconomics(inputs, 'batch'),
    'perfusion': calcFermentationEconomics(inputs, 'perfusion'),
  }), [inputs]);

  const current = results[activeMode];
  const bestMode = Object.entries(results).sort((a, b) => a[1].costPerGram - b[1].costPerGram)[0][0] as Mode;

  const set = (key: keyof FermentationInputs, value: string) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector + Comparison */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Fermentation Economics — COGS Calculator
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['fed-batch', 'batch', 'perfusion'] as Mode[]).map(mode => {
            const r = results[mode];
            const isBest = mode === bestMode;
            return (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all relative',
                  activeMode === mode
                    ? 'bg-violet-600/20 border-violet-500/30'
                    : 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600'
                )}
              >
                {isBest && (
                  <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                    BEST
                  </span>
                )}
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                  {mode === 'fed-batch' ? 'Fed-Batch' : mode === 'batch' ? 'Batch' : 'Perfusion'}
                </div>
                <div className="text-2xl font-bold text-white">{formatCurrency(r.costPerGram)}</div>
                <div className="text-xs text-zinc-400">per gram</div>
                <div className="text-xs text-zinc-500 mt-1">{r.annualYield_kg} kg/year</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Parameters */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Factory className="w-3 h-3" /> Upstream (Fermentation)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <InputField label="Bioreactor Volume (L)" value={inputs.bioreactorVolume_L} onChange={v => set('bioreactorVolume_L', v)} />
          <InputField label="Working Volume (%)" value={inputs.workingVolumePercent} onChange={v => set('workingVolumePercent', v)} />
          <InputField label="Titer (g/L)" value={inputs.titer_gL} onChange={v => set('titer_gL', v)} step={0.1} />
          <InputField label="Batch Duration (days)" value={inputs.batchDuration_days} onChange={v => set('batchDuration_days', v)} step={0.5} />
          <InputField label="Turnaround (days)" value={inputs.turnaround_days} onChange={v => set('turnaround_days', v)} step={0.5} />
          <InputField label="Media Cost ($/L)" value={inputs.mediaCost_L} onChange={v => set('mediaCost_L', v)} step={0.1} />
          <InputField label="Feed Cost ($/L)" value={inputs.feedCost_L} onChange={v => set('feedCost_L', v)} step={0.1} />
          <InputField label="Batch Success Rate (%)" value={inputs.batchSuccessRate} onChange={v => set('batchSuccessRate', v)} />
        </div>

        <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FlaskConical className="w-3 h-3" /> Downstream Processing (DSP)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <InputField label="DSP Yield (%)" value={inputs.dspYieldPercent} onChange={v => set('dspYieldPercent', v)} />
          <InputField label="DSP Cost ($/g crude)" value={inputs.dspCostPerGram} onChange={v => set('dspCostPerGram', v)} step={0.01} />
        </div>

        <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-3 h-3" /> Facility & Operations
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <InputField label="Facility Cost ($/day)" value={inputs.facilityCostPerDay} onChange={v => set('facilityCostPerDay', v)} />
          <InputField label="Labor ($/day)" value={inputs.laborCostPerDay} onChange={v => set('laborCostPerDay', v)} />
          <InputField label="QC/QA ($/batch)" value={inputs.qcCostPerBatch} onChange={v => set('qcCostPerBatch', v)} />
          <InputField label="Consumables ($/batch)" value={inputs.consumablesPerBatch} onChange={v => set('consumablesPerBatch', v)} />
          <InputField label="Utilization (days/year)" value={inputs.utilizationDaysYear} onChange={v => set('utilizationDaysYear', v)} />
        </div>

        {activeMode === 'perfusion' && (
          <>
            <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingDown className="w-3 h-3" /> Perfusion Parameters
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <InputField label="Perfusion Rate (VVD)" value={inputs.perfusionRateVVD} onChange={v => set('perfusionRateVVD' as keyof FermentationInputs, v)} step={0.1} />
              <InputField label="Steady-State Titer (g/L)" value={inputs.steadyStateTiter_gL} onChange={v => set('steadyStateTiter_gL', v)} step={0.1} />
              <InputField label="Run Duration (days)" value={inputs.perfusionRunDuration_days} onChange={v => set('perfusionRunDuration_days' as keyof FermentationInputs, v)} />
            </div>
          </>
        )}
      </div>

      {/* Results: Annual Summary */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4">Annual Production Summary — {activeMode === 'fed-batch' ? 'Fed-Batch' : activeMode === 'batch' ? 'Batch' : 'Perfusion'}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="COGS / gram" value={formatCurrency(current.costPerGram)} color="emerald" />
          <StatCard label="COGS / liter" value={formatCurrency(current.costPerLiter)} color="blue" />
          <StatCard label="Annual Yield" value={`${current.annualYield_kg} kg`} color="violet" />
          <StatCard label="Annual Cost" value={formatCurrency(current.annualCost)} color="amber" />
          <StatCard label="Total Batches" value={current.annualSummary.totalBatches.toString()} color="zinc" />
          <StatCard label="Successful" value={current.annualSummary.successfulBatches.toString()} color="emerald" />
          <StatCard label="Total Volume" value={`${(current.annualSummary.totalVolume_L / 1000).toFixed(1)}k L`} color="blue" />
          <StatCard label="Product Output" value={`${current.annualSummary.totalProduct_kg} kg`} color="violet" />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4">Cost Breakdown</h4>
        <div className="space-y-3">
          {current.breakdown.map(b => (
            <div key={b.category} className="flex items-center gap-4">
              <div className="w-44 text-xs text-zinc-300">{b.category}</div>
              <div className="flex-1 h-5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    b.category.includes('Upstream') ? 'bg-emerald-500' :
                    b.category.includes('Downstream') ? 'bg-blue-500' :
                    b.category.includes('Facility') ? 'bg-amber-500' :
                    b.category.includes('Labor') ? 'bg-violet-500' :
                    'bg-zinc-500'
                  )}
                  style={{ width: `${b.percent}%` }}
                />
              </div>
              <div className="w-24 text-right text-xs text-zinc-300 font-mono">{formatCurrency(b.cost)}</div>
              <div className="w-10 text-right text-xs text-zinc-500">{b.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity: COGS vs Titer */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4">
          COGS Sensitivity — The Most Important Economic Lever
        </h4>
        <div className="text-xs text-zinc-500 mb-4">
          Doubling titer from 1→2 g/L reduces COGS by 30-40%. Beyond 3-5 g/L, diminishing returns set in as DSP becomes the bottleneck.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 uppercase tracking-wider">
                <th className="text-left py-2 px-3">Titer (g/L)</th>
                <th className="text-right py-2 px-3">COGS ($/g)</th>
                <th className="text-right py-2 px-3">vs. Current</th>
                <th className="text-left py-2 px-3">Savings</th>
                <th className="text-left py-2 px-3 w-1/3">Visual</th>
              </tr>
            </thead>
            <tbody>
              {current.sensitivityData.map((d, i) => {
                const savings = current.costPerGram > 0 ? ((current.costPerGram - d.cogs) / current.costPerGram) * 100 : 0;
                const isCurrentTiter = Math.abs(d.titer - inputs.titer_gL) < 0.1;
                const maxCogs = Math.max(...current.sensitivityData.map(s => s.cogs));
                const barWidth = maxCogs > 0 ? (d.cogs / maxCogs) * 100 : 0;
                return (
                  <tr key={i} className={cn('border-t border-zinc-800/50', isCurrentTiter && 'bg-violet-500/10')}>
                    <td className="py-2 px-3">
                      <span className={cn('font-mono', isCurrentTiter ? 'text-violet-400 font-bold' : 'text-zinc-300')}>
                        {d.titer} {isCurrentTiter && '← current'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-200 font-mono font-bold">{formatCurrency(d.cogs)}</td>
                    <td className="py-2 px-3 text-right text-zinc-400">{savings > 0 ? `-${savings.toFixed(1)}%` : '—'}</td>
                    <td className="py-2 px-3">
                      <span className={savings > 30 ? 'text-emerald-400' : savings > 10 ? 'text-amber-400' : 'text-zinc-500'}>
                        {savings > 30 ? '★★★' : savings > 10 ? '★★' : savings > 0 ? '★' : '—'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', isCurrentTiter ? 'bg-violet-500' : 'bg-zinc-600')}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mode Comparison Table */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-4">Mode Comparison</h4>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-500 uppercase tracking-wider">
              <th className="text-left py-2 px-3">Metric</th>
              <th className="text-right py-2 px-3">Fed-Batch</th>
              <th className="text-right py-2 px-3">Batch</th>
              <th className="text-right py-2 px-3">Perfusion</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'COGS ($/g)', key: 'costPerGram', fmt: formatCurrency },
              { label: 'COGS ($/L)', key: 'costPerLiter', fmt: formatCurrency },
              { label: 'Annual Yield (kg)', key: 'annualYield_kg', fmt: (v: number) => `${v}` },
              { label: 'Batches/Year', key: 'batchesPerYear', fmt: (v: number) => `${v}` },
            ].map(row => (
              <tr key={row.key} className="border-t border-zinc-800/50">
                <td className="py-2 px-3 text-zinc-300">{row.label}</td>
                {(['fed-batch', 'batch', 'perfusion'] as Mode[]).map(mode => {
                  const val = (results[mode] as unknown as Record<string, unknown>)[row.key];
                  const isBest = val === Math.min(...Object.values(results).map(r => (r as unknown as Record<string, unknown>)[row.key] as number));
                  return (
                    <td key={mode} className={cn('py-2 px-3 text-right font-mono', isBest ? 'text-emerald-400 font-bold' : 'text-zinc-400')}>
                      {row.fmt(val as number)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function InputField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (_v: string) => void; step?: number }) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        step={step}
        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500/50"
      />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-zinc-800/30 rounded-lg p-3">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={cn('text-lg font-bold', `text-${color}-400`)}>{value}</div>
    </div>
  );
}
