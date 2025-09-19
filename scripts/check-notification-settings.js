#!/usr/bin/env node

/**
 * Check Notification Settings Schema
 * 
 * This script checks the notification_settings collection schema
 * and provides information about what fields are available.
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

async function checkNotificationSettings() {
  try {
    console.log('🔍 Checking notification_settings collection schema...\n');

    // Check if collection exists and get sample data
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        "notification_settings",
        [Query.limit(1)]
      );

      console.log('✅ notification_settings collection exists');
      console.log(`📊 Total documents: ${response.total}`);

      if (response.documents.length > 0) {
        console.log('\n📋 Sample document structure:');
        const sampleDoc = response.documents[0];
        console.log('Available fields:', Object.keys(sampleDoc));
        
        // Check for specific notification fields
        const expectedFields = [
          'propertyNotifications',
          'bookingNotifications', 
          'communicationNotifications',
          'systemNotifications',
          'locationNotifications',
          'engagementNotifications',
          'emailNotifications',
          'pushNotifications'
        ];

        console.log('\n📋 Checking expected notification fields:');
        expectedFields.forEach(field => {
          if (sampleDoc[field] !== undefined) {
            console.log(`✅ ${field}: ${sampleDoc[field]}`);
          } else {
            console.log(`❌ ${field}: Missing`);
          }
        });

      } else {
        console.log('📝 Collection is empty - no existing data to check');
        console.log('\n💡 The collection exists but may need the proper schema attributes');
        console.log('📖 Check the setup-saved-collections.js file to see what attributes should be created');
      }

    } catch (error) {
      if (error.code === 404) {
        console.log('❌ notification_settings collection does not exist');
        console.log('\n📋 Next Steps:');
        console.log('1. Run: node setup-saved-collections.js');
        console.log('2. This will create the collection with the proper schema');
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
checkNotificationSettings();
