# Consent Manager Bundles

This directory contains pre-built ESM bundles of the Consent Manager library.

## Directory Structure

```
bundles/
├── latest/                              # Latest version bundle
│   └── consent-manager.esm.min.js      # Minified ESM bundle for import statements
└── {version}/                           # Version-specific bundles (e.g., 1.0.0/)
    └── consent-manager-{version}.esm.min.js
```

## Bundle Type

### ESM Bundle (`.esm.min.js`)
**Format:** ES Module (minified)
**Use case:** Modern ES6 import statements in browsers

```html
<script type="module">
  import { initConsentManager, ProviderType } from './bundles/latest/consent-manager.esm.min.js';

  await initConsentManager({
    config: {...},
    provider: {
      type: ProviderType.ONETRUST,
      config: {...}
    }
  });
</script>
```

## Usage in Examples

The `/public/index.html` file demonstrates how to use the ESM bundle:

```javascript
import {
  initConsentManager,
  ProviderType
} from './bundles/latest/consent-manager.esm.min.js';

// Note: TypeScript type definitions (IOneTrustProviderConfig, ConsentConfigJson)
// are not available in the JavaScript bundle - they're TypeScript-only constructs
```

## Building Bundles

To generate new bundles:

```bash
# Build ESM minified bundle
npm run build:bundle

# This will:
# 1. Compile TypeScript to JavaScript
# 2. Create minified ESM bundle for import statements
# 3. Copy bundle to bundles/{version}/ directory
# 4. Copy bundle to bundles/latest/ directory
```

## Server Configuration

The Express server ([server.js](../server.js)) is configured to serve bundles:

```javascript
// Serve bundled files from bundles directory
app.use('/bundles', express.static(path.join(__dirname, 'bundles')));
```

This makes bundles accessible at `http://localhost:3000/bundles/latest/consent-manager.esm.min.js`

## Version Management

- **Version-specific bundles** (`bundles/1.0.0/`) are created for each release
- **Latest bundle** (`bundles/latest/`) always points to the most recent build
- Version is automatically extracted from `package.json`

## File Size

Current bundle size:
- ESM (minified): ~20.6 KB

## TypeScript Support

**Important:** The minified ESM bundle is a JavaScript file and does not include TypeScript type definitions. Type annotations like `IOneTrustProviderConfig` and `ConsentConfigJson` are stripped during compilation.

For TypeScript projects using this library, install the package via npm to get full type definitions:

```bash
npm install @vml/consent-manager
```

Then import with full TypeScript support:

```typescript
import {
  initConsentManager,
  ProviderType
} from '@vml/consent-manager';
import type {
  IOneTrustProviderConfig,
  ConsentConfigJson
} from '@vml/consent-manager';
```
