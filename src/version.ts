/**
 * Version information for the Consent Manager library
 * This file is automatically updated during version bumps
 */

export const VERSION = '1.0.0';

export const VERSION_INFO = {
  version: VERSION,
  name: '@your-org/consent-manager',
  description: 'Provider-agnostic consent management system for GDPR/CCPA cookie compliance'
} as const;

/**
 * Gets the current version of the Consent Manager
 * @returns The semantic version string (e.g., "1.0.0")
 */
export function getVersion(): string {
  return VERSION;
}

/**
 * Gets detailed version information
 * @returns Object containing version, name, and description
 */
export function getVersionInfo(): typeof VERSION_INFO {
  return VERSION_INFO;
}
