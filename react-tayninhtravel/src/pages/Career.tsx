import { useState } from 'react';
import { Row, Col, Typography, Card, message, Modal, BackTop } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import Form from 'antd/es/form';
import { EnvironmentOutlined, PhoneOutlined, TeamOutlined, TrophyOutlined, ArrowUpOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './Career.scss';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import LoginModal from '@/components/auth/LoginModal';
import CareerImg from '@/assets/Career.jpg';
import GuideApplicationForm from './GuideApplicationForm';
import ShopApplicationForm from './ShopApplicationForm';

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

            // Nhận skills (ID) và skillsString từ form, không mapping lại
            const { skills, skillsString } = values;

            // Submit đầy đủ thông tin
            const response = await userService.submitTourGuideApplication({
                fullName: values.fullName,
                phone: values.phone,
                email: values.email,
                experience: values.experience,
                skills,
                skillsString,
                curriculumVitae: file
            } as any);

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
            if (!licenseFile) {
                message.error(t('jobs.applicationForm.fileRequired') || 'Vui lòng tải lên file giấy phép kinh doanh!');
                return;
            }
            await userService.submitShopRegistration({
                shopName: values.shopName,
                representativeName: values.representativeName,
                representativeNameOnPaper: values.representativeNameOnPaper,
                phone: values.phone,
                email: values.email,
                website: values.website,
                shopType: values.shopType,
                location: values.location,
                shopDescription: values.shopDescription,
                openingHour: values.openingHour,
                closingHour: values.closingHour,
                logo: logoFile,
                businessLicense: licenseFile,
                businessCode: values.businessCode,
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
                                <GuideApplicationForm
                                    form={guideForm}
                                    submitting={submitting}
                                    cvFile={cvFile}
                                    beforeCvUpload={beforeCvUpload}
                                    handleCvChange={handleCvChange}
                                    onFinish={handleSubmit}
                                />
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
                                <ShopApplicationForm
                                    form={shopForm}
                                    submitting={submitting}
                                    beforeShopFileUpload={beforeShopFileUpload}
                                    normFile={normFile}
                                    onFinish={handleShopSubmit}
                                />
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
