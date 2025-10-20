#!/usr/bin/env node

/**
 * Debug Property Image Upload Issue
 * 
 * This script helps debug why property images are still null in the database
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68c114a1000e22edecff');

const databases = new Databases(client);

async function debugPropertyImageIssue() {
  try {
    console.log('🔍 Debugging property image upload issue...\n');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68c114a1000e22edecff';
    const chatsCollectionId = process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID || 'chats';
    const propertiesCollectionId = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || 'properties';
    
    // Check if propertyImage field exists in chats collection
    console.log('1️⃣ Checking Chats Collection Schema...');
    try {
      // Try to create a test document to see what fields are available
      const testChat = await databases.createDocument(
        databaseId,
        chatsCollectionId,
        'test-debug-chat',
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
      
      console.log('✅ propertyImage field exists in Chats collection');
      console.log('   Test propertyImage:', testChat.propertyImage);
      
      // Clean up test document
      await databases.deleteDocument(databaseId, chatsCollectionId, 'test-debug-chat');
      console.log('🗑️  Test chat deleted\n');
      
    } catch (error) {
      console.log('❌ Error with propertyImage field:', error.message);
      
      if (error.message.includes('propertyImage')) {
        console.log('💡 The propertyImage field does not exist in your Chats collection!');
        console.log('   Please add it in Appwrite Console:');
        console.log('   - Go to Database → Chats Collection → Attributes');
        console.log('   - Add attribute: propertyImage (String, Size: 1000, Required: No)');
        return;
      }
    }
    
    // Check recent chats
    console.log('2️⃣ Checking Recent Chats...');
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
      console.log(`  - Property Image: ${chat.propertyImage || 'NULL/EMPTY'}`);
      console.log(`  - Created: ${chat.$createdAt}`);
      console.log('');
    });
    
    // Check properties for the recent chats
    console.log('3️⃣ Checking Properties for Recent Chats...');
    for (const chat of chats.documents.slice(0, 3)) {
      try {
        const property = await databases.getDocument(
          databaseId,
          propertiesCollectionId,
          chat.propertyId
        );
        
        console.log(`Property "${property.name}" (${property.$id}):`);
        console.log(`  - property.image: ${property.image || 'EMPTY'}`);
        console.log(`  - property.images: ${property.images || 'EMPTY'}`);
        
        if (property.images) {
          try {
            const parsedImages = JSON.parse(property.images);
            console.log(`  - parsed images: ${JSON.stringify(parsedImages)}`);
            console.log(`  - first image: ${parsedImages[0] || 'NONE'}`);
          } catch {
            console.log(`  - images (raw): ${property.images}`);
          }
        }
        console.log('');
        
      } catch (error) {
        console.log(`❌ Could not fetch property ${chat.propertyId}: ${error.message}\n`);
      }
    }
    
    // Test creating a new chat with property image
    console.log('4️⃣ Testing New Chat Creation...');
    try {
      // Get a property with images
      const properties = await databases.listDocuments(databaseId, propertiesCollectionId, [Query.limit(10)]);
      let testProperty = null;
      
      for (const prop of properties.documents) {
        if (prop.image || prop.images) {
          testProperty = prop;
          break;
        }
      }
      
      if (!testProperty) {
        console.log('⚠️  No properties with images found. Adding test image to first property...');
        testProperty = properties.documents[0];
        
        await databases.updateDocument(
          databaseId,
          propertiesCollectionId,
          testProperty.$id,
          {
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
            images: JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop']),
            updatedAt: new Date().toISOString(),
          }
        );
        
        console.log(`✅ Added test image to property "${testProperty.name}"`);
      }
      
      // Create test chat
      const testChat = await databases.createDocument(
        databaseId,
        chatsCollectionId,
        'test-chat-' + Date.now(),
        {
          propertyId: testProperty.$id,
          buyerId: 'test-buyer-' + Date.now(),
          sellerId: 'test-seller-' + Date.now(),
          propertyName: testProperty.name,
          sellerName: 'Test Seller',
          sellerAvatar: '',
          propertyImage: testProperty.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          propertyAddress: testProperty.address || 'Test Address',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      
      console.log('✅ Test chat created successfully!');
      console.log(`   Chat ID: ${testChat.$id}`);
      console.log(`   Property Image: ${testChat.propertyImage}`);
      
      // Clean up
      await databases.deleteDocument(databaseId, chatsCollectionId, testChat.$id);
      console.log('🗑️  Test chat deleted');
      
    } catch (error) {
      console.log('❌ Error creating test chat:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error debugging property image issue:', error.message);
  }
}

// Run the debug
debugPropertyImageIssue()
  .then(() => {
    console.log('\n🎉 Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error.message);
    process.exit(1);
  });
