import { RouteObject } from 'react-router-dom';
import TourGuideDashboard from '@/pages/tourguide/TourGuideDashboard';
import TourGuideInvitationList from '@/pages/tourguide/TourGuideInvitationList';
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
                element: <TourGuideInvitationList />,
            },
            {
                path: 'schedule',
                element: <TourGuideSchedule />,
            },

            {
                path: 'test-invitations',
                element: <div style={{padding: '20px'}}>
                    <h1>Test Invitations Page</h1>
                    <p>This is a test page to verify routing works.</p>
                    <a href="/tour-guide/invitations">Go to Real Invitations Page</a>
                </div>,
            },
        ],
    },
];
