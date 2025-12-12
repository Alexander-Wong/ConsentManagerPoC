import { ActiveCookies } from "../types/ActiveCookies.js";
import { CookieConditionalType } from "../types/CookieConditionalType.js";
import { CookieType } from "../types/CookieType.js";
import { ResourceType } from "../types/ResourceType.js";
import { ConditionalEval } from "../utils/evaluation/CookieEvaluator.js";

export class Resource {
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