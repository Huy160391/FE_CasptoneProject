import { Form, Input, Button, Upload, Select, Typography, TimePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

interface ShopApplicationFormProps {
    form: any;
    submitting: boolean;
    beforeShopFileUpload: (file: any) => boolean;
    normFile: (e: any) => any;
    onFinish: (values: any) => void;
}

const ShopApplicationForm: React.FC<ShopApplicationFormProps> = ({
    form,
    submitting,
    beforeShopFileUpload,
    normFile,
    onFinish,
}) => {
    const { t } = useTranslation();

    return (
        <div className="shop-application-form job-application-form">
            <Title level={2}>{t('jobs.shopRegistration.form.title')}</Title>
            <Paragraph>{t('jobs.shopRegistration.form.description')}</Paragraph>
            <Form
                key="shop-form"
                form={form}
                layout="vertical"
                name="shop_application_form"
                onFinish={onFinish}
                className="form"
                validateTrigger={['onChange', 'onBlur']}
            >
                <Form.Item
                    name="shopName"
                    label={t('jobs.shopRegistration.form.shopName')}
                    rules={[{ required: true, message: t('jobs.shopRegistration.form.shopNameRequired') }]}
                >
                    <Input placeholder={t('jobs.shopRegistration.form.shopNamePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="representativeName"
                    label={t('jobs.shopRegistration.form.representativeName')}
                    rules={[{ required: true, message: t('jobs.shopRegistration.form.representativeNameRequired') }]}
                >
                    <Input placeholder={t('jobs.shopRegistration.form.representativeNamePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label={t('jobs.shopRegistration.form.phone')}
                    rules={[
                        { required: true, message: t('jobs.shopRegistration.form.phoneRequired') },
                        { pattern: /^0[0-9]{9,10}$/, message: t('jobs.shopRegistration.form.phoneInvalid') }
                    ]}
                >
                    <Input placeholder={t('jobs.shopRegistration.form.phonePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="email"
                    label={t('jobs.shopRegistration.form.email')}
                    rules={[
                        { required: true, message: t('jobs.shopRegistration.form.emailRequired') },
                        { type: 'email', message: t('jobs.shopRegistration.form.emailInvalid') }
                    ]}
                >
                    <Input placeholder={t('jobs.shopRegistration.form.emailPlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="website"
                    label={t('jobs.shopRegistration.form.website')}
                >
                    <Input placeholder={t('jobs.shopRegistration.form.websitePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="shopType"
                    label={t('jobs.shopRegistration.form.shopType')}
                    rules={[{ required: true, message: t('jobs.shopRegistration.form.shopTypeRequired') }]}
                >
                    <Select placeholder={t('jobs.shopRegistration.form.shopTypePlaceholder')}>
                        <Select.Option value="souvenir">{t('jobs.shopRegistration.form.shopTypes.souvenir')}</Select.Option>
                        <Select.Option value="localSpecialties">{t('jobs.shopRegistration.form.shopTypes.localSpecialties')}</Select.Option>
                        <Select.Option value="instantFood">{t('jobs.shopRegistration.form.shopTypes.instantFood')}</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="location"
                    label={t('jobs.shopRegistration.form.location')}
                    rules={[{ required: true, message: t('jobs.shopRegistration.form.locationRequired') }]}
                >
                    <Input placeholder={t('jobs.shopRegistration.form.locationPlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="openingHour"
                    label={t('jobs.shopRegistration.form.openingHour')}
                >
                    <TimePicker
                        placeholder={t('jobs.shopRegistration.form.openingHourPlaceholder')}
                        format="HH:mm"
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                <Form.Item
                    name="closingHour"
                    label={t('jobs.shopRegistration.form.closingHour')}
                >
                    <TimePicker
                        placeholder={t('jobs.shopRegistration.form.closingHourPlaceholder')}
                        format="HH:mm"
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                <Form.Item
                    name="shopDescription"
                    label={t('jobs.shopRegistration.form.shopDescription')}
                >
                    <Input.TextArea
                        placeholder={t('jobs.shopRegistration.form.shopDescriptionPlaceholder')}
                        rows={4}
                    />
                </Form.Item>
                <Form.Item
                    name="logo"
                    label={t('jobs.shopRegistration.form.logo')}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    <Upload
                        name="logo"
                        listType="picture"
                        beforeUpload={beforeShopFileUpload}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>{t('jobs.shopRegistration.form.selectLogo')}</Button>
                        <span className="upload-hint">{t('jobs.shopRegistration.form.fileHint')}</span>
                    </Upload>
                </Form.Item>
                <Form.Item
                    name="businessLicense"
                    label={t('jobs.shopRegistration.form.businessLicense')}
                    rules={[
                        { required: true, message: t('jobs.shopRegistration.form.businessLicenseRequired') }
                    ]}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    validateFirst
                >
                    <Upload
                        name="businessLicense"
                        listType="picture"
                        beforeUpload={beforeShopFileUpload}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>{t('jobs.shopRegistration.form.selectLicense')}</Button>
                        <span className="upload-hint">{t('jobs.shopRegistration.form.fileHint')}</span>
                    </Upload>
                </Form.Item>
                <Form.Item
                    name="businessCode"
                    label={t('jobs.shopRegistration.form.businessCode')}
                    rules={[{ required: true, message: t('jobs.shopRegistration.form.businessCodeRequired') }]}
                >
                    <Input placeholder={t('jobs.shopRegistration.form.businessCodePlaceholder')} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                        {t('jobs.shopRegistration.form.submit')}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ShopApplicationForm;
