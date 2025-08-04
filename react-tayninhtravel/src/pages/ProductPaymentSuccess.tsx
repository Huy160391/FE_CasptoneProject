import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';

interface PaymentResult {
    success: boolean;
    message: string;
    orderId?: string;
    status?: string;
    statusValue?: number;
    orderData?: any;
}

const ProductPaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handlePaymentCallback = async () => {
            try {
                const orderId = searchParams.get('orderId');
                const orderCode = searchParams.get('orderCode');

                console.log('Product Payment Success - Received params:', { orderId, orderCode });

                if (!orderId || !orderCode) {
                    setError('Thiếu thông tin đơn hàng');
                    setLoading(false);
                    return;
                }

                // Gọi API callback để xử lý thanh toán thành công
                console.log('Calling payment success callback API...');
                const response = await axiosInstance.post(`/payment-callback/payment-success/${orderCode}`);

                console.log('Payment callback response:', response.data);

                if (response.data.success) {
                    setPaymentResult(response.data);
                } else {
                    setError(response.data.message || 'Có lỗi xảy ra khi xử lý thanh toán');
                }
            } catch (err: any) {
                console.error('Payment callback error:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
            } finally {
                setLoading(false);
            }
        };

        handlePaymentCallback();
    }, [searchParams]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/profile/orders');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Có lỗi xảy ra</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleBackToHome}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Thanh toán thành công!</h1>
                
                {paymentResult && (
                    <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Mã đơn hàng:</strong> {paymentResult.orderId}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Trạng thái:</strong> 
                            <span className="text-green-600 font-semibold ml-1">Đã thanh toán</span>
                        </p>
                        {paymentResult.orderData && (
                            <>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Tổng tiền:</strong> {paymentResult.orderData.totalAfterDiscount?.toLocaleString()} VNĐ
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Thời gian:</strong> {new Date(paymentResult.orderData.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </>
                        )}
                    </div>
                )}

                <p className="text-gray-600 mb-6">
                    Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được xử lý thành công.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleViewOrders}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Xem đơn hàng của tôi
                    </button>
                    <button
                        onClick={handleBackToHome}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductPaymentSuccess;
