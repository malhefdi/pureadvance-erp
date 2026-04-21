'use client';

import { useState } from 'react';
import { 
  calcScaleUp, BioreactorGeometry, ScaleUpResult,
  calcMediaCost, MediaComponent, BatchPlan, MediaCostResult,
  selectSensors, SensorCriteria, SensorRecommendation,
  planSeedTrain, SeedStage,
  calcCOGS, COGSInputs, COGSResult,
  calcGasBlend, GasBlendResult,
  calcKLaVanTRiet, calcSuperficialGasVelocity, calcUngassedPower, calcGassedPower, getPowerNumber,
  calcOTR, calcF0, SterilizationInput, SterilizationResult,
} from '@/lib/bioprocess';
import { cn, formatCurrency } from '@/lib/utils';
import { Beaker, Zap, Thermometer, Wind, DollarSign, Layers, FlaskConical, Target, ChevronRight } from 'lucide-react';

type ToolTab = 'scaleup' | 'media' | 'sensors' | 'seedtrain' | 'cogs' | 'gas' | 'kla';

const tabs: { id: ToolTab; label: string; icon: React.ReactNode }[] = [
  { id: 'scaleup', label: 'Scale-Up', icon: <Layers className="w-4 h-4" /> },
  { id: 'kla', label: 'kLa / OTR', icon: <Wind className="w-4 h-4" /> },
  { id: 'media', label: 'Media Cost', icon: <Beaker className="w-4 h-4" /> },
  { id: 'sensors', label: 'Sensors', icon: <Target className="w-4 h-4" /> },
  { id: 'seedtrain', label: 'Seed Train', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'cogs', label: 'COGS', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'gas', label: 'Gas Mixing', icon: <Zap className="w-4 h-4" /> },
];

// Default lab bioreactor geometry
const defaultLab: BioreactorGeometry = {
  volume: 50,
  tankDiameter: 0.30,
  impellerDiameter: 0.10,
  impellerType: 'rushton',
  numImpellers: 2,
  rpm: 500,
  gasFlowRate: 1.0,
};

// Default production bioreactor geometry
const defaultProd: BioreactorGeometry = {
  volume: 500,
  tankDiameter: 0.65,
  impellerDiameter: 0.22,
  impellerType: 'rushton',
  numImpellers: 2,
  rpm: 200,
  gasFlowRate: 1.0,
};

export function BioprocessTools() {
  const [activeTab, setActiveTab] = useState<ToolTab>('scaleup');

  return (
    <div className="space-y-6">
      {/* Tool Selector */}
      <div className="flex items-center gap-2 bg-zinc-900/50 rounded-xl border border-zinc-800 p-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tool Content */}
      {activeTab === 'scaleup' && <ScaleUpCalculator />}
      {activeTab === 'kla' && <KLaCalculator />}
      {activeTab === 'media' && <MediaCalculator />}
      {activeTab === 'sensors' && <SensorSelector />}
      {activeTab === 'seedtrain' && <SeedTrainPlanner />}
      {activeTab === 'cogs' && <COGSCalculator />}
      {activeTab === 'gas' && <GasMixingCalculator />}
    </div>
  );
}

// ============================================================
// SCALE-UP CALCULATOR
// ============================================================

