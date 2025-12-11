# ConsentManagerPoC

A sophisticated Cookie Consent Management System with a **provider-agnostic architecture** that supports multiple consent platforms (OneTrust, Cookiebot, custom implementations). This proof of concept dynamically controls script execution and UI resource visibility based on user consent preferences while maintaining GDPR/CCPA compliance.

## Current Version: 1.0.0

- **Bundle Size:** 21.31 KB (minified ESM)
- **Format:** ES Module (ESM)
- **Target:** ES2020
- **Runtime Exports:** 17 objects available for import
- **Test Coverage:** 252 passing tests

## Features

- ✅ **Provider-Agnostic Architecture** - Factory pattern supports OneTrust, Cookiebot, or custom providers
- ✅ **Multi-Provider Support** - Easily switch between consent management platforms
- ✅ **Flexible Configuration API** - Supports Plain JSON, Class-based, or URL-based configuration
- ✅ **ES Module Bundle** - Import directly in browser with 17 runtime exports
- ✅ **Dynamic Script Injection** - Load scripts only when user consents to their category
- ✅ **Sequential Script Loading** - Guarantee execution order for dependent scripts (e.g., Adobe Launch)
- ✅ **Cookie Lifecycle Management** - Automatically delete cookies when consent is withdrawn
- ✅ **UI Resource Control** - Show/hide content (videos, maps, embeds) based on consent
- ✅ **Real-time Consent Changes** - React immediately when users update their preferences
- ✅ **Type-Safe** - Written in TypeScript for robust development
- ✅ **Framework-Agnostic** - Pure TypeScript/JavaScript, works with any framework
- ✅ **Testable** - Dependency injection enables easy mocking and unit testing

## Architecture

### Four-Layer Provider-Agnostic Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Integration Layer                          │
│              (OneTrustWrapper.ts)                           │
│  • Application Entry Point                                  │
│  • Provider Initialization via Factory                      │
│  • Event Handling                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Provider Layer (NEW)                      │
│         (IConsentProvider + Implementations)                │
│  • Provider Abstraction (Interface)                         │
│  • OneTrustProvider - OneTrust implementation               │
│  • CookiebotProvider - Cookiebot implementation (optional)  │
│  • ConsentProviderFactory - Factory Pattern                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Engine Layer                            │
│               (ConsentEngine.ts)                            │
│  • Provider-Agnostic Business Logic                         │
│  • Script Injection Management                              │
│  • Cookie Deletion                                          │
│  • Resource Visibility Control                              │
│  • Dependency Injection (receives provider)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Configuration Layer                         │
│               (ConsentConfig.ts)                            │
│  • Cookie Category Definitions (C0001-C0004)                │
│  • Script Mappings                                          │
│  • UI Resource Mappings                                     │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
ConsentManagerPoC/
├── .github/                    # GitHub configuration
├── dist/                       # Compiled JavaScript output
├── node_modules/               # NPM dependencies
├── public/                     # Static web assets
│   ├── index.html             # Demo page
│   └── styles.css             # Styling
├── src/                        # TypeScript source code
│   ├── providers/             # ✨ NEW: Provider abstraction layer
│   │   ├── IConsentProvider.ts        # Provider interface
│   │   ├── OneTrustProvider.ts        # OneTrust implementation
│   │   └── ConsentProviderFactory.ts  # Factory pattern
│   ├── resources/
│   │   ├── BaseResource.ts    # Abstract base class for resources
│   │   └── Resource.ts        # Concrete resource implementation
│   ├── ConsentEngine.ts       # Core consent management engine (provider-agnostic)
│   ├── ConsentEngineConfig.ts # Configuration container class
│   ├── ConsentConfig.ts       # Concrete configuration instance
│   ├── OneTrustWrapper.ts     # Application entry point (uses factory)
│   ├── defer.ts               # Sequential script loading utility
│   ├── CookieCategory.ts      # Cookie category data model
│   ├── CookieType.ts          # Cookie type enums and conditions
│   ├── CookieEvaluator.ts     # Conditional logic evaluator
│   └── ResourceType.ts        # UI resource type enums
├── .gitignore                 # Git ignore rules
├── global.d.ts                # Global TypeScript declarations
├── package.json               # NPM configuration
├── package-lock.json          # Dependency lock file
├── server.js                  # Express development server
├── tsconfig.json              # TypeScript compiler configuration
├── README.md                  # This file
├── REFACTORING_PROPOSAL.md    # ✨ Detailed refactoring proposal
└── MIGRATION_SUMMARY.md       # ✨ Migration summary and changes
```

## Technology Stack

### Runtime Dependencies
- **OneTrust SDK** - Cookie consent platform (loaded via CDN)
- **TypeScript 5.9.x** - Type-safe development
- **Express.js 5.x** - Development server

### Build Tools
- **TypeScript Compiler** - Transpiles TS to ES2020 JavaScript
- **Nodemon** - Development auto-reload

### Module System
- **ES Modules (ESNext)** - Modern JavaScript module system
- **Target:** ES2020

## Quick Start

### Browser Integration (ES Module)

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import {
      initConsentManager,
      ProviderType,
      ProviderConfigs
    } from './bundles/latest/consent-manager.esm.min.js';

    // Plain JSON configuration
    await initConsentManager({
      provider: {
        type: ProviderType.ONETRUST,
        config: ProviderConfigs.oneTrust({
          scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
          domainScript: 'your-domain-script-id'
        })
      },
      config: {
        cookieCategories: [
          {
            cookies: ['C0001'],
            cookieNames: ['session_cookie'],
            code: 'document.cookie = "session_cookie=1; Path=/";'
          }
        ],
        resources: []
      }
    });
  </script>
</head>
<body>
  <h1>My Site</h1>
  <button onclick="showProviderBanner()">Manage Cookies</button>
</body>
</html>
```

