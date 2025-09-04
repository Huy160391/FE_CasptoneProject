import { Row, Col, Form, Input, Button, Typography, Card, message, Upload, Modal } from 'antd'
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import type { UploadFile } from 'antd/es/upload/interface'
import { useAuthStore } from '@/store/useAuthStore'
import { userService } from '@/services/userService'
import LoginModal from '@/components/auth/LoginModal'
import RegisterModal from '@/components/auth/RegisterModal'
import './Support.scss'

const { Title, Paragraph } = Typography
const { TextArea } = Input

// Login required modal component
const LoginRequiredModal = ({
  visible,
  onCancel,
  onLoginClick
}: {
  visible: boolean,
  onCancel: () => void,
  onLoginClick: () => void
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      title={t('support.loginModal.title')}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="login" type="primary" onClick={onLoginClick}>
          {t('support.loginModal.loginButton')}
        </Button>
      ]}
    >
      <p>{t('support.loginModal.content')}</p>
    </Modal>
  )
}

const Support = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false)
  const [isLoginRequiredVisible, setIsLoginRequiredVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const handleLoginModalClose = () => {
    setIsLoginModalVisible(false)
  }

  const handleRegisterClick = () => {
    setIsLoginModalVisible(false)
    setIsRegisterModalVisible(true)
  }

  const handleRegisterModalClose = () => {
    setIsRegisterModalVisible(false)
  }

  const handleLoginClick = () => {
    setIsRegisterModalVisible(false)
    setIsLoginModalVisible(true)
  }

  const handleLoginRequiredCancel = () => {
    setIsLoginRequiredVisible(false)
  }

  const handleLoginRequiredLogin = () => {
    setIsLoginRequiredVisible(false)
    setIsLoginModalVisible(true)
  }

  const handleLoginSuccess = () => {
    message.success(t('common.loginSuccess'))
    setIsLoginModalVisible(false)
    // Submit the form if it was pending
    if (form.getFieldsValue()) {
      onFinish(form.getFieldsValue())
    }
  }

  const supportInfo = [
    {
      icon: <PhoneOutlined />,
      title: t('support.phone'),
      content: '(+84) 276 3123 456',
    },
    {
      icon: <MailOutlined />,
      title: t('support.email'),
      content: 'support@tayninhtravel.com',
    },
    {
      icon: <ClockCircleOutlined />,
      title: t('support.workingHours'),
      content: t('support.workingHoursContent'),
    },
    {
      icon: <EnvironmentOutlined />,
      title: t('support.address'),
      content: t('support.addressContent'),
    },
  ]
  const onFinish = async (values: any) => {
    if (!isAuthenticated) {
      setIsLoginRequiredVisible(true)
      return
    }

    try {
      setLoading(true)
      const file = fileList[0]?.originFileObj as File || undefined

      await userService.submitSupportTicket(values.title, values.content, file)

      message.success(t('support.submitSuccess'))
      form.resetFields()
      setFileList([])
    } catch (error: any) {
      console.error('Support submission error:', error)
      message.error(error.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="support-page">
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1}>{t('support.title')}</Title>
          <p>{t('support.subtitle')}</p>
        </div>
      </div>

      <div className="container">
        <div className="support-info">
          <Row gutter={[24, 24]}>
            {supportInfo.map((info, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="info-card">
                  <div className="icon">{info.icon}</div>
                  <h3>{info.title}</h3>
                  <p>{info.content}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <Row gutter={[48, 48]} className="support-content">
          <Col xs={24} lg={12}>
            <div className="form-section">
              <Title level={2}>{t('support.formTitle')}</Title>
              <Paragraph>{t('support.formSubtitle')}</Paragraph>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="support-form"
              >
                <Form.Item
                  name="title"
                  label={t('support.form.title')}
                  rules={[{ required: true, message: t('support.form.titleRequired') }]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  name="content"
                  label={t('support.form.content')}
                  rules={[{ required: true, message: t('support.form.contentRequired') }]}
                >
                  <TextArea rows={6} />
                </Form.Item>

                <Form.Item
                  name="attachment"
                  label={t('support.form.attachment')}
                >
                  <Upload
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    beforeUpload={() => false} // Prevent auto upload
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>{t('support.form.uploadButton')}</Button>
                  </Upload>
                  <div className="upload-hint">
                    {t('support.form.attachmentHint')}
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" loading={loading}>
                    {t('support.form.submit')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="map-section">
              <Title level={2}>{t('support.mapTitle')}</Title>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125627.33840229235!2d106.0596400280973!3d11.322157151614279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b6b52d1ec58cd%3A0x62cbe32c17e78754!2zVMOieSBOaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1655523559742!5m2!1svi!2s"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      {/* Login Required Modal */}
      <LoginRequiredModal
        visible={isLoginRequiredVisible}
        onCancel={handleLoginRequiredCancel}
        onLoginClick={handleLoginRequiredLogin}
      />

      {/* Login and Register Modals */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={handleLoginModalClose}
        onRegisterClick={handleRegisterClick}
        onLoginSuccess={handleLoginSuccess}
      />
      <RegisterModal
        isVisible={isRegisterModalVisible}
        onClose={handleRegisterModalClose}
        onLoginClick={handleLoginClick}
      />
    </div>
  )
}

export default Support
