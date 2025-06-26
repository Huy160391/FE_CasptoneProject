import axios from '../config/axios';
import {
    TourTemplate,
    GetTourTemplatesParams,
    GetTourTemplatesResponse,
    CreateTourTemplateRequest,
    UpdateTourTemplateRequest,
    TourDetails,
    CreateTourDetailsRequest,
    TourOperation,
    CreateTourOperationRequest,
    TimelineItem,
    CreateTimelineItemRequest,
    CreateTimelineItemsRequest,
    SpecialtyShop,
    ApiResponse
} from '../types';

// ===== TOUR TEMPLATE APIs =====

// Tạo mới template tour
export const createTourTemplate = async (data: CreateTourTemplateRequest, token?: string): Promise<ApiResponse<TourTemplate>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/TourCompany/template', data, { headers });
    return response.data;
};

// Lấy danh sách template tour
export const getTourTemplates = async (params: GetTourTemplatesParams = {}, token?: string): Promise<GetTourTemplatesResponse> => {
    const {
        pageIndex = 0,
        pageSize = 10,
        includeInactive = false,
        textSearch,
        templateType,
        startLocation
    } = params;

    // Chỉ truyền params có giá trị
    const queryParams: any = {
        pageIndex,
        pageSize,
        includeInactive
    };

    // Chỉ thêm optional params nếu có giá trị
    if (textSearch && textSearch.trim()) {
        queryParams.textSearch = textSearch.trim();
    }
    if (templateType !== undefined && templateType !== '') {
        queryParams.templateType = templateType;
    }
    if (startLocation && startLocation.trim()) {
        queryParams.startLocation = startLocation.trim();
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log('🔍 Fetching templates from API...');
    console.log('📡 Request URL:', `/TourCompany/template`);
    console.log('📡 Query params:', queryParams);
    console.log('📡 Headers:', headers);

    const response = await axios.get('/TourCompany/template', { params: queryParams, headers });
    console.log('✅ Templates API response:', response.data);
    console.log('✅ Response structure check:', {
        statusCode: response.data.statusCode,
        hasData: 'data' in response.data,
        dataType: typeof response.data.data,
        dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'not array'
    });
    return response.data;
};

// Lấy chi tiết template tour
export const getTourTemplateDetail = async (id: string, token: string): Promise<TourTemplate | null> => {
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(`/TourCompany/template/${id}`, { headers });
    if (response.data && response.data.data) {
        return response.data.data;
    }
    return null;
};

// Xoá template tour
export const deleteTourTemplate = async (id: string, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/TourCompany/template/${id}`, { headers });
    return response.data;
};

// Cập nhật template tour
export const updateTourTemplate = async (id: string, data: UpdateTourTemplateRequest, token?: string): Promise<ApiResponse<TourTemplate>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/TourCompany/template/${id}`, data, { headers });
    return response.data;
};

// ===== TOUR DETAILS APIs =====

// Tạo TourDetails từ Template
export const createTourDetails = async (data: CreateTourDetailsRequest, token?: string): Promise<ApiResponse<TourDetails>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/TourDetails', data, { headers });
    return response.data;
};

// Lấy danh sách TourDetails theo Template
export const getTourDetailsByTemplate = async (templateId: string, includeInactive = false, token?: string): Promise<ApiResponse<TourDetails[]>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = { includeInactive };
    const response = await axios.get(`/TourDetails/template/${templateId}`, { params, headers });
    return response.data;
};

// Lấy danh sách TourDetails (general) - sử dụng endpoint paginated
export const getTourDetailsList = async (params: any = {}, token?: string): Promise<ApiResponse<any>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Sử dụng endpoint paginated với 0-based indexing
    // Backend đã được sửa để expect pageIndex bắt đầu từ 0
    const queryParams = {
        pageIndex: params.pageIndex || 0, // Use 0-based indexing directly
        pageSize: params.pageSize || 10,
        includeInactive: params.includeInactive || false,
        ...params
    };

    console.log('🔍 Fetching tour details from API...');
    console.log('📡 Request URL:', `/TourDetails/paginated`);
    console.log('📡 Query params:', queryParams);
    console.log('📡 Headers:', headers);

    const response = await axios.get('/TourDetails/paginated', { params: queryParams, headers });
    console.log('✅ Tour Details API response:', response.data);
    return response.data;
};

// Lấy chi tiết TourDetails
export const getTourDetailsById = async (id: string, token?: string): Promise<ApiResponse<TourDetails>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/TourDetails/${id}`, { headers });
    return response.data;
};

// Cập nhật TourDetails
export const updateTourDetails = async (id: string, data: Partial<CreateTourDetailsRequest>, token?: string): Promise<ApiResponse<TourDetails>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/TourDetails/${id}`, data, { headers });
    return response.data;
};

