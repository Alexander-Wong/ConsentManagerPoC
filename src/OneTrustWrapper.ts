import { engineConfig } from "./ConsentConfig.js";
import { ConsentEngine } from "./ConsentEngine.js";


const engine = new ConsentEngine(engineConfig);

engine.injectScripts();
let isFirstLoad = false;

/* OneTrust callback function executed after consent banner initialization */
function OptanonWrapper() {
    console.log("✅ OneTrust OptanonWrapper Loaded");
  
    const checkConsent = () => {
        engine.evaluateConsents();
     }

    if (!isFirstLoad) {
        isFirstLoad = true;
        checkConsent();
    }

    // @ts-ignore
    window.Optanon.OnConsentChanged(function () {
        checkConsent();
    });
}

/* Function to show OneTrust consent banner on demand */
function showOneTrustBanner() {
    // @ts-ignore
    if (typeof Onetrust !== 'undefined' && Onetrust.ShowAlertBox) {
         // @ts-ignore
        Onetrust.ShowAlertBox();
        // @ts-ignore
    } else if (typeof Optanon !== 'undefined' && Optanon.ToggleInfoDisplay) {
         // @ts-ignore
        Optanon.ToggleInfoDisplay();
    } else {
        console.error('OneTrust no está disponible.');
    }
}

(window as any).OptanonWrapper = OptanonWrapper;

(window as any).showOneTrustBanner = showOneTrustBanner;