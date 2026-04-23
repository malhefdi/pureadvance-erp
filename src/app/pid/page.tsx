import { AppShell } from '@/components/ui/app-shell';
import { PIDViewer } from '@/components/pid/pid-viewer';

export default function PIDPage() {
  return (
    <AppShell>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">P&ID Engineering</h1>
            <p className="text-sm text-zinc-500 mt-1">Piping & Instrumentation Diagrams — ISA-5.1 symbols, equipment lists, control loops, nozzle schedules</p>
          </div>
          <PIDViewer />
        </div>
    </AppShell>
  );
}
