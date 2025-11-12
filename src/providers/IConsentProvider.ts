/**
 * Interface that all consent management providers must implement.
 * This abstraction allows the ConsentEngine to work with any consent management platform
 * (OneTrust, Cookiebot, Usercentrics, etc.) without modification.
 */
export interface IConsentProvider {
  /**
   * Returns an array of currently active consent category IDs.
   * Example: ['C0001', 'C0002', 'C0004']
   *
   * @returns Array of active consent category IDs
   */
  getActiveConsents(): string[];

  /**
   * Registers a callback to be invoked when user consent changes.
   * The callback should be triggered whenever the user updates their consent preferences.
   *
   * @param callback - Function to execute when consent changes
   */
  onConsentChanged(callback: () => void): void;

  /**
   * Displays the consent banner/modal to the user.
   * This allows users to review and modify their consent preferences.
   */
  showBanner(): void;

  /**
   * Injects the provider's SDK script into the document.
   * This should load the consent management platform's JavaScript SDK.
   */
  injectProviderScript(): void;

  /**
   * Returns the CSS class name for a given consent category.
   * Used for script tagging (e.g., 'optanon-category-C0001' for OneTrust).
   *
   * @param categoryId - Consent category ID (e.g., 'C0001', 'C0002')
   * @returns CSS class name to apply to scripts
   */
  getConsentCategoryClass(categoryId: string): string;

  /**
   * Returns the provider name for logging and debugging purposes.
   *
   * @returns Provider name (e.g., 'OneTrust', 'Cookiebot')
   */
  getProviderName(): string;

  /**
   * Optional initialization hook called after script injection.
   * Use this for provider-specific setup (e.g., registering global callbacks).
   */
  initialize?(): void;
}
