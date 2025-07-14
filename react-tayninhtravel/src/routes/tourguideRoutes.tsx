import { RouteObject } from 'react-router-dom';
import TourGuideDashboard from '@/pages/tourguide/TourGuideDashboard';
import TourGuideInvitations from '@/pages/tourguide/TourGuideInvitations';
import TourGuideProfile from '@/pages/tourguide/TourGuideProfile';
import TourGuideSchedule from '@/pages/tourguide/TourGuideSchedule';

export const tourguideRoutes: RouteObject[] = [
    {
        path: '',
        children: [
            {
                path: 'dashboard',
                element: <TourGuideDashboard />,
            },
            {
                path: 'invitations',
                element: <TourGuideInvitations />,
            },
            {
                path: 'profile',
                element: <TourGuideProfile />,
            },
            {
                path: 'schedule',
                element: <TourGuideSchedule />,
            },
        ],
    },
];
