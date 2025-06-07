import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Upload,
    Select,
    Tag,
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
    PlusOutlined,
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
import './CreateBlog.scss'; // Reuse the same styles

const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

interface BlogFormData {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    featuredImage: string;
    status: 'draft' | 'published';
}

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    featuredImage: string;
    status: 'draft' | 'published' | 'pending' | 'rejected';
    views: number;
    likes: number;
    createdAt: string;
    updatedAt: string;
}

const EditBlog: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [inputTag, setInputTag] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);

    const categories = [
        'Du lịch',
        'Văn hóa',
        'Ẩm thực',
        'Lễ hội',
        'Kinh nghiệm',
        'Khám phá',
        'Tips'
    ];

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

    // Load existing blog post data
    useEffect(() => {
        const loadBlogPost = async () => {
            try {
                setInitialLoading(true);

                // Simulate API call to fetch blog post
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock data - in real app, this would come from API
                const mockPost: BlogPost = {
                    id: id || '1',
                    title: 'Khám phá vẻ đẹp Tây Ninh - Hành trình khó quên',
                    excerpt: 'Tây Ninh không chỉ nổi tiếng với Núi Bà Đen mà còn có nhiều điểm du lịch thú vị khác...',
                    content: `<h2>Giới thiệu về Tây Ninh</h2>
                    <p>Tây Ninh là một tỉnh ở miền Nam Việt Nam, nổi tiếng với <strong>Núi Bà Đen</strong> - ngọn núi cao nhất Nam Bộ và <em>Tòa Thánh Cao Đài</em> - trung tâm tôn giáo độc đáo.</p>
                    
                    <h3>Các điểm đến nổi tiếng</h3>
                    <ul>
                        <li>Núi Bà Đen với hệ thống cáp treo hiện đại</li>
                        <li>Tòa Thánh Cao Đài với kiến trúc độc đáo</li>
                        <li>Địa đạo Củ Chi với lịch sử hào hùng</li>
                        <li>Hồ Dầu Tiếng thơ mộng</li>
                    </ul>
                    
                    <blockquote>
                        "Tây Ninh là vùng đất của những câu chuyện huyền thoại và vẻ đẹp thiên nhiên tuyệt vời."
                    </blockquote>`,
                    category: 'Du lịch',
                    tags: ['Tây Ninh', 'Du lịch', 'Khám phá'],
                    featuredImage: 'https://example.com/featured-image.jpg',
                    status: 'published',
                    views: 150,
                    likes: 25,
                    createdAt: '2024-01-15',
                    updatedAt: '2024-01-16'
                };

                setBlogPost(mockPost);

                // Set form data
                form.setFieldsValue({
                    title: mockPost.title,
                    excerpt: mockPost.excerpt,
                    category: mockPost.category,
                });

                setContent(mockPost.content);
                setTags(mockPost.tags);

                if (mockPost.featuredImage) {
                    setFileList([{
                        uid: '-1',
                        name: 'featured-image.jpg',
                        status: 'done',
                        url: mockPost.featuredImage,
                    }]);
                }

            } catch (error) {
                message.error(t('blogger.editBlog.messages.loadError'));
            } finally {
                setInitialLoading(false);
            }
        };

        if (id) {
            loadBlogPost();
        }
    }, [id, form, t]);

    const handleAddTag = () => {
        if (inputTag && !tags.includes(inputTag)) {
            setTags([...tags, inputTag]);
            setInputTag('');
        }
    };

    const handleRemoveTag = (removedTag: string) => {
        setTags(tags.filter(tag => tag !== removedTag));
    };

    const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setFileList(fileList);
    };

    const handlePreview = () => {
        const formData = form.getFieldsValue();
        setPreviewData({
            ...formData,
            content,
            tags,
            featuredImage: fileList[0]?.url || fileList[0]?.thumbUrl || ''
        });
        setPreviewVisible(true);
    }; const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const blogData: BlogFormData = {
                title: values.title,
                excerpt: values.excerpt,
                content: content,
                category: values.category,
                tags: tags,
                featuredImage: fileList[0]?.url || fileList[0]?.thumbUrl || '',
                status: values.status
            };

            // Simulate API call with the blog data
            console.log('Updating blog post:', blogData);
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success(t('blogger.editBlog.messages.success'));
            navigate('/blogger/my-blogs');
        } catch (error) {
            message.error(t('blogger.editBlog.messages.error'));
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
                    <Col xs={24} lg={18}>
                        <Card>
                            <Skeleton active paragraph={{ rows: 8 }} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={6}>
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
                <Col xs={24} lg={18}>
                    <Card className="main-form-card">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{
                                status: blogPost.status
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
                                />
                            </Form.Item>

                            <Form.Item
                                name="excerpt"
                                label={t('blogger.createBlog.form.excerpt')}
                                rules={[
                                    { required: true, message: t('blogger.createBlog.validation.excerptRequired') },
                                    { max: 500, message: t('blogger.createBlog.validation.excerptMaxLength') }
                                ]}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder={t('blogger.createBlog.form.excerptPlaceholder')}
                                    showCount
                                    maxLength={500}
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
                                </div>
                            </Form.Item>

                            <Form.Item name="status" style={{ display: 'none' }}>
                                <Input />
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={6}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
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

                        <Card title={t('blogger.createBlog.sidebar.category')} size="small">
                            <Form.Item
                                name="category"
                                rules={[
                                    { required: true, message: t('blogger.createBlog.validation.categoryRequired') }
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    placeholder={t('blogger.createBlog.sidebar.selectCategory')}
                                    style={{ width: '100%' }}
                                >
                                    {categories.map(category => (
                                        <Option key={category} value={category}>
                                            {category}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Card>

                        <Card title={t('blogger.createBlog.sidebar.tags')} size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder={t('blogger.createBlog.sidebar.addTag')}
                                        value={inputTag}
                                        onChange={(e) => setInputTag(e.target.value)}
                                        onPressEnter={handleAddTag}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddTag}
                                    />
                                </Space.Compact>

                                <div className="tags-container">
                                    {tags.map(tag => (
                                        <Tag
                                            key={tag}
                                            closable
                                            onClose={() => handleRemoveTag(tag)}
                                        >
                                            {tag}
                                        </Tag>
                                    ))}
                                </div>
                            </Space>
                        </Card>

                        {/* Blog Status Info */}
                        <Card title={t('blogger.editBlog.status')} size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <strong>{t('blogger.editBlog.currentStatus')}:</strong>{' '}
                                    <Tag color={
                                        blogPost.status === 'published' ? 'green' :
                                            blogPost.status === 'draft' ? 'orange' :
                                                blogPost.status === 'pending' ? 'blue' : 'red'
                                    }>
                                        {blogPost.status.toUpperCase()}
                                    </Tag>
                                </div>
                                <div>
                                    <strong>{t('blogger.editBlog.views')}:</strong> {blogPost.views}
                                </div>
                                <div>
                                    <strong>{t('blogger.editBlog.likes')}:</strong> {blogPost.likes}
                                </div>
                                <div>
                                    <strong>{t('blogger.editBlog.lastUpdated')}:</strong><br />
                                    {new Date(blogPost.updatedAt).toLocaleString()}
                                </div>
                            </Space>
                        </Card>
                    </Space>
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
                            />
                        )}
                        <Title level={2}>{previewData.title}</Title>
                        <p className="preview-excerpt">{previewData.excerpt}</p>
                        <div className="preview-meta">
                            <Tag color="blue">{previewData.category}</Tag>
                            {previewData.tags?.map((tag: string) => (
                                <Tag key={tag}>{tag}</Tag>
                            ))}
                        </div>
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
