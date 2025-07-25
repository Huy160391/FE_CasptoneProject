import React, { useState, useEffect } from 'react';
import {
    Modal,
    List,
    Input,
    Tag,
    Button,
    Typography,
    Space,
    Empty,
    Spin,
    Card,
    notification
} from 'antd';
import {
    SearchOutlined,
    GiftOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { userService } from '@/services/userService';
import { useThemeStore } from '@/store/useThemeStore';
import './VoucherModal.scss';

const { Text } = Typography;
const { Search } = Input;

interface Voucher {
    voucherCodeId: string;
    code: string;
    voucherName: string;
    discountAmount: number;
    discountPercent: number | null;
    startDate: string;
    endDate: string;
    isUsed: boolean;
    claimedAt: string;
    usedAt: string | null;
    isExpired: boolean;
    isActive: boolean;
    status: string;
}

interface VoucherModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectVoucher: (voucher: Voucher) => void;
    selectedVoucherId?: string | null;
}

const VoucherModal: React.FC<VoucherModalProps> = ({
    visible,
    onClose,
    onSelectVoucher,
    selectedVoucherId
}) => {
    const { isDarkMode } = useThemeStore();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [totalRecord, setTotalRecord] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const pageSize = 10;

    const fetchVouchers = async (search?: string, page: number = 1) => {
        setLoading(true);
        try {
            const response = await userService.getMyVouchers(page, pageSize, undefined, search);

            if (response.success && Array.isArray(response.data)) {
                setVouchers(response.data);
                setTotalRecord(response.totalRecord || 0);
            } else {
                setVouchers([]);
                setTotalRecord(0);
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách voucher'
            });
            setVouchers([]);
            setTotalRecord(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchVouchers(searchText, 1);
            setPageIndex(1);
        }
    }, [visible]);

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPageIndex(1);
        fetchVouchers(value, 1);
    };

    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString()}đ`;
    };

    const getVoucherStatus = (voucher: Voucher) => {
        if (voucher.isUsed) {
            return <Tag color="default">Đã sử dụng</Tag>;
        }
        if (voucher.isExpired) {
            return <Tag color="default">Đã hết hạn</Tag>;
        }
        return <Tag color="success">Có thể sử dụng</Tag>;
    };

    const getDiscountText = (voucher: Voucher) => {
        if (voucher.discountPercent && voucher.discountPercent > 0) {
            return `Giảm ${voucher.discountPercent}%`;
        }
        return `Giảm ${formatCurrency(voucher.discountAmount)}`;
    };

    const isVoucherDisabled = (voucher: Voucher) => {
        return voucher.isUsed || voucher.isExpired || !voucher.isActive;
    };

    const handleSelectVoucher = (voucher: Voucher) => {
        if (isVoucherDisabled(voucher)) {
            return;
        }
        onSelectVoucher(voucher);
        onClose();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <Modal
            title={
                <Space>
                    <GiftOutlined />
                    <span>Chọn voucher</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Đóng
                </Button>
            ]}
            width={600}
            style={{ top: 20 }}
            className={`voucher-modal ${isDarkMode ? 'dark-mode' : ''}`}
        >
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm kiếm voucher theo tên hoặc mã..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary">Đang tải danh sách voucher...</Text>
                    </div>
                </div>
            ) : vouchers.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span style={{ color: isDarkMode ? '#bfbfbf' : undefined }}>
                            {searchText
                                ? `Không tìm thấy voucher với từ khóa "${searchText}"`
                                : "Bạn chưa có voucher nào"}
                        </span>
                    }
                />
            ) : (
                <>
                    <div style={{
                        marginBottom: 16,
                        padding: 12,
                        backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
                        borderRadius: 6
                    }}>
                        <Text type="secondary" style={{ color: isDarkMode ? '#bfbfbf' : undefined }}>
                            Tìm thấy {totalRecord} voucher
                        </Text>
                    </div>
                    <List
                        dataSource={vouchers}
                        renderItem={(voucher) => (
                            <List.Item style={{ padding: 0, marginBottom: 12 }}>
                                <Card
                                    size="small"
                                    style={{
                                        width: '100%',
                                        cursor: isVoucherDisabled(voucher) ? 'not-allowed' : 'pointer',
                                        opacity: isVoucherDisabled(voucher) ? 0.6 : 1,
                                        border: selectedVoucherId === voucher.voucherCodeId
                                            ? '2px solid #1890ff'
                                            : `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                                        backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff'
                                    }}
                                    onClick={() => handleSelectVoucher(voucher)}
                                    hoverable={!isVoucherDisabled(voucher)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                                <GiftOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                                <Text strong style={{
                                                    fontSize: 16,
                                                    color: isDarkMode ? '#ffffff' : undefined
                                                }}>
                                                    {voucher.code}
                                                </Text>
                                                <div style={{ marginLeft: 8 }}>
                                                    {getVoucherStatus(voucher)}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text style={{ color: isDarkMode ? '#d9d9d9' : undefined }}>
                                                    {voucher.voucherName}
                                                </Text>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                                    {getDiscountText(voucher)}
                                                </Text>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <Space size="small">
                                                    <ClockCircleOutlined style={{
                                                        color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                                                    }} />
                                                    <Text type="secondary" style={{
                                                        fontSize: 12,
                                                        color: isDarkMode ? '#bfbfbf' : undefined
                                                    }}>
                                                        HSD: {formatDate(voucher.endDate)}
                                                    </Text>
                                                </Space>
                                                {voucher.isUsed && voucher.usedAt && (
                                                    <Space size="small">
                                                        <CheckCircleOutlined style={{
                                                            color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                                                        }} />
                                                        <Text type="secondary" style={{
                                                            fontSize: 12,
                                                            color: isDarkMode ? '#bfbfbf' : undefined
                                                        }}>
                                                            Đã dùng: {formatDate(voucher.usedAt)}
                                                        </Text>
                                                    </Space>
                                                )}
                                            </div>
                                        </div>
                                        {selectedVoucherId === voucher.voucherCodeId && (
                                            <div>
                                                <CheckCircleOutlined style={{
                                                    color: '#1890ff',
                                                    fontSize: 20
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                    {totalRecord > pageSize && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Button
                                onClick={() => {
                                    const nextPage = pageIndex + 1;
                                    setPageIndex(nextPage);
                                    fetchVouchers(searchText, nextPage);
                                }}
                                disabled={vouchers.length >= totalRecord}
                                style={{
                                    backgroundColor: isDarkMode ? '#1f1f1f' : undefined,
                                    borderColor: isDarkMode ? '#434343' : undefined,
                                    color: isDarkMode ? '#ffffff' : undefined
                                }}
                            >
                                Tải thêm
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};

export default VoucherModal;
