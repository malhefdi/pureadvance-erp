'use client';

import type { PIDControlLoop } from '@/types/pid';
import type { InstrumentLiveData, EquipmentLiveData } from '@/types/pid-zone';
import { cn } from '@/lib/utils';

// ============================================================
// CONTROL LOOP DIAGRAM — ISA Standard PID Block
// ============================================================
//
// Layout:
//   SP → ⊕ → [Controller] → Output → [Process] → PV
//         ↑                                      │
//         └──────────── feedback ────────────────┘
//
// Shows: Setpoint, Process Variable, Output, Mode, Alarms
// ============================================================

interface ControlLoopDiagramProps {
  loop: PIDControlLoop;
  instrumentValues?: InstrumentLiveData[];
  equipmentStatus?: EquipmentLiveData[];
  compact?: boolean;
}

export function ControlLoopDiagram({
  loop,
  instrumentValues = [],
  equipmentStatus = [],
  compact = false,
}: ControlLoopDiagramProps) {
  // Find PV value from instruments in this loop
  const pvInstrument = instrumentValues.find(
    v => loop.instruments.includes(v.instrumentId)
  );

  const pv = pvInstrument?.value;
  const sp = pvInstrument?.setpoint;
  const alarmState = pvInstrument?.alarmState || 'normal';

  // Output device status
  const outputEq = equipmentStatus.find(
    e => loop.instruments.some(id => id.includes(e.equipmentId))
  );

  const error = pv !== undefined && sp !== undefined ? pv - sp : undefined;
  const errorPct = error !== undefined && sp !== undefined && sp !== 0
    ? ((error / sp) * 100).toFixed(1)
    : undefined;

  const alarmColor =
    alarmState === 'critical' ? 'border-red-500/40 bg-red-500/5' :
    alarmState === 'warning' ? 'border-amber-500/40 bg-amber-500/5' :
    'border-zinc-800 bg-zinc-900/50';

  const pvColor =
    alarmState === 'critical' ? 'text-red-400' :
    alarmState === 'warning' ? 'text-amber-400' :
    'text-emerald-400';

  if (compact) {
    return (
      <div className={cn('rounded-lg border p-2 flex items-center gap-3', alarmColor)}>
        <span className="font-mono text-[10px] font-bold text-violet-400">{loop.tag}</span>
        <LoopBlock label="SP" value={sp !== undefined ? `${sp.toFixed(1)}` : loop.setpoint} color="text-blue-400" />
        <ArrowRight />
        <LoopBlock label="PV" value={pv !== undefined ? `${pv.toFixed(1)} ${pvInstrument?.unit || ''}` : '—'} color={pvColor} />
        {error !== undefined && (
          <>
            <ArrowRight />
            <LoopBlock label="ERR" value={`${error > 0 ? '+' : ''}${error.toFixed(1)}`} color={error > 0 ? 'text-red-400' : 'text-zinc-400'} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border p-4 transition-colors', alarmColor)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-violet-400">{loop.tag}</span>
          <span className="text-xs text-zinc-300">{loop.name}</span>
        </div>
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase',
          loop.type === 'cascade' ? 'bg-amber-500/20 text-amber-400' :
          loop.type === 'single' ? 'bg-emerald-500/20 text-emerald-400' :
          'bg-zinc-700 text-zinc-400'
        )}>
          {loop.type}
        </span>
      </div>

      {/* PID Block Diagram */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* Setpoint */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">SP</div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1 text-xs font-mono text-blue-400 min-w-[60px] text-center">
            {sp !== undefined ? `${sp.toFixed(1)}` : loop.setpoint}
          </div>
        </div>

        {/* Summing junction */}
        <SummingJunction />

        {/* Controller */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Controller</div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-center min-w-[80px]">
            <div className="text-[10px] text-zinc-400">PID</div>
            {error !== undefined && (
              <div className={cn('text-xs font-mono font-bold mt-0.5', error > 1 ? 'text-red-400' : 'text-zinc-300')}>
                e={error > 0 ? '+' : ''}{error.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        <ArrowRight />

        {/* Output */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Output</div>
          <div className="bg-violet-500/10 border border-violet-500/30 rounded px-2 py-1 text-xs text-zinc-300 min-w-[70px] text-center">
            {loop.output}
          </div>
          {outputEq && (
            <div className={cn('text-[9px] mt-1 font-medium',
              outputEq.status === 'running' ? 'text-emerald-400' : 'text-zinc-500'
            )}>
              {outputEq.status}
            </div>
          )}
        </div>

        <ArrowRight />

        {/* Process */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Process</div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-400 min-w-[60px] text-center">
            {loop.measuredVariable}
          </div>
        </div>

        <ArrowRight />

        {/* PV (Process Variable) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">PV</div>
          <div className={cn(
            'border rounded px-2 py-1 text-xs font-mono font-bold min-w-[80px] text-center',
            alarmState === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
            alarmState === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          )}>
            {pv !== undefined ? `${pv.toFixed(1)} ${pvInstrument?.unit || ''}` : '—'}
          </div>
        </div>

        {/* Feedback arrow */}
        <svg width="40" height="50" className="flex-shrink-0 -mt-6">
          <path d="M5,5 L35,5 L35,45 L5,45" fill="none" stroke="#52525b" strokeWidth="1" />
          <polygon points="5,41 5,49 10,45" fill="#52525b" />
        </svg>
      </div>

      {/* Alarm details */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800/50">
        {loop.alarmHigh && (
          <AlarmBadge label="AH" value={loop.alarmHigh} type="high" triggered={alarmState === 'critical'} />
        )}
        {loop.alarmLow && (
          <AlarmBadge label="AL" value={loop.alarmLow} type="low" triggered={alarmState === 'critical'} />
        )}
        {loop.interlock && (
          <div className="text-[10px] text-zinc-500">
            Interlock: <span className="text-amber-400 font-mono">{loop.interlock}</span>
          </div>
        )}
        {errorPct && (
          <div className="text-[10px] text-zinc-500 ml-auto">
            Error: <span className={cn('font-mono', Math.abs(parseFloat(errorPct)) > 5 ? 'text-red-400' : 'text-zinc-400')}>
              {errorPct}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function SummingJunction() {
  return (
    <svg width="24" height="24" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#52525b" strokeWidth="1" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="#52525b" strokeWidth="1" />
      <line x1="12" y1="6" x2="12" y2="18" stroke="#52525b" strokeWidth="1" />
      <polygon points="18,12 14,9 14,15" fill="#52525b" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="12" className="flex-shrink-0">
      <line x1="2" y1="6" x2="16" y2="6" stroke="#52525b" strokeWidth="1" />
      <polygon points="16,3 20,6 16,9" fill="#52525b" />
    </svg>
  );
}

function LoopBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[8px] text-zinc-600 uppercase">{label}</div>
      <div className={cn('text-xs font-mono font-medium', color)}>{value}</div>
    </div>
  );
}

function AlarmBadge({ label, value, type, triggered }: {
  label: string;
  value: string;
  type: 'high' | 'low';
  triggered: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-mono',
      triggered
        ? 'bg-red-500/10 border-red-500/30 text-red-400'
        : type === 'high'
          ? 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
          : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
    )}>
      <span className="font-bold">{label}</span>
      <span>{value}</span>
    </div>
  );
}
