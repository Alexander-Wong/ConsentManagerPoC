
import { IProviderConfig } from './IProviderConfig.js';
import { ProviderType } from './ProviderType.js';

/**
 * Factory configuration for creating consent providers
 */
export interface ProviderFactoryConfig {
  type: ProviderType;
  config: IProviderConfig 
}