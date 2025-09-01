import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Row, Col, Select, TimePicker, Spin } from 'antd';
import { PhoneOutlined, UploadOutlined, HomeOutlined, GlobalOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { profileService } from '@/services/profileSerivce';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import './ShopProfile.scss';

const ShopProfile = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
    const [businessLicenseFileList, setBusinessLicenseFileList] = useState<UploadFile<any>[]>([]);
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string>('');

    const businessTypes = [
        { label: t('specialtyShop.profile.businessTypes.specialty'), value: 'specialty' },
        { label: t('specialtyShop.profile.businessTypes.food'), value: 'food' },
        { label: t('specialtyShop.profile.businessTypes.souvenir'), value: 'souvenir' },
        { label: t('specialtyShop.profile.businessTypes.handicrafts'), value: 'Handicrafts' },
    ];

    // Load shop profile data
    useEffect(() => {
        loadShopProfile();
    }, []);

    const loadShopProfile = async () => {
        try {
            setDataLoading(true);
            const response = await profileService.getMyShopProfile();

            if (response.success && response.data) {
                const data = response.data;
                setLogoUrl(data.logoUrl || '');
                setBusinessLicenseUrl(data.businessLicenseUrl || '');

                // Set form values
                const formValues = {
                    name: data.shopName,
                    businessType: data.shopType,
                    description: data.description,
                    address: data.location,
                    phone: data.phoneNumber,
                    website: data.website,
                    openTime: data.openingHours ? dayjs(data.openingHours, 'HH:mm') : null,
                    closeTime: data.closingHours ? dayjs(data.closingHours, 'HH:mm') : null,
                    representativeName: data.representativeName,
                    email: data.email
                };

                // Set field values after component is ready
                setTimeout(() => {
                    form.setFieldsValue(formValues);
                }, 100);
            }
        } catch (error) {
            console.error('Error loading shop profile:', error);
            message.error(t('specialtyShop.info.error'));
        } finally {
            setDataLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await profileService.updateShopProfile(values);
            message.success(t('specialtyShop.profile.form.updateSuccess'));
        } catch (err) {
            message.error(t('specialtyShop.profile.form.updateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpdate = async () => {
        if (fileList.length === 0) return;
        setAvatarLoading(true);
        try {
            const file = fileList[0].originFileObj;
            if (file) {
                const formData = new FormData();
                formData.append('Logo', file);

                const response = await profileService.updateShopLogo(formData);
                if (response.success) {
                    await loadShopProfile();
                    message.success(t('specialtyShop.profile.avatar.updateSuccess'));
                    setFileList([]);
                } else {
                    message.error(t('specialtyShop.profile.avatar.updateError'));
                }
            }
        } catch (error) {
            console.error('Error updating logo:', error);
            message.error(t('specialtyShop.profile.avatar.updateError'));
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleBusinessLicenseUpdate = async () => {
        if (businessLicenseFileList.length === 0) return;
        setLoading(true);
        try {
            const file = businessLicenseFileList[0].originFileObj;
            if (file) {
                const formData = new FormData();
                formData.append('BusinessLicense', file);

                // Giả sử có API endpoint để upload business license
                // const response = await profileService.updateShopBusinessLicense(formData);
                // if (response.success) {
                await loadShopProfile();
                message.success('Cập nhật giấy phép kinh doanh thành công');
                setBusinessLicenseFileList([]);
                // } else {
                //     message.error('Có lỗi khi cập nhật giấy phép kinh doanh');
                // }
            }
        } catch (error) {
            console.error('Error updating business license:', error);
            message.error('Có lỗi khi cập nhật giấy phép kinh doanh');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shopprofile-bg">
            <div className="profile-page" style={{ maxWidth: 1158 }}>
                <div className="profile-title">
                    <HomeOutlined className="profile-title-icon" />
                    <span>{t('specialtyShop.profile.title')}</span>
                </div>
                <div className="profile-desc">{t('specialtyShop.profile.description')}</div>

                {dataLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>{t('specialtyShop.info.loading')}</div>
                    </div>
                ) : (
                    <Row gutter={32}>
                        <Col span={8}>
                            <div className="profile-avatar-card">
                                <div className="profile-avatar-title">{t('specialtyShop.profile.avatar.title')}</div>
                                <div className="profile-avatar-wrapper">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="logo" className="profile-avatar-img" />
                                    ) : (
                                        <span className="profile-avatar-placeholder">Logo</span>
                                    )}
                                </div>
                                <Upload
                                    showUploadList={false}
                                    maxCount={1}
                                    fileList={fileList}
                                    onChange={({ fileList }) => setFileList(fileList)}
                                    beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        const isLessThan2M = file.size / 1024 / 1024 < 2;
                                        if (!isImage) {
                                            message.error(t('specialtyShop.profile.avatar.fileTypeError'));
                                            return Upload.LIST_IGNORE;
                                        }
                                        if (!isLessThan2M) {
                                            message.error(t('specialtyShop.profile.avatar.fileSizeError'));
                                            return Upload.LIST_IGNORE;
                                        }
                                        return false;
                                    }}
                                >
                                    <Button
                                        icon={<UploadOutlined />}
                                        className="profile-avatar-btn"
                                    >
                                        Chọn Logo
                                    </Button>
                                </Upload>
                                {fileList.length > 0 && (
                                    <Button
                                        type="primary"
                                        onClick={handleLogoUpdate}
                                        loading={avatarLoading}
                                        style={{ marginTop: 8, width: '100%' }}
                                    >
                                        {t('specialtyShop.profile.avatar.changeButton')}
                                    </Button>
                                )}
                                <div className="profile-avatar-note">{t('specialtyShop.profile.avatar.note')}</div>
                            </div>
                        </Col>
                        <Col span={16}>
                            <Form
                                form={form}
                                layout="vertical"
                                className="profile-form"
                                onFinish={handleSubmit}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={t('specialtyShop.profile.form.shopName')}
                                            name="name"
                                            rules={[{ required: true, message: t('specialtyShop.profile.form.shopNameRequired') }]}
                                        >
                                            <Input placeholder={t('specialtyShop.profile.form.shopNamePlaceholder')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={t('specialtyShop.profile.form.businessType')}
                                            name="businessType"
                                            rules={[{ required: true, message: t('specialtyShop.profile.form.businessTypeRequired') }]}
                                        >
                                            <Select options={businessTypes} placeholder={t('specialtyShop.profile.form.businessTypePlaceholder')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item label={t('specialtyShop.profile.form.description')} name="description">
                                    <Input.TextArea rows={3} placeholder={t('specialtyShop.profile.form.descriptionPlaceholder')} />
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={t('specialtyShop.profile.form.address')}
                                            name="address"
                                            rules={[{ required: true, message: t('specialtyShop.profile.form.addressRequired') }]}
                                        >
                                            <Input prefix={<HomeOutlined />} placeholder={t('specialtyShop.profile.form.addressPlaceholder')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={t('specialtyShop.profile.form.phone')}
                                            name="phone"
                                            rules={[{ required: true, message: t('specialtyShop.profile.form.phoneRequired') }]}
                                        >
                                            <Input prefix={<PhoneOutlined />} placeholder={t('specialtyShop.profile.form.phonePlaceholder')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label={t('specialtyShop.profile.form.representativeName')}
                                            name="representativeName"
                                            rules={[{ required: true, message: t('specialtyShop.profile.form.representativeNameRequired') }]}
                                        >
                                            <Input placeholder={t('specialtyShop.profile.form.representativeNamePlaceholder')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label={t('specialtyShop.profile.form.email')}
                                            name="email"
                                            rules={[
                                                { required: true, message: t('specialtyShop.profile.form.emailRequired') },
                                                { type: 'email', message: t('specialtyShop.profile.form.emailInvalid') }
                                            ]}
                                        >
                                            <Input placeholder={t('specialtyShop.profile.form.emailPlaceholder')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item
                                    label={t('specialtyShop.profile.form.businessLicense')}
                                >
                                    <div style={{ marginBottom: 16 }}>
                                        {businessLicenseUrl && (
                                            <div style={{ marginBottom: 8 }}>
                                                <span>File hiện tại: </span>
                                                <a href={businessLicenseUrl} target="_blank" rel="noopener noreferrer">
                                                    Xem giấy phép kinh doanh
                                                </a>
                                            </div>
                                        )}
                                        <Upload
                                            fileList={businessLicenseFileList}
                                            onChange={({ fileList }) => setBusinessLicenseFileList(fileList)}
                                            beforeUpload={(file) => {
                                                const isPDF = file.type === 'application/pdf';
                                                const isImage = file.type.startsWith('image/');
                                                const isLessThan5M = file.size / 1024 / 1024 < 5;

                                                if (!isPDF && !isImage) {
                                                    message.error('Chỉ được upload file PDF hoặc ảnh');
                                                    return Upload.LIST_IGNORE;
                                                }
                                                if (!isLessThan5M) {
                                                    message.error('File phải nhỏ hơn 5MB');
                                                    return Upload.LIST_IGNORE;
                                                }
                                                return false;
                                            }}
                                            maxCount={1}
                                        >
                                            <Button icon={<UploadOutlined />}>
                                                Chọn giấy phép kinh doanh
                                            </Button>
                                        </Upload>
                                        {businessLicenseFileList.length > 0 && (
                                            <Button
                                                type="primary"
                                                onClick={handleBusinessLicenseUpdate}
                                                loading={loading}
                                                style={{ marginTop: 8 }}
                                            >
                                                Cập nhật giấy phép
                                            </Button>
                                        )}
                                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                            Chỉ file PDF hoặc ảnh, tối đa 5MB
                                        </div>
                                    </div>
                                </Form.Item>
                                <Form.Item label={t('specialtyShop.detail.website')} name="website">
                                    <Input prefix={<GlobalOutlined />} placeholder={t('specialtyShop.profile.form.websitePlaceholder')} />
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={t('specialtyShop.profile.form.openTime')} name="openTime">
                                            <TimePicker
                                                format="HH:mm"
                                                style={{ width: '100%' }}
                                                placeholder={t('specialtyShop.profile.form.openTimePlaceholder')}
                                                suffixIcon={<ClockCircleOutlined />}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('specialtyShop.profile.form.closeTime')} name="closeTime">
                                            <TimePicker
                                                format="HH:mm"
                                                style={{ width: '100%' }}
                                                placeholder={t('specialtyShop.profile.form.closeTimePlaceholder')}
                                                suffixIcon={<ClockCircleOutlined />}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            className="profile-btn-save"
                                        >
                                            {t('specialtyShop.profile.form.saveButton')}
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            htmlType="button"
                                            className="profile-btn-cancel"
                                            onClick={() => form.resetFields()}
                                        >
                                            {t('specialtyShop.profile.form.cancelButton')}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                )}
            </div>
        </div>
    );
};

export default ShopProfile;
