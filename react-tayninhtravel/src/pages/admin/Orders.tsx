import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Spin, theme } from 'antd'
import { SearchOutlined, EyeOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import './Orders.scss'
import adminService from '@/services/adminService'

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

interface ShopInfo {
  id: string
  userId: string
  shopName: string
  description: string
  location: string
  representativeName: string
  email: string
  phoneNumber: string
  website?: string | null
  businessLicense: string
  businessLicenseUrl?: string | null
  logoUrl?: string | null
  shopType: string
  openingHours: string
  closingHours: string
  rating: number
  isShopActive: boolean
  createdAt: string
  updatedAt: string
  userName?: string | null
  userEmail?: string | null
  userAvatar?: string | null
  userRole?: string | null
}

const Orders = () => {
  const { token } = theme.useToken()
  const [searchText, setSearchText] = useState('')
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [isShopModalVisible, setIsShopModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedShop, setSelectedShop] = useState<ShopInfo | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [shopInfoMap, setShopInfoMap] = useState<Record<string, ShopInfo>>({})
  const [shopFilterOptions, setShopFilterOptions] = useState<Array<{ text: string, value: string }>>([])

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
        const shopMap: Record<string, ShopInfo> = {}
        const filterOptions: Array<{ text: string, value: string }> = []

        shopInfos.forEach(({ shopId, shop }) => {
          if (shop) {
            shopMap[shopId] = shop
            filterOptions.push({ text: shop.shopName, value: shopId })
          }
        })

        setShopInfoMap(shopMap)
        setShopFilterOptions(filterOptions)
      } catch (err) {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleShopClick = (shopId: string) => {
    const shop = shopInfoMap[shopId]
    if (shop) {
      setSelectedShop(shop)
      setIsShopModalVisible(true)
    }
  }

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
        const shopName = shop?.shopName || 'N/A'

        return shop ? (
          <Button
            type="link"
            icon={<ShopOutlined />}
            onClick={() => handleShopClick(shopId)}
            style={{ padding: 0, height: 'auto' }}
          >
            {shopName}
          </Button>
        ) : shopName
      },
      filters: shopFilterOptions,
      filterSearch: true,
      onFilter: (value: boolean | Key, record: Order) => {
        const shopId = record.orderDetails[0]?.shopId
        return shopId === value
      },
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

  const handleShopModalClose = () => {
    setIsShopModalVisible(false)
    setSelectedShop(null)
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

      {/* Shop Info Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShopOutlined />
            <span>Thông tin cửa hàng</span>
          </div>
        }
        open={isShopModalVisible}
        onCancel={handleShopModalClose}
        footer={[
          <Button key="close" onClick={handleShopModalClose}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedShop && (
          <div className="shop-details">
            <div className="shop-header" style={{ marginBottom: '20px' }}>
              {selectedShop.logoUrl && (
                <img
                  src={selectedShop.logoUrl}
                  alt="Shop logo"
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />
              )}
              <h2 style={{ margin: 0, color: '#1677ff' }}>{selectedShop.shopName}</h2>
              <p style={{ color: '#666', margin: '5px 0' }}>{selectedShop.shopType}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag color={selectedShop.isShopActive ? 'green' : 'red'}>
                  {selectedShop.isShopActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                </Tag>
                <span style={{ color: '#faad14' }}>⭐ {selectedShop.rating}/5</span>
              </div>
            </div>

            <div className="shop-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="info-section">
                <h3>Thông tin liên hệ</h3>
                <p><strong>Người đại diện:</strong> {selectedShop.representativeName}</p>
                <p><strong>Email:</strong> {selectedShop.email}</p>
                <p><strong>Số điện thoại:</strong> {selectedShop.phoneNumber}</p>
                <p><strong>Địa chỉ:</strong> {selectedShop.location}</p>
                {selectedShop.website && (
                  <p><strong>Website:</strong> <a href={selectedShop.website} target="_blank" rel="noopener noreferrer">{selectedShop.website}</a></p>
                )}
              </div>

              <div className="info-section">
                <h3>Thông tin kinh doanh</h3>
                <p><strong>Giấy phép kinh doanh:</strong> {selectedShop.businessLicense}</p>
                <p><strong>Giờ mở cửa:</strong> {selectedShop.openingHours} - {selectedShop.closingHours}</p>
                <p><strong>Ngày tạo:</strong> {new Date(selectedShop.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Cập nhật lần cuối:</strong> {new Date(selectedShop.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            {selectedShop.description && (
              <div className="info-section" style={{ marginTop: '20px' }}>
                <h3>Mô tả</h3>
                <p>{selectedShop.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* View Order Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOutlined />
            <span>Chi tiết đơn hàng #{selectedOrder?.payOsOrderCode}</span>
          </div>
        }
        open={isViewModalVisible}
        onCancel={handleViewModalClose}
        footer={[
          <Button key="close" type="primary" onClick={handleViewModalClose}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedOrder && (
          <div className="order-details" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Order Header */}
            <div style={{
              background: token.colorPrimary ?
                `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)` :
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '20px' }}>
                    Đơn hàng #{selectedOrder.payOsOrderCode}
                  </h2>
                  <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                    Đặt lúc {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Tag
                    color={
                      selectedOrder.status === 'Paid' ? 'success' :
                        selectedOrder.status === 'Pending' ? 'processing' :
                          selectedOrder.status === 'Cancelled' ? 'error' : 'default'
                    }
                    style={{ fontSize: '14px', padding: '4px 12px' }}
                  >
                    {selectedOrder.status === 'Paid' ? 'Hoàn thành' :
                      selectedOrder.status === 'Pending' ? 'Đang xử lý' :
                        selectedOrder.status === 'Cancelled' ? 'Đã hủy' : selectedOrder.status}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Order Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{
                background: token.colorBgContainer,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${token.colorBorder}`,
                boxShadow: token.boxShadowTertiary
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: token.colorText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>📋</span>
                  Thông tin cơ bản
                </h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: token.colorTextSecondary, minWidth: '100px', display: 'inline-block' }}>Mã đơn:</span>
                    <span style={{ fontWeight: '500', color: token.colorText }}>{selectedOrder.payOsOrderCode}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: token.colorTextSecondary, minWidth: '100px', display: 'inline-block' }}>User ID:</span>
                    <span style={{ fontWeight: '500', color: token.colorText }}>{selectedOrder.userId}</span>
                  </div>
                  {selectedOrder.voucherCode && (
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: token.colorTextSecondary, minWidth: '100px', display: 'inline-block' }}>Voucher:</span>
                      <Tag color="orange">{selectedOrder.voucherCode}</Tag>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                background: token.colorBgContainer,
                padding: '16px',
                borderRadius: '8px',
                border: `1px solid ${token.colorBorder}`,
                boxShadow: token.boxShadowTertiary
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: token.colorText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💰</span>
                  Thông tin thanh toán
                </h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: token.colorTextSecondary, minWidth: '120px', display: 'inline-block' }}>Tổng tiền gốc:</span>
                    <span style={{ fontWeight: '500', color: token.colorText }}>{selectedOrder.totalAmount.toLocaleString()} ₫</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: token.colorTextSecondary, minWidth: '120px', display: 'inline-block' }}>Giảm giá:</span>
                    <span style={{ fontWeight: '500', color: token.colorError }}>
                      -{selectedOrder.discountAmount.toLocaleString()} ₫
                    </span>
                  </div>
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: `2px solid ${token.colorBorder}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '16px', color: token.colorText }}>Thành tiền:</span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '18px',
                      color: token.colorSuccess
                    }}>
                      {selectedOrder.totalAfterDiscount.toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: token.boxShadowTertiary
            }}>
              <div style={{
                background: token.colorFillSecondary,
                padding: '16px',
                borderBottom: `1px solid ${token.colorBorder}`
              }}>
                <h4 style={{ margin: 0, color: token.colorText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🛍️</span>
                  Sản phẩm ({selectedOrder.orderDetails.length} món)
                </h4>
              </div>

              <div style={{ padding: '0' }}>
                {selectedOrder.orderDetails.map((item: OrderItem, index: number) => (
                  <div
                    key={item.productId}
                    style={{
                      padding: '16px',
                      borderBottom: index < selectedOrder.orderDetails.length - 1 ? `1px solid ${token.colorBorderSecondary}` : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: token.colorBgContainer
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px', color: token.colorText }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: '13px', color: token.colorTextSecondary }}>
                        ID: {item.productId}
                      </div>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginTop: '8px',
                            border: `1px solid ${token.colorBorder}`
                          }}
                        />
                      )}
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontSize: '14px', color: token.colorTextSecondary }}>Đơn giá</div>
                      <div style={{ fontWeight: '500', color: token.colorText }}>
                        {item.unitPrice.toLocaleString()} ₫
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '60px' }}>
                      <div style={{ fontSize: '14px', color: token.colorTextSecondary }}>SL</div>
                      <div style={{
                        fontWeight: '600',
                        background: token.colorFillSecondary,
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        color: token.colorText,
                        border: `1px solid ${token.colorBorder}`
                      }}>
                        {item.quantity}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                      <div style={{ fontSize: '14px', color: token.colorTextSecondary }}>Thành tiền</div>
                      <div style={{ fontWeight: '600', color: token.colorSuccess, fontSize: '15px' }}>
                        {(item.unitPrice * item.quantity).toLocaleString()} ₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
