/**
 * esbuild configuration for bundling and minifying ConsentManager
 * Generates a single minified script with version in filename
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Extract version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
const version = packageJson.version;
const productName = 'consent-manager';

// Output filename with version - ESM minified only
const outputFilename = `${productName}-${version}.esm.min.js`;
const outputPath = path.join(projectRoot, 'dist', outputFilename);
const bundlesPath = path.join(projectRoot, 'bundles/');

// ESM bundle configuration (for import statements)
const esbuildConfig = {
  entryPoints: [path.join(projectRoot, 'src/index.ts')],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: 'ES2020',
  format: 'esm', // ES Module format - for import/export
  outfile: outputPath,
  external: [], // No external dependencies expected at runtime
  loader: {
    '.ts': 'ts',
  },
  define: {
    'CONSENT_MANAGER_VERSION': `"${version}"`,
    'CONSENT_MANAGER_NAME': `"${productName}"`,
  },
  logLevel: 'info',
  metafile: true, // Generate metadata about the bundle
  banner: {
    js: `/*! ${productName} v${version} | GDPR/CCPA Cookie Consent Management System | MIT License */`,
  },
};

export {
  esbuildConfig,
  outputPath,
  bundlesPath,
  version,
  productName
};
