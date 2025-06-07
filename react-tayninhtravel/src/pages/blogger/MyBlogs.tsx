import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    message,
    Popconfirm,
    Card
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import './MyBlogs.scss';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    status: 'published' | 'draft' | 'pending' | 'rejected';
    views: number;
    likes: number;
    createdAt: string;
    updatedAt: string;
    featuredImage?: string;
}

const MyBlogs = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [posts, setPosts] = useState<BlogPost[]>([]);

    // Mock data for demonstration
    useEffect(() => {
        const mockPosts: BlogPost[] = [
            {
                id: '1',
                title: 'Khám phá vẻ đẹp Tây Ninh - Hành trình khó quên',
                excerpt: 'Tây Ninh không chỉ nổi tiếng với Núi Bà Đen mà còn có nhiều điểm du lịch thú vị khác...',
                status: 'published',
                views: 150,
                likes: 25,
                createdAt: '2024-01-15',
                updatedAt: '2024-01-16',
                featuredImage: 'https://example.com/image1.jpg'
            },
            {
                id: '2',
                title: 'Hướng dẫn du lịch Núi Bà Đen chi tiết',
                excerpt: 'Núi Bà Đen là điểm du lịch tâm linh nổi tiếng nhất của Tây Ninh...',
                status: 'draft',
                views: 0,
                likes: 0,
                createdAt: '2024-01-10',
                updatedAt: '2024-01-12',
            },
            {
                id: '3',
                title: 'Ẩm thực đặc sản Tây Ninh không thể bỏ qua',
                excerpt: 'Tây Ninh có rất nhiều món ăn đặc sản độc đáo mà du khách nên thử...',
                status: 'pending',
                views: 75,
                likes: 12,
                createdAt: '2024-01-08',
                updatedAt: '2024-01-09',
            },
            {
                id: '4',
                title: 'Lịch sử và văn hóa Cao Đài',
                excerpt: 'Tìm hiểu về tôn giáo Cao Đài và thánh địa Tây Ninh...',
                status: 'rejected',
                views: 20,
                likes: 2,
                createdAt: '2024-01-05',
                updatedAt: '2024-01-06',
            }
        ];
        setPosts(mockPosts);
    }, []);

    const getStatusTag = (status: string) => {
        const statusConfig = {
            published: { color: 'green', text: t('blogger.myBlogs.status.published') },
            draft: { color: 'orange', text: t('blogger.myBlogs.status.draft') },
            pending: { color: 'blue', text: t('blogger.myBlogs.status.pending') },
            rejected: { color: 'red', text: t('blogger.myBlogs.status.rejected') }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const handleDelete = async (id: string) => {
        try {
            // API call would go here
            setPosts(posts.filter(post => post.id !== id));
            message.success(t('blogger.myBlogs.messages.deleteSuccess'));
        } catch (error) {
            message.error(t('blogger.myBlogs.messages.deleteError'));
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchText.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchText.toLowerCase())
    ); const columns: ColumnsType<BlogPost> = [{
        title: t('blogger.myBlogs.table.title'),
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
        render: (text, record) => (
            <div className="post-title-cell">
                <div className="post-title">{text}</div>
                <div className="post-excerpt">{record.excerpt}</div>
            </div>
        ),
    },
    {
        title: t('blogger.myBlogs.table.status'),
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (status: string) => getStatusTag(status),
        filters: [
            { text: t('blogger.myBlogs.status.published'), value: 'published' },
            { text: t('blogger.myBlogs.status.draft'), value: 'draft' },
            { text: t('blogger.myBlogs.status.pending'), value: 'pending' },
            { text: t('blogger.myBlogs.status.rejected'), value: 'rejected' },
        ],
        onFilter: (value, record) => record.status === value,
    },
    {
        title: t('blogger.myBlogs.table.views'),
        dataIndex: 'views',
        key: 'views',
        width: 90,
        sorter: (a, b) => a.views - b.views,
    },
    {
        title: t('blogger.myBlogs.table.likes'),
        dataIndex: 'likes',
        key: 'likes',
        width: 90,
        sorter: (a, b) => a.likes - b.likes,
    },
    {
        title: t('blogger.myBlogs.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 130,
        render: (date: string) => new Date(date).toLocaleDateString(),
        sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    }, {
        title: t('blogger.myBlogs.table.actions'),
        key: 'actions',
        width: 140,
        fixed: 'right',
        render: (_, record) => (
            <Space size="small" className="action-buttons">
                <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/blogger/edit-blog/${record.id}`)}
                    title={t('common.edit')}
                    className="action-btn edit-btn"
                />
                <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/blog/post/${record.id}`)}
                    title={t('common.view')}
                    className="action-btn view-btn"
                />
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
                        title={t('common.delete')}
                        className="action-btn delete-btn"
                    />
                </Popconfirm>
            </Space>
        ),
    },
    ];

    return (
        <div className="my-blogs-page">
            <div className="page-header">
                <div className="header-title">
                    <FileTextOutlined className="header-icon" />
                    <h1>{t('blogger.myBlogs.title')}</h1>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/blogger/create-blog')}
                >
                    {t('blogger.myBlogs.createNew')}
                </Button>
            </div>

            <Card className="blogs-card">
                <div className="table-actions">
                    <Input
                        placeholder={t('blogger.myBlogs.searchPlaceholder')}
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                </div>                <Table
                    dataSource={filteredPosts}
                    columns={columns}
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`
                    }}
                    locale={{
                        emptyText: t('blogger.myBlogs.noData')
                    }}
                />
            </Card>
        </div>
    );
};

export default MyBlogs;
