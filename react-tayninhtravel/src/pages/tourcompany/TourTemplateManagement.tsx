import React, { useEffect, useState } from "react";
import {
  createTourTemplate,
  getTourTemplateDetail,
  getTourTemplates,
  updateTourTemplate,
} from "../../services/tourcompanyService";
import { ScheduleDay, TourTemplate, TourTemplateType } from "../../types/tour";
import axiosInstance from "../../config/axios";

import publicService from "../../services/publicService";

import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Row,
  Table,
  Tag,
  Tooltip,
  Typography,
  notification,
} from "antd";
import TourSlotsList from "../../components/tourcompany/TourSlotsList";
import TourTemplateFormModal from "./TourTemplateFormModal";
import HolidayTourForm from "../../components/tourcompany/HolidayTourForm";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import "./TourTemplateManagement.scss";
import "./TourTemplateModal.scss";

// import { useThemeStore } from '../../store/useThemeStore';

const { Title } = Typography;

const TourTemplateManagement: React.FC = () => {
  // const { isDarkMode } = useThemeStore();
  const { handleError } = useErrorHandler();
  const [templates, setTemplates] = useState<TourTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TourTemplate | null>(
    null
  );
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [uploadFileList, setUploadFileList] = useState<any[]>([]);
  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    type: 'error' | 'warning' | 'info';
    message: string;
    description?: string;
    details?: string[];
  } | null>(null);

  // Create dropdown menu items for each record
  const getActionMenuItems = (record: TourTemplate) => {
    const items = [
      {
        key: "view",
        icon: <EyeOutlined style={{ color: "#1890ff" }} />,
        label: <span style={{ color: "#1890ff" }}>Xem chi tiết</span>,
        onClick: () => handleView(record),
      },
      {
        key: "edit",
        icon: <EditOutlined style={{ color: "#52c41a" }} />,
        label: <span style={{ color: "#52c41a" }}>Chỉnh sửa</span>,
        onClick: () => handleEdit(record),
      },
      {
        key: "create-tour",
        icon: <PlusOutlined style={{ color: "#fa8c16" }} />,
        label: <span style={{ color: "#fa8c16" }}>Tạo tour từ template</span>,
        onClick: () => handleCreateTour(record),
      },
    ];

    // Add delete option with divider

    items.push({
      key: "delete",
      icon: <DeleteOutlined />,
      label: <span style={{ color: "#ff4d4f" }}>Xóa template</span>,
      onClick: () => {
        // Show confirmation modal
        Modal.confirm({
          title: "Xác nhận xóa template",
          content: (
            <div>
              <p>
                Bạn có chắc chắn muốn xóa template{" "}
                <strong>"{record.title}"</strong> không?
              </p>
              <p style={{ color: "#ff4d4f", fontSize: "14px" }}>
                ⚠️ Hành động này không thể hoàn tác và sẽ ảnh hưởng đến tất cả
                tours đã tạo từ template này.
              </p>
            </div>
          ),
          okText: "Xóa template",
          cancelText: "Hủy",
          okType: "danger",
          icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
          onOk: () => handleDelete(record.id),
        });
      },
    });

    return items;
  };

  const columns = [
    {
      title: "Tên template",
      dataIndex: "title",
      key: "title",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: TourTemplate) => {
        const typeMap: Record<number, string> = {
          1: "FreeScenic",
          2: "PaidAttraction",
        };
        return (
          record.title.toLowerCase().includes(value.toString().toLowerCase()) ||
          typeMap[record.templateType]
            ?.toLowerCase()
            .includes(value.toString().toLowerCase())
        );
      },
    },
    {
      title: "Loại tour",
      dataIndex: "templateType",
      key: "templateType",
      render: (templateType: number) => {
        const typeMap: Record<number, string> = {
          1: "FreeScenic",
          2: "PaidAttraction",
        };
        return <Tag color="blue">{typeMap[templateType] || templateType}</Tag>;
      },
    },
    {
      title: "Điểm bắt đầu",
      dataIndex: "startLocation",
      key: "startLocation",
    },
    {
      title: "Điểm kết thúc",
      dataIndex: "endLocation",
      key: "endLocation",
    },
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
      render: (month: number) => `Tháng ${month}`,
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => {
        const date = new Date(createdAt);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center" as const,
      render: (_: any, record: TourTemplate) => (
        <Dropdown
          menu={{
            items: getActionMenuItems(record),
            style: {
              minWidth: "200px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          }}
          trigger={["click"]}
          placement="bottomRight"
          arrow={{ pointAtCenter: true }}>
          <Tooltip title="Thao tác" placement="top">
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: "16px" }} />}
              style={{
                border: "none",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          </Tooltip>
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // TODO: Lấy token từ localStorage hoặc context nếu cần
        const token = localStorage.getItem("token") || undefined;
        const res = await getTourTemplates({}, token);
        setTemplates(res.data || []);
      } catch (err) {
        handleError(err, "Không thể tải danh sách template");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleAdd = () => {
    setEditingTemplate(null);
    form.resetFields();
    setUploadFileList([]);
    // Set default values
    form.setFieldsValue({
      templateType: TourTemplateType.FreeScenic,
      scheduleDays: ScheduleDay.Saturday,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      images: [],
    });
    setErrorInfo(null); // Clear any previous errors
    setIsModalVisible(true);
  };
  const handleEdit = (template: TourTemplate) => {
    const fileList = Array.isArray(template.images)
      ? template.images.map((url, idx) => ({
        uid: idx + "",
        name: `image_${idx}`,
        status: "done",
        url,
      }))
      : [];
    const formValues: any = {
      title: template.title,
      startLocation: template.startLocation,
      endLocation: template.endLocation,
      templateType: template.templateType, // Keep as number
      scheduleDays: template.scheduleDays, // Keep as number
      month: template.month,
      year: template.year,
      images: fileList,
    };
    setEditingTemplate(template);
    setUploadFileList(fileList); // set fileList cho Upload
    form.setFieldsValue(formValues);
    setErrorInfo(null); // Clear any previous errors
    setIsModalVisible(true);
  };

  const handleView = async (template: TourTemplate) => {
    const token = localStorage.getItem("token") || "";
    const detail = await getTourTemplateDetail(template.id, token);
    if (!detail) {
      message.error("Không thể lấy thông tin chi tiết template");
      return;
    }
    const typeMap: Record<number, string> = {
      1: "FreeScenic",
      2: "PaidAttraction",
    };
    Modal.info({
      title: detail.title,
      width: 1200,
      content: (
        <div className="template-view-modal">
          <h3 className="modal-section-title">Thông tin cơ bản</h3>
          <Row gutter={16}>
            <Col span={24}>
              <p>
                <strong>Tên template:</strong> {detail.title}
              </p>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <p>
                <strong>Điểm bắt đầu:</strong> {detail.startLocation}
              </p>
            </Col>
            <Col span={12}>
              <p>
                <strong>Điểm kết thúc:</strong> {detail.endLocation}
              </p>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <p>
                <strong>Loại tour:</strong>{" "}
                {typeMap[detail.templateType] || detail.templateType}
              </p>
            </Col>
          </Row>
          <hr className="modal-section-divider" />
          <h3 className="modal-section-title">Thời gian có sẵn</h3>
          <Row gutter={16}>
            <Col span={8}>
              <p>
                <strong>Tháng:</strong> {detail.month}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <strong>Năm:</strong> {detail.year}
              </p>
            </Col>
            <Col span={8}>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {detail.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              </p>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </Col>
          </Row>
          <hr className="modal-section-divider" />
          <h3 className="modal-section-title">Danh sách Tour Slots</h3>
          <Row gutter={16}>
            <Col span={24}>
              <TourSlotsList templateId={detail.id} showUnassignedOnly={true} />
            </Col>
          </Row>
          <hr className="modal-section-divider" />
          <h3 className="modal-section-title">Hình ảnh</h3>
          <Row gutter={16}>
            <Col span={24}>
              <div className="template-images">
                {detail.images &&
                  detail.images.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="template" />
                  ))}
              </div>
            </Col>
          </Row>
        </div>
      ),
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa template này?",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          const token = localStorage.getItem("token") || undefined;
          // Use axios directly to avoid interceptor notifications
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          try {
            const response = await axiosInstance.delete(`/TourCompany/template/${id}`, {
              headers,
              validateStatus: () => true // Accept all status codes to handle manually
            });

            if (response.status === 200 || response.status === 204) {
              // Success
              setTemplates(templates.filter((t) => t.id !== id));
              message.success("Xóa template thành công");
              setErrorInfo(null); // Clear any previous errors
            } else if (response.status === 409) {
              // Conflict - throw error to be caught by outer catch
              const error = new Error('Conflict');
              (error as any).response = response;
              throw error;
            } else {
              // Other errors
              const error = new Error('Delete failed');
              (error as any).response = response;
              throw error;
            }
          } catch (deleteError: any) {
            // Re-throw to be caught by outer catch block
            throw deleteError;
          }
        } catch (error: any) {
          console.error('Delete template error:', error);

          // Check if it's a conflict error with blocking reasons
          if (error?.response?.status === 409) {
            // For 409 conflicts, show notification like add/edit errors
            const errorData = error.response.data;
            notification.error({
              message: errorData.message || "Template đang được sử dụng và không thể xóa",
              description: (
                <div>
                  <p>Template này đang được sử dụng bởi các tour details:</p>
                  {errorData.blockingReasons && errorData.blockingReasons.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <strong>Chi tiết:</strong>
                      <ul style={{ marginTop: 4, marginBottom: 0 }}>
                        {errorData.blockingReasons.map((reason: string, index: number) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ),
              duration: 8,
              placement: 'topRight'
            });
            // Don't call handleError to avoid default notification
            return; // Exit early to prevent any further error handling
          } else {
            // For other errors, use the default error handler
            handleError(error, "Xóa template thất bại");
          }
        }
      },
    });
  };
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let images: string[] = [];
      let fileList: any[] = [];
      if (Array.isArray(values.images)) {
        fileList = values.images;
      } else if (values.images && values.images.fileList) {
        fileList = values.images.fileList;
      }
      const existedUrls: string[] = [];
      const filesToUpload: File[] = [];
      fileList.forEach((file: any) => {
        if (file.url && typeof file.url === "string") {
          existedUrls.push(file.url);
        } else if (file.originFileObj) {
          filesToUpload.push(file.originFileObj);
        }
      });
      let uploadedUrls: string[] = [];
      if (filesToUpload.length > 0) {
        try {
          uploadedUrls = (
            await Promise.all(
              filesToUpload.map((file) => publicService.uploadImage(file))
            )
          ).filter(Boolean) as string[];
        } catch (uploadError) {
          console.warn(
            "Image upload failed, proceeding without images:",
            uploadError
          );
          message.warning("Không thể tải lên hình ảnh. Template sẽ được tạo không có hình ảnh.");
        }
      }
      images = [...existedUrls, ...uploadedUrls];
      const processedValues = {
        ...values,
        images,
      };
      // Map form values to API format
      const apiBody = {
        title: processedValues.title,
        startLocation: processedValues.startLocation,
        endLocation: processedValues.endLocation,
        templateType: processedValues.templateType, // Already a number from form
        scheduleDays: processedValues.scheduleDays, // Get from form values
        month: processedValues.month,
        year: processedValues.year,
        images: processedValues.images,
      };
      const token = localStorage.getItem("token") || undefined;

      // Debug log to check values
      console.log("Form values:", processedValues);

      if (editingTemplate) {
        // EDIT: gọi updateTourTemplate với skip auto notification
        try {
          const response = await updateTourTemplate(editingTemplate.id, apiBody, token);
          if (response.success) {
            message.success("Cập nhật template thành công");
          } else {
            throw new Error(response.message || "Cập nhật thất bại");
          }
        } catch (apiError: any) {
          // Skip default error handling and use our custom one
          throw apiError;
        }
      } else {
        // CREATE: gọi createTourTemplate với skip auto notification
        try {
          const response = await createTourTemplate(apiBody, token);
          if (response.success) {
            message.success("Thêm template thành công");
          } else {
            throw new Error(response.message || "Tạo template thất bại");
          }
        } catch (apiError: any) {
          // Skip default error handling and use our custom one
          throw apiError;
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      setUploadFileList([]);

      // Refresh templates list
      setLoading(true);
      try {
        const res = await getTourTemplates({}, token);
        setTemplates(res.data || []);
      } catch (refreshError) {
        console.error("Error refreshing templates:", refreshError);
        message.warning("Không thể tải lại danh sách template. Vui lòng tải lại trang.");
      } finally {
        setLoading(false);
      }
    } catch (error) {
      // Prevent default error handling to avoid duplicate notifications
      // Only show our custom error message
      notification.error({
        message: "Dữ liệu không hợp lệ",
        description: (
          <div>
            <p>Vui lòng kiểm tra và sửa các thông tin sau:</p>
            <div style={{ marginTop: 8 }}>
              <strong>Chi tiết:</strong>
              <p>Dữ liệu không hợp lệ - Vui lòng kiểm tra và sửa các lỗi sau</p>
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Hướng dẫn:</strong>
              <ul style={{ marginTop: 4, marginBottom: 0 }}>
                <li>Kiểm tra tất cả các trường bắt buộc đã được điền</li>
                <li>Đảm bảo định dạng dữ liệu đúng yêu cầu</li>
                <li>Xem chi tiết lỗi bên dưới</li>
              </ul>
            </div>
          </div>
        ),
        duration: 6,
        placement: 'topRight'
      });

      // Log error for debugging but don't trigger other error handlers
      console.error("Tour Template Error:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setUploadFileList([]);
    setErrorInfo(null); // Clear error info when closing modal
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Thêm hàm xử lý tạo tour từ template
  const handleCreateTour = (template: TourTemplate) => {
    // TODO: Mở modal tạo tour, hoặc chuyển sang trang tạo tour với template đã chọn
    message.info(`Tạo tour từ template: ${template.title}`);
  };

  // Handlers cho Holiday Tour
  const handleHolidayTourAdd = () => {
    setIsHolidayModalVisible(true);
  };

  const handleHolidayTourCancel = () => {
    setIsHolidayModalVisible(false);
  };

  const handleHolidayTourSuccess = () => {
    setIsHolidayModalVisible(false);
    // Refresh templates list
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const response = await getTourTemplates({}, token);
        if (response.success && response.data) {
          setTemplates(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        handleError(error, "Không thể tải danh sách template");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  };

  return (
    <div className="tour-template-management">
      <div className="page-header">
        <Title level={2}>Quản lý Tour Template</Title>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm theo tên, danh mục"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm Template
          </Button>
          <Button
            type="default"
            icon={<CalendarOutlined />}
            onClick={handleHolidayTourAdd}
            style={{
              marginLeft: 8,
              backgroundColor: "#f0f8ff",
              borderColor: "#1890ff",
            }}>
            Tour Ngày Lễ
          </Button>
        </div>
      </div>

      <Card>
        <Table
          dataSource={templates}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      <TourTemplateFormModal
        form={form}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        uploadFileList={uploadFileList}
        setUploadFileList={setUploadFileList}
        editingTemplate={editingTemplate}
        loading={loading}
        errorInfo={errorInfo}
      />

      <HolidayTourForm
        visible={isHolidayModalVisible}
        onCancel={handleHolidayTourCancel}
        onSuccess={handleHolidayTourSuccess}
      />
    </div>
  );
};

export default TourTemplateManagement;
