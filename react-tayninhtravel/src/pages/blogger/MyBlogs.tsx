import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    message,
    Popconfirm,
    Card,
    Spin,
    Empty
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
import bloggerService, { type BlogPost, type GetBlogsParams } from '@/services/bloggerService';
import './MyBlogs.scss';

const MyBlogs = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);    // Fetch blogs from API
    const fetchBlogs = async (params?: Partial<GetBlogsParams>) => {
        try {
            setLoading(true);
            console.log('Fetching blogs with params:', {
                pageIndex: currentPage,
                pageSize,
                textSearch: searchText,
                status: true,
                ...params
            });

            const response = await bloggerService.getMyBlogs({
                pageIndex: currentPage,
                pageSize,
                textSearch: searchText,
                status: true,
                ...params
            });

            console.log('Blogs response:', response);

            // Kiểm tra an toàn cho response
            if (response && Array.isArray(response.blogs)) {
                setPosts(response.blogs);
                setTotalCount(response.totalCount || 0);
            } else {
                console.warn('Invalid response format:', response);
                setPosts([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);

            // Reset state khi có lỗi
            setPosts([]);
            setTotalCount(0);

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = t('blogger.myBlogs.messages.fetchError') || 'Failed to fetch blogs';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchBlogs();
    }, [currentPage, pageSize]);

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchText !== '') {
                setCurrentPage(1); // Reset to first page when searching
                fetchBlogs({ textSearch: searchText, pageIndex: 1 });
            } else {
                fetchBlogs({ textSearch: '', pageIndex: currentPage });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText]); const getStatusTag = (status: number) => {
        const statusConfig = {
            0: { color: 'blue', text: t('blogger.myBlogs.status.pending') },
            1: { color: 'green', text: t('blogger.myBlogs.status.accepted') },
            2: { color: 'red', text: t('blogger.myBlogs.status.rejected') }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
    }; const handleDelete = async (id: string) => {
        try {
            await bloggerService.deleteBlog(id);
            message.success(t('blogger.myBlogs.messages.deleteSuccess') || 'Blog deleted successfully');
            // Refresh the list
            fetchBlogs();
        } catch (error) {
            console.error('Error deleting blog:', error);
            message.error(t('blogger.myBlogs.messages.deleteError') || 'Failed to delete blog');
        }
    };

    const columns: ColumnsType<BlogPost> = [{
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
        width: 110, render: (status: number) => getStatusTag(status),
        filters: [
            { text: t('blogger.myBlogs.status.pending'), value: 0 },
            { text: t('blogger.myBlogs.status.accepted'), value: 1 },
            { text: t('blogger.myBlogs.status.rejected'), value: 2 },
        ], onFilter: (value, record) => record.status === value,
    }, {
        title: t('blogger.myBlogs.table.likes'),
        dataIndex: 'likes',
        key: 'likes',
        width: 100,
        align: 'center' as const,
        render: (likes: number) => (
            <span className="likes-count">{likes || 0}</span>
        ),
        sorter: (a, b) => (a.likes || 0) - (b.likes || 0),
    },
    {
        title: t('blogger.myBlogs.table.comments'),
        dataIndex: 'comments',
        key: 'comments', width: 100,
        align: 'center' as const,
        render: (comments: number) => (
            <span className="comments-count">{comments || 0}</span>
        ),
        sorter: (a, b) => (a.comments || 0) - (b.comments || 0),
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
                {/* Only show view button for accepted posts (status === 1) */}
                {record.status === 1 && (
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/blog/post/${record.id}`)}
                        title={t('common.view')}
                        className="action-btn view-btn"
                    />
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
                        title={t('common.delete')}
                        className="action-btn delete-btn"
                    />
                </Popconfirm>
            </Space>
        ),
    },];

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
                {t('blogger.myBlogs.createNew')}
            </Button>
        </Empty>
    );

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
                    dataSource={posts}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            if (size !== pageSize) {
                                setPageSize(size);
                                setCurrentPage(1); // Reset to first page when changing page size
                            }
                        }
                    }} locale={{
                        emptyText: loading ? <Spin /> : <EmptyState />
                    }}
                />
            </Card>
        </div>
    );
};

export default MyBlogs;
