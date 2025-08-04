import React, { useState, useRef } from 'react'
import { Modal, Form, Input, Button, Checkbox, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/authService'
import { syncCartOnLogin } from '@/services/cartService'
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
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      await authService.register({
        email: values.email,
        name: values.fullName,
        password: values.password,
        confirmPassword: values.confirmPassword,
        phoneNumber: values.phone,
        avatar: 'https://i.imgur.com/4AiXzf8.jpg',
        agreeToTerms: true
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
        message.error(error.response?.data?.message || t('common.registerFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSuccess = () => {
    onClose()
    onLoginClick()
  }

  // Render Google button khi modal mở
  React.useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null;
    function renderGoogleButton(attempt = 0) {
      if (!isVisible) return;
      const google = (window as any).google;
      if (google && googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                setLoading(true);
                const loginRes = await authService.loginWithGoogle(response.credential);
                if (loginRes.user && loginRes.token) {
                  login(loginRes.user, loginRes.token);
                  message.success(t('common.loginSuccess'));
                  form.resetFields();
                  onClose();
                  // Đồng bộ cart sau khi login thành công
                  const syncedCart = await syncCartOnLogin(loginRes.token);
                  if (syncedCart && Array.isArray(syncedCart.items)) {
                    const { useCartStore } = await import('@/store/useCartStore');
                    if (useCartStore?.setState) {
                      useCartStore.setState({ items: syncedCart.items });
                    }
                  }
                  localStorage.setItem('lastLoginTime', new Date().toISOString());
                  // Redirect based on role
                  if (loginRes.user.role === 'Admin') {
                    navigate('/admin/dashboard');
                  } else if (loginRes.user.role === 'Tour Company') {
                    navigate('/tour-company/dashboard');
                  } else if (loginRes.user.role === 'Specialty Shop') {
                    navigate('/speciality-shop');
                  } else if (loginRes.user.role === 'Blogger') {
                    navigate('/blogger/dashboard');
                  } else {
                    if (window.location.pathname === '/') {
                      navigate('/');
                    } else {
                      navigate(-1);
                    }
                  }
                } else {
                  throw new Error('Login response invalid');
                }
              } catch (error: any) {
                message.error(error.response?.data?.message || t('common.loginFailed'));
              } finally {
                setLoading(false);
              }
            } else {
              message.error('Google login failed: No credential received.');
              setLoading(false);
            }
          },
        });
        google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
        });
      } else if (attempt < 10) {
        // Retry every 200ms up to 2s
        retryTimeout = setTimeout(() => renderGoogleButton(attempt + 1), 200);
      } else if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '<div style="color:red;text-align:center">Google SDK chưa được tải.</div>';
      }
    }
    if (isVisible) {
      renderGoogleButton();
    }
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
      }
    };
  }, [isVisible]);

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
        destroyOnHidden
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
            rules={[
              { required: true, message: t('auth.nameRequired') },
              { pattern: /^[a-zA-Z\s]*$/, message: t('auth.nameInvalid') }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('auth.fullName')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('auth.emailRequired') },
              {
                validator: (_, value) => {
                  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                  const isValid = emailPattern.test(value);

                  if (!value || isValid) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('auth.emailInvalid')));
                }
              }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('auth.email')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: t('auth.phoneRequired') },
              { pattern: /^[0-9]{10}$/, message: t('auth.phoneInvalid') }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder={t('auth.phone')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('auth.passwordRequired') },
              { min: 6, message: t('auth.passwordInvalid') }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(t('auth.passwordMismatch')))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.confirmPassword')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error(t('auth.agreementRequired'))),
              },
            ]}
          >
            <Checkbox>
              {t('auth.agreement')} <a href="#">{t('auth.termsOfService')}</a> {t('auth.and')} <a href="#">{t('auth.privacyPolicy')}</a>
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

          <Divider plain>{t('auth.orRegisterWith')}</Divider>

          <div className="social-login" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div ref={googleBtnRef}></div>
          </div>

          <div className="login-link">
            {t('auth.haveAccount')} <a onClick={handleLoginClick}>{t('auth.signIn')}</a>
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
