import { Form, Input, Button, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

interface GuideApplicationFormProps {
    form: any;
    submitting: boolean;
    cvFile: any[];
    beforeCvUpload: (file: any) => boolean;
    handleCvChange: (info: any) => void;
    onFinish: (values: any) => void;
}

const GuideApplicationForm: React.FC<GuideApplicationFormProps> = ({
    form,
    submitting,
    cvFile,
    beforeCvUpload,
    handleCvChange,
    onFinish,
}) => {
    const { t } = useTranslation();

    return (
        <div className="job-application-form">
            <Title level={2}>{t('jobs.applicationForm.title')}</Title>
            <Paragraph>{t('jobs.applicationForm.description')}</Paragraph>
            <Form
                key="guide-form"
                form={form}
                layout="vertical"
                name="job_application_form"
                onFinish={onFinish}
                className="form"
                validateTrigger="onSubmit"
            >
                <Form.Item
                    name="fullName"
                    label={t('jobs.applicationForm.fullName')}
                    rules={[{ required: true, message: t('jobs.applicationForm.fullNameRequired') }]}
                >
                    <Input placeholder={t('jobs.applicationForm.fullNamePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label={t('jobs.applicationForm.phone')}
                    rules={[
                        { required: true, message: t('jobs.applicationForm.phoneRequired') },
                        { pattern: /^0[0-9]{9,10}$/, message: t('jobs.applicationForm.phoneInvalid') }
                    ]}
                >
                    <Input placeholder={t('jobs.applicationForm.phonePlaceholder')} />
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
                    label={t('jobs.applicationForm.experience')}
                    rules={[{ required: true, message: t('jobs.applicationForm.experienceRequired') }]}
                >
                    <Input placeholder={t('jobs.applicationForm.experiencePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="languages"
                    label={t('jobs.applicationForm.languages')}
                    rules={[{ required: true, message: t('jobs.applicationForm.languagesRequired') }]}
                >
                    <Input placeholder={t('jobs.applicationForm.languagesPlaceholder')} />
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
                        <span className="upload-hint">{t('jobs.applicationForm.fileHint')}</span>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                        {t('jobs.applicationForm.submit')}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default GuideApplicationForm;
