import { RouteObject } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Profile from '@/pages/Profile';

export const privateRoutes: RouteObject[] = [
    {
        path: '/profile',
        element: (
            <PrivateRoute>
                <Profile />
            </PrivateRoute>
        ),
    }
]; 