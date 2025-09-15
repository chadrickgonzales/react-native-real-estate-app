#!/usr/bin/env node

/**
 * Appwrite Setup Script for Real Estate App
 * 
 * This script helps you set up your Appwrite database and storage
 * for the image upload functionality.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAppwrite() {
  console.log('🏠 Real Estate App - Appwrite Setup\n');
  console.log('This script will help you configure your Appwrite database for image uploads.\n');

  // Step 1: Get Appwrite project details
  console.log('📋 Step 1: Appwrite Project Configuration');
  console.log('Go to your Appwrite Console (https://cloud.appwrite.io) and get these details:\n');

  const endpoint = await question('Enter your Appwrite endpoint (default: https://cloud.appwrite.io/v1): ');
  const projectId = await question('Enter your Project ID: ');
  const databaseId = await question('Enter your Database ID: ');

  // Step 2: Collection IDs
  console.log('\n📋 Step 2: Collection IDs');
  console.log('Get these from your Appwrite Console > Database > Collections:\n');

  const propertiesCollectionId = await question('Enter Properties Collection ID: ');
  const usersCollectionId = await question('Enter Users Collection ID: ');
  const galleriesCollectionId = await question('Enter Galleries Collection ID (optional): ');
  const reviewsCollectionId = await question('Enter Reviews Collection ID (optional): ');
  const agentsCollectionId = await question('Enter Agents Collection ID (optional): ');

  // Step 3: Storage bucket
  console.log('\n📋 Step 3: Storage Bucket');
  console.log('Go to Storage in your Appwrite Console and create a bucket for images:\n');

  const bucketId = await question('Enter Storage Bucket ID: ');

  // Generate .env.local content
  const envContent = `# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=${endpoint || 'https://cloud.appwrite.io/v1'}
EXPO_PUBLIC_APPWRITE_PROJECT_ID=${projectId}
EXPO_PUBLIC_APPWRITE_DATABASE_ID=${databaseId}

# Collection IDs
EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID=${propertiesCollectionId}
EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersCollectionId}
EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID=${galleriesCollectionId || 'your_galleries_collection_id'}
EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=${reviewsCollectionId || 'your_reviews_collection_id'}
EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID=${agentsCollectionId || 'your_agents_collection_id'}

# Storage Bucket (REQUIRED for image uploads)
EXPO_PUBLIC_APPWRITE_BUCKET_ID=${bucketId}
`;

  console.log('\n📝 Generated .env.local file:');
  console.log('=====================================');
  console.log(envContent);
  console.log('=====================================\n');

  const saveFile = await question('Save this to .env.local file? (y/n): ');
  
  if (saveFile.toLowerCase() === 'y') {
    const fs = require('fs');
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ .env.local file created successfully!\n');
  }

  // Step 4: Database schema instructions
  console.log('📋 Step 4: Database Schema Setup');
  console.log('Add these attributes to your Properties collection in Appwrite Console:\n');
  
  console.log('Properties Collection Attributes:');
  console.log('• image (String, 500 chars, not required)');
  console.log('• images (String, 2000 chars, not required)\n');

  // Step 5: Storage bucket setup
  console.log('📋 Step 5: Storage Bucket Configuration');
  console.log('Configure your storage bucket with these settings:\n');
  
  console.log('Bucket Settings:');
  console.log('• File Size Limit: 10MB');
  console.log('• Allowed Extensions: jpg, jpeg, png, webp');
  console.log('• Encryption: Enabled (recommended)\n');
  
  console.log('Bucket Permissions:');
  console.log('• Create: users (authenticated users can upload)');
  console.log('• Read: any (anyone can view images)');
  console.log('• Update: users (users can update their own images)');
  console.log('• Delete: users (users can delete their own images)\n');

  // Step 6: Collection permissions
  console.log('📋 Step 6: Collection Permissions');
  console.log('Set these permissions for your Properties collection:\n');
  
  console.log('Properties Collection Permissions:');
  console.log('• Create: users (authenticated users can create properties)');
  console.log('• Read: any (anyone can view properties)');
  console.log('• Update: users (users can update their own properties)');
  console.log('• Delete: users (users can delete their own properties)\n');

  console.log('🎉 Setup instructions complete!');
  console.log('\nNext steps:');
  console.log('1. Restart your development server');
  console.log('2. Test the image upload functionality');
  console.log('3. Check the console for any error messages');
  console.log('4. Use the AppwriteTest component to verify setup\n');

  rl.close();
}

setupAppwrite().catch(console.error);
