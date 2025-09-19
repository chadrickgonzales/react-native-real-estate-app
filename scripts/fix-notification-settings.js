#!/usr/bin/env node

/**
 * Fix Notification Settings Schema
 * 
 * This script adds the missing attributes to the notification_settings collection
 * to match the expected schema from the appwrite.ts file.
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

async function fixNotificationSettings() {
  try {
    console.log('🔧 Fixing notification_settings collection schema...\n');

    // Check if collection exists
    console.log('📋 Step 1: Checking if notification_settings collection exists...');
    try {
      await databases.listDocuments(DATABASE_ID, "notification_settings", [Query.limit(1)]);
      console.log('✅ notification_settings collection exists');
    } catch (error) {
      if (error.code === 404) {
        console.log('❌ notification_settings collection does not exist');
        console.log('💡 Run: node setup-saved-collections.js first');
        return;
      }
      throw error;
    }

    // List of attributes to add
    const attributesToAdd = [
      { key: 'propertyNotifications', type: 'boolean', required: true },
      { key: 'bookingNotifications', type: 'boolean', required: true },
      { key: 'communicationNotifications', type: 'boolean', required: true },
      { key: 'systemNotifications', type: 'boolean', required: true },
      { key: 'locationNotifications', type: 'boolean', required: true },
      { key: 'engagementNotifications', type: 'boolean', required: true },
      { key: 'emailNotifications', type: 'boolean', required: true },
      { key: 'pushNotifications', type: 'boolean', required: true }
    ];

    console.log('\n📋 Step 2: Adding missing attributes...');
    
    for (const attr of attributesToAdd) {
      try {
        console.log(`   Adding ${attr.key} (${attr.type})...`);
        
        if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            "notification_settings",
            attr.key,
            attr.required,
            false // not array
          );
        }
        
        console.log(`   ✅ ${attr.key} added successfully`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`   ℹ️ ${attr.key} already exists`);
        } else {
          console.error(`   ❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }

    console.log('\n📋 Step 3: Testing the fixed schema...');
    try {
      // Try to create a test document with all the attributes
      const testDoc = await databases.createDocument(
        DATABASE_ID,
        "notification_settings",
        "test_settings_123",
        {
          userId: "test_user_123",
          propertyNotifications: true,
          bookingNotifications: true,
          communicationNotifications: true,
          systemNotifications: true,
          locationNotifications: true,
          engagementNotifications: true,
          emailNotifications: true,
          pushNotifications: true,
        }
      );
      console.log('✅ Test document created successfully');
      console.log(`📄 Document ID: ${testDoc.$id}`);
      
      // Clean up test document
      try {
        await databases.deleteDocument(DATABASE_ID, "notification_settings", "test_settings_123");
        console.log('🧹 Test document cleaned up');
      } catch (cleanupError) {
        console.log('⚠️ Could not clean up test document (this is okay)');
      }
      
    } catch (error) {
      console.error('❌ Error testing schema:', error.message);
      console.log('\n💡 The schema may still need manual adjustment in the Appwrite Console');
    }

    console.log('\n🎉 Notification settings schema fix completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the notification system again: node test-notifications.js');
    console.log('2. Check the Appwrite Console to verify all attributes are present');
    console.log('3. The notification system should now work properly');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the fix
fixNotificationSettings();
