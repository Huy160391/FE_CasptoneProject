import { RouteObject, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import BloggerLayout from '@/components/layout/BloggerLayout';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';
import { adminRoutes } from './adminRoutes';
import { bloggerRoutes } from './bloggerRoutes';
import TourCompanyLayout from '@/components/layout/TourCompanyLayout';
import { tourCompanyRoutes } from './tourCompanyRoutes';
import ProtectedRoute from './ProtectedRoute';
import SpecialityShopLayout from '@/components/layout/SpecialityShopLayout';
import Dashboard from '@/pages/specialityshop/Dashboard';
import Products from '@/pages/specialityshop/Products';
import Orders from '@/pages/specialityshop/Orders';
import Reviews from '@/pages/specialityshop/Reviews';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      ...publicRoutes,
      ...privateRoutes,
    ],
  }, {
    path: '/admin',
    element: <ProtectedRoute requiredRole="Admin" />,
    children: [
      {
        path: '',
        element: <AdminLayout />,
        children: [
          { path: '', element: <Navigate to="/admin/dashboard" /> },
          ...(adminRoutes[0].children || []),
        ],
      }
    ],
  },
  {
    path: '/blogger',
    element: <ProtectedRoute requiredRole="Blogger" />,
    children: [
      {
        path: '',
        element: <BloggerLayout />,
        children: [
          { path: '', element: <Navigate to="/blogger/dashboard" /> },
          ...(bloggerRoutes[0].children || []),
        ],
      }
    ],
  },
  {
    path: '/tour-company',
    element: <ProtectedRoute requiredRole="Tour Company" />,
    children: [{
      path: '',
      element: <TourCompanyLayout />,
      children: [
        { path: '', element: <Navigate to="/tour-company/dashboard" /> },
        ...(tourCompanyRoutes[0].children || []),
      ],
    }
    ],
  },
  {
    path: '/speciality-shop',
    element: <ProtectedRoute requiredRole="Specialty Shop" />,
    children: [
      {
        path: '',
        element: <SpecialityShopLayout />,
        children: [
          { path: '', element: <Dashboard /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'products', element: <Products /> },
          { path: 'orders', element: <Orders /> },
          { path: 'reviews', element: <Reviews /> },
        ],
      }
    ],
  },
];

export default routes;
