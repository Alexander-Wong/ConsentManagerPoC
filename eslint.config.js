import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'bundles/**',
      '*.js',
      '*.mjs',
      'eslint.config.js',
      'generator/**',
      'server.js',
      'packager/**',
      'tests/**',
      'vitest.config.ts',
      'examples/**'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Sort imports alphabetically
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',   // Node.js built-in modules
            'external',  // npm packages
            'internal',  // Internal modules (using path aliases)
            'parent',    // Parent directory imports
            'sibling',   // Same directory imports
            'index',     // Index imports
            'type'       // Type imports
          ],
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true
          },
          'newlines-between': 'never'
        }
      ],
      // Ensure imports come before other statements
      'import/first': 'error',
      // No duplicate imports
      'import/no-duplicates': 'error',
    }
  }
);
