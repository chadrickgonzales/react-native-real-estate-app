#!/usr/bin/env node

/**
 * Simple Database Seeding Script
 * 
 * This script provides manual instructions for seeding the database
 * with test data that works with all features.
 */

console.log('🌱 Real Estate App - Database Seeding Instructions\n');

console.log('📋 Manual Database Seeding Steps:\n');

console.log('🔧 Step 1: Clear Existing Data');
console.log('================================');
console.log('1. Go to your Appwrite Console (https://cloud.appwrite.io)');
console.log('2. Navigate to Database > Your Database');
console.log('3. For each collection (except "user"), delete all documents:');
console.log('   • Properties collection - Delete all properties');
console.log('   • Bookings collection - Delete all bookings (if exists)');
console.log('   • Reviews collection - Delete all reviews');
console.log('   • Galleries collection - Delete all galleries');
console.log('   • Agents collection - Delete all agents');
console.log('   • Chats collection - Delete all chats');
console.log('   • Messages collection - Delete all messages');
console.log('   • Saved Properties collection - Delete all saved properties');
console.log('   • Saved Searches collection - Delete all saved searches');
console.log('   • Notifications collection - Delete all notifications');
console.log('   • Notification Settings collection - Delete all settings\n');

console.log('🏠 Step 2: Create Test Properties');
console.log('=================================');
console.log('Create 20-30 properties with these details:\n');

console.log('📝 Property Template:');
console.log('• Name: "Beautiful Villa de Tarlac", "Modern Apartment in Tarlac", etc.');
console.log('• Type: House, Apartment, Villa, Condos, Studios, Townhomes');
console.log('• Property Type: "sell" or "rent"');
console.log('• Price: ₱2M-₱10M (sale) or ₱10k-₱40k (rent)');
console.log('• Address: "123 Rizal St, Tarlac City, Tarlac"');
console.log('• Description: "Beautiful property with modern amenities..."');
console.log('• Bedrooms: 1-5');
console.log('• Bathrooms: 1-4');
console.log('• Area: 500-3500 sq ft');
console.log('• Rating: 1-5 stars\n');

console.log('📞 Contact Information (Required for Bookings):');
console.log('• contactPhone: "+63-912-345-6789"');
console.log('• contactEmail: "owner@example.com"');
console.log('• ownerId: "owner_1", "owner_2", etc.');
console.log('• ownerName: "Juan Dela Cruz", "Maria Santos", etc.\n');

console.log('🏘️ Property Details:');
console.log('• yearBuilt: "2020", "2015", etc.');
console.log('• propertyAge: "4 years", "9 years", etc.');
console.log('• lotSize: "2000 sq ft", "5000 sq ft", etc.');
console.log('• propertyCondition: "New", "Excellent", "Good", "Fair"');
console.log('• parkingSpaces: "1", "2", "3", "4"\n');

console.log('💰 Financial Details:');
console.log('For Sale Properties:');
console.log('• hoaFees: "₱2000", "₱3500", etc.');
console.log('• propertyTaxes: "₱25000", "₱50000", etc.');
console.log('');
console.log('For Rental Properties:');
console.log('• leaseDuration: "12 months", "24 months", etc.');
console.log('• deposit: "₱15000", "₱25000", etc.');
console.log('• petDeposit: "₱3000", "₱5000", etc.');
console.log('• utilities: "Electricity, Water, Internet"');
console.log('• moveInRequirements: "Credit Check, References, Security Deposit"\n');

console.log('✅ Property Features (Boolean):');
console.log('• furnishedStatus: true/false');
console.log('• petFriendly: true/false');
console.log('• hasHOA: true/false');
console.log('• hasPool: true/false');
console.log('• hasGarage: true/false');
console.log('• utilitiesIncluded: true/false');
console.log('• smokingAllowed: true/false');
console.log('• backgroundCheckRequired: true/false\n');

console.log('📍 Location:');
console.log('• latitude: 15.4869 (Tarlac City center)');
console.log('• longitude: 120.5986 (Tarlac City center)');
console.log('• availableDate: "2024-01-15" (YYYY-MM-DD format)\n');

