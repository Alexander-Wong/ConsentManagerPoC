import { BaseResource } from "../resources/BaseResource.js";

/**
 * Service responsible for controlling UI resource visibility based on cookie consent.
 */
export class ResourceVisibilityService {
  /**
   * Evaluates consent for a single resource and updates visibility.
   */
  evaluateResource(resource: BaseResource, activeCookies: ActiveCookies): void {
    if (!resource) {
      console.warn('[ResourceVisibilityService] Invalid resource');
      return;
    }

    if (!activeCookies || !Array.isArray(activeCookies)) {
      console.warn('[ResourceVisibilityService] Invalid active cookies array');
      return;
    }

    try {
      resource.checkConsent(activeCookies);
    } catch (error) {
      console.error('[ResourceVisibilityService] Failed to evaluate resource:', error);
    }
  }

  /**
   * Evaluates consent for all resources and updates visibility.
   */
  evaluateAllResources(resources: BaseResource[], activeCookies: ActiveCookies): void {
    if (!resources || !Array.isArray(resources)) {
      console.warn('[ResourceVisibilityService] Invalid resources array');
      return;
    }

    if (!activeCookies || !Array.isArray(activeCookies)) {
      console.warn('[ResourceVisibilityService] Invalid active cookies array');
      return;
    }

    resources.forEach(resource => {
      if (resource) {
        this.evaluateResource(resource, activeCookies);
      }
    });
  }
}
