import React, { useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Space,
    Tag,
    Popconfirm,
    message,
    Typography,
    Card,
    Row,
    Col,
    Tooltip,
    TimePicker,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CopyOutlined,
    SearchOutlined,
    MinusCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './TourManagement.scss';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TourTemplate {
    id: string;
    name: string;
    startLocation: string;
    endLocation: string;
    tourType: string;
    availableDays: string[];
    availableMonths: number[];
    images: string[];
    ticketQuantity: number;
    createdAt: string;
    usageCount: number;
}

interface ItineraryItem {
    id: string;
    checkpoint: string;
    activity: string;
}

interface Tour {
    id: string;
    name: string;
    templateId: string;
    templateName: string;
    maxGroupSize: number;
    currentBookings: number;
    price: number;
    tourDate: string;
    description: string;
    guideInfo: string;
    itinerary: ItineraryItem[];
    createdAt: string;
}

const TourManagement: React.FC = () => {
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const [tours, setTours] = useState<Tour[]>([
        {
            id: '1',
            name: 'Tour Núi Bà Đen - Tháng 3',
            templateId: '1',
            templateName: 'Template Tour Núi Bà Đen',
            maxGroupSize: 20,
            currentBookings: 15,
            price: 550000,
            tourDate: '2024-03-25',
            description: 'Tour khám phá núi Bà Đen vào tháng 3 với trải nghiệm leo núi và tham quan chùa Bà.',
            guideInfo: 'Hướng dẫn viên có kinh nghiệm 5+ năm, thông thạo tiếng Việt và tiếng Anh. Chuyên về tour tâm linh và leo núi.',
            itinerary: [
                { id: '1', checkpoint: '06:00', activity: 'Tập trung tại điểm hẹn' },
                { id: '2', checkpoint: '08:00', activity: 'Khởi hành đi Núi Bà Đen' },
                { id: '3', checkpoint: '10:00', activity: 'Đi cáp treo lên đỉnh núi' },
                { id: '4', checkpoint: '12:00', activity: 'Ăn trưa tại chân núi' },
                { id: '5', checkpoint: '14:00', activity: 'Tham quan chùa Bà' },
                { id: '6', checkpoint: '16:00', activity: 'Khởi hành về TP.HCM' }
            ],
            createdAt: '2024-02-15'
        },
        {
            id: '2',
            name: 'Tour Tòa Thánh Cao Đài - Cuối tuần',
            templateId: '2',
            templateName: 'Template Tour Tòa Thánh Cao Đài',
            maxGroupSize: 30,
            currentBookings: 8,
            price: 350000,
            tourDate: '2024-03-20',
            description: 'Tour tham quan Tòa Thánh Cao Đài vào cuối tuần, tìm hiểu về tôn giáo và văn hóa.',
            guideInfo: 'Hướng dẫn viên am hiểu sâu về tôn giáo Cao Đài, có thể giải thích chi tiết về lịch sử và nghi lễ.',
            itinerary: [
                { id: '1', checkpoint: '07:00', activity: 'Tập trung và khởi hành' },
                { id: '2', checkpoint: '09:00', activity: 'Đến Tòa Thánh Cao Đài' },
                { id: '3', checkpoint: '09:30', activity: 'Tham quan và tìm hiểu lịch sử' },
                { id: '4', checkpoint: '11:30', activity: 'Xem lễ cầu nguyện' },
                { id: '5', checkpoint: '12:30', activity: 'Ăn trưa tại địa phương' },
                { id: '6', checkpoint: '14:00', activity: 'Khởi hành về TP.HCM' }
            ],
            createdAt: '2024-02-10'
        },
        {
            id: '3',
            name: 'Tour Núi Bà Đen - Tết Nguyên Đán',
            templateId: '1',
            templateName: 'Template Tour Núi Bà Đen',
            maxGroupSize: 20,
            currentBookings: 20,
            price: 750000,
            tourDate: '2024-02-10',
            description: 'Tour đặc biệt dịp Tết Nguyên Đán với nhiều hoạt động văn hóa truyền thống.',
            guideInfo: 'Hướng dẫn viên có kinh nghiệm 5+ năm, am hiểu văn hóa truyền thống Việt Nam.',
            itinerary: [
                { id: '1', checkpoint: '05:30', activity: 'Tập trung tại điểm hẹn' },
                { id: '2', checkpoint: '07:30', activity: 'Khởi hành đi Núi Bà Đen' },
                { id: '3', checkpoint: '09:30', activity: 'Tham gia lễ cầu an đầu năm' },
                { id: '4', checkpoint: '11:00', activity: 'Đi cáp treo lên đỉnh núi' },
                { id: '5', checkpoint: '13:00', activity: 'Ăn trưa đặc biệt ngày Tết' },
                { id: '6', checkpoint: '15:00', activity: 'Tham quan và chụp ảnh' },
                { id: '7', checkpoint: '17:00', activity: 'Khởi hành về TP.HCM' }
            ],
            createdAt: '2024-01-15'
        }
    ]); const [templates] = useState<TourTemplate[]>([
        {
            id: '1',
            name: 'Template Tour Núi Bà Đen',
            startLocation: 'TP. Hồ Chí Minh',
            endLocation: 'Núi Bà Đen, Tây Ninh',
            tourType: 'Núi non',
            availableDays: ['saturday', 'sunday'],
            availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            images: ['/images/tours/nui-ba-den.jpg'],
            ticketQuantity: 30,
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
            availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            images: ['/images/tours/toa-thanh-cao-dai.jpg'],
            ticketQuantity: 40,
            createdAt: '2024-01-10',
            usageCount: 8
        },
        {
            id: '3',
            name: 'Template Tour Suối Đá',
            startLocation: 'TP. Hồ Chí Minh',
            endLocation: 'Suối Đá, Tây Ninh',
            tourType: 'Sinh thái',
            availableDays: ['saturday', 'sunday'],
            availableMonths: [3, 4, 5, 6, 7, 8, 9, 10],
            images: ['/images/tours/suoi-da.jpg'],
            ticketQuantity: 25,
            createdAt: '2024-01-05',
            usageCount: 5
        }
    ]); const [isTemplateSelectVisible, setIsTemplateSelectVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTour, setEditingTour] = useState<Tour | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [templateSearchText, setTemplateSearchText] = useState(''); const columns = [
        {
            title: 'Tên tour',
            dataIndex: 'name',
            key: 'name',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: any, record: Tour) =>
                record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
                record.templateName.toLowerCase().includes(value.toString().toLowerCase()),
        },
        {
            title: 'Template gốc',
            dataIndex: 'templateName',
            key: 'templateName',
            render: (templateName: string) => <Tag color="purple">{templateName}</Tag>
        },
        {
            title: 'Ngày tour',
            dataIndex: 'tourDate',
            key: 'tourDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: Tour, b: Tour) => dayjs(a.tourDate).unix() - dayjs(b.tourDate).unix(),
        },
        {
            title: 'Booking',
            key: 'bookings',
            render: (_: any, record: Tour) => (
                <span>
                    {record.currentBookings}/{record.maxGroupSize}
                    {record.currentBookings === record.maxGroupSize && (
                        <Tag color="red" style={{ marginLeft: 8 }}>Đầy</Tag>
                    )}
                </span>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString('vi-VN')} ₫`,
            sorter: (a: Tour, b: Tour) => a.price - b.price,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: Tour) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Sao chép">
                        <Button
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => handleCopy(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa tour này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                disabled={record.currentBookings > 0}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },];

    const handleAdd = () => {
        setEditingTour(null);
        setIsTemplateSelectVisible(true);
    };

    const handleTemplateSelect = (template: TourTemplate) => {
        setIsTemplateSelectVisible(false);

        // Điền thông tin từ template vào form
        form.resetFields();
        form.setFieldsValue({
            templateId: template.id,
            maxGroupSize: template.ticketQuantity,
            name: `${template.name.replace('Template ', '')} - ${dayjs().format('DD/MM/YYYY')}`,
            itinerary: [
                { checkpoint: dayjs('08:00', 'HH:mm'), activity: 'Tập trung tại điểm hẹn' }
            ]
        });
        setIsModalVisible(true);
    };

    const handleEdit = (tour: Tour) => {
        setEditingTour(tour);
        form.setFieldsValue({
            ...tour,
            tourDate: dayjs(tour.tourDate),
            itinerary: tour.itinerary.map(item => ({
                ...item,
                checkpoint: dayjs(item.checkpoint, 'HH:mm')
            }))
        });
        setIsModalVisible(true);
    };

    const handleView = (tour: Tour) => {
        Modal.info({
            title: tour.name,
            width: 800,
            content: (
                <div className="tour-view">
                    <p><strong>Template gốc:</strong> {tour.templateName}</p>
                    <p><strong>Ngày tour:</strong> {dayjs(tour.tourDate).format('DD/MM/YYYY')}</p>
                    <p><strong>Số người tối đa:</strong> {tour.maxGroupSize}</p>
                    <p><strong>Đã đặt:</strong> {tour.currentBookings}</p>
                    <p><strong>Giá:</strong> {tour.price.toLocaleString('vi-VN')} ₫</p>
                    <p><strong>Mô tả:</strong> {tour.description}</p>
                    <p><strong>Thông tin hướng dẫn viên:</strong> {tour.guideInfo}</p>

                    <p><strong>Lịch trình:</strong></p>
                    <ul>
                        {tour.itinerary.map((item, index) => (
                            <li key={index}><strong>{item.checkpoint}:</strong> {item.activity}</li>
                        ))}
                    </ul>
                </div>
            ),
        });
    }; const handleCopy = (tour: Tour) => {
        const newTour: Tour = {
            ...tour,
            id: Date.now().toString(),
            name: `${tour.name} - Copy`,
            currentBookings: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setTours([...tours, newTour]);
        message.success('Sao chép tour thành công');
    };

    const handleDelete = (id: string) => {
        setTours(tours.filter(t => t.id !== id));
        message.success('Xóa tour thành công');
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            const processedValues = {
                ...values,
                tourDate: values.tourDate.format('YYYY-MM-DD'),
                itinerary: values.itinerary ? values.itinerary.map((item: any) => ({
                    id: item.id || Date.now().toString() + Math.random(),
                    checkpoint: item.checkpoint.format('HH:mm'),
                    activity: item.activity
                })) : []
            };

            if (editingTour) {
                // Update existing tour
                setTours(tours.map(t =>
                    t.id === editingTour.id ? { ...t, ...processedValues } : t
                ));
                message.success('Cập nhật tour thành công');
            } else {
                // Add new tour
                const selectedTemplateData = templates.find(template => template.id === values.templateId);
                const newTour: Tour = {
                    id: Date.now().toString(),
                    templateName: selectedTemplateData?.name || '',
                    currentBookings: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    ...processedValues,
                };
                setTours([...tours, newTour]);
                message.success('Thêm tour thành công');
            }
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    }; const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleTemplateSearch = (value: string) => {
        setTemplateSearchText(value);
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(templateSearchText.toLowerCase()) ||
        template.tourType.toLowerCase().includes(templateSearchText.toLowerCase()) ||
        template.startLocation.toLowerCase().includes(templateSearchText.toLowerCase()) ||
        template.endLocation.toLowerCase().includes(templateSearchText.toLowerCase())
    );

    return (
        <div className="tour-management">
            <div className="page-header">
                <Title level={2}>Quản lý Tour</Title>                <div className="header-actions">
                    <Input
                        placeholder="Tìm kiếm theo tên tour, template"
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
                        Thêm Tour
                    </Button>
                </div>
            </div>

            <Card>
                <Table
                    dataSource={tours}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                />            </Card>            {/* Modal chọn template */}
            <Modal
                title="Chọn Template Tour"
                open={isTemplateSelectVisible}
                onCancel={() => setIsTemplateSelectVisible(false)}
                footer={null}
                width={900}
                className={`template-selection-modal${isDarkMode ? ' dark' : ''}`}
            >
                <div className={`template-selection${isDarkMode ? ' dark' : ''}`}>
                    {/* Search bar */}
                    <div className="template-search-bar">
                        <Input
                            placeholder="Tìm kiếm template theo tên, loại, địa điểm..."
                            prefix={<SearchOutlined />}
                            onChange={e => handleTemplateSearch(e.target.value)}
                            allowClear
                            size="large"
                        />
                    </div>                    {/* Template list */}
                    <div
                        className="template-grid"
                        style={isDarkMode ? {
                            backgroundColor: '#262626',
                            border: '1px solid #404040',
                            borderRadius: '8px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            color: '#fff'
                        } : {
                            backgroundColor: '#ffffff',
                            border: '1px solid #e8e8e8',
                            borderRadius: '8px',
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}
                    >{filteredTemplates.length > 0 ? (
                        filteredTemplates.map((template, index) => (
                            <div
                                key={template.id}
                                className={`template-item${isDarkMode ? ' dark' : ''}`}
                                onClick={() => handleTemplateSelect(template)}
                                style={isDarkMode ? {
                                    padding: '20px 16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#262626',
                                    borderBottom: index === filteredTemplates.length - 1 ? 'none' : '2px solid #404040',
                                    color: '#fff'
                                } : {
                                    padding: '20px 16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#ffffff',
                                    borderBottom: index === filteredTemplates.length - 1 ? 'none' : '2px solid #e8e8e8'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDarkMode ? '#2f2f2f' : '#f0f9ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = isDarkMode ? '#262626' : '#ffffff';
                                }}
                            >
                                <Row align="middle">
                                    <Col span={20}>                                            <div>
                                        <h4 className="template-name">
                                            {template.name}
                                        </h4>
                                        <Row gutter={24} style={{ marginTop: '12px' }}>
                                            <Col span={8}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <Tag color="blue" style={{ margin: '0 4px 4px 0' }}>
                                                        {template.tourType}
                                                    </Tag>
                                                </div>
                                                <div className="template-duration">
                                                    <strong>Số vé:</strong> {template.ticketQuantity}
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div className="template-locations" style={{ marginBottom: '8px' }}>
                                                    <strong>Tuyến:</strong> {template.startLocation} → {template.endLocation}
                                                </div>
                                                <div className="template-duration">
                                                    <strong>Đã sử dụng:</strong> {template.usageCount} lần
                                                </div>
                                            </Col>
                                            <Col span={4} style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                                                    {dayjs(template.createdAt).format('DD/MM/YYYY')}
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                    </Col>
                                    <Col span={4} style={{ textAlign: 'right' }}>
                                        <Button type="primary" size="small">
                                            Chọn
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <SearchOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                            <div>Không tìm thấy template phù hợp</div>
                        </div>
                    )}
                    </div>
                </div>
            </Modal>

            <Modal
                title={editingTour ? 'Sửa Tour' : 'Thêm Tour Mới'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingTour ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={800}
            >                <Form
                form={form}
                layout="vertical"
                initialValues={{
                    maxGroupSize: 20,
                    itinerary: [
                        { checkpoint: dayjs('08:00', 'HH:mm'), activity: 'Tập trung tại điểm hẹn' }
                    ]
                }}
            >
                    {/* Thông tin cơ bản */}
                    <Divider orientation="left">Thông tin cơ bản</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên tour"
                                rules={[{ required: true, message: 'Vui lòng nhập tên tour' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="templateId"
                                label="Template gốc"
                                rules={[{ required: true, message: 'Vui lòng chọn template' }]}
                            >
                                <Select placeholder="Chọn template" disabled={!editingTour}>
                                    {templates.map(template => (
                                        <Option key={template.id} value={template.id}>
                                            {template.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="tourDate"
                                label="Ngày tour"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày tour' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maxGroupSize"
                                label="Số người tối đa"
                                rules={[{ required: true, message: 'Vui lòng nhập số người tối đa' }]}
                            >
                                <InputNumber min={1} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="price"
                        label="Giá tour (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập giá tour' }]}
                    >
                        <InputNumber
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            style={{ width: '100%' }}
                        />
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

                    {/* Thông tin bổ sung */}
                    <Divider orientation="left">Thông tin bổ sung</Divider>

                    <Form.Item
                        name="description"
                        label="Mô tả tour"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả tour' }]}
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết về tour này" />
                    </Form.Item>

                    <Form.Item
                        name="guideInfo"
                        label="Thông tin hướng dẫn viên"
                        rules={[{ required: true, message: 'Vui lòng nhập thông tin hướng dẫn viên' }]}
                    >
                        <TextArea rows={3} placeholder="Thông tin về hướng dẫn viên: kinh nghiệm, chuyên môn, ngôn ngữ..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TourManagement;
