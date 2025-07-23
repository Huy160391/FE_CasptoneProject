import React, { useState } from 'react';
import { 
    Card, 
    List, 
    Button, 
    Tag, 
    Popconfirm, 
    Modal, 
    message, 
    Empty, 
    Spin,
    Space,
    Typography,
    Tooltip
} from 'antd';
import { 
    BankOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    StarOutlined, 
    StarFilled,
    PlusOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { BankAccount } from '@/types';
import BankAccountForm from './BankAccountForm';
import './BankAccountList.scss';

const { Text, Title } = Typography;

interface BankAccountListProps {
    /** List of bank accounts */
    accounts: BankAccount[];
    /** Loading state */
    loading?: boolean;
    /** Create new bank account handler */
    onCreateAccount: (data: any) => Promise<void>;
    /** Update bank account handler */
    onUpdateAccount: (id: string, data: any) => Promise<void>;
    /** Delete bank account handler */
    onDeleteAccount: (id: string) => Promise<void>;
    /** Set default bank account handler */
    onSetDefault: (id: string) => Promise<void>;
}

/**
 * BankAccountList Component
 * 
 * Displays a list of user's bank accounts with management capabilities.
 * Features:
 * - View all bank accounts
 * - Add new account
 * - Edit existing account
 * - Delete account
 * - Set default account
 * - Responsive design
 * - Loading states
 */
const BankAccountList: React.FC<BankAccountListProps> = ({
    accounts,
    loading = false,
    onCreateAccount,
    onUpdateAccount,
    onDeleteAccount,
    onSetDefault
}) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    /**
     * Handle creating new bank account
     */
    const handleCreateAccount = async (data: any) => {
        setFormLoading(true);
        try {
            await onCreateAccount(data);
            setIsFormVisible(false);
            message.success('Thêm tài khoản ngân hàng thành công');
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi thêm tài khoản');
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * Handle updating bank account
     */
    const handleUpdateAccount = async (data: any) => {
        if (!editingAccount) return;
        
        setFormLoading(true);
        try {
            await onUpdateAccount(editingAccount.id, data);
            setEditingAccount(null);
            message.success('Cập nhật tài khoản ngân hàng thành công');
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi cập nhật tài khoản');
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * Handle deleting bank account
     */
    const handleDeleteAccount = async (id: string) => {
        try {
            await onDeleteAccount(id);
            message.success('Xóa tài khoản ngân hàng thành công');
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi xóa tài khoản');
        }
    };

    /**
     * Handle setting default account
     */
    const handleSetDefault = async (id: string) => {
        try {
            await onSetDefault(id);
            message.success('Đã đặt làm tài khoản mặc định');
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi đặt tài khoản mặc định');
        }
    };

    /**
     * Mask account number for security
     */
    const maskAccountNumber = (accountNumber: string): string => {
        if (accountNumber.length <= 4) return accountNumber;
        const visiblePart = accountNumber.slice(-4);
        const maskedPart = '*'.repeat(accountNumber.length - 4);
        return maskedPart + visiblePart;
    };

    /**
     * Render bank account item
     */
    const renderAccountItem = (account: BankAccount) => (
        <List.Item
            key={account.id}
            className={`bank-account-item ${account.isDefault ? 'default-account' : ''}`}
        >
            <div className="account-content">
                <div className="account-info">
                    <div className="account-header">
                        <BankOutlined className="bank-icon" />
                        <div className="bank-details">
                            <Title level={5} className="bank-name">
                                {account.bankName}
                                {account.isDefault && (
                                    <Tag color="gold" className="default-tag">
                                        <StarFilled /> Mặc định
                                    </Tag>
                                )}
                            </Title>
                            <Text className="account-number">
                                <CreditCardOutlined /> {maskAccountNumber(account.accountNumber)}
                            </Text>
                        </div>
                    </div>
                    <Text className="account-holder">
                        Chủ tài khoản: <strong>{account.accountHolderName}</strong>
                    </Text>
                </div>

                <div className="account-actions">
                    <Space>
                        {!account.isDefault && (
                            <Tooltip title="Đặt làm mặc định">
                                <Button
                                    type="text"
                                    icon={<StarOutlined />}
                                    onClick={() => handleSetDefault(account.id)}
                                    className="action-btn set-default-btn"
                                />
                            </Tooltip>
                        )}
                        
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => setEditingAccount(account)}
                                className="action-btn edit-btn"
                            />
                        </Tooltip>

                        <Popconfirm
                            title="Xóa tài khoản ngân hàng"
                            description="Bạn có chắc chắn muốn xóa tài khoản này?"
                            onConfirm={() => handleDeleteAccount(account.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    danger
                                    className="action-btn delete-btn"
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </div>
            </div>
        </List.Item>
    );

    return (
        <div className="bank-account-list">
            <Card
                title="Tài khoản ngân hàng"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsFormVisible(true)}
                        disabled={loading}
                    >
                        Thêm tài khoản
                    </Button>
                }
            >
                <Spin spinning={loading}>
                    {accounts.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Chưa có tài khoản ngân hàng nào"
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsFormVisible(true)}
                            >
                                Thêm tài khoản đầu tiên
                            </Button>
                        </Empty>
                    ) : (
                        <List
                            dataSource={accounts}
                            renderItem={renderAccountItem}
                            className="accounts-list"
                        />
                    )}
                </Spin>
            </Card>

            {/* Add Account Modal */}
            <Modal
                title="Thêm tài khoản ngân hàng"
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                footer={null}
                width={600}
                destroyOnClose
            >
                <BankAccountForm
                    onSubmit={handleCreateAccount}
                    onCancel={() => setIsFormVisible(false)}
                    loading={formLoading}
                />
            </Modal>

            {/* Edit Account Modal */}
            <Modal
                title="Chỉnh sửa tài khoản ngân hàng"
                open={!!editingAccount}
                onCancel={() => setEditingAccount(null)}
                footer={null}
                width={600}
                destroyOnClose
            >
                {editingAccount && (
                    <BankAccountForm
                        initialData={editingAccount}
                        onSubmit={handleUpdateAccount}
                        onCancel={() => setEditingAccount(null)}
                        loading={formLoading}
                        isEdit
                    />
                )}
            </Modal>
        </div>
    );
};

export default BankAccountList;
