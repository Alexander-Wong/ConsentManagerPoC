# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Compile TypeScript to JavaScript
npm run build

# Start development server with auto-reload (runs on http://localhost:3000)
npm run dev

# Start production server (must compile first)
npm start

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with interactive UI
npm run test:ui
```

**Important**: This project uses ES Modules (`"type": "module"` in package.json). All imports must use `.js` extensions even when importing from `.ts` files (e.g., `import { ConsentEngine } from "./ConsentEngine.js"`).

## Architecture Overview

This is a **provider-agnostic consent management system** that controls script injection and UI resource visibility based on user cookie consent preferences.

### Four-Layer Architecture

```
ConsentWrapper (Entry Point)
    ↓
ConsentEngine (Orchestrator - Provider-Agnostic)
    ↓ uses
IConsentProvider Interface ← Implemented by OneTrustProvider, Future: CookiebotProvider
    ↓
ConsentEngineConfig (Configuration)
```

### Key Architectural Principles

1. **Provider Abstraction**: `IConsentProvider` interface decouples the consent engine from specific platforms (OneTrust, Cookiebot, etc.). The engine never directly accesses provider-specific globals.

2. **Factory Pattern**: `ConsentProviderFactory` creates provider instances based on configuration, enabling easy switching between platforms.

3. **Strategy Pattern**: `ConditionalEval` uses strategy pattern for cookie consent evaluation (`AND` vs `OR` conditions).

4. **Dependency Injection**: `ConsentEngine` receives its provider through constructor injection, making it fully testable and provider-agnostic.

### Critical Architecture Constraints

**DOM Coupling Issue**: The current implementation has tight coupling to browser DOM APIs:
- `ConsentEngine` directly calls `document.createElement()`, `document.head.appendChild()`, `document.cookie`
- `BaseResource` directly calls `document.querySelectorAll()`
- `OneTrustProvider` directly manipulates DOM

This prevents:
- Unit testing without browser environment
- Server-side rendering (SSR) compatibility
- Easy mocking in tests

**Known Issue**: This violates testability principles. Future refactoring should introduce a DOM adapter layer (see architectural review for details).

## Core Components

### ConsentEngine.ts - Main Orchestrator

The brain of the system. Responsibilities:
- Script injection management
- Cookie lifecycle management (deletion when consent withdrawn)
- Resource visibility control (show/hide maps, videos, embeds)
- Provider coordination

**Key Flow**:
1. `injectScripts()` - Creates placeholder scripts with consent classes
2. `evaluateConsents()` - Main evaluation loop:
   - `evaluateCookiesConsent()` - Deletes cookies if consent withdrawn
   - `evaluateComponentConsent()` - Shows/hides UI resources

**Important**: Currently violates Single Responsibility Principle (does script injection, cookie deletion, and evaluation). Future refactoring should split into `ScriptInjector`, `CookieManager`, and `ConsentEvaluator` services.

### IConsentProvider.ts - Provider Abstraction

The interface that all consent platforms must implement:
- `getActiveConsents()` - Returns array of active consent category IDs
- `onConsentChanged(callback)` - Registers callback for consent changes
- `showBanner()` - Displays consent banner
- `injectProviderScript()` - Loads provider SDK
- `getConsentCategoryClass(categoryId)` - Returns CSS class for script tagging
- `initialize()?` - Optional post-injection setup

**Implementation Note**: OneTrust uses `window.OptanonActiveGroups` and `window.Optanon` APIs. Future providers (Cookiebot, Usercentrics) will map their APIs to this interface.

### ConsentProviderFactory.ts - Factory Pattern

Creates provider instances based on configuration:

```typescript
const provider = ConsentProviderFactory.createProvider({
    type: ProviderType.ONETRUST,
    config: {
        scriptUrl: 'https://cdn.cookielaw.org/...',
        domainScript: 'your-domain-id',
        documentLanguage: true
    }
});
```

**Adding New Providers**:
1. Create new provider class implementing `IConsentProvider`
2. Add enum value to `ProviderType`
3. Add case to factory switch statement

### defer.ts - Sequential Script Loader

**Critical Component**: Ensures scripts load in order (important for dependencies like Adobe Launch).

**Problem Solved**: Adobe Launch sets `window._satellite` that subsequent scripts depend on. Async scripts don't guarantee order.

**Solution**: Loads scripts one-at-a-time, waiting for `onload` event before proceeding.

**Usage in Config**:
```typescript
{
    cookies: [CookieType.C0004],
    defer: [
        { src: "//assets.adobedtm.com/launch.min.js" },  // Loads first
        { code: "window._satellite.pageBottom();" }      // Runs after
    ]
}
```

### CookieEvaluator.ts - Strategy Pattern

Evaluates consent conditions using strategy pattern:
- `CookieCondition.AND` - All required cookies must be active
- `CookieCondition.OR` - At least one required cookie must be active

**Implementation**: Uses `Record<CookieCondition, CookieEvaluator<any>>` to map conditions to evaluation functions.

### BaseResource & Resource - UI Resource Management

Controls visibility of UI elements (maps, videos, embeds) based on consent.

**HTML Integration**:
```html
<div videoTag class="overlay">
  Accept cookies to view this video.
