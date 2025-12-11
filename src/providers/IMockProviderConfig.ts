import { IProviderConfig } from "./IProviderConfig.js";

/**
 * Configuration options for Mock provider
 */
export interface IMockProviderConfig extends IProviderConfig {
  /** Mock SDK script URL (can be any URL for testing purposes) */
  scriptUrl: string;
  /** Initial consent categories to set (e.g., ['C0001', 'C0002']) */
  initialConsents?: string[];
}