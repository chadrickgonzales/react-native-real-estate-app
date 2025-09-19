#!/usr/bin/env node

/**
 * Manual Bookings Collection Creation
 * 
 * This script provides the exact steps to create the bookings collection
 * manually in the Appwrite Console.
 */

console.log('📅 Manual Bookings Collection Setup\n');

console.log('🔧 Create the "bookings" collection manually in Appwrite Console:\n');

console.log('📋 Step 1: Go to Appwrite Console');
console.log('1. Go to https://cloud.appwrite.io');
console.log('2. Navigate to Database > Your Database');
console.log('3. Click "+ Create table"');
console.log('4. Name it: "bookings"\n');

console.log('📋 Step 2: Add these attributes to the bookings collection:\n');

const attributes = [
  { name: 'userId', type: 'String', size: '255', required: true },
  { name: 'propertyId', type: 'String', size: '255', required: true },
  { name: 'propertyName', type: 'String', size: '255', required: true },
  { name: 'propertyAddress', type: 'String', size: '500', required: true },
  { name: 'propertyImage', type: 'String', size: '1000', required: true },
  { name: 'ownerId', type: 'String', size: '255', required: true },
  { name: 'ownerName', type: 'String', size: '255', required: true },
  { name: 'ownerEmail', type: 'String', size: '255', required: true },
  { name: 'ownerPhone', type: 'String', size: '20', required: true },
  { name: 'bookingDate', type: 'String', size: '10', required: true },
  { name: 'bookingTime', type: 'String', size: '5', required: true },
  { name: 'duration', type: 'Integer', size: '', required: true },
  { name: 'status', type: 'Enum', size: 'pending,confirmed,cancelled,completed', required: true },
  { name: 'totalAmount', type: 'Integer', size: '', required: true },
  { name: 'currency', type: 'String', size: '3', required: true },
  { name: 'guests', type: 'Integer', size: '', required: true },
  { name: 'specialRequests', type: 'String', size: '1000', required: false },
  { name: 'cancellationReason', type: 'String', size: '500', required: false },
  { name: 'createdAt', type: 'DateTime', size: '', required: true },
  { name: 'updatedAt', type: 'DateTime', size: '', required: true }
];

console.log('For each attribute, click "Create Attribute" and set:\n');

attributes.forEach((attr, index) => {
  console.log(`${index + 1}. ${attr.name}:`);
  console.log(`   - Type: ${attr.type}`);
  if (attr.size) console.log(`   - Size: ${attr.size}`);
  console.log(`   - Required: ${attr.required}`);
  console.log('');
});

console.log('📋 Step 3: Set Collection Permissions');
console.log('Set these permissions for the bookings collection:');
console.log('• Create: users (authenticated users can create bookings)');
console.log('• Read: users (users can read their own bookings)');
console.log('• Update: users (users can update their own bookings)');
console.log('• Delete: users (users can delete their own bookings)\n');

console.log('📋 Step 4: Create Indexes (Optional but Recommended)');
console.log('Create these indexes for better performance:');
console.log('• Index: propertyId');
console.log('• Index: userId');
console.log('• Index: bookingDate');
console.log('• Index: status');
console.log('• Composite: propertyId, bookingDate, bookingTime\n');

console.log('🎉 Once you create the bookings collection with these attributes,');
console.log('the booking system will work perfectly!\n');

console.log('🧪 Test the booking system by:');
console.log('1. Opening a property details page');
console.log('2. Clicking on an available date');
console.log('3. Selecting a time slot');
console.log('4. Confirming the booking');
