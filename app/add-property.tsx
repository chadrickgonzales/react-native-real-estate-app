import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGlobalContext } from "@/lib/global-provider";
import { createProperty } from "@/lib/appwrite";

const AddProperty = () => {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    price: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    features: '',
    contactEmail: '',
    contactPhone: '',
    images: [] as string[]
  });

  const propertyTypes = [
    'Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Studio', 'Loft', 'Penthouse'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to add a property');
      return;
    }

    // Basic validation
    if (!formData.name || !formData.description || !formData.address || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const propertyData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        price: parseInt(formData.price),
        propertyType: formData.propertyType || 'Apartment',
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseInt(formData.area) || 0,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        contactEmail: formData.contactEmail || user.email,
        contactPhone: formData.contactPhone,
        ownerId: user.$id,
        ownerName: user.name,
        images: formData.images,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const result = await createProperty(propertyData);
      
      if (result) {
        Alert.alert(
          'Success', 
          'Property added successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.push('/owner-dashboard')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating property:', error);
      Alert.alert('Error', 'Failed to add property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-rubik-bold text-gray-900">Add Property</Text>
        </View>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text className="text-white font-rubik-bold">Saving...</Text>
          ) : (
            <Text className="text-white font-rubik-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Basic Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Basic Information</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-rubik-medium mb-2">Property Name *</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="Enter property name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-rubik-medium mb-2">Description *</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="Describe your property"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-rubik-medium mb-2">Address *</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="Enter full address"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
            />
          </View>

          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 font-rubik-medium mb-2">Price *</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                placeholder="0"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 font-rubik-medium mb-2">Property Type</Text>
              <View className="bg-gray-100 rounded-lg px-3 py-3">
                <Text className="text-gray-900 font-rubik">
                  {formData.propertyType || 'Select type'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Property Details */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Property Details</Text>
          
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 font-rubik-medium mb-2">Bedrooms</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                placeholder="0"
                value={formData.bedrooms}
                onChangeText={(value) => handleInputChange('bedrooms', value)}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 font-rubik-medium mb-2">Bathrooms</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
                placeholder="0"
                value={formData.bathrooms}
                onChangeText={(value) => handleInputChange('bathrooms', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-rubik-medium mb-2">Area (sq ft)</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="0"
              value={formData.area}
              onChangeText={(value) => handleInputChange('area', value)}
              keyboardType="numeric"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-rubik-medium mb-2">Features</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="Pool, Garden, Garage (comma separated)"
              value={formData.features}
              onChangeText={(value) => handleInputChange('features', value)}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Contact Information</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-rubik-medium mb-2">Contact Email</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder={user?.email || "your@email.com"}
              value={formData.contactEmail}
              onChangeText={(value) => handleInputChange('contactEmail', value)}
              keyboardType="email-address"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-rubik-medium mb-2">Contact Phone</Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-3 text-gray-900 font-rubik"
              placeholder="+1 (555) 123-4567"
              value={formData.contactPhone}
              onChangeText={(value) => handleInputChange('contactPhone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Property Type Selection */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Property Type</Text>
          <View className="flex-row flex-wrap">
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                  formData.propertyType === type 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
                onPress={() => handleInputChange('propertyType', type)}
              >
                <Text className={`font-rubik-medium ${
                  formData.propertyType === type 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Images Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-rubik-bold text-gray-900 mb-4">Property Images</Text>
          <View className="bg-gray-100 rounded-lg p-8 items-center">
            <Ionicons name="camera" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 font-rubik mt-2">Add images (Coming soon)</Text>
            <Text className="text-gray-400 font-rubik text-sm">Image upload will be available in the next update</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProperty;
