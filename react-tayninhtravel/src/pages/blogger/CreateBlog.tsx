import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Upload,
    Space,
    Divider,
    Row,
    Col,
    message,
    Modal,
    Typography
} from 'antd';
import {
    UploadOutlined,
    SaveOutlined,
    EyeOutlined,
    SendOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { UploadFile } from 'antd/es/upload/interface';
import bloggerService from '@/services/bloggerService';
import type { CreateBlogPayload } from '@/types';
import './CreateBlog.scss';

const { Title } = Typography;

const CreateBlog: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [content, setContent] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null); const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],
            ['clean']
        ],
    };

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'list', 'bullet', 'indent',
        'align', 'link', 'image', 'video', 'blockquote', 'code-block'
    ];

    const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setFileList(fileList);
    }; const handlePreview = () => {
        const formData = form.getFieldsValue();
        setPreviewData({
            ...formData,
            content,
            featuredImage: fileList[0]?.url || fileList[0]?.thumbUrl || ''
        });
        setPreviewVisible(true);
    }; const handleSubmit = async (values: any) => {
        if (!content.trim()) {
            message.error(t('blogger.createBlog.validation.contentRequired'));
            return;
        }

        try {
            setLoading(true);

            // Chuyển đổi UploadFile thành File
            const files: File[] = fileList
                .filter(file => file.originFileObj)
                .map(file => file.originFileObj as File);

            const blogData: CreateBlogPayload = {
                title: values.title,
                content: content,
                files: files.length > 0 ? files : undefined
            };

            console.log('Creating blog with data:', blogData);

            const result = await bloggerService.createBlog(blogData);
            console.log('Blog created successfully:', result);

            message.success(t('blogger.createBlog.messages.success'));
            navigate('/blogger/my-blogs');
        } catch (error) {
            console.error('Error creating blog:', error);

            // Xử lý lỗi chi tiết hơn
            let errorMessage = t('blogger.createBlog.messages.error');

            if (error instanceof Error) {
                // Lỗi từ service hoặc validation
                errorMessage = error.message;

                // Nếu message có thông báo thành công nhưng format không đúng
                if (errorMessage.includes('successfully but response format is unexpected')) {
                    message.success('Blog đã được tạo thành công!');
                    navigate('/blogger/my-blogs');
                    return;
                }
            } else if (error && typeof error === 'object' && 'response' in error) {
                // Lỗi từ axios
                const axiosError = error as any;
                errorMessage = axiosError.response?.data?.message ||
                    axiosError.message ||
                    t('blogger.createBlog.messages.error');
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }; const handleSaveDraft = () => {
        form.submit();
    };

    const handlePublish = () => {
        form.submit();
    };

    return (
        <div className="create-blog-page">
            <div className="page-header">
                <div className="header-left">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/blogger/my-blogs')}
                        className="back-button"
                    >
                        {t('common.back')}
                    </Button>
                    <Title level={2} className="page-title">
                        {t('blogger.createBlog.title')}
                    </Title>
                </div>
                <div className="header-actions">
                    <Space>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={handlePreview}
                        >
                            {t('blogger.createBlog.preview')}
                        </Button>
                        <Button
                            icon={<SaveOutlined />}
                            onClick={handleSaveDraft}
                            loading={loading}
                        >
                            {t('blogger.createBlog.saveDraft')}
                        </Button>
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handlePublish}
                            loading={loading}
                        >
                            {t('blogger.createBlog.publish')}
                        </Button>
                    </Space>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={20}>
                    <Card className="main-form-card">                        <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="title"
                            label={t('blogger.createBlog.form.title')}
                            rules={[
                                { required: true, message: t('blogger.createBlog.validation.titleRequired') },
                                { max: 200, message: t('blogger.createBlog.validation.titleMaxLength') }
                            ]}
                        >
                            <Input
                                placeholder={t('blogger.createBlog.form.titlePlaceholder')}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label={t('blogger.createBlog.form.content')}
                            required
                        >
                            <div className="quill-wrapper">
                                <ReactQuill
                                    value={content}
                                    onChange={setContent}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder={t('blogger.createBlog.form.contentPlaceholder')}
                                    style={{ height: '400px', marginBottom: '50px' }}
                                />
                            </div>                        </Form.Item>
                    </Form>
                    </Card>
                </Col>                <Col xs={24} lg={4}>
                    <Card title={t('blogger.createBlog.sidebar.files')} size="small">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false}
                            multiple={true}
                            accept="image/*,.pdf,.doc,.docx"
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>
                                    {t('blogger.createBlog.sidebar.uploadFiles')}
                                </div>
                            </div>
                        </Upload>
                    </Card>
                </Col>
            </Row>            {/* Preview Modal */}
            <Modal
                title={t('blogger.createBlog.preview')}
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={null}
                width={800}
                className="blog-preview-modal"
            >
                {previewData && (
                    <div className="blog-preview">
                        {previewData.featuredImage && (
                            <img
                                src={previewData.featuredImage}
                                alt={previewData.title}
                                className="preview-image"
                                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', marginBottom: '20px' }}
                            />
                        )}
                        <Title level={2}>{previewData.title}</Title>
                        <Divider />
                        <div
                            className="preview-content"
                            dangerouslySetInnerHTML={{ __html: previewData.content }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CreateBlog;
