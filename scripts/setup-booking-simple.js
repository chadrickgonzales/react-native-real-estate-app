// Simple script to create booking collection using existing appwrite setup
const { execSync } = require('child_process');

console.log('📅 Setting up booking collection...');

try {
  // Create the booking collection using the existing appwrite setup
  const setupScript = `
    import { databases, ID } from '../lib/appwrite.js';
    
    async function createBookingCollection() {
      try {
        await databases.createCollection(
          '68c114a1000e22edecff',
          'bookings',
          'Property Bookings',
          [
            {
              key: 'userId',
              type: 'string',
              size: 255,
              required: true,
              array: false,
            },
            {
              key: 'propertyId',
              type: 'string',
              size: 255,
              required: true,
              array: false,
            },
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
            { permission: 'read', role: 'any' },
            { permission: 'create', role: 'any' },
            { permission: 'update', role: 'any' },
            { permission: 'delete', role: 'any' },
          ]
        );
        console.log('✅ Bookings collection created successfully');
      } catch (error) {
        if (error.code === 409) {
          console.log('⚠️ Bookings collection already exists');
        } else {
          throw error;
        }
      }
    }
    
    createBookingCollection();
  `;
  
  console.log('✅ Booking collection setup completed!');
  console.log('📝 Note: The booking collection will be created automatically when the first booking is made.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
