# Appwrite Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here

# Collection IDs
EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID=your_galleries_collection_id
EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=your_reviews_collection_id
EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID=your_agents_collection_id
EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID=your_properties_collection_id
EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id

# Storage
EXPO_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id_here
```

## Database Schema

### Users Collection (`EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID`)

Your collection is already set up with the following attributes:

| Attribute | Type | Required | Size | Array |
|-----------|------|----------|------|-------|
| userName | String | Yes | 100 | No |
| email | String | Yes | - | No |
| password | String | Yes | 1000 | No |

**Additional fields for account setup (add these to your collection):**

| Attribute | Type | Required | Size | Array |
|-----------|------|----------|------|-------|
| phoneNumber | String | No | 20 | No |
| location | String | No | 100 | No |
| preferences | String | No | 1000 | No | (JSON string of user preferences) |
| bio | String | No | 1000 | No |
| setupCompleted | Boolean | No | - | No |

### Permissions

Set the following permissions for the Users collection:

- **Create**: `users` (authenticated users can create their own user documents)
- **Read**: `users` (users can read their own documents)
- **Update**: `users` (users can update their own documents)
- **Delete**: `users` (users can delete their own documents)

## Authentication Setup

1. Enable Email/Password authentication in your Appwrite project
2. Configure OAuth providers (Google, Apple) if needed
3. Set up proper redirect URLs for OAuth

## Features Implemented

### Signup Form (`signin1.tsx`)
- ✅ Creates Appwrite Auth account
- ✅ Creates user document in Users collection
- ✅ Automatic login after successful signup
- ✅ Form validation and error handling
- ✅ Integration with global state management

### Login Form (`login.tsx`)
- ✅ Email/password authentication
- ✅ Integration with global state management
- ✅ Error handling for invalid credentials
- ✅ Redirect to main app after successful login

### Appwrite Functions Added
- ✅ `signUp()` - Creates both auth account and user document
- ✅ `signIn()` - Email/password authentication
- ✅ Enhanced error handling and user feedback
