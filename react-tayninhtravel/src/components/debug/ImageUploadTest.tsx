import React, { useState } from 'react';
import { Card, Upload, Button, message, Image, Typography, Space, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import publicService from '../../services/publicService';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

/**
 * Test component để kiểm tra image upload functionality
 */
const ImageUploadTest: React.FC = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string>('');
    const [uploadResult, setUploadResult] = useState<any>(null);

    const testDirectUpload = async (file: File): Promise<string | null> => {
        try {
            console.log('🧪 Direct upload test with file:', file.name, file.size, file.type);

            const formData = new FormData();
            formData.append('files', file);
            
            console.log('🧪 FormData entries:', Array.from(formData.entries()));

            // Test with direct axios call (no interceptors)
            const response = await axios.post('http://localhost:5267/api/Image/Upload', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            console.log('🧪 Direct upload response:', response.data);
            
            if (response.data?.urls && Array.isArray(response.data.urls) && response.data.urls.length > 0) {
                return response.data.urls[0];
            }
            return null;
        } catch (error) {
            console.error('🧪 Direct upload error:', error);
            return null;
        }
    };

    const handleImageUpload = async (file: File): Promise<boolean> => {
        try {
            setUploading(true);
            setUploadResult(null);
            
            console.log('🧪 Test upload starting:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // Test both methods
            console.log('🧪 Testing direct upload...');
            const directResult = await testDirectUpload(file);
            console.log('🧪 Direct upload result:', directResult);

            console.log('🧪 Testing publicService upload...');
            const imageUrl = await publicService.uploadImage(file);
            
            console.log('🧪 Upload result:', imageUrl);
            
            setUploadResult({
                success: !!imageUrl,
                url: imageUrl,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            if (imageUrl) {
                setUploadedUrl(imageUrl);
                message.success(`Upload thành công: ${imageUrl}`);
                return true;
            } else {
                message.error('Upload thất bại - không nhận được URL');
                return false;
            }
        } catch (error) {
            console.error('🧪 Upload error:', error);
            setUploadResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });
            message.error('Có lỗi xảy ra khi upload');
            return false;
        } finally {
            setUploading(false);
        }
    };

    const clearResults = () => {
        setUploadedUrl('');
        setUploadResult(null);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Card>
                <Title level={2}>🧪 Image Upload Test</Title>
                <Paragraph>
                    Component này để test chức năng upload ảnh. Chọn một file ảnh để kiểm tra.
                </Paragraph>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Upload Section */}
                    <div>
                        <Title level={4}>Upload Image</Title>
                        <Upload
                            accept="image/*"
                            showUploadList={false}
                            beforeUpload={(file) => {
                                handleImageUpload(file);
                                return false; // Prevent default upload
                            }}
                            disabled={uploading}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={uploading}
                                disabled={uploading}
                                type="primary"
                            >
                                {uploading ? 'Đang upload...' : 'Chọn ảnh để test'}
                            </Button>
                        </Upload>
                    </div>

                    {/* Results Section */}
                    {uploadResult && (
                        <div>
                            <Title level={4}>Upload Result</Title>
                            <Alert
                                type={uploadResult.success ? 'success' : 'error'}
                                message={uploadResult.success ? 'Upload thành công!' : 'Upload thất bại!'}
                                description={
                                    <div>
                                        <Text strong>File:</Text> {uploadResult.fileName}<br/>
                                        <Text strong>Size:</Text> {(uploadResult.fileSize / 1024).toFixed(2)} KB<br/>
                                        <Text strong>Type:</Text> {uploadResult.fileType}<br/>
                                        {uploadResult.success ? (
                                            <>
                                                <Text strong>URL:</Text> <Text code>{uploadResult.url}</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Text strong>Error:</Text> <Text type="danger">{uploadResult.error}</Text>
                                            </>
                                        )}
                                    </div>
                                }
                                style={{ marginBottom: 16 }}
                            />
                        </div>
                    )}

                    {/* Image Preview */}
                    {uploadedUrl && (
                        <div>
                            <Title level={4}>Image Preview</Title>
                            <Image
                                width={300}
                                height={200}
                                src={uploadedUrl}
                                style={{ objectFit: 'cover', borderRadius: 8 }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                            />
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">URL: </Text>
                                <Text code style={{ wordBreak: 'break-all' }}>{uploadedUrl}</Text>
                            </div>
                        </div>
                    )}

                    {/* Clear Button */}
                    {(uploadResult || uploadedUrl) && (
                        <Button onClick={clearResults}>
                            Clear Results
                        </Button>
                    )}
                </Space>
            </Card>
        </div>
    );
};

export default ImageUploadTest;