</div>
```

**Behavior**:
- Consent granted: Remove `overlay` class, add `disable-overlay` class
- Consent denied: Add `overlay` class, remove `disable-overlay` class

**Known Issue**: `Resource` class is an empty wrapper around `BaseResource` with no added functionality. Should be removed or given actual purpose.

## Configuration (ConsentConfig.ts)

This is where you define the consent behavior mapping:

### Cookie Categories (C0001-C0004)

```typescript
{
    cookies: [CookieType.C0002],      // Performance category
    cookieNames: ['perf_cookie'],     // Cookies to delete if consent withdrawn
    code: `console.log("Script");`,   // Inline script to execute
    src: 'https://...',               // OR external script URL
    defer: [...]                      // OR sequential scripts
}
```

### Resource Definitions

```typescript
new Resource(
    ResourceType.Video,               // Resource type (matches HTML attribute)
    [CookieType.C0003],              // Required consent categories
    CookieCondition.AND              // Evaluation strategy
)
```

## Consent Flow

1. **Page Load** → `ConsentWrapper.ts` initializes
2. **Factory Creates Provider** → Based on `ProviderType.ONETRUST`
3. **Engine Injection** → `engine.injectScripts()`
   - Injects provider SDK (OneTrust)
   - Creates placeholder scripts with consent classes (e.g., `optanon-category-C0002`)
4. **OneTrust Loads** → Sets `window.OptanonActiveGroups`
5. **OptanonWrapper Callback** → Triggers first evaluation
6. **Evaluation Loop** → `engine.evaluateConsents()`
   - Read active consents from provider
   - Delete cookies if consent withdrawn
   - Show/hide UI resources
7. **User Changes Consent** → OneTrust triggers `Optanon.OnConsentChanged()`
8. **Re-evaluation** → Back to step 6

## Type Safety

**Strict Mode Enabled**: `"strict": true` in tsconfig.json

**Known Type Safety Issues**:
- `global.d.ts` uses `any` types for OneTrust SDK
- `OneTrustProvider` casts `window as any` multiple times
- `CookieCategory.defer` typed as `any` instead of `CookieCategory[]`

**Future Fix**: Create proper TypeScript definitions for OneTrust SDK (see architectural review).

## Testing

**Current State**: ✅ **Phase 0 Complete** - Testing infrastructure fully set up and operational.

**Testing Framework**: Vitest v4.0.14 with happy-dom environment
- Fast, modern test runner with native TypeScript support
- Lightweight DOM implementation for browser API testing
- V8 coverage provider with 80% threshold targets
- Interactive UI and watch mode available

**Test Commands**:
```bash
npm test                 # Run all tests once
npm run test:watch       # Watch mode (auto-rerun on changes)
npm run test:ui          # Interactive test UI
npm run test:coverage    # Generate coverage report
```

**Coverage Targets**:
- Lines: 80% | Functions: 80% | Branches: 75% | Statements: 80%

**Test Status**:
- ✅ Smoke tests: 10/10 passing
- 📁 Test files location: `tests/`
- 📊 Coverage reports: `coverage/index.html`

**Current Coverage**: Infrastructure validated, unit tests in development

**Testing Documentation**: See [TESTING.md](TESTING.md) for detailed guide

**Known Limitation**: Tight DOM coupling requires happy-dom for testing. Future refactoring could introduce `IDOMAdapter` for cleaner mocking, but happy-dom handles current needs well.

## Module System & Imports

**ES Modules**: This project uses ES Modules, not CommonJS.

**Import Rules**:
- Always use `.js` extension in imports (even for `.ts` files)
- Use `import { } from './module.js'` not `require()`
- `package.json` has `"type": "module"`

**Why .js in imports?**: TypeScript compiles to JavaScript but doesn't rewrite import paths. The `.js` extension ensures runtime can resolve modules after compilation.

## Global Declarations

**global.d.ts**: Declares OneTrust-specific global variables:
- `window.OptanonActiveGroups` - Comma-separated consent IDs
- `window.Optanon` - Legacy OneTrust API
- `window.Onetrust` - Modern OneTrust API
- `window.OptanonWrapper` - Callback function OneTrust invokes

**Provider Leakage**: `ConsentWrapper.ts` directly assigns `OptanonWrapper` to window, which breaks provider abstraction. This should be moved into provider implementation.

## Known Technical Debt

1. **DOM Coupling**: Prevents testing and SSR
2. **SRP Violations**: `ConsentEngine` has too many responsibilities
3. **Empty Resource Class**: Adds no value over `BaseResource`
4. **Type Safety Issues**: Multiple `any` types
5. **No Error Handling**: Silent failures, no validation
6. **Provider Leakage**: `OptanonWrapper` in wrapper instead of provider

See architectural review document for detailed refactoring plan.

## Working with OneTrust

**Domain Script ID**: Located in `ConsentWrapper.ts` - change for different environments:
```typescript
domainScript: '01976a4b-0690-72c6-a7ee-3701352a5c93-test'
```

**Cookie Category Mapping**:
- C0001 = Strictly Necessary (Functional)
- C0002 = Performance
- C0003 = Functional (Extra functionality)
- C0004 = Targeting (Advertising)

**Testing**: Use OneTrust's test domain script (includes `-test` suffix) for development.

## Adding New Functionality

### Add New Script
1. Open `ConsentConfig.ts`
2. Add new object to `engineConfig` array
3. Specify `cookies`, `cookieNames`, and `code`/`src`/`defer`

### Add New Resource Type
1. Add enum to `ResourceType.ts`
2. Create HTML element with resource attribute (e.g., `<div mapTag>`)
3. Add `Resource` instance to config

### Add New Provider
1. Create class implementing `IConsentProvider`
2. Add to `ProviderType` enum
3. Add case to `ConsentProviderFactory.createProvider()`
4. Implement all interface methods

## Server Configuration

**Express Server** (`server.js`):
- Serves static files from `public/` (HTML/CSS)
- Serves compiled JS from `dist/`
- Runs on port 3000 (configurable via `PORT` env var)
- Uses ES Modules syntax

**Development**: `nodemon` watches for changes and auto-restarts server.

## Debugging

Check browser console for logs prefixed with:
- `[OneTrustProvider]` - Provider operations
- `🧹 Cookie deleted` - Cookie deletion
- `🟢/🔵/🟠` - Script execution by category
- `✅` - Provider initialization
- `🔄` - Consent change detection
