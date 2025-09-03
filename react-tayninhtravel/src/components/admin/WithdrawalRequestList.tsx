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
    Form,
    Alert
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
import type { ColumnsType } from 'antd/es/table';
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
    /** Callback truyền số lượng request thực tế cho tab */
    onTabCountChanged?: (count: number) => void;
    /** Initial status filter */
    initialStatus?: WithdrawalStatus;
    /** Refresh trigger */
    refreshTrigger?: number;
    /** Callback khi dữ liệu thay đổi (duyệt/từ chối) */
    onDataChanged?: () => void;
    /** Dark mode flag */
    isDarkMode?: boolean;
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
    refreshTrigger,
    onDataChanged,
    onTabCountChanged,
    isDarkMode
}) => {
    const { token } = useAuthStore();
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

    // Action modals
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [approveForm] = Form.useForm();
    const [rejectForm] = Form.useForm();
    const [filters, setFilters] = useState({
        status: initialStatus,
        search: '',
        dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null
    });

    // Xác định có hiển thị filter trạng thái hay không
    const showStatusFilter = !initialStatus;
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
            // Nếu có initialStatus thì chỉ truyền status khi filter status là undefined (tab tất cả), còn lại luôn lấy initialStatus
            const params: any = {
                pageNumber: pagination.current,
                pageSize: pagination.pageSize,
                searchTerm: filters.search || undefined
            };
            if (initialStatus) {
                params.status = initialStatus;
            } else if (filters.status) {
                params.status = filters.status;
            }

            const response = await getAdminWithdrawalRequests(params, token || undefined);

            // Debug: Log response để kiểm tra cấu trúc dữ liệu
            console.log('Response from getAdminWithdrawalRequests:', response);

            // Lấy dữ liệu từ response.data.items (theo cấu trúc API mới)
            let requestsData = [];
            if (response.data && Array.isArray(response.data.items)) {
                requestsData = response.data.items;
            } else if (Array.isArray(response.data)) {
                requestsData = response.data;
            } else if (Array.isArray(response)) {
                requestsData = response;
            }

            // Filter by date range on frontend if dateRange is set
            if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
                const [fromDate, toDate] = filters.dateRange;
                requestsData = requestsData.filter((request: WithdrawalRequest) => {
                    const requestDate = dayjs(request.requestedAt);
                    return requestDate.isAfter(fromDate.startOf('day')) &&
                        requestDate.isBefore(toDate.endOf('day'));
                });
            }

            console.log('Processed requests data:', requestsData);

            setRequests(requestsData);

            if (onTabCountChanged) {
                onTabCountChanged(requestsData.length);
            }

            setPagination(prev => ({
                ...prev,
                total: response.data?.totalCount || response.totalCount || response.total || requestsData.length || 0
            }));
        } catch (error: any) {
            console.error('Error loading withdrawal requests:', error);
            message.error('Không thể tải danh sách yêu cầu rút tiền');

            // Set empty array để tránh lỗi
            setRequests([]);
            setPagination(prev => ({
                ...prev,
                total: 0
            }));
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle approve click - Open detail modal with approve focus
     */
    const handleApproveClick = (record: WithdrawalRequest) => {
        setSelectedRequest(record);
        setApproveModalVisible(true);
    };

    /**
     * Handle reject click - Open reject modal
     */
    const handleRejectClick = (record: WithdrawalRequest) => {
        setSelectedRequest(record);
        setRejectModalVisible(true);
    };

    /**
     * Handle export
     */
    const handleExport = async () => {
        try {
            const params = {
                status: filters.status,
                searchTerm: filters.search || undefined,
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
     * Handle approve form submission
     */
    const handleApproveSubmit = async (values: { transactionReference: string; adminNotes?: string }) => {
        if (!selectedRequest) return;

        try {
            setActionLoading(true);
            await approveWithdrawalRequest(selectedRequest.id, {
                transactionReference: values.transactionReference,
                adminNotes: values.adminNotes
            }, token || undefined);
            message.success('Duyệt yêu cầu thành công');
            setApproveModalVisible(false);
            approveForm.resetFields();
            setSelectedRequest(null);
            // Refresh the list
            await loadWithdrawalRequests();
            if (onDataChanged) onDataChanged();
        } catch (error: any) {
            message.error('Không thể duyệt yêu cầu: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Handle reject form submission
     */
    const handleRejectSubmit = async (values: { adminNotes: string }) => {
        if (!selectedRequest) return;

        try {
            setActionLoading(true);
            await rejectWithdrawalRequest(selectedRequest.id, { reason: values.adminNotes }, token || undefined);
            message.success('Từ chối yêu cầu thành công');
            setRejectModalVisible(false);
            rejectForm.resetFields();
            setSelectedRequest(null);
            // Refresh the list
            await loadWithdrawalRequests();
            if (onDataChanged) onDataChanged();
        } catch (error: any) {
            message.error('Không thể từ chối yêu cầu: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
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
            dataIndex: ['user', 'fullName'],
            key: 'userName',
            width: 150,
            render: (name: string, record: WithdrawalRequest) => (
                <div>
                    <div className="user-name">{name || 'N/A'}</div>
                    <div className="user-email" style={{ fontSize: '12px', color: '#666' }}>
                        {record.user?.email}
                    </div>
                </div>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 150,
            render: (amount: number, record: WithdrawalRequest) => (
                <div>
                    <div className="amount">{formatCurrency(amount)}</div>
                    {record.withdrawalFee > 0 && (
                        <>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                                Phí: {formatCurrency(record.withdrawalFee)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: 'bold' }}>
                                Thực nhận: {formatCurrency(record.netAmount)}
                            </div>
                        </>
                    )}
                </div>
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
                    <div className="account-number" style={{ fontSize: '12px', color: '#666' }}>
                        {record.bankAccount?.maskedAccountNumber || record.bankAccount?.accountNumber}
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: WithdrawalStatus, record: WithdrawalRequest) => {
                const statusConfig = {
                    [WithdrawalStatus.Pending]: { color: 'processing', text: record.statusName || 'Chờ duyệt' },
                    [WithdrawalStatus.Approved]: { color: 'success', text: record.statusName || 'Đã duyệt' },
                    [WithdrawalStatus.Rejected]: { color: 'error', text: record.statusName || 'Từ chối' },
                    [WithdrawalStatus.Cancelled]: { color: 'default', text: record.statusName || 'Đã hủy' }
                };

                const config = statusConfig[status] || { color: 'default', text: record.statusName || 'Không xác định' };
                return (
                    <div>
                        <Tag color={config.color}>{config.text}</Tag>
                        {record.daysPending !== undefined && record.daysPending > 0 && (
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                {record.daysPending} ngày
                            </div>
                        )}
                    </div>
                );
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
                            <Tooltip title="Duyệt yêu cầu">
                                <Button
                                    type="text"
                                    icon={<CheckOutlined />}
                                    className="approve-btn"
                                    onClick={() => handleApproveClick(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối yêu cầu">
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    danger
                                    onClick={() => handleRejectClick(record)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            )
        }
    ];

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
                <div className={`filters-section ${isDarkMode ? 'dark-mode' : ''}`}>
                    <Row gutter={[16, 8]} align="middle" style={{ alignItems: 'center' }}>
                        {showStatusFilter && (
                            <Col xs={24} sm={8} md={6} style={{ display: 'flex', alignItems: 'center' }}>
                                <Select
                                    placeholder="Lọc theo trạng thái"
                                    allowClear
                                    value={filters.status}
                                    onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                    style={{ width: '100%', height: '40px' }}
                                    size="large"
                                    suffixIcon={<FilterOutlined />}
                                >
                                    <Option value={WithdrawalStatus.Pending}>Chờ duyệt</Option>
                                    <Option value={WithdrawalStatus.Approved}>Đã duyệt</Option>
                                    <Option value={WithdrawalStatus.Rejected}>Từ chối</Option>
                                    <Option value={WithdrawalStatus.Cancelled}>Đã hủy</Option>
                                </Select>
                            </Col>
                        )}
                        <Col xs={24} sm={showStatusFilter ? 8 : 12} md={showStatusFilter ? 8 : 10} style={{ display: 'flex', alignItems: 'center' }}>
                            <Search
                                placeholder="Tìm theo tên/email người dùng"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                onSearch={() => loadWithdrawalRequests()}
                                style={{ width: '100%', height: '40px' }}
                                size="large"
                                className={`search-input${isDarkMode ? ' dark' : ''}`}
                            />
                        </Col>
                        <Col xs={24} sm={showStatusFilter ? 8 : 12} md={showStatusFilter ? 10 : 14} style={{ display: 'flex', alignItems: 'center' }}>
                            <RangePicker
                                placeholder={['Từ ngày', 'Đến ngày']}
                                value={filters.dateRange}
                                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null }))}
                                style={{ width: '100%', height: '40px' }}
                                size="large"
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
                    scroll={{ x: 1000 }}
                    className="requests-table"
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu rút tiền"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                }}
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

            {/* Modal Approve */}
            <Modal
                title="Duyệt yêu cầu rút tiền"
                open={approveModalVisible}
                onCancel={() => {
                    setApproveModalVisible(false);
                    approveForm.resetFields();
                    setSelectedRequest(null);
                }}
                onOk={() => approveForm.submit()}
                confirmLoading={actionLoading}
                okText="Duyệt"
                cancelText="Hủy"
                width={500}
            >
                {selectedRequest && (
                    <div style={{ marginBottom: 16 }}>
                        <Alert
                            message={`Duyệt yêu cầu rút tiền cho: ${selectedRequest.user?.fullName || 'N/A'}`}
                            description={`Số tiền: ${selectedRequest.amount?.toLocaleString('vi-VN')} ₫`}
                            type="info"
                            style={{ marginBottom: 16 }}
                        />
                        <Form
                            form={approveForm}
                            layout="vertical"
                            onFinish={handleApproveSubmit}
                        >
                            <Form.Item
                                name="transactionReference"
                                label="Mã giao dịch"
                                rules={[{ required: true, message: 'Vui lòng nhập mã giao dịch' }]}
                            >
                                <Input placeholder="Nhập mã giao dịch" />
                            </Form.Item>
                            <Form.Item
                                name="adminNotes"
                                label="Ghi chú của admin"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Nhập ghi chú (tùy chọn)"
                                />
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>

            {/* Modal Reject */}
            <Modal
                title="Từ chối yêu cầu rút tiền"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    rejectForm.resetFields();
                    setSelectedRequest(null);
                }}
                onOk={() => rejectForm.submit()}
                confirmLoading={actionLoading}
                okText="Từ chối"
                cancelText="Hủy"
                width={500}
            >
                {selectedRequest && (
                    <div style={{ marginBottom: 16 }}>
                        <Alert
                            message={`Từ chối yêu cầu rút tiền cho: ${selectedRequest.user?.fullName || 'N/A'}`}
                            description={`Số tiền: ${selectedRequest.amount?.toLocaleString('vi-VN')} ₫`}
                            type="warning"
                            style={{ marginBottom: 16 }}
                        />
                        <Form
                            form={rejectForm}
                            layout="vertical"
                            onFinish={handleRejectSubmit}
                        >
                            <Form.Item
                                name="adminNotes"
                                label="Lý do từ chối"
                                rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Nhập lý do từ chối"
                                />
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WithdrawalRequestList;
