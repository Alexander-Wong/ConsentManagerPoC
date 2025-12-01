import { CookieCategory } from "../CookieCategory.js";
import { IConsentProvider } from "../providers/IConsentProvider.js";

/**
 * Service responsible for script injection and management.
 */
export class ScriptInjectionService {
  constructor(private provider: IConsentProvider) {}

  /**
   * Creates and injects a script element for a given cookie category.
   * Handles inline code, external sources, and deferred script loading.
   */
  injectCategoryScript(category: CookieCategory): void {
    if (!category || (!category.code && !category.src && !category.defer)) {
      console.warn('[ScriptInjectionService] Invalid or empty category - skipping injection');
      return;
    }

    if (typeof document === 'undefined') {
      console.error('[ScriptInjectionService] Document is undefined - cannot inject script');
      return;
    }

    try {
      const script = document.createElement("script");
      script.type = "text/plain";

      // Handle deferred script loading
      if (category.defer) {
        script.src = "./defer.js";
        script.setAttribute("data-scripts", JSON.stringify(category.defer));
      }

      // Handle inline code
      if (category.code && typeof category.code === 'string') {
        script.textContent = category.code;
      }

      // Handle external source
      if (category.src && typeof category.src === 'string') {
        script.src = category.src;
      }

      // Apply consent category classes
      if (category.cookies && Array.isArray(category.cookies) && category.cookies.length > 0) {
        const providerClasses = category.cookies
          .filter(cookie => cookie != null)
          .map(cookie => this.provider.getConsentCategoryClass(cookie))
          .filter(className => className && className.length > 0)
          .join(" ");

        if (providerClasses) {
          script.className = providerClasses;
        }
      }

      if (!document.head) {
        console.error('[ScriptInjectionService] Document head is not available');
        return;
      }

      document.head.appendChild(script);
    } catch (error) {
      console.error('[ScriptInjectionService] Failed to inject category script:', error);
    }
  }

  /**
   * Injects all category scripts from configuration.
   */
  injectAllCategoryScripts(categories: CookieCategory[]): void {
    if (!categories || !Array.isArray(categories)) {
      console.warn('[ScriptInjectionService] Invalid categories array');
      return;
    }

    categories.forEach(category => {
      if (category) {
        this.injectCategoryScript(category);
      }
    });
  }

  /**
   * Injects the provider's SDK script.
   */
  injectProviderScript(): void {
    if (!this.provider) {
      console.error('[ScriptInjectionService] Provider is not available');
      return;
    }

    try {
      this.provider.injectProviderScript();

      // Call initialization hook
      if (this.provider.initialize && typeof this.provider.initialize === 'function') {
        this.provider.initialize();
      }
    } catch (error) {
      console.error('[ScriptInjectionService] Failed to inject provider script:', error);
    }
  }
}
