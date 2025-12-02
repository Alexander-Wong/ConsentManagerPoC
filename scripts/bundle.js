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

        console.log('\n📦 Building ConsentManager Bundle...\n');
        console.log(`   Product: ${productName}`);
        console.log(`   Version: ${version}`);
        console.log(`   Output: ${outputPath}\n`);

        // Ensure dist directory exists
        const distDir = path.dirname(outputPath);
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
            console.log(`✓ Created dist directory\n`);
        }

        // Run esbuild
        const result = await esbuild.build(esbuildConfig);

        // Get file size
        const stats = fs.statSync(outputPath);
        const sizeKb = (stats.size / 1024).toFixed(2);

        console.log(`✓ Bundle created successfully!`);
        console.log(`✓ Output file: ${outputPath}`);
        console.log(`✓ File size: ${sizeKb} KB\n`);

        // Generate metadata summary if available
        if (result.metafile) {
            const summary = await esbuild.analyzeMetafile(result.metafile);
            console.log('📊 Bundle Analysis:\n');
            console.log(summary);
        }

        console.log(`✅ Bundle complete: ${productName}-${version}.min.js\n`);

        // Copy bundle from dist/ to bundles/{version}/
        const versionedBundleDir = path.join(bundlesPath, version);
        if (!fs.existsSync(versionedBundleDir)) {
            fs.mkdirSync(versionedBundleDir, { recursive: true });
            console.log(`✓ Created bundles directory: ${versionedBundleDir}`);
        }

        const bundleDestination = path.join(versionedBundleDir, `${productName}-${version}.min.js`);
        fs.copyFileSync(outputPath, bundleDestination);
        console.log(`✓ Bundle copied to: ${bundleDestination}`);

        // Also copy to bundles/latest/ for easy access
        const latestBundleDir = path.join(bundlesPath, 'latest');
        if (!fs.existsSync(latestBundleDir)) {
            fs.mkdirSync(latestBundleDir, { recursive: true });
        }
        const latestDestination = path.join(latestBundleDir, `${productName}.min.js`);
        fs.copyFileSync(outputPath, latestDestination);
        console.log(`✓ Latest bundle updated: ${latestDestination}\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Bundle failed:', error.message);
        process.exit(1);
    }
}

bundle();
