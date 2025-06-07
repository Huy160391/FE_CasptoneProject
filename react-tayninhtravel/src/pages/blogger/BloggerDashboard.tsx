import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space } from 'antd';
import {
    FileTextOutlined,
    EyeOutlined,
    LikeOutlined,
    EditOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import './BloggerDashboard.scss';

interface BlogPost {
    id: string;
    title: string;
    status: 'published' | 'draft' | 'pending';
    views: number;
    likes: number;
    createdAt: string;
}

const BloggerDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [posts, setPosts] = useState<BlogPost[]>([]);

    // Mock data for demonstration
    useEffect(() => {
        const mockPosts: BlogPost[] = [
            {
                id: '1',
                title: 'Khám phá vẻ đẹp Tây Ninh',
                status: 'published',
                views: 150,
                likes: 25,
                createdAt: '2024-01-15'
            },
            {
                id: '2',
                title: 'Hướng dẫn du lịch Núi Bà Đen',
                status: 'draft',
                views: 0,
                likes: 0,
                createdAt: '2024-01-10'
            },
            {
                id: '3',
                title: 'Ẩm thực đặc sản Tây Ninh',
                status: 'pending',
                views: 75,
                likes: 12,
                createdAt: '2024-01-08'
            }
        ];
        setPosts(mockPosts);
    }, []);

    const getStatusTag = (status: string) => {
        const statusConfig = {
            published: { color: 'green', text: t('blogger.dashboard.status.published') },
            draft: { color: 'orange', text: t('blogger.dashboard.status.draft') },
            pending: { color: 'blue', text: t('blogger.dashboard.status.pending') }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns: ColumnsType<BlogPost> = [
        {
            title: t('blogger.dashboard.table.title'),
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: t('blogger.dashboard.table.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
            filters: [
                { text: t('blogger.dashboard.status.published'), value: 'published' },
                { text: t('blogger.dashboard.status.draft'), value: 'draft' },
                { text: t('blogger.dashboard.status.pending'), value: 'pending' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: t('blogger.dashboard.table.views'),
            dataIndex: 'views',
            key: 'views',
            sorter: (a, b) => a.views - b.views,
        },
        {
            title: t('blogger.dashboard.table.likes'),
            dataIndex: 'likes',
            key: 'likes',
            sorter: (a, b) => a.likes - b.likes,
        },
        {
            title: t('blogger.dashboard.table.createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: t('blogger.dashboard.table.actions'),
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/blogger/edit-blog/${record.id}`)}
                    >
                        {t('common.edit')}
                    </Button>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/blog/post/${record.id}`)}
                    >
                        {t('common.view')}
                    </Button>
                </Space>
            ),
        },
    ];

    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

    return (
        <div className="blogger-dashboard">
            <div className="dashboard-header">
                <h1>{t('blogger.dashboard.title')}</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/blogger/create-blog')}
                >
                    {t('blogger.dashboard.createNew')}
                </Button>
            </div>

            <Row gutter={[24, 24]} className="stats-row">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.totalPosts')}
                            value={totalPosts}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.publishedPosts')}
                            value={publishedPosts}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.totalViews')}
                            value={totalViews}
                            prefix={<EyeOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.totalLikes')}
                            value={totalLikes}
                            prefix={<LikeOutlined />}
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={t('blogger.dashboard.recentPosts')}
                className="recent-posts-card"
            >                <Table
                    dataSource={posts}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`
                    }}
                />
            </Card>
        </div>
    );
};

export default BloggerDashboard;
