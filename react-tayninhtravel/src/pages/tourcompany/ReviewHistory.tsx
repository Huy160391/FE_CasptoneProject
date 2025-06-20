import React, { useState } from 'react';
import {
    Table,
    Card,
    DatePicker,
    Select,
    Rate,
    Button,
    Modal,
    Typography,
    Row,
    Col,
    Statistic,
    Input,
    Tag,
    Avatar,
    Progress
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    StarOutlined,
    UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './ReviewHistory.scss';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Review {
    id: string;
    bookingId: string;
    tourName: string;
    customerName: string;
    customerAvatar?: string;
    rating: number;
    comment: string;
    reviewDate: string;
    tourDate: string;
    response?: string;
    responseDate?: string;
    isPublic: boolean;
    helpful: number;
}

const ReviewHistory: React.FC = () => {
    const [reviews] = useState<Review[]>([
        {
            id: 'RV001',
            bookingId: 'BK001',
            tourName: 'Tour Núi Bà Đen 1 ngày',
            customerName: 'Nguyễn Văn A',
            customerAvatar: 'https://i.imgur.com/4AiXzf8.jpg',
            rating: 5,
            comment: 'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, cảnh đẹp. Sẽ quay lại lần nữa.',
            reviewDate: '2024-03-16T10:30:00',
            tourDate: '2024-03-15',
            response: 'Cảm ơn anh đã tin tưởng dịch vụ của chúng tôi. Chúng tôi mong được phục vụ anh trong những chuyến đi tiếp theo.',
            responseDate: '2024-03-16T14:20:00',
            isPublic: true,
            helpful: 12
        },
        {
            id: 'RV002',
            bookingId: 'BK002',
            tourName: 'Tour Tòa Thánh Cao Đài',
            customerName: 'Trần Thị B',
            customerAvatar: 'https://i.imgur.com/4AiXzf8.jpg',
            rating: 4,
            comment: 'Tour hay, tìm hiểu được nhiều về văn hóa tôn giáo. Tuy nhiên thời gian hơi gấp.',
            reviewDate: '2024-03-14T16:45:00',
            tourDate: '2024-03-14',
            isPublic: true,
            helpful: 8
        },
        {
            id: 'RV003',
            bookingId: 'BK003',
            tourName: 'Tour Suối Đá',
            customerName: 'Lê Văn C',
            rating: 3,
            comment: 'Tour bình thường, cảnh đẹp nhưng phương tiện di chuyển không tốt lắm.',
            reviewDate: '2024-03-13T20:15:00',
            tourDate: '2024-03-13',
            isPublic: true,
            helpful: 3
        },
        {
            id: 'RV004',
            bookingId: 'BK004',
            tourName: 'Tour Hồ Dầu Tiếng',
            customerName: 'Phạm Thị D',
            customerAvatar: 'https://i.imgur.com/4AiXzf8.jpg',
            rating: 5,
            comment: 'Trải nghiệm tuyệt vời! Không gian yên tĩnh, thư giãn. Nhân viên chuyên nghiệp.',
            reviewDate: '2024-03-12T19:30:00',
            tourDate: '2024-03-12',
            response: 'Rất vui khi chị hài lòng với dịch vụ. Hẹn gặp lại chị trong các tour tiếp theo!',
            responseDate: '2024-03-13T09:15:00',
            isPublic: true,
            helpful: 15
        },
        {
            id: 'RV005',
            bookingId: 'BK005',
            tourName: 'Tour Núi Bà Đen 1 ngày',
            customerName: 'Hoàng Văn E',
            rating: 2,
            comment: 'Dịch vụ không như mong đợi. Hướng dẫn viên thiếu kinh nghiệm, lịch trình không rõ ràng.',
            reviewDate: '2024-03-11T11:20:00',
            tourDate: '2024-03-10',
            isPublic: false,
            helpful: 1
        }
    ]);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [searchText, setSearchText] = useState('');

    const columns = [
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_: any, record: Review) => (
                <div className="customer-info">
                    <Avatar
                        src={record.customerAvatar}
                        icon={<UserOutlined />}
                        size="small"
                    />
                    <span style={{ marginLeft: 8 }}>{record.customerName}</span>
                </div>
            ),
        },
        {
            title: 'Tour',
            dataIndex: 'tourName',
            key: 'tourName',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: any, record: Review) =>
                record.tourName.toLowerCase().includes(value.toString().toLowerCase()) ||
                record.customerName.toLowerCase().includes(value.toString().toLowerCase()),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: number) => <Rate disabled defaultValue={rating} />,
            sorter: (a: Review, b: Review) => a.rating - b.rating,
        },
        {
            title: 'Bình luận',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment: string) => (
                <div className="comment-preview">
                    {comment.length > 50 ? `${comment.substring(0, 50)}...` : comment}
                </div>
            ),
        },
        {
            title: 'Ngày đánh giá',
            dataIndex: 'reviewDate',
            key: 'reviewDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: Review, b: Review) => dayjs(a.reviewDate).unix() - dayjs(b.reviewDate).unix(),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_: any, record: Review) => (
                <div>
                    <Tag color={record.isPublic ? 'green' : 'orange'}>
                        {record.isPublic ? 'Công khai' : 'Riêng tư'}
                    </Tag>
                    {record.response && (
                        <Tag color="blue">Đã phản hồi</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Hữu ích',
            dataIndex: 'helpful',
            key: 'helpful',
            render: (helpful: number) => `${helpful} lượt`,
            sorter: (a: Review, b: Review) => a.helpful - b.helpful,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: Review) => (
                <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handleViewDetail(record)}
                >
                    Xem
                </Button>
            ),
        },
    ];

    const handleViewDetail = (review: Review) => {
        Modal.info({
            title: `Đánh giá của ${review.customerName}`,
            width: 700,
            content: (
                <div className="review-detail">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <div className="review-header">
                                <Avatar
                                    src={review.customerAvatar}
                                    icon={<UserOutlined />}
                                    size="large"
                                />
                                <div className="review-info">
                                    <h4>{review.customerName}</h4>
                                    <Rate disabled defaultValue={review.rating} />
                                    <p className="review-date">
                                        Đánh giá ngày {dayjs(review.reviewDate).format('DD/MM/YYYY HH:mm')}
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col span={24}>
                            <p><strong>Tour:</strong> {review.tourName}</p>
                            <p><strong>Ngày tham gia:</strong> {dayjs(review.tourDate).format('DD/MM/YYYY')}</p>
                            <p><strong>Booking ID:</strong> {review.bookingId}</p>
                        </Col>
                        <Col span={24}>
                            <h4>Bình luận:</h4>
                            <Paragraph>{review.comment}</Paragraph>
                        </Col>
                        {review.response && (
                            <Col span={24}>
                                <h4>Phản hồi của bạn:</h4>
                                <div className="response-box">
                                    <Paragraph>{review.response}</Paragraph>
                                    <p className="response-date">
                                        Phản hồi ngày {dayjs(review.responseDate).format('DD/MM/YYYY HH:mm')}
                                    </p>
                                </div>
                            </Col>
                        )}
                        <Col span={24}>
                            <p><strong>Trạng thái:</strong>
                                <Tag color={review.isPublic ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                                    {review.isPublic ? 'Công khai' : 'Riêng tư'}
                                </Tag>
                            </p>
                            <p><strong>Số lượt hữu ích:</strong> {review.helpful}</p>
                        </Col>
                    </Row>
                </div>
            ),
        });
    };

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
    };

    const filteredReviews = reviews.filter(review => {
        // Filter by date range
        if (dateRange && dateRange.length === 2) {
            const reviewDate = dayjs(review.reviewDate);
            if (reviewDate.isBefore(dateRange[0], 'day') || reviewDate.isAfter(dateRange[1], 'day')) {
                return false;
            }
        }

        // Filter by rating
        if (ratingFilter !== 'all' && review.rating.toString() !== ratingFilter) {
            return false;
        }

        return true;
    });

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length,
        percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
    }));

    return (
        <div className="review-history">
            <div className="page-header">
                <Title level={2}>Lịch sử đánh giá</Title>
                <div className="header-actions">
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                    />
                    <Select
                        value={ratingFilter}
                        onChange={setRatingFilter}
                        style={{ width: 120 }}
                    >
                        <Option value="all">Tất cả</Option>
                        <Option value="5">5 sao</Option>
                        <Option value="4">4 sao</Option>
                        <Option value="3">3 sao</Option>
                        <Option value="2">2 sao</Option>
                        <Option value="1">1 sao</Option>
                    </Select>
                </div>
            </div>

            <Row gutter={16} className="stats-cards">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng đánh giá"
                            value={reviews.length}
                            prefix={<StarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Đánh giá trung bình"
                            value={averageRating}
                            precision={1}
                            prefix={<StarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Đánh giá tích cực"
                            value={reviews.filter(r => r.rating >= 4).length}
                            suffix={`/${reviews.length}`}
                            prefix={<StarOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col xs={24} lg={8}>
                    <Card title="Phân bố đánh giá" className="rating-distribution">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                            <div key={rating} className="rating-row">
                                <div className="rating-label">
                                    <Rate disabled defaultValue={rating} />
                                    <span>({count})</span>
                                </div>
                                <Progress
                                    percent={percentage}
                                    showInfo={false}
                                    strokeColor="#faad14"
                                />
                            </div>
                        ))}
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card>
                        <div className="table-toolbar">
                            <Input
                                placeholder="Tìm kiếm theo tour, khách hàng"
                                prefix={<SearchOutlined />}
                                onChange={e => setSearchText(e.target.value)}
                                className="search-input"
                                allowClear
                            />
                        </div>
                        <Table
                            dataSource={filteredReviews}
                            columns={columns}
                            rowKey="id"
                            pagination={{ pageSize: 8 }}
                            scroll={{ x: 1000 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReviewHistory;
