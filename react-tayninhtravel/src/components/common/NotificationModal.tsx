import React, { useState, useEffect } from 'react';
import {
    Modal,
    List,
    Button,
    Typography,
    Space,
    Badge,
    Divider,
    Empty,
    Spin,
    message,
    Tag
} from 'antd';
import {
    BellOutlined,
    DeleteOutlined,
    CheckOutlined,
    EyeOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { notificationService, Notification } from '../../services/notificationService';
import { useThemeStore } from '../../store/useThemeStore';
import { useNavigate } from 'react-router-dom';
import './NotificationModal.scss';

const { Text, Paragraph } = Typography;

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { isDarkMode } = useThemeStore();
    const navigate = useNavigate();

    // Fetch notifications
    const fetchNotifications = async (reset = false) => {
        setLoading(true);
        try {
            const currentPage = reset ? 0 : pageIndex;
            const response = await notificationService.getAllNotifications(currentPage, 10);

            if (reset) {
                setNotifications(response.notifications);
                setPageIndex(2);
            } else {
                setNotifications(prev => [...prev, ...response.notifications]);
                setPageIndex(prev => prev + 1);
            }

            setTotal(response.total);
            setHasMore(response.notifications.length === 10);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            message.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    // Handle notification click - navigate and mark as read
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already read
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate to actionUrl if exists
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            onClose(); // Close modal after navigation
        }
    };

    // Mark as read
    const handleMarkAsRead = async (notificationId: string) => {
        setMarkingAsRead(notificationId);
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            message.success('Đã đánh dấu là đã đọc');
        } catch (error) {
            console.error('Error marking as read:', error);
            message.error('Không thể đánh dấu là đã đọc');
        } finally {
            setMarkingAsRead(null);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            message.success('Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            console.error('Error marking all as read:', error);
            message.error('Không thể đánh dấu tất cả là đã đọc');
        } finally {
            setLoading(false);
        }
    };

    // Delete notification
    const handleDelete = async (notificationId: string) => {
        setDeleting(notificationId);
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setTotal(prev => prev - 1);
            message.success('Đã xóa thông báo');
        } catch (error) {
            console.error('Error deleting notification:', error);
            message.error('Không thể xóa thông báo');
        } finally {
            setDeleting(null);
        }
    };

    // Load more notifications
    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchNotifications(false);
        }
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'red';
            case 'high':
                return 'orange';
            case 'medium':
                return 'blue';
            case 'low':
                return 'green';
            default:
                return 'default';
        }
    };

    // Get type color
    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'success':
                return 'green';
            case 'warning':
                return 'orange';
            case 'error':
                return 'red';
            case 'info':
                return 'blue';
            default:
                return 'default';
        }
    };

    // Format time ago
    const formatTimeAgo = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    };

    // Effect to fetch notifications when modal opens
    useEffect(() => {
        if (visible) {
            fetchNotifications(true);
        }
    }, [visible]);

    return (
        <Modal
            title={
                <Space>
                    <BellOutlined />
                    <span>Thông báo</span>
                    {total > 0 && (
                        <Badge count={notifications.filter(n => !n.isRead).length} />
                    )}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            className={`notification-modal ${isDarkMode ? 'dark-mode' : ''}`}
        >
            <div className="notification-modal-content">
                {/* Actions */}
                {notifications.length > 0 && (
                    <>
                        <div className="notification-actions">
                            <Button
                                type="primary"
                                ghost
                                size="small"
                                onClick={handleMarkAllAsRead}
                                loading={loading}
                                icon={<CheckOutlined />}
                            >
                                Đánh dấu tất cả đã đọc
                            </Button>
                        </div>
                        <Divider style={{ margin: '12px 0' }} />
                    </>
                )}

                {/* Notifications List */}
                {loading && notifications.length === 0 ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : notifications.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có thông báo nào"
                    />
                ) : (
                    <List
                        className="notification-list"
                        dataSource={notifications}
                        renderItem={(notification) => (
                            <List.Item
                                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.actionUrl ? 'clickable' : ''}`}
                                style={{ cursor: notification.actionUrl ? 'pointer' : 'default' }}
                                onClick={() => handleNotificationClick(notification)}
                                actions={[
                                    !notification.isRead && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<EyeOutlined />}
                                            loading={markingAsRead === notification.id}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering parent click
                                                handleMarkAsRead(notification.id);
                                            }}
                                        />
                                    ),
                                    <Button
                                        type="link"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        loading={deleting === notification.id}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering parent click
                                            handleDelete(notification.id);
                                        }}
                                    />
                                ].filter(Boolean)}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Text strong={!notification.isRead}>
                                                {notification.title}
                                            </Text>
                                            <Tag color={getPriorityColor(notification.priority)}>
                                                {notification.priority}
                                            </Tag>
                                            <Tag color={getTypeColor(notification.type)}>
                                                {notification.type}
                                            </Tag>
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Paragraph
                                                ellipsis={{ rows: 2, expandable: true }}
                                                style={{ marginBottom: 8 }}
                                            >
                                                {notification.message}
                                            </Paragraph>
                                            <Space size="small" style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                                <ClockCircleOutlined />
                                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                            </Space>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}

                {/* Load More */}
                {hasMore && notifications.length > 0 && (
                    <div className="load-more-container">
                        <Button
                            type="link"
                            onClick={handleLoadMore}
                            loading={loading}
                        >
                            Tải thêm thông báo
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default NotificationModal;
