import { Layout, Space } from 'antd'
import ThemeToggle from '../common/ThemeToggle'
// ...existing code...
import NotificationBell from '../common/NotificationBell'
import './AdminHeader.scss'

const { Header } = Layout

const AdminHeader = () => {
  return (
    <Header className="admin-header">
      <div className="header-content">
        <div className="page-title">Dashboard</div>
        <Space className="header-actions" size="middle">
          <ThemeToggle />
          <div className="notification-bell">
            <NotificationBell />
          </div>
        </Space>
      </div>
    </Header>
  )
}

export default AdminHeader
