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
} from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../store/useAuthStore";
import {
  createHolidayTourTemplateEnhanced,
  handleApiError,
} from "../../services/tourcompanyService";
import { publicService } from "../../services/publicService";
import {
  TourTemplateType,
  CreateHolidayTourTemplateRequest,
} from "../../types/tour";
import dayjs, { Dayjs } from "dayjs";
import { AxiosError } from "axios";


const { TextArea } = Input;
const { Option } = Select;

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

      // Backend chỉ cần DateOnly, không cần thời gian
      const requestData: CreateHolidayTourTemplateRequest = {
        title: values.title,
        templateType: values.templateType,
        startLocation: values.startLocation,
        endLocation: values.endLocation,
        tourDate: values.tourDate.format("YYYY-MM-DD"), // Chỉ gửi ngày, không gửi thời gian
        images: imageUrls.length > 0 ? imageUrls : [],
      };

      // Debug logging để kiểm tra request data
      console.log("=== HOLIDAY TOUR TEMPLATE DEBUG ===");
      console.log("Selected Date:", values.tourDate.format("YYYY-MM-DD HH:mm:ss"));
      console.log("Formatted tourDate:", values.tourDate.format("YYYY-MM-DD"));
      console.log("Request Data:", JSON.stringify(requestData, null, 2));
      console.log("=== END DEBUG ===");

      // Use the enhanced service or fallback to original with error handling
      let response;
      try {
        response = await createHolidayTourTemplateEnhanced(
          requestData,
          token || undefined
        );
      } catch (importError) {
        // Fallback if enhanced function is not available
        console.warn("Enhanced function not available, using fallback");
        const { createHolidayTourTemplate } = await import("../../services/tourcompanyService");
        try {
          response = await createHolidayTourTemplate(requestData, token || undefined);
        } catch (apiError: any) {
          // Handle API errors manually
          if (apiError.response?.data) {
            response = {
              success: false,
              statusCode: apiError.response.status,
              message: apiError.response.data.message || "Có lỗi xảy ra",
              validationErrors: apiError.response.data.validationErrors || [],
              fieldErrors: apiError.response.data.fieldErrors || {},
              data: null,
            };
          } else {
            throw apiError;
          }
        }
      }

      if (response.success) {
        message.success("Tạo Template Tour Ngày Lễ thành công!");
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
      console.error("Error creating holiday tour template:", error);
      handleAxiosError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  // Handle backend validation errors
  const handleBackendErrors = (response: any) => {
    const { validationErrors = [], fieldErrors = {} } = response;

    // Skip showing main error message to avoid ugly UI
    // message.error(errorMessage || "Có lỗi xảy ra khi tạo Tour Ngày Lễ");

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
          name: formField as keyof HolidayTourFormData,
          errors: Array.isArray(errors) ? errors : [errors as string]
        };
      });
      form.setFields(formErrors as any);

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

    // Show simple notification for validation errors
    if (validationErrors.length > 0 || Object.keys(fieldErrors).length > 0) {
      message.warning("Vui lòng kiểm tra lại thông tin đã nhập");
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
    try {
      setLoading(true);

      // Sử dụng API upload thật
      const imageUrl = await publicService.uploadImage(file);

      if (imageUrl) {
        setImageUrls((prev) => [...prev, imageUrl]);
        message.success("Ảnh đã được tải lên thành công");
      } else {
        message.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }

    return false; // Prevent default upload
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
    message.success("Đã xóa ảnh");
  };

  const testHolidayTourTemplate = async () => {
    const values = await form.validateFields();
    const testData = {
      title: values.title,
      templateType: values.templateType,
      startLocation: values.startLocation,
      endLocation: values.endLocation,
      tourDate: values.tourDate.format("YYYY-MM-DD"),
      images: [],
    };

    console.log("Testing Holiday Tour Template with data:", testData);

    try {
      const { token } = useAuthStore.getState();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/TourCompany/template/holiday/test", {
        method: "POST",
        headers,
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      console.log("Test response:", result);
      message.info("Check console for test results");
    } catch (error) {
      console.error("Test error:", error);
      message.error("Test failed - check console");
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarOutlined />
          <span>Tạo Template Tour Ngày Lễ</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}>
      <Alert
        message="Template Tour Ngày Lễ"
        description="Template Tour Ngày Lễ được tạo cho một ngày cụ thể thay vì theo lịch hàng tuần. Hệ thống sẽ tự động tạo một slot duy nhất cho ngày được chọn."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Holiday Tour Error Display - Simplified */}
      {(errorState.validationErrors.length > 0 || Object.keys(errorState.fieldErrors).length > 0) && (
        <Alert
          message="Vui lòng kiểm tra lại thông tin"
          description="Có một số lỗi validation. Vui lòng xem thông báo bên dưới các trường để biết chi tiết."
          type="warning"
          showIcon
          closable
          onClose={handleDismissErrors}
          style={{ marginBottom: 16 }}
        />
      )}

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
                label="Tên Template Tour"
                rules={[
                  { required: true, message: "Vui lòng nhập tên template tour" },
                  { min: 5, message: "Tên template tour phải có ít nhất 5 ký tự" },
                  { max: 200, message: "Tên template tour không được quá 200 ký tự" },
                ]}>
                <Input
                  placeholder="Ví dụ: Template Tour Tết Nguyên Đán 2025"
                  data-field="title"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="templateType"
                label="Loại Template Tour"
                rules={[
                  { required: true, message: "Vui lòng chọn loại template tour" },
                ]}>
                <Select
                  placeholder="Chọn loại template tour"
                  data-field="templateType"
                >
                  <Option value={TourTemplateType.FreeScenic}>
                    Template Tour Miễn Phí (Cảnh Quan)
                  </Option>
                  <Option value={TourTemplateType.PaidAttraction}>
                    Template Tour Có Phí (Điểm Tham Quan)
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
                          new Error(`Ngày template tour phải sau ít nhất 30 ngày từ hôm nay (${minDate.format('DD/MM/YYYY')})`)
                        );
                      }

                      if (selectedDate.isAfter(maxDate)) {
                        return Promise.reject(
                          new Error(`Ngày template tour không được quá 2 năm trong tương lai (${maxDate.format('DD/MM/YYYY')})`)
                        );
                      }

                      return Promise.resolve();
                    }
                  }
                ]}
                extra="Ngày template tour phải sau ít nhất 30 ngày từ hôm nay và không quá 2 năm trong tương lai"
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

          <Form.Item name="description" label="Mô Tả Template Tour">
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về Template Tour Ngày Lễ..."
              maxLength={1000}
              showCount
              data-field="description"
            />
          </Form.Item>

          <Form.Item label="Hình Ảnh Tour">
            <div>
              {/* Hiển thị ảnh đã upload */}
              {imageUrls.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Row gutter={[8, 8]}>
                    {imageUrls.map((url, index) => (
                      <Col key={index} span={6}>
                        <div style={{ position: 'relative', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
                          <img
                            src={url}
                            alt={`Tour image ${index + 1}`}
                            style={{ width: '100%', height: 100, objectFit: 'cover' }}
                          />
                          <Button
                            type="text"
                            danger
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: 'rgba(255,255,255,0.8)',
                              minWidth: 24,
                              height: 24
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Upload button */}
              <Upload
                listType="picture-card"
                beforeUpload={handleImageUpload}
                showUploadList={false}
                disabled={imageUrls.length >= 5}
              >
                {imageUrls.length < 5 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên ({imageUrls.length}/5)</div>
                  </div>
                )}
              </Upload>

              {imageUrls.length >= 5 && (
                <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  Đã đạt giới hạn tối đa 5 ảnh
                </div>
              )}
            </div>
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button onClick={testHolidayTourTemplate} disabled={loading}>
                Test API
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo Template Tour Ngày Lễ
              </Button>
            </Space>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default HolidayTourForm;
