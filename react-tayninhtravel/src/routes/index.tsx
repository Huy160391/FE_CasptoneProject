import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import HomePage from '../pages/Home'
import ShopPage from '../pages/Shop'
import ProductDetailPage from '../pages/ProductDetail'
import ThingsToDoPage from '../pages/ThingsToDo'
import ThingsToDoDetailPage from '../pages/ThingsToDoDetail'
import BlogPage from '../pages/Blog'
import BlogPostPage from '../pages/BlogPost'
import AboutPage from '../pages/About'
import ContactPage from '../pages/Contact'
import AdminLayout from '../components/layout/AdminLayout'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminUsers from '../pages/admin/Users'
import AdminProducts from '../pages/admin/Products'
import AdminOrders from '../pages/admin/Orders'
import AdminTours from '../pages/admin/Tours'
import AdminReviews from '../pages/admin/Reviews'
import AdminBlogs from '../pages/admin/Blogs'
import AdminMyInfo from '../pages/admin/MyInfo'

const AppRoutes = () => {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/product/:id" element={<ProductDetailPage />} />
        <Route path="things-to-do" element={<ThingsToDoPage />} />
        <Route path="things-to-do/detail/:id" element={<ThingsToDoDetailPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/post/:id" element={<BlogPostPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="tours" element={<AdminTours />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="my-info" element={<AdminMyInfo />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
