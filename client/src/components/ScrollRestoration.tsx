import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'scroll_positions';

function getStoredPositions(): Record<string, number> {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveScrollPosition(path: string, position: number) {
  try {
    const positions = getStoredPositions();
    positions[path] = position;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage errors
  }
}

function getScrollPosition(path: string): number | null {
  try {
    const positions = getStoredPositions();
    return positions[path] ?? null;
  } catch {
    return null;
  }
}

export function ScrollRestoration() {
  const location = useLocation();

  // Save scroll position before leaving the page or refreshing
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      // Debounce scroll position saving
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        saveScrollPosition(location.pathname, window.scrollY);
      }, 100);
    };

    const handleBeforeUnload = () => {
      saveScrollPosition(location.pathname, window.scrollY);
    };

    // Save on scroll (debounced)
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Save before unload (refresh or navigation)
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  // Restore scroll position after the page loads
  useLayoutEffect(() => {
    const savedPosition = getScrollPosition(location.pathname);
    
    if (savedPosition !== null && savedPosition > 0) {
      // Temporarily disable smooth scrolling for instant restoration
      const html = document.documentElement;
      const originalScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      
      // Use multiple attempts to ensure content is fully rendered
      const restoreScroll = () => {
        window.scrollTo(0, savedPosition);
        html.style.scrollBehavior = originalScrollBehavior;
      };
      
      // First attempt immediately
      restoreScroll();
      
      // Second attempt after a short delay to catch any late-rendered content
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, savedPosition);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);

  return null;
}
