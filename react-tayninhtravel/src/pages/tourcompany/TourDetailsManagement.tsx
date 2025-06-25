import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Space,
    Tag,
    Popconfirm,
    Card,
    Row,
    Col,
    Descriptions,
    Timeline,
    Divider,
    Alert,
    Tabs
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    ApiOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    getTourDetailsList,
    getTourDetailsByTemplate,
    createTourDetails,
    updateTourDetails,
    deleteTourDetails,
    getTourDetailsById,
    getTourTemplates,
    getSpecialtyShops,
    createTourOperation,
    getTourOperationByDetailsId,
    handleApiError
} from '../../services/tourcompanyService';
import TourDetailsWizard from '../../components/tourcompany/TourDetailsWizard';
import {
    TourDetails,
    CreateTourDetailsRequest,
    TourTemplate,
    TourDetailsStatus,
    SpecialtyShop,
    TourOperation,
    CreateTourOperationRequest
} from '../../types/tour';
import {
    getTourDetailsStatusLabel,
    getStatusColor,
    TOUR_DETAILS_STATUS_LABELS
} from '../../constants/tourTemplate';
import TimelineBuilder from '../../components/tourcompany/TimelineBuilder';
import TourOperationManagement from '../../components/tourcompany/TourOperationManagement';
import ApiTester from '../../components/debug/ApiTester';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const TourDetailsManagement: React.FC = () => {
    const { user, token } = useAuthStore();
    const [tourDetailsList, setTourDetailsList] = useState<TourDetails[]>([]);
    const [templates, setTemplates] = useState<TourTemplate[]>([]);
    const [specialtyShops, setSpecialtyShops] = useState<SpecialtyShop[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [wizardVisible, setWizardVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [operationModalVisible, setOperationModalVisible] = useState(false);
    const [editingDetails, setEditingDetails] = useState<TourDetails | null>(null);
    const [selectedDetails, setSelectedDetails] = useState<TourDetails | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [apiError, setApiError] = useState<string>('');
    const [activeTab, setActiveTab] = useState('tours');
    const [form] = Form.useForm();
    const [operationForm] = Form.useForm();

    // Load data
    useEffect(() => {
        checkApiAndLoadData();
    }, []);

    const checkApiAndLoadData = async () => {
        try {
            setApiStatus('checking');
            await loadTourDetailsList();
            await loadTemplates();
            await loadSpecialtyShops();
            setApiStatus('connected');
        } catch (error) {
            setApiStatus('error');
            setApiError(handleApiError(error));
        }
    };

    const loadTourDetailsList = async () => {
        try {
            setLoading(true);
            const response = await getTourDetailsList({}, token);
            if (response.isSuccess && response.data) {
                setTourDetailsList(response.data.items || response.data);
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            console.log('🔍 Loading templates with token:', token ? 'Present' : 'Missing');
            const response = await getTourTemplates({}, token);
            console.log('📡 Templates API response:', response);
            console.log('📡 Response structure:', {
                hasIsSuccess: 'isSuccess' in response,
                hasData: 'data' in response,
                hasStatusCode: 'statusCode' in response,
                statusCode: response.statusCode,
                dataType: typeof response.data,
                dataIsArray: Array.isArray(response.data)
            });

            // Check multiple possible response formats
            let templateItems = [];

            if (response.statusCode === 200 && response.data) {
                // Format 1: Direct data array
                if (Array.isArray(response.data)) {
                    templateItems = response.data;
                    console.log('✅ Format 1: Direct array, templates:', templateItems.length);
                }
                // Format 2: data.items
                else if (response.data.items && Array.isArray(response.data.items)) {
                    templateItems = response.data.items;
                    console.log('✅ Format 2: data.items, templates:', templateItems.length);
                }
                // Format 3: isSuccess format
                else if (response.isSuccess && response.data) {
                    templateItems = response.data.items || response.data || [];
                    console.log('✅ Format 3: isSuccess format, templates:', templateItems.length);
                }

                setTemplates(templateItems);
                console.log('✅ Final templates set:', templateItems);
            } else {
                console.warn('⚠️ Templates API returned unsuccessful response:', response);
            }
        } catch (error) {
            console.error('❌ Error loading templates:', error);
            message.error(`Lỗi tải templates: ${handleApiError(error)}`);
        }
    };

    const loadSpecialtyShops = async () => {
        try {
            const response = await getSpecialtyShops(false, token);
            if (response.isSuccess && response.data) {
                setSpecialtyShops(response.data);
            }
        } catch (error) {
            console.error('Error loading specialty shops:', error);
        }
    };

    const loadTourDetailsByTemplate = async (templateId: string) => {
        try {
            setLoading(true);
            const response = await getTourDetailsByTemplate(templateId, false, token);
            if (response.isSuccess && response.data) {
                setTourDetailsList(response.data);
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingDetails(null);
        setModalVisible(true);
        form.resetFields();
    };

    const handleCreateWithWizard = () => {
        console.log('🧙‍♂️ Button clicked - Opening wizard...');
        console.log('🧙‍♂️ Current wizardVisible state:', wizardVisible);
        setWizardVisible(true);
        console.log('🧙‍♂️ setWizardVisible(true) called');
    };

    const handleWizardSuccess = () => {
        loadTourDetailsList();
    };

    const handleEdit = (record: TourDetails) => {
        setEditingDetails(record);
        setModalVisible(true);
        form.setFieldsValue({
            tourTemplateId: record.tourTemplateId,
            title: record.title,
            description: record.description,
            skillsRequired: record.skillsRequired
        });
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await deleteTourDetails(id, token);
            if (response.isSuccess) {
                message.success('Xóa tour details thành công');
                loadTourDetailsList();
            }
        } catch (error) {
            message.error(handleApiError(error));
        }
    };

    const handleViewDetails = async (record: TourDetails) => {
        try {
            setLoading(true);
            const response = await getTourDetailsById(record.id, token);
            if (response.isSuccess && response.data) {
                setSelectedDetails(response.data);
                setDetailModalVisible(true);
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: CreateTourDetailsRequest) => {
        try {
            setLoading(true);
            let response;
            
            if (editingDetails) {
                response = await updateTourDetails(editingDetails.id, values, token);
            } else {
                response = await createTourDetails(values, token);
            }

            if (response.isSuccess) {
                message.success(
                    editingDetails 
                        ? 'Cập nhật tour details thành công' 
                        : `Tạo tour details thành công${response.data ? ` và đã clone ${response.data.assignedSlots?.length || 0} slots` : ''}`
                );
                setModalVisible(false);
                loadTourDetailsList();
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: 'Template',
            dataIndex: ['tourTemplate', 'title'],
            key: 'templateTitle',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: TourDetailsStatus) => (
                <Tag color={getStatusColor(status)}>
                    {getTourDetailsStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record: TourDetails) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>🎯 Tour Management System</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                            Quản lý tours với TourDetails APIs mới
                        </p>
                    </div>
                    <Space>
                        {/* API Status */}
                        {apiStatus === 'checking' && <Tag icon={<ApiOutlined />} color="processing">Checking API...</Tag>}
                        {apiStatus === 'connected' && (
                            <Tag icon={<CheckCircleOutlined />} color="success">
                                API Connected ({templates.length} templates)
                            </Tag>
                        )}
                        {apiStatus === 'error' && (
                            <Tag icon={<ExclamationCircleOutlined />} color="error" title={apiError}>
                                API Error
                            </Tag>
                        )}

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                console.log('🧙‍♂️ Button clicked - Opening wizard...');
                                console.log('🧙‍♂️ Current wizardVisible state:', wizardVisible);
                                setWizardVisible(true);
                                console.log('🧙‍♂️ setWizardVisible(true) called');
                            }}
                            disabled={apiStatus !== 'connected'}
                        >
                            Tạo Tour (Wizard)
                        </Button>

                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            disabled={apiStatus !== 'connected'}
                        >
                            Tạo Tour (Đơn giản)
                        </Button>
                    </Space>
                </div>

                {apiStatus === 'error' && (
                    <Alert
                        message="API Connection Error"
                        description={`Không thể kết nối đến API: ${apiError}`}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                        action={
                            <Space>
                                <Button size="small" onClick={checkApiAndLoadData}>
                                    Retry
                                </Button>
                                <Button size="small" onClick={loadTemplates}>
                                    Test Templates API
                                </Button>
                                <Button size="small" onClick={() => console.log('Current templates state:', templates)}>
                                    Log Templates State
                                </Button>
                            </Space>
                        }
                    />
                )}

                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                    <TabPane
                        tab={
                            <span>
                                <EyeOutlined />
                                Tours List
                            </span>
                        }
                        key="tours"
                    >
                        <div>

                        <Table
                            columns={columns}
                            dataSource={tourDetailsList}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `Tổng ${total} tours`,
                            }}
                        />
                        </div>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <ApiOutlined />
                                API Tester
                            </span>
                        }
                        key="api-test"
                    >
                        <ApiTester />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingDetails ? 'Cập nhật Tour Details' : 'Tạo Tour Details'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="tourTemplateId"
                        label={`Template Tour (${templates.length} available)`}
                        rules={[{ required: true, message: 'Vui lòng chọn template' }]}
                    >
                        <Select
                            placeholder={templates.length > 0 ? "Chọn template tour" : "Đang tải templates..."}
                            loading={templates.length === 0}
                            notFoundContent={templates.length === 0 ? "Đang tải..." : "Không có template nào"}
                        >
                            {templates.map(template => (
                                <Option key={template.id} value={template.id}>
                                    {template.title} ({template.templateType === 1 ? 'Free' : 'Paid'})
                                </Option>
                            ))}
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

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingDetails ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail View Modal */}
            <Modal
                title="Chi tiết Tour Details"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedDetails && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Tiêu đề" span={2}>
                                {selectedDetails.title}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getStatusColor(selectedDetails.status)}>
                                    {getTourDetailsStatusLabel(selectedDetails.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Template">
                                {selectedDetails.tourTemplate?.title}
                            </Descriptions.Item>
                            <Descriptions.Item label="Kỹ năng yêu cầu" span={2}>
                                {selectedDetails.skillsRequired}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {selectedDetails.description}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedDetails.timeline && selectedDetails.timeline.length > 0 && (
                            <>
                                <Divider>Lịch trình</Divider>
                                <Timeline>
                                    {selectedDetails.timeline
                                        .sort((a, b) => a.sortOrder - b.sortOrder)
                                        .map(item => (
                                            <Timeline.Item
                                                key={item.id}
                                                dot={<ClockCircleOutlined />}
                                            >
                                                <div>
                                                    <strong>{item.checkInTime}</strong> - {item.activity}
                                                    {item.specialtyShop && (
                                                        <div style={{ marginTop: 4 }}>
                                                            <Tag color="blue">
                                                                {item.specialtyShop.shopName}
                                                            </Tag>
                                                        </div>
                                                    )}
                                                </div>
                                            </Timeline.Item>
                                        ))}
                                </Timeline>
                            </>
                        )}

                        {selectedDetails.assignedSlots && selectedDetails.assignedSlots.length > 0 && (
                            <>
                                <Divider>Slots được gán</Divider>
                                <Row gutter={[16, 16]}>
                                    {selectedDetails.assignedSlots.map(slot => (
                                        <Col span={8} key={slot.id}>
                                            <Card size="small">
                                                <div>Ngày: {new Date(slot.tourDate).toLocaleDateString('vi-VN')}</div>
                                                <div>Trạng thái: <Tag color={getStatusColor(slot.status)}>{slot.status}</Tag></div>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Tour Details Wizard */}
            <TourDetailsWizard
                visible={wizardVisible}
                onCancel={() => setWizardVisible(false)}
                onSuccess={handleWizardSuccess}
            />
        </div>
    );
};

export default TourDetailsManagement;
