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

const ProductPaymentCancel: React.FC = () => {
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

                console.log('Product Payment Cancel - Received params:', { orderId, orderCode });

                if (!orderId || !orderCode) {
                    setError('Thiếu thông tin đơn hàng');
                    setLoading(false);
                    return;
                }

                // Gọi API callback để xử lý thanh toán bị hủy
                console.log('Calling payment cancel callback API...');
                const response = await axiosInstance.post(`/payment-callback/payment-cancel/${orderCode}`);

                console.log('Payment cancel callback response:', response.data);

                if (response.data.success) {
                    setPaymentResult(response.data);
                } else {
                    setError(response.data.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
                }
            } catch (err: any) {
                console.error('Payment cancel callback error:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
            } finally {
                setLoading(false);
            }
        };

        handlePaymentCallback();
    }, [searchParams]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewCart = () => {
        navigate('/cart');
    };

    const handleRetryPayment = () => {
        if (paymentResult?.orderId) {
            navigate(`/checkout?orderId=${paymentResult.orderId}`);
        } else {
            navigate('/cart');
        }
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
                <div className="text-orange-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Thanh toán đã bị hủy</h1>
                
                {paymentResult && (
                    <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Mã đơn hàng:</strong> {paymentResult.orderId}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Trạng thái:</strong> 
                            <span className="text-orange-600 font-semibold ml-1">Đã hủy</span>
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
                    Bạn đã hủy thanh toán. Đơn hàng vẫn được lưu và bạn có thể thanh toán lại sau.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleRetryPayment}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Thanh toán lại
                    </button>
                    <button
                        onClick={handleViewCart}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Xem giỏ hàng
                    </button>
                    <button
                        onClick={handleBackToHome}
                        className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductPaymentCancel;
