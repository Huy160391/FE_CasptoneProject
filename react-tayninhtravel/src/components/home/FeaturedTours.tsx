import { Row, Col, Card, Button, Spin, Empty, Tag, Divider, message } from 'antd'
import {
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  StarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFeaturedTourDetails } from '../../services/tourcompanyService'
import { checkTourAvailability } from '../../services/tourBookingService'
import { TourDetailsStatus } from '../../types/tour'
import { useAuthStore } from '../../store/useAuthStore'
import { formatCurrency } from '../../services/paymentService'
import { getTourImageWithFallback, getTourImageAltText } from '../../utils/imageUtils'
import TourPriceDisplay from '../common/TourPriceDisplay'
import LoginModal from '../auth/LoginModal'
import './FeaturedTours.scss'

const { Meta } = Card

interface TourDetail {
  id: string;
  title: string;
  description: string;
  tourTemplateName: string;
  imageUrl?: string;
  tourOperation?: {
    id: string;
    price: number;
    maxGuests: number;
    currentBookings: number;
    isActive: boolean;
  };
  timeline?: Array<{
    activity: string;
    checkInTime: string;
  }>;
  status: number;
}

const FeaturedTours = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [tours, setTours] = useState<TourDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const [realTimeAvailability, setRealTimeAvailability] = useState<Record<string, {
    availableSlots: number;
    maxGuests: number;
    currentBookings: number;
  }>>({})
  const { token } = useAuthStore()

  useEffect(() => {
    loadFeaturedTours()
  }, [])

  const loadRealTimeAvailability = async (tourOperationId: string) => {
    try {
      const response = await checkTourAvailability(tourOperationId, 1, token ?? undefined)
      if (response.success && response.data) {
        setRealTimeAvailability(prev => ({
          ...prev,
          [tourOperationId]: {
            availableSlots: response.data.availableSlots,
            maxGuests: response.data.maxGuests,
            currentBookings: response.data.currentBookings
          }
        }))
      }
    } catch (error) {
      console.error('Error loading real-time availability:', error)
    }
  }

  const loadFeaturedTours = async () => {
    try {
      setLoading(true)
      const response = await getFeaturedTourDetails(6)

      if (response.success && response.data) {
        // Filter only public tours (status 8) - tours available for customer booking
        const publicTours = response.data.filter((tour: TourDetail) => tour.status === TourDetailsStatus.Public)
        const selectedTours = publicTours.slice(0, 3) // Show only 3 tours
        setTours(selectedTours)

        // Load real-time availability for each tour
        selectedTours.forEach(tour => {
          if (tour.tourOperation?.id) {
            loadRealTimeAvailability(tour.tourOperation.id)
          }
        })
      }
    } catch (error) {
      console.error('Error loading featured tours:', error)
      // Fallback to empty array on error
      setTours([])
    } finally {
      setLoading(false)
    }
  }

  // Handle booking button click
  const handleBookNow = (tour: TourDetail) => {
    if (!isAuthenticated) {
      // Show login modal if user is not authenticated
      setIsLoginModalVisible(true)
      return
    }

    // Check if tour has active operation
    if (!tour.tourOperation || !tour.tourOperation.isActive) {
      message.error('Tour này hiện không khả dụng để đặt')
      return
    }

    // Navigate to booking page
    message.info({
      content: 'Đang chuyển đến trang đặt tour...',
      duration: 1
    })

    navigate(`/booking/${tour.id}`, {
      state: {
        tourData: tour
      }
    })
  }

  // Handle view tour details
  const handleViewDetails = (tour: TourDetail) => {
    // Navigate to tour details page - this should call /api/TourDetails/{id}
    navigate(`/tour-details/${tour.id}`)
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
                    alt={getTourImageAltText(tour.title, tour.tourTemplateName)}
                    src={getTourImageWithFallback(tour.imageUrl, tour.tourTemplateName)}
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
                  onClick={() => handleBookNow(tour)}
                  disabled={!tour.tourOperation?.isActive}
                >
                  {t('tours.bookNow')}
                </Button>,
                <Button
                  type="link"
                  onClick={() => handleViewDetails(tour)}
                >
                  {t('tours.viewDetails')}
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

                  {tour.tourOperation && (
                    <div className="detail-item">
                      <ShoppingCartOutlined className="detail-icon" />
                      <span className="detail-label">Đã đặt:</span>
                      <span className="detail-value">
                        {realTimeAvailability[tour.tourOperation.id]
                          ? realTimeAvailability[tour.tourOperation.id].currentBookings
                          : (tour.tourOperation.currentBookings || 0)} / {tour.tourOperation.maxGuests} người
                      </span>
                    </div>
                  )}

                  <div className="detail-item price-item">
                    <DollarOutlined className="detail-icon price-icon" />
                    <span className="detail-label">Giá tour:</span>
                    <div className="price-value">
                      {tour.tourOperation?.price ? (
                        <TourPriceDisplay
                          price={tour.tourOperation.price}
                          createdAt={tour.createdAt}
                          size="small"
                          showDetails={true}
                        />
                      ) : (
                        <span>Liên hệ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Login Modal */}
      <LoginModal
        visible={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        onSuccess={() => {
          setIsLoginModalVisible(false)
          message.success('Đăng nhập thành công! Bạn có thể đặt tour ngay bây giờ.')
        }}
      />
    </section>
  )
}

export default FeaturedTours
