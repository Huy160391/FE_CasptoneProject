import { useLocation } from "react-router-dom";
import {
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Empty,
  message,
  Pagination,
  Row,
  Select,
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
  const location = useLocation();
  const navigate = useNavigate();
  // const location = useLocation();
  // const { state } = location;
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [scheduleDay, setScheduleDay] = useState<string>('');
  const [hasEarlyBird, setHasEarlyBird] = useState<boolean>(true);
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');

  // Load tours from database
  const loadTours = async (page = 1) => {
    try {
      setLoading(true);
      const response = await tourDetailsService.getPublicTourDetailsList({
        pageIndex: page - 1,
        pageSize: pageSize,
        includeInactive: false,
        searchTerm: searchTerm || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        scheduleDay: scheduleDay || undefined,
        startLocation: startLocation || undefined,
        endLocation: endLocation || undefined,
        hasEarlyBird: hasEarlyBird,
      });

      if (response.success && response.data) {
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

  // Chỉ lấy state từ location khi mount
  useEffect(() => {
    if (location.state) {
      if (location.state.searchTerm) setSearchTerm(location.state.searchTerm);
      if (location.state.scheduleDay) setScheduleDay(location.state.scheduleDay);
    }
  }, []);

  // Load tours khi filter thay đổi
  useEffect(() => {
    loadTours(currentPage);
  }, [currentPage, searchTerm, scheduleDay, startLocation, endLocation, hasEarlyBird]);

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

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setPriceRange([0, 10000000]);
    setStartLocation('');
    setEndLocation('');
    setScheduleDay('');
    setHasEarlyBird(true);
    setCurrentPage(1);
  };

  // Search bar callback
  const handleSearchBarChange = (term: string, schedule?: string, startLoc?: string, endLoc?: string) => {
    setSearchTerm(term);
    setScheduleDay(schedule || '');
    setStartLocation(startLoc || '');
    setEndLocation(endLoc || '');
    setCurrentPage(1);
  };

  // Không filter lại trên FE, tours đã là danh sách đúng cho trang hiện tại từ API
  const currentItems = tours;

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
          <TourSearchBar onSearchTermChange={handleSearchBarChange} searchTerm={searchTerm} scheduleDay={scheduleDay} />
        </div>
        {/* Main Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
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
                        max={5000000}
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

                    {/* Start Location Filter */}
                    <div className="filter-section">
                      <Title level={5}>Điểm bắt đầu</Title>
                      <Select
                        value={startLocation}
                        onChange={value => { setStartLocation(value); setCurrentPage(1); }}
                        style={{ width: '100%' }}
                        placeholder="Chọn điểm bắt đầu"
                        allowClear
                      >
                        <Select.Option value="">Tất cả</Select.Option>
                        <Select.Option value="TayNinh">Tây Ninh</Select.Option>
                        <Select.Option value="HoChiMinh">Hồ Chí Minh</Select.Option>
                        {/* Thêm các địa điểm khác nếu cần */}
                      </Select>
                    </div>
                    {/* End Location Filter */}
                    <div className="filter-section">
                      <Title level={5}>Điểm kết thúc</Title>
                      <Select
                        value={endLocation}
                        onChange={value => { setEndLocation(value); setCurrentPage(1); }}
                        style={{ width: '100%' }}
                        placeholder="Chọn điểm kết thúc"
                        allowClear
                      >
                        <Select.Option value="">Tất cả</Select.Option>
                        <Select.Option value="TayNinh">Tây Ninh</Select.Option>
                        <Select.Option value="HoChiMinh">Hồ Chí Minh</Select.Option>
                        {/* Thêm các địa điểm khác nếu cần */}
                      </Select>
                    </div>

                    <Divider />

                    {/* Early Bird Discount Filter */}
                    <div className="filter-section">
                      <Checkbox
                        checked={hasEarlyBird === true}
                        onChange={e => { setHasEarlyBird(e.target.checked ? true : false); setCurrentPage(1); }}
                      >
                        Early Bird
                      </Checkbox>
                    </div>

                    <Divider />

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
        )}
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
