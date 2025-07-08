import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CloseCircleFilled } from '@ant-design/icons';
import { useThemeStore } from '@/store/useThemeStore';
import { lookupOrderByPayOsOrderCode, getOrderPaymentStatus } from '@/services/paymentService';

const PaymentCancel: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const payOsOrderCode = params.get('orderCode');
    const { isDarkMode } = useThemeStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<any>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                // Đợi webhook xử lý xong
                await new Promise(res => setTimeout(res, 2000));
                let info = null;
                // Ưu tiên lấy theo orderId nếu có
                if (orderId && localStorage.getItem('token')) {
                    try {
                        const statusData = await getOrderPaymentStatus(orderId, localStorage.getItem('token')!);
                        if (payOsOrderCode) {
                            const lookupData = await lookupOrderByPayOsOrderCode(payOsOrderCode);
                            info = { ...lookupData, status: statusData.status };
                        } else {
                            info = { orderId, status: statusData.status };
                        }
                    } catch (e) {
                        // fallback
                    }
                }
                if (!info && payOsOrderCode) {
                    info = await lookupOrderByPayOsOrderCode(payOsOrderCode);
                }
                setOrderInfo(info);
            } catch (e: any) {
                setError('Không thể lấy thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
        // eslint-disable-next-line
    }, [orderId, payOsOrderCode]);

    return (
        <div
            style={{
                maxWidth: 400,
                margin: '40px auto',
                background: isDarkMode ? '#181818' : '#fff',
                borderRadius: 12,
                boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.32)' : '0 2px 8px rgba(0,0,0,0.08)',
                padding: 32,
                textAlign: 'center',
                color: isDarkMode ? '#f0f0f0' : '#222',
                border: isDarkMode ? '1px solid #333' : 'none',
            }}
        >
            <CloseCircleFilled style={{ fontSize: 48, color: isDarkMode ? '#ff7875' : '#cf1322', marginBottom: 16 }} />
            <h2 style={{ fontWeight: 700, marginBottom: 12, color: isDarkMode ? '#ff7875' : '#cf1322' }}>Thanh toán thất bại hoặc đã bị hủy!</h2>
            {loading ? (
                <div style={{ margin: '16px 0' }}>Đang tải thông tin đơn hàng...</div>
            ) : error ? (
                <div style={{ color: '#cf1322', marginBottom: 8 }}>{error}</div>
            ) : orderInfo ? (
                <>
                    <div style={{ marginBottom: 8 }}>
                        Mã đơn hàng: <b style={{ color: '#1890ff', fontSize: 18 }}>{orderInfo.orderId || orderId}</b>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        Trạng thái: <b style={{ color: '#cf1322' }}>{orderInfo.status}</b>
                    </div>
                    {orderInfo.totalAmount && (
                        <div style={{ marginBottom: 8 }}>
                            Tổng tiền: <b>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderInfo.totalAmount)}</b>
                        </div>
                    )}
                    {orderInfo.createdAt && (
                        <div style={{ marginBottom: 8 }}>
                            Ngày tạo: <b>{new Date(orderInfo.createdAt).toLocaleString('vi-VN')}</b>
                        </div>
                    )}
                </>
            ) : null}
            <div style={{ marginBottom: 32 }}>
                Vui lòng thử lại hoặc <Link to="/support" style={{ color: isDarkMode ? '#79eac0' : '#1890ff', textDecoration: 'underline' }}>liên hệ hỗ trợ</Link> nếu cần thiết.
            </div>
            <Link to="/shop">
                <button
                    style={{
                        background: isDarkMode ? '#79eac0' : '#1890ff',
                        color: isDarkMode ? '#111' : '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '10px 24px',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.32)' : undefined,
                        marginTop: 8,
                        transition: 'background 0.2s',
                    }}
                >
                    Quay lại mua hàng
                </button>
            </Link>
        </div>
    );
};

export default PaymentCancel;
