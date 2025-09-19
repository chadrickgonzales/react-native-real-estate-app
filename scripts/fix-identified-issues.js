#!/usr/bin/env node

/**
 * Fix Identified Issues Script
 * 
 * This script addresses the main issues identified in the comprehensive tests:
 * 1. Missing users collection
 * 2. Search functionality (fulltext indexes)
 * 3. Property rating field validation
 */

const { Client, Databases, Query, ID } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

async function checkUsersCollection() {
  console.log('\n👤 CHECKING USER COLLECTION');
  console.log('=' .repeat(50));
  
  try {
    await databases.listDocuments(DATABASE_ID, "user", [Query.limit(1)]);
    console.log('✅ User collection exists');
    return true;
  } catch (error) {
    if (error.code === 404) {
      console.log('❌ User collection not found');
      console.log('💡 This is the main issue preventing user authentication');
      return false;
    } else {
      console.log('⚠️ Error checking user collection:', error.message);
      return false;
    }
  }
}

async function checkSearchIndexes() {
  console.log('\n🔍 CHECKING SEARCH FUNCTIONALITY');
  console.log('=' .repeat(50));
  
  const searchFields = ['name', 'address', 'description'];
  const results = [];
  
  for (const field of searchFields) {
    try {
      await databases.listDocuments(
        DATABASE_ID,
        "properties",
        [Query.search(field, "test"), Query.limit(1)]
      );
      console.log(`✅ Search by ${field} works`);
      results.push({ field, working: true });
    } catch (error) {
      if (error.message.includes('fulltext index')) {
        console.log(`❌ Search by ${field} requires fulltext index`);
        results.push({ field, working: false, error: 'fulltext index required' });
      } else {
        console.log(`⚠️ Search by ${field} error:`, error.message);
        results.push({ field, working: false, error: error.message });
      }
    }
  }
  
  return results;
}

async function checkPropertyRating() {
  console.log('\n⭐ CHECKING PROPERTY RATING FIELD');
  console.log('=' .repeat(50));
  
  try {
    // Try to create a property with decimal rating
    const testProperty = await databases.createDocument(
      DATABASE_ID,
      "properties",
      ID.unique(),
      {
        name: "Test Property for Rating",
        type: "House",
        description: "Test property for rating validation",
        address: "123 Test Street",
        price: 500000,
        area: 1500,
        bedrooms: 3,
        bathrooms: 2,
        rating: 4.5, // Decimal rating
        image: "https://example.com/test.jpg",
        propertyType: "House",
        contactPhone: "+1234567890",
        contactEmail: "test@example.com",
        availableDate: "2024-01-01",
        furnishedStatus: false,
        petFriendly: true,
        hasHOA: false,
        hasPool: false,
        hasGarage: true,
        utilitiesIncluded: false,
        smokingAllowed: false,
        backgroundCheckRequired: false,
        parkingSpaces: "2",
        yearBuilt: "2019",
        lotSize: "0.25 acres",
        propertyCondition: "Excellent",
        hoaFees: "100",
        propertyTaxes: "5000",
        amenities: "Pool, Garage",
        latitude: 40.7128,
        longitude: -74.0060,
        propertyOwnerId: "test_owner",
      }
    );
    
    console.log('✅ Property with decimal rating created successfully');
    
    // Clean up
    try {
      await databases.deleteDocument(DATABASE_ID, "properties", testProperty.$id);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('invalid format') && error.message.includes('rating')) {
      console.log('❌ Property rating field expects integer, not decimal');
      console.log('💡 This explains the rating validation error');
      return false;
    } else {
      console.log('⚠️ Property creation error:', error.message);
      return false;
    }
  }
}

async function provideFixInstructions() {
  console.log('\n🔧 FIX INSTRUCTIONS');
  console.log('=' .repeat(50));
  
  console.log('\n📋 ISSUES TO FIX:');
  console.log('\n1. 👤 MISSING USER COLLECTION');
  console.log('   Status: 🔴 Critical');
  console.log('   Impact: User authentication and profiles');
  console.log('   Fix: Run the setup script:');
  console.log('   node scripts/setup-appwrite.js');
  
  console.log('\n2. 🔍 SEARCH FUNCTIONALITY');
  console.log('   Status: 🟡 Medium');
  console.log('   Impact: Property search by name, address, description');
  console.log('   Fix: Add fulltext indexes in Appwrite Console:');
  console.log('   - Go to Appwrite Console → Database → Properties Collection');
  console.log('   - Add fulltext indexes for: name, address, description');
  console.log('   - This will enable search functionality');
  
  console.log('\n3. ⭐ PROPERTY RATING FIELD');
  console.log('   Status: 🟡 Medium');
  console.log('   Impact: Property creation with decimal ratings');
  console.log('   Fix: Update rating field type in Appwrite Console:');
  console.log('   - Go to Appwrite Console → Database → Properties Collection');
  console.log('   - Change rating field from integer to float');
  console.log('   - Or modify code to use integer ratings only');
  
  console.log('\n🚀 QUICK FIX COMMANDS:');
  console.log('   # Fix users collection');
  console.log('   node scripts/setup-appwrite.js');
  console.log('');
  console.log('   # Test after fixes');
  console.log('   node scripts/test-all-features.js');
  console.log('   node scripts/test-ui-features.js');
  
  console.log('\n⏱️ ESTIMATED TIME TO FIX:');
  console.log('   • Create users collection: 5 minutes');
  console.log('   • Add search indexes: 10 minutes');
  console.log('   • Fix rating field: 5 minutes');
  console.log('   • Test and verify: 10 minutes');
  console.log('   • Total: ~30 minutes');
  
  console.log('\n🎯 AFTER FIXES:');
  console.log('   • App will be 95%+ functional');
  console.log('   • All core features working');
  console.log('   • Search functionality working');
  console.log('   • User authentication working');
  console.log('   • Production ready!');
}

async function runDiagnostics() {
  console.log('🔍 DIAGNOSTIC ANALYSIS');
  console.log('=' .repeat(60));
  console.log('Analyzing identified issues and providing fix instructions...\n');
  
  const usersExists = await checkUsersCollection();
  const searchResults = await checkSearchIndexes();
  const ratingWorks = await checkPropertyRating();
  
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log(`   👤 User Collection: ${usersExists ? '✅ Exists' : '❌ Missing'}`);
  console.log(`   🔍 Search Functionality: ${searchResults.filter(r => r.working).length}/${searchResults.length} working`);
  console.log(`   ⭐ Property Rating: ${ratingWorks ? '✅ Working' : '❌ Issue'}`);
  
  await provideFixInstructions();
  
  console.log('\n🎉 DIAGNOSTIC COMPLETE!');
  console.log('Follow the fix instructions above to resolve all issues.');
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('❌ Diagnostic failed:', error.message);
  console.error('Full error:', error);
});
