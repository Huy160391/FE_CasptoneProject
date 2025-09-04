import { Row, Col, Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import './About.scss'

const { Title, Paragraph } = Typography

const About = () => {
  const { t } = useTranslation()

  return (
    <div className="about-page">
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1}>{t('about.title')}</Title>
          <p>{t('about.subtitle')}</p>
        </div>
      </div>

      <div className="container">
        <section className="about-section">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div className="about-image">
                <img src="/src/assets/Tay Ninh 4.jpg" alt="Tây Ninh Travel" />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="about-content">
                <Title level={2}>{t('about.storyTitle')}</Title>
                <Paragraph>{t('about.storyParagraph1')}</Paragraph>
                <Paragraph>{t('about.storyParagraph2')}</Paragraph>
              </div>
            </Col>
          </Row>
        </section>

        <section className="mission-section">
          <Title level={2} className="section-title">{t('about.missionVisionTitle')}</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className="mission-card">
                <Title level={3}>{t('about.missionTitle')}</Title>
                <Paragraph>{t('about.missionText')}</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="vision-card">
                <Title level={3}>{t('about.visionTitle')}</Title>
                <Paragraph>{t('about.visionText')}</Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

      </div>
    </div>
  )
}

export default About
