import { Outlet } from 'react-router-dom'
import { useThemeStore } from '@/store/useThemeStore'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { Layout as AntLayout } from 'antd'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

const { Content } = AntLayout

const AdminLayout = () => {
  const { isDarkMode } = useThemeStore()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    console.log('AdminLayout mounted', { user, isAuthenticated })
  }, [user, isAuthenticated])

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
