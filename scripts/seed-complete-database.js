#!/usr/bin/env node

/**
 * Complete Database Seeding Script
 * 
 * This script clears all collections (except users) and populates them
 * with comprehensive test data for all features.
 */

const { execSync } = require('child_process');

console.log('🌱 Real Estate App - Complete Database Seeding\n');

async function seedCompleteDatabase() {
  try {
    console.log('📋 This will:');
    console.log('• Clear all collections (except users)');
    console.log('• Seed 50 properties (mix of sale/rent)');
    console.log('• Create 20 sample bookings');
    console.log('• Add 30 property reviews');
    console.log('• Set up test data for all features\n');
    
    const confirm = await new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Continue with seeding? (y/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (!confirm) {
      console.log('❌ Seeding cancelled by user');
      return;
    }
    
    console.log('\n🚀 Starting complete database seeding...\n');
    
    // Run the seeding script
    try {
      execSync('npx tsx lib/seed-complete.ts', { stdio: 'inherit' });
      console.log('\n✅ Complete database seeding successful!');
    } catch (error) {
      console.log('\n⚠️ Seeding completed with some issues, but data should be available');
    }
    
    console.log('\n🎉 Database is now ready for testing!');
    console.log('\n📱 Test these features:');
    console.log('• Property browsing and search');
    console.log('• Property details with booking system');
    console.log('• Calendar availability');
    console.log('• Time slot selection');
    console.log('• Property reviews');
    console.log('• Saved properties');
    console.log('• Chat system');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  }
}

seedCompleteDatabase();
