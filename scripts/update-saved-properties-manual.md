# Manual Database Update: Add listingType Field

Since the Appwrite Node.js SDK doesn't support adding attributes to existing collections, you'll need to add the `listingType` field manually through the Appwrite Console.

## Steps to Update Your Database

### 1. Open Appwrite Console
Go to [https://cloud.appwrite.io](https://cloud.appwrite.io) and log in to your account.

### 2. Navigate to Your Project
- Select your project (ID: `68bfc67b000f0d9a493c`)
- Go to **Databases** section
- Find your database (ID: `68c114a1000e22edecff`)

### 3. Update saved_properties Collection
- Click on the **saved_properties** collection
- Go to the **Attributes** tab
- Click **Create Attribute**

### 4. Add listingType Attribute
Configure the new attribute with these settings:
- **Key**: `listingType`
- **Type**: `Enum`
- **Elements**: 
  - `sale`
  - `rent`
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Default**: `sale`

### 5. Save the Attribute
Click **Create** to add the attribute to your collection.

### 6. Update Existing Records (Optional)
If you have existing saved properties, you can update them to have the `listingType` field:

1. Go to the **Documents** tab in your saved_properties collection
2. For each existing document, click **Edit**
3. Set the `listingType` field to either `sale` or `rent`
4. Save the document

### 7. Test the Changes
After adding the attribute:
1. Restart your development server
2. Test the filter pills in the Saved Properties section
3. Try saving a new property to ensure the `listingType` field is included

## Alternative: Recreate Collection
If you prefer to start fresh, you can:
1. Delete the existing `saved_properties` collection
2. Run the updated `setup-saved-collections.js` script
3. This will create the collection with the `listingType` field included

## Verification
Once completed, your `saved_properties` collection should have these attributes:
- `userId` (string)
- `propertyId` (string)
- `propertyName` (string)
- `propertyAddress` (string)
- `propertyImage` (string)
- `price` (double)
- `propertyType` (string)
- `listingType` (enum: sale, rent) ← **NEW**
- `bedrooms` (integer)
- `bathrooms` (integer)
- `area` (double)
- `addedDate` (datetime)
