import {
  CreditCardOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Space,
  Spin,
  Steps,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoginModal from "../components/auth/LoginModal";
import { useEnhancedPayment } from "../services/enhancedPaymentService";
import { formatCurrency } from "../services/paymentService";
import {
  calculateBookingPrice,
  checkTourAvailability,
  checkTourSlotCapacity,
  createTourBooking,
  CreateTourBookingRequest,
  getTourDetailsForBooking,
  PriceCalculation,
  TourDetailsForBooking,
  validateBookingRequest,
} from "../services/tourBookingService";
import { TourSlotDto, tourSlotService } from "../services/tourSlotService";
import { useAuthStore } from "../store/useAuthStore";
import { GuestInfoRequest } from "../types/individualQR";
import { getDefaultTourImage } from "../utils/imageUtils";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface BookingFormData {
  bookingType: "representative" | "individual"; // NEW: Booking type selection
  numberOfGuests: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  specialRequests?: string;
  guests: GuestInfoRequest[]; // ✅ NEW: Individual guest info
}

const BookingPage: React.FC = () => {
  const { t } = useTranslation();
  const { tourId } = useParams<{ tourId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, user } = useAuthStore();
  const { createPaymentLink } = useEnhancedPayment();

  const [form] = Form.useForm<BookingFormData>();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false); // ✅ NEW: Prevent duplicate payment calls

  const [tourDetails, setTourDetails] = useState<TourDetailsForBooking | null>(
    null
  );
  const [priceCalculation, setPriceCalculation] =
    useState<PriceCalculation | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [formValues, setFormValues] = useState<BookingFormData>({
    bookingType: "representative", // Default to representative booking
    numberOfGuests: 1,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    specialRequests: "",
    guests: [{ guestName: "", guestEmail: "", guestPhone: "" }], // ✅ NEW
  });

  // Confirmation checkbox state
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Tour slots state
  const [tourSlots, setTourSlots] = useState<TourSlotDto[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TourSlotDto | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Always use Enhanced Payment System

  // Get initial booking data from navigation state
  useEffect(() => {
    if (location.state?.bookingDetails) {
      setBookingData(location.state.bookingDetails);
    }
  }, [location.state]);

  // Load tour details
  useEffect(() => {
    const loadTourDetails = async () => {
      if (!tourId) {
        setError(t('booking.errors.tourIdNotFound', 'Không tìm thấy ID tour'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getTourDetailsForBooking(tourId);

        if (response.success && response.data) {
          setTourDetails(response.data);

          // Load tour slots
          loadTourSlots(response.data.id);

          // Pre-fill form with user data if available
          const initialValues = {
            bookingType: "representative" as const,
            numberOfGuests: bookingData?.numberOfGuests || 1,
            contactName: user?.name || "",
            contactEmail: user?.email || "",
            contactPhone: user?.phone || "",
            specialRequests: "",
          };

          // Update both form and state
          form.setFieldsValue(initialValues);
          setFormValues({
            ...initialValues,
            guests: [],
          });

          // Trigger initial price calculation after form is set
          setTimeout(() => {
            if (initialValues.numberOfGuests > 0) {
              handleGuestCountChange({
                numberOfGuests: initialValues.numberOfGuests,
              });
            }
          }, 100);
        } else {
          setError(response.message || t('booking.errors.loadTourDetails', 'Không thể tải thông tin tour'));
        }
      } catch (error: any) {
        console.error("Error loading tour details:", error);
        setError(error.message || t('booking.errors.loadTourDetailsGeneric', 'Có lỗi xảy ra khi tải thông tin tour'));
      } finally {
        setLoading(false);
      }
    };

    loadTourDetails();
  }, [tourId, user, form, bookingData]);

  // Auto-calculate price when both tourDetails and selectedSlot are available
  useEffect(() => {
    if (
      tourDetails &&
      selectedSlot &&
      formValues.numberOfGuests > 0 &&
      !calculating &&
      !priceCalculation
    ) {
      console.log("Auto-triggering price calculation on component ready");
      handleGuestCountChange({ numberOfGuests: formValues.numberOfGuests });
    }
  }, [
    tourDetails,
    selectedSlot,
    formValues.numberOfGuests,
    calculating,
    priceCalculation,
  ]);

  // Load tour slots
  const loadTourSlots = async (tourDetailsId: string) => {
    try {
      setSlotsLoading(true);
      const response = await tourSlotService.getSlotsByTourDetails(
        tourDetailsId,
        token ?? undefined
      );
      console.log("Raw tour slots response:", response);

      if (response.success && response.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        console.log("Current date for filtering:", today);
        console.log("All slots before filtering:", response.data);

        // ✅ SIMPLIFIED: Show ALL slots, no filtering - handle click behavior instead
        const availableSlots = response.data.filter((slot) => {
          const slotDate = new Date(slot.tourDate);
          const isNotPast = slotDate >= today;
          const isInProgress = slot.status === 5 ||
            slot.statusName?.toLowerCase().includes('inprogress') ||
            slot.statusName?.toLowerCase().includes('đang thực hiện') ||
            slot.statusName?.toLowerCase().includes('đang tiến hành'); // InProgress status

          console.log(`🔍 Slot ${slot.id} SIMPLE DEBUG:`, {
            tourDate: slot.tourDate,
            isActive: slot.isActive,
            status: slot.status,
            statusName: slot.statusName,
            maxGuests: slot.maxGuests,
            currentBookings: slot.currentBookings,
            availableSpots: slot.availableSpots,
            isNotPast: isNotPast,
            isInProgress: isInProgress,
            willShow: slot.isActive && isNotPast && !isInProgress ? "✅ SHOW" : "❌ HIDE",
            hideReason: !slot.isActive
              ? "not active"
              : !isNotPast
                ? "in past"
                : isInProgress
                  ? "in progress"
                  : null,
          });

          // ✅ UPDATED: Filter out inactive, past slots, and InProgress slots
          return slot.isActive && isNotPast && !isInProgress;
        });

        console.log("Available slots after filtering:", availableSlots);
        setTourSlots(availableSlots);

        // Auto-select first available slot if only one
        if (availableSlots.length === 1) {
          setSelectedSlot(availableSlots[0]);
          // Trigger price calculation for auto-selected slot
          const currentValues = form.getFieldsValue();
          if (currentValues.numberOfGuests > 0) {
            handleGuestCountChange({
              numberOfGuests: currentValues.numberOfGuests,
            });
          }
        }

        // Clear selected slot if it's no longer available
        if (
          selectedSlot &&
          !availableSlots.find((slot) => slot.id === selectedSlot.id)
        ) {
          setSelectedSlot(null);
        }
      }
    } catch (error) {
      console.error("Error loading tour slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Update availability when slot changes
  const updateSlotAvailability = async (slot: TourSlotDto, guestCount: number = 1) => {
    if (!slot) return;

    try {
      const availabilityResponse = await checkTourSlotCapacity(
        slot.id,
        guestCount,
        token ?? undefined
      );

      if (availabilityResponse.success) {
        console.log("Updated slot availability:", availabilityResponse.data);
        setAvailability(availabilityResponse.data);
      } else {
        console.warn("Failed to check slot availability:", availabilityResponse.message);
        // Fallback to legacy TourOperation check
        if (tourDetails) {
          const legacyResponse = await checkTourAvailability(
            tourDetails.tourOperation.id,
            guestCount,
            token ?? undefined
          );
          if (legacyResponse.success) {
            console.log("Fallback availability:", legacyResponse.data);
            setAvailability(legacyResponse.data);
          }
        }
      }
    } catch (error) {
      console.error("Error checking slot availability:", error);
    }
  };

  // Calculate price when guest count changes
  const handleGuestCountChange = async (values: Partial<BookingFormData>) => {
    if (!tourDetails || !values.numberOfGuests || !selectedSlot) return;

    try {
      setCalculating(true);
      console.log(" - TourOperation ID:", tourDetails.tourOperation.id);
      const response1 = await calculateBookingPrice(
        {
          tourOperationId: tourDetails.tourOperation.id, // ✅ FIXED: Pass correct ID to the service
          numberOfGuests: values.numberOfGuests,
        },
        token ?? undefined
      );
      console.log("API response:", response1);

      if (response1.success && response1.data) {
        setPriceCalculation(response1.data);
        console.log("Set priceCalculation:", response1.data);

        // ✅ FIXED: Check slot-specific availability instead of TourOperation
        const availabilityResponse = await checkTourSlotCapacity(
          selectedSlot.id,
          values.numberOfGuests,
          token ?? undefined
        );

        if (availabilityResponse.success) {
          console.log("Slot availability data:", availabilityResponse.data); // Debug log
          setAvailability(availabilityResponse.data);
        } else {
          console.warn(
            "Failed to check slot availability:",
            availabilityResponse.message
          );
          // Fallback to legacy TourOperation check
          const legacyResponse = await checkTourAvailability(
            tourDetails.tourOperation.id,
            values.numberOfGuests,
            token ?? undefined
          );
          if (legacyResponse.success) {
            console.log(
              "Fallback to operation availability:",
              legacyResponse.data
            );
            setAvailability(legacyResponse.data);
          }
        }
      }
    } catch (error: any) {
      console.error("Error calculating price:", error);
      message.error(t('booking.errors.cannotCalculatePrice', 'Không thể tính giá tour'));
    } finally {
      setCalculating(false);
    }
  };

  // ✅ NEW: Helper functions for individual guests
  const updateGuestInfo = (
    index: number,
    field: keyof GuestInfoRequest,
    value: string
  ) => {
    const updatedGuests = [...formValues.guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };

    setFormValues((prev) => ({
      ...prev,
      guests: updatedGuests,
    }));
  };

  const validateUniqueEmail = (
    email: string,
    currentIndex: number,
    guests: GuestInfoRequest[]
  ) => {
    if (!email) return Promise.resolve();

    const duplicateIndex = guests.findIndex(
      (guest, index) =>
        index !== currentIndex &&
        guest.guestEmail.toLowerCase() === email.toLowerCase()
    );

    if (duplicateIndex !== -1) {
      return Promise.reject(
        new Error(`Email đã được sử dụng cho khách hàng ${duplicateIndex + 1}`)
      );
    }

    return Promise.resolve();
  };

  const handleGuestArrayUpdate = (allValues: BookingFormData) => {
    const newGuestCount = allValues.numberOfGuests;
    const currentGuests = formValues.guests || []; // Safe fallback

    // Auto-adjust guests array
    const newGuests = Array.from({ length: newGuestCount }, (_, index) => {
      if (index < currentGuests.length) {
        return currentGuests[index]; // Keep existing data
      } else {
        // Auto-populate first guest with contact info
        if (index === 0 && allValues.contactName && allValues.contactEmail) {
          return {
            guestName: allValues.contactName,
            guestEmail: allValues.contactEmail,
            guestPhone: allValues.contactPhone || "",
          };
        }
        return { guestName: "", guestEmail: "", guestPhone: "" };
      }
    });

    setFormValues((prev) => ({
      ...prev,
      guests: newGuests,
    }));

    // Continue with existing price calculation logic...
    if (tourDetails && selectedSlot) {
      handleGuestCountChange({ numberOfGuests: allValues.numberOfGuests });
    }
  };

  const handleFormValuesChange = (
    changedValues: Partial<BookingFormData>,
    allValues: BookingFormData
  ) => {
    // Save form values to state
    setFormValues(allValues);

    if (changedValues.numberOfGuests) {
      // Update price calculation (original function)
      handleGuestCountChange(changedValues);
      // Update guests array (new function)
      handleGuestArrayUpdate(allValues);
    }
  };

  const handleNext = () => {
    // Validate slot selection for step 0
    if (currentStep === 0) {
      if (tourSlots.length > 0 && !selectedSlot) {
        message.error(t('booking.errors.pleaseSelectDate', 'Vui lòng chọn ngày tour'));
        return;
      }
    }

    form
      .validateFields()
      .then(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);

        // Trigger price calculation when moving to confirmation step (step 2)
        if (nextStep === 2 && selectedSlot && formValues.numberOfGuests > 0) {
          handleGuestCountChange({ numberOfGuests: formValues.numberOfGuests });
        }
      })
      .catch(() => {
        message.error(t('booking.errors.pleaseCompleteInfo', 'Vui lòng điền đầy đủ thông tin'));
      });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Prevent double submission
    if (submitting) {
      return;
    }

    setSubmitting(true);

    if (!isAuthenticated) {
      setIsLoginModalVisible(true);
      setSubmitting(false);
      return;
    }

    if (!tourDetails || !token) {
      message.error("Thông tin không đầy đủ để đặt tour");
      setSubmitting(false);
      return;
    }

    // Validate price calculation is available
    if (
      !priceCalculation ||
      !priceCalculation.finalPrice ||
      priceCalculation.finalPrice <= 0
    ) {
      message.error(
        "Chưa có thông tin giá tour. Vui lòng thử lại sau ít phút."
      );
      setSubmitting(false);
      return;
    }

    // Validate selected slot
    if (!selectedSlot) {
      message.error(t('booking.errors.pleaseSelectDate'));
      setSubmitting(false);
      return;
    }

    try {
      // Use form values from state (since form might not be rendered in current step)

      // ✅ NEW: Enhanced booking request with proper backend API structure
      let guestsData: GuestInfoRequest[] = [];

      if (formValues.bookingType === "representative") {
        // For representative booking: Create guest records for all numberOfGuests
        // First guest is the representative with full info
        // Other guests are placeholders to satisfy backend validation
        guestsData = [];

        // Add the representative as first guest
        guestsData.push({
          guestName: formValues.contactName,
          guestEmail: formValues.contactEmail,
          guestPhone: formValues.contactPhone,
        });

        // Add placeholder guests for the rest
        for (let i = 1; i < formValues.numberOfGuests; i++) {
          guestsData.push({
            guestName: `Khách ${i + 1}`,
            guestEmail: `guest${i + 1}_${Date.now()}@placeholder.com`, // Unique placeholder email
            guestPhone: "",
          });
        }
      } else {
        // For individual booking: Use the actual guest data
        guestsData = formValues.guests;
      }

      const bookingRequest: CreateTourBookingRequest = {
        tourSlotId: selectedSlot?.id || "",
        numberOfGuests: formValues.numberOfGuests,
        contactPhone: formValues.contactPhone,
        specialRequests: formValues.specialRequests,
        bookingType:
          formValues.bookingType === "individual"
            ? "Individual"
            : "GroupRepresentative",

        // For group representative booking
        ...(formValues.bookingType === "representative" && {
          groupName: `Nhóm ${formValues.contactName}`,
          groupDescription: `Đặt tour cho ${formValues.numberOfGuests} người`,
          groupRepresentative: {
            guestName: formValues.contactName,
            guestEmail: formValues.contactEmail,
            guestPhone: formValues.contactPhone,
          },
        }),

        // Always send the guests array with correct number of records
        guests: guestsData,
      };

      const validation = validateBookingRequest(bookingRequest);

      if (!validation.isValid) {
        message.error(validation.errors.join(", "));
        return;
      }

      const response = await createTourBooking(bookingRequest, token);

      if (response.success && response.data) {
        message.success(
          "Đặt tour thành công! Đang chuyển đến trang thanh toán..."
        );

        // === ENHANCED PAYMENT SYSTEM (ONLY) ===

        // ✅ ENHANCED PAYMENT: Flexible approach theo plan BE với duplicate prevention
        try {
          // Prevent duplicate payment calls
          if (paymentProcessing) {
            return;
          }

          setPaymentProcessing(true);

          // Extract payment info từ backend response
          const paymentRequest = {
            // Primary: Use tourBookingId if available
            tourBookingId: response.data?.bookingId,

            // Fallback: Use bookingCode as identifier
            bookingCode: response.data?.bookingCode,

            // Amount: Try multiple sources
            amount: priceCalculation?.finalPrice || 0,

            description: `Tour Booking - ${response.data?.bookingCode || "Individual QR System"
              }`,
          };

          // Validate required fields
          if (!paymentRequest.amount || paymentRequest.amount <= 0) {
            throw new Error("Invalid payment amount");
          }

          if (!paymentRequest.tourBookingId && !paymentRequest.bookingCode) {
            throw new Error("No booking identifier found");
          }

          // Create payment link
          await createPaymentLink(paymentRequest);
        } catch (enhancedError: any) {
          console.error("Enhanced payment failed:", enhancedError);
          message.error(
            `Không thể tạo thanh toán: ${enhancedError.message || "Lỗi không xác định"
            }`
          );
        } finally {
          setPaymentProcessing(false);
        }
      } else {
        message.error(response.message || "Có lỗi xảy ra khi đặt tour");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      message.error(
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi đặt tour"
      );
    } finally {
      setSubmitting(false);
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !tourDetails) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <Alert
          message={t('booking.errors.cannotLoadTour', 'Không thể tải thông tin tour')}
          description={error || t('booking.errors.tourNotExists', 'Tour không tồn tại hoặc đã bị xóa')}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate("/tours")}>
              {t('booking.viewOtherTours', 'Xem tour khác')}
            </Button>
          }
        />
      </div>
    );
  }

  const steps = [
    {
      title: t('booking.steps.tourInfo', 'Thông tin tour'),
      icon: <InfoCircleOutlined />,
    },
    {
      title: t('booking.steps.customerInfo', 'Thông tin khách hàng'),
      icon: <UserOutlined />,
    },
    {
      title: t('booking.steps.confirmPayment', 'Xác nhận & Thanh toán'),
      icon: <CreditCardOutlined />,
    },
  ];
  console.log("DEBUG priceCalculation:", priceCalculation);
  return (
    <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
        {t('booking.title', 'Đặt Tour')}: {tourDetails.title}
      </Title>

      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} icon={step.icon} />
        ))}
      </Steps>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card>
            {currentStep === 0 && (
              <div>
                <Title level={4}>{t('booking.tourInfo.title', 'Thông tin tour')}</Title>
                <Descriptions column={1} bordered>
                  <Descriptions.Item label={t('booking.tourInfo.tourName', 'Tên tour')}>
                    {tourDetails.title}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.tourInfo.startLocation', 'Điểm khởi hành')}>
                    {tourDetails.startLocation}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.tourInfo.endLocation', 'Điểm kết thúc')}>
                    {tourDetails.endLocation}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.tourInfo.basePrice', 'Giá cơ bản')}>
                    {formatCurrency(tourDetails.tourOperation.price)} / {t('booking.common.person', 'người')}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.tourInfo.maxGuests', 'Số chỗ tối đa')}>
                    {tourDetails.tourOperation.maxGuests} {t('booking.common.person', 'người')}
                  </Descriptions.Item>
                  {/* Tour Slot Selection */}
                  <Descriptions.Item label={t('booking.tourInfo.selectDate', 'Chọn ngày tour')} span={2}>
                    {slotsLoading ? (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin /> {t('booking.tourInfo.loadingSchedule', 'Đang tải lịch trình...')}
                      </div>
                    ) : tourSlots.length > 0 ? (
                      <div>
                        <style>{`
                                                    .tour-slot {
                                                        padding: 12px 16px;
                                                        border-radius: 8px;
                                                        cursor: pointer;
                                                        min-width: 160px;
                                                        text-align: center;
                                                        transition: all 0.2s ease;
                                                        border: 2px solid #d9d9d9;
                                                        background-color: #ffffff;
                                                        color: #000000d9;
                                                        position: relative;
                                                    }

                                                    .tour-slot.selected {
                                                        border: 4px solid #1890ff !important;
                                                        background-color: #e6f7ff !important;
                                                        color: #1890ff !important;
                                                    }

                                                    .tour-slot:hover:not(.selected) {
                                                        border-color: #40a9ff;
                                                        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
                                                        transform: translateY(-1px);
                                                    }

                                                    .tour-slot.low-availability {
                                                        border-color: #faad14;
                                                    }

                                                    .tour-slot.sold-out {
                                                        border-color: #ff4d4f;
                                                        background-color: #fff2f0;
                                                        cursor: not-allowed;
                                                        opacity: 0.7;
                                                    }

                                                    .tour-slot.completed {
                                                        border-color: #d9d9d9;
                                                        background-color: #f5f5f5;
                                                        cursor: not-allowed;
                                                        opacity: 0.5;
                                                        color: #bfbfbf;
                                                    }

                                                    .tour-slot.completed:hover {
                                                        border-color: #d9d9d9;
                                                        background-color: #f5f5f5;
                                                        transform: none;
                                                        box-shadow: none;
                                                    }

                                                    /* Dark mode */
                                                    [data-theme="dark"] .tour-slot {
                                                        border-color: #434343;
                                                        background-color: #1f1f1f;
                                                        color: #ffffff;
                                                    }

                                                    [data-theme="dark"] .tour-slot.selected {
                                                        border: 4px solid #1890ff !important;
                                                        background-color: #111b26 !important;
                                                        color: #1890ff !important;
                                                    }

                                                    [data-theme="dark"] .tour-slot:hover:not(.selected) {
                                                        border-color: #40a9ff;
                                                    }

                                                    [data-theme="dark"] .tour-slot.sold-out {
                                                        background-color: #2a1215;
                                                    }

                                                    [data-theme="dark"] .tour-slot.completed {
                                                        border-color: #434343;
                                                        background-color: #262626;
                                                        color: #595959;
                                                        cursor: not-allowed;
                                                        opacity: 0.5;
                                                    }

                                                    [data-theme="dark"] .tour-slot.completed:hover {
                                                        border-color: #434343;
                                                        background-color: #262626;
                                                        transform: none;
                                                        box-shadow: none;
                                                    }
                                                `}</style>
                        <div style={{ marginBottom: 12 }}>
                          <Text type="secondary">
                            Chọn ngày bạn muốn tham gia tour:
                          </Text>
                        </div>
                        <div
                          className="tour-slot-container"
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "12px",
                          }}>
                          {tourSlots.map((slot) => {
                            // ✅ FIXED: Calculate availableSpots properly
                            let availableSpots = 0;

                            if (slot.availableSpots !== undefined) {
                              // Use slot's own availableSpots if available
                              availableSpots = slot.availableSpots;
                            } else if (
                              slot.maxGuests !== undefined &&
                              slot.currentBookings !== undefined
                            ) {
                              // Calculate from slot's own capacity
                              availableSpots =
                                slot.maxGuests - slot.currentBookings;
                            } else if (slot.tourOperation) {
                              // Fallback to tourOperation data
                              availableSpots =
                                slot.tourOperation.maxGuests -
                                slot.tourOperation.currentBookings;
                            } else if (
                              availability &&
                              slot.id === selectedSlot?.id
                            ) {
                              // Use real-time availability for selected slot
                              availableSpots = availability.availableSlots;
                            }

                            // Ensure non-negative
                            availableSpots = Math.max(0, availableSpots);

                            // ✅ FIXED: Check status properly - disable FullyBooked (status 2), Cancelled (status 3), and InProgress (status 5)
                            const isSoldOut =
                              availableSpots === 0 ||
                              slot.status === 2 ||
                              slot.status === 3;

                            // Check if slot is InProgress (status 5 or by statusName)
                            const isInProgress = slot.status === 5 ||
                              slot.statusName?.toLowerCase().includes('inprogress') ||
                              slot.statusName?.toLowerCase().includes('đang thực hiện') ||
                              slot.statusName?.toLowerCase().includes('đang tiến hành');

                            // Check if slot is completed - typically status 4, or check by statusName
                            const isCompleted =
                              slot.status === 4 ||
                              slot.statusName?.toLowerCase().includes('hoàn thành') ||
                              slot.statusName?.toLowerCase().includes('completed') ||
                              slot.statusName?.toLowerCase().includes('finished');

                            const isLowAvailability =
                              availableSpots > 0 && availableSpots < 5;

                            // Debug log for each slot being rendered
                            console.log(`🎯 RENDERING Slot ${slot.id}:`, {
                              tourDate: slot.tourDate,
                              status: slot.status,
                              statusName: slot.statusName,
                              isInProgress: isInProgress,
                              isCompleted: isCompleted,
                              willHide: isCompleted || isInProgress ? "YES" : "NO"
                            });

                            // ✅ OPTION 1: Hide completed and InProgress slots entirely (current behavior)
                            if (isCompleted || isInProgress) {
                              return null;
                            }

                            // ✅ OPTION 2: Show completed slots but disabled (uncomment below and comment above)
                            // Completed slots will be shown with grayed-out style and not clickable

                            // ✅ NEW: Special case for FullyBooked but has spots (status inconsistency)
                            // Đã xoá biến isInconsistent vì không sử dụng

                            return (
                              <div
                                key={slot.id}
                                className={`tour-slot ${selectedSlot?.id === slot.id ? "selected" : ""
                                  } ${isLowAvailability ? "low-availability" : ""
                                  } ${isSoldOut ? "sold-out" : ""
                                  } ${isCompleted ? "completed" : ""}`}
                                onClick={async (e) => {
                                  // ✅ FIXED: Check for disabled statuses
                                  if (slot.status === 2) {
                                    // FullyBooked
                                    e.preventDefault();
                                    message.warning(
                                      "Slot này đã đầy, không thể đặt booking"
                                    );
                                    return;
                                  }

                                  if (slot.status === 3) {
                                    // Cancelled
                                    e.preventDefault();
                                    message.warning("Slot này đã bị hủy");
                                    return;
                                  }

                                  if (slot.status === 5 ||
                                    slot.statusName?.toLowerCase().includes('inprogress') ||
                                    slot.statusName?.toLowerCase().includes('đang thực hiện') ||
                                    slot.statusName?.toLowerCase().includes('đang tiến hành')) {
                                    // InProgress
                                    e.preventDefault();
                                    message.warning("Slot này đang được thực hiện, không thể đặt booking");
                                    return;
                                  }

                                  // ✅ NEW: Check for completed slots
                                  if (isCompleted) {
                                    e.preventDefault();
                                    message.warning("Slot này đã hoàn thành, không thể đặt booking");
                                    return;
                                  }

                                  // ✅ FIXED: Check available spots properly
                                  if (availableSpots <= 0) {
                                    e.preventDefault();
                                    message.warning("Slot này hết chỗ trống");
                                    return;
                                  }

                                  // Click animation
                                  if (e.currentTarget) {
                                    e.currentTarget.style.transform =
                                      "translateY(0) scale(0.98)";
                                    setTimeout(() => {
                                      if (e.currentTarget) {
                                        e.currentTarget.style.transform = "";
                                      }
                                    }, 100);
                                  }

                                  setSelectedSlot(slot);
                                  // Update availability for the new slot immediately
                                  const currentValues = form.getFieldsValue();
                                  const guestCount = currentValues.numberOfGuests || 1;

                                  // Update availability first
                                  await updateSlotAvailability(slot, guestCount);

                                  // Only recalculate pricing if we have guest count
                                  if (currentValues.numberOfGuests > 0) {
                                    // Just call price calculation, availability already updated
                                    try {
                                      const response = await calculateBookingPrice(
                                        {
                                          tourOperationId: tourDetails.tourOperation.id,
                                          numberOfGuests: currentValues.numberOfGuests,
                                        },
                                        token ?? undefined
                                      );
                                      if (response.success && response.data) {
                                        setPriceCalculation(response.data);
                                      }
                                    } catch (error) {
                                      console.error("Error calculating price:", error);
                                    }
                                  }
                                }}>
                                <div style={{ textAlign: "center" }}>
                                  <div
                                    style={{
                                      fontWeight: "bold",
                                      marginBottom: "4px",
                                    }}>
                                    {slot.formattedDateWithDay}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      marginBottom: "4px",
                                    }}>
                                    {selectedSlot?.id === slot.id
                                      ? "✓ Đã chọn"
                                      : slot.statusName}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color:
                                        availableSpots > 5
                                          ? "#52c41a"
                                          : availableSpots > 0
                                            ? "#faad14"
                                            : "#ff4d4f",
                                      fontWeight: "bold",
                                    }}>
                                    {availableSpots > 0
                                      ? `Còn ${availableSpots} chỗ`
                                      : "Hết chỗ"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {!selectedSlot && (
                          <Alert
                            message={t('booking.errors.pleaseSelectDate')}
                            type="warning"
                            showIcon
                            style={{ marginTop: 12 }}
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <Alert
                          message={t('booking.tourInfo.noScheduleAvailable')}
                          description={t('booking.tourInfo.noScheduleDescription')}
                          type="info"
                          showIcon
                        />
                        {/* Debug info - remove in production */}
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: "12px",
                            color: "#666",
                          }}>
                          Debug: tourSlots.length = {tourSlots.length},
                          slotsLoading = {slotsLoading.toString()}
                        </div>
                      </div>
                    )}
                  </Descriptions.Item>
                </Descriptions>

                {tourDetails.description && (
                  <div style={{ marginTop: 16 }}>
                    <Title level={5}>{t('booking.tourInfo.tourDescription')}</Title>
                    <Paragraph>{tourDetails.description}</Paragraph>
                  </div>
                )}

                {tourDetails.timeline && tourDetails.timeline.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Title level={5}>{t('booking.tourInfo.tourTimeline')}</Title>
                    {tourDetails.timeline
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((item) => (
                        <Card
                          key={item.id}
                          size="small"
                          style={{ marginBottom: 8 }}>
                          <Space>
                            <Tag color="blue">{item.checkInTime}</Tag>
                            <Text strong>{item.activity}</Text>
                          </Space>
                          {item.specialtyShop && (
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary">
                                📍 {item.specialtyShop.shopName}
                                {item.specialtyShop.location &&
                                  ` - ${item.specialtyShop.location}`}
                              </Text>
                            </div>
                          )}
                        </Card>
                      ))}
                  </div>
                )}

                <div style={{ textAlign: "right", marginTop: 24 }}>
                  <Button type="primary" onClick={handleNext}>
                    {t('booking.common.continue', 'Tiếp tục')}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <Title level={4}>{t('booking.customerInfo.title', 'Thông tin khách hàng')}</Title>
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={handleFormValuesChange}
                  initialValues={{
                    bookingType: "representative",
                    numberOfGuests: 1,
                    contactName: "",
                    contactPhone: "",
                    contactEmail: "",
                    specialRequests: "",
                  }}>
                  {/* NEW: Booking Type Selection */}
                  <Form.Item
                    name="bookingType"
                    label={t('booking.customerInfo.bookingType', 'Loại đặt tour')}
                    rules={[
                      {
                        required: true,
                        message: t('booking.customerInfo.validation.selectBookingType', 'Vui lòng chọn loại đặt tour'),
                      },
                    ]}>
                    <Radio.Group>
                      <Space direction="vertical">
                        <Radio value="representative">
                          <Space>
                            <UserOutlined />
                            <div>
                              <strong>Đặt tour theo người đại diện</strong>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                Chỉ cần thông tin người liên hệ chính, phù hợp
                                cho nhóm/gia đình
                              </div>
                            </div>
                          </Space>
                        </Radio>
                        <Radio value="individual">
                          <Space>
                            <TeamOutlined />
                            <div>
                              <strong>Đặt tour theo từng cá nhân</strong>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                Cần thông tin chi tiết từng khách, mỗi người
                                nhận QR code riêng
                              </div>
                            </div>
                          </Space>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="numberOfGuests"
                        label={t('booking.customerInfo.numberOfGuests')}
                        rules={[
                          { required: true, message: t('booking.customerInfo.validation.enterNumberOfGuests') },
                          {
                            type: "number",
                            min: 1,
                            message: t('booking.customerInfo.validation.minGuests'),
                          },
                        ]}>
                        <InputNumber
                          min={1}
                          max={50}
                          style={{ width: "100%" }}
                          prefix={<TeamOutlined />}
                          placeholder={t('booking.customerInfo.placeholders.numberOfGuests')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Form.Item
                    name="contactName"
                    label={t('booking.customerInfo.contactName')}
                    rules={[
                      {
                        required: true,
                        message: t('booking.customerInfo.validation.enterContactName'),
                      },
                      { max: 100, message: t('booking.customerInfo.validation.maxContactNameLength') },
                    ]}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder={t('booking.customerInfo.placeholders.contactName')}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="contactPhone"
                        label={t('booking.customerInfo.contactPhone')}
                        rules={[
                          {
                            required: true,
                            message: t('booking.customerInfo.validation.enterContactPhone'),
                          },
                          {
                            pattern: /^[0-9+\-\s()]+$/,
                            message: t('booking.customerInfo.validation.invalidPhone'),
                          },
                        ]}>
                        <Input
                          prefix={<PhoneOutlined />}
                          placeholder={t('booking.customerInfo.placeholders.contactPhone')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="contactEmail"
                        label={t('booking.customerInfo.contactEmail')}
                        rules={[
                          { required: true, message: t('booking.customerInfo.validation.enterContactEmail') },
                          { type: "email", message: t('booking.customerInfo.validation.invalidEmail') },
                        ]}>
                        <Input
                          prefix={<MailOutlined />}
                          placeholder={t('booking.customerInfo.placeholders.contactEmail')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="specialRequests"
                    label={t('booking.customerInfo.specialRequests')}>
                    <Input.TextArea
                      rows={3}
                      placeholder={t('booking.customerInfo.placeholders.specialRequests')}
                      maxLength={500}
                    />
                  </Form.Item>

                  {/* ✅ NEW: Individual guest information - Only show if individual booking type selected */}
                  {formValues.bookingType === "individual" && (
                    <>
                      <Divider>{t('booking.customerInfo.individualGuestsInfo')}</Divider>
                      <Alert
                        message={t('booking.customerInfo.guestNotice')}
                        description={t('booking.customerInfo.guestNoticeDescription')}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    </>
                  )}

                  {formValues.bookingType === "individual" &&
                    Array.from(
                      { length: formValues.numberOfGuests },
                      (_, index) => {
                        // Safe check to ensure guests array exists
                        const currentGuests = formValues.guests || [];
                        return (
                          <Card
                            key={index}
                            size="small"
                            style={{ marginBottom: 16 }}>
                            <Title level={5}>{t('booking.customerInfo.guestNumber', { number: index + 1 })}</Title>

                            <Row gutter={16}>
                              <Col xs={24} sm={12}>
                                <Form.Item
                                  name={["guests", index, "guestName"]}
                                  label="Họ và tên"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng nhập tên khách hàng",
                                    },
                                    {
                                      min: 2,
                                      message: "Tên phải có ít nhất 2 ký tự",
                                    },
                                    {
                                      max: 100,
                                      message: "Tên không quá 100 ký tự",
                                    },
                                  ]}
                                  initialValue={
                                    currentGuests[index]?.guestName || ""
                                  }>
                                  <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập họ và tên đầy đủ"
                                    onChange={(e) =>
                                      updateGuestInfo(
                                        index,
                                        "guestName",
                                        e.target.value
                                      )
                                    }
                                  />
                                </Form.Item>
                              </Col>

                              <Col xs={24} sm={12}>
                                <Form.Item
                                  name={["guests", index, "guestEmail"]}
                                  label="Email"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng nhập email",
                                    },
                                    {
                                      type: "email",
                                      message: "Email không hợp lệ",
                                    },
                                    {
                                      validator: (_, value) =>
                                        validateUniqueEmail(
                                          value,
                                          index,
                                          currentGuests
                                        ),
                                    },
                                  ]}
                                  initialValue={
                                    currentGuests[index]?.guestEmail || ""
                                  }>
                                  <Input
                                    prefix={<MailOutlined />}
                                    placeholder="email@example.com"
                                    onChange={(e) =>
                                      updateGuestInfo(
                                        index,
                                        "guestEmail",
                                        e.target.value
                                      )
                                    }
                                  />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Form.Item
                              name={["guests", index, "guestPhone"]}
                              label="Số điện thoại (tùy chọn)"
                              rules={[
                                {
                                  pattern: /^[0-9+\-\s()]+$/,
                                  message: "Số điện thoại không hợp lệ",
                                },
                              ]}
                              initialValue={
                                currentGuests[index]?.guestPhone || ""
                              }>
                              <Input
                                prefix={<PhoneOutlined />}
                                placeholder="0123456789"
                                onChange={(e) =>
                                  updateGuestInfo(
                                    index,
                                    "guestPhone",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Item>
                          </Card>
                        );
                      }
                    )}
                </Form>

                <div style={{ textAlign: "right", marginTop: 24 }}>
                  <Space>
                    <Button onClick={handlePrev}>{t('booking.common.back', 'Quay lại')}</Button>
                    <Button type="primary" onClick={handleNext}>
                      {t('booking.common.continue', 'Tiếp tục')}
                    </Button>
                  </Space>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <Title level={4}>{t('booking.confirmation.title', 'Xác nhận thông tin & Thanh toán')}</Title>

                <Alert
                  message={t('booking.confirmation.pleaseReview', 'Vui lòng kiểm tra lại thông tin trước khi thanh toán')}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Descriptions title={t('booking.confirmation.tourInfo')} column={1} bordered>
                  <Descriptions.Item label={t('booking.confirmation.tourName')}>
                    {tourDetails.title}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.confirmation.tourDate')}>
                    {selectedSlot?.formattedDateWithDay || "Chưa chọn"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.confirmation.numberOfGuests')}>
                    {formValues.numberOfGuests} {t('booking.common.person')}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.confirmation.contactName')}>
                    {formValues.contactName}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.confirmation.contactPhone')}>
                    {formValues.contactPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('booking.confirmation.contactEmail')}>
                    {formValues.contactEmail}
                  </Descriptions.Item>
                  {formValues.specialRequests && (
                    <Descriptions.Item label={t('booking.confirmation.specialRequests')}>
                      {formValues.specialRequests}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {availability && !availability.isAvailable && (
                  <Alert
                    message="Không thể đặt booking"
                    description={
                      availability.message ||
                      "Slot này hiện không thể đặt booking"
                    }
                    type="error"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}

                {/* Payment System Selection - Hidden, always use Enhanced */}
                {/* Enhanced Payment System is now the only option */}

                {/* Confirmation checkbox */}
                <div style={{ marginTop: 24, marginBottom: 16 }}>
                  <Card
                  // style={{
                  //   backgroundColor: "var(--ant-color-bg-container, #f9f9f9)",
                  //   border: "1px solid var(--ant-color-border, #d9d9d9)",
                  // }}
                  >
                    <Checkbox
                      checked={isTermsAccepted}
                      onChange={(e) => setIsTermsAccepted(e.target.checked)}
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.6",
                        alignItems: "flex-start",
                      }}>
                      <span style={{ marginLeft: "8px" }}>
                        <strong>Anh/chị xác nhận đã đọc và đồng ý:</strong>{" "}
                        Khách hàng tự chịu trách nhiệm sắp xếp phương tiện di
                        chuyển và có mặt đúng giờ tại điểm check-in theo quy
                        định của tour. Hệ thống/tour không chịu trách nhiệm về
                        vấn đề địa lý, khoảng cách hay việc đưa đón khách từ nơi
                        ở đến điểm tập trung.
                      </span>
                    </Checkbox>
                  </Card>
                </div>

                <div style={{ textAlign: "right", marginTop: 24 }}>
                  <Space>
                    <Button onClick={handlePrev}>{t('booking.common.back', 'Quay lại')}</Button>
                    <Button
                      type="primary"
                      size="large"
                      loading={submitting}
                      disabled={
                        submitting ||
                        !isTermsAccepted ||
                        !priceCalculation ||
                        !priceCalculation.finalPrice ||
                        priceCalculation.finalPrice <= 0 ||
                        !selectedSlot ||
                        (availability && !availability.isAvailable)
                      }
                      onClick={handleSubmit}
                      icon={<CreditCardOutlined />}>
                      {submitting ? t('booking.confirmation.processing', 'Đang xử lý...') : t('booking.confirmation.bookAndPay', 'Đặt tour & Thanh toán')}
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={t('booking.summary.title', 'Tóm tắt đơn hàng')}
            style={{ position: "sticky", top: 20 }}>
            <img
              src={
                tourDetails.imageUrl || getDefaultTourImage(tourDetails.title)
              }
              alt={tourDetails.title}
              style={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 16,
              }}
            />

            <Title level={5}>{tourDetails.title}</Title>

            <Divider />

            {calculating ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <Spin />
                <Text style={{ display: "block", marginTop: 8 }}>
                  {t('booking.summary.calculatingPrice', 'Đang tính giá...')}
                </Text>
              </div>
            ) : priceCalculation ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text>
                    {t('booking.summary.originalPrice', 'Giá gốc')} ({priceCalculation.numberOfGuests} {t('booking.common.person', 'người')}):
                  </Text>
                  <Text style={{ float: "right" }}>
                    {formatCurrency(priceCalculation.totalOriginalPrice)}
                  </Text>
                </div>

                {priceCalculation.discountPercent > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <Text type="success">
                      {t('booking.summary.discount', 'Giảm giá')} ({priceCalculation.discountPercent}%):
                    </Text>
                    <Text style={{ float: "right", color: "#52c41a" }}>
                      -{formatCurrency(priceCalculation.discountAmount)}
                    </Text>
                  </div>
                )}

                <Divider style={{ margin: "8px 0" }} />

                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {t('booking.summary.total', 'Tổng cộng')}:
                  </Text>
                  <Text
                    strong
                    style={{ float: "right", fontSize: 18, color: "#f5222d" }}>
                    {formatCurrency(priceCalculation.finalPrice)}
                  </Text>
                </div>

                {priceCalculation.isEarlyBird && (
                  <Tag color="green" style={{ marginBottom: 8 }}>
                    🎉 {t('booking.summary.earlyBird', 'Ưu đãi đặt sớm')}
                  </Tag>
                )}

                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('booking.summary.priceType', 'Loại giá')}: {priceCalculation.pricingType}
                </Text>
              </div>
            ) : (
              <Text type="secondary">{t('booking.summary.selectGuestsToSeePrice', 'Chọn số lượng khách để xem giá')}</Text>
            )}

            {availability && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <div style={{ marginBottom: 8 }}>
                  <Text>{t('booking.summary.availableSlots', 'Chỗ trống')}:</Text>
                  <Text style={{ float: "right" }}>
                    {availability.availableSlots}/{availability.maxGuests}
                  </Text>
                </div>
                {availability.availableSlots < 5 && (
                  <Alert
                    message={`Chỉ còn ${availability.availableSlots} chỗ trống!`}
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onRegisterClick={() => { }}
        onLoginSuccess={() => {
          setIsLoginModalVisible(false);
          // Retry booking after login
          handleSubmit();
        }}
      />
    </div>
  );
};

export default BookingPage;
