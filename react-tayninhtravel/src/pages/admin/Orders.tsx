import { useState } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Select, DatePicker } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import './Orders.scss'

const { Option } = Select

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Order {
  key: string
  id: string
  customer: string
  email: string
  phone: string
  date: string
  total: number
  status: 'completed' | 'processing' | 'cancelled'
  items: OrderItem[]
}

const Orders = () => {
  const [searchText, setSearchText] = useState('')
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Mock data for orders
  const orders: Order[] = [
    {
      key: '1',
      id: 'ORD-001',
      customer: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      date: '2023-05-15',
      total: 1200000,
      status: 'completed',
      items: [
        { id: 1, name: 'Nón lá Tây Ninh', price: 150000, quantity: 2 },
        { id: 2, name: 'Áo thun Núi Bà Đen', price: 200000, quantity: 3 },
        { id: 3, name: 'Tranh Tòa Thánh Cao Đài', price: 350000, quantity: 1 },
      ],
    },
    {
      key: '2',
      id: 'ORD-002',
      customer: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678',
      date: '2023-05-14',
      total: 850000,
      status: 'processing',
      items: [
        { id: 1, name: 'Nón lá Tây Ninh', price: 150000, quantity: 1 },
        { id: 5, name: 'Trà Tây Ninh', price: 120000, quantity: 2 },
        { id: 4, name: 'Túi xách thổ cẩm', price: 250000, quantity: 2 },
      ],
    },
    {
      key: '3',
      id: 'ORD-003',
      customer: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0923456789',
      date: '2023-05-14',
      total: 2350000,
      status: 'completed',
      items: [
        { id: 3, name: 'Tranh Tòa Thánh Cao Đài', price: 350000, quantity: 2 },
        { id: 6, name: 'Mật ong rừng Tây Ninh', price: 180000, quantity: 3 },
        { id: 2, name: 'Áo thun Núi Bà Đen', price: 200000, quantity: 5 },
      ],
    },
    {
      key: '4',
      id: 'ORD-004',
      customer: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0934567890',
      date: '2023-05-13',
      total: 750000,
      status: 'cancelled',
      items: [
        { id: 4, name: 'Túi xách thổ cẩm', price: 250000, quantity: 3 },
      ],
    },
    {
      key: '5',
      id: 'ORD-005',
      customer: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      phone: '0945678901',
      date: '2023-05-12',
      total: 1500000,
      status: 'completed',
      items: [
        { id: 2, name: 'Áo thun Núi Bà Đen', price: 200000, quantity: 2 },
        { id: 5, name: 'Trà Tây Ninh', price: 120000, quantity: 5 },
        { id: 6, name: 'Mật ong rừng Tây Ninh', price: 180000, quantity: 3 },
      ],
    },
  ]

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: boolean | Key, record: Order) => {
        const searchValue = value.toString().toLowerCase()
        return (
          record.customer.toLowerCase().includes(searchValue) ||
          record.id.toLowerCase().includes(searchValue) ||
          record.email.toLowerCase().includes(searchValue) ||
          record.phone.includes(searchValue)
        )
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Order, b: Order) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `${total.toLocaleString()} ₫`,
      sorter: (a: Order, b: Order) => a.total - b.total,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Order['status']) => {
        let color = ''
        let text = ''

        switch (status) {
          case 'completed':
            color = 'success'
            text = 'Hoàn thành'
            break
          case 'processing':
            color = 'processing'
            text = 'Đang xử lý'
            break
          case 'cancelled':
            color = 'error'
            text = 'Đã hủy'
            break
          default:
            color = 'default'
            text = status
        }

        return <Tag className={`status-tag ${color}`}>{text}</Tag>
      },
      filters: [
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đang xử lý', value: 'processing' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value: boolean | Key, record: Order) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Order) => (
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

  const handleView = (order: Order) => {
    setSelectedOrder(order)
    setIsViewModalVisible(true)
  }

  const handleEdit = (order: Order) => {
    setSelectedOrder(order)
    setIsEditModalVisible(true)
  }

  const handleDelete = (order: Order) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa đơn hàng "${order.id}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Handle delete logic here
        console.log('Deleted order:', order)
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
    <div className="orders-page">
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm theo mã, tên khách hàng, email, số điện thoại"
            prefix={<SearchOutlined />}
            onChange={e => handleSearch(e.target.value)}
            className="search-input"
            allowClear
          />
        </div>
      </div>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="orders-table"
      />

      {/* View Order Modal */}
      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.id}`}
        open={isViewModalVisible}
        onCancel={handleViewModalClose}
        footer={[
          <Button key="close" onClick={handleViewModalClose}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div className="order-details">
            <div className="order-info">
              <div className="info-section">
                <h3>Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {selectedOrder.customer}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
              </div>

              <div className="info-section">
                <h3>Thông tin đơn hàng</h3>
                <p><strong>Mã đơn hàng:</strong> {selectedOrder.id}</p>
                <p><strong>Ngày đặt:</strong> {selectedOrder.date}</p>
                <p><strong>Trạng thái:</strong> {
                  selectedOrder.status === 'completed' ? 'Hoàn thành' :
                    selectedOrder.status === 'processing' ? 'Đang xử lý' :
                      selectedOrder.status === 'cancelled' ? 'Đã hủy' : selectedOrder.status
                }</p>
              </div>
            </div>

            <div className="order-items">
              <h3>Sản phẩm</h3>
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.price.toLocaleString()} ₫</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toLocaleString()} ₫</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}><strong>Tổng cộng</strong></td>
                    <td><strong>{selectedOrder.total.toLocaleString()} ₫</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        title={`Cập nhật đơn hàng ${selectedOrder?.id}`}
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        onOk={handleEditModalClose}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {selectedOrder && (
          <div className="edit-order-form">
            <div className="form-item">
              <label>Trạng thái:</label>
              <Select
                defaultValue={selectedOrder.status}
                style={{ width: '100%' }}
                onChange={handleStatusChange}
              >
                <Option value="completed">Hoàn thành</Option>
                <Option value="processing">Đang xử lý</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
            </div>

            <div className="form-item">
              <label>Ngày đặt:</label>
              <DatePicker
                defaultValue={null}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-item">
              <label>Ghi chú:</label>
              <Input.TextArea rows={4} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
