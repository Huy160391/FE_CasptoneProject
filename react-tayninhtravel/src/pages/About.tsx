import { Row, Col, Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import './About.scss'

const { Title, Paragraph } = Typography

const About = () => {
  const { t } = useTranslation()

  const teamMembers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      position: 'CEO & Founder',
      avatar: '/images/team/member1.jpg',
      description: 'Với hơn 10 năm kinh nghiệm trong ngành du lịch, anh A đã xây dựng Tây Ninh Travel từ một công ty nhỏ thành một trong những đơn vị lữ hành hàng đầu tại Tây Ninh.',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      position: 'Tour Manager',
      avatar: '/images/team/member2.jpg',
      description: 'Chị B là người phụ trách thiết kế và quản lý các tour du lịch. Với kiến thức sâu rộng về các điểm đến, chị luôn mang đến những trải nghiệm tuyệt vời cho khách hàng.',
    },
    {
      id: 3,
      name: 'Lê Văn C',
      position: 'Marketing Director',
      avatar: '/images/team/member3.jpg',
      description: 'Anh C là người đứng sau những chiến dịch marketing thành công của công ty. Anh luôn tìm kiếm những cách sáng tạo để giới thiệu vẻ đẹp của Tây Ninh đến du khách.',
    },
    {
      id: 4,
      name: 'Phạm Thị D',
      position: 'Customer Service Manager',
      avatar: '/images/team/member4.jpg',
      description: 'Chị D và đội ngũ của mình luôn đảm bảo mọi khách hàng đều nhận được dịch vụ tốt nhất. Sự tận tâm của chị đã giúp công ty nhận được nhiều đánh giá tích cực.',
    },
  ]


  return (
    <div className="about-page">
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1}>{t('about.title')}</Title>
          <Paragraph>{t('about.subtitle')}</Paragraph>
        </div>
      </div>

      <div className="container">
        <section className="about-section">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <div className="about-image">
                <img src="/images/about/about-company.jpg" alt="Tây Ninh Travel" />
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

        <section className="team-section">
          <Title level={2} className="section-title">{t('about.teamTitle')}</Title>
          <Row gutter={[32, 32]}>
            {teamMembers.map(member => (
              <Col xs={24} sm={12} md={6} key={member.id}>
                <Card className="team-card" hoverable>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', display: 'block', margin: '0 auto 16px' }}
                  />
                  <Title level={4}>{member.name}</Title>
                  <p className="position">{member.position}</p>
                  <Paragraph className="description">{member.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

      </div>
    </div>
  )
}

export default About
