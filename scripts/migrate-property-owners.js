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
    
    // Update each property with a default owner ID
    // For existing properties, we'll use a default owner ID
    // In a real app, you'd need to determine the actual owner
    const defaultOwnerId = "68c244b4001a2b84bf26"; // Your user ID
    
    for (const property of properties.documents) {
      try {
        await databases.updateDocument(
          config.databaseId,
          config.propertiesCollectionId,
          property.$id,
          {
            propertyOwnerId: defaultOwnerId
          }
        );
        console.log(`✅ Updated property: ${property.name || property.$id}`);
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
