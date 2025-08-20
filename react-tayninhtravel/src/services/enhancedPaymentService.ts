import axios from '../config/axios';
import { ApiResponse } from '../types/api';

// ===== ENHANCED PAYMENT TYPES =====

export interface CreatePaymentRequest {
    orderId?: string;
    tourBookingId?: string;
    amount: number;
    description?: string;
    
    // ✅ NEW: Support flexible booking identification
    bookingCode?: string; // Fallback ID nếu không có tourBookingId
}

export interface RetryPaymentRequest {
    orderId?: string;
    tourBookingId?: string;
}

export interface CancelPaymentRequest {
    orderId?: string;
    tourBookingId?: string;
    cancellationReason?: string;
}

export interface PaymentLinkResponse {
    transactionId: string;
    payOsOrderCode: number;
    checkoutUrl: string;
    qrCode?: string;
    amount: number;
    description?: string;
    status: string;
    expiredAt?: string;
    createdAt: string;
}

export interface PaymentTransactionResponse {
    id: string;
    orderId?: string;
    tourBookingId?: string;
    amount: number;
    status: string;
    description?: string;
    gateway: string;
    payOsOrderCode?: number;
    payOsTransactionId?: string;
    checkoutUrl?: string;
    qrCode?: string;
    failureReason?: string;
    parentTransactionId?: string;
    expiredAt?: string;
    createdAt: string;
    updatedAt?: string;
    paymentType: string; // "ProductPayment" | "TourBookingPayment" | "Unknown"
    orderInfo?: any; // Order details if product payment
    tourBookingInfo?: any; // TourBooking details if tour booking payment
}

export interface CancelPaymentResponse {
    cancelledCount: number;
    message: string;
    cancelledTransactionIds: string[];
}

// ===== ENHANCED PAYMENT SERVICE =====

/**
 * Enhanced Payment Service tương tự như Java Spring Boot PaymentController
 * Cung cấp các API để quản lý thanh toán qua PayOS với transaction tracking
 */
export class EnhancedPaymentService {
    private baseUrl = '/enhanced-payments';

    /**
     * Tạo payment link với transaction tracking
     */
    async createPaymentLink(request: CreatePaymentRequest): Promise<ApiResponse<PaymentLinkResponse>> {
        const response = await axios.post(`${this.baseUrl}/create`, request);
        return response.data;
    }

    /**
     * Lấy danh sách transactions theo orderId
     */
    async getTransactionsByOrderId(orderId: string): Promise<ApiResponse<PaymentTransactionResponse[]>> {
        const response = await axios.get(`${this.baseUrl}/orders/${orderId}/transactions`);
        return response.data;
    }

    /**
     * Lấy danh sách transactions theo tourBookingId
     */
    async getTransactionsByTourBookingId(tourBookingId: string): Promise<ApiResponse<PaymentTransactionResponse[]>> {
        const response = await axios.get(`${this.baseUrl}/tour-bookings/${tourBookingId}/transactions`);
        return response.data;
    }

    /**
     * Hủy tất cả transactions đang pending
     */
    async cancelAllPendingTransactions(request: CancelPaymentRequest): Promise<ApiResponse<CancelPaymentResponse>> {
        const response = await axios.post(`${this.baseUrl}/cancel`, request);
        return response.data;
    }

    /**
     * Xác nhận webhook (admin only)
     */
    async confirmWebhook(webhookUrl?: string): Promise<ApiResponse<{ confirmedUrl: string }>> {
        const headers = webhookUrl ? { 'X-Webhook-Url': webhookUrl } : {};
        const response = await axios.post(`${this.baseUrl}/confirm-webhook`, {}, { headers });
        return response.data;
    }

    /**
     * Lấy danh sách Product Payment transactions
     */
    async getProductPayments(pageIndex: number = 0, pageSize: number = 10): Promise<ApiResponse<PaymentTransactionResponse[]>> {
        const response = await axios.get(`${this.baseUrl}/product-payments?pageIndex=${pageIndex}&pageSize=${pageSize}`);
        return response.data;
    }

    /**
     * Lấy danh sách Tour Booking Payment transactions
     */
    async getTourBookingPayments(pageIndex: number = 0, pageSize: number = 10): Promise<ApiResponse<PaymentTransactionResponse[]>> {
        const response = await axios.get(`${this.baseUrl}/tour-booking-payments?pageIndex=${pageIndex}&pageSize=${pageSize}`);
        return response.data;
    }

    /**
     * Kiểm tra loại thanh toán của transaction
     */
    async getPaymentType(transactionId: string): Promise<ApiResponse<{ transactionId: string; paymentType: string }>> {
        const response = await axios.get(`${this.baseUrl}/transactions/${transactionId}/type`);
        return response.data;
    }

    /**
     * Get transaction by PayOS order code
     */
    async getTransactionByOrderCode(orderCode: string): Promise<ApiResponse<PaymentTransactionResponse>> {
        const response = await axios.get(`${this.baseUrl}/transaction/order-code/${orderCode}`);
        return response.data;
    }

    /**
     * Process webhook callback
     */
    async processWebhookCallback(request: { orderCode: string; status: string }): Promise<ApiResponse<any>> {
        const response = await axios.post(`${this.baseUrl}/webhook/callback`, request);
        return response.data;
    }

