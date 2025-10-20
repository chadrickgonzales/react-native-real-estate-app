#!/usr/bin/env node

/**
 * Add Sample Images to Properties
 * 
 * This script adds sample images to properties that don't have any images
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68c114a1000e22edecff');

const databases = new Databases(client);

// Sample property images
const sampleImages = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c69c6c4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600566753086-5f52d1a8b5f1?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop"
];

async function addSampleImagesToProperties() {
  try {
    console.log('🏠 Adding sample images to properties...\n');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68c114a1000e22edecff';
    const propertiesCollectionId = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || 'properties';
    
    // Get all properties
    const properties = await databases.listDocuments(databaseId, propertiesCollectionId, [Query.limit(100)]);
    
    console.log(`📋 Found ${properties.documents.length} properties\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const property of properties.documents) {
      try {
        // Check if property has images
        let hasImages = false;
        let currentImages = [];
        
        if (property.images) {
          try {
            currentImages = JSON.parse(property.images);
            hasImages = currentImages.length > 0;
          } catch {
            hasImages = property.images.trim() !== '';
          }
        }
        
        if (property.image && property.image.trim() !== '') {
          hasImages = true;
        }
        
        if (hasImages) {
          console.log(`⏭️  Skipping property "${property.name}" - already has images`);
          skippedCount++;
          continue;
        }
        
        // Add sample images
        const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
        const imagesArray = [randomImage];
        
        await databases.updateDocument(
          databaseId,
          propertiesCollectionId,
          property.$id,
          {
            image: randomImage,
            images: JSON.stringify(imagesArray),
            updatedAt: new Date().toISOString(),
          }
        );
        
        console.log(`✅ Updated property "${property.name}" with image: ${randomImage}`);
        updatedCount++;
        
      } catch (error) {
        console.log(`❌ Error updating property "${property.name}":`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Update Summary:`);
    console.log(`   - Updated: ${updatedCount} properties`);
    console.log(`   - Skipped: ${skippedCount} properties`);
    console.log(`   - Total: ${properties.documents.length} properties`);
    
  } catch (error) {
    console.error('❌ Error adding sample images:', error.message);
  }
}

// Run the update
addSampleImagesToProperties()
  .then(() => {
    console.log('\n🎉 Sample images added successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to add sample images:', error.message);
    process.exit(1);
  });
