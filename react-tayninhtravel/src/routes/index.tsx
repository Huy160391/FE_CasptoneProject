import { RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      ...publicRoutes,
      ...privateRoutes,
    ],
  },
];

export default routes;
