import { AppShell } from '@/components/ui/app-shell';
import { ZonePIDPanel } from '@/components/pid/zone-pid-panel';

export default function PIDPage() {
  return (
    <AppShell>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">P&ID Engineering</h1>
            <p className="text-sm text-zinc-500 mt-1">Zone-level Piping & Instrumentation Diagrams — ISA-5.1 compliant, live data overlay</p>
          </div>
          <ZonePIDPanel initialZone="z-upstream" />
        </div>
    </AppShell>
  );
}
