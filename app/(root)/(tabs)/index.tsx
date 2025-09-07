import images from "@/constants/images";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-white h-full">
      
      <View className="px-5">
        
        <View className="flex flex-row justify-between mt-5">
          
          <View className="flex flex-row itemes-center">
            <Image source= {images.avatar} className="size-12 rounded-full" />
            
            <View className="flex flex-col items-start ml-2 justify-center">
                <Text className="text-sx font-rubik text-black-100">Good Morning</Text>
                <Text className="text-base font-rubik-medium text-black-300">John Doe</Text>
            </View>

          </View>

        </View>

      </View>

    </SafeAreaView>
  );
}
