import { Row, Col, Spin, Empty, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFeaturedTourDetails } from '../../services/tourcompanyService'
import { checkTourAvailability } from '../../services/tourBookingService'
import { TourDetailsStatus } from '../../types/tour'
import { useAuthStore } from '../../store/useAuthStore'

import TourCard from '../common/TourCard'
import LoginModal from '../auth/LoginModal'
import { mapStringToStatusEnum } from '../../utils/statusMapper'
import './FeaturedTours.scss'
import '@/styles/custom-buttons.scss'



interface TourDetail {
  id: string;
  title: string;
  description: string;
  tourTemplateName: string;
  imageUrls: string[]; // New field for multiple images
  imageUrl?: string; // Backward compatibility - first image
  createdAt: string;
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
  status: string | number; // API trả về string, components convert thành number
}

const FeaturedTours = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [tours, setTours] = useState<TourDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const { token } = useAuthStore()

  useEffect(() => {
    loadFeaturedTours()
  }, [])

  const loadRealTimeAvailability = async (tourOperationId: string) => {
    try {
      const response = await checkTourAvailability(tourOperationId, 1, token ?? undefined)
      if (response.success && response.data) {
        // Note: realTimeAvailability state removed as it was unused
        console.log('Tour availability loaded:', response.data)
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
        const publicTours = response.data.filter((tour: TourDetail) => {
          const mappedStatus = mapStringToStatusEnum(tour.status);
          return mappedStatus === TourDetailsStatus.Public;
        })
        
        // Convert string status to number enum for TourCard compatibility
        const selectedTours = publicTours.slice(0, 4).map((tour: TourDetail) => ({
          ...tour,
          status: mapStringToStatusEnum(tour.status)
        }))
        setTours(selectedTours)

        // Load real-time availability for each tour
        selectedTours.forEach((tour: TourDetail) => {
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
  const handleViewDetails = (tour: TourDetail) => navigate(`/tour-details/${tour.id}`)







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
        {tours.slice(0, 4).map(tour => (
          <Col xs={24} sm={12} md={6} lg={6} key={tour.id}>
            <TourCard
              tour={tour}
              onBookNow={handleBookNow}
              onViewDetails={handleViewDetails}
            />
          </Col>
        ))}
      </Row>

      <div className="view-more">
        <button
          className="custom-view-more-btn"
          onClick={() => navigate('/tours')}
        >
          {t('home.viewMoreTours', 'Xem thêm tour')}
        </button>
      </div>

      {/* Login Modal */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onRegisterClick={() => { }}
        onLoginSuccess={() => {
          setIsLoginModalVisible(false)
          message.success('Đăng nhập thành công! Bạn có thể đặt tour ngay bây giờ.')
        }}
      />
    </section>
  )
}

export default FeaturedTours
