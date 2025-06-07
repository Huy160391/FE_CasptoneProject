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
import './CreateBlog.scss';

const { Title } = Typography;

interface BlogFormData {
    title: string;
    content: string;
    featuredImage: string;
    status: 'draft' | 'published';
}

const CreateBlog: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [content, setContent] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false); const [previewData, setPreviewData] = useState<any>(null);

    const quillModules = {
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
        'align', 'link', 'image', 'video', 'blockquote', 'code-block'];

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
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const blogData: BlogFormData = {
                title: values.title,
                content: content,
                featuredImage: fileList[0]?.url || fileList[0]?.thumbUrl || '',
                status: values.status
            };

            // Simulate API call - in real app, this would send blogData to the server
            console.log('Creating blog:', blogData);
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success(t('blogger.createBlog.messages.success'));
            navigate('/blogger/my-blogs');
        } catch (error) {
            message.error(t('blogger.createBlog.messages.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = () => {
        form.setFieldValue('status', 'draft');
        form.submit();
    };

    const handlePublish = () => {
        form.setFieldValue('status', 'published');
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
                    <Card className="main-form-card">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{
                                status: 'draft'
                            }}
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
                                />                            </Form.Item>

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
                                </div>
                            </Form.Item>

                            <Form.Item name="status" style={{ display: 'none' }}>
                                <Input />
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={4}>
                    <Card title={t('blogger.createBlog.sidebar.featured')} size="small">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            {fileList.length === 0 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>
                                        {t('blogger.createBlog.sidebar.uploadImage')}
                                    </div>
                                </div>
                            )}
                        </Upload>
                    </Card>
                </Col>
            </Row>

            {/* Preview Modal */}
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
                            />)}
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
