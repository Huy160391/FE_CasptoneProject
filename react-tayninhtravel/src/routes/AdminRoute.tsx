import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { message } from 'antd';

const AdminRoute: React.FC = () => {
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            message.error('Bạn cần đăng nhập để truy cập trang này');
        } else if (user.role !== 'Admin') {
            message.error('Bạn không có quyền truy cập trang này');
        }
    }, [isAuthenticated, user]);

    // Kiểm tra người dùng đã đăng nhập và có quyền admin không
    if (!isAuthenticated || !user || user.role !== 'Admin') {
        // Chuyển hướng về trang không có quyền truy cập
        return <Navigate to="/unauthorized" replace />;
    }

    // Nếu là admin, cho phép truy cập các trang admin
    return <Outlet />;
};

export default AdminRoute;
