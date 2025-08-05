import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Select, Tooltip, Spin } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import './Orders.scss'
import adminService from '@/services/adminService'

const { Option } = Select

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  imageUrl?: string | null
  shopId: string
}

interface Order {
  id: string
  userId: string
  totalAmount: number
  discountAmount: number
  totalAfterDiscount: number
  status: string
  voucherCode?: string | null
  payOsOrderCode: string
  isChecked: boolean
  checkedAt?: string | null
  checkedByShopId?: string | null
  createdAt: string
  orderDetails: OrderItem[]
}

const Orders = () => {
  const [searchText, setSearchText] = useState('')
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [shopInfoMap, setShopInfoMap] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await adminService.getAllProductOrders({})
        const orderList: Order[] = res.orders || []
        setOrders(orderList)

        // Lấy danh sách shopId duy nhất từ tất cả orderDetails
        const shopIds = Array.from(new Set(orderList.flatMap(order => order.orderDetails.map(item => item.shopId))))
        // Lấy thông tin shop cho từng shopId
        const shopInfoPromises = shopIds.map(async shopId => {
          try {
            const shopRes = await adminService.getSpecialtyShopById(shopId)
            return { shopId, shop: shopRes }
          } catch {
            return { shopId, shop: null }
          }
        })
        const shopInfos = await Promise.all(shopInfoPromises)
        const shopMap: Record<string, any> = {}
        shopInfos.forEach(({ shopId, shop }) => {
          shopMap[shopId] = shop
        })
        setShopInfoMap(shopMap)
      } catch (err) {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'payOsOrderCode',
      key: 'payOsOrderCode',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: boolean | Key, record: Order) => {
        const searchValue = value.toString().toLowerCase()
        return (
          record.payOsOrderCode.toLowerCase().includes(searchValue) ||
          record.id.toLowerCase().includes(searchValue)
        )
      },
    },
    {
      title: 'Tên shop',
      key: 'shopName',
      render: (_: any, record: Order) => {
        // Lấy shopId đầu tiên của order (giả sử mỗi đơn chỉ có 1 shop)
        const shopId = record.orderDetails[0]?.shopId
        const shop = shopInfoMap[shopId]
        const shopName = shop?.name || 'N/A'
        return shop ? (
          <Tooltip title={
            <div>
              <div><strong>{shop.name}</strong></div>
              <div>Địa chỉ: {shop.address || 'N/A'}</div>
              <div>SĐT: {shop.phone || 'N/A'}</div>
              <div>Email: {shop.email || 'N/A'}</div>
            </div>
          }>
            <span style={{ cursor: 'pointer', color: '#1677ff', textDecoration: 'underline' }}>{shopName}</span>
          </Tooltip>
        ) : shopName
      }
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a: Order, b: Order) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAfterDiscount',
      key: 'totalAfterDiscount',
      render: (total: number) => `${total.toLocaleString()} ₫`,
      sorter: (a: Order, b: Order) => a.totalAfterDiscount - b.totalAfterDiscount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = ''
        let text = ''
        switch (status) {
          case 'Paid':
            color = 'success'
            text = 'Hoàn thành'
            break
          case 'Pending':
            color = 'processing'
            text = 'Đang xử lý'
            break
          case 'Cancelled':
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
        { text: 'Hoàn thành', value: 'Paid' },
        { text: 'Đang xử lý', value: 'Pending' },
        { text: 'Đã hủy', value: 'Cancelled' },
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
      content: `Bạn có chắc chắn muốn xóa đơn hàng "${order.payOsOrderCode}" không?`,
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
            placeholder="Tìm kiếm theo mã đơn hàng"
            prefix={<SearchOutlined />}
            onChange={e => handleSearch(e.target.value)}
            className="search-input"
            allowClear
          />
        </div>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="orders-table"
        />
      </Spin>

      {/* View Order Modal */}
      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.payOsOrderCode}`}
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
                <h3>Thông tin đơn hàng</h3>
                <p><strong>Mã đơn hàng:</strong> {selectedOrder.payOsOrderCode}</p>
                <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> {
                  selectedOrder.status === 'Paid' ? 'Hoàn thành' :
                    selectedOrder.status === 'Pending' ? 'Đang xử lý' :
                      selectedOrder.status === 'Cancelled' ? 'Đã hủy' : selectedOrder.status
                }</p>
                <p><strong>Tổng tiền gốc:</strong> {selectedOrder.totalAmount.toLocaleString()} ₫</p>
                <p><strong>Giảm giá:</strong> {selectedOrder.discountAmount.toLocaleString()} ₫</p>
                <p><strong>Tổng tiền cuối:</strong> {selectedOrder.totalAfterDiscount.toLocaleString()} ₫</p>
                {selectedOrder.voucherCode && (
                  <p><strong>Mã voucher:</strong> {selectedOrder.voucherCode}</p>
                )}
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
                  {selectedOrder.orderDetails.map((item: OrderItem) => (
                    <tr key={item.productId}>
                      <td>{item.productName}</td>
                      <td>{item.unitPrice.toLocaleString()} ₫</td>
                      <td>{item.quantity}</td>
                      <td>{(item.unitPrice * item.quantity).toLocaleString()} ₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        title={`Cập nhật đơn hàng ${selectedOrder?.payOsOrderCode}`}
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
                <Option value="Paid">Hoàn thành</Option>
                <Option value="Pending">Đang xử lý</Option>
                <Option value="Cancelled">Đã hủy</Option>
              </Select>
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
