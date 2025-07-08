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
    Alert,
    Spin
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    ClockCircleOutlined,
    UserOutlined,
    ShopOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useTourTemplateStore } from '../../store/useTourTemplateStore';
import {
    createTourDetails,
    createTourOperation,
    createTimelineItems,
    handleApiError
} from '../../services/tourcompanyService';
import {
    TourTemplate,
    SpecialtyShop,
    CreateTourDetailsRequest,
    CreateTourOperationRequest,
    CreateTimelineItemRequest
} from '../../types/tour';
import SkillsSelector from '../common/SkillsSelector';
import skillsService from '../../services/skillsService';


const { Option } = Select;
const { TextArea } = Input;


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
        selectedSkills: string[]; // Array of selected skill english names
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
    const {
        getTemplates,
        getShops,
        getGuides,
        templatesLoading,
        templatesCache,
        shopsCache
    } = useTourTemplateStore();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    console.log('🧙‍♂️ Wizard render - visible:', visible, 'token:', token ? 'present' : 'missing');

    // Data states - now using cached data
    const [templates, setTemplates] = useState<TourTemplate[]>(templatesCache?.data || []);
    const [specialtyShops, setSpecialtyShops] = useState<SpecialtyShop[]>(shopsCache?.data || []);

    
    // Wizard data
    const [wizardData, setWizardData] = useState<WizardData>({
        basicInfo: {
            tourTemplateId: '',
            title: '',
            description: '',
            skillsRequired: '',
            selectedSkills: []
        },
        timeline: [],
        operation: {
            price: 1,
            maxSeats: 10
        }
    });

    // Timeline editing state

    const [timelineForm] = Form.useForm();

    // Update local state when cache changes
    useEffect(() => {
        if (templatesCache?.data) {
            setTemplates(templatesCache.data);
        }
    }, [templatesCache]);

    useEffect(() => {
        if (shopsCache?.data) {
            setSpecialtyShops(shopsCache.data);
        }
    }, [shopsCache]);



    useEffect(() => {
        console.log('🧙‍♂️ Wizard visibility changed:', visible);
        if (visible && token) {
            console.log('🧙‍♂️ Loading wizard data...');
            loadInitialData();
        }
    }, [visible, token]);

    const loadInitialData = async () => {
        try {
            console.log('🔄 Loading wizard data from cache/API...');

            // Use cached data or fetch fresh data
            const [templatesData, shopsData, guidesData] = await Promise.all([
                getTemplates({ pageIndex: 0, pageSize: 10000000, includeInactive: false }, token ?? undefined),
                getShops(false, token ?? undefined),
                getGuides(false, token ?? undefined)
            ]);

            console.log('🔍 Wizard - Templates loaded:', templatesData.length);
            console.log('🔍 Wizard - Shops loaded:', shopsData.length);
            console.log('🔍 Wizard - Guides loaded:', guidesData.length);

            // Update local state
            setTemplates(templatesData);
            setSpecialtyShops(shopsData);


        } catch (error) {
            console.error('❌ Error loading wizard data:', error);
            message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
        }
    };

    const handleStepNext = async () => {
        try {
            // Custom validation for skills selection in step 0
            if (currentStep === 0) {
                if (wizardData.basicInfo.selectedSkills.length === 0) {
                    message.error('Vui lòng chọn ít nhất một kỹ năng yêu cầu');
                    return;
                }
            }

            await form.validateFields();
            const values = form.getFieldsValue();

            // Save current step data
            if (currentStep === 0) {
                // Convert selectedSkills array to skillsRequired string
                const skillsString = skillsService.createSkillsString(wizardData.basicInfo.selectedSkills);

                setWizardData(prev => ({
                    ...prev,
                    basicInfo: {
                        ...values,
                        skillsRequired: skillsString,
                        selectedSkills: prev.basicInfo.selectedSkills
                    }
                }));
            } else if (currentStep === 2) {
                // Save operation values and pass them directly to avoid state timing issues
                const updatedWizardData = {
                    ...wizardData,
                    operation: values
                };
                setWizardData(updatedWizardData);

                // Pass the updated data directly to avoid React state timing issues
                await handleCreateTourDetails(updatedWizardData);
                return;
            }

            if (currentStep < 2) {
                setCurrentStep(currentStep + 1);
                form.resetFields();
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleStepPrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCreateTourDetails = async (dataToUse?: WizardData) => {
        const currentWizardData = dataToUse || wizardData;
        console.log('🚀 handleCreateTourDetails started');
        console.log('🚀 wizardData:', currentWizardData);

        if (!token) {
            message.error('Vui lòng đăng nhập lại');
            return;
        }

        try {
            setLoading(true);

            // Step 1: Create TourDetails
            const tourDetailsRequest: CreateTourDetailsRequest = {
                ...currentWizardData.basicInfo
            };
            console.log('🚀 TourDetails request:', tourDetailsRequest);

            const tourDetailsRes = await createTourDetails(tourDetailsRequest, token);
            console.log('🚀 TourDetails response:', tourDetailsRes);

            if (!(tourDetailsRes as any).success || !tourDetailsRes.data) {
                throw new Error(tourDetailsRes.message || 'Có lỗi xảy ra');
            }

            const tourDetailsId = tourDetailsRes.data.id;
            console.log('🚀 TourDetails created with ID:', tourDetailsId);

            // Step 2: Create Timeline Items
            console.log('🔄 Timeline data:', currentWizardData.timeline);
            if (currentWizardData.timeline.length > 0) {
                console.log('🔄 Creating timeline items...');
                const timelineRequest = {
                    tourDetailsId,
                    timelineItems: currentWizardData.timeline.map((item, index) => ({
                        checkInTime: item.checkInTime,
                        activity: item.activity,
                        specialtyShopId: item.specialtyShopId || null,
                        sortOrder: index + 1
                    }))
                };
                console.log('🔄 Timeline request:', timelineRequest);
                await createTimelineItems(timelineRequest, token);
                console.log('✅ Timeline items created');
            } else {
                console.log('⚠️ No timeline items to create');
            }

            // Step 3: Create TourOperation
            console.log('🔄 Operation data:', currentWizardData.operation);
            const operationRequest: CreateTourOperationRequest = {
                tourDetailsId,
                ...currentWizardData.operation
            };
            console.log('🔄 Operation request:', operationRequest);
            await createTourOperation(operationRequest, token);
            console.log('✅ TourOperation created');

            message.success('Tạo TourDetails và TourOperation thành công!');
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
                skillsRequired: '',
                selectedSkills: []
            },
            timeline: [],
            operation: {
                price: 1,
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
                sortOrder: wizardData.timeline.length + 1,
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
                    placeholder={templatesLoading ? "Đang tải templates..." : "Chọn template tour"}
                    loading={templatesLoading}
                    notFoundContent={templatesLoading ? <Spin size="small" /> : "Không có dữ liệu"}
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
                label="Kỹ năng yêu cầu"
                required
                style={{ marginBottom: 0 }}
            >
                <SkillsSelector
                    selectedSkills={wizardData.basicInfo.selectedSkills}
                    onSkillsChange={(skills) => {
                        setWizardData(prev => ({
                            ...prev,
                            basicInfo: {
                                ...prev.basicInfo,
                                selectedSkills: skills
                            }
                        }));
                    }}
                    required={true}
                    placeholder="Chọn kỹ năng yêu cầu cho hướng dẫn viên..."
                    allowMultiple={true}
                    showCategories={true}
                    size="middle"
                />
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
                    rowKey={(_record, index) => index || 0}
                    columns={[
                        {
                            title: 'Thứ tự',
                            dataIndex: 'orderIndex',
                            width: 80,
                            render: (_value, _record, index) => (
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
                            render: (_, _record, index) => (
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
                message="Cấu hình vận hành"
                description="Thiết lập thông tin vận hành cho tour. Hướng dẫn viên sẽ được mời tự động sau khi admin duyệt."
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
                                    { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                                    placeholder="500,000"
                                    min={1}
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

                <Card title="Hướng dẫn viên">
                    <Alert
                        message="Hệ thống tự động mời hướng dẫn viên"
                        description="Sau khi admin duyệt TourDetails, hệ thống sẽ tự động mời hướng dẫn viên phù hợp. Bạn có thể chọn hướng dẫn viên khác nếu invite không được chấp nhận sau 1 ngày."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                        name="description"
                        label="Mô tả vận hành (Tùy chọn)"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Mô tả thêm về cách vận hành tour này..."
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
                    console.log('🧙‍♂️ Modal opened - data should already be cached');
                    // Data should already be preloaded and cached
                    // Only load if we don't have any data at all
                    if (templates.length === 0) {
                        console.log('🔄 No templates found, loading data...');
                        loadInitialData();
                    }
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
