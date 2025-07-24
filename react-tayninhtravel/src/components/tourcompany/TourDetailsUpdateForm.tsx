import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    message,
    Upload,
    Image,
    Space,
    Row,
    Col,
    Card,
    Divider
} from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { TourDetails } from '../../types/tour';
import { updateTourDetails } from '../../services/tourcompanyService';
import { useAuthStore } from '../../store/useAuthStore';
import { publicService } from '../../services/publicService';

const { TextArea } = Input;

interface TourDetailsUpdateFormProps {
    visible: boolean;
    tourDetails: TourDetails | null;
    onCancel: () => void;
    onSuccess: () => void;
}

interface UpdateFormData {
    title: string;
    description: string;
    imageUrls: string[];
}

const TourDetailsUpdateForm: React.FC<TourDetailsUpdateFormProps> = ({
    visible,
    tourDetails,
    onCancel,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const { token } = useAuthStore();

    useEffect(() => {
        if (visible && tourDetails) {
            // Initialize form with current tour details data
            form.setFieldsValue({
                title: tourDetails.title,
                description: tourDetails.description || ''
            });
            
            // Initialize images
            setUploadedImageUrls(tourDetails.imageUrls || []);
        }
    }, [visible, tourDetails, form]);

    const handleImageUpload = async (file: File) => {
        try {
            setUploading(true);
            const imageUrl = await publicService.uploadImage(file);
            if (imageUrl) {
                setUploadedImageUrls(prev => [...prev, imageUrl]);
                message.success('Tải ảnh lên thành công');
            } else {
                message.error('Lỗi khi tải ảnh lên');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            message.error('Lỗi khi tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setUploadedImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (values: UpdateFormData) => {
        if (!tourDetails) return;

        try {
            setLoading(true);

            const updateData = {
                title: values.title,
                description: values.description,
                imageUrls: uploadedImageUrls
            };

            const response = await updateTourDetails(tourDetails.id, updateData, token);

            if (response.success) {
                message.success('Cập nhật tour details thành công');
                onSuccess();
                onCancel();
            } else {
                // Hiển thị message từ API response
                if (response.message) {
                    message.error(response.message);
                } else {
                    message.error('Cập nhật thất bại');
                }
            }
        } catch (error: any) {
            console.error('Error updating tour details:', error);

            // Xử lý error response từ API
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error.response?.data?.Message) {
                message.error(error.response.data.Message);
            } else {
                message.error('Có lỗi xảy ra khi cập nhật');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setUploadedImageUrls([]);
        onCancel();
    };

    return (
        <Modal
            title="Cập nhật Tour Details"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                preserve={false}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
                            label="Tiêu đề"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tiêu đề' },
                                { max: 255, message: 'Tiêu đề không được vượt quá 255 ký tự' }
                            ]}
                        >
                            <Input 
                                placeholder="Nhập tiêu đề tour details"
                                style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="Mô tả"
                            rules={[
                                { max: 1000, message: 'Mô tả không được vượt quá 1000 ký tự' }
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Nhập mô tả chi tiết về tour"
                                style={{ backgroundColor: '#e6f7ff', borderColor: '#1890ff' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider>Hình ảnh</Divider>

                {/* Image Upload */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Upload
                            beforeUpload={(file) => {
                                handleImageUpload(file);
                                return false; // Prevent default upload
                            }}
                            showUploadList={false}
                            accept="image/*"
                        >
                            <Button 
                                icon={<UploadOutlined />} 
                                loading={uploading}
                                style={{ marginBottom: 16 }}
                            >
                                {uploading ? 'Đang tải lên...' : 'Thêm ảnh'}
                            </Button>
                        </Upload>
                    </Col>
                </Row>

                {/* Display uploaded images */}
                {uploadedImageUrls.length > 0 && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <Card title={`Ảnh đã tải lên (${uploadedImageUrls.length})`} size="small">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {uploadedImageUrls.map((imageUrl, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <Image
                                                width={120}
                                                height={90}
                                                src={imageUrl}
                                                style={{ objectFit: 'cover', borderRadius: 8 }}
                                                preview={{
                                                    mask: 'Xem ảnh'
                                                }}
                                            />
                                            <Button
                                                type="primary"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                style={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    minWidth: 'auto',
                                                    width: 24,
                                                    height: 24,
                                                    padding: 0
                                                }}
                                                onClick={() => handleRemoveImage(index)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                )}

                <Divider />

                {/* Form Actions */}
                <Row gutter={16}>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                            >
                                Cập nhật
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default TourDetailsUpdateForm;
