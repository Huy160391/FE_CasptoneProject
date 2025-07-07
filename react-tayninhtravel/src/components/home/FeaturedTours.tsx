import { Row, Col, Card, Button, Rate, Spin, Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { getFeaturedTourDetails } from '../../services/tourcompanyService'
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
        // Filter only approved tours (status 4)
        const approvedTours = response.data.filter((tour: TourDetail) => tour.status === 4)
        setTours(approvedTours.slice(0, 3)) // Show only 3 tours
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
          description="Hiện tại chưa có tour nào được duyệt"
          style={{ padding: '50px 0' }}
        />
      </section>
    )
  }

  return (
    <section className="featured-tours">
      <h2>{t('home.featuredToursTitle')}</h2>

      <Row gutter={[24, 24]}>
        {tours.map(tour => (
          <Col xs={24} sm={12} md={8} key={tour.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={tour.title}
                  src={getDefaultImage(tour.tourTemplateName)}
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
              className="tour-card"
            >
              <Meta
                title={tour.title}
                description={tour.description?.substring(0, 100) + '...' || tour.tourTemplateName}
              />
              <div className="tour-info">
                <div className="info-item">
                  <span className="label">{t('home.tourInfo.duration')}:</span>
                  <span className="value">
                    {tour.timeline?.length ? `${tour.timeline.length} hoạt động` : '1 ngày'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">{t('home.tourInfo.price')}:</span>
                  <span className="value">{formatPrice(tour.tourOperation?.price)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Sức chứa:</span>
                  <span className="value">
                    {tour.tourOperation?.maxGuests ? `${tour.tourOperation.maxGuests} người` : 'Liên hệ'}
                  </span>
                </div>
              </div>
              <Button type="primary" block>
                {t('tours.bookNow')}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default FeaturedTours
