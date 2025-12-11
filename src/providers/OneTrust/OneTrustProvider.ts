import { ProviderType } from '../../types/ProviderType.js';
import { IConsentProvider } from '../IConsentProvider.js';
import { IOneTrustProviderConfig } from '../IOneTrustProviderConfig.js';



/**
 * OneTrust consent management provider implementation.
 * Encapsulates all OneTrust-specific logic and global variable access.
 */
export class OneTrustProvider implements IConsentProvider {
  private config: IOneTrustProviderConfig;
  private isInitialized = false;

  constructor(config: IOneTrustProviderConfig) {
    this.config = config;
  }

  getProviderName(): string {
    return ProviderType.ONETRUST;
  }


  getActiveConsents(): string[] {
    if (typeof window === 'undefined') {
      console.warn('[OneTrustProvider] Window is undefined - cannot get consents');
      return [];
    }

    const activeGroups = window.OptanonActiveGroups;

    if (!activeGroups || typeof activeGroups !== 'string') {
      console.warn('[OneTrustProvider] OptanonActiveGroups not available or invalid type');
      return [];
    }

    const groups = activeGroups.split(',').filter((group: string) => group && group.trim().length > 0);
    return groups;
  }

  showConsentBanner(): void {
    if (typeof window === 'undefined') {
      console.error('[OneTrustProvider] Window is undefined - cannot show banner');
      return;
    }

    // Try modern OneTrust API first
    if (window.Onetrust && typeof window.Onetrust.ToggleInfoDisplay === 'function') {
      try {
        window.Onetrust.ToggleInfoDisplay();
        console.log('[OneTrustProvider] Banner shown via Onetrust.ToggleInfoDisplay()');
        return;
      } catch (error : unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[OneTrustProvider] Error showing banner via Onetrust:', message);
      }
    }

    // Fallback to legacy OneTrust API
    if (window.Optanon && typeof window.Optanon.ToggleInfoDisplay === 'function') {
      try {
        window.Optanon.ToggleInfoDisplay();
        console.log('[OneTrustProvider] Banner shown via Optanon.ToggleInfoDisplay()');
        return;
      } catch (error : unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[OneTrustProvider] Error showing banner via Optanon:', message);
      }
    }

    console.error('[OneTrustProvider] OneTrust SDK not available - cannot show banner');
  }

  injectProviderScript(): void {
    if (typeof document === 'undefined') {
      console.error('[OneTrustProvider] Document is undefined - cannot inject script');
      return;
    }

    if (!this.config.scriptUrl || typeof this.config.scriptUrl !== 'string') {
      console.error('[OneTrustProvider] Invalid script URL');
      return;
    }

    if (!this.config.domainScript || typeof this.config.domainScript !== 'string') {
      console.error('[OneTrustProvider] Invalid domain script');
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = this.config.scriptUrl;
      script.type = 'text/javascript';

      if (this.config.documentLanguage) {
        script.setAttribute('data-document-language', 'true');
      }
      script.setAttribute('data-domain-script', this.config.domainScript);

      if (!document.head) {
        console.error('[OneTrustProvider] Document head is not available');
        return;
      }

      document.head.appendChild(script);
      console.log(`[OneTrustProvider] SDK script injected: ${this.config.scriptUrl}`);
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[OneTrustProvider] Failed to inject provider script:', message);
    }
  }


  getConsentCategoryClass(categoryId: string): string {
    if (!categoryId || typeof categoryId !== 'string') {
      console.warn('[OneTrustProvider] Invalid category ID');
      return '';
    }
    return `optanon-category-${categoryId}`;
  }


  initialize(): void {
    console.log('[OneTrustProvider] Provider initialized');

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
    if (typeof window === 'undefined') {
      console.error('[OneTrustProvider] Window is undefined - cannot register callback');
      return;
    }

    if (!onConsentInitCallback || typeof onConsentInitCallback !== 'function') {
      console.error('[OneTrustProvider] Invalid initialization callback');
      return;
    }

    try {
      // Define the OptanonWrapper function with injected logic
      window.OptanonWrapper = () => {
        console.log(`✅ [OneTrustProvider] OptanonWrapper invoked`);

        // Execute initialization callback (first load only)
        if (!this.isInitialized) {
          this.isInitialized = true;
          console.log('[OneTrustProvider] First load - executing initialization callback');

          try {
            onConsentInitCallback();
          } catch (error : unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('[OneTrustProvider] Error executing initialization callback:', message);
          }
        }

        // Register consent change listener if provided
        if (onConsentChangedCallback && typeof onConsentChangedCallback === 'function') {
          if (window.Optanon && typeof window.Optanon.OnConsentChanged === 'function') {
            try {
              window.Optanon.OnConsentChanged(() => {
                console.log('🔄 [OneTrustProvider] Consent changed - executing callback');
                try {
                  onConsentChangedCallback();
                } catch (error : unknown) {
                  const message = error instanceof Error ? error.message : String(error);
                  console.error('[OneTrustProvider] Error executing consent changed callback:', message);
                }
              });
            } catch (error : unknown) {
              const message = error instanceof Error ? error.message : String(error);
              console.error('[OneTrustProvider] Error registering consent change listener:', message);
            }
          } else {
            console.warn('[OneTrustProvider] Optanon.OnConsentChanged not available');
          }
        }
      };

      console.log('[OneTrustProvider] OptanonWrapper callback registered');
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[OneTrustProvider] Failed to register callback:', message);
    }
  }
}
