import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    InputNumber,
    Select,
    Button,
    Space,
    message,
    Descriptions,
    Progress,
    Tag,
    Statistic,
    Row,
    Col,
    Alert
} from 'antd';
import {
    DollarOutlined,
    TeamOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    createTourOperation,
    getTourOperationByDetailsId,
    updateTourOperation,
    checkTourCapacity,
    handleApiError
} from '../../services/tourcompanyService';
import {
    TourOperation,
    CreateTourOperationRequest,
    TourDetails,
    Guide
} from '../../types/tour';
import { validateTourOperation } from '../../constants/tourTemplate';

const { Option } = Select;

interface TourOperationManagementProps {
    tourDetails: TourDetails;
    onOperationUpdate?: (operation: TourOperation) => void;
    onOperationCreate?: (operation: TourOperation) => void;
}

const TourOperationManagement: React.FC<TourOperationManagementProps> = ({
    tourDetails,
    onOperationUpdate,
    onOperationCreate
}) => {
    const { token } = useAuthStore();
    const [operation, setOperation] = useState<TourOperation | null>(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [capacityInfo, setCapacityInfo] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadTourOperation();
    }, [tourDetails.id]);

    const loadTourOperation = async () => {
        try {
            setLoading(true);
            const response = await getTourOperationByDetailsId(tourDetails.id, token);
            if (response.success && response.data) {
                setOperation(response.data);
                form.setFieldsValue({
                    price: response.data.price,
                    maxSeats: response.data.maxSeats,
                    guideId: response.data.guideId
                });

                // Load capacity info
                await loadCapacityInfo(response.data.id);
            }
        } catch (error) {
            console.error('Error loading tour operation:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCapacityInfo = async (operationId: string) => {
        try {
            const response = await checkTourCapacity(operationId, token);
            if (response.success && response.data) {
                setCapacityInfo(response.data);
            }
        } catch (error) {
            console.error('Error loading capacity info:', error);
        }
    };

    const handleCreate = async (values: CreateTourOperationRequest) => {
        try {
            setLoading(true);
            
            // Validate
            const errors = validateTourOperation(values);
            if (errors.length > 0) {
                message.error(errors[0]);
                return;
            }

            const operationData = {
                ...values,
                tourDetailsId: tourDetails.id
            };

            const response = await createTourOperation(operationData, token);
            if (response.success && response.data) {
                setOperation(response.data);
                setEditing(false);
                message.success('Tạo tour operation thành công');

                if (onOperationCreate) {
                    onOperationCreate(response.data);
                }
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: Partial<CreateTourOperationRequest>) => {
        if (!operation) return;

        try {
            setLoading(true);
            
            // Validate
            const errors = validateTourOperation(values);
            if (errors.length > 0) {
                message.error(errors[0]);
                return;
            }

            const response = await updateTourOperation(operation.id, values, token);
            if (response.success && response.data) {
                setOperation(response.data);
                setEditing(false);
                message.success('Cập nhật tour operation thành công');

                if (onOperationUpdate) {
                    onOperationUpdate(response.data);
                }
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (values: any) => {
        if (operation) {
            handleUpdate(values);
        } else {
            handleCreate(values);
        }
    };

    const getCapacityStatus = () => {
        if (!capacityInfo) return 'normal';
        
        const utilizationRate = (capacityInfo.bookedSeats / capacityInfo.maxSeats) * 100;
        
        if (utilizationRate >= 100) return 'exception';
        if (utilizationRate >= 80) return 'active';
        return 'normal';
    };

    const getCapacityColor = () => {
        const status = getCapacityStatus();
        switch (status) {
            case 'exception': return '#ff4d4f';
            case 'active': return '#faad14';
            default: return '#52c41a';
        }
    };

    return (
        <Card title="Tour Operation Management" loading={loading}>
            {operation ? (
                <div>
                    {/* Operation Info */}
                    <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Giá tour">
                            <Space>
                                <DollarOutlined />
                                {operation.price.toLocaleString('vi-VN')} VNĐ
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số ghế tối đa">
                            <Space>
                                <TeamOutlined />
                                {operation.maxSeats} ghế
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Hướng dẫn viên">
                            <Space>
                                <UserOutlined />
                                {operation.guideName || 'Chưa phân công'}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={operation.isActive ? 'green' : 'red'}>
                                {operation.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Capacity Statistics */}
                    {capacityInfo && (
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Ghế đã đặt"
                                        value={capacityInfo.bookedSeats}
                                        suffix={`/ ${capacityInfo.maxSeats}`}
                                        valueStyle={{ color: getCapacityColor() }}
                                        prefix={<TeamOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Ghế còn lại"
                                        value={capacityInfo.availableSeats}
                                        valueStyle={{ color: capacityInfo.availableSeats > 0 ? '#52c41a' : '#ff4d4f' }}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ marginBottom: 8 }}>Tỷ lệ lấp đầy</div>
                                        <Progress
                                            type="circle"
                                            percent={Math.round((capacityInfo.bookedSeats / capacityInfo.maxSeats) * 100)}
                                            status={getCapacityStatus()}
                                            size={80}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Capacity Alert */}
                    {capacityInfo?.isFullyBooked && (
                        <Alert
                            message="Tour đã đầy"
                            description="Tour này đã đạt số lượng khách tối đa. Không thể nhận thêm booking."
                            type="warning"
                            icon={<ExclamationCircleOutlined />}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {/* Edit Form */}
                    {editing && (
                        <Card title="Chỉnh sửa Operation" style={{ marginTop: 16 }}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                initialValues={{
                                    price: operation.price,
                                    maxSeats: operation.maxSeats,
                                    guideId: operation.guideId
                                }}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="price"
                                            label="Giá tour (VNĐ)"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập giá tour' },
                                                { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0' }
                                            ]}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                                placeholder="Nhập giá tour"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="maxSeats"
                                            label="Số ghế tối đa"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập số ghế' },
                                                { type: 'number', min: 1, max: 100, message: 'Số ghế phải từ 1 đến 100' }
                                            ]}
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={1}
                                                max={100}
                                                placeholder="Nhập số ghế tối đa"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item>
                                    <Space>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Cập nhật
                                        </Button>
                                        <Button onClick={() => setEditing(false)}>
                                            Hủy
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    {!editing && (
                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                            <Button type="primary" onClick={() => setEditing(true)}>
                                Chỉnh sửa
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                // Create New Operation
                <div>
                    <Alert
                        message="Chưa có Tour Operation"
                        description="Tạo tour operation để quản lý giá, số ghế và hướng dẫn viên cho tour này."
                        type="info"
                        style={{ marginBottom: 16 }}
                    />

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            price: 0,
                            maxSeats: 20
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="price"
                                    label="Giá tour (VNĐ)"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập giá tour' },
                                        { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0' }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="Nhập giá tour"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="maxSeats"
                                    label="Số ghế tối đa"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số ghế' },
                                        { type: 'number', min: 1, max: 100, message: 'Số ghế phải từ 1 đến 100' }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={1}
                                        max={100}
                                        placeholder="Nhập số ghế tối đa"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Tạo Tour Operation
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Card>
    );
};

export default TourOperationManagement;