    /**
     * Retry failed payment
     */
    async retryPayment(request: RetryPaymentRequest): Promise<ApiResponse<PaymentTransactionResponse>> {
        const response = await axios.post(`${this.baseUrl}/retry`, request);
        return response.data;
    }

    /**
     * Get transaction history for an order or tour booking
     */
    async getTransactionHistory(orderId?: string, tourBookingId?: string): Promise<ApiResponse<PaymentTransactionResponse[]>> {
        const params = new URLSearchParams();
        if (orderId) params.append('orderId', orderId);
        if (tourBookingId) params.append('tourBookingId', tourBookingId);

        const response = await axios.get(`${this.baseUrl}/history?${params.toString()}`);
        return response.data;
    }
}

// ===== ENHANCED PAYMENT HOOKS =====

// ===== SINGLETON PAYMENT SERVICE =====
const paymentService = new EnhancedPaymentService();

/**
 * React Hook để sử dụng Enhanced Payment Service
 */
export const useEnhancedPayment = () => {
    const createPaymentLink = async (request: CreatePaymentRequest) => {
        try {
            const response = await paymentService.createPaymentLink(request);
            
            if (response.success && response.data?.checkoutUrl) {
                // Redirect to PayOS payment page
                window.location.href = response.data.checkoutUrl;
            }
            return response;
        } catch (error) {
            console.error('Error creating payment link:', error);
            throw error;
        }
    };

    const retryPayment = async (request: RetryPaymentRequest) => {
        try {
            const response = await paymentService.retryPayment(request);
            if (response.success && response.data?.checkoutUrl) {
                // Redirect to PayOS payment page
                window.location.href = response.data.checkoutUrl;
            }
            return response;
        } catch (error) {
            console.error('Error retrying payment:', error);
            throw error;
        }
    };

    const getTransactionHistory = async (orderId?: string, tourBookingId?: string) => {
        try {
            if (orderId) {
                return await paymentService.getTransactionsByOrderId(orderId);
            } else if (tourBookingId) {
                return await paymentService.getTransactionsByTourBookingId(tourBookingId);
            }
            throw new Error('Either orderId or tourBookingId must be provided');
        } catch (error) {
            console.error('Error getting transaction history:', error);
            throw error;
        }
    };

    const cancelPendingTransactions = async (request: CancelPaymentRequest) => {
        try {
            return await paymentService.cancelAllPendingTransactions(request);
        } catch (error) {
            console.error('Error cancelling pending transactions:', error);
            throw error;
        }
    };

    const getProductPayments = async (pageIndex: number = 0, pageSize: number = 10) => {
        try {
            return await paymentService.getProductPayments(pageIndex, pageSize);
        } catch (error) {
            console.error('Error getting product payments:', error);
            throw error;
        }
    };

    const getTourBookingPayments = async (pageIndex: number = 0, pageSize: number = 10) => {
        try {
            return await paymentService.getTourBookingPayments(pageIndex, pageSize);
        } catch (error) {
            console.error('Error getting tour booking payments:', error);
            throw error;
        }
    };

    const getPaymentType = async (transactionId: string) => {
        try {
            return await paymentService.getPaymentType(transactionId);
        } catch (error) {
            console.error('Error getting payment type:', error);
            throw error;
        }
    };

    return {
        createPaymentLink,
        retryPayment,
        getTransactionHistory,
        cancelPendingTransactions,
        getProductPayments,
        getTourBookingPayments,
        getPaymentType,
        paymentService
    };
};

// ===== PAYMENT STATUS UTILITIES =====

export const PaymentStatus = {
    PENDING: 'Pending',
    PAID: 'Paid',
    CANCELLED: 'Cancelled',
    FAILED: 'Failed',
    EXPIRED: 'Expired',
    RETRY: 'Retry'
} as const;

export const PaymentGateway = {
    PAYOS: 'PayOS',
    VNPAY: 'VNPay',
    MOMO: 'MoMo'
} as const;

/**
 * Get payment status display text
 */
export const getPaymentStatusText = (status: string): string => {
    switch (status) {
        case PaymentStatus.PENDING:
            return 'Đang chờ thanh toán';
        case PaymentStatus.PAID:
            return 'Đã thanh toán';
        case PaymentStatus.CANCELLED:
            return 'Đã hủy';
        case PaymentStatus.FAILED:
            return 'Thất bại';
        case PaymentStatus.EXPIRED:
            return 'Đã hết hạn';
        case PaymentStatus.RETRY:
            return 'Thử lại';
        default:
            return status;
    }
};

/**
 * Get payment status color for UI
 */
export const getPaymentStatusColor = (status: string): string => {
    switch (status) {
        case PaymentStatus.PENDING:
            return 'orange';
        case PaymentStatus.PAID:
            return 'green';
        case PaymentStatus.CANCELLED:
            return 'red';
        case PaymentStatus.FAILED:
            return 'red';
        case PaymentStatus.EXPIRED:
            return 'gray';
        case PaymentStatus.RETRY:
            return 'blue';
        default:
            return 'default';
    }
};

export default EnhancedPaymentService;
