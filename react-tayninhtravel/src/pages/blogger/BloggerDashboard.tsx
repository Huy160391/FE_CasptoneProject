import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, message, Empty, Popconfirm, DatePicker, Spin, Alert } from 'antd';
import {
    FileTextOutlined,
    EyeOutlined,
    LikeOutlined,
    EditOutlined,
    PlusOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    CommentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import bloggerService from '@/services/bloggerService';
import type { BlogPost } from '@/types';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
import './BloggerDashboard.scss';

const BloggerDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

    const [stats, setStats] = useState({
        totalPosts: 0,
        approvedPosts: 0,
        pendingPosts: 0,
        rejectedPosts: 0,
        totalComments: 0,
        totalLikes: 0
    });

    // Fetch dashboard stats by month/year
    const fetchDashboardStats = async (year: number, month: number) => {
        try {
            setStatsLoading(true);
            setError(null);

            console.log(`Fetching blogger dashboard stats for ${month}/${year}`);

            const statsData = await bloggerService.getDashboardStats(year, month);

            console.log('Raw API response in component:', statsData);
            console.log('Individual values:', {
                totalPosts: statsData.totalPosts,
                approvedPosts: statsData.approvedPosts,
                pendingPosts: statsData.pendingPosts,
                rejectedPosts: statsData.rejectedPosts,
                totalComments: statsData.totalComments,
                totalLikes: statsData.totalLikes
            });
            console.log('Current stats before update:', stats);

            // Create new stats object with explicit values
            const newStats = {
                totalPosts: Number(statsData.totalPosts) || 0,
                approvedPosts: Number(statsData.approvedPosts) || 0,
                pendingPosts: Number(statsData.pendingPosts) || 0,
                rejectedPosts: Number(statsData.rejectedPosts) || 0,
                totalComments: Number(statsData.totalComments) || 0,
                totalLikes: Number(statsData.totalLikes) || 0
            };

            console.log('New stats object to set:', newStats);

            setStats(newStats);

            console.log('Stats updated for:', { year, month });
        } catch (err) {
            console.error('Error fetching blogger dashboard stats:', err);
            setError('Không thể tải dữ liệu thống kê');
        } finally {
            setStatsLoading(false);
        }
    };

    const handleDateChange = (date: Dayjs | null) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    // Fetch recent posts
    const fetchRecentPosts = async () => {
        try {
            setLoading(true);
            const blogsResponse = await bloggerService.getMyBlogs({
                pageIndex: 1,
                pageSize: 10
            });
            console.log('Fetched posts:', blogsResponse.blogs);
            console.log('First post createdAt:', blogsResponse.blogs[0]?.createdAt);
            setPosts(blogsResponse.blogs);
        } catch (error) {
            console.error('Error fetching recent posts:', error);
            message.error(t('blogger.dashboard.fetchError') || 'Failed to load recent posts');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data from API
    useEffect(() => {
        const year = selectedDate.year();
        const month = selectedDate.month() + 1; // dayjs month is 0-indexed
        console.log(`Date changed to: ${month}/${year}`);
        fetchDashboardStats(year, month);
    }, [selectedDate]);

    useEffect(() => {
        fetchRecentPosts();
    }, []);

    // Debug: Log when stats change
    useEffect(() => {
        console.log('Stats state changed:', stats);
    }, [stats]);

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
            render: (date: any) => {
                console.log('Date value:', date);
                console.log('Date type:', typeof date);
                console.log('Date constructor:', date?.constructor?.name);

                let dateString = '';

                // Convert different types to string
                if (date instanceof Date) {
                    // If it's a Date object, convert to ISO string
                    dateString = date.toISOString();
                    console.log('Converted Date object to:', dateString);
                } else if (typeof date === 'string') {
                    dateString = date;
                } else if (date && typeof date === 'object') {
                    // If it's an object, try to extract string value
                    dateString = date.toString();
                    console.log('Converted object to string:', dateString);
                } else {
                    console.log('Date is not a valid type, returning N/A');
                    return 'N/A';
                }

                // Now process the string
                if (!dateString || !dateString.includes('T')) {
                    console.log('Invalid date string format:', dateString);
                    return 'N/A';
                }

                // Simply extract date part, ignore timezone completely
                const dateOnly = dateString.split('T')[0]; // Get "2025-07-30"
                const dateParts = dateOnly.split('-'); // ["2025", "07", "30"]

                // Ensure we have all parts
                if (dateParts.length !== 3) {
                    return dateString; // Return original if can't parse
                }

                const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // "30/07/2025"
                return formattedDate;
            },
            sorter: (a, b) => {
                // Safe check for string dates
                const dateA = (a.createdAt && typeof a.createdAt === 'string') ? a.createdAt.split('T')[0] : '';
                const dateB = (b.createdAt && typeof b.createdAt === 'string') ? b.createdAt.split('T')[0] : '';
                return dateA.localeCompare(dateB);
            },
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
                <Space>
                    <DatePicker
                        picker="month"
                        value={selectedDate}
                        onChange={handleDateChange}
                        format="MM/YYYY"
                        placeholder="Chọn tháng/năm"
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/blogger/create-blog')}
                    >
                        {t('blogger.dashboard.createNew')}
                    </Button>
                </Space>
            </div>

            {/* Show loading or error state for stats */}
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '24px' }}
                />
            )}

            {statsLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px' }}>Đang tải thống kê...</p>
                </div>
            ) : (
                <Row gutter={[24, 24]} className="stats-row" key={`stats-${selectedDate.format('YYYY-MM')}`}>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card>
                            <Statistic
                                title={t('blogger.dashboard.stats.totalPosts')}
                                value={stats.totalPosts}
                                prefix={<FileTextOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card>
                            <Statistic
                                title={t('blogger.dashboard.stats.acceptedPosts')}
                                value={stats.approvedPosts}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card>
                            <Statistic
                                title={t('blogger.dashboard.stats.pendingPosts')}
                                value={stats.pendingPosts}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card>
                            <Statistic
                                title={t('blogger.dashboard.stats.rejectedPosts')}
                                value={stats.rejectedPosts}
                                prefix={<CloseCircleOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card>
                            <Statistic
                                title={t('blogger.dashboard.stats.totalComments')}
                                value={stats.totalComments}
                                prefix={<CommentOutlined />}
                                valueStyle={{ color: '#722ed1' }}
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
                            />
                        </Card>
                    </Col>
                </Row>
            )}

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
