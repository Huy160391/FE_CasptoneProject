import { RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Profile from '@/pages/Profile';
import IndividualQRTest from '@/test/individualQRTest';

export const privateRoutes: RouteObject[] = [
    {
        path: '/profile',
        element: (
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
        ),
    },
    // 🧪 Development/Testing route
    {
        path: '/test/individual-qr',
        element: (
            <ProtectedRoute>
                <IndividualQRTest />
            </ProtectedRoute>
        ),
    }
];