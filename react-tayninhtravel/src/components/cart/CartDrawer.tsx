import { Drawer, List, Button, InputNumber, Empty, Typography, Divider } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useCartStore } from '@/store/useCartStore'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import './CartDrawer.scss'

const { Title, Text } = Typography

interface CartDrawerProps {
  visible: boolean
  onClose: () => void
}

const CartDrawer = ({ visible, onClose }: CartDrawerProps) => {
  const { t } = useTranslation()
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCartStore()
  
  const handleQuantityChange = (id: number, type: 'product' | 'tour', quantity: number) => {
    updateQuantity(id, type, quantity)
  }
  
  const handleRemoveItem = (id: number, type: 'product' | 'tour') => {
    removeItem(id, type)
  }
  
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ₫`
  }
  
  return (
    <Drawer
      title={
        <div className="cart-drawer-title">
          <ShoppingCartOutlined />
          <span>Giỏ hàng ({getTotalItems()})</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      className="cart-drawer"
      footer={
        items.length > 0 ? (
          <div className="cart-footer">
            <div className="cart-total">
              <Text strong>Tổng cộng:</Text>
              <Text strong className="total-price">{formatPrice(getTotalPrice())}</Text>
            </div>
            <Button type="primary" size="large" block>
              Thanh toán
            </Button>
          </div>
        ) : null
      }
    >
      {items.length > 0 ? (
        <List
          className="cart-list"
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              className="cart-item"
              actions={[
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveItem(item.id, item.type)}
                />
              ]}
            >
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-type">
                  {item.type === 'product' ? 'Sản phẩm' : 'Tour'}
                </div>
                <div className="item-price">{formatPrice(item.price)}</div>
                <div className="item-quantity">
                  <InputNumber
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(item.id, item.type, value || 1)}
                  />
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <div className="empty-cart">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Giỏ hàng của bạn đang trống"
          />
          <Button type="primary" onClick={onClose}>
            Tiếp tục mua sắm
          </Button>
        </div>
      )}
      
      {items.length > 0 && (
        <div className="cart-actions">
          <Divider />
          <Link to="/cart" onClick={onClose}>
            <Button block>Xem chi tiết giỏ hàng</Button>
          </Link>
        </div>
      )}
    </Drawer>
  )
}

export default CartDrawer