console.log('📅 Step 3: Create Test Bookings');
console.log('===============================');
console.log('Create 10-15 bookings with these details:\n');

console.log('📝 Booking Template:');
console.log('• userId: "user_1", "user_2", etc.');
console.log('• propertyId: Use actual property IDs from Step 2');
console.log('• propertyName: Use actual property names');
console.log('• propertyAddress: Use actual property addresses');
console.log('• propertyImage: Use actual property images');
console.log('• ownerId: Use actual owner IDs from properties');
console.log('• ownerName: Use actual owner names from properties');
console.log('• ownerEmail: Use actual owner emails from properties');
console.log('• ownerPhone: Use actual owner phones from properties');
console.log('• bookingDate: "2024-01-15", "2024-01-20", etc. (YYYY-MM-DD)');
console.log('• bookingTime: "09:00", "10:30", "14:00", "16:30" (HH:MM)');
console.log('• duration: 60 (minutes)');
console.log('• status: "pending", "confirmed", "cancelled", "completed"');
console.log('• totalAmount: Use actual property prices');
console.log('• currency: "PHP"');
console.log('• guests: 1, 2, 3, 4');
console.log('• specialRequests: "Need parking", "Wheelchair accessible", etc.');
console.log('• createdAt: Current timestamp');
console.log('• updatedAt: Current timestamp\n');

console.log('⭐ Step 4: Create Test Reviews');
console.log('=============================');
console.log('Create 15-20 reviews with these details:\n');

console.log('📝 Review Template:');
console.log('• propertyId: Use actual property IDs');
console.log('• userId: "user_1", "user_2", etc.');
console.log('• userName: "John Doe", "Jane Smith", etc.');
console.log('• rating: 1, 2, 3, 4, 5');
console.log('• reviewText: "Excellent property! Very clean and well-maintained."');
console.log('• createdAt: Current timestamp\n');

console.log('💬 Step 5: Create Test Chats (Optional)');
console.log('=====================================');
console.log('Create 5-10 chat conversations:\n');

console.log('📝 Chat Template:');
console.log('• propertyId: Use actual property IDs');
console.log('• buyerId: "user_1", "user_2", etc.');
console.log('• sellerId: Use actual owner IDs from properties');
console.log('• propertyName: Use actual property names');
console.log('• sellerName: Use actual owner names');
console.log('• sellerAvatar: "https://example.com/avatar.jpg"');
console.log('• lastMessage: "Is this property still available?"');
console.log('• lastMessageTime: Current timestamp');
console.log('• createdAt: Current timestamp');
console.log('• updatedAt: Current timestamp\n');

console.log('📨 Step 6: Create Test Messages (Optional)');
console.log('===========================================');
console.log('Create 20-30 messages for the chats:\n');

console.log('📝 Message Template:');
console.log('• chatId: Use actual chat IDs from Step 5');
console.log('• senderId: "user_1", "owner_1", etc.');
console.log('• senderName: "John Doe", "Juan Dela Cruz", etc.');
console.log('• senderAvatar: "https://example.com/avatar.jpg"');
console.log('• text: "Hello, is this property still available?"');
console.log('• timestamp: Current timestamp');
console.log('• isRead: true/false');
console.log('• createdAt: Current timestamp\n');

console.log('🎉 Step 7: Test All Features');
console.log('============================');
console.log('After seeding, test these features:');
console.log('• Property browsing and search');
console.log('• Property details page');
console.log('• Booking system and calendar');
console.log('• Time slot selection');
console.log('• Property reviews');
console.log('• Chat system');
console.log('• Saved properties');
console.log('• Notifications\n');

console.log('📊 Expected Results:');
console.log('• 20-30 properties with full details');
console.log('• 10-15 bookings (mix of past/future)');
console.log('• 15-20 property reviews');
console.log('• 5-10 chat conversations');
console.log('• 20-30 chat messages');
console.log('• All features working properly\n');

console.log('🚀 Your app will be fully functional with realistic test data!');
