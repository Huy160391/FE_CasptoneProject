import React, { useState, useEffect } from 'react';
import {
    Tabs,
    Card,
    Row,
    Col,
    Statistic,
    Badge,
    Typography,
    Space,
    Button,
    DatePicker,
    message
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    StopOutlined,
    DollarOutlined,
    BarChartOutlined,
    ReloadOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { WithdrawalStatus } from '@/types';
import { getWithdrawalStatistics } from '@/services/adminWithdrawalService';
import { useAuthStore } from '@/store/useAuthStore';
import WithdrawalRequestList from './WithdrawalRequestList';
import dayjs from 'dayjs';
import './AdminWithdrawalManagement.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface StatisticsData {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    cancelledRequests: number;
    totalAmount: number;  // This will map from totalAmountRequested
    approvedAmount: number;
    pendingAmount: number;
}

/**
 * AdminWithdrawalManagement Component
 * 
 * Main admin component for managing withdrawal requests.
 * Features:
 * - Statistics dashboard with key metrics
 * - Tabbed interface for different request statuses
 * - Real-time data updates
 * - Date range filtering for statistics
 * - Responsive design
 */
const AdminWithdrawalManagement: React.FC = () => {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState('pending');
    const [statistics, setStatistics] = useState<StatisticsData>({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        cancelledRequests: 0,
        totalAmount: 0,
        approvedAmount: 0,
        pendingAmount: 0
    });
    const [statisticsLoading, setStatisticsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);

    useEffect(() => {
        loadStatistics();
    }, [dateRange, refreshTrigger]);

    /**
     * Load withdrawal statistics
     */
    const loadStatistics = async () => {
        setStatisticsLoading(true);
        try {
            const params = {
                fromDate: dateRange?.[0]?.format('YYYY-MM-DD'),
                toDate: dateRange?.[1]?.format('YYYY-MM-DD'),
                period: 'month' as const
            };

            const response = await getWithdrawalStatistics(params, token || undefined);

            // Map API response fields to component state
            const apiData = response.data || response;
            setStatistics({
                totalRequests: apiData.totalRequests || 0,
                pendingRequests: apiData.pendingRequests || 0,
                approvedRequests: apiData.approvedRequests || 0,
                rejectedRequests: apiData.rejectedRequests || 0,
                cancelledRequests: apiData.cancelledRequests || 0,
                totalAmount: apiData.totalAmountRequested || 0,
                approvedAmount: apiData.approvedAmount || 0,
                pendingAmount: apiData.pendingAmount || 0
            });
        } catch (error: any) {
            message.error('Không thể tải thống kê');
            console.error('Error loading statistics:', error);
        } finally {
            setStatisticsLoading(false);
        }
    };

    /**
     * Handle refresh
     */
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    /**
     * Format currency
     */
    const formatCurrency = (amount: number): string => {
        return `${amount.toLocaleString('vi-VN')} ₫`;
    };

    /**
     * Callback cập nhật lại số liệu thống kê
     */
    const handleDataChanged = () => {
        handleRefresh();
    };

    // State lưu số lượng request thực tế cho từng tab
    const [tabCounts, setTabCounts] = useState({
        pending: statistics.pendingRequests,
        approved: statistics.approvedRequests,
        rejected: statistics.rejectedRequests,
        cancelled: statistics.cancelledRequests,
        all: statistics.totalRequests
    });

    // Callback nhận số lượng request thực tế từ WithdrawalRequestList
    const handleTabCountChanged = (tabKey: string, count: number) => {
        setTabCounts(prev => ({ ...prev, [tabKey]: count }));
    };

    /**
     * Tab items configuration
     */
    const tabItems = [
        {
            key: 'pending',
            label: (
                tabCounts.pending > 0 ? (
                    <Badge count={tabCounts.pending} size="small">
                        <Space>
                            <ClockCircleOutlined />
                            Chờ duyệt
                        </Space>
                    </Badge>
                ) : (
                    <Space className="tab-title-no-badge">
                        <ClockCircleOutlined />
                        Chờ duyệt
                    </Space>
                )
            ),
            children: (
                <WithdrawalRequestList
                    initialStatus={WithdrawalStatus.Pending}
                    refreshTrigger={refreshTrigger}
                    onDataChanged={handleDataChanged}
                    onTabCountChanged={(count) => handleTabCountChanged('pending', count)}
                />
            )
        },
        {
            key: 'approved',
            label: (
                tabCounts.approved > 0 ? (
                    <Badge count={tabCounts.approved} size="small" color="green">
                        <Space>
                            <CheckCircleOutlined />
                            Đã duyệt
                        </Space>
                    </Badge>
                ) : (
                    <Space className="tab-title-no-badge">
                        <CheckCircleOutlined />
                        Đã duyệt
                    </Space>
                )
            ),
            children: (
                <WithdrawalRequestList
                    initialStatus={WithdrawalStatus.Approved}
                    refreshTrigger={refreshTrigger}
                    onDataChanged={handleDataChanged}
                    onTabCountChanged={(count) => handleTabCountChanged('approved', count)}
                />
            )
        },
        {
            key: 'rejected',
            label: (
                tabCounts.rejected > 0 ? (
                    <Badge count={tabCounts.rejected} size="small" color="red">
                        <Space>
                            <CloseCircleOutlined />
                            Từ chối
                        </Space>
                    </Badge>
                ) : (
                    <Space className="tab-title-no-badge">
                        <CloseCircleOutlined />
                        Từ chối
                    </Space>
                )
            ),
            children: (
                <WithdrawalRequestList
                    initialStatus={WithdrawalStatus.Rejected}
                    refreshTrigger={refreshTrigger}
                    onDataChanged={handleDataChanged}
                    onTabCountChanged={(count) => handleTabCountChanged('rejected', count)}
                />
            )
        },
        {
            key: 'cancelled',
            label: (
                tabCounts.cancelled > 0 ? (
                    <Badge count={tabCounts.cancelled} size="small" color="default">
                        <Space>
                            <StopOutlined />
                            Đã hủy
                        </Space>
                    </Badge>
                ) : (
                    <Space className="tab-title-no-badge">
                        <StopOutlined />
                        Đã hủy
                    </Space>
                )
            ),
            children: (
                <WithdrawalRequestList
                    initialStatus={WithdrawalStatus.Cancelled}
                    refreshTrigger={refreshTrigger}
                    onDataChanged={handleDataChanged}
                    onTabCountChanged={(count) => handleTabCountChanged('cancelled', count)}
                />
            )
        },
        {
            key: 'all',
            label: (
                tabCounts.all > 0 ? (
                    <Badge count={tabCounts.all} size="small">
                        <Space>
                            <BarChartOutlined />
                            Tất cả
                        </Space>
                    </Badge>
                ) : (
                    <Space className="tab-title-no-badge">
                        <BarChartOutlined />
                        Tất cả
                    </Space>
                )
            ),
            children: (
                <WithdrawalRequestList
                    refreshTrigger={refreshTrigger}
                    onDataChanged={handleDataChanged}
                    onTabCountChanged={(count) => handleTabCountChanged('all', count)}
                />
            )
        }
    ];

    return (
        <div className="admin-withdrawal-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <Title level={2} className="page-title">
                        <DollarOutlined /> Quản lý yêu cầu rút tiền
                    </Title>
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            suffixIcon={<CalendarOutlined />}
                            className="date-range-picker"
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={statisticsLoading}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="statistics-section">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card total">
                        <Statistic
                            title="Tổng yêu cầu"
                            value={statistics.totalRequests}
                            prefix={<BarChartOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card pending">
                        <Statistic
                            title="Chờ duyệt"
                            value={statistics.pendingRequests}
                            prefix={<ClockCircleOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card approved">
                        <Statistic
                            title="Đã duyệt"
                            value={statistics.approvedRequests}
                            prefix={<CheckCircleOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card rejected">
                        <Statistic
                            title="Từ chối"
                            value={statistics.rejectedRequests}
                            prefix={<CloseCircleOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Amount Statistics */}
            <Row gutter={[16, 16]} className="amount-statistics">
                <Col xs={24} md={8}>
                    <Card className="amount-card total-amount">
                        <Statistic
                            title="Tổng số tiền yêu cầu"
                            value={statistics.totalAmount}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<DollarOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="amount-card approved-amount">
                        <Statistic
                            title="Số tiền đã duyệt"
                            value={statistics.approvedAmount}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<CheckCircleOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="amount-card pending-amount">
                        <Statistic
                            title="Số tiền chờ duyệt"
                            value={statistics.pendingAmount}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<ClockCircleOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content Tabs */}
            <Card className="main-content">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                    className="withdrawal-tabs"
                />
            </Card>
        </div>
    );
};

export default AdminWithdrawalManagement;
