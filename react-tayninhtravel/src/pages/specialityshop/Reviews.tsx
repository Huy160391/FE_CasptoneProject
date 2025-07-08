import { useState } from 'react';
import { Table, Card, Button, Input, Space, Tag, Modal, Rate, Select, Avatar } from 'antd';
import { EyeOutlined, SearchOutlined, StarFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './Reviews.scss';

const { Search } = Input;
const { Option } = Select;

interface Review {
    key: string;
    id: string;
    productName: string;
    customerName: string;
    customerAvatar?: string;
    rating: number;
    comment: string;
    reviewDate: string;
    status: 'published' | 'pending' | 'hidden';
}

const SpecialityShopReviews = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedRating, setSelectedRating] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    // Mock data
    const reviews: Review[] = [
        {
            key: '1',
            id: 'REV-001',
            productName: 'Bánh tráng Tây Ninh',
            customerName: 'Nguyễn Văn A',
            customerAvatar: 'https://i.imgur.com/4AiXzf8.jpg',
            rating: 5,
            comment: 'Sản phẩm rất ngon, giòn tan và thơm. Đóng gói cẩn thận, giao hàng nhanh. Sẽ mua lại lần sau.',
            reviewDate: '2025-06-28 10:30',
            status: 'published'
        },
        {
            key: '2',
            id: 'REV-002',
            productName: 'Nước mắm Phú Quốc',
            customerName: 'Trần Thị B',
            rating: 4,
            comment: 'Nước mắm đậm đà, chất lượng tốt. Giá cả hợp lý so với chất lượng.',
            reviewDate: '2025-06-27 14:15',
            status: 'published'
        },
        {
            key: '3',
            id: 'REV-003',
            productName: 'Kẹo dừa Bến Tre',
            customerName: 'Lê Văn C',
            rating: 3,
            comment: 'Kẹo dừa ngọt vừa phải, nhưng hơi cứng. Có thể cải thiện texture.',
            reviewDate: '2025-06-26 09:45',
            status: 'pending'
        },
        {
            key: '4',
            id: 'REV-004',
            productName: 'Chà bông Hà Nội',
            customerName: 'Phạm Thị D',
            rating: 5,
            comment: 'Chà bông thơm ngon, xốp mịn. Đúng vị truyền thống Hà Nội. Rất hài lòng!',
            reviewDate: '2025-06-25 16:20',
            status: 'published'
        },
        {
            key: '5',
            id: 'REV-005',
            productName: 'Bánh phồng tôm',
            customerName: 'Hoàng Văn E',
            rating: 2,
            comment: 'Sản phẩm không đạt chất lượng như mong đợi. Ít vị tôm và hơi mặn.',
            reviewDate: '2025-06-24 11:10',
            status: 'hidden'
        },
        {
            key: '6',
            id: 'REV-006',
            productName: 'Bánh tráng Tây Ninh',
            customerName: 'Võ Thị F',
            rating: 4,
            comment: 'Bánh tráng giòn, thơm. Giao hàng đúng hẹn. Sản phẩm chất lượng tốt.',
            reviewDate: '2025-06-23 08:30',
            status: 'published'
        }
    ];

    const handleView = (review: Review) => {
        setSelectedReview(review);
        setIsModalVisible(true);
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published': return 'Đã xuất bản';
            case 'pending': return 'Chờ duyệt';
            case 'hidden': return 'Đã ẩn';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'green';
            case 'pending': return 'orange';
            case 'hidden': return 'red';
            default: return 'default';
        }
    };

    const getAverageRating = () => {
        const publishedReviews = reviews.filter(r => r.status === 'published');
        if (publishedReviews.length === 0) return 0;
        const total = publishedReviews.reduce((sum, review) => sum + review.rating, 0);
        return (total / publishedReviews.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const publishedReviews = reviews.filter(r => r.status === 'published');

        publishedReviews.forEach(review => {
            distribution[review.rating as keyof typeof distribution]++;
        });

        return distribution;
    };

    const columns: ColumnsType<Review> = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text: string) => <span className="product-name">{text}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text: string, record: Review) => (
                <div className="customer-info">
                    <Avatar src={record.customerAvatar} size="small">
                        {text.charAt(0)}
                    </Avatar>
                    <span className="customer-name">{text}</span>
                </div>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => (
                <div className="rating-display">
                    <Rate disabled defaultValue={rating} />
                    <span className="rating-number">({rating}/5)</span>
                </div>
            ),
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: 'Ngày đánh giá',
            dataIndex: 'reviewDate',
            key: 'reviewDate',
            sorter: (a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime(),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record: Review) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.productName.toLowerCase().includes(searchText.toLowerCase()) ||
            review.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchText.toLowerCase());
        const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
        const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
        return matchesSearch && matchesRating && matchesStatus;
    });

    const ratingDistribution = getRatingDistribution();

    return (
        <div className="reviews-page">
            <div className="page-header">
                <h1>Đánh giá sản phẩm</h1>
                <div className="header-actions">
                    <Space>
                        <Search
                            placeholder="Tìm kiếm đánh giá..."
                            allowClear
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            prefix={<SearchOutlined />}
                        />
                        <Select
                            value={selectedRating}
                            onChange={setSelectedRating}
                            style={{ width: 120 }}
                        >
                            <Option value="all">Tất cả sao</Option>
                            <Option value="5">5 sao</Option>
                            <Option value="4">4 sao</Option>
                            <Option value="3">3 sao</Option>
                            <Option value="2">2 sao</Option>
                            <Option value="1">1 sao</Option>
                        </Select>
                        <Select
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            style={{ width: 150 }}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="published">Đã xuất bản</Option>
                            <Option value="pending">Chờ duyệt</Option>
                            <Option value="hidden">Đã ẩn</Option>
                        </Select>
                    </Space>
                </div>
            </div>

            <div className="reviews-summary">
                <Card className="rating-overview">
                    <div className="overall-rating">
                        <div className="rating-score">
                            <span className="score">{getAverageRating()}</span>
                            <StarFilled className="star-icon" />
                        </div>
                        <div className="rating-text">
                            Đánh giá trung bình<br />
                            ({reviews.filter(r => r.status === 'published').length} đánh giá)
                        </div>
                    </div>
                    <div className="rating-breakdown">
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="rating-row">
                                <span>{star} sao</span>
                                <div className="rating-bar">
                                    <div
                                        className="rating-fill"
                                        style={{
                                            width: `${(ratingDistribution[star as keyof typeof ratingDistribution] / reviews.filter(r => r.status === 'published').length) * 100 || 0}%`
                                        }}
                                    />
                                </div>
                                <span>{ratingDistribution[star as keyof typeof ratingDistribution]}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card className="reviews-table">
                <Table
                    columns={columns}
                    dataSource={filteredReviews}
                    pagination={{
                        current: 1,
                        pageSize: 10,
                        total: filteredReviews.length,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đánh giá`,
                    }}
                    locale={{
                        emptyText: 'Không có đánh giá nào'
                    }}
                />
            </Card>

            <Modal
                title="Chi tiết đánh giá"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedReview && (
                    <div className="review-detail">
                        <div className="review-header">
                            <div className="customer-info">
                                <Avatar src={selectedReview.customerAvatar} size="large">
                                    {selectedReview.customerName.charAt(0)}
                                </Avatar>
                                <div className="customer-details">
                                    <div className="customer-name">{selectedReview.customerName}</div>
                                    <div className="review-date">{selectedReview.reviewDate}</div>
                                </div>
                            </div>
                            <Tag color={getStatusColor(selectedReview.status)}>
                                {getStatusText(selectedReview.status)}
                            </Tag>
                        </div>

                        <div className="review-content">
                            <div className="product-name">
                                <strong>Sản phẩm:</strong> {selectedReview.productName}
                            </div>

                            <div className="rating-section">
                                <strong>Đánh giá:</strong>
                                <div className="rating-display">
                                    <Rate disabled defaultValue={selectedReview.rating} />
                                    <span className="rating-number">({selectedReview.rating}/5)</span>
                                </div>
                            </div>

                            <div className="comment-section">
                                <strong>Nhận xét:</strong>
                                <div className="comment-text">{selectedReview.comment}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SpecialityShopReviews;
