import { Sidebar } from '@/components/ui/sidebar';
import { FactoryFloorPlan } from '@/components/factory/factory-floor-plan';

export default function FactoryPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="pl-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Factory Floor</h1>
            <p className="text-sm text-zinc-500 mt-1">Interactive facility map — click zones and equipment for details</p>
          </div>
          <FactoryFloorPlan />
        </div>
      </main>
    </div>
  );
}
