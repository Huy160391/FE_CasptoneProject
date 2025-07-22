import React, { useEffect, useState } from 'react';
import { Dropdown, Menu, Button, Modal, Table, message, Spin, Alert } from 'antd';
import { WalletOutlined, HistoryOutlined, SwapOutlined, DollarOutlined, BankOutlined } from '@ant-design/icons';
import {
    getWalletBalance,
    getWalletTransactions,
    getWithdrawHistory,
    getBankAccounts,
    createWithdrawalRequest
} from '@/services/specialtyShopService';
import { useAuthStore } from '@/store/useAuthStore';
import WithdrawalRequestForm from '../wallet/WithdrawalRequestForm';
import WithdrawalRequestHistory from '../wallet/WithdrawalRequestHistory';
import './ShopWalletDropdown.scss';

interface ShopWalletDropdownProps {
    shopId: string;
}

const ShopWalletDropdown: React.FC<ShopWalletDropdownProps> = ({ shopId }) => {
    // Đảm bảo token luôn là string hoặc undefined, không null
    const { token: rawToken } = useAuthStore();
    const token: string | undefined = typeof rawToken === 'string' && rawToken !== '' ? rawToken : undefined;
    // Đảm bảo safeShopId luôn là string, không null
    // Đảm bảo không truyền null cho các hàm service
    // Đảm bảo truyền đúng kiểu cho các hàm service: string | undefined
    // Chỉ nhận giá trị là string, nếu null thì truyền undefined
    // Chỉ nhận giá trị là string, nếu null hoặc không phải string thì truyền undefined
    // Chỉ nhận giá trị là string, không rỗng, không null
    const safeShopId: string | undefined = typeof shopId === 'string' && shopId !== '' ? shopId : undefined;
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [modalType, setModalType] = useState<'transactions' | 'withdrawals' | 'withdraw' | 'withdrawal-history' | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [hasBankAccount, setHasBankAccount] = useState<boolean>(false);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    useEffect(() => {
        fetchBalance();
        checkBankAccount();
    }, [shopId]);

    const fetchBalance = async () => {
        setLoading(true);
        try {
            if (!safeShopId) {
                setBalance(0);
                return;
            }
            if (safeShopId) {
                const result = await getWalletBalance(safeShopId, token);
                setBalance(result);
            } else {
                setBalance(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const checkBankAccount = async () => {
        try {
            const accounts = await getBankAccounts(token || undefined);
            setHasBankAccount(accounts.length > 0);
        } catch (error) {
            console.error('Error checking bank accounts:', error);
            setHasBankAccount(false);
        }
    };

    const handleMenuClick = async ({ key }: { key: string }) => {
        setModalType(key as any);
        setVisible(true);

        // For withdraw, check bank account first
        if (key === 'withdraw') {
            if (!hasBankAccount) {
                message.warning('Bạn cần thêm tài khoản ngân hàng trước khi tạo yêu cầu rút tiền');
                return;
            }
            setTableLoading(false);
            return;
        }

        // For withdrawal-history, no need to load table data
        if (key === 'withdrawal-history') {
            setTableLoading(false);
            return;
        }

        setTableLoading(true);
        if (!safeShopId) {
            setTableData([]);
            setTableLoading(false);
            return;
        }

        if (key === 'transactions') {
            if (safeShopId) {
                const data = await getWalletTransactions(safeShopId, {}, token);
                setTableData(data);
            } else {
                setTableData([]);
            }
        } else if (key === 'withdrawals') {
            if (safeShopId) {
                const data = await getWithdrawHistory(safeShopId, {}, token);
                setTableData(data);
            } else {
                setTableData([]);
            }
        }
        setTableLoading(false);
    };

    const handleWithdrawalRequest = async (data: { amount: number; bankAccountId: string }) => {
        setTableLoading(true);
        try {
            await createWithdrawalRequest(data, token || undefined);
            message.success('Tạo yêu cầu rút tiền thành công! Yêu cầu sẽ được xử lý trong 1-3 ngày làm việc.');
            setVisible(false);
            setRefreshTrigger(prev => prev + 1);
            // Refresh bank account status
            checkBankAccount();
        } catch (error: any) {
            message.error(error.message || 'Không thể tạo yêu cầu rút tiền');
        } finally {
            setTableLoading(false);
        }
    };

    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="transactions" icon={<HistoryOutlined />}>Lịch sử giao dịch</Menu.Item>
            <Menu.Item key="withdrawals" icon={<SwapOutlined />}>Lịch sử rút tiền (Cũ)</Menu.Item>
            <Menu.Item key="withdrawal-history" icon={<BankOutlined />}>Yêu cầu rút tiền</Menu.Item>
            <Menu.Item
                key="withdraw"
                icon={<DollarOutlined />}
                disabled={!hasBankAccount}
            >
                Tạo yêu cầu rút tiền
                {!hasBankAccount && <span style={{ fontSize: '0.8em', color: '#ff4d4f' }}> (Cần thêm tài khoản ngân hàng)</span>}
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            <Dropdown overlay={menu} trigger={["click"]}>
                <Button type="primary" icon={<WalletOutlined />} loading={loading} style={{ minWidth: 120 }}>
                    <span style={{ fontWeight: 600 }}>{balance.toLocaleString('vi-VN')} ₫</span>
                </Button>
            </Dropdown>
            <Modal
                open={visible}
                onCancel={() => setVisible(false)}
                footer={null}
                title={
                    modalType === 'transactions' ? 'Lịch sử giao dịch' :
                    modalType === 'withdrawals' ? 'Lịch sử rút tiền (Cũ)' :
                    modalType === 'withdrawal-history' ? 'Yêu cầu rút tiền' :
                    'Tạo yêu cầu rút tiền'
                }
                width={modalType === 'withdraw' || modalType === 'withdrawal-history' ? 800 : 600}
                destroyOnClose
            >
                {modalType === 'transactions' && (
                    <Spin spinning={tableLoading}>
                        <Table
                            dataSource={tableData}
                            columns={[
                                { title: 'Mã giao dịch', dataIndex: 'id', key: 'id' },
                                { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v: number) => `${v.toLocaleString('vi-VN')} ₫` },
                                { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt' },
                                { title: 'Loại', dataIndex: 'type', key: 'type' },
                            ]}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Spin>
                )}
                {modalType === 'withdrawals' && (
                    <Spin spinning={tableLoading}>
                        <Table
                            dataSource={tableData}
                            columns={[
                                { title: 'Mã rút', dataIndex: 'id', key: 'id' },
                                { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v: number) => `${v.toLocaleString('vi-VN')} ₫` },
                                { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt' },
                                { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
                            ]}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Spin>
                )}
                {modalType === 'withdraw' && (
                    <>
                        {!hasBankAccount ? (
                            <Alert
                                message="Chưa có tài khoản ngân hàng"
                                description="Bạn cần thêm ít nhất một tài khoản ngân hàng trước khi có thể tạo yêu cầu rút tiền."
                                type="warning"
                                showIcon
                                style={{ margin: '20px 0' }}
                            />
                        ) : (
                            <WithdrawalRequestForm
                                shopId={safeShopId}
                                onSubmit={handleWithdrawalRequest}
                                onCancel={() => setVisible(false)}
                                loading={tableLoading}
                            />
                        )}
                    </>
                )}
                {modalType === 'withdrawal-history' && (
                    <WithdrawalRequestHistory refreshTrigger={refreshTrigger} />
                )}
            </Modal>
        </>
    );
};

export default ShopWalletDropdown;
