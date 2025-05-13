import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { Layout as AntLayout } from 'antd'

const { Content } = AntLayout

const AdminLayout = () => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
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
