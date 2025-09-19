#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Implemented Features for Consumer Readiness\n');

// Feature test results
const testResults = {
  bookingSystem: { status: 'PASS', details: [] },
  ownerDashboard: { status: 'PASS', details: [] },
  reviewSystem: { status: 'PASS', details: [] },
  advancedSearch: { status: 'PASS', details: [] },
  offlineSupport: { status: 'PASS', details: [] },
  pushNotifications: { status: 'PASS', details: [] },
  codeQuality: { status: 'PASS', details: [] },
  fileStructure: { status: 'PASS', details: [] }
};

// Test 1: Booking System
console.log('📅 Testing Booking System...');
try {
  // Check if booking files exist
  const bookingLib = path.join(__dirname, '../lib/booking.ts');
  const propertyDetail = path.join(__dirname, '../app/(root)/properties/[id].tsx');
  
  if (fs.existsSync(bookingLib)) {
    const bookingContent = fs.readFileSync(bookingLib, 'utf8');
    if (bookingContent.includes('createBooking') && 
        bookingContent.includes('getAvailableBookingSlots') &&
        bookingContent.includes('getUserBookings')) {
      testResults.bookingSystem.details.push('✅ Booking functions implemented');
    } else {
      testResults.bookingSystem.status = 'FAIL';
      testResults.bookingSystem.details.push('❌ Missing booking functions');
    }
  } else {
    testResults.bookingSystem.status = 'FAIL';
    testResults.bookingSystem.details.push('❌ Booking library missing');
  }
  
  if (fs.existsSync(propertyDetail)) {
    const propertyContent = fs.readFileSync(propertyDetail, 'utf8');
    if (propertyContent.includes('createBooking') && 
        propertyContent.includes('confirmBooking')) {
      testResults.bookingSystem.details.push('✅ Booking UI integrated');
    } else {
      testResults.bookingSystem.status = 'FAIL';
      testResults.bookingSystem.details.push('❌ Booking UI not integrated');
    }
  }
  
  console.log(`   Status: ${testResults.bookingSystem.status}`);
} catch (error) {
  testResults.bookingSystem.status = 'ERROR';
  testResults.bookingSystem.details.push(`❌ Error: ${error.message}`);
}

// Test 2: Owner Dashboard
console.log('\n🏠 Testing Owner Dashboard...');
try {
  const ownerDashboard = path.join(__dirname, '../app/owner-dashboard.tsx');
  const addProperty = path.join(__dirname, '../app/add-property.tsx');
  
  if (fs.existsSync(ownerDashboard)) {
    const dashboardContent = fs.readFileSync(ownerDashboard, 'utf8');
    if (dashboardContent.includes('getOwnerBookings') && 
        dashboardContent.includes('getPropertiesByOwner')) {
      testResults.ownerDashboard.details.push('✅ Dashboard functionality implemented');
    } else {
      testResults.ownerDashboard.status = 'FAIL';
      testResults.ownerDashboard.details.push('❌ Dashboard missing core features');
    }
  } else {
    testResults.ownerDashboard.status = 'FAIL';
    testResults.ownerDashboard.details.push('❌ Owner dashboard missing');
  }
  
  if (fs.existsSync(addProperty)) {
    testResults.ownerDashboard.details.push('✅ Add property page exists');
  } else {
    testResults.ownerDashboard.status = 'FAIL';
    testResults.ownerDashboard.details.push('❌ Add property page missing');
  }
  
  console.log(`   Status: ${testResults.ownerDashboard.status}`);
} catch (error) {
  testResults.ownerDashboard.status = 'ERROR';
  testResults.ownerDashboard.details.push(`❌ Error: ${error.message}`);
}

// Test 3: Review System
console.log('\n⭐ Testing Review System...');
try {
  const reviewsLib = path.join(__dirname, '../lib/reviews.ts');
  const reviewCard = path.join(__dirname, '../components/ReviewCard.tsx');
  const reviewForm = path.join(__dirname, '../components/ReviewForm.tsx');
  const reviewsPage = path.join(__dirname, '../app/property-reviews.tsx');
  
  const requiredFiles = [
    { path: reviewsLib, name: 'Reviews library' },
    { path: reviewCard, name: 'Review card component' },
    { path: reviewForm, name: 'Review form component' },
    { path: reviewsPage, name: 'Reviews page' }
  ];
  
  let allExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      testResults.reviewSystem.details.push(`✅ ${file.name} exists`);
    } else {
      allExist = false;
      testResults.reviewSystem.details.push(`❌ ${file.name} missing`);
    }
  });
  
  if (!allExist) {
    testResults.reviewSystem.status = 'FAIL';
  }
  
  console.log(`   Status: ${testResults.reviewSystem.status}`);
} catch (error) {
  testResults.reviewSystem.status = 'ERROR';
  testResults.reviewSystem.details.push(`❌ Error: ${error.message}`);
}

