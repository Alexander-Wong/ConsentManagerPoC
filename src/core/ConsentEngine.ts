import { ConsentEngineConfig } from "../config/ConsentEngineConfig.js";
import { IConsentProvider } from "../providers/IConsentProvider.js";
import { CookieManagementService } from "../services/cookies/CookieManagementService.js";
import { ConsentEvaluationService } from "../services/evaluation/ConsentEvaluationService.js";
import { ResourceVisibilityService } from "../services/resources/ResourceVisibilityService.js";
import { ScriptInjectionService } from "../services/script/ScriptInjectionService.js";
import { ActiveCookies } from "../types/ActiveCookies.js";


/**
 * Orchestrator for consent management.
 * Coordinates services but delegates specific responsibilities to specialized services.
 */
export class ConsentEngine {
  private scriptService: ScriptInjectionService;
  private cookieService: CookieManagementService;
  private resourceService: ResourceVisibilityService;
  private evaluationService: ConsentEvaluationService;

  /**
   * Creates a new ConsentEngine instance.
   * 
   * @param config - Engine configuration (categories and resources)
   * @param provider - Consent provider implementation (OneTrust, CookieBot, etc.)
   * @param scriptService - Optional script injection service (defaults to new instance)
   * @param cookieService - Optional cookie management service (defaults to new instance)
   * @param resourceService - Optional resource visibility service (defaults to new instance)
   * @param evaluationService - Optional evaluation service (defaults to new instance with cookieService)
   */
  constructor(
    public config: ConsentEngineConfig,
    private provider: IConsentProvider,
    scriptService?: ScriptInjectionService,
    cookieService?: CookieManagementService,
    resourceService?: ResourceVisibilityService,
    evaluationService?: ConsentEvaluationService
  ) {
    if (!config) {
      throw new Error('[ConsentEngine] ConsentEngineConfig is required');
    }

    if (!provider) {
      throw new Error('[ConsentEngine] IConsentProvider is required');
    }

    // Initialize services with dependency injection or defaults
    this.cookieService = cookieService || new CookieManagementService();
    this.scriptService = scriptService || new ScriptInjectionService(provider);
    this.resourceService = resourceService || new ResourceVisibilityService();
    this.evaluationService = evaluationService || new ConsentEvaluationService(this.cookieService);
  }

  /**
   * Gets current active consents from provider.
   */
  getActiveConsents(): ActiveCookies {
    try {
      return this.provider.getActiveConsents() || [];
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[ConsentEngine] Failed to get active consents:', message);
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
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[ConsentEngine] Failed to evaluate consents:', message);
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
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[ConsentEngine] Failed to start:', message);
    }
  }

  /**
   * Gets the script injection service.
   * Useful for testing and advanced customization.
   */
  getScriptService(): ScriptInjectionService {
    return this.scriptService;
  }

  /**
   * Gets the cookie management service.
   * Useful for testing and advanced customization.
   */
  getCookieService(): CookieManagementService {
    return this.cookieService;
  }

  /**
   * Gets the resource visibility service.
   * Useful for testing and advanced customization.
   */
  getResourceService(): ResourceVisibilityService {
    return this.resourceService;
  }

  /**
   * Gets the evaluation service.
   * Useful for testing and advanced customization.
   */
  getEvaluationService(): ConsentEvaluationService {
    return this.evaluationService;
  }
  
}