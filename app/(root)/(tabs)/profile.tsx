import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Alert,
    Image,
    ImageSourcePropType,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

import icons from "@/constants/icons";
import images from "@/constants/images";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex flex-row items-center justify-between py-4 px-2 rounded-xl active:bg-accent-50"
  >
    <View className="flex flex-row items-center gap-4">
      <View className="w-8 h-8 items-center justify-center">
        <Image source={icon} className="size-6" />
      </View>
      <Text className={`text-base font-rubik-medium text-black-300 ${textStyle || ''}`}>
        {title}
      </Text>
    </View>

    {showArrow && (
      <View className="w-6 h-6 items-center justify-center">
        <Image source={icons.rightArrow} className="size-4" />
      </View>
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch, loading } = useGlobalContext();

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="h-full bg-white flex-1 justify-center items-center">
        <Text className="text-lg font-rubik-medium text-black-300">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="h-full bg-white flex-1 justify-center items-center">
        <Text className="text-lg font-rubik-medium text-black-300">No user data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-between mt-5">
        </View>

        {/* Profile Header */}
        <View className="flex items-center mt-8 bg-gradient-to-b from-primary-50 to-white rounded-2xl p-8 mx-2">
          <View className="relative">
            <View className="size-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 p-1 shadow-lg">
              <Image
                source={user?.avatar ? { uri: user.avatar } : images.avatar}
                className="size-full rounded-full"
              />
            </View>
            <TouchableOpacity 
              className="absolute -bottom-1 -right-1 bg-primary-300 rounded-full p-3 shadow-lg"
              onPress={() => router.push('/profilePages/edit-profile')}
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View className="items-center mt-6">
            <Text className="text-2xl font-rubik-bold text-black-300">{user?.userName || 'User'}</Text>
            <Text className="text-base font-rubik text-black-200 mt-1">{user?.email}</Text>
            
            {/* Profile Completion Badge */}
            <View className="flex flex-row items-center mt-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <View className={`w-2 h-2 rounded-full mr-2 ${user?.setupCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <Text className="text-sm font-rubik-medium text-black-300">
                {user?.setupCompleted ? 'Profile Complete' : 'Complete Your Profile'}
              </Text>
            </View>
          </View>
        </View>

        {/* User Information Section */}
        <View className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <View className="flex flex-row items-center justify-between mb-6">
            <Text className="text-xl font-rubik-bold text-black-300">Profile Information</Text>
            <TouchableOpacity 
              className="bg-primary-100 px-3 py-1 rounded-full"
              onPress={() => router.push('/profilePages/edit-profile')}
            >
              <Text className="text-sm font-rubik-medium text-primary-300">Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-3">
            {/* Phone Number */}
            <View className="flex flex-row items-center p-4 bg-accent-50 rounded-xl">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="call-outline" size={20} color="#0061FF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-rubik-medium text-black-200 mb-1">Phone Number</Text>
                <Text className="text-base font-rubik text-black-300">
                  {user?.phoneNumber || 'Not provided'}
                </Text>
              </View>
              {!user?.phoneNumber && (
                <TouchableOpacity 
                  className="bg-primary-300 px-3 py-1 rounded-full"
                  onPress={() => router.push('/profilePages/edit-profile')}
                >
                  <Text className="text-xs font-rubik-bold text-white">Add</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Location */}
            <View className="flex flex-row items-center p-4 bg-accent-50 rounded-xl">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="location-outline" size={20} color="#0061FF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-rubik-medium text-black-200 mb-1">Location</Text>
                <Text className="text-base font-rubik text-black-300">
                  {user?.location || 'Not provided'}
                </Text>
              </View>
              {!user?.location && (
                <TouchableOpacity 
                  className="bg-primary-300 px-3 py-1 rounded-full"
                  onPress={() => router.push('/profilePages/edit-profile')}
                >
                  <Text className="text-xs font-rubik-bold text-white">Add</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Bio */}
            {user?.bio && (
              <View className="flex flex-row items-start p-4 bg-accent-50 rounded-xl">
                <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4 mt-1">
                  <Ionicons name="person-outline" size={20} color="#0061FF" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-rubik-medium text-black-200 mb-1">About Me</Text>
                  <Text className="text-base font-rubik text-black-300 leading-5">
                    {user.bio}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Member Since & Status */}
            <View className="flex flex-row space-x-4">
              <View className="flex-1 p-4 bg-accent-50 rounded-xl">
                <View className="flex flex-row items-center mb-2">
                  <Ionicons name="calendar-outline" size={16} color="#666876" />
                  <Text className="text-sm font-rubik-medium text-black-200 ml-2">Member Since</Text>
                </View>
                <Text className="text-base font-rubik-bold text-black-300">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  }) : 'Unknown'}
                </Text>
              </View>
              
              <View className="flex-1 p-4 bg-accent-50 rounded-xl">
                <View className="flex flex-row items-center mb-2">
                  <View className={`w-2 h-2 rounded-full mr-2 ${user?.setupCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <Text className="text-sm font-rubik-medium text-black-200">Status</Text>
                </View>
                <Text className="text-base font-rubik-bold text-black-300">
                  {user?.setupCompleted ? 'Complete' : 'Incomplete'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-rubik-bold text-black-300 mb-4">Quick Actions</Text>
          <View className="space-y-3">
            <SettingsItem 
              icon={icons.calendar} 
              title="My Bookings" 
              onPress={() => router.push('/profilePages/my-bookings')}
            />
            <SettingsItem 
              icon={icons.wallet} 
              title="Payments" 
              onPress={() => router.push('/profilePages/payments')}
            />
          </View>
        </View>

        {/* Settings */}
        <View className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-rubik-bold text-black-300 mb-4">Settings</Text>
          <View className="space-y-3">
            <SettingsItem 
              icon={icons.person} 
              title="Edit Profile" 
              onPress={() => router.push('/profilePages/edit-profile')}
            />
            <SettingsItem 
              icon={icons.heart} 
              title="Favorites" 
              onPress={() => router.push('/profilePages/favorites')}
            />
            <SettingsItem 
              icon={icons.bell} 
              title="Notifications" 
              onPress={() => router.push('/profilePages/notifications-settings')}
            />
            <SettingsItem 
              icon={icons.shield} 
              title="Security" 
              onPress={() => router.push('/profilePages/security-settings')}
            />
            <SettingsItem 
              icon={icons.language} 
              title="Language" 
              onPress={() => Alert.alert('Language', 'Language settings will be implemented here.')}
            />
            <SettingsItem 
              icon={icons.info} 
              title="Help Center" 
              onPress={() => router.push('/profilePages/help-support')}
            />
            <SettingsItem 
              icon={icons.info} 
              title="About" 
              onPress={() => router.push('/profilePages/about')}
            />
            <SettingsItem 
              icon={icons.people} 
              title="Invite Friends" 
              onPress={() => Alert.alert('Invite Friends', 'Invite friends functionality will be implemented here.')}
            />
          </View>
        </View>

        {/* Logout */}
        <View className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="text-red-500"
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;