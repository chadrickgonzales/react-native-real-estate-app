// Script to create the bookings collection for property booking system
const { databases, ID } = require('../lib/appwrite');

async function createBookingCollection() {
  try {
    console.log('📅 Creating bookings collection...');
    
    await databases.createCollection(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      'bookings',
      'Property Bookings',
      [
        { key: 'userId', type: 'string', size: 255, required: true, array: false },
        { key: 'propertyId', type: 'string', size: 255, required: true, array: false },
        { key: 'propertyName', type: 'string', size: 255, required: true, array: false },
        { key: 'propertyAddress', type: 'string', size: 500, required: true, array: false },
        { key: 'propertyImage', type: 'string', size: 1000, required: true, array: false },
        { key: 'ownerId', type: 'string', size: 255, required: true, array: false },
        { key: 'ownerName', type: 'string', size: 255, required: true, array: false },
        { key: 'ownerEmail', type: 'string', size: 255, required: true, array: false },
        { key: 'ownerPhone', type: 'string', size: 20, required: true, array: false },
        { key: 'bookingDate', type: 'string', size: 10, required: true, array: false },
        { key: 'bookingTime', type: 'string', size: 5, required: true, array: false },
        { key: 'duration', type: 'integer', required: true, array: false },
        { 
          key: 'status', 
          type: 'enum', 
          elements: ['pending', 'confirmed', 'cancelled', 'completed'], 
          required: true,
          array: false
        },
        { key: 'totalAmount', type: 'integer', required: true, array: false },
        { key: 'currency', type: 'string', size: 3, required: true, array: false },
        { key: 'guests', type: 'integer', required: true, array: false },
        { key: 'specialRequests', type: 'string', size: 1000, required: false, array: false },
        { key: 'cancellationReason', type: 'string', size: 500, required: false, array: false },
        { key: 'createdAt', type: 'datetime', required: true, array: false },
        { key: 'updatedAt', type: 'datetime', required: true, array: false }
      ],
      [
        { permission: 'read', role: 'any' },
        { permission: 'create', role: 'any' },
        { permission: 'update', role: 'any' },
        { permission: 'delete', role: 'any' }
      ]
    );
    
    console.log('✅ Bookings collection created successfully');
    return true;
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️ Bookings collection already exists');
      return true;
    } else {
      console.error('❌ Error creating bookings collection:', error.message);
      throw error;
    }
  }
}

// Run the setup
createBookingCollection()
  .then(() => {
    console.log('🎉 Booking collection setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  });