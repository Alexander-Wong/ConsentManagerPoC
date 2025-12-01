// Provider exports
export { ConsentProviderFactory } from "./ConsentProviderFactory.js";
export type { IConsentProvider } from "./IConsentProvider.js";
export type { IProviderConfig } from "./IProviderConfig.js";
export type { ProviderFactoryConfig } from "./IProviderFactoryConfig.js";
export { ProviderType } from "./ProviderType.js";

// Provider implementations
export * from "./onetrust/index.js";
