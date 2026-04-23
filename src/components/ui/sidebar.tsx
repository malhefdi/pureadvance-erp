'use client';

import { useState, createContext, useContext } from 'react';
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
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

// Sidebar context for other components to read collapsed state
const SidebarContext = createContext({ collapsed: false, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/factory', label: 'Factory Floor', icon: Map },
  { href: '/process', label: 'Process Flow', icon: GitBranch },
  { href: '/batches', label: 'Batch Tracking', icon: Boxes },
  { href: '/equipment', label: 'Equipment', icon: Cog },
  { href: '/qc', label: 'Quality Control', icon: FlaskConical },
  { href: '/bom', label: 'BOM & Materials', icon: FileText },
  { href: '/bioprocess', label: 'Bioprocess Eng.', icon: FlaskConical },
  { href: '/pid', label: 'P&ID Engineering', icon: Layers },
];

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col z-50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('border-b border-zinc-800', collapsed ? 'p-3' : 'p-6')}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0">
            <Factory className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">PURE ADVANCE</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Manufacturing ERP</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 space-y-1', collapsed ? 'p-2' : 'p-3')}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center p-3 border-t border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-zinc-800">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Facility Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400">All Systems Operational</span>
          </div>
          <div className="text-[10px] text-zinc-600 mt-2">500m² • INSEBT Bt Production</div>
        </div>
      )}
    </aside>
  );
}
