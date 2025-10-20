import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState, } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// using the home page search bar style inline here
import images from "@/constants/images";
import { getCurrentUser, getUserChats, type Chat } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

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

  const filteredChats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) =>
      (c.propertyName || "").toLowerCase().includes(q) ||
      (c.lastMessage || "").toLowerCase().includes(q)
    );
  }, [chats, query]);

  const renderChatItem = ({ item }: { item: Chat }) => {
    const getPropertyName = () => {
      return item.propertyName || 'Property';
    };

    // Debug chat item data
    console.log('Chat item data:', {
      id: item.$id,
      propertyId: item.propertyId,
      propertyName: item.propertyName,
      propertyImage: item.propertyImage,
      sellerAvatar: item.sellerAvatar,
      sellerName: item.sellerName
    });

    return (
      <TouchableOpacity
        className="flex-row items-center bg-white rounded-2xl pt-2 pb-2 pl-2 pr-4 mb-3 border border-gray-100"
        onPress={() => router.push({
          pathname: '/chat-conversation',
          params: {
            chatId: item.$id,
            propertyId: item.propertyId,
            propertyName: item.propertyName,
            sellerName: item.sellerName,
            sellerAvatar: item.sellerAvatar,
            propertyImage: item.propertyImage || item.sellerAvatar || '',
          }
        })}
      >
        <View className="mr-3">
          <Image
            source={
              item.propertyImage 
                ? { uri: item.propertyImage }
                : images.newYork
            }
            className="w-16 h-16 rounded-md"
            resizeMode="cover"
            onError={() => console.log('Chat list property image failed to load:', item.propertyImage)}
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-900 font-rubik-bold" numberOfLines={1}>
              {getPropertyName()}
            </Text>
            <Text className="text-gray-400 font-rubik text-xs">
              {item.lastMessageTime ? formatTime(item.lastMessageTime) : ""}
            </Text>
          </View>
          <Text className="text-gray-600 font-rubik text-sm" numberOfLines={1}>
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
    <SafeAreaView className="flex-1" edges={['left','right','bottom']}>
      <StatusBar hidden={true} />
      <LinearGradient
        colors={['#F0F9F4', '#E8F5E8', '#F0F9F4']}
        style={{ flex: 1, paddingTop: 44}}
      >
      {/* Search Bar (copied style from Home) */}
      <View className="px-4 pt-3">
        <View className="flex-row items-center gap-2">
          <View className="flex-1 mb-4 bg-white rounded-full shadow-md">
            <View className="flex-row items-center">
              <View className="flex-1 bg-white rounded-full px-3 py-3 mr-1">
                <TextInput
                  className="text-base font-rubik text-black-300"
                  placeholder="Search message..."
                  placeholderTextColor="#8c8e98"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => {}}
                />
              </View>
              <TouchableOpacity 
                className="w-16 h-16 rounded-full items-center justify-center mr-2" 
                style={{ backgroundColor: '#14b8a6' }}
                onPress={() => {}}
              >
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.$id}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 0 }}
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
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ChatList;
