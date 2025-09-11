import React from "react";
import {
  Image,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";
import { Link } from "expo-router";

const Auth = () => {


  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <Image
          source={images.onboarding}
          className="w-full h-4/6"
          resizeMode="contain"
        />

        <View className="px-10">
          <Text className="text-base text-center uppercase font-rubik text-black-200">
            Welcome To Estate link
          </Text>

          <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
            Let's Get You Closer To {"\n"}
            <Text className="text-primary-300">Your Ideal Home</Text>
          </Text>
          
            <View className="flex flex-row items-center justify-center bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-10">
              <Link href="/signin1">
                <Text className="text-lg font-rubik-medium text-black-300 ml-2">Create account to get started</Text>
              </Link>
            </View>


          <View className="flex items-center justify-center mt-10">
            <Link href="/login">
              <Text className="text-sm font-rubik text-black-200">Already have an account?</Text>
            </Link>
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Auth;