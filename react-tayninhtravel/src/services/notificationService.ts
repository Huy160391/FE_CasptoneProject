import axiosInstance from '../config/axios';

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
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Lấy số thông báo chưa đọc
    async getUnreadCount(): Promise<number> {
        try {
            const response = await axiosInstance.get('/Notification/unread-count');
            return response.data.count;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }

    // Đánh dấu thông báo đã đọc
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await axiosInstance.put(`/Notification/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Đánh dấu đã đọc tất cả thông báo
    async markAllAsRead(): Promise<void> {
        try {
            await axiosInstance.put('/Notification/mark-all-read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Xóa thông báo
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await axiosInstance.delete(`/Notification/${notificationId}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Lấy thống kê thông báo
    async getNotificationStats(): Promise<NotificationStats> {
        try {
            const response = await axiosInstance.get('/Notification/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching notification stats:', error);
            throw error;
        }
    }

    // Lấy thông báo mới nhất
    async getLatestNotifications(limit: number = 5): Promise<Notification[]> {
        try {
            const response = await axiosInstance.get(`/Notification/latest?limit=${limit}`);
            return response.data.notifications;
        } catch (error) {
            console.error('Error fetching latest notifications:', error);
            throw error;
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
        } catch (error) {
            console.error('Error fetching notifications by type:', error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();
