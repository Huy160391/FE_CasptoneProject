import { Outlet } from 'react-router-dom'
import { useThemeStore } from '@/store/useThemeStore'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { Layout as AntLayout } from 'antd'

const { Content } = AntLayout

const AdminLayout = () => {
  const { isDarkMode } = useThemeStore()

  return (
    <AntLayout style={{ minHeight: '100vh' }} className={isDarkMode ? 'dark-mode' : ''}>
      <AdminSidebar />
      <AntLayout>
        <AdminHeader />
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default AdminLayout
