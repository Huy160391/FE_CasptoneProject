import { Layout, Dropdown, Space } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './AdminHeader.scss'

const { Header } = Layout

const AdminHeader = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  const items = [
    {
      key: 'profile',
      label: 'Hồ sơ',
      icon: <UserOutlined />,
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      onClick: () => navigate('/admin/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <Header className="admin-header">
      <div className="header-content">
        <div className="page-title">Dashboard</div>
        <div className="header-right">
          <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
            <Space className="user-dropdown">
              <div className="user-avatar">
                <img
                  src="/images/default-avatar.png"
                  alt="avatar"
                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
              <span className="username">Admin</span>
            </Space>
          </Dropdown>
        </div>
      </div>
    </Header>
  )
}

export default AdminHeader
