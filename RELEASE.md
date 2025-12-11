# Release Process & Bundle Versioning

## Current Version: 1.0.0

### Bundle Information
- **Bundle Size:** 21.31 KB (minified ESM)
- **Format:** ES Module (ESM)
- **Target:** ES2020
- **Location:** `bundles/1.0.0/` and `bundles/latest/`

---

## Version Management

### Semantic Versioning
This project follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
1.0.0
```

- **MAJOR** - Breaking changes (incompatible API changes)
- **MINOR** - New features (backward-compatible)
- **PATCH** - Bug fixes (backward-compatible)

### Release Commands

```bash
npm run release:patch    # Bug fixes (1.0.0 → 1.0.1)
npm run release:minor    # New features (1.0.0 → 1.1.0)
npm run release:major    # Breaking changes (1.0.0 → 2.0.0)
```

---

## Bundle Versioning Strategy

### Directory Structure
```
bundles/
├── latest/                           # Always points to current version
│   └── consent-manager.esm.min.js   # Unversioned filename
├── 1.0.0/                            # Version 1.0.0
│   └── consent-manager-1.0.0.esm.min.js
├── 1.1.0/                            # Version 1.1.0 (future)
│   └── consent-manager-1.1.0.esm.min.js
└── 2.0.0/                            # Version 2.0.0 (future)
    └── consent-manager-2.0.0.esm.min.js
```

### Usage Patterns

#### Latest Version (Auto-updating)
```javascript
// Always uses the newest version
import { initConsentManager } from './bundles/latest/consent-manager.esm.min.js';
```
✅ **Best for:** Development, auto-updating to latest features
⚠️ **Caution:** May receive breaking changes in major updates

#### Locked Version (Stable)
```javascript
// Locked to specific version
import { initConsentManager } from './bundles/1.0.0/consent-manager-1.0.0.esm.min.js';
```
✅ **Best for:** Production, guaranteed stability
⚠️ **Caution:** Must manually update to get new features

---

## Release Workflow

### Automated Release Process

The release script handles:
1. Version bump in `package.json`
2. Bundle generation with version number
3. Copy to versioned directory (`bundles/1.0.0/`)
4. Copy to latest directory (`bundles/latest/`)
5. Git commit with conventional format
6. Git tag creation (`v1.0.0`)
7. Push to remote repository

### Step-by-Step Release

```bash
# 1. Stage your changes
git add <files>

# 2. Run release command
npm run release:minor  # or patch/major

# 3. Enter commit description when prompted
# Example: "add support for Cookiebot provider"

# Script automatically:
# - Runs tests
# - Builds bundle
# - Bumps version
# - Creates commit: "feat: add support for Cookiebot provider"
# - Tags release: v1.1.0
# - Pushes to remote
```

---

## Bundle Build Process

### Build Commands
```bash
npm run build:bundle     # Build ESM bundle with current version
```

### What Gets Generated

For version 1.0.0:
```
dist/consent-manager-1.0.0.esm.min.js          # Build artifact
bundles/1.0.0/consent-manager-1.0.0.esm.min.js # Versioned bundle
bundles/latest/consent-manager.esm.min.js      # Latest bundle
```

### Version Injection

Version number is automatically injected from `package.json`:
```javascript
// packager/esbuild.config.js
const version = packageJson.version; // "1.0.0"
const outputFilename = `${productName}-${version}.esm.min.js`;
```

---

## Migration Between Versions

### From 1.0.0 to 1.1.0 (Minor Update)

**No breaking changes - safe to update:**

```javascript
// Before
import { initConsentManager } from './bundles/1.0.0/consent-manager-1.0.0.esm.min.js';

