import { useState, useEffect } from 'react';
import { notification } from 'antd';

export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                notification.success({
                    message: 'Kết nối đã được khôi phục',
                    description: 'Bạn đã có thể sử dụng các tính năng online.',
                    duration: 3
                });
                setWasOffline(false);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            notification.warning({
                message: 'Mất kết nối mạng',
                description: 'Một số tính năng có thể không hoạt động. Vui lòng kiểm tra kết nối.',
                duration: 0 // Keep showing until online
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    return { isOnline, wasOffline };
};
