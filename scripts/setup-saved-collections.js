const { Client, Databases, ID, Permission, Role } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

async function setupSavedCollections() {
  try {
    console.log('🚀 Setting up saved collections...');

    // 1. Create saved_properties collection
    try {
      console.log('📦 Creating saved_properties collection...');
      await databases.createCollection(
        DATABASE_ID,
        'saved_properties',
        'Saved Properties',
        [
          // User ID (who saved the property)
          {
            key: 'userId',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          // Property ID (reference to the property)
          {
            key: 'propertyId',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          // Property details (cached for performance)
          {
            key: 'propertyName',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          {
            key: 'propertyAddress',
            type: 'string',
            size: 500,
            required: true,
            array: false,
          },
          {
            key: 'propertyImage',
            type: 'string',
            size: 500,
            required: false,
            array: false,
          },
          {
            key: 'price',
            type: 'double',
            required: true,
            array: false,
          },
          {
            key: 'propertyType',
            type: 'string',
            size: 100,
            required: true,
            array: false,
          },
          {
            key: 'listingType',
            type: 'enum',
            elements: ['sale', 'rent'],
            required: true,
            array: false,
          },
          {
            key: 'bedrooms',
            type: 'integer',
            required: true,
            array: false,
          },
          {
            key: 'bathrooms',
            type: 'integer',
            required: true,
            array: false,
          },
          {
            key: 'area',
            type: 'double',
            required: true,
            array: false,
          },
          {
            key: 'addedDate',
            type: 'datetime',
            required: true,
            array: false,
          },
        ],
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      console.log('✅ saved_properties collection created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ saved_properties collection already exists');
      } else {
        console.error('❌ Error creating saved_properties collection:', error.message);
      }
    }

    // 2. Create saved_searches collection
    try {
      console.log('🔍 Creating saved_searches collection...');
      await databases.createCollection(
        DATABASE_ID,
        'saved_searches',
        'Saved Searches',
        [
          // User ID (who saved the search)
          {
            key: 'userId',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          // Search details
          {
            key: 'searchName',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          {
            key: 'searchQuery',
            type: 'string',
            size: 500,
            required: true,
            array: false,
          },
          {
            key: 'filters',
            type: 'string',
            size: 1000,
            required: false,
            array: false,
          },
          {
            key: 'location',
            type: 'string',
            size: 255,
            required: false,
            array: false,
          },
          {
            key: 'priceMin',
            type: 'double',
            required: false,
            array: false,
          },
          {
            key: 'priceMax',
            type: 'double',
            required: false,
            array: false,
          },
          {
            key: 'propertyType',
            type: 'string',
            size: 100,
            required: false,
            array: false,
          },
          {
            key: 'bedrooms',
            type: 'integer',
            required: false,
            array: false,
          },
          {
            key: 'bathrooms',
            type: 'integer',
            required: false,
            array: false,
          },
          {
            key: 'isActive',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'lastChecked',
            type: 'datetime',
            required: true,
            array: false,
          },
          {
            key: 'newMatches',
            type: 'integer',
            required: true,
            array: false,
          },
        ],
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      console.log('✅ saved_searches collection created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ saved_searches collection already exists');
      } else {
        console.error('❌ Error creating saved_searches collection:', error.message);
      }
    }

    // 3. Create notifications collection
    try {
      console.log('🔔 Creating notifications collection...');
      await databases.createCollection(
        DATABASE_ID,
        'notifications',
        'User Notifications',
        [
          // User ID (who receives the notification)
          {
            key: 'userId',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          // Notification details
          {
            key: 'type',
            type: 'enum',
            elements: ['property', 'booking', 'communication', 'system', 'location', 'engagement'],
            required: true,
            array: false,
          },
          {
            key: 'title',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          {
            key: 'message',
            type: 'string',
            size: 1000,
            required: true,
            array: false,
          },
          {
            key: 'data',
            type: 'string',
            size: 2000,
            required: false,
            array: false,
          },
          {
            key: 'isRead',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'priority',
            type: 'enum',
            elements: ['low', 'medium', 'high'],
            required: true,
            array: false,
          },
          {
            key: 'readAt',
            type: 'datetime',
            required: false,
            array: false,
          },
        ],
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      console.log('✅ notifications collection created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ notifications collection already exists');
      } else {
        console.error('❌ Error creating notifications collection:', error.message);
      }
    }

    // 4. Create notification_settings collection
    try {
      console.log('⚙️ Creating notification_settings collection...');
      await databases.createCollection(
        DATABASE_ID,
        'notification_settings',
        'Notification Settings',
        [
          // User ID (who owns the settings)
          {
            key: 'userId',
            type: 'string',
            size: 255,
            required: true,
            array: false,
          },
          // Notification type settings
          {
            key: 'propertyNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'bookingNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'communicationNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'systemNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'locationNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'engagementNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'emailNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
          {
            key: 'pushNotifications',
            type: 'boolean',
            required: true,
            array: false,
          },
        ],
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      console.log('✅ notification_settings collection created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ notification_settings collection already exists');
      } else {
        console.error('❌ Error creating notification_settings collection:', error.message);
      }
    }

    console.log('🎉 All saved collections setup completed successfully!');
    console.log('\n📋 Collections created:');
    console.log('   • saved_properties - For user saved properties');
    console.log('   • saved_searches - For user saved search queries');
    console.log('   • notifications - For user notifications');
    console.log('   • notification_settings - For user notification preferences');
    console.log('\n✨ You can now use the saved functionality and notifications in your app!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the setup
setupSavedCollections();