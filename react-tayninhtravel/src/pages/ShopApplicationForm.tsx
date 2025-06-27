import { Form, Input, Button, Upload, Select, Typography, TimePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React from 'react';

const { Title, Paragraph } = Typography;

interface ShopApplicationFormProps {
    form: any;
    submitting: boolean;
    beforeShopFileUpload: (file: any) => boolean;
    normFile: (e: any) => any;
    onFinish: (values: any) => void;
    t: any;
}

const ShopApplicationForm: React.FC<ShopApplicationFormProps> = ({
    form,
    submitting,
    beforeShopFileUpload,
    normFile,
    onFinish,
    t,
}) => (
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
                name="representativeNameOnPaper"
                label="Tên đại diện trên giấy tờ"
                rules={[{ required: true, message: 'Vui lòng nhập tên đại diện trên giấy tờ' }]}
            >
                <Input placeholder="Nhập tên đại diện trên giấy tờ" />
            </Form.Item>
            <Form.Item
                name="phone"
                label={t('jobs.shopRegistration.form.phone') || 'Số điện thoại'}
                rules={[
                    { required: true, message: t('jobs.shopRegistration.form.phoneRequired') || 'Vui lòng nhập số điện thoại' },
                    { pattern: /^0[0-9]{9,10}$/, message: t('jobs.shopRegistration.form.phoneInvalid') || 'Số điện thoại không hợp lệ' }
                ]}
            >
                <Input placeholder={t('jobs.shopRegistration.form.phonePlaceholder') || 'Nhập số điện thoại'} />
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
                <Select placeholder={t('jobs.shopRegistration.form.shopTypePlaceholder') || 'Chọn loại cửa hàng'}>
                    <Select.Option value="souvenir">Cửa hàng quà lưu niệm</Select.Option>
                    <Select.Option value="local-specialties">Cửa hàng đặc sản địa phương</Select.Option>
                    <Select.Option value="instant-food">Cửa hàng bán đặc sản ăn liền</Select.Option>
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
                name="shopDescription"
                label="Mô tả shop"
            >
                <Input.TextArea placeholder="Nhập mô tả shop (không bắt buộc)" rows={3} />
            </Form.Item>
            <Form.Item
                name="openingHour"
                label="Giờ mở cửa"
            >
                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Chọn giờ mở cửa" />
            </Form.Item>
            <Form.Item
                name="closingHour"
                label="Giờ đóng cửa (optional)"
            >
                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Chọn giờ đóng cửa" />
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
                    { required: true, message: t('jobs.shopRegistration.form.businessLicenseRequired') || 'Vui lòng tải lên giấy phép kinh doanh!' }
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
                label="Mã số doanh nghiệp"
                rules={[{ required: true, message: 'Vui lòng nhập mã số doanh nghiệp' }]}
            >
                <Input placeholder="Nhập mã số doanh nghiệp" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                    {t('jobs.shopRegistration.form.submit')}
                </Button>
            </Form.Item>
        </Form>
    </div>
);

export default ShopApplicationForm;
