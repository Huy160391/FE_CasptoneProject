import React, { useState } from 'react';
import {
    Table,
    Card,
    DatePicker,
    Select,
    Tag,
    Button,
    Modal,
    Typography,
    Row,
    Col,
    Statistic,
    Input
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    DownloadOutlined,
    DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './TransactionHistory.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Transaction {
    id: string;
    bookingId: string;
    tourName: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionDate: string;
    bookingDate: string;
    tourDate: string;
    commission: number;
    netAmount: number;
}

const TransactionHistory: React.FC = () => {
    const [transactions] = useState<Transaction[]>([
        {
            id: 'TXN001',
            bookingId: 'BK001',
            tourName: 'Tour Núi Bà Đen 1 ngày',
            customerName: 'Nguyễn Văn A',
            customerEmail: 'nguyenvana@email.com',
            amount: 1500000,
            paymentMethod: 'Chuyển khoản',
            paymentStatus: 'completed',
            transactionDate: '2024-03-15T09:30:00',
            bookingDate: '2024-03-10',
            tourDate: '2024-03-25',
            commission: 150000,
            netAmount: 1350000
        },
        {
            id: 'TXN002',
            bookingId: 'BK002',
            tourName: 'Tour Tòa Thánh Cao Đài',
            customerName: 'Trần Thị B',
            customerEmail: 'tranthib@email.com',
            amount: 800000,
            paymentMethod: 'Thẻ tín dụng',
            paymentStatus: 'completed',
            transactionDate: '2024-03-14T14:20:00',
            bookingDate: '2024-03-12',
            tourDate: '2024-03-20',
            commission: 80000,
            netAmount: 720000
        },
        {
            id: 'TXN003',
            bookingId: 'BK003',
            tourName: 'Tour Suối Đá',
            customerName: 'Lê Văn C',
            customerEmail: 'levanc@email.com',
            amount: 1200000,
            paymentMethod: 'Ví điện tử',
            paymentStatus: 'pending',
            transactionDate: '2024-03-13T16:45:00',
            bookingDate: '2024-03-13',
            tourDate: '2024-03-28',
            commission: 120000,
            netAmount: 1080000
        },
        {
            id: 'TXN004',
            bookingId: 'BK004',
            tourName: 'Tour Hồ Dầu Tiếng',
            customerName: 'Phạm Thị D',
            customerEmail: 'phamthid@email.com',
            amount: 900000,
            paymentMethod: 'Chuyển khoản',
            paymentStatus: 'refunded',
            transactionDate: '2024-03-12T11:15:00',
            bookingDate: '2024-03-08',
            tourDate: '2024-03-22',
            commission: 0,
            netAmount: 0
        }
    ]);

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string>('all');
    const [searchText, setSearchText] = useState('');

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'orange',
            completed: 'green',
            failed: 'red',
            refunded: 'purple'
        };
        return colors[status as keyof typeof colors];
    };

    const getStatusText = (status: string) => {
        const texts = {
            pending: 'Đang xử lý',
            completed: 'Hoàn thành',
            failed: 'Thất bại',
            refunded: 'Đã hoàn tiền'
        };
        return texts[status as keyof typeof texts];
    };

    const getPaymentMethodColor = (method: string) => {
        const colors = {
            'Chuyển khoản': 'blue',
            'Thẻ tín dụng': 'green',
            'Ví điện tử': 'purple',
            'Tiền mặt': 'orange'
        };
        return colors[method as keyof typeof colors] || 'default';
    };

    const columns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'id',
            key: 'id',
            width: 120,
        },
        {
            title: 'Booking ID',
            dataIndex: 'bookingId',
            key: 'bookingId',
            width: 120,
        },
        {
            title: 'Tour',
            dataIndex: 'tourName',
            key: 'tourName',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: any, record: Transaction) =>
                record.tourName.toLowerCase().includes(value.toString().toLowerCase()) ||
                record.customerName.toLowerCase().includes(value.toString().toLowerCase()),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `${amount.toLocaleString('vi-VN')} ₫`,
            sorter: (a: Transaction, b: Transaction) => a.amount - b.amount,
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: string) => (
                <Tag color={getPaymentMethodColor(method)}>{method}</Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Đang xử lý', value: 'pending' },
                { text: 'Hoàn thành', value: 'completed' },
                { text: 'Thất bại', value: 'failed' },
                { text: 'Đã hoàn tiền', value: 'refunded' },
            ],
            onFilter: (value: any, record: Transaction) => record.paymentStatus === value,
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'transactionDate',
            key: 'transactionDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a: Transaction, b: Transaction) => dayjs(a.transactionDate).unix() - dayjs(b.transactionDate).unix(),
        },
        {
            title: 'Thu nhập',
            dataIndex: 'netAmount',
            key: 'netAmount',
            render: (amount: number) => (
                <span style={{ color: amount > 0 ? '#52c41a' : '#ff4d4f' }}>
                    {amount.toLocaleString('vi-VN')} ₫
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_: any, record: Transaction) => (
                <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handleViewDetail(record)}
                >
                    Xem
                </Button>
            ),
        },
    ];

    const handleViewDetail = (transaction: Transaction) => {
        Modal.info({
            title: `Chi tiết giao dịch ${transaction.id}`,
            width: 600,
            content: (
                <div className="transaction-detail">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <p><strong>Booking ID:</strong> {transaction.bookingId}</p>
                            <p><strong>Tour:</strong> {transaction.tourName}</p>
                            <p><strong>Khách hàng:</strong> {transaction.customerName}</p>
                            <p><strong>Email:</strong> {transaction.customerEmail}</p>
                        </Col>
                        <Col span={12}>
                            <p><strong>Số tiền:</strong> {transaction.amount.toLocaleString('vi-VN')} ₫</p>
                            <p><strong>Phí hoa hồng:</strong> {transaction.commission.toLocaleString('vi-VN')} ₫</p>
                            <p><strong>Thu nhập:</strong> {transaction.netAmount.toLocaleString('vi-VN')} ₫</p>
                            <p><strong>Phương thức:</strong>
                                <Tag color={getPaymentMethodColor(transaction.paymentMethod)} style={{ marginLeft: 8 }}>
                                    {transaction.paymentMethod}
                                </Tag>
                            </p>
                        </Col>
                        <Col span={12}>
                            <p><strong>Ngày đặt tour:</strong> {dayjs(transaction.bookingDate).format('DD/MM/YYYY')}</p>
                            <p><strong>Ngày tour:</strong> {dayjs(transaction.tourDate).format('DD/MM/YYYY')}</p>
                        </Col>
                        <Col span={12}>
                            <p><strong>Ngày giao dịch:</strong> {dayjs(transaction.transactionDate).format('DD/MM/YYYY HH:mm')}</p>
                            <p><strong>Trạng thái:</strong>
                                <Tag color={getStatusColor(transaction.paymentStatus)} style={{ marginLeft: 8 }}>
                                    {getStatusText(transaction.paymentStatus)}
                                </Tag>
                            </p>
                        </Col>
                    </Row>
                </div>
            ),
        });
    };

    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting transactions...');
    };

    const filteredTransactions = transactions.filter(transaction => {        // Filter by date range
        if (dateRange && dateRange.length === 2) {
            const transactionDate = dayjs(transaction.transactionDate);
            if (transactionDate.isBefore(dateRange[0], 'day') || transactionDate.isAfter(dateRange[1], 'day')) {
                return false;
            }
        }

        // Filter by payment status
        if (paymentStatus !== 'all' && transaction.paymentStatus !== paymentStatus) {
            return false;
        }

        return true;
    });

    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalNetAmount = filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0);
    const totalCommission = filteredTransactions.reduce((sum, t) => sum + t.commission, 0);

    return (
        <div className="transaction-history">
            <div className="page-header">
                <Title level={2}>Lịch sử giao dịch</Title>
                <div className="header-actions">
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                    />
                    <Select
                        value={paymentStatus}
                        onChange={setPaymentStatus}
                        style={{ width: 150 }}
                    >
                        <Option value="all">Tất cả</Option>
                        <Option value="pending">Đang xử lý</Option>
                        <Option value="completed">Hoàn thành</Option>
                        <Option value="failed">Thất bại</Option>
                        <Option value="refunded">Đã hoàn tiền</Option>
                    </Select>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                    >
                        Xuất Excel
                    </Button>
                </div>
            </div>

            <Row gutter={16} className="stats-cards">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng giao dịch"
                            value={totalAmount}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng hoa hồng"
                            value={totalCommission}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Thu nhập thực"
                            value={totalNetAmount}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: 16 }}>
                <div className="table-toolbar">
                    <Input
                        placeholder="Tìm kiếm theo tour, khách hàng"
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                </div>
                <Table
                    dataSource={filteredTransactions}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                />
            </Card>
        </div>
    );
};

export default TransactionHistory;
