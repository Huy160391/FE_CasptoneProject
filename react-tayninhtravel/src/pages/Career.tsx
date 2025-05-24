import { useState } from 'react';
import { Row, Col, Form, Input, Button, Typography, Upload, Card, message, Modal, BackTop } from 'antd';
import { UploadOutlined, EnvironmentOutlined, PhoneOutlined, TeamOutlined, TrophyOutlined, ArrowUpOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './Career.scss';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import axiosInstance from '@/config/axios';
import { useAuthStore } from '@/store/useAuthStore';
import LoginModal from '@/components/auth/LoginModal';

const { Title, Paragraph } = Typography;

const Career = () => {
    const { t } = useTranslation()
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const [cvFile, setCvFile] = useState<UploadFile[]>([])
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
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
            file.type === 'image/jpg'
        const isLessThan5M = file.size / 1024 / 1024 < 5

        if (!isValidType) {
            message.error(t('jobs.applicationForm.invalidCvFormat'))
        }

        if (!isLessThan5M) {
            message.error(t('jobs.applicationForm.fileTooLarge'))
        } return (isValidType && isLessThan5M) || Upload.LIST_IGNORE
    }

    const handleCvChange = ({ fileList }: { fileList: UploadFile[] }) => {
        // Update fileList and display notification when a valid file is added
        setCvFile(fileList)
        if (fileList.length > 0 && fileList[0].status === 'done') {
            message.success(`${fileList[0].name} ${t('jobs.applicationForm.fileUploadSuccess')}`)
        }
    }

    const handleSubmit = async (values: any) => {
        console.log('Form values:', values)

        // Validate CV file is uploaded
        if (!cvFile.length) {
            message.error(t('jobs.applicationForm.cvRequired'))
            return
        }

        // Check if user is authenticated
        if (!isAuthenticated) {
            message.info(t('jobs.applicationForm.loginRequired') || 'Please log in to submit your application')
            handleLoginModalOpen()
            return
        }

        try {
            setSubmitting(true)

            // Create FormData object for file upload
            const formData = new FormData()
            formData.append('Email', values.email)

            // Add the CV file if it exists
            if (cvFile[0].originFileObj) {
                formData.append('CurriculumVitae', cvFile[0].originFileObj)
            }            // Send API request to the specified endpoint
            // The token will be automatically included by the axios interceptor in the headers
            const response = await axiosInstance.post('/Account/tourguide-application', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            })

            console.log('API response:', response.data)

            // Show success message
            message.success(t('jobs.applicationForm.successMessage'))

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
                    form.resetFields()
                    setCvFile([])
                }
            })
        } catch (error) {
            console.error('Application submission error:', error)
            message.error(t('jobs.applicationForm.errorMessage'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="career-page">
            <div className="hero-section">
                <div className="hero-content">
                    <Title level={1}>{t('jobs.title')}</Title>
                    <Paragraph>{t('jobs.subtitle')}</Paragraph>
                </div>
            </div>

            <div className="container">
                <Row gutter={[48, 48]}>
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
                                form={form}
                                layout="vertical"
                                name="job_application_form"
                                onFinish={handleSubmit}
                                className="form"
                            >
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
                </Row>

                {/* Requirements section - full width */}                <div className="requirements-section">
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
                </div>            </div>            <BackTop>
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
