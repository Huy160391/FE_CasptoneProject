import React, { useState } from 'react';
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
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CopyOutlined,
    SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './TourManagement.scss';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Tour {
    id: string;
    name: string;
    templateId: string;
    templateName: string;
    category: string;
    duration: string;
    maxGroupSize: number;
    currentBookings: number;
    price: number;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    description: string;
    createdAt: string;
}

const TourManagement: React.FC = () => {
    const [tours, setTours] = useState<Tour[]>([
        {
            id: '1',
            name: 'Tour Núi Bà Đen - Tháng 3',
            templateId: '1',
            templateName: 'Template Tour Núi Bà Đen',
            category: 'Núi non',
            duration: '1 ngày',
            maxGroupSize: 20,
            currentBookings: 15,
            price: 550000,
            startDate: '2024-03-25',
            endDate: '2024-03-25',
            status: 'upcoming',
            description: 'Tour khám phá núi Bà Đen vào tháng 3',
            createdAt: '2024-02-15'
        },
        {
            id: '2',
            name: 'Tour Tòa Thánh Cao Đài - Cuối tuần',
            templateId: '2',
            templateName: 'Template Tour Tòa Thánh Cao Đài',
            category: 'Tâm linh',
            duration: '4 giờ',
            maxGroupSize: 30,
            currentBookings: 8,
            price: 350000,
            startDate: '2024-03-20',
            endDate: '2024-03-20',
            status: 'upcoming',
            description: 'Tour tham quan Tòa Thánh Cao Đài vào cuối tuần',
            createdAt: '2024-02-10'
        },
        {
            id: '3',
            name: 'Tour Núi Bà Đen - Tết Nguyên Đán',
            templateId: '1',
            templateName: 'Template Tour Núi Bà Đen',
            category: 'Núi non',
            duration: '1 ngày',
            maxGroupSize: 20,
            currentBookings: 20,
            price: 750000,
            startDate: '2024-02-10',
            endDate: '2024-02-10',
            status: 'completed',
            description: 'Tour đặc biệt dịp Tết Nguyên Đán',
            createdAt: '2024-01-15'
        }
    ]);

    const [templates] = useState([
        { id: '1', name: 'Template Tour Núi Bà Đen' },
        { id: '2', name: 'Template Tour Tòa Thánh Cao Đài' },
        { id: '3', name: 'Template Tour Suối Đá' }
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTour, setEditingTour] = useState<Tour | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    const getStatusColor = (status: string) => {
        const colors = {
            upcoming: 'blue',
            ongoing: 'green',
            completed: 'default',
            cancelled: 'red'
        };
        return colors[status as keyof typeof colors];
    };

    const getStatusText = (status: string) => {
        const texts = {
            upcoming: 'Sắp diễn ra',
            ongoing: 'Đang diễn ra',
            completed: 'Đã hoàn thành',
            cancelled: 'Đã hủy'
        };
        return texts[status as keyof typeof texts];
    };

    const columns = [
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
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => <Tag color="blue">{category}</Tag>
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: Tour, b: Tour) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Sắp diễn ra', value: 'upcoming' },
                { text: 'Đang diễn ra', value: 'ongoing' },
                { text: 'Đã hoàn thành', value: 'completed' },
                { text: 'Đã hủy', value: 'cancelled' },
            ],
            onFilter: (value: any, record: Tour) => record.status === value,
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
                            disabled={record.status === 'completed'}
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
        },
    ];

    const handleAdd = () => {
        setEditingTour(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (tour: Tour) => {
        setEditingTour(tour);
        form.setFieldsValue({
            ...tour,
            dateRange: [dayjs(tour.startDate), dayjs(tour.endDate)]
        });
        setIsModalVisible(true);
    };

    const handleView = (tour: Tour) => {
        Modal.info({
            title: tour.name,
            width: 600,
            content: (
                <div className="tour-view">
                    <p><strong>Template gốc:</strong> {tour.templateName}</p>
                    <p><strong>Danh mục:</strong> {tour.category}</p>
                    <p><strong>Thời gian:</strong> {tour.duration}</p>
                    <p><strong>Ngày bắt đầu:</strong> {dayjs(tour.startDate).format('DD/MM/YYYY')}</p>
                    <p><strong>Ngày kết thúc:</strong> {dayjs(tour.endDate).format('DD/MM/YYYY')}</p>
                    <p><strong>Số người tối đa:</strong> {tour.maxGroupSize}</p>
                    <p><strong>Đã đặt:</strong> {tour.currentBookings}</p>
                    <p><strong>Giá:</strong> {tour.price.toLocaleString('vi-VN')} ₫</p>
                    <p><strong>Trạng thái:</strong>
                        <Tag color={getStatusColor(tour.status)} style={{ marginLeft: 8 }}>
                            {getStatusText(tour.status)}
                        </Tag>
                    </p>
                    <p><strong>Mô tả:</strong> {tour.description}</p>
                </div>
            ),
        });
    };

    const handleCopy = (tour: Tour) => {
        const newTour: Tour = {
            ...tour,
            id: Date.now().toString(),
            name: `${tour.name} - Copy`,
            currentBookings: 0,
            status: 'upcoming',
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
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
            };
            delete processedValues.dateRange;

            if (editingTour) {
                // Update existing tour
                setTours(tours.map(t =>
                    t.id === editingTour.id ? { ...t, ...processedValues } : t
                ));
                message.success('Cập nhật tour thành công');
            } else {
                // Add new tour
                const selectedTemplate = templates.find(template => template.id === values.templateId);
                const newTour: Tour = {
                    id: Date.now().toString(),
                    templateName: selectedTemplate?.name || '',
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
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    return (
        <div className="tour-management">
            <div className="page-header">
                <Title level={2}>Quản lý Tour</Title>
                <div className="header-actions">
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
                />
            </Card>

            <Modal
                title={editingTour ? 'Sửa Tour' : 'Thêm Tour Mới'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingTour ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: 'upcoming',
                        maxGroupSize: 20
                    }}
                >
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
                                <Select placeholder="Chọn template">
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
                                name="category"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select>
                                    <Option value="Núi non">Núi non</Option>
                                    <Option value="Tâm linh">Tâm linh</Option>
                                    <Option value="Văn hóa">Văn hóa</Option>
                                    <Option value="Sinh thái">Sinh thái</Option>
                                    <Option value="Lịch sử">Lịch sử</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="duration"
                                label="Thời gian"
                                rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                            >
                                <Input placeholder="VD: 1 ngày, 2 ngày 1 đêm" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="dateRange"
                                label="Thời gian tour"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian tour' }]}
                            >
                                <RangePicker
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

                    <Row gutter={16}>
                        <Col span={12}>
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
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select>
                                    <Option value="upcoming">Sắp diễn ra</Option>
                                    <Option value="ongoing">Đang diễn ra</Option>
                                    <Option value="completed">Đã hoàn thành</Option>
                                    <Option value="cancelled">Đã hủy</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả tour"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả tour' }]}
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết về tour này" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TourManagement;
