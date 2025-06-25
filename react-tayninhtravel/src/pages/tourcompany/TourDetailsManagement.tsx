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
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    getTourDetailsList,
    createTourDetails,
    updateTourDetails,
    deleteTourDetails,
    getTourDetailsById,
    getTourTemplates,
    handleApiError
} from '../../services/tourcompanyService';
import {
    TourDetails,
    CreateTourDetailsRequest,
    TourTemplate,
    TourDetailsStatus
} from '../../types/tour';
import {
    getTourDetailsStatusLabel,
    getStatusColor,
    TOUR_DETAILS_STATUS_LABELS
} from '../../constants/tourTemplate';
import TimelineBuilder from '../../components/tourcompany/TimelineBuilder';

const { TextArea } = Input;
const { Option } = Select;

const TourDetailsManagement: React.FC = () => {
    const { user, token } = useAuthStore();
    const [tourDetailsList, setTourDetailsList] = useState<TourDetails[]>([]);
    const [templates, setTemplates] = useState<TourTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editingDetails, setEditingDetails] = useState<TourDetails | null>(null);
    const [selectedDetails, setSelectedDetails] = useState<TourDetails | null>(null);
    const [form] = Form.useForm();

    // Load data
    useEffect(() => {
        loadTourDetailsList();
        loadTemplates();
    }, []);

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
            const response = await getTourTemplates({}, token);
            if (response.isSuccess && response.data) {
                setTemplates(response.data.items || []);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const handleCreate = () => {
        setEditingDetails(null);
        setModalVisible(true);
        form.resetFields();
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
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <h2>Quản lý Tour Details</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Tạo Tour Details
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={tourDetailsList}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} mục`,
                    }}
                />
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
                        label="Template Tour"
                        rules={[{ required: true, message: 'Vui lòng chọn template' }]}
                    >
                        <Select placeholder="Chọn template tour">
                            {templates.map(template => (
                                <Option key={template.id} value={template.id}>
                                    {template.title}
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
        </div>
    );
};

export default TourDetailsManagement;