// Xóa TourDetails
export const deleteTourDetails = async (id: string, token?: string): Promise<ApiResponse<void>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/TourDetails/${id}`, { headers });
    return response.data;
};

// ===== TOUR OPERATION APIs =====

// Tạo TourOperation
export const createTourOperation = async (data: CreateTourOperationRequest, token?: string): Promise<ApiResponse<TourOperation>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/TourOperation', data, { headers });
    return response.data;
};

// Lấy TourOperation theo TourDetails ID
export const getTourOperationByDetailsId = async (tourDetailsId: string, token?: string): Promise<ApiResponse<TourOperation>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/TourOperation/details/${tourDetailsId}`, { headers });
    return response.data;
};

// Cập nhật TourOperation
export const updateTourOperation = async (id: string, data: Partial<CreateTourOperationRequest>, token?: string): Promise<ApiResponse<TourOperation>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/TourOperation/${id}`, data, { headers });
    return response.data;
};

// Xóa TourOperation
export const deleteTourOperation = async (id: string, token?: string): Promise<ApiResponse<void>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/TourOperation/${id}`, { headers });
    return response.data;
};

// Kiểm tra capacity real-time
export const checkTourCapacity = async (operationId: string, token?: string): Promise<ApiResponse<{ maxSeats: number; bookedSeats: number; availableSeats: number; isFullyBooked: boolean }>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/TourOperation/${operationId}`, { headers });
    const operation = response.data;

    return {
        ...response.data,
        data: {
            maxSeats: operation.maxSeats,
            bookedSeats: operation.bookedSeats || operation.currentBookings,
            availableSeats: operation.availableSeats,
            isFullyBooked: (operation.bookedSeats || operation.currentBookings) >= operation.maxSeats
        }
    };
};

// ===== TIMELINE APIs =====

// Tạo Timeline Item
export const createTimelineItem = async (data: CreateTimelineItemRequest, token?: string): Promise<ApiResponse<TimelineItem>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/TourDetails/timeline/single', data, { headers });
    return response.data;
};

// Tạo nhiều Timeline Items
export const createTimelineItems = async (data: CreateTimelineItemsRequest, token?: string): Promise<ApiResponse<{ createdCount: number; items: TimelineItem[] }>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/TourDetails/timeline', data, { headers });
    return response.data;
};

// Lấy Timeline Items theo TourDetails ID
export const getTimelineItemsByDetailsId = async (tourDetailsId: string, token?: string): Promise<ApiResponse<TimelineItem[]>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/TourDetails/${tourDetailsId}/timeline`, { headers });
    return response.data;
};

// Cập nhật Timeline Item
export const updateTimelineItem = async (id: string, data: Partial<CreateTimelineItemRequest>, token?: string): Promise<ApiResponse<TimelineItem>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/TourDetails/timeline/${id}`, data, { headers });
    return response.data;
};

// Xóa Timeline Item
export const deleteTimelineItem = async (id: string, token?: string): Promise<ApiResponse<void>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/TourDetails/timeline/${id}`, { headers });
    return response.data;
};

// ===== SPECIALTY SHOP APIs =====

// Lấy danh sách SpecialtyShops
export const getSpecialtyShops = async (includeInactive = false, token?: string): Promise<ApiResponse<SpecialtyShop[]>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = { includeInactive };
    const response = await axios.get('/SpecialtyShop', { params, headers });
    return response.data;
};

// Lấy SpecialtyShop theo ID
export const getSpecialtyShopById = async (id: string, token?: string): Promise<ApiResponse<SpecialtyShop>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/SpecialtyShop/${id}`, { headers });
    return response.data;
};

// ===== UTILITY FUNCTIONS =====

// Error handler for API calls
export const handleApiError = (error: any): string => {
    if (error.response?.status === 400) {
        // Validation errors
        const validationErrors = error.response.data.validationErrors;
        if (validationErrors && validationErrors.length > 0) {
            return validationErrors.join(', ');
        }
        return error.response.data.message || 'Dữ liệu không hợp lệ';
    } else if (error.response?.status === 403) {
        return 'Bạn không có quyền thực hiện thao tác này';
    } else if (error.response?.status === 404) {
        return 'Không tìm thấy dữ liệu';
    } else if (error.response?.status === 500) {
        return 'Lỗi hệ thống, vui lòng thử lại sau';
    } else {
        return error.message || 'Có lỗi xảy ra';
    }
};

// Performance tracker
export const performanceTracker = {
    startTime: null as number | null,

    start(operation: string) {
        this.startTime = performance.now();
        console.log(`Starting ${operation}...`);
    },

    end(operation: string) {
        if (this.startTime) {
            const duration = performance.now() - this.startTime;
            console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
        }
    }
};

// ===== TOUR GUIDE APIs =====

// Lấy danh sách TourGuides
export const getTourGuides = async (includeInactive = false, token?: string): Promise<ApiResponse<TourGuide[]>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = { includeInactive };
    const response = await axios.get('/Account/guides', { headers, params });
    return response.data;
};

// Lấy danh sách TourGuides available cho ngày cụ thể
export const getAvailableTourGuides = async (date: string, excludeOperationId?: string, token?: string): Promise<ApiResponse<TourGuide[]>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params: any = { date };
    if (excludeOperationId) {
        params.excludeOperationId = excludeOperationId;
    }
    const response = await axios.get('/Account/guides/available', { headers, params });
    return response.data;
};
