import { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  Avatar, 
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

const { Title, Text } = Typography
const { TabPane } = Tabs

const MyInfo = () => {
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  
  const user = useAuthStore(state => state.user)
  const updateUser = useAuthStore(state => state.updateUser)
  
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
      message: 'Cập nhật thành công',
      description: 'Thông tin cá nhân đã được cập nhật',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    })
  }
  
  const handlePasswordSubmit = (values: any) => {
    // Update password logic would go here
    console.log('Password update values:', values)
    
    notification.success({
      message: 'Cập nhật thành công',
      description: 'Mật khẩu đã được thay đổi',
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
      
      <Tabs defaultActiveKey="profile" className="info-tabs">
        <TabPane tab="Hồ sơ" key="profile">
          <Card className="profile-card">
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <div className="avatar-section">
                  <Avatar 
                    size={120} 
                    src={userData.avatar} 
                    icon={<UserOutlined />} 
                    className="user-avatar"
                  />
                  
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
                    address: userData.address,
                    bio: userData.bio
                  }}
                  onFinish={handleProfileSubmit}
                >
                  <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                  </Form.Item>
                  
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>
                  
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                  </Form.Item>
                  
                  <Form.Item
                    name="address"
                    label="Địa chỉ"
                  >
                    <Input placeholder="Địa chỉ" />
                  </Form.Item>
                  
                  <Form.Item
                    name="bio"
                    label="Giới thiệu"
                  >
                    <Input.TextArea rows={4} placeholder="Giới thiệu bản thân" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      className="save-button"
                    >
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </TabPane>
        
        <TabPane tab="Đổi mật khẩu" key="password">
          <Card className="password-card">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  className="save-button"
                >
                  Cập nhật mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Hoạt động gần đây" key="activity">
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
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default MyInfo
