import { describe, it, expect, beforeEach } from 'vitest';
import { BaseResource } from '../../src/resources/BaseResource.js';
import { ResourceType } from '../../src/types/ResourceType.js';
import { CookieType } from '../../src/types/CookieType.js';
import { CookieConditionalType } from '../../src/types/CookieConditionalType.js';

describe('BaseResource', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      expect(resource.resourceType).toBe(ResourceType.Video);
      expect(resource.cookies).toEqual([CookieType.C0003]);
      expect(resource.condition).toBe(CookieConditionalType.AND);
    });

    it('should handle empty cookies array', () => {
      const resource = new BaseResource(
        ResourceType.Video,
        [],
        CookieConditionalType.AND
      );

      expect(resource.cookies).toEqual([]);
    });
  });

  describe('checkConsent', () => {
    it('should add overlay class when consent not granted', () => {
      document.body.innerHTML = '<div videotag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      resource.checkConsent([CookieType.C0001]); // C0003 not active

      const element = document.querySelector('[videotag]');
      expect(element?.classList.contains('overlay')).toBe(true);
      expect(element?.classList.contains('disable-overlay')).toBe(false);
    });

    it('should add disable-overlay class when consent is granted', () => {
      document.body.innerHTML = '<div videotag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      resource.checkConsent([CookieType.C0003]); // C0003 is active

      const element = document.querySelector('[videotag]');
      expect(element?.classList.contains('disable-overlay')).toBe(true);
      expect(element?.classList.contains('overlay')).toBe(false);
    });

    it('should handle multiple elements with same resource type', () => {
      document.body.innerHTML = `
        <div videotag></div>
        <div videotag></div>
        <div videotag></div>
      `;

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      resource.checkConsent([CookieType.C0003]);

      const elements = document.querySelectorAll('[videotag]');
      elements.forEach(el => {
        expect(el.classList.contains('disable-overlay')).toBe(true);
      });
    });

    it('should toggle classes when consent changes', () => {
      document.body.innerHTML = '<div videotag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      // First evaluation: no consent
      resource.checkConsent([CookieType.C0001]);
      let element = document.querySelector('[videotag]');
      expect(element?.classList.contains('overlay')).toBe(true);

      // Second evaluation: consent granted
      resource.checkConsent([CookieType.C0003]);
      element = document.querySelector('[videotag]');
      expect(element?.classList.contains('disable-overlay')).toBe(true);
      expect(element?.classList.contains('overlay')).toBe(false);
    });

    it('should handle OR condition', () => {
      document.body.innerHTML = '<div videotag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003, CookieType.C0004],
        CookieConditionalType.OR
      );

      resource.checkConsent([CookieType.C0003]); // One of two active

      const element = document.querySelector('[videotag]');
      expect(element?.classList.contains('disable-overlay')).toBe(true);
    });

    it('should handle AND condition with multiple cookies', () => {
      document.body.innerHTML = '<div videotag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003, CookieType.C0004],
        CookieConditionalType.AND
      );

      // Only one cookie active - should not grant consent
      resource.checkConsent([CookieType.C0003]);
      let element = document.querySelector('[videotag]');
      expect(element?.classList.contains('overlay')).toBe(true);

      // Both cookies active - should grant consent
      resource.checkConsent([CookieType.C0003, CookieType.C0004]);
      element = document.querySelector('[videotag]');
      expect(element?.classList.contains('disable-overlay')).toBe(true);
    });

    it('should handle no matching elements in DOM', () => {
      document.body.innerHTML = '<div othertag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      expect(() => {
        resource.checkConsent([CookieType.C0003]);
      }).not.toThrow();
    });

    it('should handle different resource types', () => {
      document.body.innerHTML = `
        <div maptag></div>
        <div videotag></div>
        <div kalturatag></div>
      `;

      const mapResource = new BaseResource(
        ResourceType.Map,
        [CookieType.C0002],
        CookieConditionalType.AND
      );

      mapResource.checkConsent([CookieType.C0002]);

      expect(document.querySelector('[maptag]')?.classList.contains('disable-overlay')).toBe(true);
      expect(document.querySelector('[videotag]')?.classList.contains('disable-overlay')).toBe(false);
    });

    it('should preserve existing classes on element', () => {
      document.body.innerHTML = '<div videotag class="existing-class"></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      resource.checkConsent([CookieType.C0003]);

      const element = document.querySelector('[videotag]');
      expect(element?.classList.contains('existing-class')).toBe(true);
      expect(element?.classList.contains('disable-overlay')).toBe(true);
    });

    it('should handle empty activeCookies array', () => {
      document.body.innerHTML = '<div videotag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      resource.checkConsent([]);

      const element = document.querySelector('[videotag]');
      expect(element?.classList.contains('overlay')).toBe(true);
    });

    it('should handle resource with empty cookies array', () => {
      document.body.innerHTML = '<div videotag></div>';

      const resource = new BaseResource(
        ResourceType.Video,
        [],
        CookieConditionalType.AND
      );

      resource.checkConsent([CookieType.C0003]);

      const element = document.querySelector('[videotag]');
      // Empty cookies array with AND should evaluate to true
      expect(element?.classList.contains('disable-overlay')).toBe(true);
    });
  });
});
