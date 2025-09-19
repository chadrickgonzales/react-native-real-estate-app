import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";
import {
  deleteSavedSearch,
  getSavedProperties,
  getSavedSearches
} from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { createImageSource } from "@/lib/imageUtils";
import { useAppwrite } from "@/lib/useAppwrite";

const Saved = () => {
  const [activeTab, setActiveTab] = useState("Updates");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useGlobalContext();

  // Get saved properties
  const { data: savedProperties, loading: propertiesLoading, refetch: refetchProperties } = useAppwrite({
    fn: ({ userId }: { userId: string }) => getSavedProperties(userId),
    params: { userId: user?.$id || "" },
    skip: !user?.$id,
  });

  // Get saved searches
  const { data: savedSearches, loading: searchesLoading, refetch: refetchSearches } = useAppwrite({
    fn: ({ userId }: { userId: string }) => getSavedSearches(userId),
    params: { userId: user?.$id || "" },
    skip: !user?.$id,
  });

  const onRefresh = useCallback(async () => {
    if (user?.$id) {
      setRefreshing(true);
      await Promise.all([
        refetchProperties({ userId: user.$id }),
        refetchSearches({ userId: user.$id })
      ]);
      setRefreshing(false);
    }
  }, [user?.$id, refetchProperties, refetchSearches]);

  const handleDeleteSearch = async (searchId: string) => {
    Alert.alert(
      'Delete Saved Search',
      'Are you sure you want to delete this saved search?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteSavedSearch(searchId);
              await refetchSearches({ userId: user?.$id || "" });
              Alert.alert('Success', 'Saved search deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete saved search');
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      {/* Header */}
      <View className="px-5 pt-4 pb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Image
              source={user?.avatar ? createImageSource(user.avatar) : images.avatar}
              className="w-12 h-12 rounded-full mr-3"
            />
          </View>
          <Text className="text-2xl font-rubik text-black">Saved</Text>
          <View className="w-12" />
        </View>

        {/* Tabs */}
        <View className="bg-white rounded-full p-2">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setActiveTab("Updates")}
              className={`flex-1 py-3 rounded-full mr-2 ${
                activeTab === "Updates"
                  ? "bg-primary-300"
                  : "bg-background-100"
              }`}
            >
              <Text
                className={`text-center font-rubik-medium ${
                  activeTab === "Updates"
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                Updates
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("Saved Homes")}
              className={`flex-1 py-3 rounded-full ${
                activeTab === "Saved Homes"
                  ? "bg-primary-300"
                  : "bg-background-100"
              }`}
            >
              <Text
                className={`text-center font-rubik-medium ${
                  activeTab === "Saved Homes"
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                Saved Homes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "Updates" ? (
          <View>
            {/* Saved Searches Section */}
            <View className="mb-6 px-5">
              <Text className="text-lg font-rubik-bold text-black mb-4">
                Saved searches
              </Text>
              
              {searchesLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#0061FF" />
                  <Text className="text-sm font-rubik text-gray-600 mt-2">Loading searches...</Text>
                </View>
              ) : savedSearches && savedSearches.length > 0 ? (
                savedSearches.map((search) => (
                  <TouchableOpacity
                    key={search.$id}
                    className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
                    onPress={() => {
                      // Navigate to search results
                      router.push({
                        pathname: '/(root)/(tabs)/explore',
                        params: {
                          searchQuery: search.searchQuery,
                          location: search.location,
                          propertyType: search.propertyType,
                        }
                      });
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-rubik-bold text-black mb-1">
                          {search.searchName}
                        </Text>
                        <Text className="text-sm font-rubik text-gray-600 mb-1">
                          {search.searchQuery} • {search.location}
                        </Text>
                        <Text className="text-xs font-rubik text-gray-500">
                          Last checked: {formatDate(search.lastChecked)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {search.newMatches > 0 && (
                          <View className="bg-blue-600 rounded-full w-12 h-12 items-center justify-center mr-3">
                            <Text className="text-white text-xl font-rubik-medium">
                              {search.newMatches}
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity
                          onPress={() => handleDeleteSearch(search.$id)}
                          className="p-2"
                        >
                          <Ionicons name="trash-outline" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                  <Text className="text-lg font-rubik-bold text-gray-600 mt-4 mb-2">No Saved Searches</Text>
                  <Text className="text-sm font-rubik text-gray-500 text-center">
                    Save your searches to get notified about new properties
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View>
            {/* Saved Properties Section */}
            <View className="mb-6 px-5">
              <Text className="text-lg font-rubik-bold text-black mb-4">
                Saved Properties
              </Text>
              
              {propertiesLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#0061FF" />
                  <Text className="text-sm font-rubik text-gray-600 mt-2">Loading properties...</Text>
                </View>
              ) : savedProperties && savedProperties.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="pl-0"
                >
                  {savedProperties.map((property) => (
                    <TouchableOpacity 
                      key={property.$id} 
                      className="w-72 mr-4"
                      onPress={() => router.push(`/properties/${property.propertyId}`)}
                    >
                      <View className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                        <View className="relative">
                          <Image
                            source={createImageSource(property.propertyImage)}
                            className="w-full h-48"
                            resizeMode="cover"
                          />
                          <TouchableOpacity className="absolute top-3 right-3">
                            <Ionicons
                              name="heart"
                              size={24}
                              color="#FF6B6B"
                            />
                          </TouchableOpacity>
                        </View>
                        
                        <View className="p-4">
                          <Text className="text-lg font-rubik-bold text-gray-900 mb-1" numberOfLines={1}>
                            {property.propertyName}
                          </Text>
                          <Text className="text-xl font-rubik-bold text-blue-600 mb-2">
                            {formatPrice(property.price)}
                          </Text>
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <Ionicons name="location-outline" size={16} color="#666" />
                              <Text className="text-sm font-rubik text-gray-600 ml-1 flex-1" numberOfLines={1}>
                                {property.propertyAddress}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <Ionicons name="bed-outline" size={14} color="#666" />
                              <Text className="text-xs font-rubik text-gray-600 ml-1">
                                {property.bedrooms}
                              </Text>
                              <Ionicons name="water-outline" size={14} color="#666" className="ml-2" />
                              <Text className="text-xs font-rubik text-gray-600 ml-1">
                                {property.bathrooms}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-xs font-rubik text-gray-500 mt-2">
                            Added {formatDate(property.addedDate)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
                  <Text className="text-lg font-rubik-bold text-gray-600 mt-4 mb-2">No Saved Properties</Text>
                  <Text className="text-sm font-rubik text-gray-500 text-center mb-4">
                    Save properties you like to view them here
                  </Text>
                  <TouchableOpacity
                    className="bg-primary-300 px-6 py-3 rounded-full"
                    onPress={() => router.push('/(root)/(tabs)/explore')}
                  >
                    <Text className="text-white font-rubik-bold">Browse Properties</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Saved;
