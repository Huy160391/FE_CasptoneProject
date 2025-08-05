import { useState, useEffect } from 'react'
import { Row, Col, Pagination, Empty, Spin, message, Typography, Button, Slider, Checkbox, Divider, InputNumber } from 'antd'
import { FilterOutlined, UserOutlined } from '@ant-design/icons'
import { useSearchParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import TourSearchBar from './TourSearchBar'
import TourCard from '../components/tours/TourCard'
import LoginModal from '../components/auth/LoginModal'
import RegisterModal from '../components/auth/RegisterModal'
import { tourDetailsService, TourDetail } from '../services/tourDetailsService'
import { TourDetailsStatus } from '../types/tour'
import { mapStringToStatusEnum } from '../utils/statusMapper'
import { useAuthStore } from '../store/useAuthStore'
import './ThingsToDo.scss'

const { Title } = Typography

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

  // State for filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
  const [showFilters, setShowFilters] = useState(true)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  // const [minRating, setMinRating] = useState<number>(0) // Tạm ẩn vì API chưa có rating
  const [maxGuests, setMaxGuests] = useState<number | null>(null)

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

  // Filter handlers
  const handlePriceRangeChange = (value: number | number[]) => {
    setPriceRange(value as [number, number])
    setCurrentPage(1)
  }

  const handleAvailableOnlyChange = (e: any) => {
    setShowAvailableOnly(e.target.checked)
    setCurrentPage(1)
  }

  // const handleRatingChange = (value: number) => {
  //   setMinRating(value)
  //   setCurrentPage(1)
  // }

  const handleMaxGuestsChange = (value: number | null) => {
    setMaxGuests(value)
    setCurrentPage(1)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Filter tours based on search criteria
  const filteredTours = tours.filter(tour => {
    // Match destination - simplified to always true for now
    const matchDestination = true;

    // Match keyword - search in title and description
    const matchKeyword = searchKeyword === '' ||
      tour.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (tour.description && tour.description.toLowerCase().includes(searchKeyword.toLowerCase()));

    // Filter by date if selected - simplified to always true for now
    const matchDate = true;

    // Filter by price range
    const tourPrice = tour.tourOperation?.price || 0;
    const matchPrice = tourPrice >= priceRange[0] && tourPrice <= priceRange[1];

    // Filter by availability
    const isAvailable = tour.tourOperation?.isActive;
    const matchAvailable = !showAvailableOnly || isAvailable;

    // Filter by rating - Tạm comment vì API chưa có rating
    const matchRating = true;

    // Filter by max guests
    const tourMaxGuests = tour.tourOperation?.maxGuests || 0;
    const matchGuests = !maxGuests || tourMaxGuests >= maxGuests;

    return matchDestination && matchKeyword && matchDate && matchPrice && matchAvailable && matchRating && matchGuests;
  })

  console.log('Filter debug:', {
    totalTours: tours.length,
    filteredTours: filteredTours.length,
    filters: {
      selectedDestination,
      searchKeyword,
      selectedDate: selectedDate?.format('YYYY-MM-DD'),
      priceRange,
      showAvailableOnly,
      maxGuests
    }
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
        {/* Page Header */}
        <div className="page-header">
          <Title level={2}>{t('thingsToDo.pageTitle')}</Title>
          <p>{t('thingsToDo.pageSubtitle')}</p>
        </div>

        {/* Search Section */}
        <div className="search-filter-section">
          <TourSearchBar />
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]} className="main-content">
          {/* Filter Sidebar */}
          <Col xs={24} md={6} className="filter-sidebar">
            <div className={`filters-container ${showFilters ? 'show' : 'hide'}`}>
              <div className="filter-header">
                <Title level={4}>
                  <FilterOutlined /> {t('tours.filters')}
                </Title>
                <Button
                  type="text"
                  onClick={toggleFilters}
                  className="toggle-filters-btn"
                >
                  {showFilters ? 'Ẩn' : 'Hiện'}
                </Button>
              </div>

              {showFilters && (
                <div className="filter-content">
                  {/* Price Range Filter */}
                  <div className="filter-section">
                    <Title level={5}>{t('tours.priceRange')}</Title>
                    <Slider
                      range
                      min={0}
                      max={10000000}
                      step={100000}
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      tooltip={{
                        formatter: (value) => `${value?.toLocaleString('vi-VN')}₫`
                      }}
                    />
                    <div className="price-range-display">
                      <span>{priceRange[0].toLocaleString('vi-VN')}₫</span>
                      <span> - </span>
                      <span>{priceRange[1].toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>

                  <Divider />

                  {/* Rating Filter - Tạm comment vì API chưa có rating */}
                  {/* <div className="filter-section">
                    <Title level={5}>
                      <StarOutlined /> {t('tours.minRating')}
                    </Title>
                    <Rate
                      value={minRating}
                      onChange={handleRatingChange}
                      allowClear
                      allowHalf
                    />
                    <div className="rating-text">
                      {minRating > 0 && (
                        <span>{minRating} sao trở lên</span>
                      )}
                    </div>
                  </div>

                  <Divider /> */}

                  {/* Max Guests Filter */}
                  <div className="filter-section">
                    <Title level={5}>
                      <UserOutlined /> {t('tours.minCapacity')}
                    </Title>
                    <InputNumber
                      value={maxGuests}
                      onChange={handleMaxGuestsChange}
                      min={1}
                      max={100}
                      placeholder="Số người tối thiểu"
                      style={{ width: '100%' }}
                      suffix="người"
                    />
                    {maxGuests && (
                      <div className="guests-text">
                        <span>Hiển thị tour từ {maxGuests} người trở lên</span>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Availability Filter */}
                  <div className="filter-section">
                    <Checkbox
                      checked={showAvailableOnly}
                      onChange={handleAvailableOnlyChange}
                    >
                      {t('tours.availableOnly')}
                    </Checkbox>
                  </div>
                </div>
              )}
            </div>
          </Col>

          {/* Tours Section */}
          <Col xs={24} md={18} className="tours-section">
            {/* Tours Grid */}
            {currentItems.length === 0 ? (
              <div className="empty-state">
                <Empty
                  description={t('thingsToDo.noToursFound') || "Không tìm thấy tour nào phù hợp với tiêu chí tìm kiếm"}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <>
                <Row gutter={[16, 24]} className="tours-grid">
                  {currentItems.map(tour => (
                    <Col xs={24} sm={12} lg={8} key={tour.id}>
                      <TourCard
                        tour={tour}
                        onBookNow={handleBookNow}
                        onViewDetails={handleViewDetails}
                      />
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <div className="results-info">
                      <span>{filteredTours.length} tours tìm thấy</span>
                    </div>

                    {filteredTours.length > 0 && (
                      <Pagination
                        current={currentPage}
                        total={filteredTours.length}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        showQuickJumper={filteredTours.length > pageSize}
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} của ${total} tours`
                        }
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </Col>
        </Row>

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
