import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';

interface PaymentResult {
    success: boolean;
    message: string;
    bookingId?: string;
    status?: string;
    statusValue?: number;
    bookingData?: any;
}

const TourPaymentCancel: React.FC = () => {
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

                console.log('Tour Payment Cancel - Received params:', { orderId, orderCode });

                if (!orderId || !orderCode) {
                    setError('Thiếu thông tin đặt tour');
                    setLoading(false);
                    return;
                }

                // Gọi API callback để xử lý thanh toán tour bị hủy
                console.log('Calling tour payment cancel callback API...');
                const response = await axiosInstance.post(`/tour-booking-payment/payment-cancel/${orderCode}`);

                console.log('Tour payment cancel callback response:', response.data);

                if (response.data.success) {
                    setPaymentResult(response.data);
                } else {
                    setError(response.data.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán tour');
                }
            } catch (err: any) {
                console.error('Tour payment cancel callback error:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán tour');
            } finally {
                setLoading(false);
            }
        };

        handlePaymentCallback();
    }, [searchParams]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewTours = () => {
        navigate('/tours');
    };

    const handleRetryPayment = () => {
        if (paymentResult?.bookingData?.tourDetail?.id) {
            navigate(`/tour-details/${paymentResult.bookingData.tourDetail.id}`);
        } else {
            navigate('/tours');
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
                <div className="text-orange-500 text-6xl mb-4">😔</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Đặt tour đã bị hủy</h1>
                
                {paymentResult && (
                    <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Mã đặt tour:</strong> {paymentResult.bookingId}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Trạng thái:</strong> 
                            <span className="text-orange-600 font-semibold ml-1">Đã hủy</span>
                        </p>
                        {paymentResult.bookingData && (
                            <>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Tour:</strong> {paymentResult.bookingData.tourDetail?.title}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Số khách:</strong> {paymentResult.bookingData.totalGuests} người
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Tổng tiền:</strong> {paymentResult.bookingData.totalPrice?.toLocaleString()} VNĐ
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Ngày khởi hành:</strong> {
                                        paymentResult.bookingData.tourDetail?.startDate 
                                            ? new Date(paymentResult.bookingData.tourDetail.startDate).toLocaleDateString('vi-VN')
                                            : 'N/A'
                                    }
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Thời gian đặt:</strong> {new Date(paymentResult.bookingData.bookingDate).toLocaleString('vi-VN')}
                                </p>
                            </>
                        )}
                    </div>
                )}

                <p className="text-gray-600 mb-6">
                    Bạn đã hủy thanh toán đặt tour. Bạn có thể đặt lại tour này hoặc chọn tour khác.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleRetryPayment}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Đặt lại tour này
                    </button>
                    <button
                        onClick={handleViewTours}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Xem các tour khác
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

export default TourPaymentCancel;