function ScaleUpCalculator() {
  const [lab, setLab] = useState(defaultLab);
  const [prod, setProd] = useState(defaultProd);
  const results = calcScaleUp(lab, prod);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          Bioreactor Scale-Up: {lab.volume}L → {prod.volume}L
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lab Vessel */}
          <div className="space-y-3">
            <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">Lab Vessel (Current)</div>
            <InputField label="Working Volume (L)" value={lab.volume} onChange={v => setLab({...lab, volume: +v})} />
            <InputField label="Tank Diameter (m)" value={lab.tankDiameter} onChange={v => setLab({...lab, tankDiameter: +v})} />
            <InputField label="Impeller Diameter (m)" value={lab.impellerDiameter} onChange={v => setLab({...lab, impellerDiameter: +v})} />
            <InputField label="RPM" value={lab.rpm} onChange={v => setLab({...lab, rpm: +v})} />
            <InputField label="Gas Flow (vvm)" value={lab.gasFlowRate} onChange={v => setLab({...lab, gasFlowRate: +v})} />
          </div>

          {/* Production Vessel */}
          <div className="space-y-3">
            <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold">Production Vessel (Target)</div>
            <InputField label="Working Volume (L)" value={prod.volume} onChange={v => setProd({...prod, volume: +v})} />
            <InputField label="Tank Diameter (m)" value={prod.tankDiameter} onChange={v => setProd({...prod, tankDiameter: +v})} />
            <InputField label="Impeller Diameter (m)" value={prod.impellerDiameter} onChange={v => setProd({...prod, impellerDiameter: +v})} />
            <InputField label="Current RPM" value={prod.rpm} onChange={v => setProd({...prod, rpm: +v})} />
            <InputField label="Gas Flow (vvm)" value={prod.gasFlowRate} onChange={v => setProd({...prod, gasFlowRate: +v})} />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
              <th className="text-left py-3 px-4">Criterion</th>
              <th className="text-right py-3 px-4">Lab Value</th>
              <th className="text-right py-3 px-4">Target RPM</th>
              <th className="text-left py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="py-3 px-4 text-zinc-200 font-medium">{r.criterion}</td>
                <td className="py-3 px-4 text-right text-zinc-300 font-mono">
                  {r.labValue < 1 ? r.labValue.toExponential(2) : r.labValue.toFixed(1)} {r.unit}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={cn(
                    'font-bold text-lg',
                    r.targetRPM > 800 ? 'text-red-400' : r.targetRPM > 400 ? 'text-amber-400' : 'text-emerald-400'
                  )}>
                    {r.targetRPM}
                  </span>
                  <span className="text-zinc-500 ml-1">rpm</span>
                </td>
                <td className="py-3 px-4 text-zinc-500 max-w-xs">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// kLa / OTR CALCULATOR
// ============================================================

