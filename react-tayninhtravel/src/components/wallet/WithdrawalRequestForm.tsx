import React, { useEffect, useState } from 'react';
import { 
    Form, 
    InputNumber, 
    Select, 
    Button, 
    Card, 
    message, 
    Spin, 
    Alert,
    Typography,
    Space,
    Divider
} from 'antd';
import { 
    DollarOutlined, 
    BankOutlined, 
    InfoCircleOutlined,
    WalletOutlined 
} from '@ant-design/icons';
import { BankAccount, WithdrawalFormData } from '@/types';
import { getBankAccounts, getWalletBalance } from '@/services/specialtyShopService';
import { useAuthStore } from '@/store/useAuthStore';
import './WithdrawalRequestForm.scss';

const { Text, Title } = Typography;
const { Option } = Select;

interface WithdrawalRequestFormProps {
    /** Shop ID for wallet balance */
    shopId?: string;
    /** Loading state */
    loading?: boolean;
    /** Form submission handler */
    onSubmit: (data: WithdrawalFormData) => Promise<void>;
    /** Cancel handler */
    onCancel?: () => void;
}

/**
 * WithdrawalRequestForm Component
 * 
 * Form for creating withdrawal requests with bank account selection and amount input.
 * Features:
 * - Bank account selection
 * - Amount validation against wallet balance
 * - Real-time balance checking
 * - Vietnamese currency formatting
 * - Comprehensive validation
 */
