import React, { useState, useEffect } from 'react';
import { TourTemplate } from '../../types';
import { getTourTemplates } from '../../services/tourcompanyService';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Upload,
    Space,
    Tag,
    Popconfirm,
    message,
    Typography,
    Card,
    Row,
    Col,
    Checkbox,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined
} from '@ant-design/icons';
import './TourTemplateManagement.scss';

const { Title } = Typography;
const { Option } = Select;

const TourTemplateManagement: React.FC = () => {
    const [templates, setTemplates] = useState<TourTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TourTemplate | null>(null);
    const [form] = Form.useForm(); const [searchText, setSearchText] = useState('');

    const columns = [
        {
            title: 'Tên template',
            dataIndex: 'title',
            key: 'title',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: any, record: TourTemplate) =>
                record.title.toLowerCase().includes(value.toString().toLowerCase()) ||
                record.templateType.toLowerCase().includes(value.toString().toLowerCase()),
        },
        {
            title: 'Loại tour',
            dataIndex: 'templateType',
            key: 'templateType',
            render: (templateType: string) => <Tag color="blue">{templateType}</Tag>
        },
        {
            title: 'Điểm bắt đầu',
            dataIndex: 'startLocation',
            key: 'startLocation',
        },
        {
            title: 'Điểm kết thúc',
            dataIndex: 'endLocation',
            key: 'endLocation',
        },
        {
            title: 'Tháng',
            dataIndex: 'month',
            key: 'month',
            render: (month: number) => `Tháng ${month}`
        },
        {
            title: 'Năm',
            dataIndex: 'year',
            key: 'year',
        },
        {
            title: 'Kích hoạt',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => isActive ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: TourTemplate) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => handleCreateTour(record)}
                    >
                        Tạo tour
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa template này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                // TODO: Lấy token từ localStorage hoặc context nếu cần
                const token = localStorage.getItem('token') || undefined;
                const res = await getTourTemplates({}, token);
                setTemplates(res.data || []);
            } catch (err) {
                message.error('Không thể tải danh sách template');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleAdd = () => {
        setEditingTemplate(null);
        form.resetFields();
        setIsModalVisible(true);
    }; const handleEdit = (template: TourTemplate) => {
        setEditingTemplate(template);
        form.setFieldsValue({
            ...template
        });
        setIsModalVisible(true);
    }; const handleView = (template: TourTemplate) => {
        Modal.info({
            title: template.title,
            width: 800,
            content: (
                <div className="template-view">
                    <p><strong>Điểm bắt đầu:</strong> {template.startLocation}</p>
                    <p><strong>Điểm kết thúc:</strong> {template.endLocation}</p>
                    <p><strong>Loại tour:</strong> {template.templateType}</p>
                    <p><strong>Tháng:</strong> {template.month}</p>
                    <p><strong>Năm:</strong> {template.year}</p>
                    <p><strong>Trạng thái:</strong> {template.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</p>
                </div>
            ),
        });
    };

    const handleDelete = (id: string) => {
        setTemplates(templates.filter(t => t.id !== id));
        message.success('Xóa template thành công');
    }; const handleModalOk = () => {
        form.validateFields().then(values => {
            const processedValues = {
                ...values,
                images: values.images ? values.images.map((file: any) => file.url || file.name) : []
            };

            if (editingTemplate) {
                // Update existing template
                setTemplates(templates.map(t =>
                    t.id === editingTemplate.id ? { ...t, ...processedValues } : t
                ));
                message.success('Cập nhật template thành công');
            } else {
                // Add new template
                const newTemplate: TourTemplate = {
                    id: Date.now().toString(),
                    ...processedValues,
                    createdAt: new Date().toISOString().split('T')[0],
                    usageCount: 0
                };
                setTemplates([...templates, newTemplate]);
                message.success('Thêm template thành công');
            }
            setIsModalVisible(false);
            form.resetFields();
        }).catch(error => {
            console.error('Validation failed:', error);
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    // Thêm hàm xử lý tạo tour từ template
    const handleCreateTour = (template: TourTemplate) => {
        // TODO: Mở modal tạo tour, hoặc chuyển sang trang tạo tour với template đã chọn
        message.info(`Tạo tour từ template: ${template.title}`);
    };

    return (
        <div className="tour-template-management">
            <div className="page-header">
                <Title level={2}>Quản lý Tour Template</Title>
                <div className="header-actions">
                    <Input
                        placeholder="Tìm kiếm theo tên, danh mục"
                        prefix={<SearchOutlined />}
                        onChange={e => handleSearch(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Thêm Template
                    </Button>
                </div>
            </div>

            <Card>
                <Table
                    dataSource={templates}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </Card>

            <Modal
                title={editingTemplate ? 'Sửa Template' : 'Thêm Template Mới'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingTemplate ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={1000}
            >                <Form
                form={form}
                layout="vertical"
                initialValues={{
                    tourType: 'Núi non',
                    availableDays: ['saturday', 'sunday'],
                    availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    availableTourDates: []
                }}
            >
                    {/* Thông tin cơ bản */}
                    <Divider orientation="left">Thông tin cơ bản</Divider>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="title"
                                label="Tên template"
                                rules={[{ required: true, message: 'Vui lòng nhập tên template' }]}
                            >
                                <Input placeholder="Nhập tên template tour" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startLocation"
                                label="Điểm bắt đầu"
                                rules={[{ required: true, message: 'Vui lòng nhập điểm bắt đầu' }]}
                            >
                                <Input placeholder="VD: TP. Hồ Chí Minh" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endLocation"
                                label="Điểm kết thúc"
                                rules={[{ required: true, message: 'Vui lòng nhập điểm kết thúc' }]}
                            >
                                <Input placeholder="VD: Núi Bà Đen, Tây Ninh" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="templateType"
                                label="Loại tour"
                                rules={[{ required: true, message: 'Vui lòng chọn loại tour' }]}
                            >
                                <Select placeholder="Chọn loại tour">
                                    <Option value="Núi non">Núi non</Option>
                                    <Option value="Tâm linh">Tâm linh</Option>
                                    <Option value="Văn hóa">Văn hóa</Option>
                                    <Option value="Sinh thái">Sinh thái</Option>
                                    <Option value="Lịch sử">Lịch sử</Option>
                                    <Option value="Du lịch trải nghiệm">Du lịch trải nghiệm</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Thời gian có sẵn */}
                    <Divider orientation="left">Thời gian có sẵn</Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="availableDays"
                                label="Thứ trong tuần"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thứ' }]}
                            >
                                <Checkbox.Group
                                    options={[
                                        { label: 'Thứ 7', value: 'saturday' },
                                        { label: 'Chủ nhật', value: 'sunday' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="availableMonths"
                                label="Tháng trong năm"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 tháng' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn tháng trong năm"
                                    style={{ width: '100%' }}
                                >
                                    {[
                                        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
                                        'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
                                        'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
                                    ].map((month, index) => (
                                        <Option key={index + 1} value={index + 1}>
                                            {month}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="availableYears"
                                label="Năm"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 năm' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn năm"
                                    style={{ width: '100%' }}
                                >
                                    {[2024, 2025, 2026, 2027, 2028].map(year => (
                                        <Option key={year} value={year}>{year}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Hình ảnh */}
                    <Divider orientation="left">Hình ảnh</Divider>                    <Form.Item
                        name="images"
                        label="Hình ảnh tour"
                        rules={[{ required: true, message: 'Vui lòng tải lên ít nhất 1 hình ảnh' }]}
                    >
                        <Upload
                            listType="picture-card"
                            multiple
                            maxCount={10}
                            beforeUpload={() => false}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Tải ảnh</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TourTemplateManagement;
