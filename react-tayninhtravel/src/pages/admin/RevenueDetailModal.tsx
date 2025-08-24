import React, { useState, useEffect } from "react";
import {
  Modal,
  Spin,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Empty,
  message,
  Tag,
} from "antd";
import { adminService } from "../../services/adminService";
import {
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Bar } from "@ant-design/plots";

interface RevenueDetailModalProps {
  visible: boolean;
  onClose: () => void;
  companyId: string | null;
  year: number;
}

interface MonthlyRevenue {
  month: number;
  year: number;
  totalRevenue: number;
  totalBookings: number;
}

interface TopTour {
  tourName: string;
  totalRevenue: number;
  totalBookings: number;
}

interface RevenueDetail {
  companyName: string;
  totalRevenue: number;
  totalBookings: number;
  totalTours: number;
  monthlyRevenue: MonthlyRevenue[];
  topTours: TopTour[];
}

const RevenueDetailModal: React.FC<RevenueDetailModalProps> = ({
  visible,
  onClose,
  companyId,
  year,
}) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<RevenueDetail | null>(null);

  useEffect(() => {
    if (visible && companyId) {
      const fetchRevenueDetail = async () => {
        setLoading(true);
        try {
          const response = await adminService.getRevenueDetail(companyId, {
            year,
          });
          if (response.success && response.data) {
            setDetail(response.data);
          } else {
            message.error(response.message || "Không thể tải dữ liệu.");
          }
        } catch (error) {
          message.error("Lỗi khi tải chi tiết doanh thu.");
        } finally {
          setLoading(false);
        }
      };
      fetchRevenueDetail();
    }
  }, [visible, companyId, year]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const chartData =
    detail?.monthlyRevenue.map((item) => ({
      month: `Tháng ${item.month}`,
      revenue: item.totalRevenue / 1000000, // convert to millions
    })) || [];

  return (
    <Modal
      title={`Chi Tiết Doanh Thu - ${detail?.companyName || ""}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose>
      <Spin spinning={loading}>
        {detail ? (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tổng Doanh Thu"
                    value={formatCurrency(detail.totalRevenue)}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tổng Số Booking"
                    value={detail.totalBookings}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tổng Số Tour"
                    value={detail.totalTours}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title={`Biểu Đồ Doanh Thu Năm ${year}`}
              style={{ marginBottom: 24 }}>
              <Bar
                data={chartData}
                xField="month"
                yField="revenue"
                height={250}
                meta={{
                  revenue: { alias: "Doanh thu (triệu VNĐ)" },
                  month: { alias: "Tháng" },
                }}
              />
            </Card>

            <Card title="Top Tours Theo Doanh Thu">
              <Descriptions bordered column={1} size="small">
                {detail.topTours.map((tour) => (
                  <Descriptions.Item key={tour.tourName} label={tour.tourName}>
                    <Tag color="green">{formatCurrency(tour.totalRevenue)}</Tag>
                    <Tag color="blue">{tour.totalBookings} bookings</Tag>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          </div>
        ) : (
          !loading && <Empty description="Không có dữ liệu chi tiết." />
        )}
      </Spin>
    </Modal>
  );
};

export default RevenueDetailModal;
