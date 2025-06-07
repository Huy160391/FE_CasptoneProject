import { RouteObject } from 'react-router-dom';
import Dashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import Orders from '@/pages/admin/Orders';
import Tours from '@/pages/admin/Tours';
import Reviews from '@/pages/admin/Reviews';
import Blogs from '@/pages/admin/Blogs';
import MyInfo from '@/pages/admin/MyInfo';
import CVManagement from '@/pages/admin/CVManagement';
import SupportTickets from '@/pages/admin/SupportTickets';

export const adminRoutes: RouteObject[] = [
    {
        path: '/admin',
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            }, {
                path: 'users',
                element: <UserManagement />,
            },
            {
                path: 'orders',
                element: <Orders />,
            },
            {
                path: 'tours',
                element: <Tours />,
            },
            {
                path: 'reviews',
                element: <Reviews />,
            }, {
                path: 'blogs',
                element: <Blogs />,
            },
            {
                path: 'my-info',
                element: <MyInfo />,
            }, {
                path: 'CVManagement',
                element: <CVManagement />,
            },
            {
                path: 'support-tickets',
                element: <SupportTickets />,
            },
        ],
    },
];
