import { CookieConditionalType } from "../types/CookieConditionalType.js";
import { ConditionalEval } from "../utils/evaluation/CookieEvaluator.js";
import { CookieType } from "../types/CookieType.js";
import { ResourceType } from "../types/ResourceType.js";
import { ActiveCookies } from "../types/ActiveCookies.js";

export class BaseResource {
  resourceType: ResourceType;
  cookies: CookieType[];
  condition: CookieConditionalType;

  constructor(resourceType : ResourceType, cookies: CookieType[],  condition: CookieConditionalType) {
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