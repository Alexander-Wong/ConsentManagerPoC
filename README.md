# ConsentManagerPoC

A sophisticated Cookie Consent Management System with a **provider-agnostic architecture** that supports multiple consent platforms (OneTrust, Cookiebot, custom implementations). This proof of concept dynamically controls script execution and UI resource visibility based on user consent preferences while maintaining GDPR/CCPA compliance.

## Current Version: 1.0.0

- **Bundle Size:** 21.31 KB (minified ESM)
- **Format:** ES Module (ESM)
- **Target:** ES2020
- **Runtime Exports:** 17 objects available for import
- **Test Coverage:** 252 passing tests (80%+ coverage)
- **Code Quality:** ESLint with TypeScript-specific rules

## Features

- ✅ **Provider-Agnostic Architecture** - Factory pattern supports OneTrust, Mock, or custom providers
- ✅ **Multi-Provider Support** - Easily switch between consent management platforms
- ✅ **Flexible Configuration API** - Supports Class-based or URL-based configuration
- ✅ **ES Module Bundle** - Import directly in browser with 17 runtime exports
- ✅ **Service-Oriented Architecture** - Specialized services for scripts, cookies, evaluation, and resources
- ✅ **Dynamic Script Injection** - Load scripts only when user consents to their category
- ✅ **Sequential Script Loading** - Guarantee execution order for dependent scripts (e.g., Adobe Launch)
- ✅ **Cookie Lifecycle Management** - Automatically delete cookies when consent is withdrawn
- ✅ **UI Resource Control** - Show/hide content (videos, maps, embeds) based on consent
- ✅ **Real-time Consent Changes** - React immediately when users update their preferences
- ✅ **Type-Safe** - Written in TypeScript 5.9+ with strict mode for robust development
- ✅ **Framework-Agnostic** - Pure TypeScript/JavaScript, works with any framework
- ✅ **Testable** - Dependency injection enables easy mocking and unit testing
- ✅ **Mock Provider** - Built-in mock provider for testing and development

## Architecture

