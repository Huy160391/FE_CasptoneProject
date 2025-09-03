import React, { useEffect, useState } from 'react';
import { Typography, Card, Table, Empty, Spin, Alert, Button, Tag, Row, Col } from 'antd';
import { ReloadOutlined, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { getUserFeedback, UserFeedback } from '../services/tourBookingService';

const { Title, Text } = Typography;

interface CommentHistoryProps {
    data?: Array<any>; // Keep for backward compatibility
}

const CommentHistory: React.FC<CommentHistoryProps> = ({ data }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuthStore();

    const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadFeedbacks = async () => {
        if (!token || !isAuthenticated) {
            setError('Vui lòng đăng nhập để xem lịch sử đánh giá');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await getUserFeedback(token);

            if (response.success && response.data) {
                setFeedbacks(response.data);
            } else {
                setError(response.message || 'Không thể tải lịch sử đánh giá');
            }
        } catch (error: any) {
            console.error('Error loading feedbacks:', error);
            setError(error.message || 'Có lỗi xảy ra khi tải lịch sử đánh giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeedbacks();
    }, [token, isAuthenticated]);

    const handleRefresh = () => {
        loadFeedbacks();
    };

    const handleViewDetail = (feedback: UserFeedback) => {
        if (feedback.type === 'Tour') {
            navigate(`/tour-details/${feedback.itemId}`);
        } else if (feedback.type === 'Product') {
            navigate(`/product/${feedback.itemId}`);
        }
    };

    // If using legacy data prop
    if (data) {
        return (
            <div>
                <Card>
                    <div style={{ marginBottom: 16 }}>
                        <Title level={4}>
                            {t('commentHistory.title', 'Lịch sử đánh giá')}
                        </Title>
                        <Text type="secondary">
                            {t('commentHistory.description', 'Quản lý và xem lại các đánh giá bạn đã để lại')}
                        </Text>
                    </div>

                    <Table
                        dataSource={data}
                        rowKey={(_, index) => index?.toString() || '0'}
                        pagination={false}
                        scroll={{ x: 800 }}
                        locale={{
                            emptyText: data.length === 0 ? (
                                <Empty
                                    description={t('commentHistory.noReviews', 'Bạn chưa có đánh giá nào')}
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : undefined
                        }}
                        columns={[
                            {
                                title: t('commentHistory.columns.tourName', 'Tên tour'),
                                dataIndex: 'tourName',
                                key: 'tourName',
                                width: 200,
                                render: (text) => <Text strong>{text}</Text>
                            },
                            {
                                title: t('commentHistory.columns.rating', 'Đánh giá'),
                                dataIndex: 'rating',
                                key: 'rating',
                                width: 100,
                                align: 'center',
                                render: (rating) => (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />
                                        <Text style={{ fontWeight: 'bold' }}>
                                            {rating}/5
                                        </Text>
                                    </div>
                                )
                            },
                            {
                                title: t('commentHistory.columns.comment', 'Bình luận'),
                                dataIndex: 'comment',
                                key: 'comment',
                                width: 300,
                                render: (comment) => (
                                    <div style={{
                                        maxWidth: '300px',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'normal'
                                    }}>
                                        {comment}
                                    </div>
                                )
                            },
                            {
                                title: t('commentHistory.columns.date', 'Ngày đánh giá'),
                                dataIndex: 'date',
                                key: 'date',
                                width: 120,
                                render: (date) => <Text type="secondary">{date}</Text>
                            }
                        ]}
                    />
                </Card>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Alert
                message="Vui lòng đăng nhập"
                description="Bạn cần đăng nhập để xem lịch sử đánh giá"
                type="warning"
                showIcon
            />
        );
    }

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={4}>
                                {t('commentHistory.title', 'Lịch sử đánh giá')}
                            </Title>
                            <Text type="secondary">
                                {t('commentHistory.description', 'Quản lý và xem lại các đánh giá bạn đã để lại')}
                            </Text>
                        </Col>
                        <Col>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={loading}
                            >
                                {t('common.refresh', 'Làm mới')}
                            </Button>
                        </Col>
                    </Row>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert
                        message="Có lỗi xảy ra"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" onClick={handleRefresh}>
                                Thử lại
                            </Button>
                        }
                    />
                ) : (
                    <Table
                        dataSource={feedbacks}
                        rowKey="itemId"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} đánh giá`,
                        }}
                        scroll={{ x: 900 }}
                        locale={{
                            emptyText: feedbacks.length === 0 ? (
                                <Empty
                                    description="Bạn chưa có đánh giá nào"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : undefined
                        }}
                        columns={[
                            {
                                title: 'Loại',
                                dataIndex: 'type',
                                key: 'type',
                                width: 100,
                                render: (type) => (
                                    <Tag color={type === 'Tour' ? 'blue' : 'green'}>
                                        {type === 'Tour' ? 'Tour' : 'Sản phẩm'}
                                    </Tag>
                                )
                            },
                            {
                                title: 'Tên',
                                dataIndex: 'itemName',
                                key: 'itemName',
                                width: 250,
                                render: (text, record) => (
                                    <Button
                                        type="link"
                                        style={{
                                            padding: 0,
                                            height: 'auto',
                                            textAlign: 'left',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word'
                                        }}
                                        onClick={() => handleViewDetail(record)}
                                    >
                                        <Text strong>{text}</Text>
                                    </Button>
                                )
                            },
                            {
                                title: 'Đánh giá',
                                dataIndex: 'rating',
                                key: 'rating',
                                width: 100,
                                align: 'center',
                                render: (rating) => (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />
                                        <Text style={{ fontWeight: 'bold' }}>
                                            {rating}/5
                                        </Text>
                                    </div>
                                )
                            },
                            {
                                title: 'Bình luận',
                                dataIndex: 'comment',
                                key: 'comment',
                                width: 300,
                                render: (comment) => (
                                    <div style={{
                                        maxWidth: '300px',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'normal'
                                    }}>
                                        {comment}
                                    </div>
                                )
                            },
                            {
                                title: 'Ngày đánh giá',
                                dataIndex: 'createdAt',
                                key: 'createdAt',
                                width: 150,
                                render: (date) => (
                                    <Text type="secondary">
                                        {new Date(date).toLocaleDateString('vi-VN')}
                                    </Text>
                                )
                            }
                        ]}
                    />
                )}

                {!loading && !error && feedbacks.length > 0 && (
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Text type="secondary">
                            <StarOutlined style={{ marginRight: 4 }} />
                            Tổng cộng: {feedbacks.length} đánh giá
                        </Text>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CommentHistory;
