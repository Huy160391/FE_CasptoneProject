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
import TourGuideLayout from '@/components/layout/TourGuideLayout';
import { tourguideRoutes } from './tourguideRoutes';
import ProtectedRoute from './ProtectedRoute';
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
    path: '/tour-guide',
    element: <ProtectedRoute requiredRole="Tour Guide" />,
    children: [{
      path: '',
      element: <TourGuideLayout />,
      children: [
        { path: '', element: <Navigate to="/tour-guide/dashboard" /> },
        ...(tourguideRoutes[0].children || []),
      ],
    }
    ],
  },
  ...specialityShopRoutes,
];

export default routes;
