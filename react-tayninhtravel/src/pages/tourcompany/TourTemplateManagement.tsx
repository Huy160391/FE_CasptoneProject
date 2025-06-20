import React, { useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
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
    TimePicker,
    Checkbox,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    MinusCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import './TourTemplateManagement.scss';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TourTemplate {
    id: string;
    name: string;
    startLocation: string;
    endLocation: string;
    tourType: string;
    availableDays: string[]; // ['monday', 'tuesday', etc.]
    availableDates: number[]; // [1, 2, 3, ..., 31]
    availableMonths: number[]; // [1, 2, 3, ..., 12]
    images: string[];
    itinerary: ItineraryItem[];
    ticketQuantity: number;
    description: string;
    guideInfo: string;
    createdAt: string;
    usageCount: number;
}

interface ItineraryItem {
    id: string;
    checkpoint: string; // time like "08:00"
    activity: string;
}

const TourTemplateManagement: React.FC = () => {
    const { t } = useTranslation(); const [templates, setTemplates] = useState<TourTemplate[]>([
        {
            id: '1',
            name: 'Template Tour Núi Bà Đen',
            startLocation: 'TP. Hồ Chí Minh',
            endLocation: 'Núi Bà Đen, Tây Ninh',
            tourType: 'Núi non',
            availableDays: ['saturday', 'sunday'],
            availableDates: [1, 15, 30],
            availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            images: ['/images/tours/nui-ba-den.jpg'],
            itinerary: [
                { id: '1', checkpoint: '06:00', activity: 'Tập trung tại điểm hẹn' },
                { id: '2', checkpoint: '08:00', activity: 'Khởi hành đi Núi Bà Đen' },
                { id: '3', checkpoint: '10:00', activity: 'Đi cáp treo lên đỉnh núi' },
                { id: '4', checkpoint: '12:00', activity: 'Ăn trưa tại chân núi' },
                { id: '5', checkpoint: '14:00', activity: 'Tham quan chùa Bà' },
                { id: '6', checkpoint: '16:00', activity: 'Khởi hành về TP.HCM' }
            ], ticketQuantity: 30,
            description: 'Template tour khám phá núi Bà Đen với lịch trình đầy đủ, phù hợp cho những ai yêu thích thiên nhiên và tâm linh.',
            guideInfo: 'Hướng dẫn viên có kinh nghiệm 5+ năm, thông thạo tiếng Việt và tiếng Anh. Chuyên về tour tâm linh và leo núi.',
            createdAt: '2024-01-15',
            usageCount: 12
        },
        {
            id: '2',
            name: 'Template Tour Tòa Thánh Cao Đài',
            startLocation: 'TP. Hồ Chí Minh',
            endLocation: 'Tòa Thánh Cao Đài, Tây Ninh',
            tourType: 'Tâm linh',
            availableDays: ['monday', 'wednesday', 'friday', 'sunday'],
            availableDates: [5, 10, 15, 20, 25],
            availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            images: ['/images/tours/toa-thanh-cao-dai.jpg'],
            itinerary: [
                { id: '1', checkpoint: '07:00', activity: 'Tập trung và khởi hành' },
                { id: '2', checkpoint: '09:00', activity: 'Đến Tòa Thánh Cao Đài' },
                { id: '3', checkpoint: '09:30', activity: 'Tham quan và tìm hiểu lịch sử' },
                { id: '4', checkpoint: '11:30', activity: 'Xem lễ cầu nguyện' },
                { id: '5', checkpoint: '12:30', activity: 'Ăn trưa tại địa phương' },
                { id: '6', checkpoint: '14:00', activity: 'Khởi hành về TP.HCM' }
            ], ticketQuantity: 40,
            description: 'Template tour tham quan Tòa Thánh Cao Đài, tìm hiểu về tôn giáo Cao Đài và văn hóa tín ngưỡng địa phương.',
            guideInfo: 'Hướng dẫn viên am hiểu sâu về tôn giáo Cao Đài, có thể giải thích chi tiết về lịch sử và nghi lễ.',
            createdAt: '2024-01-10',
            usageCount: 8
        }
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TourTemplate | null>(null);
    const [form] = Form.useForm(); const [searchText, setSearchText] = useState('');

    const columns = [{
        title: 'Tên template',
        dataIndex: 'name',
        key: 'name',
        filteredValue: searchText ? [searchText] : null, onFilter: (value: any, record: TourTemplate) =>
            record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
            record.tourType.toLowerCase().includes(value.toString().toLowerCase()),
    }, {
        title: 'Loại tour',
        dataIndex: 'tourType',
        key: 'tourType',
        render: (tourType: string) => <Tag color="blue">{tourType}</Tag>
    },
    {
        title: 'Tuyến đường',
        key: 'route',
        render: (_: any, record: TourTemplate) => (
            <span>{record.startLocation} → {record.endLocation}</span>
        ),
    },
    {
        title: 'Số vé',
        dataIndex: 'ticketQuantity',
        key: 'ticketQuantity',
    },
    {
        title: 'Số lần sử dụng',
        dataIndex: 'usageCount',
        key: 'usageCount',
        render: (count: number) => <Tag color="green">{count} lần</Tag>
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

    const handleAdd = () => {
        setEditingTemplate(null);
        form.resetFields();
        setIsModalVisible(true);
    }; const handleEdit = (template: TourTemplate) => {
        setEditingTemplate(template);
        form.setFieldsValue({
            ...template,
            itinerary: template.itinerary.map(item => ({
                ...item,
                checkpoint: dayjs(item.checkpoint, 'HH:mm')
            }))
        });
        setIsModalVisible(true);
    };

    const handleView = (template: TourTemplate) => {
        Modal.info({
            title: template.name,
            width: 800,
            content: (
                <div className="template-view">                    <p><strong>Điểm bắt đầu:</strong> {template.startLocation}</p>
                    <p><strong>Điểm kết thúc:</strong> {template.endLocation}</p>
                    <p><strong>Loại tour:</strong> {template.tourType}</p>
                    <p><strong>Số lượng vé:</strong> {template.ticketQuantity}</p>

                    <p><strong>Thời gian có sẵn:</strong></p>
                    <ul>
                        <li>Thứ: {template.availableDays.map(day => {
                            const dayNames: { [key: string]: string } = {
                                'monday': 'Thứ 2', 'tuesday': 'Thứ 3', 'wednesday': 'Thứ 4',
                                'thursday': 'Thứ 5', 'friday': 'Thứ 6', 'saturday': 'Thứ 7', 'sunday': 'Chủ nhật'
                            };
                            return dayNames[day];
                        }).join(', ')}</li>
                        <li>Ngày: {template.availableDates.join(', ')}</li>
                        <li>Tháng: {template.availableMonths.join(', ')}</li>
                    </ul>                    <p><strong>Lịch trình:</strong></p>
                    <ul>
                        {template.itinerary.map((item, index) => (
                            <li key={index}><strong>{item.checkpoint}:</strong> {item.activity}</li>
                        ))}
                    </ul>

                    <p><strong>Mô tả:</strong> {template.description}</p>
                    <p><strong>Thông tin hướng dẫn viên:</strong> {template.guideInfo}</p>
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
                itinerary: values.itinerary ? values.itinerary.map((item: any) => ({
                    id: item.id || Date.now().toString() + Math.random(),
                    checkpoint: item.checkpoint.format('HH:mm'),
                    activity: item.activity
                })) : [],
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

            <Card>                <Table
                dataSource={templates}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
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
                layout="vertical" initialValues={{
                    ticketQuantity: 30,
                    tourType: 'Núi non',
                    availableDays: ['saturday', 'sunday'],
                    availableDates: [1, 15],
                    availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    itinerary: [
                        { checkpoint: dayjs('08:00', 'HH:mm'), activity: 'Tập trung tại điểm hẹn' }
                    ]
                }}
            >
                    {/* Thông tin cơ bản */}
                    <Divider orientation="left">Thông tin cơ bản</Divider>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
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
                    </Row>                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="tourType"
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
                        <Col span={12}>
                            <Form.Item
                                name="ticketQuantity"
                                label="Số lượng vé"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng vé' }]}
                            >
                                <InputNumber min={1} max={200} style={{ width: '100%' }} placeholder="Số lượng vé có sẵn" />
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
                                        { label: 'Thứ 2', value: 'monday' },
                                        { label: 'Thứ 3', value: 'tuesday' },
                                        { label: 'Thứ 4', value: 'wednesday' },
                                        { label: 'Thứ 5', value: 'thursday' },
                                        { label: 'Thứ 6', value: 'friday' },
                                        { label: 'Thứ 7', value: 'saturday' },
                                        { label: 'Chủ nhật', value: 'sunday' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="availableDates"
                                label="Ngày trong tháng"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 ngày' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn ngày trong tháng"
                                    style={{ width: '100%' }}
                                >
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <Option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </Option>
                                    ))}
                                </Select>
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
                    </Row>

                    {/* Hình ảnh */}
                    <Divider orientation="left">Hình ảnh</Divider>

                    <Form.Item
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

                    {/* Lịch trình */}
                    <Divider orientation="left">Lịch trình</Divider>

                    <Form.List name="itinerary">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={16} align="middle">
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'checkpoint']}
                                                label={key === 0 ? "Giờ" : ""}
                                                rules={[{ required: true, message: 'Chọn giờ' }]}
                                            >
                                                <TimePicker
                                                    format="HH:mm"
                                                    placeholder="Chọn giờ"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={16}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'activity']}
                                                label={key === 0 ? "Hoạt động" : ""}
                                                rules={[{ required: true, message: 'Nhập hoạt động' }]}
                                            >
                                                <Input placeholder="Mô tả hoạt động tại thời điểm này" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="link"
                                                    icon={<MinusCircleOutlined />}
                                                    onClick={() => remove(name)}
                                                    style={{ marginTop: key === 0 ? 30 : 0 }}
                                                >
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Thêm điểm lịch trình
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    {/* Mô tả và hướng dẫn viên */}
                    <Divider orientation="left">Thông tin bổ sung</Divider>

                    <Form.Item
                        name="description"
                        label="Mô tả tour"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả tour' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Mô tả chi tiết về tour, điểm đến, trải nghiệm..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="guideInfo"
                        label="Thông tin hướng dẫn viên"
                        rules={[{ required: true, message: 'Vui lòng nhập thông tin hướng dẫn viên' }]}
                    >                        <TextArea
                            rows={3}
                            placeholder="Thông tin về hướng dẫn viên: kinh nghiệm, chuyên môn, ngôn ngữ..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TourTemplateManagement;
