'use client';

import { Sidebar } from '@/components/ui/sidebar';
import dynamic from 'next/dynamic';

const ProcessFlow = dynamic(() => import('@/components/flow/process-flow').then(m => m.ProcessFlow), { ssr: false });

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="pl-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Process Flow</h1>
            <p className="text-sm text-zinc-500 mt-1">End-to-end production workflow — seed culture to market dispatch</p>
          </div>
          <ProcessFlow />
        </div>
      </main>
    </div>
  );
}
