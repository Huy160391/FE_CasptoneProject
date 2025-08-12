// 🎫 INDIVIDUAL QR SYSTEM - API Service
// Service layer cho Individual QR System APIs

import { 
  CreateTourBookingRequest, 
  CreateBookingResponse,
  TourBookingDto,
  CalculatePriceRequest,
  CheckInGuestByQRRequest,
  BulkCheckInGuestsRequest,
  TourSlotGuestsResponse,
  CheckInResponse,
  BulkCheckInResponse,
  ApiResponse,
  PaginatedResponse
} from '../types/individualQR';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5267';

// ===== AUTHENTICATION HELPER =====

const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});

// ===== USER BOOKING SERVICES =====

export class IndividualQRBookingService {
  
  /**
   * Get available tours for booking
   */
  static async getAvailableTours(
    token: string,
    pageIndex = 1, 
    pageSize = 10
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await fetch(
      `${API_BASE}/api/UserTourBooking/available-tours?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * Get tour details với available slots
   */
  static async getTourDetails(
    token: string,
    tourDetailsId: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/UserTourBooking/tour-details/${tourDetailsId}`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * Calculate tour price với early bird discount
   */
  static async calculatePrice(
    token: string,
    request: CalculatePriceRequest
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/UserTourBooking/calculate-price`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(request)
      }
    );
    return response.json();
  }

  /**
   * ✅ NEW: Create booking với individual guests
   * Tạo booking với thông tin từng guest để generate individual QR codes
   */
  static async createBooking(
    token: string,
    request: CreateTourBookingRequest
  ): Promise<CreateBookingResponse> {
    const response = await fetch(
      `${API_BASE}/api/UserTourBooking/create-booking`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(request)
      }
    );
    return response.json();
  }

  /**
   * ✅ UPDATED: Get user bookings including individual guests
   */
  static async getMyBookings(
    token: string,
    pageIndex = 1,
    pageSize = 10
  ): Promise<ApiResponse<PaginatedResponse<TourBookingDto>>> {
    const response = await fetch(
      `${API_BASE}/api/UserTourBooking/my-bookings?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * ✅ UPDATED: Get booking details including individual guests
   */
  static async getBookingDetails(
    token: string,
    bookingId: string
  ): Promise<ApiResponse<TourBookingDto>> {
    const response = await fetch(
      `${API_BASE}/api/UserTourBooking/booking-details/${bookingId}`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(
    token: string,
    bookingId: string,
    reason?: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/UserTourBooking/cancel-booking/${bookingId}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ cancellationReason: reason })
      }
    );
    return response.json();
  }
}

// ===== PAYMENT SERVICES =====

export class PaymentService {
  
  /**
   * Handle payment success callback
   */
  static async handlePaymentSuccess(
    token: string,
    orderCode: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/tour-booking-payment/payment-success/${orderCode}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * Handle payment cancellation
   */
  static async handlePaymentCancel(
    token: string,
    orderCode: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/tour-booking-payment/payment-cancel/${orderCode}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * Lookup payment status
   */
  static async lookupPayment(
    token: string,
    payOsOrderCode: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/tour-booking-payment/lookup/${payOsOrderCode}`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }
}

// ===== TOUR GUIDE SERVICES =====

export class TourGuideService {
  
  /**
   * ✅ NEW: Get guests trong tour slot cho check-in
   */
  static async getTourSlotGuests(
    token: string,
    tourSlotId: string
  ): Promise<TourSlotGuestsResponse> {
    const response = await fetch(
      `${API_BASE}/api/TourGuide/tour-slot/${tourSlotId}/guests`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * ✅ NEW: Check-in individual guest bằng QR code
   */
  static async checkInGuestByQR(
    token: string,
    request: CheckInGuestByQRRequest
  ): Promise<CheckInResponse> {
    const response = await fetch(
      `${API_BASE}/api/TourGuide/check-in-guest-qr`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(request)
      }
    );
    return response.json();
  }

  /**
   * ✅ NEW: Bulk check-in multiple guests
   */
  static async bulkCheckInGuests(
    token: string,
    request: BulkCheckInGuestsRequest
  ): Promise<BulkCheckInResponse> {
    const response = await fetch(
      `${API_BASE}/api/TourGuide/bulk-check-in-guests`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(request)
      }
    );
    return response.json();
  }

  /**
   * 🔄 LEGACY: Check-in booking (backward compatibility)
   */
  static async checkInBooking(
    token: string,
    bookingId: string,
    notes?: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/TourGuide/checkin/${bookingId}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ notes })
      }
    );
    return response.json();
  }

  /**
   * Get tour guide active tours
   */
  static async getMyActiveTours(
    token: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/TourGuide/my-active-tours`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }

  /**
   * 🔄 LEGACY: Get tour bookings (backward compatibility)
   */
  static async getTourBookings(
    token: string,
    operationId: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(
      `${API_BASE}/api/TourGuide/tour/${operationId}/bookings`,
      {
        headers: getAuthHeaders(token)
      }
    );
    return response.json();
  }
}

// ===== UTILITY FUNCTIONS =====

export class QRCodeUtils {
  
  /**
   * Check if booking has individual QR codes
   */
  static hasIndividualQRs(booking: TourBookingDto): boolean {
    return booking.guests && booking.guests.length > 0 && 
           booking.guests.some(guest => guest.qrCodeData);
  }

  /**
   * Get all QR codes from booking (individual + legacy)
   */
  static getAllQRCodes(booking: TourBookingDto): string[] {
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
  }

  /**
   * Get checked-in guests count
   */
  static getCheckedInCount(booking: TourBookingDto): number {
    return booking.guests?.filter(guest => guest.isCheckedIn).length || 0;
  }

  /**
   * Get pending guests count
   */
  static getPendingCount(booking: TourBookingDto): number {
    return booking.guests?.filter(guest => !guest.isCheckedIn).length || 0;
  }

  /**
   * Format guest list for display
   */
  static formatGuestNames(booking: TourBookingDto, maxDisplay = 3): string {
    if (!booking.guests || booking.guests.length === 0) {
      return `${booking.numberOfGuests} guests`;
    }

    const names = booking.guests.map(guest => guest.guestName);
    
    if (names.length <= maxDisplay) {
      return names.join(', ');
    }
    
    return `${names.slice(0, maxDisplay).join(', ')} và ${names.length - maxDisplay} người khác`;
  }
}

// ===== VALIDATION HELPERS =====

export class BookingValidation {
  
  /**
   * Validate guest list
   */
  static validateGuestList(guests: GuestInfoRequest[], numberOfGuests: number): string[] {
    const errors: string[] = [];
    
    if (guests.length !== numberOfGuests) {
      errors.push(`Số lượng thông tin khách hàng (${guests.length}) phải khớp với số lượng khách đã chọn (${numberOfGuests})`);
    }
    
    const emails = guests.map(g => g.guestEmail.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      errors.push('Email khách hàng phải unique trong cùng booking');
    }
    
    guests.forEach((guest, index) => {
      if (!guest.guestName || guest.guestName.trim().length < 2) {
        errors.push(`Tên khách hàng thứ ${index + 1} phải có ít nhất 2 ký tự`);
      }
      
      if (!guest.guestEmail || !this.isValidEmail(guest.guestEmail)) {
        errors.push(`Email khách hàng thứ ${index + 1} không hợp lệ`);
      }
    });
    
    return errors;
  }
  
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate phone format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
  }
}
