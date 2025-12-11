#!/usr/bin/env node

/**
 * Build script to bundle and minify ConsentManager
 * Generates a single minified script with version in filename
 * Usage: node scripts/bundle.js
 */

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bundle() {
    try {
        // Load config
        const configPath = path.join(__dirname, './esbuild.config.js');
        console.log(`🔧 Loading build config from: ${configPath}`);
        const configModule = await import(configPath);
        const { esbuildConfig, outputPath, bundlesPath, version, productName } = configModule;

        console.log('\n📦 Building ConsentManager ESM Bundle...\n');
        console.log(`   Product: ${productName}`);
        console.log(`   Version: ${version}`);
        console.log(`   ESM Output: ${outputPath}\n`);

        // Ensure dist directory exists
        const distDir = path.dirname(outputPath);
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
            console.log(`✓ Created dist directory\n`);
        }

        // Build ESM bundle
        console.log('🔨 Building ESM minified bundle (for import statements)...');
        const result = await esbuild.build(esbuildConfig);
        const stats = fs.statSync(outputPath);
        const sizeKb = (stats.size / 1024).toFixed(2);
        console.log(`✓ ESM bundle created: ${outputPath} (${sizeKb} KB)\n`);

        // Generate metadata summary if available
        if (result.metafile) {
            const summary = await esbuild.analyzeMetafile(result.metafile);
            console.log('📊 Bundle Analysis:\n');
            console.log(summary);
        }

        console.log(`✅ Bundle complete: ${productName}-${version}.esm.min.js (${sizeKb} KB)\n`);

        // Copy ESM bundle from dist/ to bundles/{version}/
        const versionedBundleDir = path.join(bundlesPath, version);
        if (!fs.existsSync(versionedBundleDir)) {
            fs.mkdirSync(versionedBundleDir, { recursive: true });
            console.log(`✓ Created bundles directory: ${versionedBundleDir}`);
        }

        // Copy ESM bundle to versioned directory
        const esmBundleDestination = path.join(versionedBundleDir, `${productName}-${version}.esm.min.js`);
        fs.copyFileSync(outputPath, esmBundleDestination);
        console.log(`✓ ESM bundle copied to: ${esmBundleDestination}`);

        // Also copy to bundles/latest/ for easy access
        const latestBundleDir = path.join(bundlesPath, 'latest');
        if (!fs.existsSync(latestBundleDir)) {
            fs.mkdirSync(latestBundleDir, { recursive: true });
        }

        // Copy ESM to latest
        const latestEsmDestination = path.join(latestBundleDir, `${productName}.esm.min.js`);
        fs.copyFileSync(outputPath, latestEsmDestination);
        console.log(`✓ Latest ESM bundle updated: ${latestEsmDestination}\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Bundle failed:', error.message);
        process.exit(1);
    }
}

bundle();
