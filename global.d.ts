// Global variables injected by OneTrust SDK
// Note: These are now encapsulated in OneTrustProvider, but still need declarations for runtime access

// OneTrust SDK Type Definitions
interface OptanonAPI {
  OnConsentChanged(callback: () => void): void;
  ToggleInfoDisplay(): void;
  Close(): void;
  IsAlertBoxClosed(): boolean;
}

interface OnetrustAPI {
  ToggleInfoDisplay(): void;
  Close(): void;
  IsAlertBoxClosed(): boolean;
}


// Global Window interface extension
declare global {
  interface Window {
    OptanonActiveGroups?: string;
    Optanon?: OptanonAPI;
    Onetrust?: OnetrustAPI;
    OptanonWrapper?: () => void;
    showProviderBanner?: () => void;
  }

  // Global constants for direct access (legacy support)
  const OptanonActiveGroups: string;

  // Re-export ActiveCookies type for global access (backward compatibility)
  type ActiveCookies = string[];
}

// Make this file a module so global augmentation works
export {};

