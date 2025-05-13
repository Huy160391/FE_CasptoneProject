import { Row, Col, Form, Input, Button, Typography, Card, message } from 'antd'
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import './Contact.scss'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const Contact = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  
  const contactInfo = [
    {
      icon: <EnvironmentOutlined />,
      title: 'Địa chỉ',
      content: '123 Đường ABC, Phường XYZ, Thành phố Tây Ninh, Tỉnh Tây Ninh',
    },
    {
      icon: <PhoneOutlined />,
      title: 'Điện thoại',
      content: '(+84) 276 3123 456',
    },
    {
      icon: <MailOutlined />,
      title: 'Email',
      content: 'info@tayninhtravel.com',
    },
    {
      icon: <ClockCircleOutlined />,
      title: 'Giờ làm việc',
      content: 'Thứ Hai - Thứ Bảy: 8:00 - 17:30',
    },
  ]
  
  const handleSubmit = (values: any) => {
    console.log('Form values:', values)
    message.success('Cảm ơn bạn đã liên hệ với chúng tôi! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.')
    form.resetFields()
  }
  
  return (
    <div className="contact-page">
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1}>Liên hệ</Title>
          <Paragraph>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</Paragraph>
        </div>
      </div>
      
      <div className="container">
        <Row gutter={[48, 48]}>
          <Col xs={24} lg={10}>
            <div className="contact-info">
              <Title level={2}>Thông tin liên hệ</Title>
              <Paragraph>
                Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào, đừng ngần ngại liên hệ với chúng tôi. 
                Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn.
              </Paragraph>
              
              <div className="info-cards">
                {contactInfo.map((info, index) => (
                  <Card className="info-card" key={index}>
                    <div className="icon-wrapper">{info.icon}</div>
                    <div className="content">
                      <Text strong>{info.title}</Text>
                      <Paragraph>{info.content}</Paragraph>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="social-links">
                <Title level={4}>Kết nối với chúng tôi</Title>
                <div className="social-icons">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
          </Col>
          
          <Col xs={24} lg={14}>
            <div className="contact-form">
              <Title level={2}>Gửi tin nhắn cho chúng tôi</Title>
              <Paragraph>
                Hãy điền thông tin vào mẫu dưới đây, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
              </Paragraph>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="form"
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Họ tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input size="large" placeholder="Nhập họ tên của bạn" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input size="large" placeholder="Nhập email của bạn" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                      ]}
                    >
                      <Input size="large" placeholder="Nhập số điện thoại của bạn" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="subject"
                      label="Chủ đề"
                      rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
                    >
                      <Input size="large" placeholder="Nhập chủ đề" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="message"
                  label="Nội dung"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Nhập nội dung tin nhắn của bạn"
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large">
                    Gửi tin nhắn
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
        
        <div className="map-section">
          <Title level={2}>Bản đồ</Title>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125412.45219489711!2d106.04959864999999!3d11.3649347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b6eac3c1e3a21%3A0x3d3a2369935f2b5f!2zVMOieSBOaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1648705044!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
