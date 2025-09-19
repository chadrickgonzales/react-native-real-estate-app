#!/usr/bin/env node

/**
 * Complete Database Setup Script for Real Estate App
 * 
 * This script sets up all the database collections and fields needed
 * for the booking system and enhanced property features.
 */

const { execSync } = require('child_process');

console.log('🏠 Real Estate App - Complete Database Setup\n');

async function setupCompleteDatabase() {
  try {
    console.log('📋 Setting up all database collections and fields...\n');
    
    // Step 1: Create bookings collection
    console.log('📅 Step 1: Creating bookings collection...');
    try {
      execSync('node scripts/setup-booking-simple.js', { stdio: 'inherit' });
      console.log('✅ Bookings collection setup completed\n');
    } catch (error) {
      console.log('⚠️ Bookings collection setup had issues, but continuing...\n');
    }
    
    // Step 2: Setup review collections
    console.log('⭐ Step 2: Setting up review collections...');
    try {
      execSync('node scripts/setup-review-collections.js', { stdio: 'inherit' });
      console.log('✅ Review collections setup completed\n');
    } catch (error) {
      console.log('⚠️ Review collections setup had issues, but continuing...\n');
    }
    
    // Step 3: Setup saved properties collections
    console.log('💾 Step 3: Setting up saved properties collections...');
    try {
      execSync('node scripts/setup-saved-collections.js', { stdio: 'inherit' });
      console.log('✅ Saved properties collections setup completed\n');
    } catch (error) {
      console.log('⚠️ Saved properties collections setup had issues, but continuing...\n');
    }
    
    // Step 4: Setup chat collections
    console.log('💬 Step 4: Setting up chat collections...');
    try {
      execSync('node scripts/setup-chat.js', { stdio: 'inherit' });
      console.log('✅ Chat collections setup completed\n');
    } catch (error) {
      console.log('⚠️ Chat collections setup had issues, but continuing...\n');
    }
    
    // Step 5: Display manual setup instructions
    console.log('📋 Step 5: Manual Database Schema Updates Required\n');
    console.log('You need to add these fields to your Properties collection in Appwrite Console:\n');
    
    console.log('🏠 Properties Collection - Additional Fields Needed:');
    console.log('==================================================');
    
    console.log('\n📞 Contact Information:');
    console.log('• contactPhone (String, 20 chars, not required)');
    console.log('• contactEmail (String, 255 chars, not required)');
    
    console.log('\n🏘️ Property Details (for Sale Properties):');
    console.log('• yearBuilt (String, 10 chars, not required)');
    console.log('• propertyAge (String, 50 chars, not required)');
    console.log('• lotSize (String, 50 chars, not required)');
    console.log('• propertyCondition (String, 50 chars, not required)');
    console.log('• hoaFees (String, 20 chars, not required)');
    console.log('• propertyTaxes (String, 20 chars, not required)');
    
    console.log('\n🏠 Rental Details:');
    console.log('• leaseDuration (String, 50 chars, not required)');
    console.log('• deposit (String, 20 chars, not required)');
    console.log('• petDeposit (String, 20 chars, not required)');
    console.log('• utilities (String, 500 chars, not required)');
    console.log('• moveInRequirements (String, 500 chars, not required)');
    
    console.log('\n✅ Property Features (Boolean fields):');
    console.log('• furnishedStatus (Boolean, not required)');
    console.log('• petFriendly (Boolean, not required)');
    console.log('• hasHOA (Boolean, not required)');
    console.log('• hasPool (Boolean, not required)');
    console.log('• hasGarage (Boolean, not required)');
    console.log('• utilitiesIncluded (Boolean, not required)');
    console.log('• smokingAllowed (Boolean, not required)');
    console.log('• backgroundCheckRequired (Boolean, not required)');
    
    console.log('\n📋 Additional Details:');
    console.log('• parkingSpaces (String, 10 chars, not required)');
    console.log('• amenities (String, 1000 chars, not required)');
    
    console.log('\n📅 Bookings Collection - Already Created:');
    console.log('==========================================');
    console.log('The bookings collection has been created with these fields:');
    console.log('• userId, propertyId, propertyName, propertyAddress');
    console.log('• propertyImage, ownerId, ownerName, ownerEmail, ownerPhone');
    console.log('• bookingDate, bookingTime, duration, status');
    console.log('• totalAmount, currency, guests, specialRequests');
    console.log('• cancellationReason, createdAt, updatedAt');
    
    console.log('\n🔧 How to Add Fields in Appwrite Console:');
    console.log('==========================================');
    console.log('1. Go to your Appwrite Console (https://cloud.appwrite.io)');
    console.log('2. Navigate to Database > Your Database > Properties Collection');
    console.log('3. Click "Create Attribute" for each field listed above');
    console.log('4. Set the field type (String, Boolean, etc.) and size as specified');
    console.log('5. Set "Required" to false for all new fields');
    console.log('6. Save each attribute');
    
    console.log('\n🧪 Testing Your Setup:');
    console.log('=======================');
    console.log('After adding the fields, you can test with:');
    console.log('• node scripts/test-all-features.js');
    console.log('• node scripts/test-implemented-features.js');
    
    console.log('\n🎉 Database Setup Instructions Complete!');
    console.log('\nNext steps:');
    console.log('1. Add the Properties collection fields manually in Appwrite Console');
    console.log('2. Test the booking system');
    console.log('3. Test the property details page with new features');
    console.log('4. Verify all collections are working properly\n');
    
  } catch (error) {
    console.error('❌ Error during database setup:', error.message);
    process.exit(1);
  }
}

setupCompleteDatabase();
