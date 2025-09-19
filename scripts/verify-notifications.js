#!/usr/bin/env node

/**
 * Verify Notifications System
 * 
 * Run this script after manually fixing the notification_settings schema
 * to verify that everything is working correctly.
 */

const { Client, Databases, Query, ID } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";
const TEST_USER_ID = "verification_user_" + Date.now();

async function verifyNotifications() {
  try {
    console.log('🔍 Verifying Notification System...\n');

    // Test 1: Verify notification settings can be created
    console.log('📋 Test 1: Creating notification settings...');
    try {
      const settings = await databases.createDocument(
        DATABASE_ID,
        "notification_settings",
        ID.unique(),
        {
          userId: TEST_USER_ID,
          propertyNotifications: true,
          bookingNotifications: false,
          communicationNotifications: true,
          systemNotifications: true,
          locationNotifications: false,
          engagementNotifications: true,
          emailNotifications: true,
          pushNotifications: false,
        }
      );
      console.log('✅ Notification settings created successfully!');
      console.log(`📄 Settings ID: ${settings.$id}`);
      
      // Clean up
      await databases.deleteDocument(DATABASE_ID, "notification_settings", settings.$id);
      console.log('🧹 Test settings cleaned up');
      
    } catch (error) {
      console.log('❌ Notification settings test failed:', error.message);
      console.log('💡 Please check that all required attributes are added to the schema');
      return;
    }

    // Test 2: Verify all notification types work
    console.log('\n📋 Test 2: Testing all notification types...');
    const notificationTypes = [
      { type: 'property', title: 'New Property Match', message: 'A property matches your search' },
      { type: 'booking', title: 'Booking Confirmed', message: 'Your viewing is confirmed' },
      { type: 'communication', title: 'New Message', message: 'You have a new message' },
      { type: 'system', title: 'System Update', message: 'App has been updated' },
      { type: 'location', title: 'Properties Nearby', message: 'Found properties near you' },
      { type: 'engagement', title: 'Welcome!', message: 'Complete your profile' }
    ];

    let successCount = 0;
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
            data: JSON.stringify({ test: true }),
            isRead: false,
            priority: 'medium',
          }
        );
        console.log(`✅ ${notif.type} notification created`);
        successCount++;
      } catch (error) {
        console.log(`❌ ${notif.type} notification failed: ${error.message}`);
      }
    }

    // Test 3: Verify notification retrieval
    console.log('\n📋 Test 3: Testing notification retrieval...');
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
      console.log(`✅ Retrieved ${notifications.documents.length} notifications`);
      
      // Show sample notifications
      if (notifications.documents.length > 0) {
        console.log('\n📄 Sample notifications:');
        notifications.documents.slice(0, 3).forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - Priority: ${notif.priority}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Error retrieving notifications:', error.message);
    }

    // Test 4: Test notification priorities
    console.log('\n📋 Test 4: Testing notification priorities...');
    const priorities = ['low', 'medium', 'high'];
    let prioritySuccessCount = 0;
    
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
        console.log(`✅ ${priority} priority notification created`);
        prioritySuccessCount++;
      } catch (error) {
        console.log(`❌ ${priority} priority notification failed: ${error.message}`);
      }
    }

    // Final Results
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 VERIFICATION RESULTS');
    console.log('=' .repeat(50));
    
    console.log(`📊 Notification Types: ${successCount}/${notificationTypes.length} working`);
    console.log(`📊 Priorities: ${prioritySuccessCount}/${priorities.length} working`);
    
    if (successCount === notificationTypes.length && prioritySuccessCount === priorities.length) {
      console.log('\n✅ ALL TESTS PASSED!');
      console.log('🎉 Your notification system is fully functional!');
      console.log('\n📋 What you can do now:');
      console.log('   • Create notifications in your app');
      console.log('   • Set up notification preferences for users');
      console.log('   • Send different types of notifications');
      console.log('   • Use notification priorities');
      console.log('   • Query and display notifications to users');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('💡 Please check the error messages above and fix any issues');
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      const allNotifications = await databases.listDocuments(
        DATABASE_ID,
        "notifications",
        [Query.equal("userId", TEST_USER_ID)]
      );
      
      for (const notif of allNotifications.documents) {
        try {
          await databases.deleteDocument(DATABASE_ID, "notifications", notif.$id);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.log('⚠️ Could not clean up all test data (this is okay)');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the verification
verifyNotifications();
