import axios from '../config/axios';
import { TourTemplate } from '../types';

export interface GetTourTemplatesParams {
    pageIndex?: number;
    pageSize?: number;
    textSearch?: string;
    templateType?: string;
    startLocation?: string;
    includeInactive?: boolean;
}

export interface GetTourTemplatesResponse {
    data: TourTemplate[];
    totalRecord: number;
    totalPages: number;
    statusCode: number;
    message: string;
}

// Tạo mới template tour
export const createTourTemplate = async (data: Omit<TourTemplate, 'id' | 'createdAt'>) => {
    // Gọi API backend tạo template
    const response = await axios.post('/tourcompany/templates', data);
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

// Xoá template tour
export const deleteTourTemplate = async (id: string) => {
    const response = await axios.delete(`/tourcompany/templates/${id}`);
    return response.data;
};

// Cập nhật template tour
export const updateTourTemplate = async (id: string, data: Partial<TourTemplate>) => {
    const response = await axios.put(`/tourcompany/templates/${id}`, data);
    return response.data;
};

// Tạo mới tour từ template
export const createTourFromTemplate = async (templateId: string, tourData: any) => {
    const response = await axios.post(`/tourcompany/templates/${templateId}/tours`, tourData);
    return response.data;
};
