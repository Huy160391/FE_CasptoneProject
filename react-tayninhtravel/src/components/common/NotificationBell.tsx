import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { notificationService } from '../../services/notificationService';
import NotificationModal from './NotificationModal';
import './NotificationModal.scss';

const NotificationBell: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            setLoading(true);
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle bell click
    const handleBellClick = () => {
        setModalVisible(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setModalVisible(false);
        // Refresh unread count when modal closes
        fetchUnreadCount();
    };

    // Effect to fetch unread count on mount
    useEffect(() => {
        fetchUnreadCount();

        // Set up interval to refresh unread count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Badge count={unreadCount} size="small">
                <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="notification-bell-btn"
                    onClick={handleBellClick}
                    loading={loading}
                />
            </Badge>

            <NotificationModal
                visible={modalVisible}
                onClose={handleModalClose}
            />
        </>
    );
};

export default NotificationBell;
