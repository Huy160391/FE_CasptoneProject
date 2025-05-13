import { Layout, Row, Col, Typography, Space, Divider } from 'antd'
import { Link } from 'react-router-dom'
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined, 
  YoutubeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import './Footer.scss'

const { Footer: AntFooter } = Layout
const { Title, Text, Paragraph } = Typography

const Footer = () => {
  const { t } = useTranslation()
  
  return (
    <AntFooter className="footer">
      <div className="footer-container">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <Title level={4}>Tay Ninh Tour</Title>
              <Paragraph>
                Khám phá vẻ đẹp Việt Nam trong một ngày với các tour du lịch chất lượng cao, 
                hướng dẫn viên chuyên nghiệp và trải nghiệm đáng nhớ.
              </Paragraph>
              <Space className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FacebookOutlined />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <TwitterOutlined />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <InstagramOutlined />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <YoutubeOutlined />
                </a>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <Title level={4}>{t('navigation.tours')}</Title>
              <ul className="footer-links">
                <li><Link to="/tours/hanoi">Hà Nội</Link></li>
                <li><Link to="/tours/ho-chi-minh">Hồ Chí Minh</Link></li>
                <li><Link to="/tours/da-nang">Đà Nẵng</Link></li>
                <li><Link to="/tours/nha-trang">Nha Trang</Link></li>
                <li><Link to="/tours/phu-quoc">Phú Quốc</Link></li>
              </ul>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <Title level={4}>{t('navigation.services')}</Title>
              <ul className="footer-links">
                <li><Link to="/services/day-tours">Tour Ngày</Link></li>
                <li><Link to="/services/multi-day-tours">Tour Nhiều Ngày</Link></li>
                <li><Link to="/services/private-tours">Tour Riêng</Link></li>
                <li><Link to="/services/group-tours">Tour Nhóm</Link></li>
                <li><Link to="/services/custom-tours">Tour Tùy Chỉnh</Link></li>
              </ul>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <Title level={4}>{t('navigation.contact')}</Title>
              <ul className="contact-info">
                <li>
                  <EnvironmentOutlined />
                  <Text>123 Đường ABC, Quận XYZ, TP. Tây Ninh</Text>
                </li>
                <li>
                  <PhoneOutlined />
                  <Text>+84 123 456 789</Text>
                </li>
                <li>
                  <MailOutlined />
                  <Text>info@tayninhtravel.com</Text>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
        
        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <div className="footer-bottom">
          <Text>© {new Date().getFullYear()} Tay Ninh Tour. All Rights Reserved.</Text>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer
