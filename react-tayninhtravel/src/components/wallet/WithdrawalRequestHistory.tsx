import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Modal,
    Typography,
    Space,
    Tooltip,
    Popconfirm,
    message,
    Select,
    DatePicker,
    Row,
    Col
} from 'antd';
import {
    EyeOutlined,
    StopOutlined,
    FilterOutlined,
    ReloadOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { WithdrawalRequest, WithdrawalStatus } from '@/types';
import dayjs from 'dayjs';
import './WithdrawalRequestHistory.scss';

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface WithdrawalRequestHistoryProps {
    /** Refresh trigger */
    refreshTrigger?: number;
    /** Service for API calls */
    service?: any;
}

/**
 * WithdrawalRequestHistory Component
 * 
 * Displays user's withdrawal request history with filtering and management capabilities.
 * Features:
 * - View all withdrawal requests
 * - Filter by status and date range
 * - View request details
 * - Cancel pending requests
 * - Responsive table design
 * - Real-time status updates
 */
const WithdrawalRequestHistory: React.FC<WithdrawalRequestHistoryProps> = ({
    refreshTrigger,
    service
}) => {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        status: undefined as WithdrawalStatus | undefined,
        dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        loadWithdrawalRequests();
    }, [refreshTrigger, filters, pagination.current, pagination.pageSize]);

    /**
     * Load withdrawal requests with filters
     */
    const loadWithdrawalRequests = async () => {
        setLoading(true);
        try {
            const params = {
                pageIndex: pagination.current,
                pageSize: pagination.pageSize,
                status: filters.status,
                fromDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
                toDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
            };

            const response = await (service?.getMyWithdrawalRequests(params) || Promise.resolve({ data: [], totalCount: 0, pageIndex: 1, pageSize: 10 }));
            setRequests(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.totalCount || 0
            }));
        } catch (error: any) {
            message.error('Không thể tải lịch sử yêu cầu rút tiền');
            console.error('Error loading withdrawal requests:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle canceling withdrawal request
     */
    const handleCancelRequest = async (id: string) => {
        try {
            await (service?.cancelWithdrawalRequest(id, { reason: 'Người dùng hủy' }) || Promise.resolve());
            message.success('Đã hủy yêu cầu rút tiền');
            loadWithdrawalRequests();
        } catch (error: any) {
            message.error(error.message || 'Không thể hủy yêu cầu');
        }
    };

    /**
     * Get status tag color and text
     */
    const getStatusTag = (status: WithdrawalStatus) => {
        const statusConfig = {
            [WithdrawalStatus.Pending]: { color: 'processing', text: 'Chờ duyệt' },
            [WithdrawalStatus.Approved]: { color: 'success', text: 'Đã duyệt' },
            [WithdrawalStatus.Rejected]: { color: 'error', text: 'Từ chối' },
            [WithdrawalStatus.Cancelled]: { color: 'default', text: 'Đã hủy' }
        };

        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    /**
     * Format currency
     */
    const formatCurrency = (amount: number): string => {
        return `${amount.toLocaleString('vi-VN')} ₫`;
    };

    /**
     * Table columns configuration
     */
    const columns: ColumnsType<WithdrawalRequest> = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (id: string) => (
                <Text code className="request-id">
                    {id.slice(-8).toUpperCase()}
                </Text>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount: number) => (
                <Text strong className="amount">
                    {formatCurrency(amount)}
                </Text>
            ),
            sorter: true
        },
        {
            title: 'Tài khoản ngân hàng',
            dataIndex: 'bankAccount',
            key: 'bankAccount',
            render: (bankAccount: any) => (
                <div className="bank-account-info">
                    <Text strong>{bankAccount?.bankName}</Text>
                    <br />
                    <Text type="secondary" className="account-number">
                        {bankAccount?.maskedAccountNumber}
                    </Text>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: WithdrawalStatus, record: WithdrawalRequest) => {
                // Use statusName from API if available, otherwise use getStatusTag
                if (record.statusName) {
                    const statusConfig = {
                        [WithdrawalStatus.Pending]: 'processing',
                        [WithdrawalStatus.Approved]: 'success',
                        [WithdrawalStatus.Rejected]: 'error',
                        [WithdrawalStatus.Cancelled]: 'default'
                    };
                    return <Tag color={statusConfig[status]}>{record.statusName}</Tag>;
                }
                return getStatusTag(status);
            },
            filters: [
                { text: 'Chờ duyệt', value: WithdrawalStatus.Pending },
                { text: 'Đã duyệt', value: WithdrawalStatus.Approved },
                { text: 'Từ chối', value: WithdrawalStatus.Rejected },
                { text: 'Đã hủy', value: WithdrawalStatus.Cancelled }
            ]
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'requestedAt',
            key: 'requestedAt',
            width: 120,
            render: (date: string) => (
                <div className="date-info">
                    <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
                    <br />
                    <Text type="secondary" className="time">
                        {dayjs(date).format('HH:mm')}
                    </Text>
                </div>
            ),
            sorter: true
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record: WithdrawalRequest) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setSelectedRequest(record);
                                setDetailModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    {record.canCancel && (
                        <Popconfirm
                            title="Hủy yêu cầu rút tiền"
                            description="Bạn có chắc chắn muốn hủy yêu cầu này?"
                            onConfirm={() => handleCancelRequest(record.id)}
                            okText="Hủy yêu cầu"
                            cancelText="Không"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Hủy yêu cầu">
                                <Button
                                    type="text"
                                    icon={<StopOutlined />}
                                    danger
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="withdrawal-request-history">
            <Card
                title="Lịch sử yêu cầu rút tiền"
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadWithdrawalRequests}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                }
            >
                {/* Filters */}
                <div className="filters-section">
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={8} md={6}>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                value={filters.status}
                                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                style={{ width: '100%' }}
                                suffixIcon={<FilterOutlined />}
                            >
                                <Option value={WithdrawalStatus.Pending}>Chờ duyệt</Option>
                                <Option value={WithdrawalStatus.Approved}>Đã duyệt</Option>
                                <Option value={WithdrawalStatus.Rejected}>Từ chối</Option>
                                <Option value={WithdrawalStatus.Cancelled}>Đã hủy</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={10}>
                            <RangePicker
                                placeholder={['Từ ngày', 'Đến ngày']}
                                value={filters.dateRange}
                                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null }))}
                                style={{ width: '100%' }}
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Col>
                    </Row>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} yêu cầu`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize: pageSize || 10
                            }));
                        }
                    }}
                    scroll={{ x: 800 }}
                    className="withdrawal-requests-table"
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu rút tiền"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedRequest && (
                    <div className="request-detail">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text type="secondary">Mã yêu cầu:</Text>
                                <br />
                                <Text code strong>{selectedRequest.id}</Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Trạng thái:</Text>
                                <br />
                                {getStatusTag(selectedRequest.status)}
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Số tiền yêu cầu:</Text>
                                <br />
                                <Title level={4} className="amount">
                                    {formatCurrency(selectedRequest.amount)}
                                </Title>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Phí rút tiền:</Text>
                                <br />
                                <Text type="secondary">
                                    {formatCurrency(selectedRequest.withdrawalFee)}
                                </Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Số tiền thực nhận:</Text>
                                <br />
                                <Title level={5} style={{ color: '#52c41a', margin: 0 }}>
                                    {formatCurrency(selectedRequest.netAmount)}
                                </Title>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Ngày tạo:</Text>
                                <br />
                                <Text>{dayjs(selectedRequest.requestedAt).format('DD/MM/YYYY HH:mm')}</Text>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Số dư ví lúc tạo:</Text>
                                <br />
                                <Text>{formatCurrency(selectedRequest.walletBalanceAtRequest)}</Text>
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">Tài khoản ngân hàng:</Text>
                                <br />
                                <Text strong>{selectedRequest.bankAccount?.bankName}</Text>
                                <br />
                                <Text>Số TK: {selectedRequest.bankAccount?.maskedAccountNumber}</Text>
                                <br />
                                <Text>Chủ TK: {selectedRequest.bankAccount?.accountHolderName}</Text>
                            </Col>
                            {selectedRequest.processedAt && (
                                <Col span={12}>
                                    <Text type="secondary">Ngày xử lý:</Text>
                                    <br />
                                    <Text>{dayjs(selectedRequest.processedAt).format('DD/MM/YYYY HH:mm')}</Text>
                                </Col>
                            )}
                            {selectedRequest.processedByName && (
                                <Col span={12}>
                                    <Text type="secondary">Người xử lý:</Text>
                                    <br />
                                    <Text>{selectedRequest.processedByName}</Text>
                                </Col>
                            )}
                            {selectedRequest.adminNotes && (
                                <Col span={24}>
                                    <Text type="secondary">Ghi chú từ admin:</Text>
                                    <br />
                                    <Text>{selectedRequest.adminNotes}</Text>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WithdrawalRequestHistory;
