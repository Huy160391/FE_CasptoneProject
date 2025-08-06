import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    List,
    Button,
    Typography,
    Space,
    Tag,
    Progress,
    Alert,
    Row,
    Col,
    Statistic,
    Dropdown,
    MenuProps
} from 'antd';
import {
    CalendarOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    QrcodeOutlined,
    MessageOutlined,
    MoreOutlined,
    FireOutlined
} from '@ant-design/icons';
import { getMyActiveTours, ActiveTour } from '@/services/tourguideService';

const { Title, Text } = Typography;

interface TourActiveListProps {
    refreshTrigger?: number;
}

const TourActiveList: React.FC<TourActiveListProps> = ({ refreshTrigger }) => {
    const navigate = useNavigate();
    const [activeTours, setActiveTours] = useState<ActiveTour[]>([]);
    const [loading, setLoading] = useState(false);

    // Load active tours
    const loadActiveTours = async () => {
        try {
            setLoading(true);
            const response = await getMyActiveTours();
            if (response.success && response.data) {
                setActiveTours(response.data);
            }
        } catch (error) {
            console.error('Error loading active tours:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActiveTours();
    }, [refreshTrigger]);

    // Get tour status color
    const getTourStatusColor = (tour: ActiveTour) => {
        const now = new Date();
        const tourDate = new Date(tour.tourDate);
        const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDiff <= 1) return 'red'; // Tour sắp bắt đầu hoặc đang diễn ra
        if (hoursDiff <= 24) return 'orange'; // Tour trong 24h tới
        return 'blue'; // Tour còn lâu
    };

    // Get tour status text
    const getTourStatusText = (tour: ActiveTour) => {
        const now = new Date();
        const tourDate = new Date(tour.tourDate);
        const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDiff <= 0) return 'Đang diễn ra';
        if (hoursDiff <= 1) return 'Sắp bắt đầu';
        if (hoursDiff <= 24) return 'Hôm nay';
        return 'Sắp tới';
    };

    // Create dropdown menu for tour actions
    const createTourMenu = (tour: ActiveTour): MenuProps => ({
        items: [
            {
                key: 'checkin',
                label: 'Check-in khách',
                icon: <QrcodeOutlined />,
                disabled: tour.checkedInCount === tour.bookingsCount,
                onClick: () => navigate(`/tour-guide/checkin/${tour.id}`)
            },
            {
                key: 'timeline',
                label: 'Lịch trình',
                icon: <ClockCircleOutlined />,
                onClick: () => navigate(`/tour-guide/timeline/${tour.id}`)
            },
            {
                key: 'notify',
                label: 'Thông báo khách',
                icon: <MessageOutlined />,
                onClick: () => navigate(`/tour-guide/guest-notification/${tour.id}`)
            },
            {
                key: 'incident',
                label: 'Báo cáo sự cố',
                icon: <FireOutlined />,
                onClick: () => navigate('/tour-guide/incident-report')
            }
        ]
    });

    if (activeTours.length === 0 && !loading) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <CalendarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Title level={4} type="secondary">Không có tour nào hôm nay</Title>
                    <Text type="secondary">
                        Bạn chưa có tour nào được phân công. Hãy kiểm tra lại lời mời tour hoặc liên hệ admin.
                    </Text>
                </div>
            </Card>
        );
    }

    return (
        <div>
            {/* Quick Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Tours hôm nay"
                            value={activeTours.length}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Tổng khách"
                            value={activeTours.reduce((sum, tour) => sum + tour.bookingsCount, 0)}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Đã check-in"
                            value={activeTours.reduce((sum, tour) => sum + tour.checkedInCount, 0)}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Tours List */}
            <Card title="Tours đang hoạt động" loading={loading}>
                <List
                    dataSource={activeTours}
                    renderItem={(tour) => {
                        const checkInProgress = tour.bookingsCount > 0 
                            ? Math.round((tour.checkedInCount / tour.bookingsCount) * 100) 
                            : 0;

                        return (
                            <List.Item
                                actions={[
                                    <Dropdown
                                        key="actions"
                                        menu={createTourMenu(tour)}
                                        trigger={['click']}
                                        placement="bottomRight"
                                    >
                                        <Button icon={<MoreOutlined />} />
                                    </Dropdown>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <Text strong>{tour.title}</Text>
                                            <Tag color={getTourStatusColor(tour)}>
                                                {getTourStatusText(tour)}
                                            </Tag>
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Space>
                                                    <CalendarOutlined />
                                                    <Text>{new Date(tour.tourDate).toLocaleDateString('vi-VN')}</Text>
                                                    <ClockCircleOutlined />
                                                    <Text>{new Date(tour.tourDate).toLocaleTimeString('vi-VN', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}</Text>
                                                </Space>
                                                
                                                <Space>
                                                    <TeamOutlined />
                                                    <Text>{tour.checkedInCount}/{tour.bookingsCount} khách</Text>
                                                    <Progress
                                                        percent={checkInProgress}
                                                        size="small"
                                                        style={{ width: '100px' }}
                                                        strokeColor={checkInProgress === 100 ? '#52c41a' : '#1890ff'}
                                                    />
                                                </Space>

                                                {tour.description && (
                                                    <Text type="secondary" ellipsis>
                                                        {tour.description}
                                                    </Text>
                                                )}
                                            </Space>
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            </Card>

            {/* Quick Actions Alert */}
            {activeTours.some(tour => {
                const now = new Date();
                const tourDate = new Date(tour.tourDate);
                const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                return hoursDiff <= 1 && tour.checkedInCount < tour.bookingsCount;
            }) && (
                <Alert
                    message="Có tour sắp bắt đầu!"
                    description="Bạn có tour sắp bắt đầu trong 1 tiếng tới. Hãy bắt đầu check-in khách hàng."
                    type="warning"
                    showIcon
                    style={{ marginTop: '16px' }}
                    action={
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                                const urgentTour = activeTours.find(tour => {
                                    const now = new Date();
                                    const tourDate = new Date(tour.tourDate);
                                    const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                                    return hoursDiff <= 1 && tour.checkedInCount < tour.bookingsCount;
                                });
                                if (urgentTour) {
                                    navigate(`/tour-guide/checkin/${urgentTour.id}`);
                                }
                            }}
                        >
                            Check-in ngay
                        </Button>
                    }
                />
            )}
        </div>
    );
};

export default TourActiveList;
