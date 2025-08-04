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
    Descriptions,
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
    userId: string;
    applicationId: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    experience: string;
    skills: string;
    isAvailable: boolean;
    rating: number;
    totalToursGuided: number;
    approvedAt: string;
    approvedById?: string;
    createdAt: string;
    createdById?: string;
    updatedAt?: string;
    updatedById?: string;
    userAvatar?: string;
    specialization?: string;
    experienceYears?: number;
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
                includeInactive,
                searchTerm: searchText
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

    const getExperienceLevel = (years: number | string) => {
        const yearsNum = typeof years === 'string' ? parseInt(years) || 0 : years || 0;
        if (yearsNum < 1) return { level: 'Mới', color: 'blue' };
        if (yearsNum < 3) return { level: 'Có kinh nghiệm', color: 'green' };
        if (yearsNum < 5) return { level: 'Giàu kinh nghiệm', color: 'orange' };
        return { level: 'Chuyên gia', color: 'red' };
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return '#52c41a';
        if (rating >= 4.0) return '#faad14';
        if (rating >= 3.5) return '#fa8c16';
        return '#ff4d4f';
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

    const handleToggleStatus = async (_guideId: string, _currentStatus: boolean) => {
        try {
            // TODO: Implement toggle guide status API
            message.info('Tính năng đang phát triển');
        } catch (error) {
            message.error('Không thể cập nhật trạng thái hướng dẫn viên');
        }
    };

    const columns: ColumnsType<TourGuide> = [
        {
            title: 'Hướng dẫn viên',
            key: 'guide',
            width: 300,
            render: (_, record) => (
                <div className="guide-info">
                    <div className="guide-header">
                        <Avatar
                            size={40}
                            src={record.userAvatar}
                            icon={<UserOutlined />}
                            className="guide-avatar"
                        />
                        <div className="guide-details">
                            <div className="guide-name">{record.fullName}</div>
                            <div className="guide-specialization">
                                {record.specialization && (
                                    <Tag color="purple" icon={<SafetyCertificateOutlined />}>
                                        {record.specialization}
                                    </Tag>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="guide-experience">
                        {(() => {
                            const exp = getExperienceLevel(record.experienceYears || 0);
                            return <Tag color={exp.color}>{exp.level}</Tag>;
                        })()}
                    </div>
                </div>
            ),
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
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            align: 'center',
            render: (rating: number) => (
                <div className="rating-display">
                    <div
                        className="rating-score"
                        style={{ color: getRatingColor(rating) }}
                    >
                        <StarOutlined /> {rating?.toFixed(1) || 'N/A'}
                    </div>
                    <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: '12px' }} />
                </div>
            ),
            sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
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
                    <Switch
                        checked={record.isAvailable}
                        onChange={(_checked) => handleToggleStatus(record.id, record.isAvailable)}
                        checkedChildren="Sẵn sàng"
                        unCheckedChildren="Bận"
                        size="small"
                    />
                    <div className="availability-text">
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
                title={
                    <div className="modal-title">
                        <UserOutlined /> Chi tiết hướng dẫn viên
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
                {selectedGuide && (
                    <div className="guide-detail">
                        <div className="guide-avatar-section">
                            <Avatar
                                size={80}
                                src={selectedGuide.userAvatar}
                                icon={<UserOutlined />}
                            />
                            <div className="guide-basic-info">
                                <h3>{selectedGuide.fullName}</h3>
                                <div className="rating-section">
                                    <Rate disabled defaultValue={selectedGuide.rating} allowHalf />
                                    <span className="rating-text">
                                        {selectedGuide.rating?.toFixed(1)}/5.0
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="ID hướng dẫn viên">
                                {selectedGuide.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedGuide.isAvailable ? 'green' : 'red'}>
                                    {selectedGuide.isAvailable ? 'Sẵn sàng' : 'Bận'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <PhoneOutlined /> {selectedGuide.phoneNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <MailOutlined /> {selectedGuide.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tour đã dẫn">
                                <Badge
                                    count={selectedGuide.totalToursGuided}
                                    showZero
                                    color="#1890ff"
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Đánh giá trung bình">
                                <div style={{ color: getRatingColor(selectedGuide.rating) }}>
                                    <StarOutlined /> {selectedGuide.rating?.toFixed(1)}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày được duyệt">
                                <CalendarOutlined /> {formatDate(selectedGuide.approvedAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tham gia">
                                <CalendarOutlined /> {formatDate(selectedGuide.createdAt)}
                            </Descriptions.Item>
                            {selectedGuide.specialization && (
                                <Descriptions.Item label="Chuyên môn" span={2}>
                                    <Tag color="purple" icon={<SafetyCertificateOutlined />}>
                                        {selectedGuide.specialization}
                                    </Tag>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Kinh nghiệm" span={2}>
                                {selectedGuide.experience}
                            </Descriptions.Item>
                            <Descriptions.Item label="Kỹ năng" span={2}>
                                {selectedGuide.skills}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TourGuideManagement;
