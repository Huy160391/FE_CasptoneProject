import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Button,
    List,
    Avatar,
    Badge,
    Progress,
    Calendar,
    Alert,
    Spin
} from 'antd';
import {
    MailOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    CalendarOutlined,
    UserOutlined,
    RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TourGuideInvitation } from '@/types/tour';
import { getMyInvitations, formatTimeUntilExpiry } from '@/services/tourguideService';
import './TourGuideDashboard.scss';

const { Title, Text } = Typography;

const TourGuideDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [pendingInvitations, setPendingInvitations] = useState<TourGuideInvitation[]>([]);
    const [statistics, setStatistics] = useState<any>({});

    // Load dashboard data
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load pending invitations
            const pendingResponse = await getMyInvitations('Pending');
            if (pendingResponse.success) {
                setPendingInvitations(pendingResponse.invitations?.slice(0, 5) || []); // Show only 5 recent
            }

            // Load all invitations for statistics
            const allResponse = await getMyInvitations();
            if (allResponse.success) {
                setStatistics(allResponse.statistics || {});
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Quick stats data
    const quickStats = [
        {
            title: 'Lời mời chờ phản hồi',
            value: statistics.pendingInvitations || 0,
            icon: <MailOutlined />,
            color: '#1890ff',
            action: () => navigate('/tour-guide/invitations?tab=pending')
        },
        {
            title: 'Đã chấp nhận',
            value: statistics.acceptedInvitations || 0,
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
            action: () => navigate('/tour-guide/invitations?tab=accepted')
        },
        {
            title: 'Tỷ lệ chấp nhận',
            value: `${statistics.acceptanceRate || 0}%`,
            icon: <TrophyOutlined />,
            color: '#faad14',
            action: () => navigate('/tour-guide/invitations')
        },
        {
            title: 'Tổng lời mời',
            value: statistics.totalInvitations || 0,
            icon: <CalendarOutlined />,
            color: '#722ed1',
            action: () => navigate('/tour-guide/invitations')
        }
    ];

    return (
        <div className="tour-guide-dashboard">
            <div className="dashboard-header">
                <Title level={2}>Dashboard Tour Guide</Title>
                <Text type="secondary">Chào mừng bạn trở lại! Đây là tổng quan về các lời mời và hoạt động của bạn.</Text>
            </div>

            <Spin spinning={loading}>
                {/* Quick Stats */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {quickStats.map((stat, index) => (
                        <Col xs={24} sm={12} lg={6} key={index}>
                            <Card 
                                hoverable 
                                className="stat-card"
                                onClick={stat.action}
                            >
                                <Statistic
                                    title={stat.title}
                                    value={stat.value}
                                    prefix={
                                        <div 
                                            className="stat-icon" 
                                            style={{ color: stat.color }}
                                        >
                                            {stat.icon}
                                        </div>
                                    }
                                    valueStyle={{ color: stat.color }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[16, 16]}>
                    {/* Pending Invitations */}
                    <Col xs={24} lg={16}>
                        <Card 
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MailOutlined />
                                    Lời mời chờ phản hồi
                                    <Badge count={pendingInvitations.length} />
                                </div>
                            }
                            extra={
                                <Button 
                                    type="link" 
                                    onClick={() => navigate('/tour-guide/invitations?tab=pending')}
                                >
                                    Xem tất cả <RightOutlined />
                                </Button>
                            }
                        >
                            {pendingInvitations.length > 0 ? (
                                <List
                                    dataSource={pendingInvitations}
                                    renderItem={(invitation) => (
                                        <List.Item
                                            actions={[
                                                <Button 
                                                    type="primary" 
                                                    size="small"
                                                    onClick={() => navigate('/tour-guide/invitations?tab=pending')}
                                                >
                                                    Phản hồi
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar 
                                                        icon={<UserOutlined />}
                                                        style={{ backgroundColor: '#1890ff' }}
                                                    />
                                                }
                                                title={invitation.tourDetails.title}
                                                description={
                                                    <div>
                                                        <Text type="secondary">
                                                            Từ: {invitation.createdBy.name}
                                                        </Text>
                                                        <br />
                                                        <Text type="warning">
                                                            <ClockCircleOutlined /> Còn lại: {formatTimeUntilExpiry(invitation.expiresAt)}
                                                        </Text>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <MailOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                                    <p style={{ color: '#999', marginTop: 16 }}>
                                        Không có lời mời nào chờ phản hồi
                                    </p>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Performance Overview */}
                    <Col xs={24} lg={8}>
                        <Card title="Hiệu suất" className="performance-card">
                            <div style={{ marginBottom: 16 }}>
                                <Text>Tỷ lệ chấp nhận lời mời</Text>
                                <Progress 
                                    percent={statistics.acceptanceRate || 0} 
                                    strokeColor="#52c41a"
                                    format={(percent) => `${percent}%`}
                                />
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <Text>Tỷ lệ từ chối</Text>
                                <Progress 
                                    percent={statistics.rejectionRate || 0} 
                                    strokeColor="#ff4d4f"
                                    format={(percent) => `${percent}%`}
                                />
                            </div>

                            <Alert
                                message="Mẹo"
                                description="Tỷ lệ chấp nhận cao sẽ giúp bạn nhận được nhiều lời mời hơn từ các công ty tour."
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card title="Hành động nhanh">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={8}>
                                    <Button 
                                        type="primary" 
                                        block 
                                        icon={<MailOutlined />}
                                        onClick={() => navigate('/tour-guide/invitations')}
                                    >
                                        Xem tất cả lời mời
                                    </Button>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Button 
                                        block 
                                        icon={<CalendarOutlined />}
                                        onClick={() => navigate('/tour-guide/schedule')}
                                    >
                                        Xem lịch trình
                                    </Button>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Button 
                                        block 
                                        icon={<UserOutlined />}
                                        onClick={() => navigate('/tour-guide/profile')}
                                    >
                                        Cập nhật hồ sơ
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default TourGuideDashboard;
