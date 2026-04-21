'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Factory,
  GitBranch,
  Boxes,
  Cog,
  FlaskConical,
  LayoutDashboard,
  FileText,
  Map,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/factory', label: 'Factory Floor', icon: Map },
  { href: '/process', label: 'Process Flow', icon: GitBranch },
  { href: '/batches', label: 'Batch Tracking', icon: Boxes },
  { href: '/equipment', label: 'Equipment', icon: Cog },
  { href: '/qc', label: 'Quality Control', icon: FlaskConical },
  { href: '/bom', label: 'BOM & Materials', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">PURE ADVANCE</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Manufacturing ERP</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Facility Status</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-400">All Systems Operational</span>
        </div>
        <div className="text-[10px] text-zinc-600 mt-2">500m² • INSEBT Bt Production</div>
      </div>
    </aside>
  );
}
