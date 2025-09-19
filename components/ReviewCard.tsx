import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { createImageSource } from "@/lib/imageUtils";

interface ReviewCardProps {
  review: {
    $id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    comment: string;
    helpful: number;
    verified: boolean;
    createdAt: string;
  };
  onHelpful?: (reviewId: string, isHelpful: boolean) => void;
  showHelpful?: boolean;
}

const ReviewCard = ({ review, onHelpful, showHelpful = true }: ReviewCardProps) => {
  const [helpfulPressed, setHelpfulPressed] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color="#F59E0B"
      />
    ));
  };

  const handleHelpful = () => {
    if (onHelpful) {
      const newHelpfulState = !helpfulPressed;
      setHelpfulPressed(newHelpfulState);
      onHelpful(review.$id, newHelpfulState);
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
            {review.userAvatar ? (
              <Image
                source={createImageSource(review.userAvatar)}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={20} color="#6B7280" />
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-rubik-bold text-gray-900 mr-2">{review.userName}</Text>
              {review.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              )}
            </View>
            <View className="flex-row items-center">
              {renderStars(review.rating)}
              <Text className="text-gray-500 font-rubik text-sm ml-2">
                {formatDate(review.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Review Content */}
      <View className="mb-3">
        <Text className="font-rubik-bold text-gray-900 mb-2">{review.title}</Text>
        <Text className="text-gray-700 font-rubik leading-5">{review.comment}</Text>
      </View>

      {/* Helpful Section */}
      {showHelpful && (
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleHelpful}
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              helpfulPressed ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Ionicons 
              name="thumbs-up" 
              size={16} 
              color={helpfulPressed ? "#3B82F6" : "#6B7280"} 
            />
            <Text className={`font-rubik-medium ml-2 ${
              helpfulPressed ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Helpful ({review.helpful})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ReviewCard;
