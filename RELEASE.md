# Release Process Guide

## Overview

This project uses an automated release workflow that handles versioning, changelog generation, and git operations. The workflow enforces [Conventional Commits](https://www.conventionalcommits.org/) format to ensure consistent changelog generation.

## Quick Start

### 1. Stage Your Changes
```bash
git add <files>
```

### 2. Run Release Command
```bash
npm run release:patch   # For bug fixes (1.2.3 → 1.2.4)
npm run release:minor   # For new features (1.2.3 → 1.3.0)
npm run release:major   # For breaking changes (1.2.3 → 2.0.0)
```

### 3. Follow the Prompts
The script will:
- Prompt you for a commit description (without type prefix)
- Run tests automatically
- Build the project
- Bump the version in package.json
- Generate/update CHANGELOG.md
- Create a properly formatted commit
- Tag the release
- Push to remote

## Commit Message Format

The release script automatically formats your commit messages using Conventional Commits:

### Patch Release (Bug Fixes)
```bash
npm run release:patch
# You enter: "resolve cookie deletion issue"
# Commit created: "fix: resolve cookie deletion issue"
```

### Minor Release (New Features)
```bash
npm run release:minor
# You enter: "add support for Cookiebot provider"
# Commit created: "feat: add support for Cookiebot provider"
```

### Major Release (Breaking Changes)
```bash
npm run release:major
# You enter: "redesign consent engine API"
# Commit created: "feat!: redesign consent engine API"
```

## Conventional Commits Format

For non-release commits, follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Common Types

| Type | Description | Version Bump | Appears in Changelog |
|------|-------------|--------------|---------------------|
| `feat` | New feature | Minor | ✅ Features |
| `fix` | Bug fix | Patch | ✅ Bug Fixes |
| `feat!` | Breaking change | Major | ✅ BREAKING CHANGES |
| `docs` | Documentation | - | ❌ |
| `style` | Code style changes | - | ❌ |
| `refactor` | Code refactoring | - | ❌ |
| `perf` | Performance improvements | Patch | ✅ Performance |
| `test` | Test changes | - | ❌ |
| `chore` | Maintenance tasks | - | ❌ |
| `ci` | CI/CD changes | - | ❌ |

### Examples

```bash
# Feature
git commit -m "feat(providers): add Cookiebot provider implementation"

# Bug fix
git commit -m "fix(cookies): resolve deletion race condition"

# Breaking change (option 1 - ! suffix)
git commit -m "feat(engine)!: redesign consent evaluation API"

# Breaking change (option 2 - footer)
git commit -m "feat(engine): redesign consent evaluation

BREAKING CHANGE: ConsentEngine.evaluate() now returns a Promise"

# Performance improvement
git commit -m "perf(evaluation): optimize cookie evaluation loop"

# Documentation
git commit -m "docs: update provider integration guide"

# With scope and detailed description
git commit -m "fix(script-injection): prevent duplicate script loading

- Add deduplication check before script injection
- Update tests to cover edge cases
- Closes #42"
```

## Changelog Generation

The CHANGELOG.md is automatically generated from commit messages:

### What Appears in Changelog?
- ✅ `feat:` commits → **Features** section
- ✅ `fix:` commits → **Bug Fixes** section
- ✅ `perf:` commits → **Performance Improvements** section
- ✅ `feat!:` or `BREAKING CHANGE:` → **BREAKING CHANGES** section
- ❌ Other types (docs, chore, test, etc.) are excluded

### Changelog Format
```markdown
## [1.3.0](compare-link) (2025-12-02)

### Features
* **providers**: add Cookiebot provider implementation ([abc1234](commit-link))
* add resource visibility controls ([def5678](commit-link))

### Bug Fixes
* **cookies**: resolve deletion race condition ([ghi9012](commit-link))
```

## Troubleshooting

### Changes Not Appearing in Changelog

**Problem:** Your commits don't show up in CHANGELOG.md

**Solutions:**
1. Ensure commits use conventional format: `type: description`
2. Use appropriate types: `feat`, `fix`, or `perf`
3. Check that commits are between version tags
4. Verify commits are pushed to the repository

### Release Script Fails

**Problem:** Release script exits with error

**Common Issues:**
- No staged changes → Stage files first with `git add`
- Tests failing → Fix test failures before releasing
- Build errors → Ensure `npm run build` works
- Empty commit description → Provide a meaningful description

### Unstaged Changes

The release script automatically:
1. Stashes unstaged changes before release
2. Restores them after successful release
3. Keeps your working directory clean

## Best Practices

### 1. Commit Frequently
Make small, focused commits with clear conventional messages:
```bash
git commit -m "feat(services): add cookie categorization"
git commit -m "test(services): add cookie service tests"
git commit -m "docs(services): document cookie service API"
```

### 2. Stage Only What You Need
Only stage changes you want in the release:
```bash
git add src/services/CookieService.ts
git add tests/services/CookieService.test.ts
npm run release:minor
```

### 3. Write Clear Descriptions
- Use imperative mood: "add feature" not "added feature"
- Be specific: "fix cookie deletion in Safari" not "fix bug"
- Reference issues: "closes #42" or "fixes #123"

### 4. Choose Correct Version Type

| Change Type | Version Command | Example |
|-------------|----------------|---------|
| Bug fixes only | `release:patch` | 1.2.3 → 1.2.4 |
| New features (backward compatible) | `release:minor` | 1.2.3 → 1.3.0 |
| Breaking changes | `release:major` | 1.2.3 → 2.0.0 |

### 5. Review Before Pushing
The script automatically pushes. To review first:
```bash
# After release script completes, check:
git log -1          # View the commit
git show v1.3.0     # View the tag
cat CHANGELOG.md    # Review changelog

# If needed, undo (before script pushes):
git reset --hard HEAD~1
git tag -d v1.3.0
```

## Manual Changelog Regeneration

If you need to manually regenerate the changelog:

```bash
# Regenerate entire changelog
npm run changelog:update

# Or use conventional-changelog directly
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

## Version Commands Reference

```bash
# Show current version
npm run version:show

# Release commands
npm run release:patch    # Bug fixes (1.2.3 → 1.2.4)
npm run release:minor    # New features (1.2.3 → 1.3.0)
npm run release:major    # Breaking changes (1.2.3 → 2.0.0)

# Manual version bump (without release process)
npm version patch --no-git-tag-version
npm version minor --no-git-tag-version
npm version major --no-git-tag-version
```

## Learn More

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
