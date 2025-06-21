import axios from '../config/axios';
import { TourTemplate, GetTourTemplatesParams, GetTourTemplatesResponse } from '../types';

// Tạo mới template tour
export const createTourTemplate = async (data: {
    title: string;
    startLocation: string;
    endLocation: string;
    templateType: number;
    scheduleDays: number;
    month: number;
    year: number;
    images: string[];
}) => {
    // Gọi API backend tạo template
    const response = await axios.post('/TourCompany/template', data);
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
export const updateTourTemplate = async (id: string, body: any, token?: string) => {
    return axios.patch(`/TourCompany/template/${id}`, body, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
};

// Tạo mới tour từ template
export const createTourFromTemplate = async (templateId: string, tourData: any) => {
    const response = await axios.post(`/tourcompany/templates/${templateId}/tours`, tourData);
    return response.data;
};
