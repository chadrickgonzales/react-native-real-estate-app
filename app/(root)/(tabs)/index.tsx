import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Filters from "@/components/Filters";
import images from "@/constants/images";

import { getLatestProperties, getProperties } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { createImageSource } from "@/lib/imageUtils";
import { useAppwrite } from "@/lib/useAppwrite";

const Home = () => {
  const { user } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch latest properties for recommended section
  const { data: latestProperties, loading: latestPropertiesLoading } = useAppwrite({
    fn: getLatestProperties,
  });

  // Fetch properties for most popular section (sorted by rating)
  const { data: popularProperties, loading: popularPropertiesLoading } = useAppwrite({
    fn: getProperties,
    params: {
      filter: "",
      query: "",
      limit: 4,
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


  return (
    <SafeAreaView className="h-full bg-background-100">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
      >
        {/* Header Section */}
        <View className="px-5 pt-5">
          {/* User Profile and Notification */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Image
                source={user?.avatar ? createImageSource(user.avatar) : images.avatar}
                className="w-12 h-12 rounded-full"
              />
            </View>
            {/* Location */}
            <View className="items-center mb-6">
            <Text className="text-sm font-rubik text-gray-500 mb-1">Current location</Text>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color="#191D31" />
              <Text className="text-lg font-rubik-bold text-black-300 ml-1">California, USA</Text>
            </View>
          </View>

          <View className="p-2 bg-white rounded-full  shadow-md">
            <TouchableOpacity className="relative">
              <Ionicons name="notifications-outline" size={24} color="#191D31" />
              <View className="absolute -top-1 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </TouchableOpacity>
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
              <TouchableOpacity className="bg-primary-300 w-16 h-16 rounded-full items-center justify-center mr-2">
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

           
            
            <TouchableOpacity className="bg-white w-16 h-16 mb-6 rounded-full items-center justify-center shadow-md">
                <Ionicons name="options-outline" size={20} color="#191D31" />
              </TouchableOpacity>
            
          </View>



          {/* Category Filters */}
          <View className="bg-white px-2 py-2 rounded-full shadow-md mb-5">
            <Filters />
          </View>
        </View>

        {/* Recommended Property Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="ml-5 text-xl font-rubik-bold text-black-300">Recommended Property</Text>
            <TouchableOpacity>
              <Text className="mr-5 text-base font-rubik-medium text-primary-300">See all</Text>
            </TouchableOpacity>
          </View>

          {latestPropertiesLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#0061FF" />
              <Text className="text-sm font-rubik text-black-200 mt-2">Loading properties...</Text>
            </View>
          ) : latestProperties && latestProperties.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="ml-5 pr-5"
            >
              {latestProperties.map((property: any) => (
                <TouchableOpacity 
                  key={property.$id} 
                  className="w-80 mr-4"
                  onPress={() => handleCardPress(property.$id)}
                >
                  <View className="relative mb-4">
                    <Image
                      source={createImageSource(
                        property.images && property.images.length > 0 
                          ? property.images[0] 
                          : property.image, 
                        images.newYork
                      )}
                      className="w-full h-48 rounded-2xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity className="absolute top-3 right-3">
                      <Ionicons 
                        name="heart-outline" 
                        size={24} 
                        color="white" 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xl font-rubik text-primary-300 ml-2">
                    {formatPrice(property.price)}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 ml-2">
                      <Ionicons name="location-outline" size={16} color="#666876" />
                      <Text className="text-sm font-rubik text-black-200 flex-1" numberOfLines={1}>
                        {property.address}
                      </Text>
                    </View>
                    <TouchableOpacity className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                      <Ionicons name="arrow-up" size={16} color="#191D31" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="items-center py-8">
              <Text className="text-base font-rubik text-black-200">No properties found</Text>
            </View>
          )}
        </View>

        {/* Most Popular Section */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-rubik-bold text-black-300">Most Popular</Text>
            <TouchableOpacity>
              <Text className="text-base font-rubik-medium text-primary-300">See all</Text>
            </TouchableOpacity>
          </View>

          {popularPropertiesLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#0061FF" />
              <Text className="text-sm font-rubik text-black-200 mt-2">Loading properties...</Text>
            </View>
          ) : popularProperties && popularProperties.length > 0 ? (
            <View className="space-y-4">
              {popularProperties.map((property: any) => (
                <TouchableOpacity 
                  key={property.$id} 
                  className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-2"
                  onPress={() => handleCardPress(property.$id)}
                >
                  <Image
                    source={createImageSource(
                      property.images && property.images.length > 0 
                        ? property.images[0] 
                        : property.image, 
                      images.newYork
                    )}
                    className="w-16 h-16 rounded-xl mr-4"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-rubik-medium text-black-300" numberOfLines={1}>
                        {property.name}
                      </Text>
                      <TouchableOpacity>
                        <Ionicons 
                          name="heart-outline" 
                          size={20} 
                          color="#666876" 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-lg font-rubik-medium text-primary-300 mb-1">
                      {formatPrice(property.price)}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Ionicons name="location-outline" size={14} color="#666876" />
                        <Text className="text-sm font-rubik text-black-200 ml-1 flex-1" numberOfLines={1}>
                          {property.address}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text className="text-sm font-rubik text-black-200 ml-1">
                          {property.rating || '4.5'}
                        </Text>
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
    </SafeAreaView>
  );
};

export default Home;