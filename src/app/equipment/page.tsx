'use client';

import { useState } from 'react';
import { equipment, zones } from '@/lib/mock-data';
import { cn, statusColor } from '@/lib/utils';
import { Sidebar } from '@/components/ui/sidebar';
import { Cog, Clock, TrendingUp, Search } from 'lucide-react';

export default function EquipmentPage() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredEquipment = equipment.filter(eq => {
    if (filter !== 'all' && eq.status !== filter) return false;
    if (search && !eq.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = ['all', 'running', 'idle', 'maintenance', 'offline'];
  const counts = {
    all: equipment.length,
    running: equipment.filter(e => e.status === 'running').length,
    idle: equipment.filter(e => e.status === 'idle').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    offline: equipment.filter(e => e.status === 'offline').length,
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="pl-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Equipment Management</h1>
            <p className="text-sm text-zinc-500 mt-1">30+ equipment across 6 facility zones</p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-zinc-900/50 rounded-lg border border-zinc-800 p-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                    filter === cat ? 'bg-violet-600/20 text-violet-400' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {cat} ({counts[cat as keyof typeof counts]})
                </button>
              ))}
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(eq => {
              const zone = zones.find(z => z.id === eq.zoneId);
              return (
                <div key={eq.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        eq.status === 'running' ? 'bg-emerald-500/20' :
                        eq.status === 'maintenance' ? 'bg-amber-500/20' :
                        eq.status === 'offline' ? 'bg-red-500/20' :
                        'bg-zinc-800'
                      )}>
                        <Cog className={cn(
                          'w-4 h-4',
                          eq.status === 'running' ? 'text-emerald-400' :
                          eq.status === 'maintenance' ? 'text-amber-400' :
                          eq.status === 'offline' ? 'text-red-400' :
                          'text-zinc-500'
                        )} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{eq.name}</div>
                        <div className="text-xs text-zinc-500">{eq.vendor}</div>
                      </div>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor(eq.status))}>
                      {eq.status}
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.entries(eq.specs).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="bg-zinc-800/30 rounded-lg p-2">
                        <div className="text-[9px] text-zinc-600 uppercase">{key}</div>
                        <div className="text-xs text-zinc-300 font-medium truncate">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {eq.hoursRunning.toLocaleString()}h
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <TrendingUp className="w-3 h-3" />
                      {eq.efficiency}% efficiency
                    </div>
                    <div className="text-xs text-zinc-600">{eq.costRange}</div>
                  </div>

                  {zone && (
                    <div className="mt-2 text-[10px] text-zinc-600">
                      📍 {zone.name.split('—')[1]?.trim() || zone.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
