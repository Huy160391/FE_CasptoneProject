import axios from '../config/axios';
import { ApiResponse } from '../types/api';
import { TourDetailsStatus } from '../types/tour';
import { mapStringToStatusEnum } from '../utils/statusMapper';

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

export interface CreateTourBookingRequest {
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

export enum BookingStatus {
    Pending = 0,
    Confirmed = 1,
    CancelledByCustomer = 2,
    CancelledByCompany = 3,
    Completed = 4,
    NoShow = 5,
    Refunded = 6
}

// ===== TOUR BOOKING API SERVICES =====

/**
 * Lấy chi tiết tour để booking
 */
export const getTourDetailsForBooking = async (tourDetailsId: string): Promise<ApiResponse<TourDetailsForBooking>> => {
    const response = await axios.get(`/TourDetails/${tourDetailsId}`);
    return response.data;
};

/**
 * Tính giá tour với Early Bird discount
 * Logic:
 * - Tour được tạo và mở bán
 * - 15 ngày đầu sau khi tạo: Early Bird (giảm 25%)
 * - Từ ngày 16 trở đi: Giá gốc (100%)
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

            // Kiểm tra Early Bird (15 ngày đầu)
            const isEarlyBird = daysSinceCreated <= 15;
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
                    daysUntilTour: 0, // Có thể tính sau nếu có tourStartDate
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
 * Tạo booking tour mới (yêu cầu authentication)
 */
export const createTourBooking = async (request: CreateTourBookingRequest, token: string): Promise<ApiResponse<CreateBookingResult>> => {
    const response = await axios.post('/UserTourBooking/create-booking', request, {
        headers: { Authorization: `Bearer ${token}` }
    });

    // Transform response to match expected format
    if (response.data.success && response.data.bookingData) {
        const bookingData = response.data.bookingData;
        return {
            success: true,
            data: {
                success: true,
                message: response.data.message,
                bookingId: bookingData.id,
                bookingCode: bookingData.bookingCode,
                paymentUrl: undefined, // PayOS integration sẽ được thêm sau
                originalPrice: bookingData.tourOperation?.price || 0,
                discountPercent: 0,
                finalPrice: bookingData.totalPrice,
                pricingType: 'Standard',
                bookingDate: bookingData.bookingDate,
                tourStartDate: bookingData.tourOperation?.tourDate
            }
        };
    }

    return response.data;
};

/**
 * Lấy danh sách booking của user hiện tại
 */
export const getMyBookings = async (token: string, params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: BookingStatus;
    searchKeyword?: string;
    includeInactive?: boolean;
}): Promise<ApiResponse<{
    items: TourBooking[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}>> => {
    const queryParams = {
        pageIndex: params?.pageIndex || 0,
        pageSize: params?.pageSize || 10,
        ...(params?.status !== undefined && { status: params.status }),
        ...(params?.searchKeyword && { searchKeyword: params.searchKeyword }),
        ...(params?.includeInactive !== undefined && { includeInactive: params.includeInactive })
    };

    const response = await axios.get('/TourBooking/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams
    });

    // Transform response to match expected format
    if ((response.data.success || response.data.isSuccess) && response.data.bookings) {
        return {
            success: true,
            data: {
                items: response.data.bookings.map((booking: any) => ({
                    ...booking,
                    numberOfGuests: booking.totalGuests || booking.numberOfGuests,
                    statusName: booking.statusName || getBookingStatusText(booking.status),
                    tourOperation: booking.tourOperation ? {
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
                        isActive: true
                    } : undefined
                })),
                totalCount: response.data.pagination?.totalItems || 0,
                pageIndex: response.data.pagination?.currentPage || 0,
                pageSize: response.data.pagination?.pageSize || 10,
                totalPages: response.data.pagination?.totalPages || 1
            }
        };
    }

    return response.data;
};

/**
 * Kiểm tra availability của tour
 */
