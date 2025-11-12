import { IConsentProvider } from './IConsentProvider.js';

/**
 * Configuration options for OneTrust provider
 */
export interface OneTrustConfig {
  /** OneTrust SDK script URL */
  scriptUrl: string;
  /** OneTrust domain script ID */
  domainScript: string;
  /** Enable document language support */
  documentLanguage?: boolean;
}

/**
 * OneTrust consent management provider implementation.
 * Encapsulates all OneTrust-specific logic and global variable access.
 */
export class OneTrustProvider implements IConsentProvider {
  private config: OneTrustConfig;

  constructor(config: OneTrustConfig) {
    this.config = config;
  }

  getProviderName(): string {
    return 'OneTrust';
  }

  /**
   * Reads active consents from OneTrust's global OptanonActiveGroups variable.
   * Format: "C0001,C0002,C0004" -> ['C0001', 'C0002', 'C0004']
   */
  getActiveConsents(): string[] {
    if (typeof window !== 'undefined' && (window as any).OptanonActiveGroups) {
      const groups = (window as any).OptanonActiveGroups as string;
      return groups.split(',').filter(Boolean);
    }
    console.warn('[OneTrustProvider] OptanonActiveGroups not available');
    return [];
  }

  /**
   * Registers a callback for OneTrust consent change events.
   * Uses OneTrust's Optanon.OnConsentChanged() API.
   */
  onConsentChanged(callback: () => void): void {
    if (typeof window !== 'undefined' && (window as any).Optanon) {
      (window as any).Optanon.OnConsentChanged(callback);
      console.log('[OneTrustProvider] Consent change listener registered');
    } else {
      console.warn('[OneTrustProvider] Optanon not available for event binding');
    }
  }

  /**
   * Shows the OneTrust consent banner.
   * Tries modern API first (Onetrust.ShowAlertBox), falls back to legacy (Optanon.ToggleInfoDisplay).
   */
  showBanner(): void {
    const win = window as any;

    // Try modern OneTrust API first
    if (typeof win.Onetrust !== 'undefined' && win.Onetrust.ShowAlertBox) {
      win.Onetrust.ShowAlertBox();
      console.log('[OneTrustProvider] Banner shown via Onetrust.ShowAlertBox()');
    }
    // Fallback to legacy OneTrust API
    else if (typeof win.Optanon !== 'undefined' && win.Optanon.ToggleInfoDisplay) {
      win.Optanon.ToggleInfoDisplay();
      console.log('[OneTrustProvider] Banner shown via Optanon.ToggleInfoDisplay()');
    }
    else {
      console.error('[OneTrustProvider] OneTrust SDK not available - cannot show banner');
    }
  }

  /**
   * Injects the OneTrust SDK script into the document head.
   * Applies OneTrust-specific data attributes for configuration.
   */
  injectProviderScript(): void {
    const script = document.createElement('script');
    script.src = this.config.scriptUrl;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';

    // OneTrust-specific configuration attributes
    if (this.config.documentLanguage) {
      script.setAttribute('data-document-language', 'true');
    }
    script.setAttribute('data-domain-script', this.config.domainScript);

    document.head.appendChild(script);
    console.log(`[OneTrustProvider] SDK script injected: ${this.config.scriptUrl}`);
  }

  /**
   * Returns OneTrust-specific CSS class name for consent categories.
   * Format: 'optanon-category-{categoryId}'
   */
  getConsentCategoryClass(categoryId: string): string {
    return `optanon-category-${categoryId}`;
  }

  /**
   * Optional initialization - sets up global OptanonWrapper callback.
   * This is called by OneTrust SDK after it loads.
   */
  initialize(): void {
    console.log('[OneTrustProvider] Provider initialized');
    // Note: OptanonWrapper callback will be set up in OneTrustWrapper.ts
    // to maintain separation of concerns
  }
}
