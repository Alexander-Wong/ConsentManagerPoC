import { CookieCategory } from "../CookieCategory.js";
import { ConditionalEval } from "../CookieEvaluator.js";
import { CookieConditionalType } from "../CookieConditionalType.js";
import { CookieManagementService } from "./CookieManagementService.js";

/**
 * Service responsible for evaluating consent conditions and taking action.
 */
export class ConsentEvaluationService {
  constructor(private cookieService: CookieManagementService) {
    if (!cookieService) {
      throw new Error('[ConsentEvaluationService] CookieManagementService is required');
    }
  }

  /**
   * Evaluates consent for cookie categories and deletes cookies if consent withdrawn.
   */
  evaluateCookieConsents(
    categories: CookieCategory[],
    activeCookies: ActiveCookies
  ): void {
    if (!categories || !Array.isArray(categories)) {
      console.warn('[ConsentEvaluationService] Invalid categories array');
      return;
    }

    if (!activeCookies || !Array.isArray(activeCookies)) {
      console.warn('[ConsentEvaluationService] Invalid active cookies array');
      return;
    }

    categories.forEach(category => {
      if (!category || !category.cookies || !Array.isArray(category.cookieNames)) {
        console.warn('[ConsentEvaluationService] Invalid category');
        return;
      }

      try {
        const isActive = ConditionalEval.eval(
          category.cookies,
          activeCookies,
          CookieConditionalType.AND
        );

        if (!isActive && category.cookieNames.length > 0) {
          this.cookieService.deleteCookies(category.cookieNames);
        }
      } catch (error) {
        console.error('[ConsentEvaluationService] Failed to evaluate category:', error);
      }
    });
  }

  /**
   * Checks if specific cookie types are active.
   */
  hasActiveConsent(
    requiredCookies: string[],
    activeCookies: ActiveCookies,
    condition: CookieConditionalType = CookieConditionalType.AND
  ): boolean {
    if (!requiredCookies || !Array.isArray(requiredCookies)) {
      console.warn('[ConsentEvaluationService] Invalid required cookies array');
      return false;
    }

    if (!activeCookies || !Array.isArray(activeCookies)) {
      console.warn('[ConsentEvaluationService] Invalid active cookies array');
      return false;
    }

    try {
      return ConditionalEval.eval(requiredCookies, activeCookies, condition);
    } catch (error) {
      console.error('[ConsentEvaluationService] Failed to check active consent:', error);
      return false;
    }
  }

}
