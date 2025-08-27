import React from 'react';
import { Modal, Tag, Button, Row, Col, Tabs, Space, Divider } from 'antd';
import { InfoCircleOutlined, UserOutlined, EnvironmentOutlined, CalendarOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import type { PendingTour } from '@/types/tour';
import { useThemeStore } from '@/store/useThemeStore';

interface TourDetailModalProps {
  open: boolean;
  onClose: () => void;
  tour: PendingTour | null;
  onApprove?: (tour: PendingTour) => void;
  onReject?: (tour: PendingTour) => void;
}

const { TabPane } = Tabs;

const TourDetailModal: React.FC<TourDetailModalProps> = ({ open, onClose, tour, onApprove, onReject }) => {
  const isDark = typeof useThemeStore === 'function' ? useThemeStore(state => state.isDarkMode) : false;
  if (!tour) return null;
  const status = tour.status;
  const showAction = status === 'Pending' || status === 'AwaitingAdminApproval';
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Row align="middle" justify="space-between">
          <Col>
            <span style={{ fontWeight: 700, fontSize: 20 }}>{tour.tourTemplateName || tour.title || 'Chi tiết tour'}</span>
            <Tag color={status === 'Public' ? 'success' : status === 'Pending' ? 'gold' : status === 'Rejected' ? 'error' : 'default'} style={{ marginLeft: 12 }}>{status}</Tag>
          </Col>
          {showAction && (
            <Col>
              <Space>
                <Button type="primary" onClick={() => onApprove && onApprove(tour)}>Duyệt</Button>
                <Button danger onClick={() => onReject && onReject(tour)}>Từ chối</Button>
              </Space>
            </Col>
          )}
        </Row>
      }
      width={800}
      footer={null}
    >
      <div className="tour-detail-modal">
        <Divider orientation="left">Tổng quan</Divider>
        <div className={`tour-overview-box${isDark ? ' dark' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div className="overview-title" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <InfoCircleOutlined style={{ color: isDark ? '#90caf9' : '#1890ff' }} />
                {tour.tourTemplateName || tour.title}
              </div>
              <div className="overview-label" style={{ fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserOutlined />
                {tour.tourCompanyName}
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <span className="overview-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EnvironmentOutlined /> <b>Khởi hành:</b> {tour.startLocation}
                </span>
                <span className="overview-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EnvironmentOutlined /> <b>Điểm đến:</b> {tour.endLocation}
                </span>
                <span className="overview-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined /> <b>Lịch trình:</b> {tour.scheduleDays}
                </span>
                <span className="overview-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TeamOutlined /> <b>Khách tối đa:</b> {tour.tourOperation?.maxGuests}
                </span>
                <span className="overview-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarOutlined /> <b>Giá:</b> {tour.tourOperation?.price?.toLocaleString()} VND
                </span>
              </div>
            </div>
            <div style={{ minWidth: 120, textAlign: 'right' }}>
              <div className="overview-label" style={{ fontSize: 13 }}>Ngày tạo</div>
              <div style={{ fontWeight: 500 }}>{tour.createdAt ? new Date(tour.createdAt).toLocaleDateString() : ''}</div>
              <div className="overview-label" style={{ fontSize: 13, marginTop: 8 }}>Ngày cập nhật</div>
              <div style={{ fontWeight: 500 }}>{tour.updatedAt ? new Date(tour.updatedAt).toLocaleDateString() : ''}</div>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}><b>Mô tả:</b> {tour.description}</div>
        <div style={{ marginBottom: 8 }}><b>Kỹ năng yêu cầu:</b> {tour.skillsRequired}</div>


        <div style={{ marginBottom: 8 }}><b>Số booking hiện tại:</b> {tour.tourOperation?.currentBookings}</div>
        <div style={{ marginBottom: 8 }}><b>Trạng thái vận hành:</b> {tour.tourOperation?.status}</div>

        <Tabs defaultActiveKey="1" style={{ marginTop: 24 }}>
          <TabPane tab="Lịch trình chi tiết" key="1">
            {tour.timeline && tour.timeline.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {tour.timeline.map((item: any) => (
                  <li key={item.id}>
                    <b>{String(item.checkInTime)}</b>: {String(item.activity)}
                  </li>
                ))}
              </ul>
            ) : <span style={{ color: '#888' }}>Không có lịch trình chi tiết</span>}
          </TabPane>
          <TabPane tab="Thông tin thêm" key="2">
            <div><b>Ghi chú duyệt:</b> {tour.commentApproved}</div>
            <div><b>Số lượng điểm dừng:</b> {tour.timelineItemsCount}</div>
            <div><b>Số slot đã gán:</b> {tour.assignedSlotsCount}</div>
            <div><b>Số cửa hàng mời:</b> {tour.invitedShopsCount}</div>
            {tour.invitedSpecialtyShops && tour.invitedSpecialtyShops.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <b>Cửa hàng đặc sản mời:</b>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {tour.invitedSpecialtyShops.map((shop: any) => (
                    <li key={shop.id}>{shop.shopName} ({shop.ownerName})</li>
                  ))}
                </ul>
              </div>
            )}
          </TabPane>
        </Tabs>
        <Divider orientation="left" style={{ marginTop: 24 }}>Hình ảnh tour</Divider>
        {(tour.imageUrl || (tour.imageUrls && tour.imageUrls.length > 0)) && (
          <div className="tour-detail-image" style={{ marginBottom: 16 }}>
            <img src={tour.imageUrl || tour.imageUrls[0]} alt={tour.tourTemplateName || tour.title} style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
          </div>
        )}
        {tour.imageUrls && Array.isArray(tour.imageUrls) && tour.imageUrls.length > 1 && (
          <div>
            <b>Hình ảnh khác:</b>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {tour.imageUrls.map((url: string, idx: number) => (
                <img key={idx} src={url} alt={`img-${idx}`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TourDetailModal;
