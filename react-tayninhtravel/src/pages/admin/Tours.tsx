import { useState } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form, Select, InputNumber, Upload, DatePicker } from 'antd'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined 
} from '@ant-design/icons'
import './Tours.scss'

const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

const Tours = () => {
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingTour, setEditingTour] = useState<any>(null)
  
  // Mock data for tours
  const tours = [
    {
      key: '1',
      id: 1,
      name: 'Khám phá Núi Bà Đen',
      image: '/images/tours/nui-ba-den.jpg',
      price: 500000,
      duration: '1 ngày',
      maxGroupSize: 20,
      startLocation: 'TP. Tây Ninh',
      status: 'active',
      featured: true,
    },
    {
      key: '2',
      id: 2,
      name: 'Tòa Thánh Cao Đài và Núi Bà',
      image: '/images/tours/toa-thanh-cao-dai.jpg',
      price: 650000,
      duration: '1 ngày',
      maxGroupSize: 15,
      startLocation: 'TP. Hồ Chí Minh',
      status: 'active',
      featured: true,
    },
    {
      key: '3',
      id: 3,
      name: 'Khu Du Lịch Suối Đá',
      image: '/images/tours/suoi-da.jpg',
      price: 450000,
      duration: '1 ngày',
      maxGroupSize: 25,
      startLocation: 'TP. Tây Ninh',
      status: 'active',
      featured: false,
    },
    {
      key: '4',
      id: 4,
      name: 'Hồ Dầu Tiếng',
      image: '/images/tours/ho-dau-tieng.jpg',
      price: 550000,
      duration: '1 ngày',
      maxGroupSize: 20,
      startLocation: 'TP. Tây Ninh',
      status: 'inactive',
      featured: false,
    },
    {
      key: '5',
      id: 5,
      name: 'Vườn Quốc Gia Lò Gò - Xa Mát',
      image: '/images/tours/lo-go-xa-mat.jpg',
      price: 750000,
      duration: '2 ngày 1 đêm',
      maxGroupSize: 15,
      startLocation: 'TP. Hồ Chí Minh',
      status: 'active',
      featured: true,
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
      title: 'Tour',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="tour-cell">
          <img src={record.image} alt={text} className="tour-image" />
          <span>{text}</span>
        </div>
      ),
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: string, record: any) => 
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.startLocation.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} ₫`,
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Điểm khởi hành',
      dataIndex: 'startLocation',
      key: 'startLocation',
      filters: [
        { text: 'TP. Tây Ninh', value: 'TP. Tây Ninh' },
        { text: 'TP. Hồ Chí Minh', value: 'TP. Hồ Chí Minh' },
      ],
      onFilter: (value: string, record: any) => record.startLocation === value,
    },
    {
      title: 'Nổi bật',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured: boolean) => (
        featured ? <Tag color="gold">Nổi bật</Tag> : <Tag color="default">Thường</Tag>
      ),
      filters: [
        { text: 'Nổi bật', value: true },
        { text: 'Thường', value: false },
      ],
      onFilter: (value: boolean, record: any) => record.featured === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'success' : 'error'
        const text = status === 'active' ? 'Đang mở' : 'Tạm ngưng'
        
        return <Tag className={`status-tag ${color}`}>{text}</Tag>
      },
      filters: [
        { text: 'Đang mở', value: 'active' },
        { text: 'Tạm ngưng', value: 'inactive' },
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
  
  const handleAdd = () => {
    setEditingTour(null)
    form.resetFields()
    setIsModalVisible(true)
  }
  
  const handleEdit = (tour: any) => {
    setEditingTour(tour)
    form.setFieldsValue({
      name: tour.name,
      price: tour.price,
      duration: tour.duration,
      maxGroupSize: tour.maxGroupSize,
      startLocation: tour.startLocation,
      status: tour.status,
      featured: tour.featured,
      description: tour.description || '',
    })
    setIsModalVisible(true)
  }
  
  const handleDelete = (tour: any) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa tour "${tour.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Handle delete logic here
        console.log('Deleted tour:', tour)
      },
    })
  }
  
  const handleModalOk = () => {
    form.validateFields().then(values => {
      // Handle form submission
      console.log('Form values:', values)
      
      if (editingTour) {
        // Update existing tour
        console.log('Updating tour:', editingTour.id, values)
      } else {
        // Add new tour
        console.log('Adding new tour:', values)
      }
      
      setIsModalVisible(false)
    })
  }
  
  const handleModalCancel = () => {
    setIsModalVisible(false)
  }
  
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }
  
  return (
    <div className="tours-page">
      <div className="page-header">
        <h1>Quản lý tour</h1>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm theo tên, địa điểm"
            prefix={<SearchOutlined />}
            onChange={e => handleSearch(e.target.value)}
            className="search-input"
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm tour
          </Button>
        </div>
      </div>
      
      <Table
        dataSource={tours}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="tours-table"
      />
      
      <Modal
        title={editingTour ? 'Sửa tour' : 'Thêm tour mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingTour ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên tour"
            rules={[{ required: true, message: 'Vui lòng nhập tên tour' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
          >
            <Input placeholder="Ví dụ: 1 ngày, 2 ngày 1 đêm" />
          </Form.Item>
          
          <Form.Item
            name="maxGroupSize"
            label="Số người tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập số người tối đa' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="startLocation"
            label="Điểm khởi hành"
            rules={[{ required: true, message: 'Vui lòng chọn điểm khởi hành' }]}
          >
            <Select>
              <Option value="TP. Tây Ninh">TP. Tây Ninh</Option>
              <Option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="active">Đang mở</Option>
              <Option value="inactive">Tạm ngưng</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="featured"
            label="Nổi bật"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="image"
            label="Hình ảnh"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="image"
              listType="picture"
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="dates"
            label="Ngày khởi hành"
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Tours
