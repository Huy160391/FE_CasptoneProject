import { useState } from 'react'
import { Modal, Form, Input, Button, Checkbox, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import OTPVerificationModal from './OTPVerificationModal'
import './AuthModal.scss'

interface RegisterModalProps {
  isVisible: boolean
  onClose: () => void
  onLoginClick: () => void
}

const RegisterModal = ({ isVisible, onClose, onLoginClick }: RegisterModalProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      await authService.register({
        email: values.email,
        name: values.fullName,
        password: values.password,
        phoneNumber: values.phone,
        avatar: ''
      })

      setRegisteredEmail(values.email)
      setShowOTPModal(true)
      form.resetFields()
    } catch (error: any) {
      console.error('Register error:', error)
      if (error.response?.data?.message === 'User is not verified, back to register to verify your email!') {
        setRegisteredEmail(values.email)
        setShowOTPModal(true)
      } else {
        message.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSuccess = () => {
    onClose()
    onLoginClick()
  }

  const handleSocialLogin = (platform: string) => {
    console.log(`Register with ${platform}`)
    // Implement social register logic here
  }

  const handleLoginClick = () => {
    onClose()
    onLoginClick()
  }

  return (
    <>
      <Modal
        title={t('common.register')}
        open={isVisible}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        className="auth-modal"
      >
        <Form
          form={form}
          name="register_form"
          initialValues={{ agreement: true }}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Họ tên"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              {
                validator: (_, value) => {
                  console.log('Validating email:', value);
                  // Pattern đơn giản hơn: cho phép chữ cái, số, dấu chấm, dấu gạch dưới trước @
                  // và domain phải có ít nhất 1 dấu chấm
                  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                  const isValid = emailPattern.test(value);
                  console.log('Email validation result:', isValid);

                  if (!value || isValid) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Email không hợp lệ!'));
                }
              }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              onChange={(e) => {
                console.log('Email input changed:', e.target.value);
              }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Số điện thoại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản dịch vụ!')),
              },
            ]}
          >
            <Checkbox>
              Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="register-button"
              block
              size="large"
              loading={loading}
            >
              {t('common.register')}
            </Button>
          </Form.Item>

          <Divider plain>Hoặc đăng ký với</Divider>

          <div className="social-login">
            <Button
              icon={<GoogleOutlined />}
              onClick={() => handleSocialLogin('Google')}
              size="large"
            >
              Google
            </Button>
            <Button
              icon={<FacebookOutlined />}
              onClick={() => handleSocialLogin('Facebook')}
              size="large"
            >
              Facebook
            </Button>
          </div>

          <div className="login-link">
            Đã có tài khoản? <a onClick={handleLoginClick}>Đăng nhập</a>
          </div>
        </Form>
      </Modal>

      <OTPVerificationModal
        isVisible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={registeredEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </>
  )
}

export default RegisterModal
