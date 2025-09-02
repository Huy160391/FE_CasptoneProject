import axios from '../config/axios';

import type { ApiResponse } from '@/types/index';

// ===== PAYMENT TYPES =====

export interface PaymentCallbackRequest {
    orderCode: string;
    status?: string;
    amount?: number;
    description?: string;
    transactionDateTime?: string;
    reference?: string;
}

export interface BookingPaymentInfo {
    bookingId: string;
    bookingCode: string;
    payOsOrderCode: string;
    totalPrice: number;
    status: string;
    paymentUrl?: string;
    tourTitle: string;
    tourStartDate?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
}

export interface ProductOrderInfo {
    id: string;
    payOsOrderCode: string;
    totalAmount: number;
    totalAfterDiscount: number;
    discountAmount: number;
    status: string;
    statusValue: number;
    createdAt: string;
    userId: string;
}

// ===== PRODUCT PAYMENT APIs =====

/**
 * Xử lý callback thanh toán thành công từ PayOS cho product order
 */
export const handleProductPaymentSuccess = async (request: PaymentCallbackRequest): Promise<ApiResponse<any>> => {
    const response = await axios.post('/product-payment/payment-success', request);
    return response.data;
};

/**
 * Xử lý callback thanh toán bị hủy từ PayOS cho product order
 */
export const handleProductPaymentCancel = async (request: PaymentCallbackRequest): Promise<ApiResponse<any>> => {
    const response = await axios.post('/product-payment/payment-cancel', request);
    return response.data;
};

/**
 * Tra cứu thông tin đơn hàng từ PayOS orderCode cho product order
 */
export const lookupProductOrderByPayOsOrderCode = async (payOsOrderCode: string): Promise<ApiResponse<ProductOrderInfo>> => {
    const response = await axios.get(`/product-payment/lookup/${payOsOrderCode}`);
    return response.data;
};

// Legacy function - keep for backward compatibility
export const lookupOrderByPayOsOrderCode = async (payOsOrderCode: string) => {
    const response = await axios.get(`/payment-callback/lookup/${payOsOrderCode}`);
    return response.data;
};

// Kiểm tra trạng thái thanh toán của đơn hàng
export const getOrderPaymentStatus = async (orderId: string, token: string) => {
    const response = await axios.get(`/api/Product/orders/${orderId}/payment-status`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// ===== TOUR BOOKING PAYMENT APIs =====

/**
 * Xử lý callback thanh toán thành công từ PayOS cho tour booking
 */
export const handleTourBookingPaymentSuccess = async (request: PaymentCallbackRequest): Promise<ApiResponse<any>> => {
    const response = await axios.post('/tour-booking-payment/payment-success', request);
    return response.data;
};

/**
 * Xử lý callback thanh toán bị hủy từ PayOS cho tour booking
 */
export const handleTourBookingPaymentCancel = async (request: PaymentCallbackRequest): Promise<ApiResponse<any>> => {
    const response = await axios.post('/tour-booking-payment/payment-cancel', request);
    return response.data;
};

/**
 * Tra cứu thông tin booking từ PayOS order code
 */
export const lookupTourBookingByPayOsOrderCode = async (payOsOrderCode: string): Promise<ApiResponse<BookingPaymentInfo>> => {
    const response = await axios.get(`/tour-booking-payment/lookup/${payOsOrderCode}`);
    return response.data;
};

// ===== PAYMENT UTILITIES =====
/**
 * Xác nhận callback thanh toán thành công từ PayOS cho sản phẩm/tour
 */
export const confirmPaymentCallback = async (orderId: string): Promise<any> => {
    // Gọi API xác nhận thanh toán thành công
    const response = await axios.post(`/payment-callback/confirm-success`, { orderId });
    return response.data;
};

/**
 * Xác nhận callback thanh toán bị hủy từ PayOS cho sản phẩm/tour
 */
export const confirmPaymentCancelCallback = async (orderId: string): Promise<any> => {
    // Gọi API xác nhận thanh toán bị hủy
    const response = await axios.post(`/payment-callback/confirm-cancel`, { orderId });
    return response.data;
};

/**
 * Parse URL parameters từ PayOS callback
 */
export const parsePayOsCallbackParams = (url: string): { orderId?: string; orderCode?: string; status?: string } => {
    try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);

        return {
            orderId: params.get('orderId') || undefined,
            orderCode: params.get('orderCode') || undefined,
            status: params.get('status') || undefined
        };
    } catch (error) {
        console.error('Error parsing PayOS callback URL:', error);
        return {};
    }
};

/**
 * Normalize order code to TNDT format if needed
 */
const normalizeOrderCodeForCallback = (orderCode: string): string => {
    // If already has TNDT prefix, return as is
    if (orderCode.startsWith('TNDT')) {
        return orderCode;
    }

    // If numeric only, add TNDT prefix
    if (/^\d+$/.test(orderCode)) {
        return `TNDT${orderCode}`;
    }

    // Return as is for other formats
    return orderCode;
};

/**
 * Tạo PayOS callback request từ URL parameters
 */
export const createPayOsCallbackRequest = (params: { orderId?: string; orderCode?: string; status?: string }): PaymentCallbackRequest => {
    const rawOrderCode = params.orderCode || params.orderId || '';
    const normalizedOrderCode = normalizeOrderCodeForCallback(rawOrderCode);

    return {
        orderCode: normalizedOrderCode,
        status: params.status || 'PAID',
        transactionDateTime: new Date().toISOString()
    };
};

/**
 * Redirect đến trang thanh toán PayOS
 */
export const redirectToPayOsPayment = (paymentUrl: string): void => {
    if (paymentUrl) {
        window.location.href = paymentUrl;
    } else {
        console.error('Payment URL is empty');
    }
};

/**
 * Kiểm tra xem có phải callback từ PayOS không
 */
export const isPayOsCallback = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.includes('payment-success') ||
            urlObj.pathname.includes('payment-cancel') ||
            urlObj.searchParams.has('orderCode') ||
            urlObj.searchParams.has('orderId');
    } catch {
        return false;
    }
};

/**
 * Format số tiền cho hiển thị
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

/**
 * Validate PayOS order code format
 */
export const validatePayOsOrderCode = (orderCode: string): boolean => {
    // PayOS order code format: TNDT + 10 digits
    const regex = /^TNDT\d{10}$/;
    return regex.test(orderCode);
};
