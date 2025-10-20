#!/usr/bin/env node

/**
 * Check Bookings Collection Schema
 * 
 * This script checks if the bookings collection exists and has the correct schema
 */

const { Client, Databases, Query } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '68c114a1000e22edecff');

const databases = new Databases(client);

async function checkBookingsSchema() {
  try {
    console.log('🔍 Checking bookings collection schema...\n');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '68c114a1000e22edecff';
    
    // Check if bookings collection exists
    try {
      const collection = await databases.getCollection(databaseId, 'bookings');
      console.log('✅ Bookings collection exists');
      console.log(`   - Collection ID: ${collection.$id}`);
      console.log(`   - Name: ${collection.name}`);
      console.log(`   - Attributes: ${collection.attributes.length}\n`);
      
      // Check for propertyImage attribute
      const propertyImageAttr = collection.attributes.find(attr => attr.key === 'propertyImage');
      if (propertyImageAttr) {
        console.log('✅ propertyImage attribute exists:');
        console.log(`   - Type: ${propertyImageAttr.type}`);
        console.log(`   - Size: ${propertyImageAttr.size}`);
        console.log(`   - Required: ${propertyImageAttr.required}`);
        console.log(`   - Array: ${propertyImageAttr.array}\n`);
      } else {
        console.log('❌ propertyImage attribute NOT found!\n');
        console.log('Available attributes:');
        collection.attributes.forEach(attr => {
          console.log(`   - ${attr.key}: ${attr.type} (size: ${attr.size}, required: ${attr.required})`);
        });
      }
      
      // Try to get a sample booking to see the data structure
      try {
        const bookings = await databases.listDocuments(databaseId, 'bookings', [Query.limit(1)]);
        if (bookings.documents.length > 0) {
          const sampleBooking = bookings.documents[0];
          console.log('\n📋 Sample booking data:');
          console.log(`   - Booking ID: ${sampleBooking.$id}`);
          console.log(`   - Property Image: ${sampleBooking.propertyImage || 'EMPTY'}`);
          console.log(`   - Property Name: ${sampleBooking.propertyName || 'EMPTY'}`);
          console.log(`   - Available fields: ${Object.keys(sampleBooking).join(', ')}`);
        } else {
          console.log('\n📋 No bookings found in database');
        }
      } catch (error) {
        console.log('\n⚠️ Could not fetch sample bookings:', error.message);
      }
      
    } catch (error) {
      console.log('❌ Bookings collection does not exist:', error.message);
      console.log('\n🔧 To create the bookings collection, run:');
      console.log('   node scripts/setup-booking-collection.js');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
}

// Run the check
checkBookingsSchema()
  .then(() => {
    console.log('\n🎉 Schema check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema check failed:', error.message);
    process.exit(1);
  });
