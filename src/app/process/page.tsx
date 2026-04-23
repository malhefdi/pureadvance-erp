import { AppShell } from '@/components/ui/app-shell';
import { ProcessFlowSVG } from '@/components/flow/process-flow-svg';

export default function ProcessPage() {
  return (
    <AppShell>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Process Flow</h1>
            <p className="text-sm text-zinc-500 mt-1">Bt Biopesticide production — ISA-88 batch process, material flow, QC gates</p>
          </div>
          <ProcessFlowSVG />
        </div>
    </AppShell>
  );
}
