import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Animated
} from "react-native";

import { 
  addSyncStatusListener, 
  removeSyncStatusListener, 
  SyncStatus, 
  forceSync,
  isOnline
} from "@/lib/offline-sync";
import { useGlobalContext } from "@/lib/global-provider";
import { getCacheStats, getLastSyncTime } from "@/lib/offline-storage";

interface OfflineStatusProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

const OfflineStatus = ({ showWhenOnline = false, position = 'top' }: OfflineStatusProps) => {
  const { user } = useGlobalContext();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: isOnline(),
    isSyncing: false,
    lastSync: null
  });
  const [showDetails, setShowDetails] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const handleSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    addSyncStatusListener(handleSyncStatusChange);
    loadCacheStats();

    return () => {
      removeSyncStatusListener(handleSyncStatusChange);
    };
  }, []);

  useEffect(() => {
    // Animate the status bar in/out
    Animated.timing(slideAnim, {
      toValue: shouldShowStatus() ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [syncStatus, showWhenOnline]);

  const loadCacheStats = async () => {
    const stats = await getCacheStats();
    const lastSync = await getLastSyncTime();
    setCacheStats({ ...stats, lastSync });
  };

  const shouldShowStatus = () => {
    return !syncStatus.isOnline || syncStatus.isSyncing || showWhenOnline;
  };

  const handleSync = async () => {
    try {
      await forceSync(user?.$id);
      await loadCacheStats();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) return '#F59E0B'; // Orange
    if (!syncStatus.isOnline) return '#EF4444'; // Red
    return '#10B981'; // Green
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) return 'sync';
    if (!syncStatus.isOnline) return 'cloud-offline';
    return 'cloud-done';
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!shouldShowStatus()) {
    return null;
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'top' ? [-50, 0] : [50, 0],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: 'absolute',
        left: 0,
        right: 0,
        [position]: 0,
        zIndex: 1000,
      }}
    >
      <TouchableOpacity
        onPress={() => setShowDetails(!showDetails)}
        className="mx-4 my-2"
      >
        <View 
          className="flex-row items-center justify-between px-4 py-3 rounded-lg shadow-sm"
          style={{ backgroundColor: getStatusColor() }}
        >
          <View className="flex-row items-center">
            <Ionicons 
              name={getStatusIcon() as any} 
              size={20} 
              color="white" 
            />
            <Text className="text-white font-rubik-bold ml-2">
              {getStatusText()}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            {!syncStatus.isOnline && (
              <TouchableOpacity
                onPress={handleSync}
                className="bg-white/20 px-3 py-1 rounded-full mr-2"
                disabled={syncStatus.isSyncing}
              >
                <Text className="text-white font-rubik-bold text-xs">
                  {syncStatus.isSyncing ? 'Syncing...' : 'Retry'}
                </Text>
              </TouchableOpacity>
            )}
            
            <Ionicons 
              name={showDetails ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="white" 
            />
          </View>
        </View>

        {/* Details Panel */}
        {showDetails && cacheStats && (
          <View className="bg-white rounded-lg mt-2 p-4 shadow-sm border border-gray-200">
            <Text className="font-rubik-bold text-gray-900 mb-3">Connection Details</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-rubik">Status</Text>
                <Text className="text-gray-900 font-rubik-bold">{getStatusText()}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-rubik">Last Sync</Text>
                <Text className="text-gray-900 font-rubik-bold">
                  {formatLastSync(cacheStats.lastSync)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-rubik">Cache Size</Text>
                <Text className="text-gray-900 font-rubik-bold">
                  {formatBytes(cacheStats.totalSize)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-rubik">Cached Items</Text>
                <Text className="text-gray-900 font-rubik-bold">
                  {cacheStats.itemCount}
                </Text>
              </View>
              
              {cacheStats.offlineActionsCount > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-rubik">Pending Actions</Text>
                  <Text className="text-orange-600 font-rubik-bold">
                    {cacheStats.offlineActionsCount}
                  </Text>
                </View>
              )}
            </View>

            {!syncStatus.isSyncing && (
              <TouchableOpacity
                onPress={handleSync}
                className="bg-blue-500 py-2 px-4 rounded-lg mt-4"
              >
                <Text className="text-white font-rubik-bold text-center">
                  Sync Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default OfflineStatus;
