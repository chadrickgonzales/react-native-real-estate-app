const { Client, Databases, ID, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

async function updateMessagesSchema() {
  try {
    console.log('🔄 Updating messages collection schema...');
    
    // Get your database ID and messages collection ID from your config
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
    const messagesCollectionId = process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID;
    
    if (!databaseId || !messagesCollectionId) {
      console.error('❌ Missing database or collection IDs in environment variables');
      return;
    }

    // Try to add the readBy attribute
    try {
      await databases.createAttribute(databaseId, messagesCollectionId, 'readBy', 'array', {
        elements: 'object',
        required: false,
        array: true
      });
      console.log('✅ Successfully added readBy attribute to messages collection');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  readBy attribute already exists');
      } else {
        console.error('❌ Error adding readBy attribute:', error.message);
      }
    }

    console.log('🎉 Messages schema update completed!');
    
  } catch (error) {
    console.error('❌ Error updating messages schema:', error);
  }
}

// Run the update
updateMessagesSchema();

