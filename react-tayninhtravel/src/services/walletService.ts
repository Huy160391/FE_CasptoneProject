import axiosInstance from '../config/axios';

// Types for Specialty Shop Wallet
export interface SpecialtyShopWallet {
    id: string;
    userId: string;
    shopName: string;
    wallet: number; // Số tiền trong ví (VND)
    updatedAt: string;
}

// Response structure based on API documentation
export interface SpecialtyShopWalletResponse {
    data: SpecialtyShopWallet;
    isSuccess: boolean;
    statusCode: number;
    message: string;
    success: boolean;
    validationErrors: string[];
}

/**
 * Service for managing specialty shop wallet operations
 */
export const walletService = {
    /**
     * Lấy thông tin ví của specialty shop
     * @returns Promise<SpecialtyShopWalletResponse>
     */
    getSpecialtyShopWallet: async (): Promise<SpecialtyShopWalletResponse> => {
        try {
            const response = await axiosInstance.get<SpecialtyShopWalletResponse>('/Wallet/specialty-shop');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching specialty shop wallet:', error);
            throw error;
        }
    },

    /**
     * Format currency amount to VND
     * @param amount - Số tiền
     * @returns Formatted currency string
     */
    formatCurrency: (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    },

    /**
     * Format number with thousand separators
     * @param amount - Số tiền
     * @returns Formatted number string
     */
    formatNumber: (amount: number): string => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    }
};

export default walletService;