export const checkTourAvailability = async (tourOperationId: string, numberOfGuests: number, token?: string): Promise<ApiResponse<{
    isAvailable: boolean;
    maxGuests: number;
    currentBookings: number;
    availableSlots: number;
    message?: string;
}>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/TourBooking/operation/${tourOperationId}/capacity`, {
        headers,
        params: { requestedGuests: numberOfGuests }
    });

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
                message: capacityInfo.isFull ? 'Tour đã hết chỗ' : undefined
            }
        };
    }

    return response.data;
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
}): Promise<ApiResponse<{
    items: TourDetailsForBooking[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
}>> => {
    const queryParams = {
        pageIndex: params?.pageIndex || 0,
        pageSize: params?.pageSize || 10,
        ...(params?.destination && { destination: params.destination }),
        ...(params?.startDate && { startDate: params.startDate }),
        ...(params?.endDate && { endDate: params.endDate }),
        ...(params?.minPrice && { minPrice: params.minPrice }),
        ...(params?.maxPrice && { maxPrice: params.maxPrice }),
        ...(params?.searchKeyword && { searchKeyword: params.searchKeyword })
    };

    const response = await axios.get('/TourDetails/paginated', { params: queryParams });

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
                    startLocation: 'Tây Ninh', // Default value
                    endLocation: 'Tây Ninh', // Default value
                    tourOperation: tour.tourOperation ? {
                        id: tour.tourOperation.id,
                        tourDetailsId: tour.id,
                        tourTitle: tour.title,
                        price: tour.tourOperation.price,
                        maxGuests: tour.tourOperation.maxGuests,
                        currentBookings: tour.tourOperation.currentBookings || 0,
                        tourStartDate: tour.tourOperation.tourStartDate,
                        tourEndDate: tour.tourOperation.tourEndDate,
                        isActive: tour.tourOperation.isActive
                    } : undefined,
                    timeline: tour.timeline?.map((item: any, index: number) => ({
                        id: item.id,
                        title: item.activity,
                        description: item.activity,
                        startTime: item.checkInTime,
                        endTime: item.checkInTime,
                        sortOrder: item.sortOrder || index,
                        specialtyShop: item.specialtyShop
                    })) || [],
                    tourDates: [] // Will be populated if needed
                })),
                totalCount: response.data.totalCount || 0,
                pageIndex: response.data.pageIndex || 0,
                pageSize: response.data.pageSize || 10,
                totalPages: response.data.totalPages || 1
            }
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
            return 'Chờ thanh toán';
        case BookingStatus.Confirmed:
            return 'Đã xác nhận';
        case BookingStatus.CancelledByCustomer:
            return 'Đã hủy bởi khách hàng';
        case BookingStatus.CancelledByCompany:
            return 'Đã hủy bởi công ty';
        case BookingStatus.Completed:
            return 'Đã hoàn thành';
        case BookingStatus.NoShow:
            return 'Không xuất hiện';
        case BookingStatus.Refunded:
            return 'Đã hoàn tiền';
        default:
            return 'Không xác định';
    }
};

/**
 * Get booking status color for UI
 */
export const getBookingStatusColor = (status: BookingStatus): string => {
    switch (status) {
        case BookingStatus.Pending:
            return 'orange';
        case BookingStatus.Confirmed:
            return 'green';
        case BookingStatus.CancelledByCustomer:
        case BookingStatus.CancelledByCompany:
            return 'red';
        case BookingStatus.Completed:
            return 'blue';
        case BookingStatus.NoShow:
            return 'volcano';
        case BookingStatus.Refunded:
            return 'purple';
        default:
            return 'default';
    }
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate booking request
 */
export const validateBookingRequest = (request: CreateTourBookingRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!request.tourOperationId) {
        errors.push('Tour operation ID là bắt buộc');
    }

    if (!request.numberOfGuests || request.numberOfGuests < 1) {
        errors.push('Số lượng người phải lớn hơn 0');
    }

    if (!request.contactName?.trim()) {
        errors.push('Tên người liên hệ là bắt buộc');
    }

    if (!request.contactPhone?.trim()) {
        errors.push('Số điện thoại liên hệ là bắt buộc');
    }

    if (request.contactEmail && !isValidEmail(request.contactEmail)) {
        errors.push('Email không hợp lệ');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
