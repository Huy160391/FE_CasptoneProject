import { RouteObject, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import BloggerLayout from '@/components/layout/BloggerLayout';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';
import { adminRoutes } from './adminRoutes';
import { bloggerRoutes } from './bloggerRoutes';
import AdminRoute from './AdminRoute';
import BloggerRoute from './BloggerRoute';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      ...publicRoutes,
      ...privateRoutes,
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
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
    element: <BloggerRoute />,
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
];

export default routes;
