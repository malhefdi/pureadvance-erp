import { Sidebar } from '@/components/ui/sidebar';
import { BioprocessTools } from '@/components/bioprocess/bioprocess-tools';

export default function BioprocessPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="pl-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Bioprocess Engineering</h1>
            <p className="text-sm text-zinc-500 mt-1">Scale-up, mass transfer, media costing, sensor selection, economics — built for INSEBT Bt production</p>
          </div>
          <BioprocessTools />
        </div>
      </main>
    </div>
  );
}
