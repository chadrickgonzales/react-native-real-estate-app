import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGlobalContext } from "@/lib/global-provider";
import { getPropertyReviews, getPropertyReviewStats, createPropertyReview, markReviewHelpful } from "@/lib/reviews";
import { canUserReviewProperty } from "@/lib/reviews";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";

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
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-rubik-bold text-gray-900">Reviews</Text>
        </View>
        {canReview && (
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => setShowReviewForm(true)}
          >
            <Text className="text-white font-rubik-bold">Write Review</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Review Stats */}
        {stats && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-3xl font-rubik-bold text-gray-900 mr-2">
                  {stats.averageRating.toFixed(1)}
                </Text>
                <View className="flex-row">
                  {renderStars(Math.round(stats.averageRating), 20)}
                </View>
              </View>
              <Text className="text-gray-600 font-rubik">
                {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </Text>
            </View>
            
            <View className="flex-row">
              <View className="flex-1">
                {renderRatingDistribution()}
              </View>
            </View>
          </View>
        )}

        {/* Reviews List */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-rubik-bold text-gray-900 mb-4">
            All Reviews ({reviews.length})
          </Text>
          
          {reviews.length > 0 ? (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => (
                <ReviewCard
                  review={item}
                  onHelpful={handleMarkHelpful}
                  showHelpful={true}
                />
              )}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center py-8">
              <Ionicons name="star-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 font-rubik text-center mt-4">No reviews yet</Text>
              <Text className="text-gray-400 font-rubik text-center">Be the first to review this property</Text>
            </View>
          )}
        </View>
      </ScrollView>

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
