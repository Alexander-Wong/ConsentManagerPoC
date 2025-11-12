import { IConsentProvider } from './IConsentProvider.js';
import { OneTrustProvider, OneTrustConfig } from './OneTrustProvider.js';

/**
 * Supported consent management provider types
 */
export enum ProviderType {
  ONETRUST = 'onetrust',
  CUSTOM = 'custom'
}

/**
 * Factory configuration for creating consent providers
 */
export interface ProviderFactoryConfig {
  type: ProviderType;
  config: OneTrustConfig | { provider: IConsentProvider };
}

/**
 * Factory for creating consent management provider instances.
 * Implements the Factory Pattern to decouple provider creation from usage.
 */
export class ConsentProviderFactory {
  /**
   * Creates a consent provider instance based on configuration.
   *
   * @param factoryConfig - Configuration specifying provider type and settings
   * @returns Configured consent provider instance
   * @throws Error if provider type is unsupported
   *
   * @example
   * ```typescript
   * const provider = ConsentProviderFactory.createProvider({
   *   type: ProviderType.ONETRUST,
   *   config: {
   *     scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
   *     domainScript: 'your-domain-script-id',
   *     documentLanguage: true
   *   }
   * });
   * ```
   */
  static createProvider(factoryConfig: ProviderFactoryConfig): IConsentProvider {
    switch (factoryConfig.type) {
      case ProviderType.ONETRUST:
        return new OneTrustProvider(factoryConfig.config as OneTrustConfig);

      case ProviderType.CUSTOM:
        // Allow custom provider injection
        const customConfig = factoryConfig.config as { provider: IConsentProvider };
        if (customConfig.provider) {
          return customConfig.provider;
        }
        throw new Error('[ConsentProviderFactory] Custom provider must be provided in config.provider');

      default:
        throw new Error(`[ConsentProviderFactory] Unsupported provider type: ${factoryConfig.type}`);
    }
  }

  /**
   * Convenience method to create OneTrust provider with default configuration.
   *
   * @param domainScript - OneTrust domain script ID
   * @param scriptUrl - Optional custom OneTrust SDK URL
   * @returns Configured OneTrust provider
   *
   * @example
   * ```typescript
   * const provider = ConsentProviderFactory.createOneTrustProvider('01976a4b-0690-72c6-a7ee-3701352a5c93-test');
   * ```
   */
  static createOneTrustProvider(
    domainScript: string,
    scriptUrl: string = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js'
  ): IConsentProvider {
    return new OneTrustProvider({
      scriptUrl,
      domainScript,
      documentLanguage: true
    });
  }
}
