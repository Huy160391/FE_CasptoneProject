import axios from "../config/axios";
import { ApiResponse } from "../types/api";
import {
  BookingStatus,
  GuestInfoRequest,
  TourBookingDto,
} from "../types/individualQR";
import { TourDetailsStatus } from "../types/tour";
import { mapStringToStatusEnum } from "../utils/statusMapper";

// ===== TOUR BOOKING TYPES =====

export interface TourDetailsForBooking {
  id: string;
  title: string;
  description?: string;
  imageUrls: string[]; // New field for multiple images
  imageUrl?: string; // Backward compatibility - first image
  skillsRequired?: string;
  createdAt: string;
  startLocation: string;
  endLocation: string;
  tourOperation: TourOperationSummary;
  timeline: TimelineItem[];
  tourDates: TourDate[];
}

export interface TourOperationSummary {
  id: string;
  price: number;
  maxGuests: number;
  tourTitle?: string;
  tourDescription?: string;
  tourDate?: string;
  guideName?: string;
  guidePhone?: string;
  // Legacy fields for backward compatibility
  tourDetailsId?: string;
  currentBookings?: number;
  tourStartDate?: string;
  tourEndDate?: string;
  isActive?: boolean;
}

export interface TimelineItem {
  id: string;
  tourDetailsId: string;
  checkInTime: string;
  activity: string;
  specialtyShopId?: string;
  sortOrder: number;
  specialtyShop?: {
    id: string;
    shopName: string;
    location?: string;
    description?: string;
    representativeName?: string;
    email?: string;
    phoneNumber?: string;
    website?: string;
    businessLicense?: string;
    businessLicenseUrl?: string;
    logoUrl?: string;
    shopType?: string;
    openingHours?: string;
    closingHours?: string;
    rating?: number;
    isShopActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TourDate {
  tourSlotId: string;
  tourDate: string; // DateTime from backend
  scheduleDay: string; // ScheduleDay enum as string from backend
  isAvailable: boolean;
  // Legacy fields for backward compatibility
  date?: string;
  availableSlots?: number;
  bookedSlots?: number;
}

// ✅ NEW: Individual QR System Request (Primary)
export interface CreateTourBookingRequest {
  tourSlotId: string; // Required - slot cụ thể user chọn
  numberOfGuests: number; // Required, 1-50, phải = guests.length
  contactPhone?: string; // Optional, max 20 chars
  specialRequests?: string; // Optional, max 500 chars
  bookingType?: "Individual" | "GroupRepresentative"; // NEW: Booking type
  groupName?: string; // NEW: Group name for GroupRepresentative
  groupDescription?: string; // NEW: Group description for GroupRepresentative
  groupRepresentative?: GuestInfoRequest; // NEW: Representative info for GroupRepresentative
  guests?: GuestInfoRequest[]; // Optional for GroupRepresentative, required for Individual
}

// 🔄 LEGACY: Backward compatibility (Deprecated)
export interface LegacyCreateTourBookingRequest {
  tourOperationId: string;
  numberOfGuests: number; // Tổng số người
  adultCount: number; // Sẽ bằng tổng số người
  childCount: number; // Luôn = 0
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  specialRequests?: string;
  tourSlotId?: string; // ID của slot cụ thể mà user chọn
}

export interface CalculatePriceRequest {
  tourDetailsId: string;
  numberOfGuests: number;
  bookingDate?: string;
}

export interface PriceCalculation {
  tourDetailsId: string;
  tourTitle: string;
  numberOfGuests: number;
  originalPricePerGuest: number;
  totalOriginalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  isEarlyBird: boolean;
  pricingType: string;
  daysSinceCreated: number;
  daysUntilTour: number;
  bookingDate: string;
}

export interface CreateBookingResult {
  success: boolean;
  message: string;
  bookingId?: string;
  bookingCode?: string;
  paymentUrl?: string;
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  pricingType: string;
  bookingDate: string;
  tourStartDate?: string;
}

export interface TourBooking {
  id: string;
  tourOperationId: string;
  userId: string;
  numberOfGuests: number;
  adultCount: number;
  childCount: number;
  originalPrice: number;
  discountPercent: number;
  totalPrice: number;
  status: BookingStatus;
  statusName: string;
  bookingCode: string;
  payOsOrderCode?: string;
  qrCodeData?: string;
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
  updatedAt?: string;
  tourOperation?: TourOperationSummary;
}

// BookingStatus is now imported from individualQR.ts
export { BookingStatus };

// ===== TOUR BOOKING API SERVICES =====

/**
 * Lấy chi tiết tour để booking
 */
export const getTourDetailsForBooking = async (
  tourDetailsId: string
): Promise<ApiResponse<TourDetailsForBooking>> => {
  const response = await axios.get(`/TourDetails/${tourDetailsId}`);
  return response.data;
};

/**
 * Tính giá tour với Early Bird discount
 * Logic backend chính xác:
 * 1. Nếu tour còn > 30 ngày nữa: Early Bird (giảm 25%)
 * 2. Nếu đặt trong 14 ngày đầu sau khi tour được tạo: Early Bird (giảm 25%)
 * 3. Các trường hợp khác: Giá gốc (100%)
 */
export const calculateBookingPrice = async (request: CalculatePriceRequest, token?: string): Promise<ApiResponse<PriceCalculation>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Lấy thông tin tour để tính giá
        const response = await axios.get(`/TourDetails/${request.tourDetailsId}`, { headers });

        if (response.data.success && response.data.data) {
            const tourDetails = response.data.data;
            const pricePerGuest = tourDetails.tourOperation?.price || 0;

            // Tính số ngày từ khi tour được tạo đến hiện tại
            const tourCreatedDate = new Date(tourDetails.createdAt);
            const currentDate = new Date();
            const daysSinceCreated = Math.floor((currentDate.getTime() - tourCreatedDate.getTime()) / (1000 * 60 * 60 * 24));

            // Tính số ngày từ hiện tại đến ngày tour (nếu có tourDate)
            let daysUntilTour = 0;
            let isEarlyBird = false;
            
            // Kiểm tra nếu có tourDate từ tourOperation hoặc tourDates
            const tourDate = tourDetails.tourOperation?.tourDate || 
                           tourDetails.tourDates?.[0]?.tourDate ||
                           request.bookingDate;
            
            if (tourDate) {
                const tourStartDate = new Date(tourDate);
                daysUntilTour = Math.floor((tourStartDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // Condition 1: Tour còn > 30 ngày nữa
                if (daysUntilTour > 30) {
                    isEarlyBird = true;
                }
            }
            
            // Condition 2: Đặt trong 14 ngày đầu sau khi tour được tạo (khớp với backend)
            if (!isEarlyBird && daysSinceCreated <= 14) {
                isEarlyBird = true;
            }
            
            const discountPercent = isEarlyBird ? 25 : 0;

            // Tính giá
            const totalOriginalPrice = pricePerGuest * request.numberOfGuests;
            const discountAmount = (totalOriginalPrice * discountPercent) / 100;
            const finalPrice = totalOriginalPrice - discountAmount;

            return {
                success: true,
                data: {
                    tourDetailsId: request.tourDetailsId,
                    tourTitle: tourDetails.title || '',
                    numberOfGuests: request.numberOfGuests,
                    originalPricePerGuest: pricePerGuest,
                    totalOriginalPrice,
                    discountPercent,
                    discountAmount,
                    finalPrice,
                    isEarlyBird,
                    pricingType: isEarlyBird ? 'Early Bird' : 'Standard',
                    daysSinceCreated,
                    daysUntilTour,
                    bookingDate: new Date().toISOString()
                }
            };
        }

        return {
            success: false,
            message: 'Không tìm thấy thông tin tour'
        };
    } catch (error: any) {
        console.error('Error calculating booking price:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Không thể tính giá tour'
        };
    }
};

/**
 * ✅ NEW: Individual QR System - Tạo booking với guest info (Primary)
 */
export const createTourBooking = async (
  request: CreateTourBookingRequest,
  token: string
): Promise<ApiResponse<CreateBookingResult>> => {
  console.log("Creating booking with Individual QR System:", request);

  // Validate request format
  const validation = validateIndividualQRBookingRequest(request);
  if (!validation.isValid) {
    return {
      success: false,
      message: validation.errors.join(", "),
    };
  }

  try {
    // Try individual QR endpoint first
    const response = await axios.post(
      "/UserTourBooking/create-booking",
      request,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Return raw response - let Enhanced Payment handle what it gets
    console.log("Debug - Individual QR booking response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Individual QR booking failed:", error);
    throw error; // Let the caller handle the error
  }
};

/**
 * 🔄 LEGACY: Backward compatibility support
 */
export const createLegacyTourBooking = async (
  request: LegacyCreateTourBookingRequest,
  token: string
): Promise<ApiResponse<CreateBookingResult>> => {
  console.warn(
    "Using legacy booking system - consider upgrading to Individual QR System"
  );

  // Use the same endpoint but with legacy request format
  const response = await axios.post(
    "/UserTourBooking/create-booking",
    request,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // Transform response to match expected format
  if (response.data.success) {
    const bookingData = response.data.data || response.data;

    console.log("Legacy booking response:", response.data);
    console.log("Legacy bookingData:", bookingData);

    return {
      success: true,
      data: {
        success: true,
        message: response.data.message || "Tạo booking thành công",
        bookingId: bookingData.id || bookingData.bookingId,
        bookingCode: bookingData.bookingCode,
        paymentUrl: bookingData.checkoutUrl || bookingData.paymentUrl,
        originalPrice: bookingData.totalPrice || bookingData.originalPrice || 0,
        discountPercent: bookingData.discountPercent || 0,
        finalPrice: bookingData.totalPrice,
        pricingType: "Legacy",
        bookingDate: bookingData.bookingDate,
        tourStartDate: bookingData.tourOperation?.tourDate,
      },
    };
  }

  return response.data;
};

/**
 * ✅ UPDATED: Lấy danh sách booking với Individual QR support
 */
export const getMyBookings = async (
  token: string,
  params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: BookingStatus;
    searchKeyword?: string;
    includeInactive?: boolean;
  }
): Promise<
  ApiResponse<{
    items: TourBookingDto[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  }>
> => {
  const queryParams = {
    pageIndex: params?.pageIndex || 0,
    pageSize: params?.pageSize || 10,
    ...(params?.status !== undefined && { status: params.status }),
    ...(params?.searchKeyword && { searchKeyword: params.searchKeyword }),
    ...(params?.includeInactive !== undefined && {
      includeInactive: params.includeInactive,
    }),
  };

  const response = await axios.get("/UserTourBooking/my-bookings", {
    headers: { Authorization: `Bearer ${token}` },
    params: queryParams,
  });

  // Transform response to support Individual QR system
  if (response.data.success && response.data.data) {
    return {
      success: true,
      data: {
        items:
          response.data.data.items?.map((booking: any) => ({
            ...booking,
            numberOfGuests: booking.numberOfGuests,
            statusName:
              booking.statusName || getBookingStatusText(booking.status),
            guests: booking.guests || [], // ✅ NEW: Individual guests with QR codes
            tourOperation: booking.tourOperation
              ? {
                  id: booking.tourOperation.id,
                  price: booking.tourOperation.price,
                  maxGuests: booking.tourOperation.maxGuests,
                  tourTitle: booking.tourOperation.tourTitle,
                  tourDescription: booking.tourOperation.tourDescription,
                  tourDate: booking.tourOperation.tourDate,
                  guideName: booking.tourOperation.guideName,
                  guidePhone: booking.tourOperation.guidePhone,
                  // Legacy fields for backward compatibility
                  currentBookings: 0,
                  isActive: true,
                }
              : undefined,
          })) || [],
        totalCount: response.data.data.totalCount || 0,
        pageIndex: response.data.data.pageIndex || 0,
        pageSize: response.data.data.pageSize || 10,
        totalPages: response.data.data.totalPages || 1,
      },
    };
  }

  return response.data;
};

/**
 * Kiểm tra availability của tour (LEGACY - TourOperation capacity)
 * ⚠️ WARNING: This checks total operation capacity, not individual slot capacity
 */
export const checkTourAvailability = async (
  tourOperationId: string,
  numberOfGuests: number,
  token?: string
): Promise<
  ApiResponse<{
    isAvailable: boolean;
    maxGuests: number;
    currentBookings: number;
    availableSlots: number;
    message?: string;
  }>
> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `/TourBooking/operation/${tourOperationId}/capacity`,
    {
      headers,
      params: { requestedGuests: numberOfGuests },
    }
  );

  // Transform response to match expected format
  if (response.data.success && response.data.capacityInfo) {
    const capacityInfo = response.data.capacityInfo;
    return {
      success: true,
      data: {
        isAvailable: capacityInfo.availableCapacity >= numberOfGuests,
        maxGuests: capacityInfo.maxCapacity,
        currentBookings: capacityInfo.bookedCapacity,
        availableSlots: capacityInfo.availableCapacity,
        message: capacityInfo.isFull ? "Tour đã hết chỗ" : undefined,
      },
    };
  }

  return response.data;
};

/**
 * ✅ NEW: Kiểm tra capacity cho TourSlot cụ thể (individual slot capacity)
 * Use this for slot-specific booking validation
 */
export const checkTourSlotCapacity = async (
  slotId: string,
  numberOfGuests: number,
  token?: string
): Promise<
  ApiResponse<{
    isAvailable: boolean;
    maxGuests: number;
    currentBookings: number;
    availableSlots: number;
    message?: string;
  }>
> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  try {
    const response = await axios.get(
      `/TourBooking/slot/${slotId}/capacity`,
      {
        headers,
        params: { requestedGuests: numberOfGuests },
      }
    );

    // Transform response to match expected format
    if (response.data.success && response.data.capacityInfo) {
      const capacityInfo = response.data.capacityInfo;
      return {
        success: true,
        data: {
          isAvailable: response.data.canBook,
          maxGuests: capacityInfo.maxCapacity,
          currentBookings: capacityInfo.bookedCapacity,
          availableSlots: capacityInfo.availableCapacity,
          message: response.data.userMessage,
        },
      };
    }

    return response.data;
  } catch (error: any) {
    console.error('Error checking slot capacity:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kiểm tra capacity slot'
    };
  }
};

/**
 * Lấy danh sách tours có sẵn để booking
 */
export const getAvailableTours = async (params?: {
  pageIndex?: number;
  pageSize?: number;
  destination?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  searchKeyword?: string;
}): Promise<
  ApiResponse<{
    items: TourDetailsForBooking[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  }>
> => {
  const queryParams = {
    pageIndex: params?.pageIndex || 0,
    pageSize: params?.pageSize || 10,
    ...(params?.destination && { destination: params.destination }),
    ...(params?.startDate && { startDate: params.startDate }),
    ...(params?.endDate && { endDate: params.endDate }),
    ...(params?.minPrice && { minPrice: params.minPrice }),
    ...(params?.maxPrice && { maxPrice: params.maxPrice }),
    ...(params?.searchKeyword && { searchKeyword: params.searchKeyword }),
  };

  const response = await axios.get("/TourDetails/paginated", {
    params: queryParams,
  });

  // Transform response to match expected format
  if (response.data.success && response.data.data) {
    // Filter only public tours (status 8) - use statusMapper for consistency
    const publicTours = response.data.data.filter((tour: any) => {
      const statusEnum = mapStringToStatusEnum(tour.status);
      return statusEnum === TourDetailsStatus.Public;
    });

    return {
      success: true,
      data: {
        items: publicTours.map((tour: any) => ({
          id: tour.id,
          title: tour.title,
          description: tour.description,
          imageUrl: tour.imageUrl,
          skillsRequired: tour.skillsRequired,
          createdAt: tour.createdAt,
          startLocation: "Tây Ninh", // Default value
          endLocation: "Tây Ninh", // Default value
          tourOperation: tour.tourOperation
            ? {
                id: tour.tourOperation.id,
                tourDetailsId: tour.id,
                tourTitle: tour.title,
                price: tour.tourOperation.price,
                maxGuests: tour.tourOperation.maxGuests,
                currentBookings: tour.tourOperation.currentBookings || 0,
                tourStartDate: tour.tourOperation.tourStartDate,
                tourEndDate: tour.tourOperation.tourEndDate,
                isActive: tour.tourOperation.isActive,
              }
            : undefined,
          timeline:
            tour.timeline?.map((item: any, index: number) => ({
              id: item.id,
              title: item.activity,
              description: item.activity,
              startTime: item.checkInTime,
              endTime: item.checkInTime,
              sortOrder: item.sortOrder || index,
              specialtyShop: item.specialtyShop,
            })) || [],
          tourDates: [], // Will be populated if needed
        })),
        totalCount: response.data.totalCount || 0,
        pageIndex: response.data.pageIndex || 0,
        pageSize: response.data.pageSize || 10,
        totalPages: response.data.totalPages || 1,
      },
    };
  }

  return response.data;
};

// ===== HELPER FUNCTIONS =====

/**
 * Format booking status thành tiếng Việt
 */
export const getBookingStatusText = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.Pending:
      return "Chờ thanh toán";
    case BookingStatus.Confirmed:
      return "Đã xác nhận";
    case BookingStatus.Cancelled:
      return "Đã hủy";
    case BookingStatus.Completed:
      return "Đã hoàn thành";
    case BookingStatus.Refunded:
      return "Đã hoàn tiền";
    default:
      return "Không xác định";
  }
};

