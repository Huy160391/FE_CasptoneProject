import { Drawer, List, Button, Empty, Typography, Divider } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { useCartStore } from '@/store/useCartStore'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import './CartDrawer.scss'

const { Text } = Typography
// const { Title } = Typography


interface CartDrawerProps {
  visible: boolean
  onClose: () => void
}

const CartDrawer = ({ visible, onClose }: CartDrawerProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCartStore()
  const handleQuantityChange = (id: string | number, type: 'product' | 'tour', quantity: number) => {
    updateQuantity(id, type, quantity)
  }

  const handleRemoveItem = (id: string | number, type: 'product' | 'tour') => {
    removeItem(id, type)
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}VND`
  }

  const handleCheckout = () => {
    onClose() // Đóng drawer trước
    navigate('/checkout') // Navigate đến trang checkout
  }

  const handleContinueShopping = () => {
    onClose() // Đóng drawer trước
    navigate('/shop') // Navigate đến trang shop
  }

  return (
    <Drawer
      title={
        <div className="cart-drawer-title">
          <ShoppingCartOutlined />
          <span>{t('cart.title')} ({getTotalItems()})</span>
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
              <Text strong>{t('cart.total')}:</Text>
              <Text strong className="total-price">{formatPrice(getTotalPrice())}</Text>
            </div>
            <Button type="primary" size="large" block onClick={handleCheckout}>
              {t('cart.checkout')}
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
                  <div className="quantity-controls">
                    <Button
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={() => handleQuantityChange(item.id, item.type, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="quantity-btn minus-btn"
                      size="small"
                    />
                    <span className="quantity-display">{item.quantity}</span>
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => handleQuantityChange(item.id, item.type, item.quantity + 1)}
                      disabled={item.quantity >= 99}
                      className="quantity-btn plus-btn"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <div className="empty-cart">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('cart.emptyDescription')}
          />
          <Button type="primary" onClick={handleContinueShopping}>
            {t('cart.continueShopping')}
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <div className="cart-actions">
          <Divider />
          <Link to="/cart" onClick={onClose}>
            <Button block>{t('cart.title')} - {t('common.viewDetails')}</Button>
          </Link>
        </div>
      )}
    </Drawer>
  )
}

export default CartDrawer
