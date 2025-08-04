import { Layout, Space } from 'antd'
import ThemeToggle from '../common/ThemeToggle'
import LanguageSwitcher from '../common/LanguageSwitcher'
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
          <LanguageSwitcher />
          <div className="notification-bell">
            <NotificationBell />
          </div>
        </Space>
      </div>
    </Header>
  )
}

export default AdminHeader
