import { RouteObject } from 'react-router-dom';
import DashboardCompany from '@/pages/dashboardCompany/DashboardCompany';
import Tours from '@/pages/admin/Tours';

export const companyRoutes: RouteObject[] = [
    {
        path: '/admin',
        children: [
            {
                path: 'dashboard',
                element: <DashboardCompany />,
            }, {
                path: 'tours',
                element: <Tours />,
            },
            {
                path: 'create-tour',
                element: <Create-Tour/>,
            },
            {
                path: 'detail-tour/:id',
                element: <DetailTour />,
            },
        ],
    },
];
