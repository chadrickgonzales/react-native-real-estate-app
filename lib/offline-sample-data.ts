import { propertiesImages } from './data';

// Comprehensive offline sample data for 3 days of development
export const OFFLINE_SAMPLE_DATA = {
  // Sample Users
  users: [
    {
      $id: 'user_1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+63-912-345-6789',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      role: 'tenant',
      preferences: {
        propertyTypes: ['House', 'Apartment'],
        maxPrice: 25000,
        minBedrooms: 2,
        location: 'Tarlac City'
      }
    },
    {
      $id: 'user_2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+63-917-234-5678',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      role: 'owner',
      preferences: {
        propertyTypes: ['House', 'Villa'],
        maxPrice: 5000000,
        minBedrooms: 3,
        location: 'Tarlac City'
      }
    },
    {
      $id: 'user_3',
      name: 'Carlos Rodriguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+63-918-345-6789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: 'tenant',
      preferences: {
        propertyTypes: ['Studio', 'Apartment'],
        maxPrice: 15000,
        minBedrooms: 1,
        location: 'Tarlac City'
      }
    }
  ],

  // Sample Properties (50 properties)
  properties: [
    {
      $id: 'prop_1',
      name: 'Casa Grande de Tarlac',
      type: 'House',
      description: 'Beautiful 3-bedroom house with modern amenities, perfect for families. Features a spacious living area, modern kitchen, and a lovely garden.',
      address: '123 Rizal St, Tarlac City, Tarlac',
      price: 25000,
      area: 1200,
      bedrooms: 3,
      bathrooms: 2,
      rating: 4.8,
      image: propertiesImages[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
      images: JSON.stringify([
        propertiesImages[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=300&fit=crop'
      ]),
      propertyType: 'rent',
      availableDate: '2024-02-01',
      contactPhone: '+63-912-345-6789',
      contactEmail: 'owner1@email.com',
      ownerId: 'owner_1',
      ownerName: 'Juan Dela Cruz',
      latitude: 15.4869,
      longitude: 120.5986,
      furnishedStatus: true,
      petFriendly: true,
      hasHOA: false,
      hasPool: false,
      hasGarage: true,
      utilitiesIncluded: true,
      smokingAllowed: false,
      backgroundCheckRequired: true,
      propertyAge: '5',
      parkingSpaces: '2',
      yearBuilt: '2019',
      lotSize: '5000',
      propertyCondition: 'Excellent',
      amenities: 'WiFi, Air Conditioning, Parking, Garden, Security',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      $id: 'prop_2',
      name: 'Villa Moderna de San Miguel',
      type: 'Villa',
      description: 'Luxurious villa with 4 bedrooms, swimming pool, and premium amenities. Perfect for large families or as an investment property.',
      address: '456 Burgos Ave, Tarlac City, Tarlac',
      price: 4500000,
      area: 2500,
      bedrooms: 4,
      bathrooms: 3,
      rating: 4.9,
      image: propertiesImages[1] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      images: JSON.stringify([
        propertiesImages[1] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop'
      ]),
      propertyType: 'sell',
      availableDate: '2024-01-20',
      contactPhone: '+63-917-234-5678',
      contactEmail: 'owner2@email.com',
      ownerId: 'owner_2',
      ownerName: 'Maria Santos',
      latitude: 15.4875,
      longitude: 120.5990,
      furnishedStatus: false,
      petFriendly: true,
      hasHOA: true,
      hasPool: true,
      hasGarage: true,
      utilitiesIncluded: false,
      smokingAllowed: false,
      backgroundCheckRequired: false,
      propertyAge: '2',
      parkingSpaces: '3',
      yearBuilt: '2022',
      lotSize: '8000',
      propertyCondition: 'New',
      amenities: 'Swimming Pool, Gym, Security, Garden, WiFi, Air Conditioning',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z'
    },
    {
      $id: 'prop_3',
      name: 'Residence Elite de Rizal',
      type: 'Apartment',
      description: 'Modern 2-bedroom apartment in the heart of Tarlac City. Features contemporary design, high-speed internet, and 24/7 security.',
      address: '789 Mabini Rd, Tarlac City, Tarlac',
      price: 18000,
      area: 800,
      bedrooms: 2,
      bathrooms: 1,
      rating: 4.5,
      image: propertiesImages[2] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
      images: JSON.stringify([
        propertiesImages[2] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
      ]),
      propertyType: 'rent',
      availableDate: '2024-02-15',
      contactPhone: '+63-918-345-6789',
      contactEmail: 'owner3@email.com',
      ownerId: 'owner_3',
      ownerName: 'Pedro Rodriguez',
      latitude: 15.4870,
      longitude: 120.5988,
      furnishedStatus: true,
      petFriendly: false,
      hasHOA: true,
      hasPool: false,
      hasGarage: false,
      utilitiesIncluded: true,
      smokingAllowed: false,
      backgroundCheckRequired: true,
      propertyAge: '3',
      parkingSpaces: '1',
      yearBuilt: '2021',
      lotSize: '3000',
      propertyCondition: 'Good',
      amenities: 'WiFi, Air Conditioning, Security, Elevator, Near Public Transport',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:15:00Z'
    }
  ],

  // Sample Bookings
  bookings: [
    {
      $id: 'booking_1',
      userId: 'user_1',
      propertyId: 'prop_1',
      propertyName: 'Casa Grande de Tarlac',
      propertyAddress: '123 Rizal St, Tarlac City, Tarlac',
      propertyImage: propertiesImages[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
      ownerId: 'owner_1',
      ownerName: 'Juan Dela Cruz',
      ownerEmail: 'owner1@email.com',
      ownerPhone: '+63-912-345-6789',
      bookingDate: '2024-02-15',
      bookingTime: '10:00',
      duration: 60,
      status: 'confirmed',
      totalAmount: 25000,
      currency: 'PHP',
      guests: 2,
      specialRequests: 'Need parking for 1 car',
      cancellationReason: '',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z'
    },
    {
      $id: 'booking_2',
      userId: 'user_2',
      propertyId: 'prop_2',
      propertyName: 'Villa Moderna de San Miguel',
      propertyAddress: '456 Burgos Ave, Tarlac City, Tarlac',
      propertyImage: propertiesImages[1] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      ownerId: 'owner_2',
      ownerName: 'Maria Santos',
      ownerEmail: 'owner2@email.com',
      ownerPhone: '+63-917-234-5678',
      bookingDate: '2024-02-20',
      bookingTime: '14:00',
      duration: 90,
      status: 'pending',
      totalAmount: 4500000,
      currency: 'PHP',
      guests: 4,
      specialRequests: 'Interested in purchasing',
      cancellationReason: '',
      createdAt: '2024-01-22T14:30:00Z',
      updatedAt: '2024-01-22T14:30:00Z'
    }
  ],

  // Sample Reviews
  reviews: [
    {
      $id: 'review_1',
      propertyId: 'prop_1',
      userId: 'user_1',
      userName: 'John Doe',
      rating: 5,
      reviewText: 'Excellent property! Very clean and well-maintained. The owner was very responsive and helpful throughout our stay.',
      createdAt: '2024-01-25T16:00:00Z'
    },
    {
      $id: 'review_2',
      propertyId: 'prop_2',
      userId: 'user_2',
      userName: 'Maria Santos',
      rating: 4,
      reviewText: 'Beautiful villa with amazing amenities. The swimming pool and garden are perfect for families. Highly recommended!',
      createdAt: '2024-01-28T11:30:00Z'
    },
    {
      $id: 'review_3',
      propertyId: 'prop_3',
      userId: 'user_3',
      userName: 'Carlos Rodriguez',
      rating: 4,
      reviewText: 'Great location and modern facilities. The apartment is exactly as described in the listing. Will definitely book again.',
      createdAt: '2024-01-30T09:45:00Z'
    }
  ],

  // Sample Chat Conversations
  chatConversations: [
    {
      $id: 'chat_1',
      participants: ['user_1', 'owner_1'],
      propertyId: 'prop_1',
      propertyName: 'Casa Grande de Tarlac',
      lastMessage: 'Thank you for the quick response!',
      lastMessageTime: '2024-01-25T16:30:00Z',
      unreadCount: 0,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-25T16:30:00Z'
    },
    {
      $id: 'chat_2',
      participants: ['user_2', 'owner_2'],
      propertyId: 'prop_2',
      propertyName: 'Villa Moderna de San Miguel',
      lastMessage: 'I am interested in scheduling a viewing.',
      lastMessageTime: '2024-01-28T14:15:00Z',
      unreadCount: 1,
      createdAt: '2024-01-22T14:30:00Z',
      updatedAt: '2024-01-28T14:15:00Z'
    }
  ],

  // Sample Chat Messages
  chatMessages: [
    {
      $id: 'msg_1',
      chatId: 'chat_1',
      senderId: 'user_1',
      senderName: 'John Doe',
      message: 'Hi! I am interested in renting this property. Is it still available?',
      timestamp: '2024-01-20T10:00:00Z',
      type: 'text'
    },
    {
      $id: 'msg_2',
      chatId: 'chat_1',
      senderId: 'owner_1',
      senderName: 'Juan Dela Cruz',
      message: 'Hello! Yes, the property is still available. When would you like to schedule a viewing?',
      timestamp: '2024-01-20T10:05:00Z',
      type: 'text'
    },
    {
      $id: 'msg_3',
      chatId: 'chat_1',
      senderId: 'user_1',
      senderName: 'John Doe',
      message: 'Thank you for the quick response!',
      timestamp: '2024-01-25T16:30:00Z',
      type: 'text'
    },
    {
      $id: 'msg_4',
      chatId: 'chat_2',
      senderId: 'user_2',
      senderName: 'Maria Santos',
      message: 'I am interested in scheduling a viewing.',
      timestamp: '2024-01-28T14:15:00Z',
      type: 'text'
    }
  ],

  // Sample Saved Properties
  savedProperties: [
    {
      $id: 'saved_1',
      userId: 'user_1',
      propertyId: 'prop_1',
      savedAt: '2024-01-20T10:00:00Z'
    },
    {
      $id: 'saved_2',
      userId: 'user_1',
      propertyId: 'prop_2',
      savedAt: '2024-01-22T14:30:00Z'
    },
    {
      $id: 'saved_3',
      userId: 'user_2',
      propertyId: 'prop_3',
      savedAt: '2024-01-25T16:00:00Z'
    }
  ],

  // Sample Notifications
  notifications: [
    {
      $id: 'notif_1',
      userId: 'user_1',
      title: 'Booking Confirmed',
      message: 'Your booking for Casa Grande de Tarlac has been confirmed for February 15, 2024 at 10:00 AM.',
      type: 'booking',
      read: false,
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      $id: 'notif_2',
      userId: 'user_1',
      title: 'New Message',
      message: 'You have a new message from Juan Dela Cruz regarding Casa Grande de Tarlac.',
      type: 'message',
      read: false,
      createdAt: '2024-01-25T16:30:00Z'
    },
    {
      $id: 'notif_3',
      userId: 'user_2',
      title: 'Property Viewing Request',
      message: 'Maria Santos has requested a viewing for Villa Moderna de San Miguel.',
      type: 'viewing',
      read: true,
      createdAt: '2024-01-28T14:15:00Z'
    }
  ]
};

// Generate additional properties to reach 50 total
export function generateAdditionalProperties(): any[] {
  const additionalProperties = [];
  const propertyTypes = ['House', 'Apartment', 'Villa', 'Condos', 'Duplexes', 'Studios', 'Townhomes'];
  const propertyConditions = ['New', 'Excellent', 'Good', 'Fair', 'Needs Renovation'];
  const amenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Balcony', 'Garden', 'Security',
    'Elevator', 'Air Conditioning', 'Heating', 'Dishwasher', 'Washing Machine',
    'Dryer', 'WiFi', 'Cable TV', 'Pet Friendly', 'Furnished', 'Unfurnished',
    'Near Public Transport', 'Shopping Center', 'School Nearby'
  ];
  const streets = [
    'Rizal St', 'Burgos Ave', 'Mabini Rd', 'Luna St', 'Bonifacio Ave', 'Quezon Blvd',
    'Tarlac-MacArthur Hwy', 'San Miguel St', 'San Nicolas Ave', 'San Sebastian Rd'
  ];
  const ownerNames = [
    'Juan Dela Cruz', 'Maria Santos', 'Pedro Rodriguez', 'Ana Garcia',
    'Carlos Lopez', 'Isabella Martinez', 'Miguel Torres', 'Sofia Hernandez'
  ];
  const ownerEmails = [
    'juan.delacruz@email.com', 'maria.santos@email.com', 'pedro.rodriguez@email.com',
    'ana.garcia@email.com', 'carlos.lopez@email.com', 'isabella.martinez@email.com',
    'miguel.torres@email.com', 'sofia.hernandez@email.com'
  ];
  const phoneNumbers = [
    '+63-912-345-6789', '+63-917-234-5678', '+63-918-345-6789', '+63-919-456-7890',
    '+63-920-567-8901', '+63-921-678-9012', '+63-922-789-0123', '+63-923-890-1234'
  ];

  for (let i = 4; i <= 50; i++) {
    const propertyType = Math.random() > 0.5 ? 'rent' : 'sell';
    const selectedPropertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const ownerIndex = Math.floor(Math.random() * ownerNames.length);
    
    // Generate coordinates around Tarlac City
    const baseLat = 15.4869 + (Math.random() - 0.5) * 0.1;
    const baseLng = 120.5986 + (Math.random() - 0.5) * 0.1;
    
    // Available date within next 3 months
    const availableDate = new Date();
    availableDate.setDate(availableDate.getDate() + Math.floor(Math.random() * 90));
    
    // Select random amenities
    const selectedAmenities = amenities
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 3);
    
    // Generate property images
    const propertyImages = [];
    for (let j = 0; j < Math.floor(Math.random() * 3) + 2; j++) {
      const randomImage = propertiesImages[Math.floor(Math.random() * propertiesImages.length)];
      propertyImages.push(randomImage);
    }
    
    const property = {
      $id: `prop_${i}`,
      name: `${selectedPropertyType} ${i} de Tarlac`,
      type: selectedPropertyType,
      description: `Beautiful ${selectedPropertyType} located in a prime area. This property features modern amenities and is perfect for ${propertyType === 'sell' ? 'buyers' : 'renters'} looking for quality living space.`,
      address: `${Math.floor(Math.random() * 999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}, Tarlac City, Tarlac`,
      price: propertyType === 'sell' 
        ? Math.floor(Math.random() * 8000000) + 2000000 // ₱2M - ₱10M for sale
        : Math.floor(Math.random() * 30000) + 10000, // ₱10k - ₱40k for rent
      area: Math.floor(Math.random() * 3000) + 500,
      bedrooms: Math.floor(Math.random() * 5) + 1,
      bathrooms: Math.floor(Math.random() * 4) + 1,
      rating: Math.floor(Math.random() * 5) + 1,
      image: propertyImages[0] || propertiesImages[0],
      images: JSON.stringify(propertyImages),
      propertyType: propertyType,
      availableDate: availableDate.toISOString().split('T')[0],
      contactPhone: phoneNumbers[ownerIndex],
      contactEmail: ownerEmails[ownerIndex],
      ownerId: `owner_${i}`,
      ownerName: ownerNames[ownerIndex],
      latitude: baseLat,
      longitude: baseLng,
      furnishedStatus: Math.random() > 0.7,
      petFriendly: Math.random() > 0.6,
      hasHOA: Math.random() > 0.8,
      hasPool: Math.random() > 0.85,
      hasGarage: Math.random() > 0.5,
      utilitiesIncluded: propertyType === 'rent' && Math.random() > 0.6,
      smokingAllowed: propertyType === 'rent' && Math.random() > 0.8,
      backgroundCheckRequired: propertyType === 'rent' && Math.random() > 0.7,
      propertyAge: (Math.floor(Math.random() * 50) + 1).toString(),
      parkingSpaces: (Math.floor(Math.random() * 4) + 1).toString(),
      yearBuilt: (2024 - Math.floor(Math.random() * 50)).toString(),
      lotSize: (Math.floor(Math.random() * 10000) + 2000).toString(),
      propertyCondition: propertyConditions[Math.floor(Math.random() * propertyConditions.length)],
      amenities: selectedAmenities.join(', '),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    additionalProperties.push(property);
  }
  
  return additionalProperties;
}

// Generate additional bookings
export function generateAdditionalBookings(): any[] {
  const additionalBookings = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  
  for (let i = 3; i <= 20; i++) {
    const propertyId = `prop_${Math.floor(Math.random() * 50) + 1}`;
    const userId = `user_${Math.floor(Math.random() * 3) + 1}`;
    
    // Generate booking date (past and future)
    const bookingDate = new Date();
    const isPastBooking = Math.random() > 0.7; // 30% chance of past booking
    if (isPastBooking) {
      bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 30));
    } else {
      bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30));
    }
    
    // Generate time slot (9 AM to 5 PM, 30-minute intervals)
    const hour = Math.floor(Math.random() * 8) + 9; // 9-16 (9 AM to 4 PM)
    const minute = Math.random() > 0.5 ? 30 : 0;
    const bookingTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Determine status based on date
    let status = 'pending';
    if (isPastBooking) {
      status = Math.random() > 0.2 ? 'completed' : 'cancelled';
    } else {
      status = Math.random() > 0.3 ? 'confirmed' : 'pending';
    }
    
    const booking = {
      $id: `booking_${i}`,
      userId: userId,
      propertyId: propertyId,
      propertyName: `Property ${propertyId}`,
      propertyAddress: `${Math.floor(Math.random() * 999) + 1} Street, Tarlac City`,
      propertyImage: propertiesImages[Math.floor(Math.random() * propertiesImages.length)],
      ownerId: `owner_${Math.floor(Math.random() * 10) + 1}`,
      ownerName: 'Property Owner',
      ownerEmail: `owner${i}@email.com`,
      ownerPhone: `+63-9${Math.floor(Math.random() * 100000000)}`,
      bookingDate: bookingDate.toISOString().split('T')[0],
      bookingTime: bookingTime,
      duration: 60,
      status: status,
      totalAmount: Math.floor(Math.random() * 50000) + 10000,
      currency: 'PHP',
      guests: Math.floor(Math.random() * 4) + 1,
      specialRequests: Math.random() > 0.7 ? 'Need parking for 2 cars' : '',
      cancellationReason: status === 'cancelled' ? 'Schedule conflict' : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    additionalBookings.push(booking);
  }
  
  return additionalBookings;
}

