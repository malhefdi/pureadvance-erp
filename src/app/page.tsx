import { Sidebar } from '@/components/ui/sidebar';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="pl-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Command Center</h1>
            <p className="text-sm text-zinc-500 mt-1">Pure Advance Manufacturing ERP — INSEBT Biopesticide Production</p>
          </div>
          <Dashboard />
        </div>
      </main>
    </div>
  );
}
