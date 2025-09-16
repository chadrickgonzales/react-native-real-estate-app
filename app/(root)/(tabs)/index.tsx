import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Filters from "@/components/Filters";
import images from "@/constants/images";

import { getLatestProperties, getProperties } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { createImageSource } from "@/lib/imageUtils";
import seed from "@/lib/seed";
import { useAppwrite } from "@/lib/useAppwrite";

const Home = () => {
  const { user } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'rent' | 'sell'>('sell');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);
  
  const { height: screenHeight } = Dimensions.get('window');

  // Fetch latest properties for recommended section
  const { data: latestProperties, loading: latestPropertiesLoading, refetch: refetchLatest } = useAppwrite({
    fn: ({ propertyType, filter }: { propertyType: string; filter: string }) => 
      getLatestProperties(propertyType, filter),
    params: { 
      propertyType: propertyTypeFilter, 
      filter: selectedCategory 
    },
  });

  // Fetch properties for most popular section (sorted by rating)
  const { data: popularProperties, loading: popularPropertiesLoading, refetch: refetchPopular } = useAppwrite({
    fn: ({ filter, query, limit, propertyType }: { filter: string; query: string; limit: number; propertyType: string }) => 
      getProperties({
        filter,
        query,
        limit,
        propertyType,
      }),
    params: {
      filter: selectedCategory,
      query: "",
      limit: 20,
      propertyType: propertyTypeFilter,
    },
  });

  // Debug logging
  console.log("Latest properties:", latestProperties?.length || 0);
  console.log("Popular properties:", popularProperties?.length || 0);

  const handleCardPress = (id: string) => {
    router.push(`/properties/${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      console.log("Starting database seeding...");
      await seed();
      console.log("Database seeding completed successfully!");
      
      // Refetch data after seeding
      await refetchLatest({ 
        propertyType: propertyTypeFilter, 
        filter: selectedCategory 
      });
      await refetchPopular({ 
        filter: selectedCategory, 
        query: "", 
        limit: 20, 
        propertyType: propertyTypeFilter 
      });
    } catch (error) {
      console.error("Error seeding database:", error);
    } finally {
      setIsSeeding(false);
    }
  };


  return (
    <View className="h-full">
      <StatusBar hidden={true} />
      <LinearGradient
        colors={['#F0F9F4', '#E8F5E8', '#F0F9F4']}
        style={{ flex: 1, paddingTop: 44 }}
      >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        {/* Header Section */}
        <View className="px-5 pt-5">
          {/* User Profile and Action Buttons */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Image
                source={user?.avatar ? createImageSource(user.avatar) : images.avatar}
                className="w-12 h-12 rounded-full"
              />
            </View>
            
            {/* Location */}
            <View className="items-center">
              <Text className="text-sm font-rubik text-gray-500 mb-1">Current location</Text>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#191D31" />
                <Text className="text-lg font-rubik-bold text-black-300 ml-1">Tarlac City, PH</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center gap-2">
              {/* Seed Database Button */}
              <TouchableOpacity 
                className="p-2 bg-blue-500 rounded-full shadow-md"
                onPress={handleSeedDatabase}
                disabled={isSeeding}
              >
                {isSeeding ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <Ionicons name="refresh" size={20} color="white" />
                )}
              </TouchableOpacity>
              
              {/* Notification Button */}
              <View className="p-2 bg-white rounded-full shadow-md">
                <TouchableOpacity className="relative">
                  <Ionicons name="notifications-outline" size={24} color="#191D31" />
                  <View className="absolute -top-1 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          

          {/* Search Bar */}
          <View className="flex-row items-center gap-2">
            <View className=" flex-1 flex-row items-center mb-6 bg-white rounded-full  shadow-md">
              <View className="flex-1 bg-white rounded-full px-3 py-3  mr-1">
                <TextInput
                  className="text-base font-rubik text-black-300"
                  placeholder="Find something new"
                  placeholderTextColor="#8c8e98"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity className="w-16 h-16 rounded-full items-center justify-center mr-2" style={{ backgroundColor: '#14b8a6' }}>
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

           
            
            <TouchableOpacity 
              className="bg-white w-16 h-16 mb-6 rounded-full items-center justify-center shadow-md"
              activeOpacity={1}
              onPress={async () => {
                const newFilter = propertyTypeFilter === 'sell' ? 'rent' : 'sell';
                setPropertyTypeFilter(newFilter);
                
                // Manually refetch data with new filter and current category
                await refetchLatest({ 
                  propertyType: newFilter, 
                  filter: selectedCategory 
                });
                await refetchPopular({ 
                  filter: selectedCategory, 
                  query: "", 
                  limit: 20, 
                  propertyType: newFilter 
                });
              }}
            >
              <Ionicons 
                name={
                  propertyTypeFilter === 'sell' 
                    ? 'home-outline' 
                    : 'key-outline'
                }
                size={20} 
                color="#191D31" 
              />
            </TouchableOpacity>
            
          </View>


          {/* Category Filters */}
          <View className="bg-white px-2 py-2 rounded-full shadow-md mb-5">
            <Filters 
              propertyType={propertyTypeFilter} 
              onCategoryChange={async (category) => {
                setSelectedCategory(category);
                // Refetch data with new category filter
                await refetchLatest({ propertyType: propertyTypeFilter, filter: category });
                await refetchPopular({ 
                  filter: category, 
                  query: "", 
                  limit: 4, 
                  propertyType: propertyTypeFilter 
                });
              }}
            />
          </View>
        </View>

        {/* Properties Feed */}
        <View className="px-5">
          {latestPropertiesLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#0061FF" />
              <Text className="text-sm font-rubik text-black-200 mt-2">Loading properties...</Text>
            </View>
          ) : latestProperties && latestProperties.length > 0 ? (
            <View className="space-y-4">
              {latestProperties.map((property: any) => (
                <TouchableOpacity 
                  key={property.$id} 
                  className="mb-4"
                  onPress={() => handleCardPress(property.$id)}
                >
                  <View className="bg-white rounded-3xl shadow-lg pt-2 px-2 pb-4">
                    {/* Image Section */}
                    <View className="relative mb-4">
                      <Image
                        source={createImageSource(
                          property.images && property.images.length > 0 
                            ? property.images[0] 
                            : property.image, 
                          images.newYork
                        )}
                        style={{ 
                          width: '100%', 
                          height: screenHeight * 0.35,
                          borderRadius: 16 
                        }}
                        resizeMode="cover"
                      />
                      {/* Property Type Badge */}
                      <View className="absolute top-3 left-3 bg-gray-800 rounded-full px-3 py-1">
                        <Text className="text-white text-sm font-rubik-medium">
                          {property.type || 'Apartment'}
                        </Text>
                      </View>
                      {/* Favorite Button */}
                      <TouchableOpacity className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                        <Ionicons 
                          name="heart-outline" 
                          size={20} 
                          color="#666876" 
                        />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Details Section */}
                    <View>
                      {/* Title and Price */}
                      <View className="flex-row items-center justify-between mb-2 px-2">
                        <Text className="text-lg font-rubik-bold text-gray-900 flex-1" numberOfLines={1}>
                          {property.name || 'Property Name'}
                        </Text>
                        <Text className="text-lg font-rubik-bold text-gray-900 ml-2">
                          {formatPrice(property.price)}
                        </Text>
                      </View>
                      
                      {/* Address */}
                      <Text className="text-sm text-gray-600 font-rubik mb-3 px-2" numberOfLines={2}>
                        {property.address || 'Address not specified'}
                      </Text>
                      
                      {/* Property Features */}
                      <View className="flex-row space-x- px-2 gap-2">
                        <View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center">
                          <Ionicons name="bed-outline" size={14} color="#666876" />
                          <Text className="text-sm font-rubik-medium text-gray-700 ml-1">
                            {property.bedrooms || 0} Beds
                          </Text>
                        </View>
                        <View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center">
                          <Ionicons name="water-outline" size={14} color="#666876" />
                          <Text className="text-sm font-rubik-medium text-gray-700 ml-1">
                            {property.bathrooms || 0} Baths
                          </Text>
                        </View>
                        <View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center">
                          <Ionicons name="resize-outline" size={14} color="#666876" />
                          <Text className="text-sm font-rubik-medium text-gray-700 ml-1">
                            {property.area || 0} Sqft
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-base font-rubik text-black-200">No properties found</Text>
            </View>
          )}
        </View>
      </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default Home;