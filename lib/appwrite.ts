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
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  propertiesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
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

export async function getLatestProperties() {
  try {
    console.log("Fetching latest properties...");
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.orderDesc("$createdAt"), Query.limit(5)]
    );

    console.log("Raw properties from database:", result.documents.length);

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
    console.error("Error fetching latest properties:", error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    console.log("Fetching properties with params:", { filter, query, limit });
    
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All")
      buildQuery.push(Query.equal("type", filter));

    if (query)
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("type", query),
        ])
      );

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    console.log("Raw properties from database:", result.documents.length);

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
      await databases.listDocuments(
        config.databaseId!,
        config.propertiesCollectionId!,
        [Query.limit(1)]
      );
      console.log("✅ Database connection successful");
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
