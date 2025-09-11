import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";

const Saved = () => {
  const [activeTab, setActiveTab] = useState("Updates");

  // Mock data for saved searches
  const savedSearches = [
    {
      id: "1",
      title: "For sale near CA 92657",
      details: "For sale, $220K-$5.5M, 1+ Beds",
      newCount: 7,
    },
  ];

  // Mock data for saved properties
  const savedProperties = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      price: "$634,888",
      location: "Turlock, CA 95382",
      isFavorite: true,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1605146768851-eda79da39897?q=60&w=640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      price: "$424,901",
      location: "1280 S Rose S",
      isFavorite: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-100">
      {/* Header */}
      <View className="px-5 pt-4 pb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Image
              source={images.avatar}
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
      >
        <View>
          {/* Saved Searches Section */}
          <View className="mb-6 px-5">
            <Text className="text-lg font-rubik-bold text-black mb-4">
              Saved searches
            </Text>
            
            {savedSearches.map((search) => (
              <TouchableOpacity
                key={search.id}
                className=""
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-rubik-bold text-black mb-1">
                      {search.title}
                    </Text>
                    <Text className="text-sm font-rubik text-gray-600">
                      {search.details}
                    </Text>
                    
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-blue-600 rounded-full w-12 h-12 items-center justify-center mr-3">
                      <Text className="text-white text-xl font-rubik-medium">
                        {search.newCount}
                      </Text>
                    </View>

                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Property Listings Section */}
          <View className="mb-6">
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="pl-5 "
            >
              {savedProperties.map((property) => (
                <View key={property.id} className="w-72 mr-4">
                  <View className="rounded-2xl overflow-hidden">
                    <View className="relative">
                      <Image
                        source={{ uri: property.image }}
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
                      <Text className="text-xl font-rubik-bold text-blue-600 mb-2">
                        {property.price}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text className="text-sm font-rubik text-gray-600 ml-1 flex-1">
                            {property.location}
                          </Text>
                        </View>
                        <TouchableOpacity className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                          <Ionicons name="arrow-up" size={16} color="#191D31" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

           {/* Watching Section */}
           <View className="mb-6 px-5">
             <View className="flex-row items-center gap-2 mb-4">
               <Text className="text-lg font-rubik-bold text-black">
                 Watching
               </Text>
               <Ionicons name="chevron-forward" size={20} color="#666" />
             </View>
             
             <View className="">
               <Text className="text-sm font-rubik text-gray-600">
                 For sale, $1.5K-$15K/ month, House, Townhome. Multi-family Manufactured, Lot Yard
               </Text>
             </View>
           </View>
           {/* Property Listings Section */}
           <View className="mb-6">
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="pl-5 "
            >
              {savedProperties.map((property) => (
                <View key={property.id} className="w-72 mr-4">
                  <View className="rounded-2xl overflow-hidden">
                    <View className="relative">
                      <Image
                        source={{ uri: property.image }}
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
                      <Text className="text-xl font-rubik-bold text-blue-600 mb-2">
                        {property.price}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text className="text-sm font-rubik text-gray-600 ml-1 flex-1">
                            {property.location}
                          </Text>
                        </View>
                        <TouchableOpacity className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                          <Ionicons name="arrow-up" size={16} color="#191D31" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default Saved;
