import { useState } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form, Select, InputNumber, Upload } from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import './Products.scss'

const { Option } = Select
const { TextArea } = Input

interface Product {
  key: string
  id: number
  name: string
  image: string
  price: number
  category: string
  stock: number
  status: 'active' | 'inactive'
  description?: string
}

const Products = () => {
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Mock data for products
  const products: Product[] = [
    {
      key: '1',
      id: 1,
      name: 'Nón lá Tây Ninh',
      image: '/images/products/non-la.jpg',
      price: 150000,
      category: 'Đồ lưu niệm',
      stock: 45,
      status: 'active',
    },
    {
      key: '2',
      id: 2,
      name: 'Áo thun Núi Bà Đen',
      image: '/images/products/ao-thun.jpg',
      price: 200000,
      category: 'Quần áo',
      stock: 32,
      status: 'active',
    },
    {
      key: '3',
      id: 3,
      name: 'Tranh Tòa Thánh Cao Đài',
      image: '/images/products/tranh.jpg',
      price: 350000,
      category: 'Đồ lưu niệm',
      stock: 15,
      status: 'active',
    },
    {
      key: '4',
      id: 4,
      name: 'Túi xách thổ cẩm',
      image: '/images/products/tui-xach.jpg',
      price: 250000,
      category: 'Phụ kiện',
      stock: 28,
      status: 'active',
    },
    {
      key: '5',
      id: 5,
      name: 'Trà Tây Ninh',
      image: '/images/products/tra.jpg',
      price: 120000,
      category: 'Đặc sản',
      stock: 50,
      status: 'active',
    },
    {
      key: '6',
      id: 6,
      name: 'Mật ong rừng Tây Ninh',
      image: '/images/products/mat-ong.jpg',
      price: 180000,
      category: 'Đặc sản',
      stock: 0,
      status: 'inactive',
    },
  ]

  const columns: ColumnsType<Product> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: Product, b: Product) => a.id - b.id,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div className="product-cell">
          <img src={record.image} alt={text} className="product-image" />
          <span>{text}</span>
        </div>
      ),
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: boolean | Key, record: Product) => {
        const searchValue = value.toString().toLowerCase()
        return (
          record.name.toLowerCase().includes(searchValue) ||
          record.category.toLowerCase().includes(searchValue)
        )
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} ₫`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Đồ lưu niệm', value: 'Đồ lưu niệm' },
        { text: 'Quần áo', value: 'Quần áo' },
        { text: 'Phụ kiện', value: 'Phụ kiện' },
        { text: 'Đặc sản', value: 'Đặc sản' },
      ],
      onFilter: (value: boolean | Key, record: Product) => record.category === value,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: Product, b: Product) => a.stock - b.stock,
      render: (stock: number) => {
        let color = 'green'
        if (stock === 0) color = 'red'
        else if (stock < 10) color = 'orange'

        return <span style={{ color }}>{stock}</span>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Product['status']) => {
        const color = status === 'active' ? 'success' : 'error'
        const text = status === 'active' ? 'Đang bán' : 'Ngừng bán'

        return <Tag className={`status-tag ${color}`}>{text}</Tag>
      },
      filters: [
        { text: 'Đang bán', value: 'active' },
        { text: 'Ngừng bán', value: 'inactive' },
      ],
      onFilter: (value: boolean | Key, record: Product) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Product) => (
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
    setEditingProduct(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      status: product.status,
      description: product.description || '',
    })
    setIsModalVisible(true)
  }

  const handleDelete = (product: Product) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Handle delete logic here
        console.log('Deleted product:', product)
      },
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      // Handle form submission
      console.log('Form values:', values)

      if (editingProduct) {
        // Update existing product
        console.log('Updating product:', editingProduct.id, values)
      } else {
        // Add new product
        console.log('Adding new product:', values)
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
    <div className="products-page">
      <div className="page-header">
        <h1>Quản lý sản phẩm</h1>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm theo tên, danh mục"
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
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="products-table"
      />

      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingProduct ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
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
              parser={() => 0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              <Option value="Đồ lưu niệm">Đồ lưu niệm</Option>
              <Option value="Quần áo">Quần áo</Option>
              <Option value="Phụ kiện">Phụ kiện</Option>
              <Option value="Đặc sản">Đặc sản</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="stock"
            label="Tồn kho"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Ngừng bán</Option>
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
        </Form>
      </Modal>
    </div>
  )
}

export default Products
