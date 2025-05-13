import { useState } from 'react'
import { Modal, Form, Input, Button, Checkbox, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
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

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Login values:', values)
      message.success('Đăng nhập thành công!')
      form.resetFields()
      onClose()
    } catch (error) {
      console.error('Login error:', error)
      message.error('Đăng nhập thất bại. Vui lòng thử lại!')
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
