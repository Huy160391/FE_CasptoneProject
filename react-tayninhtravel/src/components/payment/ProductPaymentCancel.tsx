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
    ShoppingCartOutlined,
    HistoryOutlined,
    ReloadOutlined
} from '@ant-design/icons';

import {
    parsePayOsCallbackParams,
    createPayOsCallbackRequest,
    handleProductPaymentCancel,
    lookupProductOrderByPayOsOrderCode,
    formatCurrency,
    ProductOrderInfo
} from '../../services/paymentService';

const { Text } = Typography;

const ProductPaymentCancel: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<ProductOrderInfo | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

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

                // Lookup order information first
                try {
                    const lookupResponse = await lookupProductOrderByPayOsOrderCode(orderCode);
                    if (lookupResponse.success && lookupResponse.data) {
                        setOrderInfo(lookupResponse.data);
                    }
                } catch (lookupError) {
                    console.warn('Could not lookup order info:', lookupError);
                    // Continue with payment processing even if lookup fails
                }

                // Process payment cancel callback
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest({
                    ...params,
                    status: 'CANCELLED'
                });
                const response = await handleProductPaymentCancel(callbackRequest);

                if (response.success) {
                    // Payment cancel callback was processed successfully
                    // Order info should already be set from lookup above
                } else {
                    setError(response.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
                }

            } catch (error: any) {
                console.error('Product payment cancel processing error:', error);
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

    const handleViewOrders = () => {
        navigate('/orders');
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    const handleRetryPayment = () => {
        // Navigate back to cart or checkout page
        navigate('/cart');
    };

    const handleViewCart = () => {
        navigate('/cart');
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
                        Đang cập nhật trạng thái đơn hàng...
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
                        <Button key="shop" onClick={handleContinueShopping}>
                            <ShoppingCartOutlined /> Tiếp tục mua sắm
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
                subTitle="Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn chưa được xác nhận."
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            />

            {orderInfo && (
                <Card title="Thông tin đơn hàng" style={{ marginTop: 24 }}>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Mã đơn hàng">
                            <Text strong>{orderInfo.payOsOrderCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng tiền gốc">
                            <Text>{formatCurrency(orderInfo.totalAmount)}</Text>
                        </Descriptions.Item>

                        {orderInfo.discountAmount > 0 && (
                            <Descriptions.Item label="Giảm giá">
                                <Text type="success">
                                    -{formatCurrency(orderInfo.discountAmount)}
                                </Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Tổng cần thanh toán">
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                {formatCurrency(orderInfo.totalAfterDiscount)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            <Text type="danger">Đã hủy thanh toán</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian tạo đơn">
                            <Text>{new Date(orderInfo.createdAt).toLocaleString('vi-VN')}</Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Alert
                        message="Thông tin quan trọng"
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Đơn hàng vẫn được lưu trong hệ thống với trạng thái "Đã hủy"</li>
                                <li>Sản phẩm vẫn còn trong giỏ hàng của bạn</li>
                                <li>Bạn có thể thử thanh toán lại bất cứ lúc nào</li>
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
                        onClick={handleViewCart}
                        icon={<ShoppingCartOutlined />}
                    >
                        Xem giỏ hàng
                    </Button>

                    <Button size="large" onClick={handleContinueShopping}>
                        <ShoppingCartOutlined /> Tiếp tục mua sắm
                    </Button>

                    <Button size="large" onClick={handleViewOrders}>
                        <HistoryOutlined /> Xem đơn hàng
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

export default ProductPaymentCancel;
