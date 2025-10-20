#!/usr/bin/env node

/**
 * Test Property Image Upload to Chats
 * 
 * This script tests if property images are being uploaded to the chats collection
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68c114a1000e22edecff');

const databases = new Databases(client);

async function testPropertyImageUpload() {
  try {
    console.log('🧪 Testing property image upload to chats...\n');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68c114a1000e22edecff';
    const chatsCollectionId = process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID || 'chats';
    
    // Get recent chats
    const chats = await databases.listDocuments(databaseId, chatsCollectionId, [
      Query.orderDesc('$createdAt'),
      Query.limit(5)
    ]);
    
    console.log(`📋 Found ${chats.documents.length} recent chats:\n`);
    
    chats.documents.forEach((chat, index) => {
      console.log(`Chat ${index + 1}:`);
      console.log(`  - ID: ${chat.$id}`);
      console.log(`  - Property ID: ${chat.propertyId}`);
      console.log(`  - Property Name: ${chat.propertyName}`);
      console.log(`  - Property Image: ${chat.propertyImage || 'NO IMAGE'}`);
      console.log(`  - Created: ${chat.$createdAt}`);
      console.log('');
    });
    
    // Check if propertyImage field exists in schema
    console.log('🔍 Checking chat schema...');
    try {
      // Try to create a test document to see what fields are available
      const testChat = await databases.createDocument(
        databaseId,
        chatsCollectionId,
        'test-chat-id',
        {
          propertyId: 'test-property',
          buyerId: 'test-buyer',
          sellerId: 'test-seller',
          propertyName: 'Test Property',
          sellerName: 'Test Seller',
          sellerAvatar: '',
          propertyImage: 'https://example.com/test-image.jpg',
          propertyAddress: 'Test Address',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Test chat created successfully with propertyImage field');
      console.log('   Property Image:', testChat.propertyImage);
      
      // Clean up test document
      await databases.deleteDocument(databaseId, chatsCollectionId, 'test-chat-id');
      console.log('🗑️  Test chat deleted');
      
    } catch (error) {
      console.log('❌ Error creating test chat:', error.message);
      
      if (error.message.includes('propertyImage')) {
        console.log('💡 The propertyImage field might not exist in your database schema');
        console.log('   Please add the propertyImage field to your Chats collection');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing property image upload:', error.message);
  }
}

// Run the test
testPropertyImageUpload()
  .then(() => {
    console.log('\n🎉 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
