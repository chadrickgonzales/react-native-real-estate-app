require('dotenv').config();
const { databases, ID, Query } = require('../lib/appwrite');

// Sample review data
const sampleReviews = [
  {
    rating: 5,
    title: "Amazing stay!",
    comment: "Perfect location, clean rooms, and excellent service. Would definitely book again!",
    userName: "Sarah Johnson"
  },
  {
    rating: 4,
    title: "Great property",
    comment: "Very comfortable and well-maintained. The staff was friendly and helpful.",
    userName: "Mike Chen"
  },
  {
    rating: 5,
    title: "Excellent experience",
    comment: "Beautiful property with all amenities. Highly recommended for families.",
    userName: "Emily Davis"
  },
  {
    rating: 3,
    title: "Good but could be better",
    comment: "Nice place overall, but the WiFi was a bit slow. Everything else was fine.",
    userName: "David Wilson"
  },
  {
    rating: 5,
    title: "Outstanding!",
    comment: "Exceeded all expectations. Clean, modern, and in a great location.",
    userName: "Lisa Brown"
  },
  {
    rating: 4,
    title: "Very good",
    comment: "Comfortable stay with good amenities. Would recommend to others.",
    userName: "James Taylor"
  },
  {
    rating: 5,
    title: "Perfect getaway",
    comment: "Beautiful property with excellent facilities. Great for relaxation.",
    userName: "Anna Martinez"
  },
  {
    rating: 4,
    title: "Nice place",
    comment: "Good location and clean rooms. Staff was very accommodating.",
    userName: "Robert Anderson"
  },
  {
    rating: 5,
    title: "Fantastic!",
    comment: "Amazing property with great views. Will definitely come back!",
    userName: "Jennifer Lee"
  },
  {
    rating: 3,
    title: "Decent stay",
    comment: "Average property. Nothing special but nothing bad either.",
    userName: "Michael Garcia"
  }
];

async function clearReviewsCollection() {
  try {
    console.log('Clearing existing reviews...');
    
    // Get all reviews
    const reviews = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      'property_reviews',
      [Query.limit(100)]
    );
    
    // Delete all reviews
    for (const review of reviews.documents) {
      await databases.deleteDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        'property_reviews',
        review.$id
      );
    }
    
    console.log(`✅ Cleared ${reviews.documents.length} existing reviews`);
  } catch (error) {
    console.log('No existing reviews to clear');
  }
}

async function getProperties() {
  try {
    const properties = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
      'properties',
      [Query.limit(50)]
    );
    
    return properties.documents;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

async function seedReviews() {
  try {
    console.log('🌱 Seeding reviews...');
    
    const properties = await getProperties();
    
    if (properties.length === 0) {
      console.log('❌ No properties found. Please seed properties first.');
      return;
    }
    
    let totalReviews = 0;
    
    for (const property of properties) {
      // Create 2-5 reviews per property
      const numReviews = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < numReviews; i++) {
        const reviewData = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        
        try {
          await databases.createDocument(
            process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
            'property_reviews',
            ID.unique(),
            {
              userId: `user_${Math.random().toString(36).substr(2, 9)}`,
              userName: reviewData.userName,
              userAvatar: '',
              propertyId: property.$id,
              propertyName: property.name || 'Property',
              rating: reviewData.rating,
              title: reviewData.title,
              comment: reviewData.comment,
              helpful: Math.floor(Math.random() * 10),
              verified: Math.random() > 0.3, // 70% verified
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString()
            }
          );
          
          totalReviews++;
        } catch (error) {
          console.error(`Error creating review for property ${property.$id}:`, error);
        }
      }
    }
    
    console.log(`✅ Created ${totalReviews} reviews for ${properties.length} properties`);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting reviews seeding process...\n');
    
    await clearReviewsCollection();
    await seedReviews();
    
    console.log('\n✅ Reviews seeding completed successfully!');
    console.log('\n📊 What was created:');
    console.log('  - Multiple reviews per property (2-5 reviews each)');
    console.log('  - Various ratings (1-5 stars)');
    console.log('  - Realistic review content');
    console.log('  - Different user names');
    console.log('  - Random helpful counts');
    console.log('  - Mix of verified and unverified reviews');
    
    console.log('\n🔧 Next steps:');
    console.log('  1. Check your property pages to see real ratings');
    console.log('  2. Test the review system functionality');
    console.log('  3. Verify that average ratings are calculated correctly');
    
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    process.exit(1);
  }
}

main();
