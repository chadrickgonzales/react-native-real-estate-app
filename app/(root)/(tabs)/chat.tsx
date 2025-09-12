import AddPropertyBottomSheet from "@/components/AddPropertyBottomSheet";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddProperty = () => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const handleAddProperty = (propertyData: any) => {
    // Handle property submission here
    console.log("New property:", propertyData);
    // You can add logic to save to database, show success message, etc.
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
      <View className="items-center">
        <Ionicons name="add-circle-outline" size={80} color="#666" />
        <Text className="text-xl font-rubik-bold text-black mt-4 mb-2">
          Add Property
        </Text>
        <Text className="text-base font-rubik text-gray-600 text-center px-8">
          Tap the plus icon in the navigation bar to add a new property
        </Text>
        <TouchableOpacity 
          className="bg-blue-600 rounded-full px-6 py-3 mt-6"
          onPress={() => setShowBottomSheet(true)}
        >
          <Text className="text-white font-rubik-bold">Add Property</Text>
        </TouchableOpacity>
      </View>

      <AddPropertyBottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onSubmit={handleAddProperty}
      />
    </SafeAreaView>
  );
};

export default AddProperty;
