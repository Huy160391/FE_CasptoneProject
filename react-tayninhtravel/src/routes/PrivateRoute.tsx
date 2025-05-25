import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Cho phép admin truy cập trang profile, chỉ chuyển hướng khi admin đang cố truy cập các trang user thông thường khác
    useEffect(() => {
        if (isAuthenticated && user && user.role === 'Admin' &&
            location.pathname !== '/profile' &&
            !location.pathname.startsWith('/admin')) {
            navigate('/admin/dashboard');
        }
    }, [isAuthenticated, user, navigate, location]);

    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute; 