### Four-Layer Provider-Agnostic Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Integration Layer                          │
│              (ConsentWrapper.ts)                            │
│  • Main Entry Point (initConsentManager function)          │
│  • Provider Initialization via Factory                      │
│  • Configuration Loading (URL/Object)                       │
│  • Event Handling & Callbacks                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Provider Layer                            │
│         (IConsentProvider + Implementations)                │
│  • Provider Abstraction (Interface)                         │
│  • OneTrustProvider - OneTrust implementation               │
│  • MockProvider - Test/development implementation           │
│  • ConsentProviderFactory - Factory Pattern                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Engine Layer                            │
│               (ConsentEngine.ts)                            │
│  • Provider-Agnostic Orchestration Logic                    │
│  • Delegates to Specialized Services                        │
│  • Coordinates Consent Evaluation                           │
│  • Dependency Injection (receives provider & services)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Service & Configuration Layer                  │
│  • ScriptInjectionService - Script management               │
│  • CookieManagementService - Cookie lifecycle               │
│  • ConsentEvaluationService - Consent logic                 │
│  • ResourceVisibilityService - UI resource control          │
│  • ConfigLoaderService - Configuration loading              │
│  • ConsentEngineConfig - Cookie & resource definitions      │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
ConsentManagerPoC/
├── .github/                    # GitHub configuration
├── bundles/                    # ES Module bundles
│   ├── latest/                # Current version bundle
│   └── 1.0.0/                 # Version-locked bundle
├── coverage/                   # Test coverage reports
├── dist/                       # Compiled JavaScript output
├── packager/                   # Build and bundling scripts
│   ├── bundle.js              # ESM bundler script
│   └── esbuild.config.js      # ESBuild configuration
├── public/                     # Static web assets
│   ├── index.html             # Demo page
│   └── styles.css             # Styling
├── src/                        # TypeScript source code (45 files)
│   ├── index.ts               # Main export file
│   ├── ConsentWrapper.ts      # Main entry point (initConsentManager)
│   │
│   ├── core/                  # Core engine logic
│   │   └── ConsentEngine.ts   # Orchestrator
│   │
│   ├── providers/             # Provider abstraction layer
│   │   ├── IConsentProvider.ts           # Provider interface
│   │   ├── IProviderConfig.ts            # Config interfaces
│   │   ├── ConsentProviderFactory.ts     # Factory pattern
│   │   ├── onetrust/
│   │   │   └── OneTrustProvider.ts       # OneTrust implementation
│   │   └── mock/
│   │       └── MockProvider.ts           # Mock implementation
│   │
│   ├── config/                # Configuration layer
│   │   ├── ConsentEngineConfig.ts        # Config container
│   │   └── ConsentConfig.ts              # Default config instance
│   │
│   ├── services/              # Specialized services
│   │   ├── config/
│   │   │   └── ConfigLoaderService.ts    # Config loading (URL)
│   │   ├── cookies/
│   │   │   └── CookieManagementService.ts # Cookie lifecycle
│   │   ├── evaluation/
│   │   │   └── ConsentEvaluationService.ts # Consent evaluation
│   │   ├── resources/
│   │   │   └── ResourceVisibilityService.ts # UI resource control
│   │   └── script/
│   │       └── ScriptInjectionService.ts  # Script injection
│   │
│   ├── resources/
│   │   └── BaseResource.ts    # Abstract resource base class
│   │
│   ├── types/                 # Type definitions
│   │   ├── CookieType.ts      # Cookie category enums (C0001-C0004)
│   │   ├── CookieCategory.ts  # Cookie category model
│   │   ├── ResourceType.ts    # Resource type enums
│   │   ├── ProviderType.ts    # Provider type enums
│   │   └── ConsentManagerOptions.ts # Main options interface
│   │
│   └── utils/                 # Utility functions
│       ├── evaluation/
│       │   └── CookieEvaluator.ts # Conditional logic evaluator
│       ├── logging/
│       │   ├── ConsoleLogger.ts
│       │   └── NoOpLogger.ts
│       └── script/
│           └── defer.ts       # Sequential script loader
│
├── tests/                      # Test suite (14 test files, 252 tests)
│   ├── setup.ts               # Test configuration
│   ├── ConsentWrapper.test.ts # E2E integration tests
│   ├── core/                  # Core engine tests
│   ├── providers/             # Provider tests
│   ├── services/              # Service tests
│   └── utils/                 # Utility tests
│
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── global.d.ts                # Global TypeScript declarations
├── package.json               # NPM configuration
├── release.sh                 # Release automation script
├── server.js                  # Express development server
├── tsconfig.json              # TypeScript compiler configuration
├── vitest.config.ts           # Vitest test configuration
├── CHANGELOG.md               # Version history
├── HOW-TO-USE.md              # Detailed usage guide
├── README.md                  # This file
└── RELEASE.md                 # Release process documentation
```

## Technology Stack

### Runtime Dependencies
- **TypeScript 5.9.3** - Type-safe development language
- **Express.js 5.1.0** - Development server framework
- **Nodemon 3.1.10** - Auto-reload during development
- **OneTrust SDK** - Consent platform (loaded via CDN)

### Build Tools
- **TypeScript Compiler** - Transpiles TS to ES2020 JavaScript
- **ESBuild 0.27.0** - Fast bundling for ESM output
- **Node.js** - Runtime environment

### Testing & QA
- **Vitest 4.0.14** - Test runner (Vite-native)
- **Happy-DOM 20.0.11** - DOM implementation for tests
- **@vitest/coverage-v8** - Code coverage reporting
- **@vitest/ui** - Visual test UI

### Code Quality
- **ESLint 9.39.1** - Code linting
- **TypeScript-ESLint 8.48.1** - TS-specific linting rules
- **eslint-plugin-import** - Import order enforcement

### Module System
- **ES Modules (ESNext)** - Modern JavaScript module system
- **Target:** ES2020
- **Strict Mode:** Full TypeScript type checking

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
      ProviderConfigs,
      ConsentEngineConfig,
      CookieCategory,
      CookieType
    } from './bundles/latest/consent-manager.esm.min.js';

    // Class-based configuration
    const config = new ConsentEngineConfig({
      cookieCategories: [
        new CookieCategory({
          cookies: [CookieType.C0001],
          cookieNames: ['session_cookie'],
          code: 'document.cookie = "session_cookie=1; Path=/";'
        })
      ],
      resources: []
    });

    await initConsentManager({
      provider: {
        type: ProviderType.ONETRUST,
        config: ProviderConfigs.oneTrust({
          scriptUrl: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
          domainScript: 'your-domain-script-id'
        })
      },
      config: config
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
npm run build            # Compile TypeScript to dist/
npm run build:bundle     # Build ESM bundle (21.31 KB)
npm run dev              # Development server with auto-reload
npm run test             # Run all 252 tests
npm run test:ui          # Visual test interface
npm run test:coverage    # Generate coverage report
npm run test:watch       # Watch mode for development
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
npm run release:patch    # Release patch version (1.0.0 → 1.0.1)
npm run release:minor    # Release minor version (1.0.0 → 1.1.0)
npm run release:major    # Release major version (1.0.0 → 2.0.0)
npm run changelog:update # Update CHANGELOG.md
```

