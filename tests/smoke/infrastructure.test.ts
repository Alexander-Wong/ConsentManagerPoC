import { describe, it, expect } from 'vitest';

/**
 * Smoke test to verify testing infrastructure is working correctly.
 * This test ensures that Vitest, happy-dom, and TypeScript integration work.
 */

describe('Testing Infrastructure', () => {
  describe('Vitest Setup', () => {
    it('should run basic assertions', () => {
      expect(true).toBe(true);
      expect(1 + 1).toBe(2);
      expect('hello').toBe('hello');
    });

    it('should support TypeScript', () => {
      const greeting: string = 'Hello, Vitest!';
      expect(greeting).toBe('Hello, Vitest!');
    });
  });

  describe('Happy-DOM Environment', () => {
    it('should have access to document', () => {
      expect(document).toBeDefined();
      expect(document.body).toBeDefined();
      expect(document.head).toBeDefined();
    });

    it('should have access to window', () => {
      expect(window).toBeDefined();
      expect(typeof window).toBe('object');
    });

    it('should support DOM manipulation', () => {
      const div = document.createElement('div');
      div.textContent = 'Test';
      div.className = 'test-class';

      expect(div.textContent).toBe('Test');
      expect(div.className).toBe('test-class');
    });

    it('should support querySelector', () => {
      document.body.innerHTML = '<div id="test">Hello</div>';
      const element = document.querySelector('#test');

      expect(element).toBeDefined();
      expect(element?.textContent).toBe('Hello');
    });

    it('should support cookie manipulation', () => {
      document.cookie = 'test_cookie=value; Path=/';
      expect(document.cookie).toContain('test_cookie');
    });
  });

  describe('Global Setup', () => {
    it('should have clean DOM on each test', () => {
      // This should be empty because setup.ts clears it before each test
      expect(document.body.innerHTML).toBe('');
      expect(document.head.innerHTML).toBe('');
    });

    it('should have no OneTrust globals', () => {
      expect((window as any).OptanonActiveGroups).toBeUndefined();
      expect((window as any).Optanon).toBeUndefined();
      expect((window as any).Onetrust).toBeUndefined();
      expect((window as any).OptanonWrapper).toBeUndefined();
    });
  });

  describe('ES Modules', () => {
    it('should support import statements', async () => {
      // This test verifies that ES modules work correctly
      const module = await import('../../src/types/CookieType.js');
      expect(module.CookieType).toBeDefined();
      expect(module.CookieType.C0001).toBeDefined();
    });
  });
});