/**
 * Get booking status color for UI
 */
export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.Pending:
      return "orange";
    case BookingStatus.Confirmed:
      return "green";
    case BookingStatus.Cancelled:
      return "red";
    case BookingStatus.Completed:
      return "blue";
    case BookingStatus.Refunded:
      return "purple";
    default:
      return "default";
  }
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * ✅ NEW: Validate Individual QR booking request
 */
export const validateIndividualQRBookingRequest = (
  request: CreateTourBookingRequest
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate tourSlotId
  if (!request.tourSlotId?.trim()) {
    errors.push("Vui lòng chọn ngày tour");
  }

  // Validate numberOfGuests
  if (!request.numberOfGuests || request.numberOfGuests < 1) {
    errors.push("Số lượng người phải lớn hơn 0");
  }

  if (request.numberOfGuests > 50) {
    errors.push("Số lượng người không được quá 50");
  }

  // Check booking type to determine validation logic
  const isGroupRepresentative = request.bookingType === "GroupRepresentative";
  const isIndividual =
    request.bookingType === "Individual" || !request.bookingType;

  // Validate based on booking type
  if (isGroupRepresentative) {
    // For GroupRepresentative: only need 1 guest record OR groupRepresentative info
    if (request.groupRepresentative) {
      // Validate group representative info
      if (!request.groupRepresentative.guestName?.trim()) {
        errors.push("Tên người đại diện là bắt buộc");
      } else if (request.groupRepresentative.guestName.trim().length < 2) {
        errors.push("Tên người đại diện phải có ít nhất 2 ký tự");
      }

      if (!request.groupRepresentative.guestEmail?.trim()) {
        errors.push("Email người đại diện là bắt buộc");
      } else if (!isValidEmail(request.groupRepresentative.guestEmail)) {
        errors.push("Email người đại diện không hợp lệ");
      }
    } else if (!request.guests || request.guests.length === 0) {
      errors.push("Thông tin người đại diện là bắt buộc");
    } else {
      // Validate the first guest as representative
      const representative = request.guests[0];
      if (!representative.guestName?.trim()) {
        errors.push("Tên người đại diện là bắt buộc");
      }
      if (!representative.guestEmail?.trim()) {
        errors.push("Email người đại diện là bắt buộc");
      } else if (!isValidEmail(representative.guestEmail)) {
        errors.push("Email người đại diện không hợp lệ");
      }
    }
  } else if (isIndividual) {
    // For Individual: need guest info for each person
    if (!request.guests || request.guests.length === 0) {
      errors.push("Thông tin khách hàng là bắt buộc");
    } else {
      // Validate guest count matches
      if (request.guests.length !== request.numberOfGuests) {
        errors.push(
          `Số lượng thông tin khách hàng (${request.guests.length}) phải khớp với số lượng khách đã chọn (${request.numberOfGuests})`
        );
      }

      // Validate each guest
      request.guests.forEach((guest, index) => {
        if (!guest.guestName?.trim()) {
          errors.push(`Tên khách hàng thứ ${index + 1} là bắt buộc`);
        } else if (guest.guestName.trim().length < 2) {
          errors.push(
            `Tên khách hàng thứ ${index + 1} phải có ít nhất 2 ký tự`
          );
        } else if (guest.guestName.length > 100) {
          errors.push(
            `Tên khách hàng thứ ${index + 1} không được quá 100 ký tự`
          );
        }

        if (!guest.guestEmail?.trim()) {
          errors.push(`Email khách hàng thứ ${index + 1} là bắt buộc`);
        } else if (!isValidEmail(guest.guestEmail)) {
          errors.push(`Email khách hàng thứ ${index + 1} không hợp lệ`);
        }

        if (guest.guestPhone && guest.guestPhone.length > 20) {
          errors.push(
            `Số điện thoại khách hàng thứ ${index + 1} không được quá 20 ký tự`
          );
        }
      });

      // Validate unique emails
      const emails = request.guests.map((g) => g.guestEmail.toLowerCase());
      const uniqueEmails = new Set(emails);
      if (emails.length !== uniqueEmails.size) {
        errors.push("Email khách hàng phải unique trong cùng booking");
      }
    }
  }

  // Validate optional fields
  if (request.contactPhone && request.contactPhone.length > 20) {
    errors.push("Số điện thoại liên hệ không được quá 20 ký tự");
  }

  if (request.specialRequests && request.specialRequests.length > 500) {
    errors.push("Yêu cầu đặc biệt không được quá 500 ký tự");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 🔄 LEGACY: Backward compatibility validation
 */
export const validateLegacyBookingRequest = (
  request: LegacyCreateTourBookingRequest
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.tourOperationId) {
    errors.push("Tour operation ID là bắt buộc");
  }

  if (!request.numberOfGuests || request.numberOfGuests < 1) {
    errors.push("Số lượng người phải lớn hơn 0");
  }

  if (!request.contactName?.trim()) {
    errors.push("Tên người liên hệ là bắt buộc");
  }

  if (!request.contactPhone?.trim()) {
    errors.push("Số điện thoại liên hệ là bắt buộc");
  }

  if (request.contactEmail && !isValidEmail(request.contactEmail)) {
    errors.push("Email không hợp lệ");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Universal validation - auto-detect booking type
 */
export const validateBookingRequest = (
  request: CreateTourBookingRequest | LegacyCreateTourBookingRequest
): { isValid: boolean; errors: string[] } => {
  // Check if this is Individual QR request (has guests array)
  if ("guests" in request && request.guests) {
    return validateIndividualQRBookingRequest(
      request as CreateTourBookingRequest
    );
  } else {
    return validateLegacyBookingRequest(
      request as LegacyCreateTourBookingRequest
    );
  }
};
