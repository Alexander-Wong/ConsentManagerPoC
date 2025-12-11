import { ConsentEngineConfig } from "../config/ConsentEngineConfig.js";
import { ProviderType } from "./ProviderType.js";

/**
 * JSON interface that mirrors the existing CookieCategory structure
 * Used for loading configuration from external JSON files
 */
export interface CookieCategoryJson {
  cookies: string[];        // Array of CookieType enum values as strings (e.g., "C0001")
  cookieNames: string[];
  code?: string;
  src?: string;
  defer?: CookieCategoryJson[];
}

/**
 * JSON interface that mirrors the existing BaseResource structure
 */
export interface ResourceJson {
  resourceType: string;     // ResourceType enum value as string (e.g., "Map", "Video")
  cookies: string[];        // Array of CookieType enum values as strings
  condition: string;        // CookieConditionalType as string ("AND" or "OR")
}

/**
 * Complete configuration JSON structure
 */
export interface ConsentConfigJson {
  cookieCategories: CookieCategoryJson[];
  resources: ResourceJson[];
}


/**
 * Configuration options for Mock provider
 */
export interface IMockProviderConfig  {
  /** Mock SDK script URL (can be any URL for testing purposes) */
  scriptUrl: string;
  /** Initial consent categories to set (e.g., ['C0001', 'C0002']) */
  initialConsents?: string[];
}

export interface IOneTrustProviderConfig  {
  /** OneTrust SDK script URL */
  scriptUrl: string;
  /** OneTrust domain script ID */
  domainScript: string;
  /** Enable document language support */
  documentLanguage?: boolean;
}

/**
 * Provider configuration options
 */

export interface ConsentProviderConfig {
  type: ProviderType;
  config: IOneTrustProviderConfig | IMockProviderConfig
}


/**
 * Options for initializing the Consent Manager
 */
export interface ConsentManagerOptions {
  /**
   * URL to fetch JSON configuration from
   * Example: '/config/consent-config.json' or 'https://cdn.example.com/consent-config.json'
   */
  configUrl?: string;

  /**
   * Inline configuration object
   * Can be either:
   * - Plain JSON object (ConsentConfigJson)
   * - ConsentEngineConfig instance (for advanced usage with classes)
   */
  config?: ConsentConfigJson | ConsentEngineConfig;

  /**
   * Provider configuration (OneTrust, etc.)
   */
  provider: ConsentProviderConfig;
}

/**
 * Factory functions for creating provider configurations
 * These are runtime functions available in the JavaScript bundle
 */
export const ProviderConfigs = {
  /**
   * Create OneTrust provider configuration
   */
  oneTrust: (config: {
    scriptUrl: string;
    domainScript: string;
    documentLanguage?: boolean;
  }): IOneTrustProviderConfig => ({
    scriptUrl: config.scriptUrl,
    domainScript: config.domainScript,
    documentLanguage: config.documentLanguage
  }),

  /**
   * Create Mock provider configuration (for testing)
   */
  mock: (config: {
    scriptUrl: string;
    initialConsents?: string[];
  }): IMockProviderConfig => ({
    scriptUrl: config.scriptUrl,
    initialConsents: config.initialConsents
  })
} as const;
