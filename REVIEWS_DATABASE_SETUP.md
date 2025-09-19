# Reviews Database Setup Guide

## Database Collections Required

### 1. property_reviews Collection

**Purpose**: Store reviews and ratings for properties

**Collection ID**: `property_reviews`

**Attributes**:
```
userId (String, 255 chars, Required) - ID of the user who wrote the review
userName (String, 255 chars, Required) - Name of the reviewer
userAvatar (String, 1000 chars, Optional) - Avatar URL of the reviewer
propertyId (String, 255 chars, Required) - ID of the property being reviewed
propertyName (String, 255 chars, Required) - Name of the property
rating (Integer, Required) - Rating from 1-5 stars
title (String, 255 chars, Required) - Review title
comment (String, 2000 chars, Required) - Review text
helpful (Integer, Required, Default: 0) - Number of helpful votes
verified (Boolean, Required, Default: false) - Whether review is verified
createdAt (DateTime, Required) - When review was created
updatedAt (DateTime, Required) - When review was last updated
```

**Permissions**:
- Read: Any
- Create: Any
- Update: Any
- Delete: Any

### 2. user_reviews Collection

**Purpose**: Store reviews and ratings for users

**Collection ID**: `user_reviews`

**Attributes**:
```
reviewerId (String, 255 chars, Required) - ID of the user writing the review
reviewerName (String, 255 chars, Required) - Name of the reviewer
reviewerAvatar (String, 1000 chars, Optional) - Avatar URL of the reviewer
userId (String, 255 chars, Required) - ID of the user being reviewed
rating (Integer, Required) - Rating from 1-5 stars
title (String, 255 chars, Required) - Review title
comment (String, 2000 chars, Required) - Review text
helpful (Integer, Required, Default: 0) - Number of helpful votes
verified (Boolean, Required, Default: false) - Whether review is verified
createdAt (DateTime, Required) - When review was created
updatedAt (DateTime, Required) - When review was last updated
```

**Permissions**:
- Read: Any
- Create: Any
- Update: Any
- Delete: Any

## Manual Setup Instructions

### Step 1: Create Collections in Appwrite Console

1. Go to your Appwrite Console
2. Navigate to your project
3. Go to Database section
4. Create a new collection with ID: `property_reviews`
5. Add all the attributes listed above
6. Set permissions to allow read/write for all users
7. Repeat for `user_reviews` collection

### Step 2: Run Seed Script

After creating the collections, run the seed script to populate with sample data:

```bash
node scripts/seed-reviews.js
```

### Step 3: Test the Rating System

1. Open your app
2. Navigate to any property page
3. Check that ratings are displayed correctly
4. Test the review functionality

## Features Implemented

### ✅ Property Rating Display
- Shows average rating with stars
- Displays total number of reviews
- Real-time calculation from database

### ✅ Review Statistics
- Average rating calculation
- Total review count
- Rating distribution (1-5 stars)

### ✅ Review Management
- Create new reviews
- Update existing reviews
- Delete reviews
- Mark reviews as helpful

### ✅ User Review System
- Review other users
- User rating statistics
- Review verification system

## Database Schema Summary

```
property_reviews:
├── userId (String) - Who wrote the review
├── userName (String) - Reviewer's name
├── userAvatar (String) - Reviewer's avatar
├── propertyId (String) - Which property
├── propertyName (String) - Property name
├── rating (Integer) - 1-5 stars
├── title (String) - Review title
├── comment (String) - Review text
├── helpful (Integer) - Helpful votes
├── verified (Boolean) - Verified status
├── createdAt (DateTime) - Creation time
└── updatedAt (DateTime) - Last update

user_reviews:
├── reviewerId (String) - Who wrote the review
├── reviewerName (String) - Reviewer's name
├── reviewerAvatar (String) - Reviewer's avatar
├── userId (String) - Who is being reviewed
├── rating (Integer) - 1-5 stars
├── title (String) - Review title
├── comment (String) - Review text
├── helpful (Integer) - Helpful votes
├── verified (Boolean) - Verified status
├── createdAt (DateTime) - Creation time
└── updatedAt (DateTime) - Last update
```

## Testing the System

1. **Check Property Ratings**: Visit any property page to see real ratings
2. **Create Reviews**: Use the review form to add new reviews
3. **View Review Stats**: Check that statistics are calculated correctly
4. **Test User Reviews**: Review other users in the system

## Troubleshooting

- **No ratings showing**: Check if collections exist and have data
- **Permission errors**: Ensure collections have proper read/write permissions
- **Import errors**: Make sure all required functions are imported correctly

The rating system is now fully integrated with the database and will show real ratings and reviews from your Appwrite database!
