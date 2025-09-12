import { categories } from "@/constants/data";
import images from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
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
        <View className="w-3 h-3 rounded-full bg-white" />
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
}

const AddPropertyBottomSheet = ({
  visible,
  onClose,
  onSubmit,
}: AddPropertyBottomSheetProps) => {
  const { user } = useGlobalContext();
  const [currentStep, setCurrentStep] = useState(1);
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
  });

  const [errors, setErrors] = useState<Partial<PropertyData>>({});

  const windowHeight = Dimensions.get("window").height;

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
      if (!propertyData.bedrooms.trim()) newErrors.bedrooms = "Bedrooms is required";
      if (!propertyData.bathrooms.trim()) newErrors.bathrooms = "Bathrooms is required";
      if (!propertyData.price.trim()) newErrors.price = "Price is required";
      if (!propertyData.area.trim()) newErrors.area = "Area is required";
      if (!propertyData.availableDate?.trim()) newErrors.availableDate = "Available date is required";
      if (!propertyData.contactPhone?.trim()) newErrors.contactPhone = "Contact phone is required";
      if (!propertyData.contactEmail?.trim()) newErrors.contactEmail = "Contact email is required";
      // Property type is now optional
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
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

  const handleSubmit = async () => {
    try {
      // Show loading state (you might want to add a loading indicator)
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
      
      // Save to database
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
    }
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

  const addImage = () => {
    // For demo purposes, we'll add a placeholder image
    // In a real app, you'd use image picker
    setPropertyData({
      ...propertyData,
      images: [...propertyData.images, "placeholder"]
    });
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

      <View className="space-y-4">
        {/* Selling Option */}
        <TouchableOpacity
          onPress={() => setPropertyData({ ...propertyData, propertyType: 'sell' })}
          className={`p-6 rounded-2xl border-2 ${
            propertyData.propertyType === 'sell'
              ? 'border-black bg-white'
              : 'border-gray-200 bg-white'
          }`}
          activeOpacity={1}
          style={{ backgroundColor: 'white' }}
        >
          <View className="flex-row items-center space-x-4">
            <View className="w-12 h-12 rounded-full items-center justify-center bg-gray-100">
              <Ionicons 
                name="home" 
                size={24} 
                color="#666"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-rubik-bold text-black mb-1">
                Sell Property
              </Text>
              <Text className="text-sm font-rubik text-gray-600">
                List your property for sale to potential buyers
              </Text>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              propertyData.propertyType === 'sell' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-400 bg-white'
            }`} style={{ elevation: 0, shadowOpacity: 0 }}>
              {propertyData.propertyType === 'sell' && (
                <View className="w-3 h-3 rounded-full bg-white" />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Renting Option */}
        <TouchableOpacity
          onPress={() => setPropertyData({ ...propertyData, propertyType: 'rent' })}
          className={`p-6 rounded-2xl border-2 ${
            propertyData.propertyType === 'rent'
              ? 'border-black bg-white'
              : 'border-gray-200 bg-white'
          }`}
          activeOpacity={1}
          style={{ backgroundColor: 'white' }}
        >
          <View className="flex-row items-center space-x-4">
            <View className="w-12 h-12 rounded-full items-center justify-center bg-gray-100">
              <Ionicons 
                name="key" 
                size={24} 
                color="#666"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-rubik-bold text-black mb-1">
                Rent Property
              </Text>
              <Text className="text-sm font-rubik text-gray-600">
                List your property for rent to potential tenants
              </Text>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              propertyData.propertyType === 'rent' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-400 bg-white'
            }`} style={{ elevation: 0, shadowOpacity: 0 }}>
              {propertyData.propertyType === 'rent' && (
                <View className="w-3 h-3 rounded-full bg-white" />
              )}
            </View>
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
            {propertyData.images.map((_, index) => (
              <View key={index} className="relative">
                <Image
                  source={images.newYork}
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
                className="w-20 h-20 bg-gray-200 rounded-lg items-center justify-center border-2 border-dashed border-gray-400"
              >
                <Ionicons name="add" size={24} color="#666" />
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
          source={propertyData.images.length > 0 ? images.newYork : images.newYork}
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="bg-background-100 rounded-t-3xl"
          style={{ height: windowHeight * 0.9 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="text-xl font-rubik-bold text-black mr-4">Add Property</Text>
              <View className="flex-row items-center">
                {[1, 2, 3, 4].map((step) => (
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
                    {step < 3 && (
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
            <View className="flex-row items-center space-x-3">
              {currentStep === 4 && (
                <TouchableOpacity
                  className="bg-blue-600 px-4 py-2 rounded-lg"
                  onPress={handleSubmit}
                >
                  <Text className="text-white font-rubik-bold text-sm">
                    Upload
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
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

          {/* Bottom Action Bar */}
          {currentStep < 4 && (
            <View className="p-6 border-t border-gray-200">
              <View className="flex-row space-x-3">
                {currentStep > 1 && (
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 py-4 rounded-xl"
                    onPress={handlePrevious}
                  >
                    <Text className="text-center text-gray-700 font-rubik-bold">
                      Previous
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className={`${currentStep > 1 ? "flex-1" : "flex-1"} bg-blue-600 py-4 rounded-xl`}
                  onPress={currentStep === 4 ? handleSubmit : handleNext}
                >
                  <Text className="text-center text-white font-rubik-bold">
                    {currentStep === 4 ? "Confirm & List" : "Next"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AddPropertyBottomSheet;
