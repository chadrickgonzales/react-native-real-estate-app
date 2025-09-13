# Image Upload Functionality Guide

## Overview
This guide explains how the image upload functionality works in the real estate app. Users can now upload multiple images when creating property listings, and these images are stored in Appwrite Storage with URLs saved to the properties database.

## How It Works

### 1. Image Selection
- Users can select up to 5 images when creating a property listing
- Images can be taken with the camera or selected from the photo library
- The `AddPropertyBottomSheet` component handles image selection using `expo-image-picker`

### 2. Image Upload Process
When a user submits a property listing:

1. **Image Upload**: Images are uploaded to Appwrite Storage using the `uploadMultipleImages` function
2. **URL Generation**: Public URLs are generated for each uploaded image using `getImageUrl`
3. **Database Storage**: Image URLs are stored in the properties table as:
   - `image`: Primary image URL (first image)
   - `images`: JSON string containing all image URLs

### 3. Image Display
- Properties display the first uploaded image as the primary image
- Fallback to default images if no uploaded images exist
- Image counters show the correct number of uploaded images

## Key Functions

### `uploadImage(file, propertyId, imageIndex)`
Uploads a single image to Appwrite Storage.

### `uploadMultipleImages(images, propertyId)`
Uploads multiple images in parallel for better performance.

### `getImageUrl(fileId)`
Generates a public URL for an uploaded image.

### `createProperty(propertyData)`
Enhanced to handle image uploads before creating the property record.

## Database Schema
The properties table now includes:
- `image`: String - Primary image URL
- `images`: String - JSON array of all image URLs

## Usage Example
```typescript
// When creating a property with images
const propertyData = {
  title: "Beautiful House",
  address: "123 Main St",
  price: "500000",
  images: [
    "file:///path/to/image1.jpg",
    "file:///path/to/image2.jpg"
  ],
  // ... other property fields
};

const result = await createProperty(propertyData);
// Images are automatically uploaded and URLs stored
```

## Error Handling
- Image upload failures don't prevent property creation
- Fallback images are used if upload fails
- Loading states provide user feedback during upload

## Storage Configuration
Make sure your Appwrite project has:
- A storage bucket configured
- Proper permissions for file uploads
- The bucket ID set in your environment variables

## Environment Variables Required
```
EXPO_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id
```

## Testing
To test the image upload functionality:
1. Open the app and navigate to add a property
2. Select images in step 2 of the property creation flow
3. Complete the property details and submit
4. Check that images appear in the property listings
5. Verify images display correctly in property detail views