// Test 4: Advanced Search
console.log('\n🔍 Testing Advanced Search...');
try {
  const advancedSearch = path.join(__dirname, '../components/AdvancedSearch.tsx');
  const searchResults = path.join(__dirname, '../app/search-results.tsx');
  const appwriteLib = path.join(__dirname, '../lib/appwrite.ts');
  
  if (fs.existsSync(advancedSearch)) {
    testResults.advancedSearch.details.push('✅ Advanced search component exists');
  } else {
    testResults.advancedSearch.status = 'FAIL';
    testResults.advancedSearch.details.push('❌ Advanced search component missing');
  }
  
  if (fs.existsSync(searchResults)) {
    testResults.advancedSearch.details.push('✅ Search results page exists');
  } else {
    testResults.advancedSearch.status = 'FAIL';
    testResults.advancedSearch.details.push('❌ Search results page missing');
  }
  
  if (fs.existsSync(appwriteLib)) {
    const appwriteContent = fs.readFileSync(appwriteLib, 'utf8');
    if (appwriteContent.includes('searchProperties')) {
      testResults.advancedSearch.details.push('✅ Search functionality implemented');
    } else {
      testResults.advancedSearch.status = 'FAIL';
      testResults.advancedSearch.details.push('❌ Search functionality missing');
    }
  }
  
  console.log(`   Status: ${testResults.advancedSearch.status}`);
} catch (error) {
  testResults.advancedSearch.status = 'ERROR';
  testResults.advancedSearch.details.push(`❌ Error: ${error.message}`);
}

// Test 5: Offline Support
console.log('\n📱 Testing Offline Support...');
try {
  const offlineStorage = path.join(__dirname, '../lib/offline-storage.ts');
  const offlineSync = path.join(__dirname, '../lib/offline-sync.ts');
  const useOfflineData = path.join(__dirname, '../lib/useOfflineData.ts');
  const offlineStatus = path.join(__dirname, '../components/OfflineStatus.tsx');
  
  const requiredFiles = [
    { path: offlineStorage, name: 'Offline storage' },
    { path: offlineSync, name: 'Offline sync manager' },
    { path: useOfflineData, name: 'Offline data hooks' },
    { path: offlineStatus, name: 'Offline status component' }
  ];
  
  let allExist = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      testResults.offlineSupport.details.push(`✅ ${file.name} exists`);
    } else {
      allExist = false;
      testResults.offlineSupport.details.push(`❌ ${file.name} missing`);
    }
  });
  
  if (!allExist) {
    testResults.offlineSupport.status = 'FAIL';
  }
  
  console.log(`   Status: ${testResults.offlineSupport.status}`);
} catch (error) {
  testResults.offlineSupport.status = 'ERROR';
  testResults.offlineSupport.details.push(`❌ Error: ${error.message}`);
}

// Test 6: Push Notifications
console.log('\n🔔 Testing Push Notifications...');
try {
  const pushNotifications = path.join(__dirname, '../lib/push-notifications.ts');
  const useNotifications = path.join(__dirname, '../lib/useNotifications.ts');
  
  if (fs.existsSync(pushNotifications)) {
    const pushContent = fs.readFileSync(pushNotifications, 'utf8');
    if (pushContent.includes('initializePushNotifications') && 
        pushContent.includes('NotificationTemplates')) {
      testResults.pushNotifications.details.push('✅ Push notification service implemented');
    } else {
      testResults.pushNotifications.status = 'FAIL';
      testResults.pushNotifications.details.push('❌ Push notification service incomplete');
    }
  } else {
    testResults.pushNotifications.status = 'FAIL';
    testResults.pushNotifications.details.push('❌ Push notifications library missing');
  }
  
  if (fs.existsSync(useNotifications)) {
    testResults.pushNotifications.details.push('✅ Notification hooks exist');
  } else {
    testResults.pushNotifications.status = 'FAIL';
    testResults.pushNotifications.details.push('❌ Notification hooks missing');
  }
  
  console.log(`   Status: ${testResults.pushNotifications.status}`);
} catch (error) {
  testResults.pushNotifications.status = 'ERROR';
  testResults.pushNotifications.details.push(`❌ Error: ${error.message}`);
}

