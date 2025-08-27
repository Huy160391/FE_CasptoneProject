import LanguageSwitcher from '../common/LanguageSwitcher'
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
        <Row gutter={[24, 24]} wrap={false} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="footer-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={4}>{t('footer.companyName')}</Title>
              <div className="footer-description">
                {t('footer.description')}
              </div>
              <Space className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FacebookOutlined style={{ color: '#fff' }} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <TwitterOutlined style={{ color: '#fff' }} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <InstagramOutlined style={{ color: '#fff' }} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <YoutubeOutlined style={{ color: '#fff' }} />
                </a>
              </Space>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="footer-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={4}>{t('navigation.tours')}</Title>
              <ul className="footer-links">
              </ul>
              <ul className="footer-links">
                <li><Link to="/tours">Tour Tây Ninh</Link></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="footer-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={4}>{t('navigation.services')}</Title>
              <ul className="footer-links">
              </ul>
              <ul className="footer-links">
                <li><Link to="/tours">Tour du lịch</Link></li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="footer-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={4}>{t('navigation.contact')}</Title>
              <ul className="contact-info">
                <li>
                  <EnvironmentOutlined style={{ color: '#fff' }} />
                  <Text style={{ color: '#fff' }}>{t('footer.contact.address')}</Text>
                </li>
                <li>
                  <PhoneOutlined style={{ color: '#fff' }} />
                  <Text style={{ color: '#fff' }}>{t('footer.contact.phone')}</Text>
                </li>
                <li>
                  <MailOutlined style={{ color: '#fff' }} />
                  <Text style={{ color: '#fff' }}>{t('footer.contact.email')}</Text>
                </li>
              </ul>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="footer-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title level={4}>{t('footer.language')}</Title>
              <LanguageSwitcher />
            </div>
          </Col>
        </Row>
        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <div className="footer-bottom">
          <Text style={{ color: '#fff' }}>© {new Date().getFullYear()} Tay Ninh Tour. All Rights Reserved.</Text>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer
