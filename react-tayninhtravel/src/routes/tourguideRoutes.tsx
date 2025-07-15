import { RouteObject } from 'react-router-dom';
import TourGuideDashboard from '@/pages/tourguide/TourGuideDashboard';
import TourGuideInvitationList from '@/pages/tourguide/TourGuideInvitationList';
import TourGuideProfile from '@/pages/tourguide/TourGuideProfile';
import TourGuideSchedule from '@/pages/tourguide/TourGuideSchedule';
import TourGuideDebug from '@/components/debug/TourGuideDebug';

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
                element: <TourGuideInvitationList />,
            },
            {
                path: 'profile',
                element: <TourGuideProfile />,
            },
            {
                path: 'schedule',
                element: <TourGuideSchedule />,
            },
            {
                path: 'debug',
                element: <TourGuideDebug />,
            },
        ],
    },
];
