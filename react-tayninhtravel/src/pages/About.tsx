import { Row, Col, Card, Typography } from 'antd'
// import { useTranslation } from 'react-i18next'
import './About.scss'

const { Title, Paragraph } = Typography

const About = () => {
  // const { t } = useTranslation()

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

  const milestones = [
    {
      year: '2010',
      title: 'Thành lập công ty',
      description: 'Tây Ninh Travel được thành lập với sứ mệnh giới thiệu vẻ đẹp của Tây Ninh đến du khách trong và ngoài nước.',
    },
    {
      year: '2015',
      title: 'Mở rộng dịch vụ',
      description: 'Công ty bắt đầu mở rộng dịch vụ, không chỉ tổ chức tour mà còn cung cấp dịch vụ lưu trú, ẩm thực và các hoạt động giải trí.',
    },
    {
      year: '2018',
      title: 'Giải thưởng Du lịch Việt Nam',
      description: 'Tây Ninh Travel vinh dự nhận giải thưởng "Đơn vị lữ hành tiêu biểu" do Tổng cục Du lịch Việt Nam trao tặng.',
    },
    {
      year: '2020',
      title: 'Chuyển đổi số',
      description: 'Công ty đầu tư mạnh mẽ vào công nghệ, ra mắt website và ứng dụng di động để nâng cao trải nghiệm khách hàng.',
    },
    {
      year: '2023',
      title: 'Mở rộng thị trường quốc tế',
      description: 'Tây Ninh Travel bắt đầu đón khách quốc tế và mở rộng thị trường ra các nước trong khu vực Đông Nam Á.',
    },
  ]

  return (
    <div className="about-page">
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1}>Về chúng tôi</Title>
          <Paragraph>Khám phá câu chuyện, sứ mệnh và đội ngũ đằng sau Tây Ninh Travel</Paragraph>
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
                <Title level={2}>Câu chuyện của chúng tôi</Title>
                <Paragraph>
                  Tây Ninh Travel được thành lập vào năm 2010 với mong muốn giới thiệu vẻ đẹp của Tây Ninh đến với du khách trong và ngoài nước. Từ một công ty nhỏ chỉ với vài nhân viên, chúng tôi đã phát triển thành một trong những đơn vị lữ hành hàng đầu tại Tây Ninh.
                </Paragraph>
                <Paragraph>
                  Với đội ngũ nhân viên giàu kinh nghiệm và am hiểu về địa phương, chúng tôi tự hào mang đến cho khách hàng những trải nghiệm du lịch đáng nhớ, từ khám phá núi Bà Đen hùng vĩ, tham quan Tòa Thánh Cao Đài linh thiêng đến thưởng thức ẩm thực đặc sắc của vùng đất này.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </section>

        <section className="mission-section">
          <Title level={2} className="section-title">Sứ mệnh & Tầm nhìn</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className="mission-card">
                <Title level={3}>Sứ mệnh</Title>
                <Paragraph>
                  Chúng tôi cam kết mang đến cho khách hàng những trải nghiệm du lịch chất lượng, an toàn và đáng nhớ tại Tây Ninh. Đồng thời, chúng tôi cũng góp phần quảng bá hình ảnh, văn hóa và con người Tây Ninh đến với bạn bè trong nước và quốc tế.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="vision-card">
                <Title level={3}>Tầm nhìn</Title>
                <Paragraph>
                  Trở thành đơn vị lữ hành hàng đầu tại Tây Ninh và khu vực Đông Nam Bộ, được khách hàng tin tưởng lựa chọn và đối tác đánh giá cao. Chúng tôi hướng đến việc phát triển du lịch bền vững, tôn trọng môi trường và cộng đồng địa phương.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="team-section">
          <Title level={2} className="section-title">Đội ngũ của chúng tôi</Title>
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

        <section className="milestone-section">
          <Title level={2} className="section-title">Hành trình phát triển</Title>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div className="timeline-item" key={index}>
                <div className="timeline-badge">{milestone.year}</div>
                <div className="timeline-content">
                  <Title level={4}>{milestone.title}</Title>
                  <Paragraph>{milestone.description}</Paragraph>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
