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
    Divider,
    Tag
} from 'antd';
import {
    CheckCircleOutlined,
    HomeOutlined,
    HistoryOutlined,
    PrinterOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
    parsePayOsCallbackParams,
    createPayOsCallbackRequest,
    handleTourBookingPaymentSuccess,
    lookupTourBookingByPayOsOrderCode,
    formatCurrency,
    BookingPaymentInfo
} from '../services/paymentService';
import { useAuthStore } from '../store/useAuthStore';

const { Title, Text } = Typography;

const PaymentSuccess: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [bookingInfo, setBookingInfo] = useState<BookingPaymentInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [paymentProcessed, setPaymentProcessed] = useState(false);

    useEffect(() => {
        const processPaymentSuccess = async () => {
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

                // Process payment success callback
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest(params);
                const response = await handleTourBookingPaymentSuccess(callbackRequest);

                if (response.success) {
                    setPaymentProcessed(true);

                    // If we don't have booking info from lookup, try to get it from response
                    if (!bookingInfo && response.data) {
                        setBookingInfo(response.data);
                    }
                } else {
                    setError(response.message || 'Có lỗi xảy ra khi xử lý thanh toán');
                }

            } catch (error: any) {
                console.error('Payment success processing error:', error);
                setError(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
            } finally {
                setLoading(false);
                setProcessing(false);
            }
        };

        processPaymentSuccess();
    }, [location]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewBookings = () => {
        if (isAuthenticated) {
            navigate('/profile/bookings');
        } else {
            navigate('/login');
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column'
            }}>
                <Spin size="large" />
                <Text style={{ marginTop: 16 }}>
                    {processing ? 'Đang xử lý thanh toán...' : 'Đang tải thông tin...'}
                </Text>
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
                        <Button key="bookings" onClick={handleViewBookings}>
                            <HistoryOutlined /> Xem lịch sử đặt tour
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Result
                status="success"
                title="Thanh toán thành công!"
                subTitle="Cảm ơn bạn đã đặt tour. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể."
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />

            {bookingInfo && (
                <Card
                    title={
                        <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <span>Thông tin đặt tour</span>
                        </Space>
                    }
                    style={{ marginTop: 24 }}
                    extra={
                        <Space>
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={handlePrintReceipt}
                                size="small"
                            >
                                In
                            </Button>
                        </Space>
                    }
                >
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Mã đặt tour">
                            <Text strong>{bookingInfo.bookingCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tên tour">
                            <Text>{bookingInfo.tourTitle}</Text>
                        </Descriptions.Item>

                        {bookingInfo.tourStartDate && (
                            <Descriptions.Item label="Ngày khởi hành">
                                <Text>{new Date(bookingInfo.tourStartDate).toLocaleDateString('vi-VN')}</Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Tổng tiền">
                            <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                                {formatCurrency(bookingInfo.totalPrice)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái thanh toán">
                            <Tag color="success">Đã thanh toán</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Mã giao dịch PayOS">
                            <Text code>{bookingInfo.payOsOrderCode}</Text>
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

                        {bookingInfo.customerEmail && (
                            <Descriptions.Item label="Email">
                                <Text>{bookingInfo.customerEmail}</Text>
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <Divider />

                    <Alert
                        message="Lưu ý quan trọng"
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Vui lòng lưu lại mã đặt tour để tra cứu sau này</li>
                                <li>Chúng tôi sẽ gửi email xác nhận trong vòng 24 giờ</li>
                                <li>Vui lòng có mặt tại điểm tập trung trước 15 phút</li>
                                <li>Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
                            </ul>
                        }
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Card>
            )}

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large">
                    <Button type="primary" size="large" onClick={handleGoHome}>
                        <HomeOutlined /> Về trang chủ
                    </Button>

                    <Button size="large" onClick={handleViewBookings}>
                        <HistoryOutlined /> Xem lịch sử đặt tour
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

export default PaymentSuccess;