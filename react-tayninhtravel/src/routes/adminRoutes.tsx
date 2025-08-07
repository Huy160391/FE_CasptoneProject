import { RouteObject } from 'react-router-dom';
import Dashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import Orders from '@/pages/admin/Orders';
import Tours from '@/pages/admin/Tours';
import Blogs from '@/pages/admin/Blogs';
import CVManagement from '@/pages/admin/CVManagement';
import SupportTickets from '@/pages/admin/SupportTickets';
import ShopRegistrationManagement from '@/pages/admin/ShopRegistrationManagement';
import ShopManagement from '@/pages/admin/ShopManagement';
import TourGuideManagement from '@/pages/admin/TourGuideManagement';
import VoucherManagement from '@/pages/admin/VoucherManagement';
import { AdminWithdrawalManagement } from '@/components/admin';

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
                path: 'tour-guides',
                element: <TourGuideManagement />,
            },
            {
                path: 'CVManagement',
                element: <CVManagement />,
            },
            {
                path: 'shops',
                element: <ShopManagement />,
            },
            {
                path: 'shop-registrations',
                element: <ShopRegistrationManagement />,
            },
            {
                path: 'withdrawal-requests',
                element: <AdminWithdrawalManagement />,
            },
            {
                path: 'orders',
                element: <Orders />,
            },
            {
                path: 'vouchers',
                element: <VoucherManagement />,
            },
            {
                path: 'tours',
                element: <Tours />,
            },
            {
                path: 'blogs',
                element: <Blogs />,
            },
            {
                path: 'support-tickets',
                element: <SupportTickets />,
            },
        ],
    },
];
