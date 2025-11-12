import { engineConfig } from "./ConsentConfig.js";
import { ConsentEngine } from "./ConsentEngine.js";
import { ConsentProviderFactory, ProviderType } from "./providers/ConsentProviderFactory.js";

// Create provider using factory - explicitly specifying OneTrust
const provider = ConsentProviderFactory.createProvider({
    type: ProviderType.ONETRUST,
    config: {
        scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
        domainScript: '01976a4b-0690-72c6-a7ee-3701352a5c93-test',
        documentLanguage: true
    }
});

// Inject provider into consent engine
const engine = new ConsentEngine(engineConfig, provider);

engine.injectScripts();
let isFirstLoad = false;

/* Provider callback function executed after consent banner initialization */
function OptanonWrapper() {
    console.log(`✅ ${provider.getProviderName()} OptanonWrapper Loaded`);

    const checkConsent = () => {
        engine.evaluateConsents();
     }

    if (!isFirstLoad) {
        isFirstLoad = true;
        checkConsent();
    }

    // Register consent change listener using provider interface
    provider.onConsentChanged(() => {
        console.log('🔄 Consent changed - re-evaluating');
        checkConsent();
    });
}

/* Function to show consent banner - provider-agnostic */
function showConsentBanner() {
    provider.showBanner();
}

(window as any).OptanonWrapper = OptanonWrapper;

// Expose banner function (renamed to be provider-agnostic)
(window as any).showConsentBanner = showConsentBanner;
// Keep backward compatibility
(window as any).showOneTrustBanner = showConsentBanner;