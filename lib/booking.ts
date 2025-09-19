import { databases, ID, Query } from './appwrite';

export interface Booking {
  $id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyImage: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  bookingDate: string;
  bookingTime: string;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  currency: string;
  guests: number;
  specialRequests?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSlot {
  date: string;
  time: string;
  available: boolean;
  bookingId?: string;
}

// Create a new booking
export async function createBooking({
  userId,
  propertyId,
  propertyName,
  propertyAddress,
  propertyImage,
  ownerId,
  ownerName,
  ownerEmail,
  ownerPhone,
  bookingDate,
  bookingTime,
  duration = 60,
  totalAmount,
  currency = 'USD',
  guests = 1,
  specialRequests
}: {
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyImage: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  bookingDate: string;
  bookingTime: string;
  duration?: number;
  totalAmount: number;
  currency?: string;
  guests?: number;
  specialRequests?: string;
}) {
  try {
    const booking = await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      ID.unique(),
      {
        userId,
        propertyId,
        propertyName,
        propertyAddress,
        propertyImage,
        ownerId,
        ownerName,
        ownerEmail,
        ownerPhone,
        bookingDate,
        bookingTime,
        duration,
        status: 'pending',
        totalAmount,
        currency,
        guests,
        specialRequests: specialRequests || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return { success: true, data: booking };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

// Get user's bookings
export async function getUserBookings(userId: string, limit: number = 50) {
  try {
    const bookings = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(limit)
      ]
    );

    return bookings.documents as Booking[];
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
}

// Get property owner's bookings
export async function getOwnerBookings(ownerId: string, limit: number = 50) {
  try {
    const bookings = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      [
        Query.equal("ownerId", ownerId),
        Query.orderDesc("createdAt"),
        Query.limit(limit)
      ]
    );

    return bookings.documents as Booking[];
  } catch (error: any) {
    console.error("Error fetching owner bookings:", error);
    throw error;
  }
}

// Get booking by ID
export async function getBookingById(bookingId: string) {
  try {
    const booking = await databases.getDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      bookingId
    );

    return booking as Booking;
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    throw error;
  }
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: Booking['status'], cancellationReason?: string) {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const booking = await databases.updateDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      bookingId,
      updateData
    );

    return { success: true, data: booking };
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}

// Cancel booking
export async function cancelBooking(bookingId: string, reason: string) {
  try {
    return await updateBookingStatus(bookingId, 'cancelled', reason);
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
}

// Confirm booking
export async function confirmBooking(bookingId: string) {
  try {
    return await updateBookingStatus(bookingId, 'confirmed');
  } catch (error: any) {
    console.error("Error confirming booking:", error);
    throw error;
  }
}

// Get available booking slots for a property
export async function getAvailableBookingSlots(propertyId: string, date: string) {
  try {
    // Get existing bookings for the date
    const existingBookings = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      [
        Query.equal("propertyId", propertyId),
        Query.equal("bookingDate", date),
        Query.notEqual("status", "cancelled")
      ]
    );

    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const timeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isBooked = existingBookings.documents.some(booking => 
          booking.bookingTime === timeString
        );
        
        timeSlots.push({
          date,
          time: timeString,
          available: !isBooked,
          bookingId: isBooked ? existingBookings.documents.find(b => b.bookingTime === timeString)?.$id : undefined
        });
      }
    }

    return timeSlots as BookingSlot[];
  } catch (error: any) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
}

// Check if a specific time slot is available
export async function isTimeSlotAvailable(propertyId: string, date: string, time: string) {
  try {
    const existingBooking = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "bookings",
      [
        Query.equal("propertyId", propertyId),
        Query.equal("bookingDate", date),
        Query.equal("bookingTime", time),
        Query.notEqual("status", "cancelled")
      ]
    );

    return existingBooking.documents.length === 0;
  } catch (error: any) {
    console.error("Error checking slot availability:", error);
    throw error;
  }
}