// After
import { initConsentManager } from './bundles/1.1.0/consent-manager-1.1.0.esm.min.js';
// Or use latest
import { initConsentManager } from './bundles/latest/consent-manager.esm.min.js';
```

### From 1.x.x to 2.0.0 (Major Update)

**Breaking changes possible - review changelog:**

1. Read `CHANGELOG.md` for breaking changes
2. Update code according to migration guide
3. Test thoroughly before deploying
4. Update import path:
```javascript
import { initConsentManager } from './bundles/2.0.0/consent-manager-2.0.0.esm.min.js';
```

---

## Version Compatibility

### Current Version (1.0.0)

**Exports:** 17 runtime objects
- `initConsentManager` (function)
- `ProviderConfigs` (object)
- `ProviderType`, `CookieType`, `ResourceType`, `CookieConditionalType` (enums)
- `ConsentEngineConfig`, `CookieCategory`, `BaseResource` (classes)
- `ConsentConfigJson`, `CookieCategoryJson`, `ResourceJson` (JSON classes)
- Service classes for advanced usage

**API:**
- `ConfigLoaderService.loadFromObj()` - Accepts JSON or class instances
- `ProviderConfigs.oneTrust()` - OneTrust provider factory
- `ProviderConfigs.mock()` - Mock provider factory

**Breaking Changes from Previous Versions:**
- None (initial 1.0.0 release)

---

## Changelog Generation

### Automatic Changelog

Changelog is auto-generated from [Conventional Commits](https://www.conventionalcommits.org/):

```bash
npm run changelog:update
```

### Commit Message Format

```
<type>(<scope>): <description>

Examples:
feat(providers): add Cookiebot support
fix(cookies): resolve deletion race condition
feat(engine)!: redesign consent evaluation API
```

**Types that appear in changelog:**
- `feat:` → Features section
- `fix:` → Bug Fixes section
- `perf:` → Performance section
- `feat!:` or `BREAKING CHANGE:` → Breaking Changes section

---

## CDN Deployment (Future)

### Recommended CDN Structure
```
https://cdn.example.com/consent-manager/
├── latest/
│   └── consent-manager.esm.min.js
├── 1.0.0/
│   └── consent-manager-1.0.0.esm.min.js
├── 1.1.0/
│   └── consent-manager-1.1.0.esm.min.js
└── 2.0.0/
    └── consent-manager-2.0.0.esm.min.js
```

### CDN Usage
```javascript
// Latest version
import { initConsentManager } from 'https://cdn.example.com/consent-manager/latest/consent-manager.esm.min.js';

// Locked version
import { initConsentManager } from 'https://cdn.example.com/consent-manager/1.0.0/consent-manager-1.0.0.esm.min.js';
```

---

## Testing Before Release

### Pre-Release Checklist

```bash
# 1. Run all tests
npm run test

# 2. Build TypeScript
npm run build

# 3. Build bundle
npm run build:bundle

# 4. Lint code
npm run lint

# 5. Test locally
npm run dev
# Visit http://localhost:3000 and test functionality

# 6. Check bundle size
ls -lh bundles/latest/
```

### Expected Results
- ✅ All 252 tests passing
- ✅ No TypeScript errors
- ✅ No lint errors
- ✅ Bundle size ~21 KB
- ✅ Manual testing successful

---

## Rollback Procedure

### If Release Fails

```bash
# 1. Undo last commit (before push)
git reset --hard HEAD~1

# 2. Delete version tag
git tag -d v1.1.0

# 3. Fix issues
# ... make necessary changes ...

# 4. Re-run release
npm run release:minor
```

### If Already Pushed

```bash
# 1. Revert to previous version
git revert HEAD

# 2. Delete remote tag (use with caution)
git push origin :refs/tags/v1.1.0

# 3. Create new patch release with fix
npm run release:patch
```

---

## Version History

### v1.0.0 (Current)
- Initial release
- OneTrust and Mock provider support
- Flexible configuration (JSON/Class-based/URL)
- 17 runtime exports
- 21.31 KB bundle size
- 252 passing tests

---

## Development Commands

```bash
# Version management
npm run version:show           # Show current version

# Release commands
npm run release:patch          # 1.0.0 → 1.0.1
npm run release:minor          # 1.0.0 → 1.1.0
npm run release:major          # 1.0.0 → 2.0.0

# Manual version bump (without release)
npm version patch --no-git-tag-version
npm version minor --no-git-tag-version
npm version major --no-git-tag-version

# Changelog
npm run changelog:update       # Regenerate changelog
```

---

## Support & Documentation

- **Full Usage Guide:** [HOW-TO-USE.md](HOW-TO-USE.md)
- **Project Overview:** [README.md](README.md)
- **Bundle Details:** [BUNDLE_CONFIGURATION.md](BUNDLE_CONFIGURATION.md)
- **Issues:** [GitHub Issues](https://github.com/Alexander-Wong/ConsentManagerPoC/issues)

---

## License

ISC © VML Team
