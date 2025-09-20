#!/usr/bin/env node

/**
 * Script to fix properties with hardcoded owner IDs
 * 
 * This script will:
 * 1. Find properties with hardcoded owner IDs
 * 2. Update them to use proper user IDs or mark them as seed data
 */

const { Client, Databases, Query } = require('react-native-appwrite');

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

async function fixHardcodedOwners() {
  try {
    console.log('🔍 Finding properties with hardcoded owner IDs...');
    
    // Get all properties
    const properties = await databases.listDocuments(
      config.databaseId,
      config.propertiesCollectionId,
      [Query.limit(100)]
    );
    
    console.log(`📋 Found ${properties.documents.length} properties to check`);
    
    // Find properties with hardcoded IDs
    const hardcodedProperties = properties.documents.filter(property => {
      const ownerId = property.ownerId || property.propertyOwnerId;
      return ownerId && (
        ownerId.startsWith('owner_') || 
        ownerId === '68c244b4001a2b84bf26' ||
        ownerId === '68c244b400018ee6e518' ||
        !ownerId.match(/^[a-zA-Z0-9]{20,}$/) // Not a valid Appwrite ID format
      );
    });
    
    console.log(`🎯 Found ${hardcodedProperties.length} properties with hardcoded owner IDs`);
    
    if (hardcodedProperties.length === 0) {
      console.log('✅ No properties with hardcoded owner IDs found!');
      return;
    }
    
    // Get the first real user to use as default
    let defaultUserId = null;
    try {
      const users = await databases.listDocuments(
        config.databaseId,
        config.usersCollectionId,
        [Query.limit(1)]
      );
      
      if (users.documents.length > 0) {
        defaultUserId = users.documents[0].$id;
        console.log(`👤 Using user as default owner: ${users.documents[0].userName || users.documents[0].$id}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch users, will mark properties as seed data');
    }
    
    // Update each property
    for (const property of hardcodedProperties) {
      try {
        const updateData = {};
        
        if (defaultUserId) {
          // Use the real user ID
          updateData.propertyOwnerId = defaultUserId;
          updateData.ownerId = defaultUserId;
          updateData.ownerName = property.ownerName || "Property Owner";
          console.log(`✅ Updated property ${property.name || property.$id} to use real user ID`);
        } else {
          // Mark as seed data
          updateData.propertyOwnerId = `seed_owner_${property.$id}`;
          updateData.ownerId = `seed_owner_${property.$id}`;
          updateData.ownerName = property.ownerName || "Property Owner";
          console.log(`✅ Updated property ${property.name || property.$id} to use seed data marker`);
        }
        
        await databases.updateDocument(
          config.databaseId,
          config.propertiesCollectionId,
          property.$id,
          updateData
        );
        
      } catch (error) {
        console.error(`❌ Failed to update property ${property.$id}:`, error.message);
      }
    }
    
    console.log('🎉 Hardcoded owner ID fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixHardcodedOwners();
