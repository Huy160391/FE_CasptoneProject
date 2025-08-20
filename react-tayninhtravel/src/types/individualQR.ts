// 🎫 INDIVIDUAL QR SYSTEM - TypeScript Interfaces
// Generated for Individual QR Implementation

// ===== GUEST INFORMATION =====

export interface GuestInfoRequest {
  guestName: string;      // Required, 2-100 chars
  guestEmail: string;     // Required, unique trong booking, valid email
  guestPhone?: string;    // Optional, max 20 chars, phone format
}

export interface TourBookingGuest {
  id: string;
  tourBookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  isCheckedIn: boolean;
  checkInTime?: string;   // ISO date string
  checkInNotes?: string;
  qrCodeData?: string;    // ✅ NEW: Individual QR code
  createdAt: string;
}

// ===== BOOKING REQUESTS =====

export interface CreateTourBookingRequest {
  tourOperationId?: string;  // Optional - auto-detected từ tourSlotId
  tourSlotId: string;        // Required - slot cụ thể user chọn
  numberOfGuests: number;    // Required, 1-50, phải = guests.length
  contactPhone?: string;     // Optional, max 20 chars
  specialRequests?: string;  // Optional, max 500 chars
  guests: GuestInfoRequest[]; // ✅ NEW: Required, min 1 guest
}

export interface CalculatePriceRequest {
  tourOperationId: string;
  numberOfGuests: number;
  bookingDate?: string; // ISO date string
}

// ===== BOOKING RESPONSES =====

export interface TourBookingDto {
  id: string;
  tourOperationId?: string;
  userId: string;
  numberOfGuests: number;
  originalPrice: number;
  discountPercent: number;
  totalPrice: number;
  status: string;
  statusName: string;
  bookingCode: string;
  payOsOrderCode?: string;
  qrCodeData?: string;        // ⚠️ LEGACY: Deprecated, use guests[].qrCodeData
  bookingDate: string;
  confirmedDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  customerNotes?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  guests: TourBookingGuest[];  // ✅ NEW: Individual guests với QR codes
  tourOperation?: TourOperationSummary;
  user?: UserSummary;
}

export interface CreateBookingResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    bookingCode: string;
    payOsOrderCode: string;
    status: string;
    numberOfGuests: number;
    totalPrice: number;
    checkoutUrl: string;
    guests: TourBookingGuest[];
  };
  success: boolean;
}

// ===== TOUR GUIDE CHECK-IN =====

export interface CheckInGuestByQRRequest {
  qrCodeData: string;              // Required, max 2000 chars
  notes?: string;                  // Optional, max 500 chars
  overrideTimeRestriction?: boolean; // Default: false
  customCheckInTime?: string;      // ISO date string, optional
}

export interface BulkCheckInGuestsRequest {
  guestIds: string[];              // Required, min 1, max 50
  notes?: string;                  // Optional, max 500 chars
  customCheckInTime?: string;      // ISO date string, optional
  overrideTimeRestriction?: boolean; // Default: false
}

export interface TourSlotGuestsResponse {
  statusCode: number;
  message: string;
  data: {
    tourSlotId: string;
    tourSlotDate: string;
    totalGuests: number;
    checkedInGuests: number;
    pendingGuests: number;
    guests: Array<{
      id: string;
      guestName: string;
      guestEmail: string;
      guestPhone?: string;
      isCheckedIn: boolean;
      checkInTime?: string;
      checkInNotes?: string;
      bookingCode: string;
      bookingId: string;
      customerName: string;
      totalGuests: number;
    }>;
  };
  success: boolean;
}

export interface CheckInResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    guestName: string;
    guestEmail: string;
    isCheckedIn: boolean;
    checkInTime: string;
    checkInNotes?: string;
    bookingCode: string;
    tourSlotDate?: string;
  };
  success: boolean;
}

export interface BulkCheckInResponse {
  statusCode: number;
  message: string;
  data: {
    updatedCount: number;
    checkInTime: string;
    checkedInGuests: Array<{
      id: string;
      guestName: string;
      guestEmail: string;
      checkInTime: string;
      bookingCode: string;
    }>;
  };
  success: boolean;
}

// ===== ENUMS =====

export enum BookingStatus {
  // Đã chuyển sang dùng string, enum này không còn dùng nữa
}

// ===== SUPPORTING TYPES =====

export interface TourOperationSummary {
  id: string;
  tourDetailsId: string;
  tourTitle: string;
  price: number;
  maxGuests: number;
  currentBookings: number;
  tourStartDate: string;
  tourSlotDate?: string;
  guideId?: string;
  guideName?: string;
  guidePhone?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

// ===== API RESPONSE WRAPPER =====

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

// ===== ERROR TYPES =====

export interface ValidationError {
  field: string;
  errors: string[];
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
  success: false;
}

// ===== LEGACY COMPATIBILITY =====

/**
 * @deprecated Use TourBookingGuest.qrCodeData instead
 * Legacy booking QR code - will be removed in future version
 */
export interface LegacyBookingQR {
  qrCodeData?: string;
}

/**
 * Migration helper - check if booking uses new individual QR system
 */
export const hasIndividualQRs = (booking: TourBookingDto): boolean => {
  return booking.guests && booking.guests.length > 0 &&
    booking.guests.some(guest => guest.qrCodeData);
};

/**
 * Get all QR codes from booking (individual + legacy)
 */
export const getAllQRCodes = (booking: TourBookingDto): string[] => {
  const qrCodes: string[] = [];

  // Individual QR codes (preferred)
  booking.guests?.forEach(guest => {
    if (guest.qrCodeData) {
      qrCodes.push(guest.qrCodeData);
    }
  });

  // Legacy booking QR (fallback)
  if (qrCodes.length === 0 && booking.qrCodeData) {
    qrCodes.push(booking.qrCodeData);
  }

  return qrCodes;
};
