#!/usr/bin/env node

/**
 * Production Build Script for setup.riceflow.app
 * 
 * This script builds the application for production deployment
 * with proper OneSignal configuration and optimizations.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building RiceFlow for Production (setup.riceflow.app)...\n');

// Check if .env.production exists
const envProductionPath = '.env.production';
if (!fs.existsSync(envProductionPath)) {
  console.error('❌ .env.production file not found!');
  console.log('Please create .env.production with:');
  console.log('VITE_ONESIGNAL_APP_ID="1061c7a8-e7ac-480c-9e2b-eb4b4b92e30a"');
  process.exit(1);
}

try {
  // Step 1: Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Step 2: Generate Firebase Service Worker
  console.log('🔥 Generating Firebase Service Worker...');
  execSync('npm run generate-firebase-sw', { stdio: 'inherit' });

  // Step 3: Build for production
  console.log('⚡ Building for production...');
  execSync('npm run build:production', { stdio: 'inherit' });

  // Step 4: Verify build output
  console.log('✅ Verifying build output...');
  const distPath = 'dist';
  if (!fs.existsSync(distPath)) {
    throw new Error('Build failed - dist folder not created');
  }

  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Build failed - index.html not found');
  }

  // Step 5: Display build info
  console.log('\n🎉 Production build completed successfully!');
  console.log('\n📁 Build output: ./dist/');
  console.log('🌐 Target domain: https://setup.riceflow.app');
  console.log('🔔 OneSignal App ID: 1061c7a8-e7ac-480c-9e2b-eb4b4b92e30a');
  
  console.log('\n📋 Next steps:');
  console.log('1. Upload dist/ folder contents to your web server');
  console.log('2. Configure domain setup.riceflow.app to point to uploaded files');
  console.log('3. Ensure HTTPS is enabled');
  console.log('4. Configure OneSignal Dashboard with production settings');
  console.log('5. Test notification permissions and PWA installation');

  console.log('\n🚀 Ready for deployment to setup.riceflow.app!');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
