import { useState } from 'react'
import { Layout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  CommentOutlined,
  IdcardOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import './AdminSidebar.scss'

const { Sider } = Layout

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Quản lý người dùng</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Quản lý sản phẩm</Link>,
    },
    {
      key: '/admin/orders',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/orders">Quản lý đơn hàng</Link>,
    },
    {
      key: '/admin/tours',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/tours">Quản lý tour</Link>,
    },
    {
      key: '/admin/reviews',
      icon: <CommentOutlined />,
      label: <Link to="/admin/reviews">Đánh giá</Link>,
    },
    {
      key: '/admin/blogs',
      icon: <ReadOutlined />,
      label: <Link to="/admin/blogs">Quản lý bài viết</Link>,
    },
    {
      key: '/admin/my-info',
      icon: <IdcardOutlined />,
      label: <Link to="/admin/my-info">Thông tin cá nhân</Link>,
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

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  )
}

export default AdminSidebar
