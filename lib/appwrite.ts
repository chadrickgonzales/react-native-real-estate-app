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

export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      const userAvatar = avatar.getInitials(result.name);

      return {
        ...result,
        avatar: userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
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
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.orderAsc("$createdAt"), Query.limit(5)]
    );

    return result.documents;
  } catch (error) {
    console.error(error);
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

    return result.documents;
  } catch (error) {
    console.error(error);
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

    return {
      ...property,
      agent: resolvedAgent,
      gallery: resolvedGallery,
      reviews: resolvedReviews,
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