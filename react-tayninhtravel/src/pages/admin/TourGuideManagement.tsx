import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Tag,
    message,
    Modal
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined,
    TrophyOutlined,
    FileTextOutlined,
    IdcardOutlined
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
    const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Fetch tour guides data
    const fetchTourGuides = async () => {
        try {
            setLoading(true);
            const response = await adminService.getTourGuides({
                pageIndex,
                pageSize,
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
    }, [pageIndex, pageSize]);

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPageIndex(0); // Reset to first page when searching
            fetchTourGuides();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const columns: ColumnsType<TourGuide> = [
        {
            title: 'Tên hướng dẫn viên',
            dataIndex: 'fullName',
            key: 'fullName',
            width: 200,
            render: (name: string, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>@{record.userName}</div>
                </div>
            ),
        },
        {
            title: 'Kỹ năng',
            dataIndex: 'skills',
            key: 'skills',
            width: 150,
            render: (skills: string) => (
                <Tag color="purple">{skills}</Tag>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            align: 'center',
            render: (rating: number) => (
                <span style={{ color: '#faad14', fontWeight: 500 }}>{rating?.toFixed(1) || 'N/A'}</span>
            ),
            sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 130,
            render: (phone: string) => (
                <span>{phone}</span>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 180,
            render: (email: string) => (
                <span>{email}</span>
            ),
        },
        {
            title: 'Số tour đã dẫn',
            dataIndex: 'totalToursGuided',
            key: 'totalToursGuided',
            width: 120,
            align: 'center',
            render: (total: number) => (
                <span style={{ fontWeight: 500 }}>{total || 0}</span>
            ),
            sorter: (a, b) => (a.totalToursGuided || 0) - (b.totalToursGuided || 0),
        },
        // {
        //     title: 'Trạng thái',
        //     key: 'status',
        //     width: 120,
        //     align: 'center',
        //     render: (_, record) => (
        //         <Tag color={record.isAvailable ? 'green' : 'red'}>
        //             {record.isAvailable ? 'Hoạt động' : 'Tạm dừng'}
        //         </Tag>
        //     ),
        //     filters: [
        //         { text: 'Hoạt động', value: true },
        //         { text: 'Tạm dừng', value: false },
        //     ],
        //     onFilter: (value, record) => record.isAvailable === value,
        // },
        {
            title: 'Ngày duyệt',
            dataIndex: 'approvedAt',
            key: 'approvedAt',
            width: 120,
            render: (date: string) => (
                <span>{formatDate(date)}</span>
            ),
            sorter: (a, b) => new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime(),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelectedGuide(record); setDetailModalVisible(true); }} />
            ),
        },
    ];

    return (
        <div className={`cv-management-page${isDarkMode ? ' dark-mode' : ''}`}>
            <div className="page-header">
                <h1>Quản lý hướng dẫn viên</h1>
                <div className="header-actions">
                    <Input
                        placeholder="Tìm kiếm hướng dẫn viên..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                </div>
            </div>
            <Table
                dataSource={tourGuides}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pageIndex + 1,
                    pageSize: pageSize,
                    total: totalCount,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hướng dẫn viên`,
                    onChange: (page, size) => {
                        setPageIndex(page - 1);
                        if (size !== pageSize) {
                            setPageSize(size);
                            setPageIndex(0);
                        }
                    }
                }}
                className="cv-table"
            />
            <Modal
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                closable={false}
                title={null}
                width={800}
                footer={null}
                className={`tour-guide-detail-modal${isDarkMode ? ' dark' : ''}`}
            >
                {selectedGuide && (
                    <div className={`guide-detail-modal${isDarkMode ? ' dark' : ''}`}>
                        {/* Header với gradient */}
                        <div className={`modal-header${isDarkMode ? ' dark' : ''}`}>
                            <div className="header-content">
                                <div className="guide-avatar-section">
                                    <div className="guide-avatar-large">
                                        {selectedGuide.profileImageUrl ? (
                                            <img src={selectedGuide.profileImageUrl} alt={selectedGuide.fullName} />
                                        ) : (
                                            <UserOutlined />
                                        )}
                                    </div>
                                    <div className="guide-basic-info">
                                        <h1 className="guide-name">{selectedGuide.fullName}</h1>
                                        <div className="guide-username">@{selectedGuide.userName}</div>
                                        <div className="guide-status-badge">
                                            <Tag color={selectedGuide.isAvailable ? 'green' : 'red'}>
                                                {selectedGuide.isAvailable ? 'Hoạt động' : 'Tạm dừng'}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>
                                <div className="guide-stats">
                                    <div className="stat-item">
                                        <div className="stat-number">{selectedGuide.rating?.toFixed(1) || 'N/A'}</div>
                                        <div className="stat-label">Đánh giá</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">{selectedGuide.totalToursGuided}</div>
                                        <div className="stat-label">Tour đã dẫn</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills Overview */}
                        <div className={`skills-overview${isDarkMode ? ' dark' : ''}`}>
                            <div className="section-title">
                                <TrophyOutlined />
                                Kỹ năng chuyên môn
                            </div>
                            <div className="skills-content">
                                <Tag color="purple" className="skill-tag">{selectedGuide.skills}</Tag>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className={`info-section${isDarkMode ? ' dark' : ''}`}>
                            <div className="section-title">
                                <IdcardOutlined />
                                Thông tin liên hệ
                            </div>
                            <div className="info-grid">
                                <div className="info-item">
                                    <PhoneOutlined className="info-icon" />
                                    <span className="info-label">Số điện thoại:</span>
                                    <span className="info-value">{selectedGuide.phoneNumber}</span>
                                </div>
                                <div className="info-item">
                                    <MailOutlined className="info-icon" />
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{selectedGuide.email}</span>
                                </div>
                                <div className="info-item">
                                    <CalendarOutlined className="info-icon" />
                                    <span className="info-label">Ngày duyệt:</span>
                                    <span className="info-value">{formatDate(selectedGuide.approvedAt)}</span>
                                </div>
                                <div className="info-item">
                                    <IdcardOutlined className="info-icon" />
                                    <span className="info-label">ID hướng dẫn viên:</span>
                                    <span className="info-value guide-id">{selectedGuide.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className={`experience-section${isDarkMode ? ' dark' : ''}`}>
                            <div className="section-title">
                                <FileTextOutlined />
                                Kinh nghiệm làm việc
                            </div>
                            <div className="experience-content">
                                {selectedGuide.experience}
                            </div>
                        </div>

                        {/* Notes Section */}
                        {selectedGuide.notes && (
                            <div className={`notes-section${isDarkMode ? ' dark' : ''}`}>
                                <div className="section-title">
                                    <FileTextOutlined />
                                    Ghi chú
                                </div>
                                <div className="notes-content">
                                    {selectedGuide.notes}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="modal-footer">
                            <Button size="large" onClick={() => setDetailModalVisible(false)}>
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
