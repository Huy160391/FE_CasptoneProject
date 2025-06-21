import React, { useState, useEffect } from 'react';
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
    Typography,
    Skeleton
} from 'antd';
import {
    UploadOutlined,
    SaveOutlined,
    EyeOutlined,
    SendOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { UploadFile } from 'antd/es/upload/interface';
import bloggerService from '@/services/bloggerService';
import type { UpdateBlogPayload, BlogPost } from '@/types';
import './CreateBlog.scss';

const { Title } = Typography;

const EditBlog: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [content, setContent] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);

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
        'align', 'link', 'image', 'video', 'blockquote', 'code-block'
    ];

    useEffect(() => {
        const loadBlogPost = async () => {
            if (!id) {
                message.error(t('blogger.editBlog.messages.invalidId'));
                navigate('/blogger/my-blogs');
                return;
            }

            try {
                setInitialLoading(true);
                const post = await bloggerService.getBlogById(id);
                setBlogPost(post);

                form.setFieldsValue({
                    title: post.title
                }); setContent(post.content || '');

                // Load existing files nếu có
                if (post.featuredImage) {
                    setFileList([{
                        uid: '-1',
                        name: 'existing-file',
                        status: 'done',
                        url: post.featuredImage
                    }]);
                }
            } catch (error) {
                console.error('Error loading blog post:', error);
                message.error(t('blogger.editBlog.messages.loadError'));
                navigate('/blogger/my-blogs');
            } finally {
                setInitialLoading(false);
            }
        };

        loadBlogPost();
    }, [id, form, t, navigate]);

    const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setFileList(fileList);
    };

    const handlePreview = () => {
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

        if (!id) {
            message.error(t('blogger.editBlog.messages.invalidId'));
            return;
        } try {
            setLoading(true);

            // Chuyển đổi UploadFile thành File (chỉ lấy file mới upload)
            const files: File[] = fileList
                .filter(file => file.originFileObj)
                .map(file => file.originFileObj as File);

            const blogData: UpdateBlogPayload = {
                id: id,
                title: values.title,
                content: content,
                files: files.length > 0 ? files : undefined
            };

            console.log('Updating blog with data:', blogData);

            const result = await bloggerService.updateBlog(blogData);
            console.log('Blog updated successfully:', result);

            message.success(t('blogger.editBlog.messages.success'));
            navigate('/blogger/my-blogs');
        } catch (error) {
            console.error('Error updating blog:', error);

            // Xử lý lỗi chi tiết hơn
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                const errorMessage = axiosError.response?.data?.message ||
                    axiosError.message ||
                    t('blogger.editBlog.messages.updateError');
                message.error(errorMessage);
            } else {
                message.error(t('blogger.editBlog.messages.updateError'));
            }
        } finally {
            setLoading(false);
        }
    }; const handleSaveDraft = () => {
        form.submit();
    };

    const handlePublish = () => {
        form.submit();
    };

    if (initialLoading) {
        return (
            <div className="create-blog-page">
                <div className="page-header">
                    <Skeleton.Button active style={{ width: 200, height: 32 }} />
                    <Space>
                        <Skeleton.Button active style={{ width: 80 }} />
                        <Skeleton.Button active style={{ width: 100 }} />
                        <Skeleton.Button active style={{ width: 80 }} />
                    </Space>
                </div>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={20}>
                        <Card>
                            <Skeleton active paragraph={{ rows: 8 }} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={4}>
                        <Card>
                            <Skeleton active paragraph={{ rows: 3 }} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    if (!blogPost) {
        return (
            <div className="create-blog-page">
                <Card>
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Title level={3}>{t('blogger.editBlog.notFound')}</Title>
                        <Button type="primary" onClick={() => navigate('/blogger/my-blogs')}>
                            {t('common.back')}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

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
                        {t('blogger.editBlog.title')}
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
                            </div>                            </Form.Item>
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
            </Row>

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

export default EditBlog;
