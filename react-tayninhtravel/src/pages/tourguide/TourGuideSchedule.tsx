import React, { useState, useEffect } from 'react';
import {
    Card,
    Calendar,
    Badge,
    Typography,
    List,
    Tag,
    Button,
    Modal,
    Descriptions,
    Empty,
    Spin
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    participants: number;
    status: 'confirmed' | 'pending' | 'completed';
    description?: string;
    company: string;
}

const TourGuideSchedule: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Mock data - replace with actual API call
    const mockEvents: ScheduleEvent[] = [
        {
            id: '1',
            title: 'Tour Tây Ninh - Núi Bà Đen',
            date: '2024-01-15',
            time: '08:00 - 17:00',
            location: 'Núi Bà Đen, Tây Ninh',
            participants: 25,
            status: 'confirmed',
            description: 'Tour khám phá núi Bà Đen với các hoạt động leo núi và tham quan chùa',
            company: 'Tây Ninh Travel'
        },
        {
            id: '2',
            title: 'Tour Cao Đài Temple',
            date: '2024-01-18',
            time: '09:00 - 15:00',
            location: 'Tòa Thánh Cao Đài, Tây Ninh',
            participants: 15,
            status: 'pending',
            description: 'Tham quan Tòa Thánh Cao Đài và tìm hiểu về tôn giáo Cao Đài',
            company: 'Heritage Tours'
        },
        {
            id: '3',
            title: 'Tour Địa đạo Củ Chi',
            date: '2024-01-20',
            time: '07:30 - 16:30',
            location: 'Địa đạo Củ Chi',
            participants: 30,
            status: 'confirmed',
            description: 'Khám phá hệ thống địa đạo lịch sử Củ Chi',
            company: 'Vietnam Discovery'
        }
    ];

    useEffect(() => {
        setEvents(mockEvents);
    }, []);

    // Get events for a specific date
    const getEventsForDate = (date: Dayjs) => {
        return events.filter(event => dayjs(event.date).isSame(date, 'day'));
    };

    // Get events for selected date
    const selectedDateEvents = getEventsForDate(selectedDate);

    // Calendar cell render
    const dateCellRender = (value: Dayjs) => {
        const dayEvents = getEventsForDate(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {dayEvents.map(event => (
                    <li key={event.id}>
                        <Badge
                            status={
                                event.status === 'confirmed' ? 'success' :
                                event.status === 'pending' ? 'processing' : 'default'
                            }
                            text={
                                <span style={{ fontSize: '12px' }}>
                                    {event.title.length > 15 ? 
                                        `${event.title.substring(0, 15)}...` : 
                                        event.title
                                    }
                                </span>
                            }
                        />
                    </li>
                ))}
            </ul>
        );
    };

    // Handle date select
    const onDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
    };

    // Handle event click
    const handleEventClick = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setModalVisible(true);
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'processing';
            case 'completed': return 'default';
            default: return 'default';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Đã xác nhận';
            case 'pending': return 'Chờ xác nhận';
            case 'completed': return 'Đã hoàn thành';
            default: return status;
        }
    };

    return (
        <div className="tour-guide-schedule">
            <Title level={2}>Lịch trình Tour Guide</Title>
            
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Calendar */}
                <div style={{ flex: '1 1 600px', minWidth: 600 }}>
                    <Card>
                        <Calendar
                            value={selectedDate}
                            onSelect={onDateSelect}
                            dateCellRender={dateCellRender}
                        />
                    </Card>
                </div>

                {/* Events for selected date */}
                <div style={{ flex: '1 1 400px', minWidth: 400 }}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CalendarOutlined />
                                Lịch trình ngày {selectedDate.format('DD/MM/YYYY')}
                            </div>
                        }
                    >
                        {selectedDateEvents.length > 0 ? (
                            <List
                                dataSource={selectedDateEvents}
                                renderItem={(event) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="link"
                                                icon={<EyeOutlined />}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                Chi tiết
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {event.title}
                                                    <Tag color={getStatusColor(event.status)}>
                                                        {getStatusText(event.status)}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div style={{ marginBottom: 4 }}>
                                                        <ClockCircleOutlined /> {event.time}
                                                    </div>
                                                    <div style={{ marginBottom: 4 }}>
                                                        <EnvironmentOutlined /> {event.location}
                                                    </div>
                                                    <div>
                                                        <TeamOutlined /> {event.participants} người tham gia
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty 
                                description="Không có lịch trình nào trong ngày này"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </div>
            </div>

            {/* Event Detail Modal */}
            <Modal
                title="Chi tiết lịch trình"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedEvent && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Tên tour">
                            {selectedEvent.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày">
                            {dayjs(selectedEvent.date).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            {selectedEvent.time}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa điểm">
                            {selectedEvent.location}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số người tham gia">
                            {selectedEvent.participants} người
                        </Descriptions.Item>
                        <Descriptions.Item label="Công ty">
                            {selectedEvent.company}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(selectedEvent.status)}>
                                {getStatusText(selectedEvent.status)}
                            </Tag>
                        </Descriptions.Item>
                        {selectedEvent.description && (
                            <Descriptions.Item label="Mô tả">
                                {selectedEvent.description}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default TourGuideSchedule;
