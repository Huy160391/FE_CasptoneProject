import axiosInstance from '../config/axios';
import { getErrorMessage } from '@/utils/errorHandler';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
    additionalData?: string;
    actionUrl?: string;
    icon?: string;
    expiresAt?: string;
    timeAgo?: string;
    priorityClass?: string;
    typeClass?: string;
}

export interface NotificationStats {
    totalNotifications: number;
    unreadCount: number;
    readCount: number;
    highPriorityCount: number;
    urgentCount: number;
    latestNotification?: Notification;
}

class NotificationService {
    // Lấy toàn bộ thông báo
    async getAllNotifications(
        pageIndex: number = 1,
        pageSize: number = 20,
        isRead?: boolean,
        type?: string
    ): Promise<{
        notifications: Notification[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        try {
            let url = `/Notification?pageIndex=${pageIndex}&pageSize=${pageSize}`;

            if (isRead !== undefined) {
                url += `&isRead=${isRead}`;
            }

            if (type) {
                url += `&type=${encodeURIComponent(type)}`;
            }

            const response = await axiosInstance.get(url);
            console.log('Get all notifications response:', response.data);

            // Handle API response structure
            if (response.data && Array.isArray(response.data.notifications)) {
                return {
                    notifications: response.data.notifications,
                    total: response.data.total || response.data.totalCount || 0,
                    page: pageIndex,
                    totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / pageSize)
                };
            } else if (Array.isArray(response.data)) {
                // Direct array response
                return {
                    notifications: response.data,
                    total: response.data.length,
                    page: pageIndex,
                    totalPages: 1
                };
            } else {
                console.warn('Unexpected getAllNotifications response structure:', response.data);
                return {
                    notifications: [],
                    total: 0,
                    page: pageIndex,
                    totalPages: 0
                };
            }
        } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
    }

    // Lấy số thông báo chưa đọc
    async getUnreadCount(): Promise<number> {
        try {
            const response = await axiosInstance.get('/Notification/unread-count');
            console.log('Unread count response:', response.data);

            // Handle API response structure: { statusCode, message, success, validationErrors, unreadCount }
            if (response.data && typeof response.data.unreadCount === 'number') {
                return response.data.unreadCount;
            } else if (response.data && typeof response.data.count === 'number') {
                return response.data.count;
            } else if (typeof response.data === 'number') {
                return response.data;
            } else {
                console.warn('Unexpected unread count response structure:', response.data);
                return 0;
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0; // Return 0 instead of throwing error to prevent UI crash
        }
    }

    // Đánh dấu thông báo đã đọc
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await axiosInstance.put(`/Notification/${notificationId}/read`);
        } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
    }

    // Đánh dấu đã đọc tất cả thông báo
    async markAllAsRead(): Promise<void> {
        try {
            await axiosInstance.put('/Notification/mark-all-read');
        } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
    }

    // Xóa thông báo
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await axiosInstance.delete(`/Notification/${notificationId}`);
        } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
    }

    // Lấy thống kê thông báo
    async getNotificationStats(): Promise<NotificationStats> {
        try {
            const response = await axiosInstance.get('/Notification/stats');
            return response.data;
        } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
    }

    // Lấy thông báo mới nhất
    async getLatestNotifications(limit: number = 5): Promise<Notification[]> {
        try {
            const response = await axiosInstance.get(`/Notification/latest?limit=${limit}`);
            return response.data.notifications;
        } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
    }

    // Lấy thông báo theo loại
    async getNotificationsByType(type: string, page: number = 1, limit: number = 20): Promise<{
        notifications: Notification[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        try {
            const response = await axiosInstance.get(`/Notification/type/${type}?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
    }
}

export const notificationService = new NotificationService();

