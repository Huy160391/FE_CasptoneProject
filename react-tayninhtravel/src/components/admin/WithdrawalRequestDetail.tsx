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
    UserOutlined,
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
    const handleProcessAction = async (values: { adminNotes?: string }) => {
        if (!actionType) return;

        setActionLoading(true);
        try {
            if (actionType === 'approve') {
                await approveWithdrawalRequest(request.id, values, token || undefined);
                message.success('Đã duyệt yêu cầu rút tiền thành công');
            } else {
                await rejectWithdrawalRequest(request.id, values, token || undefined);
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
                                <Descriptions.Item label="Số tiền">
                                    <Title level={4} className="amount">
                                        {formatCurrency(request.amount)}
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
                                {request.processedBy && (
                                    <Descriptions.Item label="Người xử lý">
                                        <Text>{request.processedBy}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* User Information */}
                    <Col xs={24} lg={12}>
                        <Card type="inner" title="Thông tin người dùng" className="info-card">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Tên người dùng">
                                    <Space>
                                        <UserOutlined />
                                        <Text strong>{request.user?.name || 'N/A'}</Text>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <Text>{request.user?.email || 'N/A'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="ID người dùng">
                                    <Text code>{request.userId}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Bank Account Information */}
                    <Col xs={24}>
                        <Card type="inner" title="Thông tin tài khoản ngân hàng" className="info-card">
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Ngân hàng">
                                            <Space>
                                                <BankOutlined />
                                                <Text strong>{request.bankAccount?.bankName}</Text>
                                            </Space>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Số tài khoản">
                                            <Text code className="account-number">
                                                {request.bankAccount?.accountNumber}
                                            </Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Chủ tài khoản">
                                            <Text strong>{request.bankAccount?.accountHolderName}</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Col>
                            </Row>
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
                                <p>Số tiền: <strong>{formatCurrency(request.amount)}</strong></p>
                                <p>Người yêu cầu: <strong>{request.user?.name}</strong></p>
                                <p>Tài khoản: <strong>{request.bankAccount?.bankName} - {request.bankAccount?.accountNumber}</strong></p>
                            </div>
                        }
                        type={actionType === 'approve' ? 'success' : 'warning'}
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                        name="adminNotes"
                        label="Ghi chú (tùy chọn)"
                        rules={[
                            { max: 500, message: 'Ghi chú không được quá 500 ký tự' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder={`Nhập ghi chú cho việc ${actionType === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu này...`}
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
