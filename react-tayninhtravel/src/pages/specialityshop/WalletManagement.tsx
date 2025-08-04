import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Button,
    Modal,
    message,
    Spin,
    Tabs,
    Space,
    Typography,
    DatePicker,
    Badge
} from 'antd';
import {
    WalletOutlined,
    BankOutlined,
    HistoryOutlined,
    PlusOutlined,
    DollarOutlined,
    ReloadOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import {
    BankAccountList,
    BankAccountForm,
    WithdrawalRequestForm,
    WithdrawalRequestHistory
} from '@/components/wallet';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import shopWithdrawalService from '@/services/shopWithdrawalService';
import { walletService } from '@/services/walletService';
import { BankAccount, BankAccountFormData, WithdrawalFormData } from '@/types';
import dayjs from 'dayjs';
import './WalletManagement.scss';

const { TabPane } = Tabs;
const { Title } = Typography;
const { RangePicker } = DatePicker;

interface WalletStatistics {
    totalWithdrawals: number;
    pendingWithdrawals: number;
    approvedWithdrawals: number;
    rejectedWithdrawals: number;
    cancelledWithdrawals?: number;
    totalWithdrawnAmount: number;
    pendingAmount: number;
    currentBalance: number;
}

const WalletManagement: React.FC = () => {
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const [loading, setLoading] = useState(false);
    const [statisticsLoading, setStatisticsLoading] = useState(false);
    const [balance, setBalance] = useState(0);
    const [walletInfo, setWalletInfo] = useState<{
        id: string;
        shopName: string;
        wallet: number;
        updatedAt: string;
    } | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);
    const [statistics, setStatistics] = useState<WalletStatistics>({
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        approvedWithdrawals: 0,
        rejectedWithdrawals: 0,
        totalWithdrawnAmount: 0,
        pendingAmount: 0,
        currentBalance: 0
    });

    // Modal states
    const [isBankAccountModalVisible, setIsBankAccountModalVisible] = useState(false);
    const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);
    const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | undefined>();

    // Load wallet data
    useEffect(() => {
        loadWalletData();
    }, [refreshTrigger]);

    // Load statistics after wallet data is loaded
    useEffect(() => {
        if (walletInfo) {
            loadStatistics();
        }
    }, [dateRange, walletInfo]);

    const loadWalletData = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Load wallet info using walletService
            const walletResponse = await walletService.getSpecialtyShopWallet();
            console.log('Wallet response:', walletResponse); // Debug log
            if (walletResponse.isSuccess && walletResponse.data) {
                setWalletInfo(walletResponse.data);
                setBalance(walletResponse.data.wallet);
                console.log('Wallet balance set to:', walletResponse.data.wallet); // Debug log
            }

            // Load bank accounts
            const accountsData = await shopWithdrawalService.getMyBankAccounts();
            setBankAccounts(accountsData || []);
        } catch (error) {
            console.error('Error loading wallet data:', error);
            message.error('Không thể tải dữ liệu ví');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        if (!user?.id) return;

        try {
            setStatisticsLoading(true);

            // Load all withdrawal requests to calculate statistics
            const allRequestsResponse = await shopWithdrawalService.getMyWithdrawalRequestsWithParams(
                undefined, // Get all statuses
                1,         // First page
                1000       // Large page size to get all data
            );

            const allRequests = allRequestsResponse.data || [];

            console.log('Withdrawal requests loaded:', allRequests); // Debug log
            console.log('Requests by status:', {
                pending: allRequests.filter((req: any) => req.status === 0),
                approved: allRequests.filter((req: any) => req.status === 1),
                rejected: allRequests.filter((req: any) => req.status === 2)
            }); // Debug log

            // Calculate statistics from withdrawal requests
            const stats = {
                totalWithdrawals: allRequests.length,
                pendingWithdrawals: allRequests.filter(req => req.status === 0).length, // Pending
                approvedWithdrawals: allRequests.filter(req => req.status === 1).length, // Approved
                rejectedWithdrawals: allRequests.filter(req => req.status === 2).length, // Rejected
                totalWithdrawnAmount: allRequests
                    .filter(req => req.status === 1) // Only approved requests
                    .reduce((sum, req) => sum + (req.netAmount || req.amount), 0),
                pendingAmount: allRequests
                    .filter(req => req.status === 0) // Only pending requests
                    .reduce((sum, req) => sum + req.amount, 0),
                currentBalance: balance
            };

            setStatistics(stats);

            // Only update balance from statistics if we don't have wallet info yet
            if (!walletInfo) {
                setBalance(stats.currentBalance);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            message.error('Không thể tải thống kê');
            // Keep mock data on error
            setStatistics({
                totalWithdrawals: 15,
                pendingWithdrawals: 3,
                approvedWithdrawals: 10,
                rejectedWithdrawals: 2,
                totalWithdrawnAmount: 8500000,
                pendingAmount: 1200000,
                currentBalance: balance
            });
        } finally {
            setStatisticsLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        // loadStatistics will be called automatically via useEffect when walletInfo updates
    };

    // Use walletService for currency formatting
    const formatCurrency = (amount: number): string => {
        return walletService.formatCurrency(amount);
    };

    // Bank account handlers
    const handleAddBankAccount = () => {
        setEditingBankAccount(undefined);
        setIsBankAccountModalVisible(true);
    };

    const handleCreateAccount = async (data: BankAccountFormData) => {
        try {
            const requestData = shopWithdrawalService.formatBankAccountData(data);
            await shopWithdrawalService.createBankAccount(requestData);
            message.success('Thêm tài khoản thành công');
            loadWalletData();
        } catch (error) {
            console.error('Error creating account:', error);
            message.error('Có lỗi xảy ra khi thêm tài khoản');
        }
    };

    const handleUpdateAccount = async (id: string, data: BankAccountFormData) => {
        try {
            const requestData = shopWithdrawalService.formatBankAccountData(data);
            await shopWithdrawalService.updateBankAccount(id, requestData);
            message.success('Cập nhật tài khoản thành công');
            loadWalletData();
        } catch (error) {
            console.error('Error updating account:', error);
            message.error('Có lỗi xảy ra khi cập nhật tài khoản');
        }
    };

    const handleDeleteAccount = async (id: string) => {
        try {
            await shopWithdrawalService.deleteBankAccount(id);
            message.success('Xóa tài khoản thành công');
            loadWalletData();
        } catch (error) {
            console.error('Error deleting account:', error);
            message.error('Có lỗi xảy ra khi xóa tài khoản');
        }
    };

    const handleSetDefaultAccount = async (id: string) => {
        try {
            await shopWithdrawalService.setDefaultBankAccount(id);
            message.success('Đặt tài khoản mặc định thành công');
            loadWalletData();
        } catch (error) {
            console.error('Error setting default account:', error);
            message.error('Có lỗi xảy ra khi đặt tài khoản mặc định');
        }
    };

    const handleBankAccountSubmit = async (data: BankAccountFormData) => {
        try {
            if (editingBankAccount) {
                await handleUpdateAccount(editingBankAccount.id, data);
            } else {
                await handleCreateAccount(data);
            }
            setIsBankAccountModalVisible(false);
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    // Withdrawal handlers
    const handleWithdrawalRequest = () => {
        if (bankAccounts.length === 0) {
            message.warning('Vui lòng thêm tài khoản ngân hàng trước khi rút tiền');
            return;
        }
        setIsWithdrawalModalVisible(true);
    };

    const handleWithdrawalSubmit = async (data: WithdrawalFormData) => {
        try {
            // Check if user can create withdrawal request first
            const canCreate = await shopWithdrawalService.canCreateWithdrawalRequest();
            if (!canCreate) {
                message.error('Bạn không thể tạo yêu cầu rút tiền lúc này');
                return;
            }

            // Then validate withdrawal request
            const validation = await shopWithdrawalService.validateWithdrawalRequest({
                amount: data.amount,
                bankAccountId: data.bankAccountId
            });

            if (!validation.isValid) {
                const errorMessage = validation.errors && Array.isArray(validation.errors)
                    ? validation.errors.join(', ')
                    : 'Yêu cầu rút tiền không hợp lệ';
                message.error(errorMessage);
                return;
            }

            // Finally create withdrawal request
            const requestData = shopWithdrawalService.formatWithdrawalData(data);
            await shopWithdrawalService.createWithdrawalRequest(requestData);

            message.success('Yêu cầu rút tiền đã được gửi');
            setIsWithdrawalModalVisible(false);
            loadWalletData();
            // Trigger refresh for both statistics and history
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            console.error('Error creating withdrawal request:', error);

            // Handle different types of errors
            let errorMessage = 'Có lỗi xảy ra khi tạo yêu cầu rút tiền';

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    };

    if (loading) {
        return (
            <div className={`wallet-management-page ${isDarkMode ? 'dark-theme' : ''}`}>
                <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />
            </div>
        );
    }

    return (
        <div className={`wallet-management-page ${isDarkMode ? 'dark-theme' : ''}`}>
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <Title level={2} className="page-title">
                        <WalletOutlined /> Quản lý ví
                        {walletInfo && (
                            <div style={{ fontSize: '16px', fontWeight: 'normal', color: '#666', marginTop: '4px' }}>
                                {walletInfo.shopName}
                            </div>
                        )}
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
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddBankAccount}
                        >
                            Thêm tài khoản
                        </Button>
                        <Button
                            type="primary"
                            icon={<DollarOutlined />}
                            onClick={handleWithdrawalRequest}
                            disabled={balance <= 0}
                        >
                            Rút tiền
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="statistics-section">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card total">
                        <Statistic
                            title="Tổng yêu cầu rút tiền"
                            value={statistics.totalWithdrawals}
                            prefix={<BarChartOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card pending">
                        <Statistic
                            title="Chờ duyệt"
                            value={statistics.pendingWithdrawals}
                            prefix={<ClockCircleOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card approved">
                        <Statistic
                            title="Đã duyệt"
                            value={statistics.approvedWithdrawals}
                            prefix={<CheckCircleOutlined />}
                            loading={statisticsLoading}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card rejected">
                        <Statistic
                            title="Từ chối"
                            value={statistics.rejectedWithdrawals}
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
                            title="Số dư hiện tại"
                            value={balance}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<WalletOutlined />}
                            loading={loading}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="amount-card approved-amount">
                        <Statistic
                            title="Tổng đã rút"
                            value={statistics.totalWithdrawnAmount}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<CheckCircleOutlined />}
                            loading={statisticsLoading}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="amount-card pending-amount">
                        <Statistic
                            title="Đang chờ duyệt"
                            value={statistics.pendingAmount}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<ClockCircleOutlined />}
                            loading={statisticsLoading}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="accounts-card">
                        <Statistic
                            title="Tài khoản ngân hàng"
                            value={bankAccounts.length}
                            prefix={<BankOutlined />}
                            loading={loading}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content Tabs */}
            <Card className="main-content">
                <Tabs defaultActiveKey="accounts" size="large" className="wallet-tabs">
                    <TabPane
                        tab={
                            <Badge count={bankAccounts.length} size="small" color="blue">
                                <Space>
                                    <BankOutlined />
                                    Tài khoản ngân hàng
                                </Space>
                            </Badge>
                        }
                        key="accounts"
                    >
                        <BankAccountList
                            accounts={bankAccounts}
                            loading={loading}
                            onCreateAccount={handleCreateAccount}
                            onUpdateAccount={handleUpdateAccount}
                            onDeleteAccount={handleDeleteAccount}
                            onSetDefault={handleSetDefaultAccount}
                        />
                    </TabPane>

                    <TabPane
                        tab={
                            <Badge count={statistics.totalWithdrawals} size="small" color="green">
                                <Space>
                                    <HistoryOutlined />
                                    Lịch sử rút tiền
                                </Space>
                            </Badge>
                        }
                        key="history"
                    >
                        <WithdrawalRequestHistory
                            service={shopWithdrawalService}
                            refreshTrigger={refreshTrigger}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Bank Account Modal */}
            <Modal
                title={editingBankAccount ? 'Chỉnh sửa tài khoản ngân hàng' : 'Thêm tài khoản ngân hàng'}
                open={isBankAccountModalVisible}
                onCancel={() => setIsBankAccountModalVisible(false)}
                footer={null}
                width={600}
                destroyOnClose
            >
                <BankAccountForm
                    initialData={editingBankAccount}
                    isEdit={!!editingBankAccount}
                    onSubmit={handleBankAccountSubmit}
                    onCancel={() => setIsBankAccountModalVisible(false)}
                />
            </Modal>

            {/* Withdrawal Request Modal */}
            <Modal
                title="Yêu cầu rút tiền"
                open={isWithdrawalModalVisible}
                onCancel={() => setIsWithdrawalModalVisible(false)}
                footer={null}
                width={600}
                destroyOnClose
            >
                <WithdrawalRequestForm
                    shopId={user?.id}
                    onSubmit={handleWithdrawalSubmit}
                    onCancel={() => setIsWithdrawalModalVisible(false)}
                    service={shopWithdrawalService}
                    bankAccounts={bankAccounts}
                    balance={balance}
                />
            </Modal>
        </div>
    );
};

export default WalletManagement;
