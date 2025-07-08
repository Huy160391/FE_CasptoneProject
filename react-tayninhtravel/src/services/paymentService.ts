import axios from '../config/axios';

// Tra cứu thông tin đơn hàng từ PayOS orderCode (không cần token)
export const lookupOrderByPayOsOrderCode = async (payOsOrderCode: string) => {
    const response = await axios.get(`/payment-callback/lookup/${payOsOrderCode}`);
    return response.data;
};

// Kiểm tra trạng thái thanh toán của đơn hàng (cần token)
export const getOrderPaymentStatus = async (orderId: string, token: string) => {
    const response = await axios.get(`/Product/orders/${orderId}/payment-status`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};