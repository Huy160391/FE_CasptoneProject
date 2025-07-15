import React, { useEffect, useState } from 'react';
import { Dropdown, Menu, Button, Modal, Table, InputNumber, message, Spin } from 'antd';
import { WalletOutlined, HistoryOutlined, SwapOutlined, DollarOutlined } from '@ant-design/icons';
import { getWalletBalance, getWalletTransactions, getWithdrawHistory, withdrawMoney } from '@/services/specialtyShopService';
import { useAuthStore } from '@/store/useAuthStore';
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
    const [modalType, setModalType] = useState<'transactions' | 'withdrawals' | 'withdraw' | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

    useEffect(() => {
        fetchBalance();
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

    const handleMenuClick = async ({ key }: { key: string }) => {
        setModalType(key as any);
        setVisible(true);
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

    const handleWithdraw = async () => {
        if (withdrawAmount <= 0) {
            message.error('Số tiền phải lớn hơn 0');
            return;
        }
        if (!safeShopId) {
            message.error('Không tìm thấy shopId');
            return;
        }
        setTableLoading(true);
        try {
            if (safeShopId) {
                await withdrawMoney(safeShopId, withdrawAmount, token);
            } else {
                message.error('Không tìm thấy shopId');
                return;
            }
            message.success('Rút tiền thành công!');
            setVisible(false);
            fetchBalance();
        } catch {
            message.error('Rút tiền thất bại!');
        } finally {
            setTableLoading(false);
        }
    };

    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="transactions" icon={<HistoryOutlined />}>Lịch sử giao dịch</Menu.Item>
            <Menu.Item key="withdrawals" icon={<SwapOutlined />}>Lịch sử rút tiền</Menu.Item>
            <Menu.Item key="withdraw" icon={<DollarOutlined />}>Rút tiền</Menu.Item>
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
                title={modalType === 'transactions' ? 'Lịch sử giao dịch' : modalType === 'withdrawals' ? 'Lịch sử rút tiền' : 'Rút tiền'}
                width={600}
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
                    <div style={{ textAlign: 'center', padding: 24 }}>
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ fontWeight: 500 }}>Số dư hiện tại: </span>
                            <span style={{ color: '#1890ff', fontWeight: 600 }}>{balance.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <InputNumber
                            min={1}
                            max={balance}
                            value={withdrawAmount}
                            onChange={v => setWithdrawAmount(Number(v))}
                            style={{ width: 200, marginBottom: 16 }}
                            placeholder="Nhập số tiền muốn rút"
                        />
                        <br />
                        <Button type="primary" onClick={handleWithdraw} loading={tableLoading}>
                            Xác nhận rút tiền
                        </Button>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ShopWalletDropdown;
