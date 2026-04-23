'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getZonePID, getZoneKPISummary } from '@/lib/pid-data';
import { simulateZoneTick, resetSimulator } from '@/lib/pid-data/simulator';
import type { ZonePIDData, ZoneKPISummary } from '@/types/pid-zone';

// ============================================================
// USE ZONE LIVE DATA — polling hook with simulation
// ============================================================

interface UseZoneLiveDataOptions {
  interval?: number;       // Polling interval in ms (default: 2000)
  autoStart?: boolean;     // Start polling immediately (default: true)
  simulate?: boolean;      // Use simulator vs static data (default: true)
}

interface UseZoneLiveDataReturn {
  data: ZonePIDData | null;
  kpi: ZoneKPISummary | null;
  isLive: boolean;
  isPaused: boolean;
  tickCount: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setInterval: (ms: number) => void;
}

export function useZoneLiveData(
  zoneId: string,
  options: UseZoneLiveDataOptions = {}
): UseZoneLiveDataReturn {
  const {
    interval: initialInterval = 2000,
    autoStart = true,
    simulate = true,
  } = options;

  const [data, setData] = useState<ZonePIDData | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [pollInterval, setPollInterval] = useState(initialInterval);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  // Load base data when zone changes
  useEffect(() => {
    const base = getZonePID(zoneId);
    if (base) {
      setData(base);
      resetSimulator(zoneId);
      setTickCount(0);
    }
  }, [zoneId]);

  // Computed KPI
  const kpi = useMemo(() => {
    if (!data) return null;
    return getZoneKPISummary(zoneId);
  }, [data, zoneId]);

  // Tick function
  const tick = useCallback(() => {
    if (pausedRef.current) return;

    setData(prev => {
      if (!prev) return prev;
      const updated = simulate ? simulateZoneTick(prev) : prev;
      setTickCount(c => c + 1);
      return updated;
    });
  }, [simulate]);

  // Start polling
  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsLive(true);
    setIsPaused(false);
    pausedRef.current = false;

    intervalRef.current = setInterval(tick, pollInterval);
  }, [tick, pollInterval]);

  // Pause
  const pause = useCallback(() => {
    setIsPaused(true);
    pausedRef.current = true;
  }, []);

  // Resume
  const resume = useCallback(() => {
    setIsPaused(false);
    pausedRef.current = false;
  }, []);

  // Reset to base data
  const reset = useCallback(() => {
    const base = getZonePID(zoneId);
    if (base) {
      resetSimulator(zoneId);
      setData(base);
      setTickCount(0);
    }
  }, [zoneId]);

  // Change interval
  const changeInterval = useCallback((ms: number) => {
    setPollInterval(ms);
    if (intervalRef.current && !pausedRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, ms);
    }
  }, [tick]);

  // Auto-start
  useEffect(() => {
    if (autoStart && data) {
      start();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data, autoStart]);

  // Restart interval when pollInterval changes
  useEffect(() => {
    if (isLive && !isPaused && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, pollInterval);
    }
  }, [pollInterval]);

  return {
    data,
    kpi,
    isLive,
    isPaused,
    tickCount,
    start,
    pause,
    resume,
    reset,
    setInterval: changeInterval,
  };
}
