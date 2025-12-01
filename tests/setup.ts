import { beforeEach } from 'vitest';

/**
 * Global test setup file.
 * Runs before each test to ensure clean state.
 */

beforeEach(() => {
  // Reset DOM between tests
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  }

  // Clear all cookies
  if (typeof document !== 'undefined' && document.cookie) {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name) {
        document.cookie = `${name}=; Max-Age=0; Path=/`;
      }
    });
  }

  // Reset window globals used by OneTrust
  if (typeof window !== 'undefined') {
    delete (window as any).OptanonActiveGroups;
    delete (window as any).Optanon;
    delete (window as any).Onetrust;
    delete (window as any).OptanonWrapper;
    delete (window as any).showProviderBanner;
  }
});
