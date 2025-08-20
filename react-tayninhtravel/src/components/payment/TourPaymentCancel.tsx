import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    Result,
    Button,
    Card,
    Descriptions,
    Spin,
    Alert,
    Typography,
    Space,
    Divider
} from 'antd';
import {
    CloseCircleOutlined,
    HomeOutlined,
    HistoryOutlined,
    ReloadOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';

import {
    parsePayOsCallbackParams,
    createPayOsCallbackRequest,
    handleTourBookingPaymentCancel,
    lookupTourBookingByPayOsOrderCode,
    formatCurrency,
    BookingPaymentInfo
} from '../../services/paymentService';
import { useAuthStore } from '../../store/useAuthStore';

const { Text } = Typography;

const TourPaymentCancel: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bookingInfo, setBookingInfo] = useState<BookingPaymentInfo | null>(null);

    useEffect(() => {
        const processPaymentCancel = async () => {
            try {
                setLoading(true);
                setError(null);

                // Parse URL parameters
                const currentUrl = window.location.href;
                const params = parsePayOsCallbackParams(currentUrl);

                if (!params.orderCode && !params.orderId) {
                    setError('Không tìm thấy mã đơn hàng trong URL');
                    return;
                }

                const orderCode = params.orderCode || params.orderId || '';

                // Lookup booking information first
                try {
                    const lookupResponse = await lookupTourBookingByPayOsOrderCode(orderCode);
                    if (lookupResponse.success && lookupResponse.data) {
                        setBookingInfo(lookupResponse.data);
                    }
                } catch (lookupError) {
                    console.warn('Could not lookup booking info:', lookupError);
                    // Continue with payment processing even if lookup fails
                }

                // Process payment cancel callback
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest({
                    ...params,
                    status: 'CANCELLED'
                });
                const response = await handleTourBookingPaymentCancel(callbackRequest);

                if (response.success) {
                    // Payment cancel callback was processed successfully
                    // Booking info should already be set from lookup above
                } else {
                    setError(response.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
                }

            } catch (error: any) {
                console.error('Tour payment cancel processing error:', error);
                setError(error.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
            } finally {
                setLoading(false);
                setProcessing(false);
            }
        };

        processPaymentCancel();
    }, [location]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewBookings = () => {
        if (isAuthenticated) {
            navigate('/booking-history');
        } else {
            navigate('/login', { state: { from: '/booking-history' } });
        }
    };

    const handleBrowseTours = () => {
        navigate('/tours');
    };

    const handleRetryPayment = () => {
        // Navigate back to booking page if we have booking info
        if (bookingInfo?.bookingId) {
            navigate(`/booking/${bookingInfo.bookingId}`);
        } else {
            navigate('/tours');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <Text>Đang xử lý hủy thanh toán...</Text>
                {processing && (
                    <Text type="secondary">
                        Đang cập nhật trạng thái đặt tour...
                    </Text>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
                <Result
                    status="error"
                    title="Có lỗi xảy ra"
                    subTitle={error}
                    extra={[
                        <Button type="primary" key="home" onClick={handleGoHome}>
                            <HomeOutlined /> Về trang chủ
                        </Button>,
                        <Button key="tours" onClick={handleBrowseTours}>
                            <ShoppingCartOutlined /> Xem tour khác
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Result
                status="error"
                title="Thanh toán đã bị hủy"
                subTitle="Bạn đã hủy quá trình thanh toán. Đơn đặt tour của bạn chưa được xác nhận."
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            />

            {bookingInfo && (
                <Card title="Thông tin đặt tour" style={{ marginTop: 24 }}>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Mã đặt tour">
                            <Text strong>{bookingInfo.bookingCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tên tour">
                            <Text strong>{bookingInfo.tourTitle}</Text>
                        </Descriptions.Item>

                        {bookingInfo.tourStartDate && (
                            <Descriptions.Item label="Ngày khởi hành">
                                <Text>{new Date(bookingInfo.tourStartDate).toLocaleDateString('vi-VN')}</Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Tổng tiền">
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                {formatCurrency(bookingInfo.totalPrice)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            <Text type="danger">Chưa thanh toán</Text>
                        </Descriptions.Item>

                        {bookingInfo.customerName && (
                            <Descriptions.Item label="Tên khách hàng">
                                <Text>{bookingInfo.customerName}</Text>
                            </Descriptions.Item>
                        )}

                        {bookingInfo.customerPhone && (
                            <Descriptions.Item label="Số điện thoại">
                                <Text>{bookingInfo.customerPhone}</Text>
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <Divider />

                    <Alert
                        message="Thông tin quan trọng"
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Đặt tour vẫn được lưu trong hệ thống với trạng thái "Chưa thanh toán"</li>
                                <li>Bạn có thể thử thanh toán lại bất cứ lúc nào</li>
                                <li>Tour có thể hết chỗ nếu bạn không thanh toán sớm</li>
                                <li>Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
                            </ul>
                        }
                        type="warning"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Card>
            )}

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large" wrap>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleRetryPayment}
                        icon={<ReloadOutlined />}
                    >
                        Thử thanh toán lại
                    </Button>

                    <Button
                        size="large"
                        onClick={handleBrowseTours}
                        icon={<ShoppingCartOutlined />}
                    >
                        Xem tour khác
                    </Button>

                    <Button size="large" onClick={handleViewBookings}>
                        <HistoryOutlined /> Lịch sử đặt tour
                    </Button>

                    <Button size="large" onClick={handleGoHome}>
                        <HomeOutlined /> Về trang chủ
                    </Button>
                </Space>
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary">
                    Cần hỗ trợ? <Link to="/contact">Liên hệ với chúng tôi</Link>
                </Text>
            </div>
        </div>
    );
};

export default TourPaymentCancel;
