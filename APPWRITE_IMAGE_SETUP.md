# Appwrite Database Setup for Image Uploads

## Step 1: Environment Variables Setup

Create or update your `.env.local` file in the project root with these variables:

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

# Storage Bucket (REQUIRED for image uploads)
EXPO_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id_here
```

## Step 2: Create Storage Bucket

1. **Go to your Appwrite Console**
2. **Navigate to Storage**
3. **Create a new bucket** with these settings:
   - **Name**: `property-images` (or any name you prefer)
   - **ID**: Copy this ID to your `EXPO_PUBLIC_APPWRITE_BUCKET_ID`
   - **File Size Limit**: `10MB` (recommended for images)
   - **Allowed File Extensions**: `jpg, jpeg, png, webp`
   - **Encryption**: Enabled (recommended)

## Step 3: Set Bucket Permissions

Set the following permissions for your storage bucket:

- **Create**: `users` (authenticated users can upload images)
- **Read**: `any` (anyone can view images)
- **Update**: `users` (users can update their own images)
- **Delete**: `users` (users can delete their own images)

## Step 4: Update Properties Collection Schema

Add these new attributes to your Properties collection:

| Attribute | Type | Required | Size | Array | Default |
|-----------|------|----------|------|-------|---------|
| image | String | No | 500 | No | "" |
| images | String | No | 2000 | No | "" |

**Note**: The `images` field stores a JSON string of all image URLs.

## Step 5: Properties Collection Permissions

Update your Properties collection permissions:

- **Create**: `users` (authenticated users can create properties)
- **Read**: `any` (anyone can view properties)
- **Update**: `users` (users can update their own properties)
- **Delete**: `users` (users can delete their own properties)

## Step 6: Test the Setup

1. **Start your app**: `npm start` or `expo start`
2. **Create a new property** with images
3. **Check the Appwrite console** to verify:
   - Images are uploaded to your storage bucket
   - Property documents contain image URLs
   - Images display correctly in the app

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**:
   - Verify `EXPO_PUBLIC_APPWRITE_BUCKET_ID` is correct
   - Check bucket exists in Appwrite console

2. **"Permission denied" error**:
   - Verify bucket permissions are set correctly
   - Ensure user is authenticated

3. **Images not displaying**:
   - Check if image URLs are being generated correctly
   - Verify bucket has "Read: any" permission

4. **Upload fails**:
   - Check file size limits
   - Verify allowed file extensions
   - Check network connectivity

### Debug Steps:

1. **Check console logs** for detailed error messages
2. **Verify environment variables** are loaded correctly
3. **Test with a simple image** first
4. **Check Appwrite console** for any error logs

## Security Considerations

1. **File Validation**: The app validates file types and sizes
2. **User Authentication**: Only authenticated users can upload
3. **Access Control**: Users can only manage their own images
4. **File Limits**: Set appropriate size limits to prevent abuse

## Performance Tips

1. **Image Compression**: Images are compressed before upload
2. **Parallel Uploads**: Multiple images upload simultaneously
3. **Lazy Loading**: Images load as needed in the UI
4. **Caching**: Appwrite handles image caching automatically

## Next Steps

After setup is complete:
1. Test image upload functionality
2. Verify images display in property listings
3. Test image upload from different devices
4. Monitor storage usage in Appwrite console
