import { ConsentEngineConfig } from "./ConsentEngineConfig.js";
import { CookieCategory } from "./CookieCategory.js";
import { ConditionalEval } from "./CookieEvaluator.js";
import { CookieCondition } from "./CookieType.js";
import { IConsentProvider } from "./providers/IConsentProvider.js";

export class ConsentEngine {
  config :  ConsentEngineConfig;
  private provider: IConsentProvider;

  constructor(config : ConsentEngineConfig, provider: IConsentProvider) {
    this.config = config;
    this.provider = provider;
  } 
  
  /* Deletes a cookie by name */
  deleteCookie = (name: string): void => {
    document.cookie = `${name}=; Path=/; Max-Age=0; Secure; SameSite=None`;
    console.log(`🧹 Cookie eliminada: ${name}`);
  }

  /* Returns an array of active cookie category IDs - provider-agnostic */
  getCookiesState = (): ActiveCookies => {
     return this.provider.getActiveConsents();
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
      const providerClasses = item.cookies
        .map(cookie => this.provider.getConsentCategoryClass(cookie))
        .join(" ");
      script.className = providerClasses;
    }
    
    document.head.appendChild(script);
  } 
  /* Injects provider script - provider-agnostic */
  injectProviderScript = (): void =>  {
     this.provider.injectProviderScript();

     // Call initialization hook if available
     if (this.provider.initialize) {
       this.provider.initialize();
     }
  }

  /* Injects all scripts into the document header */
  injectScripts = (): void => {

    this.config.cookieCategories.forEach(category => {
        this.createHeaderScript(category);
    })
    this.injectProviderScript();
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

  /* Returns the provider instance for advanced use cases */
  getProvider(): IConsentProvider {
    return this.provider;
  }

}