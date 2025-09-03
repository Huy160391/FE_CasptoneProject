import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Upload,
  message,
  Row,
  Col,
  Alert,
  Spin,
  Space,
  notification,
  List,
  Typography,
} from "antd";
import { PlusOutlined, CalendarOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../store/useAuthStore";
import {
  createHolidayTourTemplateEnhanced,
  handleApiError,
} from "../../services/tourcompanyService";
import {
  TourTemplateType,
  CreateHolidayTourTemplateRequest,
  ApiResponse,
} from "../../types/tour";
import dayjs, { Dayjs } from "dayjs";
import { AxiosError } from "axios";
import HolidayTourErrorDisplay from "./HolidayTourErrorDisplay";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface HolidayTourFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface HolidayTourFormData {
  title: string;
  description?: string;
  templateType: TourTemplateType;
  startLocation: string;
  endLocation: string;
  tourDate: Dayjs;
  images?: string[];
}

interface BackendErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  validationErrors?: string[];
  fieldErrors?: Record<string, string[]>;
}

interface ErrorState {
  validationErrors: string[];
  fieldErrors: Record<string, string[]>;
  showDetails: boolean;
}

const HolidayTourForm: React.FC<HolidayTourFormProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { token } = useAuthStore();
  const [form] = Form.useForm<HolidayTourFormData>();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errorState, setErrorState] = useState<ErrorState>({
    validationErrors: [],
    fieldErrors: {},
    showDetails: false,
  });

  const handleSubmit = async (values: HolidayTourFormData) => {
    try {
      setLoading(true);
      // Clear previous errors
      setErrorState({
        validationErrors: [],
        fieldErrors: {},
        showDetails: false,
      });

      const requestData: CreateHolidayTourTemplateRequest = {
        title: values.title,
        templateType: values.templateType,
        startLocation: values.startLocation,
        endLocation: values.endLocation,
        tourDate: values.tourDate.format("YYYY-MM-DD"),
        images: imageUrls.length > 0 ? imageUrls : [],
      };

      const response = await createHolidayTourTemplateEnhanced(
        requestData,
        token || undefined
      );

      if (response.success) {
        message.success("Tạo Tour Ngày Lễ thành công!");
        form.resetFields();
        setImageUrls([]);
        setErrorState({
          validationErrors: [],
          fieldErrors: {},
          showDetails: false,
        });
        onSuccess();
      } else {
        // Handle backend validation errors
        handleBackendErrors(response);
      }
    } catch (error) {
      console.error("Error creating holiday tour:", error);
      handleAxiosError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  // Handle backend validation errors
  const handleBackendErrors = (response: ApiResponse<any>) => {
    const { message: errorMessage, validationErrors = [], fieldErrors = {} } = response;

    // Show main error message
    message.error(errorMessage || "Có lỗi xảy ra khi tạo Tour Ngày Lễ");

    // Update error state
    setErrorState({
      validationErrors,
      fieldErrors,
      showDetails: validationErrors.length > 0 || Object.keys(fieldErrors).length > 0,
    });

    // Handle field-specific errors for form validation
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const formErrors = Object.entries(fieldErrors).map(([backendField, errors]) => {
        const formField = mapBackendFieldToFormField(backendField);
        return {
          name: formField,
          errors: Array.isArray(errors) ? errors : [errors as string]
        };
      });
      form.setFields(formErrors);

      // Also scroll to first error field
      const firstErrorField = formErrors[0]?.name;
      if (firstErrorField) {
        setTimeout(() => {
          const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }

    // Show detailed notification for validation errors
    if (validationErrors.length > 0 || Object.keys(fieldErrors).length > 0) {
      notification.error({
        message: "Lỗi Validation Holiday Tour",
        description: "Vui lòng kiểm tra thông tin theo hướng dẫn bên dưới",
        duration: 10,
        placement: "topRight",
      });
    }
  };

  // Handle Axios errors (network, server errors)
  const handleAxiosError = (error: AxiosError) => {
    const errorData = error.response?.data as BackendErrorResponse;

    if (errorData) {
      handleBackendErrors(errorData);
    } else {
      // Network or other errors
      handleApiError(error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrls([]);
    setErrorState({
      validationErrors: [],
      fieldErrors: {},
      showDetails: false,
    });
    onCancel();
  };

  const handleToggleErrorDetails = () => {
    setErrorState(prev => ({
      ...prev,
      showDetails: !prev.showDetails,
    }));
  };

  const handleDismissErrors = () => {
    setErrorState({
      validationErrors: [],
      fieldErrors: {},
      showDetails: false,
    });
  };

  // Map backend field names to form field names
  const mapBackendFieldToFormField = (backendField: string): string => {
    const fieldMapping: Record<string, string> = {
      'Title': 'title',
      'title': 'title',
      'TourDate': 'tourDate',
      'tourDate': 'tourDate',
      'StartLocation': 'startLocation',
      'startLocation': 'startLocation',
      'EndLocation': 'endLocation',
      'endLocation': 'endLocation',
      'TemplateType': 'templateType',
      'templateType': 'templateType',
      'Description': 'description',
      'description': 'description',
      'Images': 'images',
      'images': 'images',
    };
    return fieldMapping[backendField] || backendField.toLowerCase();
  };

  // Disable past dates and dates that don't meet business rules
  const disabledDate = (current: Dayjs) => {
    if (!current) return false;

    const now = dayjs();
    const minDate = now.add(30, 'day');
    const maxDate = now.add(2, 'year');

    // Disable dates before minimum date (30 days from now)
    if (current.isBefore(minDate, 'day')) {
      return true;
    }

    // Disable dates after maximum date (2 years from now)
    if (current.isAfter(maxDate, 'day')) {
      return true;
    }

    return false;
  };

  const handleImageUpload = async (file: File) => {
    // TODO: Implement image upload logic
    // For now, just add a placeholder URL
    const mockUrl = `https://example.com/images/${file.name}`;
    setImageUrls((prev) => [...prev, mockUrl]);
    message.success("Ảnh đã được tải lên thành công");
    return false; // Prevent default upload
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarOutlined />
          <span>Tạo Tour Ngày Lễ</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose>
      <Alert
        message="Tour Ngày Lễ"
        description="Tour Ngày Lễ được tạo cho một ngày cụ thể thay vì theo lịch hàng tuần. Hệ thống sẽ tự động tạo một slot duy nhất cho ngày được chọn."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Holiday Tour Error Display */}
      <HolidayTourErrorDisplay
        validationErrors={errorState.validationErrors}
        fieldErrors={errorState.fieldErrors}
        showDetails={errorState.showDetails}
        onToggleDetails={handleToggleErrorDetails}
        onDismiss={handleDismissErrors}
      />

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tên Tour"
                rules={[
                  { required: true, message: "Vui lòng nhập tên tour" },
                  { min: 5, message: "Tên tour phải có ít nhất 5 ký tự" },
                  { max: 200, message: "Tên tour không được quá 200 ký tự" },
                ]}>
                <Input
                  placeholder="Ví dụ: Tour Tết Nguyên Đán 2025"
                  data-field="title"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="templateType"
                label="Loại Tour"
                rules={[
                  { required: true, message: "Vui lòng chọn loại tour" },
                ]}>
                <Select
                  placeholder="Chọn loại tour"
                  data-field="templateType"
                >
                  <Option value={TourTemplateType.FreeScenic}>
                    Tour Miễn Phí (Cảnh Quan)
                  </Option>
                  <Option value={TourTemplateType.PaidAttraction}>
                    Tour Có Phí (Điểm Tham Quan)
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tourDate"
                label="Ngày Diễn Ra"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày diễn ra" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      const selectedDate = dayjs(value);
                      const now = dayjs();
                      const minDate = now.add(30, 'day');
                      const maxDate = now.add(2, 'year');

                      if (selectedDate.isBefore(minDate)) {
                        return Promise.reject(
                          new Error(`Ngày tour phải sau ít nhất 30 ngày từ hôm nay (${minDate.format('DD/MM/YYYY')})`)
                        );
                      }

                      if (selectedDate.isAfter(maxDate)) {
                        return Promise.reject(
                          new Error(`Ngày tour không được quá 2 năm trong tương lai (${maxDate.format('DD/MM/YYYY')})`)
                        );
                      }

                      return Promise.resolve();
                    }
                  }
                ]}
                extra="Ngày tour phải sau ít nhất 30 ngày từ hôm nay và không quá 2 năm trong tương lai"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày lễ"
                  disabledDate={disabledDate}
                  format="DD/MM/YYYY"
                  data-field="tourDate"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startLocation"
                label="Điểm Khởi Hành"
                rules={[
                  { required: true, message: "Vui lòng nhập điểm khởi hành" },
                ]}>
                <Input
                  placeholder="Ví dụ: TP.HCM"
                  data-field="startLocation"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endLocation"
                label="Điểm Kết Thúc"
                rules={[
                  { required: true, message: "Vui lòng nhập điểm kết thúc" },
                ]}>
                <Input
                  placeholder="Ví dụ: Tây Ninh"
                  data-field="endLocation"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô Tả Tour">
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về Tour Ngày Lễ..."
              maxLength={1000}
              showCount
              data-field="description"
            />
          </Form.Item>

          <Form.Item label="Hình Ảnh Tour">
            <Upload
              listType="picture-card"
              beforeUpload={handleImageUpload}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}>
              {imageUrls.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo Tour Ngày Lễ
              </Button>
            </Space>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default HolidayTourForm;
