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
    EyeOutlined
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
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Tag color={record.isAvailable ? 'green' : 'red'}>
                    {record.isAvailable ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Tạm dừng', value: false },
            ],
            onFilter: (value, record) => record.isAvailable === value,
        },
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
                title={selectedGuide ? selectedGuide.fullName : null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={700}
                centered
                className="cv-detail-modal"
            >
                {selectedGuide && (
                    <div className="guide-detail-content">
                        <div className="guide-detail-header">
                            <div className="guide-avatar">{selectedGuide.fullName.charAt(0)}</div>
                            <div className="guide-info">
                                <div className="guide-title">
                                    <h2>{selectedGuide.fullName}</h2>
                                    <Tag color={selectedGuide.isAvailable ? 'green' : 'red'}>{selectedGuide.isAvailable ? 'Hoạt động' : 'Tạm dừng'}</Tag>
                                </div>
                                <div className="guide-username">@{selectedGuide.userName}</div>
                                <div className="guide-meta">
                                    <Tag color="purple">{selectedGuide.skills}</Tag>
                                    <span className="guide-rating">Đánh giá: {selectedGuide.rating?.toFixed(1) || 'N/A'}</span>
                                    <span className="guide-tours">Tour đã dẫn: {selectedGuide.totalToursGuided}</span>
                                </div>
                            </div>
                        </div>
                        <div className="guide-detail-body">
                            <div>
                                <h3>Thông tin cá nhân</h3>
                                <div><b>Số điện thoại:</b> {selectedGuide.phoneNumber}</div>
                                <div><b>Email:</b> {selectedGuide.email}</div>
                                <div><b>Ngày duyệt:</b> {formatDate(selectedGuide.approvedAt)}</div>
                                <div><b>ID:</b> <span className="guide-id">{selectedGuide.id}</span></div>
                            </div>
                            <div>
                                <h3>Kinh nghiệm & Kỹ năng</h3>
                                <div>{selectedGuide.experience}</div>
                            </div>
                        </div>
                        {selectedGuide.notes && (
                            <div className="guide-notes">
                                <h3>Ghi chú</h3>
                                <div>{selectedGuide.notes}</div>
                            </div>
                        )}
                        <div className="guide-detail-footer">
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
