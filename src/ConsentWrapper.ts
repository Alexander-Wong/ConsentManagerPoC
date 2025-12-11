import { ConsentEngineConfig } from "./config/ConsentEngineConfig.js";
import { ConsentEngine } from "./core/ConsentEngine.js";
import { ConsentProviderFactory } from "./providers/ConsentProviderFactory.js";
import { ConfigLoaderService } from "./services/config/ConfigLoaderService.js";
import { ConsentManagerOptions } from "./types/ConsentManagerOptions.js";

/**
 * Initializes the Consent Manager with the provided options
 */
export async function initConsentManager(options: ConsentManagerOptions): Promise<void> {
  try {
    // Validate that configuration is provided
    if (!options.configUrl && !options.config) {
      throw new Error(
        '[ConsentManager] Configuration is required: provide either "configUrl" or "config" in options'
      );
    }

    if (!options.provider) {
      throw new Error('[ConsentManager] Provider configuration is required');
    }

    // Load configuration based on what was provided
    let engineConfig: ConsentEngineConfig;

    if (options.configUrl) {
      engineConfig = await ConfigLoaderService.loadFromUrl(options.configUrl);
    } else if (options.config) {
      engineConfig = ConfigLoaderService.loadFromObj(options.config);
    } else {
      throw new Error('[ConsentManager] No configuration provided');
    }

   
    let engine: ConsentEngine | null = null;
   
    const onConsentInit = () => {
      console.log('[ConsentManager] 🚀 Consent system initialized - running first evaluation');
      engine?.evaluateConsents();
    };

    const onConsentChanged = () => {
      console.log('[ConsentManager] 🔄 User consent updated - re-evaluating');
      engine?.evaluateConsents();
    };

    // Add callbacks to provider configuration
    const providerWithCallbacks = {
      ...options.provider.config,
      onConsentInit,
      onConsentChanged
    };


   // Create provider with callbacks
    const provider = ConsentProviderFactory.createProvider({
      type: options.provider.type,
      config: providerWithCallbacks
    });

    engine = new ConsentEngine(engineConfig, provider);
    engine.start();

    // Expose banner control to window object
    if (typeof window !== 'undefined') {
      window.showProviderBanner = () => provider.showConsentBanner();
    }

    console.log('[ConsentManager] ✅ Consent manager initialized successfully');

  } catch (error : unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[ConsentManager] ❌ Failed to initialize consent manager:', message);
    throw error;
  }
}

