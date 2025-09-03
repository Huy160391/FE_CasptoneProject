import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    message,
    Avatar,
    Tooltip,
    Modal,
    Rate,
    Descriptions
} from 'antd';
import {
    SearchOutlined,
    ShopOutlined,
    EyeOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminService } from '@/services/adminService';
import { useThemeStore } from '@/store/useThemeStore';
import './ShopManagement.scss';
// import ShopModal from './ShopModal';

interface Shop {
    id: string;
    userId: string;
    shopName: string;
    description: string;
    location: string;
    representativeName: string;
    email: string;
    phoneNumber: string;
    website?: string;
    businessLicense: string;
    businessLicenseUrl?: string;
    logoUrl?: string;
    shopType: string;
    openingHours: string;
    closingHours: string;
    rating: number;
    isShopActive: boolean;
    createdAt: string;
    updatedAt: string;
    userName?: string;
    userEmail?: string;
    userAvatar?: string;
    userRole?: string;
}

const ShopManagement = () => {
    const { isDarkMode } = useThemeStore();
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    // Removed unused includeInactive state
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    // Remove add/edit modal state

    // Fetch shops data
    const fetchShops = async () => {
        try {
            setLoading(true);
            const response = await adminService.getSpecialtyShops({
                pageIndex,
                pageSize,
                searchTerm: searchText
            });

            if (response.isSuccess) {
                setShops(response.shops);
                setTotalCount(response.totalCount);
            } else {
                message.error(response.message || 'Không thể tải danh sách cửa hàng');
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
            message.error('Có lỗi xảy ra khi tải danh sách cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, [pageIndex, pageSize]);

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPageIndex(0); // Reset to first page when searching
            fetchShops();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const getShopTypeTag = (type: string) => {
        const typeColors: Record<string, string> = {
            'Food': 'orange',
            'Handicrafts': 'blue',
            'Religious': 'purple',
            'Souvenir': 'green',
            'Art': 'cyan',
            'Other': 'default'
        };
        return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
    };

    const formatTime = (time: string) => {
        return time ? `${time}:00` : 'N/A';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const handleViewDetails = (shop: Shop) => {
        setSelectedShop(shop);
        setDetailModalVisible(true);
    };

    // Remove add/edit handlers

    // Remove delete/toggle status handlers

    const columns: ColumnsType<Shop> = [
        {
            title: 'Tên cửa hàng',
            dataIndex: 'shopName',
            key: 'shopName',
            render: (text: string, record: Shop) => (
                <Space>
                    <Avatar size={32} src={record.logoUrl} />
                    <span>{text}</span>
                </Space>
            ),
            sorter: (a, b) => a.shopName.localeCompare(b.shopName),
        },
        {
            title: 'Loại cửa hàng',
            dataIndex: 'shopType',
            key: 'shopType',
            render: (type: string) => getShopTypeTag(type),
            filters: [
                { text: 'Ẩm thực', value: 'Food' },
                { text: 'Thủ công', value: 'Handicrafts' },
                { text: 'Tôn giáo', value: 'Religious' },
                { text: 'Quà lưu niệm', value: 'Souvenir' },
                { text: 'Nghệ thuật', value: 'Art' },
                { text: 'Khác', value: 'Other' },
            ],
            onFilter: (value, record) => record.shopType === value,
        },
        {
            title: 'Người đại diện',
            dataIndex: 'representativeName',
            key: 'representativeName',
            render: (text: string) => <span>{text}</span>,
            sorter: (a, b) => a.representativeName.localeCompare(b.representativeName),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text: string) => <span>{text}</span>,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text: string) => <span>{text}</span>,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'location',
            key: 'location',
            render: (location: string) => (
                <Tooltip title={location}>
                    <span><EnvironmentOutlined /> {location}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isShopActive',
            key: 'isShopActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Tạm dừng', value: false },
            ],
            onFilter: (value, record) => record.isShopActive === value,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record: Shop) => (
                <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={e => {
                        e.stopPropagation();
                        handleViewDetails(record);
                    }}
                />
            ),
        },
    ];

    return (
        <div className={`shop-management-page ${isDarkMode ? 'dark-theme' : ''}`}>
            <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Quản lý cửa hàng</h1>
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Input
                        placeholder="Tìm kiếm cửa hàng..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                        value={searchText}
                    />
                </div>
            </div>
            <Table
                dataSource={shops}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pageIndex + 1,
                    pageSize: pageSize,
                    total: totalCount,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} cửa hàng`,
                    onChange: (page, size) => {
                        setPageIndex(page - 1);
                        if (size !== pageSize) {
                            setPageSize(size);
                            setPageIndex(0);
                        }
                    }
                }}
                className="shops-table"
                onRow={record => ({
                    onClick: () => handleViewDetails(record)
                })}
            />
            {/* No ShopModal, only view modal */}
            <Modal
                title={<div className="modal-title"><ShopOutlined /> Chi tiết cửa hàng</div>}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[<Button key="close" onClick={() => setDetailModalVisible(false)}>Đóng</Button>]}
                width={800}
            >
                {selectedShop && (
                    <div className="shop-detail">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Tên cửa hàng" span={2}>
                                <strong>{selectedShop.shopName}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại cửa hàng">
                                {getShopTypeTag(selectedShop.shopType)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedShop.isShopActive ? 'green' : 'red'}>
                                    {selectedShop.isShopActive ? 'Hoạt động' : 'Tạm dừng'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Người đại diện">
                                {selectedShop.representativeName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedShop.phoneNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedShop.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Website">
                                {selectedShop.website ? (
                                    <a href={selectedShop.website} target="_blank" rel="noopener noreferrer">
                                        <GlobalOutlined /> {selectedShop.website}
                                    </a>
                                ) : 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giấy phép kinh doanh">
                                {selectedShop.businessLicense}
                            </Descriptions.Item>
                            <Descriptions.Item label="Đánh giá">
                                <Rate disabled defaultValue={selectedShop.rating} allowHalf />
                                <span style={{ marginLeft: 8 }}>{selectedShop.rating?.toFixed(1)}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ hoạt động">
                                {formatTime(selectedShop.openingHours)} - {formatTime(selectedShop.closingHours)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {formatDate(selectedShop.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                <EnvironmentOutlined /> {selectedShop.location}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {selectedShop.description}
                            </Descriptions.Item>
                        </Descriptions>
                        {selectedShop.logoUrl && (
                            <div className="shop-logo-section">
                                <h4>Logo cửa hàng:</h4>
                                <img src={selectedShop.logoUrl} alt="Shop Logo" style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ShopManagement;
