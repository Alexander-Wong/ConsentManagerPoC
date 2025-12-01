import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsentEngine } from '../../src/core/ConsentEngine.js';
import { ConsentEngineConfig } from '../../src/config/ConsentEngineConfig.js';
import { IConsentProvider } from '../../src/providers/IConsentProvider.js';
import { CookieType } from '../../src/types/CookieType.js';
import { ResourceType } from '../../src/types/ResourceType.js';
import { CookieConditionalType } from '../../src/types/CookieConditionalType.js';
import { BaseResource } from '../../src/resources/BaseResource.js';
import { ScriptInjectionService } from '../../src/services/script/ScriptInjectionService.js';
import { CookieManagementService } from '../../src/services/cookies/CookieManagementService.js';
import { ResourceVisibilityService } from '../../src/services/resources/ResourceVisibilityService.js';
import { ConsentEvaluationService } from '../../src/services/evaluation/ConsentEvaluationService.js';

describe('ConsentEngine', () => {
  let mockProvider: IConsentProvider;
  let config: ConsentEngineConfig;

  beforeEach(() => {
    mockProvider = {
      getProviderName: () => 'MockProvider',
      getActiveConsents: vi.fn(() => [CookieType.C0001]),
      showConsentBanner: vi.fn(),
      injectProviderScript: vi.fn(),
      getConsentCategoryClass: vi.fn((id) => `mock-${id}`),
      initialize: vi.fn(),
      callback: vi.fn()
    };

    config = new ConsentEngineConfig(
      [
        {
          cookies: [CookieType.C0001],
          cookieNames: ['test_cookie'],
          code: 'console.log("test");'
        }
      ] as any,
      [
        new BaseResource(
          ResourceType.Video,
          [CookieType.C0003],
          CookieConditionalType.AND
        )
      ]
    );
  });

  describe('constructor', () => {
    it('should create engine with valid config and provider', () => {
      const engine = new ConsentEngine(config, mockProvider);

      expect(engine.config).toBe(config);
      expect(engine.getScriptService()).toBeDefined();
      expect(engine.getCookieService()).toBeDefined();
      expect(engine.getResourceService()).toBeDefined();
      expect(engine.getEvaluationService()).toBeDefined();
    });

    it('should throw error when config is null', () => {
      expect(() => {
        new ConsentEngine(null as any, mockProvider);
      }).toThrow('ConsentEngineConfig is required');
    });

    it('should throw error when provider is null', () => {
      expect(() => {
        new ConsentEngine(config, null as any);
      }).toThrow('IConsentProvider is required');
    });

    it('should use custom services when provided', () => {
      const customScriptService = new ScriptInjectionService(mockProvider);
      const customCookieService = new CookieManagementService();
      const customResourceService = new ResourceVisibilityService();
      const customEvalService = new ConsentEvaluationService(customCookieService);

      const engine = new ConsentEngine(
        config,
        mockProvider,
        customScriptService,
        customCookieService,
        customResourceService,
        customEvalService
      );

      expect(engine.getScriptService()).toBe(customScriptService);
      expect(engine.getCookieService()).toBe(customCookieService);
      expect(engine.getResourceService()).toBe(customResourceService);
      expect(engine.getEvaluationService()).toBe(customEvalService);
    });

    it('should create default services when not provided', () => {
      const engine = new ConsentEngine(config, mockProvider);

      expect(engine.getScriptService()).toBeInstanceOf(ScriptInjectionService);
      expect(engine.getCookieService()).toBeInstanceOf(CookieManagementService);
      expect(engine.getResourceService()).toBeInstanceOf(ResourceVisibilityService);
      expect(engine.getEvaluationService()).toBeInstanceOf(ConsentEvaluationService);
    });
  });

  describe('getActiveConsents', () => {
    it('should return active consents from provider', () => {
      const engine = new ConsentEngine(config, mockProvider);

      const consents = engine.getActiveConsents();

      expect(consents).toEqual([CookieType.C0001]);
      expect(mockProvider.getActiveConsents).toHaveBeenCalled();
    });

    it('should return empty array when provider throws error', () => {
      mockProvider.getActiveConsents = vi.fn(() => {
        throw new Error('Provider error');
      });

      const engine = new ConsentEngine(config, mockProvider);
      const consents = engine.getActiveConsents();

      expect(consents).toEqual([]);
    });

    it('should return empty array when provider returns null', () => {
      mockProvider.getActiveConsents = vi.fn(() => null as any);

      const engine = new ConsentEngine(config, mockProvider);
      const consents = engine.getActiveConsents();

      expect(consents).toEqual([]);
    });
  });

  describe('evaluateConsents', () => {
    it('should call evaluation service with config and active consents', () => {
      const mockEvalService = {
        evaluateCookieConsents: vi.fn()
      } as any;

      const mockResourceService = {
        evaluateAllResources: vi.fn()
      } as any;

      const engine = new ConsentEngine(
        config,
        mockProvider,
        undefined,
        undefined,
        mockResourceService,
        mockEvalService
      );

      engine.evaluateConsents();

      expect(mockEvalService.evaluateCookieConsents).toHaveBeenCalledWith(
        config.cookieCategories,
        [CookieType.C0001]
      );

      expect(mockResourceService.evaluateAllResources).toHaveBeenCalledWith(
        config.resources,
        [CookieType.C0001]
      );
    });

    it('should handle missing cookieCategories in config', () => {
      const invalidConfig = new ConsentEngineConfig(null as any, []);
      const engine = new ConsentEngine(invalidConfig, mockProvider);

      expect(() => engine.evaluateConsents()).not.toThrow();
    });

    it('should handle missing resources in config', () => {
      const invalidConfig = new ConsentEngineConfig([], null as any);
      const engine = new ConsentEngine(invalidConfig, mockProvider);

      expect(() => engine.evaluateConsents()).not.toThrow();
    });

    it('should handle errors from evaluation service', () => {
      const mockEvalService = {
        evaluateCookieConsents: vi.fn(() => {
          throw new Error('Eval failed');
        })
      } as any;

      const engine = new ConsentEngine(
        config,
        mockProvider,
        undefined,
        undefined,
        undefined,
        mockEvalService
      );

      expect(() => engine.evaluateConsents()).not.toThrow();
    });
  });

  describe('start', () => {
    it('should inject category scripts and provider script', () => {
      const mockScriptService = {
        injectAllCategoryScripts: vi.fn(),
        injectProviderScript: vi.fn()
      } as any;

      const engine = new ConsentEngine(
        config,
        mockProvider,
        mockScriptService
      );

      engine.start();

      expect(mockScriptService.injectAllCategoryScripts).toHaveBeenCalledWith(
        config.cookieCategories
      );
      expect(mockScriptService.injectProviderScript).toHaveBeenCalled();
    });

    it('should handle missing cookieCategories', () => {
      const invalidConfig = new ConsentEngineConfig(null as any, []);
      const engine = new ConsentEngine(invalidConfig, mockProvider);

      expect(() => engine.start()).not.toThrow();
    });

    it('should handle errors from script service', () => {
      const mockScriptService = {
        injectAllCategoryScripts: vi.fn(() => {
          throw new Error('Injection failed');
        }),
        injectProviderScript: vi.fn()
      } as any;

      const engine = new ConsentEngine(
        config,
        mockProvider,
        mockScriptService
      );

      expect(() => engine.start()).not.toThrow();
    });
  });

  describe('service getters', () => {
    it('should return script service instance', () => {
      const engine = new ConsentEngine(config, mockProvider);
      expect(engine.getScriptService()).toBeInstanceOf(ScriptInjectionService);
    });

    it('should return cookie service instance', () => {
      const engine = new ConsentEngine(config, mockProvider);
      expect(engine.getCookieService()).toBeInstanceOf(CookieManagementService);
    });

    it('should return resource service instance', () => {
      const engine = new ConsentEngine(config, mockProvider);
      expect(engine.getResourceService()).toBeInstanceOf(ResourceVisibilityService);
    });

    it('should return evaluation service instance', () => {
      const engine = new ConsentEngine(config, mockProvider);
      expect(engine.getEvaluationService()).toBeInstanceOf(ConsentEvaluationService);
    });
  });

  describe('integration scenarios', () => {
    it('should handle full initialization and evaluation flow', () => {
      const engine = new ConsentEngine(config, mockProvider);

      // Start engine
      engine.start();
      expect(mockProvider.injectProviderScript).toHaveBeenCalled();

      // Evaluate consents
      engine.evaluateConsents();
      expect(mockProvider.getActiveConsents).toHaveBeenCalled();
    });

    it('should handle consent changes over time', () => {
      let activeConsents = [CookieType.C0001];
      mockProvider.getActiveConsents = vi.fn(() => activeConsents);

      const engine = new ConsentEngine(config, mockProvider);

      // First evaluation
      let consents = engine.getActiveConsents();
      expect(consents).toEqual([CookieType.C0001]);

      // Simulate consent change
      activeConsents = [CookieType.C0001, CookieType.C0002];

      // Second evaluation
      consents = engine.getActiveConsents();
      expect(consents).toEqual([CookieType.C0001, CookieType.C0002]);
    });
  });
});
