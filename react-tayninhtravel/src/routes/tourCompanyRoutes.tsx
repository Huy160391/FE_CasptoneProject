import { RouteObject } from 'react-router-dom';

// Temporary placeholder components - sẽ được thay thế sau
const TourCompanyDashboard = () => <div>Tour Company Dashboard</div>;
const TourManagement = () => <div>Tour Management</div>;
const BookingManagement = () => <div>Booking Management</div>;
const Statistics = () => <div>Statistics</div>;

export const tourCompanyRoutes: RouteObject[] = [
    {
        path: '',
        children: [
            {
                path: 'dashboard',
                element: <TourCompanyDashboard />,
            },
            {
                path: 'tours',
                element: <TourManagement />,
            },
            {
                path: 'bookings',
                element: <BookingManagement />,
            },
            {
                path: 'statistics',
                element: <Statistics />,
            },
        ],
    },
];
