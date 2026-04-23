'use client';

import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { PWAInstallPrompt, OfflineIndicator } from '@/components/pwa/install-prompt';
import { cn } from '@/lib/utils';

function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main className={cn(
      'min-h-screen bg-zinc-950 p-8 transition-all duration-300',
      collapsed ? 'pl-20' : 'pl-72'
    )}>
      {children}
    </main>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <OfflineIndicator />
      <Sidebar />
      <MainContent>{children}</MainContent>
      <PWAInstallPrompt />
    </SidebarProvider>
  );
}
