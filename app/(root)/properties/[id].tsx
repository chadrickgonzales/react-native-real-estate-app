import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";

import { getPropertyById } from "@/lib/appwrite";
import { createImageSource } from "@/lib/imageUtils";
import { useAppwrite } from "@/lib/useAppwrite";

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex] = useState(0);

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

  const getPropertyTypeDisplay = () => {
    if (property?.propertyType === 'sell') return 'Home in';
    if (property?.propertyType === 'rent') return 'Rental in';
    return 'Property in';
  };

  const getLocationFromAddress = (address: string) => {
    if (!address) return 'Location';
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return address;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-lg font-rubik">Loading property...</Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-lg font-rubik">Property not found</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-rubik-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentImage = property.images && property.images.length > 0 
    ? property.images[currentImageIndex] 
    : property.image;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Decorative Arc Shape */}
     
      
      {/* Floating Navigation Buttons */}
      <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md">
          <Ionicons name="ellipsis-vertical" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Hero Image Card */}
        <View className="mx-6 mt-20 mb-6">
          <View className="bg-white rounded-3xl  overflow-hidden" style={{ height: windowHeight * 0.4, backgroundColor: '#FFFFFF' }}>
            <View className="relative">
              <Image
                source={
                  !imageError && currentImage
                    ? createImageSource(currentImage)
                    : images.newYork
                }
                className="w-full h-full bg-white"
                resizeMode="cover"
                onError={() => {
                  console.log('Hero image load error, using fallback');
                  setImageError(true);
                }}
              />
              <View className="absolute inset-0 bg-white/0" />
            </View>
            
            
            
           
            {/* Favorite Button with White Background */}
            <View className="absolute bottom-5 right-5">
             
                {/* Background Image */}
                <Image 
                  source={require('@/assets/images/Group 1.png')} 
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    right: -30,
                    width: 152,
                    height: 152,
                   
                  }}
                  resizeMode="cover"
                />
              
             
              
              {/* Teal Heart Button */}
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  width: 75,
                  height: 75,
                  backgroundColor: '#14b8a6',
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                 
                }}
              >
                <Ionicons name="heart-outline" size={35} color="white" />
              </TouchableOpacity>
            </View>

            {/* Image Indicators */}
            {property.images && property.images.length > 1 && (
              <View className="absolute bottom-6 left-6 flex-row space-x-2">
                {property.images.map((_: any, index: number) => (
                  <View
                    key={index}
                    className={`rounded-full ${
                      index === currentImageIndex ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-gray-400'
                    }`}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Property Details Card */}
        <View className=" mb-6">
          <View className="bg-white rounded-3xl shadow-lg p-6">
              {/* Title and Rating */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-2xl font-rubik-bold text-gray-900 flex-1">
                  Home in Dickinson
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-600 font-rubik-medium ml-1">
                    {property.rating || '4.5'}
                  </Text>
                </View>
              </View>

            {/* Location and Price */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center flex-1">
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 font-rubik ml-2 flex-1" numberOfLines={1}>
                  {property.address || 'Address not specified'}
                </Text>
              </View>
              <Text className="text-2xl font-rubik-bold text-gray-900">
                {formatPrice(property.price)}
              </Text>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-lg font-rubik-bold text-gray-900 mb-3">Description</Text>
              <Text className="text-gray-600 font-rubik leading-6">
                {property.description || 'This exquisitely engineered property is a masterpiece of superior craftsmanship and modern design.'}
                <Text className="text-blue-600 font-rubik-medium"> more</Text>
              </Text>
            </View>

            {/* Facilities */}
            <View className="mb-4">
              <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Facilities</Text>
              <FlatList
                data={[
                  { icon: 'bed-outline', text: `${property.bedrooms || 0} Beds` },
                  { icon: 'water-outline', text: `${property.bathrooms || 0} Baths` },
                  { icon: 'restaurant-outline', text: `${property.kitchens || 1} Kitchen` },
                  { icon: 'resize-outline', text: `${property.area || 0} sq ft` },
                  { icon: 'car-outline', text: `${property.parkingSpaces || 1} Parking` },
                  { icon: 'calendar-outline', text: 'Available Now' }
                ]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View className="mr-4">
                    <View className="flex-row items-center bg-gray-50 rounded-full px-4 py-2">
                      <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                      <Text className="text-gray-600 font-rubik ml-2">
                        {item.text}
                      </Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 0 }}
              />
            </View>

            {/* Property Details - Buying */}
            {property.propertyType === 'sell' && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Property Details</Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Year Built</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.yearBuilt || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Property Age</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.propertyAge || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Lot Size</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.lotSize || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Condition</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.propertyCondition || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">HOA Fees</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.hoaFees ? `$${property.hoaFees}/mo` : 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Property Taxes</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.propertyTaxes ? `$${property.propertyTaxes}/yr` : 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Property Details - Renting */}
            {property.propertyType === 'rent' && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Rental Details</Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Lease Duration</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.leaseDuration || 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Security Deposit</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.deposit ? `$${property.deposit}` : 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Pet Deposit</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.petDeposit ? `$${property.petDeposit}` : 'N/A'}</Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Available Date</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.availableDate || 'N/A'}</Text>
                  </View>
                  <View className="w-full mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Utilities</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.utilities || 'N/A'}</Text>
                  </View>
                  <View className="w-full mb-3">
                    <Text className="text-xs text-gray-500 font-rubik-medium mb-1">Move-in Requirements</Text>
                    <Text className="text-gray-900 font-rubik-bold">{property.moveInRequirements || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Property Features */}
            {(property.furnishedStatus || property.petFriendly || property.hasHOA || property.hasPool || property.hasGarage || property.utilitiesIncluded || property.smokingAllowed || property.backgroundCheckRequired) && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Property Features</Text>
                <View className="flex-row flex-wrap">
                  {property.furnishedStatus && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Furnished</Text>
                      </View>
                    </View>
                  )}
                  {property.petFriendly && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Pet Friendly</Text>
                      </View>
                    </View>
                  )}
                  {property.hasHOA && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Has HOA</Text>
                      </View>
                    </View>
                  )}
                  {property.hasPool && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Has Pool</Text>
                      </View>
                    </View>
                  )}
                  {property.hasGarage && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Has Garage</Text>
                      </View>
                    </View>
                  )}
                  {property.utilitiesIncluded && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Utilities Included</Text>
                      </View>
                    </View>
                  )}
                  {property.smokingAllowed && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Smoking Allowed</Text>
                      </View>
                    </View>
                  )}
                  {property.backgroundCheckRequired && (
                    <View className="w-1/2 mb-3">
                      <View className="flex-row items-center">
                        <View className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                        <Text className="text-gray-900 font-rubik-medium">Background Check</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Amenities */}
            {property.amenities && (
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Amenities</Text>
                <Text className="text-gray-600 font-rubik leading-6">{property.amenities}</Text>
              </View>
            )}

            {/* Contact Information */}
            <View className="mb-6">
              <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Contact Information</Text>
              <View className="space-y-3">
                {property.contactPhone && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="call-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text className="text-gray-900 font-rubik-medium">{property.contactPhone}</Text>
                  </View>
                )}
                {property.contactEmail && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="mail-outline" size={20} color="#10B981" />
                    </View>
                    <Text className="text-gray-900 font-rubik-medium">{property.contactEmail}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="px-4 py-4 bg-gray-100">
        <View className="bg-white rounded-3xl shadow-lg p-4">
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-blue-100 py-4 rounded-full flex-row items-center justify-center">
              <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
              <Text className="text-blue-600 font-rubik-bold ml-2">Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-1 bg-teal-500 py-4 rounded-full flex-row items-center justify-center">
              <Ionicons name="call-outline" size={20} color="white" />
              <Text className="text-white font-rubik-bold ml-2">Call Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Property;