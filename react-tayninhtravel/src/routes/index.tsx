import { RouteObject, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';
import { adminRoutes } from './adminRoutes';
import AdminRoute from './AdminRoute';

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
];

export default routes;
