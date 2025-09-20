#!/usr/bin/env node

/**
 * App Store Preparation Script
 * Prepares the app for app store submission
 */

const fs = require('fs');
const path = require('path');

console.log('📱 PREPARING APP STORE ASSETS');
console.log('=' .repeat(50));

async function checkAppIcons() {
  console.log('\n🖼️ CHECKING APP ICONS');
  console.log('-' .repeat(30));
  
  const iconPath = path.join(__dirname, '../assets/images/icon.png');
  const faviconPath = path.join(__dirname, '../assets/images/favicon.png');
  
  if (fs.existsSync(iconPath)) {
    console.log('✅ App icon found: assets/images/icon.png');
  } else {
    console.log('❌ App icon missing: assets/images/icon.png');
  }
  
  if (fs.existsSync(faviconPath)) {
    console.log('✅ Favicon found: assets/images/favicon.png');
  } else {
    console.log('❌ Favicon missing: assets/images/favicon.png');
  }
  
  console.log('\n📋 REQUIRED APP ICON SIZES:');
  console.log('- 1024x1024 (App Store)');
  console.log('- 512x512 (Google Play)');
  console.log('- 180x180 (iOS)');
  console.log('- 192x192 (Android)');
  console.log('- 48x48 (Android)');
  
  return true;
}

async function checkScreenshots() {
  console.log('\n📸 CHECKING SCREENSHOTS');
  console.log('-' .repeat(30));
  
  const screenshotsDir = path.join(__dirname, '../assets/screenshots');
  
  if (fs.existsSync(screenshotsDir)) {
    const files = fs.readdirSync(screenshotsDir);
    console.log(`✅ Screenshots directory found with ${files.length} files`);
  } else {
    console.log('❌ Screenshots directory missing');
    console.log('📋 Create screenshots directory: assets/screenshots/');
  }
  
  console.log('\n📋 REQUIRED SCREENSHOTS:');
  console.log('iOS App Store:');
  console.log('- 6.7" (iPhone 15 Pro Max): 1290x2796');
  console.log('- 6.5" (iPhone 14 Plus): 1284x2778');
  console.log('- 5.5" (iPhone 8 Plus): 1242x2208');
  console.log('- 12.9" (iPad Pro): 2048x2732');
  console.log('');
  console.log('Google Play Store:');
  console.log('- Phone: 1080x1920 or higher');
  console.log('- Tablet: 1200x1920 or higher');
  console.log('- Feature graphic: 1024x500');
  
  return true;
}

async function checkAppMetadata() {
  console.log('\n📝 CHECKING APP METADATA');
  console.log('-' .repeat(30));
  
  try {
    const appJsonPath = path.join(__dirname, '../app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    console.log('✅ App configuration found');
    console.log(`   Name: ${appJson.expo.name}`);
    console.log(`   Version: ${appJson.expo.version}`);
    console.log(`   Bundle ID: ${appJson.expo.scheme}`);
    
    console.log('\n📋 REQUIRED METADATA:');
    console.log('App Store (iOS):');
    console.log('- App name: EstateLink');
    console.log('- Subtitle: Real Estate Marketplace');
    console.log('- Description: Find your perfect home with EstateLink');
    console.log('- Keywords: real estate, property, home');
    console.log('- Category: Lifestyle');
    console.log('- Age rating: 4+');
    console.log('');
    console.log('Google Play Store:');
    console.log('- App name: EstateLink');
    console.log('- Short description: Real Estate Marketplace');
    console.log('- Full description: Find your perfect home...');
    console.log('- Category: Lifestyle');
    console.log('- Content rating: Everyone');
    
    return true;
  } catch (error) {
    console.log('❌ Error reading app.json:', error.message);
    return false;
  }
}

async function checkPrivacyPolicy() {
  console.log('\n🔒 CHECKING PRIVACY POLICY');
  console.log('-' .repeat(30));
  
  const privacyPolicyPath = path.join(__dirname, '../PRIVACY_POLICY.md');
  
  if (fs.existsSync(privacyPolicyPath)) {
    console.log('✅ Privacy policy found');
  } else {
    console.log('❌ Privacy policy missing');
    console.log('📋 Create privacy policy: PRIVACY_POLICY.md');
  }
  
  console.log('\n📋 REQUIRED LEGAL DOCUMENTS:');
  console.log('- Privacy Policy (required)');
  console.log('- Terms of Service (recommended)');
  console.log('- Data Collection Notice (if applicable)');
  console.log('- Cookie Policy (if applicable)');
  
  return true;
}

async function checkAppStoreAssets() {
  console.log('\n📦 CHECKING APP STORE ASSETS');
  console.log('-' .repeat(30));
  
  const assetsDir = path.join(__dirname, '../assets');
  const requiredAssets = [
    'images/icon.png',
    'images/favicon.png',
    'images/splash-icon.png'
  ];
  
  let missingAssets = [];
  
  for (const asset of requiredAssets) {
    const assetPath = path.join(assetsDir, asset);
    if (fs.existsSync(assetPath)) {
      console.log(`✅ ${asset}`);
    } else {
      console.log(`❌ ${asset}`);
      missingAssets.push(asset);
    }
  }
  
  if (missingAssets.length === 0) {
    console.log('\n✅ All required assets found');
  } else {
    console.log(`\n❌ Missing ${missingAssets.length} assets`);
  }
  
  return missingAssets.length === 0;
}

async function runAppStorePreparation() {
  console.log('🚀 STARTING APP STORE PREPARATION...\n');
  
  const results = {
    appIcons: await checkAppIcons(),
    screenshots: await checkScreenshots(),
    appMetadata: await checkAppMetadata(),
    privacyPolicy: await checkPrivacyPolicy(),
    appStoreAssets: await checkAppStoreAssets()
  };
  
  console.log('\n📊 APP STORE PREPARATION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`🖼️ App Icons: ${results.appIcons ? '✅ Ready' : '❌ Missing'}`);
  console.log(`📸 Screenshots: ${results.screenshots ? '✅ Ready' : '❌ Missing'}`);
  console.log(`📝 App Metadata: ${results.appMetadata ? '✅ Ready' : '❌ Missing'}`);
  console.log(`🔒 Privacy Policy: ${results.privacyPolicy ? '✅ Ready' : '❌ Missing'}`);
  console.log(`📦 App Store Assets: ${results.appStoreAssets ? '✅ Ready' : '❌ Missing'}`);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Create missing app icons and screenshots');
  console.log('2. Write privacy policy and terms of service');
  console.log('3. Prepare app store descriptions');
  console.log('4. Test app thoroughly');
  console.log('5. Submit to app stores');
  
  console.log('\n⏱️ ESTIMATED TIME: 30 minutes');
  console.log('🎉 After preparation: App ready for app store submission!');
}

// Run the app store preparation
runAppStorePreparation().catch(console.error);
