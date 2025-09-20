import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ReviewForm from "@/components/ReviewForm";
import { useGlobalContext } from "@/lib/global-provider";
import { canUserReviewProperty, createPropertyReview, getPropertyReviews, getPropertyReviewStats, markReviewHelpful } from "@/lib/reviews";

const PropertyReviews = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useGlobalContext();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadReviews();
      checkReviewEligibility();
    }
  }, [id, user]);

  const loadReviews = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        getPropertyReviews(id),
        getPropertyReviewStats(id)
      ]);
      
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    if (!user || !id) return;
    
    try {
      const eligible = await canUserReviewProperty(user.$id, id);
      setCanReview(eligible);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const handleSubmitReview = async (reviewData: { rating: number; title: string; comment: string }) => {
    if (!user || !id) return;
    
    setSubmittingReview(true);
    
    try {
      await createPropertyReview({
        userId: user.$id,
        userName: user.name || 'Anonymous',
        userAvatar: user.avatar,
        propertyId: id,
        propertyName: 'Property', // This should be fetched from property data
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment
      });
      
      setShowReviewForm(false);
      await loadReviews(); // Refresh reviews
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      await markReviewHelpful(reviewId, isHelpful);
      // Refresh the specific review or all reviews
      await loadReviews();
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={size}
        color="#F59E0B"
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats?.ratingDistribution) return null;
    
    return (
      <View className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <View key={rating} className="flex-row items-center">
              <Text className="text-gray-600 font-rubik w-6">{rating}</Text>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <View className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                <View 
                  className="bg-yellow-400 rounded-full h-2"
                  style={{ width: `${percentage}%` }}
                />
              </View>
              <Text className="text-gray-600 font-rubik text-sm w-8">{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderRatingBreakdown = () => {
    if (!stats?.ratingDistribution) return null;
    
    const categories = [
      { label: 'Excellent', rating: 5, color: '#10B981' },
      { label: 'Good', rating: 4, color: '#3B82F6' },
      { label: 'Average', rating: 3, color: '#F59E0B' },
      { label: 'Poor', rating: 2, color: '#EF4444' }
    ];
    
    return (
      <View className="space-y-3">
        {categories.map((category) => {
          const count = stats.ratingDistribution[category.rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <View key={category.rating} className="flex-row items-center">
              <Text className="text-gray-600 font-rubik w-20">{category.label}</Text>
              <View className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
                <View 
                  className="rounded-full h-3"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: category.color
                  }}
                />
              </View>
              <Text className="text-gray-600 font-rubik text-sm w-8">{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="hourglass" size={48} color="#3B82F6" />
          <Text className="text-gray-600 font-rubik mt-4">Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header in ScrollView */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mr-3"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-rubik-bold text-gray-900">Customer Feedback</Text>
          </View>
        </View>
        {/* Overall Rating */}
        <View className="px-4 py-6">
          <Text className="text-lg font-rubik-semibold text-gray-900 text-center mb-2">Overall Rating</Text>
          
          <Text className="text-7xl font-rubik-bold text-gray-900 text-center mb-3">
            {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
          </Text>
          
          <View className="flex-row justify-center mb-3">
            {renderStars(Math.round(stats?.averageRating || 0), 20)}
          </View>
          
          <Text className="text-gray-600 font-rubik text-center">
            Based on {stats?.totalReviews || 0} reviews
          </Text>
        </View>

        {/* Rating Breakdown */}
        <View className="px-4 py-1 mr-6 ml-6">
          {renderRatingBreakdown()}
        </View>

        {/* Individual Reviews */}
        <View className="px-4 py-6">
          <Text className="text-lg font-rubik-bold text-gray-900 mb-4">
            Customer Reviews ({reviews.length})
          </Text>
          
          {reviews.length > 0 ? (
            <View>
              {reviews.map((item, index) => (
                <View key={item.$id} className={`${index < reviews.length - 1 ? 'mb-6 pb-4 border-b border-gray-100' : 'mb-6'}`}>
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                      {item.userAvatar ? (
                        <Image
                          source={{ uri: item.userAvatar }}
                          className="w-10 h-10 rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="person" size={20} color="#6B7280" />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-rubik-bold text-gray-900">{item.userName}</Text>
                        <Text className="text-gray-500 font-rubik text-sm">
                          {formatDate(item.createdAt)}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <View className="flex-row mr-2">
                          {renderStars(item.rating, 16)}
                        </View>
                        <Text className="text-gray-600 font-rubik text-sm">
                          ({item.rating}.0)
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text className="text-gray-700 font-rubik leading-5">
                    {item.comment}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Ionicons name="star-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 font-rubik text-center mt-4">No reviews yet</Text>
              <Text className="text-gray-400 font-rubik text-center">Be the first to review this property</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Floating Write Review Button */}
      {user && (
        <View className="absolute bottom-8 left-4 right-4">
          <TouchableOpacity 
            className="bg-green-500 py-4 rounded-full shadow-lg"
            onPress={() => setShowReviewForm(true)}
          >
            <Text className="text-white font-rubik-bold text-center text-lg">Write a review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Review Form Modal */}
      <ReviewForm
        visible={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onSubmit={handleSubmitReview}
        loading={submittingReview}
        propertyName="Property"
      />
    </SafeAreaView>
  );
};

export default PropertyReviews;