## Configuration Approaches

The Consent Manager supports two flexible configuration methods:

### 1. Class-Based Configuration (Recommended)

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

### 2. URL-Based Configuration (For Remote Configs)

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
| **Main Function** | | |
| `initConsentManager` | Function | Main initialization function |
| **Configuration Factories** | | |
| `ProviderConfigs.oneTrust()` | Factory | OneTrust provider config factory |
| `ProviderConfigs.mock()` | Factory | Mock provider config factory |
| **Enumerations** | | |
| `ProviderType` | Enum | Provider types (ONETRUST, MOCK) |
| `CookieType` | Enum | Cookie categories (C0001-C0004) |
| `ResourceType` | Enum | Resource types (Map, Video, Kaltura) |
| `CookieConditionalType` | Enum | Conditional logic (AND, OR) |
| **Configuration Classes** | | |
| `ConsentEngineConfig` | Class | Configuration container |
| `CookieCategory` | Class | Cookie category definition |
| `BaseResource` | Class | UI resource definition |
| **Service Classes** | | For advanced usage |
| `ConfigLoaderService` | Class | Load configs from URL |
| `CookieManagementService` | Class | Cookie lifecycle management |
| `ConsentEvaluationService` | Class | Consent evaluation logic |
| `ResourceVisibilityService` | Class | UI resource visibility control |
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

The core orchestrator that coordinates all consent management logic using specialized services.

**Key Methods:**

```typescript
class ConsentEngine {
  // Get active consents from provider
  getActiveConsents(): ActiveCookies;

  // Main orchestration method
  evaluateConsents(): void;

  // Initialize scripts and provider SDK
  start(): void;

  // Service getters (for testing/advanced usage)
  get scriptInjectionService(): ScriptInjectionService;
  get cookieManagementService(): CookieManagementService;
  get consentEvaluationService(): ConsentEvaluationService;
  get resourceVisibilityService(): ResourceVisibilityService;
}
```

### 2. Specialized Services

**ScriptInjectionService** - Manages script injection
```typescript
// Injects all category scripts
injectAllCategoryScripts(config: ConsentEngineConfig): void;

// Injects provider SDK
injectProviderScript(provider: IConsentProvider): void;
```

**CookieManagementService** - Cookie lifecycle management
```typescript
deleteCookie(name: string): void;
deleteCookies(names: string[]): void;
getCookie(name: string): string | null;
getAllCookies(): Record<string, string>;
```

