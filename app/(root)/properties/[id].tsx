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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getPropertyTypeDisplay = () => {
    if (property?.propertyType === 'sell') return 'For Sale';
    if (property?.propertyType === 'rent') return 'For Rent';
    return property?.type || 'Property';
  };

  const getPriceDisplay = () => {
    if (property?.propertyType === 'rent') {
      return `${formatPrice(property?.price || 0)}/month`;
    }
    return formatPrice(property?.price || 0);
  };

  const getAmenitiesList = () => {
    if (!property?.amenities) return [];
    try {
      return property.amenities.split(',').map((amenity: string) => amenity.trim()).filter(Boolean);
    } catch {
      return [];
    }
  };

  const getPropertyFeatures = () => {
    const features = [];
    
    if (property?.furnishedStatus) features.push('Furnished');
    if (property?.petFriendly) features.push('Pet Friendly');
    if (property?.hasPool) features.push('Swimming Pool');
    if (property?.hasGarage) features.push('Garage');
    if (property?.hasHOA) features.push('HOA Community');
    if (property?.utilitiesIncluded) features.push('Utilities Included');
    if (property?.smokingAllowed) features.push('Smoking Allowed');
    if (property?.backgroundCheckRequired) features.push('Background Check Required');
    
    return features;
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
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

  const currentImage = property.images && property.images.length > 0 
    ? property.images[currentImageIndex] 
    : property.image;

  return (
    <View className="flex-1 bg-black">
      {/* Hero Image Section */}
      <View className="relative" style={{ height: windowHeight * 0.4 }}>
        <Image
          source={
            !imageError && currentImage
              ? createImageSource(currentImage)
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

        {/* Image Navigation */}
        {property.images && property.images.length > 1 && (
          <>
            <TouchableOpacity
              onPress={prevImage}
              className="absolute left-4 top-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={nextImage}
              className="absolute right-4 top-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center"
              style={{ transform: [{ translateY: -20 }] }}
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </>
        )}

        {/* Image Counter */}
        <View className="absolute bottom-10 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <Text className="text-white text-sm font-rubik-medium">
            {property.images && property.images.length > 0 
              ? `${currentImageIndex + 1}/${property.images.length}` 
              : "1/1"
            }
          </Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View className="bg-white rounded-t-3xl" style={{ height: windowHeight * 0.7, marginTop: -24 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-60 mt-5"
        >
          <View className="px-6 pt-1">
            {/* Property Header */}
            <View className="mb-4">
              <Text className="text-2xl font-rubik-bold text-black mb-2">
                {property.name || 'Property'}
              </Text>
              
              <Text className="text-lg font-rubik text-gray-600 mb-1">
                {getPropertyTypeDisplay()} • {property.type || 'Property Type'}
              </Text>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text className="text-base font-rubik text-gray-600 ml-1">
                  {property.address || 'Address not specified'}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text className="text-base font-rubik text-gray-600 ml-1">
                  {property.rating || '4.5'} • {property.reviewsCount || 0} reviews
                </Text>
              </View>
            </View>

            {/* Property Details Grid */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-4">
              <Text className="text-lg font-rubik-bold text-black mb-3">Property Details</Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="bed" size={20} color="#666" />
                    <Text className="text-base font-rubik text-gray-700 ml-2">
                      {property.bedrooms || 0} bedrooms
                    </Text>
                  </View>
                </View>
                <View className="w-1/2 mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="water" size={20} color="#666" />
                    <Text className="text-base font-rubik text-gray-700 ml-2">
                      {property.bathrooms || 0} bathrooms
                    </Text>
                  </View>
                </View>
                <View className="w-1/2 mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="resize" size={20} color="#666" />
                    <Text className="text-base font-rubik text-gray-700 ml-2">
                      {property.area || 0} sq ft
                    </Text>
                  </View>
                </View>
                <View className="w-1/2 mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={20} color="#666" />
                    <Text className="text-base font-rubik text-gray-700 ml-2">
                      Available: {formatDate(property.availableDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Property Features */}
            {getPropertyFeatures().length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-black mb-3">Property Features</Text>
                <View className="flex-row flex-wrap">
                  {getPropertyFeatures().map((feature, index) => (
                    <View key={index} className="w-1/2 flex-row items-center mb-2">
                      <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                      <Text className="text-base font-rubik text-gray-600 ml-2">{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Amenities */}
            {getAmenitiesList().length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-black mb-3">Amenities</Text>
                <View className="flex-row flex-wrap">
                  {getAmenitiesList().map((amenity: string, index: number) => (
                    <View key={index} className="bg-blue-100 px-3 py-2 rounded-full mr-2 mb-2">
                      <Text className="text-blue-800 font-rubik text-sm">{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Description */}
            {property.description && (
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-black mb-3">Description</Text>
                <Text className="text-base font-rubik text-gray-600 leading-6">
                  {property.description}
                </Text>
              </View>
            )}

            {/* Contact Information */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-4">
              <Text className="text-lg font-rubik-bold text-black mb-3">Contact Information</Text>
              <View className="space-y-2">
                {property.contactPhone && (
                  <View className="flex-row items-center">
                    <Ionicons name="call" size={20} color="#666" />
                    <Text className="text-base font-rubik text-gray-700 ml-2">
                      {property.contactPhone}
                    </Text>
                  </View>
                )}
                {property.contactEmail && (
                  <View className="flex-row items-center">
                    <Ionicons name="mail" size={20} color="#666" />
                    <Text className="text-base font-rubik text-gray-700 ml-2">
                      {property.contactEmail}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Additional Details for Rentals */}
            {property.propertyType === 'rent' && (
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-black mb-3">Rental Details</Text>
                <View className="bg-gray-50 rounded-2xl p-4">
                  <View className="space-y-2">
                    {property.leaseDuration && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Lease Duration:</Text>
                        <Text className="text-base font-rubik text-black">{property.leaseDuration}</Text>
                      </View>
                    )}
                    {property.deposit && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Security Deposit:</Text>
                        <Text className="text-base font-rubik text-black">{property.deposit}</Text>
                      </View>
                    )}
                    {property.petDeposit && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Pet Deposit:</Text>
                        <Text className="text-base font-rubik text-black">{property.petDeposit}</Text>
                      </View>
                    )}
                    {property.utilities && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Utilities:</Text>
                        <Text className="text-base font-rubik text-black">{property.utilities}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Additional Details for Sales */}
            {property.propertyType === 'sell' && (
              <View className="mb-4">
                <Text className="text-lg font-rubik-bold text-black mb-3">Property Information</Text>
                <View className="bg-gray-50 rounded-2xl p-4">
                  <View className="space-y-2">
                    {property.yearBuilt && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Year Built:</Text>
                        <Text className="text-base font-rubik text-black">{property.yearBuilt}</Text>
                      </View>
                    )}
                    {property.propertyCondition && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Condition:</Text>
                        <Text className="text-base font-rubik text-black">{property.propertyCondition}</Text>
                      </View>
                    )}
                    {property.lotSize && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Lot Size:</Text>
                        <Text className="text-base font-rubik text-black">{property.lotSize} sq ft</Text>
                      </View>
                    )}
                    {property.parkingSpaces && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Parking:</Text>
                        <Text className="text-base font-rubik text-black">{property.parkingSpaces} spaces</Text>
                      </View>
                    )}
                    {property.hoaFees && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">HOA Fees:</Text>
                        <Text className="text-base font-rubik text-black">{property.hoaFees}/month</Text>
                      </View>
                    )}
                    {property.propertyTaxes && (
                      <View className="flex-row justify-between">
                        <Text className="text-base font-rubik text-gray-600">Property Taxes:</Text>
                        <Text className="text-base font-rubik text-black">{property.propertyTaxes}/year</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View className="absolute bottom-20 left-0 right-0 bg-white px-6 py-4 border-t border-gray-200" style={{ paddingBottom: 34 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-rubik-bold text-black">
                {getPriceDisplay()}
              </Text>
              <Text className="text-sm font-rubik text-gray-600">
                {property.propertyType === 'rent' ? 'Monthly rent' : 'Total price'}
              </Text>
            </View>
            
            <TouchableOpacity className="bg-blue-600 rounded-full px-8 py-4">
              <Text className="text-white font-rubik-bold text-base">
                {property.propertyType === 'rent' ? 'Contact Landlord' : 'Contact Agent'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Property;