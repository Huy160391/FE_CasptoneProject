import { useState } from 'react'
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Upload,
  message,
  DatePicker,
  Typography,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import dayjs from 'dayjs'
import './Blogs.scss'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

// Mock blog data
const initialBlogs = [
  {
    id: 1,
    title: 'Khám phá Núi Bà Đen - Nóc nhà Nam Bộ',
    summary: 'Hành trình chinh phục đỉnh núi cao nhất Nam Bộ và khám phá những điều thú vị tại Núi Bà Đen, Tây Ninh.',
    content: 'Núi Bà Đen là ngọn núi cao nhất Nam Bộ với độ cao 986m so với mực nước biển. Đây không chỉ là địa điểm du lịch nổi tiếng mà còn là nơi có ý nghĩa tâm linh quan trọng đối với người dân địa phương...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Nguyễn Văn A',
    date: '15/03/2024',
    category: 'Du lịch',
    tags: ['Núi Bà Đen', 'Tây Ninh', 'Du lịch'],
    views: 1250,
    status: 'published'
  },
  {
    id: 2,
    title: 'Tòa Thánh Cao Đài - Kiến trúc độc đáo của Tây Ninh',
    summary: 'Tìm hiểu về kiến trúc độc đáo và ý nghĩa văn hóa của Tòa Thánh Cao Đài, trung tâm của đạo Cao Đài tại Tây Ninh.',
    content: 'Tòa Thánh Cao Đài là công trình kiến trúc tôn giáo độc đáo, được xây dựng từ năm 1933 đến năm 1955. Đây là trung tâm của đạo Cao Đài, một tôn giáo bản địa của Việt Nam ra đời vào năm 1926...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Trần Thị B',
    date: '10/03/2024',
    category: 'Văn hóa',
    tags: ['Tòa Thánh', 'Cao Đài', 'Tây Ninh', 'Văn hóa'],
    views: 980,
    status: 'published'
  },
  {
    id: 3,
    title: 'Ẩm thực Tây Ninh - Những món ngon không thể bỏ qua',
    summary: 'Khám phá những món ăn đặc sản nổi tiếng của Tây Ninh mà bạn không nên bỏ lỡ khi đến thăm vùng đất này.',
    content: 'Tây Ninh không chỉ nổi tiếng với các địa điểm du lịch mà còn có nền ẩm thực phong phú với nhiều món ăn đặc sản độc đáo. Từ bánh canh Trảng Bàng, bánh tráng phơi sương đến mắm Châu Đốc...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Lê Văn C',
    date: '05/03/2024',
    category: 'Ẩm thực',
    tags: ['Ẩm thực', 'Đặc sản', 'Tây Ninh'],
    views: 1560,
    status: 'published'
  },
  {
    id: 4,
    title: 'Lễ hội Yến Sào - Nét văn hóa đặc sắc của Tây Ninh',
    summary: 'Tìm hiểu về lễ hội Yến Sào, một trong những lễ hội truyền thống đặc sắc của người dân Tây Ninh.',
    content: 'Lễ hội Yến Sào là một trong những lễ hội truyền thống lâu đời của người dân Tây Ninh, thường được tổ chức vào tháng 3 âm lịch hàng năm. Đây là dịp để người dân địa phương tưởng nhớ và tỏ lòng biết ơn...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Phạm Thị D',
    date: '01/03/2024',
    category: 'Văn hóa',
    tags: ['Lễ hội', 'Văn hóa', 'Tây Ninh'],
    views: 820,
    status: 'draft'
  }
]

const categories = ['Du lịch', 'Văn hóa', 'Ẩm thực', 'Lễ hội', 'Kinh nghiệm']
const statuses = [
  { value: 'published', label: 'Đã xuất bản', color: 'green' },
  { value: 'draft', label: 'Bản nháp', color: 'orange' },
  { value: 'archived', label: 'Đã lưu trữ', color: 'gray' }
]

