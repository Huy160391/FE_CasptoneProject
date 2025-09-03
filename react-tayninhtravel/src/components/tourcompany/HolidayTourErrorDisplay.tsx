import React from "react";
import { Alert, List, Typography, Button, Space, Divider } from "antd";
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  WarningOutlined
} from "@ant-design/icons";

const { Text } = Typography;

interface HolidayTourErrorDisplayProps {
  validationErrors?: string[];
  fieldErrors?: Record<string, string[]>;
  showDetails?: boolean;
  onToggleDetails?: () => void;
  onDismiss?: () => void;
}

const HolidayTourErrorDisplay: React.FC<HolidayTourErrorDisplayProps> = ({
  validationErrors = [],
  fieldErrors = {},
  showDetails = false,
  onToggleDetails,
  onDismiss,
}) => {
  const hasErrors = validationErrors.length > 0 || Object.keys(fieldErrors).length > 0;
  
  if (!hasErrors) return null;

  // Categorize errors for better display
  const categorizeErrors = () => {
    const categories = {
      dateErrors: [] as string[],
      businessRuleErrors: [] as string[],
      validationErrors: [] as string[],
      guidanceMessages: [] as string[],
    };

    validationErrors.forEach(error => {
      if (error.includes("ngày") || error.includes("date") || error.includes("30 ngày")) {
        categories.dateErrors.push(error);
      } else if (error.includes("quy tắc") || error.includes("business") || error.includes("💡")) {
        if (error.includes("💡") || error.includes("HƯỚNG DẪN")) {
          categories.guidanceMessages.push(error);
        } else {
          categories.businessRuleErrors.push(error);
        }
      } else {
        categories.validationErrors.push(error);
      }
    });

    return categories;
  };

  const categories = categorizeErrors();
  const totalErrors = validationErrors.length + Object.keys(fieldErrors).length;

  // Render error category
  const renderErrorCategory = (title: string, errors: string[], icon: React.ReactNode, type: "error" | "warning" | "info" = "error") => {
    if (errors.length === 0) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <Space align="start" style={{ marginBottom: 8 }}>
          {icon}
          <Text strong style={{ color: type === "error" ? "#ff4d4f" : type === "warning" ? "#faad14" : "#1890ff" }}>
            {title}
          </Text>
        </Space>
        <List
          size="small"
          dataSource={errors}
          renderItem={(error, index) => (
            <List.Item key={index} style={{ padding: "2px 0", border: "none", paddingLeft: 24 }}>
              <Text type={type === "error" ? "danger" : type === "warning" ? "warning" : undefined} style={{ fontSize: "13px" }}>
                • {error.replace(/💡|•/g, '').trim()}
              </Text>
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Render field errors
  const renderFieldErrors = () => {
    if (Object.keys(fieldErrors).length === 0) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <Space align="start" style={{ marginBottom: 8 }}>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <Text strong style={{ color: "#ff4d4f" }}>
            Lỗi trường dữ liệu
          </Text>
        </Space>
        {Object.entries(fieldErrors).map(([field, errors]) => (
          <div key={field} style={{ paddingLeft: 24, marginBottom: 8 }}>
            <Text strong style={{ fontSize: "13px", color: "#595959" }}>
              {getFieldDisplayName(field)}:
            </Text>
            <List
              size="small"
              dataSource={Array.isArray(errors) ? errors : [errors as string]}
              renderItem={(error, index) => (
                <List.Item key={index} style={{ padding: "2px 0", border: "none", paddingLeft: 8 }}>
                  <Text type="danger" style={{ fontSize: "13px" }}>
                    • {error}
                  </Text>
                </List.Item>
              )}
            />
          </div>
        ))}
      </div>
    );
  };

  // Get user-friendly field names
  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      title: "Tên Tour",
      tourDate: "Ngày Diễn Ra",
      startLocation: "Điểm Khởi Hành",
      endLocation: "Điểm Kết Thúc",
      templateType: "Loại Tour",
      description: "Mô Tả",
      images: "Hình Ảnh",
    };
    return fieldNames[field] || field;
  };

  if (!showDetails) {
    return (
      <Alert
        message={`Có ${totalErrors} lỗi validation`}
        type="warning"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
        action={
          <Space>
            {onToggleDetails && (
              <Button size="small" type="link" onClick={onToggleDetails}>
                Xem chi tiết
              </Button>
            )}
            {onDismiss && (
              <Button size="small" type="link" onClick={onDismiss}>
                Ẩn
              </Button>
            )}
          </Space>
        }
      />
    );
  }

  return (
    <Alert
      message="Chi tiết lỗi Template Holiday Tour"
      type="error"
      showIcon
      icon={<ExclamationCircleOutlined />}
      style={{ marginBottom: 24 }}
      description={
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {renderFieldErrors()}
          
          {categories.dateErrors.length > 0 && (
            <>
              {renderErrorCategory(
                "Lỗi ngày tháng", 
                categories.dateErrors, 
                <CalendarOutlined style={{ color: "#ff4d4f" }} />
              )}
              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          {categories.businessRuleErrors.length > 0 && (
            <>
              {renderErrorCategory(
                "Lỗi quy tắc kinh doanh", 
                categories.businessRuleErrors, 
                <WarningOutlined style={{ color: "#ff4d4f" }} />
              )}
              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          {categories.validationErrors.length > 0 && (
            <>
              {renderErrorCategory(
                "Lỗi validation khác", 
                categories.validationErrors, 
                <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
              )}
              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          {categories.guidanceMessages.length > 0 && (
            renderErrorCategory(
              "Hướng dẫn", 
              categories.guidanceMessages, 
              <InfoCircleOutlined style={{ color: "#1890ff" }} />,
              "info"
            )
          )}

          <Space style={{ marginTop: 16 }}>
            {onToggleDetails && (
              <Button size="small" onClick={onToggleDetails}>
                Ẩn chi tiết
              </Button>
            )}
            {onDismiss && (
              <Button size="small" type="primary" onClick={onDismiss}>
                Đã hiểu
              </Button>
            )}
          </Space>
        </div>
      }
    />
  );
};

export default HolidayTourErrorDisplay;
