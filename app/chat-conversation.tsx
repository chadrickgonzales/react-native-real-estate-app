import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import images from "@/constants/images";
import {
  createOrGetChat,
  getCurrentUser,
  getMessages,
  getPropertyById,
  getPropertyOwner,
  markMessagesAsRead,
  sendMessage,
  type Message as ChatMessage
} from "@/lib/appwrite";
import { cancelBooking, confirmBooking, getBookingById, type Booking } from "@/lib/booking";
import { useAppwrite } from "@/lib/useAppwrite";
import { CallManager, CallSignaling, CallState } from '@/lib/webrtc-call';

const Chat = () => {
  const { 
    propertyId, 
    propertyName, 
    sellerName, 
    sellerAvatar, 
    initialMessage,
    chatId,
    propertyImage 
  } = useLocalSearchParams<{
    propertyId?: string;
    propertyName?: string;
    sellerName?: string;
    sellerAvatar?: string;
    initialMessage?: string;
    chatId?: string;
    propertyImage?: string;
  }>();

  // Debug the received parameters
  useEffect(() => {
    console.log("Chat conversation received parameters:", {
      propertyId,
      propertyName,
      sellerName,
      sellerAvatar,
      initialMessage,
      chatId,
      propertyImage
    });
  }, [propertyId, propertyName, sellerName, sellerAvatar, initialMessage, chatId, propertyImage]);


  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [flatListRef, setFlatListRef] = useState<FlatList<ChatMessage> | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const lastRefreshTriggerRef = useRef<"initial" | "interval" | "send" | "focus" | null>("initial");
  const [showTimestamps, setShowTimestamps] = useState<{[key: string]: boolean}>({});
  const [showReadTimestamps, setShowReadTimestamps] = useState<{[key: string]: boolean}>({});
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callManager, setCallManager] = useState<CallManager | null>(null);
  const [callSignaling] = useState(() => CallSignaling.getInstance());
  const [callState, setCallState] = useState<CallState>({
    isIncomingCall: false,
    isOutgoingCall: false,
    isConnected: false,
    isMuted: false,
    isSpeakerOn: false,
    isRecording: false,
  });

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

  // Get property details to ensure we have the property image
  const { data: propertyDetails } = useAppwrite({
    fn: (params: { id: string }) => getPropertyById(params),
    params: { id: propertyId! },
    skip: !propertyId,
  });

  // Debug property details when loaded
  useEffect(() => {
    if (propertyDetails) {
      console.log("Property details loaded for chat:", {
        propertyId: propertyDetails.$id,
        propertyName: propertyDetails.name,
        'propertyDetails.image': propertyDetails.image,
        'propertyDetails.images': propertyDetails.images,
        'propertyDetails.images[0]': propertyDetails.images?.[0]
      });
    }
  }, [propertyDetails]);

  // Load messages when chat is ready
  const { data: chatMessages, loading: messagesLoading, refetch: refetchMessages } = useAppwrite({
    fn: (params: { chatId: string }) => getMessages(params.chatId),
    params: { chatId: currentChatId || "" },
    skip: !currentChatId, // Skip if no chat ID
  });

  // Refresh messages when chat screen mounts or chatId changes
  useEffect(() => {
    if (currentChatId) {
      lastRefreshTriggerRef.current = "focus";
      refetchMessages({ chatId: currentChatId });
    }
  }, [currentChatId]);

  // Real-time message updates while chat is open (every 5 seconds)
  useEffect(() => {
    if (currentChatId) {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up real-time refresh while chat is open
      refreshIntervalRef.current = setInterval(() => {
        lastRefreshTriggerRef.current = "interval";
        refetchMessages({ chatId: currentChatId });
      }, 5000) as unknown as NodeJS.Timeout; // Refresh every 5 seconds for real-time feel

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
      
      // Mark messages as read when they are loaded and viewed
      if (currentChatId && currentUser) {
        markMessagesAsRead(currentChatId, currentUser.$id, currentUser.userName || "You", "");
      }
      
      // Auto-scroll to the latest message
      const trigger = lastRefreshTriggerRef.current;
      const shouldAutoScroll = (trigger === "send") || (trigger === "initial") || (isNearBottom && trigger !== "interval");
      if (flatListRef && chatMessages.length > 0 && shouldAutoScroll) {
        setTimeout(() => {
          flatListRef.scrollToEnd({ animated: true });
        }, 100);
      }
      // Reset trigger after handling
      if (trigger !== "interval") {
        lastRefreshTriggerRef.current = null;
      }
    }
  }, [chatMessages, flatListRef, currentChatId, currentUser]);

  // Initialize call signaling and set up listener
  useEffect(() => {
    const initializeCallSignaling = async () => {
      if (currentChatId && currentUser) {
        console.log(`📞 Initializing call signaling for user ${currentUser.$id} in chat ${currentChatId}`);
        console.log(`📞 User details:`, {
          userId: currentUser.$id,
          userName: currentUser.userName,
          chatId: currentChatId
        });
        
        // Initialize notification service
        await callSignaling.initialize();
        
        // Listen for incoming calls
        callSignaling.listenForCalls(currentChatId, currentUser.$id, handleIncomingCall);
        
        // Clean up listener on unmount
        return () => {
          console.log(`📞 Cleaning up call listener for user ${currentUser.$id} in chat ${currentChatId}`);
          callSignaling.stopListening(currentChatId, currentUser.$id);
        };
      }
    };
    
    initializeCallSignaling();
  }, [currentChatId, currentUser]);

  // Note: Call handling is now done through push notifications, not chat messages

  // Cleanup call when component unmounts
  useEffect(() => {
    return () => {
      if (callManager) {
        callManager.endCall();
      }
    };
  }, [callManager]);

  useEffect(() => {
    const initializeChat = async () => {
      
      if (!currentUser || !propertyId || currentChatId) {
        return;
      }

      try {
        setLoading(true);
        
        // Get property owner info - use same logic as booking to ensure consistency
        const owner = propertyOwner || {
          sellerId: "unknown_owner",
          sellerName: sellerName || "Property Owner",
          sellerAvatar: sellerAvatar || "",
        };

        // Ensure consistent sellerId - use EXACT same logic as booking creation
        const consistentSellerId = propertyDetails?.ownerId || 
                                   propertyDetails?.propertyOwnerId || 
                                   "unknown_owner";
        
        console.log("🎯 USING EXACT SAME LOGIC AS BOOKING:", {
          'propertyDetails?.ownerId': propertyDetails?.ownerId,
          'propertyDetails?.propertyOwnerId': propertyDetails?.propertyOwnerId,
          'final consistentSellerId': consistentSellerId
        });

        console.log("🔍 CHAT CREATION DEBUG:", {
          propertyOwner,
          owner,
          sellerName,
          sellerAvatar,
          'owner.sellerId': owner.sellerId,
          'propertyOwner?.sellerId': propertyOwner?.sellerId,
          'consistentSellerId': consistentSellerId,
          'propertyDetails?.ownerId': propertyDetails?.ownerId,
          'propertyDetails?.propertyOwnerId': propertyDetails?.propertyOwnerId,
          'currentUser.$id': currentUser?.$id,
          'propertyId': propertyId
        });

        // Get property image for chat creation with fallback
        const chatPropertyImage = propertyImage || 
                                 propertyDetails?.images?.[0] || 
                                 propertyDetails?.image || 
                                 owner.sellerAvatar || 
                                 "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"; // Default property image

        console.log("Property image for chat creation:", {
          propertyImage,
          'propertyDetails?.images?.[0]': propertyDetails?.images?.[0],
          'propertyDetails?.image': propertyDetails?.image,
          'owner.sellerAvatar': owner.sellerAvatar,
          'final chatPropertyImage': chatPropertyImage
        });

        // Additional verification
        if (!chatPropertyImage || chatPropertyImage.trim() === '') {
          console.warn("⚠️  WARNING: No property image available for chat creation!");
          console.warn("   This will result in an empty propertyImage field in the database");
        } else {
          console.log("✅ Property image available for chat creation:", chatPropertyImage);
        }

        // Create or get chat
        const chat = await createOrGetChat({
          propertyId,
          buyerId: currentUser.$id,
          sellerId: consistentSellerId, // Use consistent seller ID
          propertyName: propertyName || "Property",
          sellerName: owner.sellerName,
          sellerAvatar: owner.sellerAvatar,
          propertyImage: chatPropertyImage,
          initialMessage: initialMessage,
        });

        setCurrentChatId(chat.$id);
        
        // Mark messages as read
        if (chat.$id) {
          await markMessagesAsRead(chat.$id, currentUser.$id, currentUser.userName || "You", "");
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

    console.log("📤 Sending message from chat input:", {
      message: message.trim(),
      messageLength: message.length,
      messageType: typeof message,
      currentChatId,
      currentUserId: currentUser.$id
    });

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
      lastRefreshTriggerRef.current = "send";
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

  const toggleTimestamp = (messageId: string) => {
    setShowTimestamps(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const toggleReadTimestamp = (messageId: string) => {
    setShowReadTimestamps(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const handleCall = async () => {
    try {
      if (!currentUser || !propertyOwner) {
        Alert.alert('Error', 'Unable to initiate call. Missing user information.');
        return;
      }

      // If no chat exists, create one first
      if (!currentChatId) {
        console.log('📞 No chat exists, creating one...');
        
        try {
          // Get property owner info
          const owner = propertyOwner || {
            sellerId: "unknown_owner",
            sellerName: sellerName || "Property Owner",
            sellerAvatar: sellerAvatar || "",
          };

          // Ensure consistent sellerId
          const consistentSellerId = propertyDetails?.ownerId || 
                                     propertyDetails?.propertyOwnerId || 
                                     "unknown_owner";

          // Get property image for chat creation
          const chatPropertyImage = propertyImage || 
                                   propertyDetails?.images?.[0] || 
                                   propertyDetails?.image || 
                                   owner.sellerAvatar || 
                                   "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop";

          // Create chat
          const chat = await createOrGetChat({
            propertyId: propertyId!,
            buyerId: currentUser.$id,
            sellerId: consistentSellerId,
            propertyName: propertyName || "Property",
            sellerName: owner.sellerName,
            sellerAvatar: owner.sellerAvatar,
            propertyImage: chatPropertyImage,
            initialMessage: "", // No initial message for calls
          });

          setCurrentChatId(chat.$id);
          console.log('📞 Chat created:', chat.$id);
          
        } catch (error) {
          console.error('Error creating chat for call:', error);
          Alert.alert('Error', 'Unable to create chat for call.');
          return;
        }
      }

      setIsCallActive(true);
      setCallStatus('calling');
      
      // Initialize call manager
      const manager = new CallManager((state) => {
        setCallState(state);
        if (state.isConnected) {
          setCallStatus('connected');
        }
      });
      
      setCallManager(manager);
      
      // Start the call locally
      await manager.startCall();
      
      // Send call notification to the other user
      console.log('📞 Current user:', currentUser.$id);
      console.log('📞 Property owner:', propertyOwner);
      console.log('📞 Current chat ID:', currentChatId);
      console.log('📞 Sending call notification to:', propertyOwner.sellerId);
      
      // Make sure we're not calling ourselves
      if (propertyOwner.sellerId === currentUser.$id) {
        Alert.alert('Error', 'You cannot call yourself!');
        setIsCallActive(false);
        setCallStatus('idle');
        return;
      }
      
      console.log('📞 About to call sendCallMessage with:', {
        currentChatId,
        currentChatIdType: typeof currentChatId,
        currentChatIdNull: currentChatId === null,
        currentChatIdUndefined: currentChatId === undefined
      });
      
      // Generate unique call ID
      const callId = `call_${Date.now()}_${currentUser.$id}`;
      
      console.log('📞 Sending real call notification to:', propertyOwner.sellerId);
      await callSignaling.sendCallNotification(
        currentChatId!,
        currentUser.$id,
        propertyOwner.sellerId,
        {
          callId,
          callerId: currentUser.$id,
          callerName: currentUser.userName,
          callerAvatar: propertyOwner.sellerAvatar,
          chatId: currentChatId!,
          propertyId: propertyId!,
          callType: 'incoming'
        }
      );
      
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Call Failed', 'Unable to start call. Please check your permissions.');
      setIsCallActive(false);
      setCallStatus('idle');
    }
  };

  const handleIncomingCall = async (callData: any) => {
    try {
      console.log('📞 Incoming call from:', callData.callerId, callData);
      
      // Show incoming call UI
      setIsCallActive(true);
      setCallState(prev => ({
        ...prev,
        isIncomingCall: true,
        isOutgoingCall: false,
        isConnected: false
      }));
      
      // Initialize call manager for incoming call
      const manager = new CallManager((state) => {
        setCallState(state);
        if (state.isConnected) {
          setCallStatus('connected');
        }
      });
      
      setCallManager(manager);
      
    } catch (error) {
      console.error('Error handling incoming call:', error);
    }
  };

  const handleAnswerCall = async () => {
    try {
      if (!callManager || !currentUser || !currentChatId || !propertyOwner) return;
      
      // Answer the call locally
      await callManager.answerCall();
      
      // Send answer notification
      const callId = `call_${Date.now()}_${currentUser.$id}`;
      await callSignaling.sendCallResponseNotification(
        propertyOwner.sellerId,
        callId,
        'answered'
      );
      
      setCallState(prev => ({
        ...prev,
        isIncomingCall: false,
        isConnected: true
      }));
      
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const handleDeclineCall = async () => {
    try {
      if (!currentUser || !currentChatId || !propertyOwner) return;
      
      // Send decline notification
      const callId = `call_${Date.now()}_${currentUser.$id}`;
      await callSignaling.sendCallResponseNotification(
        propertyOwner.sellerId,
        callId,
        'declined'
      );
      
      // Clean up call state
      setIsCallActive(false);
      setCallStatus('idle');
      setCallState({
        isIncomingCall: false,
        isOutgoingCall: false,
        isConnected: false,
        isMuted: false,
        isSpeakerOn: false,
        isRecording: false,
      });
      
      if (callManager) {
        await callManager.endCall();
        setCallManager(null);
      }
      
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      if (callManager) {
        await callManager.endCall();
      }
      
      // Send call ended notification
      if (currentUser && propertyOwner) {
        const callId = `call_${Date.now()}_${currentUser.$id}`;
        await callSignaling.sendCallResponseNotification(
          propertyOwner.sellerId,
          callId,
          'missed'
        );
      }
      
      setIsCallActive(false);
      setCallStatus('ended');
      setCallManager(null);
      
      // Reset after a moment
      setTimeout(() => {
        setCallStatus('idle');
        setCallState({
          isIncomingCall: false,
          isOutgoingCall: false,
          isConnected: false,
          isMuted: false,
          isSpeakerOn: false,
          isRecording: false,
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const handleToggleMute = async () => {
    if (callManager) {
      await callManager.toggleMute();
    }
  };

  const handleToggleSpeaker = async () => {
    if (callManager) {
      await callManager.toggleSpeaker();
    }
  };

  const handleApproveBooking = async (messageItem: any) => {
    if (!bookingData) return;
    
    try {
      Alert.alert(
        'Approve Booking',
        'Are you sure you want to approve this booking?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve',
            style: 'default',
            onPress: async () => {
              try {
                await confirmBooking(bookingData.$id);
                Alert.alert('Success', 'Booking approved successfully!');
                // Refresh booking data
                await fetchBookingData(bookingData.$id);
              } catch (error) {
                console.error('Error approving booking:', error);
                Alert.alert('Error', 'Failed to approve booking');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error approving booking:', error);
      Alert.alert('Error', 'Failed to approve booking');
    }
  };

  const handleUpdateBooking = async (messageItem: any) => {
    if (!bookingData) return;
    
    try {
      Alert.alert(
        'Update Booking',
        'What would you like to update?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change Date/Time',
            style: 'default',
            onPress: () => {
              // TODO: Implement booking update logic
              console.log('📅 Updating booking date/time for:', bookingData);
              Alert.alert('Info', 'Booking update feature coming soon!');
            }
          },
          {
            text: 'Change Guests',
            style: 'default',
            onPress: () => {
              // TODO: Implement guest count update
              console.log('👥 Updating guest count for:', bookingData);
              Alert.alert('Info', 'Guest count update feature coming soon!');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking');
    }
  };

  const fetchBookingData = async (bookingId: string) => {
    try {
      setBookingLoading(true);
      const booking = await getBookingById(bookingId);
      setBookingData(booking);
      console.log('Fetched booking data:', booking);
    } catch (error) {
      console.error('Error fetching booking data:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (messageItem: any) => {
    if (!bookingData) return;
    
    try {
      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelBooking(bookingData.$id, 'Cancelled by user');
                Alert.alert('Success', 'Booking cancelled successfully!');
                // Refresh booking data
                await fetchBookingData(bookingData.$id);
              } catch (error) {
                console.error('Error cancelling booking:', error);
                Alert.alert('Error', 'Failed to cancel booking');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.senderId === currentUser?.$id;
    const isFirstMessage = index === 0;
    const isLastMessage = index === messages.length - 1;
    
    // Find the last message from the other person (not the current user)
    const lastOtherPersonMessageIndex = messages.findLastIndex(msg => msg.senderId !== currentUser?.$id);
    const isLastOtherPersonMessage = !isUser && index === lastOtherPersonMessageIndex;
    
    // Find the last message that has been read by someone else
    const lastReadMessageIndex = messages.findLastIndex(msg => 
      msg.senderId === currentUser?.$id && msg.readBy && msg.readBy.trim() !== ''
    );
    const isLastReadMessage = isUser && index === lastReadMessageIndex;
    
    // Debug property image data for first message
    if (isFirstMessage && !isUser) {
      console.log('Property image data for first message:', {
        propertyImage,
        'propertyDetails?.images?.[0]': propertyDetails?.images?.[0],
        'propertyDetails?.image': propertyDetails?.image,
        'propertyOwner?.sellerAvatar': propertyOwner?.sellerAvatar,
        propertyName,
        'propertyDetails?.name': propertyDetails?.name
      });
    }
    
    // Check if this is a booking message (starts with "Booking for:")
    const isBookingMessage = item.text.startsWith('Booking for:');
    
    console.log('Message text:', item.text);
    console.log('Is booking message:', isBookingMessage);
    
    if (isBookingMessage) {
      // Extract property name and booking ID from the message
      const messageParts = item.text.split('|');
      const propertyName = messageParts[0].replace('Booking for: ', '');
      const bookingId = messageParts[1];
      
      console.log('✅ CLEAN BOOKING MESSAGE DETECTED!');
      console.log('Property name:', propertyName);
      console.log('Booking ID:', bookingId);
      
      // Fetch booking data if we have a booking ID
      if (bookingId && !bookingData) {
        fetchBookingData(bookingId);
      }
      
      // Determine if current user is the property owner or the booker
      const isPropertyOwner = currentUser?.$id === bookingData?.ownerId;
      const isBooker = currentUser?.$id === bookingData?.userId;
      
      console.log('User role check:', {
        currentUserId: currentUser?.$id,
        bookingOwnerId: bookingData?.ownerId,
        bookingUserId: bookingData?.userId,
        isPropertyOwner,
        isBooker
      });
      
      return (
        <View className="mb-6">
          <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
              <View className="mr-3 self-start">
                <Image
                  source={item.senderAvatar ? { uri: item.senderAvatar } : images.avatar}
                  className="w-8 h-8 rounded-full"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}
                />
              </View>
            )}
            <TouchableOpacity 
              className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}
              onPress={() => toggleTimestamp(item.$id)}
              activeOpacity={0.7}
            >
              {/* Property Card Style Booking Message - aligned like chat bubble */}
              <View className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative p-2">
            {/* Property Image */}
            <View className="relative">
              <Image 
                source={{ 
                  uri: propertyImage || 
                         propertyDetails?.images?.[0] || 
                         propertyDetails?.image || 
                         "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
                }} 
                className="w-full h-48 rounded-lg"
                resizeMode="cover"
              />
              
              {/* Property Type Tag - Top Left */}
              <View className="absolute top-3 left-3 bg-gray-800 px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  {propertyDetails?.propertyType || 'Duplexes'}
                </Text>
              </View>
            </View>

              {/* Property Details */}
              <View className="px-2">
                {/* Property Name and Price Row */}
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-base font-bold text-gray-800 flex-1 mr-2">
                    {propertyName}
                  </Text>
                  <Text className="text-base font-bold text-gray-800">
                    {bookingData?.totalAmount ? `₱${bookingData.totalAmount.toLocaleString()}` : (propertyDetails?.price || '$8,718,119')}
                  </Text>
                </View>
                
                {/* Address and Distance Row */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-gray-600 flex-1 mr-2">
                    {bookingData?.propertyAddress || propertyDetails?.address || '459 Quezon Blvd, Tarlac City, Tarlac'}
                  </Text>
                  <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#10B981" />
                  <Text className="text-sm text-green-500 ml-1 font-medium">
                      {propertyDetails?.distance || '0.8 km'}
                    </Text>
                  </View>
                </View>

                {/* Property Features */}
                <View className="flex-row gap-2 mb-3">
                  <View className="flex-row items-center bg-gray-100 px-2.5 py-1.5 rounded-2xl">
                    <Ionicons name="bed-outline" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1 font-medium">
                      {propertyDetails?.bedrooms || '3'} Beds
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-gray-100 px-2.5 py-1.5 rounded-2xl">
                    <Ionicons name="water-outline" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1 font-medium">
                      {propertyDetails?.bathrooms || '3'} Baths
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-gray-100 px-2.5 py-1.5 rounded-2xl">
                    <Ionicons name="resize-outline" size={16} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1 font-medium">
                      {propertyDetails?.area || '1006'} Sqft
                    </Text>
                  </View>
                </View>

                {/* Booking Information */}
                <View className="bg-blue-50 rounded-xl p-3 mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-blue-800 font-semibold text-sm">Booking Details</Text>
                    <View className={`px-2 py-1 rounded-full ${
                      bookingData?.status === 'confirmed' ? 'bg-green-100' :
                      bookingData?.status === 'cancelled' ? 'bg-red-100' :
                      bookingData?.status === 'completed' ? 'bg-blue-100' :
                      'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        bookingData?.status === 'confirmed' ? 'text-green-800' :
                        bookingData?.status === 'cancelled' ? 'text-red-800' :
                        bookingData?.status === 'completed' ? 'text-blue-800' :
                        'text-yellow-800'
                      }`}>
                        {bookingData?.status?.toUpperCase() || 'PENDING'}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="calendar-outline" size={16} color="#1E40AF" />
                    <Text className="text-blue-700 text-sm ml-2 font-medium">
                      {bookingData?.bookingDate ? 
                        new Date(bookingData.bookingDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) :
                        new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      }
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="time-outline" size={16} color="#1E40AF" />
                    <Text className="text-blue-700 text-sm ml-2 font-medium">
                      {bookingData?.bookingTime || new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={16} color="#1E40AF" />
                    <Text className="text-blue-700 text-sm ml-2 font-medium">
                      {bookingData?.guests || 2} guests • {bookingData?.duration ? Math.round(bookingData.duration / 60) : 60} minutes
                    </Text>
                  </View>
                </View>

              {/* Action Buttons - Show different buttons based on user role */}
              {bookingData && (isPropertyOwner || isBooker) && (
                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    className="flex-1 bg-red-500 py-3 rounded-xl"
                    onPress={() => handleCancelBooking(item)}
                    disabled={bookingData.status === 'cancelled'}
                  >
                    <Text className="text-white font-semibold text-center">
                      {bookingData.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                  
                  {isPropertyOwner ? (
                    // Property Owner sees Approve button
                    <TouchableOpacity 
                      className="flex-1 bg-green-500 py-3 rounded-xl"
                      onPress={() => handleApproveBooking(item)}
                      disabled={bookingData.status === 'confirmed' || bookingData.status === 'cancelled'}
                    >
                      <Text className="text-white font-semibold text-center">
                        {bookingData.status === 'confirmed' ? 'Approved' : 'Approve'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    // Booker sees Update button
                    <TouchableOpacity 
                      className="flex-1 bg-blue-500 py-3 rounded-xl"
                      onPress={() => handleUpdateBooking(item)}
                      disabled={bookingData.status === 'cancelled'}
                    >
                      <Text className="text-white font-semibold text-center">
                        {bookingData.status === 'cancelled' ? 'Cancelled' : 'Update'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              </View>
              {showTimestamps[item.$id] && (
                <Text className={`text-gray-400 font-rubik text-xs mt-2 ${isUser ? 'text-right' : 'text-left'} px-1`}>
                  {formatTime(item.timestamp)}
                </Text>
              )}
              
              {/* Read receipts for user's booking messages - show only on last read message */}
              {isLastReadMessage && item.readBy && (() => {
                try {
                  const readReceipts = JSON.parse(item.readBy);
                  // Find the most recent read receipt
                  const mostRecentRead = readReceipts.sort((a: any, b: any) => 
                    new Date(b.readAt).getTime() - new Date(a.readAt).getTime()
                  )[0];
                  
                  return mostRecentRead && (
                    <View className={`flex-row items-center mt-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <TouchableOpacity 
                        onPress={() => toggleReadTimestamp(item.$id)}
                        activeOpacity={0.7}
                        className="flex-row items-center"
                      >
                        <Image
                          source={mostRecentRead.userAvatar ? { uri: mostRecentRead.userAvatar } : images.avatar}
                          className="w-4 h-4 rounded-full"
                        />
                      </TouchableOpacity>
                      {showReadTimestamps[item.$id] && (
                        <Text className="text-gray-400 font-rubik text-xs ml-2">
                          Read at {formatTime(mostRecentRead.readAt)}
                        </Text>
                      )}
                    </View>
                  );
                } catch (error) {
                  return null;
                }
              })()}
              </View>
            </TouchableOpacity>
            {/* Do not show avatar for user's own messages */}
          </View>
        </View>
      );
    }
    
    return (
      <View className="mb-3">
        {/* Property Image Display for First Message */}
        {isFirstMessage && !isUser && (
          (() => {
            // Get property image from multiple sources
            const imageUrl = propertyImage || 
                           propertyDetails?.images?.[0] || 
                           propertyDetails?.image || 
                           propertyOwner?.sellerAvatar;
            
            if (imageUrl) {
              return (
                <View className="mb-3 mx-4">
                  <View className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="home-outline" size={16} color="#3B82F6" />
                      <Text className="text-sm font-rubik-medium text-gray-600 ml-2">Property</Text>
                    </View>
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-24 rounded-xl"
                      resizeMode="cover"
                      onError={() => console.log('Property image failed to load:', imageUrl)}
                    />
                    <Text className="text-sm font-rubik-medium text-gray-800 mt-2">
                      {propertyName || propertyDetails?.name || 'Property'}
                    </Text>
                  </View>
                </View>
              );
            }
            return null;
          })()
        )}
        
        <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
          {!isUser && (
            <View className="mr-3 self-end">
              <Image
                source={item.senderAvatar ? { uri: item.senderAvatar } : images.avatar}
                className="w-8 h-8 rounded-full"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}
              />
            </View>
          )}
          
          <TouchableOpacity 
            className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}
            onPress={() => toggleTimestamp(item.$id)}
            activeOpacity={0.7}
          >
            {isUser ? (
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                className="px-4 py-3 rounded-3xl rounded-br-md"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="font-rubik text-base leading-5 text-white">
                  {item.text}
                </Text>
              </LinearGradient>
            ) : (
              <View
                className="px-4 py-3 rounded-3xl rounded-bl-md bg-white"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="font-rubik text-base leading-5 text-gray-800">
                  {item.text}
                </Text>
              </View>
            )}
            {showTimestamps[item.$id] && (
              <Text className="text-gray-400 font-rubik text-xs mt-1 px-1">
                {formatTime(item.timestamp)}
              </Text>
            )}
            
            {/* Read receipts for user's messages - show only on last read message */}
            {isLastReadMessage && item.readBy && (() => {
              try {
                const readReceipts = JSON.parse(item.readBy);
                // Find the most recent read receipt
                const mostRecentRead = readReceipts.sort((a: any, b: any) => 
                  new Date(b.readAt).getTime() - new Date(a.readAt).getTime()
                )[0];
                
                return mostRecentRead && (
                  <View className="flex-row items-center mt-1 px-1">
                    <TouchableOpacity 
                      onPress={() => toggleReadTimestamp(item.$id)}
                      activeOpacity={0.7}
                      className="flex-row items-center"
                    >
                      <Image
                        source={mostRecentRead.userAvatar ? { uri: mostRecentRead.userAvatar } : images.avatar}
                        className="w-4 h-4 rounded-full"
                      />
                    </TouchableOpacity>
                    {showReadTimestamps[item.$id] && (
                      <Text className="text-gray-400 font-rubik text-xs ml-2">
                        Read at {formatTime(mostRecentRead.readAt)}
                      </Text>
                    )}
                  </View>
                );
              } catch (error) {
                return null;
              }
            })()}
          </TouchableOpacity>
          
          {/* Do not show avatar for user's own messages */}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#F0F9F4", "#E8F5E8", "#F0F9F4"]}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubbles" size={24} color="white" />
            </View>
            <Text className="text-gray-600 text-lg font-rubik-medium">Loading chat...</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#F0F9F4", "#E8F5E8", "#F0F9F4"]}
      style={{ flex: 1 }}
    >
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      
      {/* Modern Header */}
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        className="border-b border-gray-100"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
      >
        <View className="flex-row items-center justify-between px-4 py-4 pt-16">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="mr-4 w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            
            <Image
              source={propertyOwner?.sellerAvatar ? { uri: propertyOwner.sellerAvatar } : images.avatar}
              className="w-12 h-12 rounded-full mr-3"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
            />
            
            <View className="flex-1">
              <Text className="text-gray-900 font-rubik-bold text-lg">
                {propertyOwner?.sellerName || sellerName || "Property Owner"}
              </Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-gray-500 font-rubik text-sm">
                  Active now
                </Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <View className="flex-1">
        <FlatList
          ref={setFlatListRef}
          data={messages}
          renderItem={({ item, index }) => renderMessage({ item, index })}
          keyExtractor={(item) => item.$id}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            const paddingToBottom = 40; // threshold in px
            const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - paddingToBottom;
            setIsNearBottom(isAtBottom);
          }}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            // Auto-scroll when content size changes (new messages)
            const trigger = lastRefreshTriggerRef.current;
            const shouldAutoScroll = (trigger === "send") || (trigger === "initial") || (isNearBottom && trigger !== "interval");
            if (flatListRef && messages.length > 0 && shouldAutoScroll) {
              flatListRef.scrollToEnd({ animated: true });
            }
          }}
        />
      </View>

      {/* Modern Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-white pb-1"
      >
        <View className="px-4 py-4 bg-white border-t border-gray-100">
          <View className="flex-row items-center pb-3 pb-1">
            <TouchableOpacity className="mr-1 w-10 h-10 items-center justify-center">
              <Ionicons name="add-circle" size={28} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity className="mr-1 w-10 h-10 items-center justify-center">
              <Ionicons name="camera" size={28} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity className="mr-1 w-10 h-10 items-center justify-center">
              <Ionicons name="images" size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Message"
              placeholderTextColor="#9CA3AF"
              className="flex-1 font-rubik text-base text-gray-900 min-h-[24px] max-h-[120px] bg-gray-100 rounded-3xl pl-4"
              multiline
              maxLength={500}
              style={{ lineHeight: 20 }}
            />
            {message.trim() ? (
              <TouchableOpacity 
                onPress={handleSendMessage} 
                className="ml-3" 
                disabled={sending}
              >
                
                  <Ionicons name="send" size={24} color="blue" />
          
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="ml-3 w-10 h-10 items-center justify-center">
                <Ionicons name="heart" size={30} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* In-App Call Interface */}
      {isCallActive && (
        <View className="absolute inset-0 bg-black bg-opacity-90 z-50 flex-1 justify-center items-center">
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6', '#1E40AF']}
            className="w-full h-full justify-center items-center"
          >
            {/* Call Header */}
            <View className="absolute top-16 left-0 right-0 px-6">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity 
                  onPress={handleEndCall}
                  className="w-10 h-10 rounded-full bg-red-500 items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-rubik-bold text-lg">Call</Text>
                <View className="w-10" />
              </View>
            </View>

            {/* Call Content */}
            <View className="items-center px-6">
              {/* Profile Picture */}
              <View className="mb-8">
                <Image
                  source={propertyOwner?.sellerAvatar ? { uri: propertyOwner.sellerAvatar } : images.avatar}
                  className="w-32 h-32 rounded-full"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                />
              </View>

              {/* Contact Name */}
              <Text className="text-white font-rubik-bold text-2xl mb-2">
                {propertyOwner?.sellerName || sellerName || "Property Owner"}
              </Text>

              {/* Call Status */}
              <Text className="text-blue-200 font-rubik text-lg mb-8">
                {callState.isIncomingCall && 'Incoming Call'}
                {callState.isOutgoingCall && callStatus === 'calling' && 'Calling...'}
                {callStatus === 'connected' && 'Connected'}
                {callStatus === 'ended' && 'Call Ended'}
              </Text>

              {/* Call Controls */}
              {callStatus === 'connected' && (
                <View className="flex-row items-center space-x-8">
                  {/* Mute Button */}
                  <TouchableOpacity 
                    onPress={handleToggleMute}
                    className={`w-16 h-16 rounded-full items-center justify-center ${
                      callState.isMuted ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <Ionicons 
                      name={callState.isMuted ? "mic-off" : "mic"} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>

                  {/* Speaker Button */}
                  <TouchableOpacity 
                    onPress={handleToggleSpeaker}
                    className={`w-16 h-16 rounded-full items-center justify-center ${
                      callState.isSpeakerOn ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <Ionicons 
                      name={callState.isSpeakerOn ? "volume-high" : "volume-low"} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>

                  {/* End Call Button */}
                  <TouchableOpacity 
                    onPress={handleEndCall}
                    className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
                  >
                    <Ionicons name="call" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Incoming Call Controls */}
              {callState.isIncomingCall && (
                <View className="flex-row items-center space-x-8">
                  {/* Decline Button */}
                  <TouchableOpacity 
                    onPress={handleDeclineCall}
                    className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
                  >
                    <Ionicons name="call" size={24} color="white" />
                  </TouchableOpacity>
                  
                  {/* Answer Button */}
                  <TouchableOpacity 
                    onPress={handleAnswerCall}
                    className="w-16 h-16 rounded-full bg-green-500 items-center justify-center"
                  >
                    <Ionicons name="call" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Outgoing Call Controls */}
              {callState.isOutgoingCall && callStatus === 'calling' && (
                <View className="flex-row items-center space-x-8">
                  {/* Cancel Button */}
                  <TouchableOpacity 
                    onPress={handleEndCall}
                    className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
                  >
                    <Ionicons name="call" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Call Duration (when connected) */}
            {callStatus === 'connected' && (
              <View className="absolute bottom-32 left-0 right-0">
                <Text className="text-center text-white font-rubik text-lg">
                  00:00
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      )}
    </LinearGradient>
  );
};

export default Chat;
