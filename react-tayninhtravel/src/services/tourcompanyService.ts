import axios from '../config/axios';
import {
    TourTemplate,
    GetTourTemplatesParams,
    GetTourTemplatesResponse,
    CreateTourTemplateRequest,
    UpdateTourTemplateRequest,
    TourDetails,
    CreateTourDetailsRequest,
    TimelineItem,
    CreateTimelineItemRequest,
    CreateTimelineItemsRequest,
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
        pageIndex = 1,
        pageSize = 10,
        textSearch = '',
        templateType = '',
        startLocation = '',
        includeInactive = false
    } = params;

    const queryParams: any = {
        pageIndex,
        pageSize,
        textSearch,
        templateType,
        startLocation,
        includeInactive
    };

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/TourCompany/template', { params: queryParams, headers });
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
    const response = await axios.post('/TourCompany/details', data, { headers });
    return response.data;
};

// Lấy danh sách TourDetails
export const getTourDetailsList = async (params: any = {}, token?: string): Promise<ApiResponse<any>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/TourCompany/details', { params, headers });
    return response.data;
};

// Lấy chi tiết TourDetails
export const getTourDetailsById = async (id: string, token?: string): Promise<ApiResponse<TourDetails>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/TourCompany/details/${id}`, { headers });
    return response.data;
};

// Cập nhật TourDetails
export const updateTourDetails = async (id: string, data: Partial<CreateTourDetailsRequest>, token?: string): Promise<ApiResponse<TourDetails>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/TourCompany/details/${id}`, data, { headers });
    return response.data;
};

// Xóa TourDetails
export const deleteTourDetails = async (id: string, token?: string): Promise<ApiResponse<void>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/TourCompany/details/${id}`, { headers });
    return response.data;
};

// ===== TIMELINE APIs =====

// Tạo Timeline Item
export const createTimelineItem = async (data: CreateTimelineItemRequest, token?: string): Promise<ApiResponse<TimelineItem>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/TourCompany/details/timeline', data, { headers });
    return response.data;
};

// Tạo nhiều Timeline Items
export const createTimelineItems = async (data: CreateTimelineItemsRequest, token?: string): Promise<ApiResponse<{ createdCount: number; items: TimelineItem[] }>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/TourCompany/details/timeline/batch', data, { headers });
    return response.data;
};

// Cập nhật Timeline Item
export const updateTimelineItem = async (id: string, data: Partial<CreateTimelineItemRequest>, token?: string): Promise<ApiResponse<TimelineItem>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch(`/TourCompany/details/timeline/${id}`, data, { headers });
    return response.data;
};

// Xóa Timeline Item
export const deleteTimelineItem = async (id: string, token?: string): Promise<ApiResponse<void>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.delete(`/TourCompany/details/timeline/${id}`, { headers });
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
