import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Alert,
    Space,
    Typography,
    message
} from 'antd';
import {
    ExclamationCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { tourSlotService } from '../../services/tourSlotService';
import { useAuthStore } from '@/store/useAuthStore';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface CancelTourModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    slotId: string | null;
    slotInfo?: {
        tourDate: string;
        formattedDateWithDay: string;
        statusName: string;
    };
}

interface CancelTourRequest {
    reason: string;
    additionalMessage?: string;
}

const CancelTourModal: React.FC<CancelTourModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    slotId,
    slotInfo
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { token } = useAuthStore();

    const handleSubmit = async (values: CancelTourRequest) => {
        if (!slotId || !token) {
            message.error('Thiếu thông tin cần thiết để hủy tour');
            return;
        }

        setLoading(true);
        try {
            const response = await tourSlotService.cancelTourSlot(slotId, values, token);
            
            if (response.success) {
                message.success('Hủy tour thành công! Email thông báo đã được gửi đến khách hàng.');
                form.resetFields();
                onSuccess();
            } else {
                message.error(response.message || 'Có lỗi xảy ra khi hủy tour');
            }
        } catch (error: any) {
            console.error('Error cancelling tour:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy tour');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>Hủy Tour</span>
                    {slotInfo && (
                        <Text type="secondary">- {slotInfo.formattedDateWithDay}</Text>
                    )}
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            <div style={{ marginBottom: 16 }}>
                <Alert
                    message="Cảnh báo"
                    description="Việc hủy tour sẽ gửi email thông báo đến tất cả khách hàng đã đặt tour này. Hành động này không thể hoàn tác."
                    type="warning"
                    icon={<ExclamationCircleOutlined />}
                    showIcon
                />
            </div>

            {slotInfo && (
                <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                    <Title level={5} style={{ margin: 0, marginBottom: 8 }}>Thông tin tour sẽ bị hủy:</Title>
                    <Text><strong>Ngày tour:</strong> {slotInfo.formattedDateWithDay}</Text><br />
                    <Text><strong>Trạng thái hiện tại:</strong> {slotInfo.statusName}</Text>
                </div>
            )}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    reason: '',
                    additionalMessage: ''
                }}
            >
                <Form.Item
                    name="reason"
                    label="Lý do hủy tour"
                    rules={[
                        { required: true, message: 'Vui lòng nhập lý do hủy tour' },
                        { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' },
                        { max: 500, message: 'Lý do không được vượt quá 500 ký tự' }
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Ví dụ: Do thời tiết không thuận lợi, chúng tôi buộc phải hủy tour để đảm bảo an toàn cho khách hàng..."
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                <Form.Item
                    name="additionalMessage"
                    label="Thông tin bổ sung (tùy chọn)"
                    rules={[
                        { max: 300, message: 'Thông tin bổ sung không được vượt quá 300 ký tự' }
                    ]}
                >
                    <TextArea
                        rows={3}
                        placeholder="Ví dụ: Nhân viên sẽ liên hệ để hỗ trợ hoàn tiền trong 3-5 ngày làm việc..."
                        showCount
                        maxLength={300}
                    />
                </Form.Item>

                <div style={{ textAlign: 'right', marginTop: 24 }}>
                    <Space>
                        <Button onClick={handleCancel} disabled={loading}>
                            Hủy bỏ
                        </Button>
                        <Button 
                            type="primary" 
                            danger 
                            htmlType="submit" 
                            loading={loading}
                            icon={<CloseCircleOutlined />}
                        >
                            Xác nhận hủy tour
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};

export default CancelTourModal;
