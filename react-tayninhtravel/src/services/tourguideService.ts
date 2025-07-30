import axios from 'axios';
import { ApiResponse } from '@/types/api';
import { TourGuideInvitation, InvitationStatistics } from '@/types/tour';
import { getVietnamNow, toVietnamTime } from '../utils/vietnamTimezone';

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5267/api';

// Configure axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ===== TOUR GUIDE INVITATION APIs =====

export interface MyInvitationsResponse {
    invitations: TourGuideInvitation[];
    statistics: InvitationStatistics;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        pageSize: number;
    };
}

export interface AcceptInvitationRequest {
    invitationId: string;
    acceptanceMessage?: string;
    confirmUnderstanding: boolean;
}

export interface RejectInvitationRequest {
    invitationId: string;
    rejectionReason: string;
    improvementSuggestion?: string;
}

/**
 * Lấy danh sách invitations của tour guide hiện tại
 * @param status - Lọc theo status (optional): "Pending" | "Accepted" | "Rejected" | "Expired"
 * @param token - JWT token (optional, sẽ lấy từ localStorage nếu không có)
 */
export const getMyInvitations = async (
    status?: string,
    token?: string
): Promise<ApiResponse<MyInvitationsResponse>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const params = status ? { status } : {};

        const response = await api.get('/TourGuideInvitation/my-invitations', {
            headers,
            params
        });

        return response.data;
    } catch (error: any) {
        console.error('Error fetching my invitations:', error);
        throw error;
    }
};

/**
 * Chấp nhận invitation
 * @param invitationId - ID của invitation
 * @param acceptanceMessage - Tin nhắn chấp nhận (optional)
 * @param token - JWT token (optional)
 */
export const acceptInvitation = async (
    invitationId: string,
    acceptanceMessage?: string,
    token?: string
): Promise<ApiResponse<any>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const requestData: AcceptInvitationRequest = {
            invitationId,
            acceptanceMessage,
            confirmUnderstanding: true
        };

        const response = await api.post(
            `/TourGuideInvitation/${invitationId}/accept`,
            requestData,
            { headers }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error accepting invitation:', error);
        throw error;
    }
};

/**
 * Từ chối invitation
 * @param invitationId - ID của invitation
 * @param rejectionReason - Lý do từ chối (bắt buộc)
 * @param improvementSuggestion - Gợi ý cải thiện (optional)
 * @param token - JWT token (optional)
 */
export const rejectInvitation = async (
    invitationId: string,
    rejectionReason: string,
    improvementSuggestion?: string,
    token?: string
): Promise<ApiResponse<any>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const requestData: RejectInvitationRequest = {
            invitationId,
            rejectionReason,
            improvementSuggestion
        };

        const response = await api.post(
            `/TourGuideInvitation/${invitationId}/reject`,
            requestData,
            { headers }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error rejecting invitation:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết của một invitation
 * @param invitationId - ID của invitation
 * @param token - JWT token (optional)
 */
export const getInvitationDetails = async (
    invitationId: string,
    token?: string
): Promise<ApiResponse<TourGuideInvitation>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await api.get(
            `/TourGuideInvitation/${invitationId}`,
            { headers }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error fetching invitation details:', error);
        throw error;
    }
};

/**
 * Validate invitation trước khi accept
 * @param invitationId - ID của invitation
 * @param token - JWT token (optional)
 */
export const validateInvitationAcceptance = async (
    invitationId: string,
    token?: string
): Promise<ApiResponse<any>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await api.get(
            `/TourGuideInvitation/${invitationId}/validate-acceptance`,
            { headers }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error validating invitation acceptance:', error);
        throw error;
    }
};

// ===== TOUR GUIDE PROFILE APIs =====

/**
 * Lấy thông tin profile của tour guide hiện tại
 * @param token - JWT token (optional)
 */
export const getMyProfile = async (token?: string): Promise<ApiResponse<any>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await api.get('/Account/profile', { headers });

        return response.data;
    } catch (error: any) {
        console.error('Error fetching tour guide profile:', error);
        throw error;
    }
};

/**
 * Cập nhật profile của tour guide
 * @param profileData - Dữ liệu profile cần cập nhật
 * @param token - JWT token (optional)
 */
export const updateMyProfile = async (
    profileData: any,
    token?: string
): Promise<ApiResponse<any>> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await api.put('/Account/profile', profileData, { headers });

        return response.data;
    } catch (error: any) {
        console.error('Error updating tour guide profile:', error);
        throw error;
    }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Format thời gian còn lại trước khi invitation hết hạn
 * @param expiresAt - Thời gian hết hạn
 */
export const formatTimeUntilExpiry = (expiresAt: string): string => {
    const now = getVietnamNow();
    const expiry = toVietnamTime(new Date(expiresAt));
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
        return 'Đã hết hạn';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày ${diffHours % 24} giờ`;
    } else if (diffHours > 0) {
        return `${diffHours} giờ ${diffMinutes} phút`;
    } else {
        return `${diffMinutes} phút`;
    }
};

/**
 * Kiểm tra invitation có thể accept/reject không
 * @param invitation - Invitation object
 */
export const canRespondToInvitation = (invitation: TourGuideInvitation): boolean => {
    return invitation.status === 'Pending' && new Date(invitation.expiresAt) > new Date();
};

export default {
    getMyInvitations,
    acceptInvitation,
    rejectInvitation,
    getInvitationDetails,
    validateInvitationAcceptance,
    getMyProfile,
    updateMyProfile,
    formatTimeUntilExpiry,
    canRespondToInvitation,
};
