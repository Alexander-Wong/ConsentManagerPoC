import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockProvider } from '../../../src/providers/mock/MockProvider.js';
import { ProviderType } from '../../../src/types/ProviderType.js';
import { IMockProviderConfig } from '../../../src/providers/IMockProviderConfig.js';

describe('MockProvider', () => {
  let provider: MockProvider;
  let config: IMockProviderConfig;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // Clear window globals
    delete (window as any).MockConsentManager;

    config = {
      scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
      initialConsents: ['C0001', 'C0002']
    };

    provider = new MockProvider(config);
  });

  describe('constructor', () => {
    it('should initialize with provided initial consents', () => {
      const consents = provider.getActiveConsents();
      expect(consents).toEqual(['C0001', 'C0002']);
    });

    it('should initialize with empty consents when not provided', () => {
      const providerWithoutConsents = new MockProvider({
        scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
      });

      const consents = providerWithoutConsents.getActiveConsents();
      expect(consents).toEqual([]);
    });

    it('should create global MockConsentManager object', () => {
      expect((window as any).MockConsentManager).toBeDefined();
      expect((window as any).MockConsentManager.activeConsents).toEqual(['C0001', 'C0002']);
    });

    it('should expose helper methods on global object', () => {
      const mockManager = (window as any).MockConsentManager;

      expect(typeof mockManager.setConsents).toBe('function');
      expect(typeof mockManager.getConsents).toBe('function');
      expect(typeof mockManager.showBanner).toBe('function');
    });
  });

  describe('getProviderName', () => {
    it('should return MOCK', () => {
      expect(provider.getProviderName()).toBe(ProviderType.MOCK);
    });
  });

  describe('getActiveConsents', () => {
    it('should return active consents as array', () => {
      const consents = provider.getActiveConsents();
      expect(consents).toEqual(['C0001', 'C0002']);
    });

    it('should return copy of array to prevent external mutation', () => {
      const consents1 = provider.getActiveConsents();
      const consents2 = provider.getActiveConsents();

      expect(consents1).toEqual(consents2);
      expect(consents1).not.toBe(consents2); // Different array instances
    });

    it('should reflect changes made via setConsents', () => {
      provider.setConsents(['C0003', 'C0004']);

      const consents = provider.getActiveConsents();
      expect(consents).toEqual(['C0003', 'C0004']);
    });
  });

  describe('setConsents', () => {
    it('should update active consents', () => {
      provider.setConsents(['C0003', 'C0004']);

      expect(provider.getActiveConsents()).toEqual(['C0003', 'C0004']);
    });

    it('should update global MockConsentManager object', () => {
      provider.setConsents(['C0003']);

      expect((window as any).MockConsentManager.activeConsents).toEqual(['C0003']);
    });

    it('should handle empty array', () => {
      provider.setConsents([]);

      expect(provider.getActiveConsents()).toEqual([]);
    });

    it('should trigger consent changed callback after initialization', () => {
      const initCallback = vi.fn();
      const changedCallback = vi.fn();

      provider.callback(initCallback, changedCallback);
      provider.triggerInitialization(); // Simulate initialization

      provider.setConsents(['C0003']);

      expect(changedCallback).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callback before initialization', () => {
      const initCallback = vi.fn();
      const changedCallback = vi.fn();

      provider.callback(initCallback, changedCallback);
      // Don't call triggerInitialization

      provider.setConsents(['C0003']);

      expect(changedCallback).not.toHaveBeenCalled();
    });

    it('should handle invalid input gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      provider.setConsents('invalid' as any);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Consents must be an array')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not change consents when invalid input provided', () => {
      const originalConsents = provider.getActiveConsents();

      provider.setConsents('invalid' as any);

      expect(provider.getActiveConsents()).toEqual(originalConsents);
    });
  });

  describe('showConsentBanner', () => {
    it('should log mock banner display', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      provider.showConsentBanner();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Mock banner display triggered')
      );

      consoleLogSpy.mockRestore();
    });

    it('should log current consents', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      provider.showConsentBanner();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Current consents:'),
        ['C0001', 'C0002']
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('injectProviderScript', () => {
    it('should inject script tag with correct attributes', () => {
      provider.injectProviderScript();

      const script = document.querySelector('script#mock-consent-provider-script');
      expect(script).toBeTruthy();
      expect(script?.getAttribute('src')).toBe(config.scriptUrl);
      expect(script?.getAttribute('type')).toBe('text/javascript');
      expect(script?.getAttribute('data-mock-provider')).toBe('true');
    });

    it('should trigger initialization callback after script loads', (done) => {
      const initCallback = vi.fn();

      provider.callback(initCallback);
      provider.injectProviderScript();

      const script = document.querySelector('script#mock-consent-provider-script');

      // Simulate script load event
      const loadEvent = new Event('load');
      script?.dispatchEvent(loadEvent);

      // Wait for async initialization (100ms delay in implementation)
      setTimeout(() => {
        expect(initCallback).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    it('should not inject script when scriptUrl is invalid', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const providerWithoutUrl = new MockProvider({ scriptUrl: '' });

      providerWithoutUrl.injectProviderScript();

      const script = document.querySelector('script#mock-consent-provider-script');
      expect(script).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid script URL')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle script load errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      provider.injectProviderScript();

      const script = document.querySelector('script#mock-consent-provider-script');
      const errorEvent = new Event('error');
      script?.dispatchEvent(errorEvent);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load mock SDK script')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getConsentCategoryClass', () => {
    it('should return class name with category ID', () => {
      const className = provider.getConsentCategoryClass('C0001');
      expect(className).toBe('mock-consent-category-C0001');
    });

    it('should handle different category IDs', () => {
      expect(provider.getConsentCategoryClass('C0002')).toBe('mock-consent-category-C0002');
      expect(provider.getConsentCategoryClass('C0003')).toBe('mock-consent-category-C0003');
    });

    it('should return empty string for invalid category ID', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(provider.getConsentCategoryClass('')).toBe('');
      expect(provider.getConsentCategoryClass(null as any)).toBe('');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('initialize', () => {
    it('should log initialization message', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      provider.initialize();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Provider initialized')
      );

      consoleLogSpy.mockRestore();
    });

    it('should auto-register callbacks if provided in config', () => {
      const initCallback = vi.fn();
      const changedCallback = vi.fn();

      const providerWithCallbacks = new MockProvider({
        scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
        onConsentInit: initCallback,
        onConsentChanged: changedCallback
      });

      providerWithCallbacks.initialize();

      // Callbacks should be registered (not called yet)
      expect(initCallback).not.toHaveBeenCalled();
      expect(changedCallback).not.toHaveBeenCalled();
    });
  });

  describe('callback', () => {
    it('should register initialization callback', () => {
      const initCallback = vi.fn();

      provider.callback(initCallback);

      // Callback stored but not yet invoked
      expect(initCallback).not.toHaveBeenCalled();
    });

    it('should register both init and changed callbacks', () => {
      const initCallback = vi.fn();
      const changedCallback = vi.fn();

      provider.callback(initCallback, changedCallback);

      expect(initCallback).not.toHaveBeenCalled();
      expect(changedCallback).not.toHaveBeenCalled();
    });

    it('should handle missing initialization callback', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      provider.callback(null as any);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid initialization callback')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('triggerInitialization', () => {
    it('should execute initialization callback', () => {
      const initCallback = vi.fn();

      provider.callback(initCallback);
      provider.triggerInitialization();

      expect(initCallback).toHaveBeenCalledTimes(1);
    });

    it('should not execute callback multiple times', () => {
      const initCallback = vi.fn();

      provider.callback(initCallback);
      provider.triggerInitialization();
      provider.triggerInitialization();

      expect(initCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in callback gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });

      provider.callback(errorCallback);
      provider.triggerInitialization();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error executing initialization callback'),
        expect.stringContaining('Test error')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should warn when called without registered callback', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      provider.triggerInitialization();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No initialization callback registered')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('simulateConsentChange', () => {
    it('should update consents and trigger callback', () => {
      const initCallback = vi.fn();
      const changedCallback = vi.fn();

      provider.callback(initCallback, changedCallback);
      provider.triggerInitialization();

      provider.simulateConsentChange(['C0003', 'C0004']);

      expect(provider.getActiveConsents()).toEqual(['C0003', 'C0004']);
      expect(changedCallback).toHaveBeenCalledTimes(1);
    });

    it('should work via global MockConsentManager', () => {
      const changedCallback = vi.fn();

      provider.callback(() => {}, changedCallback);
      provider.triggerInitialization();

      (window as any).MockConsentManager.setConsents(['C0003']);

      expect(provider.getActiveConsents()).toEqual(['C0003']);
      expect(changedCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle full initialization flow', (done) => {
      const initCallback = vi.fn();
      const changedCallback = vi.fn();

      provider.callback(initCallback, changedCallback);
      provider.injectProviderScript();

      const script = document.querySelector('script#mock-consent-provider-script');
      const loadEvent = new Event('load');
      script?.dispatchEvent(loadEvent);

      setTimeout(() => {
        expect(initCallback).toHaveBeenCalledTimes(1);

        // Now simulate consent change
        provider.setConsents(['C0003']);
        expect(changedCallback).toHaveBeenCalledTimes(1);

        done();
      }, 150);
    });

    it('should support testing consent flow without real SDK', () => {
      const initCallback = vi.fn(() => {
        // Simulate app initialization logic
        const consents = provider.getActiveConsents();
        expect(consents).toEqual(['C0001', 'C0002']);
      });

      const changedCallback = vi.fn(() => {
        // Simulate consent change logic
        const consents = provider.getActiveConsents();
        expect(consents).toEqual(['C0001', 'C0002', 'C0003']);
      });

      provider.callback(initCallback, changedCallback);
      provider.triggerInitialization();

      expect(initCallback).toHaveBeenCalled();

      provider.simulateConsentChange(['C0001', 'C0002', 'C0003']);

      expect(changedCallback).toHaveBeenCalled();
    });
  });
});
