import React from 'react';
import { Card, Typography, Divider } from 'antd';
import BookingHistory from '@/pages/BookingHistory';

const { Title, Text } = Typography;

/**
 * Test component để kiểm tra BookingHistory với API thực tế
 */
const BookingHistoryTest: React.FC = () => {
    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2}>Test BookingHistory Component</Title>
                <Text type="secondary">
                    Component này sử dụng API thực tế thay vì mock data.
                    Đảm bảo bạn đã đăng nhập để xem dữ liệu.
                </Text>
                
                <Divider />
                
                <BookingHistory />
            </Card>
        </div>
    );
};

export default BookingHistoryTest;
