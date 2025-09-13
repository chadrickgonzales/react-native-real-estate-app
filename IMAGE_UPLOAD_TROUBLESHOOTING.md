# 🚨 Image Upload Error Troubleshooting

## Error: `TypeError: cannot read property '$id' of undefined`

This error occurs when the `storage.createFile()` function returns `undefined` instead of a proper result object.

## 🔍 Common Causes & Solutions

### 1. **Storage Bucket Not Configured**
**Error**: `Storage bucket ID not configured`

**Solution**:
```bash
# Check your .env.local file
EXPO_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id_here
```

**Steps**:
1. Go to Appwrite Console → Storage
2. Create a bucket named `property-images`
3. Copy the bucket ID to your `.env.local` file
4. Restart your development server

### 2. **Bucket Permissions Issue**
**Error**: Permission denied or bucket not found

**Solution**:
Set these permissions in Appwrite Console → Storage → Your Bucket → Settings:

- **Create**: `users` (authenticated users can upload)
- **Read**: `any` (anyone can view images)
- **Update**: `users` (users can update their own images)
- **Delete**: `users` (users can delete their own images)

### 3. **File Format Issues**
**Error**: Invalid file object or unsupported format

**Solution**:
The file object must have this structure:
```javascript
{
  uri: "file:///path/to/image.jpg",
  type: "image/jpeg", // or "image/png", "image/webp"
  name: "image.jpg"
}
```

### 4. **File Size Too Large**
**Error**: File exceeds size limit

**Solution**:
- Check bucket file size limit (recommended: 10MB)
- Compress images before upload
- Use appropriate image formats (JPEG for photos, PNG for graphics)

### 5. **Authentication Issues**
**Error**: User not authenticated

**Solution**:
- Ensure user is logged in before uploading
- Check if session is valid
- Re-login if necessary

## 🧪 Testing Your Setup

### Step 1: Use the Test Component
Add this to any screen:
```tsx
import AppwriteTest from '@/components/AppwriteTest';

// In your component
<AppwriteTest />
```

### Step 2: Check Console Logs
Look for these messages:
```
✅ Storage bucket ID configured: your_bucket_id
✅ Storage connection successful, buckets: 1
✅ Our bucket found: property-images
```

### Step 3: Test Image Upload
Use the "Test Upload" button in the AppwriteTest component.

## 🔧 Debug Steps

### 1. **Check Environment Variables**
```bash
# In your terminal
echo $EXPO_PUBLIC_APPWRITE_BUCKET_ID
```

### 2. **Verify Bucket Exists**
```javascript
// Add this to your app temporarily
import { storage } from '@/lib/appwrite';

const checkBucket = async () => {
  try {
    const buckets = await storage.listBuckets();
    console.log('Available buckets:', buckets.buckets);
  } catch (error) {
    console.error('Error listing buckets:', error);
  }
};
```

### 3. **Test with Simple File**
```javascript
// Test with a simple base64 image
const testFile = {
  uri: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  type: "image/jpeg",
  name: "test.jpg"
};
```

## 🚀 Quick Fix Checklist

- [ ] ✅ Storage bucket created in Appwrite Console
- [ ] ✅ Bucket ID added to `.env.local`
- [ ] ✅ Bucket permissions set correctly
- [ ] ✅ User is authenticated
- [ ] ✅ File size under 10MB
- [ ] ✅ File format is jpg, png, or webp
- [ ] ✅ Development server restarted after env changes

## 📱 Common File Object Issues

### ❌ Wrong Format:
```javascript
// This will fail
const badFile = {
  path: "/path/to/image.jpg", // Wrong property name
  mimeType: "image/jpeg"      // Wrong property name
};
```

### ✅ Correct Format:
```javascript
// This will work
const goodFile = {
  uri: "file:///path/to/image.jpg", // Correct property name
  type: "image/jpeg",               // Correct property name
  name: "image.jpg"                 // Optional but recommended
};
```

## 🆘 Still Having Issues?

1. **Check Appwrite Console Logs**
   - Go to your Appwrite project
   - Check the logs for any error messages

2. **Test with Minimal Code**
   ```javascript
   import { storage } from '@/lib/appwrite';
   
   const testUpload = async () => {
     try {
       const result = await storage.createFile(
         'your_bucket_id',
         'unique_file_id',
         {
           uri: 'data:image/jpeg;base64,/9j/4AAQ...',
           type: 'image/jpeg',
           name: 'test.jpg'
         }
       );
       console.log('Success:', result);
     } catch (error) {
       console.error('Error:', error);
     }
   };
   ```

3. **Contact Support**
   - Check Appwrite documentation
   - Verify your project settings
   - Ensure all environment variables are correct

## 🎯 Expected Behavior

When working correctly, you should see:
```
Uploading image: { file: {...}, propertyId: "...", imageIndex: 0 }
File to upload: { uri: "...", type: "image/jpeg", name: "..." }
Image uploaded successfully: 64f8a1b2c3d4e5f6g7h8i9j0
```

The `$id` should be a long string like `64f8a1b2c3d4e5f6g7h8i9j0`.
