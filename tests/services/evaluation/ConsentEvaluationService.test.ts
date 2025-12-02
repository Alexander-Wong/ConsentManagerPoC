import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsentEvaluationService } from '../../../src/services/evaluation/ConsentEvaluationService.js';
import { CookieManagementService } from '../../../src/services/cookies/CookieManagementService.js';
import { CookieType } from '../../../src/types/CookieType.js';
import { CookieConditionalType } from '../../../src/types/CookieConditionalType.js';
import { ConditionalEval } from '../../../src/utils/evaluation/CookieEvaluator.js';

describe('ConsentEvaluationService', () => {
  let service: ConsentEvaluationService;
  let mockCookieService: CookieManagementService;

  beforeEach(() => {
    mockCookieService = new CookieManagementService();
    service = new ConsentEvaluationService(mockCookieService);
  });

  describe('constructor', () => {
    it('should throw error when cookieService is null', () => {
      expect(() => new ConsentEvaluationService(null as any)).toThrow(
        'CookieManagementService is required'
      );
    });
  });

  describe('evaluateCookieConsents', () => {
    it('should delete cookies when consent is withdrawn', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      const categories = [{
        cookies: [CookieType.C0002],
        cookieNames: ['perf_cookie']
      }];

      const activeCookies = [CookieType.C0001]; // C0002 not active

      service.evaluateCookieConsents(categories as any, activeCookies);

      expect(deleteSpy).toHaveBeenCalledWith(['perf_cookie']);
    });

    it('should not delete cookies when consent is active', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      const categories = [{
        cookies: [CookieType.C0002],
        cookieNames: ['perf_cookie']
      }];

      const activeCookies = [CookieType.C0002]; // C0002 is active

      service.evaluateCookieConsents(categories as any, activeCookies);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple categories', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      const categories = [
        { cookies: [CookieType.C0002], cookieNames: ['cookie1'] },
        { cookies: [CookieType.C0003], cookieNames: ['cookie2'] }
      ];

      const activeCookies = [CookieType.C0001]; // Neither active

      service.evaluateCookieConsents(categories as any, activeCookies);

      expect(deleteSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle empty categories array', () => {
      expect(() => {
        service.evaluateCookieConsents([], [CookieType.C0001]);
      }).not.toThrow();
    });

    it('should handle empty activeCookies array', () => {
      const categories = [{
        cookies: [CookieType.C0002],
        cookieNames: ['cookie']
      }];

      expect(() => {
        service.evaluateCookieConsents(categories as any, []);
      }).not.toThrow();
    });

    it('should skip category with empty cookieNames', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      const categories = [{
        cookies: [CookieType.C0002],
        cookieNames: []
      }];

      service.evaluateCookieConsents(categories as any, []);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should handle non-array categories parameter', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      // Pass an object instead of an array
      service.evaluateCookieConsents({} as any, [CookieType.C0001]);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should handle non-array activeCookies parameter', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      const categories = [{
        cookies: [CookieType.C0002],
        cookieNames: ['test']
      }];

      // Pass an object instead of an array
      service.evaluateCookieConsents(categories as any, {} as any);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should handle category without cookies property', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      const categories = [{ cookieNames: ['test'] }]; // missing cookies property

      service.evaluateCookieConsents(categories as any, [CookieType.C0001]);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should handle category without cookieNames property', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');

      const categories = [{ cookies: [CookieType.C0001] }]; // missing cookieNames property

      service.evaluateCookieConsents(categories as any, [CookieType.C0001]);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should handle errors during category evaluation', () => {
      const deleteSpy = vi.spyOn(mockCookieService, 'deleteCookies');
      const evalSpy = vi.spyOn(ConditionalEval, 'eval').mockImplementation(() => {
        throw new Error('Evaluation failed');
      });

      const categories = [{
        cookies: [CookieType.C0001],
        cookieNames: ['test']
      }];

      expect(() => service.evaluateCookieConsents(categories as any, [CookieType.C0001])).not.toThrow();
      expect(deleteSpy).not.toHaveBeenCalled();

      evalSpy.mockRestore();
    });
  });

  describe('hasActiveConsent', () => {
    it('should return true when all required cookies are active (AND)', () => {
      const result = service.hasActiveConsent(
        [CookieType.C0001, CookieType.C0002],
        [CookieType.C0001, CookieType.C0002, CookieType.C0003],
        CookieConditionalType.AND
      );
      expect(result).toBe(true);
    });

    it('should return false when some required cookies are missing (AND)', () => {
      const result = service.hasActiveConsent(
        [CookieType.C0001, CookieType.C0002],
        [CookieType.C0001],
        CookieConditionalType.AND
      );
      expect(result).toBe(false);
    });

    it('should return true when at least one cookie is active (OR)', () => {
      const result = service.hasActiveConsent(
        [CookieType.C0001, CookieType.C0002],
        [CookieType.C0002],
        CookieConditionalType.OR
      );
      expect(result).toBe(true);
    });

    it('should handle invalid inputs gracefully', () => {
      const result = service.hasActiveConsent(
        null as any,
        [CookieType.C0001],
        CookieConditionalType.AND
      );
      expect(result).toBe(false);
    });

    it('should default to AND condition when not specified', () => {
      const result = service.hasActiveConsent(
        [CookieType.C0001],
        [CookieType.C0001]
      );
      expect(result).toBe(true);
    });

    it('should handle non-array activeCookies in hasActiveConsent', () => {
      const result = service.hasActiveConsent(
        [CookieType.C0001],
        {} as any,
        CookieConditionalType.AND
      );
      expect(result).toBe(false);
    });

    it('should handle errors in hasActiveConsent evaluation', () => {
      const evalSpy = vi.spyOn(ConditionalEval, 'eval').mockImplementation(() => {
        throw new Error('Evaluation error');
      });

      const result = service.hasActiveConsent(
        [CookieType.C0001],
        [CookieType.C0001],
        CookieConditionalType.AND
      );

      expect(result).toBe(false);

      evalSpy.mockRestore();
    });
  });
});
