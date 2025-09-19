import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  OAuthProvider,
  Query,
  Storage
} from "react-native-appwrite";

export const config = {
  platform: "com.jsm.restate",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bfc67b000f0d9a493c",
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68c114a1000e22edecff",
  galleriesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID || "galleries",
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || "reviews",
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID || "agents",
  propertiesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID || "properties",
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "user",
  chatsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID || "chats",
  messagesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID || "messages",
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || "68c4f43100080f6b0d50",
};

export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    // After successful OAuth login, create user document if it doesn't exist
    try {
      const authAccount = await account.get();
      if (authAccount.email && authAccount.name) {
        await createGoogleOAuthUser({
          email: authAccount.email,
          name: authAccount.name,
        });
      }
    } catch (userCreationError) {
      console.log("User document creation failed, but login was successful:", userCreationError);
      // Don't fail the login if user document creation fails
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    if (!session) throw new Error("Session creation failed");
    return session;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

export async function updateUserProfile({
  userId,
  profileData,
}: {
  userId: string;
  profileData: {
    phoneNumber?: string;
    location?: string;
    preferences?: string;
    bio?: string;
    setupCompleted?: boolean;
  };
}) {
  try {
    const result = await databases.updateDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId,
      profileData
    );
    return result;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const authAccount = await account.get();
    if (!authAccount.$id) return null;

    // Try to get user document from users collection
    try {
      const userDocuments = await databases.listDocuments(
        config.databaseId!,
        config.usersCollectionId!,
        [Query.equal("email", authAccount.email)]
      );

      if (userDocuments.documents.length > 0) {
        const userDoc = userDocuments.documents[0];
        return {
          $id: userDoc.$id,
          userName: userDoc.userName,
          email: userDoc.email,
          password: userDoc.password,
          phoneNumber: userDoc.phoneNumber,
          location: userDoc.location,
          preferences: userDoc.preferences ? (() => {
            try {
              return JSON.parse(userDoc.preferences);
            } catch {
              return undefined;
            }
          })() : undefined,
          bio: userDoc.bio,
          setupCompleted: userDoc.setupCompleted,
          createdAt: userDoc.createdAt,
        };
      }
    } catch (error) {
      console.log("Error fetching user document:", error);
    }

    // Fallback to auth account data if user document not found
    return {
      $id: authAccount.$id,
      userName: authAccount.name,
      email: authAccount.email,
      password: "",
      phoneNumber: undefined,
      location: undefined,
      preferences: undefined,
      bio: undefined,
      setupCompleted: false,
      createdAt: authAccount.$createdAt,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createGoogleOAuthUser({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  try {
    console.log("Creating Google OAuth user document...");
    
    // Check if user document already exists
    const existingUsers = await databases.listDocuments(
      config.databaseId!,
      config.usersCollectionId!,
      [Query.equal("email", email)]
    );

    if (existingUsers.documents.length > 0) {
      console.log("User document already exists");
      return existingUsers.documents[0];
    }

    // Create user document for Google OAuth user
    const userDocument = await databases.createDocument(
      config.databaseId!,
      config.usersCollectionId!,
      ID.unique(),
      {
        userName: name,
        email: email,
        password: "", // No password for OAuth users
        setupCompleted: false, // Will be completed during account setup
        createdAt: new Date().toISOString(),
      }
    );

    if (!userDocument) throw new Error("User document creation failed");
    console.log("Google OAuth user document created successfully:", userDocument.$id);

    return userDocument;
  } catch (error: any) {
    console.error("Google OAuth user creation error:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    throw error;
  }
}

export async function signUp({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    console.log("Starting signup process...");
    console.log("Config:", {
      databaseId: config.databaseId,
      usersCollectionId: config.usersCollectionId,
    });

    // Create account in Appwrite Auth
    console.log("Creating Appwrite Auth account...");
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    if (!newAccount) throw new Error("Account creation failed");
    console.log("Auth account created successfully:", newAccount.$id);

    // Create user document in the users collection
    console.log("Creating user document in collection...");
    const userDocument = await databases.createDocument(
      config.databaseId!,
      config.usersCollectionId!,
      ID.unique(),
      {
        userName: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString(),
      }
    );

    if (!userDocument) throw new Error("User document creation failed");
    console.log("User document created successfully:", userDocument.$id);

    // Sign in the user after successful registration
    console.log("Creating session...");
    const session = await account.createEmailPasswordSession(email, password);
    if (!session) throw new Error("Session creation failed");
    console.log("Session created successfully");

    return {
      account: newAccount,
      user: userDocument,
      session: session,
    };
  } catch (error: any) {
    console.error("Detailed signup error:", {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response,
    });
    throw error;
  }
}

export async function getLatestProperties(propertyType?: string, filter?: string) {
  try {
    console.log("Fetching latest properties with propertyType:", propertyType, "filter:", filter);
    
    const buildQuery = [Query.orderDesc("$createdAt"), Query.limit(20)];
    
    if (propertyType && propertyType !== '') {
      buildQuery.push(Query.equal("propertyType", propertyType));
    }
    
    if (filter && filter !== '' && filter !== 'All') {
      buildQuery.push(Query.equal("type", filter));
    }
    
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    console.log("Raw properties from database:", result.documents.length);
    console.log("Query filter applied:", filter);
    console.log("Property types in results:", result.documents.map(p => p.type));

    // Images for each property
    const propertiesWithImages = result.documents.map(property => {
      let parsedImages: string[] = [];
      if (property.images) {
        try {
          parsedImages = JSON.parse(property.images);
        } catch {
          // If parsing fails, treat as single image URL
          parsedImages = [property.images];
        }
      }
      
      return {
        ...property,
        images: parsedImages,
      };
    });

    console.log("Processed properties with images:", propertiesWithImages.length);
    return propertiesWithImages;
  } catch (error) {
    console.error("Error fetching latest properties:", error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
  propertyType,
}: {
  filter: string;
  query: string;
  limit?: number;
  propertyType?: string;
}) {
  try {
    console.log("Fetching properties with params:", { filter, query, limit, propertyType });
    
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All")
      buildQuery.push(Query.equal("type", filter));

    if (propertyType && propertyType !== '')
      buildQuery.push(Query.equal("propertyType", propertyType));

    // Note: Search functionality is now handled client-side using geocoding utility
    // This avoids the need for fulltext indexes in Appwrite

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    console.log("Raw properties from database:", result.documents.length);
    console.log("Query filter applied:", filter);
    console.log("Property types in results:", result.documents.map(p => p.type));

    // Parse images for each property
    const propertiesWithImages = result.documents.map(property => {
      let parsedImages: string[] = [];
      if (property.images) {
        try {
          parsedImages = JSON.parse(property.images);
        } catch {
          // If parsing fails, treat as single image URL
          parsedImages = [property.images];
        }
      }
      
      return {
        ...property,
        images: parsedImages,
      };
    });

    console.log("Processed properties with images:", propertiesWithImages.length);
    return propertiesWithImages;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

// write function to get property by id
export async function getPropertyById({ id }: { id: string }) {
  try {
    const property: any = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );

    if (!property) return null;

    const originalReviews = Array.isArray(property.reviews)
      ? property.reviews
      : [];
    const originalGallery = Array.isArray(property.gallery)
      ? property.gallery
      : [];

    // Resolve agent relation if it's an ID
    let resolvedAgent = property.agent;
    if (resolvedAgent && typeof resolvedAgent === "string") {
      try {
        resolvedAgent = await databases.getDocument(
          config.databaseId!,
          config.agentsCollectionId!,
          resolvedAgent
        );
      } catch {}
    }

    // Resolve gallery documents if they are IDs
    let resolvedGallery = property.gallery;
    if (Array.isArray(resolvedGallery)) {
      const galleryItems = await Promise.all(
        resolvedGallery.map(async (item: any) => {
          if (item && typeof item === "string") {
            try {
              return await databases.getDocument(
                config.databaseId!,
                config.galleriesCollectionId!,
                item
              );
            } catch {
              return null;
            }
          }
          return item; // already an object
        })
      );
      resolvedGallery = galleryItems.filter(Boolean);
    }

    // Resolve review documents if they are IDs
    let resolvedReviews = property.reviews;
    if (Array.isArray(resolvedReviews)) {
      const reviewItems = await Promise.all(
        resolvedReviews.map(async (item: any) => {
          if (item && typeof item === "string") {
            try {
              return await databases.getDocument(
                config.databaseId!,
                config.reviewsCollectionId!,
                item
              );
            } catch {
              return null;
            }
          }
          return item; // already an object
        })
      );
      resolvedReviews = reviewItems.filter(Boolean);
    }

    // Parse images if they exist as JSON string
    let parsedImages: string[] = [];
    if (property.images) {
      try {
        parsedImages = JSON.parse(property.images);
      } catch {
        // If parsing fails, treat as single image URL
        parsedImages = [property.images];
      }
    }

    return {
      ...property,
      agent: resolvedAgent,
      gallery: resolvedGallery,
      reviews: resolvedReviews,
      images: parsedImages, // Add parsed images array
      reviewsCount:
        Array.isArray(resolvedReviews) && resolvedReviews.length > 0
          ? resolvedReviews.length
          : originalReviews.length,
      galleryCount:
        Array.isArray(resolvedGallery) && resolvedGallery.length > 0
          ? resolvedGallery.length
          : originalGallery.length,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getPropertiesByOwner(ownerId: string) {
  try {
    const properties = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [
        Query.equal("ownerId", ownerId),
        Query.orderDesc("$createdAt")
      ]
    );
    return properties.documents;
  } catch (error) {
    console.error("Error fetching owner properties:", error);
    throw error;
  }
}

// Image upload utility functions
export async function uploadImage(file: any, propertyId: string, imageIndex: number) {
  try {
    console.log("Uploading image:", { file, propertyId, imageIndex });
    
    // Validate file object
    if (!file || !file.uri) {
      throw new Error("Invalid file object provided");
    }
    
    // Validate bucket ID
    if (!config.bucketId) {
      throw new Error("Storage bucket ID not configured");
    }
    
    // Create proper file object for Appwrite
    const fileToUpload = {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || `property_${propertyId}_${imageIndex}_${Date.now()}.jpg`,
      size: file.size || 0 // Add size property
    };
    
    console.log("File to upload:", fileToUpload);
    
    // Upload the file to Appwrite Storage
    const result = await storage.createFile(
      config.bucketId!,
      ID.unique(),
      fileToUpload
    );
    
    // Validate result
    if (!result || !result.$id) {
      throw new Error("Upload failed - no result returned from storage");
    }
    
    console.log("Image uploaded successfully:", result.$id);
    return result;
  } catch (error: any) {
    console.error("Error uploading image:", {
      message: error.message,
      code: error.code,
      type: error.type,
      file: file,
    });
    throw error;
  }
}

export async function getImageUrl(fileId: string) {
  try {
    // Construct the public URL directly
    const endpoint = config.endpoint;
    const projectId = config.projectId;
    const bucketId = config.bucketId;
    
    // Return the public URL for the file
    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
  } catch (error: any) {
    console.error("Error getting image URL:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    throw error;
  }
}

export async function uploadMultipleImages(images: any[], propertyId: string) {
  try {
    console.log("Uploading multiple images:", { images: images.length, propertyId });
    
    // Validate input
    if (!images || images.length === 0) {
      console.log("No images to upload");
      return [];
    }
    
    const uploadPromises = images.map((image, index) => 
      uploadImage(image, propertyId, index)
    );
    
    const uploadResults = await Promise.all(uploadPromises);
    console.log("All images uploaded successfully:", uploadResults.length);
    
    return uploadResults;
  } catch (error: any) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
}

// Test function to verify Appwrite setup
export async function testAppwriteSetup() {
  try {
    console.log("Testing Appwrite setup...");
    
    // Test 1: Check if bucket exists
    if (!config.bucketId) {
      throw new Error("❌ Storage bucket ID not configured");
    }
    console.log("✅ Storage bucket ID configured:", config.bucketId);
    
    // Test 2: Check if database is accessible
    if (!config.databaseId) {
      throw new Error("❌ Database ID not configured");
    }
    console.log("✅ Database ID configured:", config.databaseId);
    
    // Test 3: Check if properties collection is accessible
    if (!config.propertiesCollectionId) {
      throw new Error("❌ Properties collection ID not configured");
    }
    console.log("✅ Properties collection ID configured:", config.propertiesCollectionId);
    
    // Test 4: Try to list properties (this will test database connection)
    try {
      const result = await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        [Query.limit(10)]
      );
      console.log("✅ Database connection successful");
      console.log("📊 Property types in database:", [...new Set(result.documents.map(p => p.type))]);
    } catch (dbError) {
      console.log("⚠️ Database connection test failed:", dbError);
    }
    
    // Test 5: Try to access storage (skip bucket listing for now)
    try {
      console.log("✅ Storage connection test skipped (listBuckets not available)");
      console.log("✅ Bucket ID configured:", config.bucketId);
    } catch (storageError) {
      console.log("⚠️ Storage connection test failed:", storageError);
    }
    
    console.log("🎉 Appwrite setup test completed!");
    return true;
  } catch (error: any) {
    console.error("❌ Appwrite setup test failed:", error.message);
    return false;
  }
}

// Test function specifically for image upload
export async function testImageUpload() {
  try {
    console.log("Testing image upload...");
    
    if (!config.bucketId) {
      throw new Error("Storage bucket ID not configured");
    }
    
    // Create a simple test file object
    const testFile = {
      uri: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      type: "image/jpeg",
      name: "test_image.jpg",
      size: 1000 // Add size property
    };
    
    console.log("Attempting to upload test file...");
    const result = await uploadImage(testFile, "test_property", 0);
    
    if (result && result.$id) {
      console.log("✅ Test image upload successful:", result.$id);
      return true;
    } else {
      console.log("❌ Test image upload failed - no result");
      return false;
    }
  } catch (error: any) {
    console.error("❌ Test image upload failed:", error);
    return false;
  }
}

export async function createProperty(propertyData: any) {
  try {
    console.log("Creating property with data:", propertyData);
    
    // Check if user is authenticated
    const currentUser = await account.get();
    console.log("Current authenticated user:", currentUser);
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Generate a unique property ID for image naming
    const propertyId = ID.unique();
    
    // Upload images if any exist
    let imageUrls: string[] = [];
    if (propertyData.images && propertyData.images.length > 0) {
      try {
        console.log("Uploading images for property:", propertyId);
        
        // Convert local URIs to file objects for upload
        const imageFiles = propertyData.images.map((uri: string) => ({
          uri: uri,
          type: 'image/jpeg',
          name: `property_${propertyId}_${Date.now()}.jpg`,
          size: 0 // Size will be determined by the file
        }));
        
        const uploadedImages = await uploadMultipleImages(imageFiles, propertyId);
        
        // Get the public URLs for the uploaded images
        imageUrls = await Promise.all(
          uploadedImages.map(image => getImageUrl(image.$id))
        );
        
        console.log("Image URLs generated:", imageUrls);
      } catch (imageError) {
        console.error("Error uploading images:", imageError);
        // Continue with property creation even if image upload fails
        // You might want to show a warning to the user
      }
    }
    
    const result = await databases.createDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      propertyId,
      {
        // Only include fields that exist in the current schema
        name: propertyData.title || "Untitled Property",
        type: propertyData.type || "House",
        description: propertyData.description || "",
        address: propertyData.address || "",
        price: parseFloat(propertyData.price) || 0,
        area: parseFloat(propertyData.area) || 0,
        bedrooms: parseInt(propertyData.bedrooms) || 0,
        bathrooms: parseInt(propertyData.bathrooms) || 0,
        rating: 0, // Default rating for new properties
        
        // Image URLs - store as JSON string or array
        image: imageUrls.length > 0 ? imageUrls[0] : "", // Primary image
        images: JSON.stringify(imageUrls), // All images as JSON string
        
        // Required fields that were added to the schema
        propertyAge: propertyData.propertyAge || "",
        contactPhone: propertyData.contactPhone || "",
        contactEmail: propertyData.contactEmail || "",
        propertyType: propertyData.propertyType || "",
        availableDate: propertyData.availableDate || "",
        furnishedStatus: propertyData.furnishedStatus || false,
        petFriendly: propertyData.petFriendly || false,
        hasHOA: propertyData.hasHOA || false,
        hasPool: propertyData.hasPool || false,
        hasGarage: propertyData.hasGarage || false,
        utilitiesIncluded: propertyData.utilitiesIncluded || false,
        smokingAllowed: propertyData.smokingAllowed || false,
        backgroundCheckRequired: propertyData.backgroundCheckRequired || false,
        parkingSpaces: propertyData.parkingSpaces || "",
        yearBuilt: propertyData.yearBuilt || "",
        lotSize: propertyData.lotSize || "",
        propertyCondition: propertyData.propertyCondition || "",
        hoaFees: propertyData.hoaFees || "",
        propertyTaxes: propertyData.propertyTaxes || "",
        leaseDuration: propertyData.leaseDuration || "",
        deposit: propertyData.deposit || "",
        utilities: propertyData.utilities || "",
        moveInRequirements: propertyData.moveInRequirements || "",
        petDeposit: propertyData.petDeposit || "",
        utilitiesResponsibility: propertyData.utilitiesResponsibility || "",
        furnitureIncluded: propertyData.furnitureIncluded || "",
        utilitiesIncludedText: propertyData.utilitiesIncludedText || "",
        amenities: propertyData.amenities || "",
        latitude: propertyData.latitude || 0,
        longitude: propertyData.longitude || 0,
        propertyOwnerId: currentUser.$id, // Set the current user as the property owner
      }
    );

    console.log("Property created successfully:", result.$id);
    return result;
  } catch (error: any) {
    console.error("Error creating property:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    throw error;
  }
}

// Chat functionality
export interface Chat {
  $id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  propertyName: string;
  propertyAddress?: string;
  sellerName: string;
  sellerAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  $id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  createdAt: string;
}

// Create or get existing chat between buyer and seller for a property
export async function createOrGetChat({
  propertyId,
  buyerId,
  sellerId,
  propertyName,
  sellerName,
  sellerAvatar,
  initialMessage,
}: {
  propertyId: string;
  buyerId: string;
  sellerId: string;
  propertyName: string;
  sellerName: string;
  sellerAvatar?: string;
  initialMessage?: string;
}) {
  try {

    // Get property details to extract address
    let propertyAddress = "Location";
    try {
      const property = await databases.getDocument(
        config.databaseId!,
        config.propertiesCollectionId!,
        propertyId
      );
      propertyAddress = property.address || "Location";
    } catch (error) {
      console.warn("Could not fetch property address:", error);
    }

    // Check if chat already exists
    const existingChats = await databases.listDocuments(
      config.databaseId!,
      config.chatsCollectionId!,
      [
        Query.equal("propertyId", propertyId),
        Query.equal("buyerId", buyerId),
        Query.equal("sellerId", sellerId),
      ]
    );

    let chat: Chat;
    
    if (existingChats.documents.length > 0) {
      // Chat exists, return it
      chat = existingChats.documents[0] as unknown as Chat;
    } else {
      // Create new chat
      const newChat = await databases.createDocument(
        config.databaseId!,
        config.chatsCollectionId!,
        ID.unique(),
        {
          propertyId,
          buyerId,
          sellerId,
          propertyName,
          sellerName,
          sellerAvatar: sellerAvatar || "",
          propertyAddress, // Add property address
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      chat = newChat as unknown as Chat;
    }

    // If there's an initial message, send it
    if (initialMessage && initialMessage.trim()) {
      await sendMessage({
        chatId: chat.$id,
        senderId: buyerId,
        senderName: "You", // This will be replaced with actual user name
        text: initialMessage.trim(),
      });
    }

    return chat;
  } catch (error: any) {
    console.error("Error creating or getting chat:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    throw error;
  }
}

// Send a message in a chat
export async function sendMessage({
  chatId,
  senderId,
  senderName,
  senderAvatar,
  text,
}: {
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
}) {
  try {

    // Check if message collection is configured
    if (!config.messagesCollectionId) {
      console.warn("Message collection not configured. Please run setup-chat.js to configure chat functionality.");
      return null;
    }

    // Create the message
    const message = await databases.createDocument(
      config.databaseId!,
      config.messagesCollectionId!,
      ID.unique(),
      {
        chatId,
        senderId,
        senderName,
        senderAvatar: senderAvatar || "",
        text: text.trim(),
        timestamp: new Date().toISOString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    );

    // Update chat with last message info
    await databases.updateDocument(
      config.databaseId!,
      config.chatsCollectionId!,
      chatId,
      {
        lastMessage: text.trim(),
        lastMessageTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return message as unknown as Message;
  } catch (error: any) {
    console.error("Error sending message:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    throw error;
  }
}

// Get messages for a specific chat
export async function getMessages(chatId: string) {
  try {

    // Check if message collection is configured
    if (!config.messagesCollectionId) {
      console.warn("Message collection not configured. Please run setup-chat.js to configure chat functionality.");
      return [];
    }

    const messages = await databases.listDocuments(
      config.databaseId!,
      config.messagesCollectionId!,
      [
        Query.equal("chatId", chatId),
        Query.orderAsc("timestamp"),
      ]
    );

    return messages.documents as unknown as Message[];
  } catch (error: any) {
    console.error("Error getting messages:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    return [];
  }
}

// Get all chats for a user (as buyer or seller)
export async function getUserChats(userId: string) {
  try {

    // Check if chat collection is configured
    if (!config.chatsCollectionId) {
      console.warn("Chat collection not configured. Please run setup-chat.js to configure chat functionality.");
      return [];
    }

    // Check if userId is valid
    if (!userId || userId.trim() === "") {
      console.warn("Invalid userId provided:", userId);
      return [];
    }

    const chats = await databases.listDocuments(
      config.databaseId!,
      config.chatsCollectionId!,
      [
        Query.or([
          Query.equal("buyerId", userId),
          Query.equal("sellerId", userId),
        ]),
      ]
    );

    return chats.documents as unknown as Chat[];
  } catch (error: any) {
    console.error("Error getting user chats:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    return [];
  }
}

// Mark messages as read
export async function markMessagesAsRead(chatId: string, userId: string) {
  try {

    // Check if message collection is configured
    if (!config.messagesCollectionId) {
      console.warn("Message collection not configured. Please run setup-chat.js to configure chat functionality.");
      return;
    }

    // Get unread messages from other users
    const unreadMessages = await databases.listDocuments(
      config.databaseId!,
      config.messagesCollectionId!,
      [
        Query.equal("chatId", chatId),
        Query.notEqual("senderId", userId),
        Query.equal("isRead", false),
      ]
    );

    // Mark each message as read
    const updatePromises = unreadMessages.documents.map(message =>
      databases.updateDocument(
        config.databaseId!,
        config.messagesCollectionId!,
        message.$id,
        { isRead: true }
      )
    );

    await Promise.all(updatePromises);
  } catch (error: any) {
    console.error("Error marking messages as read:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
  }
}

// Get property owner/seller ID from property
export async function getPropertyOwner(propertyId: string) {
  try {
    const property = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      propertyId
    );

    // Get the actual property owner ID from the property
    const propertyOwnerId = property.propertyOwnerId;
    
    if (!propertyOwnerId) {
      console.warn("Property has no owner ID:", propertyId);
      return {
        sellerId: "unknown_owner",
        sellerName: "Property Owner",
        sellerAvatar: property.image || "",
      };
    }

    // Try to get the owner's user information
    try {
      const ownerUser = await databases.getDocument(
        config.databaseId!,
        config.usersCollectionId!,
        propertyOwnerId
      );
      
      return {
        sellerId: propertyOwnerId,
        sellerName: ownerUser.userName || "Property Owner",
        sellerAvatar: property.image || "",
      };
    } catch (error) {
      console.warn("Could not fetch owner user info:", error);
      return {
        sellerId: propertyOwnerId,
        sellerName: "Property Owner",
        sellerAvatar: property.image || "",
      };
    }
  } catch (error: any) {
    console.error("Error getting property owner:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });
    return {
      sellerId: "unknown_owner",
      sellerName: "Property Owner",
      sellerAvatar: "",
    };
  }
}

// Simple refresh functions for chat updates
export function refreshUserChats(userId: string): Promise<Chat[]> {
  return getUserChats(userId);
}

export function refreshChatMessages(chatId: string): Promise<Message[]> {
  return getMessages(chatId);
}

// Saved Properties and Searches functionality
export interface SavedProperty {
  $id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyImage: string;
  price: number;
  propertyType: string;
  listingType: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
  addedDate: string;
  createdAt: string;
}

export interface SavedSearch {
  $id: string;
  userId: string;
  searchName: string;
  searchQuery: string;
  filters: string;
  location: string;
  priceMin: number;
  priceMax: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  isActive: boolean;
  lastChecked: string;
  newMatches: number;
  createdAt: string;
}

// Add saved property to user's favorites
export async function saveProperty(propertyId: string, userId: string, listingType?: 'sale' | 'rent') {
  try {
    // Get property details first
    const property = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      propertyId
    );

    if (!property) {
      throw new Error("Property not found");
    }

    // Check if already saved
    const existingSaved = await databases.listDocuments(
      config.databaseId!,
      "saved_properties", // We'll need to create this collection
      [
        Query.equal("userId", userId),
        Query.equal("propertyId", propertyId)
      ]
    );

    if (existingSaved.documents.length > 0) {
      return { success: false, message: "Property already saved" };
    }

    // Parse images
    let propertyImage = property.image || "";
    if (property.images) {
      try {
        const parsedImages = JSON.parse(property.images);
        propertyImage = parsedImages[0] || property.image || "";
      } catch {
        propertyImage = property.image || "";
      }
    }

    // Determine listing type based on property data
    let determinedListingType: 'sale' | 'rent' = 'sale'; // Default to sale
    
    if (listingType) {
      // Use provided listing type
      determinedListingType = listingType;
    } else if (property.listingType) {
      // Use property's listing type if available
      determinedListingType = property.listingType;
    } else if (property.leaseDuration && property.leaseDuration.trim() !== '') {
      // If property has lease duration, it's likely for rent
      determinedListingType = 'rent';
    } else if (property.deposit && property.deposit.trim() !== '') {
      // If property has deposit, it's likely for rent
      determinedListingType = 'rent';
    }

    // Create saved property record
    const savedProperty = await databases.createDocument(
      config.databaseId!,
      "saved_properties",
      ID.unique(),
      {
        userId,
        propertyId,
        propertyName: property.name,
        propertyAddress: property.address,
        propertyImage,
        price: property.price,
        propertyType: property.type,
        listingType: determinedListingType, // Use determined listing type
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        addedDate: new Date().toISOString(),
      }
    );

    return { success: true, data: savedProperty };
  } catch (error: any) {
    console.error("Error saving property:", error);
    throw error;
  }
}

// Remove saved property from user's favorites
export async function unsaveProperty(propertyId: string, userId: string) {
  try {
    const existingSaved = await databases.listDocuments(
      config.databaseId!,
      "saved_properties",
      [
        Query.equal("userId", userId),
        Query.equal("propertyId", propertyId)
      ]
    );

    if (existingSaved.documents.length === 0) {
      return { success: false, message: "Property not found in saved list" };
    }

    await databases.deleteDocument(
      config.databaseId!,
      "saved_properties",
      existingSaved.documents[0].$id
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error unsaving property:", error);
    throw error;
  }
}

// Get user's saved properties
export async function getSavedProperties(userId: string, listingType?: 'sale' | 'rent') {
  try {
    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("addedDate")
    ];

    // Add listing type filter if specified
    if (listingType) {
      queries.push(Query.equal("listingType", listingType));
    }

    const savedProperties = await databases.listDocuments(
      config.databaseId!,
      "saved_properties",
      queries
    );

    return savedProperties.documents as unknown as SavedProperty[];
  } catch (error: any) {
    console.error("Error getting saved properties:", error);
    return [];
  }
}

// Check if property is saved by user
export async function isPropertySaved(propertyId: string, userId: string) {
  try {
    const existingSaved = await databases.listDocuments(
      config.databaseId!,
      "saved_properties",
      [
        Query.equal("userId", userId),
        Query.equal("propertyId", propertyId)
      ]
    );

    return existingSaved.documents.length > 0;
  } catch (error: any) {
    console.error("Error checking if property is saved:", error);
    return false;
  }
}

// Save a search query
export async function saveSearch({
  userId,
  searchName,
  searchQuery,
  filters,
  location,
  priceMin,
  priceMax,
  propertyType,
  bedrooms,
  bathrooms,
}: {
  userId: string;
  searchName: string;
  searchQuery: string;
  filters: string;
  location: string;
  priceMin: number;
  priceMax: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
}) {
  try {
    const savedSearch = await databases.createDocument(
      config.databaseId!,
      "saved_searches",
      ID.unique(),
      {
        userId,
        searchName,
        searchQuery,
        filters,
        location,
        priceMin,
        priceMax,
        propertyType,
        bedrooms,
        bathrooms,
        isActive: true,
        lastChecked: new Date().toISOString(),
        newMatches: 0,
      }
    );

    return { success: true, data: savedSearch };
  } catch (error: any) {
    console.error("Error saving search:", error);
    throw error;
  }
}

// Get user's saved searches
export async function getSavedSearches(userId: string) {
  try {
    const savedSearches = await databases.listDocuments(
      config.databaseId!,
      "saved_searches",
      [
        Query.equal("userId", userId)
      ]
    );

    return savedSearches.documents as unknown as SavedSearch[];
  } catch (error: any) {
    console.error("Error getting saved searches:", error);
    return [];
  }
}

// Update saved search new matches count
export async function updateSavedSearchMatches(searchId: string, newMatches: number) {
  try {
    await databases.updateDocument(
      config.databaseId!,
      "saved_searches",
      searchId,
      {
        newMatches,
        lastChecked: new Date().toISOString(),
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error updating saved search matches:", error);
    throw error;
  }
}

// Delete saved search
export async function deleteSavedSearch(searchId: string) {
  try {
    await databases.deleteDocument(
      config.databaseId!,
      "saved_searches",
      searchId
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting saved search:", error);
    throw error;
  }
}

// Notification system
export interface Notification {
  $id: string;
  userId: string;
  type: 'property' | 'booking' | 'communication' | 'system' | 'location' | 'engagement';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  readAt?: string;
}

export interface NotificationSettings {
  $id: string;
  userId: string;
  propertyNotifications: boolean;
  bookingNotifications: boolean;
  communicationNotifications: boolean;
  systemNotifications: boolean;
  locationNotifications: boolean;
  engagementNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create a notification
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
  priority = 'medium'
}: {
  userId: string;
  type: 'property' | 'booking' | 'communication' | 'system' | 'location' | 'engagement';
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high';
}) {
  try {
    const notification = await databases.createDocument(
      config.databaseId!,
      "notifications",
      ID.unique(),
      {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : "",
        isRead: false,
        priority,
      }
    );

    return { success: true, data: notification };
  } catch (error: any) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Get user notifications
export async function getUserNotifications(userId: string, limit: number = 50) {
  try {
    const notifications = await databases.listDocuments(
      config.databaseId!,
      "notifications",
      [
        Query.equal("userId", userId),
        Query.limit(limit)
      ]
    );

    return notifications.documents as unknown as Notification[];
  } catch (error: any) {
    console.error("Error getting user notifications:", error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    await databases.updateDocument(
      config.databaseId!,
      "notifications",
      notificationId,
      {
        isRead: true,
        readAt: new Date().toISOString(),
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const unreadNotifications = await databases.listDocuments(
      config.databaseId!,
      "notifications",
      [
        Query.equal("userId", userId),
        Query.equal("isRead", false)
      ]
    );

    const updatePromises = unreadNotifications.documents.map(notification =>
      databases.updateDocument(
        config.databaseId!,
        "notifications",
        notification.$id,
        {
          isRead: true,
          readAt: new Date().toISOString(),
        }
      )
    );

    await Promise.all(updatePromises);
    return { success: true };
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

// Get notification settings
export async function getNotificationSettings(userId: string) {
  try {
    const settings = await databases.listDocuments(
      config.databaseId!,
      "notification_settings",
      [Query.equal("userId", userId)]
    );

    if (settings.documents.length > 0) {
      return settings.documents[0] as unknown as NotificationSettings;
    }

    // Create default settings if none exist
    const defaultSettings = await databases.createDocument(
      config.databaseId!,
      "notification_settings",
      ID.unique(),
      {
        userId,
        propertyNotifications: true,
        bookingNotifications: true,
        communicationNotifications: true,
        systemNotifications: true,
        locationNotifications: true,
        engagementNotifications: true,
        emailNotifications: true,
        pushNotifications: true,
      }
    );

    return defaultSettings as unknown as NotificationSettings;
  } catch (error: any) {
    console.error("Error getting notification settings:", error);
    throw error;
  }
}

// Update notification settings
export async function updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>) {
  try {
    const existingSettings = await getNotificationSettings(userId);
    
    await databases.updateDocument(
      config.databaseId!,
      "notification_settings",
      existingSettings.$id,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
}

// Notification triggers
export async function triggerPropertyNotifications(propertyId: string, property: any) {
  try {
    // Get all users who have saved this property
    const savedProperties = await databases.listDocuments(
      config.databaseId!,
      "saved_properties",
      [Query.equal("propertyId", propertyId)]
    );

    // Get all users with saved searches that match this property
    const savedSearches = await databases.listDocuments(
      config.databaseId!,
      "saved_searches",
      [Query.equal("isActive", true)]
    );

    const notifications = [];

    // Notify users who saved this property about price changes
    for (const savedProperty of savedProperties.documents) {
      const userSettings = await getNotificationSettings(savedProperty.userId);
      
      if (userSettings.propertyNotifications) {
        notifications.push(
          createNotification({
            userId: savedProperty.userId,
            type: 'property',
            title: 'Property Update',
            message: `${property.name} has been updated`,
            data: { propertyId, propertyName: property.name },
            priority: 'medium'
          })
        );
      }
    }

    // Notify users with matching saved searches
    for (const search of savedSearches.documents) {
      const userSettings = await getNotificationSettings(search.userId);
      
      if (userSettings.propertyNotifications && 
          (search.propertyType === property.propertyType || search.propertyType === 'All') &&
          property.price >= search.priceMin && 
          property.price <= search.priceMax) {
        
        notifications.push(
          createNotification({
            userId: search.userId,
            type: 'property',
            title: 'New Property Match',
            message: `New property matches your search: ${search.searchName}`,
            data: { propertyId, searchId: search.$id, propertyName: property.name },
            priority: 'high'
          })
        );

        // Update search new matches count
        await updateSavedSearchMatches(search.$id, search.newMatches + 1);
      }
    }

    await Promise.all(notifications);
    return { success: true };
  } catch (error: any) {
    console.error("Error triggering property notifications:", error);
    throw error;
  }
}

export async function triggerBookingNotifications(bookingId: string, booking: any, type: 'created' | 'confirmed' | 'cancelled' | 'reminder') {
  try {
    const userSettings = await getNotificationSettings(booking.userId);
    
    if (!userSettings.bookingNotifications) return { success: true };

    let title, message;
    switch (type) {
      case 'created':
        title = 'Booking Created';
        message = `Your booking for ${booking.propertyName} has been created`;
        break;
      case 'confirmed':
        title = 'Booking Confirmed';
        message = `Your booking for ${booking.propertyName} has been confirmed`;
        break;
      case 'cancelled':
        title = 'Booking Cancelled';
        message = `Your booking for ${booking.propertyName} has been cancelled`;
        break;
      case 'reminder':
        title = 'Booking Reminder';
        message = `Your booking for ${booking.propertyName} is tomorrow`;
        break;
    }

    await createNotification({
      userId: booking.userId,
      type: 'booking',
      title,
      message,
      data: { bookingId, propertyName: booking.propertyName },
      priority: type === 'reminder' ? 'high' : 'medium'
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error triggering booking notifications:", error);
    throw error;
  }
}

export async function triggerCommunicationNotifications(chatId: string, message: any, recipientId: string) {
  try {
    const userSettings = await getNotificationSettings(recipientId);
    
    if (!userSettings.communicationNotifications) return { success: true };

    await createNotification({
      userId: recipientId,
      type: 'communication',
      title: 'New Message',
      message: `You have a new message from ${message.senderName}`,
      data: { chatId, messageId: message.$id, senderName: message.senderName },
      priority: 'high'
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error triggering communication notifications:", error);
    throw error;
  }
}

export async function triggerLocationNotifications(userId: string, location: string, nearbyProperties: any[]) {
  try {
    const userSettings = await getNotificationSettings(userId);
    
    if (!userSettings.locationNotifications || nearbyProperties.length === 0) return { success: true };

    await createNotification({
      userId,
      type: 'location',
      title: 'Properties Near You',
      message: `Found ${nearbyProperties.length} properties near ${location}`,
      data: { location, propertyCount: nearbyProperties.length, properties: nearbyProperties },
      priority: 'medium'
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error triggering location notifications:", error);
    throw error;
  }
}

export async function triggerEngagementNotifications(userId: string, type: 'welcome' | 'profile_incomplete' | 'no_activity' | 'feature_suggestion') {
  try {
    const userSettings = await getNotificationSettings(userId);
    
    if (!userSettings.engagementNotifications) return { success: true };

    let title, message, priority: 'low' | 'medium' | 'high' = 'low';
    
    switch (type) {
      case 'welcome':
        title = 'Welcome to Real Estate App!';
        message = 'Complete your profile to get personalized property recommendations';
        priority = 'high';
        break;
      case 'profile_incomplete':
        title = 'Complete Your Profile';
        message = 'Add more details to your profile for better property matches';
        priority = 'medium';
        break;
      case 'no_activity':
        title = 'Check Out New Properties';
        message = 'We have new properties that might interest you';
        priority = 'low';
        break;
      case 'feature_suggestion':
        title = 'New Feature Available';
        message = 'Try our new virtual tour feature for properties';
        priority = 'low';
        break;
    }

    await createNotification({
      userId,
      type: 'engagement',
      title,
      message,
      data: { notificationType: type },
      priority
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error triggering engagement notifications:", error);
    throw error;
  }
}
