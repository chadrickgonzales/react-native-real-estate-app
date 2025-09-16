import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Image, ImageSourcePropType, TouchableOpacity, View } from "react-native";

import AddPropertyBottomSheet from "@/components/AddPropertyBottomSheet";
import SetupGuard from "@/components/SetupGuard";
import icons from "@/constants/icons";

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 h-20 bg-transparent">
      {/* Light gray background */}
      <View className="flex-1 bg-gray-200 mx-5 mb-5 rounded-3xl" />
      
      {/* White pill-shaped container */}
      <View className="absolute bottom-5 left-5 right-5 h-16 bg-white rounded-full shadow-lg flex-row items-center justify-around px-2">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = index === 2; // The add button is the center tab

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                className="relative"
              >
                <View 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                  style={{ backgroundColor: "#10B981" }}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color="white"
                  />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center"
            >
              {route.name === 'index' && (
                <Image
                  source={icons.home}
                  tintColor={isFocused ? "#10B981" : "#9CA3AF"}
                  resizeMode="contain"
                  className="size-6"
                />
              )}
              {route.name === 'explore' && (
                <Image
                  source={icons.search}
                  tintColor={isFocused ? "#10B981" : "#9CA3AF"}
                  resizeMode="contain"
                  className="size-6"
                />
              )}
              {route.name === 'saved' && (
                <Image
                  source={icons.heart}
                  tintColor={isFocused ? "#10B981" : "#9CA3AF"}
                  resizeMode="contain"
                  className="size-6"
                />
              )}
              {route.name === 'profile' && (
                <Image
                  source={icons.person}
                  tintColor={isFocused ? "#10B981" : "#9CA3AF"}
                  resizeMode="contain"
                  className="size-6"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabIcon = ({
  focused,
  icon,
  title,
  isIonicon = false,
  ioniconName,
  isCenter = false,
}: {
  focused: boolean;
  icon?: ImageSourcePropType;
  title: string;
  isIonicon?: boolean;
  ioniconName?: keyof typeof Ionicons.glyphMap;
  isCenter?: boolean;
}) => (
  <View className={`flex-1 flex items-center justify-center ${isCenter ? 'mt-2' : 'mt-3'}`}>
    {isIonicon ? (
      <Ionicons
        name={ioniconName || "add"}
        size={24}
        color={focused ? "#10B981" : "#9CA3AF"}
      />
    ) : (
      <Image
        source={icon!}
        tintColor={focused ? "#10B981" : "#9CA3AF"}
        resizeMode="contain"
        className="size-6"
      />
    )}
  </View>
);

const TabsLayout = () => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const handleAddProperty = (propertyData: any) => {
    // Handle property submission here
    console.log("New property:", propertyData);
    // You can add logic to save to database, show success message, etc.
  };

  return (
    <SetupGuard>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#F3F4F6",
            position: "absolute",
            borderTopColor: "transparent",
            borderTopWidth: 0,
            minHeight: 80,
            borderRadius: 25,
            marginHorizontal: 20,
            marginBottom: 20,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Add",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View className="relative">
              <View 
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{ backgroundColor: "#10B981" }}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color="white"
                />
              </View>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => setShowBottomSheet(true)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.heart} title="Saved" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
      </Tabs>
      
      <AddPropertyBottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onSubmit={handleAddProperty}
      />
    </SetupGuard>
  );
};

export default TabsLayout;