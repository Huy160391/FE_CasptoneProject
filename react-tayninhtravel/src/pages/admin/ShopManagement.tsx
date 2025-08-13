import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    Card,
    message,
    Avatar,
    Tooltip,
    Switch,
    Modal,
    Rate,
    Descriptions
} from 'antd';
import {
    SearchOutlined,
    ShopOutlined,
    EditOutlined,
    EyeOutlined,
    UserOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    GlobalOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminService } from '@/services/adminService';
import { useThemeStore } from '@/store/useThemeStore';
import './ShopManagement.scss';

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
    const [includeInactive, setIncludeInactive] = useState(false);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Fetch shops data
    const fetchShops = async () => {
        try {
            setLoading(true);
            const response = await adminService.getSpecialtyShops({
                pageIndex,
                pageSize,
                includeInactive,
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
    }, [pageIndex, pageSize, includeInactive]);

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

    const handleToggleStatus = async (_shopId: string, _currentStatus: boolean) => {
        try {
            // TODO: Implement toggle shop status API
            message.info('Tính năng đang phát triển');
        } catch (error) {
            message.error('Không thể cập nhật trạng thái cửa hàng');
        }
    };

    const columns: ColumnsType<Shop> = [
        {
            title: 'Cửa hàng',
            key: 'shop',
            width: 300,
            render: (_, record) => (
                <div className="shop-info">
                    <div className="shop-header">
                        <Avatar
                            size={40}
                            src={record.logoUrl}
                            icon={<ShopOutlined />}
                            className="shop-avatar"
                        />
                        <div className="shop-details">
                            <div className="shop-name">{record.shopName}</div>
                            <div className="shop-type">{getShopTypeTag(record.shopType)}</div>
                        </div>
                    </div>
                    <div className="shop-description">
                        {record.description?.length > 100
                            ? `${record.description.substring(0, 100)}...`
                            : record.description}
                    </div>
                </div>
            ),
        },
        {
            title: 'Người đại diện',
            key: 'representative',
            width: 200,
            render: (_, record) => (
                <div className="representative-info">
                    <div className="rep-name">
                        <UserOutlined /> {record.representativeName}
                    </div>
                    <div className="rep-contact">
                        <div><PhoneOutlined /> {record.phoneNumber}</div>
                        <div><MailOutlined /> {record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'location',
            key: 'location',
            width: 200,
            render: (location: string) => (
                <Tooltip title={location}>
                    <div className="location-text">
                        <EnvironmentOutlined />
                        {location?.length > 50 ? `${location.substring(0, 50)}...` : location}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Giờ hoạt động',
            key: 'hours',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <div className="operating-hours">
                    <ClockCircleOutlined />
                    <div>{formatTime(record.openingHours)}</div>
                    <div>-</div>
                    <div>{formatTime(record.closingHours)}</div>
                </div>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            align: 'center',
            render: (rating: number) => (
                <div className="rating-display">
                    <Rate disabled defaultValue={rating} allowHalf />
                    <div className="rating-value">{rating?.toFixed(1) || 'N/A'}</div>
                </div>
            ),
            sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isShopActive',
            key: 'status',
            width: 100,
            align: 'center',
            render: (isActive: boolean, record) => (
                <Switch
                    checked={isActive}
                    onChange={(_checked) => handleToggleStatus(record.id, isActive)}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm dừng"
                />
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
            width: 120,
            render: (date: string) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => message.info('Tính năng đang phát triển')}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={`shop-management ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <Card>
                <div className="page-header">
                    <div className="header-title">
                        <ShopOutlined className="header-icon" />
                        <h1>Quản lý cửa hàng</h1>
                    </div>
                    <div className="header-stats">
                        <Tag color="blue">Tổng: {totalCount}</Tag>
                        <Tag color="green">Hoạt động: {shops.filter(s => s.isShopActive).length}</Tag>
                        <Tag color="red">Tạm dừng: {shops.filter(s => !s.isShopActive).length}</Tag>
                    </div>
                </div>

                <div className="filters-section">
                    <Space size="middle" wrap>
                        <Input
                            placeholder="Tìm kiếm cửa hàng..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />
                        <div className="filter-item">
                            <label>Hiển thị cửa hàng đã tạm dừng:</label>
                            <Switch
                                checked={includeInactive}
                                onChange={setIncludeInactive}
                            />
                        </div>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={shops}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: pageIndex + 1,
                        pageSize: pageSize,
                        total: totalCount,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} cửa hàng`,
                        onChange: (page, size) => {
                            setPageIndex(page - 1);
                            if (size !== pageSize) {
                                setPageSize(size);
                                setPageIndex(0);
                            }
                        }
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title={
                    <div className="modal-title">
                        <ShopOutlined /> Chi tiết cửa hàng
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
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
                                <img
                                    src={selectedShop.logoUrl}
                                    alt="Shop Logo"
                                    style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ShopManagement;
