import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { message } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { handleLogoutWithCartSync } from '@/utils/logoutHandler';

interface JWTPayload {
    exp?: number;
    [key: string]: any;
}

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requiredRole?: 'Admin' | 'Blogger' | 'Tour Company' | 'Tour Guide' | 'Specialty Shop';
    requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    requireAuth = true
}) => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Validate token on mount and when authentication state changes
    useEffect(() => {
        if (requireAuth && isAuthenticated) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode<JWTPayload>(token);
                    if (decoded.exp) {
                        const currentTime = Date.now() / 1000;
                        if (decoded.exp < currentTime) {
                            // Token expired
                            console.warn('Token expired in ProtectedRoute');
                            message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                            handleLogoutWithCartSync(false);
                            navigate('/login');
                        }
                    }
                } catch (error) {
                    console.error('Error validating token in ProtectedRoute:', error);
                    message.error('Token không hợp lệ. Vui lòng đăng nhập lại.');
                    handleLogoutWithCartSync(false);
                    navigate('/login');
                }
            } else if (requireAuth) {
                // No token but auth required
                handleLogoutWithCartSync(false);
                navigate('/login');
            }
        }
    }, [isAuthenticated, requireAuth, navigate]);

    // Debug logging
    console.log('ProtectedRoute Debug:', {
        path: location.pathname,
        requiredRole,
        isAuthenticated,
        userRole: user?.role,
        user: user
    });    // Auto redirect logic
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
        } else if (isAuthenticated && user && user.role === 'Tour Guide' &&
            location.pathname !== '/profile' &&
            !location.pathname.startsWith('/tour-guide') &&
            !requiredRole) {
            navigate('/tour-guide/dashboard');
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
        return <Navigate to="/login" replace />;
    }

    // Check role permission
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Render children nếu có, ngược lại render Outlet cho nested routes
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
