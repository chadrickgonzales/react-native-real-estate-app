#!/usr/bin/env node

/**
 * Update Existing Chats with Property Images
 * 
 * This script updates existing chats in the database to include property images
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68c114a1000e22edecff');

const databases = new Databases(client);

async function updateChatsWithPropertyImages() {
  try {
    console.log('🔄 Updating existing chats with property images...\n');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68c114a1000e22edecff';
    const chatsCollectionId = process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID || 'chats';
    const propertiesCollectionId = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || 'properties';
    
    // Get all chats
    const chats = await databases.listDocuments(databaseId, chatsCollectionId, [Query.limit(100)]);
    
    console.log(`📋 Found ${chats.documents.length} chats to update\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const chat of chats.documents) {
      try {
        // Skip if chat already has propertyImage
        if (chat.propertyImage && chat.propertyImage.trim() !== '') {
          console.log(`⏭️  Skipping chat ${chat.$id} - already has property image`);
          skippedCount++;
          continue;
        }
        
        // Get property details
        let propertyImage = '';
        try {
          const property = await databases.getDocument(
            databaseId,
            propertiesCollectionId,
            chat.propertyId
          );
          
          // Get property image from multiple sources
          if (property.images) {
            try {
              const parsedImages = JSON.parse(property.images);
              propertyImage = parsedImages[0] || property.image || '';
            } catch {
              propertyImage = property.images || property.image || '';
            }
          } else {
            propertyImage = property.image || '';
          }
          
          console.log(`🏠 Property ${chat.propertyId} image: ${propertyImage || 'NO IMAGE'}`);
        } catch (error) {
          console.log(`❌ Could not fetch property ${chat.propertyId}:`, error.message);
          continue;
        }
        
        // Update chat with property image
        if (propertyImage) {
          await databases.updateDocument(
            databaseId,
            chatsCollectionId,
            chat.$id,
            {
              propertyImage: propertyImage,
              updatedAt: new Date().toISOString(),
            }
          );
          
          console.log(`✅ Updated chat ${chat.$id} with property image`);
          updatedCount++;
        } else {
          console.log(`⚠️  Chat ${chat.$id} - no property image available`);
          skippedCount++;
        }
        
      } catch (error) {
        console.log(`❌ Error updating chat ${chat.$id}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Update Summary:`);
    console.log(`   - Updated: ${updatedCount} chats`);
    console.log(`   - Skipped: ${skippedCount} chats`);
    console.log(`   - Total: ${chats.documents.length} chats`);
    
  } catch (error) {
    console.error('❌ Error updating chats:', error.message);
  }
}

// Run the update
updateChatsWithPropertyImages()
  .then(() => {
    console.log('\n🎉 Chat update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Chat update failed:', error.message);
    process.exit(1);
  });
