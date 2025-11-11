import { ConditionalEval } from "../CookieEvaluator.js";
import { CookieCondition, CookieType } from "../CookieType.js";
import { ResourceType } from "../ResourceType.js";

export abstract class BaseResource {
  resourceType: ResourceType;
  cookies: CookieType[];
  condition: CookieCondition;
  
  constructor(resourceType : ResourceType, cookies: CookieType[],  condition: CookieCondition) {
    this.resourceType = resourceType;
    this.cookies = cookies;
    this.condition = condition;
  } 

 checkConsent(activeCookies: ActiveCookies): void {
        document.querySelectorAll(`div[${this.resourceType}]`).forEach(el => {
            const isConsent = ConditionalEval.eval(this.cookies, activeCookies, this.condition)
            if (!isConsent) {
                el.classList.add('overlay');
                el.classList.remove('disable-overlay');

            } else {
                el.classList.add('disable-overlay');
                el.classList.remove('overlay');
            }
        });
    }
}