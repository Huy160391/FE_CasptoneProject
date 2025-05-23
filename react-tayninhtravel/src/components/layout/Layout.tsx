import { Outlet } from 'react-router-dom'
import { useThemeStore } from '@/store/useThemeStore'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
  const { isDarkMode } = useThemeStore()

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
