'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';

// ============================================================
// BEFOREINSTALLPROMPT EVENT TYPE
// ============================================================

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// ============================================================
// PWA INSTALL PROMPT
// ============================================================

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  if (isInstalled || !showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-zinc-900/95 backdrop-blur-lg rounded-xl border border-zinc-700 p-4 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Install PA ERP</div>
              <div className="text-[10px] text-zinc-500">Works offline • Fast access</div>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-zinc-400 mb-3">
          Install Pure Advance ERP on your device for quick access and offline support.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// OFFLINE STATUS INDICATOR
// ============================================================

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-amber-950 text-center text-xs py-1.5 font-medium">
      ⚡ You&apos;re offline — showing cached data
    </div>
  );
}
