import axios from '../config/axios';

// Tra cứu thông tin đơn hàng từ PayOS orderCode
export const lookupPayOSOrder = async (payOsOrderCode: string) => {
    const response = await axios.get(`/api/payment-callback/lookup/${payOsOrderCode}`);
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

// Xác nhận thanh toán thành công từ PayOS callback
export const confirmPaymentCallback = async (orderId: string) => {
    const response = await axios.get(`/payment-callback/paid/${orderId}`);
    return response.data; // { message, orderId, status, statusValue, stockUpdated, cartCleared }
};

// Xác nhận huỷ thanh toán từ PayOS callback
export const confirmPaymentCancelCallback = async (orderId: string) => {
    const response = await axios.get(`/payment-callback/cancelled/${orderId}`);
    return response.data; // response tu API huỷ thanh toán
};