const Blogs = () => {
  const [blogs, setBlogs] = useState(initialBlogs)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [currentBlog, setCurrentBlog] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  
  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  )
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }
  
  const showCreateModal = () => {
    setModalMode('create')
    setCurrentBlog(null)
    setFileList([])
    form.resetFields()
    setIsModalVisible(true)
  }
  
  const showEditModal = (blog: any) => {
    setModalMode('edit')
    setCurrentBlog(blog)
    
    // Set file list for the thumbnail
    if (blog.thumbnail) {
      setFileList([
        {
          uid: '-1',
          name: 'thumbnail.jpg',
          status: 'done',
          url: blog.thumbnail,
        }
      ])
    } else {
      setFileList([])
    }
    
    // Set form values
    form.setFieldsValue({
      ...blog,
      date: blog.date ? dayjs(blog.date, 'DD/MM/YYYY') : undefined,
      tags: blog.tags.join(', ')
    })
    
    setIsModalVisible(true)
  }
  
  const showViewModal = (blog: any) => {
    setCurrentBlog(blog)
    setIsViewModalVisible(true)
  }
  
  const handleCancel = () => {
    setIsModalVisible(false)
    setIsViewModalVisible(false)
  }
  
  const handleFormSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      date: values.date ? dayjs(values.date).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'),
      thumbnail: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : 'https://placehold.co/600x400',
      tags: values.tags.split(',').map((tag: string) => tag.trim()),
      views: currentBlog?.views || 0
    }
    
    if (modalMode === 'create') {
      // Create new blog
      const newBlog = {
        id: blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1,
        ...formattedValues
      }
      
      setBlogs([...blogs, newBlog])
      message.success('Bài viết đã được tạo thành công')
    } else {
      // Update existing blog
      const updatedBlogs = blogs.map(blog => 
        blog.id === currentBlog.id ? { ...blog, ...formattedValues } : blog
      )
      
      setBlogs(updatedBlogs)
      message.success('Bài viết đã được cập nhật thành công')
    }
    
    setIsModalVisible(false)
  }
  
  const handleDelete = (id: number) => {
    const updatedBlogs = blogs.filter(blog => blog.id !== id)
    setBlogs(updatedBlogs)
    message.success('Bài viết đã được xóa thành công')
  }
  
  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList)
  }
  
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div className="blog-title-cell">
          <img src={record.thumbnail} alt={text} className="blog-thumbnail" />
          <div>
            <div className="blog-title">{text}</div>
            <div className="blog-meta">
              <span>{record.date}</span>
              <span>•</span>
              <span>{record.category}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: any, b: any) => a.views - b.views,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = statuses.find(s => s.value === status)
        return (
          <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => showViewModal(record)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Xóa bài viết"
            description="Bạn có chắc chắn muốn xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]
  
  return (
    <div className="blogs-page">
      <div className="page-header">
        <Title level={2}>Quản lý bài viết</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Thêm bài viết
        </Button>
      </div>
      
      <Card className="blogs-card">
        <div className="table-toolbar">
          <Input
            placeholder="Tìm kiếm bài viết..."
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredBlogs} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* Create/Edit Modal */}
      <Modal
        title={modalMode === 'create' ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ status: 'draft' }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="summary"
            label="Tóm tắt"
            rules={[{ required: true, message: 'Vui lòng nhập tóm tắt' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={10} />
          </Form.Item>
          
          <Form.Item
            name="thumbnail"
            label="Ảnh đại diện"
          >
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
            </Upload>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select>
                  {categories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  {statuses.map(status => (
                    <Option key={status.value} value={status.value}>{status.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="author"
                label="Tác giả"
                rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày đăng"
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="tags"
            label="Thẻ (phân cách bằng dấu phẩy)"
          >
            <Input placeholder="Ví dụ: Tây Ninh, Du lịch, Văn hóa" />
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {modalMode === 'create' ? 'Tạo bài viết' : 'Cập nhật'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* View Modal */}
      <Modal
        title="Chi tiết bài viết"
        open={isViewModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Đóng
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setIsViewModalVisible(false)
              showEditModal(currentBlog)
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={800}
      >
        {currentBlog && (
          <div className="blog-detail">
            <div className="blog-header">
              <Title level={3}>{currentBlog.title}</Title>
              <div className="blog-meta">
                <Text type="secondary">Tác giả: {currentBlog.author}</Text>
                <Text type="secondary">Ngày đăng: {currentBlog.date}</Text>
                <Text type="secondary">Lượt xem: {currentBlog.views}</Text>
                <Tag color={statuses.find(s => s.value === currentBlog.status)?.color}>
                  {statuses.find(s => s.value === currentBlog.status)?.label}
                </Tag>
              </div>
            </div>
            
            <div className="blog-thumbnail-container">
              <img src={currentBlog.thumbnail} alt={currentBlog.title} />
            </div>
            
            <div className="blog-content">
              <Title level={5}>Tóm tắt:</Title>
              <Text>{currentBlog.summary}</Text>
              
              <Title level={5} style={{ marginTop: 20 }}>Nội dung:</Title>
              <Text>{currentBlog.content}</Text>
              
              <div className="blog-tags">
                <Title level={5}>Thẻ:</Title>
                <div>
                  {currentBlog.tags.map((tag: string) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Blogs
