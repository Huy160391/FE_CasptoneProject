import { useState } from 'react'
import { Layout, Menu, Button, Divider, Avatar } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  CommentOutlined,
  IdcardOutlined,
  ReadOutlined,
  HomeOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import './AdminSidebar.scss'

const { Sider } = Layout

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleBackToSite = () => {
    navigate('/')
  }
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">{t('admin.sidebar.dashboard')}</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">{t('admin.sidebar.users')}</Link>,
    },
    {
      key: '/admin/CVManagement',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/CVManagement">{t('admin.sidebar.cvManagement')}</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/orders">{t('admin.sidebar.orders')}</Link>,
    },
    {
      key: '/admin/tours',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/tours">{t('admin.sidebar.tours')}</Link>,
    },
    {
      key: '/admin/reviews',
      icon: <CommentOutlined />,
      label: <Link to="/admin/reviews">{t('admin.sidebar.reviews')}</Link>,
    },
    {
      key: '/admin/blogs',
      icon: <ReadOutlined />,
      label: <Link to="/admin/blogs">{t('admin.sidebar.blogs')}</Link>,
    },
    {
      key: '/admin/support-tickets',
      icon: <CustomerServiceOutlined />,
      label: <Link to="/admin/support-tickets">{t('admin.sidebar.supportTickets')}</Link>,
    },
    {
      key: '/admin/my-info',
      icon: <IdcardOutlined />,
      label: <Link to="/admin/my-info">{t('admin.sidebar.myInfo')}</Link>,
    },
  ]

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      className="admin-sidebar"
      trigger={null}
      width={250}
    >
      <div className="logo-container">
        {collapsed ? 'TNT' : 'Tay Ninh Tour'}
      </div>

      <div className="collapse-button" onClick={toggleCollapsed}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      {/* Admin info section */}
      <div className="admin-info">
        <Avatar
          size={collapsed ? 40 : 64}
          src={user?.avatar || "https://i.imgur.com/4AiXzf8.jpg"}
          icon={<UserOutlined />}
        />
        {!collapsed && (
          <div className="admin-details">
            <div className="admin-name">{user?.name || 'Admin'}</div>
            <div className="admin-role">Quản trị viên</div>
          </div>
        )}
      </div>

      <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Main menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <Button
          type="primary"
          icon={<HomeOutlined />}
          onClick={handleBackToSite}
          className="back-to-site-btn"
          block
        >
          {!collapsed && "Về trang chủ"}
        </Button>

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="logout-btn"
          block
        >
          {!collapsed && "Đăng xuất"}
        </Button>
      </div>
    </Sider>
  )
}

export default AdminSidebar
