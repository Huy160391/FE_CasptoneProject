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
    Badge
} from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    EditOutlined,
    EyeOutlined,
    PhoneOutlined,
    MailOutlined,
    StarOutlined,
    CalendarOutlined,
    TrophyOutlined,
    TeamOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminService } from '@/services/adminService';
import { useThemeStore } from '@/store/useThemeStore';
import './TourGuideManagement.scss';

interface TourGuide {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    experience: string;
    skills: string;
    rating: number;
    totalToursGuided: number;
    isAvailable: boolean;
    notes?: string;
    profileImageUrl?: string;
    approvedAt: string;
    userName: string;
    approvedByName?: string;
}

const TourGuideManagement = () => {
    const { isDarkMode } = useThemeStore();
    const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Fetch tour guides data
    const fetchTourGuides = async () => {
        try {
            setLoading(true);
            const response = await adminService.getTourGuides({
                pageIndex,
                pageSize,
                Active: !includeInactive, // Convert includeInactive to Active
                textSearch: searchText
            });

            if (response.isSuccess) {
                setTourGuides(response.tourGuides);
                setTotalCount(response.totalCount);
            } else {
                message.error(response.message || 'Không thể tải danh sách hướng dẫn viên');
            }
        } catch (error) {
            console.error('Error fetching tour guides:', error);
            message.error('Có lỗi xảy ra khi tải danh sách hướng dẫn viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTourGuides();
    }, [pageIndex, pageSize, includeInactive]);

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPageIndex(0); // Reset to first page when searching
            fetchTourGuides();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const getRatingColor = (_rating: number) => {
        return '#faad14'; // Màu vàng giống quản lý shop
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const handleViewDetails = (guide: TourGuide) => {
        setSelectedGuide(guide);
        setDetailModalVisible(true);
    };

    const columns: ColumnsType<TourGuide> = [
        {
            title: 'Hướng dẫn viên',
            key: 'guide',
            width: 250,
            render: (_, record) => (
                <div className="guide-info">
                    <div className="guide-header">
                        <Avatar
                            size={40}
                            src={record.profileImageUrl}
                            icon={<UserOutlined />}
                            className="guide-avatar"
                        />
                        <div className="guide-details">
                            <div className="guide-name">{record.fullName}</div>
                            <div className="guide-username" style={{ fontSize: '12px', color: '#666' }}>
                                @{record.userName}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Kỹ năng',
            dataIndex: 'skills',
            key: 'skills',
            width: 150,
            render: (skills: string) => (
                <Tag color="purple" icon={<SafetyCertificateOutlined />}>
                    {skills}
                </Tag>
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
                    <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: '12px' }} />
                    <div
                        className="rating-score"
                        style={{ color: getRatingColor(rating) }}
                    >
                        <StarOutlined /> {rating?.toFixed(1) || 'N/A'}
                    </div>
                </div>
            ),
            sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            width: 200,
            render: (_, record) => (
                <div className="contact-info">
                    <div className="contact-item">
                        <PhoneOutlined /> {record.phoneNumber}
                    </div>
                    <div className="contact-item">
                        <MailOutlined /> {record.email}
                    </div>
                </div>
            ),
        },
        {
            title: 'Số tour đã dẫn',
            dataIndex: 'totalToursGuided',
            key: 'totalTours',
            width: 120,
            align: 'center',
            render: (total: number) => (
                <div className="tours-count">
                    <Badge
                        count={total || 0}
                        showZero
                        color="#1890ff"
                        style={{ backgroundColor: '#1890ff' }}
                    />
                    <div className="tours-icon">
                        <TeamOutlined />
                    </div>
                </div>
            ),
            sorter: (a, b) => (a.totalToursGuided || 0) - (b.totalToursGuided || 0),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <div className="status-display">
                    <Tag color={record.isAvailable ? 'green' : 'red'}>
                        {record.isAvailable ? 'Sẵn sàng' : 'Bận'}
                    </Tag>
                    <div className="availability-text" style={{ fontSize: '12px', color: '#666' }}>
                        {record.isAvailable ? 'Có thể nhận tour' : 'Không có sẵn'}
                    </div>
                </div>
            ),
            filters: [
                { text: 'Sẵn sàng', value: true },
                { text: 'Bận', value: false },
            ],
            onFilter: (value, record) => record.isAvailable === value,
        },
        {
            title: 'Ngày duyệt',
            dataIndex: 'approvedAt',
            key: 'approvedAt',
            width: 120,
            render: (date: string) => (
                <div className="date-display">
                    <CalendarOutlined />
                    <span>{formatDate(date)}</span>
                </div>
            ),
            sorter: (a, b) => new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime(),
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
        <div className={`tour-guide-management ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <Card>
                <div className="page-header">
                    <div className="header-title">
                        <UserOutlined className="header-icon" />
                        <h1>Quản lý hướng dẫn viên</h1>
                    </div>
                    <div className="header-stats">
                        <Tag color="blue" icon={<TeamOutlined />}>
                            Tổng: {totalCount}
                        </Tag>
                        <Tag color="green" icon={<TrophyOutlined />}>
                            Hoạt động: {tourGuides.filter(g => g.isAvailable).length}
                        </Tag>
                        <Tag color="red">
                            Bận: {tourGuides.filter(g => !g.isAvailable).length}
                        </Tag>
                    </div>
                </div>

                <div className="filters-section">
                    <Space size="middle" wrap>
                        <Input
                            placeholder="Tìm kiếm hướng dẫn viên..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />
                        <div className="filter-item">
                            <label>Hiển thị hướng dẫn viên không hoạt động:</label>
                            <Switch
                                checked={includeInactive}
                                onChange={setIncludeInactive}
                            />
                        </div>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={tourGuides}
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
                            `${range[0]}-${range[1]} của ${total} hướng dẫn viên`,
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
                title={null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={900}
                centered
                className={`tour-guide-detail-modal ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            >
                {selectedGuide && (
                    <div className="guide-detail-content">
                        {/* Header Section */}
                        <div className="guide-detail-header">
                            <div className="guide-avatar-large">
                                <Avatar
                                    size={120}
                                    src={selectedGuide.profileImageUrl}
                                    icon={<UserOutlined />}
                                    className="guide-avatar-border"
                                />
                                <div className="guide-status-badge">
                                    <Tag
                                        color={selectedGuide.isAvailable ? 'green' : 'red'}
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    >
                                        {selectedGuide.isAvailable ? 'Sẵn sàng' : 'Bận'}
                                    </Tag>
                                </div>
                            </div>
                            <div className="guide-header-info">
                                <h2 className="guide-name-title">
                                    {selectedGuide.fullName}
                                </h2>
                                <p className="guide-username-text">
                                    @{selectedGuide.userName}
                                </p>
                                <div className="guide-rating-header">
                                    <Rate
                                        disabled
                                        defaultValue={selectedGuide.rating}
                                        allowHalf
                                        style={{ fontSize: '16px' }}
                                    />
                                    <span className="rating-score">
                                        {selectedGuide.rating?.toFixed(1)}/5.0
                                    </span>
                                </div>
                                <div className="guide-skills-header">
                                    <Tag
                                        color="purple"
                                        icon={<SafetyCertificateOutlined />}
                                        style={{ fontSize: '13px', padding: '4px 12px' }}
                                    >
                                        {selectedGuide.skills}
                                    </Tag>
                                </div>
                            </div>
                            <div className="guide-stats">
                                <div className="stat-item">
                                    <div className="stat-number">
                                        {selectedGuide.totalToursGuided}
                                    </div>
                                    <div className="stat-label">Tour đã dẫn</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number stat-rating">
                                        {selectedGuide.rating?.toFixed(1) || 'N/A'}
                                    </div>
                                    <div className="stat-label">Đánh giá</div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="guide-detail-body">
                            <div className="detail-section">
                                <h3 className="section-title">
                                    <UserOutlined className="section-icon" />
                                    Thông tin cá nhân
                                </h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-label">
                                            <PhoneOutlined className="info-icon" />
                                            Số điện thoại
                                        </div>
                                        <div className="info-value">
                                            {selectedGuide.phoneNumber}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">
                                            <MailOutlined className="info-icon" />
                                            Email
                                        </div>
                                        <div className="info-value">
                                            {selectedGuide.email}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">
                                            <CalendarOutlined className="info-icon" />
                                            Ngày được duyệt
                                        </div>
                                        <div className="info-value">
                                            {formatDate(selectedGuide.approvedAt)}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-label">
                                            <UserOutlined className="info-icon" />
                                            ID hướng dẫn viên
                                        </div>
                                        <div className="info-value info-id">
                                            {selectedGuide.id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3 className="section-title">
                                    <SafetyCertificateOutlined className="section-icon" />
                                    Kinh nghiệm & Kỹ năng
                                </h3>
                                <div className="experience-content">
                                    <p className="experience-text">
                                        {selectedGuide.experience}
                                    </p>
                                </div>
                            </div>

                            {selectedGuide.notes && (
                                <div className="detail-section">
                                    <h3 className="section-title">
                                        <EditOutlined className="section-icon" />
                                        Ghi chú
                                    </h3>
                                    <div className="notes-content">
                                        <p className="notes-text">
                                            {selectedGuide.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="guide-detail-footer">
                            <Button
                                size="large"
                                onClick={() => setDetailModalVisible(false)}
                                style={{ minWidth: '100px' }}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TourGuideManagement;
