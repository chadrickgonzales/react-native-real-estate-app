#!/usr/bin/env node

/**
 * Migration script to add propertyOwnerId to existing properties
 * 
 * This script will:
 * 1. Get all existing properties
 * 2. Set propertyOwnerId to a default value for existing properties
 * 3. Update the properties in the database
 */

const { Client, Databases, Query } = require('react-native-appwrite');

// You'll need to replace these with your actual values
const config = {
  endpoint: "https://syd.cloud.appwrite.io/v1",
  projectId: "68bfc67b000f0d9a493c",
  databaseId: "68c114a1000e22edecff",
  propertiesCollectionId: "properties",
};

const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const databases = new Databases(client);

async function migratePropertyOwners() {
  try {
    console.log('🔄 Starting property owner migration...');
    
    // Get all properties
    const properties = await databases.listDocuments(
      config.databaseId,
      config.propertiesCollectionId,
      [Query.limit(100)] // Adjust limit as needed
    );
    
    console.log(`📋 Found ${properties.documents.length} properties to migrate`);
    
    // Get the first user from the users collection to use as default owner
    let defaultOwnerId = null;
    try {
      const users = await databases.listDocuments(
        config.databaseId,
        "users", // Assuming users collection is named "users"
        [Query.limit(1)]
      );
      
      if (users.documents.length > 0) {
        defaultOwnerId = users.documents[0].$id;
        console.log(`👤 Using user as default owner: ${users.documents[0].userName || users.documents[0].$id}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch users, will use property owner info instead');
    }
    
    for (const property of properties.documents) {
      try {
        // Only update if property doesn't have a valid ownerId
        if (!property.ownerId || property.ownerId.startsWith('owner_')) {
          const updateData = {};
          
          if (defaultOwnerId) {
            updateData.propertyOwnerId = defaultOwnerId;
            updateData.ownerId = defaultOwnerId;
          } else {
            // If no user found, keep the existing owner info but mark as seed data
            updateData.propertyOwnerId = property.ownerId || `owner_${property.$id}`;
            updateData.ownerId = property.ownerId || `owner_${property.$id}`;
          }
          
          await databases.updateDocument(
            config.databaseId,
            config.propertiesCollectionId,
            property.$id,
            updateData
          );
          console.log(`✅ Updated property: ${property.name || property.$id}`);
        } else {
          console.log(`⏭️ Skipping property with valid owner: ${property.name || property.$id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to update property ${property.$id}:`, error.message);
      }
    }
    
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migratePropertyOwners();
