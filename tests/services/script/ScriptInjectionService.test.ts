import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScriptInjectionService } from '../../../src/services/script/ScriptInjectionService.js';
import { IConsentProvider } from '../../../src/providers/IConsentProvider.js';
import { CookieType } from '../../../src/types/CookieType.js';

describe('ScriptInjectionService', () => {
  let service: ScriptInjectionService;
  let mockProvider: IConsentProvider;

  beforeEach(() => {
    document.head.innerHTML = '';

    mockProvider = {
      getProviderName: () => 'MockProvider',
      getActiveConsents: () => [],
      showConsentBanner: vi.fn(),
      injectProviderScript: vi.fn(),
      getConsentCategoryClass: (id: string) => `mock-category-${id}`,
      initialize: vi.fn(),
      callback: vi.fn()
    };

    service = new ScriptInjectionService(mockProvider);
  });

  describe('injectCategoryScript', () => {
    it('should inject inline code script', () => {
      const category = {
        cookies: [CookieType.C0001],
        cookieNames: [],
        code: 'console.log("test");'
      };

      service.injectCategoryScript(category as any);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(1);
      expect(scripts[0].textContent).toBe('console.log("test");');
      expect(scripts[0].type).toBe('text/plain');
    });

    it('should inject external source script', () => {
      const category = {
        cookies: [CookieType.C0001],
        cookieNames: [],
        src: 'https://example.com/script.js'
      };

      service.injectCategoryScript(category as any);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(1);
      expect(scripts[0].src).toBe('https://example.com/script.js');
    });

    it('should inject deferred scripts', () => {
      const category = {
        cookies: [CookieType.C0001],
        cookieNames: [],
        defer: [
          { code: 'script1();' },
          { src: 'https://example.com/script2.js' }
        ]
      };

      service.injectCategoryScript(category as any);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(1);
      expect(scripts[0].src).toContain('defer.js');
      expect(scripts[0].getAttribute('data-scripts')).toBeDefined();
    });

    it('should apply consent category classes', () => {
      const category = {
        cookies: [CookieType.C0001, CookieType.C0002],
        cookieNames: [],
        code: 'test();'
      };

      service.injectCategoryScript(category as any);

      const script = document.head.querySelector('script');
      expect(script?.className).toContain('mock-category-C0001');
      expect(script?.className).toContain('mock-category-C0002');
    });

    it('should handle category with no cookies', () => {
      const category = {
        cookies: [],
        cookieNames: [],
        code: 'test();'
      };

      service.injectCategoryScript(category as any);

      const script = document.head.querySelector('script');
      expect(script?.className).toBe('');
    });

    it('should skip injection when category is invalid', () => {
      service.injectCategoryScript(null as any);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(0);
    });

    it('should skip injection when no code, src, or defer provided', () => {
      const category = {
        cookies: [CookieType.C0001],
        cookieNames: []
      };

      service.injectCategoryScript(category as any);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(0);
    });

    it('should filter out null cookies from class list', () => {
      const category = {
        cookies: [CookieType.C0001, null, CookieType.C0002],
        cookieNames: [],
        code: 'test();'
      };

      service.injectCategoryScript(category as any);

      const script = document.head.querySelector('script');
      expect(script?.className).toBe('mock-category-C0001 mock-category-C0002');
    });

    it('should handle both code and src in same category', () => {
      const category = {
        cookies: [CookieType.C0001],
        cookieNames: [],
        code: 'inline();',
        src: 'https://example.com/external.js'
      };

      service.injectCategoryScript(category as any);

      const script = document.head.querySelector('script');
      expect(script?.textContent).toBe('inline();');
      expect(script?.src).toContain('https://example.com/external.js');
    });
  });

  describe('injectAllCategoryScripts', () => {
    it('should inject multiple category scripts', () => {
      const categories = [
        { cookies: [CookieType.C0001], cookieNames: [], code: 'script1();' },
        { cookies: [CookieType.C0002], cookieNames: [], code: 'script2();' }
      ];

      service.injectAllCategoryScripts(categories as any);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(2);
    });

    it('should handle empty categories array', () => {
      expect(() => service.injectAllCategoryScripts([])).not.toThrow();
    });

    it('should skip null categories', () => {
      const categories = [
        { cookies: [CookieType.C0001], cookieNames: [], code: 'script1();' },
        null,
        { cookies: [CookieType.C0002], cookieNames: [], code: 'script2();' }
      ];

      service.injectAllCategoryScripts(categories as any);

      const scripts = document.head.querySelectorAll('script');
      expect(scripts.length).toBe(2);
    });

    it('should handle invalid categories parameter', () => {
      expect(() => service.injectAllCategoryScripts(null as any)).not.toThrow();
    });
  });

  describe('injectProviderScript', () => {
    it('should call provider.injectProviderScript', () => {
      service.injectProviderScript();

      expect(mockProvider.injectProviderScript).toHaveBeenCalled();
    });

    it('should call provider.initialize if defined', () => {
      service.injectProviderScript();

      expect(mockProvider.initialize).toHaveBeenCalled();
    });

    it('should handle provider without initialize method', () => {
      delete mockProvider.initialize;

      expect(() => service.injectProviderScript()).not.toThrow();
    });

    it('should handle provider errors gracefully', () => {
      mockProvider.injectProviderScript = vi.fn(() => {
        throw new Error('Injection failed');
      });

      expect(() => service.injectProviderScript()).not.toThrow();
    });
  });
});