### Installation & Development

```bash
# Clone the repository
git clone <repository-url>
cd ConsentManagerPoC

# Install dependencies
npm install

# Build ES Module bundle
npm run build:bundle

# Run development server
npm run dev
# Visit http://localhost:3000
```

### Available Commands

```bash
npm run build            # Compile TypeScript
npm run build:bundle     # Build ESM bundle (21.31 KB)
npm run dev              # Development server with auto-reload
npm run test             # Run all 252 tests
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
npm run release:patch    # Release patch version (1.0.0 → 1.0.1)
npm run release:minor    # Release minor version (1.0.0 → 1.1.0)
npm run release:major    # Release major version (1.0.0 → 2.0.0)
```

## Configuration Approaches

The Consent Manager supports three flexible configuration methods:

### 1. Plain JSON Configuration (Recommended for Simple Use Cases)

```javascript
import { initConsentManager, ProviderType, ProviderConfigs } from './bundles/latest/consent-manager.esm.min.js';

await initConsentManager({
  provider: {
    type: ProviderType.ONETRUST,
    config: ProviderConfigs.oneTrust({
      scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
      domainScript: 'your-domain-script-id'
    })
  },
  config: {
    cookieCategories: [
      {
        cookies: ['C0001'],
        cookieNames: ['session_cookie'],
        code: 'document.cookie = "session_cookie=1";'
      }
    ],
    resources: []
  }
});
```

### 2. Class-Based Configuration (Recommended for Advanced Use Cases)

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

const config = new ConsentEngineConfig({
  cookieCategories: [
    new CookieCategory({
      cookies: [CookieType.C0001],
      cookieNames: ['session_cookie'],
      code: 'document.cookie = "session_cookie=1";'
    })
  ],
  resources: [
    new BaseResource({
      resourceType: ResourceType.Video,
      cookies: [CookieType.C0004],
      condition: CookieConditionalType.AND
    })
  ]
});

