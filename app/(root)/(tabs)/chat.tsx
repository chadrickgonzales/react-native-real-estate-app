import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";
import { getCurrentUser, getUserChats, type Chat } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user
  const { data: currentUser } = useAppwrite({
    fn: getCurrentUser,
    params: {},
  });

  // Get user chats
  const { data: userChats, refetch } = useAppwrite({
    fn: (params: { userId: string }) => getUserChats(params.userId),
    params: { userId: currentUser?.$id || "" },
    skip: !currentUser?.$id, // Skip if no user ID
  });

  // Refresh when tab is focused (e.g., returning from a chat)
  useFocusEffect(
    useCallback(() => {
      if (currentUser?.$id) {
        // Fetch latest chats when tab is focused
        refetch({ userId: currentUser.$id });
      }
    }, [currentUser?.$id])
  );

  useEffect(() => {
    // Silent update - no console logs, just update the chat list
    if (userChats) {
      setChats(userChats);
    }
  }, [userChats]); // Removed currentUser from dependencies

  // Silent pull-to-refresh function
  const onRefresh = useCallback(async () => {
    if (currentUser?.$id) {
      setRefreshing(true);
      await refetch({ userId: currentUser.$id });
      setRefreshing(false);
    }
  }, [currentUser?.$id]); // Removed refetch from dependencies

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const getPropertyName = () => {
      return item.propertyName || 'Property';
    };

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => router.push({
          pathname: '/chat-conversation',
          params: {
            chatId: item.$id,
            propertyId: item.propertyId,
            propertyName: item.propertyName,
            sellerName: item.sellerName,
            sellerAvatar: item.sellerAvatar,
          }
        })}
      >
        <View className="mr-3">
          <Image
            source={images.newYork}
            className="w-12 h-12 rounded-lg"
            resizeMode="cover"
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-900 font-rubik-bold text-base" numberOfLines={1}>
              {getPropertyName()}
            </Text>
            <Text className="text-gray-500 font-rubik text-xs">
              {item.lastMessageTime ? formatTime(item.lastMessageTime) : ""}
            </Text>
          </View>
          
          <Text className="text-gray-500 font-rubik text-sm" numberOfLines={1}>
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Remove loading UI - show empty state or chats directly

  if (chats.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-rubik-bold text-gray-900 mt-4 mb-2">
            No Chats Yet
          </Text>
          <Text className="text-base font-rubik text-gray-600 text-center">
            Start a conversation by messaging a property owner from any property listing.
          </Text>
          <TouchableOpacity 
            className="bg-blue-600 rounded-full px-6 py-3 mt-6"
            onPress={() => router.push('/(root)/(tabs)/explore')}
          >
            <Text className="text-white font-rubik-bold">Browse Properties</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Minimal Header with Back Button */}
      <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.replace('/')} className="mr-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={true}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        scrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']} // Android
            tintColor="#3B82F6" // iOS
          />
        }
      />
    </SafeAreaView>
  );
};

export default ChatList;