**ConsentEvaluationService** - Consent evaluation logic
```typescript
evaluateCookieConsents(config: ConsentEngineConfig, activeCookies: ActiveCookies): void;
hasActiveConsent(requiredCookies: CookieType[], activeCookies: ActiveCookies): boolean;
```

**ResourceVisibilityService** - UI resource visibility
```typescript
evaluateAllResources(config: ConsentEngineConfig, activeCookies: ActiveCookies): void;
evaluateResource(resource: BaseResource, activeCookies: ActiveCookies): void;
```

**ConfigLoaderService** - Configuration loading
```typescript
static loadFromObj(config: ConsentEngineConfig | object): ConsentEngineConfig;
static loadFromUrl(url: string): Promise<ConsentEngineConfig>;
```

### 3. defer.ts - Sequential Script Loader

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

### 4. ConsentWrapper.ts

**Main entry point** with `initConsentManager` function.

```typescript
// Initializes the consent manager
async function initConsentManager(options: ConsentManagerOptions): Promise<void> {
  // 1. Load configuration (from URL or object)
  const config = options.configUrl
    ? await ConfigLoaderService.loadFromUrl(options.configUrl)
    : ConfigLoaderService.loadFromObj(options.config);

  // 2. Create provider via factory
  const provider = ConsentProviderFactory.createProvider({
    type: options.provider.type,
    config: options.provider.config
  });

  // 3. Create engine with services
  const engine = new ConsentEngine(config, provider);

  // 4. Start engine (inject scripts & SDK)
  engine.start();

  // 5. Register callbacks
  provider.callback({
    onConsentInit: () => engine.evaluateConsents(),
    onConsentChanged: () => engine.evaluateConsents()
  });

  // 6. Expose banner function
  window.showProviderBanner = () => provider.showConsentBanner();
}
```

### 5. CookieEvaluator.ts

Evaluates conditional logic for consent requirements using strategy pattern.

**Supports two strategies:**

```typescript
enum CookieConditionalType {
  AND,  // All cookies must be active
  OR    // At least one cookie must be active
}

// Generic evaluation utility
ConditionalEval.eval<T>(
  required: T[],                      // Required items
  active: T[],                        // Active items
  condition: CookieConditionalType,   // Evaluation strategy
  compareFn: (a: T, b: T) => boolean  // Comparison function
): boolean;

// Usage with cookie types
ConditionalEval.eval(
  [CookieType.C0004],           // Required cookies
  activeCookies,                // User's active consents
  CookieConditionalType.AND,    // All must be active
  (a, b) => a === b
);
// Returns: true if all required cookies are active
```

### 6. Resource System

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
2. initConsentManager() called
   ├──→ Load configuration (from URL or object)
   ├──→ Create provider via factory
   ├──→ Create ConsentEngine with services
   └──→ engine.start()
        ├──→ ScriptInjectionService.injectAllCategoryScripts()
        └──→ ScriptInjectionService.injectProviderScript()
   ↓
3. Provider SDK Loads
   ↓
4. onConsentInit Callback Triggered
   ↓
5. ConsentEngine.evaluateConsents()
   ├──→ provider.getActiveConsents()
   ├──→ ConsentEvaluationService.evaluateCookieConsents()
   │    ├── Check each cookie category
   │    ├── Delete cookies if consent withdrawn
   │    └── Use CookieEvaluator for AND/OR logic
   │
   └──→ ResourceVisibilityService.evaluateAllResources()
        ├── Check each BaseResource
        └── Add/remove overlay classes
   ↓
6. Scripts Load (if consent granted by provider SDK)
   ↓
7. User Updates Consent (via provider banner)
   ↓
8. onConsentChanged Callback Triggered
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

### initConsentManager(options)

Main initialization function.

```typescript
interface ConsentManagerOptions {
  provider: {
    type: ProviderType;
    config: IProviderConfig;
  };
  config?: ConsentEngineConfig | object;
  configUrl?: string;
}

await initConsentManager({
  provider: {
    type: ProviderType.ONETRUST,
    config: ProviderConfigs.oneTrust({ /* ... */ })
  },
  config: new ConsentEngineConfig({ /* ... */ })
});
```