await initConsentManager({
  provider: {
    type: ProviderType.ONETRUST,
    config: ProviderConfigs.oneTrust({ /* ... */ })
  },
  config: config
});
```

### 3. URL-Based Configuration (Recommended for Remote Configs)

```javascript
await initConsentManager({
  provider: {
    type: ProviderType.ONETRUST,
    config: ProviderConfigs.oneTrust({ /* ... */ })
  },
  configUrl: '/config/consent-config.json'
});
```

## Available Exports

The bundle exports 17 runtime objects:

| Export | Type | Description |
|--------|------|-------------|
| `initConsentManager` | Function | Main initialization function |
| `ProviderConfigs` | Object | Factory for provider configurations |
| `ProviderType` | Enum | Provider types (ONETRUST, MOCK) |
| `CookieType` | Enum | Cookie categories (C0001-C0004) |
| `ResourceType` | Enum | Resource types (Map, Video, Kaltura) |
| `CookieConditionalType` | Enum | Conditional logic (AND, OR) |
| `ConsentEngineConfig` | Class | Configuration container |
| `CookieCategory` | Class | Cookie category definition |
| `BaseResource` | Class | UI resource definition |
| `ConsentConfigJson` | Class | JSON configuration class |
| `CookieCategoryJson` | Class | JSON cookie category class |
| `ResourceJson` | Class | JSON resource class |
| **Service Classes** | | For advanced usage |
| `ConfigLoaderService` | Class | Load configs from JSON/URL |
| `CookieManagementService` | Class | Cookie deletion management |
| `ConsentEvaluationService` | Class | Consent evaluation logic |
| `ResourceVisibilityService` | Class | UI resource visibility |
| `ScriptInjectionService` | Class | Script injection management |

## Cookie Categories

The system manages four cookie categories aligned with OneTrust standards:

| Category | Code | Purpose | Example Use Cases |
|----------|------|---------|-------------------|
| **Functional** | C0001 | Essential cookies required for site operation | Session management, authentication |
| **Performance** | C0002 | Analytics and performance tracking | Google Analytics, performance monitoring |
| **Extra Functionality** | C0003 | Enhanced features and personalization | Maps, videos, enhanced UI features |
| **Advertising** | C0004 | Targeted advertising and marketing | Ad networks, remarketing, Adobe Launch |

## Key Components

### 1. ConsentEngine.ts

The core engine that orchestrates all consent management logic.

**Key Methods:**

```typescript
class ConsentEngine {
  // Read OneTrust's active consent groups
  getCookiesState(): ActiveCookies;

  // Delete cookies when consent is withdrawn
  evaluateCookiesConsent(): void;

  // Show/hide UI resources based on consent
  evaluateComponentConsent(): void;

  // Main orchestration method
  evaluateConsents(): void;

  // Inject OneTrust SDK
  injectOneTrustScript(): void;

  // Inject consent-controlled scripts
  createHeaderScript(category: CookieCategory): void;
}
```

### 2. defer.ts - Sequential Script Loader

**Purpose:** Ensures scripts execute in order, critical for dependencies.

**Problem It Solves:**

When loading Adobe Launch (DTM), subsequent scripts depend on `window._satellite` being available. Regular `async` scripts don't guarantee execution order.

**Solution:**

```typescript
class Defer {
  private scripts: CookieCategory[] = [];

  loadScripts() {
    // Loads scripts one at a time
    // Waits for each onload event before proceeding
    // Guarantees sequential execution
  }
}
```

**Usage Example:**

```typescript
{
  cookies: [CookieType.C0004],
  defer: [
    { src: "//assets.adobedtm.com/launch.min.js" },  // Loads first
    { code: "window._satellite.pageBottom();" }      // Runs after
  ]
}
```

### 3. OneTrustWrapper.ts

**Entry point** that sets up OneTrust integration.

```typescript
// Initialize consent engine
const engine = new ConsentEngine(ConsentConfig);

// OneTrust callback - fires on page load and consent changes
function OptanonWrapper() {
  engine.evaluateConsents();

  // Listen for consent changes
  Optanon.OnConsentChanged(() => {
    engine.evaluateConsents();
  });
}

// Expose globally for OneTrust
window.OptanonWrapper = OptanonWrapper;
```

### 4. CookieEvaluator.ts

Evaluates conditional logic for consent requirements.

**Supports two strategies:**

```typescript
enum CookieCondition {
  AND,  // All cookies must be active
  OR    // At least one cookie must be active
}

// Usage
ConditionalEval.eval(
  [CookieType.C0004],           // Required cookies
  activeCookies,                // User's active consents
  CookieCondition.AND           // Evaluation strategy
);
// Returns: true if all required cookies are active
```

### 5. Resource System

Manages UI resource visibility (videos, maps, embeds).

**HTML Integration:**

```html
<div videoTag class="overlay">
  Please accept functionality cookies to view this video.
