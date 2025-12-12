import { Resource } from "../resources/Base.js";
import { CookieCategory } from "../types/CookieCategory.js";

export class ConsentEngineConfig {
    cookieCategories: CookieCategory[];
    resources: Resource[];
     constructor(cookieCategory: CookieCategory[], resources: Resource[]) {
        this.cookieCategories = cookieCategory;
        this.resources = resources;
    }
}