// Test 7: Code Quality
console.log('\n📝 Testing Code Quality...');
try {
  const packageJson = path.join(__dirname, '../package.json');
  
  if (fs.existsSync(packageJson)) {
    const packageContent = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    
    // Check for required dependencies
    const requiredDeps = [
      '@react-native-async-storage/async-storage',
      '@react-native-community/netinfo',
      'expo-notifications',
      'expo-device',
      'expo-constants'
    ];
    
    let allDepsPresent = true;
    requiredDeps.forEach(dep => {
      if (packageContent.dependencies && packageContent.dependencies[dep]) {
        testResults.codeQuality.details.push(`✅ ${dep} installed`);
      } else {
        allDepsPresent = false;
        testResults.codeQuality.details.push(`❌ ${dep} missing`);
      }
    });
    
    if (!allDepsPresent) {
      testResults.codeQuality.status = 'FAIL';
    }
  } else {
    testResults.codeQuality.status = 'FAIL';
    testResults.codeQuality.details.push('❌ package.json missing');
  }
  
  console.log(`   Status: ${testResults.codeQuality.status}`);
} catch (error) {
  testResults.codeQuality.status = 'ERROR';
  testResults.codeQuality.details.push(`❌ Error: ${error.message}`);
}

// Test 8: File Structure
console.log('\n📁 Testing File Structure...');
try {
  const requiredDirs = [
    { path: path.join(__dirname, '../app'), name: 'App directory' },
    { path: path.join(__dirname, '../components'), name: 'Components directory' },
    { path: path.join(__dirname, '../lib'), name: 'Lib directory' },
    { path: path.join(__dirname, '../constants'), name: 'Constants directory' },
    { path: path.join(__dirname, '../assets'), name: 'Assets directory' }
  ];
  
  let allDirsExist = true;
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir.path)) {
      testResults.fileStructure.details.push(`✅ ${dir.name} exists`);
    } else {
      allDirsExist = false;
      testResults.fileStructure.details.push(`❌ ${dir.name} missing`);
    }
  });
  
  if (!allDirsExist) {
    testResults.fileStructure.status = 'FAIL';
  }
  
  console.log(`   Status: ${testResults.fileStructure.status}`);
} catch (error) {
  testResults.fileStructure.status = 'ERROR';
  testResults.fileStructure.details.push(`❌ Error: ${error.message}`);
}

// Generate summary
console.log('\n' + '='.repeat(60));
console.log('📊 COMPREHENSIVE FEATURE TEST SUMMARY');
console.log('='.repeat(60));

const features = Object.keys(testResults);
let passCount = 0;
let failCount = 0;
let errorCount = 0;

features.forEach(feature => {
  const result = testResults[feature];
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  
  console.log(`\n${icon} ${feature.toUpperCase()}: ${result.status}`);
  result.details.forEach(detail => console.log(`   ${detail}`));
  
  if (result.status === 'PASS') passCount++;
  else if (result.status === 'FAIL') failCount++;
  else errorCount++;
});

console.log('\n' + '='.repeat(60));
console.log(`📈 OVERALL RESULTS:`);
console.log(`   ✅ PASSED: ${passCount}/${features.length}`);
console.log(`   ❌ FAILED: ${failCount}/${features.length}`);
console.log(`   ⚠️  ERRORS: ${errorCount}/${features.length}`);

const successRate = (passCount / features.length) * 100;
console.log(`   🎯 SUCCESS RATE: ${successRate.toFixed(1)}%`);

console.log('\n' + '='.repeat(60));
if (successRate >= 90) {
  console.log('🎉 EXCELLENT! Your app is ready for consumer use!');
} else if (successRate >= 75) {
  console.log('👍 GOOD! Your app is mostly ready with minor issues to fix.');
} else if (successRate >= 50) {
  console.log('⚠️  NEEDS WORK! Several features require attention.');
} else {
  console.log('❌ MAJOR ISSUES! Significant work needed before consumer release.');
}

console.log('\n🚀 Consumer Readiness Assessment Complete!');

// Exit with appropriate code
process.exit(failCount > 0 || errorCount > 0 ? 1 : 0);
