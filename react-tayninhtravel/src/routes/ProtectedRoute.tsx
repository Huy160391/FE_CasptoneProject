import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { message } from 'antd';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requiredRole?: 'Admin' | 'Blogger' | 'Tour Company' | 'Specialty Shop';
    requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    requireAuth = true
}) => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();    // Auto redirect logic
    useEffect(() => {
        if (isAuthenticated && user && user.role === 'Admin' &&
            location.pathname !== '/profile' &&
            !location.pathname.startsWith('/admin') &&
            !requiredRole) {
            navigate('/admin/dashboard');
        } else if (isAuthenticated && user && user.role === 'Blogger' &&
            location.pathname !== '/profile' &&
            !location.pathname.startsWith('/blogger') &&
            !requiredRole) {
            navigate('/blogger/dashboard');
        } else if (isAuthenticated && user && user.role === 'Tour Company' &&
            location.pathname !== '/profile' &&
            !location.pathname.startsWith('/tour-company') &&
            !requiredRole) {
            navigate('/tour-company/dashboard');
        } else if (isAuthenticated && user && user.role === 'Specialty Shop' &&
            location.pathname !== '/profile' &&
            !location.pathname.startsWith('/speciality-shop') &&
            !requiredRole) {
            navigate('/speciality-shop');
        }
    }, [isAuthenticated, user, navigate, location, requiredRole]);

    // Show error messages
    useEffect(() => {
        if (requireAuth) {
            if (!isAuthenticated || !user) {
                if (requiredRole) {
                    message.error('Bạn cần đăng nhập để truy cập trang này');
                }
            } else if (requiredRole && user.role !== requiredRole) {
                message.error('Bạn không có quyền truy cập trang này');
            }
        }
    }, [isAuthenticated, user, requiredRole, requireAuth]);

    // Check authentication
    if (requireAuth && (!isAuthenticated || !user)) {
        return <Navigate to="/" replace />;
    }

    // Check role permission
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Render children nếu có, ngược lại render Outlet cho nested routes
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
