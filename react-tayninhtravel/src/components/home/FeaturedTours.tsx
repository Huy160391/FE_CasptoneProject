import { Row, Col, Card, Button, Spin, Empty, Tag, Divider } from 'antd'
import {
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  StarOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { getFeaturedTourDetails } from '../../services/tourcompanyService'
import { TourDetailsStatus } from '../../types/tour'
import './FeaturedTours.scss'

const { Meta } = Card

interface TourDetail {
  id: string;
  title: string;
  description: string;
  tourTemplateName: string;
  tourOperation?: {
    price: number;
    maxGuests: number;
  };
  timeline?: Array<{
    activity: string;
    checkInTime: string;
  }>;
  status: number;
}

const FeaturedTours = () => {
  const { t } = useTranslation()
  const [tours, setTours] = useState<TourDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedTours()
  }, [])

  const loadFeaturedTours = async () => {
    try {
      setLoading(true)
      const response = await getFeaturedTourDetails(6)

      if (response.success && response.data) {
        // Filter only public tours (status 8) - tours available for customer booking
        const publicTours = response.data.filter((tour: TourDetail) => tour.status === TourDetailsStatus.Public)
        setTours(publicTours.slice(0, 3)) // Show only 3 tours
      }
    } catch (error) {
      console.error('Error loading featured tours:', error)
      // Fallback to empty array on error
      setTours([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getStatusTag = (status: number) => {
    switch (status) {
      case TourDetailsStatus.Public:
        return <Tag color="green" icon={<StarOutlined />}>Đang mở bán</Tag>
      case TourDetailsStatus.WaitToPublic:
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Sắp mở bán</Tag>
      default:
        return <Tag color="default">Chưa sẵn sàng</Tag>
    }
  }

  const getDefaultImage = (templateName: string) => {
    if (templateName.toLowerCase().includes('núi bà đen')) {
      return '/images/tours/nui-ba-den.jpg'
    }
    if (templateName.toLowerCase().includes('cao đài')) {
      return '/images/tours/toa-thanh-cao-dai.jpg'
    }
    if (templateName.toLowerCase().includes('suối đá')) {
      return '/images/tours/suoi-da.jpg'
    }
    return '/images/tours/default-tour.jpg'
  }

  if (loading) {
    return (
      <section className="featured-tours">
        <h2>{t('home.featuredToursTitle')}</h2>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      </section>
    )
  }

  if (tours.length === 0) {
    return (
      <section className="featured-tours">
        <h2>{t('home.featuredToursTitle')}</h2>
        <Empty
          description="Hiện tại chưa có tour nào được công khai"
          style={{ padding: '50px 0' }}
        />
      </section>
    )
  }

  return (
    <section className="featured-tours">
      <div className="section-header">
        <h2>{t('home.featuredToursTitle')}</h2>
        <p className="section-subtitle">Khám phá những tour du lịch hấp dẫn nhất tại Tây Ninh</p>
      </div>

      <Row gutter={[24, 32]}>
        {tours.map(tour => (
          <Col xs={24} sm={12} lg={8} key={tour.id}>
            <Card
              hoverable
              className="tour-card"
              cover={
                <div className="tour-image-container">
                  <img
                    alt={tour.title}
                    src={tour.imageUrl || getDefaultImage(tour.tourTemplateName)}
                    className="tour-image"
                  />
                  <div className="tour-status-overlay">
                    {getStatusTag(tour.status)}
                  </div>
                </div>
              }
              actions={[
                <Button
                  type="primary"
                  size="large"
                  className="book-now-btn"
                  icon={<CalendarOutlined />}
                >
                  {t('tours.bookNow')}
                </Button>
              ]}
            >
              <div className="tour-content">
                <div className="tour-header">
                  <h3 className="tour-title">{tour.title}</h3>
                  <div className="tour-location">
                    <EnvironmentOutlined />
                    <span>{tour.tourTemplateName}</span>
                  </div>
                </div>

                <p className="tour-description">
                  {tour.description?.substring(0, 120) + '...' || 'Trải nghiệm tuyệt vời đang chờ đón bạn'}
                </p>

                <Divider style={{ margin: '16px 0' }} />

                <div className="tour-details">
                  <div className="detail-item">
                    <ClockCircleOutlined className="detail-icon" />
                    <span className="detail-label">Thời gian:</span>
                    <span className="detail-value">
                      {tour.timeline?.length ? `${tour.timeline.length} hoạt động` : '1 ngày'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <TeamOutlined className="detail-icon" />
                    <span className="detail-label">Sức chứa:</span>
                    <span className="detail-value">
                      {tour.tourOperation?.maxGuests ? `${tour.tourOperation.maxGuests} người` : 'Liên hệ'}
                    </span>
                  </div>

                  <div className="detail-item price-item">
                    <DollarOutlined className="detail-icon price-icon" />
                    <span className="detail-label">Giá tour:</span>
                    <span className="price-value">{formatPrice(tour.tourOperation?.price)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default FeaturedTours
