import axiosInstance from '@/config/axios';
import { getErrorMessage } from '@/utils/errorHandler';
import {
    BankAccount,
    CreateBankAccountRequest,
    UpdateBankAccountRequest,
    WithdrawalRequest,
    CreateWithdrawalRequestRequest,
    WithdrawalRequestListParams,
    WithdrawalStatus,
    BankAccountFormData,
    WithdrawalFormData
} from '@/types';

/**
 * Shop Withdrawal Service
 * Handles all withdrawal-related operations for specialty shops
 * Based on Withdrawal API Guide
 */

// Types for supported banks
export interface SupportedBank {
    value: number;
    name: string;
    displayName: string;
    shortName: string;
    isActive: boolean;
}

// Validation request/response
export interface ValidateWithdrawalRequest {
    amount: number;
    bankAccountId: string;
}

export interface WithdrawalValidationResponse {
    isValid: boolean;
    errors: string[];
    availableBalance: number;
}

// Statistics interface
export interface WithdrawalStatistics {
    totalWithdrawals: number;
    pendingWithdrawals: number;
    approvedWithdrawals: number;
    rejectedWithdrawals: number;
    totalWithdrawnAmount: number;
    pendingAmount: number;
    currentBalance: number;
}

// Cancel withdrawal request
export interface CancelWithdrawalRequest {
    reason: string;
}

/**
 * === BANK ACCOUNT MANAGEMENT ===
 */

/**
 * Get list of supported banks
 */
