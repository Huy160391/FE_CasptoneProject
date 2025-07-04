import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CloseCircleFilled } from '@ant-design/icons';
import { useThemeStore } from '@/store/useThemeStore';

const PaymentCancel: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    const { isDarkMode } = useThemeStore();

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
            <div style={{ marginBottom: 8 }}>
                Mã đơn hàng: <b style={{ color: '#1890ff', fontSize: 18 }}>{orderId}</b>
            </div>
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
