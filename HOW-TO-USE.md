# Consent Manager - How to Use Guide

A provider-agnostic consent management system for GDPR/CCPA cookie compliance. This guide covers integration, configuration, and usage examples for HTML/JavaScript consumers.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Integration Methods](#integration-methods)
3. [Configuration Approaches](#configuration-approaches)
4. [Available Exports](#available-exports)
5. [HTML Integration Examples](#html-integration-examples)
6. [TypeScript Support](#typescript-support)
7. [Advanced Usage](#advanced-usage)

---

## Quick Start

### Installation

```bash
npm install @vml/consent-manager
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import { initConsentManager, ProviderType, ProviderConfigs } from './bundles/latest/consent-manager.esm.min.js';

        await initConsentManager({
            provider: {
                type: ProviderType.ONETRUST,
                config: ProviderConfigs.oneTrust({
                    scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
                    domainScript: 'your-domain-id',
                    documentLanguage: true
                })
            },
            config: {
                cookieCategories: [
                    {
                        cookies: ["C0001"],
                        cookieNames: ['my_cookie'],
                        code: "console.log('Cookie accepted!');"
                    }
                ],
                resources: []
            }
        });
    </script>
</head>
<body>
    <button onclick="showProviderBanner()">Manage Consent</button>
</body>
</html>
```

---

## Integration Methods

### Method 1: ES Module Bundle (Recommended for HTML)

Load the pre-built ESM bundle directly in your HTML:

```html
<script type="module">
    import { initConsentManager, ProviderType } from './bundles/latest/consent-manager.esm.min.js';

    // Your code here
</script>
```

**Pros:**
- No build step required
- Works directly in browsers
- Small bundle size (21 KB minified)
- Modern ES6+ syntax

### Method 2: NPM Package (For Build Tools)

Install via npm and use with bundlers (Webpack, Vite, etc.):

```bash
npm install @vml/consent-manager
```

```javascript
import { initConsentManager, ProviderType } from '@vml/consent-manager';
```

**Pros:**
- Full TypeScript support
- Tree-shaking optimization
- Version management via package.json

---

## Configuration Approaches

The Consent Manager supports **three flexible approaches** for configuration:

### Approach 1: Plain JSON Objects (Simple - Recommended)

Use plain JavaScript objects with string values:

```javascript
await initConsentManager({
    provider: {
        type: ProviderType.ONETRUST,
        config: ProviderConfigs.oneTrust({
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'your-domain-id'
        })
    },
    config: {
        cookieCategories: [
            {
                cookies: ["C0001", "C0002"],  // String values
                cookieNames: ['func_cookie'],
                code: "console.log('Functional cookie accepted');"
            }
        ],
        resources: [
            {
                resourceType: "Map",           // String value
                cookies: ["C0002"],            // String array
                condition: "AND"               // String value
            }
        ]
    }
});
```

**Best for:** Most users, simple integration, minimal imports

---

### Approach 2: Using Classes (Advanced)

Use TypeScript classes and enums for type safety:

```javascript
import {
    initConsentManager,
    ProviderType,
    ProviderConfigs,
    ConsentEngineConfig,
    CookieCategory,
    BaseResource,
    CookieType,
    ResourceType,
    CookieConditionalType
} from './bundles/latest/consent-manager.esm.min.js';

await initConsentManager({
    provider: {
        type: ProviderType.ONETRUST,
        config: ProviderConfigs.oneTrust({
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'your-domain-id'
        })
    },
    config: new ConsentEngineConfig({
        cookieCategories: [
            new CookieCategory({
                cookies: [CookieType.C0001],  // Enum values
                cookieNames: ['func_cookie'],
                code: "console.log('Functional cookie accepted');"
            })
        ],
        resources: [
            new BaseResource({
                resourceType: ResourceType.Map,
                cookies: [CookieType.C0002],
                condition: CookieConditionalType.AND
            })
        ]
    })
});
```

**Best for:** TypeScript projects, advanced type checking, IDE autocomplete

---

### Approach 3: Load from URL

Fetch configuration from an external JSON file:

```javascript
await initConsentManager({
    configUrl: '/config/consent-config.json',  // Load from URL
    provider: {
        type: ProviderType.ONETRUST,
        config: ProviderConfigs.oneTrust({
            scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
            domainScript: 'your-domain-id'
        })
    }
});
```

**Best for:** Production deployments, CDN-hosted configs, multi-environment setups

---

## Available Exports

The consent manager exports **17 runtime objects** available in JavaScript bundles:

### Core API (Essential)

| Export | Type | Description |
|--------|------|-------------|
| `initConsentManager` | Function | Main initialization function - **required** |
| `ProviderConfigs` | Object | Factory for creating provider configs - **recommended** |

### Enums (String-based values)

| Export | Type | Values |
|--------|------|--------|
| `ProviderType` | Enum | `ONETRUST`, `MOCK` |
| `CookieType` | Enum | `C0001`, `C0002`, `C0003`, `C0004`, `C0005` |
| `ResourceType` | Enum | `Map`, `Video`, `Kaltura` |
| `CookieConditionalType` | Enum | `AND`, `OR` |

### Advanced Classes (Optional)

| Export | Type | Purpose |
|--------|------|---------|
| `ConsentEngineConfig` | Class | Configuration container (for class-based approach) |
| `CookieCategory` | Class | Cookie category definition |
| `BaseResource` | Class | Resource visibility control |
| `ConsentConfigJson` | Class | JSON configuration wrapper |
| `CookieCategoryJson` | Class | JSON cookie category |
| `ResourceJson` | Class | JSON resource definition |

### Service Classes (Advanced Usage)

| Export | Type | Purpose |
|--------|------|---------|
| `ConfigLoaderService` | Class | Load and parse configurations |
| `ConsentEngine` | Class | Core consent management engine |
| `OneTrustProvider` | Class | OneTrust integration |
| `MockProvider` | Class | Testing/development provider |
| `ConsentProviderFactory` | Class | Provider instantiation |

---

## HTML Integration Examples

### Example 1: Basic Integration with OneTrust

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Consent Manager Demo</title>

    <script type="module">
        import {
            initConsentManager,
            ProviderType,
            ProviderConfigs
        } from './bundles/latest/consent-manager.esm.min.js';

        // Define configuration
        const config = {
            cookieCategories: [
                {
                    cookies: ["C0001"],
                    cookieNames: ['functional_cookie'],
                    code: `
                        document.cookie = "functional_cookie=1; Path=/; Secure; SameSite=None;";
                        console.log('✅ Functional cookie set');
                    `
                },
                {
                    cookies: ["C0004"],
                    cookieNames: ['advertising_cookie'],
                    code: `
                        document.cookie = "advertising_cookie=1; Path=/; Secure; SameSite=None;";
                        console.log('🎯 Advertising cookie set');
                    `
                }
            ],
            resources: [
                {
                    resourceType: "Map",
                    cookies: ["C0002"],
                    condition: "AND"
                },
                {
                    resourceType: "Video",
                    cookies: ["C0004"],
                    condition: "AND"
                }
            ]
        };

        // Initialize consent manager
        await initConsentManager({
            provider: {
                type: ProviderType.ONETRUST,
                config: ProviderConfigs.oneTrust({
                    scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
                    domainScript: '01976a4b-0690-72c6-a7ee-3701352a5c93-test',
                    documentLanguage: true
                })
            },
            config: config
        });

        console.log('🎉 Consent Manager initialized successfully!');
    </script>
</head>
<body>
    <h1>Consent Manager Demo</h1>

    <!-- Videos with consent overlay -->
    <div class="iframe-wrapper">
        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                width="560" height="315"></iframe>
        <div videoTag class="overlay">Accept advertising cookies to view this video</div>
    </div>

    <!-- Maps with consent overlay -->
    <div class="iframe-wrapper">
        <iframe src="https://www.bing.com/maps/embed?h=400&w=500&cp=37.7749~-122.4194"
                width="500" height="400"></iframe>
        <div mapTag class="overlay">Accept performance cookies to view this map</div>
    </div>

    <!-- Consent settings button -->
    <button onclick="showProviderBanner()">Cookie Settings</button>
</body>
</html>
```

---

### Example 2: Using Class-Based Configuration

```html
<script type="module">
    import {
        initConsentManager,
        ProviderType,
        ProviderConfigs,
        ConsentEngineConfig,
        CookieCategory,
        BaseResource,
        CookieType,
        ResourceType,
        CookieConditionalType
    } from './bundles/latest/consent-manager.esm.min.js';

    // Create configuration using classes
    const config = new ConsentEngineConfig({
        cookieCategories: [
            new CookieCategory({
                cookies: [CookieType.C0001],
                cookieNames: ['essential_cookie'],
                code: "console.log('Essential cookies loaded');"
            }),
            new CookieCategory({
                cookies: [CookieType.C0004],
                cookieNames: [],
                defer: [
                    new CookieCategory({
                        cookies: [],
                        cookieNames: [],
                        src: "//assets.adobedtm.com/launch.min.js"
                    })
                ]
            })
        ],
        resources: [
            new BaseResource({
                resourceType: ResourceType.Map,
                cookies: [CookieType.C0002],
                condition: CookieConditionalType.AND
            })
        ]
    });

    await initConsentManager({
        provider: {
            type: ProviderType.ONETRUST,
            config: ProviderConfigs.oneTrust({
                scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
                domainScript: 'your-domain-id'
            })
        },
        config: config
    });
</script>
```

---

### Example 3: Loading Configuration from URL

**config/consent-config.json:**
```json
{
    "cookieCategories": [
        {
            "cookies": ["C0001"],
            "cookieNames": ["functional_cookie"],
            "code": "console.log('Functional cookie loaded');"
        }
    ],
    "resources": [
        {
            "resourceType": "Map",
            "cookies": ["C0002"],
            "condition": "AND"
        }
    ]
}
```

**index.html:**
```html
<script type="module">
    import { initConsentManager, ProviderType, ProviderConfigs }
        from './bundles/latest/consent-manager.esm.min.js';

    await initConsentManager({
        configUrl: '/config/consent-config.json',  // Load from file
        provider: {
            type: ProviderType.ONETRUST,
            config: ProviderConfigs.oneTrust({
                scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
                domainScript: 'your-domain-id'
            })
        }
    });
</script>
```

---

### Example 4: Using Mock Provider (Testing)

```html
<script type="module">
    import { initConsentManager, ProviderType, ProviderConfigs }
        from './bundles/latest/consent-manager.esm.min.js';

    await initConsentManager({
        provider: {
            type: ProviderType.MOCK,
            config: ProviderConfigs.mock({
                scriptUrl: 'https://mock-cdn.example.com/mock-sdk.js',
                initialConsents: ['C0001', 'C0002', 'C0004']  // Pre-accepted cookies
            })
        },
        config: {
            cookieCategories: [
                {
                    cookies: ["C0001"],
                    cookieNames: ['test_cookie'],
                    code: "console.log('Test cookie loaded');"
                }
            ],
            resources: []
        }
    });

    // Simulate consent changes
    window.MockConsentManager.setConsents(['C0001', 'C0003']);
</script>
```

---

## TypeScript Support

Full TypeScript definitions are included. Here's how to use them:

### With NPM Package

```typescript
import {
    initConsentManager,
    ProviderType,
    ProviderConfigs,
    ConsentManagerOptions,
    IOneTrustProviderConfig,
    ConsentConfigJson
} from '@vml/consent-manager';

// Type-safe configuration
const oneTrustConfig: IOneTrustProviderConfig = {
    scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
    domainScript: 'your-domain-id',
    documentLanguage: true
};

const config: ConsentConfigJson = {
    cookieCategories: [
        {
            cookies: ["C0001"],
            cookieNames: ['my_cookie'],
            code: "console.log('Cookie accepted');"
        }
    ],
    resources: []
};

const options: ConsentManagerOptions = {
    config: config,
    provider: {
        type: ProviderType.ONETRUST,
        config: oneTrustConfig
    }
};

await initConsentManager(options);
```

---

## Advanced Usage

### Programmatically Show Consent Banner

```javascript
// The consent manager automatically exposes this function globally
window.showProviderBanner();

// Or call it from a button
document.getElementById('cookieSettings').addEventListener('click', () => {
    window.showProviderBanner();
});
```

### Deferred Script Loading

Load scripts only after consent is given:

```javascript
{
    cookies: ["C0004"],
    cookieNames: [],
    defer: [
        {
            cookies: [],
            cookieNames: [],
            src: "//assets.adobedtm.com/launch.min.js"  // Adobe Launch
        },
        {
            cookies: [],
            cookieNames: [],
            code: `
                if (window._satellite) {
                    console.log('Adobe Launch loaded:', window._satellite);
                }
            `
        }
    ]
}
```

### Resource Visibility Control

Control iframe visibility based on consent:

```html
<!-- Video - requires C0004 (advertising) -->
<div class="iframe-wrapper">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
    <div videoTag class="overlay">Accept advertising cookies</div>
</div>

<!-- Map - requires C0002 (performance) -->
<div class="iframe-wrapper">
    <iframe src="https://www.bing.com/maps/embed"></iframe>
    <div mapTag class="overlay">Accept performance cookies</div>
</div>

<!-- Kaltura - requires C0004 (advertising) -->
<div class="iframe-wrapper">
    <iframe src="https://cdnapisec.kaltura.com/p/..."></iframe>
    <div kalturaVideo class="overlay">Accept advertising cookies</div>
</div>
```

---

## Configuration Reference

### Cookie Types

| Type | Category | Description |
|------|----------|-------------|
| `C0001` | Strictly Necessary | Essential site functionality |
| `C0002` | Performance | Analytics and performance monitoring |
| `C0003` | Functional | Enhanced functionality and personalization |
| `C0004` | Targeting | Advertising and marketing |
| `C0005` | Social Media | Social media features |

### Resource Types

| Type | Use Case | Attribute |
|------|----------|-----------|
| `Map` | Map embeds (Google Maps, Bing Maps) | `mapTag` |
| `Video` | Video embeds (YouTube, Vimeo) | `videoTag` |
| `Kaltura` | Kaltura video player | `kalturaVideo` |

### Condition Types

| Type | Logic |
|------|-------|
| `AND` | **All** specified cookies must be accepted |
| `OR` | **At least one** specified cookie must be accepted |

---

## Testing Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Check console:**
   - Look for initialization logs
   - Monitor consent changes
   - Debug script execution

4. **Test consent banner:**
   - Click "Cookie Settings" button
   - Change consent preferences
   - Observe script execution and resource visibility

---

## Troubleshooting

### Import Errors

**Problem:** `The requested module does not provide an export named 'X'`

**Solution:** Check that you're importing runtime values, not TypeScript types:
```javascript
// ✅ CORRECT
import { initConsentManager, ProviderType } from './consent-manager.esm.min.js';

// ❌ WRONG - Types don't exist in JavaScript bundles
import { IOneTrustProviderConfig } from './consent-manager.esm.min.js';
```

### Configuration Not Working

**Problem:** Configuration seems ignored or throws errors

**Solution:** Use string values in JSON configs:
```javascript
// ✅ CORRECT
config: {
    cookieCategories: [{ cookies: ["C0001"], ... }]  // Strings
}

// ❌ WRONG
config: {
    cookieCategories: [{ cookies: [CookieType.C0001], ... }]  // Requires enum import
}
```

### Bundle Not Loading

**Problem:** `Failed to load module script`

**Solution:**
1. Check the bundle path is correct
2. Ensure server is serving static files from `/bundles` directory
3. Use `type="module"` in script tag

---

## Need Help?

- **Documentation:** [README.md](README.md)
- **GitHub Issues:** [Report a bug](https://github.com/Alexander-Wong/ConsentManagerPoC/issues)
- **Examples:** See `public/index.html` for complete working example
- **Bundle Info:** [BUNDLE_CONFIGURATION.md](BUNDLE_CONFIGURATION.md)

---

## License

ISC © VML Team
