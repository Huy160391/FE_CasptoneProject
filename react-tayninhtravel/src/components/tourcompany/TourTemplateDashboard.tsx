import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    Table,
    Tag,
    Button,
    Spin
} from 'antd';
import {
    TrophyOutlined,
    CalendarOutlined,
    TeamOutlined,
    DollarOutlined,
    EyeOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { usePreloadWizardData } from '../../hooks/usePreloadWizardData';
import { getTourTemplates, getTourDetailsList } from '../../services/tourcompanyService';
import {
    TourTemplate,
    TourDetails,
    TourTemplateType,
    TourDetailsStatus
} from '../../types/tour';
import {
    getTemplateTypeLabel,
    getTourDetailsStatusLabel,
    getStatusColor
} from '../../constants/tourTemplate';



interface DashboardStats {
    totalTemplates: number;
    activeTemplates: number;
    totalDetails: number;
    approvedDetails: number;
    totalSlots: number;
    availableSlots: number;
    templatesByType: Record<TourTemplateType, number>;
    detailsByStatus: Record<TourDetailsStatus, number>;
}

const TourTemplateDashboard: React.FC = () => {
    const { token } = useAuthStore();

    // Preload wizard data when component mounts
    usePreloadWizardData();

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        totalTemplates: 0,
        activeTemplates: 0,
        totalDetails: 0,
        approvedDetails: 0,
        totalSlots: 0,
        availableSlots: 0,
        templatesByType: {
            [TourTemplateType.FreeScenic]: 0,
            [TourTemplateType.PaidAttraction]: 0
        },
        detailsByStatus: {
            [TourDetailsStatus.Pending]: 0,
            [TourDetailsStatus.Approved]: 0,
            [TourDetailsStatus.Rejected]: 0,
            [TourDetailsStatus.Suspended]: 0,
            [TourDetailsStatus.AwaitingGuideAssignment]: 0,
            [TourDetailsStatus.Cancelled]: 0,
            [TourDetailsStatus.AwaitingAdminApproval]: 0,
            [TourDetailsStatus.WaitToPublic]: 0,
            [TourDetailsStatus.Public]: 0
        }
    });
    const [recentTemplates, setRecentTemplates] = useState<TourTemplate[]>([]);
    const [recentDetails, setRecentDetails] = useState<TourDetails[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load templates
            const templatesResponse = await getTourTemplates({ pageSize: 100 }, token ?? undefined);
            const templates = templatesResponse.data || [];
            
            // Load details
            const detailsResponse = await getTourDetailsList({ pageSize: 100 }, token ?? undefined);
            const details = detailsResponse.data || [];

            // Calculate stats
            const newStats: DashboardStats = {
                totalTemplates: templates.length,
                activeTemplates: templates.filter((t: TourTemplate) => t.isActive).length,
                totalDetails: details.length,
                approvedDetails: details.filter((d: TourDetails) => d.status === TourDetailsStatus.Approved).length,
                totalSlots: 0,
                availableSlots: 0,
                templatesByType: {
                    [TourTemplateType.FreeScenic]: templates.filter((t: TourTemplate) => t.templateType === TourTemplateType.FreeScenic).length,
                    [TourTemplateType.PaidAttraction]: templates.filter((t: TourTemplate) => t.templateType === TourTemplateType.PaidAttraction).length
                },
                detailsByStatus: {
                    [TourDetailsStatus.Pending]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.Pending).length,
                    [TourDetailsStatus.Approved]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.Approved).length,
                    [TourDetailsStatus.Rejected]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.Rejected).length,
                    [TourDetailsStatus.Suspended]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.Suspended).length,
                    [TourDetailsStatus.AwaitingGuideAssignment]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.AwaitingGuideAssignment).length,
                    [TourDetailsStatus.Cancelled]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.Cancelled).length,
                    [TourDetailsStatus.AwaitingAdminApproval]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.AwaitingAdminApproval).length,
                    [TourDetailsStatus.WaitToPublic]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.WaitToPublic).length,
                    [TourDetailsStatus.Public]: details.filter((d: TourDetails) => d.status === TourDetailsStatus.Public).length
                }
            };

            // Calculate total slots from templates with capacity summary
            templates.forEach((template: TourTemplate) => {
                if (template.capacitySummary) {
                    newStats.totalSlots += template.capacitySummary.totalSlots;
                    newStats.availableSlots += template.capacitySummary.availableSlots;
                }
            });

            setStats(newStats);
            setRecentTemplates(templates.slice(0, 5));
            setRecentDetails(details.slice(0, 5));

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const templateColumns = [
        {
            title: 'Tên Template',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Loại',
            dataIndex: 'templateType',
            key: 'templateType',
            render: (type: TourTemplateType) => (
                <Tag color={type === TourTemplateType.FreeScenic ? 'green' : 'blue'}>
                    {getTemplateTypeLabel(type)}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
    ];

    const detailsColumns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: TourDetailsStatus) => (
                <Tag color={getStatusColor(status)}>
                    {getTourDetailsStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
    ];

    return (
        <div>
            <Spin spinning={loading}>
                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng Templates"
                                value={stats.totalTemplates}
                                prefix={<TrophyOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Templates Hoạt động"
                                value={stats.activeTemplates}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng Tour Details"
                                value={stats.totalDetails}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Details Đã duyệt"
                                value={stats.approvedDetails}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: '#f5222d' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Progress Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} lg={12}>
                        <Card title="Phân bố theo loại Template" extra={<BarChartOutlined />}>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Tour danh lam thắng cảnh</span>
                                    <span>{stats.templatesByType[TourTemplateType.FreeScenic]}</span>
                                </div>
                                <Progress
                                    percent={stats.totalTemplates > 0 ? (stats.templatesByType[TourTemplateType.FreeScenic] / stats.totalTemplates) * 100 : 0}
                                    strokeColor="#52c41a"
                                />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Tour khu vui chơi</span>
                                    <span>{stats.templatesByType[TourTemplateType.PaidAttraction]}</span>
                                </div>
                                <Progress
                                    percent={stats.totalTemplates > 0 ? (stats.templatesByType[TourTemplateType.PaidAttraction] / stats.totalTemplates) * 100 : 0}
                                    strokeColor="#1890ff"
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Tỷ lệ duyệt Tour Details" extra={<TeamOutlined />}>
                            <div style={{ textAlign: 'center' }}>
                                <Progress
                                    type="circle"
                                    percent={stats.totalDetails > 0 ? Math.round((stats.approvedDetails / stats.totalDetails) * 100) : 0}
                                    format={() => `${stats.approvedDetails}/${stats.totalDetails}`}
                                />
                                <div style={{ marginTop: 16, color: '#666' }}>
                                    Tỷ lệ duyệt: {stats.totalDetails > 0 ? Math.round((stats.approvedDetails / stats.totalDetails) * 100) : 0}%
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Data Tables */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card 
                            title="Templates gần đây" 
                            extra={
                                <Button type="link" icon={<EyeOutlined />}>
                                    Xem tất cả
                                </Button>
                            }
                        >
                            <Table
                                columns={templateColumns}
                                dataSource={recentTemplates}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card 
                            title="Tour Details gần đây" 
                            extra={
                                <Button type="link" icon={<EyeOutlined />}>
                                    Xem tất cả
                                </Button>
                            }
                        >
                            <Table
                                columns={detailsColumns}
                                dataSource={recentDetails}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default TourTemplateDashboard;
