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

const TourPaymentSuccess: React.FC = () => {
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

                console.log('Tour Payment Success - Received params:', { orderId, orderCode });

                if (!orderId || !orderCode) {
                    setError('Thiếu thông tin đặt tour');
                    setLoading(false);
                    return;
                }

                // Gọi API callback để xử lý thanh toán tour thành công
                console.log('Calling tour payment success callback API...');
                const response = await axiosInstance.post(`/tour-booking-payment/payment-success/${orderCode}`);

                console.log('Tour payment callback response:', response.data);

                if (response.data.success) {
                    setPaymentResult(response.data);
                } else {
                    setError(response.data.message || 'Có lỗi xảy ra khi xử lý thanh toán tour');
                }
            } catch (err: any) {
                console.error('Tour payment callback error:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán tour');
            } finally {
                setLoading(false);
            }
        };

        handlePaymentCallback();
    }, [searchParams]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewBookings = () => {
        navigate('/profile/bookings');
    };

    const handleViewTourDetail = () => {
        if (paymentResult?.bookingData?.tourDetail?.id) {
            navigate(`/tour-details/${paymentResult.bookingData.tourDetail.id}`);
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
                <div className="text-green-500 text-6xl mb-4">🎉</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Đặt tour thành công!</h1>
                
                {paymentResult && (
                    <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Mã đặt tour:</strong> {paymentResult.bookingId}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Trạng thái:</strong> 
                            <span className="text-green-600 font-semibold ml-1">Đã thanh toán</span>
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
                    Cảm ơn bạn đã đặt tour! Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận thông tin.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleViewBookings}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Xem tour đã đặt
                    </button>
                    {paymentResult?.bookingData?.tourDetail?.id && (
                        <button
                            onClick={handleViewTourDetail}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Xem chi tiết tour
                        </button>
                    )}
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

export default TourPaymentSuccess;
