#!/usr/bin/env node

/**
 * Test Booking Message Format
 * 
 * This script tests the new booking message format
 */

console.log('🧪 Testing booking message format...\n');

// Simulate the new message format
const bookingId = 'test_booking_123';
const propertyName = 'Beautiful Apartment';

const newFormatMessage = `BOOKING_REQUEST:${bookingId}:${propertyName}`;
console.log('✅ New format message:', newFormatMessage);

// Test parsing
const parts = newFormatMessage.split(':');
console.log('📋 Parsed parts:', parts);
console.log('📋 Booking ID:', parts[1]);
console.log('📋 Property Name:', parts[2]);

// Test old format detection
const oldFormatMessage = 'BOOKING_REQUEST:{"$id":"68f5b22b003d3abc040...","propertyName":"Property Name"}';
console.log('\n🔍 Old format message:', oldFormatMessage);
console.log('🔍 Contains JSON?', oldFormatMessage.includes(':{') || oldFormatMessage.includes('"$id"'));

console.log('\n🎉 Test completed!');
