'use client';

import { useState, useEffect } from 'react';

// ============================================================
// USE MEDIA QUERY — responsive breakpoint detection
// ============================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Pre-built breakpoints
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isSmall = useMediaQuery('(max-width: 1024px)');

  return { isMobile, isTablet, isDesktop, isSmall };
}
