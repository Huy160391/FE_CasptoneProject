import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Drawer, Space, Badge } from 'antd'
import {
  MenuOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import ThemeToggle from '../common/ThemeToggle'
// import LanguageSwitcher from '../common/LanguageSwitcher'
import LoginModal from '../auth/LoginModal'
import RegisterModal from '../auth/RegisterModal'
import CartDrawer from '../cart/CartDrawer'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import logoImage from '@/assets/TNDT_Logo.png'
import './Navbar.scss'

const { Header } = Layout

const Navbar = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false)
  const [isCartDrawerVisible, setIsCartDrawerVisible] = useState(false)
  const { t } = useTranslation()
  const location = useLocation()
  const { getTotalItems } = useCartStore()
  const { isAuthenticated, user, logout } = useAuthStore()

  const showDrawer = () => {
    setIsDrawerVisible(true)
  }

  const closeDrawer = () => {
    setIsDrawerVisible(false)
  }

  const handleLoginClick = () => {
    setIsLoginModalVisible(true)
  }

  const handleRegisterClick = () => {
    setIsRegisterModalVisible(true)
  }

  const closeLoginModal = () => {
    setIsLoginModalVisible(false)
  }

  const closeRegisterModal = () => {
    setIsRegisterModalVisible(false)
  }

  const showCartDrawer = () => {
    setIsCartDrawerVisible(true)
  }

  const closeCartDrawer = () => {
    setIsCartDrawerVisible(false)
  }

  const handleLogout = () => {
    logout()
  }

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">{t('navigation.home')}</Link>,
    },
    {
      key: '/things-to-do',
      icon: <AppstoreOutlined />,
      label: <Link to="/things-to-do">{t('navigation.tours')}</Link>,
    },
    {
      key: '/shop',
      icon: <ShoppingOutlined />,
      label: <Link to="/shop">{t('navigation.services')}</Link>,
    },
    {
      key: '/blog',
      icon: <ReadOutlined />,
      label: <Link to="/blog">Blog</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">{t('navigation.about')}</Link>,
    },
    {
      key: '/contact',
      icon: <PhoneOutlined />,
      label: <Link to="/contact">{t('navigation.contact')}</Link>,
    },
  ]

  return (
    <>
      <Header className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <Link to="/">
              <img src={logoImage} alt="Tay Ninh Tour Logo" className="logo-image" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="desktop-menu"
          />

          {/* Mobile Menu Button */}
          <Button
            className="menu-button"
            type="text"
            icon={<MenuOutlined />}
            onClick={showDrawer}
          />

          {/* Right side buttons */}
          <div className="navbar-right">
            <Space>
              <ThemeToggle />
              {/* <LanguageSwitcher /> */}

              <Badge count={getTotalItems()} showZero={false} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  onClick={showCartDrawer}
                  className="cart-button"
                />
              </Badge>

              {isAuthenticated ? (
                <Space>
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    className="user-button"
                  >
                    {user?.name}
                  </Button>
                  <Button
                    type="primary"
                    ghost
                    onClick={handleLogout}
                  >
                    {t('common.logout')}
                  </Button>
                </Space>
              ) : (
                <Space>
                  <Button
                    className="button-login"
                    type="primary"
                    ghost
                    onClick={handleLoginClick}
                  >
                    {t('common.login')}
                  </Button>
                  <Button
                    className="button-register"
                    type="primary"
                    onClick={handleRegisterClick}
                  >
                    {t('common.register')}
                  </Button>
                </Space>
              )}
            </Space>
          </div>
        </div>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        open={isDrawerVisible}
        width={280}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ border: 'none' }}
        />
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button type="primary" ghost onClick={handleLoginClick}>
            {t('navigation.login')}
          </Button>
          <Button type="primary" onClick={handleRegisterClick}>
            {t('navigation.register')}
          </Button>
        </div>
      </Drawer>

      {/* Login and Register Modals */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={closeLoginModal}
        onRegisterClick={handleRegisterClick}
      />

      <RegisterModal
        isVisible={isRegisterModalVisible}
        onClose={closeRegisterModal}
        onLoginClick={handleLoginClick}
      />

      <CartDrawer
        visible={isCartDrawerVisible}
        onClose={closeCartDrawer}
      />
    </>
  )
}

export default Navbar
