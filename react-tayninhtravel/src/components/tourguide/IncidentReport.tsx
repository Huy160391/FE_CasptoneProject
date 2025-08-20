import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Typography,
    Space,
    notification,
    Upload,
    Alert,
    Row,
    Col,
    Tag
} from 'antd';
import {
    ArrowLeftOutlined,
    FireOutlined,
    PictureOutlined,
    ExclamationCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { getMyActiveTours, reportIncident, ActiveTour } from '@/services/tourguideService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface IncidentFormData {
    tourOperationId: string;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    imageUrls?: string[];
}

const IncidentReport: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const [activeTours, setActiveTours] = useState<ActiveTour[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    // Load active tours
    const loadActiveTours = async () => {
        try {
            setLoading(true);
            const response = await getMyActiveTours();
            
            if (response.success && response.data) {
                setActiveTours(response.data);
                
                // Auto-select if only one tour
                if (response.data.length === 1) {
                    form.setFieldsValue({ tourOperationId: response.data[0].id });
                }
            }
        } catch (error) {
            console.error('Error loading active tours:', error);
            notification.error({
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải danh sách tours đang hoạt động.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActiveTours();
    }, []);

    // Handle form submission
    const handleSubmit = async (values: IncidentFormData) => {
        try {
            setSubmitting(true);
            
            const response = await reportIncident({
                ...values,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined
            });
            
            if (response.success) {
                notification.success({
                    message: 'Báo cáo thành công',
                    description: 'Sự cố đã được báo cáo. Admin sẽ xử lý trong thời gian sớm nhất.',
                });
                
                // Reset form
                form.resetFields();
                setImageUrls([]);
                
                // Navigate back
                navigate('/tour-guide/dashboard');
            }
        } catch (error: any) {
            console.error('Error reporting incident:', error);
            notification.error({
                message: 'Lỗi báo cáo',
                description: error.response?.data?.message || 'Không thể báo cáo sự cố.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle image upload (mock implementation)
    const handleImageUpload = (info: any) => {
        // In real implementation, this would upload to a file service
        // For now, we'll just simulate successful upload
        if (info.file.status === 'done') {
            const mockUrl = `https://example.com/uploads/${info.file.name}`;
            setImageUrls(prev => [...prev, mockUrl]);
            notification.success({
                message: 'Upload thành công',
                description: `Đã upload ${info.file.name}`,
            });
        }
    };

    // Remove image
    const removeImage = (url: string) => {
        setImageUrls(prev => prev.filter(img => img !== url));
    };

    // Get severity config
    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case 'Low':
                return { color: 'blue', icon: <ExclamationCircleOutlined />, text: 'Thấp' };
            case 'Medium':
                return { color: 'orange', icon: <WarningOutlined />, text: 'Trung bình' };
            case 'High':
                return { color: 'red', icon: <FireOutlined />, text: 'Cao' };
            case 'Critical':
                return { color: 'red', icon: <CloseCircleOutlined />, text: 'Nghiêm trọng' };
            default:
                return { color: 'default', icon: <ExclamationCircleOutlined />, text: severity };
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/tour-guide/dashboard')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại Dashboard
                </Button>
                
                <Title level={2}>
                    <FireOutlined style={{ color: '#ff4d4f' }} /> Báo cáo sự cố
                </Title>
                
                <Alert
                    message="Thông tin quan trọng"
                    description="Hãy báo cáo sự cố một cách chi tiết và chính xác. Với sự cố mức độ cao, admin sẽ được thông báo ngay lập tức."
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                />
            </div>

            <Card title="Thông tin sự cố" loading={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        severity: 'Medium'
                    }}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="tourOperationId"
                                label="Tour đang thực hiện"
                                rules={[{ required: true, message: 'Vui lòng chọn tour' }]}
                            >
                                <Select placeholder="Chọn tour">
                                    {activeTours.map(tour => (
                                        <Option key={tour.id} value={tour.id}>
                                            <div>
                                                <Text strong>{tour.title}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {tour.tourTemplate.startLocation} → {tour.tourTemplate.endLocation}
                                                </Text>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="severity"
                                label="Mức độ nghiêm trọng"
                                rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
                            >
                                <Select>
                                    {['Low', 'Medium', 'High', 'Critical'].map(severity => {
                                        const config = getSeverityConfig(severity);
                                        return (
                                            <Option key={severity} value={severity}>
                                                <Space>
                                                    <Tag color={config.color} icon={config.icon}>
                                                        {config.text}
                                                    </Tag>
                                                </Space>
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="title"
                        label="Tiêu đề sự cố"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề' },
                            { max: 200, message: 'Tiêu đề không được quá 200 ký tự' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: Xe bị hỏng, Khách bị ốm, Thời tiết xấu..." />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả chi tiết"
                        rules={[
                            { required: true, message: 'Vui lòng mô tả chi tiết sự cố' },
                            { max: 1000, message: 'Mô tả không được quá 1000 ký tự' }
                        ]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="Mô tả chi tiết về sự cố: thời gian xảy ra, tình hình hiện tại, ảnh hưởng đến tour, biện pháp đã thực hiện..."
                        />
                    </Form.Item>

                    <Form.Item label="Hình ảnh minh chứng (tùy chọn)">
                        <Upload
                            name="images"
                            listType="picture-card"
                            multiple
                            beforeUpload={() => false} // Prevent auto upload
                            onChange={handleImageUpload}
                            showUploadList={false}
                        >
                            <div>
                                <PictureOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                        
                        {imageUrls.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <Text strong>Hình ảnh đã upload:</Text>
                                <div style={{ marginTop: '8px' }}>
                                    {imageUrls.map((url, index) => (
                                        <Tag
                                            key={index}
                                            closable
                                            onClose={() => removeImage(url)}
                                            style={{ marginBottom: '8px' }}
                                        >
                                            Hình {index + 1}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                danger
                                htmlType="submit"
                                loading={submitting}
                                icon={<FireOutlined />}
                                size="large"
                            >
                                Báo cáo sự cố
                            </Button>
                            <Button
                                onClick={() => navigate('/tour-guide/dashboard')}
                                size="large"
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default IncidentReport;
