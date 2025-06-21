import React, { useState, useEffect } from 'react';
import { TourTemplate } from '../../types';
import { getTourTemplates, createTourTemplate, getTourTemplateDetail, updateTourTemplate, deleteTourTemplate } from '../../services/tourcompanyService';
import publicService from '../../services/publicService';
import {
    Table,
    Button,
    Modal,
    Input,
    Space,
    Tag,
    message,
    Typography,
    Card,
    Row,
    Col,
    Form // Thêm lại import Form
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import './TourTemplateManagement.scss';
import TourTemplateFormModal from './TourTemplateFormModal';

const { Title } = Typography;

const TourTemplateManagement: React.FC = () => {
    const [templates, setTemplates] = useState<TourTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TourTemplate | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [uploadFileList, setUploadFileList] = useState<any[]>([]);

    const columns = [
        {
            title: 'Tên template',
            dataIndex: 'title',
            key: 'title',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: any, record: TourTemplate) => {
                const typeMap: Record<number, string> = { 1: 'FreeScenic', 2: 'PaidAttraction' };
                return (
                    record.title.toLowerCase().includes(value.toString().toLowerCase()) ||
                    typeMap[record.templateType]?.toLowerCase().includes(value.toString().toLowerCase())
                );
            },
        },
        {
            title: 'Loại tour',
            dataIndex: 'templateType',
            key: 'templateType',
            render: (templateType: number) => {
                const typeMap: Record<number, string> = { 1: 'FreeScenic', 2: 'PaidAttraction' };
                return <Tag color="blue">{typeMap[templateType] || templateType}</Tag>;
            }
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
            render: (createdAt: string) => {
                const date = new Date(createdAt);
                return date.toLocaleDateString('vi-VN');
            }
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
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    >
                        Xóa
                    </Button>
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
        const templateTypeMap: Record<number, string> = { 1: 'FreeScenic', 2: 'PaidAttraction' };
        const fileList = Array.isArray(template.images)
            ? template.images.map((url, idx) => ({
                uid: idx + '',
                name: `image_${idx}`,
                status: 'done',
                url,
            }))
            : [];
        const formValues: any = {
            ...template,
            templateType: templateTypeMap[template.templateType] || 'FreeScenic',
            images: fileList,
            availableMonths: template.month ? [template.month] : [],
            availableYears: template.year ? [template.year] : [],
        };
        setEditingTemplate(template);
        setUploadFileList(fileList); // set fileList cho Upload
        form.setFieldsValue(formValues);
        setIsModalVisible(true);
    }; const handleView = async (template: TourTemplate) => {
        const token = localStorage.getItem('token') || '';
        const detail = await getTourTemplateDetail(template.id, token);
        if (!detail) {
            message.error('Không thể lấy thông tin chi tiết template');
            return;
        }
        const typeMap: Record<number, string> = { 1: 'FreeScenic', 2: 'PaidAttraction' };
        Modal.info({
            title: detail.title,
            width: 1000,
            content: (
                <div className="template-view-modal">
                    <h3 className="modal-section-title">Thông tin cơ bản</h3>
                    <Row gutter={16}>
                        <Col span={24}>
                            <p><strong>Tên template:</strong> {detail.title}</p>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <p><strong>Điểm bắt đầu:</strong> {detail.startLocation}</p>
                        </Col>
                        <Col span={12}>
                            <p><strong>Điểm kết thúc:</strong> {detail.endLocation}</p>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <p><strong>Loại tour:</strong> {typeMap[detail.templateType] || detail.templateType}</p>
                        </Col>
                    </Row>
                    <hr className="modal-section-divider" />
                    <h3 className="modal-section-title">Thời gian có sẵn</h3>
                    <Row gutter={16}>
                        <Col span={8}>
                            <p><strong>Tháng:</strong> {detail.month}</p>
                        </Col>
                        <Col span={8}>
                            <p><strong>Năm:</strong> {detail.year}</p>
                        </Col>
                        <Col span={8}>
                            <p><strong>Trạng thái:</strong> {detail.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</p>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <p><strong>Ngày tạo:</strong> {new Date(detail.createdAt).toLocaleDateString('vi-VN')}</p>
                        </Col>
                    </Row>
                    <hr className="modal-section-divider" />
                    <h3 className="modal-section-title">Hình ảnh</h3>
                    <Row gutter={16}>
                        <Col span={24}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {detail.images && detail.images.map((img: string, idx: number) => (
                                    <img key={idx} src={img} alt="template" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                                ))}
                            </div>
                        </Col>
                    </Row>
                </div>
            ),
        });
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Bạn có chắc muốn xóa template này?',
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token') || undefined;
                    await deleteTourTemplate(id, token);
                    setTemplates(templates.filter(t => t.id !== id));
                    message.success('Xóa template thành công');
                } catch (error) {
                    message.error('Xóa template thất bại');
                }
            },
        });
    };
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            let images: string[] = [];
            let fileList: any[] = [];
            if (Array.isArray(values.images)) {
                fileList = values.images;
            } else if (values.images && values.images.fileList) {
                fileList = values.images.fileList;
            }
            const existedUrls: string[] = [];
            const filesToUpload: File[] = [];
            fileList.forEach((file: any) => {
                if (file.url && typeof file.url === 'string') {
                    existedUrls.push(file.url);
                } else if (file.originFileObj) {
                    filesToUpload.push(file.originFileObj);
                }
            });
            let uploadedUrls: string[] = [];
            if (filesToUpload.length > 0) {
                uploadedUrls = (await Promise.all(filesToUpload.map(file => publicService.uploadImage(file)))).filter(Boolean) as string[];
            }
            images = [...existedUrls, ...uploadedUrls];
            const processedValues = {
                ...values,
                images,
            };
            const templateTypeMap: Record<string, number> = { FreeScenic: 1, PaidAttraction: 2 };
            const apiBody = {
                title: processedValues.title,
                startLocation: processedValues.startLocation,
                endLocation: processedValues.endLocation,
                templateType: templateTypeMap[processedValues.templateType] || 1,
                scheduleDays: 0,
                images: processedValues.images,
            };
            const token = localStorage.getItem('token') || undefined;
            if (editingTemplate) {
                // EDIT: gọi updateTourTemplate
                await updateTourTemplate(editingTemplate.id, apiBody, token);
                message.success('Cập nhật template thành công');
            } else {
                // CREATE: gọi createTourTemplate
                await createTourTemplate({ ...apiBody, month: processedValues.month || (Array.isArray(processedValues.availableMonths) ? processedValues.availableMonths[0] : 1), year: processedValues.year || (Array.isArray(processedValues.availableYears) ? processedValues.availableYears[0] : new Date().getFullYear()) });
                message.success('Thêm template thành công');
            }
            setIsModalVisible(false);
            form.resetFields();
            setUploadFileList([]);
            setLoading(true);
            const res = await getTourTemplates({}, token);
            setTemplates(res.data || []);
            setLoading(false);
        } catch (error) {
            message.error('Có lỗi khi lưu template');
            console.error('Validation failed or API error:', error);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setUploadFileList([]);
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

            <TourTemplateFormModal
                form={form}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                uploadFileList={uploadFileList}
                setUploadFileList={setUploadFileList}
                editingTemplate={editingTemplate}
                loading={loading}
            />
        </div>
    );
};

export default TourTemplateManagement;
