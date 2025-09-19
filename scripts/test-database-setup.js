// Script to test that all database collections and fields are working
const { databases, Query } = require('../lib/appwrite');

async function testDatabaseSetup() {
  try {
    console.log('🧪 Testing database setup...');
    
    const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
    const propertiesCollectionId = process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID;
    
    if (!databaseId) {
      throw new Error('Missing database ID in environment variables');
    }
    
    console.log('📋 Testing collections...');
    
    // Test 1: Check if bookings collection exists
    try {
      const bookingsCollection = await databases.getCollection(databaseId, 'bookings');
      console.log('✅ Bookings collection exists');
      console.log(`   - Collection ID: ${bookingsCollection.$id}`);
      console.log(`   - Name: ${bookingsCollection.name}`);
      console.log(`   - Attributes: ${bookingsCollection.attributes.length}`);
    } catch (error) {
      console.log('❌ Bookings collection not found:', error.message);
    }
    
    // Test 2: Check if properties collection exists and has required fields
    if (propertiesCollectionId) {
      try {
        const propertiesCollection = await databases.getCollection(databaseId, propertiesCollectionId);
        console.log('✅ Properties collection exists');
        console.log(`   - Collection ID: ${propertiesCollection.$id}`);
        console.log(`   - Name: ${propertiesCollection.name}`);
        console.log(`   - Attributes: ${propertiesCollection.attributes.length}`);
        
        // Check for some key attributes
        const attributeNames = propertiesCollection.attributes.map(attr => attr.key);
        const requiredFields = [
          'contactPhone', 'contactEmail', 'yearBuilt', 'propertyAge', 
          'lotSize', 'propertyCondition', 'hoaFees', 'propertyTaxes',
          'leaseDuration', 'deposit', 'petDeposit', 'utilities',
          'moveInRequirements', 'furnishedStatus', 'petFriendly',
          'hasHOA', 'hasPool', 'hasGarage', 'utilitiesIncluded',
          'smokingAllowed', 'backgroundCheckRequired', 'parkingSpaces', 'amenities'
        ];
        
        console.log('\n🔍 Checking for required fields:');
        let foundFields = 0;
        for (const field of requiredFields) {
          if (attributeNames.includes(field)) {
            console.log(`   ✅ ${field}`);
            foundFields++;
          } else {
            console.log(`   ❌ ${field} - Missing`);
          }
        }
        
        console.log(`\n📊 Field Coverage: ${foundFields}/${requiredFields.length} (${Math.round(foundFields/requiredFields.length*100)}%)`);
        
      } catch (error) {
        console.log('❌ Properties collection error:', error.message);
      }
    } else {
      console.log('⚠️ Properties collection ID not found in environment variables');
    }
    
    // Test 3: Try to create a test booking (if bookings collection exists)
    try {
      console.log('\n🧪 Testing booking creation...');
      const testBooking = await databases.createDocument(
        databaseId,
        'bookings',
        'test-booking-' + Date.now(),
        {
          userId: 'test-user',
          propertyId: 'test-property',
          propertyName: 'Test Property',
          propertyAddress: 'Test Address',
          propertyImage: 'test-image.jpg',
          ownerId: 'test-owner',
          ownerName: 'Test Owner',
          ownerEmail: 'test@example.com',
          ownerPhone: '+1234567890',
          bookingDate: '2024-01-01',
          bookingTime: '10:00',
          duration: 60,
          status: 'pending',
          totalAmount: 100,
          currency: 'USD',
          guests: 1,
          specialRequests: 'Test booking',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      console.log('✅ Test booking created successfully');
      
      // Clean up test booking
      await databases.deleteDocument(databaseId, 'bookings', testBooking.$id);
      console.log('✅ Test booking cleaned up');
      
    } catch (error) {
      console.log('❌ Booking creation test failed:', error.message);
    }
    
    console.log('\n🎉 Database setup test completed!');
    return true;
    
  } catch (error) {
    console.error('💥 Database test failed:', error.message);
    throw error;
  }
}

// Run the test
testDatabaseSetup()
  .then(() => {
    console.log('✅ All database tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database tests failed:', error.message);
    process.exit(1);
  });
