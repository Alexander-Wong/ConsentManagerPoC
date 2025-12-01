import { CookieCategory } from "../types/CookieCategory.js";
import { BaseResource } from "../resources/BaseResource.js";

export class ConsentEngineConfig {
    cookieCategories: CookieCategory[];
    resources: BaseResource[];
     constructor(cookieCategory: CookieCategory[], resources: BaseResource[]) {
        this.cookieCategories = cookieCategory;
        this.resources = resources;
    }
}