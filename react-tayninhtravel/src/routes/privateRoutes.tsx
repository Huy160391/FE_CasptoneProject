import { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Profile from '@/pages/Profile';

export const privateRoutes: RouteObject[] = [
    {
        path: '/profile',
        element: (
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
        ),
    }
];