### ConsentEngine

#### `getActiveConsents(): ActiveCookies`
Returns an array of currently active cookie categories from the provider.

```typescript
const active = engine.getActiveConsents();
// Returns: ['C0001', 'C0002', ...]
```

#### `evaluateConsents(): void`
Main orchestration method that evaluates all consents and updates page state.

```typescript
engine.evaluateConsents();
```

#### `start(): void`
Initializes scripts and provider SDK.

```typescript
engine.start();
```

### ConsentEngineConfig

#### `constructor(options)`
Creates a new configuration with cookie categories and resources.

```typescript
const config = new ConsentEngineConfig({
  cookieCategories: [
    new CookieCategory({ /* ... */ })
  ],
  resources: [
    new BaseResource({ /* ... */ })
  ]
});
```

### Global Functions

#### `showProviderBanner()`
Programmatically shows the consent provider's banner.

```typescript
window.showProviderBanner();
```

## Recent Improvements

### Version 1.0.0 Highlights

- **Service-Oriented Architecture**: Refactored into specialized services for better separation of concerns
- **Enhanced Testing**: 252 comprehensive tests with 80%+ coverage using Vitest
- **ESLint Integration**: Code quality enforcement with TypeScript-specific rules
- **Mock Provider**: Built-in mock provider for testing and development
- **Flexible Configuration Loading**: Support for class-based configs and remote URLs via ConfigLoaderService
- **Improved Type Safety**: Comprehensive TypeScript interfaces and strict mode
- **Better Bundling**: Moved to packager/ directory with improved ESBuild configuration
- **Provider Factory Pattern**: Cleaner provider instantiation with validation
- **Dependency Injection**: Services injected into ConsentEngine for better testability
- **Enhanced Documentation**: Added HOW-TO-USE.md and updated RELEASE.md

### Architecture Improvements

1. **Separation of Concerns**: Each service handles a specific responsibility
   - ScriptInjectionService: Script management
   - CookieManagementService: Cookie operations
   - ConsentEvaluationService: Consent logic
   - ResourceVisibilityService: UI control
   - ConfigLoaderService: Configuration loading

2. **Provider Abstraction**: Clean interface for multiple consent providers
   - IConsentProvider interface
   - Factory pattern for provider creation
   - OneTrust and Mock implementations included
   - Easy to add new providers

3. **Testability**: Comprehensive test coverage
   - Unit tests for all services
   - Integration tests for ConsentEngine
   - E2E tests for ConsentWrapper
   - Mock provider for isolated testing

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

### Testing

The project includes comprehensive test coverage:

```bash
npm run test              # Run all 252 tests
npm run test:ui          # Visual test interface
npm run test:coverage    # Generate coverage report
npm run test:watch       # Watch mode for development
```

**Test Structure:**
- Unit tests for all services
- Integration tests for ConsentEngine
- E2E tests for ConsentWrapper
- Provider tests (OneTrust and Mock)
- 80%+ code coverage

### Debugging

The system includes optional console logging. Check browser console for:
- `[ConsentEngine]` - Engine operations
- `[ScriptInjectionService]` - Script injection events
- `[CookieManagementService]` - Cookie operations
- `[ConsentEvaluationService]` - Consent evaluation
- `[ResourceVisibilityService]` - UI resource state changes
- `[Defer]` - Sequential script loading

Enable logging by passing a logger to services or using ConsoleLogger.

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

## Additional Documentation

- **[RELEASE.md](RELEASE.md)** - Release process and versioning documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes

## Support

For questions or issues, please open an issue on GitHub.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Run linter (`npm run lint:fix`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

ISC License - P&E VML Team

---

**Built with TypeScript and Provider-Agnostic Architecture** | **GDPR/CCPA Compliant** | **Framework Agnostic** | **80%+ Test Coverage**