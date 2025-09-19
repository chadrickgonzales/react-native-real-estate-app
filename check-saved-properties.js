#!/usr/bin/env node

/**
 * Check Saved Properties Collection Script
 * 
 * This script checks if the saved_properties collection exists and
 * provides instructions for adding the listingType field.
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

async function checkSavedPropertiesCollection() {
  try {
    console.log('🔍 Checking saved_properties collection...\n');

    // Check if collection exists and get some sample data
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SAVED_PROPERTIES_COLLECTION_ID,
        [Query.limit(5)]
      );

      console.log('✅ saved_properties collection exists');
      console.log(`📊 Total documents: ${response.total}`);
      console.log(`📄 Sample documents: ${response.documents.length}`);

      if (response.documents.length > 0) {
        console.log('\n📋 Sample document structure:');
        const sampleDoc = response.documents[0];
        console.log('Available fields:', Object.keys(sampleDoc));
        
        // Check if listingType field exists
        if (sampleDoc.listingType !== undefined) {
          console.log('✅ listingType field already exists!');
          console.log(`Sample listingType value: ${sampleDoc.listingType}`);
        } else {
          console.log('❌ listingType field is missing');
          console.log('\n📋 Next Steps:');
          console.log('1. Go to your Appwrite Console: https://cloud.appwrite.io');
          console.log('2. Navigate to your project and database');
          console.log('3. Open the saved_properties collection');
          console.log('4. Go to Attributes tab');
          console.log('5. Add a new attribute:');
          console.log('   - Key: listingType');
          console.log('   - Type: Enum');
          console.log('   - Elements: sale, rent');
          console.log('   - Required: Yes');
          console.log('   - Default: sale');
          console.log('\n📖 For detailed instructions, see: update-saved-properties-manual.md');
        }
      } else {
        console.log('📝 Collection is empty - no existing data to migrate');
        console.log('✅ You can proceed with the updated setup script');
      }

    } catch (error) {
      if (error.code === 404) {
        console.log('❌ saved_properties collection does not exist');
        console.log('\n📋 Next Steps:');
        console.log('1. Run: node setup-saved-collections.js');
        console.log('2. This will create the collection with the listingType field included');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Error checking collection:', error.message);
    console.error('Full error:', error);
  }
}

// Run the check
checkSavedPropertiesCollection();
