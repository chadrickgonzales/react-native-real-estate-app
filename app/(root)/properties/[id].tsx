import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import images from "@/constants/images";

import { getPropertyById } from "@/lib/appwrite";
import { createImageSource } from "@/lib/imageUtils";
import { useAppwrite } from "@/lib/useAppwrite";

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [imageError, setImageError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const windowHeight = Dimensions.get("window").height;

  const { data: property, loading } = useAppwrite({
    fn: getPropertyById,
    params: {
      id: id!,
    },
  });

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg font-rubik">Loading property...</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg font-rubik">Property not found</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-rubik-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Hero Image Section */}
      <View className="relative" style={{ height: windowHeight * 0.4 }}>
        <Image
          source={
            !imageError && property?.image 
              ? createImageSource(property.image) 
              : images.newYork
          }
          className="w-full h-full"
          resizeMode="cover"
          onError={() => {
            console.log('Hero image load error, using fallback');
            setImageError(true);
          }}
        />
        
        {/* Navigation Overlay */}
        <View className="absolute top-10 left-0 right-0 z-10 px-5" style={{ paddingTop: 50 }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center">
              <Ionicons name="heart-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Counter */}
        <View className="absolute bottom-10 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <Text className="text-white text-sm font-rubik-medium">1/29</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View className="bg-white rounded-t-3xl" style={{ height: windowHeight * 0.7, marginTop: -24 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-60 mt-5"
        >
          <View className="px-6 pt-1">
            {/* Property Address */}
            <Text className="text-2xl font-rubik-bold text-black mb-2">
              {property?.address || "1301 Montego, Walnut Creek, CA 94598"}
            </Text>
            
            <Text className="text-black font-rubik  mb-1">
              Entire cabin in berkeley springs, west virginia
            </Text>
            
            <Text className="text-sm font-rubik text-gray-600 mb-4">
              4 guests · 2 bedrooms · 2 beds · 2 baths
            </Text>

            {/* Ratings Section */}
            <View className="flex-row items-center justify-between mb-4 bg-gray-100 rounded-2xl p-4">
              <View className="flex-col items-center">
                <Text className="text-xl font-rubik-medium text-black">4.98</Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons 
                      key={star} 
                      name="star" 
                      size={14} 
                      color="#FFD700" 
                    />
                  ))}
                </View>
              </View>
              
              <View className="items-center border-l border-r border-gray-00 px-10">
                <Ionicons name="link" size={20} color="#666" />
                <Text className="text-sm font-rubik text-gray-600 mt-1">Guest favorite</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-xl font-rubik-medium text-black">239</Text>
                <Text className="text-sm font-rubik text-gray-600">Reviews</Text>
              </View>
            </View>

            {/* Lower Price Section */}
            <View className="  mb-4">
              <Text className="text-medium font-rubik-medium text-black mb-1">Lower price</Text>
              <Text className="text-sm font-rubik text-gray-600">
                Your dates are $2,195 less than the avg. nightly rate of the last 30 days.
              </Text>
            </View>

            {/* Saved to Location */}
            <View className="flex-row items-center justify-between bg-gray-100 rounded-2xl p-4 mb-4">
               <View className="flex-row items-center">
                 <Image
                   source={
                     !thumbnailError && property?.image 
                       ? createImageSource(property.image) 
                       : images.newYork
                   }
                   className="w-12 h-12 rounded-lg mr-3"
                   onError={() => {
                     console.log('Thumbnail image load error, using fallback');
                     setThumbnailError(true);
                   }}
                 />
                 <Text className="text-base font-rubik text-black">Saved to Walnut creek</Text>
               </View>
               <TouchableOpacity>
                 <Text className="text-blue-600 font-rubik-medium">Change</Text>
               </TouchableOpacity>
             </View>

            {/* Property Details */}
            <View className="mb-4">
              <Text className="text-medium font-rubik-medium text-black mb-3">About this place</Text>
              <Text className="text-sm font-rubik text-gray-600 leading-6">
                {property?.description || "Experience luxury living in this stunning modern home featuring panoramic views, premium finishes, and resort-style amenities. Perfect for families seeking comfort and elegance."}
              </Text>
            </View>

            {/* Amenities */}
            <View className="mb-4">
              <Text className="text-medium font-rubik-medium text-black mb-3">What this place offers</Text>
              <View className="flex-row flex-wrap">
                {['WiFi', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Laundry'].map((amenity, index) => (
                  <View key={index} className="w-1/2 flex-row items-center mb-3">
                    <Ionicons name="checkmark" size={16} color="#22C55E" />
                    <Text className="text-base font-rubik text-gray-600 ml-2">{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reviews Preview */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text className="text-medium font-rubik-medium text-black ml-2">4.98 · 239 reviews</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-rubik-medium">Show all</Text>
                </TouchableOpacity>
              </View>
              
              {/* Sample Review */}
              <View className="bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center mb-2">
                  <Image
                    source={images.avatar}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View>
                    <Text className="font-rubik-bold text-black">Sarah M.</Text>
                    <Text className="text-sm font-rubik text-gray-600">March 2024</Text>
                  </View>
                </View>
                 <Text className="text-base font-rubik text-gray-600">
                   &ldquo;Absolutely stunning property! The views were incredible and the amenities were top-notch. Highly recommend!&rdquo;
                 </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View className="absolute bottom-20 left-0 right-0 bg-white px-6 py-4" style={{ paddingBottom: 34 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-rubik-medium text-black ml-4">
                {formatPrice(property?.price || 2195)}/mo
              </Text>
              <View className="flex-row items-center mt-1 bg-gray-100 rounded-full px-4 py-1 shadow-md">
                <Text className="text-sm font-rubik text-black-300 ml-1">Free cancellation</Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-blue-600 rounded-full px-8 py-4">
              <Text className="text-white font-rubik text-medium">Request to chat</Text>
            </TouchableOpacity>
          </View>
        </View>
       </View>
     </View>
   );
 };

export default Property;