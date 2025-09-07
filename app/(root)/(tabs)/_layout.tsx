import icons from "@/constants/icons";
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#161622",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E6E6E6",
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={icons.home}
              style={{ width: 24, height: 24, tintColor: color, opacity: focused ? 1 : 0.7 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={icons.search}
              style={{ width: 24, height: 24, tintColor: color, opacity: focused ? 1 : 0.7 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={icons.person}
              style={{ width: 24, height: 24, tintColor: color, opacity: focused ? 1 : 0.7 }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}


