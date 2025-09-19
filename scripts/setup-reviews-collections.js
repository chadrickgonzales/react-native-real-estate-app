require('dotenv').config();
const { databases, ID, Query } = require('../lib/appwrite');

async function setupPropertyReviewsCollection() {
  try {
    console.log('Setting up property_reviews collection...');
    
    // Create property_reviews collection
    const propertyReviewsCollection = await databases.createCollection(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      'property_reviews',
      'Property Reviews',
      [
        { key: 'userId', type: 'string', size: 255, required: true, array: false },
        { key: 'userName', type: 'string', size: 255, required: true, array: false },
        { key: 'userAvatar', type: 'string', size: 1000, required: false, array: false },
        { key: 'propertyId', type: 'string', size: 255, required: true, array: false },
        { key: 'propertyName', type: 'string', size: 255, required: true, array: false },
        { key: 'rating', type: 'integer', required: true, array: false },
        { key: 'title', type: 'string', size: 255, required: true, array: false },
        { key: 'comment', type: 'string', size: 2000, required: true, array: false },
        { key: 'helpful', type: 'integer', required: true, array: false },
        { key: 'verified', type: 'boolean', required: true, array: false },
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

    console.log('✅ property_reviews collection created successfully');
    return propertyReviewsCollection;
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ property_reviews collection already exists');
      return null;
    }
    throw error;
  }
}

async function setupUserReviewsCollection() {
  try {
    console.log('Setting up user_reviews collection...');
    
    // Create user_reviews collection
    const userReviewsCollection = await databases.createCollection(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      'user_reviews',
      'User Reviews',
      [
        { key: 'reviewerId', type: 'string', size: 255, required: true, array: false },
        { key: 'reviewerName', type: 'string', size: 255, required: true, array: false },
        { key: 'reviewerAvatar', type: 'string', size: 1000, required: false, array: false },
        { key: 'userId', type: 'string', size: 255, required: true, array: false },
        { key: 'rating', type: 'integer', required: true, array: false },
        { key: 'title', type: 'string', size: 255, required: true, array: false },
        { key: 'comment', type: 'string', size: 2000, required: true, array: false },
        { key: 'helpful', type: 'integer', required: true, array: false },
        { key: 'verified', type: 'boolean', required: true, array: false },
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

    console.log('✅ user_reviews collection created successfully');
    return userReviewsCollection;
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ user_reviews collection already exists');
      return null;
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Setting up Reviews Collections...\n');
    
    await setupPropertyReviewsCollection();
    await setupUserReviewsCollection();
    
    console.log('\n✅ All reviews collections setup completed!');
    console.log('\n📋 Collections created:');
    console.log('  - property_reviews: For property ratings and reviews');
    console.log('  - user_reviews: For user ratings and reviews');
    
    console.log('\n🔧 Next steps:');
    console.log('  1. Run the seed script to populate with sample data');
    console.log('  2. Test the rating system in your app');
    console.log('  3. Verify that ratings display correctly on property pages');
    
  } catch (error) {
    console.error('❌ Error setting up reviews collections:', error);
    process.exit(1);
  }
}

main();
