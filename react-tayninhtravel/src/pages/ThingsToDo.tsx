import {
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Empty,
  InputNumber,
  message,
  Pagination,
  Row,
  Slider,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import TourCard from "../components/tours/TourCard";
import { TourDetail, tourDetailsService } from "../services/tourDetailsService";
import { useAuthStore } from "../store/useAuthStore";
import "./ThingsToDo.scss";
import TourSearchBar from "./TourSearchBar";

const { Title } = Typography;

const ThingsToDo = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // State for tours data
  const [tours, setTours] = useState<TourDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 6; // Số items trên mỗi trang

  // State for modals
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);

  // State for filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(true);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [maxGuests, setMaxGuests] = useState<number | null>(null);

  // Load tours from database
  const loadTours = async (page = 1) => {
    try {
      setLoading(true);
      const response = await tourDetailsService.getPublicTourDetailsList({
        pageIndex: page - 1, // API uses 0-based indexing
        pageSize: pageSize,
        includeInactive: false,
      });

      if (response.success && response.data) {
        // Convert string status to number enum for TourCard compatibility
        const toursWithStatus = response.data.map((tour: TourDetail) => ({
          ...tour,
          status: tour.status,
          tourTemplateName: tour.title,
          description: tour.description || "",
          timeline: tour.timeline || [],
        }));

        setTours(toursWithStatus);
        setTotalCount(response.totalCount || toursWithStatus.length);
      }
    } catch (error) {
      console.error("Error loading tours:", error);
      message.error("Không thể tải danh sách tour. Vui lòng thử lại sau.");
      setTours([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours(currentPage);
  }, [currentPage]);

  // Handle booking button click
  const handleBookNow = (tour: TourDetail) => {
    if (!isAuthenticated) {
      setIsLoginModalVisible(true);
      return;
    }
    message.info({
      content: "Đang chuyển đến trang đặt tour...",
      duration: 1,
    });
    navigate(`/booking/${tour.id}`, {
      state: {
        tourData: tour,
      },
    });
  };

  // Handle view tour details
  const handleViewDetails = (tour: TourDetail) =>
    navigate(`/tour-details/${tour.id}`);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Filter handlers
  const handlePriceRangeChange = (value: number | number[]) => {
    setPriceRange(value as [number, number]);
    setCurrentPage(1);
  };

  const handleAvailableOnlyChange = (e: any) => {
    setShowAvailableOnly(e.target.checked);
    setCurrentPage(1);
  };

  const handleMaxGuestsChange = (value: number | null) => {
    setMaxGuests(value);
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setPriceRange([0, 10000000]);
    setShowAvailableOnly(false);
    setMaxGuests(null);
    setCurrentPage(1);
  };

  // Không filter lại trên FE, tours đã là danh sách đúng cho trang hiện tại từ API
  const currentItems = tours;

  if (loading) {
    return (
      <div className="things-to-do-page">
        <div className="container">
          <div className="page-header">
            <h1>{t("thingsToDo.pageTitle")}</h1>
            <p>{t("thingsToDo.pageSubtitle")}</p>
          </div>
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="things-to-do-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <Title level={2}>{t("thingsToDo.pageTitle")}</Title>
          <p>{t("thingsToDo.pageSubtitle")}</p>
        </div>

        {/* Search Section */}
        <div className="search-filter-section">
          <TourSearchBar />
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]} className="main-content">
          {/* Filter Sidebar */}
          <Col xs={24} md={6} className="filter-sidebar">
            <div className={`filters-container ${showFilters ? "show" : "hide"}`}>
              <div className="filter-header">
                <Title level={4}>
                  <FilterOutlined /> {t("tours.filters")}
                </Title>
                <Button
                  type="text"
                  onClick={toggleFilters}
                  className="toggle-filters-btn">
                  {showFilters ? "Ẩn" : "Hiện"}
                </Button>
              </div>

              {showFilters && (
                <div className="filter-content">
                  {/* Price Range Filter */}
                  <div className="filter-section">
                    <Title level={5}>{t("tours.priceRange")}</Title>
                    <Slider
                      range
                      min={0}
                      max={10000000}
                      step={100000}
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      tooltip={{
                        formatter: (value) => `${value?.toLocaleString("vi-VN")}₫`,
                      }}
                    />
                    <div className="price-range-display">
                      <span>{priceRange[0].toLocaleString("vi-VN")}₫</span>
                      <span> - </span>
                      <span>{priceRange[1].toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>

                  <Divider />

                  {/* Max Guests Filter */}
                  <div className="filter-section">
                    <Title level={5}>
                      <UserOutlined /> {t("tours.minCapacity")}
                    </Title>
                    <InputNumber
                      value={maxGuests}
                      onChange={handleMaxGuestsChange}
                      min={1}
                      max={100}
                      placeholder={t("tours.minCapacityPlaceholder")}
                      style={{ width: "100%" }}
                      suffix={t("tours.unitPerson")}
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
                      onChange={handleAvailableOnlyChange}>
                      {t("tours.availableOnly")}
                    </Checkbox>
                  </div>
                  <div className="filter-section">
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={resetFilters}
                      block>
                      {t("shopList.resetFilters")}
                    </Button>
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
                  description={
                    t("thingsToDo.noToursFound") ||
                    "Không tìm thấy tour nào phù hợp với tiêu chí tìm kiếm"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <>
                <Row gutter={[16, 24]} className="tours-grid">
                  {currentItems.map((tour) => (
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
                      <span>
                        {totalCount} {t("tour.found")}
                      </span>
                    </div>

                    {totalCount > 0 && (
                      <Pagination
                        current={currentPage}
                        total={totalCount}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                          showTotal={(_, range) => (
                            <span className="results-info-total">
                              {range[0]}-{range[1]} {t("shop.of")} {totalCount} {t("tour.total")}
                            </span>
                        )}
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
            setIsLoginModalVisible(false);
            setIsRegisterModalVisible(true);
          }}
        />

        {/* Register Modal */}
        <RegisterModal
          isVisible={isRegisterModalVisible}
          onClose={() => setIsRegisterModalVisible(false)}
          onLoginClick={() => {
            setIsRegisterModalVisible(false);
            setIsLoginModalVisible(true);
          }}
        />
      </div>
    </div>
  );
};

export default ThingsToDo;
