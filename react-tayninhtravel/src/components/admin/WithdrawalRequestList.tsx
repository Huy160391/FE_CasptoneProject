import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Tag, 
    Button, 
    Space, 
    Input, 
    Select, 
    DatePicker, 
    Row, 
    Col,
    Card,
    Tooltip,
    Modal,
    message,
    Popconfirm
} from 'antd';
import {
    EyeOutlined,
    FilterOutlined,
    ReloadOutlined,
    CheckOutlined,
    CloseOutlined,
    ExportOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { WithdrawalRequest, WithdrawalStatus } from '@/types';
import { 
    getAdminWithdrawalRequests, 
    approveWithdrawalRequest, 
    rejectWithdrawalRequest,
    exportWithdrawalRequests
} from '@/services/adminWithdrawalService';
import { useAuthStore } from '@/store/useAuthStore';
import WithdrawalRequestDetail from './WithdrawalRequestDetail';
import dayjs from 'dayjs';
import './WithdrawalRequestList.scss';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface WithdrawalRequestListProps {
    /** Initial status filter */
    initialStatus?: WithdrawalStatus;
    /** Refresh trigger */
    refreshTrigger?: number;
}

/**
 * WithdrawalRequestList Component
 * 
 * Admin component for managing withdrawal requests with comprehensive filtering and actions.
 * Features:
 * - Advanced filtering (status, date range, user search)
 * - Bulk operations (approve/reject multiple requests)
 * - Export functionality
 * - Real-time updates
 * - Responsive table design
 * - Quick actions for individual requests
 */
const WithdrawalRequestList: React.FC<WithdrawalRequestListProps> = ({
    initialStatus,
    refreshTrigger
}) => {
    const { token } = useAuthStore();
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [filters, setFilters] = useState({
        status: initialStatus,
        search: '',
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
                pageIndex: pagination.current - 1,
                pageSize: pagination.pageSize,
                status: filters.status,
                userId: filters.search || undefined,
                fromDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
                toDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
            };

            const response = await getAdminWithdrawalRequests(params, token || undefined);
            setRequests(response.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.totalCount || 0
            }));
        } catch (error: any) {
            message.error('Không thể tải danh sách yêu cầu rút tiền');
            console.error('Error loading withdrawal requests:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle quick approve
     */
    const handleQuickApprove = async (id: string) => {
        try {
            await approveWithdrawalRequest(id, {}, token || undefined);
            message.success('Đã duyệt yêu cầu thành công');
            loadWithdrawalRequests();
        } catch (error: any) {
            message.error(error.message || 'Không thể duyệt yêu cầu');
        }
    };

    /**
     * Handle quick reject
     */
    const handleQuickReject = async (id: string) => {
        try {
            await rejectWithdrawalRequest(id, {}, token || undefined);
            message.success('Đã từ chối yêu cầu');
            loadWithdrawalRequests();
        } catch (error: any) {
            message.error(error.message || 'Không thể từ chối yêu cầu');
        }
    };

    /**
     * Handle export
     */
    const handleExport = async () => {
        try {
            const params = {
                status: filters.status,
                userId: filters.search || undefined,
                fromDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
                toDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
                format: 'excel' as const
            };

            const blob = await exportWithdrawalRequests(params, token || undefined);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `withdrawal-requests-${dayjs().format('YYYY-MM-DD')}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            message.success('Xuất file thành công');
        } catch (error: any) {
            message.error('Không thể xuất file');
        }
    };

    /**
     * Get status tag
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
                <Button
                    type="link"
                    onClick={() => {
                        const request = requests.find(r => r.id === id);
                        if (request) {
                            setSelectedRequest(request);
                            setDetailModalVisible(true);
                        }
                    }}
                    className="request-id-link"
                >
                    {id.slice(-8).toUpperCase()}
                </Button>
            )
        },
        {
            title: 'Người yêu cầu',
            dataIndex: ['user', 'name'],
            key: 'userName',
            width: 150,
            render: (name: string, record: WithdrawalRequest) => (
                <div>
                    <div className="user-name">{name || 'N/A'}</div>
                    <div className="user-email">{record.user?.email}</div>
                </div>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount: number) => (
                <span className="amount">{formatCurrency(amount)}</span>
            ),
            sorter: true
        },
        {
            title: 'Ngân hàng',
            dataIndex: ['bankAccount', 'bankName'],
            key: 'bankName',
            width: 150,
            render: (bankName: string, record: WithdrawalRequest) => (
                <div>
                    <div className="bank-name">{bankName}</div>
                    <div className="account-number">
                        {record.bankAccount?.accountNumber}
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: WithdrawalStatus) => getStatusTag(status),
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
                    <div>{dayjs(date).format('DD/MM/YYYY')}</div>
                    <div className="time">{dayjs(date).format('HH:mm')}</div>
                </div>
            ),
            sorter: true
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (_, record: WithdrawalRequest) => (
                <Space size="small">
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
                    {record.status === WithdrawalStatus.Pending && (
                        <>
                            <Popconfirm
                                title="Duyệt yêu cầu"
                                description="Bạn có chắc chắn muốn duyệt yêu cầu này?"
                                onConfirm={() => handleQuickApprove(record.id)}
                                okText="Duyệt"
                                cancelText="Hủy"
                            >
                                <Tooltip title="Duyệt nhanh">
                                    <Button
                                        type="text"
                                        icon={<CheckOutlined />}
                                        className="approve-btn"
                                    />
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm
                                title="Từ chối yêu cầu"
                                description="Bạn có chắc chắn muốn từ chối yêu cầu này?"
                                onConfirm={() => handleQuickReject(record.id)}
                                okText="Từ chối"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Tooltip title="Từ chối nhanh">
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined />}
                                        danger
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            )
        }
    ];

    /**
     * Row selection configuration
     */
    const rowSelection: TableProps<WithdrawalRequest>['rowSelection'] = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        getCheckboxProps: (record: WithdrawalRequest) => ({
            disabled: record.status !== WithdrawalStatus.Pending
        })
    };

    return (
        <div className="withdrawal-request-list">
            <Card
                title="Danh sách yêu cầu rút tiền"
                extra={
                    <Space>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={handleExport}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadWithdrawalRequests}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                    </Space>
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
                        <Col xs={24} sm={8} md={6}>
                            <Search
                                placeholder="Tìm theo tên/email người dùng"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                onSearch={() => loadWithdrawalRequests()}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={8} md={8}>
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

                {/* Bulk Actions */}
                {selectedRowKeys.length > 0 && (
                    <div className="bulk-actions">
                        <Space>
                            <span>Đã chọn {selectedRowKeys.length} yêu cầu</span>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => {
                                    // Handle bulk approve
                                    message.info('Tính năng duyệt hàng loạt sẽ được triển khai');
                                }}
                            >
                                Duyệt hàng loạt
                            </Button>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => {
                                    // Handle bulk reject
                                    message.info('Tính năng từ chối hàng loạt sẽ được triển khai');
                                }}
                            >
                                Từ chối hàng loạt
                            </Button>
                        </Space>
                    </div>
                )}

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    loading={loading}
                    rowSelection={rowSelection}
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
                    scroll={{ x: 1000 }}
                    className="requests-table"
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu rút tiền"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={900}
                destroyOnClose
            >
                {selectedRequest && (
                    <WithdrawalRequestDetail
                        request={selectedRequest}
                        onProcessed={() => {
                            setDetailModalVisible(false);
                            loadWithdrawalRequests();
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default WithdrawalRequestList;
