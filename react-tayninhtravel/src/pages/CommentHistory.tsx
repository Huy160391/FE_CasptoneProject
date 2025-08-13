import { Rate, Typography, Card, Table, Empty } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface CommentHistoryProps {
    data: Array<any>;
}

const CommentHistory = ({ data }: CommentHistoryProps) => {
    const { t } = useTranslation();

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={4}>
                        ⭐ {t('commentHistory.title', 'Lịch sử đánh giá')}
                    </Title>
                    <Text type="secondary">
                        {t('commentHistory.description', 'Quản lý và xem lại các đánh giá bạn đã để lại cho các tour')}
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
                            width: 150,
                            render: (rating) => <Rate disabled defaultValue={rating} />
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
};

export default CommentHistory;
