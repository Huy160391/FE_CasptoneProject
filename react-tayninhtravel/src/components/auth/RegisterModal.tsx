import { useState } from 'react'
import { Modal, Form, Input, Button, Checkbox, Divider, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
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

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Register values:', values)
      message.success('Đăng ký thành công! Vui lòng đăng nhập.')
      form.resetFields()
      onClose()
      onLoginClick()
    } catch (error) {
      console.error('Register error:', error)
      message.error('Đăng ký thất bại. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
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
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="Email" 
            size="large" 
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
  )
}

export default RegisterModal
