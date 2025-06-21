import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, message, Empty, Popconfirm } from 'antd';
import {
    FileTextOutlined,
    EyeOutlined,
    LikeOutlined,
    EditOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import bloggerService from '@/services/bloggerService';
import type { BlogPost } from '@/types';
import './BloggerDashboard.scss';

const BloggerDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(false); const [stats, setStats] = useState({
        totalPosts: 0,
        acceptedPosts: 0,
        pendingPosts: 0,
        rejectedPosts: 0,
        totalComments: 0,
        totalLikes: 0
    });

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch recent posts
                const blogsResponse = await bloggerService.getMyBlogs({
                    pageIndex: 1,
                    pageSize: 10
                });
                setPosts(blogsResponse.blogs);                // Try to fetch stats, fallback to calculated stats if endpoint doesn't exist
                try {
                    const statsResponse = await bloggerService.getBlogStats();
                    // Map API response to match our state structure
                    setStats({
                        totalPosts: statsResponse.totalPosts,
                        acceptedPosts: statsResponse.acceptedPosts,
                        pendingPosts: statsResponse.pendingPosts,
                        rejectedPosts: statsResponse.rejectedPosts,
                        totalComments: statsResponse.totalViews || 0, // Map totalViews to totalComments
                        totalLikes: statsResponse.totalLikes
                    });
                } catch (statsError) {
                    // Calculate stats from posts if API endpoint doesn't exist
                    const allPostsResponse = await bloggerService.getMyBlogs({
                        pageIndex: 1,
                        pageSize: 1000 // Get all posts for stats
                    });
                    const allPosts = allPostsResponse.blogs; setStats({
                        totalPosts: allPosts.length,
                        acceptedPosts: allPosts.filter(p => p.status === 1).length,
                        pendingPosts: allPosts.filter(p => p.status === 0).length,
                        rejectedPosts: allPosts.filter(p => p.status === 2).length,
                        totalComments: allPosts.reduce((sum, post) => sum + post.comments, 0),
                        totalLikes: allPosts.reduce((sum, post) => sum + post.likes, 0)
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                message.error(t('blogger.dashboard.fetchError') || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        }; fetchData();
    }, [t]);

    const handleDelete = async (id: string) => {
        try {
            await bloggerService.deleteBlog(id);
            message.success(t('blogger.myBlogs.messages.deleteSuccess') || 'Blog deleted successfully');
            // Refresh the list
            setPosts(posts.filter(post => post.id !== id));
        } catch (error) {
            console.error('Error deleting blog:', error);
            message.error(t('blogger.myBlogs.messages.deleteError') || 'Failed to delete blog');
        }
    };

    const getStatusTag = (status: number) => {
        const statusConfig = {
            0: { color: 'blue', text: t('blogger.dashboard.status.pending') },
            1: { color: 'green', text: t('blogger.dashboard.status.accepted') },
            2: { color: 'red', text: t('blogger.dashboard.status.rejected') }
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
        }, {
            title: t('blogger.dashboard.table.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => getStatusTag(status),
            filters: [
                { text: t('blogger.dashboard.status.pending'), value: 0 },
                { text: t('blogger.dashboard.status.accepted'), value: 1 },
                { text: t('blogger.dashboard.status.rejected'), value: 2 },
            ],
            onFilter: (value, record) => record.status === value,
        }, {
            title: t('blogger.dashboard.table.comments'),
            dataIndex: 'comments',
            key: 'comments',
            sorter: (a, b) => a.comments - b.comments,
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
        }, {
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
                    {/* Only show view button for accepted posts (status === 1) */}
                    {record.status === 1 && (
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/blog/post/${record.id}`)}
                        >
                            {t('common.view')}
                        </Button>
                    )}
                    <Popconfirm
                        title={t('blogger.myBlogs.confirmDelete')}
                        description={t('blogger.myBlogs.confirmDeleteDesc')}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t('common.yes')}
                        cancelText={t('common.no')}
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            {t('common.delete')}
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Custom empty state component
    const EmptyState = () => (
        <Empty
            image={<FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
                <span style={{ color: '#999' }}>
                    {t('blogger.myBlogs.noData')}
                </span>
            }
        >
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/blogger/create-blog')}
            >
                {t('blogger.dashboard.createNew')}
            </Button>
        </Empty>
    );

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
            </div>            <Row gutter={[24, 24]} className="stats-row">
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.totalPosts')}
                            value={stats.totalPosts}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.acceptedPosts')}
                            value={stats.acceptedPosts}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.pendingPosts')}
                            value={stats.pendingPosts}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.rejectedPosts')}
                            value={stats.rejectedPosts}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>                        <Statistic
                        title={t('blogger.dashboard.stats.totalComments')}
                        value={stats.totalComments}
                        prefix={<EyeOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                        loading={loading}
                    />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card>
                        <Statistic
                            title={t('blogger.dashboard.stats.totalLikes')}
                            value={stats.totalLikes}
                            prefix={<LikeOutlined />}
                            valueStyle={{ color: '#eb2f96' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={t('blogger.dashboard.recentPosts')}
                className="recent-posts-card"
                loading={loading}
            >                <Table
                    dataSource={posts}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`
                    }}
                    locale={{
                        emptyText: loading ? undefined : <EmptyState />
                    }}
                />
            </Card>
        </div>
    );
};

export default BloggerDashboard;
