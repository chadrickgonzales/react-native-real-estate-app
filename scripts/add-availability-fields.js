// Script to add availability fields to properties collection
const { databases } = require('../lib/appwrite');

async function addAvailabilityFields() {
  try {
    console.log('📅 Adding availability fields to properties collection...');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID;
    
    if (!databaseId || !collectionId) {
      throw new Error('Missing database or collection ID in environment variables');
    }
    
    // Define the new availability attributes
    const availabilityAttributes = [
      // For Sale Properties - Viewing Availability
      { key: 'viewingStartDate', type: 'string', size: 20, required: false },
      { key: 'viewingEndDate', type: 'string', size: 20, required: false },
      { key: 'viewingTimeSlots', type: 'string', size: 500, required: false },
      
      // For Rental Properties - Booking Availability
      { key: 'rentalStartDate', type: 'string', size: 20, required: false },
      { key: 'rentalEndDate', type: 'string', size: 20, required: false },
      { key: 'checkInTime', type: 'string', size: 20, required: false },
      { key: 'checkoutTime', type: 'string', size: 20, required: false },
      { key: 'rentalPeriod', type: 'string', size: 50, required: false },
      { key: 'minimumStay', type: 'integer', required: false },
      { key: 'maximumStay', type: 'integer', required: false },
    ];
    
    console.log('🔧 Adding availability attributes...');
    
    for (const attr of availabilityAttributes) {
      try {
        await databases.createStringAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`✅ Added ${attr.key} (${attr.type})`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  ${attr.key} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding ${attr.key}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Availability fields added successfully!');
    console.log('\n📋 Summary of added fields:');
    console.log('For Sale Properties:');
    console.log('  - viewingStartDate (string)');
    console.log('  - viewingEndDate (string)');
    console.log('  - viewingTimeSlots (string - JSON array)');
    console.log('\nFor Rental Properties:');
    console.log('  - rentalStartDate (string)');
    console.log('  - rentalEndDate (string)');
    console.log('  - checkInTime (string)');
    console.log('  - checkoutTime (string)');
    console.log('  - rentalPeriod (string)');
    console.log('  - minimumStay (integer)');
    console.log('  - maximumStay (integer)');
    
  } catch (error) {
    console.error('❌ Error adding availability fields:', error);
  }
}

// Run the script
addAvailabilityFields();
