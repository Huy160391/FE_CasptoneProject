import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Tabs,
  Row,
  Col,
  Divider,
  Typography,
  notification
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
  SaveOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { useAuthStore } from '@/store/useAuthStore'
import './MyInfo.scss'
import { useTranslation } from 'react-i18next'

const { Title, Text } = Typography
// Removed TabPane import since we'll use items prop

const MyInfo = () => {
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const user = useAuthStore(state => state.user)
  const updateUser = useAuthStore(state => state.updateUser)
  const { t } = useTranslation()

  // Mock user data if not available in store
  const userData = user || {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://placehold.co/100x100',
    phone: '0123456789',
    address: '123 Đường ABC, Quận XYZ, TP. Tây Ninh',
    bio: 'Quản trị viên hệ thống Tây Ninh Travel'
  }

  const handleProfileSubmit = (values: any) => {
    // Update user profile
    updateUser({
      ...values,
      avatar: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : userData.avatar
    })

    notification.success({
      message: t('common.updateSuccess'),
      description: t('profile.personalInfoUpdateSuccess'),
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    })
  }

  const handlePasswordSubmit = (values: any) => {
    // Update password logic would go here
    console.log('Password update values:', values)

    notification.success({
      message: t('common.updateSuccess'),
      description: t('profile.passwordUpdateSuccess'),
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    })

    passwordForm.resetFields()
  }

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList)
  }

  return (
    <div className="my-info-page">
      <Title level={2}>Thông tin cá nhân</Title>

      <Tabs
        defaultActiveKey="profile"
        className="info-tabs"
        items={[
          {
            key: "profile",
            label: "Hồ sơ",
            children: (
              <Card className="profile-card">
                <Row gutter={[32, 32]}>
                  <Col xs={24} md={8}>
                    <div className="avatar-section">
                      <div className="user-avatar">
                        <img
                          src={userData.avatar}
                          alt="avatar"
                          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }}
                        />
                      </div>

                      <Upload
                        listType="picture"
                        maxCount={1}
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        className="avatar-upload"
                      >
                        <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
                      </Upload>

                      <div className="user-role">
                        <Text strong>Vai trò:</Text> {userData.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={16}>
                    <Form
                      form={profileForm}
                      layout="vertical"
                      initialValues={{
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        address: userData.address
                      }}
                      onFinish={handleProfileSubmit}
                    >
                      <Form.Item
                        name="name"
                        label={t('profile.name')}
                        rules={[
                          { required: true, message: t('profile.nameRequired') },
                          { pattern: /^[a-zA-Z\s]*$/, message: t('profile.nameInvalid') }
                        ]}
                      >
                        <Input prefix={<UserOutlined />} placeholder={t('profile.name')} />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label={t('profile.email')}
                        rules={[
                          { required: true, message: t('profile.emailRequired') },
                          { type: 'email', message: t('profile.emailInvalid') }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder={t('profile.email')} />
                      </Form.Item>

                      <Form.Item
                        name="phone"
                        label={t('profile.phone')}
                        rules={[
                          { required: true, message: t('profile.phoneRequired') },
                          { pattern: /^[0-9]{10}$/, message: t('auth.phoneInvalid') }
                        ]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder={t('profile.phone')} />
                      </Form.Item>

                      <Form.Item
                        name="address"
                        label={t('profile.address')}
                      >
                        <Input placeholder={t('profile.address')} />
                      </Form.Item>

                      <Form.Item
                        name="bio"
                        label={t('profile.bio')}
                      >
                        <Input.TextArea rows={4} placeholder={t('profile.bio')} />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          className="save-button"
                        >
                          {t('profile.saveChanges')}
                        </Button>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              </Card>
            )
          },
          {
            key: "password",
            label: "Đổi mật khẩu",
            children: (
              <Card className="password-card">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handlePasswordSubmit}
                >
                  <Form.Item
                    name="currentPassword"
                    label={t('profile.currentPassword')}
                    rules={[{ required: true, message: t('profile.currentPasswordRequired') }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder={t('profile.currentPassword')} />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label={t('profile.newPassword')}
                    rules={[
                      { required: true, message: t('profile.newPasswordRequired') },
                      { min: 8, message: t('auth.passwordInvalid') }
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder={t('profile.newPassword')} />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={t('profile.confirmPassword')}
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: t('profile.confirmPasswordRequired') },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error(t('profile.passwordMismatch')))
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder={t('profile.confirmPassword')} />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      className="save-button"
                    >
                      {t('profile.changePassword')}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )
          },
          {
            key: "activity",
            label: "Hoạt động gần đây",
            children: (
              <Card className="activity-card">
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-time">15/03/2024 - 10:30</div>
                    <div className="activity-content">Đăng nhập vào hệ thống</div>
                  </div>

                  <Divider />

                  <div className="activity-item">
                    <div className="activity-time">14/03/2024 - 15:45</div>
                    <div className="activity-content">Cập nhật thông tin sản phẩm #1234</div>
                  </div>

                  <Divider />

                  <div className="activity-item">
                    <div className="activity-time">14/03/2024 - 11:20</div>
                    <div className="activity-content">Thêm sản phẩm mới</div>
                  </div>

                  <Divider />

                  <div className="activity-item">
                    <div className="activity-time">13/03/2024 - 16:10</div>
                    <div className="activity-content">Xử lý đơn hàng #5678</div>
                  </div>

                  <Divider />

                  <div className="activity-item">
                    <div className="activity-time">12/03/2024 - 09:15</div>
                    <div className="activity-content">Đăng nhập vào hệ thống</div>
                  </div>
                </div>
              </Card>)
          }
        ]}
      />
    </div>
  )
}

export default MyInfo
