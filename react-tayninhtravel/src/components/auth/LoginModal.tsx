import { useState } from 'react'
import { Modal, Form, Input, Button, Checkbox, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/authService'
import { syncCartOnLogin } from '@/services/cartService'
import ForgotPasswordModal from './ForgotPasswordModal'
import './AuthModal.scss'

interface LoginModalProps {
  isVisible: boolean
  onClose: () => void
  onRegisterClick: () => void
  onLoginSuccess?: () => void
}

const LoginModal = ({ isVisible, onClose, onRegisterClick, onLoginSuccess }: LoginModalProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const response = await authService.login({
        email: values.email,
        password: values.password
      })

      if (response.user && response.token) {
        // Debug: Log user object
        console.log('Login response user:', response.user);
        console.log('User role:', response.user.role);

        login(response.user, response.token)
        message.success(t('common.loginSuccess'))
        form.resetFields()
        onClose()

        // Đồng bộ cart sau khi login thành công
        const syncedCart = await syncCartOnLogin(response.token)
        // Cập nhật Zustand store trực tiếp (không import động)
        if (syncedCart && Array.isArray(syncedCart.items)) {
          const { useCartStore } = await import('@/store/useCartStore');
          if (useCartStore?.setState) {
            useCartStore.setState({ items: syncedCart.items });
          }
        }

        // Call callback if provided
        if (onLoginSuccess) {
          onLoginSuccess()
        }

        // Save login session info
        localStorage.setItem('lastLoginTime', new Date().toISOString())

        // Redirect based on role
        console.log('Redirecting based on role:', response.user.role);
        if (response.user.role === 'Admin') {
          navigate('/admin/dashboard')
        } else if (response.user.role === 'Tour Company') {
          navigate('/tour-company/dashboard')
        } else if (response.user.role === 'Specialty Shop') {
          console.log('Navigating to speciality shop dashboard');
          navigate('/speciality-shop')
        } else if (response.user.role === 'Blogger') {
          navigate('/blogger/dashboard')
        } else {
          // Nếu trang trước là home thì ở lại home, ngược lại thì quay lại trang trước
          if (window.location.pathname === '/') {
            navigate('/')
          } else {
            navigate(-1)
          }
        }
      } else {
        throw new Error('Login response invalid')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.status === 401) {
        message.error(t('common.loginFailed'))
      } else if (error.response?.status === 403) {
        message.error(t('common.loginFailed'))
      } else {
        message.error(error.response?.data?.message || t('common.loginFailed'))
      }
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
      destroyOnHidden
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
            { required: true, message: t('auth.emailRequired') },
            { type: 'email', message: t('auth.emailInvalid') }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('auth.email')}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: t('auth.passwordRequired') }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth.password')}
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <div className="form-actions">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>
            <a className="forgot-password" onClick={() => setShowForgotPassword(true)}>
              {t('auth.forgotPassword')}
            </a>
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

        <Divider plain>{t('auth.orLoginWith')}</Divider>

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
          {t('auth.noAccount')} <a onClick={handleRegisterClick}>{t('auth.signUp')}</a>
        </div>
      </Form>

      <ForgotPasswordModal
        isVisible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </Modal>
  )
}

export default LoginModal
