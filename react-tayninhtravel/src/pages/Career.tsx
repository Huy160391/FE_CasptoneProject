import React, { useState } from 'react';
import { Row, Col, Form, Input, Button, Typography, Upload, Card, message, Modal } from 'antd';
import { UploadOutlined, EnvironmentOutlined, PhoneOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './Career.scss';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

const { Title, Paragraph } = Typography;

const Career = () => {
    const { t } = useTranslation()
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const [cvFile, setCvFile] = useState<UploadFile[]>([])    // We don't need photoFile state anymore as we're simplifying the form

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
    ]    // File validation functions
    const beforeCvUpload = (file: RcFile) => {
        const isValidType = file.type === 'image/jpeg' ||
            file.type === 'image/png' ||
            file.type === 'image/jpg'
        const isLessThan5M = file.size / 1024 / 1024 < 5

        if (!isValidType) {
            message.error(t('jobs.applicationForm.invalidCvFormat'))
        }

        if (!isLessThan5M) {
            message.error(t('jobs.applicationForm.fileTooLarge'))
        }

        return false
    }
    const handleCvChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setCvFile(fileList)
    }    // We don't need the handlePhotoChange function anymore

    const handleSubmit = async (values: any) => {
        console.log('Form values:', values)

        // Validate CV file is uploaded
        if (!cvFile.length) {
            message.error(t('jobs.applicationForm.cvRequired'))
            return
        }

        try {
            setSubmitting(true)            // Here you would typically send the data to your backend API
            // For example:
            // const formData = new FormData()
            // formData.append('email', values.email)
            // if (cvFile[0].originFileObj) {
            //   formData.append('cvFile', cvFile[0].originFileObj)
            // }
            // await axios.post('/api/career-applications', formData)

            // Simulate API request
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Show success message
            message.success(t('jobs.applicationForm.successMessage'))

            // Show modal with confirmation
            Modal.success({
                title: t('jobs.applicationForm.submissionSuccessTitle'),
                content: t('jobs.applicationForm.submissionSuccessContent'),
                onOk: () => {                    // Reset form
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
                            <Paragraph>
                                {(t('jobs.jobInfo.duties', { returnObjects: true }) as string[]).map((duty: string, index: number) => (
                                    <React.Fragment key={index}>
                                        - {duty}<br />
                                    </React.Fragment>
                                ))}
                            </Paragraph>

                            <Title level={3}>{t('jobs.jobInfo.benefits')}</Title>
                            <Paragraph>
                                {(t('jobs.jobInfo.benefitsList', { returnObjects: true }) as string[]).map((benefit: string, index: number) => (
                                    <React.Fragment key={index}>
                                        - {benefit}<br />
                                    </React.Fragment>
                                ))}
                            </Paragraph>

                            <Title level={3}>{t('jobs.jobInfo.requirements')}</Title>
                            <div className="requirement-cards">
                                {guideRequirements.map((req, index) => (
                                    <Card className="requirement-card" key={index}>
                                        <div className="icon-wrapper">{req.icon}</div>
                                        <div className="content">
                                            <Title level={5}>{req.title}</Title>
                                            <Paragraph>{req.content}</Paragraph>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} lg={14}>
                        <div className="job-application-form">
                            <Title level={2}>{t('jobs.applicationForm.title')}</Title>
                            <Paragraph>
                                {t('jobs.applicationForm.description')}
                            </Paragraph>                            <Form
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
                                        <span className="upload-hint"> {t('jobs.applicationForm.photoHint')}</span>
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
            </div>
        </div>
    );
};

export default Career;
