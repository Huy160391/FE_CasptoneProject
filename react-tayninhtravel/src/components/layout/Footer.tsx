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
const { Title, Text } = Typography

const Footer = () => {
  const { t } = useTranslation()

  return (
    <AntFooter className="footer">
      <div className="footer-container">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <Title level={4}>{t('footer.companyName')}</Title>
              <div className="footer-description">
                {t('footer.description')}
              </div>
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
                <li><Link to="/tours/hanoi">{t('footer.tours.hanoi')}</Link></li>
                <li><Link to="/tours/ho-chi-minh">{t('footer.tours.hoChiMinh')}</Link></li>
                <li><Link to="/tours/da-nang">{t('footer.tours.daNang')}</Link></li>
                <li><Link to="/tours/nha-trang">{t('footer.tours.nhaTrang')}</Link></li>
                <li><Link to="/tours/phu-quoc">{t('footer.tours.phuQuoc')}</Link></li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <Title level={4}>{t('navigation.services')}</Title>
              <ul className="footer-links">
                <li><Link to="/services/day-tours">{t('footer.services.dayTours')}</Link></li>
                <li><Link to="/services/multi-day-tours">{t('footer.services.multiDayTours')}</Link></li>
                <li><Link to="/services/private-tours">{t('footer.services.privateTours')}</Link></li>
                <li><Link to="/services/group-tours">{t('footer.services.groupTours')}</Link></li>
                <li><Link to="/services/custom-tours">{t('footer.services.customTours')}</Link></li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="footer-section">
              <Title level={4}>{t('navigation.contact')}</Title>
              <ul className="contact-info">
                <li>
                  <EnvironmentOutlined />
                  <Text>{t('footer.contact.address')}</Text>
                </li>
                <li>
                  <PhoneOutlined />
                  <Text>{t('footer.contact.phone')}</Text>
                </li>
                <li>
                  <MailOutlined />
                  <Text>{t('footer.contact.email')}</Text>
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
