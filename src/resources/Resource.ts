import { CookieCondition, CookieType } from "../CookieType.js";
import { ResourceType } from "../ResourceType.js";
import { BaseResource } from "./BaseResource.js";


export class Resource extends BaseResource  {
    
    constructor(resourceType : ResourceType, cookies: CookieType[], condition: CookieCondition) {
        super(resourceType, cookies, condition) ;
    } 
}