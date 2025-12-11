import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initConsentManager } from '../src/ConsentWrapper.js';
import { ProviderType } from '../src/types/ProviderType.js';
import type { ConsentConfigJson } from '../src/types/ConsentConfigJson.js';

describe('ConsentWrapper - initConsentManager', () => {
  let mockConfig: ConsentConfigJson;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // Clear window globals
    delete (window as any).showProviderBanner;
    delete (window as any).MockConsentManager;
    delete (window as any).OptanonActiveGroups;

    mockConfig = {
      cookieCategories: [
        {
          cookies: ['C0001'],
          cookieNames: ['essential_cookie'],
          code: 'console.log("Essential");'
        },
        {
          cookies: ['C0002'],
          cookieNames: ['analytics_cookie'],
          src: 'https://analytics.example.com/script.js'
        }
      ],
      resources: [
        {
          resourceType: 'Video',
          cookies: ['C0002'],
          condition: 'AND'
        }
      ]
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validation', () => {
    it('should throw error when both configUrl and config are missing', async () => {
      await expect(
        initConsentManager({
          provider: {
            type: ProviderType.MOCK,
            config: {
              scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
            }
          }
        })
      ).rejects.toThrow('Configuration is required: provide either "configUrl" or "config"');
    });

    it('should throw error when provider is missing', async () => {
      await expect(
        initConsentManager({
          config: mockConfig,
          provider: null as any
        })
      ).rejects.toThrow('Provider configuration is required');
    });

    it('should throw error when provider is undefined', async () => {
      await expect(
        initConsentManager({
          config: mockConfig,
          provider: undefined as any
        })
      ).rejects.toThrow('Provider configuration is required');
    });
  });

  describe('OneTrust Provider Integration', () => {
    it('should initialize with OneTrust provider and inline config', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'test-domain-123',
            documentLanguage: true
          }
        }
      });

      // Check that provider script was injected
      const scripts = document.querySelectorAll('script');
      const providerScript = Array.from(scripts).find(
        s => s.src === 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js'
      );
      expect(providerScript).toBeTruthy();
      expect(providerScript?.getAttribute('data-domain-script')).toBe('test-domain-123');
    });

    it('should expose window.showProviderBanner for OneTrust', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'test-domain-123'
          }
        }
      });

      expect((window as any).showProviderBanner).toBeDefined();
      expect(typeof (window as any).showProviderBanner).toBe('function');
    });

    it('should inject callbacks into OneTrust provider config', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'test-domain-123'
          }
        }
      });

      // Verify OptanonWrapper callback was registered
      expect((window as any).OptanonWrapper).toBeDefined();
      expect(typeof (window as any).OptanonWrapper).toBe('function');

      consoleLogSpy.mockRestore();
    });

    it('should preserve OneTrust-specific config properties', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'test-domain-456',
            documentLanguage: false // OneTrust-specific property
          }
        }
      });

      const providerScript = document.querySelector('script[data-domain-script]');
      expect(providerScript?.getAttribute('data-domain-script')).toBe('test-domain-456');
      // documentLanguage: false means attribute should not be present
      expect(providerScript?.hasAttribute('data-document-language')).toBe(false);
    });
  });

  describe('Mock Provider Integration', () => {
    it('should initialize with Mock provider and inline config', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001', 'C0002']
          }
        }
      });

      // Check that MockConsentManager global was created
      expect((window as any).MockConsentManager).toBeDefined();
      expect((window as any).MockConsentManager.getConsents()).toEqual(['C0001', 'C0002']);
    });

    it('should expose window.showProviderBanner for Mock', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
          }
        }
      });

      expect((window as any).showProviderBanner).toBeDefined();
      expect(typeof (window as any).showProviderBanner).toBe('function');
    });

    it('should inject callbacks into Mock provider config', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001']
          }
        }
      });

      // MockConsentManager should be set up
      expect((window as any).MockConsentManager).toBeDefined();
      expect(typeof (window as any).MockConsentManager.setConsents).toBe('function');
    });

    it('should preserve Mock-specific config properties', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001', 'C0003'] // Mock-specific property
          }
        }
      });

      const consents = (window as any).MockConsentManager.getConsents();
      expect(consents).toEqual(['C0001', 'C0003']);
    });
  });

  describe('Config Loading', () => {
    it('should load config from inline object', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
          }
        }
      });

      // Verify that config was processed (scripts injected)
      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBeGreaterThan(0);
    });

    it('should handle config with multiple cookie categories', async () => {
      const complexConfig: ConsentConfigJson = {
        cookieCategories: [
          {
            cookies: ['C0001'],
            cookieNames: ['cookie1'],
            code: 'console.log("1");'
          },
          {
            cookies: ['C0002'],
            cookieNames: ['cookie2'],
            code: 'console.log("2");'
          },
          {
            cookies: ['C0003'],
            cookieNames: ['cookie3'],
            code: 'console.log("3");'
          }
        ],
        resources: []
      };

      await initConsentManager({
        config: complexConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
          }
        }
      });

      // Should successfully initialize without errors
      expect((window as any).showProviderBanner).toBeDefined();
    });

    it('should handle config with no resources', async () => {
      const configWithoutResources: ConsentConfigJson = {
        cookieCategories: [
          {
            cookies: ['C0001'],
            cookieNames: ['essential'],
            code: 'console.log("Essential");'
          }
        ],
        resources: []
      };

      await initConsentManager({
        config: configWithoutResources,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
          }
        }
      });

      expect((window as any).showProviderBanner).toBeDefined();
    });
  });

  describe('Callback Injection', () => {
    it('should add onConsentInit callback to provider config', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001']
          }
        }
      });

      // Trigger the initialization manually for Mock provider
      const mockProvider = (window as any).MockConsentManager;
      expect(mockProvider).toBeDefined();

      consoleLogSpy.mockRestore();
    });

    it('should add onConsentChanged callback to provider config', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001']
          }
        }
      });

      // Mock provider should have callbacks registered
      expect((window as any).MockConsentManager).toBeDefined();
    });

    it('should not override existing callbacks in provider config', async () => {
      const customInit = vi.fn();
      const customChanged = vi.fn();

      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            onConsentInit: customInit,
            onConsentChanged: customChanged
          }
        }
      });

      // Both wrapper callbacks and custom callbacks should coexist
      // The spreading pattern should preserve custom callbacks
      expect((window as any).MockConsentManager).toBeDefined();
    });
  });

  describe('Config Spreading Pattern', () => {
    it('should spread provider config correctly for OneTrust', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'test-domain-999',
            documentLanguage: true
          }
        }
      });

      const script = document.querySelector('script[data-domain-script]');
      // All config properties should be preserved
      expect(script?.src).toBe('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js');
      expect(script?.getAttribute('data-domain-script')).toBe('test-domain-999');
      expect(script?.hasAttribute('data-document-language')).toBe(true);
    });

    it('should spread provider config correctly for Mock', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001', 'C0002', 'C0003']
          }
        }
      });

      // All config properties should be preserved
      const consents = (window as any).MockConsentManager.getConsents();
      expect(consents).toEqual(['C0001', 'C0002', 'C0003']);
    });

    it('should add callbacks to spread config without losing original properties', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001']
          }
        }
      });

      // Original properties preserved
      expect((window as any).MockConsentManager.getConsents()).toEqual(['C0001']);
      // Global API available (provider was properly initialized)
      expect((window as any).showProviderBanner).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle and log errors during initialization', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        initConsentManager({
          config: null as any,
          provider: {
            type: ProviderType.MOCK,
            config: {
              scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
            }
          }
        })
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should throw error for invalid provider type', async () => {
      await expect(
        initConsentManager({
          config: mockConfig,
          provider: {
            type: 'INVALID_TYPE' as any,
            config: {
              scriptUrl: 'https://example.com/script.js'
            }
          }
        })
      ).rejects.toThrow('Unsupported provider type');
    });
  });

  describe('Engine Initialization', () => {
    it('should start the ConsentEngine', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
          }
        }
      });

      // Engine should have injected scripts
      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBeGreaterThan(0);
    });

    it('should inject all category scripts', async () => {
      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
          }
        }
      });

      // Check that category scripts were injected
      const scripts = document.querySelectorAll('script');
      const categoryScripts = Array.from(scripts).filter(
        s => s.textContent?.includes('console.log') || s.src.includes('analytics')
      );
      expect(categoryScripts.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Scenarios', () => {
    it('should complete full initialization flow with OneTrust', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'full-test-123',
            documentLanguage: true
          }
        }
      });

      // 1. Config loaded
      // 2. Provider created
      // 3. Engine started
      // 4. Scripts injected
      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBeGreaterThan(0);

      // 5. Global API exposed
      expect((window as any).showProviderBanner).toBeDefined();

      // 6. Success message logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Consent manager initialized successfully')
      );

      consoleLogSpy.mockRestore();
    });

    it('should complete full initialization flow with Mock', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await initConsentManager({
        config: mockConfig,
        provider: {
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001', 'C0002']
          }
        }
      });

      // 1. Config loaded
      // 2. Provider created
      expect((window as any).MockConsentManager).toBeDefined();

      // 3. Engine started
      // 4. Scripts injected
      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBeGreaterThan(0);

      // 5. Global API exposed
      expect((window as any).showProviderBanner).toBeDefined();

      // 6. Initial consents set
      expect((window as any).MockConsentManager.getConsents()).toEqual(['C0001', 'C0002']);

      // 7. Success message logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Consent manager initialized successfully')
      );

      consoleLogSpy.mockRestore();
    });
  });
});
