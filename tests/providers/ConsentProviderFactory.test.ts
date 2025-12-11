import { describe, it, expect } from 'vitest';
import { ConsentProviderFactory } from '../../src/providers/ConsentProviderFactory.js';
import { ProviderType } from '../../src/types/ProviderType.js';
import { OneTrustProvider } from '../../src/providers/onetrust/OneTrustProvider.js';
import { MockProvider } from '../../src/providers/mock/MockProvider.js';

describe('ConsentProviderFactory', () => {
  describe('createProvider', () => {
    it('should create OneTrust provider with valid config', () => {
      const provider = ConsentProviderFactory.createProvider({
        type: ProviderType.ONETRUST,
        config: {
          scriptUrl: 'https://cdn.cookielaw.org/script.js',
          domainScript: 'test-domain-123',
          documentLanguage: true
        }
      });

      expect(provider).toBeInstanceOf(OneTrustProvider);
      expect(provider.getProviderName()).toBe(ProviderType.ONETRUST);
    });

    it('should throw error when factoryConfig is null', () => {
      expect(() => {
        ConsentProviderFactory.createProvider(null as any);
      }).toThrow('Factory config is required');
    });

    it('should throw error when provider type is missing', () => {
      expect(() => {
        ConsentProviderFactory.createProvider({
          type: null as any,
          config: {}
        });
      }).toThrow('Provider type is required');
    });

    it('should throw error when provider config is missing', () => {
      expect(() => {
        ConsentProviderFactory.createProvider({
          type: ProviderType.ONETRUST,
          config: null as any
        });
      }).toThrow('Provider config is required');
    });

    it('should throw error when OneTrust scriptUrl is missing', () => {
      expect(() => {
        ConsentProviderFactory.createProvider({
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: '',
            domainScript: 'test-123'
          }
        });
      }).toThrow('OneTrust scriptUrl is required');
    });

    it('should throw error when OneTrust domainScript is missing', () => {
      expect(() => {
        ConsentProviderFactory.createProvider({
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/script.js',
            domainScript: ''
          }
        });
      }).toThrow('OneTrust domainScript is required');
    });

    it('should throw error for unsupported provider type', () => {
      expect(() => {
        ConsentProviderFactory.createProvider({
          type: 'COOKIEBOT' as any,
          config: {
            scriptUrl: 'https://example.com/script.js',
            domainScript: 'test-123'
          }
        });
      }).toThrow('Unsupported provider type: COOKIEBOT');
    });

    it('should handle optional documentLanguage parameter', () => {
      const provider = ConsentProviderFactory.createProvider({
        type: ProviderType.ONETRUST,
        config: {
          scriptUrl: 'https://cdn.cookielaw.org/script.js',
          domainScript: 'test-domain-123'
          // documentLanguage omitted
        }
      });

      expect(provider).toBeInstanceOf(OneTrustProvider);
    });

    it('should handle optional callback parameters in config', () => {
      const onInit = () => console.log('init');
      const onChange = () => console.log('change');

      const provider = ConsentProviderFactory.createProvider({
        type: ProviderType.ONETRUST,
        config: {
          scriptUrl: 'https://cdn.cookielaw.org/script.js',
          domainScript: 'test-domain-123',
          onConsentInit: onInit,
          onConsentChanged: onChange
        }
      });

      expect(provider).toBeInstanceOf(OneTrustProvider);
    });

    it('should validate scriptUrl is a string', () => {
      expect(() => {
        ConsentProviderFactory.createProvider({
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 123 as any,
            domainScript: 'test-123'
          }
        });
      }).toThrow('OneTrust scriptUrl is required');
    });

    // Mock Provider Tests
    describe('Mock Provider', () => {
      it('should create Mock provider with valid config', () => {
        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js'
          }
        });

        expect(provider).toBeInstanceOf(MockProvider);
        expect(provider.getProviderName()).toBe(ProviderType.MOCK);
      });

      it('should create Mock provider with initialConsents', () => {
        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001', 'C0002']
          }
        });

        expect(provider).toBeInstanceOf(MockProvider);
        expect(provider.getActiveConsents()).toEqual(['C0001', 'C0002']);
      });

      it('should throw error when Mock scriptUrl is missing', () => {
        expect(() => {
          ConsentProviderFactory.createProvider({
            type: ProviderType.MOCK,
            config: {
              scriptUrl: ''
            }
          });
        }).toThrow('Mock scriptUrl is required');
      });

      it('should validate Mock scriptUrl is a string', () => {
        expect(() => {
          ConsentProviderFactory.createProvider({
            type: ProviderType.MOCK,
            config: {
              scriptUrl: null as any
            }
          });
        }).toThrow('Mock scriptUrl is required');
      });

      it('should handle optional callbacks in Mock config', () => {
        const onInit = () => console.log('mock init');
        const onChange = () => console.log('mock change');

        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            onConsentInit: onInit,
            onConsentChanged: onChange
          }
        });

        expect(provider).toBeInstanceOf(MockProvider);
      });

      it('should create Mock provider with empty initialConsents', () => {
        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: []
          }
        });

        expect(provider).toBeInstanceOf(MockProvider);
        expect(provider.getActiveConsents()).toEqual([]);
      });
    });

    // Type Narrowing and Discriminated Union Tests
    describe('Type Narrowing', () => {
      it('should correctly narrow OneTrust config type', () => {
        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/script.js',
            domainScript: 'test-domain-123',
            documentLanguage: true
          }
        });

        // Type should have been narrowed - provider should have OneTrust-specific behavior
        expect(provider.getProviderName()).toBe(ProviderType.ONETRUST);
        expect(provider.getConsentCategoryClass('C0001')).toBe('optanon-category-C0001');
      });

      it('should correctly narrow Mock config type', () => {
        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001']
          }
        });

        // Type should have been narrowed - provider should have Mock-specific behavior
        expect(provider.getProviderName()).toBe(ProviderType.MOCK);
        expect(provider.getConsentCategoryClass('C0001')).toBe('mock-consent-category-C0001');
      });

      it('should handle OneTrust-specific properties correctly', () => {
        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.ONETRUST,
          config: {
            scriptUrl: 'https://cdn.cookielaw.org/script.js',
            domainScript: 'abc-123-def', // OneTrust-specific property
            documentLanguage: false
          }
        });

        expect(provider).toBeInstanceOf(OneTrustProvider);
        // OneTrust provider was created successfully with domain-specific config
      });

      it('should handle Mock-specific properties correctly', () => {
        const provider = ConsentProviderFactory.createProvider({
          type: ProviderType.MOCK,
          config: {
            scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
            initialConsents: ['C0001', 'C0002', 'C0003'] // Mock-specific property
          }
        });

        expect(provider).toBeInstanceOf(MockProvider);
        // Mock provider was created with initial consents
        expect(provider.getActiveConsents()).toHaveLength(3);
      });
    });
  });
});
