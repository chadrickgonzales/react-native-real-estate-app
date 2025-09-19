#!/usr/bin/env node

/**
 * Chat Setup Script for Real Estate App
 * 
 * This script helps you set up the chat collections in Appwrite
 * for the chat functionality.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupChat() {
  console.log('💬 Real Estate App - Chat Setup\n');
  console.log('This script will help you set up the chat collections in Appwrite.\n');

  console.log('📋 Step 1: Create Collections in Appwrite Console');
  console.log('Go to your Appwrite Console (https://cloud.appwrite.io) and create these collections:\n');

  console.log('1. Create "Chats" collection with these attributes:');
  console.log('   • propertyId (String, 50 chars, required)');
  console.log('   • buyerId (String, 50 chars, required)');
  console.log('   • sellerId (String, 50 chars, required)');
  console.log('   • propertyName (String, 200 chars, required)');
  console.log('   • sellerName (String, 100 chars, required)');
  console.log('   • sellerAvatar (String, 500 chars, optional)');
  console.log('   • lastMessage (String, 1000 chars, optional)');
  console.log('   • lastMessageTime (String, 50 chars, optional)');
  console.log('   • createdAt (String, 50 chars, required)');
  console.log('   • updatedAt (String, 50 chars, required)\n');

  console.log('2. Create "Messages" collection with these attributes:');
  console.log('   • chatId (String, 50 chars, required)');
  console.log('   • senderId (String, 50 chars, required)');
  console.log('   • senderName (String, 100 chars, required)');
  console.log('   • senderAvatar (String, 500 chars, optional)');
  console.log('   • text (String, 2000 chars, required)');
  console.log('   • timestamp (String, 50 chars, required)');
  console.log('   • isRead (Boolean, required)');
  console.log('   • createdAt (String, 50 chars, required)\n');

  console.log('📋 Step 2: Set Collection Permissions');
  console.log('For both collections, set these permissions:');
  console.log('   • Create: users (authenticated users can create)');
  console.log('   • Read: users (users can read their own data)');
  console.log('   • Update: users (users can update their own data)');
  console.log('   • Delete: users (users can delete their own data)\n');

  console.log('📋 Step 3: Create Indexes');
  console.log('For Chats collection, create these indexes:');
  console.log('   • Composite: propertyId, buyerId, sellerId');
  console.log('   • Index: buyerId');
  console.log('   • Index: sellerId');
  console.log('   • Index: updatedAt\n');

  console.log('For Messages collection, create these indexes:');
  console.log('   • Index: chatId');
  console.log('   • Index: senderId');
  console.log('   • Index: timestamp');
  console.log('   • Composite: chatId, isRead\n');

  // Get collection IDs
  console.log('📋 Step 4: Get Collection IDs');
  console.log('After creating the collections, get their IDs from the Appwrite Console:\n');

  const chatsCollectionId = await question('Enter Chats Collection ID: ');
  const messagesCollectionId = await question('Enter Messages Collection ID: ');

  // Update .env.local file
  console.log('\n📝 Updating .env.local file...');
  
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add chat collection IDs
    envContent = envContent.replace(
      /EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID=.*/,
      `EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID=${chatsCollectionId}`
    );
    
    envContent = envContent.replace(
      /EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=.*/,
      `EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=${messagesCollectionId}`
    );
    
    // If the variables don't exist, add them
    if (!envContent.includes('EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID')) {
      envContent += `\n# Chat Collections\nEXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID=${chatsCollectionId}\n`;
    }
    
    if (!envContent.includes('EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID')) {
      envContent += `EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=${messagesCollectionId}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file updated successfully!\n');
  } else {
    console.log('❌ .env.local file not found. Please run the main setup script first.\n');
  }

  console.log('🎉 Chat setup complete!');
  console.log('\nNext steps:');
  console.log('1. Restart your development server');
  console.log('2. Test the chat functionality');
  console.log('3. Check the console for any error messages\n');

  rl.close();
}

setupChat().catch(console.error);
