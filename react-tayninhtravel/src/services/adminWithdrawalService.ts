/**
 * Admin Withdrawal Service
 * 
 * Service for admin withdrawal request management operations.
 * Provides functions for viewing, approving, and rejecting withdrawal requests.
 */

import axios from '@/config/axios';
import { WithdrawalRequestListParams, ProcessWithdrawalRequest } from '@/types';

// ==================== ADMIN WITHDRAWAL REQUEST APIs ====================

/**
 * Get all withdrawal requests for admin review
 * @param params - Filter and pagination parameters
 * @param token - Authentication token
 * @returns Promise with withdrawal requests data
 */
export const getAdminWithdrawalRequests = async (
    params: WithdrawalRequestListParams = {},
    token?: string
): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/Admin/WithdrawalRequests', { params, headers });
    return response.data;
};

/**
 * Get withdrawal request details by ID (Admin)
 * @param id - Withdrawal request ID
 * @param token - Authentication token
 * @returns Promise with withdrawal request details
 */
export const getAdminWithdrawalRequestById = async (
    id: string,
    token?: string
): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/Admin/WithdrawalRequests/${id}`, { headers });
    return response.data;
};

/**
 * Approve withdrawal request
 * @param id - Withdrawal request ID
 * @param data - Admin notes and approval data
 * @param token - Authentication token
 * @returns Promise with approval result
 */
export const approveWithdrawalRequest = async (
    id: string,
    data: ProcessWithdrawalRequest = {},
    token?: string
): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/Admin/WithdrawalRequests/${id}/approve`, data, { headers });
    return response.data;
};

/**
 * Reject withdrawal request
 * @param id - Withdrawal request ID
 * @param data - Admin notes and rejection reason
 * @param token - Authentication token
 * @returns Promise with rejection result
 */
export const rejectWithdrawalRequest = async (
    id: string,
    data: ProcessWithdrawalRequest = {},
    token?: string
): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put(`/Admin/WithdrawalRequests/${id}/reject`, data, { headers });
    return response.data;
};

/**
 * Get withdrawal statistics for admin dashboard
 * @param params - Date range and filter parameters
 * @param token - Authentication token
 * @returns Promise with statistics data
 */
export const getWithdrawalStatistics = async (
    params: {
        fromDate?: string;
        toDate?: string;
        period?: 'day' | 'week' | 'month' | 'year';
    } = {},
    token?: string
): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/Admin/WithdrawalRequests/statistics', { params, headers });
    return response.data;
};

/**
 * Export withdrawal requests to Excel/CSV
 * @param params - Filter parameters for export
 * @param token - Authentication token
 * @returns Promise with file blob
 */
export const exportWithdrawalRequests = async (
    params: WithdrawalRequestListParams & { format?: 'excel' | 'csv' } = {},
    token?: string
): Promise<Blob> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get('/Admin/WithdrawalRequests/export', {
        params,
        headers,
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Bulk approve multiple withdrawal requests
 * @param ids - Array of withdrawal request IDs
 * @param data - Admin notes for bulk approval
 * @param token - Authentication token
 * @returns Promise with bulk approval result
 */
export const bulkApproveWithdrawalRequests = async (
    ids: string[],
    data: ProcessWithdrawalRequest = {},
    token?: string
): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put('/Admin/WithdrawalRequests/bulk-approve', {
        ids,
        ...data
    }, { headers });
    return response.data;
};

/**
 * Bulk reject multiple withdrawal requests
 * @param ids - Array of withdrawal request IDs
 * @param data - Admin notes for bulk rejection
 * @param token - Authentication token
 * @returns Promise with bulk rejection result
 */
export const bulkRejectWithdrawalRequests = async (
    ids: string[],
    data: ProcessWithdrawalRequest = {},
    token?: string
): Promise<any> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.put('/Admin/WithdrawalRequests/bulk-reject', {
        ids,
        ...data
    }, { headers });
    return response.data;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format withdrawal request data for display
 * @param request - Raw withdrawal request data
 * @returns Formatted withdrawal request
 */
export const formatWithdrawalRequest = (request: any) => {
    return {
        ...request,
        formattedAmount: `${request.amount?.toLocaleString('vi-VN')} ₫`,
        formattedRequestedAt: new Date(request.requestedAt).toLocaleString('vi-VN'),
        formattedProcessedAt: request.processedAt 
            ? new Date(request.processedAt).toLocaleString('vi-VN') 
            : null,
        statusText: getStatusText(request.status),
        statusColor: getStatusColor(request.status)
    };
};

/**
 * Get status text in Vietnamese
 * @param status - Withdrawal status number
 * @returns Vietnamese status text
 */
export const getStatusText = (status: number): string => {
    const statusMap: Record<number, string> = {
        0: 'Chờ duyệt',
        1: 'Đã duyệt',
        2: 'Từ chối',
        3: 'Đã hủy'
    };
    return statusMap[status] || 'Không xác định';
};

/**
 * Get status color for UI display
 * @param status - Withdrawal status number
 * @returns Color string for status
 */
export const getStatusColor = (status: number): string => {
    const colorMap: Record<number, string> = {
        0: 'processing', // Blue for pending
        1: 'success',    // Green for approved
        2: 'error',      // Red for rejected
        3: 'default'     // Gray for cancelled
    };
    return colorMap[status] || 'default';
};

/**
 * Validate admin notes
 * @param notes - Admin notes text
 * @param isRequired - Whether notes are required
 * @returns Validation result
 */
export const validateAdminNotes = (notes: string, isRequired: boolean = false): {
    isValid: boolean;
    message?: string;
} => {
    if (isRequired && (!notes || notes.trim().length === 0)) {
        return {
            isValid: false,
            message: 'Ghi chú là bắt buộc'
        };
    }

    if (notes && notes.length > 500) {
        return {
            isValid: false,
            message: 'Ghi chú không được quá 500 ký tự'
        };
    }

    return { isValid: true };
};

export default {
    getAdminWithdrawalRequests,
    getAdminWithdrawalRequestById,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    getWithdrawalStatistics,
    exportWithdrawalRequests,
    bulkApproveWithdrawalRequests,
    bulkRejectWithdrawalRequests,
    formatWithdrawalRequest,
    getStatusText,
    getStatusColor,
    validateAdminNotes
};
