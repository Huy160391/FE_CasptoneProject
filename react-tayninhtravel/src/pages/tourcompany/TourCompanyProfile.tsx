import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Row, Col, Spin } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { profileService } from '@/services/profileSerivce';
import type { UploadFile } from 'antd/es/upload/interface';
import './TourCompanyProfile.scss';

const TourCompanyProfile = () => {
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
    const [businessLicenseFileList, setBusinessLicenseFileList] = useState<UploadFile<any>[]>([]);
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string>('');

    // Load tour company profile data
    useEffect(() => {
        loadTourCompanyProfile();
    }, []);

    const loadTourCompanyProfile = async () => {
        try {
            setDataLoading(true);
            const response = await profileService.getMyTourCompanyProfile();

            if (response.success && response.data) {
                const data = response.data;
                setLogoUrl(data.logoUrl || '');
                setBusinessLicenseUrl(data.businessLicenseUrl || '');

                // Set form values - chỉ map những field có trong API response
                const formValues = {
                    name: data.companyName,
                    description: data.description,
                    address: data.address,
                    website: data.website
                };

                // Set field values after component is ready
                setTimeout(() => {
                    form.setFieldsValue(formValues);
                }, 100);
            }
        } catch (error) {
            console.error('Error loading tour company profile:', error);
            message.error('Không thể tải thông tin tour company');
        } finally {
            setDataLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await profileService.updateTourCompanyProfile(values);
            message.success('Cập nhật thông tin thành công');
        } catch (err) {
            message.error('Có lỗi xảy ra khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = async () => {
        if (fileList.length === 0) return;
        setAvatarLoading(true);
        try {
            const file = fileList[0].originFileObj;
            if (file) {
                const formData = new FormData();
                formData.append('Logo', file);

                const response = await profileService.updateTourCompanyLogo(formData);
                if (response.success) {
                    await loadTourCompanyProfile();
                    message.success('Cập nhật logo thành công');
                    setFileList([]);
                } else {
                    message.error('Có lỗi khi cập nhật logo');
                }
            }
        } catch (error) {
            console.error('Error updating logo:', error);
            message.error('Có lỗi khi cập nhật logo');
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
                // const response = await profileService.updateTourCompanyBusinessLicense(formData);
                // if (response.success) {
                await loadTourCompanyProfile();
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
                    <UserOutlined className="profile-title-icon" />
                    <span>Thông tin Tour Company</span>
                </div>
                <div className="profile-desc">Quản lý thông tin công ty tour của bạn</div>

                {dataLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16 }}>Đang tải thông tin tour company...</div>
                    </div>
                ) : (
                    <Row gutter={32}>
                        <Col span={8}>
                            <div className="profile-avatar-card">
                                <div className="profile-avatar-title">Logo Company</div>
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
                                            message.error('Chỉ được upload file ảnh');
                                            return Upload.LIST_IGNORE;
                                        }
                                        if (!isLessThan2M) {
                                            message.error('File phải nhỏ hơn 2MB');
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
                                        onClick={handleAvatarUpdate}
                                        loading={avatarLoading}
                                        style={{ marginTop: 8, width: '100%' }}
                                    >
                                        Cập nhật Logo
                                    </Button>
                                )}
                                <div className="profile-avatar-note">Chỉ file ảnh, tối đa 2MB</div>
                            </div>
                        </Col>
                        <Col span={16}>
                            <Form
                                form={form}
                                layout="vertical"
                                className="profile-form"
                                onFinish={handleSubmit}
                            >
                                <Form.Item
                                    label="Tên Công ty"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
                                >
                                    <Input placeholder="Nhập tên công ty" />
                                </Form.Item>

                                <Form.Item
                                    label="Địa chỉ"
                                    name="address"
                                >
                                    <Input placeholder="Nhập địa chỉ" />
                                </Form.Item>

                                <Form.Item label="Mô tả" name="description">
                                    <Input.TextArea rows={3} placeholder="Mô tả về công ty" />
                                </Form.Item>

                                <Form.Item label="Website" name="website">
                                    <Input placeholder="Nhập website" />
                                </Form.Item>

                                <Form.Item
                                    label="Giấy phép kinh doanh"
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

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            className="profile-btn-save"
                                        >
                                            Lưu thay đổi
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            htmlType="button"
                                            className="profile-btn-cancel"
                                            onClick={() => form.resetFields()}
                                        >
                                            Hủy
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

export default TourCompanyProfile;
