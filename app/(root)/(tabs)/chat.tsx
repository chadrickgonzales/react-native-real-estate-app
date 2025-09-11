import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
      <View className="items-center">
        <Ionicons name="chatbubbles-outline" size={80} color="#666" />
        <Text className="text-xl font-rubik-bold text-black mt-4 mb-2">
          Chat
        </Text>
        <Text className="text-base font-rubik text-gray-600 text-center px-8">
          Your conversations will appear here
        </Text>
        <TouchableOpacity className="bg-blue-600 rounded-full px-6 py-3 mt-6">
          <Text className="text-white font-rubik-bold">Start Chatting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Chat;
