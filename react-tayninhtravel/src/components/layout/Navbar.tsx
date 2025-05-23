import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Drawer, Space, Badge, message, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
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
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import ThemeToggle from '../common/ThemeToggle'
import LanguageSwitcher from '../common/LanguageSwitcher'
import LoginModal from '../auth/LoginModal'
import RegisterModal from '../auth/RegisterModal'
import CartDrawer from '../cart/CartDrawer'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
// import { authService } from '@/services/authService'
import logoImage from '@/assets/TNDT_Logo.png'
import darkLogo from '@/assets/TNDT_logo_darkmode.png'
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
  const { isDarkMode } = useThemeStore()
  const navigate = useNavigate()

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
    // Xóa thông tin từ localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Cập nhật state trong useAuthStore
    logout();

    message.success(t('common.logoutSuccess'));
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
      key: '/career',
      icon: <UserOutlined />,
      label: <Link to="/career">{t('navigation.jobs')}</Link>,
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

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: t('common.profile'),
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      label: t('common.settings'),
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t('common.logout'),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <>
      <Header className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <Link to="/">
              <img
                src={isDarkMode ? darkLogo : logoImage}
                alt="Tay Ninh Tour Logo"
                className="logo-image"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="desktop-menu"
            disabledOverflow={true}
            style={{ flex: '1 1 auto' }}
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
            <Space size={12}>
              <ThemeToggle />
              <LanguageSwitcher />

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
                  <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                    <Space className="user-dropdown">
                      <div className="user-avatar">
                        <img
                          src={user?.avatar || 'https://i.imgur.com/4AiXzf8.jpg'}
                          alt="avatar"
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }}
                        />
                      </div>
                    </Space>
                  </Dropdown>
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
