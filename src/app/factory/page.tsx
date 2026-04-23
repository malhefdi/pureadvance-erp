import { AppShell } from '@/components/ui/app-shell';
import { FactoryFloorPlan } from '@/components/factory/factory-floor-plan';

export default function FactoryPage() {
  return (
    <AppShell>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Factory Floor</h1>
            <p className="text-sm text-zinc-500 mt-1">Interactive facility map — click zones and equipment for details</p>
          </div>
          <FactoryFloorPlan />
        </div>
    </AppShell>
  );
}
