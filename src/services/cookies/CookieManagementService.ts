/**
 * Service responsible for cookie lifecycle management.
 */
export class CookieManagementService {
  /**
   * Deletes a single cookie by name.
   */
  deleteCookie(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.warn('[CookieManagementService] Invalid cookie name - cannot delete');
      return;
    }

    if (typeof document === 'undefined') {
      console.error('[CookieManagementService] Document is undefined - cannot delete cookie');
      return;
    }

    try {
      document.cookie = `${name}=; Path=/; Max-Age=0; Secure; SameSite=None`;
      console.log(`🧹 Cookie deleted: ${name}`);
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[CookieManagementService] Failed to delete cookie ${name}:`, message);
    }
  }

  /**
   * Deletes multiple cookies by name.
   */
  deleteCookies(names: string[]): void {
    if (!names || !Array.isArray(names)) {
      console.warn('[CookieManagementService] Invalid names array');
      return;
    }

    names.forEach(name => {
      if (name) {
        this.deleteCookie(name);
      }
    });
  }

  /**
   * Gets a cookie value by name.
   */
  getCookie(name: string): string | null {
    if (!name || typeof name !== 'string') {
      console.warn('[CookieManagementService] Invalid cookie name');
      return null;
    }

    try {
      const cookies = this.getAllCookies();
      return cookies[name] || null;
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[CookieManagementService] Failed to get cookie:', message);
      return null;
    }
  }

  /**
   * Gets all cookies as a key-value object.
   */
  getAllCookies(): Record<string, string> {
    if (typeof document === 'undefined') {
      console.warn('[CookieManagementService] Document is undefined - cannot get cookies');
      return {};
    }

    try {
      const cookieString = document.cookie;
      if (!cookieString || cookieString.trim().length === 0) {
        return {};
      }

      return cookieString.split(';').reduce((acc, cookie) => {
        if (!cookie) return acc;

        const trimmedCookie = cookie.trim();
        const equalIndex = trimmedCookie.indexOf('=');

        if (equalIndex > 0) {
          const key = trimmedCookie.substring(0, equalIndex);
          const value = trimmedCookie.substring(equalIndex + 1);
          if (key) {
            acc[key] = value || '';
          }
        }

        return acc;
      }, {} as Record<string, string>);
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[CookieManagementService] Failed to get all cookies:', message);
      return {};
    }
  }

  /**
   * Checks if a cookie exists.
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }
}

