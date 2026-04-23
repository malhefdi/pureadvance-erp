'use client';

import { AppShell } from '@/components/ui/app-shell';
import dynamic from 'next/dynamic';

const ProcessFlow = dynamic(() => import('@/components/flow/process-flow').then(m => m.ProcessFlow), { ssr: false });

export default function ProcessPage() {
  return (
    <AppShell>
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Process Flow</h1>
            <p className="text-sm text-zinc-500 mt-1">End-to-end production workflow — seed culture to market dispatch</p>
          </div>
          <ProcessFlow />
        </div>
    </AppShell>
  );
}
