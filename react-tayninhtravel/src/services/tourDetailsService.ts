import axios from '../config/axios';
import { ApiResponse } from '../types';

// TourDetail interface matching TourDetailsPage requirements
export interface TourDetail {
    id: string;
    title: string;
    description?: string;
    imageUrls: string[];
    imageUrl?: string;
    skillsRequired?: string;
    createdAt: string;
    status: string | number; // API trả về string, nhưng components có thể convert thành number
    startLocation?: string;
    endLocation?: string;
    tourOperation?: {
        id: string;
        price: number;
        maxGuests: number;
        currentBookings: number;
        isActive: boolean;
        tourStartDate?: string;
        tourEndDate?: string;
    };
    timeline?: Array<{
        id: string;
        activity: string;
        checkInTime: string;
        sortOrder: number;
        specialtyShopId: string;
        specialtyShop?: {
            specialtyShopId: string;
            shopName: string;
            location?: string;
        };
    }>;
    tourDates?: Array<{
        tourSlotId: string;
        tourDate: string;
        scheduleDay: string;
        isAvailable: boolean;
    }>;
    availableSlots?: import("../types/tour").TourSlot[];
    tourTemplate?: {
        id: string;
        title: string;
        templateType: string;
        scheduleDays: string;
        scheduleDaysVietnamese?: string;
        startLocation?: string;
        endLocation?: string;
        month?: number;
        year?: number;
        images?: Array<{ id: string; url: string }>;
        createdBy?: {
            id: string;
            name: string;
            email: string;
        };
    };
}



/**
 * Service for public TourDetails operations (no authentication required)
 */
export class TourDetailsService {
    private readonly baseUrl = '/TourDetails';

    /**
     * Get public tour details by ID
     * @param tourId - The tour details ID
     * @param token - Optional authentication token
     * @returns Promise with tour details data
     */
    async getTourDetailsById(tourId: string, token?: string): Promise<ApiResponse<TourDetail>> {
        // Note: token is automatically handled by axios interceptor from localStorage
        // but we keep this parameter for explicit token passing if needed
        const headers: any = {};

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get(`${this.baseUrl}/${tourId}`, {
            headers: Object.keys(headers).length > 0 ? headers : undefined
        });
        return response.data;
    }

    /**
     * Get paginated public tour details list
     * @param params - Pagination and filter parameters
     * @returns Promise with paginated tour details
     */
    async getPublicTourDetailsList(params: {
        pageIndex?: number;
        pageSize?: number;
        includeInactive?: boolean;
    } = {}): Promise<ApiResponse<TourDetail[]>> {
        const queryParams = {
            pageIndex: params.pageIndex || 0,
            pageSize: params.pageSize || 10,
            includeInactive: params.includeInactive || false
        };

        const response = await axios.get(`${this.baseUrl}/paginated`, { params: queryParams });
        return response.data;
    }

    /**
     * Get featured tour details (for homepage)
     * @param limit - Number of featured tours to return
     * @returns Promise with featured tour details
     */
    async getFeaturedTourDetails(limit = 6): Promise<ApiResponse<TourDetail[]>> {
        const response = await axios.get(`${this.baseUrl}/paginated`, {
            params: {
                pageIndex: 0,
                pageSize: limit,
                includeInactive: false
            }
        });
        return response.data;
    }
}

// Export singleton instance
export const tourDetailsService = new TourDetailsService();

// Export default for convenient imports
export default tourDetailsService;