const WithdrawalRequestForm: React.FC<WithdrawalRequestFormProps> = ({
    shopId,
    loading = false,
    onSubmit,
    onCancel
}) => {
    const [form] = Form.useForm<WithdrawalFormData>();
    const { token } = useAuthStore();
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

    // Minimum withdrawal amount (100,000 VND)
    const MIN_WITHDRAWAL = 100000;
    // Maximum withdrawal amount (50,000,000 VND)
    const MAX_WITHDRAWAL = 50000000;

    useEffect(() => {
        loadInitialData();
    }, [shopId]);

    /**
     * Load bank accounts and wallet balance
     */
    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            // Load bank accounts
            const accounts = await getBankAccounts(token || undefined);
            setBankAccounts(accounts);

            // Set default account if available
            const defaultAccount = accounts.find((acc: BankAccount) => acc.isDefault);
            if (defaultAccount) {
                form.setFieldValue('bankAccountId', defaultAccount.id);
                setSelectedAccount(defaultAccount);
            }

            // Load wallet balance if shopId is provided
            if (shopId) {
                const balance = await getWalletBalance(shopId, token || undefined);
                setWalletBalance(balance);
            }
        } catch (error: any) {
            message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
            console.error('Error loading initial data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (values: WithdrawalFormData) => {
        try {
            await onSubmit(values);
            form.resetFields();
            setSelectedAccount(null);
        } catch (error) {
            // Error handling is done in parent component
            console.error('Form submission error:', error);
        }
    };

    /**
     * Handle bank account selection
     */
    const handleBankAccountChange = (accountId: string) => {
        const account = bankAccounts.find(acc => acc.id === accountId);
        setSelectedAccount(account || null);
    };

    /**
     * Validate withdrawal amount
     */
    const validateAmount = (_: any, value: number) => {
        if (!value) {
            return Promise.resolve();
        }

        if (value < MIN_WITHDRAWAL) {
            return Promise.reject(new Error(`Số tiền rút tối thiểu là ${MIN_WITHDRAWAL.toLocaleString('vi-VN')} ₫`));
        }

        if (value > MAX_WITHDRAWAL) {
            return Promise.reject(new Error(`Số tiền rút tối đa là ${MAX_WITHDRAWAL.toLocaleString('vi-VN')} ₫`));
        }

        if (shopId && value > walletBalance) {
            return Promise.reject(new Error(`Số dư ví không đủ. Số dư hiện tại: ${walletBalance.toLocaleString('vi-VN')} ₫`));
        }

        return Promise.resolve();
    };

    /**
     * Format currency display
     */
    const formatCurrency = (value: number): string => {
        return `${value.toLocaleString('vi-VN')} ₫`;
    };

    if (loadingData) {
        return (
            <Card className="withdrawal-request-form">
                <Spin size="large" />
            </Card>
        );
    }

    if (bankAccounts.length === 0) {
        return (
            <Card className="withdrawal-request-form">
                <Alert
                    message="Chưa có tài khoản ngân hàng"
                    description="Bạn cần thêm ít nhất một tài khoản ngân hàng trước khi có thể tạo yêu cầu rút tiền."
                    type="warning"
                    showIcon
                    action={
                        <Button type="primary" size="small">
                            Thêm tài khoản ngân hàng
                        </Button>
                    }
                />
            </Card>
        );
    }

    return (
        <Card 
            title="Tạo yêu cầu rút tiền"
            className="withdrawal-request-form"
        >
            <Spin spinning={loading}>
                {/* Wallet Balance Display */}
                {shopId && (
                    <div className="balance-info">
                        <Space align="center">
                            <WalletOutlined className="balance-icon" />
                            <div>
                                <Text type="secondary">Số dư ví hiện tại:</Text>
                                <Title level={4} className="balance-amount">
                                    {formatCurrency(walletBalance)}
                                </Title>
                            </div>
                        </Space>
                        <Divider />
                    </div>
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="bankAccountId"
                        label="Tài khoản ngân hàng nhận tiền"
                        rules={[
                            { required: true, message: 'Vui lòng chọn tài khoản ngân hàng' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn tài khoản ngân hàng"
                            onChange={handleBankAccountChange}
                            suffixIcon={<BankOutlined />}
                        >
                            {bankAccounts.map((account) => (
                                <Option key={account.id} value={account.id}>
                                    <div className="bank-account-option">
                                        <div className="bank-info">
                                            <Text strong>{account.bankName}</Text>
                                            {account.isDefault && (
                                                <Text type="warning" className="default-badge">
                                                    (Mặc định)
                                                </Text>
                                            )}
                                        </div>
                                        <Text type="secondary" className="account-number">
                                            {account.accountNumber} - {account.accountHolderName}
                                        </Text>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Selected Account Info */}
                    {selectedAccount && (
                        <div className="selected-account-info">
                            <Alert
                                message={
                                    <Space>
                                        <BankOutlined />
                                        <span>
                                            Tiền sẽ được chuyển vào tài khoản: <strong>{selectedAccount.accountNumber}</strong>
                                        </span>
                                    </Space>
                                }
                                type="info"
                                showIcon={false}
                            />
                        </div>
                    )}

                    <Form.Item
                        name="amount"
                        label="Số tiền muốn rút"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền muốn rút' },
                            { validator: validateAmount }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập số tiền"
                            min={MIN_WITHDRAWAL}
                            max={shopId ? Math.min(walletBalance, MAX_WITHDRAWAL) : MAX_WITHDRAWAL}
                            step={10000}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                        />
                    </Form.Item>

                    {/* Withdrawal Info */}
                    <Alert
                        message="Thông tin quan trọng"
                        description={
                            <ul className="withdrawal-notes">
                                <li>Số tiền rút tối thiểu: {formatCurrency(MIN_WITHDRAWAL)}</li>
                                <li>Số tiền rút tối đa: {formatCurrency(MAX_WITHDRAWAL)}</li>
                                <li>Yêu cầu sẽ được xử lý trong vòng 1-3 ngày làm việc</li>
                                <li>Bạn có thể hủy yêu cầu khi còn ở trạng thái "Chờ duyệt"</li>
                            </ul>
                        }
                        type="info"
                        icon={<InfoCircleOutlined />}
                        className="withdrawal-info"
                    />

                    <Form.Item className="form-actions">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            style={{ marginRight: 8 }}
                        >
                            Tạo yêu cầu rút tiền
                        </Button>
                        {onCancel && (
                            <Button
                                onClick={onCancel}
                                size="large"
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                        )}
                    </Form.Item>
                </Form>
            </Spin>
        </Card>
    );
};

export default WithdrawalRequestForm;
