import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResourceVisibilityService } from '../../../src/services/resources/ResourceVisibilityService.js';
import { Resource } from '../../../src/resources/Base.js';
import { ResourceType } from '../../../src/types/ResourceType.js';
import { CookieType } from '../../../src/types/CookieType.js';
import { CookieConditionalType } from '../../../src/types/CookieConditionalType.js';

describe('ResourceVisibilityService', () => {
  let service: ResourceVisibilityService;

  beforeEach(() => {
    service = new ResourceVisibilityService();
    document.body.innerHTML = '';
  });

  describe('evaluateResource', () => {
    it('should call resource.checkConsent with active cookies', () => {
      const resource = new Resource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );
      const checkSpy = vi.spyOn(resource, 'checkConsent');

      const activeCookies = [CookieType.C0003];

      service.evaluateResource(resource, activeCookies);

      expect(checkSpy).toHaveBeenCalledWith(activeCookies);
    });

    it('should handle null resource gracefully', () => {
      expect(() => {
        service.evaluateResource(null as any, [CookieType.C0001]);
      }).not.toThrow();
    });

    it('should handle invalid activeCookies', () => {
      const resource = new Resource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      expect(() => {
        service.evaluateResource(resource, null as any);
      }).not.toThrow();
    });

    it('should handle resource.checkConsent errors gracefully', () => {
      const resource = new Resource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      vi.spyOn(resource, 'checkConsent').mockImplementation(() => {
        throw new Error('Check failed');
      });

      expect(() => {
        service.evaluateResource(resource, [CookieType.C0003]);
      }).not.toThrow();
    });
  });

  describe('evaluateAllResources', () => {
    it('should evaluate multiple resources', () => {
      const resource1 = new Resource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );
      const resource2 = new Resource(
        ResourceType.Map,
        [CookieType.C0002],
        CookieConditionalType.AND
      );

      const spy1 = vi.spyOn(resource1, 'checkConsent');
      const spy2 = vi.spyOn(resource2, 'checkConsent');

      const activeCookies = [CookieType.C0003];

      service.evaluateAllResources([resource1, resource2], activeCookies);

      expect(spy1).toHaveBeenCalledWith(activeCookies);
      expect(spy2).toHaveBeenCalledWith(activeCookies);
    });

    it('should handle empty resources array', () => {
      expect(() => {
        service.evaluateAllResources([], [CookieType.C0001]);
      }).not.toThrow();
    });

    it('should skip null resources in array', () => {
      const resource = new Resource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );
      const spy = vi.spyOn(resource, 'checkConsent');

      service.evaluateAllResources([resource, null as any], [CookieType.C0003]);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle null resources array', () => {
      expect(() => {
        service.evaluateAllResources(null as any, [CookieType.C0001]);
      }).not.toThrow();
    });

    it('should handle null activeCookies', () => {
      const resource = new Resource(
        ResourceType.Video,
        [CookieType.C0003],
        CookieConditionalType.AND
      );

      expect(() => {
        service.evaluateAllResources([resource], null as any);
      }).not.toThrow();
    });
  });
});
