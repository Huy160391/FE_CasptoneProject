import { useState } from 'react';
import { Row, Col, Form, Input, Button, Typography, Upload, Card, message, Modal, BackTop } from 'antd';
import { UploadOutlined, EnvironmentOutlined, PhoneOutlined, TeamOutlined, TrophyOutlined, ArrowUpOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './Career.scss';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import LoginModal from '@/components/auth/LoginModal';
import CareerImg from '@/assets/Career.jpg';

const { Title, Paragraph } = Typography;

const Career = () => {
    const { t } = useTranslation()
    // Tạo 2 instance form riêng biệt
    const [guideForm] = Form.useForm();
    const [shopForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false)
    const [cvFile, setCvFile] = useState<UploadFile[]>([])
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
    const [formType, setFormType] = useState<'guide' | 'shop'>('guide');
    const { isAuthenticated } = useAuthStore()

    const guideRequirements = [
        {
            icon: <TeamOutlined />,
            title: t('jobs.requirements.communication.title'),
            content: t('jobs.requirements.communication.content'),
        },
        {
            icon: <EnvironmentOutlined />,
            title: t('jobs.requirements.localKnowledge.title'),
            content: t('jobs.requirements.localKnowledge.content'),
        },
        {
            icon: <PhoneOutlined />,
            title: t('jobs.requirements.languages.title'),
            content: t('jobs.requirements.languages.content'),
        },
        {
            icon: <TrophyOutlined />,
            title: t('jobs.requirements.certification.title'),
            content: t('jobs.requirements.certification.content'),
        },
    ]

    // Yêu cầu shop dạng object để render card giống bên hướng dẫn viên
    const shopRequirements = [
        {
            icon: <TeamOutlined />,
            title: t('jobs.shopRegistration.requirements.legal.title'),
            content: t('jobs.shopRegistration.requirements.legal.content')
        },
        {
            icon: <EnvironmentOutlined />,
            title: t('jobs.shopRegistration.requirements.location.title'),
            content: t('jobs.shopRegistration.requirements.location.content')
        },
        {
            icon: <TrophyOutlined />,
            title: t('jobs.shopRegistration.requirements.quality.title'),
            content: t('jobs.shopRegistration.requirements.quality.content')
        },
        {
            icon: <PhoneOutlined />,
            title: t('jobs.shopRegistration.requirements.branding.title'),
            content: t('jobs.shopRegistration.requirements.branding.content')
        },
    ];

    const handleLoginModalOpen = () => {
        setIsLoginModalVisible(true)
    }

    const handleLoginModalClose = () => {
        setIsLoginModalVisible(false)
    }

    // File validation functions
    const beforeCvUpload = (file: RcFile) => {
        const isValidType =
            file.type === 'application/pdf' ||
            file.type === 'application/msword' ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.type === 'image/jpeg' ||
            file.type === 'image/png' ||
            file.type === 'image/jpg';
        const isLessThan5M = file.size / 1024 / 1024 < 5;

        if (!isValidType) {
            message.error(t('jobs.applicationForm.invalidCvFormat'));
            return false;
        }
        if (!isLessThan5M) {
            message.error(t('jobs.applicationForm.fileTooLarge'));
            return false;
        }
        // Luôn return false để chặn upload tự động
        return false;
    }

    const handleCvChange = ({ fileList }: { fileList: UploadFile[] }) => {
        // Update fileList and display notification when a valid file is added
        setCvFile(fileList)
        if (fileList.length > 0 && fileList[0].status === 'done') {
            message.success(`${fileList[0].name} ${t('jobs.applicationForm.fileUploadSuccess')}`)
        }
    }
    const handleSubmit = async (values: any) => {
        console.log('Form values:', values);

        // Validate CV file is uploaded
        if (!cvFile.length) {
            message.error(t('jobs.applicationForm.cvRequired'));
            return;
        }

        // Check if user is authenticated
        if (!isAuthenticated) {
            message.info(t('jobs.applicationForm.loginRequired') || 'Please log in to submit your application');
            handleLoginModalOpen();
            return;
        }

        try {
            setSubmitting(true);

            // Get the CV file from the upload component
            const file = cvFile[0].originFileObj as File;

            // Use userService instead of direct axios call
            const response = await userService.submitTourGuideApplication({
                email: values.email,
                curriculumVitae: file
            });

            console.log('API response:', response);

            // Show success message
            message.success(t('jobs.applicationForm.successMessage'));

            // Show modal with confirmation
            Modal.success({
                title: t('jobs.applicationForm.submissionSuccessTitle'),
                content: t('jobs.applicationForm.submissionSuccessContent'),
                className: 'career-success-modal',
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                okButtonProps: {
                    className: 'success-confirm-button',
                },
                onOk: () => {
                    // Reset form
                    guideForm.resetFields();
                    setCvFile([]);
                }
            });
        } catch (error) {
            console.error('Application submission error:', error);
            message.error(t('jobs.applicationForm.errorMessage'));
        } finally {
            setSubmitting(false);
        }
    }

    // File validation for shop logo and business license
    const beforeShopFileUpload = (file: RcFile) => {
        const isValidType =
            file.type === 'image/jpeg' ||
            file.type === 'image/png' ||
            file.type === 'image/jpg' ||
            file.type === 'application/pdf';
        const isLessThan5M = file.size / 1024 / 1024 < 5;
        if (!isValidType) {
            message.error(t('jobs.applicationForm.invalidCvFormat'));
            return false;
        }
        if (!isLessThan5M) {
            message.error(t('jobs.applicationForm.fileTooLarge'));
            return false;
        }
        // Luôn return false để chặn upload tự động
        return false;
    };

    // Submit form đăng ký shop
    const handleShopSubmit = async (values: any) => {
        // Kiểm tra đăng nhập
        if (!isAuthenticated) {
            message.info(t('jobs.applicationForm.loginRequired') || 'Please log in to submit your application');
            handleLoginModalOpen();
            return;
        }
        try {
            setSubmitting(true);
            // Lấy file từ UploadFile[]
            const logoFile = values.logo && values.logo[0]?.originFileObj;
            const licenseFile = values.businessLicense && values.businessLicense[0]?.originFileObj;
            if (!logoFile || !licenseFile) {
                message.error(t('jobs.applicationForm.fileRequired') || 'Vui lòng tải lên đầy đủ file!');
                return;
            }
            await userService.submitShopRegistration({
                shopName: values.shopName,
                representativeName: values.representativeName,
                website: values.website,
                shopType: values.shopType,
                location: values.location,
                email: values.email,
                logo: logoFile,
                businessLicense: licenseFile
            });
            message.success('Đăng ký shop thành công!');
            Modal.success({
                title:
                    t('jobs.shopRegistration.form.successTitle') !== 'jobs.shopRegistration.form.successTitle'
                        ? t('jobs.shopRegistration.form.successTitle')
                        : 'Đăng ký thành công',
                content:
                    t('jobs.shopRegistration.form.successContent') !== 'jobs.shopRegistration.form.successContent'
                        ? t('jobs.shopRegistration.form.successContent')
                        : 'Chúng tôi đã nhận được thông tin đăng ký shop của bạn.',
                className: 'career-success-modal',
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                okButtonProps: { className: 'success-confirm-button' },
                onOk: () => shopForm.resetFields()
            });
        } catch (error) {
            message.error(t('jobs.shopRegistration.form.errorMessage') || 'Đăng ký shop thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    // Thông tin shop bán hàng (giả lập)
    const shopInfo = {
        title: t('jobs.shopRegistration.info.title'),
        description: t('jobs.shopRegistration.info.description'),
        benefits: t('jobs.shopRegistration.info.benefitsList', { returnObjects: true }) as string[],
    };

    // Khi chuyển form, reset form tương ứng và clear file state
    const handleFormTypeChange = (type: 'guide' | 'shop') => {
        setFormType(type);
        if (type === 'guide') {
            guideForm.resetFields();
            setCvFile([]);
        } else {
            shopForm.resetFields();
        }
    };

    // Hàm đồng bộ fileList cho Upload với Form
    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    return (
        <div className="career-page">
            <div className="hero-section" style={{
                backgroundImage: `url(${CareerImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.45)',
                    zIndex: 1
                }} />
                <div className="hero-content" style={{ position: 'relative', zIndex: 2, color: '#fff', textAlign: 'center' }}>
                    <Title level={1} style={{ color: '#fff' }}>{formType === 'guide' ? t('jobs.title') : t('jobs.shopRegistration.title')}</Title>
                    <Paragraph style={{ color: '#fff' }}>{formType === 'guide' ? t('jobs.subtitle') : t('jobs.shopRegistration.subtitle')}</Paragraph>
                </div>
            </div>
            <div className="career-type-switcher">
                <div
                    className={`career-type-option${formType === 'guide' ? ' active' : ''}`}
                    onClick={() => handleFormTypeChange('guide')}
                >
                    {t('jobs.title')}
                </div>
                <div className="career-type-divider" />
                <div
                    className={`career-type-option${formType === 'shop' ? ' active' : ''}`}
                    onClick={() => handleFormTypeChange('shop')}
                >
                    {t('jobs.shopRegistration.title')}
                </div>
            </div>
            <div className="container">
                <Row gutter={[48, 48]}>
                    {formType === 'guide' && (
                        <>
                            <Col xs={24} lg={10}>
                                <div className="job-info">
                                    <Title level={2}>{t('jobs.jobInfo.title')}</Title>
                                    <Paragraph>
                                        {t('jobs.jobInfo.description')}
                                    </Paragraph>
                                    <Title level={3}>{t('jobs.jobInfo.jobDescription')}</Title>
                                    <ul>
                                        {(t('jobs.jobInfo.duties', { returnObjects: true }) as string[]).map((duty: string, index: number) => (
                                            <li key={index}>{duty}</li>
                                        ))}
                                    </ul>
                                    <Title level={3}>{t('jobs.jobInfo.benefits')}</Title>
                                    <ul>
                                        {(t('jobs.jobInfo.benefitsList', { returnObjects: true }) as string[]).map((benefit: string, index: number) => (
                                            <li key={index}>{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Col>
                            <Col xs={24} lg={14}>
                                <div className="job-application-form">
                                    <Title level={2}>{t('jobs.applicationForm.title')}</Title>
                                    <Paragraph>
                                        {t('jobs.applicationForm.description')}
                                    </Paragraph>
                                    <Form
                                        key="guide-form"
                                        form={guideForm}
                                        layout="vertical"
                                        name="job_application_form"
                                        onFinish={handleSubmit}
                                        className="form"
                                        validateTrigger="onSubmit"
                                    >
                                        <Form.Item
                                            name="fullName"
                                            label={t('jobs.applicationForm.fullName') || 'Họ tên'}
                                            rules={[{ required: true, message: t('jobs.applicationForm.fullNameRequired') || 'Vui lòng nhập họ tên' }]}
                                        >
                                            <Input placeholder={t('jobs.applicationForm.fullName') || 'Nhập họ tên'} />
                                        </Form.Item>
                                        <Form.Item
                                            name="phone"
                                            label={t('jobs.applicationForm.phone') || 'Số điện thoại'}
                                            rules={[{ required: true, message: t('jobs.applicationForm.phoneRequired') || 'Vui lòng nhập số điện thoại' }]}
                                        >
                                            <Input placeholder={t('jobs.applicationForm.phonePlaceholder') || 'Nhập số điện thoại'} />
                                        </Form.Item>
                                        <Form.Item
                                            name="email"
                                            label={t('jobs.applicationForm.email')}
                                            rules={[
                                                { required: true, message: t('jobs.applicationForm.emailRequired') },
                                                { type: 'email', message: t('jobs.applicationForm.emailInvalid') }
                                            ]}
                                        >
                                            <Input placeholder={t('jobs.applicationForm.emailPlaceholder')} />
                                        </Form.Item>
                                        <Form.Item
                                            name="experience"
                                            label={t('jobs.applicationForm.experience') || 'Kinh nghiệm'}
                                            rules={[{ required: true, message: t('jobs.applicationForm.experienceRequired') || 'Vui lòng nhập kinh nghiệm' }]}
                                        >
                                            <Input placeholder={t('jobs.applicationForm.experiencePlaceholder') || 'Nhập kinh nghiệm'} />
                                        </Form.Item>
                                        <Form.Item
                                            name="languages"
                                            label={t('jobs.applicationForm.languages') || 'Ngoại ngữ'}
                                            rules={[{ required: true, message: t('jobs.applicationForm.languagesRequired') || 'Vui lòng nhập ngoại ngữ' }]}
                                        >
                                            <Input placeholder={t('jobs.applicationForm.languagesPlaceholder') || 'Nhập ngoại ngữ'} />
                                        </Form.Item>
                                        <Form.Item
                                            name="cvFile"
                                            label={t('jobs.applicationForm.cv')}
                                            rules={[{ required: true, message: t('jobs.applicationForm.cvRequired') }]}
                                        >
                                            <Upload
                                                name="cv"
                                                listType="picture"
                                                fileList={cvFile}
                                                beforeUpload={beforeCvUpload}
                                                onChange={handleCvChange}
                                                maxCount={1}
                                            // Không truyền action để tránh upload tự động
                                            >
                                                <Button icon={<UploadOutlined />}>{t('jobs.applicationForm.selectFile')}</Button>
                                                <span className="upload-hint"> PDF, Word, hoặc hình ảnh (tối đa 5MB)</span>
                                            </Upload>
                                        </Form.Item>

                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                                                {t('jobs.applicationForm.submit')}
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </div>
                            </Col>
                        </>
                    )}
                    {formType === 'shop' && (
                        <>
                            <Col xs={24} lg={10}>
                                <div className="shop-info job-info">
                                    <Title level={2}>{shopInfo.title}</Title>
                                    <Paragraph>{shopInfo.description}</Paragraph>
                                    <Title level={3}>{t('jobs.shopRegistration.info.descriptionTitle')}</Title>
                                    <ul>
                                        <li>{t('jobs.shopRegistration.info.modelContent')}</li>
                                    </ul>
                                    <Title level={3}>{t('jobs.shopRegistration.info.benefits')}</Title>
                                    <ul>
                                        {shopInfo.benefits.map((benefit, idx) => (
                                            <li key={idx}>{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Col>
                            <Col xs={24} lg={14}>
                                <div className="shop-application-form job-application-form">
                                    <Title level={2}>{t('jobs.shopRegistration.form.title')}</Title>
                                    <Paragraph>{t('jobs.shopRegistration.form.description')}</Paragraph>
                                    <Form
                                        key="shop-form"
                                        form={shopForm}
                                        layout="vertical"
                                        name="shop_application_form"
                                        onFinish={handleShopSubmit}
                                        className="form"
                                    >
                                        <Form.Item name="shopName" label={t('jobs.shopRegistration.form.shopName')} rules={[{ required: true, message: t('jobs.shopRegistration.form.shopNameRequired') }]}><Input placeholder={t('jobs.shopRegistration.form.shopNamePlaceholder')} /></Form.Item>
                                        <Form.Item name="representativeName" label={t('jobs.shopRegistration.form.representativeName')} rules={[{ required: true, message: t('jobs.shopRegistration.form.representativeNameRequired') }]}><Input placeholder={t('jobs.shopRegistration.form.representativeNamePlaceholder')} /></Form.Item>
                                        <Form.Item name="website" label={t('jobs.shopRegistration.form.website')}><Input placeholder={t('jobs.shopRegistration.form.websitePlaceholder')} /></Form.Item>
                                        <Form.Item name="shopType" label={t('jobs.shopRegistration.form.shopType')} rules={[{ required: true, message: t('jobs.shopRegistration.form.shopTypeRequired') }]}><Input placeholder={t('jobs.shopRegistration.form.shopTypePlaceholder')} /></Form.Item>
                                        <Form.Item name="location" label={t('jobs.shopRegistration.form.location')} rules={[{ required: true, message: t('jobs.shopRegistration.form.locationRequired') }]}><Input placeholder={t('jobs.shopRegistration.form.locationPlaceholder')} /></Form.Item>
                                        <Form.Item
                                            name="logo"
                                            label={t('jobs.shopRegistration.form.logo')}
                                            rules={[{ required: true, message: t('jobs.shopRegistration.form.logoRequired') }]}
                                            valuePropName="fileList"
                                            getValueFromEvent={normFile}
                                        >
                                            <Upload name="logo" listType="picture" beforeUpload={beforeShopFileUpload} maxCount={1}>
                                                <Button icon={<UploadOutlined />}>{t('jobs.shopRegistration.form.selectLogo')}</Button> <span className="upload-hint">{t('jobs.shopRegistration.form.fileHint')}</span>
                                            </Upload>
                                        </Form.Item>
                                        <Form.Item
                                            name="businessLicense"
                                            label={t('jobs.shopRegistration.form.businessLicense')}
                                            rules={[{ required: true, message: t('jobs.shopRegistration.form.businessLicenseRequired') }]}
                                            valuePropName="fileList"
                                            getValueFromEvent={normFile}
                                        >
                                            <Upload name="businessLicense" listType="picture" beforeUpload={beforeShopFileUpload} maxCount={1}>
                                                <Button icon={<UploadOutlined />}>{t('jobs.shopRegistration.form.selectLicense')}</Button> <span className="upload-hint">{t('jobs.shopRegistration.form.fileHint')}</span>
                                            </Upload>
                                        </Form.Item>
                                        <Form.Item name="email" label={t('jobs.shopRegistration.form.email')} rules={[{ required: true, message: t('jobs.shopRegistration.form.emailRequired') }, { type: 'email', message: t('jobs.shopRegistration.form.emailInvalid') }]}><Input placeholder={t('jobs.shopRegistration.form.emailPlaceholder')} /></Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" size="large">{t('jobs.shopRegistration.form.submit')}</Button>
                                        </Form.Item>
                                    </Form>
                                </div>
                            </Col>
                        </>
                    )}
                </Row>
                {/* Requirements section - chỉ hiển thị khi là hướng dẫn viên hoặc shop */}
                {formType === 'guide' && (
                    <div className="requirements-section">
                        <Title level={2}>{t('jobs.jobInfo.requirements')}</Title>
                        <div className="requirement-cards">
                            {guideRequirements.map((req, index) => (
                                <Card className="requirement-card" key={index} bordered={false}>
                                    <div className="icon-wrapper">{req.icon}</div>
                                    <div className="content">
                                        <Title level={4}>{req.title}</Title>
                                        <Paragraph>{req.content}</Paragraph>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                {formType === 'shop' && (
                    <div className="requirements-section">
                        <Title level={2}>{t('jobs.shopRegistration.requirements.title')}</Title>
                        <div className="requirement-cards">
                            {shopRequirements.map((req, index) => (
                                <Card className="requirement-card" key={index} bordered={false}>
                                    <div className="icon-wrapper">{req.icon}</div>
                                    <div className="content">
                                        <Title level={4}>{req.title}</Title>
                                        <Paragraph>{req.content}</Paragraph>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <BackTop>
                <div className="back-to-top">
                    <ArrowUpOutlined />
                </div>
            </BackTop>

            {/* Login Modal */}
            <LoginModal
                isVisible={isLoginModalVisible}
                onClose={handleLoginModalClose}
                onRegisterClick={() => { }}
            />
        </div>
    );
};

export default Career;
