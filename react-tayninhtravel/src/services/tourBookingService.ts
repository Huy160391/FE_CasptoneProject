import axios from '../config/axios';
import { ApiResponse } from '../types/api';

// ===== TOUR BOOKING TYPES =====

export interface TourDetailsForBooking {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
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
    tourDetailsId: string;
    tourTitle: string;
    price: number;
    maxGuests: number;
    currentBookings: number;
    tourStartDate?: string;
    tourEndDate?: string;
    isActive: boolean;
}

export interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    sortOrder: number;
    specialtyShop?: {
        id: string;
        name: string;
        address?: string;
    };
}

export interface TourDate {
    date: string;
    availableSlots: number;
    bookedSlots: number;
}

export interface CreateTourBookingRequest {
    tourOperationId: string;
    numberOfGuests: number;
    adultCount: number;
    childCount: number;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    specialRequests?: string;
}

export interface CalculatePriceRequest {
    tourOperationId: string;
    numberOfGuests: number;
    bookingDate?: string;
}

export interface PriceCalculation {
    tourOperationId: string;
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
 * Tính giá tour trước khi booking (có thể có early bird discount)
 */
export const calculateBookingPrice = async (request: CalculatePriceRequest, token?: string): Promise<ApiResponse<PriceCalculation>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Lấy thông tin tour để tính giá
    const response = await axios.get(`/TourDetails/${request.tourOperationId}`, { headers });

    if (response.data.success && response.data.data) {
        const tourDetails = response.data.data;
        const price = tourDetails.tourOperation?.price || 0;

        return {
            success: true,
            data: {
                tourOperationId: request.tourOperationId,
                tourTitle: tourDetails.title || '',
                numberOfGuests: request.numberOfGuests,
                originalPricePerGuest: price,
                totalOriginalPrice: price * request.numberOfGuests,
                discountPercent: 0,
                discountAmount: 0,
                finalPrice: price * request.numberOfGuests,
                isEarlyBird: false,
                pricingType: 'Standard',
                daysSinceCreated: 0,
                daysUntilTour: 0,
                bookingDate: new Date().toISOString()
            }
        };
    }

    return {
        success: false,
        message: 'Không thể tính giá tour'
    };
};

/**
 * Tạo booking tour mới (yêu cầu authentication)
 */
export const createTourBooking = async (request: CreateTourBookingRequest, token: string): Promise<ApiResponse<CreateBookingResult>> => {
    const response = await axios.post('/TourBooking', request, {
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
        ...(params?.searchKeyword && { searchKeyword: params.searchKeyword })
    };

    const response = await axios.get('/TourBooking/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams
    });

    // Transform response to match expected format
    if (response.data.success && response.data.bookings) {
        return {
            success: true,
            data: {
                items: response.data.bookings.map((booking: any) => ({
                    ...booking,
                    numberOfGuests: booking.totalGuests,
                    statusName: booking.statusName || getBookingStatusText(booking.status),
                    tourOperation: booking.tourOperation ? {
                        ...booking.tourOperation,
                        tourTitle: booking.tourOperation.tourTitle,
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
    if (response.data.success && response.data.data) {
        const data = response.data.data;
        return {
            success: true,
            data: {
                isAvailable: data.availableCapacity >= numberOfGuests,
                maxGuests: data.maxCapacity,
                currentBookings: data.bookedCapacity,
                availableSlots: data.availableCapacity,
                message: data.isFull ? 'Tour đã hết chỗ' : undefined
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
        // Filter only public tours (status 8)
        const publicTours = response.data.data.filter((tour: any) => tour.status === 8);

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

/**
 * Validate booking request
 */
export const validateBookingRequest = (request: CreateTourBookingRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!request.tourOperationId) {
        errors.push('Tour operation ID là bắt buộc');
    }

    if (!request.numberOfGuests || request.numberOfGuests < 1) {
        errors.push('Số lượng khách phải lớn hơn 0');
    }

    if (!request.adultCount || request.adultCount < 0) {
        errors.push('Số lượng người lớn không hợp lệ');
    }

    if (request.childCount < 0) {
        errors.push('Số lượng trẻ em không hợp lệ');
    }

    if (request.adultCount + request.childCount !== request.numberOfGuests) {
        errors.push('Tổng số người lớn và trẻ em phải bằng tổng số khách');
    }

    if (request.numberOfGuests > 50) {
        errors.push('Số lượng khách không được vượt quá 50');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
