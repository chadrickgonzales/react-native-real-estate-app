import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface ReviewFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: {
    rating: number;
    title: string;
    comment: string;
  }) => void;
  loading?: boolean;
  propertyName?: string;
}

const ReviewForm = ({ visible, onClose, onSubmit, loading = false, propertyName }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a review title');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    onSubmit({ rating, title: title.trim(), comment: comment.trim() });
  };

  const handleClose = () => {
    setRating(0);
    setTitle('');
    setComment('');
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setRating(index + 1)}
        className="mr-1"
      >
        <Ionicons
          name={index < rating ? "star" : "star-outline"}
          size={32}
          color="#F59E0B"
        />
      </TouchableOpacity>
    ));
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select a rating";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white rounded-t-3xl">
        <ScrollView className="flex-1 px-4 py-4">
          {/* Header inside modal */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-rubik-bold text-gray-900">Write Review</Text>
            <View className="w-16" />
          </View>

          {/* Property Info */}
          {propertyName && (
            <View className="mb-6">
              <Text className="font-rubik-bold text-lg text-gray-900 mb-1">{propertyName}</Text>
              <Text className="text-gray-600 font-rubik">Share your experience</Text>
            </View>
          )}

          {/* Rating Section */}
          <View className="mb-6">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Overall Rating</Text>
            <View className="flex-row items-center mb-2">
              {renderStars()}
            </View>
            <Text className="text-gray-600 font-rubik">{getRatingText()}</Text>
          </View>

          {/* Title Section */}
          <View className="mb-6">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Review Title</Text>
            <TextInput
              className="bg-gray-100 rounded-full px-3 py-3 text-gray-900 font-rubik"
              placeholder="Summarize your experience"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text className="text-gray-500 font-rubik text-sm mt-1">
              {title.length}/100 characters
            </Text>
          </View>

          {/* Comment Section */}
          <View className="mb-6">
            <Text className="font-rubik-bold text-lg text-gray-900 mb-3">Your Review</Text>
            <TextInput
              className="bg-gray-100 rounded-full px-3 py-3 text-gray-900 font-rubik"
              placeholder="Tell others about your experience..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text className="text-gray-500 font-rubik text-sm mt-1">
              {comment.length}/1000 characters
            </Text>
          </View>

          {/* Guidelines */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="text-blue-600 font-rubik-bold ml-2">Review Guidelines</Text>
            </View>
            <Text className="text-blue-700 font-rubik text-sm">
              • Be honest and specific about your experience{'\n'}
              • Focus on the property and your stay{'\n'}
              • Avoid personal information or inappropriate content{'\n'}
              • Your review helps other users make informed decisions
            </Text>
          </View>

        </ScrollView>
        
        {/* Submit Button - Fixed at bottom */}
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading || rating === 0}
            className={`py-4 rounded-full ${
              loading || rating === 0 ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            <Text className={`font-rubik-bold text-center text-lg ${
              loading || rating === 0 ? 'text-gray-500' : 'text-white'
            }`}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewForm;