// Generate additional reviews
export function generateAdditionalReviews(): any[] {
  const additionalReviews = [];
  const reviewTexts = [
    "Excellent property! Very clean and well-maintained.",
    "Great location and amazing amenities. Highly recommended!",
    "The property exceeded our expectations. Perfect for families.",
    "Beautiful place with modern facilities. Will definitely book again.",
    "Outstanding service and wonderful property. 5 stars!",
    "Very satisfied with our stay. The property is exactly as described.",
    "Fantastic experience! The owner was very helpful and responsive.",
    "Amazing property with great views. Perfect for a relaxing getaway.",
    "Clean, comfortable, and well-equipped. Highly recommend!",
    "Excellent value for money. The property is in great condition."
  ];
  
  for (let i = 4; i <= 30; i++) {
    const propertyId = `prop_${Math.floor(Math.random() * 50) + 1}`;
    const userId = `user_${Math.floor(Math.random() * 3) + 1}`;
    
    const review = {
      $id: `review_${i}`,
      propertyId: propertyId,
      userId: userId,
      userName: `User${i}`,
      rating: Math.floor(Math.random() * 5) + 1,
      reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      createdAt: new Date().toISOString()
    };
    
    additionalReviews.push(review);
  }
  
  return additionalReviews;
}

// Complete offline dataset
export function getCompleteOfflineData() {
  return {
    users: OFFLINE_SAMPLE_DATA.users,
    properties: [
      ...OFFLINE_SAMPLE_DATA.properties,
      ...generateAdditionalProperties()
    ],
    bookings: [
      ...OFFLINE_SAMPLE_DATA.bookings,
      ...generateAdditionalBookings()
    ],
    reviews: [
      ...OFFLINE_SAMPLE_DATA.reviews,
      ...generateAdditionalReviews()
    ],
    chatConversations: OFFLINE_SAMPLE_DATA.chatConversations,
    chatMessages: OFFLINE_SAMPLE_DATA.chatMessages,
    savedProperties: OFFLINE_SAMPLE_DATA.savedProperties,
    notifications: OFFLINE_SAMPLE_DATA.notifications
  };
}
