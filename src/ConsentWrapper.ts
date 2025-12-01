import { consentEngineConfig } from "./ConsentConfig.js";
import { ConsentEngine } from "./ConsentEngine.js";
import { ConsentProviderFactory } from "./providers/ConsentProviderFactory.js";
import { ProviderType } from "./providers/ProviderType.js";


const onConsentInit = () => {
    console.log('🚀 Consent system initialized - running first evaluation');
    engine.evaluateConsents();
};

const onConsentChanged = () => {
    console.log('🔄 User consent updated - re-evaluating');
    engine.evaluateConsents();
};

// Create provider with callbacks in config
const provider = ConsentProviderFactory.createProvider({
    type: ProviderType.ONETRUST,
    config: {
        scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
        domainScript: '01976a4b-0690-72c6-a7ee-3701352a5c93-test',
        documentLanguage: true,
        onConsentInit,
        onConsentChanged
    }
});

const engine = new ConsentEngine(consentEngineConfig, provider);
engine.start();

window.showProviderBanner = () => provider.showConsentBanner();

