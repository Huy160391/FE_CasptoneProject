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
    Alert,
    Tabs,
    Upload,
    Image
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ApiOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    BarChartOutlined,
    RocketOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { usePreloadWizardData } from '../../hooks/usePreloadWizardData';
import {
    getTourDetailsList,
    createTourDetails,
    updateTourDetails,
    deleteTourDetails,
    getTourTemplates,
    activatePublicTourDetails,
    handleApiError
} from '../../services/tourcompanyService';
import publicService from '../../services/publicService';
import TourDetailsWizard from '../../components/tourcompany/TourDetailsWizard';
import TourDetailsModal from '../../components/tourcompany/TourDetailsModal';
import {
    TourDetails,
    CreateTourDetailsRequest,
    TourTemplate,
    TourDetailsStatus
} from '../../types/tour';

import {
    getTourDetailsStatusLabel,
    getStatusColor
} from '../../constants/tourTemplate';
import ApiTester from '../../components/debug/ApiTester';
import CacheStatus from '../../components/debug/CacheStatus';
import WizardTemplatesTester from '../../components/debug/WizardTemplatesTester';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const TourDetailsManagement: React.FC = () => {
    const { token } = useAuthStore();

    // Preload wizard data when component mounts
    const { isPreloaded, templatesCount, shopsCount, guidesCount } = usePreloadWizardData();

    const [tourDetailsList, setTourDetailsList] = useState<TourDetails[]>([]);
    const [templates, setTemplates] = useState<TourTemplate[]>([]);

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [wizardVisible, setWizardVisible] = useState(false);

    const [editingDetails, setEditingDetails] = useState<TourDetails | null>(null);
    const [selectedTourDetailsId, setSelectedTourDetailsId] = useState<string | null>(null);
    const [modalInitialTab, setModalInitialTab] = useState('details');

    const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [apiError, setApiError] = useState<string>('');
    const [activeTab, setActiveTab] = useState('tours');
    const [form] = Form.useForm();

    // Image upload states
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
    const [imageUploading, setImageUploading] = useState(false);


    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Log preload status
    useEffect(() => {
        if (isPreloaded) {
            console.log('✅ Wizard data preloaded:', {
                templates: templatesCount,
                shops: shopsCount,
                guides: guidesCount
            });
        }
    }, [isPreloaded, templatesCount, shopsCount, guidesCount]);

    // Load data
    useEffect(() => {
        checkApiAndLoadData();
    }, []);

    const checkApiAndLoadData = async () => {
        try {
            setApiStatus('checking');
            await loadTourDetailsList();
            await loadTemplates();

            setApiStatus('connected');
        } catch (error) {
            setApiStatus('error');
            setApiError(handleApiError(error));
        }
    };

    const loadTourDetailsList = async (page?: number, size?: number) => {
        try {
            setLoading(true);
            const pageIndex = (page || currentPage) - 1; // Convert to 0-based index
            const pageSizeToUse = size || pageSize;

            const response = await getTourDetailsList({
                pageIndex,
                pageSize: pageSizeToUse,
                includeInactive: false
            }, token ?? undefined);

            console.log('📊 TourDetails API Response:', response);

            // Backend trả về ResponseGetTourDetailsPaginatedDto
            if (response.success && response.data) {
                setTourDetailsList(response.data);
                setTotalCount(response.totalCount || 0);

                // Log thêm thông tin pagination từ backend
                console.log('📄 Pagination Info:', {
                    pageIndex: response.pageIndex,
                    pageSize: response.pageSize,
                    totalPages: response.totalPages,
                    totalCount: response.totalCount
                });
            } else {
                console.error('❌ API Error:', response.message);
                message.error(response.message || 'Không thể tải danh sách tour details');
            }
        } catch (error) {
            console.error('❌ Load TourDetails Error:', error);
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            console.log('🔍 Loading templates with token:', token ? 'Present' : 'Missing');
            const response = await getTourTemplates({}, token ?? undefined);
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
            let templateItems: TourTemplate[] = [];

            if (response.statusCode === 200 && response.data) {
                // Format 1: Direct data array
                if (Array.isArray(response.data)) {
                    templateItems = response.data;
                    console.log('✅ Format 1: Direct array, templates:', templateItems.length);
                }
                // Backend should return direct array, but handle legacy formats
                else {
                    console.warn('⚠️ Unexpected response format, trying fallback:', response.data);
                    templateItems = [];
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





    const handleCreate = () => {
        setEditingDetails(null);
        setModalVisible(true);
        form.resetFields();
        // Reset image upload states
        setUploadedImageUrl('');
        setImageUploading(false);
    };



    const handleWizardSuccess = () => {
        loadTourDetailsList();
    };

    // Pagination handlers
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size && size !== pageSize) {
            setPageSize(size);
        }
        loadTourDetailsList(page, size);
    };

    const handlePageSizeChange = (_current: number, size: number) => {
        setCurrentPage(1); // Reset to first page when changing page size
        setPageSize(size);
        loadTourDetailsList(1, size);
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
            const response = await deleteTourDetails(id, token ?? undefined);
            if (response.success) {
                message.success('Xóa tour details thành công');
                loadTourDetailsList();
            }
        } catch (error) {
            message.error(handleApiError(error));
        }
    };

    const handleViewDetails = (record: TourDetails) => {
        setSelectedTourDetailsId(record.id);
        setModalInitialTab('details');
        // Don't set detailModalVisible - use TourDetailsModal instead
    };

    const handleCreateOperation = (record: TourDetails) => {
        setSelectedTourDetailsId(record.id);
        setModalInitialTab('operation');
        setModalVisible(true);
    };

    // Image upload handler
    const handleImageUpload = async (file: File): Promise<boolean> => {
        try {
            setImageUploading(true);
            const imageUrl = await publicService.uploadImage(file);

            if (imageUrl) {
                setUploadedImageUrl(imageUrl);
                // Update form field
                form.setFieldsValue({ imageUrl: imageUrl });
                message.success('Tải ảnh thành công');
                return true;
            } else {
                message.error('Tải ảnh thất bại');
                return false;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            message.error('Có lỗi xảy ra khi tải ảnh');
            return false;
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (values: CreateTourDetailsRequest) => {
        try {
            setLoading(true);
            let response;
            
            if (editingDetails) {
                response = await updateTourDetails(editingDetails.id, values, token ?? undefined);
            } else {
                response = await createTourDetails(values, token ?? undefined);
            }

            if (response.success) {
                message.success(
                    editingDetails
                        ? 'Cập nhật tour details thành công'
                        : `Tạo tour details thành công${response.data ? ` và đã clone ${(response.data as any).assignedSlots?.length || 0} slots` : ''}`
                );
                setModalVisible(false);
                // Reset image upload states
                setUploadedImageUrl('');
                setImageUploading(false);
                loadTourDetailsList();
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleActivatePublic = async (tourDetailsId: string) => {
        try {
            setLoading(true);
            const response = await activatePublicTourDetails(tourDetailsId, token ?? undefined);

            if (response.success) {
                message.success('Đã kích hoạt public cho TourDetails thành công! Khách hàng có thể booking tour này.');
                loadTourDetailsList(); // Reload để cập nhật status
            } else {
                message.error(response.message || 'Không thể kích hoạt public');
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
            render: (_: any, record: TourDetails) => (
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
                    <Button
                        type="link"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleCreateOperation(record)}
                        style={{ color: '#52c41a' }}
                    >
                        Vận hành
                    </Button>
                    {record.status === TourDetailsStatus.WaitToPublic && (
                        <Popconfirm
                            title="Kích hoạt public cho TourDetails này?"
                            description="Sau khi kích hoạt, khách hàng có thể booking tour này."
                            onConfirm={() => handleActivatePublic(record.id)}
                            okText="Kích hoạt"
                            cancelText="Hủy"
                        >
                            <Button
                                type="link"
                                icon={<RocketOutlined />}
                                style={{ color: '#1890ff' }}
                            >
                                Kích hoạt Public
                            </Button>
                        </Popconfirm>
                    )}
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
                                current: currentPage,
                                pageSize: pageSize,
                                total: totalCount,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tours`,
                                onChange: handlePageChange,
                                onShowSizeChange: handlePageSizeChange,
                                pageSizeOptions: ['10', '20', '50', '100'],
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

                    <TabPane
                        tab={
                            <span>
                                <BarChartOutlined />
                                Cache Status
                            </span>
                        }
                        key="cache-status"
                    >
                        <CacheStatus />
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <ExclamationCircleOutlined />
                                Wizard Templates Test
                            </span>
                        }
                        key="wizard-test"
                    >
                        <WizardTemplatesTester />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingDetails ? 'Cập nhật Tour Details' : 'Tạo Tour Details'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setUploadedImageUrl('');
                    setImageUploading(false);
                }}
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

                    {/* Image Upload Section */}
                    <Form.Item
                        name="imageUrl"
                        label="Hình ảnh tour (tùy chọn)"
                        style={{ marginBottom: 16 }}
                    >
                        <div>
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    handleImageUpload(file);
                                    return false; // Prevent default upload
                                }}
                                disabled={imageUploading}
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    loading={imageUploading}
                                    disabled={imageUploading}
                                >
                                    {imageUploading ? 'Đang tải ảnh...' : 'Chọn ảnh'}
                                </Button>
                            </Upload>

                            {uploadedImageUrl && (
                                <div style={{ marginTop: 8 }}>
                                    <Image
                                        width={200}
                                        height={150}
                                        src={uploadedImageUrl}
                                        style={{ objectFit: 'cover', borderRadius: 8 }}
                                        preview={{
                                            mask: 'Xem ảnh'
                                        }}
                                    />
                                    <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                                        Ảnh đã được tải lên thành công
                                    </div>
                                </div>
                            )}
                        </div>
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
                            <Button onClick={() => {
                                setModalVisible(false);
                                setUploadedImageUrl('');
                                setImageUploading(false);
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>



            {/* Tour Details Wizard */}
            <TourDetailsWizard
                visible={wizardVisible}
                onCancel={() => setWizardVisible(false)}
                onSuccess={handleWizardSuccess}
            />

            <TourDetailsModal
                visible={!!selectedTourDetailsId}
                tourDetailsId={selectedTourDetailsId}
                initialTab={modalInitialTab}
                onClose={() => {
                    setSelectedTourDetailsId(null);
                    setModalInitialTab('details');
                }}
                onUpdate={loadTourDetailsList}
            />
        </div>
    );
};

export default TourDetailsManagement;
