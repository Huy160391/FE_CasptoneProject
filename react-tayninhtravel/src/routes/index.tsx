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
import { specialityShopRoutes } from './specialityShopRoutes';

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
    element: <ProtectedRoute requiredRole="Speciality shop" />,
    children: [
      {
        path: '',
        element: <SpecialityShopLayout />,
        children: [
          { path: '', element: <Navigate to="/speciality-shop/products" /> },
          ...(specialityShopRoutes[0].children || []),
        ],
      }
    ],
  },
];

export default routes;
