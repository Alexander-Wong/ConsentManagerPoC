// Provider exports
export { ConsentProviderFactory } from "./ConsentProviderFactory.js";
export type { IConsentProvider } from "./IConsentProvider.js";
export type { IProviderConfig } from "./IProviderConfig.js";
export type { IOneTrustProviderConfig } from "./IOneTrustProviderConfig.js";
export type { IMockProviderConfig } from "./IMockProviderConfig.js";
export type { IProviderFactoryConfig } from "./IProviderFactoryConfig.js";


// Provider implementations
export * from "./onetrust/index.js";
export * from "./mock/index.js";
