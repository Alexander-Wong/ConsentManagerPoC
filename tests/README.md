# Testing Infrastructure

This directory contains all unit and integration tests for the Consent Manager PoC.

## Setup

The testing infrastructure uses:
- **Vitest** - Fast, modern test runner with native TypeScript support
- **Happy-DOM** - Lightweight DOM implementation for testing browser code
- **@vitest/ui** - Interactive test UI for development
- **@vitest/coverage-v8** - Code coverage reporting

All dependencies are already installed. No additional setup required.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with interactive UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Organization

```
tests/
├── setup.ts                          # Global test setup (runs before each test)
├── smoke/                            # Infrastructure smoke tests
├── utils/                            # Tests for src/utils
│   ├── evaluation/                   # Cookie evaluation logic tests
│   └── logging/                      # Logger implementation tests
├── services/                         # Tests for src/services
│   ├── cookies/                      # Cookie management tests
│   ├── evaluation/                   # Consent evaluation tests
│   ├── resources/                    # Resource visibility tests
│   └── script/                       # Script injection tests
├── resources/                        # Tests for src/resources
├── providers/                        # Tests for src/providers
│   └── onetrust/                     # OneTrust provider tests
└── core/                             # Tests for src/core
```

## Coverage Thresholds

The project maintains minimum coverage thresholds:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Coverage reports are generated in `coverage/` directory.

## Best Practices

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test**: Tests should verify one thing
3. **Descriptive test names**: Use "should [expected behavior] when [condition]"
4. **Clean up**: Use `beforeEach`/`afterEach` hooks
5. **Mock external dependencies**: Keep tests isolated
6. **Test edge cases**: Include null, undefined, empty arrays, etc.

## Excluded from Coverage

The following files are excluded from coverage reports:
- `node_modules/`
- `dist/`
- `**/*.d.ts` - Type definitions
- `**/*.config.ts` - Configuration files
- `**/types/*.ts` - Type-only files
- `src/ConsentWrapper.ts` - Entry point (E2E tested)
- `server.js` - Server file

## Continuous Integration

Tests should be run in CI/CD pipeline:
```bash
npm run build && npm run test:coverage
```

## Troubleshooting

### Tests fail with "document is undefined"
- Ensure `vitest.config.ts` has `environment: 'happy-dom'`
- Check that test file imports from correct paths with `.js` extensions

### Coverage thresholds not met
- Run `npm run test:coverage` to see detailed report
- Open `coverage/index.html` in browser for visual report
- Add tests for uncovered lines

### TypeScript errors in tests
- Ensure `@types/node` is installed
- Check that import paths use `.js` extensions
- Verify `tsconfig.json` includes test files

## Current Status

✅ Phase 0: Testing Infrastructure Setup - **COMPLETE**
- Vitest installed and configured
- Happy-DOM environment set up
- Test scripts added to package.json
- Global setup file created
- Smoke tests passing (10/10)
- Coverage infrastructure verified

## Next Steps

- Phase 1: Utils folder tests (CookieEvaluator, Loggers)
- Phase 2: Services folder tests
- Phase 3: Resources folder tests
- Phase 4: Providers folder tests
- Phase 5: Core folder tests

Target: **>80% code coverage** across all modules.
