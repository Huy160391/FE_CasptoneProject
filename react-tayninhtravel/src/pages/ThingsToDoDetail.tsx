import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Breadcrumb,
  Typography,
  Button,
  Tabs,
  Rate,
  Tag,
  Divider,
  Form,
  DatePicker,
  InputNumber,
  Card,
  List,
  Avatar,
  Skeleton,
  notification
} from 'antd'
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  UserOutlined,
  HeartOutlined,
  ShareAltOutlined
} from '@ant-design/icons'
import './ThingsToDoDetail.scss'
import { useCartStore } from '@/store/useCartStore'
import { useTranslation } from 'react-i18next'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

// Mock tour data
const tours = [
  {
    id: 1,
    title: 'Tour Núi Bà Đen - Khám phá nóc nhà Nam Bộ',
    description: 'Hành trình khám phá Núi Bà Đen, ngọn núi cao nhất Nam Bộ với hệ thống cáp treo hiện đại và các điểm tham quan tâm linh nổi tiếng.',
    longDescription: `<p>Núi Bà Đen là ngọn núi cao nhất Nam Bộ với độ cao 986m so với mực nước biển. Đây không chỉ là địa điểm du lịch nổi tiếng mà còn là nơi có ý nghĩa tâm linh quan trọng đối với người dân địa phương.</p>
    
    <p>Tour Núi Bà Đen sẽ đưa bạn khám phá:</p>
    <ul>
      <li><strong>Hệ thống cáp treo hiện đại:</strong> Di chuyển an toàn và ngắm nhìn toàn cảnh Tây Ninh từ trên cao.</li>
      <li><strong>Chùa Bà Đen:</strong> Ngôi chùa cổ thờ Bà Đen (Linh Sơn Tiên Thạch Tự), nơi diễn ra các lễ hội lớn hàng năm.</li>
      <li><strong>Động Thanh Long:</strong> Hang động tự nhiên với nhiều nhũ đá có hình thù kỳ lạ.</li>
      <li><strong>Thác Đồng Đen:</strong> Thác nước đẹp nằm giữa rừng già.</li>
      <li><strong>Đỉnh Núi Bà Đen:</strong> Nơi có thể ngắm toàn cảnh Tây Ninh và các tỉnh lân cận.</li>
    </ul>
    
    <h3>Lịch trình tour</h3>
    <p><strong>08:00 - 08:30:</strong> Đón khách tại điểm hẹn ở trung tâm thành phố Tây Ninh.</p>
    <p><strong>09:00 - 09:30:</strong> Đến khu du lịch Núi Bà Đen, nghe hướng dẫn viên giới thiệu về lịch sử và ý nghĩa tâm linh của ngọn núi.</p>
    <p><strong>09:30 - 10:30:</strong> Trải nghiệm cáp treo lên đỉnh núi, ngắm nhìn cảnh quan thiên nhiên tuyệt đẹp.</p>
    <p><strong>10:30 - 12:00:</strong> Tham quan chùa Bà và các điểm tâm linh trên núi.</p>
    <p><strong>12:00 - 13:30:</strong> Dùng bữa trưa tại nhà hàng trên núi.</p>
    <p><strong>13:30 - 15:00:</strong> Khám phá động Thanh Long và các điểm tham quan khác.</p>
    <p><strong>15:00 - 16:00:</strong> Đi cáp treo xuống núi.</p>
    <p><strong>16:00 - 16:30:</strong> Trở về trung tâm thành phố Tây Ninh, kết thúc tour.</p>`,
    images: [
      'https://placehold.co/800x600',
      'https://placehold.co/800x600',
      'https://placehold.co/800x600',
      'https://placehold.co/800x600'
    ],
    price: 650000,
    discountPrice: 550000,
    duration: '1 ngày',
    location: 'Núi Bà Đen, Tây Ninh',
    rating: 4.8,
    reviews: 24,
    included: [
      'Vé cáp treo khứ hồi',
      'Bữa trưa',
      'Hướng dẫn viên tiếng Việt',
      'Nước uống',
      'Bảo hiểm du lịch'
    ],
    excluded: [
      'Đồ uống ngoài chương trình',
      'Chi phí cá nhân',
      'Tiền tip cho hướng dẫn viên và tài xế'
    ],
    highlights: [
      'Trải nghiệm cáp treo hiện đại lên đỉnh Núi Bà Đen',
      'Tham quan chùa Bà Đen linh thiêng',
      'Khám phá động Thanh Long với những nhũ đá kỳ thú',
      'Ngắm nhìn toàn cảnh Tây Ninh từ đỉnh núi'
    ],
    reviewsData: [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        avatar: 'https://placehold.co/100x100',
        rating: 5,
        date: '15/03/2024',
        comment: 'Tour rất tuyệt vời, hướng dẫn viên nhiệt tình và chuyên nghiệp. Cảnh đẹp, thời gian hợp lý. Sẽ giới thiệu cho bạn bè!'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        avatar: 'https://placehold.co/100x100',
        rating: 4,
        date: '10/03/2024',
        comment: 'Tour khá tốt, tuy nhiên thời gian ở chùa Bà hơi ngắn. Cáp treo rất hiện đại và an toàn.'
      },
      {
        id: 3,
        name: 'Lê Văn C',
        avatar: 'https://placehold.co/100x100',
        rating: 5,
        date: '05/03/2024',
        comment: 'Đây là lần thứ hai tôi tham gia tour này và vẫn rất hài lòng. Cảnh đẹp, dịch vụ tốt, đáng đồng tiền bát gạo.'
      }
    ]
  },
  {
    id: 2,
    title: 'Tour Tòa Thánh Cao Đài - Khám phá kiến trúc độc đáo',
    description: 'Tham quan Tòa Thánh Cao Đài, trung tâm của đạo Cao Đài với kiến trúc độc đáo kết hợp nhiều phong cách tôn giáo khác nhau.',
    longDescription: `<p>Tòa Thánh Cao Đài là công trình kiến trúc tôn giáo độc đáo, được xây dựng từ năm 1933 đến năm 1955. Đây là trung tâm của đạo Cao Đài, một tôn giáo bản địa của Việt Nam ra đời vào năm 1926.</p>
    
    <p>Tour Tòa Thánh Cao Đài sẽ đưa bạn khám phá:</p>
    <ul>
      <li><strong>Đền Thánh:</strong> Công trình chính với kiến trúc kết hợp hài hòa giữa phương Đông và phương Tây.</li>
      <li><strong>Cửu Trùng Đài:</strong> Nơi hành lễ của tín đồ và chức sắc.</li>
      <li><strong>Bát Quái Đài:</strong> Nơi thờ phượng Đức Chí Tôn và các Đấng Thiêng Liêng.</li>
      <li><strong>Hiệp Thiên Đài:</strong> Cơ quan lập pháp của đạo Cao Đài.</li>
      <li><strong>Các công trình phụ cận:</strong> Như Đông Lang, Tây Lang, Đông Phương Sóc, Tây Phương Sóc...</li>
    </ul>
    
    <h3>Lịch trình tour</h3>
    <p><strong>08:00 - 08:30:</strong> Đón khách tại điểm hẹn ở trung tâm thành phố Tây Ninh.</p>
    <p><strong>09:00 - 10:00:</strong> Đến Tòa Thánh Cao Đài, nghe hướng dẫn viên giới thiệu về lịch sử và giáo lý của đạo Cao Đài.</p>
    <p><strong>10:00 - 11:30:</strong> Tham quan Đền Thánh và các công trình kiến trúc trong khuôn viên Tòa Thánh.</p>
    <p><strong>11:30 - 12:00:</strong> Quan sát nghi lễ cúng Ngọ (nếu đúng thời điểm).</p>
    <p><strong>12:00 - 13:30:</strong> Dùng bữa trưa tại nhà hàng địa phương.</p>
    <p><strong>13:30 - 15:00:</strong> Tham quan Bảo tàng Cao Đài và tìm hiểu thêm về lịch sử phát triển của đạo.</p>
    <p><strong>15:00 - 16:00:</strong> Tự do tham quan và chụp ảnh trong khuôn viên Tòa Thánh.</p>
    <p><strong>16:00 - 16:30:</strong> Trở về trung tâm thành phố Tây Ninh, kết thúc tour.</p>`,
    images: [
      'https://placehold.co/800x600',
      'https://placehold.co/800x600',
      'https://placehold.co/800x600',
      'https://placehold.co/800x600'
    ],
    price: 450000,
    discountPrice: 380000,
    duration: '1 ngày',
    location: 'Tòa Thánh Cao Đài, Hòa Thành, Tây Ninh',
    rating: 4.7,
    reviews: 18,
    included: [
      'Xe đưa đón',
      'Bữa trưa',
      'Hướng dẫn viên tiếng Việt',
      'Nước uống',
      'Bảo hiểm du lịch'
    ],
    excluded: [
      'Đồ uống ngoài chương trình',
      'Chi phí cá nhân',
      'Tiền tip cho hướng dẫn viên và tài xế'
    ],
    highlights: [
      'Tham quan Tòa Thánh Cao Đài - trung tâm của đạo Cao Đài',
      'Chiêm ngưỡng kiến trúc độc đáo kết hợp nhiều phong cách tôn giáo',
      'Tìm hiểu về lịch sử và giáo lý của đạo Cao Đài',
      'Quan sát nghi lễ cúng Ngọ (nếu đúng thời điểm)'
    ],
    reviewsData: [
      {
        id: 1,
        name: 'Phạm Văn D',
        avatar: 'https://placehold.co/100x100',
        rating: 5,
        date: '20/03/2024',
        comment: 'Tour rất hay và bổ ích. Được tìm hiểu về một tôn giáo độc đáo của Việt Nam. Hướng dẫn viên giải thích rất chi tiết và dễ hiểu.'
      },
      {
        id: 2,
        name: 'Nguyễn Thị E',
        avatar: 'https://placehold.co/100x100',
        rating: 4,
        date: '15/03/2024',
        comment: 'Kiến trúc Tòa Thánh rất đẹp và độc đáo. Tour được tổ chức tốt, tuy nhiên thời gian hơi gấp.'
      }
    ]
  }
]

const ThingsToDoDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [form] = Form.useForm()

  const addToCart = useCartStore(state => state.addItem)
  const { t } = useTranslation()

  useEffect(() => {
    // Simulate API fetch
    setLoading(true)
    setTimeout(() => {
      const foundTour = tours.find(t => t.id === parseInt(id || '0'))
      if (foundTour) {
        setTour(foundTour)
      }
      setLoading(false)
    }, 800)
  }, [id])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImage(index)
  }
  // date
  // Add to cart
  const handleBookNow = (values: any) => {
    if (!tour) return

    const { participants } = values

    addToCart({
      id: tour.id,
      name: tour.title,
      price: tour.discountPrice || tour.price,
      image: tour.images[0],
      type: 'tour',
      quantity: participants
    })

    notification.success({
      message: t('common.bookTourSuccess'),
      description: t('common.bookTourDescription', { participants, name: tour.title }),
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    })
  }

  if (loading) {
    return (
      <div className="tour-detail-page">
        <div className="container">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton.Image className="skeleton-image" />
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              <Skeleton active paragraph={{ rows: 15 }} />
            </Col>
            <Col xs={24} lg={8}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="tour-detail-page">
        <div className="container">
          <div className="not-found">
            <Title level={3}>Không tìm thấy tour</Title>
            <Text>Tour này không tồn tại hoặc đã bị xóa.</Text>
            <Button type="primary" onClick={handleGoBack}>
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tour-detail-page">
      <div className="container">
        <div className="tour-header">
          <Breadcrumb
            className="breadcrumb"
            items={[
              { title: <Link to="/">Trang Chủ</Link> },
              { title: <Link to="/things-to-do">Hoạt Động</Link> },
              { title: tour.title }
            ]}
          />

          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            className="back-button"
          >
            Quay lại
          </Button>

          <Title level={1} className="tour-title">
            {tour.title}
          </Title>

          <div className="tour-meta">
            <div className="meta-item">
              <EnvironmentOutlined /> {tour.location}
            </div>
            <div className="meta-item">
              <ClockCircleOutlined /> {tour.duration}
            </div>
            <div className="meta-rating">
              <Rate disabled defaultValue={tour.rating} />
              <Text className="review-count">({tour.reviews} đánh giá)</Text>
            </div>
          </div>
        </div>

        <div className="tour-gallery">
          <div className="main-image">
            <img src={tour.images[currentImage]} alt={tour.title} />
          </div>
          <div className="thumbnails">
            {tour.images.map((image: string, index: number) => (
              <div
                key={index}
                className={`thumbnail ${currentImage === index ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img src={image} alt={`${tour.title} - ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <Row gutter={[32, 32]} className="tour-content">
          <Col xs={24} lg={16} className="tour-details">
            <Card className="tour-description">
              <Title level={4}>Mô tả tour</Title>
              <Paragraph>{tour.description}</Paragraph>

              <div className="tour-highlights">
                <Title level={5}>Điểm nổi bật</Title>
                <ul className="highlights-list">
                  {tour.highlights.map((highlight: string, index: number) => (
                    <li key={index}>
                      <CheckCircleOutlined className="highlight-icon" /> {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Tabs defaultActiveKey="1" className="tour-tabs">
              <TabPane tab="Chi tiết tour" key="1">
                <div dangerouslySetInnerHTML={{ __html: tour.longDescription }} />
              </TabPane>
              <TabPane tab="Dịch vụ bao gồm" key="2">
                <div className="included-excluded">
                  <div className="included">
                    <Title level={5}>Dịch vụ bao gồm</Title>
                    <ul>
                      {tour.included.map((item: string, index: number) => (
                        <li key={index}>
                          <CheckCircleOutlined className="included-icon" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="excluded">
                    <Title level={5}>Dịch vụ không bao gồm</Title>
                    <ul>
                      {tour.excluded.map((item: string, index: number) => (
                        <li key={index}>
                          <InfoCircleOutlined className="excluded-icon" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabPane>
              <TabPane tab={`Đánh giá (${tour.reviews})`} key="3">
                <div className="reviews-section">
                  <div className="reviews-summary">
                    <div className="rating-summary">
                      <Title level={2}>{tour.rating.toFixed(1)}</Title>
                      <Rate disabled defaultValue={tour.rating} />
                      <Text>{tour.reviews} đánh giá</Text>
                    </div>
                    <Button type="primary" icon={<StarOutlined />}>
                      Viết đánh giá
                    </Button>
                  </div>

                  <Divider />

                  <List
                    itemLayout="horizontal"
                    dataSource={tour.reviewsData}
                    renderItem={(review: any) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={review.avatar} icon={<UserOutlined />} />}
                          title={
                            <div className="review-header">
                              <Text strong>{review.name}</Text>
                              <Rate disabled defaultValue={review.rating} />
                            </div>
                          }
                          description={
                            <div className="review-content">
                              <Text type="secondary">{review.date}</Text>
                              <Paragraph>{review.comment}</Paragraph>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </TabPane>
            </Tabs>
          </Col>

          <Col xs={24} lg={8} className="tour-sidebar">
            <Card className="booking-card">
              <div className="price-section">
                {tour.discountPrice ? (
                  <>
                    <Text className="current-price">
                      {tour.discountPrice.toLocaleString('vi-VN')}₫
                    </Text>
                    <Text className="original-price">
                      {tour.price.toLocaleString('vi-VN')}₫
                    </Text>
                    <Tag color="red" className="discount-tag">
                      Giảm{' '}
                      {Math.round(
                        ((tour.price - tour.discountPrice) / tour.price) * 100
                      )}
                      %
                    </Tag>
                  </>
                ) : (
                  <Text className="current-price">
                    {tour.price.toLocaleString('vi-VN')}₫
                  </Text>
                )}
                <Text className="price-per">/ người</Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleBookNow}
                initialValues={{ participants: 1 }}
              >
                <Form.Item
                  name="date"
                  label="Ngày tham gia"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                  <DatePicker
                    className="date-picker"
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>

                <Form.Item
                  name="participants"
                  label="Số người tham gia"
                  rules={[{ required: true, message: 'Vui lòng nhập số người' }]}
                >
                  <InputNumber
                    min={1}
                    max={10}
                    className="participants-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="book-button"
                    block
                  >
                    Đặt ngay
                  </Button>
                </Form.Item>
              </Form>

              <div className="booking-actions">
                <Button type="text" icon={<HeartOutlined />}>
                  Yêu thích
                </Button>
                <Button type="text" icon={<ShareAltOutlined />}>
                  Chia sẻ
                </Button>
              </div>

              <Divider />

              <div className="booking-info">
                <div className="info-item">
                  <CalendarOutlined /> <Text strong>Thời gian:</Text> {tour.duration}
                </div>
                <div className="info-item">
                  <TeamOutlined /> <Text strong>Số người tối đa:</Text> 20 người/tour
                </div>
                <div className="info-item">
                  <InfoCircleOutlined /> <Text strong>Hủy miễn phí:</Text> Trước 3 ngày
                </div>
              </div>
            </Card>

            <Card className="need-help-card">
              <Title level={5}>Cần hỗ trợ?</Title>
              <Paragraph>
                Liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về tour này.
              </Paragraph>
              <Button type="primary" block>
                Liên hệ hỗ trợ
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ThingsToDoDetail
