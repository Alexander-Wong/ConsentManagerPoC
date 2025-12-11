/**
 * @vml/consent-manager
 * Provider-agnostic consent management system for GDPR/CCPA cookie compliance
 */

// Main initialization function
export { initConsentManager } from './ConsentWrapper.js';

// Provider Config Factories (Runtime values - available in bundle)
export { ProviderConfigs } from './types/ConsentManagerOptions.js';

// Enums
export { ProviderType } from './types/ProviderType.js';
export { CookieType } from './types/CookieType.js';
export { ResourceType } from './types/ResourceType.js';
export { CookieConditionalType } from './types/CookieConditionalType.js';


// Core classes (for advanced usage)
export { ConsentEngineConfig } from './config/ConsentEngineConfig.js';
export { BaseResource } from './resources/BaseResource.js';
export { CookieCategory } from './types/CookieCategory.js';



