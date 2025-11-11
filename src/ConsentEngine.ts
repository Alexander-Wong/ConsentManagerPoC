import { ConsentEngineConfig } from "./ConsentEngineConfig.js";
import { CookieCategory } from "./CookieCategory.js";
import { ConditionalEval } from "./CookieEvaluator.js";
import { CookieCondition } from "./CookieType.js";

export class ConsentEngine {
  config :  ConsentEngineConfig;

  constructor(config : ConsentEngineConfig) {
    this.config = config;
  } 
  
  /* Deletes a cookie by name */
  deleteCookie = (name: string): void => {
    document.cookie = `${name}=; Path=/; Max-Age=0; Secure; SameSite=None`;
    console.log(`🧹 Cookie eliminada: ${name}`);
  }

  /* Returns an array of active cookie category IDs from OneTrust */ 
  getCookiesState = (): ActiveCookies => {
     return OptanonActiveGroups ? OptanonActiveGroups.split(',') : [];
  }

  /* Evaluates cookie consents and deletes cookies if consent is not given */
  evaluateCookiesConsent = (activeCookies: ActiveCookies): void => {
    
    this.config.cookieCategories.forEach(cfg => {
        const isActive = ConditionalEval.eval(cfg.cookies, activeCookies, CookieCondition.AND);
        if (!isActive) {
            cfg.cookieNames.forEach(this.deleteCookie);
        }
    });
  }
  

  /* Creates a script element for a given cookie category item */
  public createHeaderScript = (item: CookieCategory): void =>  {

    if (!item || (!item.code && !item.src && !item.defer)) {
      return;
    };
    
    const script = document.createElement("script");
    script.type = "text/plain";

    if (item.defer){
      script.src = "./defer.js";
      script.setAttribute("data-scripts", JSON.stringify(item.defer));
    }
    
    if (item.code) {
        script.textContent = item.code;
    }
    if (item.src) {
        script.src = item.src;
    }
   
    if (item.cookies && item.cookies.length > 0) {
      const toOptanonClasses = item.cookies.map(cookie => `optanon-category-${cookie}`).join(" ");
      script.classList.add(toOptanonClasses);
    }
    
    document.head.appendChild(script);
  } 
  /* Injects OneTrust script */
  injectOneTrustScript = (): void =>  {
     const script = document.createElement("script");
     script.src = "https://cdn.cookielaw.org/scripttemplates/otSDKStub.js";
     script.type = "text/javascript";
     script.charset = "UTF-8";

      // Important OneTrust attributes:
     script.setAttribute("data-document-language", "true");
     script.setAttribute("data-domain-script", "01976a4b-0690-72c6-a7ee-3701352a5c93-test");

      // Append it to HEAD (recommended)
     document.head.appendChild(script);
  }

  /* Injects a script into the document header */
  injectScripts = (): void => {
    
    this.config.cookieCategories.forEach(category => {
        this.createHeaderScript(category);
    })
    this.injectOneTrustScript(); 
  }
  

  /* Evaluates component consents and injects scripts if consent is given */
  evaluateComponentConsent = (activeCookies: ActiveCookies): void => {
    this.config.resources.forEach(resource => {
        resource.checkConsent(activeCookies);
    })
  }

  /* Main method to evaluate all consents */
  evaluateConsents = (): void => {
      const activeCookies = this.getCookiesState();
      this.evaluateCookiesConsent(activeCookies);
      this.evaluateComponentConsent(activeCookies);
  }

}