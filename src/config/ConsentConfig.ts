import { ConsentEngineConfig } from "./ConsentEngineConfig.js";
import { CookieConditionalType } from "../types/CookieConditionalType.js";
import { CookieType } from "../types/CookieType.js";
import { BaseResource } from "../resources/BaseResource.js";
import { ResourceType } from "../types/ResourceType.js";


export const consentEngineConfig = new ConsentEngineConfig(
    [
        {
            cookies: [CookieType.C0002],
            cookieNames: ['func_site_cookie'],
            code: `
                 document.cookie = "func_site_cookie=1; Path=/; Secure; SameSite=None;";
                 console.log("🟢 C0001 script ran — basic_func_cookie set");
            `
        },
        {
            cookies: [CookieType.C0002],
            cookieNames: ['perf_cookie'],
            code: `
                document.cookie = "perf_cookie=1; Path=/; Secure; SameSite=None;";
               console.log("🟢 C0002 script ran — perf_cookie set");
            `
        },
        {
            cookies: [CookieType.C0003],
            cookieNames: ['extra_func_cookie'],
            code: `
                document.cookie = "extra_func_cookie=1; Path=/; Secure; SameSite=None;";
                console.log("🔵 C0003 script ran — extra_func_cookie set");
            `
        },
        {
            cookies: [CookieType.C0004],
            cookieNames: ['adv_cookie'],
            code: `
                document.cookie = "adv_cookie=1; Path=/; Secure; SameSite=None;";
                console.log("🟠 C0004 script ran — adv_cookie set");
            `
        },
        {
            cookies: [CookieType.C0004],
            cookieNames: [],
            defer: [
                {
                    cookies: [],
                    cookieNames: [],
                    src: "//assets.adobedtm.com/4d2629481466/1cd67c709daf/launch-2e0718bc6ca3.min.js",
                },
                {
                    cookies: [],
                    cookieNames: [],
                    code: `
                        if (window._satellite) {
                            console.log('scriptB: encontró window._satellite ->', window._satellite);
                        } else {
                            console.log('scriptB: NO encontró window._satellite (fallo de orden)');
                        }
                    `
                    }
            ]
   
        }

    ], [
        new BaseResource(ResourceType.Map,
                    [CookieType.C0002],
                     CookieConditionalType.AND),
        new BaseResource(ResourceType.Video,
                    [CookieType.C0003],
                    CookieConditionalType.AND),
        new BaseResource(ResourceType.Kaltura,
                    [CookieType.C0004,],
                    CookieConditionalType.AND)
    ]
);