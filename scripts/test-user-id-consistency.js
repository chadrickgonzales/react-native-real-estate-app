#!/usr/bin/env node

/**
 * Test script to verify that user IDs are consistent between auth and user collection
 * 
 * This script will:
 * 1. Check if the current user's auth ID matches their user document ID
 * 2. Verify that property creation uses the correct user ID
 */

const { Client, Databases, Query, Account } = require('react-native-appwrite');

// Configuration
const config = {
  endpoint: "https://syd.cloud.appwrite.io/v1",
  projectId: "68bfc67b000f0d9a493c",
  databaseId: "68c114a1000e22edecff",
  propertiesCollectionId: "properties",
  usersCollectionId: "users",
};

const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const databases = new Databases(client);
const account = new Account(client);

async function testUserIDConsistency() {
  try {
    console.log('🔍 Testing user ID consistency...');
    
    // Get current auth account
    const authAccount = await account.get();
    console.log('📱 Auth Account ID:', authAccount.$id);
    console.log('📧 Auth Email:', authAccount.email);
    
    // Get user document from users collection
    const userDocuments = await databases.listDocuments(
      config.databaseId,
      config.usersCollectionId,
      [Query.equal("email", authAccount.email)]
    );
    
    if (userDocuments.documents.length === 0) {
      console.log('❌ No user document found for this email');
      return;
    }
    
    const userDoc = userDocuments.documents[0];
    console.log('👤 User Document ID:', userDoc.$id);
    console.log('👤 User Name:', userDoc.userName);
    
    // Check if IDs match
    const idsMatch = authAccount.$id === userDoc.$id;
    console.log('🔄 IDs Match:', idsMatch ? '✅ Yes' : '❌ No');
    
    if (!idsMatch) {
      console.log('⚠️ WARNING: Auth ID and User Document ID do not match!');
      console.log('   This can cause issues with property ownership.');
      console.log('   Auth ID:', authAccount.$id);
      console.log('   User Doc ID:', userDoc.$id);
    } else {
      console.log('✅ User IDs are consistent!');
    }
    
    // Check recent properties to see what owner IDs are being used
    console.log('\n🏠 Checking recent properties...');
    const recentProperties = await databases.listDocuments(
      config.databaseId,
      config.propertiesCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(5)]
    );
    
    console.log(`📋 Found ${recentProperties.documents.length} recent properties`);
    
    for (const property of recentProperties.documents) {
      console.log(`\n🏡 Property: ${property.name || property.$id}`);
      console.log(`   Owner ID: ${property.ownerId || 'Not set'}`);
      console.log(`   Property Owner ID: ${property.propertyOwnerId || 'Not set'}`);
      console.log(`   Owner Name: ${property.ownerName || 'Not set'}`);
      
      // Check if this property belongs to the current user
      const isOwner = property.ownerId === userDoc.$id || property.propertyOwnerId === userDoc.$id;
      console.log(`   Is Current User Owner: ${isOwner ? '✅ Yes' : '❌ No'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserIDConsistency();