</div>
```

**JavaScript Control:**

```typescript
class Resource extends BaseResource {
  checkConsent(activeCookies: ActiveCookies): void {
    if (consent granted) {
      element.classList.add('disable-overlay');  // Show content
    } else {
      element.classList.add('overlay');          // Show message
    }
  }
}
```

## Configuration

### Defining Cookie Categories

Edit `src/ConsentConfig.ts` to configure consent behavior:

```typescript
const ConsentConfig: ConsentEngineConfig = new ConsentEngineConfig();

// Example: Add advertising cookies with Adobe Launch
ConsentConfig.addCookieCategory({
  cookies: [CookieType.C0004],
  script: [
    {
      name: 'adv_cookie',
      attributes: {
        src: 'https://example.com/advertising.js',
        async: true
      }
    }
  ],
  defer: [
    {
      src: '//assets.adobedtm.com/launch.min.js'
    },
    {
      code: `
        window._satellite = window._satellite || {};
        _satellite.pageBottom();
      `
    }
  ],
  cookiesToDelete: ['_ga', '_gid', 'advertising_id']
});
```

### Defining UI Resources

```typescript
ConsentConfig.addResource(
  new Resource(
    [CookieType.C0003],        // Requires functionality cookies
    ResourceType.VIDEO,        // Resource type
    CookieCondition.AND        // All required cookies must be active
  )
);
```

## Consent Flow

```
1. Page Load
   ↓
2. OneTrustWrapper.injectScripts()
   → Injects OneTrust SDK
   → Creates placeholder scripts with consent classes
   ↓
3. User Makes Consent Choice (via OneTrust banner)
   ↓
4. OptanonWrapper() Callback Triggered
   ↓
5. ConsentEngine.evaluateConsents()
   ├──→ evaluateCookiesConsent()
   │    └── Deletes cookies if consent denied
   │
   └──→ evaluateComponentConsent()
        └── Shows/hides UI resources
   ↓
6. Scripts Load (if consent granted)
   ↓
7. User Updates Consent
   ↓
8. Optanon.OnConsentChanged() Event
   ↓
9. Back to Step 5 (Re-evaluate)
```

## Bundle Versioning

The project uses semantic versioning with a dual-path bundle strategy:

```
bundles/
├── latest/                           # Always points to current version
│   └── consent-manager.esm.min.js   # Unversioned filename
└── 1.0.0/                            # Version 1.0.0
    └── consent-manager-1.0.0.esm.min.js
```

**Usage Options:**

```javascript
// Latest version (auto-updating)
import { initConsentManager } from './bundles/latest/consent-manager.esm.min.js';

// Locked version (stable, recommended for production)
import { initConsentManager } from './bundles/1.0.0/consent-manager-1.0.0.esm.min.js';
```

**Release Commands:**

```bash
npm run release:patch    # 1.0.0 → 1.0.1 (bug fixes)
npm run release:minor    # 1.0.0 → 1.1.0 (new features)
npm run release:major    # 1.0.0 → 2.0.0 (breaking changes)
```

See [RELEASE.md](RELEASE.md) for complete versioning documentation.

## Usage Examples

### Complete HTML Integration

See [public/index.html](public/index.html) for a working example with OneTrust integration.

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import {
      initConsentManager,
      ProviderType,
      ProviderConfigs,
      CookieType,
      ResourceType,
      CookieConditionalType,
      ConsentEngineConfig,
      CookieCategory,
      BaseResource
    } from './bundles/latest/consent-manager.esm.min.js';

    const config = new ConsentEngineConfig({
      cookieCategories: [
        new CookieCategory({
          cookies: [CookieType.C0004],
          cookieNames: ['adv_cookie'],
          code: 'document.cookie = "adv_cookie=1; Path=/; Secure;";'
        })
      ],
      resources: [
        new BaseResource({
          resourceType: ResourceType.Video,
          cookies: [CookieType.C0004],
          condition: CookieConditionalType.AND
        })
      ]
    });

    await initConsentManager({
      provider: {
        type: ProviderType.ONETRUST,
        config: ProviderConfigs.oneTrust({
          scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
          domainScript: 'your-domain-script-id',
          documentLanguage: true
        })
      },
      config: config
    });
  </script>
</head>
<body>
  <h1>Welcome</h1>

  <!-- Video that requires advertising consent -->
  <div class="iframe-wrapper">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
    <div videoTag class="overlay">Accept advertising cookies to view this video.</div>
  </div>

  <button onclick="showProviderBanner()">Manage Cookies</button>
</body>
</html>
```

