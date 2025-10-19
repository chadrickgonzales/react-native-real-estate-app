import { categories } from "@/constants/data";
import images from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { createProperty } from "../lib/appwrite";
import { useGlobalContext } from "../lib/global-provider";

// Circular Checkbox Component
interface CircularCheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
  size?: number;
}

const CircularCheckbox = ({ checked, onPress, label, size = 24 }: CircularCheckboxProps) => (
  <TouchableOpacity 
    onPress={onPress} 
    className="flex-row items-center space-x-3"
    activeOpacity={1}
    style={{ opacity: 1 }}
  >
    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
      checked ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'
    }`} style={{ elevation: 0, shadowOpacity: 0 }}>
      {checked && (
        <View className="w-3 h-3 rounded-full bg-white" 
        
        />
      )}
    </View>
    {label && <Text className="text-base font-rubik text-black">{label}</Text>}
  </TouchableOpacity>
);

interface AddPropertyBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (property: PropertyData) => void;
}

interface PropertyData {
  propertyType: 'sell' | 'rent' | '';
  title: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  description: string;
  type: string;
  images: string[];
  
  // Location fields
  latitude?: number;
  longitude?: number;
  
  // Common fields for both selling and renting
  furnishedStatus?: boolean;
  availableDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  petFriendly?: boolean;
  amenities?: string;
  
  // Additional fields for selling
  propertyAge?: string;
  parkingSpaces?: string;
  yearBuilt?: string;
  lotSize?: string;
  propertyCondition?: string;
  hoaFees?: string;
  propertyTaxes?: string;
  hasHOA?: boolean;
  hasPool?: boolean;
  hasGarage?: boolean;
  
  // Additional fields for renting
  leaseDuration?: string;
  deposit?: string;
  utilities?: string;
  moveInRequirements?: string;
  petDeposit?: string;
  utilitiesResponsibility?: string;
  furnitureIncluded?: string;
  utilitiesIncluded?: boolean;
  smokingAllowed?: boolean;
  backgroundCheckRequired?: boolean;
  
  // Availability management fields
  // For sale properties (viewing availability)
  viewingStartDate?: string;
  viewingEndDate?: string;
  viewingTimeSlots?: string[]; // e.g., ["9:00 AM", "2:00 PM", "4:00 PM"]
  
  // For rental properties (booking availability)
  rentalStartDate?: string;
  rentalEndDate?: string;
  checkInTime?: string; // e.g., "3:00 PM"
  checkoutTime?: string; // e.g., "11:00 AM"
  rentalPeriod?: 'weekend' | 'multiple_days' | 'weeks' | 'months' | 'year';
  minimumStay?: number; // minimum nights/days
  maximumStay?: number; // maximum nights/days
}

const AddPropertyBottomSheet = ({
  visible,
  onClose,
  onSubmit,
}: AddPropertyBottomSheetProps) => {
  const { user } = useGlobalContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [propertyData, setPropertyData] = useState<PropertyData>({
    propertyType: '',
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    type: "",
    images: [],
    
    // Common fields for both selling and renting
    furnishedStatus: false,
    availableDate: "",
    contactPhone: "",
    contactEmail: "",
    petFriendly: false,
    amenities: "",
    
    // Additional fields for selling
    propertyAge: "",
    parkingSpaces: "",
    yearBuilt: "",
    lotSize: "",
    propertyCondition: "",
    hoaFees: "",
    propertyTaxes: "",
    hasHOA: false,
    hasPool: false,
    hasGarage: false,
    
    // Additional fields for renting
    leaseDuration: "",
    deposit: "",
    utilities: "",
    moveInRequirements: "",
    petDeposit: "",
    utilitiesResponsibility: "",
    furnitureIncluded: "",
    utilitiesIncluded: false,
    smokingAllowed: false,
    backgroundCheckRequired: false,
    
    // Availability management fields
    viewingStartDate: "",
    viewingEndDate: "",
    viewingTimeSlots: [],
    rentalStartDate: "",
    rentalEndDate: "",
    checkInTime: "3:00 PM",
    checkoutTime: "11:00 AM",
    rentalPeriod: 'multiple_days' as 'weekend' | 'multiple_days' | 'weeks' | 'months' | 'year',
    minimumStay: 1,
    maximumStay: 30,
  });

  const [errors, setErrors] = useState<Partial<PropertyData>>({});
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;
  const sheetWidth = windowWidth * 0.92;
  const sheetHorizontalMargin = (windowWidth - sheetWidth) / 2;

  // Animated height for smooth grow/shrink between steps
  const initialSheetHeight = windowHeight * 0.35;
  const animatedHeight = useRef(new Animated.Value(initialSheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = currentStep === 1 ? windowHeight * 0.35 : windowHeight * 0.9;
    Animated.timing(animatedHeight, {
      toValue: target,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [currentStep, windowHeight]);

  // Animate in on open: grow from bottom and fade in the backdrop
  useEffect(() => {
    if (visible) {
      const target = currentStep === 1 ? windowHeight * 0.35 : windowHeight * 0.9;
      animatedHeight.setValue(0);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: target,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Filter categories to get property types (excluding "Trending" and "All")
  const propertyTypes = categories.filter(cat => 
    !["Trending", "All"].includes(cat.category)
  );

  const PropertyTypeFilter = ({ selectedType, onTypeSelect }: { 
    selectedType: string; 
    onTypeSelect: (type: string) => void; 
  }) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName=""
      className="rounded-full"
    >
      {propertyTypes.map((item, index) => (
        <TouchableOpacity
          onPress={() => onTypeSelect(item.category)}
          key={index}
          className={`px-6 py-3 rounded-full mr-3 ${
            selectedType === item.category
              ? "bg-primary-300"
              : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-sm font-rubik-medium ${
              selectedType === item.category
                ? "text-white"
                : "text-black-300"
            }`}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const validateStep = (step: number) => {
    const newErrors: Partial<PropertyData> = {};

    if (step === 1) {
      if (!propertyData.propertyType) newErrors.propertyType = "Please select whether you want to sell or rent" as any;
    } else if (step === 2) {
      if (!propertyData.title.trim()) newErrors.title = "Title is required";
      if (!propertyData.address.trim()) newErrors.address = "Address is required";
      if (!propertyData.type.trim()) newErrors.type = "Property type is required";
      if (!propertyData.bedrooms.trim()) newErrors.bedrooms = "Bedrooms is required";
      if (!propertyData.bathrooms.trim()) newErrors.bathrooms = "Bathrooms is required";
      if (!propertyData.price.trim()) newErrors.price = "Price is required";
      if (!propertyData.area.trim()) newErrors.area = "Area is required";
      if (!propertyData.availableDate?.trim()) newErrors.availableDate = "Available date is required";
      if (!propertyData.contactPhone?.trim()) newErrors.contactPhone = "Contact phone is required";
      if (!propertyData.contactEmail?.trim()) newErrors.contactEmail = "Contact email is required";
    } else if (step === 5) {
      if (!propertyData.latitude || !propertyData.longitude) {
        newErrors.latitude = "Please pin your property location on the map" as any;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Auto-populate contact fields from user data
  useEffect(() => {
    if (user && visible) {
      setPropertyData(prev => ({
        ...prev,
        contactPhone: user.phoneNumber || "",
        contactEmail: user.email || "",
      }));
    }
  }, [user, visible]);

  // Get user location when step 5 is reached
  useEffect(() => {
    if (currentStep === 5 && !userLocation && !locationError) {
      getCurrentLocation();
    }
  }, [currentStep, userLocation, locationError]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation(location);
      
      // Set initial property location to user's location
      setPropertyData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get your location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      console.log("Submitting property data:", propertyData);
      console.log("Current user:", user);
      
      // Check if user is logged in
      if (!user) {
        Alert.alert(
          "Authentication Required",
          "Please log in to upload properties.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Save to database (this will also handle image uploads)
      // Owner information will be set automatically from the current user
      const result = await createProperty(propertyData);
      
      if (result) {
        // Success - show success message
        Alert.alert(
          "Success!",
          "Your property has been listed successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setPropertyData({
                  propertyType: '',
                  title: "",
                  address: "",
                  price: "",
                  bedrooms: "",
                  bathrooms: "",
                  area: "",
                  description: "",
                  type: "",
                  images: [],
                  
                  // Location fields
                  latitude: undefined,
                  longitude: undefined,
                  
                  // Common fields for both selling and renting
                  furnishedStatus: false,
                  availableDate: "",
                  contactPhone: "",
                  contactEmail: "",
                  petFriendly: false,
                  amenities: "",
                  
                  // Additional fields for selling
                  propertyAge: "",
                  parkingSpaces: "",
                  yearBuilt: "",
                  lotSize: "",
                  propertyCondition: "",
                  hoaFees: "",
                  propertyTaxes: "",
                  hasHOA: false,
                  hasPool: false,
                  hasGarage: false,
                  
                  // Additional fields for renting
                  leaseDuration: "",
                  deposit: "",
                  utilities: "",
                  moveInRequirements: "",
                  petDeposit: "",
                  utilitiesResponsibility: "",
                  furnitureIncluded: "",
                  utilitiesIncluded: false,
                  smokingAllowed: false,
                  backgroundCheckRequired: false,
                });
                setErrors({});
                setCurrentStep(1);
                onClose();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error("Error submitting property:", error);
      
      // Show error message
      Alert.alert(
        "Error",
        "Failed to list your property. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Smoothly animate closing before dismissing
  const handleCloseWithAnimation = () => {
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  };

  const formatPrice = (price: string) => {
    if (!price || isNaN(Number(price))) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to add images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Property Image',
      'Choose how you want to add an image to your property listing',
      [
        { text: '📷 Take Photo', onPress: () => pickImage('camera') },
        { text: '🖼️ Choose from Gallery', onPress: () => pickImage('library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'library') => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    setIsPickingImage(true);
    try {
      let result;
      
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setPropertyData({
          ...propertyData,
          images: [...propertyData.images, imageUri]
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const addImage = () => {
    if (propertyData.images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images.');
      return;
    }
    showImagePickerOptions();
  };

  const removeImage = (index: number) => {
    setPropertyData({
      ...propertyData,
      images: propertyData.images.filter((_, i) => i !== index)
    });
  };

  const renderStep1 = () => (
    <View className="p-6 space-y-6">
      <View className="items-center mb-8">
        <Text className="text-2xl font-rubik-bold text-black mb-2">
          List Your Property
        </Text>
        <Text className="text-base font-rubik text-gray-600 text-center">
          Are you looking to sell or rent your property?
        </Text>
      </View>

      <View className="flex-row space-x-3 gap-2">
        {/* Selling Option */}
        <TouchableOpacity
          onPress={() => {
            setPropertyData({ ...propertyData, propertyType: 'sell' });
            setCurrentStep(2);
          }}
          className="flex-1 h-16 rounded-full border bg-white border-gray-200 items-center justify-center"
          activeOpacity={1}
          style={{ backgroundColor: 'white' }}
        >
          <View className="w-full items-center justify-center">
            <Text className="text-base font-rubik-bold text-black">Sell</Text>
          </View>
          <View className="absolute left-8 w-8 h-8 rounded-full items-center justify-center bg-gray-100">
              <Ionicons 
                name="home" 
                size={24} 
                color="#666"
              />
            </View>
          
        </TouchableOpacity>

        {/* Renting Option */}
        <TouchableOpacity
          onPress={() => {
            setPropertyData({ ...propertyData, propertyType: 'rent' });
            setCurrentStep(2);
          }}
          className="flex-1 h-16 rounded-full border bg-white border-gray-200 items-center justify-center"
          activeOpacity={1}
          style={{ backgroundColor: 'white' }}
        >
          <View className="w-full items-center justify-center">
            <Text className="text-base font-rubik-bold text-black">Rent</Text>
          </View>
          <View className="absolute left-8 w-8 h-8 rounded-full items-center justify-center bg-gray-100">
              <Ionicons 
                name="key" 
                size={24} 
                color="#666"
              />
            </View>
          
        </TouchableOpacity>
      </View>

      {errors.propertyType && (
        <Text className="text-red-500 text-sm text-center mt-2">
          {errors.propertyType}
        </Text>
      )}
    </View>
  );

   const renderStep2 = () => {
     const isSelling = propertyData.propertyType === 'sell';
     const isRenting = propertyData.propertyType === 'rent';

     return (
       <View className="p-6 space-y-4">
         {/* Header */}
         <View className="mb-4">
           <Text className="text-xl font-rubik-bold text-black mb-1">
             {isSelling ? 'Selling Property Details' : 'Rental Property Details'}
           </Text>
           <Text className="text-sm font-rubik text-gray-600">
             {isSelling ? 'Provide details about your property for sale' : 'Provide details about your rental property'}
           </Text>
         </View>

         {/* Property Title */}
         <View>
           <Text className="text-base font-rubik-medium text-black mb-2">
             Property Title
           </Text>
           <TextInput
             className={`bg-white shadow-md rounded-full px-4 py-4 border ${
               errors.title ? "border-red-500" : "border-gray-200"
             }`}
             placeholder="Enter property title"
             placeholderTextColor="#8c8e98"
             value={propertyData.title}
             onChangeText={(text) =>
               setPropertyData({ ...propertyData, title: text })
             }
           />
           {errors.title && (
             <Text className="text-red-500 text-sm mt-1">{errors.title}</Text>
           )}
         </View>

         {/* Address */}
         <View>
           <Text className="text-base font-rubik-medium text-black mb-2">
             Address
           </Text>
           <TextInput
             className={`bg-white shadow-md rounded-full px-4 py-4 border ${
               errors.address ? "border-red-500" : "border-gray-200"
             }`}
             placeholder="Enter full address"
             placeholderTextColor="#8c8e98"
             value={propertyData.address}
             onChangeText={(text) =>
               setPropertyData({ ...propertyData, address: text })
             }
           />
           {errors.address && (
             <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>
           )}
         </View>

         {/* Property Type */}
         <View>
           <Text className="text-base font-rubik-medium text-black mb-2">
             Property Type
           </Text>
           <View className="bg-white px-2 py-2 rounded-full shadow-md mb-5">
             <PropertyTypeFilter
             selectedType={propertyData.type}
             onTypeSelect={(type) => setPropertyData({ ...propertyData, type })}
             />
           </View>
           {errors.type && (
             <Text className="text-red-500 text-sm mt-1">{errors.type}</Text>
           )}
         </View>

         {/* Bedrooms and Bathrooms Row */}
         <View className="flex-row space-x-4 gap-2">
           <View className="flex-1">
             <Text className="text-base font-rubik-medium text-black mb-2">
               Bedrooms
             </Text>
             <TextInput
               className={`bg-white shadow-md rounded-full px-4 py-4 border ${
                 errors.bedrooms ? "border-red-500" : "border-gray-200"
               }`}
               placeholder="0"
               placeholderTextColor="#8c8e98"
               value={propertyData.bedrooms}
               onChangeText={(text) =>
                 setPropertyData({ ...propertyData, bedrooms: text })
               }
               keyboardType="numeric"
             />
             {errors.bedrooms && (
               <Text className="text-red-500 text-sm mt-1">{errors.bedrooms}</Text>
             )}
           </View>

           <View className="flex-1">
             <Text className="text-base font-rubik-medium text-black mb-2">
               Bathrooms
             </Text>
             <TextInput
               className={`bg-white shadow-md rounded-full px-4 py-4 border ${
                 errors.bathrooms ? "border-red-500" : "border-gray-200"
               }`}
               placeholder="0"
               placeholderTextColor="#8c8e98"
               value={propertyData.bathrooms}
               onChangeText={(text) =>
                 setPropertyData({ ...propertyData, bathrooms: text })
               }
               keyboardType="numeric"
             />
             {errors.bathrooms && (
               <Text className="text-red-500 text-sm mt-1">{errors.bathrooms}</Text>
             )}
           </View>
         </View>

         {/* Price and Area Row */}
         <View className="flex-row space-x-4 gap-2">
           <View className="flex-1">
             <Text className="text-base font-rubik-medium text-black mb-2">
               {isSelling ? 'Sale Price' : 'Monthly Rent'}
             </Text>
             <TextInput
               className={`bg-white shadow-md rounded-full px-4 py-4 border ${
                 errors.price ? "border-red-500" : "border-gray-200"
               }`}
               placeholder={isSelling ? "$0" : "$0/month"}
               placeholderTextColor="#8c8e98"
               value={propertyData.price}
               onChangeText={(text) =>
                 setPropertyData({ ...propertyData, price: text })
               }
               keyboardType="numeric"
             />
             {errors.price && (
               <Text className="text-red-500 text-sm mt-1">{errors.price}</Text>
             )}
           </View>

           <View className="flex-1">
             <Text className="text-base font-rubik-medium text-black mb-2">
               Area (sq ft)
             </Text>
             <TextInput
               className={`bg-white shadow-md rounded-full px-4 py-4 border ${
                 errors.area ? "border-red-500" : "border-gray-200"
               }`}
               placeholder="0"
               placeholderTextColor="#8c8e98"
               value={propertyData.area}
               onChangeText={(text) =>
                 setPropertyData({ ...propertyData, area: text })
               }
               keyboardType="numeric"
             />
             {errors.area && (
               <Text className="text-red-500 text-sm mt-1">{errors.area}</Text>
             )}
           </View>
         </View>

         {/* Available Date */}
         <View>
           <Text className="text-base font-rubik-medium text-black mb-2">
             Available Date
           </Text>
           <TextInput
             className={`bg-white shadow-md rounded-full px-4 py-4 border ${
               errors.availableDate ? "border-red-500" : "border-gray-200"
             }`}
             placeholder="MM/DD/YYYY"
             placeholderTextColor="#8c8e98"
             value={propertyData.availableDate || ""}
             onChangeText={(text) =>
               setPropertyData({ ...propertyData, availableDate: text })
             }
           />
           {errors.availableDate && (
             <Text className="text-red-500 text-sm mt-1">{errors.availableDate}</Text>
           )}
         </View>


         {/* Contact Information */}
         <View className="flex-row space-x-4 gap-2">
           <View className="flex-1">
             <Text className="text-base font-rubik-medium text-black mb-2">
               Contact Phone
             </Text>
             <TextInput
               className={`bg-white shadow-md rounded-full px-4 py-4 border ${
                 errors.contactPhone ? "border-red-500" : "border-gray-200"
               }`}
               placeholder="(555) 123-4567"
               placeholderTextColor="#8c8e98"
               value={propertyData.contactPhone || ""}
               onChangeText={(text) =>
                 setPropertyData({ ...propertyData, contactPhone: text })
               }
               keyboardType="phone-pad"
             />
             {errors.contactPhone && (
               <Text className="text-red-500 text-sm mt-1">{errors.contactPhone}</Text>
             )}
           </View>

           <View className="flex-1">
             <Text className="text-base font-rubik-medium text-black mb-2">
               Contact Email
             </Text>
             <TextInput
               className={`bg-white shadow-md rounded-full px-4 py-4 border ${
                 errors.contactEmail ? "border-red-500" : "border-gray-200"
               }`}
               placeholder="your@email.com"
               placeholderTextColor="#8c8e98"
               value={propertyData.contactEmail || ""}
               onChangeText={(text) =>
                 setPropertyData({ ...propertyData, contactEmail: text })
               }
               keyboardType="email-address"
             />
             {errors.contactEmail && (
               <Text className="text-red-500 text-sm mt-1">{errors.contactEmail}</Text>
             )}
           </View>
         </View>

         {/* Amenities */}
         <View>
           <Text className="text-base font-rubik-medium text-black mb-2">
             Amenities & Features
           </Text>
           <TextInput
             className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
             placeholder="Pool, gym, balcony, parking, etc."
             placeholderTextColor="#8c8e98"
             value={propertyData.amenities || ""}
             onChangeText={(text) =>
               setPropertyData({ ...propertyData, amenities: text })
             }
           />
         </View>

         {/* Selling-specific fields */}
         {isSelling && (
           <View className="space-y-4">
             <View className="flex-row space-x-4 gap-2">
               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Year Built
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="2020"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.yearBuilt || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, yearBuilt: text })
                   }
                   keyboardType="numeric"
                 />
               </View>

               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Property Condition
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="New, Excellent, Good"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.propertyCondition || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, propertyCondition: text })
                   }
                 />
               </View>
             </View>

             <View className="flex-row space-x-4 gap-2">
               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Lot Size (sq ft)
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="5000"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.lotSize || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, lotSize: text })
                   }
                   keyboardType="numeric"
                 />
               </View>

               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Parking Spaces
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="2"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.parkingSpaces || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, parkingSpaces: text })
                   }
                   keyboardType="numeric"
                 />
               </View>
             </View>

             <View className="flex-row space-x-4 gap-2">
               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   HOA Fees (monthly)
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="$200"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.hoaFees || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, hoaFees: text })
                   }
                   keyboardType="numeric"
                 />
               </View>

               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Property Taxes (annual)
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="$5000"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.propertyTaxes || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, propertyTaxes: text })
                   }
                   keyboardType="numeric"
                 />
               </View>
             </View>

           </View>
         )}

         {/* Renting-specific fields */}
         {isRenting && (
           <View className="space-y-4">
             <View className="flex-row space-x-4 gap-2">
               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Lease Duration
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="12 months"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.leaseDuration || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, leaseDuration: text })
                   }
                 />
               </View>

               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Security Deposit
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="$1500"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.deposit || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, deposit: text })
                   }
                   keyboardType="numeric"
                 />
               </View>
             </View>

             <View className="flex-row space-x-4 gap-2">
               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Pet Deposit
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="$300"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.petDeposit || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, petDeposit: text })
                   }
                   keyboardType="numeric"
                 />
               </View>

               <View className="flex-1">
                 <Text className="text-base font-rubik-medium text-black mb-2">
                   Move-in Requirements
                 </Text>
                 <TextInput
                   className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                   placeholder="Credit check, references"
                   placeholderTextColor="#8c8e98"
                   value={propertyData.moveInRequirements || ""}
                   onChangeText={(text) =>
                     setPropertyData({ ...propertyData, moveInRequirements: text })
                   }
                 />
               </View>
             </View>

             <View>
               <Text className="text-base font-rubik-medium text-black mb-2">
                 Utilities Responsibility
               </Text>
               <TextInput
                 className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                 placeholder="Tenant pays: Electricity, Gas. Landlord pays: Water, Trash"
                 placeholderTextColor="#8c8e98"
                 value={propertyData.utilitiesResponsibility || ""}
                 onChangeText={(text) =>
                   setPropertyData({ ...propertyData, utilitiesResponsibility: text })
                 }
               />
             </View>

             <View>
               <Text className="text-base font-rubik-medium text-black mb-2">
                 Furniture Included
               </Text>
               <TextInput
                 className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                 placeholder="Bed, dresser, dining table, sofa, etc."
                 placeholderTextColor="#8c8e98"
                 value={propertyData.furnitureIncluded || ""}
                 onChangeText={(text) =>
                   setPropertyData({ ...propertyData, furnitureIncluded: text })
                 }
               />
             </View>

             <View>
               <Text className="text-base font-rubik-medium text-black mb-2">
                 Utilities Included
               </Text>
               <TextInput
                 className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
                 placeholder="e.g., Water, Electricity, Internet"
                 placeholderTextColor="#8c8e98"
                 value={propertyData.utilities || ""}
                 onChangeText={(text) =>
                   setPropertyData({ ...propertyData, utilities: text })
                 }
               />
             </View>

           </View>
         )}

         {/* Description */}
         <View>
           <Text className="text-base font-rubik-medium text-black mb-2">
             Description
           </Text>
           <TextInput
             className="bg-white shadow-md rounded-full px-4 py-4 border border-gray-200"
             placeholder="Describe your property..."
             placeholderTextColor="#8c8e98"
             value={propertyData.description}
             onChangeText={(text) =>
               setPropertyData({ ...propertyData, description: text })
             }
             multiline
             numberOfLines={4}
             textAlignVertical="top"
           />
         </View>

        {/* Images */}
        <View>
          <Text className="text-base font-rubik-medium text-black mb-2">
            Property Images
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {propertyData.images.map((imageUri, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: imageUri }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {propertyData.images.length < 5 && (
              <TouchableOpacity
                onPress={addImage}
                disabled={isPickingImage}
                className={`w-20 h-20 rounded-lg items-center justify-center border-2 border-dashed ${
                  isPickingImage 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-gray-200 border-gray-400'
                }`}
              >
                {isPickingImage ? (
                  <Ionicons name="hourglass" size={24} color="#3B82F6" />
                ) : (
                  <Ionicons name="camera" size={24} color="#666" />
                )}
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-sm text-gray-500 mt-2">
            Add up to 5 images of your property
          </Text>
        </View>
      </View>
    );
  };

  const renderStep3 = () => {
    const isSelling = propertyData.propertyType === 'sell';
    const isRenting = propertyData.propertyType === 'rent';

    return (
      <View className="p-6 space-y-6">
        {/* Header with Icon */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="information-circle" size={32} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-rubik-bold text-black mb-2">
            Additional Information
          </Text>
          <Text className="text-base font-rubik text-gray-600 text-center">
            Help potential {isSelling ? 'buyers' : 'tenants'} learn more about your property
          </Text>
        </View>

        {/* Common Features Section */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="home" size={20} color="#3B82F6" />
            <Text className="text-lg font-rubik-bold text-black ml-3">
              Property Features
            </Text>
          </View>
          <View className="space-y-4">
            <View className="flex-row items-center justify-between p-4 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="bed" size={20} color="#6B7280" />
                <Text className="text-base font-rubik text-gray-700 ml-3">Furnished</Text>
              </View>
              <CircularCheckbox
                checked={propertyData.furnishedStatus || false}
                onPress={() => setPropertyData({ 
                  ...propertyData, 
                  furnishedStatus: !propertyData.furnishedStatus 
                })}
                label=""
                size={20}
              />
            </View>
            
            <View className="flex-row items-center justify-between p-4 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="paw" size={20} color="#6B7280" />
                <Text className="text-base font-rubik text-gray-700 ml-3">Pet Friendly</Text>
              </View>
              <CircularCheckbox
                checked={propertyData.petFriendly || false}
                onPress={() => setPropertyData({ 
                  ...propertyData, 
                  petFriendly: !propertyData.petFriendly 
                })}
                label=""
                size={20}
              />
            </View>
          </View>
        </View>

        {/* Selling-specific features */}
        {isSelling && (
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text className="text-lg font-rubik-bold text-black ml-3">
                Premium Features
              </Text>
            </View>
            <View className="space-y-4">
              <View className="flex-row items-center justify-between p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="business" size={20} color="#6B7280" />
                  <Text className="text-base font-rubik text-gray-700 ml-3">HOA Community</Text>
                </View>
                <CircularCheckbox
                  checked={propertyData.hasHOA || false}
                  onPress={() => setPropertyData({ 
                    ...propertyData, 
                    hasHOA: !propertyData.hasHOA 
                  })}
                  label=""
                  size={20}
                />
              </View>
              
              <View className="flex-row items-center justify-between p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="water" size={20} color="#6B7280" />
                  <Text className="text-base font-rubik text-gray-700 ml-3">Swimming Pool</Text>
                </View>
                <CircularCheckbox
                  checked={propertyData.hasPool || false}
                  onPress={() => setPropertyData({ 
                    ...propertyData, 
                    hasPool: !propertyData.hasPool 
                  })}
                  label=""
                  size={20}
                />
              </View>
              
              <View className="flex-row items-center justify-between p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="car" size={20} color="#6B7280" />
                  <Text className="text-base font-rubik text-gray-700 ml-3">Garage</Text>
                </View>
                <CircularCheckbox
                  checked={propertyData.hasGarage || false}
                  onPress={() => setPropertyData({ 
                    ...propertyData, 
                    hasGarage: !propertyData.hasGarage 
                  })}
                  label=""
                  size={20}
                />
              </View>
            </View>
          </View>
        )}

        {/* Renting-specific policies */}
        {isRenting && (
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="document-text" size={20} color="#F59E0B" />
              <Text className="text-lg font-rubik-bold text-black ml-3">
                Rental Policies
              </Text>
            </View>
            <View className="space-y-4">
              <View className="flex-row items-center justify-between p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="flash" size={20} color="#6B7280" />
                  <Text className="text-base font-rubik text-gray-700 ml-3">Utilities Included</Text>
                </View>
                <CircularCheckbox
                  checked={propertyData.utilitiesIncluded || false}
                  onPress={() => setPropertyData({ 
                    ...propertyData, 
                    utilitiesIncluded: !propertyData.utilitiesIncluded 
                  })}
                  label=""
                  size={20}
                />
              </View>
              
              <View className="flex-row items-center justify-between p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="flame" size={20} color="#6B7280" />
                  <Text className="text-base font-rubik text-gray-700 ml-3">Smoking Allowed</Text>
                </View>
                <CircularCheckbox
                  checked={propertyData.smokingAllowed || false}
                  onPress={() => setPropertyData({ 
                    ...propertyData, 
                    smokingAllowed: !propertyData.smokingAllowed 
                  })}
                  label=""
                  size={20}
                />
              </View>
              
              <View className="flex-row items-center justify-between p-4 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="shield-checkmark" size={20} color="#6B7280" />
                  <Text className="text-base font-rubik text-gray-700 ml-3">Background Check Required</Text>
                </View>
                <CircularCheckbox
                  checked={propertyData.backgroundCheckRequired || false}
                  onPress={() => setPropertyData({ 
                    ...propertyData, 
                    backgroundCheckRequired: !propertyData.backgroundCheckRequired 
                  })}
                  label=""
                  size={20}
                />
              </View>
            </View>
          </View>
        )}

        {/* Optional Note */}
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-sm font-rubik text-blue-800 ml-3 flex-1">
              These details help {isSelling ? 'buyers' : 'tenants'} make informed decisions. You can always update this information later.
            </Text>
          </View>
        </View>
      </View>
    );
  };


  const renderStep4 = () => (
    <View className="flex-1 bg-black">
      {/* Hero Image Section */}
      <View className="relative" style={{ height: windowHeight * 0.4 }}>
        <Image
          source={propertyData.images.length > 0 ? { uri: propertyData.images[0] } : images.newYork}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Navigation Overlay */}
        <View className="absolute top-10 left-0 right-0 z-10 px-5" style={{ paddingTop: 50 }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handlePrevious}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center">
              <Ionicons name="heart-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Counter */}
        <View className="absolute bottom-10 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <Text className="text-white text-sm font-rubik-medium">
            {propertyData.images.length > 0 ? `1/${propertyData.images.length}` : "1/1"}
          </Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View className="bg-background-100 rounded-t-3xl" style={{ height: windowHeight * 0.6, marginTop: -24 }}>
        <View className="flex-1">
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-6 mt-5"
            className="flex-1"
          >
            <View className="px-6 pt-1">
              {/* Property Address */}
              <Text className="text-2xl font-rubik-bold text-black mb-2">
                {propertyData.address || "Enter property address"}
              </Text>
              
              <Text className="text-black font-rubik mb-1">
                {propertyData.type ? `${propertyData.type} in ` : ""}{propertyData.address?.split(',')[1]?.trim() || "location"}
              </Text>
              
              {/* Property Details */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="bed" size={20} color="#666" />
                  <Text className="text-gray-600 font-rubik ml-2">{propertyData.bedrooms || "0"} beds</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="water" size={20} color="#666" />
                  <Text className="text-gray-600 font-rubik ml-2">{propertyData.bathrooms || "0"} baths</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="resize" size={20} color="#666" />
                  <Text className="text-gray-600 font-rubik ml-2">{propertyData.area || "0"} sq ft</Text>
                </View>
              </View>

              {/* Price */}
              <View className="mb-6">
                <Text className="text-3xl font-rubik-bold text-black">
                  {formatPrice(propertyData.price)}
                </Text>
                <Text className="text-gray-600 font-rubik">
                  {propertyData.propertyType === 'rent' ? 'per month' : 'total price'}
                </Text>
              </View>

              {/* Description */}
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-black mb-3">Description</Text>
                <Text className="text-gray-700 font-rubik leading-6">
                  {propertyData.description || "No description provided."}
                </Text>
              </View>

              {/* Amenities */}
              <View className="mb-6">
                <Text className="text-lg font-rubik-bold text-black mb-3">Amenities</Text>
                <View className="flex-row flex-wrap">
                  {propertyData.amenities ? propertyData.amenities.split(',').map((amenity, index) => (
                    <View key={index} className="bg-gray-100 px-3 py-2 rounded-full mr-2 mb-2">
                      <Text className="text-gray-700 font-rubik text-sm">{amenity.trim()}</Text>
                    </View>
                  )) : (
                    <Text className="text-gray-500 font-rubik">No amenities listed</Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Previous Button for Step 4 */}
          <View className="p-6 bg-background-100 border-t border-gray-200">
            <TouchableOpacity
              className="bg-gray-200 py-4 rounded-xl"
              onPress={handlePrevious}
            >
              <Text className="text-center text-gray-700 font-rubik-bold">
                Previous
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View className="flex-1">
      {/* Header */}
      <View className="p-6 bg-white border-b border-gray-200">
        <View className="items-center mb-4">
          <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="location" size={32} color="#10B981" />
          </View>
          <Text className="text-2xl font-rubik-bold text-black mb-2">
            Pin Your Property Location
          </Text>
          <Text className="text-base font-rubik text-gray-600 text-center">
            Tap on the map to set the exact location of your property
          </Text>
        </View>
      </View>

      {/* Map Container */}
      <View className="flex-1 relative">
        {isLoadingLocation ? (
          <View className="flex-1 items-center justify-center bg-gray-100">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-gray-600 font-rubik mt-4">Getting your location...</Text>
          </View>
        ) : locationError ? (
          <View className="flex-1 items-center justify-center bg-gray-100 p-6">
            <Ionicons name="location-outline" size={64} color="#EF4444" />
            <Text className="text-lg font-rubik-bold text-gray-800 mt-4 mb-2">Location Error</Text>
            <Text className="text-gray-600 font-rubik text-center mb-6">{locationError}</Text>
            <TouchableOpacity
              onPress={getCurrentLocation}
              className="bg-green-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-rubik-bold">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : userLocation ? (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={(event) => {
              const { latitude, longitude } = event.nativeEvent.coordinate;
              setPropertyData(prev => ({
                ...prev,
                latitude,
                longitude,
              }));
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* User's current location marker */}
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Your Location"
              description="Your current location"
              pinColor="blue"
            />
            
            {/* Property location marker */}
            {propertyData.latitude && propertyData.longitude && (
              <Marker
                coordinate={{
                  latitude: propertyData.latitude,
                  longitude: propertyData.longitude,
                }}
                title="Property Location"
                description="Tap to move this marker"
                pinColor="red"
                draggable
                onDragEnd={(event) => {
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setPropertyData(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                  }));
                }}
              />
            )}
          </MapView>
        ) : null}

        {/* Map Instructions Overlay */}
        <View className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#10B981" />
            <Text className="text-sm font-rubik text-gray-700 ml-2 flex-1">
              {propertyData.latitude && propertyData.longitude 
                ? "Location pinned! You can drag the red marker to adjust."
                : "Tap anywhere on the map to pin your property location"
              }
            </Text>
          </View>
        </View>

        {/* Location Details */}
        {propertyData.latitude && propertyData.longitude && (
          <View className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
            <Text className="text-sm font-rubik-bold text-gray-800 mb-2">Property Coordinates</Text>
            <Text className="text-xs font-rubik text-gray-600">
              Latitude: {propertyData.latitude.toFixed(6)}
            </Text>
            <Text className="text-xs font-rubik text-gray-600">
              Longitude: {propertyData.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Error Message */}
        {errors.latitude && (
          <View className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={20} color="#EF4444" />
              <Text className="text-red-600 font-rubik ml-2 flex-1">{errors.latitude}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep6 = () => {
    const isSelling = propertyData.propertyType === 'sell';
    const isRenting = propertyData.propertyType === 'rent';

    // Calendar helper functions
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      return { daysInMonth, startingDayOfWeek };
    };

    const generateCalendarDays = (date: Date) => {
      const { daysInMonth, startingDayOfWeek } = getDaysInMonth(date);
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      return days;
    };

    const isDateSelected = (day: number, month: Date, type: 'start' | 'end') => {
      if (!day) return false;
      
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      
      if (type === 'start') {
        return isSelling 
          ? propertyData.viewingStartDate === dateString
          : propertyData.rentalStartDate === dateString;
      } else {
        return isSelling 
          ? propertyData.viewingEndDate === dateString
          : propertyData.rentalEndDate === dateString;
      }
    };

    const isDateInRange = (day: number, month: Date) => {
      if (!day) return false;
      
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      
      const startDate = isSelling ? propertyData.viewingStartDate : propertyData.rentalStartDate;
      const endDate = isSelling ? propertyData.viewingEndDate : propertyData.rentalEndDate;
      
      if (!startDate || !endDate) return false;
      
      return dateString > startDate && dateString < endDate;
    };

    const handleDateClick = (day: number, month: Date) => {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      
      if (isSelling) {
        if (!propertyData.viewingStartDate || (propertyData.viewingStartDate && propertyData.viewingEndDate)) {
          // Set start date
          setPropertyData(prev => ({ 
            ...prev, 
            viewingStartDate: dateString,
            viewingEndDate: ""
          }));
        } else if (propertyData.viewingStartDate && !propertyData.viewingEndDate) {
          // Set end date
          if (dateString > propertyData.viewingStartDate) {
            setPropertyData(prev => ({ ...prev, viewingEndDate: dateString }));
          } else {
            // If selected date is before start date, make it the new start date
            setPropertyData(prev => ({ 
              ...prev, 
              viewingStartDate: dateString,
              viewingEndDate: ""
            }));
          }
        }
      } else {
        if (!propertyData.rentalStartDate || (propertyData.rentalStartDate && propertyData.rentalEndDate)) {
          // Set start date
          setPropertyData(prev => ({ 
            ...prev, 
            rentalStartDate: dateString,
            rentalEndDate: ""
          }));
        } else if (propertyData.rentalStartDate && !propertyData.rentalEndDate) {
          // Set end date
          if (dateString > propertyData.rentalStartDate) {
            setPropertyData(prev => ({ ...prev, rentalEndDate: dateString }));
          } else {
            // If selected date is before start date, make it the new start date
            setPropertyData(prev => ({ 
              ...prev, 
              rentalStartDate: dateString,
              rentalEndDate: ""
            }));
          }
        }
      }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
      const newMonth = new Date(currentMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      setCurrentMonth(newMonth);
    };

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        className="flex-1"
      >
        <View className="p-6 space-y-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="calendar" size={32} color="#8B5CF6" />
            </View>
            <Text className="text-2xl font-rubik-bold text-black mb-2">
              Set Availability
            </Text>
            <Text className="text-base font-rubik text-gray-600 text-center">
              {isSelling 
                ? "Select dates when your property is available for viewing"
                : "Select your rental availability period"
              }
            </Text>
          </View>

          {/* Calendar for Date Selection */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-lg font-rubik-bold text-black mb-4">
              {isSelling ? "Viewing Availability Period" : "Rental Availability Period"}
            </Text>
            
            {/* Calendar Header */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity 
                onPress={() => navigateMonth('prev')}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="chevron-back" size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <Text className="text-gray-900 font-rubik-bold text-lg">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity 
                onPress={() => navigateMonth('next')}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View className="bg-gray-50 rounded-lg p-3">
              {/* Day Headers */}
              <View className="flex-row mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <View key={day} className="flex-1 items-center py-2">
                    <Text className="text-gray-500 font-rubik-medium text-xs">{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar Days */}
              <View className="flex-row flex-wrap">
                {generateCalendarDays(currentMonth).map((day, index) => {
                  const isStart = day ? isDateSelected(day, currentMonth, 'start') : false;
                  const isEnd = day ? isDateSelected(day, currentMonth, 'end') : false;
                  const isInRange = day ? isDateInRange(day, currentMonth) : false;
                  const isPast = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date() : false;
                  
                  return (
                    <View key={index} className="w-[14.28%] aspect-square items-center justify-center">
                      {day ? (
                        <TouchableOpacity 
                          onPress={() => !isPast && handleDateClick(day, currentMonth)}
                          className={`w-8 h-8 rounded-full items-center justify-center ${
                            isPast 
                              ? 'bg-gray-200' 
                              : isStart || isEnd
                              ? 'bg-blue-500'
                              : isInRange
                              ? 'bg-blue-200'
                              : 'bg-white border border-gray-300'
                          }`}
                          disabled={isPast}
                        >
                          <Text className={`font-rubik text-sm ${
                            isPast 
                              ? 'text-gray-400' 
                              : isStart || isEnd
                              ? 'text-white'
                              : isInRange
                              ? 'text-blue-800'
                              : 'text-gray-700'
                          }`}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View className="w-8 h-8" />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-center mt-4 space-x-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                <Text className="text-gray-600 font-rubik text-xs">Selected</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-blue-200 rounded-full mr-2" />
                <Text className="text-gray-600 font-rubik text-xs">Range</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-gray-200 rounded-full mr-2" />
                <Text className="text-gray-600 font-rubik text-xs">Past</Text>
              </View>
            </View>

            {/* Selected Dates Display */}
            {(isSelling ? propertyData.viewingStartDate : propertyData.rentalStartDate) && (
              <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text className="text-blue-800 font-rubik-bold text-sm mb-1">Selected Period</Text>
                <Text className="text-blue-700 font-rubik text-sm">
                  From: {isSelling ? propertyData.viewingStartDate : propertyData.rentalStartDate}
                </Text>
                {(isSelling ? propertyData.viewingEndDate : propertyData.rentalEndDate) && (
                  <Text className="text-blue-700 font-rubik text-sm">
                    To: {isSelling ? propertyData.viewingEndDate : propertyData.rentalEndDate}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* For Sale Properties - Viewing Time Slots */}
          {isSelling && (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-lg font-rubik-bold text-black mb-3">Available Viewing Times</Text>
              <Text className="text-sm font-rubik text-gray-600 mb-4">
                Select the time slots when you're available for property viewings
              </Text>
              
              <View className="space-y-3">
                {[
                  { time: "9:00 AM", label: "Morning" },
                  { time: "12:00 PM", label: "Lunch" },
                  { time: "2:00 PM", label: "Afternoon" },
                  { time: "4:00 PM", label: "Evening" },
                  { time: "6:00 PM", label: "Late Evening" }
                ].map((slot) => (
                  <TouchableOpacity
                    key={slot.time}
                    onPress={() => {
                      const currentSlots = propertyData.viewingTimeSlots || [];
                      const isSelected = currentSlots.includes(slot.time);
                      const newSlots = isSelected 
                        ? currentSlots.filter(t => t !== slot.time)
                        : [...currentSlots, slot.time];
                      setPropertyData(prev => ({ ...prev, viewingTimeSlots: newSlots }));
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-xl border ${
                      propertyData.viewingTimeSlots?.includes(slot.time)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                        propertyData.viewingTimeSlots?.includes(slot.time)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {propertyData.viewingTimeSlots?.includes(slot.time) && (
                          <View className="w-2 h-2 rounded-full bg-white m-0.5" />
                        )}
                      </View>
                      <View>
                        <Text className="text-base font-rubik-bold text-gray-900">{slot.time}</Text>
                        <Text className="text-sm font-rubik text-gray-600">{slot.label}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* For Rental Properties - Additional Settings */}
          {isRenting && (
            <View className="space-y-6">

              {/* Check-in/Checkout Times */}
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="text-lg font-rubik-bold text-black mb-3">Check-in & Checkout Times</Text>
                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-rubik-medium text-gray-700 mb-2">Check-in Time</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-rubik"
                      placeholder="3:00 PM"
                      value={propertyData.checkInTime}
                      onChangeText={(text) => setPropertyData(prev => ({ ...prev, checkInTime: text }))}
                    />
                  </View>
                  <View>
                    <Text className="text-sm font-rubik-medium text-gray-700 mb-2">Checkout Time</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-rubik"
                      placeholder="11:00 AM"
                      value={propertyData.checkoutTime}
                      onChangeText={(text) => setPropertyData(prev => ({ ...prev, checkoutTime: text }))}
                    />
                  </View>
                </View>
              </View>

              {/* Rental Period Options */}
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="text-lg font-rubik-bold text-black mb-3">Rental Period Options</Text>
                <Text className="text-sm font-rubik text-gray-600 mb-4">
                  Choose what type of rentals you want to allow
                </Text>
                
                <View className="space-y-3">
                  {[
                    { value: 'weekend', label: 'Weekend Only', description: 'Friday to Sunday' },
                    { value: 'multiple_days', label: 'Multiple Days', description: '2-7 days' },
                    { value: 'weeks', label: 'Weekly', description: '1-4 weeks' },
                    { value: 'months', label: 'Monthly', description: '1-12 months' },
                    { value: 'year', label: 'Yearly', description: 'Long-term rental' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setPropertyData(prev => ({ ...prev, rentalPeriod: option.value as any }))}
                      className={`flex-row items-center justify-between p-4 rounded-xl border ${
                        propertyData.rentalPeriod === option.value
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                          propertyData.rentalPeriod === option.value
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-400'
                        }`}>
                          {propertyData.rentalPeriod === option.value && (
                            <View className="w-2 h-2 rounded-full bg-white m-0.5" />
                          )}
                        </View>
                        <View>
                          <Text className="text-base font-rubik-bold text-gray-900">{option.label}</Text>
                          <Text className="text-sm font-rubik text-gray-600">{option.description}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Stay Duration Limits */}
              <View className="bg-white rounded-2xl p-4 shadow-sm">
                <Text className="text-lg font-rubik-bold text-black mb-3">Stay Duration Limits</Text>
                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-rubik-medium text-gray-700 mb-2">Minimum Stay (nights)</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-rubik"
                      placeholder="1"
                      value={propertyData.minimumStay?.toString()}
                      onChangeText={(text) => setPropertyData(prev => ({ ...prev, minimumStay: parseInt(text) || 1 }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View>
                    <Text className="text-sm font-rubik-medium text-gray-700 mb-2">Maximum Stay (nights)</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-rubik"
                      placeholder="30"
                      value={propertyData.maximumStay?.toString()}
                      onChangeText={(text) => setPropertyData(prev => ({ ...prev, maximumStay: parseInt(text) || 30 }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Summary */}
          <View className="bg-blue-50 rounded-2xl p-4 shadow-sm">
            <Text className="text-base font-rubik-bold text-blue-800 mb-2">Availability Summary</Text>
            {isSelling ? (
              <View>
                <Text className="text-sm font-rubik text-blue-700">
                  Viewing available from {propertyData.viewingStartDate || 'Not set'} to {propertyData.viewingEndDate || 'Not set'}
                </Text>
                <Text className="text-sm font-rubik text-blue-700">
                  Time slots: {propertyData.viewingTimeSlots?.length || 0} selected
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-sm font-rubik text-blue-700">
                  Rental available from {propertyData.rentalStartDate || 'Not set'} to {propertyData.rentalEndDate || 'Not set'}
                </Text>
                <Text className="text-sm font-rubik text-blue-700">
                  Check-in: {propertyData.checkInTime} | Checkout: {propertyData.checkoutTime}
                </Text>
                <Text className="text-sm font-rubik text-blue-700">
                  Period: {propertyData.rentalPeriod?.replace('_', ' ')} | Stay: {propertyData.minimumStay}-{propertyData.maximumStay} nights
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: -40,
        zIndex: 500, // Below tab bar so nav remains in front
      }}
    >
      <Animated.View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity }}
      >
        <Animated.View
          className="rounded-t-3xl"
          style={{
            height: animatedHeight,
            marginBottom: 90,
            width: sheetWidth,
            marginHorizontal: sheetHorizontalMargin,
          }}
        >
          <LinearGradient
            colors={['#F0F9F4', '#E8F5E8', '#F0F9F4']}
            style={{ flex: 1, borderRadius: 24 }}
          >
          {/* Header */}
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-rubik-bold text-black">Add Property</Text>
              <TouchableOpacity
                onPress={handleCloseWithAnimation}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Submit Button - Only show on Step 6 */}
            {currentStep === 6 && (
              <View className="mb-4">
                <TouchableOpacity
                  className={`w-full py-3 rounded-xl ${
                    isUploading ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                  onPress={handleSubmit}
                  disabled={isUploading}
                >
                  <Text className="text-white font-rubik-bold text-center text-lg">
                    {isUploading ? 'Uploading...' : 'Submit Property'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Progress Steps */}
            <View className="flex-row items-center justify-center">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <View key={step} className="flex-row items-center">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      step <= currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-rubik-bold ${
                        step <= currentStep ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {step}
                    </Text>
                  </View>
                  {step < 5 && (
                    <View
                      className={`w-8 h-1 mx-2 ${
                        step < currentStep ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>

          {currentStep === 1 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-6"
              className="flex-1"
            >
              {renderStep1()}
            </ScrollView>
          )}

          {currentStep === 2 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-6"
              className="flex-1"
            >
              {renderStep2()}
            </ScrollView>
          )}

          {currentStep === 3 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-6"
              className="flex-1"
            >
              {renderStep3()}
            </ScrollView>
          )}

          {currentStep === 4 && renderStep4()}

          {currentStep === 5 && renderStep5()}

          {currentStep === 6 && renderStep6()}

          {/* Bottom Action Bar */}
          {currentStep > 1 && currentStep < 6 && (
            <View className="p-6 border-t border-gray-200 pb-16">
              <View className="flex-row space-x-3 gap-2">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-4 rounded-full"
                  onPress={handlePrevious}
                >
                  <Text className="text-center text-gray-700 font-rubik-bold">
                    Previous
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`${isUploading ? 'bg-blue-400' : 'bg-blue-600'} flex-1 py-4 rounded-full`}
                  onPress={currentStep === 6 ? handleSubmit : handleNext}
                  disabled={isUploading}
                >
                  <Text className="text-center text-white font-rubik-bold">
                    {isUploading ? "Uploading..." : currentStep === 6 ? "Submit Property" : "Next"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default AddPropertyBottomSheet;
