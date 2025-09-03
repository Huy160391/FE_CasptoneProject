import { Row, Col, Spin, Empty, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHolidayTours } from "../../services/tourcompanyService";
import { checkTourAvailability } from "../../services/tourBookingService";
import { TourDetailsStatus } from "../../types/tour";
import { useAuthStore } from "../../store/useAuthStore";
import { TourDetail as ServiceTourDetail } from "../../services/tourDetailsService";

import TourCard from "../tours/TourCard";
import LoginModal from "../auth/LoginModal";
import { mapStringToStatusEnum } from "../../utils/statusMapper";
import "./HolidayTours.scss";
import "@/styles/custom-buttons.scss";

const HolidayTours = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [tours, setTours] = useState<ServiceTourDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    loadHolidayTours();
  }, []);

  const loadRealTimeAvailability = async (tourOperationId: string) => {
    try {
      const response = await checkTourAvailability(
        tourOperationId,
        1,
        token ?? undefined
      );
      if (response.success && response.data) {
        console.log("Tour availability loaded:", response.data);
      }
    } catch (error) {
      console.error("Error loading real-time availability:", error);
    }
  };

  const loadHolidayTours = async () => {
    try {
      setLoading(true);
      const response = await getHolidayTours(6);

      if (response.success && response.data) {
        // Check if response.data has tours property (based on API response structure)
        const toursData = response.data.tours || response.data;

        // Filter only public tours (status 8) - tours available for customer booking
        const publicTours = toursData.filter((tour: ServiceTourDetail) => {
          const mappedStatus = mapStringToStatusEnum(tour.status);
          return mappedStatus === TourDetailsStatus.Public;
        });

        // Convert string status to number enum for TourCard compatibility
        const selectedTours = publicTours
          .slice(0, 4)
          .map((tour: ServiceTourDetail) => ({
            ...tour,
            status: mapStringToStatusEnum(tour.status),
          }));
        setTours(selectedTours);

        // Load real-time availability for each tour
        selectedTours.forEach((tour: ServiceTourDetail) => {
          if (tour.tourOperation?.id) {
            loadRealTimeAvailability(tour.tourOperation.id);
          }
        });
      }
    } catch (error) {
      console.error("Error loading holiday tours:", error);
      // Fallback to empty array on error
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle booking button click
  const handleBookNow = (tour: ServiceTourDetail) => {
    if (!isAuthenticated) {
      // Show login modal if user is not authenticated
      setIsLoginModalVisible(true);
      return;
    }

    // Navigate to booking page
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
  const handleViewDetails = (tour: ServiceTourDetail) =>
    navigate(`/tour-details/${tour.id}`);

  if (loading) {
    return (
      <section className="holiday-tours">
        <div className="container">
          <div className="section-header">
            <h2>Tour Ngày Lễ</h2>
            <p className="section-subtitle">
              Khám phá những tour du lịch đặc biệt dành cho các ngày lễ
            </p>
          </div>
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
          </div>
        </div>
      </section>
    );
  }

  if (tours.length === 0) {
    return (
      <section className="holiday-tours">
        <div className="container">
          <div className="section-header">
            <h2>Tour Ngày Lễ</h2>
            <p className="section-subtitle">
              Khám phá những tour du lịch đặc biệt dành cho các ngày lễ
            </p>
          </div>
          <Empty
            description="Hiện tại chưa có tour ngày lễ nào được công khai"
            style={{ padding: "50px 0" }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="holiday-tours">
      <div className="container">
        <div className="section-header">
          <h2>Tour Ngày Lễ</h2>
          <p className="section-subtitle">
            Khám phá những tour du lịch đặc biệt dành cho các ngày lễ
          </p>
        </div>

        <Row gutter={[24, 32]}>
          {tours.slice(0, 4).map((tour) => (
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
            onClick={() => navigate("/tours")}>
            Xem thêm tour ngày lễ
          </button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onRegisterClick={() => {}}
        onLoginSuccess={() => {
          setIsLoginModalVisible(false);
          message.success(
            "Đăng nhập thành công! Bạn có thể đặt tour ngay bây giờ."
          );
        }}
      />
    </section>
  );
};

export default HolidayTours;
