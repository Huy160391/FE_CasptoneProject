import { Form, Input, Button, Upload, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';

const { Title, Paragraph } = Typography;

interface GuideApplicationFormProps {
    form: any;
    submitting: boolean;
    cvFile: any[];
    beforeCvUpload: (file: any) => boolean;
    handleCvChange: (info: any) => void;
    onFinish: (values: any) => void;
    t: any;
}

const GuideApplicationForm: React.FC<GuideApplicationFormProps> = ({
    form,
    submitting,
    cvFile,
    beforeCvUpload,
    handleCvChange,
    onFinish,
    t,
}) => (
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
                label={t('jobs.applicationForm.fullName') || 'Họ tên'}
                rules={[{ required: true, message: t('jobs.applicationForm.fullNameRequired') || 'Vui lòng nhập họ tên' }]}
            >
                <Input placeholder={t('jobs.applicationForm.fullName') || 'Nhập họ tên'} />
            </Form.Item>
            <Form.Item
                name="phone"
                label={t('jobs.applicationForm.phone') || 'Số điện thoại'}
                rules={[
                    { required: true, message: t('jobs.applicationForm.phoneRequired') || 'Vui lòng nhập số điện thoại' },
                    { pattern: /^0[0-9]{9,10}$/, message: t('jobs.applicationForm.phoneInvalid') || 'Số điện thoại không hợp lệ' }
                ]}
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
);

export default GuideApplicationForm;
