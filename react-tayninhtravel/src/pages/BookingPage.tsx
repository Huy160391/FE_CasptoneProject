import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Button,
    Steps,
    Row,
    Col,
    Typography,
    Divider,
    Alert,
    Spin,
    message,
    Space,
    Tag,
    Descriptions,
    Modal
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    TeamOutlined,
    CalendarOutlined,
    DollarOutlined,
    CreditCardOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import {
    getTourDetailsForBooking,
    calculateBookingPrice,
    createTourBooking,
    checkTourAvailability,
    validateBookingRequest,
    TourDetailsForBooking,
    PriceCalculation,
    CreateTourBookingRequest
} from '../services/tourBookingService';
import { redirectToPayOsPayment, formatCurrency } from '../services/paymentService';
import LoginModal from '../components/auth/LoginModal';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface BookingFormData {
    numberOfGuests: number;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    specialRequests?: string;
}

const BookingPage: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { isAuthenticated, token, user } = useAuthStore();

    const [form] = Form.useForm<BookingFormData>();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [calculating, setCalculating] = useState(false);

    const [tourDetails, setTourDetails] = useState<TourDetailsForBooking | null>(null);
    const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
    const [availability, setAvailability] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);
    const [formValues, setFormValues] = useState<BookingFormData>({
        numberOfGuests: 1,
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        specialRequests: ''
    });

    // Get default image based on tour template name
    const getDefaultImage = (templateName: string) => {
        if (templateName?.toLowerCase().includes('núi bà đen')) {
            return '/images/tours/nui-ba-den.jpg';
        }
        if (templateName?.toLowerCase().includes('cao đài')) {
            return '/images/tours/toa-thanh-cao-dai.jpg';
        }
        if (templateName?.toLowerCase().includes('suối đá')) {
            return '/images/tours/suoi-da.jpg';
        }
        return '/images/tours/default-tour.jpg';
    };

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
                setError('Không tìm thấy ID tour');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getTourDetailsForBooking(tourId);

                if (response.success && response.data) {
                    setTourDetails(response.data);

                    // Pre-fill form with user data if available
                    const initialValues = {
                        numberOfGuests: bookingData?.numberOfGuests || 1,
                        contactName: user?.fullName || '',
                        contactEmail: user?.email || '',
                        contactPhone: user?.phoneNumber || '',
                        specialRequests: ''
                    };

                    // Update both form and state
                    form.setFieldsValue(initialValues);
                    setFormValues(initialValues);
                } else {
                    setError(response.message || 'Không thể tải thông tin tour');
                }
            } catch (error: any) {
                console.error('Error loading tour details:', error);
                setError(error.message || 'Có lỗi xảy ra khi tải thông tin tour');
            } finally {
                setLoading(false);
            }
        };

        loadTourDetails();
    }, [tourId, user, form, bookingData]);

    // Calculate price when guest count changes
    const handleGuestCountChange = async (values: Partial<BookingFormData>) => {
        if (!tourDetails || !values.numberOfGuests) return;

        try {
            setCalculating(true);
            const response = await calculateBookingPrice({
                tourDetailsId: tourDetails.id,
                numberOfGuests: values.numberOfGuests
            }, token ?? undefined);

            if (response.success && response.data) {
                setPriceCalculation(response.data);

                // Check availability
                const availabilityResponse = await checkTourAvailability(
                    tourDetails.tourOperation.id,
                    values.numberOfGuests,
                    token ?? undefined
                );

                if (availabilityResponse.success) {
                    console.log('Availability data:', availabilityResponse.data); // Debug log
                    setAvailability(availabilityResponse.data);
                }
            }
        } catch (error: any) {
            console.error('Error calculating price:', error);
            message.error('Không thể tính giá tour');
        } finally {
            setCalculating(false);
        }
    };

    const handleFormValuesChange = (changedValues: Partial<BookingFormData>, allValues: BookingFormData) => {
        // Save form values to state
        setFormValues(allValues);

        if (changedValues.numberOfGuests) {
            handleGuestCountChange(allValues);
        }
    };

    const handleNext = () => {
        form.validateFields().then(() => {
            setCurrentStep(currentStep + 1);
        }).catch(() => {
            message.error('Vui lòng điền đầy đủ thông tin');
        });
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            setIsLoginModalVisible(true);
            return;
        }

        if (!tourDetails || !token) {
            message.error('Thông tin không đầy đủ để đặt tour');
            return;
        }

        try {
            // Use form values from state (since form might not be rendered in current step)
            console.log('Form values from state:', formValues); // Debug log

            // Validate booking request
            const bookingRequest: CreateTourBookingRequest = {
                tourOperationId: tourDetails.tourOperation.id,
                numberOfGuests: formValues.numberOfGuests, // Tổng số người
                adultCount: formValues.numberOfGuests, // Tất cả đều tính là người lớn
                childCount: 0, // Không phân biệt trẻ em
                contactName: formValues.contactName,
                contactPhone: formValues.contactPhone,
                contactEmail: formValues.contactEmail,
                specialRequests: formValues.specialRequests
            };

            console.log('Booking request:', bookingRequest); // Debug log

            const validation = validateBookingRequest(bookingRequest);
            console.log('Validation result:', validation); // Debug log

            if (!validation.isValid) {
                message.error(validation.errors.join(', '));
                return;
            }

            setSubmitting(true);
            const response = await createTourBooking(bookingRequest, token);
            console.log('Booking response:', response); // Debug log

            if (response.success && response.data) {
                console.log('Booking data:', response.data); // Debug log
                message.success('Đặt tour thành công! Đang chuyển đến trang thanh toán...');

                // Redirect to PayOS payment
                if (response.data.paymentUrl) {
                    console.log('Payment URL found:', response.data.paymentUrl); // Debug log
                    setTimeout(() => {
                        redirectToPayOsPayment(response.data.paymentUrl!);
                    }, 1500);
                } else {
                    console.log('No payment URL, navigating to success page'); // Debug log
                    // If no payment URL, navigate to success page
                    navigate('/booking-success', {
                        state: { bookingData: response.data }
                    });
                }
            } else {
                message.error(response.message || 'Có lỗi xảy ra khi đặt tour');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            console.error('Error response data:', error.response?.data); // Debug log
            message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt tour');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !tourDetails) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Alert
                    message="Không thể tải thông tin tour"
                    description={error || 'Tour không tồn tại hoặc đã bị xóa'}
                    type="error"
                    showIcon
                    action={
                        <Button type="primary" onClick={() => navigate('/things-to-do')}>
                            Xem tour khác
                        </Button>
                    }
                />
            </div>
        );
    }

    const steps = [
        {
            title: 'Thông tin tour',
            icon: <InfoCircleOutlined />
        },
        {
            title: 'Thông tin khách hàng',
            icon: <UserOutlined />
        },
        {
            title: 'Xác nhận & Thanh toán',
            icon: <CreditCardOutlined />
        }
    ];

    return (
        <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
                Đặt Tour: {tourDetails.title}
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
                                <Title level={4}>Thông tin tour</Title>
                                <Descriptions column={1} bordered>
                                    <Descriptions.Item label="Tên tour">
                                        {tourDetails.title}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điểm khởi hành">
                                        {tourDetails.startLocation}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điểm kết thúc">
                                        {tourDetails.endLocation}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giá cơ bản">
                                        {formatCurrency(tourDetails.tourOperation.price)} / người
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số chỗ tối đa">
                                        {tourDetails.tourOperation.maxGuests} người
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Đã đặt">
                                        {tourDetails.tourOperation.currentBookings} người
                                    </Descriptions.Item>
                                </Descriptions>

                                {tourDetails.description && (
                                    <div style={{ marginTop: 16 }}>
                                        <Title level={5}>Mô tả tour</Title>
                                        <Paragraph>{tourDetails.description}</Paragraph>
                                    </div>
                                )}

                                {tourDetails.timeline.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                        <Title level={5}>Lịch trình tour</Title>
                                        {tourDetails.timeline.map((item, index) => (
                                            <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                                                <Space>
                                                    <Tag color="blue">{item.startTime} - {item.endTime}</Tag>
                                                    <Text strong>{item.title}</Text>
                                                </Space>
                                                {item.description && (
                                                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                                                        {item.description}
                                                    </Paragraph>
                                                )}
                                                {item.specialtyShop && (
                                                    <Text type="secondary">
                                                        📍 {item.specialtyShop.name}
                                                    </Text>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <div style={{ textAlign: 'right', marginTop: 24 }}>
                                    <Button type="primary" onClick={handleNext}>
                                        Tiếp tục
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div>
                                <Title level={4}>Thông tin khách hàng</Title>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onValuesChange={handleFormValuesChange}
                                    initialValues={{
                                        numberOfGuests: 1,
                                        contactName: '',
                                        contactPhone: '',
                                        contactEmail: '',
                                        specialRequests: ''
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="numberOfGuests"
                                                label="Số người"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số người' },
                                                    { type: 'number', min: 1, message: 'Phải có ít nhất 1 người' }
                                                ]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    max={50}
                                                    style={{ width: '100%' }}
                                                    prefix={<TeamOutlined />}
                                                    placeholder="Nhập số người"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Form.Item
                                        name="contactName"
                                        label="Tên người liên hệ"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên người liên hệ' },
                                            { max: 100, message: 'Tên không được quá 100 ký tự' }
                                        ]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Nhập tên đầy đủ" />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="contactPhone"
                                                label="Số điện thoại"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                                                    { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
                                                ]}
                                            >
                                                <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="contactEmail"
                                                label="Email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email' },
                                                    { type: 'email', message: 'Email không hợp lệ' }
                                                ]}
                                            >
                                                <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="specialRequests"
                                        label="Yêu cầu đặc biệt (tùy chọn)"
                                    >
                                        <Input.TextArea
                                            rows={3}
                                            placeholder="Ví dụ: Ăn chay, dị ứng thực phẩm, yêu cầu phòng riêng..."
                                            maxLength={500}
                                        />
                                    </Form.Item>
                                </Form>

                                <div style={{ textAlign: 'right', marginTop: 24 }}>
                                    <Space>
                                        <Button onClick={handlePrev}>
                                            Quay lại
                                        </Button>
                                        <Button type="primary" onClick={handleNext}>
                                            Tiếp tục
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <Title level={4}>Xác nhận thông tin & Thanh toán</Title>

                                <Alert
                                    message="Vui lòng kiểm tra lại thông tin trước khi thanh toán"
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />

                                <Descriptions title="Thông tin tour" column={1} bordered>
                                    <Descriptions.Item label="Tên tour">
                                        {tourDetails.title}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số khách">
                                        {formValues.numberOfGuests} người
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người liên hệ">
                                        {formValues.contactName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điện thoại">
                                        {formValues.contactPhone}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {formValues.contactEmail}
                                    </Descriptions.Item>
                                    {formValues.specialRequests && (
                                        <Descriptions.Item label="Yêu cầu đặc biệt">
                                            {formValues.specialRequests}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>

                                {availability && !availability.isAvailable && (
                                    <Alert
                                        message="Tour đã hết chỗ"
                                        description="Số lượng khách yêu cầu vượt quá số chỗ còn lại"
                                        type="error"
                                        showIcon
                                        style={{ marginTop: 16 }}
                                    />
                                )}

                                <div style={{ textAlign: 'right', marginTop: 24 }}>
                                    <Space>
                                        <Button onClick={handlePrev}>
                                            Quay lại
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            loading={submitting}
                                            disabled={availability && !availability.isAvailable}
                                            onClick={handleSubmit}
                                            icon={<CreditCardOutlined />}
                                        >
                                            {submitting ? 'Đang xử lý...' : 'Đặt tour & Thanh toán'}
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Tóm tắt đơn hàng" style={{ position: 'sticky', top: 20 }}>
                        <img
                            src={tourDetails.imageUrl || getDefaultImage(tourDetails.tourTemplateName)}
                            alt={tourDetails.title}
                            style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                        />

                        <Title level={5}>{tourDetails.title}</Title>

                        <Divider />

                        {calculating ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <Spin />
                                <Text style={{ display: 'block', marginTop: 8 }}>Đang tính giá...</Text>
                            </div>
                        ) : priceCalculation ? (
                            <div>
                                <div style={{ marginBottom: 8 }}>
                                    <Text>Giá gốc ({priceCalculation.numberOfGuests} người):</Text>
                                    <Text style={{ float: 'right' }}>
                                        {formatCurrency(priceCalculation.totalOriginalPrice)}
                                    </Text>
                                </div>

                                {priceCalculation.discountPercent > 0 && (
                                    <div style={{ marginBottom: 8 }}>
                                        <Text type="success">
                                            Giảm giá ({priceCalculation.discountPercent}%):
                                        </Text>
                                        <Text style={{ float: 'right', color: '#52c41a' }}>
                                            -{formatCurrency(priceCalculation.discountAmount)}
                                        </Text>
                                    </div>
                                )}

                                <Divider style={{ margin: '8px 0' }} />

                                <div style={{ marginBottom: 16 }}>
                                    <Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text>
                                    <Text strong style={{ float: 'right', fontSize: 18, color: '#f5222d' }}>
                                        {formatCurrency(priceCalculation.finalPrice)}
                                    </Text>
                                </div>

                                {priceCalculation.isEarlyBird && (
                                    <Tag color="green" style={{ marginBottom: 8 }}>
                                        🎉 Ưu đãi đặt sớm
                                    </Tag>
                                )}

                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Loại giá: {priceCalculation.pricingType}
                                </Text>
                            </div>
                        ) : (
                            <Text type="secondary">Chọn số lượng khách để xem giá</Text>
                        )}

                        {availability && (
                            <div style={{ marginTop: 16 }}>
                                <Divider />
                                <div style={{ marginBottom: 8 }}>
                                    <Text>Chỗ trống:</Text>
                                    <Text style={{ float: 'right' }}>
                                        {availability.availableSlots}/{availability.maxGuests}
                                    </Text>
                                </div>
                                {availability.availableSlots < 5 && (
                                    <Alert
                                        message={`Chỉ còn ${availability.availableSlots} chỗ trống!`}
                                        type="warning"
                                        size="small"
                                        showIcon
                                    />
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <LoginModal
                visible={isLoginModalVisible}
                onCancel={() => setIsLoginModalVisible(false)}
                onSuccess={() => {
                    setIsLoginModalVisible(false);
                    // Retry booking after login
                    handleSubmit();
                }}
            />
        </div>
    );
};

export default BookingPage;