function KLaCalculator() {
  const [pv, setPv] = useState(1000);    // W/m³
  const [vs, setVs] = useState(0.01);    // m/s
  const [temp, setTemp] = useState(30);   // °C
  const [cl, setCl] = useState(3.0);     // mg/L (current DO)
  const [volume, setVolume] = useState(50); // L

  // O2 solubility decreases with temperature: ~8.2 at 25°C, ~7.0 at 35°C
  const cStar = 14.6 - 0.3943 * temp + 0.007714 * Math.pow(temp, 2) - 0.0000656 * Math.pow(temp, 3);
  const kLa = calcKLaVanTRiet(pv, vs, false);
  const kLa_h = kLa * 3600;
  const otr = calcOTR(kLa, cStar, cl);
  const otr_h = otr * 3600; // mg/(L·h)
  const otr_mmol = otr_h / 32; // mmol/(L·h)
  const totalO2Transfer = otr * volume; // mg/s for entire vessel

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Wind className="w-4 h-4 text-cyan-400" />
          kLa & Oxygen Transfer Calculator
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <InputField label="P/V (W/m³)" value={pv} onChange={v => setPv(+v)} />
          <InputField label="vs (m/s)" value={vs} onChange={v => setVs(+v)} step={0.001} />
          <InputField label="Temperature (°C)" value={temp} onChange={v => setTemp(+v)} />
          <InputField label="Current DO (mg/L)" value={cl} onChange={v => setCl(+v)} />
          <InputField label="Vessel Volume (L)" value={volume} onChange={v => setVolume(+v)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ResultCard label="kLa" value={kLa.toFixed(4)} unit="s⁻¹" color="cyan" />
          <ResultCard label="kLa" value={kLa_h.toFixed(1)} unit="h⁻¹" color="cyan" />
          <ResultCard label="OTR" value={otr_mmol.toFixed(2)} unit="mmol O₂/(L·h)" color="emerald" />
          <ResultCard label="C* (saturated)" value={cStar.toFixed(2)} unit="mg/L" color="violet" />
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Typical OUR Ranges</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { org: 'Bt (Bacillus)', our: '5–15', color: 'emerald' },
            { org: 'E. coli HCDC', our: '10–20', color: 'blue' },
            { org: 'CHO cells', our: '1–5', color: 'violet' },
            { org: 'Yeast (S. cerevisiae)', our: '5–10', color: 'amber' },
          ].map(item => (
            <div key={item.org} className="bg-zinc-800/30 rounded-lg p-3">
              <div className="text-xs text-zinc-300 font-medium">{item.org}</div>
              <div className={cn('text-lg font-bold mt-1', `text-${item.color}-400`)}>
                {item.our} <span className="text-xs text-zinc-500">mmol O₂/(L·h)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MEDIA COST CALCULATOR
// ============================================================

function MediaCalculator() {
  const defaultComponents: MediaComponent[] = [
    { name: 'Bt Concentrate', concentration_gL: 500, cost_per_kg: 0, supplier: 'In-house', stock_kg: 100, reorder_point_kg: 20 },
    { name: 'SIPERNAT® 22 S', concentration_gL: 100, cost_per_kg: 0.44, supplier: 'Evonik', stock_kg: 500, reorder_point_kg: 100 },
    { name: 'Monopropylene Glycol', concentration_gL: 70, cost_per_kg: 0.99, supplier: 'Multiple', stock_kg: 300, reorder_point_kg: 80 },
    { name: 'Unitop-MSO', concentration_gL: 30, cost_per_kg: 14.0, supplier: 'Rossari', stock_kg: 40, reorder_point_kg: 15 },
    { name: 'Sucrose', concentration_gL: 30, cost_per_kg: 0.45, supplier: 'Local', stock_kg: 400, reorder_point_kg: 100 },
    { name: 'Unitop-FL', concentration_gL: 20, cost_per_kg: 10.0, supplier: 'Rossari', stock_kg: 50, reorder_point_kg: 20 },
    { name: 'Unitop-203', concentration_gL: 20, cost_per_kg: 12.0, supplier: 'Unitop', stock_kg: 50, reorder_point_kg: 20 },
    { name: 'Xanthan Gum', concentration_gL: 10, cost_per_kg: 4.75, supplier: 'Multiple', stock_kg: 100, reorder_point_kg: 30 },
    { name: 'NaCl', concentration_gL: 7, cost_per_kg: 0.09, supplier: 'Local', stock_kg: 1000, reorder_point_kg: 200 },
    { name: 'BHT', concentration_gL: 0.5, cost_per_kg: 7.0, supplier: 'Multiple', stock_kg: 20, reorder_point_kg: 5 },
  ];

  const [components] = useState(defaultComponents);
  const [plan, setPlan] = useState<BatchPlan>({
    volume_L: 100,
    numBatches: 12,
    feedVolumePercent: 0,
    feedMediaCostPerL: 0,
  });

  const results = calcMediaCost(components, plan);
  const totalPerBatch = results.reduce((s, r) => s + r.costPerBatch, 0);
  const totalPerYear = results.reduce((s, r) => s + r.costPerYear, 0);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Beaker className="w-4 h-4 text-amber-400" />
          Media Formulation & Cost Estimator
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InputField label="Batch Volume (L)" value={plan.volume_L} onChange={v => setPlan({...plan, volume_L: +v})} />
          <InputField label="Batches / Year" value={plan.numBatches} onChange={v => setPlan({...plan, numBatches: +v})} />
          <ResultCard label="Cost / Batch" value={formatCurrency(totalPerBatch)} unit="" color="emerald" />
          <ResultCard label="Cost / Year" value={formatCurrency(totalPerYear)} unit="" color="violet" />
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
              <th className="text-left py-3 px-4">Component</th>
              <th className="text-right py-3 px-4">g/L</th>
              <th className="text-right py-3 px-4">kg/batch</th>
              <th className="text-right py-3 px-4">$ Cost/kg</th>
              <th className="text-right py-3 px-4">$/batch</th>
              <th className="text-right py-3 px-4">$/year</th>
              <th className="text-right py-3 px-4">Stock</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="py-3 px-4 text-zinc-200 font-medium">{r.component}</td>
                <td className="py-3 px-4 text-right text-zinc-300 font-mono">{components[i].concentration_gL}</td>
                <td className="py-3 px-4 text-right text-zinc-300 font-mono">{r.kgPerBatch}</td>
                <td className="py-3 px-4 text-right text-zinc-400">{formatCurrency(components[i].cost_per_kg)}</td>
                <td className="py-3 px-4 text-right text-zinc-200 font-semibold">{formatCurrency(r.costPerBatch)}</td>
                <td className="py-3 px-4 text-right text-zinc-300">{formatCurrency(r.costPerYear)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={cn(
                    'font-medium',
                    r.stockStatus === 'critical' ? 'text-red-400' : r.stockStatus === 'low' ? 'text-amber-400' : 'text-zinc-400'
                  )}>
                    {components[i].stock_kg} kg
                  </span>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-zinc-700 bg-zinc-800/30">
              <td className="py-3 px-4 text-white font-bold">TOTAL</td>
              <td></td>
              <td></td>
              <td></td>
              <td className="py-3 px-4 text-right text-emerald-400 font-bold">{formatCurrency(totalPerBatch)}</td>
              <td className="py-3 px-4 text-right text-violet-400 font-bold">{formatCurrency(totalPerYear)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// SENSOR SELECTOR
// ============================================================

function SensorSelector() {
  const [criteria, setCriteria] = useState<SensorCriteria>({
    scale: 'pilot',
    modality: 'microbial',
    vesselType: 'stainless',
    parameters: ['DO', 'pH', 'temperature', 'biomass', 'offgas'],
    environment: 'rd',
    budget: 'medium',
  });

  const results = selectSensors(criteria);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-400" />
          Bioreactor Sensor Selection Tool
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <SelectField
            label="Scale"
            value={criteria.scale}
            options={[{v:'lab',l:'Lab (2-10L)'},{v:'pilot',l:'Pilot (10-200L)'},{v:'production',l:'Production (200L+)'},{v:'commercial',l:'Commercial'}]}
            onChange={v => setCriteria({...criteria, scale: v as any})}
          />
          <SelectField
            label="Modality"
            value={criteria.modality}
            options={[{v:'microbial',l:'Microbial (Bt, E. coli)'},{v:'mammalian',l:'Mammalian (CHO, HEK)'},{v:'cell_therapy',l:'Cell Therapy'},{v:'viral_vector',l:'Viral Vector'}]}
            onChange={v => setCriteria({...criteria, modality: v as any})}
          />
          <SelectField
            label="Vessel Type"
            value={criteria.vesselType}
            options={[{v:'stainless',l:'Stainless Steel'},{v:'single_use',l:'Single-Use'}]}
            onChange={v => setCriteria({...criteria, vesselType: v as any})}
          />
          <SelectField
            label="Environment"
            value={criteria.environment}
            options={[{v:'rd',l:'R&D'},{v:'gmp',l:'cGMP'},{v:'clinical',l:'Clinical'}]}
            onChange={v => setCriteria({...criteria, environment: v as any})}
          />
          <SelectField
            label="Budget"
            value={criteria.budget}
            options={[{v:'low',l:'<$2K/ch'},{v:'medium',l:'$2-10K/ch'},{v:'high',l:'$10K+/ch'}]}
            onChange={v => setCriteria({...criteria, budget: v as any})}
          />
        </div>

        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Parameters to Measure</div>
        <div className="flex flex-wrap gap-2">
          {(['DO','pH','CO2','biomass','glucose','temperature','pressure','offgas'] as const).map(p => (
            <button
              key={p}
              onClick={() => {
                const params = criteria.parameters.includes(p)
                  ? criteria.parameters.filter(x => x !== p)
                  : [...criteria.parameters, p];
                setCriteria({...criteria, parameters: params});
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                criteria.parameters.includes(p)
                  ? 'bg-violet-600/20 text-violet-400 border-violet-500/30'
                  : 'bg-zinc-800/30 text-zinc-500 border-zinc-700 hover:text-white'
              )}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((s, i) => (
          <div key={i} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
                    s.priority === 'essential' ? 'bg-emerald-500/20 text-emerald-400' :
                    s.priority === 'recommended' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-zinc-700 text-zinc-400'
                  )}>
                    {s.priority}
                  </span>
                  <span className="text-[10px] text-zinc-500">{s.category}</span>
                </div>
                <div className="text-sm font-semibold text-white">{s.sensor}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.notes}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-violet-400">{s.score.toFixed(0)}</div>
                <div className="text-[10px] text-zinc-500">score</div>
                <div className="text-xs text-zinc-400 mt-1">{s.priceRange}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {s.vendors.map(v => (
                <span key={v} className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">{v}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SEED TRAIN PLANNER
// ============================================================

function SeedTrainPlanner() {
  const [targetVol, setTargetVol] = useState(500);
  const [expansionRatio, setExpansionRatio] = useState(10);
  const plan = planSeedTrain(targetVol, expansionRatio);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          Seed Train Expansion Planner
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InputField label="Target Volume (L)" value={targetVol} onChange={v => setTargetVol(+v)} />
          <InputField label="Expansion Ratio" value={expansionRatio} onChange={v => setExpansionRatio(+v)} />
        </div>
      </div>

      {/* Visual Flow */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {plan.map((stage, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 min-w-[160px]">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Stage {stage.stage}</div>
              <div className="text-sm font-semibold text-white mb-1">{stage.vesselType}</div>
              <div className="text-lg font-bold text-emerald-400">{stage.volume_L < 1 ? `${(stage.volume_L * 1000).toFixed(0)} mL` : `${stage.volume_L} L`}</div>
              {stage.duration_h > 0 && (
                <div className="text-xs text-zinc-500 mt-1">{stage.duration_h}h @ {stage.temp_C}°C</div>
              )}
              {stage.rpm > 0 && (
                <div className="text-xs text-zinc-500">{stage.rpm} rpm</div>
              )}
            </div>
            {i < plan.length - 1 && <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Summary Table */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-500 uppercase tracking-wider">
              <th className="text-left py-3 px-4">Stage</th>
              <th className="text-left py-3 px-4">Vessel</th>
              <th className="text-right py-3 px-4">Volume</th>
              <th className="text-right py-3 px-4">Duration</th>
              <th className="text-right py-3 px-4">Temp</th>
              <th className="text-right py-3 px-4">RPM</th>
            </tr>
          </thead>
          <tbody>
            {plan.map((s, i) => (
              <tr key={i} className="border-t border-zinc-800/50">
                <td className="py-2 px-4 text-zinc-300 font-mono">#{s.stage}</td>
                <td className="py-2 px-4 text-zinc-200">{s.vesselType}</td>
                <td className="py-2 px-4 text-right text-zinc-300 font-mono">
                  {s.volume_L < 1 ? `${(s.volume_L * 1000).toFixed(0)} mL` : `${s.volume_L} L`}
                </td>
                <td className="py-2 px-4 text-right text-zinc-400">{s.duration_h > 0 ? `${s.duration_h}h` : '—'}</td>
                <td className="py-2 px-4 text-right text-zinc-400">{s.temp_C > 0 ? `${s.temp_C}°C` : 'Frozen'}</td>
                <td className="py-2 px-4 text-right text-zinc-400">{s.rpm > 0 ? s.rpm : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// COGS CALCULATOR
// ============================================================

function COGSCalculator() {
  const [inputs, setInputs] = useState<COGSInputs>({
    mediaCostPerBatch: 104,
    inoculumCostPerBatch: 15,
    utilitiesCostPerBatch: 50,
    consumablesCostPerBatch: 25,
    operatorCount: 2,
    operatorCostPerHour: 15,
    batchDurationHours: 72,
    shiftsPerDay: 1,
    facilityCostPerMonth: 5000,
    maintenanceCostPerMonth: 1000,
    depreciationPerMonth: 2000,
    batchVolume_L: 100,
    yield_gL: 8, // ~8×10¹¹ CFU/g × some yield
    batchesPerYear: 12,
  });

  const result = calcCOGS(inputs);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Fermentation Economics — COGS Calculator
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InputField label="Media Cost/Batch ($)" value={inputs.mediaCostPerBatch} onChange={v => setInputs({...inputs, mediaCostPerBatch: +v})} />
          <InputField label="Inoculum Cost/Batch ($)" value={inputs.inoculumCostPerBatch} onChange={v => setInputs({...inputs, inoculumCostPerBatch: +v})} />
          <InputField label="Utilities/Batch ($)" value={inputs.utilitiesCostPerBatch} onChange={v => setInputs({...inputs, utilitiesCostPerBatch: +v})} />
          <InputField label="Consumables/Batch ($)" value={inputs.consumablesCostPerBatch} onChange={v => setInputs({...inputs, consumablesCostPerBatch: +v})} />
          <InputField label="Operators" value={inputs.operatorCount} onChange={v => setInputs({...inputs, operatorCount: +v})} />
          <InputField label="Operator $/hour" value={inputs.operatorCostPerHour} onChange={v => setInputs({...inputs, operatorCostPerHour: +v})} />
          <InputField label="Batch Duration (h)" value={inputs.batchDurationHours} onChange={v => setInputs({...inputs, batchDurationHours: +v})} />
          <InputField label="Batches/Year" value={inputs.batchesPerYear} onChange={v => setInputs({...inputs, batchesPerYear: +v})} />
          <InputField label="Batch Volume (L)" value={inputs.batchVolume_L} onChange={v => setInputs({...inputs, batchVolume_L: +v})} />
          <InputField label="Yield (g/L)" value={inputs.yield_gL} onChange={v => setInputs({...inputs, yield_gL: +v})} />
          <InputField label="Facility $/month" value={inputs.facilityCostPerMonth} onChange={v => setInputs({...inputs, facilityCostPerMonth: +v})} />
          <InputField label="Depreciation $/month" value={inputs.depreciationPerMonth} onChange={v => setInputs({...inputs, depreciationPerMonth: +v})} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <ResultCard label="Cost / Batch" value={formatCurrency(result.totalPerBatch)} unit="" color="violet" />
          <ResultCard label="Cost / Gram" value={formatCurrency(result.costPerGram)} unit="" color="emerald" />
          <ResultCard label="Cost / Liter" value={formatCurrency(result.costPerLiter)} unit="" color="blue" />
          <ResultCard label="Annual Cost" value={formatCurrency(result.annualCost)} unit="" color="amber" />
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Cost Breakdown</div>
        <div className="space-y-3">
          {result.breakdown.map(b => (
            <div key={b.category} className="flex items-center gap-4">
              <div className="w-32 text-xs text-zinc-300">{b.category}</div>
              <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    b.category === 'Direct Materials' ? 'bg-violet-500' :
                    b.category === 'Direct Labor' ? 'bg-blue-500' :
                    b.category === 'Utilities' ? 'bg-amber-500' :
                    'bg-zinc-500'
                  )}
                  style={{ width: `${b.percent}%` }}
                />
              </div>
              <div className="w-20 text-right text-xs text-zinc-300">{formatCurrency(b.amount)}</div>
              <div className="w-10 text-right text-xs text-zinc-500">{b.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GAS MIXING CALCULATOR
// ============================================================

function GasMixingCalculator() {
  const [targetO2, setTargetO2] = useState(30);
  const [totalFlow, setTotalFlow] = useState(10); // L/min
  const [volume, setVolume] = useState(50); // L

  const result = calcGasBlend(targetO2, totalFlow);
  const vvm = totalFlow / volume;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Bioreactor Gas Mixing Calculator
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <InputField label="Target O₂ (%)" value={targetO2} onChange={v => setTargetO2(+v)} />
          <InputField label="Total Gas Flow (L/min)" value={totalFlow} onChange={v => setTotalFlow(+v)} />
          <InputField label="Vessel Volume (L)" value={volume} onChange={v => setVolume(+v)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ResultCard label="Pure O₂ Flow" value={result.pureO2Flow.toFixed(2)} unit="L/min" color="blue" />
          <ResultCard label="Air Flow" value={result.airFlow.toFixed(2)} unit="L/min" color="emerald" />
          <ResultCard label="Actual O₂" value={result.actualO2Percent.toFixed(1)} unit="%" color="violet" />
          <ResultCard label="O₂ Cost/Hour" value={formatCurrency(result.costPerHour)} unit="" color="amber" />
        </div>

        <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg text-xs text-zinc-500">
          VVM: {vvm.toFixed(3)} • O₂ savings vs. full enrichment: {formatCurrency(result.savingsVsFullEnrichment)}/hr
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================

function InputField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: string) => void; step?: number }) {
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

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: {v: string; l: string}[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="bg-zinc-800/30 rounded-lg p-3">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={cn('text-lg font-bold', `text-${color}-400`)}>
        {value} <span className="text-xs text-zinc-500">{unit}</span>
      </div>
    </div>
  );
}
