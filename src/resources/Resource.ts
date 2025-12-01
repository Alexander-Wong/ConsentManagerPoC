import { CookieConditionalType } from "../CookieConditionalType.js";
import { CookieType } from "../CookieType.js";
import { ResourceType } from "../ResourceType.js";
import { BaseResource } from "./BaseResource.js";


export class Resource extends BaseResource  {
    
    constructor(resourceType : ResourceType, cookies: CookieType[], condition: CookieConditionalType) {
        super(resourceType, cookies, condition) ;
    } 
}