# 🌐 Offline Development Guide

## 3 Days of Offline Development Setup

This guide will help you continue developing your real estate app for the next 3 days without internet access. The app has been configured with comprehensive sample data that allows you to test all features and develop the UI seamlessly.

## 🚀 Quick Start

The offline data system is automatically initialized when the app starts. You don't need to run any additional commands - just start developing!

```bash
# Start your development server
npm start
# or
expo start
```

## 📊 Sample Data Overview

### Properties (50 listings)
- **Mix of Sale/Rent**: 25 properties for sale, 25 for rent
- **Property Types**: Houses, Apartments, Villas, Condos, Duplexes, Studios, Townhomes
- **Realistic Data**: Philippine addresses, pricing in PHP, local amenities
- **Images**: Local assets + Unsplash placeholders
- **Features**: Full property details, amenities, contact info, coordinates

### Users (3 profiles)
- **John Doe**: Tenant profile with preferences
- **Maria Santos**: Owner profile with property listings
- **Carlos Rodriguez**: Tenant profile with different preferences

### Bookings (20 bookings)
- **Past Bookings**: Completed and cancelled bookings
- **Future Bookings**: Pending and confirmed bookings
- **Time Slots**: 9 AM to 5 PM, 30-minute intervals
- **Status Tracking**: Pending, confirmed, completed, cancelled

### Reviews (30 reviews)
- **Property Reviews**: 1-5 star ratings with detailed feedback
- **Realistic Content**: Authentic review text and user names
- **Property Association**: Reviews linked to specific properties

### Chat System
- **Conversations**: Sample chat threads between users and owners
- **Messages**: Realistic message history with timestamps
- **Property Context**: Chats linked to specific property listings

### Additional Data
- **Saved Properties**: Sample saved/favorited properties
- **Notifications**: Sample notification data
- **User Preferences**: Property type preferences, budget ranges

## 🎯 Available Features

### ✅ Property Management
- Browse all 50 properties with images and details
- Search properties by name, location, amenities
- Filter by property type, price range, bedrooms, bathrooms
- View detailed property information
- Property image galleries

### ✅ Booking System
- View booking calendar and time slots
- Create new bookings (stored offline)
- Manage booking status (pending, confirmed, completed, cancelled)
- Booking history and details

### ✅ Review System
- View property reviews and ratings
- Add new reviews (stored offline)
- Review management and display

### ✅ Chat System
- View chat conversations
- Send and receive messages (stored offline)
- Property-specific chat threads

### ✅ User Features
- User profiles and preferences
- Saved/favorited properties
- Notification system
- Account management

### ✅ Search & Filter
- Text search across properties
- Advanced filtering options
- Location-based search
- Amenity-based filtering

## 🛠️ Development Workflow

### 1. UI Development
```typescript
// All UI components work with sample data
import { useOfflineProperties } from '@/lib/useOfflineDataProvider';

function PropertyList() {
  const { properties, loading, error } = useOfflineProperties();
  // Your UI code here
}
```

### 2. Feature Testing
```typescript
// Test booking functionality
import { useOfflineDataProvider } from '@/lib/useOfflineDataProvider';

function BookingComponent() {
  const { addBooking, getBookings } = useOfflineDataProvider();
  // Your booking logic here
}
```

### 3. Data Management
```typescript
// Access offline data directly
import { offlineDataProvider } from '@/lib/offline-data-provider';

// Get properties with filters
const properties = await offlineDataProvider.getProperties({
  propertyType: 'rent',
  minPrice: 10000,
  maxPrice: 30000
});
```

## 📱 Testing Scenarios

### Property Browsing
1. Open the explore tab
2. Browse through different property types
3. Test search functionality
4. Try different filters
5. View property details

### Booking System
1. Select a property
2. Choose a date and time
3. Create a booking
4. View booking confirmation
5. Check booking history

### Review System
1. View property reviews
2. Add a new review
3. Check review ratings
4. Test review display

### Chat System
1. Open chat conversations
2. Send messages
3. View message history
4. Test property-specific chats

### User Features
1. Check user profile
2. View saved properties
3. Test notifications
4. Update preferences

## 🔧 Technical Details

### Data Storage
- **AsyncStorage**: All data stored locally on device
- **Persistence**: Data persists between app restarts
- **Performance**: Fast local data access
- **Size**: Optimized data structure for mobile

### Data Structure
```typescript
interface Property {
  $id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  image: string;
  images: string[];
  propertyType: 'sell' | 'rent';
  // ... more fields
}
```

### Offline Data Provider
```typescript
// Get properties with filtering
const result = await offlineDataProvider.getProperties({
  propertyType: 'rent',
  minPrice: 10000,
  maxPrice: 30000
});

// Search properties
const searchResults = await offlineDataProvider.searchProperties('villa');

// Add new booking
const booking = await offlineDataProvider.addBooking({
  userId: 'user_1',
  propertyId: 'prop_1',
  bookingDate: '2024-02-15',
  bookingTime: '10:00'
});
```

## 🎨 UI Development Tips

### 1. Use Offline Hooks
```typescript
// For property lists
const { properties, loading, error } = useOfflineProperties();

// For single property
const { property, loading, error } = useOfflineProperty(propertyId);

// For bookings
const { bookings, loading, error } = useOfflineBookings(userId);
```

### 2. Handle Loading States
```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <PropertyList properties={properties} />;
```

### 3. Test Different Data Scenarios
- Empty states (no properties found)
- Loading states (data fetching)
- Error states (network issues)
- Success states (data loaded)

## 📋 Development Checklist

### Day 1: Core Features
- [ ] Property browsing and search
- [ ] Property details and images
- [ ] Basic filtering functionality
- [ ] User profile management

### Day 2: Advanced Features
- [ ] Booking system and calendar
- [ ] Review system and ratings
- [ ] Chat system and messages
- [ ] Saved properties functionality

### Day 3: Polish & Testing
- [ ] Notification system
- [ ] Advanced search and filters
- [ ] UI/UX improvements
- [ ] Performance optimization

## 🚨 Troubleshooting

### Data Not Loading
```typescript
// Check if offline data is initialized
import { offlineDataProvider } from '@/lib/offline-data-provider';

const stats = await offlineDataProvider.getDataStats();
console.log('Data stats:', stats);
```

### Clear Offline Data
```typescript
// Reset all offline data
await offlineDataProvider.clearOfflineData();
```

### Check Online Status
```typescript
import { isOnline } from '@/lib/offline-sync';

if (isOnline()) {
  // Use online data
} else {
  // Use offline data
}
```

## 📞 Support

If you encounter any issues during offline development:

1. **Check Console Logs**: Look for initialization messages
2. **Verify Data**: Use the data stats to confirm data is loaded
3. **Clear Cache**: Clear offline data if needed
4. **Restart App**: Sometimes a fresh start helps

## 🎉 Success!

With this setup, you can:
- ✅ Develop all UI components
- ✅ Test all app features
- ✅ Work on user experience
- ✅ Implement new functionality
- ✅ Debug and optimize
- ✅ Prepare for online sync

**Happy coding for the next 3 days! 🚀**
