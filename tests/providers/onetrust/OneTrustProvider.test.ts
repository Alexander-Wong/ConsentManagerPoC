import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OneTrustProvider } from '../../../src/providers/onetrust/OneTrustProvider.js';
import { ProviderType } from '../../../src/providers/ProviderType.js';

describe('OneTrustProvider', () => {
  let provider: OneTrustProvider;
  let config: any;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // Clear window globals
    delete (window as any).OptanonActiveGroups;
    delete (window as any).Optanon;
    delete (window as any).Onetrust;
    delete (window as any).OptanonWrapper;

    config = {
      scriptUrl: 'https://cdn.cookielaw.org/script.js',
      domainScript: 'test-domain-123',
      documentLanguage: true
    };

    provider = new OneTrustProvider(config);
  });

  describe('getProviderName', () => {
    it('should return ONETRUST', () => {
      expect(provider.getProviderName()).toBe(ProviderType.ONETRUST);
    });
  });

  describe('getActiveConsents', () => {
    it('should return active consent groups as array', () => {
      (window as any).OptanonActiveGroups = ',C0001,C0002,C0003,';

      const consents = provider.getActiveConsents();

      expect(consents).toEqual(['C0001', 'C0002', 'C0003']);
    });

    it('should return empty array when OptanonActiveGroups is undefined', () => {
      const consents = provider.getActiveConsents();
      expect(consents).toEqual([]);
    });

    it('should return empty array when OptanonActiveGroups is empty string', () => {
      (window as any).OptanonActiveGroups = '';

      const consents = provider.getActiveConsents();
      expect(consents).toEqual([]);
    });

    it('should filter out empty strings from split', () => {
      (window as any).OptanonActiveGroups = ',C0001,,C0002,';

      const consents = provider.getActiveConsents();
      expect(consents).toEqual(['C0001', 'C0002']);
    });

    it('should handle single consent group', () => {
      (window as any).OptanonActiveGroups = 'C0001';

      const consents = provider.getActiveConsents();
      expect(consents).toEqual(['C0001']);
    });

    it('should return empty array when OptanonActiveGroups is not a string', () => {
      (window as any).OptanonActiveGroups = 123;

      const consents = provider.getActiveConsents();
      expect(consents).toEqual([]);
    });
  });

  describe('showConsentBanner', () => {
    it('should call modern Onetrust.ToggleInfoDisplay if available', () => {
      const mockToggle = vi.fn();
      (window as any).Onetrust = {
        ToggleInfoDisplay: mockToggle
      };

      provider.showConsentBanner();

      expect(mockToggle).toHaveBeenCalled();
    });

    it('should fallback to legacy Optanon.ToggleInfoDisplay', () => {
      const mockToggle = vi.fn();
      (window as any).Optanon = {
        ToggleInfoDisplay: mockToggle
      };

      provider.showConsentBanner();

      expect(mockToggle).toHaveBeenCalled();
    });

    it('should not throw when neither API is available', () => {
      expect(() => provider.showConsentBanner()).not.toThrow();
    });

    it('should prefer modern API over legacy when both exist', () => {
      const modernToggle = vi.fn();
      const legacyToggle = vi.fn();

      (window as any).Onetrust = { ToggleInfoDisplay: modernToggle };
      (window as any).Optanon = { ToggleInfoDisplay: legacyToggle };

      provider.showConsentBanner();

      expect(modernToggle).toHaveBeenCalled();
      expect(legacyToggle).not.toHaveBeenCalled();
    });

    it('should handle errors from modern API and fallback to legacy', () => {
      const legacyToggle = vi.fn();

      (window as any).Onetrust = {
        ToggleInfoDisplay: () => { throw new Error('Failed'); }
      };
      (window as any).Optanon = { ToggleInfoDisplay: legacyToggle };

      provider.showConsentBanner();

      expect(legacyToggle).toHaveBeenCalled();
    });
  });

  describe('injectProviderScript', () => {
    it('should inject script tag with correct attributes', () => {
      provider.injectProviderScript();

      const script = document.head.querySelector('script');
      expect(script).toBeDefined();
      expect(script?.src).toBe(config.scriptUrl);
      expect(script?.type).toBe('text/javascript');
      expect(script?.getAttribute('data-domain-script')).toBe(config.domainScript);
    });

    it('should set data-document-language when configured', () => {
      provider.injectProviderScript();

      const script = document.head.querySelector('script');
      expect(script?.getAttribute('data-document-language')).toBe('true');
    });

    it('should not set data-document-language when false', () => {
      config.documentLanguage = false;
      provider = new OneTrustProvider(config);

      provider.injectProviderScript();

      const script = document.head.querySelector('script');
      expect(script?.hasAttribute('data-document-language')).toBe(false);
    });

    it('should not inject when scriptUrl is invalid', () => {
      config.scriptUrl = '';
      provider = new OneTrustProvider(config);

      provider.injectProviderScript();

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(0);
    });

    it('should not inject when domainScript is invalid', () => {
      config.domainScript = null;
      provider = new OneTrustProvider(config);

      provider.injectProviderScript();

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(0);
    });
  });

  describe('getConsentCategoryClass', () => {
    it('should return class with optanon-category prefix', () => {
      const className = provider.getConsentCategoryClass('C0001');
      expect(className).toBe('optanon-category-C0001');
    });

    it('should handle different category IDs', () => {
      expect(provider.getConsentCategoryClass('C0002')).toBe('optanon-category-C0002');
      expect(provider.getConsentCategoryClass('C0003')).toBe('optanon-category-C0003');
      expect(provider.getConsentCategoryClass('C0004')).toBe('optanon-category-C0004');
    });

    it('should return empty string for null categoryId', () => {
      const className = provider.getConsentCategoryClass(null as any);
      expect(className).toBe('');
    });

    it('should return empty string for empty categoryId', () => {
      const className = provider.getConsentCategoryClass('');
      expect(className).toBe('');
    });

    it('should return empty string for non-string categoryId', () => {
      const className = provider.getConsentCategoryClass(123 as any);
      expect(className).toBe('');
    });
  });

  describe('initialize', () => {
    it('should call callback with provided callbacks', () => {
      const onInit = vi.fn();
      const onChange = vi.fn();

      config.onConsentInit = onInit;
      config.onConsentChanged = onChange;
      provider = new OneTrustProvider(config);

      provider.initialize();

      expect((window as any).OptanonWrapper).toBeDefined();
    });

    it('should handle initialize without callbacks', () => {
      expect(() => provider.initialize()).not.toThrow();
    });
  });

  describe('callback', () => {
    it('should register OptanonWrapper function', () => {
      const onInit = vi.fn();

      provider.callback(onInit);

      expect((window as any).OptanonWrapper).toBeDefined();
      expect(typeof (window as any).OptanonWrapper).toBe('function');
    });

    it('should execute initialization callback on first invocation', () => {
      const onInit = vi.fn();

      provider.callback(onInit);
      (window as any).OptanonWrapper();

      expect(onInit).toHaveBeenCalledTimes(1);
    });

    it('should not execute initialization callback on subsequent invocations', () => {
      const onInit = vi.fn();

      provider.callback(onInit);
      (window as any).OptanonWrapper();
      (window as any).OptanonWrapper();
      (window as any).OptanonWrapper();

      expect(onInit).toHaveBeenCalledTimes(1);
    });

    it('should register consent change listener if provided', () => {
      const onInit = vi.fn();
      const onChange = vi.fn();
      const mockOnConsentChanged = vi.fn();

      (window as any).Optanon = {
        OnConsentChanged: mockOnConsentChanged
      };

      provider.callback(onInit, onChange);
      (window as any).OptanonWrapper();

      expect(mockOnConsentChanged).toHaveBeenCalled();
    });

    it('should execute onChange callback when consent changes', () => {
      const onInit = vi.fn();
      const onChange = vi.fn();
      let changeCallback: any;

      (window as any).Optanon = {
        OnConsentChanged: (cb: any) => { changeCallback = cb; }
      };

      provider.callback(onInit, onChange);
      (window as any).OptanonWrapper();

      // Simulate consent change
      changeCallback();

      expect(onChange).toHaveBeenCalled();
    });

    it('should not throw when Optanon.OnConsentChanged is unavailable', () => {
      const onInit = vi.fn();
      const onChange = vi.fn();

      provider.callback(onInit, onChange);

      expect(() => (window as any).OptanonWrapper()).not.toThrow();
    });

    it('should handle errors in initialization callback', () => {
      const onInit = vi.fn(() => { throw new Error('Init failed'); });

      provider.callback(onInit);

      expect(() => (window as any).OptanonWrapper()).not.toThrow();
    });

    it('should handle errors in consent change callback', () => {
      const onInit = vi.fn();
      const onChange = vi.fn(() => { throw new Error('Change failed'); });
      let changeCallback: any;

      (window as any).Optanon = {
        OnConsentChanged: (cb: any) => { changeCallback = cb; }
      };

      provider.callback(onInit, onChange);
      (window as any).OptanonWrapper();

      expect(() => changeCallback()).not.toThrow();
    });
  });
});
