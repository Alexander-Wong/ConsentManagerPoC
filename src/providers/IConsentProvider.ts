export interface IConsentProvider {

  /**
   * Returns the provider name for logging and debugging purposes.
   */
  getProviderName(): string;

  /**
   * Returns an array of currently active consent category IDs.
   * Example: ['C0001', 'C0002', 'C0004']
   */
  getActiveConsents(): string[];

  /**
   * Displays the consent banner/modal to the user.
   * This allows users to review and modify their consent preferences.
   */
  showConsentBanner(): void;

  /**
   * Injects the provider's SDK script into the document.
   * This should load the consent management platform's JavaScript SDK.
   */
  injectProviderScript(): void;

  /**
   * Returns the CSS class name for a given consent category.
   * Used for script tagging (e.g., 'optanon-category-C0001' for OneTrust).
   */
  getConsentCategoryClass(categoryId: string): string;

  /**
   * Optional initialization hook called after script injection.
   * Use this for provider-specific setup (e.g., registering global callbacks).
   */
  initialize?(): void;

  /**
   * Registers the provider's callback.
   * This callback is invoked by the provider SDK after it loads and initializes.
   * Different providers use different mechanisms (e.g., OneTrust uses window.OptanonWrapper,
   */
  callback(
    onConsentInitCallback: () => void,
    onConsentChangedCallback?: () => void
  ): void;
}
