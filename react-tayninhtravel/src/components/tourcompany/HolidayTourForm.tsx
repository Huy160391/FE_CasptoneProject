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
  createHolidayTourTemplate,
  handleApiError,
} from "../../services/tourcompanyService";
import {
  TourTemplateType,
  CreateHolidayTourTemplateRequest,
} from "../../types/tour";
import dayjs, { Dayjs } from "dayjs";

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

const HolidayTourForm: React.FC<HolidayTourFormProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { token } = useAuthStore();
  const [form] = Form.useForm<HolidayTourFormData>();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleSubmit = async (values: HolidayTourFormData) => {
    try {
      setLoading(true);

      const requestData: CreateHolidayTourTemplateRequest = {
        title: values.title,
        templateType: values.templateType,
        startLocation: values.startLocation,
        endLocation: values.endLocation,
        tourDate: values.tourDate.format("YYYY-MM-DD"),
        images: imageUrls.length > 0 ? imageUrls : [],
      };

      const response = await createHolidayTourTemplate(
        requestData,
        token || undefined
      );

      if (response.success) {
        message.success("Tạo Tour Ngày Lễ thành công!");
        form.resetFields();
        setImageUrls([]);
        onSuccess();
      } else {
        message.error(response.message || "Có lỗi xảy ra khi tạo Tour Ngày Lễ");
      }
    } catch (error) {
      console.error("Error creating holiday tour:", error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrls([]);
    onCancel();
  };

  // Disable past dates
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day");
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
                <Input placeholder="Ví dụ: Tour Tết Nguyên Đán 2025" />
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
                <Select placeholder="Chọn loại tour">
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
                ]}>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày lễ"
                  disabledDate={disabledDate}
                  format="DD/MM/YYYY"
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
                <Input placeholder="Ví dụ: TP.HCM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endLocation"
                label="Điểm Kết Thúc"
                rules={[
                  { required: true, message: "Vui lòng nhập điểm kết thúc" },
                ]}>
                <Input placeholder="Ví dụ: Tây Ninh" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô Tả Tour">
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về Tour Ngày Lễ..."
              maxLength={1000}
              showCount
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
