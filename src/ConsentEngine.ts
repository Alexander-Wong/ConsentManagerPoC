import { ConsentEngineConfig } from "./ConsentEngineConfig.js";
import { IConsentProvider } from "./providers/IConsentProvider.js";
import { ScriptInjectionService } from "./services/ScriptInjectionService.js";
import { CookieManagementService } from "./services/CookieManagementService.js";
import { ResourceVisibilityService } from "./services/ResourceVisibilityService.js";
import { ConsentEvaluationService } from "./services/ConsentEvaluationService.js";

/**
 * Orchestrator for consent management.
 * Coordinates services but delegates specific responsibilities to specialized services.
 */
export class ConsentEngine {
  private scriptService: ScriptInjectionService;
  private cookieService: CookieManagementService;
  private resourceService: ResourceVisibilityService;
  private evaluationService: ConsentEvaluationService;

  constructor(
    public config: ConsentEngineConfig,
    private provider: IConsentProvider
  ) {
    if (!config) {
      throw new Error('[ConsentEngine] ConsentEngineConfig is required');
    }

    if (!provider) {
      throw new Error('[ConsentEngine] IConsentProvider is required');
    }

    this.scriptService = new ScriptInjectionService(provider);
    this.cookieService = new CookieManagementService();
    this.resourceService = new ResourceVisibilityService();
    this.evaluationService = new ConsentEvaluationService(this.cookieService);
  }

  /**
   * Gets current active consents from provider.
   */
  getActiveConsents(): ActiveCookies {
    try {
      return this.provider.getActiveConsents() || [];
    } catch (error) {
      console.error('[ConsentEngine] Failed to get active consents:', error);
      return [];
    }
  }

  /**
   * Main evaluation method - orchestrates cookie and resource evaluation.
   */
  evaluateConsents(): void {
    try {
      const activeCookies = this.getActiveConsents();

      if (!this.config.cookieCategories || !this.config.resources) {
        console.error('[ConsentEngine] Invalid configuration - missing cookieCategories or resources');
        return;
      }

      // Delegate to specialized services
      this.evaluationService.evaluateCookieConsents(
        this.config.cookieCategories,
        activeCookies
      );

      this.resourceService.evaluateAllResources(
        this.config.resources,
        activeCookies
      );
    } catch (error) {
      console.error('[ConsentEngine] Failed to evaluate consents:', error);
    }
  }

  /**
   * Injects all scripts (categories + provider SDK).
   */
  start(): void {
    if (!this.config.cookieCategories) {
      console.error('[ConsentEngine] Invalid configuration - missing cookieCategories');
      return;
    }

    try {
      this.scriptService.injectAllCategoryScripts(this.config.cookieCategories);
      this.scriptService.injectProviderScript();
    } catch (error) {
      console.error('[ConsentEngine] Failed to start:', error);
    }
  }
 
}