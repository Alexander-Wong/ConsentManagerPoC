import { describe, it, expect } from 'vitest';
import { ConsentProviderFactory } from '../../src/providers/ConsentProviderFactory.js';
import { ProviderType } from '../../src/providers/ProviderType.js';
import { OneTrustProvider } from '../../src/providers/onetrust/OneTrustProvider.js';

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
  });
});
