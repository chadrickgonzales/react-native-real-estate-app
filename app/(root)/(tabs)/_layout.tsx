import AddPropertyBottomSheet from "@/components/AddPropertyBottomSheet";
import SetupGuard from "@/components/SetupGuard";
import icons from "@/constants/icons";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');
const tabBarWidth = width * 0.92;
const tabBarMargin = (width - tabBarWidth) / 2;

console.log('Screen width:', width);
console.log('Tab bar width:', tabBarWidth);
console.log('Tab bar margin:', tabBarMargin);

const TabIcon = ({ focused, icon, title, isIonicon = false, ioniconName }: {
  focused: boolean;
  icon?: any;
  title: string;
  isIonicon?: boolean;
  ioniconName?: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={{ width: 60, alignItems: 'center', justifyContent: 'center' }}>
    {isIonicon ? (
      <Ionicons
        name={ioniconName || "add"}
        size={24}
        color={focused ? "#3B82F6" : "#666876"}
      />
    ) : (
      <Image
        source={icon}
        tintColor={focused ? "#3B82F6" : "#666876"}
        resizeMode="contain"
        style={{ width: 24, height: 24 }}
      />
    )}
    <Text
      className={`text-xs mt-1 ${
        focused ? "text-blue-500 font-rubik-medium" : "text-black-200 font-rubik"
      }`}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const handleAddProperty = (propertyData: any) => {
    console.log("New property:", propertyData);
  };

  return (
    <SetupGuard>
       {/* Black rectangle behind nav bar - 100% width */}
       <LinearGradient
  colors={[
    'rgba(25, 25, 25, 0)',   // lightest at top
    'rgba(15, 15, 15, 0.33)',   // mid
    'rgba(0,0,0,0.9)'       // darkest at bottom
  ]}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1,
  }}
/>
       
       {/*nav bar */}
       <View
         style={{
           position: 'absolute',
           bottom: 20,
           left: tabBarMargin,
           width: tabBarWidth,
           height: 70,
           backgroundColor: 'rgb(255, 255, 255)',
           borderRadius: 100,
           shadowColor: '#000',
           shadowOffset: {
             width: 0,
             height: 8,
           },
           shadowOpacity: 0.3,
           shadowRadius: 10,
           elevation: 8,
          zIndex: 1000,
         }}
       />
       
       <Tabs
         screenOptions={{
           tabBarStyle: {
             position: 'absolute',
             justifyContent: 'center',
             alignItems: 'center',
             bottom: 20,
             left: 0,
             right: 0,
             marginHorizontal: tabBarMargin,
             backgroundColor: 'white',
             borderRadius: 100,
             height: 70,
             paddingTop: 15,
             shadowColor: 'transparent',
             shadowOffset: {
               width: 0,
               height: 0,
             },
             shadowOpacity: 0,
             shadowRadius: 0,
             elevation: 0,
            zIndex: 1000,
           },
         }}
       >
         <Tabs.Screen
          name="index"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.home} title="Home" />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.search} title="Search" />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "",
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
                onPress={() => setShowBottomSheet(true)}
                style={{
                  top: 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {props.children}
                </View>
              </TouchableOpacity>
            )
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.heart} title="Saved" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "",
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