### Sequential Script Loading (Adobe Launch)

```javascript
new CookieCategory({
  cookies: [CookieType.C0004],
  cookieNames: [],
  defer: [
    new CookieCategory({
      cookies: [],
      cookieNames: [],
      src: "//assets.adobedtm.com/launch.min.js"  // Loads first
    }),
    new CookieCategory({
      cookies: [],
      cookieNames: [],
      code: "window._satellite.pageBottom();"  // Runs after
    })
  ]
})
```

## API Reference

### ConsentEngine

#### `getCookiesState(): ActiveCookies`
Returns an array of currently active cookie categories.

```typescript
const active = engine.getCookiesState();
// Returns: ['C0001', 'C0002', ...]
```

#### `evaluateConsents(): void`
Main method that evaluates all consents and updates page state.

```typescript
engine.evaluateConsents();
```

#### `injectScripts(): void`
Injects all configured scripts (OneTrust + consent-controlled scripts).

```typescript
engine.injectScripts();
```

### ConsentEngineConfig

#### `addCookieCategory(category: CookieCategory): void`
Adds a new cookie category configuration.

```typescript
config.addCookieCategory({
  cookies: [CookieType.C0003],
  script: [...],
  defer: [...],
  cookiesToDelete: [...]
});
```

#### `addResource(resource: BaseResource): void`
Adds a UI resource to be controlled by consent.

```typescript
config.addResource(
  new Resource([CookieType.C0002], ResourceType.MAP, CookieCondition.AND)
);
```

### Global Functions

#### `OptanonWrapper()`
OneTrust callback function (called automatically).

#### `showOneTrustBanner()`
Programmatically shows the OneTrust consent banner.

```typescript
window.showOneTrustBanner();
```

## Browser Support

- **Modern Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **ES2020 Support Required**
- **ES Modules Support Required**

## Development Guidelines

### Adding a New Cookie Category

1. Define the category in `CookieType.ts` if needed
2. Configure in `ConsentConfig.ts`
3. Add scripts and/or UI resources
4. Specify cookies to delete when consent withdrawn
5. Test with OneTrust sandbox

### Adding a New Resource Type

1. Add enum to `ResourceType.ts`
2. Create HTML elements with the resource attribute
3. Add resource to `ConsentConfig.ts`
4. Test consent behavior

### Debugging

The system includes console logging. Check browser console for:
- `[ConsentEngine]` - Engine operations
- `[Defer]` - Sequential script loading
- `[Resource]` - UI resource state changes

## OneTrust Configuration

This system expects OneTrust to be configured with the following groups:

- **C0001** - Strictly Necessary Cookies
- **C0002** - Performance Cookies
- **C0003** - Functional Cookies
- **C0004** - Targeting Cookies

Ensure your OneTrust account uses these group IDs or update `CookieType.ts` to match your configuration.

## Security Considerations

1. **Script Injection** - All scripts are validated before injection
2. **Cookie Deletion** - Only configured cookies are deleted
3. **XSS Prevention** - User input is not directly injected into scripts
4. **HTTPS Only** - Ensure all external scripts use HTTPS

## Performance Considerations

1. **Sequential Loading** - `defer.ts` loads scripts one at a time (intentional for dependencies)
2. **DOM Queries** - Resources are queried once per consent change
3. **Event Listeners** - Single listener for OneTrust consent changes
4. **Caching** - Browser caches external scripts

## Troubleshooting

### Scripts Not Loading

1. Check browser console for errors
2. Verify OneTrust integration is working
3. Check that cookie categories match OneTrust configuration
4. Ensure scripts have correct `optanon-category` class

### UI Resources Not Showing

1. Verify HTML elements have correct resource attribute (e.g., `videoTag`)
2. Check consent requirements in `ConsentConfig.ts`
3. Verify consent is granted in OneTrust
4. Check browser console for resource evaluation logs

### Sequential Scripts Not Working

1. Verify `defer.ts` is loaded
2. Check that `data-scripts` attribute contains valid JSON
3. Ensure scripts are accessible (check network tab)
4. Verify execution order in browser console

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Specify your license here]

## Support

For questions or issues, please open an issue on GitHub.

---

**Built with TypeScript and OneTrust** | **GDPR/CCPA Compliant** | **Framework Agnostic**