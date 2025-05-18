import { useState } from 'react'
import { Modal, Form, Input, Button, Checkbox, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/authService'
import './AuthModal.scss'

interface LoginModalProps {
  isVisible: boolean
  onClose: () => void
  onRegisterClick: () => void
}

const LoginModal = ({ isVisible, onClose, onRegisterClick }: LoginModalProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(state => state.login)

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const response = await authService.login({
        email: values.email,
        password: values.password
      })

      login(response.user, response.token)
      message.success('Đăng nhập thành công!')
      form.resetFields()
      onClose()
    } catch (error: any) {
      console.error('Login error:', error)
      message.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (platform: string) => {
    console.log(`Login with ${platform}`)
    // Implement social login logic here
  }

  const handleRegisterClick = () => {
    onClose()
    onRegisterClick()
  }

  return (
    <Modal
      title={t('common.login')}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      className="auth-modal"
    >
      <Form
        form={form}
        name="login_form"
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <div className="form-actions">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>
            <a className="forgot-password" href="#">Quên mật khẩu?</a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            block
            size="large"
            loading={loading}
          >
            {t('common.login')}
          </Button>
        </Form.Item>

        <Divider plain>Hoặc đăng nhập với</Divider>

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

        <div className="register-link">
          Chưa có tài khoản? <a onClick={handleRegisterClick}>Đăng ký ngay</a>
        </div>
      </Form>
    </Modal>
  )
}

export default LoginModal
