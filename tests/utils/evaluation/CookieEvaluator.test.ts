import { describe, it, expect } from 'vitest';
import { ConditionalEval } from '../../../src/utils/evaluation/CookieEvaluator.js';
import { CookieConditionalType } from '../../../src/types/CookieConditionalType.js';

describe('ConditionalEval', () => {
  describe('AND condition', () => {
    it('should return true when all source items exist in target', () => {
      const result = ConditionalEval.eval(
        ['C0001', 'C0002'],
        ['C0001', 'C0002', 'C0003'],
        CookieConditionalType.AND
      );
      expect(result).toBe(true);
    });

    it('should return false when some source items missing from target', () => {
      const result = ConditionalEval.eval(
        ['C0001', 'C0002'],
        ['C0001'],
        CookieConditionalType.AND
      );
      expect(result).toBe(false);
    });

    it('should return true when source is empty array', () => {
      const result = ConditionalEval.eval(
        [],
        ['C0001'],
        CookieConditionalType.AND
      );
      expect(result).toBe(true);
    });

    it('should return false when target is empty but source has items', () => {
      const result = ConditionalEval.eval(
        ['C0001'],
        [],
        CookieConditionalType.AND
      );
      expect(result).toBe(false);
    });
  });

  describe('OR condition', () => {
    it('should return true when at least one source item exists in target', () => {
      const result = ConditionalEval.eval(
        ['C0001', 'C0002'],
        ['C0002', 'C0003'],
        CookieConditionalType.OR
      );
      expect(result).toBe(true);
    });

    it('should return false when no source items exist in target', () => {
      const result = ConditionalEval.eval(
        ['C0001', 'C0002'],
        ['C0003', 'C0004'],
        CookieConditionalType.OR
      );
      expect(result).toBe(false);
    });

    it('should return false when source is empty array', () => {
      const result = ConditionalEval.eval(
        [],
        ['C0001'],
        CookieConditionalType.OR
      );
      expect(result).toBe(false);
    });

    it('should return true when all source items exist in target', () => {
      const result = ConditionalEval.eval(
        ['C0001'],
        ['C0001', 'C0002'],
        CookieConditionalType.OR
      );
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays for both source and target with AND', () => {
      const result = ConditionalEval.eval([], [], CookieConditionalType.AND);
      expect(result).toBe(true);
    });

    it('should handle empty arrays for both source and target with OR', () => {
      const result = ConditionalEval.eval([], [], CookieConditionalType.OR);
      expect(result).toBe(false);
    });

    it('should throw error for unsupported condition type', () => {
      expect(() => {
        ConditionalEval.eval(['C0001'], ['C0001'], 'INVALID' as any);
      }).toThrow('Unsupported Evaluation Type');
    });

    it('should handle numeric values', () => {
      const result = ConditionalEval.eval(
        [1, 2],
        [2, 3],
        CookieConditionalType.OR
      );
      expect(result).toBe(true);
    });

    it('should handle duplicate values', () => {
      const result = ConditionalEval.eval(
        ['C0001', 'C0001'],
        ['C0001'],
        CookieConditionalType.AND
      );
      expect(result).toBe(true);
    });
  });
});
