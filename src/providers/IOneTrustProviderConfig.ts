import { IProviderConfig } from "./IProviderConfig.js";

/**
 * Configuration options for provider
 */
export interface IOneTrustProviderConfig extends IProviderConfig {
  /** OneTrust SDK script URL */
  scriptUrl: string;
  /** OneTrust domain script ID */
  domainScript: string;
  /** Enable document language support */
  documentLanguage?: boolean;
}