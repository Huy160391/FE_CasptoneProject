import { useState, useEffect } from 'react'
import { Row, Col, Pagination, Empty, Spin, message } from 'antd'
import { useSearchParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import TourSearchBar from './TourSearchBar'
import TourCard from '../components/common/TourCard'
import LoginModal from '../components/auth/LoginModal'
import RegisterModal from '../components/auth/RegisterModal'
import { tourDetailsService, TourDetail } from '../services/tourDetailsService'
import { TourDetailsStatus } from '../types/tour'
import { mapStringToStatusEnum } from '../utils/statusMapper'
import { useAuthStore } from '../store/useAuthStore'
import './ThingsToDo.scss'

const ThingsToDo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationParam = searchParams.get('location');
  const dateParam = searchParams.get('date');
  const keywordParam = searchParams.get('keyword');
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // State for search filters
  const [selectedDestination, setSelectedDestination] = useState(locationParam ? locationParam : 'all')
  const [searchKeyword, setSearchKeyword] = useState(keywordParam || '')
  const [selectedDate, setSelectedDate] = useState(dateParam ? dayjs(dateParam) : null)

  // State for tours data
  const [tours, setTours] = useState<TourDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6; // Số items trên mỗi trang

  // State for modals
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false)

  // Load tours from database
  const loadTours = async (page = 1) => {
    try {
      setLoading(true)
      const response = await tourDetailsService.getPublicTourDetailsList({
        pageIndex: page - 1, // API uses 0-based indexing
        pageSize: pageSize,
        includeInactive: false
      })

      if (response.success && response.data) {
        // Filter only public tours (status 8) - tours available for customer booking
        const publicTours = response.data.filter((tour: TourDetail) => {
          const mappedStatus = mapStringToStatusEnum(tour.status);
          return mappedStatus === TourDetailsStatus.Public;
        })

        // Convert string status to number enum for TourCard compatibility
        const toursWithStatus = publicTours.map((tour: TourDetail) => ({
          ...tour,
          status: mapStringToStatusEnum(tour.status),
          tourTemplateName: tour.title, // Use title as template name fallback
          description: tour.description || '', // Ensure description is not undefined
          timeline: tour.timeline || [] // Ensure timeline is not undefined
        }))

        setTours(toursWithStatus)
      }
    } catch (error) {
      console.error('Error loading tours:', error)
      message.error('Không thể tải danh sách tour. Vui lòng thử lại sau.')
      setTours([])
    } finally {
      setLoading(false)
    }
  }

  // Update search fields when URL params change
  useEffect(() => {
    if (locationParam) {
      setSelectedDestination(locationParam);
    }

    if (keywordParam) {
      setSearchKeyword(keywordParam);
    }

    if (dateParam) {
      setSelectedDate(dayjs(dateParam));
    }
  }, [locationParam, dateParam, keywordParam]);

  // Load tours on component mount
  useEffect(() => {
    loadTours(currentPage)
  }, [currentPage])

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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Filter tours based on search criteria
  const filteredTours = tours.filter(tour => {
    // Match destination - if selectedDestination is 'all' or matches the tour location
    const matchDestination = selectedDestination === 'all' ||
      (tour.startLocation && tour.startLocation.toLowerCase().includes(selectedDestination.toLowerCase())) ||
      (tour.endLocation && tour.endLocation.toLowerCase().includes(selectedDestination.toLowerCase())) ||
      (selectedDestination === 'tayninh' && (
        (tour.startLocation && tour.startLocation.toLowerCase().includes('tây ninh')) ||
        (tour.endLocation && tour.endLocation.toLowerCase().includes('tây ninh'))
      ));

    // Match keyword - search in title and description
    const matchKeyword = searchKeyword === '' ||
      tour.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (tour.description && tour.description.toLowerCase().includes(searchKeyword.toLowerCase()));

    // Filter by date if selected (check if tour operation has dates)
    const matchDate = !selectedDate ||
      (tour.tourOperation?.tourStartDate &&
       dayjs(tour.tourOperation.tourStartDate).isSame(selectedDate, 'day')) ||
      (tour.tourOperation?.tourEndDate &&
       dayjs(tour.tourOperation.tourEndDate).isSame(selectedDate, 'day'));

    return matchDestination && matchKeyword && matchDate;
  })

  // Calculate current page items
  const currentItems = filteredTours.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="things-to-do-page">
        <div className="container">
          <div className="page-header">
            <h1>{t('thingsToDo.pageTitle')}</h1>
            <p>{t('thingsToDo.pageSubtitle')}</p>
          </div>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="things-to-do-page">
      <div className="container">
        <div className="page-header">
          <h1>{t('thingsToDo.pageTitle')}</h1>
          <p>{t('thingsToDo.pageSubtitle')}</p>
        </div>

        <div className="search-filter-section">
          <TourSearchBar />
        </div>

        <div className="tours-grid">
          {currentItems.length === 0 ? (
            <Empty
              description="Không tìm thấy tour nào phù hợp với tiêu chí tìm kiếm"
              style={{ padding: '50px 0' }}
            />
          ) : (
            <>
              <Row gutter={[24, 32]}>
                {currentItems.map(tour => (
                  <Col xs={24} sm={12} md={8} lg={8} key={tour.id}>
                    <TourCard
                      tour={tour as any}
                      onBookNow={handleBookNow as any}
                      onViewDetails={handleViewDetails as any}
                    />
                  </Col>
                ))}
              </Row>

              {filteredTours.length > pageSize && (
                <div className="pagination-container">
                  <Pagination
                    current={currentPage}
                    total={filteredTours.length}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Login Modal */}
        <LoginModal
          isVisible={isLoginModalVisible}
          onClose={() => setIsLoginModalVisible(false)}
          onRegisterClick={() => {
            setIsLoginModalVisible(false)
            setIsRegisterModalVisible(true)
          }}
        />

        {/* Register Modal */}
        <RegisterModal
          isVisible={isRegisterModalVisible}
          onClose={() => setIsRegisterModalVisible(false)}
          onLoginClick={() => {
            setIsRegisterModalVisible(false)
            setIsLoginModalVisible(true)
          }}
        />
      </div>
    </div>
  )
}

export default ThingsToDo
