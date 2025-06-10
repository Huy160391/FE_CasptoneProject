import { useState, useEffect, useRef } from 'react'
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Modal,
  message,
  Typography
} from 'antd'
import {
  SearchOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './Blogs.scss'
import adminService, { AdminBlogPost } from '@/services/adminService'

const { Title, Text } = Typography
const { TextArea } = Input

const statuses = [
  { value: '1', label: 'Đã xuất bản', color: 'green' },
  { value: '0', label: 'Bản nháp', color: 'orange' },
  { value: '2', label: 'Đã lưu trữ', color: 'gray' }
]

// Mapping API status to UI status
const mapStatusToUI = (status: number): string => {
  switch (status) {
    case 1: return '1' // published
    case 0: return '0' // draft
    case 2: return '2' // archived
    default: return '0' // default to draft
  }
}

// Mở rộng interface AdminBlogPost để thêm hỗ trợ cho nhiều ảnh
interface ExtendedAdminBlogPost extends AdminBlogPost {
  // Interface đã được cập nhật trong adminService.ts
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<AdminBlogPost[]>([])
  const [displayedBlogs, setDisplayedBlogs] = useState<AdminBlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [currentBlog, setCurrentBlog] = useState<ExtendedAdminBlogPost | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approveComment, setApproveComment] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [sortField, setSortField] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend')
  const [statusFilter, setStatusFilter] = useState<number[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // Fetch blogs from API
  const fetchBlogs = async (page = 1, pageSize = 10, textSearch = '') => {
    setLoading(true)
    try {
      const response = await adminService.getCmsBlogs({
        pageIndex: page,
        pageSize: pageSize,
        textSearch: textSearch
      })

      setBlogs(response.blogs)
      setDisplayedBlogs(response.blogs) // Cập nhật displayedBlogs khi lấy dữ liệu mới
      setPagination({
        current: response.pageIndex,
        pageSize: response.pageSize,
        total: response.totalCount
      })
    } catch (error) {
      console.error('Error fetching blogs:', error)
      message.error('Không thể tải danh sách bài viết. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  // Load blogs on component mount
  useEffect(() => {
    fetchBlogs()
  }, [])  // Handle search input change with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)

    // Hủy bỏ timeout cũ nếu còn tồn tại
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Sử dụng setTimeout để tạo hiệu ứng debounce
    searchTimeoutRef.current = setTimeout(() => {
      fetchBlogs(1, pagination.pageSize, value)
    }, 800) // Tăng thời gian debounce lên 800ms
  }
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Xử lý phân trang
    fetchBlogs(
      pagination.current,
      pagination.pageSize,
      searchText
    );

    // Xử lý sắp xếp
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order || 'descend');
    }

    // Xử lý lọc
    if (filters && filters.status) {
      setStatusFilter(filters.status);
    } else {
      setStatusFilter([]);
    }
  }
  const showViewModal = (blog: AdminBlogPost) => {
    // Chuyển đổi sang ExtendedAdminBlogPost
    const extendedBlog: ExtendedAdminBlogPost = {
      ...blog
    }

    // Ghi log để kiểm tra imageUrl
    console.log('Blog imageUrl:', extendedBlog.imageUrl);

    // Nếu không có imageUrl từ API, sử dụng featuredImage
    if (!extendedBlog.imageUrl || !Array.isArray(extendedBlog.imageUrl) || extendedBlog.imageUrl.length === 0) {
      extendedBlog.imageUrl = extendedBlog.featuredImage ? [extendedBlog.featuredImage] : []
    }

    setCurrentBlog(extendedBlog)
    setIsViewModalVisible(true)
    setCurrentImageIndex(0) // Reset to first image when opening modal
  }

  const handleCancel = () => {
    setIsViewModalVisible(false)
  }

  const handlePrevImage = () => {
    if (currentBlog?.imageUrl && Array.isArray(currentBlog.imageUrl) && currentBlog.imageUrl.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? currentBlog.imageUrl!.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (currentBlog?.imageUrl && Array.isArray(currentBlog.imageUrl) && currentBlog.imageUrl.length > 1) {
      setCurrentImageIndex((prev) => (prev === currentBlog.imageUrl!.length - 1 ? 0 : prev + 1))
    }
  }

  const handleApprove = async (id: string) => {
    // Hiển thị modal xác nhận duyệt bài viết
    Modal.confirm({
      title: 'Duyệt bài viết',
      content: (
        <div>
          <p>Vui lòng nhập nhận xét của bạn về bài viết:</p>
          <TextArea
            rows={4}
            onChange={(e) => setApproveComment(e.target.value)}
            placeholder="Nhận xét về bài viết (không bắt buộc)"
          />
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy', onOk: async () => {
        setLoading(true);
        try {
          await adminService.updateBlogStatus(id, {
            status: 1, // 1 = accepted
            commentOfAdmin: approveComment
          })
          setApproveComment('');
          message.success('Bài viết đã được duyệt thành công')
          fetchBlogs(pagination.current, pagination.pageSize, searchText)
        } catch (error) {
          console.error('Error approving blog:', error)
          message.error('Không thể duyệt bài viết. Vui lòng thử lại sau.')
        } finally {
          setLoading(false)
        }
      },
    });
  }

  const handleReject = async (id: string) => {
    // Hiển thị modal yêu cầu lý do từ chối
    Modal.confirm({
      title: 'Từ chối bài viết',
      content: (
        <div>
          <p>Vui lòng nhập lý do từ chối bài viết:</p>
          <TextArea
            rows={4}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối để blogger có thể hiểu và sửa bài viết"
          />
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy', onOk: async () => {
        setLoading(true);
        try {
          await adminService.updateBlogStatus(id, {
            status: 2, // 2 = rejected
            commentOfAdmin: rejectReason
          });
          setRejectReason('');
          message.success('Đã từ chối bài viết thành công');
          fetchBlogs(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
          console.error('Error rejecting blog:', error);
          message.error('Không thể từ chối bài viết. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      },
    });
  }
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string, record: AdminBlogPost) => (
        <div className="blog-title-cell">
          <img
            src={record.featuredImage || 'https://placehold.co/600x400'}
            alt={text}
            className="blog-thumbnail"
          />
          <div>
            <div className="blog-title">{text}</div>
            <div className="blog-meta">
              <span>{dayjs(record.createdAt).format('DD/MM/YYYY')}</span>
              <span>•</span>
              <span>{record.category || 'Không có danh mục'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'authorName',
      key: 'authorName',
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      sorter: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: statuses.map(status => ({
        text: status.label,
        value: parseInt(status.value)
      })),
      render: (status: number) => {
        const uiStatus = mapStatusToUI(status)
        const statusInfo = statuses.find(s => s.value === uiStatus)
        return (
          <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>
        )
      },
    }, {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: AdminBlogPost) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
          />
          <Button
            type="primary"
            size="small"
            onClick={() => handleApprove(record.id)}
          >
            Duyệt
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => handleReject(record.id)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ]

  // Xử lý việc sắp xếp và lọc dữ liệu blog
  useEffect(() => {
    if (blogs.length === 0) return;

    let filteredData = [...blogs];

    // Áp dụng bộ lọc trạng thái nếu có
    if (statusFilter.length > 0) {
      filteredData = filteredData.filter(blog => statusFilter.includes(blog.status));
    }

    // Áp dụng sắp xếp
    filteredData.sort((a, b) => {
      if (sortField === 'views') {
        return sortOrder === 'ascend' ? a.views - b.views : b.views - a.views;
      }

      if (sortField === 'createdAt') {
        return sortOrder === 'ascend'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sortField === 'title') {
        return sortOrder === 'ascend'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }

      return 0;
    });

    setDisplayedBlogs(filteredData);
  }, [blogs, sortField, sortOrder, statusFilter]);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="blogs-page">
      <div className="page-header">
        <Title level={2}>Quản lý bài viết</Title>
        <Input
          placeholder="Tìm kiếm bài viết..."
          prefix={<SearchOutlined />}
          onChange={handleSearch}
          className="search-input"
          value={searchText}
        />
      </div>

      <Card className="blogs-card">
        <div className="table-toolbar">
          {/* Search input moved to header */}
        </div>        <Table
          columns={columns}
          dataSource={displayedBlogs}
          rowKey="id"
          pagination={{
            pageSize: pagination.pageSize,
            total: pagination.total,
            current: pagination.current
          }}
          onChange={handleTableChange}
          loading={loading}
        />
      </Card>

      {/* View Modal */}
      <Modal
        title="Chi tiết bài viết"
        open={isViewModalVisible}
        onCancel={handleCancel} footer={[<Button key="back" onClick={handleCancel}>
          Đóng
        </Button>,
        <Button
          key="approve"
          type="primary"
          onClick={() => {
            if (currentBlog) {
              handleApprove(currentBlog.id)
            }
          }}
        >
          Duyệt
        </Button>,
        <Button
          key="reject"
          type="primary"
          danger
          onClick={() => {
            if (currentBlog) {
              handleReject(currentBlog.id)
            }
          }}
        >
          Từ chối
        </Button>
        ]}
        width={800}
      >
        {currentBlog && (
          <div className="blog-detail">            <div className="blog-header">
            <Title level={3}>{currentBlog.title}</Title>
            <div className="blog-meta modal-meta">
              <Text type="secondary" className="meta-item">Tác giả: {currentBlog.authorName}</Text>
              <Text type="secondary" className="meta-item"> Ngày đăng: {dayjs(currentBlog.createdAt).format('DD/MM/YYYY')}</Text>
              <Text type="secondary" className="meta-item"> Lượt xem: {currentBlog.views} </Text>
              <Tag color={statuses.find(s => s.value === mapStatusToUI(currentBlog.status))?.color}>
                {statuses.find(s => s.value === mapStatusToUI(currentBlog.status))?.label}
              </Tag>
            </div>
          </div>            <div className="blog-thumbnail-container">              {currentBlog.imageUrl && Array.isArray(currentBlog.imageUrl) && currentBlog.imageUrl.length > 0 ? (
            <div className="image-gallery">
              <img
                src={currentBlog.imageUrl[currentImageIndex] || 'https://placehold.co/600x400'}
                alt={`${currentBlog.title} - Ảnh ${currentImageIndex + 1}`}
              />
              {/* Luôn hiển thị các nút điều hướng nếu có từ 2 ảnh trở lên */}
              {currentBlog.imageUrl.length > 1 && (
                <div className="image-navigation" style={{ zIndex: 10 }}>
                  <Button
                    className="nav-button prev"
                    icon={<LeftOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                  />
                  <div className="image-counter">
                    {currentImageIndex + 1} / {currentBlog.imageUrl.length}
                  </div>
                  <Button
                    className="nav-button next"
                    icon={<RightOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <img
              src={currentBlog.featuredImage || 'https://placehold.co/600x400'}
              alt={currentBlog.title}
            />
          )}
            </div>

            <div className="blog-content">
              <Title level={5}>Tóm tắt:</Title>
              <div
                dangerouslySetInnerHTML={{ __html: currentBlog.excerpt || '' }}
                className="blog-excerpt"
              />

              <Title level={5} style={{ marginTop: 20 }}>Nội dung:</Title>
              <div
                dangerouslySetInnerHTML={{ __html: currentBlog.content || '' }}
                className="blog-content-html"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Blogs
