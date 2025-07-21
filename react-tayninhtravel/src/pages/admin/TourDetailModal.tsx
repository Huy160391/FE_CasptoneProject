import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import './TourDetailModal.scss';

import type { PendingTour } from '@/types/tour';

interface TourDetailModalProps {
  open: boolean;
  onClose: () => void;
  tour: PendingTour | null;
}

const TourDetailModal: React.FC<TourDetailModalProps> = ({ open, onClose, tour }) => {
  if (!tour) return null;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      title={tour.tourTemplateName || tour.title || 'Chi tiết tour'}
      width={800}
      footer={null}
    >
      <div className="tour-detail-modal">
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="ID">{tour.id}</Descriptions.Item>
          <Descriptions.Item label="Tên tour">{tour.tourTemplateName || tour.title}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">{tour.description}</Descriptions.Item>
          <Descriptions.Item label="Công ty tổ chức">{tour.tourCompanyName}</Descriptions.Item>
          <Descriptions.Item label="Điểm khởi hành">{tour.startLocation}</Descriptions.Item>
          <Descriptions.Item label="Điểm đến">{tour.endLocation}</Descriptions.Item>
          <Descriptions.Item label="Lịch trình">
            {tour.scheduleDays}
            {tour.timeline && Array.isArray(tour.timeline) && (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                {tour.timeline.map((item) => (
                  <li key={item.id}>
                    <b>{item.checkInTime}:</b> {item.activity}
                    {item.specialtyShop && item.specialtyShop.shopName && (
                      <span> (Cửa hàng: {item.specialtyShop.shopName})</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Kỹ năng yêu cầu">{tour.skillsRequired}</Descriptions.Item>
          <Descriptions.Item label="Ghi chú duyệt">{tour.commentApproved}</Descriptions.Item>
          <Descriptions.Item label="Số lượng điểm dừng">{tour.timelineItemsCount}</Descriptions.Item>
          <Descriptions.Item label="Số slot đã gán">{tour.assignedSlotsCount}</Descriptions.Item>
          <Descriptions.Item label="Số cửa hàng mời">{tour.invitedShopsCount}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={tour.status === 1 ? 'success' : 'error'}>
              {tour.status === 1 ? 'Đang mở' : 'Tạm ngưng'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{tour.createdAt && new Date(tour.createdAt).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">{tour.updatedAt && new Date(tour.updatedAt).toLocaleString()}</Descriptions.Item>
        </Descriptions>
        {(tour.imageUrl || (tour.imageUrls && tour.imageUrls.length > 0)) && (
          <div className="tour-detail-image">
            <img src={tour.imageUrl || tour.imageUrls[0]} alt={tour.tourTemplateName || tour.title} />
          </div>
        )}
        {tour.imageUrls && Array.isArray(tour.imageUrls) && tour.imageUrls.length > 1 && (
          <div style={{ marginTop: 16 }}>
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
