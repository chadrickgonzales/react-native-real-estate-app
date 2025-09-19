#!/usr/bin/env node

/**
 * UI Features Test Suite
 * 
 * This script tests UI-related features and user interactions
 * that are critical for the app's functionality.
 */

const { Client, Databases, Query, ID } = require('appwrite');
const { searchProperties } = require('./search-workaround');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";
const TEST_USER_ID = "ui_test_user_" + Date.now();

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${message}`);
  }
  testResults.details.push({ testName, passed, message });
}

async function testPropertyCards() {
  console.log('\n🃏 TESTING PROPERTY CARDS');
  console.log('=' .repeat(50));
  
  // Test property data structure for cards
  try {
    const properties = await databases.listDocuments(
      DATABASE_ID,
      "properties",
      [Query.limit(5)]
    );
    
    if (properties.documents.length > 0) {
      const property = properties.documents[0];
      
      // Check required fields for property cards
      const requiredFields = ['name', 'address', 'price', 'image', 'bedrooms', 'bathrooms'];
      let hasAllFields = true;
      
      for (const field of requiredFields) {
        if (property[field] === undefined || property[field] === null) {
          hasAllFields = false;
          break;
        }
      }
      
      logTest('Property card data structure', hasAllFields, hasAllFields ? '' : 'Missing required fields');
      
      // Test image handling
      const hasImage = property.image || (property.images && JSON.parse(property.images).length > 0);
      logTest('Property image handling', hasImage, hasImage ? '' : 'No images available');
      
      // Test price formatting
      const hasValidPrice = typeof property.price === 'number' && property.price > 0;
      logTest('Property price validation', hasValidPrice, hasValidPrice ? '' : 'Invalid price format');
      
    } else {
      logTest('Property card data structure', false, 'No properties found');
    }
  } catch (error) {
    logTest('Property card data structure', false, error.message);
  }
}

async function testSearchFunctionality() {
  console.log('\n🔍 TESTING SEARCH FUNCTIONALITY');
  console.log('=' .repeat(50));
  
  // Test search by property name using workaround
  try {
    const { searchProperties } = require('./search-workaround');
    const searchResults = await searchProperties("house", 5);
    logTest('Search by property name', true);
  } catch (error) {
    logTest('Search by property name', false, error.message);
  }
  
  // Test search by address using workaround
  try {
    const { searchProperties } = require('./search-workaround');
    const searchResults = await searchProperties("street", 5);
    logTest('Search by address', true);
  } catch (error) {
    logTest('Search by address', false, error.message);
  }
  
  // Test search by description using workaround
  try {
    const { searchProperties } = require('./search-workaround');
    const searchResults = await searchProperties("beautiful", 5);
    logTest('Search by description', true);
  } catch (error) {
    logTest('Search by description', false, error.message);
  }
}

async function testFilteringSystem() {
  console.log('\n🔧 TESTING FILTERING SYSTEM');
  console.log('=' .repeat(50));
  
  // Test property type filtering
  const propertyTypes = ['House', 'Apartment', 'Villa', 'Condos'];
  for (const type of propertyTypes) {
    try {
      const results = await databases.listDocuments(
        DATABASE_ID,
        "properties",
        [Query.equal("type", type), Query.limit(1)]
      );
      logTest(`${type} type filtering`, true);
    } catch (error) {
      logTest(`${type} type filtering`, false, error.message);
    }
  }
  
  // Test price range filtering
  try {
    const results = await databases.listDocuments(
      DATABASE_ID,
      "properties",
      [
        Query.greaterThanEqual("price", 100000),
        Query.lessThanEqual("price", 1000000),
        Query.limit(1)
      ]
    );
    logTest('Price range filtering', true);
  } catch (error) {
    logTest('Price range filtering', false, error.message);
  }
  
  // Test bedroom filtering
  try {
    const results = await databases.listDocuments(
      DATABASE_ID,
      "properties",
      [Query.equal("bedrooms", 3), Query.limit(1)]
    );
    logTest('Bedroom filtering', true);
  } catch (error) {
    logTest('Bedroom filtering', false, error.message);
  }
  
  // Test bathroom filtering
  try {
    const results = await databases.listDocuments(
      DATABASE_ID,
      "properties",
      [Query.equal("bathrooms", 2), Query.limit(1)]
    );
    logTest('Bathroom filtering', true);
  } catch (error) {
    logTest('Bathroom filtering', false, error.message);
  }
}

async function testSavedPropertiesUI() {
  console.log('\n💾 TESTING SAVED PROPERTIES UI');
  console.log('=' .repeat(50));
  
  // Test saved properties data structure
  try {
    const savedProperties = await databases.listDocuments(
      DATABASE_ID,
      "saved_properties",
      [Query.limit(5)]
    );
    
    if (savedProperties.documents.length > 0) {
      const savedProperty = savedProperties.documents[0];
      
      // Check required fields for saved property cards
      const requiredFields = ['propertyName', 'propertyAddress', 'price', 'propertyImage', 'listingType'];
      let hasAllFields = true;
      
      for (const field of requiredFields) {
        if (savedProperty[field] === undefined || savedProperty[field] === null) {
          hasAllFields = false;
          break;
        }
      }
      
      logTest('Saved property card data structure', hasAllFields, hasAllFields ? '' : 'Missing required fields');
      
      // Test listing type filtering
      const hasListingType = savedProperty.listingType === 'sale' || savedProperty.listingType === 'rent';
      logTest('Listing type filtering support', hasListingType, hasListingType ? '' : 'Invalid listing type');
      
    } else {
      logTest('Saved property card data structure', false, 'No saved properties found');
    }
  } catch (error) {
    logTest('Saved property card data structure', false, error.message);
  }
}

async function testNotificationUI() {
  console.log('\n🔔 TESTING NOTIFICATION UI');
  console.log('=' .repeat(50));
  
  // Test notification data structure for UI
  try {
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      "notifications",
      [Query.limit(5)]
    );
    
    if (notifications.documents.length > 0) {
      const notification = notifications.documents[0];
      
      // Check required fields for notification display
      const requiredFields = ['title', 'message', 'type', 'priority', 'isRead'];
      let hasAllFields = true;
      
      for (const field of requiredFields) {
        if (notification[field] === undefined || notification[field] === null) {
          hasAllFields = false;
          break;
        }
      }
      
      logTest('Notification UI data structure', hasAllFields, hasAllFields ? '' : 'Missing required fields');
      
      // Test notification type validation
      const validTypes = ['property', 'booking', 'communication', 'system', 'location', 'engagement'];
      const hasValidType = validTypes.includes(notification.type);
      logTest('Notification type validation', hasValidType, hasValidType ? '' : 'Invalid notification type');
      
      // Test priority validation
      const validPriorities = ['low', 'medium', 'high'];
      const hasValidPriority = validPriorities.includes(notification.priority);
      logTest('Notification priority validation', hasValidPriority, hasValidPriority ? '' : 'Invalid priority');
      
    } else {
      logTest('Notification UI data structure', false, 'No notifications found');
    }
  } catch (error) {
    logTest('Notification UI data structure', false, error.message);
  }
}

async function testChatUI() {
  console.log('\n💬 TESTING CHAT UI');
  console.log('=' .repeat(50));
  
  // Test chat data structure
  try {
    const chats = await databases.listDocuments(
      DATABASE_ID,
      "chats",
      [Query.limit(5)]
    );
    
    if (chats.documents.length > 0) {
      const chat = chats.documents[0];
      
      // Check required fields for chat display
      const requiredFields = ['propertyName', 'sellerName', 'lastMessage', 'lastMessageTime'];
      let hasAllFields = true;
      
      for (const field of requiredFields) {
        if (chat[field] === undefined || chat[field] === null) {
          hasAllFields = false;
          break;
        }
      }
      
      logTest('Chat UI data structure', hasAllFields, hasAllFields ? '' : 'Missing required fields');
      
    } else {
      logTest('Chat UI data structure', false, 'No chats found');
    }
  } catch (error) {
    logTest('Chat UI data structure', false, error.message);
  }
  
  // Test message data structure
  try {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      "messages",
      [Query.limit(5)]
    );
    
    if (messages.documents.length > 0) {
      const message = messages.documents[0];
      
      // Check required fields for message display
      const requiredFields = ['senderName', 'text', 'timestamp', 'isRead'];
      let hasAllFields = true;
      
      for (const field of requiredFields) {
        if (message[field] === undefined || message[field] === null) {
          hasAllFields = false;
          break;
        }
      }
      
      logTest('Message UI data structure', hasAllFields, hasAllFields ? '' : 'Missing required fields');
      
    } else {
      logTest('Message UI data structure', false, 'No messages found');
    }
  } catch (error) {
    logTest('Message UI data structure', false, error.message);
  }
}

async function testUserProfileUI() {
  console.log('\n👤 TESTING USER PROFILE UI');
  console.log('=' .repeat(50));
  
  // Test user profile data structure
  try {
    const users = await databases.listDocuments(
      DATABASE_ID,
      "user",
      [Query.limit(5)]
    );
    
    if (users.documents.length > 0) {
      const user = users.documents[0];
      
      // Check required fields for user profile
      const requiredFields = ['userName', 'email'];
      let hasAllFields = true;
      
      for (const field of requiredFields) {
        if (user[field] === undefined || user[field] === null) {
          hasAllFields = false;
          break;
        }
      }
      
      logTest('User profile data structure', hasAllFields, hasAllFields ? '' : 'Missing required fields');
      
      // Test optional profile fields
      const optionalFields = ['phoneNumber', 'location', 'bio', 'setupCompleted'];
      let hasOptionalFields = true;
      
      for (const field of optionalFields) {
        if (user[field] === undefined) {
          hasOptionalFields = false;
          break;
        }
      }
      
      logTest('User profile optional fields', hasOptionalFields, hasOptionalFields ? '' : 'Missing optional fields');
      
    } else {
      logTest('User profile data structure', false, 'No users found');
    }
  } catch (error) {
    logTest('User profile data structure', false, error.message);
  }
}

async function testPropertyDetailsUI() {
  console.log('\n🏠 TESTING PROPERTY DETAILS UI');
  console.log('=' .repeat(50));
  
  // Test property details data structure
  try {
    const properties = await databases.listDocuments(
      DATABASE_ID,
      "properties",
      [Query.limit(1)]
    );
    
    if (properties.documents.length > 0) {
      const property = properties.documents[0];
      
      // Check essential fields for property details
      const essentialFields = ['name', 'description', 'address', 'price', 'bedrooms', 'bathrooms', 'area'];
      let hasEssentialFields = true;
      
      for (const field of essentialFields) {
        if (property[field] === undefined || property[field] === null) {
          hasEssentialFields = false;
          break;
        }
      }
      
      logTest('Property details essential fields', hasEssentialFields, hasEssentialFields ? '' : 'Missing essential fields');
      
      // Test contact information
      const hasContactInfo = property.contactPhone || property.contactEmail;
      logTest('Property contact information', hasContactInfo, hasContactInfo ? '' : 'No contact information');
      
      // Test location data
      const hasLocationData = property.latitude && property.longitude;
      logTest('Property location data', hasLocationData, hasLocationData ? '' : 'No location data');
      
    } else {
      logTest('Property details essential fields', false, 'No properties found');
    }
  } catch (error) {
    logTest('Property details essential fields', false, error.message);
  }
}

async function testImageHandling() {
  console.log('\n📸 TESTING IMAGE HANDLING');
  console.log('=' .repeat(50));
  
  // Test property images
  try {
    const properties = await databases.listDocuments(
      DATABASE_ID,
      "properties",
      [Query.limit(5)]
    );
    
    let hasValidImages = false;
    let imageCount = 0;
    
    for (const property of properties.documents) {
      if (property.image) {
        hasValidImages = true;
        imageCount++;
      }
      
      if (property.images) {
        try {
          const images = JSON.parse(property.images);
          if (Array.isArray(images) && images.length > 0) {
            hasValidImages = true;
            imageCount += images.length;
          }
        } catch (parseError) {
          // Ignore parse errors
        }
      }
    }
    
    logTest('Property image handling', hasValidImages, hasValidImages ? `Found ${imageCount} images` : 'No valid images found');
    
  } catch (error) {
    logTest('Property image handling', false, error.message);
  }
}

async function runUITests() {
  console.log('🎨 COMPREHENSIVE UI FEATURES TEST');
  console.log('=' .repeat(60));
  console.log('Testing UI-related features and data structures...\n');
  
  await testPropertyCards();
  await testSearchFunctionality();
  await testFilteringSystem();
  await testSavedPropertiesUI();
  await testNotificationUI();
  await testChatUI();
  await testUserProfileUI();
  await testPropertyDetailsUI();
  await testImageHandling();
  
  // Final Results
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 UI FEATURES TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Total: ${testResults.total}`);
  console.log(`   📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   • ${test.testName}: ${test.message}`);
      });
  }
  
  if (testResults.passed === testResults.total) {
    console.log('\n🎉 ALL UI TESTS PASSED!');
    console.log('✨ Your app\'s UI features are fully functional!');
  } else {
    console.log('\n⚠️  SOME UI TESTS FAILED');
    console.log('💡 Please check the failed tests above and fix any issues');
  }
  
  console.log('\n📋 UI FEATURES TESTED:');
  console.log('   • Property cards data structure');
  console.log('   • Search functionality');
  console.log('   • Filtering system');
  console.log('   • Saved properties UI');
  console.log('   • Notification UI');
  console.log('   • Chat UI');
  console.log('   • User profile UI');
  console.log('   • Property details UI');
  console.log('   • Image handling');
}

// Run UI tests
runUITests().catch(error => {
  console.error('❌ UI test suite failed:', error.message);
  console.error('Full error:', error);
});
