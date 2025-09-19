#!/usr/bin/env node

/**
 * Database Migration Script: Add listingType field to saved_properties collection
 * 
 * This script adds the listingType field to the existing saved_properties collection
 * and sets default values for existing records.
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";
const SAVED_PROPERTIES_COLLECTION_ID = "saved_properties";

async function migrateSavedPropertiesListingType() {
  try {
    console.log('🔄 Starting migration: Add listingType field to saved_properties collection...\n');

    // Step 1: Check if collection exists by trying to list documents
    console.log('📋 Step 1: Checking if saved_properties collection exists...');
    try {
      await databases.listDocuments(DATABASE_ID, SAVED_PROPERTIES_COLLECTION_ID, [Query.limit(1)]);
      console.log('✅ saved_properties collection exists');
    } catch (error) {
      if (error.code === 404) {
        console.log('❌ saved_properties collection does not exist. Please run setup-saved-collections.js first.');
        return;
      }
      throw error;
    }

    // Step 2: Add listingType attribute to the collection
    console.log('\n📋 Step 2: Adding listingType attribute to saved_properties collection...');
    try {
      await databases.createEnumAttribute(
        DATABASE_ID,
        SAVED_PROPERTIES_COLLECTION_ID,
        'listingType',
        ['sale', 'rent'], // enum values
        true, // required
        false // array
      );
      console.log('✅ listingType attribute added successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ listingType attribute already exists');
      } else {
        console.error('❌ Error adding listingType attribute:', error.message);
        throw error;
      }
    }

    // Step 3: Get all existing saved properties
    console.log('\n📋 Step 3: Updating existing saved properties with default listingType...');
    let offset = 0;
    const limit = 25;
    let totalUpdated = 0;

    while (true) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          SAVED_PROPERTIES_COLLECTION_ID,
          [
            Query.limit(limit),
            Query.offset(offset)
          ]
        );

        if (response.documents.length === 0) {
          break;
        }

        console.log(`📄 Processing batch ${Math.floor(offset / limit) + 1} (${response.documents.length} documents)...`);

        // Update each document with default listingType
        const updatePromises = response.documents.map(async (doc) => {
          try {
            // Check if listingType already exists
            if (doc.listingType) {
              console.log(`  ⏭️ Document ${doc.$id} already has listingType: ${doc.listingType}`);
              return;
            }

            // Set default listingType to 'sale' for existing records
            await databases.updateDocument(
              DATABASE_ID,
              SAVED_PROPERTIES_COLLECTION_ID,
              doc.$id,
              {
                listingType: 'sale' // Default to 'sale' for existing records
              }
            );
            
            console.log(`  ✅ Updated document ${doc.$id} with listingType: sale`);
            totalUpdated++;
          } catch (updateError) {
            console.error(`  ❌ Error updating document ${doc.$id}:`, updateError.message);
          }
        });

        await Promise.all(updatePromises);
        offset += limit;
      } catch (error) {
        console.error('❌ Error fetching documents:', error.message);
        break;
      }
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total documents updated: ${totalUpdated}`);
    console.log('\n✨ The saved_properties collection now supports listingType filtering!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server');
    console.log('2. Test the filter pills in the Saved Properties section');
    console.log('3. New saved properties will automatically include the listingType field');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the migration
migrateSavedPropertiesListingType();
