import React from 'react';
import { Modal, Button, Tabs, Space } from 'antd';
import {
  InfoCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ShopOutlined
} from '@ant-design/icons';
import type { PendingTour } from '@/types/tour';
import { useThemeStore } from '@/store/useThemeStore';
import './TourDetailModal.scss';

interface TourDetailModalProps {
  open: boolean;
  onClose: () => void;
  tour: PendingTour | null;
  onApprove?: (tour: PendingTour) => void;
  onReject?: (tour: PendingTour) => void;
}

const TourDetailModal: React.FC<TourDetailModalProps> = ({ open, onClose, tour, onApprove, onReject }) => {
  const isDark = typeof useThemeStore === 'function' ? useThemeStore(state => state.isDarkMode) : false;
  if (!tour) return null;
  const status = tour.status;
  const showAction = status === 'Pending' || status === 'AwaitingAdminApproval';
  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={false}
      title={null}
      width={900}
      footer={null}
      className={`tour-detail-modal${isDark ? ' dark' : ''}`}
    >
      <div className={`tour-detail-modal${isDark ? ' dark' : ''}`}>
        {/* Header với gradient */}
        <div className={`modal-header${isDark ? ' dark' : ''}`}>
          <div className="header-content">
            <div className="title-section">
              <h1 className="main-title">{tour.tourTemplateName || tour.title || 'Chi tiết tour'}</h1>
              <div className="company-name">
                <UserOutlined />
                {tour.tourCompanyName}
              </div>
            </div>
            <div className="status-section">
              <div className="status-tag">
                {status === 'Public' ? 'Đã công khai' :
                  status === 'Pending' ? 'Đang chờ duyệt' :
                    status === 'AwaitingAdminApproval' ? 'Chờ admin duyệt' :
                      status === 'Rejected' ? 'Đã từ chối' : status}
              </div>
              {showAction && (
                <div className="action-buttons">
                  <Space>
                    <Button type="primary" onClick={() => onApprove && onApprove(tour)}>
                      Duyệt
                    </Button>
                    <Button danger onClick={() => onReject && onReject(tour)}>
                      Từ chối
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overview Card */}
        <div className={`overview-card${isDark ? ' dark' : ''}`}>
          <div className="info-grid">
            <div className="info-item">
              <EnvironmentOutlined className="info-icon" />
              <span className="info-label">Khởi hành:</span>
              <span className="info-value">{tour.startLocation}</span>
            </div>
            <div className="info-item">
              <EnvironmentOutlined className="info-icon" />
              <span className="info-label">Điểm đến:</span>
              <span className="info-value">{tour.endLocation}</span>
            </div>
            <div className="info-item">
              <CalendarOutlined className="info-icon" />
              <span className="info-label">Lịch trình:</span>
              <span className="info-value">{tour.scheduleDays}</span>
            </div>
            <div className="info-item">
              <TeamOutlined className="info-icon" />
              <span className="info-label">Khách tối đa:</span>
              <span className="info-value">{tour.tourOperation?.maxGuests}</span>
            </div>
            <div className="info-item">
              <DollarOutlined className="info-icon" />
              <span className="info-label">Giá:</span>
              <span className="info-value">{tour.tourOperation?.price?.toLocaleString()} VND</span>
            </div>
            <div className="info-item">
              <TeamOutlined className="info-icon" />
              <span className="info-label">Booking hiện tại:</span>
              <span className="info-value">{tour.tourOperation?.currentBookings}</span>
            </div>
          </div>

          <div className={`dates-section${isDark ? ' dark' : ''}`}>
            <div className="date-item">
              <div className="date-label">Ngày tạo</div>
              <div className="date-value">
                {tour.createdAt ? new Date(tour.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </div>
            </div>
            <div className="date-item">
              <div className="date-label">Ngày cập nhật</div>
              <div className="date-value">
                {tour.updatedAt ? new Date(tour.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {tour.description && (
          <div className={`description-section${isDark ? ' dark' : ''}`}>
            <div className="section-title">
              <FileTextOutlined />
              Mô tả tour
            </div>
            <div className="section-content">{tour.description}</div>
          </div>
        )}

        {/* Skills Required */}
        {tour.skillsRequired && (
          <div className={`description-section${isDark ? ' dark' : ''}`}>
            <div className="section-title">
              <InfoCircleOutlined />
              Kỹ năng yêu cầu
            </div>
            <div className="section-content">{tour.skillsRequired}</div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultActiveKey="1" className={`custom-tabs${isDark ? ' dark' : ''}`}>
          <Tabs.TabPane tab="Lịch trình chi tiết" key="1">
            <div className={`${isDark ? 'dark' : ''}`}>
              {tour.timeline && tour.timeline.length > 0 ? (
                <ul className={`timeline-list${isDark ? ' dark' : ''}`}>
                  {tour.timeline.map((item: any) => (
                    <li key={item.id} className="timeline-item">
                      <div className="timeline-time">{String(item.checkInTime)}</div>
                      <div className="timeline-activity">{String(item.activity)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <ClockCircleOutlined style={{ fontSize: 32, marginBottom: 16 }} />
                  <div>Không có lịch trình chi tiết</div>
                </div>
              )}
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Thông tin thêm" key="2">
            <div className={`${isDark ? 'dark' : ''}`}>
              <div style={{ marginBottom: 16 }}>
                <strong>Ghi chú duyệt:</strong> {tour.commentApproved || 'Không có'}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Trạng thái vận hành:</strong> {tour.tourOperation?.status || 'Không xác định'}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Số lượng điểm dừng:</strong> {tour.timelineItemsCount || 0}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Số slot đã gán:</strong> {tour.assignedSlotsCount || 0}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Số cửa hàng mời:</strong> {tour.invitedShopsCount || 0}
              </div>

              {tour.invitedSpecialtyShops && tour.invitedSpecialtyShops.length > 0 && (
                <div>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <ShopOutlined />
                    Cửa hàng đặc sản mời:
                  </strong>
                  <div className={`shops-list${isDark ? ' dark' : ''}`}>
                    {tour.invitedSpecialtyShops.map((shop: any) => (
                      <div key={shop.id} className="shop-item">
                        <ShopOutlined className="shop-icon" />
                        <span className="shop-name">{shop.shopName}</span>
                        <span className="owner-name">({shop.ownerName})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Hình ảnh" key="3">
            <div className={`image-gallery${isDark ? ' dark' : ''}`}>
              {(tour.imageUrl || (tour.imageUrls && tour.imageUrls.length > 0)) ? (
                <>
                  <img
                    src={tour.imageUrl || tour.imageUrls[0]}
                    alt={tour.tourTemplateName || tour.title}
                    className="main-image"
                  />
                  {tour.imageUrls && Array.isArray(tour.imageUrls) && tour.imageUrls.length > 1 && (
                    <div className="thumbnail-grid">
                      {tour.imageUrls.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`img-${idx}`}
                          className="thumbnail"
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <InfoCircleOutlined style={{ fontSize: 32, marginBottom: 16 }} />
                  <div>Chưa có hình ảnh</div>
                </div>
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default TourDetailModal;