export const getSupportedBanks = async (): Promise<SupportedBank[]> => {
    try {
        const response = await axiosInstance.get('BankAccount/supported-banks');
        return response.data.data || [];
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Create new bank account
 */
export const createBankAccount = async (data: CreateBankAccountRequest): Promise<BankAccount> => {
    try {
        const response = await axiosInstance.post('BankAccount', data);
        return response.data.data;
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Get all bank accounts for current user
 */
export const getMyBankAccounts = async (): Promise<BankAccount[]> => {
    try {
        const response = await axiosInstance.get('BankAccount/my-accounts');
        return response.data.data || [];
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Get default bank account
 */
export const getDefaultBankAccount = async (): Promise<BankAccount | null> => {
    try {
        const response = await axiosInstance.get('BankAccount/default');
        return response.data.data || null;
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Update bank account
 */
export const updateBankAccount = async (id: string, data: UpdateBankAccountRequest): Promise<BankAccount> => {
    try {
        const response = await axiosInstance.put(`BankAccount/${id}`, data);
        return response.data.data;
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Delete bank account
 */
export const deleteBankAccount = async (id: string): Promise<void> => {
    try {
        await axiosInstance.delete(`BankAccount/${id}`);
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Set bank account as default
 */
export const setDefaultBankAccount = async (id: string): Promise<void> => {
    try {
        await axiosInstance.put(`BankAccount/${id}/set-default`);
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * === WITHDRAWAL REQUEST MANAGEMENT ===
 */

/**
 * Validate withdrawal request before creation
 */
export const validateWithdrawalRequest = async (data: ValidateWithdrawalRequest): Promise<WithdrawalValidationResponse> => {
    try {
        const response = await axiosInstance.post('WithdrawalRequest/validate', data);

        // Handle the new response structure
        if (response.data?.isSuccess === true && response.data?.data === true) {
            return {
                isValid: true,
                errors: [],
                availableBalance: 0 // You might need to get this from another endpoint
            };
        } else {
            return {
                isValid: false,
                errors: response.data?.validationErrors || [response.data?.message || 'Yêu cầu không hợp lệ'],
                availableBalance: 0
            };
        }
    } catch (error: any) {
        console.error('Error validating withdrawal request:', error);

        // Return a default validation response on error
        return {
            isValid: false,
            errors: [error?.response?.data?.message || 'Lỗi xác thực yêu cầu rút tiền'],
            availableBalance: 0
        };
    }
};/**
 * Check if user can create new withdrawal request
 */
export const canCreateWithdrawalRequest = async (): Promise<boolean> => {
    try {
        const response = await axiosInstance.get('WithdrawalRequest/can-create');
        // Handle the new response structure
        return response.data?.data === true && response.data?.isSuccess === true;
    } catch (error) {
        console.error('Error checking can create withdrawal:', error);
        return false; // Return false instead of throwing error
    }
};

/**
 * Create withdrawal request
 */
export const createWithdrawalRequest = async (data: CreateWithdrawalRequestRequest): Promise<WithdrawalRequest> => {
    try {
        const response = await axiosInstance.post('WithdrawalRequest', data);

        // Handle the new response structure
        if (response.data?.isSuccess === true) {
            return response.data.data;
        } else {
            throw new Error(response.data?.message || 'Không thể tạo yêu cầu rút tiền');
        }
    } catch (error: any) {
        console.error('Error creating withdrawal request:', error);

        // Enhance error message
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error?.response?.data?.validationErrors?.length > 0) {
            throw new Error(error.response.data.validationErrors.join(', '));
        } else {
            throw error;
        }
    }
};

/**
 * Get withdrawal requests for current user (with convenience parameters)
 * @param status - Withdrawal status filter
 * @param pageNumber - Page number (1-based)
 * @param pageSize - Number of items per page
 */
export const getMyWithdrawalRequestsWithParams = async (
    status?: WithdrawalStatus,
    pageNumber: number = 1,
    pageSize?: number
): Promise<{
    data: WithdrawalRequest[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
}> => {
    return getMyWithdrawalRequests({
        status,
        pageIndex: pageNumber,
        pageSize
    });
};

/**
 * Get withdrawal requests for current user
 */
export const getMyWithdrawalRequests = async (params?: WithdrawalRequestListParams): Promise<{
    data: WithdrawalRequest[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
}> => {
    try {
        const queryParams = new URLSearchParams();

        if (params?.status !== undefined) {
            queryParams.append('status', params.status.toString());
        }
        if (params?.pageIndex !== undefined) {
            queryParams.append('pageNumber', params.pageIndex.toString()); // Use pageNumber for API
        }
        if (params?.pageSize !== undefined) {
            queryParams.append('pageSize', params.pageSize.toString());
        }

        const response = await axiosInstance.get(`WithdrawalRequest/my-requests?${queryParams.toString()}`);

        // Handle the new response structure with items array
        if (response.data?.isSuccess === true) {
            const result = response.data.data;
            return {
                data: Array.isArray(result?.items) ? result.items : [],
                totalCount: result?.totalCount || result?.items?.length || 0,
                pageIndex: result?.pageIndex || result?.pageNumber || params?.pageIndex || 0,
                pageSize: result?.pageSize || params?.pageSize || 10
            };
        } else {
            return {
                data: [],
                totalCount: 0,
                pageIndex: 0,
                pageSize: 10
            };
        }
    } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        // Return empty result instead of throwing error
        return {
            data: [],
            totalCount: 0,
            pageIndex: 0,
            pageSize: 10
        };
    }
};

/**
 * Get withdrawal request by ID
 */
export const getWithdrawalRequestById = async (id: string): Promise<WithdrawalRequest> => {
    try {
        const response = await axiosInstance.get(`WithdrawalRequest/${id}`);
        return response.data.data;
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Get latest withdrawal request
 */
export const getLatestWithdrawalRequest = async (): Promise<WithdrawalRequest | null> => {
    try {
        const response = await axiosInstance.get('WithdrawalRequest/latest');
        return response.data.data || null;
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Cancel withdrawal request
 */
export const cancelWithdrawalRequest = async (id: string, data: CancelWithdrawalRequest): Promise<void> => {
    try {
        await axiosInstance.put(`WithdrawalRequest/${id}/cancel`, data);
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * Get withdrawal statistics
 */
export const getWithdrawalStatistics = async (): Promise<WithdrawalStatistics> => {
    try {
        const response = await axiosInstance.get('WithdrawalRequest/stats');
        return response.data.data || {
            totalWithdrawals: 0,
            pendingWithdrawals: 0,
            approvedWithdrawals: 0,
            rejectedWithdrawals: 0,
            totalWithdrawnAmount: 0,
            pendingAmount: 0,
            currentBalance: 0
        };
    } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
};

/**
 * === UTILITY FUNCTIONS ===
 */

/**
 * Format bank account data for form submission
 * Handles both supported banks and custom banks
 */
export const formatBankAccountData = (formData: BankAccountFormData, selectedBank?: SupportedBank): CreateBankAccountRequest => {
    return {
        bankName: selectedBank ? selectedBank.displayName : formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        isDefault: formData.isDefault || false
    };
};

/**
 * Format withdrawal form data for API
 */
export const formatWithdrawalData = (formData: WithdrawalFormData): CreateWithdrawalRequestRequest => {
    return {
        bankAccountId: formData.bankAccountId,
        amount: formData.amount
    };
};

/**
 * Get withdrawal status display text
 */
export const getWithdrawalStatusText = (status: WithdrawalStatus): string => {
    switch (status) {
        case WithdrawalStatus.Pending:
            return 'Chờ duyệt';
        case WithdrawalStatus.Approved:
            return 'Đã duyệt';
        case WithdrawalStatus.Rejected:
            return 'Từ chối';
        case WithdrawalStatus.Cancelled:
            return 'Đã hủy';
        default:
            return 'Không xác định';
    }
};

/**
 * Get withdrawal status color
 */
export const getWithdrawalStatusColor = (status: WithdrawalStatus): string => {
    switch (status) {
        case WithdrawalStatus.Pending:
            return '#faad14';
        case WithdrawalStatus.Approved:
            return '#52c41a';
        case WithdrawalStatus.Rejected:
            return '#ff4d4f';
        case WithdrawalStatus.Cancelled:
            return '#8c8c8c';
        default:
            return '#d9d9d9';
    }
};

/**
 * Mask bank account number for display
 */
export const maskAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;

    const visibleStart = accountNumber.substring(0, 2);
    const visibleEnd = accountNumber.substring(accountNumber.length - 4);
    const maskedMiddle = '*'.repeat(accountNumber.length - 6);

    return `${visibleStart}${maskedMiddle}${visibleEnd}`;
};

/**
 * Format currency for Vietnamese locale
 */
export const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')} ₫`;
};

/**
 * Validate minimum withdrawal amount
 */
export const validateMinimumAmount = (amount: number): boolean => {
    return amount >= 1000; // Minimum 1,000 VND as per API guide
};

/**
 * Check if withdrawal request can be cancelled
 */
export const canCancelWithdrawal = (request: WithdrawalRequest): boolean => {
    // Use the canCancel field from API response if available
    if (typeof request.canCancel === 'boolean') {
        return request.canCancel;
    }
    // Fallback to status check
    return request.status === WithdrawalStatus.Pending;
};

export default {
    // Bank Account Management
    getSupportedBanks,
    createBankAccount,
    getMyBankAccounts,
    getDefaultBankAccount,
    updateBankAccount,
    deleteBankAccount,
    setDefaultBankAccount,

    // Withdrawal Request Management
    validateWithdrawalRequest,
    canCreateWithdrawalRequest,
    createWithdrawalRequest,
    getMyWithdrawalRequests,
    getMyWithdrawalRequestsWithParams,
    getWithdrawalRequestById,
    getLatestWithdrawalRequest,
    cancelWithdrawalRequest,
    getWithdrawalStatistics,

    // Utility Functions
    formatBankAccountData,
    formatWithdrawalData,
    getWithdrawalStatusText,
    getWithdrawalStatusColor,
    maskAccountNumber,
    formatCurrency,
    validateMinimumAmount,
    canCancelWithdrawal
};

