#!/usr/bin/env node

/**
 * Check Properties with Images
 * 
 * This script checks which properties have images in the database
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68c114a1000e22edecff');

const databases = new Databases(client);

async function checkPropertiesWithImages() {
  try {
    console.log('🔍 Checking properties with images...\n');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68c114a1000e22edecff';
    const propertiesCollectionId = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || 'properties';
    
    // Get all properties
    const properties = await databases.listDocuments(databaseId, propertiesCollectionId, [Query.limit(10)]);
    
    console.log(`📋 Found ${properties.documents.length} properties:\n`);
    
    let propertiesWithImages = 0;
    let propertiesWithoutImages = 0;
    
    properties.documents.forEach((property, index) => {
      const hasImage = property.image && property.image.trim() !== '';
      const hasImages = property.images && property.images.length > 0;
      
      console.log(`${index + 1}. Property: "${property.name}" (ID: ${property.$id})`);
      console.log(`   - Single image: ${property.image || 'EMPTY'}`);
      console.log(`   - Images array: ${property.images ? property.images.length : 0} images`);
      console.log(`   - Has images: ${hasImage || hasImages ? '✅ YES' : '❌ NO'}`);
      console.log('');
      
      if (hasImage || hasImages) {
        propertiesWithImages++;
      } else {
        propertiesWithoutImages++;
      }
    });
    
    console.log(`📊 Summary:`);
    console.log(`   - Properties with images: ${propertiesWithImages}`);
    console.log(`   - Properties without images: ${propertiesWithoutImages}`);
    
    if (propertiesWithImages > 0) {
      console.log('\n✅ Found properties with images! Try booking one of those.');
    } else {
      console.log('\n❌ No properties have images. You need to add images to your properties.');
      console.log('\n🔧 To add images to properties:');
      console.log('1. Go to Appwrite Console → Database → Properties Collection');
      console.log('2. Edit a property');
      console.log('3. Add image URLs to the "image" field (single image)');
      console.log('4. Add image URLs array to the "images" field (multiple images)');
    }
    
  } catch (error) {
    console.error('❌ Error checking properties:', error.message);
  }
}

// Run the check
checkPropertiesWithImages()
  .then(() => {
    console.log('\n🎉 Properties check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Properties check failed:', error.message);
    process.exit(1);
  });
