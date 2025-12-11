import { ConsentEngineConfig } from "../../config/ConsentEngineConfig.js";
import { BaseResource } from "../../resources/BaseResource.js";
import { ConsentConfigJson, CookieCategoryJson, ResourceJson } from "../../types/ConsentManagerOptions.js";
import { CookieCategory } from "../../types/CookieCategory.js";
import { CookieConditionalType } from "../../types/CookieConditionalType.js";
import { CookieType } from "../../types/CookieType.js";
import { ResourceType } from "../../types/ResourceType.js";

/**
 * Service responsible for loading consent configuration from JSON
 * and converting it to strongly-typed ConsentEngineConfig objects
 */
export class ConfigLoaderService {

  /**
   * Loads configuration from object and returns ConsentEngineConfig
   * Supports both plain JSON objects and ConsentEngineConfig instances
   * @param config - Configuration object (JSON or ConsentEngineConfig instance)
   * @returns ConsentEngineConfig instance
   */
  static loadFromObj(config: ConsentConfigJson | ConsentEngineConfig): ConsentEngineConfig {
    try {
      // If already a ConsentEngineConfig instance, return it directly
      if (config instanceof ConsentEngineConfig) {
        console.log('[ConfigLoaderService] Configuration is already ConsentEngineConfig instance');
        return config;
      }

      // Otherwise, treat as JSON and parse it
      this.validateJson(config);

      const cookieCategories = this.parseCookieCategories(config.cookieCategories);
      const resources = this.parseResources(config.resources);

      return new ConsentEngineConfig(cookieCategories, resources);
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[ConfigLoaderService] Failed to load configuration: ${message}`);
    }
  }

  /**
   * Fetches configuration from a URL and returns ConsentEngineConfig
   * @param url - URL to fetch configuration from
   * @returns Promise<ConsentEngineConfig>
   */
  static async loadFromUrl(url: string): Promise<ConsentEngineConfig> {
    try {
      console.log(`[ConfigLoaderService] Fetching configuration from ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json: ConsentConfigJson = await response.json() as ConsentConfigJson;
      return this.loadFromObj(json);
    } catch (error : unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[ConfigLoaderService] Failed to fetch configuration from ${url}: ${message}`);
    }
  }

  /**
   * Validates the basic structure of the JSON configuration
   */
  private static validateJson(json: ConsentConfigJson): void {
    if (!json || typeof json !== 'object') {
      throw new Error('Configuration must be a valid object');
    }

    if (!json.cookieCategories || !Array.isArray(json.cookieCategories)) {
      throw new Error('Configuration must contain a "cookieCategories" array');
    }

    if (!json.resources || !Array.isArray(json.resources)) {
      throw new Error('Configuration must contain a "resources" array');
    }
  }

  /**
   * Parses cookie categories from JSON and converts to CookieCategory objects
   * Supports both plain JSON objects and CookieCategory instances
   */
  private static parseCookieCategories(categoriesJson: (CookieCategoryJson | CookieCategory)[]): CookieCategory[] {
    return categoriesJson.map((cat, index) => {
      try {
        // If already a CookieCategory instance, return it directly
        if (cat instanceof CookieCategory) {
          return cat;
        }

        this.validateCookieCategory(cat, index);

        // Convert string cookie types to CookieType enum
        const cookies = cat.cookies.map(c => this.parseCookieType(c));

        // Recursively parse deferred categories
        const defer = cat.defer
          ? this.parseCookieCategories(cat.defer)
          : undefined;

        // Return plain object (not instantiated class) to match existing structure
        return {
          cookies,
          cookieNames: cat.cookieNames,
          code: cat.code,
          src: cat.src,
          defer
        } as CookieCategory;

      }  catch (error : unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid cookie category at index ${index}: ${message}`);
      }
    });
  }

  /**
   * Parses resources from JSON and converts to BaseResource instances
   * Supports both plain JSON objects and BaseResource instances
   */
  private static parseResources(resourcesJson: (ResourceJson | BaseResource)[]): BaseResource[] {
    return resourcesJson.map((res, index) => {
      try {
        // If already a BaseResource instance, return it directly
        if (res instanceof BaseResource) {
          return res;
        }

        this.validateResource(res, index);

        const resourceType = this.parseResourceType(res.resourceType);
        const cookies = res.cookies.map(c => this.parseCookieType(c));
        const condition = this.parseConditionalType(res.condition);

        return new BaseResource(resourceType, cookies, condition);

      } catch (error : unknown) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid resource at index ${index}: ${message}`);
      }
    });
  }

  /**
   * Validates cookie category structure
   */
  private static validateCookieCategory(cat: CookieCategoryJson, index: number): void {
    if (!cat || typeof cat !== 'object') {
      throw new Error(`Category at index ${index} is not a valid object`);
    }

    if (!Array.isArray(cat.cookies)) {
      throw new Error(`Category at index ${index} must have a "cookies" array`);
    }

    if (!Array.isArray(cat.cookieNames)) {
      throw new Error(`Category at index ${index} must have a "cookieNames" array`);
    }

    if (cat.code !== undefined && typeof cat.code !== 'string') {
      throw new Error(`Category at index ${index} has invalid "code" property`);
    }

    if (cat.src !== undefined && typeof cat.src !== 'string') {
      throw new Error(`Category at index ${index} has invalid "src" property`);
    }

    if (cat.defer !== undefined && !Array.isArray(cat.defer)) {
      throw new Error(`Category at index ${index} has invalid "defer" property`);
    }
  }

  /**
   * Validates resource structure
   */
  private static validateResource(res: ResourceJson, index: number): void {
    if (!res || typeof res !== 'object') {
      throw new Error(`Resource at index ${index} is not a valid object`);
    }

    if (!res.resourceType || typeof res.resourceType !== 'string') {
      throw new Error(`Resource at index ${index} must have a valid "resourceType" string`);
    }

    if (!Array.isArray(res.cookies)) {
      throw new Error(`Resource at index ${index} must have a "cookies" array`);
    }

    if (!res.condition || typeof res.condition !== 'string') {
      throw new Error(`Resource at index ${index} must have a valid "condition" string`);
    }
  }

  /**
   * Converts string to CookieType enum
   */
  private static parseCookieType(cookieStr: string): CookieType {
    const cookieType = CookieType[cookieStr as keyof typeof CookieType];

    if (!cookieType) {
      throw new Error(`Invalid cookie type: "${cookieStr}". Valid types: ${Object.keys(CookieType).join(', ')}`);
    }

    return cookieType;
  }

  /**
   * Converts string to ResourceType enum
   */
  private static parseResourceType(resourceStr: string): ResourceType {
    const resourceType = ResourceType[resourceStr as keyof typeof ResourceType];

    if (!resourceType) {
      throw new Error(`Invalid resource type: "${resourceStr}". Valid types: ${Object.keys(ResourceType).join(', ')}`);
    }

    return resourceType;
  }

  /**
   * Converts string to CookieConditionalType enum
   */
  private static parseConditionalType(conditionStr: string): CookieConditionalType {
    const upperCondition = conditionStr.toUpperCase();

    if (upperCondition === 'AND') {
      return CookieConditionalType.AND;
    } else if (upperCondition === 'OR') {
      return CookieConditionalType.OR;
    } else {
      throw new Error(`Invalid condition type: "${conditionStr}". Valid types: AND, OR`);
    }
  }
}
