import { ProviderType } from '../../types/ProviderType.js';
import { IConsentProvider } from '../IConsentProvider.js';
import { IMockProviderConfig } from '../IMockProviderConfig.js';

/**
 * Mock consent management provider implementation.
 * Useful for testing, development, and demonstrations without requiring a real consent platform.
 *
 * Features:
 * - In-memory consent storage
 * - Simulated SDK script injection
 * - Programmable consent states
 * - Manual banner display simulation
 */
export class MockProvider implements IConsentProvider {
  private config: IMockProviderConfig;
  private isInitialized = false;
  private activeConsents: string[] = [];
  private onConsentInitCallback?: () => void;
  private onConsentChangedCallback?: () => void;

  constructor(config: IMockProviderConfig) {
    this.config = config;

    // Initialize with default consents if provided
    if (config.initialConsents && Array.isArray(config.initialConsents)) {
      this.activeConsents = [...config.initialConsents];
    }

    // Set up mock global object for testing
    if (typeof window !== 'undefined') {
      // Create mock consent manager object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (window as any).MockConsentManager = {
        activeConsents: this.activeConsents,
        setConsents: (consents: string[]) => this.setConsents(consents),
        getConsents: () => this.getActiveConsents(),
        showBanner: () => this.showConsentBanner(),
      };
    }
  }

  getProviderName(): string {
    return ProviderType.MOCK;
  }

  getActiveConsents(): string[] {
    if (typeof window === 'undefined') {
      console.warn('[MockProvider] Window is undefined - returning stored consents');
      return [...this.activeConsents];
    }

    // Return copy to prevent external mutation
    return [...this.activeConsents];
  }

  /**
   * Programmatically set active consents (for testing purposes).
   * This simulates a user changing their consent preferences.
   *
   * @param consents - Array of consent category IDs (e.g., ['C0001', 'C0002'])
   */
  setConsents(consents: string[]): void {
    if (!Array.isArray(consents)) {
      console.error('[MockProvider] Consents must be an array');
      return;
    }

    const oldConsents = [...this.activeConsents];
    this.activeConsents = [...consents];

    console.log('[MockProvider] Consents updated:', {
      from: oldConsents,
      to: this.activeConsents,
    });

    // Update global mock object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    if (typeof window !== 'undefined' && (window as any).MockConsentManager) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (window as any).MockConsentManager.activeConsents = [...this.activeConsents];
    }

    // Trigger consent changed callback if registered
    if (this.onConsentChangedCallback && this.isInitialized) {
      console.log('[MockProvider] 🔄 Triggering consent changed callback');
      try {
        this.onConsentChangedCallback();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[MockProvider] Error executing consent changed callback:', message);
      }
    }
  }

  showConsentBanner(): void {
    if (typeof window === 'undefined') {
      console.error('[MockProvider] Window is undefined - cannot show banner');
      return;
    }

    console.log('[MockProvider] 📋 Mock banner display triggered');
    console.log('[MockProvider] Current consents:', this.activeConsents);
    console.log('[MockProvider] In a real implementation, this would show a consent banner UI');

    // Simulate banner interaction by logging
    console.log('[MockProvider] To simulate user consent changes in tests, use:');
    console.log('  window.MockConsentManager.setConsents(["C0001", "C0002"])');
  }

  injectProviderScript(): void {
    if (typeof document === 'undefined') {
      console.error('[MockProvider] Document is undefined - cannot inject script');
      return;
    }

    if (!this.config.scriptUrl || typeof this.config.scriptUrl !== 'string') {
      console.error('[MockProvider] Invalid script URL');
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = this.config.scriptUrl;
      script.type = 'text/javascript';
      script.setAttribute('data-mock-provider', 'true');

      // Add marker for testing/debugging
      script.id = 'mock-consent-provider-script';

      if (!document.head) {
        console.error('[MockProvider] Document head is not available');
        return;
      }

      // Simulate async script loading
      script.onload = () => {
        console.log(`[MockProvider] ✅ Mock SDK script loaded: ${this.config.scriptUrl}`);

        // Auto-trigger initialization after script "loads"
        if (!this.isInitialized && this.onConsentInitCallback) {
          // Simulate async SDK initialization with a small delay
          setTimeout(() => {
            console.log('[MockProvider] Simulating SDK initialization...');
            if (this.onConsentInitCallback) {
              this.isInitialized = true;
              try {
                this.onConsentInitCallback();
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                console.error('[MockProvider] Error executing initialization callback:', message);
              }
            }
          }, 100);
        }
      };

      script.onerror = () => {
        console.error(`[MockProvider] Failed to load mock SDK script: ${this.config.scriptUrl}`);
      };

      document.head.appendChild(script);
      console.log(`[MockProvider] Mock SDK script injected: ${this.config.scriptUrl}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[MockProvider] Failed to inject provider script:', message);
    }
  }

  getConsentCategoryClass(categoryId: string): string {
    if (!categoryId || typeof categoryId !== 'string') {
      console.warn('[MockProvider] Invalid category ID');
      return '';
    }
    return `mock-consent-category-${categoryId}`;
  }

  initialize(): void {
    console.log('[MockProvider] Provider initialized');
    console.log('[MockProvider] Initial consents:', this.activeConsents);

    // Auto-register callbacks if provided in config
    if (this.config.onConsentInit || this.config.onConsentChanged) {
      this.callback(
        this.config.onConsentInit || (() => {}),
        this.config.onConsentChanged
      );
    }
  }

  callback(
    onConsentInitCallback: () => void,
    onConsentChangedCallback?: () => void
  ): void {
    if (!onConsentInitCallback || typeof onConsentInitCallback !== 'function') {
      console.error('[MockProvider] Invalid initialization callback');
      return;
    }

    // Store callbacks for later use
    this.onConsentInitCallback = onConsentInitCallback;
    this.onConsentChangedCallback = onConsentChangedCallback;

    console.log('[MockProvider] Callbacks registered');
    console.log('[MockProvider] - Init callback:', !!onConsentInitCallback);
    console.log('[MockProvider] - Changed callback:', !!onConsentChangedCallback);

    // Note: Actual initialization callback will be triggered by injectProviderScript
    // after the script "loads" (simulated async behavior)
  }

  /**
   * Helper method for testing: Simulate banner interaction and consent change.
   * This is useful in automated tests to trigger the full consent change flow.
   *
   * @param newConsents - New consent categories to set
   */
  simulateConsentChange(newConsents: string[]): void {
    console.log('[MockProvider] 🎭 Simulating user consent change...');
    this.setConsents(newConsents);
  }

  /**
   * Helper method for testing: Manually trigger initialization.
   * Useful when you want to control the initialization timing in tests.
   */
  triggerInitialization(): void {
    if (this.isInitialized) {
      console.warn('[MockProvider] Already initialized');
      return;
    }

    if (this.onConsentInitCallback) {
      console.log('[MockProvider] Manually triggering initialization callback');
      this.isInitialized = true;
      try {
        this.onConsentInitCallback();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[MockProvider] Error executing initialization callback:', message);
      }
    } else {
      console.warn('[MockProvider] No initialization callback registered');
    }
  }
}
