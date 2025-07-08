import { RouteObject } from 'react-router-dom';
import TourCompanyDashboard from '@/pages/tourcompany/TourCompanyDashboard';
import TourTemplateManagement from '@/pages/tourcompany/TourTemplateManagement';
import TourDetailsManagement from '@/pages/tourcompany/TourDetailsManagement';
import TourManagement from '@/pages/tourcompany/TourManagement';
import TransactionHistory from '@/pages/tourcompany/TransactionHistory';
import ReviewHistory from '@/pages/tourcompany/ReviewHistory';
import RevenueDashboard from '@/pages/tourcompany/RevenueDashboard';

export const tourCompanyRoutes: RouteObject[] = [
    {
        path: '',
        children: [
            {
                path: 'dashboard',
                element: <TourCompanyDashboard />,
            },
            {
                path: 'tour-templates',
                element: <TourTemplateManagement />,
            },
            {
                path: 'tours',
                element: <TourDetailsManagement />,
            },
            {
                path: 'tours-old',
                element: <TourManagement />,
            },
            {
                path: 'transactions',
                element: <TransactionHistory />,
            },
            {
                path: 'reviews',
                element: <ReviewHistory />,
            },
            {
                path: 'revenue',
                element: <RevenueDashboard />,
            },
        ],
    },
];
