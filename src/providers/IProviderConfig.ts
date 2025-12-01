/**
 * Configuration options for provider
 */
export interface IProviderConfig {
  /** OneTrust SDK script URL */
  scriptUrl: string;
  /** OneTrust domain script ID */
  domainScript: string;
  /** Enable document language support */
  documentLanguage?: boolean;

  /**
   * Optional callback executed when provider initializes (first load only).
   * This is called after the provider SDK loads and is ready.
   */
  onConsentInit?: () => void;

  /**
   * Optional callback executed when user consent changes.
   * This is called whenever the user updates their consent preferences.
   */
  onConsentChanged?: () => void;
}