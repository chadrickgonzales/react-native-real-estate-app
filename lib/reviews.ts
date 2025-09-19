import { databases, ID, Query } from './appwrite';

export interface Review {
  $id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  propertyId: string;
  propertyName: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserReview {
  $id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  userId: string; // User being reviewed
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create a property review
export async function createPropertyReview({
  userId,
  userName,
  userAvatar,
  propertyId,
  propertyName,
  rating,
  title,
  comment
}: {
  userId: string;
  userName: string;
  userAvatar?: string;
  propertyId: string;
  propertyName: string;
  rating: number;
  title: string;
  comment: string;
}) {
  try {
    // Check if user has already reviewed this property
    const existingReview = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      [
        Query.equal("userId", userId),
        Query.equal("propertyId", propertyId)
      ]
    );

    if (existingReview.documents.length > 0) {
      throw new Error("You have already reviewed this property");
    }

    const review = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      ID.unique(),
      {
        userId,
        userName,
        userAvatar: userAvatar || '',
        propertyId,
        propertyName,
        rating,
        title,
        comment,
        helpful: 0,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return { success: true, data: review };
  } catch (error: any) {
    console.error("Error creating property review:", error);
    throw error;
  }
}

// Create a user review
export async function createUserReview({
  reviewerId,
  reviewerName,
  reviewerAvatar,
  userId,
  rating,
  title,
  comment
}: {
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
}) {
  try {
    // Check if reviewer has already reviewed this user
    const existingReview = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "user_reviews",
      [
        Query.equal("reviewerId", reviewerId),
        Query.equal("userId", userId)
      ]
    );

    if (existingReview.documents.length > 0) {
      throw new Error("You have already reviewed this user");
    }

    const review = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "user_reviews",
      ID.unique(),
      {
        reviewerId,
        reviewerName,
        reviewerAvatar: reviewerAvatar || '',
        userId,
        rating,
        title,
        comment,
        helpful: 0,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return { success: true, data: review };
  } catch (error: any) {
    console.error("Error creating user review:", error);
    throw error;
  }
}

// Get property reviews
export async function getPropertyReviews(propertyId: string, limit: number = 50) {
  try {
    const reviews = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      [
        Query.equal("propertyId", propertyId),
        Query.orderDesc("createdAt"),
        Query.limit(limit)
      ]
    );

    return reviews.documents as Review[];
  } catch (error: any) {
    console.error("Error fetching property reviews:", error);
    throw error;
  }
}

// Get user reviews
export async function getUserReviews(userId: string, limit: number = 50) {
  try {
    const reviews = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "user_reviews",
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(limit)
      ]
    );

    return reviews.documents as UserReview[];
  } catch (error: any) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
}

// Get user's reviews given
export async function getUserReviewsGiven(userId: string, limit: number = 50) {
  try {
    const reviews = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "user_reviews",
      [
        Query.equal("reviewerId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(limit)
      ]
    );

    return reviews.documents as UserReview[];
  } catch (error: any) {
    console.error("Error fetching user reviews given:", error);
    throw error;
  }
}

// Get property review statistics
export async function getPropertyReviewStats(propertyId: string) {
  try {
    const reviews = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      [
        Query.equal("propertyId", propertyId)
      ]
    );

    const reviewData = reviews.documents as Review[];
    
    if (reviewData.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = reviewData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewData.length;
    
    const ratingDistribution = reviewData.reduce((dist, review) => {
      dist[review.rating as keyof typeof dist]++;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewData.length,
      ratingDistribution
    };
  } catch (error: any) {
    console.error("Error fetching property review stats:", error);
    throw error;
  }
}

// Get user review statistics
export async function getUserReviewStats(userId: string) {
  try {
    const reviews = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "user_reviews",
      [
        Query.equal("userId", userId)
      ]
    );

    const reviewData = reviews.documents as UserReview[];
    
    if (reviewData.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = reviewData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewData.length;
    
    const ratingDistribution = reviewData.reduce((dist, review) => {
      dist[review.rating as keyof typeof dist]++;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewData.length,
      ratingDistribution
    };
  } catch (error: any) {
    console.error("Error fetching user review stats:", error);
    throw error;
  }
}

// Mark review as helpful
export async function markReviewHelpful(reviewId: string, isHelpful: boolean) {
  try {
    const review = await databases.getDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      reviewId
    );

    const newHelpfulCount = isHelpful ? review.helpful + 1 : Math.max(0, review.helpful - 1);

    const updatedReview = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      reviewId,
      {
        helpful: newHelpfulCount,
        updatedAt: new Date().toISOString(),
      }
    );

    return { success: true, data: updatedReview };
  } catch (error: any) {
    console.error("Error marking review as helpful:", error);
    throw error;
  }
}

// Update review
export async function updateReview(reviewId: string, updates: {
  rating?: number;
  title?: string;
  comment?: string;
}) {
  try {
    const updatedReview = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      reviewId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return { success: true, data: updatedReview };
  } catch (error: any) {
    console.error("Error updating review:", error);
    throw error;
  }
}

// Delete review
export async function deleteReview(reviewId: string) {
  try {
    await databases.deleteDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "property_reviews",
      reviewId
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

// Check if user can review property (has booked it)
export async function canUserReviewProperty(userId: string, propertyId: string) {
  try {
    const bookings = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      [
        Query.equal("userId", userId),
        Query.equal("propertyId", propertyId),
        Query.equal("status", "completed")
      ]
    );

    return bookings.documents.length > 0;
  } catch (error: any) {
    console.error("Error checking review eligibility:", error);
    return false;
  }
}

// Check if user can review another user (has interacted with them)
export async function canUserReviewUser(reviewerId: string, userId: string) {
  try {
    // Check if they have had any bookings together
    const bookings = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      [
        Query.equal("userId", reviewerId),
        Query.equal("ownerId", userId),
        Query.equal("status", "completed")
      ]
    );

    return bookings.documents.length > 0;
  } catch (error: any) {
    console.error("Error checking user review eligibility:", error);
    return false;
  }
}
