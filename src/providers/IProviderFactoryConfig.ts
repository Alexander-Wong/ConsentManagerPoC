
import { ProviderType } from '../types/ProviderType.js';
import { IMockProviderConfig } from './IMockProviderConfig.js';
import { IOneTrustProviderConfig } from './IOneTrustProviderConfig.js';

/**
 * Factory configuration for creating consent providers
 */
export interface IProviderFactoryConfig {
  type: ProviderType;
  config: IOneTrustProviderConfig | IMockProviderConfig
}