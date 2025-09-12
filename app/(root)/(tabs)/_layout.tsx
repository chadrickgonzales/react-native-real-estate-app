import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";

import AddPropertyBottomSheet from "@/components/AddPropertyBottomSheet";
import SetupGuard from "@/components/SetupGuard";
import icons from "@/constants/icons";

const TabIcon = ({
  focused,
  icon,
  title,
  isIonicon = false,
  ioniconName,
}: {
  focused: boolean;
  icon?: ImageSourcePropType;
  title: string;
  isIonicon?: boolean;
  ioniconName?: keyof typeof Ionicons.glyphMap;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    {isIonicon ? (
      <Ionicons
        name={ioniconName || "add"}
        size={24}
        color={focused ? "#0061FF" : "#666876"}
      />
    ) : (
      <Image
        source={icon!}
        tintColor={focused ? "#0061FF" : "#666876"}
        resizeMode="contain"
        className="size-6"
      />
    )}
    <Text
      className={`${
        focused
          ? "text-primary-300 font-rubik-medium"
          : "text-black-200 font-rubik"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
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
            backgroundColor: "white",
            position: "absolute",
            borderTopColor: "#0061FF1A",
            borderTopWidth: 1,
            minHeight: 70,
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
            <TabIcon 
              focused={focused} 
              isIonicon={true}
              ioniconName="add"
              title="Add" 
            />
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