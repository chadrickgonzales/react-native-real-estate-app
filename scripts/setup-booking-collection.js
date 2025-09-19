const { Client, Databases, ID, Permission, Role } = require('appwrite');

const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c");

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff";

async function setupBookingCollection() {
  try {
    console.log('📅 Setting up booking collection...');
    
    // Create bookings collection
    await databases.createCollection(
      DATABASE_ID,
      'bookings',
      'Property Bookings',
      [
        // User who made the booking
        {
          key: 'userId',
          type: 'string',
          size: 255,
          required: true,
          array: false,
        },
        // Property being booked
        {
          key: 'propertyId',
          type: 'string',
          size: 255,
          required: true,
          array: false,
        },
        // Property details (for quick access)
        {
          key: 'propertyName',
          type: 'string',
          size: 255,
          required: true,
          array: false,
        },
        {
          key: 'propertyAddress',
          type: 'string',
          size: 500,
          required: true,
          array: false,
        },
        {
          key: 'propertyImage',
          type: 'string',
          size: 1000,
          required: true,
          array: false,
        },
        // Property owner details
        {
          key: 'ownerId',
          type: 'string',
          size: 255,
          required: true,
          array: false,
        },
        {
          key: 'ownerName',
          type: 'string',
          size: 255,
          required: true,
          array: false,
        },
        {
          key: 'ownerEmail',
          type: 'string',
          size: 255,
          required: true,
          array: false,
        },
        {
          key: 'ownerPhone',
          type: 'string',
          size: 20,
          required: true,
          array: false,
        },
        // Booking details
        {
          key: 'bookingDate',
          type: 'string',
          size: 10,
          required: true,
          array: false,
        },
        {
          key: 'bookingTime',
          type: 'string',
          size: 5,
          required: true,
          array: false,
        },
        {
          key: 'duration',
          type: 'integer',
          required: true,
          array: false,
        },
        {
          key: 'status',
          type: 'enum',
          elements: ['pending', 'confirmed', 'cancelled', 'completed'],
          required: true,
          array: false,
        },
        {
          key: 'totalAmount',
          type: 'integer',
          required: true,
          array: false,
        },
        {
          key: 'currency',
          type: 'string',
          size: 3,
          required: true,
          array: false,
        },
        {
          key: 'guests',
          type: 'integer',
          required: true,
          array: false,
        },
        {
          key: 'specialRequests',
          type: 'string',
          size: 1000,
          required: false,
          array: false,
        },
        {
          key: 'cancellationReason',
          type: 'string',
          size: 500,
          required: false,
          array: false,
        },
        {
          key: 'createdAt',
          type: 'datetime',
          required: true,
          array: false,
        },
        {
          key: 'updatedAt',
          type: 'datetime',
          required: true,
          array: false,
        },
      ],
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );
    
    console.log('✅ Bookings collection created successfully');
    
    // Create indexes for better performance
    console.log('📊 Creating indexes...');
    
    // Index for user bookings
    await databases.createIndex(
      DATABASE_ID,
      'bookings',
      'user_bookings',
      'key',
      ['userId'],
      ['createdAt']
    );
    
    // Index for owner bookings
    await databases.createIndex(
      DATABASE_ID,
      'bookings',
      'owner_bookings',
      'key',
      ['ownerId'],
      ['createdAt']
    );
    
    // Index for property bookings
    await databases.createIndex(
      DATABASE_ID,
      'bookings',
      'property_bookings',
      'key',
      ['propertyId'],
      ['bookingDate']
    );
    
    // Index for booking date and time
    await databases.createIndex(
      DATABASE_ID,
      'bookings',
      'booking_datetime',
      'key',
      ['bookingDate', 'bookingTime']
    );
    
    // Index for booking status
    await databases.createIndex(
      DATABASE_ID,
      'bookings',
      'booking_status',
      'key',
      ['status']
    );
    
    console.log('✅ All indexes created successfully');
    
    console.log('🎉 Booking collection setup completed!');
    
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️ Bookings collection already exists');
    } else {
      console.error('❌ Error setting up booking collection:', error.message);
      throw error;
    }
  }
}

// Run the setup
setupBookingCollection()
  .then(() => {
    console.log('✅ Booking collection setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Booking collection setup failed:', error);
    process.exit(1);
  });
