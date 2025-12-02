import { IConsentProvider } from './IConsentProvider.js';
import { OneTrustProvider } from './onetrust/OneTrustProvider.js';
import { ProviderFactoryConfig } from './IProviderFactoryConfig.js';
import { ProviderType } from './ProviderType.js';


/**
 * Factory for creating consent management provider instances.
 * Implements the Factory Pattern to decouple provider creation from usage.
 */
export class ConsentProviderFactory {
  /**
   * Creates a consent provider instance based on configuration.
   */
  static createProvider(factoryConfig: ProviderFactoryConfig): IConsentProvider {
    if (!factoryConfig) {
      throw new Error('[ConsentProviderFactory] Factory config is required');
    }

    if (!factoryConfig.type || typeof factoryConfig.type !== 'string') {
      throw new Error('[ConsentProviderFactory] Provider type is required');
    }

    if (!factoryConfig.config) {
      throw new Error('[ConsentProviderFactory] Provider config is required');
    }

    switch (factoryConfig.type) {
      case ProviderType.ONETRUST:
        { 
          const config = factoryConfig.config;

          if (!config.scriptUrl || typeof config.scriptUrl !== 'string') {
            throw new Error('[ConsentProviderFactory] OneTrust scriptUrl is required');
          }

          if (!config.domainScript || typeof config.domainScript !== 'string') {
            throw new Error('[ConsentProviderFactory] OneTrust domainScript is required');
          }

          return new OneTrustProvider(config); 
        }

      default:
        throw new Error(`[ConsentProviderFactory] Unsupported provider type: ${factoryConfig.type}`);
    }
  }
}
