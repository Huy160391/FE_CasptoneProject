import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Button,
    Modal,
    Form,
    Input,
    Space,
    Alert,
    Descriptions,
    message
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    BankOutlined,
    DollarOutlined,
    CalendarOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { WithdrawalRequest, WithdrawalStatus } from '@/types';
import { approveWithdrawalRequest, rejectWithdrawalRequest } from '@/services/adminWithdrawalService';
import { useAuthStore } from '@/store/useAuthStore';
import dayjs from 'dayjs';
import './WithdrawalRequestDetail.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface WithdrawalRequestDetailProps {
    /** Withdrawal request data */
    request: WithdrawalRequest;
    /** Callback when request is processed */
    onProcessed?: () => void;
    /** Loading state */
    loading?: boolean;
}

/**
 * WithdrawalRequestDetail Component
 * 
 * Displays detailed information about a withdrawal request with admin actions.
 * Features:
 * - Complete request information display
 * - Approve/Reject actions with admin notes
 * - User and bank account information
 * - Status tracking and history
 * - Responsive design
 */
const WithdrawalRequestDetail: React.FC<WithdrawalRequestDetailProps> = ({
    request,
    onProcessed,
    loading = false
}) => {
    const { token } = useAuthStore();
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [form] = Form.useForm();

    /**
     * Get status tag configuration
     */
    const getStatusTag = (status: WithdrawalStatus) => {
        const statusConfig = {
            [WithdrawalStatus.Pending]: { color: 'processing', text: 'Chờ duyệt' },
            [WithdrawalStatus.Approved]: { color: 'success', text: 'Đã duyệt' },
            [WithdrawalStatus.Rejected]: { color: 'error', text: 'Từ chối' },
            [WithdrawalStatus.Cancelled]: { color: 'default', text: 'Đã hủy' }
        };

        const config = statusConfig[status];
        return <Tag color={config.color} className="status-tag">{config.text}</Tag>;
    };

    /**
     * Format currency
     */
    const formatCurrency = (amount: number): string => {
        return `${amount.toLocaleString('vi-VN')} ₫`;
    };

    /**
     * Handle approve action
     */
    const handleApprove = () => {
        setActionType('approve');
        setActionModalVisible(true);
        form.resetFields();
    };

    /**
     * Handle reject action
     */
    const handleReject = () => {
        setActionType('reject');
        setActionModalVisible(true);
        form.resetFields();
    };

    /**
     * Process the action (approve/reject)
     */
    const handleProcessAction = async (values: { adminNotes?: string; transactionReference?: string }) => {
        if (!actionType) return;

        setActionLoading(true);
        try {
            if (actionType === 'approve') {
                if (!values.transactionReference) {
                    message.error('Vui lòng nhập mã giao dịch');
                    setActionLoading(false);
                    return;
                }
                await approveWithdrawalRequest(request.id, {
                    adminNotes: values.adminNotes,
                    transactionReference: values.transactionReference
                }, token || undefined);
                message.success('Đã duyệt yêu cầu rút tiền thành công');
            } else {
                // For reject, we need to pass the reason from adminNotes
                await rejectWithdrawalRequest(request.id, {
                    reason: values.adminNotes || 'Không có lý do cụ thể'
                }, token || undefined);
                message.success('Đã từ chối yêu cầu rút tiền');
            }

            setActionModalVisible(false);
            onProcessed?.();
        } catch (error: any) {
            message.error(error.message || `Không thể ${actionType === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu`);
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Check if request can be processed
     */
    const canProcess = request.status === WithdrawalStatus.Pending;

    return (
        <div className="withdrawal-request-detail">
            <Card
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Chi tiết yêu cầu rút tiền</span>
                        {getStatusTag(request.status)}
                    </Space>
                }
                extra={
                    canProcess && (
                        <Space>
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={handleApprove}
                                loading={loading}
                                className="approve-btn"
                            >
                                Duyệt
                            </Button>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={handleReject}
                                loading={loading}
                                className="reject-btn"
                            >
                                Từ chối
                            </Button>
                        </Space>
                    )
                }
                className="detail-card"
            >
                <Row gutter={[24, 24]}>
                    {/* Request Information */}
                    <Col xs={24} lg={12}>
                        <Card type="inner" title="Thông tin yêu cầu" className="info-card">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Mã yêu cầu">
                                    <Text code strong>{request.id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền yêu cầu">
                                    <Title level={4} className="amount">
                                        {formatCurrency(request.amount)}
                                    </Title>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phí rút tiền">
                                    <Text type="secondary">
                                        {formatCurrency(request.withdrawalFee)}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tiền thực nhận">
                                    <Title level={5} className="net-amount" style={{ color: '#52c41a' }}>
                                        {formatCurrency(request.netAmount)}
                                    </Title>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">
                                    <Space>
                                        <CalendarOutlined />
                                        <Text>{dayjs(request.requestedAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                                    </Space>
                                </Descriptions.Item>
                                {request.processedAt && (
                                    <Descriptions.Item label="Ngày xử lý">
                                        <Space>
                                            <CalendarOutlined />
                                            <Text>{dayjs(request.processedAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                                        </Space>
                                    </Descriptions.Item>
                                )}
                                {request.processedByName && (
                                    <Descriptions.Item label="Người xử lý">
                                        <Text>{request.processedByName}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* User Information */}
                    <Col xs={24} lg={12}>
                        <Card type="inner" title="Thông tin người dùng" className="info-card">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="ID người dùng">
                                    <Text code>{request.user?.id || request.userId}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Họ tên">
                                    <Text strong>{request.user?.fullName || 'N/A'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <Text>{request.user?.email || 'N/A'}</Text>
                                </Descriptions.Item>
                                {request.user?.phoneNumber && (
                                    <Descriptions.Item label="Số điện thoại">
                                        <Text>{request.user.phoneNumber}</Text>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Số dư ví lúc tạo yêu cầu">
                                    <Text strong>{formatCurrency(request.walletBalanceAtRequest)}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Bank Account Information */}
                    <Col xs={24}>
                        <Card type="inner" title="Thông tin tài khoản ngân hàng" className="info-card">
                            <Descriptions column={2} size="small">
                                <Descriptions.Item label="Ngân hàng" span={1}>
                                    <Space>
                                        <BankOutlined />
                                        <Text strong>{request.bankAccount?.bankName}</Text>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Chủ tài khoản" span={1}>
                                    <Text strong>{request.bankAccount?.accountHolderName}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số tài khoản" span={1}>
                                    <Space>
                                        <Text code className="account-number" style={{ fontSize: '14px' }}>
                                            {request.bankAccount?.accountNumber || request.bankAccount?.maskedAccountNumber}
                                        </Text>
                                        {request.bankAccount?.isVerified !== undefined && (
                                            <Tag color={request.bankAccount.isVerified ? 'success' : 'warning'}>
                                                {request.bankAccount.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                                            </Tag>
                                        )}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="ID tài khoản" span={1}>
                                    <Text code style={{ fontSize: '12px' }}>{request.bankAccount?.id}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Admin Notes */}
                    {request.adminNotes && (
                        <Col xs={24}>
                            <Alert
                                message="Ghi chú từ admin"
                                description={request.adminNotes}
                                type="info"
                                icon={<InfoCircleOutlined />}
                                className="admin-notes"
                            />
                        </Col>
                    )}
                </Row>
            </Card>

            {/* Action Modal */}
            <Modal
                title={`${actionType === 'approve' ? 'Duyệt' : 'Từ chối'} yêu cầu rút tiền`}
                open={actionModalVisible}
                onCancel={() => setActionModalVisible(false)}
                footer={null}
                width={500}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleProcessAction}
                >
                    <Alert
                        message={`Xác nhận ${actionType === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu`}
                        description={
                            <div>
                                <p>Người yêu cầu: <strong>{request.user?.fullName || 'N/A'}</strong></p>
                                <p>Số tiền: <strong>{formatCurrency(request.amount)}</strong></p>
                                <p>Phí rút tiền: <strong>{formatCurrency(request.withdrawalFee)}</strong></p>
                                <p>Số tiền thực nhận: <strong>{formatCurrency(request.netAmount)}</strong></p>
                                <p>Tài khoản: <strong>{request.bankAccount?.bankName} - {request.bankAccount?.accountNumber || request.bankAccount?.maskedAccountNumber}</strong></p>
                                <p>Chủ tài khoản: <strong>{request.bankAccount?.accountHolderName}</strong></p>
                            </div>
                        }
                        type={actionType === 'approve' ? 'success' : 'warning'}
                        style={{ marginBottom: 16 }}
                    />

                    {actionType === 'approve' && (
                        <Form.Item
                            name="transactionReference"
                            label="Mã giao dịch"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã giao dịch' },
                                { min: 5, message: 'Mã giao dịch phải có ít nhất 5 ký tự' },
                                { max: 100, message: 'Mã giao dịch không được quá 100 ký tự' }
                            ]}
                        >
                            <Input
                                placeholder="Nhập mã giao dịch từ ngân hàng..."
                                maxLength={100}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="adminNotes"
                        label={actionType === 'reject' ? 'Lý do từ chối' : 'Ghi chú (tùy chọn)'}
                        rules={[
                            ...(actionType === 'reject' ? [{ required: true, message: 'Vui lòng nhập lý do từ chối' }] : []),
                            { max: 500, message: 'Ghi chú không được quá 500 ký tự' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder={actionType === 'approve' ? 'Nhập ghi chú cho việc duyệt yêu cầu này...' : 'Nhập lý do từ chối yêu cầu này...'}
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setActionModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button
                                type={actionType === 'approve' ? 'primary' : 'default'}
                                danger={actionType === 'reject'}
                                htmlType="submit"
                                loading={actionLoading}
                                icon={actionType === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
                            >
                                {actionType === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WithdrawalRequestDetail;
