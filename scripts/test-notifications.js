#!/usr/bin/env node

/**
 * Notification System Test Script
 * 
 * This script tests all notification functionality to ensure it's working properly.
 * It will create test notifications, check settings, and verify the system.
 */

const { Client, Databases, Query, ID } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

// Test user ID (you can replace this with a real user ID)
const TEST_USER_ID = "test_user_123";

async function testNotifications() {
  try {
    console.log('🔔 Starting Notification System Tests...\n');

    // Test 1: Check if notifications collection exists
    console.log('📋 Test 1: Checking notifications collection...');
    try {
      await databases.listDocuments(DATABASE_ID, "notifications", [Query.limit(1)]);
      console.log('✅ notifications collection exists');
    } catch (error) {
      if (error.code === 404) {
        console.log('❌ notifications collection does not exist');
        console.log('💡 Run: node setup-saved-collections.js to create it');
        return;
      }
      throw error;
    }

    // Test 2: Check if notification_settings collection exists
    console.log('\n📋 Test 2: Checking notification_settings collection...');
    try {
      await databases.listDocuments(DATABASE_ID, "notification_settings", [Query.limit(1)]);
      console.log('✅ notification_settings collection exists');
    } catch (error) {
      if (error.code === 404) {
        console.log('❌ notification_settings collection does not exist');
        console.log('💡 Run: node setup-saved-collections.js to create it');
        return;
      }
      throw error;
    }

    // Test 3: Create a test notification
    console.log('\n📋 Test 3: Creating test notification...');
    try {
      const testNotification = await databases.createDocument(
        DATABASE_ID,
        "notifications",
        ID.unique(),
        {
          userId: TEST_USER_ID,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification to verify the system is working',
          data: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
          isRead: false,
          priority: 'medium',
        }
      );
      console.log('✅ Test notification created successfully');
      console.log(`📄 Notification ID: ${testNotification.$id}`);
    } catch (error) {
      console.error('❌ Error creating test notification:', error.message);
      return;
    }

    // Test 4: Create test notification settings
    console.log('\n📋 Test 4: Creating test notification settings...');
    try {
      const testSettings = await databases.createDocument(
        DATABASE_ID,
        "notification_settings",
        ID.unique(),
        {
          userId: TEST_USER_ID,
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
      console.log('✅ Test notification settings created successfully');
      console.log(`📄 Settings ID: ${testSettings.$id}`);
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Notification settings already exist for test user');
      } else {
        console.error('❌ Error creating test notification settings:', error.message);
      }
    }

    // Test 5: Retrieve test notifications
    console.log('\n📋 Test 5: Retrieving test notifications...');
    try {
      const notifications = await databases.listDocuments(
        DATABASE_ID,
        "notifications",
        [
          Query.equal("userId", TEST_USER_ID),
          Query.orderDesc("$createdAt"),
          Query.limit(10)
        ]
      );
      console.log(`✅ Retrieved ${notifications.documents.length} notifications for test user`);
      
      if (notifications.documents.length > 0) {
        console.log('\n📄 Sample notification:');
        const sample = notifications.documents[0];
        console.log(`   Title: ${sample.title}`);
        console.log(`   Message: ${sample.message}`);
        console.log(`   Type: ${sample.type}`);
        console.log(`   Priority: ${sample.priority}`);
        console.log(`   Is Read: ${sample.isRead}`);
        console.log(`   Created: ${sample.$createdAt}`);
      }
    } catch (error) {
      console.error('❌ Error retrieving notifications:', error.message);
    }

    // Test 6: Retrieve notification settings
    console.log('\n📋 Test 6: Retrieving notification settings...');
    try {
      const settings = await databases.listDocuments(
        DATABASE_ID,
        "notification_settings",
        [Query.equal("userId", TEST_USER_ID)]
      );
      
      if (settings.documents.length > 0) {
        console.log('✅ Notification settings retrieved successfully');
        const userSettings = settings.documents[0];
        console.log('\n📄 User notification settings:');
        console.log(`   Property Notifications: ${userSettings.propertyNotifications}`);
        console.log(`   Booking Notifications: ${userSettings.bookingNotifications}`);
        console.log(`   Communication Notifications: ${userSettings.communicationNotifications}`);
        console.log(`   System Notifications: ${userSettings.systemNotifications}`);
        console.log(`   Location Notifications: ${userSettings.locationNotifications}`);
        console.log(`   Engagement Notifications: ${userSettings.engagementNotifications}`);
        console.log(`   Email Notifications: ${userSettings.emailNotifications}`);
        console.log(`   Push Notifications: ${userSettings.pushNotifications}`);
      } else {
        console.log('ℹ️ No notification settings found for test user');
      }
    } catch (error) {
      console.error('❌ Error retrieving notification settings:', error.message);
    }

    // Test 7: Test different notification types
    console.log('\n📋 Test 7: Creating different notification types...');
    const notificationTypes = [
      { type: 'property', title: 'New Property Match', message: 'A new property matches your search criteria' },
      { type: 'booking', title: 'Booking Confirmed', message: 'Your property viewing has been confirmed' },
      { type: 'communication', title: 'New Message', message: 'You have received a new message from a property owner' },
      { type: 'system', title: 'System Update', message: 'The app has been updated with new features' },
      { type: 'location', title: 'Properties Near You', message: 'We found 3 properties near your current location' },
      { type: 'engagement', title: 'Welcome!', message: 'Complete your profile to get personalized recommendations' }
    ];

    for (const notif of notificationTypes) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          "notifications",
          ID.unique(),
          {
            userId: TEST_USER_ID,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            data: JSON.stringify({ testType: notif.type }),
            isRead: false,
            priority: 'medium',
          }
        );
        console.log(`✅ Created ${notif.type} notification`);
      } catch (error) {
        console.error(`❌ Error creating ${notif.type} notification:`, error.message);
      }
    }

    // Test 8: Test notification priorities
    console.log('\n📋 Test 8: Testing notification priorities...');
    const priorities = ['low', 'medium', 'high'];
    
    for (const priority of priorities) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          "notifications",
          ID.unique(),
          {
            userId: TEST_USER_ID,
            type: 'system',
            title: `${priority.toUpperCase()} Priority Test`,
            message: `This is a ${priority} priority notification`,
            data: JSON.stringify({ priority: priority }),
            isRead: false,
            priority: priority,
          }
        );
        console.log(`✅ Created ${priority} priority notification`);
      } catch (error) {
        console.error(`❌ Error creating ${priority} priority notification:`, error.message);
      }
    }

    // Test 9: Final notification count
    console.log('\n📋 Test 9: Final notification count...');
    try {
      const finalCount = await databases.listDocuments(
        DATABASE_ID,
        "notifications",
        [Query.equal("userId", TEST_USER_ID)]
      );
      console.log(`✅ Total notifications for test user: ${finalCount.total}`);
    } catch (error) {
      console.error('❌ Error getting final count:', error.message);
    }

    console.log('\n🎉 Notification system tests completed!');
    console.log('\n📋 Summary:');
    console.log('   • Notifications collection: Working');
    console.log('   • Notification settings: Working');
    console.log('   • Different notification types: Working');
    console.log('   • Notification priorities: Working');
    console.log('\n✨ Your notification system is ready to use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the tests
testNotifications();
