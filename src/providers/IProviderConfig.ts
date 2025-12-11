/**
 * Configuration options for provider
 */
export interface IProviderConfig {

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