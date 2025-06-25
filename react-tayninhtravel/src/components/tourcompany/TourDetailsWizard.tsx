import React, { useState, useEffect } from 'react';
import {
    Modal,
    Steps,
    Form,
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    TimePicker,
    InputNumber,
    Table,
    Space,
    message,
    Divider,
    Tag,
    Alert
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ClockCircleOutlined,
    UserOutlined,
    ShopOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    getTourTemplates,
    getSpecialtyShops,
    getTourGuides,
    createTourDetails,
    createTourOperation,
    createTimelineItems,
    handleApiError
} from '../../services/tourcompanyService';
import {
    TourTemplate,
    SpecialtyShop,
    TourGuide,
    CreateTourDetailsRequest,
    CreateTourOperationRequest,
    CreateTimelineItemRequest
} from '../../types/tour';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface TourDetailsWizardProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

interface WizardData {
    // Step 1: Basic Info
    basicInfo: {
        tourTemplateId: string;
        title: string;
        description: string;
        skillsRequired: string;
    };
    // Step 2: Timeline
    timeline: CreateTimelineItemRequest[];
    // Step 3: Operation
    operation: {
        guideId?: string;
        price: number;
        maxSeats: number;
        description?: string;
        notes?: string;
    };
}

const TourDetailsWizard: React.FC<TourDetailsWizardProps> = ({
    visible,
    onCancel,
    onSuccess
}) => {
    const { token } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    console.log('🧙‍♂️ Wizard render - visible:', visible, 'token:', token ? 'present' : 'missing');
    
    // Data states
    const [templates, setTemplates] = useState<TourTemplate[]>([]);
    const [specialtyShops, setSpecialtyShops] = useState<SpecialtyShop[]>([]);
    const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
    
    // Wizard data
    const [wizardData, setWizardData] = useState<WizardData>({
        basicInfo: {
            tourTemplateId: '',
            title: '',
            description: '',
            skillsRequired: ''
        },
        timeline: [],
        operation: {
            price: 0,
            maxSeats: 10
        }
    });

    // Timeline editing state
    const [editingTimelineItem, setEditingTimelineItem] = useState<CreateTimelineItemRequest | null>(null);
    const [timelineForm] = Form.useForm();

    useEffect(() => {
        console.log('🧙‍♂️ Wizard visibility changed:', visible);
        if (visible && token) {
            console.log('🧙‍♂️ Loading wizard data...');
            console.log('🧙‍♂️ Token available:', !!token);
            console.log('🧙‍♂️ Templates state before load:', templates.length);
            // Force reload data when wizard opens
            setTemplates([]);
            setSpecialtyShops([]);
            setTourGuides([]);
            loadInitialData();
        }
    }, [visible]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [templatesRes, shopsRes, guidesRes] = await Promise.all([
                getTourTemplates({ pageIndex: 1, pageSize: 100 }, token),
                getSpecialtyShops(false, token),
                getTourGuides(false, token)
            ]);

            console.log('🔍 Wizard - Templates response:', templatesRes);
            console.log('🔍 Wizard - Shops response:', shopsRes);
            console.log('🔍 Wizard - Guides response:', guidesRes);

            // Handle templates response (GetTourTemplatesResponse format)
            if (templatesRes && templatesRes.statusCode === 200 && templatesRes.data) {
                console.log('✅ Setting templates:', templatesRes.data);
                setTemplates(templatesRes.data);
            } else {
                console.log('❌ Templates response invalid:', templatesRes);
            }

            // Handle shops response (ApiResponse format)
            if (shopsRes.isSuccess && shopsRes.data) {
                console.log('✅ Setting shops:', shopsRes.data);
                setSpecialtyShops(shopsRes.data);
            } else {
                console.log('❌ Shops response invalid:', shopsRes);
            }

            // Handle guides response (ApiResponse format)
            if (guidesRes.isSuccess && guidesRes.data) {
                console.log('✅ Setting guides:', guidesRes.data);
                setTourGuides(guidesRes.data);
            } else {
                console.log('❌ Guides response invalid:', guidesRes);
            }

        } catch (error) {
            console.error('❌ Error loading wizard data:', error);
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleStepNext = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();

            // Save current step data
            if (currentStep === 0) {
                setWizardData(prev => ({
                    ...prev,
                    basicInfo: values
                }));
            } else if (currentStep === 2) {
                setWizardData(prev => ({
                    ...prev,
                    operation: values
                }));
            }

            if (currentStep < 2) {
                setCurrentStep(currentStep + 1);
                form.resetFields();
            } else {
                // Final step - create everything
                await handleCreateTourDetails();
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleStepPrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCreateTourDetails = async () => {
        try {
            setLoading(true);

            // Step 1: Create TourDetails
            const tourDetailsRequest: CreateTourDetailsRequest = {
                ...wizardData.basicInfo
            };

            const tourDetailsRes = await createTourDetails(tourDetailsRequest, token);
            if (!tourDetailsRes.isSuccess || !tourDetailsRes.data) {
                throw new Error(tourDetailsRes.message);
            }

            const tourDetailsId = tourDetailsRes.data.id;

            // Step 2: Create Timeline Items
            if (wizardData.timeline.length > 0) {
                const timelinePromises = wizardData.timeline.map(item => 
                    createTimelineItems({
                        ...item,
                        tourDetailsId
                    }, token)
                );
                await Promise.all(timelinePromises);
            }

            // Step 3: Create TourOperation
            const operationRequest: CreateTourOperationRequest = {
                tourDetailsId,
                ...wizardData.operation
            };

            await createTourOperation(operationRequest, token);

            message.success('Tạo TourDetails thành công!');
            onSuccess();
            handleCancel();

        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentStep(0);
        setWizardData({
            basicInfo: {
                tourTemplateId: '',
                title: '',
                description: '',
                skillsRequired: ''
            },
            timeline: [],
            operation: {
                price: 0,
                maxSeats: 10
            }
        });
        form.resetFields();
        timelineForm.resetFields();
        onCancel();
    };

    const addTimelineItem = () => {
        timelineForm.validateFields().then(values => {
            const newItem: CreateTimelineItemRequest = {
                tourDetailsId: '', // Will be set when creating
                checkInTime: values.checkInTime.format('HH:mm'),
                activity: values.activity,
                location: values.location || '',
                specialtyShopId: values.specialtyShopId || null,
                orderIndex: wizardData.timeline.length + 1,
                estimatedDuration: values.estimatedDuration || 60
            };

            setWizardData(prev => ({
                ...prev,
                timeline: [...prev.timeline, newItem]
            }));

            timelineForm.resetFields();
            message.success('Đã thêm timeline item');
        });
    };

    const removeTimelineItem = (index: number) => {
        setWizardData(prev => ({
            ...prev,
            timeline: prev.timeline.filter((_, i) => i !== index)
        }));
    };

    const steps = [
        {
            title: 'Thông tin cơ bản',
            icon: <EditOutlined />,
        },
        {
            title: 'Timeline',
            icon: <ClockCircleOutlined />,
        },
        {
            title: 'Vận hành',
            icon: <UserOutlined />,
        }
    ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderBasicInfoStep();
            case 1:
                return renderTimelineStep();
            case 2:
                return renderOperationStep();
            default:
                return null;
        }
    };

    const renderBasicInfoStep = () => (
        <Form
            form={form}
            layout="vertical"
            initialValues={wizardData.basicInfo}
        >
            <Form.Item
                name="tourTemplateId"
                label="Template Tour"
                rules={[{ required: true, message: 'Vui lòng chọn template' }]}
            >
                <Select
                    placeholder="Chọn template tour"
                    loading={loading}
                >
                    {(() => {
                        console.log('🧙‍♂️ Rendering dropdown - templates count:', templates.length);
                        console.log('🧙‍♂️ Templates data:', templates);
                        return templates.map(template => (
                            <Option key={template.id} value={template.id}>
                                {template.title} ({template.templateType === 1 ? 'Free' : 'Paid'})
                            </Option>
                        ));
                    })()}
                </Select>
            </Form.Item>

            <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[
                    { required: true, message: 'Vui lòng nhập tiêu đề' },
                    { max: 200, message: 'Tiêu đề không được quá 200 ký tự' }
                ]}
            >
                <Input placeholder="Nhập tiêu đề tour details" />
            </Form.Item>

            <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
                <TextArea
                    rows={4}
                    placeholder="Nhập mô tả chi tiết"
                />
            </Form.Item>

            <Form.Item
                name="skillsRequired"
                label="Kỹ năng yêu cầu"
                rules={[{ required: true, message: 'Vui lòng nhập kỹ năng yêu cầu' }]}
            >
                <Input placeholder="VD: Tiếng Anh, Lịch sử địa phương" />
            </Form.Item>
        </Form>
    );

    const renderTimelineStep = () => (
        <div>
            <Alert
                message="Timeline Management"
                description="Tạo lịch trình chi tiết cho tour. Bạn có thể thêm các điểm dừng và liên kết với SpecialtyShop."
                type="info"
                style={{ marginBottom: 16 }}
            />

            {/* Add Timeline Item Form */}
            <Card title="Thêm Timeline Item" style={{ marginBottom: 16 }}>
                <Form
                    form={timelineForm}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item
                                name="checkInTime"
                                label="Thời gian"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    placeholder="Chọn giờ"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item
                                name="activity"
                                label="Hoạt động"
                                rules={[{ required: true, message: 'Vui lòng nhập hoạt động' }]}
                            >
                                <Input placeholder="VD: Khởi hành từ TP.HCM" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="location"
                                label="Địa điểm"
                            >
                                <Input placeholder="VD: Bến xe Miền Tây" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="specialtyShopId"
                                label="SpecialtyShop (Tùy chọn)"
                            >
                                <Select
                                    placeholder="Chọn cửa hàng"
                                    allowClear
                                >
                                    {specialtyShops.map(shop => (
                                        <Option key={shop.id} value={shop.id}>
                                            <Space>
                                                <ShopOutlined />
                                                {shop.shopName} - {shop.location}
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="estimatedDuration"
                                label="Thời lượng (phút)"
                            >
                                <InputNumber
                                    min={15}
                                    max={480}
                                    placeholder="60"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label=" ">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={addTimelineItem}
                                    style={{ width: '100%' }}
                                >
                                    Thêm
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Timeline Items Table */}
            <Card title={`Timeline Items (${wizardData.timeline.length})`}>
                <Table
                    dataSource={wizardData.timeline}
                    pagination={false}
                    size="small"
                    rowKey={(record, index) => index || 0}
                    columns={[
                        {
                            title: 'Thứ tự',
                            dataIndex: 'orderIndex',
                            width: 80,
                            render: (value, record, index) => (
                                <Tag color="blue">{index + 1}</Tag>
                            )
                        },
                        {
                            title: 'Thời gian',
                            dataIndex: 'checkInTime',
                            width: 100,
                            render: (time) => (
                                <Space>
                                    <ClockCircleOutlined />
                                    {time}
                                </Space>
                            )
                        },
                        {
                            title: 'Hoạt động',
                            dataIndex: 'activity',
                            ellipsis: true
                        },
                        {
                            title: 'Địa điểm',
                            dataIndex: 'location',
                            width: 150,
                            ellipsis: true
                        },
                        {
                            title: 'Shop',
                            dataIndex: 'specialtyShopId',
                            width: 120,
                            render: (shopId) => {
                                if (!shopId) return '-';
                                const shop = specialtyShops.find(s => s.id === shopId);
                                return shop ? (
                                    <Tag color="green" icon={<ShopOutlined />}>
                                        {shop.shopName}
                                    </Tag>
                                ) : '-';
                            }
                        },
                        {
                            title: 'Thời lượng',
                            dataIndex: 'estimatedDuration',
                            width: 100,
                            render: (duration) => duration ? `${duration}p` : '-'
                        },
                        {
                            title: 'Thao tác',
                            width: 80,
                            render: (_, record, index) => (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeTimelineItem(index)}
                                    size="small"
                                />
                            )
                        }
                    ]}
                />
                {wizardData.timeline.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        Chưa có timeline item nào. Hãy thêm ít nhất một hoạt động.
                    </div>
                )}
            </Card>
        </div>
    );

    const renderOperationStep = () => (
        <div>
            <Alert
                message="Operation Configuration"
                description="Cấu hình thông tin vận hành tour như giá cả, sức chứa và hướng dẫn viên."
                type="info"
                style={{ marginBottom: 16 }}
            />

            <Form
                form={form}
                layout="vertical"
                initialValues={wizardData.operation}
            >
                <Card title="Thông tin vận hành" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá tour (VNĐ)"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập giá tour' },
                                    { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="500,000"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maxSeats"
                                label="Sức chứa tối đa"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập sức chứa' },
                                    { type: 'number', min: 1, max: 50, message: 'Sức chứa từ 1-50 người' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="10"
                                    min={1}
                                    max={50}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="Hướng dẫn viên" style={{ marginBottom: 16 }}>
                    <Form.Item
                        name="guideId"
                        label="Chọn hướng dẫn viên (Tùy chọn)"
                        help="Bạn có thể chọn hướng dẫn viên ngay hoặc để trống và mời sau"
                    >
                        <Select
                            placeholder="Chọn hướng dẫn viên"
                            allowClear
                            loading={loading}
                            notFoundContent="Chưa có hướng dẫn viên nào"
                        >
                            {tourGuides.map(guide => (
                                <Option key={guide.id} value={guide.id}>
                                    <Space>
                                        <UserOutlined />
                                        {guide.fullName} - {guide.phone}
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {tourGuides.length === 0 && (
                        <Alert
                            message="Chưa có hướng dẫn viên"
                            description="Hiện tại chưa có hướng dẫn viên nào trong hệ thống. Bạn có thể tạo tour trước và mời hướng dẫn viên sau."
                            type="warning"
                            showIcon
                        />
                    )}
                </Card>

                <Card title="Thông tin bổ sung">
                    <Form.Item
                        name="description"
                        label="Mô tả vận hành"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Mô tả thêm về cách vận hành tour này..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Ghi chú"
                    >
                        <TextArea
                            rows={2}
                            placeholder="Ghi chú nội bộ cho team..."
                        />
                    </Form.Item>
                </Card>
            </Form>

            {/* Summary Card */}
            <Card title="Tóm tắt" type="inner">
                <Row gutter={16}>
                    <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', color: '#1890ff' }}>
                                {wizardData.basicInfo.title || 'Chưa có tiêu đề'}
                            </div>
                            <div style={{ color: '#666' }}>Tiêu đề tour</div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', color: '#52c41a' }}>
                                {wizardData.timeline.length}
                            </div>
                            <div style={{ color: '#666' }}>Timeline items</div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', color: '#fa8c16' }}>
                                {wizardData.operation.maxSeats || 0}
                            </div>
                            <div style={{ color: '#666' }}>Sức chứa</div>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );

    console.log('🧙‍♂️ Wizard Modal render - visible:', visible, 'templates:', templates.length);

    return (
        <Modal
            title="Tạo Tour Details"
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={null}
            afterOpenChange={(open) => {
                console.log('🧙‍♂️ Modal afterOpenChange:', open);
                if (open && token) {
                    console.log('🧙‍♂️ Force loading data after modal open...');
                    loadInitialData();
                }
            }}
        >
            <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />
            
            {renderStepContent()}

            <Divider />

            <div style={{ textAlign: 'right' }}>
                <Space>
                    {currentStep > 0 && (
                        <Button onClick={handleStepPrev}>
                            Quay lại
                        </Button>
                    )}
                    <Button onClick={handleCancel}>
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleStepNext}
                        loading={loading}
                    >
                        {currentStep === 2 ? 'Tạo Tour Details' : 'Tiếp theo'}
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

export default TourDetailsWizard;
