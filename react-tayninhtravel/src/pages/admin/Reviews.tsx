import { useState } from 'react'
import { Table, Button, Input, Space, Tag, Rate, Modal, Select } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import './Reviews.scss'

const { Option } = Select
const { TextArea } = Input

const Reviews = () => {
  const [searchText, setSearchText] = useState('')
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  
  // Mock data for reviews
  const reviews = [
    {
      key: '1',
      id: 1,
      user: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      itemType: 'tour',
      itemName: 'Khám phá Núi Bà Đen',
      rating: 5,
      comment: 'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, cảnh đẹp, thời gian hợp lý. Sẽ quay lại lần sau.',
      date: '2023-05-15',
      status: 'approved',
    },
    {
      key: '2',
      id: 2,
      user: 'Trần Thị B',
      email: 'tranthib@example.com',
      itemType: 'product',
      itemName: 'Nón lá Tây Ninh',
      rating: 4,
      comment: 'Sản phẩm chất lượng tốt, đóng gói cẩn thận. Giao hàng hơi chậm một chút.',
      date: '2023-05-14',
      status: 'approved',
    },
    {
      key: '3',
      id: 3,
      user: 'Lê Văn C',
      email: 'levanc@example.com',
      itemType: 'tour',
      itemName: 'Tòa Thánh Cao Đài và Núi Bà',
      rating: 3,
      comment: 'Tour khá ổn nhưng thời gian hơi gấp, không đủ thời gian để tham quan kỹ.',
      date: '2023-05-13',
      status: 'approved',
    },
    {
      key: '4',
      id: 4,
      user: 'Phạm Thị D',
      email: 'phamthid@example.com',
      itemType: 'product',
      itemName: 'Trà Tây Ninh',
      rating: 5,
      comment: 'Trà thơm ngon, đóng gói đẹp, rất phù hợp làm quà tặng.',
      date: '2023-05-12',
      status: 'pending',
    },
    {
      key: '5',
      id: 5,
      user: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      itemType: 'tour',
      itemName: 'Vườn Quốc Gia Lò Gò - Xa Mát',
      rating: 2,
      comment: 'Không hài lòng với tour này. Hướng dẫn viên không nhiệt tình, thời gian chờ đợi quá lâu.',
      date: '2023-05-11',
      status: 'rejected',
    },
  ]
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: string, record: any) => 
        record.user.toLowerCase().includes(value.toLowerCase()) ||
        record.email.toLowerCase().includes(value.toLowerCase()) ||
        record.itemName.toLowerCase().includes(value.toLowerCase()) ||
        record.comment.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Loại',
      dataIndex: 'itemType',
      key: 'itemType',
      render: (type: string) => (
        <Tag color={type === 'tour' ? 'blue' : 'green'}>
          {type === 'tour' ? 'Tour' : 'Sản phẩm'}
        </Tag>
      ),
      filters: [
        { text: 'Tour', value: 'tour' },
        { text: 'Sản phẩm', value: 'product' },
      ],
      onFilter: (value: string, record: any) => record.itemType === value,
    },
    {
      title: 'Tên',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
      sorter: (a: any, b: any) => a.rating - b.rating,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = ''
        let text = ''
        
        switch (status) {
          case 'approved':
            color = 'success'
            text = 'Đã duyệt'
            break
          case 'pending':
            color = 'processing'
            text = 'Chờ duyệt'
            break
          case 'rejected':
            color = 'error'
            text = 'Từ chối'
            break
          default:
            color = 'default'
            text = status
        }
        
        return <Tag className={`status-tag ${color}`}>{text}</Tag>
      },
      filters: [
        { text: 'Đã duyệt', value: 'approved' },
        { text: 'Chờ duyệt', value: 'pending' },
        { text: 'Từ chối', value: 'rejected' },
      ],
      onFilter: (value: string, record: any) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ]
  
  const handleSearch = (value: string) => {
    setSearchText(value)
  }
  
  const handleView = (review: any) => {
    setSelectedReview(review)
    setIsViewModalVisible(true)
  }
  
  const handleEdit = (review: any) => {
    setSelectedReview(review)
    setIsEditModalVisible(true)
  }
  
  const handleDelete = (review: any) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa đánh giá này không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Handle delete logic here
        console.log('Deleted review:', review)
      },
    })
  }
  
  const handleViewModalClose = () => {
    setIsViewModalVisible(false)
  }
  
  const handleEditModalClose = () => {
    setIsEditModalVisible(false)
  }
  
  const handleStatusChange = (value: string) => {
    console.log('Status changed to:', value)
  }
  
  return (
    <div className="reviews-page">
      <div className="page-header">
        <h1>Quản lý đánh giá</h1>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm theo người dùng, email, tên sản phẩm/tour, nội dung"
            prefix={<SearchOutlined />}
            onChange={e => handleSearch(e.target.value)}
            className="search-input"
            allowClear
          />
        </div>
      </div>
      
      <Table
        dataSource={reviews}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="reviews-table"
      />
      
      {/* View Review Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={isViewModalVisible}
        onCancel={handleViewModalClose}
        footer={[
          <Button key="close" onClick={handleViewModalClose}>
            Đóng
          </Button>,
        ]}
      >
        {selectedReview && (
          <div className="review-details">
            <div className="review-info">
              <p><strong>Người dùng:</strong> {selectedReview.user}</p>
              <p><strong>Email:</strong> {selectedReview.email}</p>
              <p><strong>Loại:</strong> {selectedReview.itemType === 'tour' ? 'Tour' : 'Sản phẩm'}</p>
              <p><strong>Tên:</strong> {selectedReview.itemName}</p>
              <p><strong>Đánh giá:</strong> <Rate disabled defaultValue={selectedReview.rating} /></p>
              <p><strong>Ngày:</strong> {selectedReview.date}</p>
              <p><strong>Trạng thái:</strong> {
                selectedReview.status === 'approved' ? 'Đã duyệt' :
                selectedReview.status === 'pending' ? 'Chờ duyệt' :
                selectedReview.status === 'rejected' ? 'Từ chối' : selectedReview.status
              }</p>
            </div>
            
            <div className="review-comment">
              <h3>Nội dung đánh giá</h3>
              <p>{selectedReview.comment}</p>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Edit Review Modal */}
      <Modal
        title="Cập nhật đánh giá"
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        onOk={handleEditModalClose}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {selectedReview && (
          <div className="edit-review-form">
            <div className="form-item">
              <label>Trạng thái:</label>
              <Select
                defaultValue={selectedReview.status}
                style={{ width: '100%' }}
                onChange={handleStatusChange}
              >
                <Option value="approved">Đã duyệt</Option>
                <Option value="pending">Chờ duyệt</Option>
                <Option value="rejected">Từ chối</Option>
              </Select>
            </div>
            
            <div className="form-item">
              <label>Nội dung đánh giá:</label>
              <TextArea rows={4} defaultValue={selectedReview.comment} />
            </div>
            
            <div className="form-item">
              <label>Phản hồi của admin:</label>
              <TextArea rows={4} placeholder="Nhập phản hồi của admin (nếu có)" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Reviews
