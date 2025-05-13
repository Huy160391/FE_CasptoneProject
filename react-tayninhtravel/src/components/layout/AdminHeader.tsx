import { Layout, Button, Dropdown, Avatar, Space } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './AdminHeader.scss'

const { Header } = Layout

const AdminHeader = () => {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    // Implement logout logic here
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
      type: 'divider',
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
        <div className="page-title">
          Dashboard
        </div>
        
        <div className="header-right">
          <Dropdown menu={{ items }} placement="bottomRight">
            <Space className="user-dropdown">
              <Avatar icon={<UserOutlined />} />
              <span className="username">Admin</span>
            </Space>
          </Dropdown>
        </div>
      </div>
    </Header>
  )
}

export default AdminHeader
