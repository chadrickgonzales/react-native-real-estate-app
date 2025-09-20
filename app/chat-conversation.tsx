import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BookingMessage from "@/components/BookingMessage";
import images from "@/constants/images";
import {
    createOrGetChat,
    getCurrentUser,
    getMessages,
    getPropertyOwner,
    markMessagesAsRead,
    sendMessage,
    type Message as ChatMessage
} from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

const Chat = () => {
  const { 
    propertyId, 
    propertyName, 
    sellerName, 
    sellerAvatar, 
    initialMessage,
    chatId 
  } = useLocalSearchParams<{
    propertyId?: string;
    propertyName?: string;
    sellerName?: string;
    sellerAvatar?: string;
    initialMessage?: string;
    chatId?: string;
  }>();


  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [flatListRef, setFlatListRef] = useState<FlatList<ChatMessage> | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user
  const { data: currentUser } = useAppwrite({
    fn: getCurrentUser,
    params: {},
  });

  // Get property owner info
  const { data: propertyOwner } = useAppwrite({
    fn: (params: { propertyId: string }) => getPropertyOwner(params.propertyId),
    params: { propertyId: propertyId! },
  });

  // Load messages when chat is ready
  const { data: chatMessages, loading: messagesLoading, refetch: refetchMessages } = useAppwrite({
    fn: (params: { chatId: string }) => getMessages(params.chatId),
    params: { chatId: currentChatId || "" },
    skip: !currentChatId, // Skip if no chat ID
  });

  // Refresh messages when chat screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentChatId) {
        refetchMessages({ chatId: currentChatId });
      }
    }, [currentChatId])
  );

  // Real-time message updates while chat is open (every 5 seconds)
  useEffect(() => {
    if (currentChatId) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up real-time refresh while chat is open
      refreshIntervalRef.current = setInterval(() => {
        refetchMessages({ chatId: currentChatId });
      }, 5000); // Refresh every 5 seconds for real-time feel

      // Cleanup on unmount
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [currentChatId]); // Only depend on currentChatId to avoid loops

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
      setLoading(false);
      
      // Auto-scroll to the latest message
      if (flatListRef && chatMessages.length > 0) {
        setTimeout(() => {
          flatListRef.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  }, [chatMessages, flatListRef]);

  useEffect(() => {
    const initializeChat = async () => {
      
      if (!currentUser || !propertyId || currentChatId) {
        return;
      }

      try {
        setLoading(true);
        
        // Get property owner info
        const owner = propertyOwner || {
          sellerId: "unknown_owner",
          sellerName: sellerName || "Property Owner",
          sellerAvatar: sellerAvatar || "",
        };

        console.log("Property owner info:", {
          propertyOwner,
          owner,
          sellerName,
          sellerAvatar
        });

        // Create or get chat
        const chat = await createOrGetChat({
          propertyId,
          buyerId: currentUser.$id,
          sellerId: owner.sellerId,
          propertyName: propertyName || "Property",
          sellerName: owner.sellerName,
          sellerAvatar: owner.sellerAvatar,
          initialMessage: initialMessage,
        });

        setCurrentChatId(chat.$id);
        
        // Mark messages as read
        if (chat.$id) {
          await markMessagesAsRead(chat.$id, currentUser.$id);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    initializeChat();
  }, [currentUser, propertyId, propertyOwner, currentChatId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentChatId || !currentUser || sending) return;

    try {
      setSending(true);
      
      await sendMessage({
        chatId: currentChatId,
        senderId: currentUser.$id,
        senderName: currentUser.userName || "You",
        senderAvatar: "", // You can add user avatar later
        text: message.trim(),
      });

      setMessage("");
      
      // Immediately refresh messages after sending
      refetchMessages({ chatId: currentChatId });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.senderId === currentUser?.$id;
    
    // Check if this is a booking message
    const isBookingMessage = item.text.startsWith('BOOKING_REQUEST:');
    
    if (isBookingMessage) {
      try {
        const bookingData = JSON.parse(item.text.replace('BOOKING_REQUEST:', ''));
        const isPropertyOwner = currentUser?.$id === propertyOwner?.sellerId;
        
        return (
          <View className="mb-4">
            <BookingMessage
              booking={{
                ...bookingData,
                senderId: item.senderId,
                senderName: item.senderName
              }}
              currentUserId={currentUser?.$id || ''}
              isPropertyOwner={isPropertyOwner}
              onBookingUpdate={() => {
                // Refresh messages when booking is updated
                refetchMessages({ chatId: currentChatId! });
              }}
            />
            <Text className="text-gray-500 font-rubik text-xs mt-1 text-center">
              {formatTime(item.timestamp)}
            </Text>
          </View>
        );
      } catch (error) {
        console.error('Error parsing booking message:', error);
        // Fall back to regular message if parsing fails
      }
    }
    
    return (
      <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="mr-3">
            <Image
              source={item.senderAvatar ? { uri: item.senderAvatar } : images.avatar}
              className="w-8 h-8 rounded-full"
            />
          </View>
        )}
        
        <View className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          <View
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-blue-500 rounded-br-md'
                : 'bg-gray-200 rounded-bl-md'
            }`}
          >
            <Text
              className={`font-rubik text-base ${
                isUser ? 'text-white' : 'text-gray-900'
              }`}
            >
              {item.text}
            </Text>
          </View>
          <Text className="text-gray-500 font-rubik text-xs mt-1">
            {formatTime(item.timestamp)}
          </Text>
        </View>
        
        {isUser && (
          <View className="ml-3">
            <Image
              source={images.avatar}
              className="w-8 h-8 rounded-full"
            />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-lg font-rubik">Loading chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <Image
            source={propertyOwner?.sellerAvatar ? { uri: propertyOwner.sellerAvatar } : images.avatar}
            className="w-10 h-10 rounded-full mr-3"
          />
          
          <View className="flex-1">
            <Text className="text-gray-900 font-rubik-bold text-base">
              {propertyOwner?.sellerName || sellerName || "Property Owner"}
            </Text>
            <Text className="text-gray-500 font-rubik text-sm">
              {propertyName || "Property Chat"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity className="ml-3">
          <Ionicons name="call" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={setFlatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.$id}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          // Auto-scroll when content size changes (new messages)
          if (flatListRef && messages.length > 0) {
            flatListRef.scrollToEnd({ animated: true });
          }
        }}
      />

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="border-t border-gray-200"
      >
        <View className="flex-row items-center px-4 py-3 bg-white">
          <TouchableOpacity className="mr-3">
            <Ionicons name="add-circle-outline" size={28} color="#6B7280" />
          </TouchableOpacity>
          
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              className="flex-1 font-rubik text-base text-gray-900"
              multiline
              maxLength={500}
            />
            
            {message.trim() && (
              <TouchableOpacity onPress={handleSendMessage} className="ml-2" disabled={sending}>
                <View className={`w-8 h-8 rounded-full items-center justify-center ${sending ? 'bg-gray-400' : 'bg-blue-500'}`}>
                  <Ionicons name="send" size={16} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity className="ml-3">
            <Ionicons name="camera-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
