import { CookieCategory } from "./CookieCategory.js";
import { Resource } from "./resources/Resource.js";

export class ConsentEngineConfig {
    cookieCategories: CookieCategory[];
    resources: Resource[];
     constructor(cookieCategory: CookieCategory[], resources: Resource[]) {
        this.cookieCategories = cookieCategory;
        this.resources = resources;
    }
}