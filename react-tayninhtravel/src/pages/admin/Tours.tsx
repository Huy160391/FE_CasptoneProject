import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import './Tours.scss';
import { adminService } from '@/services/adminService';

import TourDetailModal from '@/pages/admin/TourDetailModal';
import type { PendingTour } from '@/types/tour';



const Tours = () => {
  const [searchText, setSearchText] = useState('');
  const [tours, setTours] = useState<PendingTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<PendingTour | null>(null);

  useEffect(() => {
    const fetchPendingTours = async () => {
      setLoading(true);
      try {
        const res = await adminService.getPendingTours();
        const data = Array.isArray(res.data)
          ? res.data.map((item: PendingTour) => ({ ...item }))
          : [];
        setTours(data);
      } catch (err) {
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingTours();
  }, []);

  const handleApprove = async (tour: PendingTour) => {
    let approveMessage = '';
    Modal.confirm({
      title: 'Nhập ghi chú khi duyệt tour',
      content: (
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 6 }}
          placeholder="Nhập ghi chú (không bắt buộc)"
          onChange={e => {
            approveMessage = e.target.value;
          }}
        />
      ),
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminService.approveTour(tour.id, approveMessage || '');
          message.success('Duyệt tour thành công!');
          setTours(prev => prev.filter(t => t.id !== tour.id));
        } catch {
          message.error('Duyệt tour thất bại!');
        }
      },
    });
  };

  const handleReject = async (tour: PendingTour) => {
    let rejectMessage = '';
    let error = '';
    const modal = Modal.confirm({
      title: 'Nhập lý do từ chối tour',
      content: (
        <div>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder="Nhập lý do từ chối (bắt buộc)"
            onChange={e => {
              rejectMessage = e.target.value;
              if (error && rejectMessage) {
                error = '';
                modal.update({ content: modal.props.content });
              }
            }}
          />
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </div>
      ),
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        if (!rejectMessage.trim()) {
          error = 'Vui lòng nhập lý do từ chối!';
          modal.update({ content: modal.props.content });
          return Promise.reject();
        }
        try {
          await adminService.rejectTour(tour.id, rejectMessage);
          message.success('Đã từ chối tour!');
          setTours(prev => prev.filter(t => t.id !== tour.id));
        } catch {
          message.error('Từ chối tour thất bại!');
        }
      },
    });
  };

  const handleRowClick = (record: PendingTour) => {
    setSelectedTour(record);
    setDetailModalOpen(true);
  };

  const columns: ColumnsType<PendingTour> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: PendingTour, b: PendingTour) => (a.id > b.id ? 1 : -1),
    },
    {
      title: 'Tour',
      dataIndex: 'tourTemplateName',
      key: 'tourTemplateName',
      render: (text: string, record: PendingTour) => (
        <div className="tour-cell">
          <img src={record.imageUrl || (record.imageUrls && record.imageUrls[0])} alt={text} className="tour-image" />
          <span>{text}</span>
        </div>
      ),
      sorter: (a: PendingTour, b: PendingTour) => a.tourTemplateName.localeCompare(b.tourTemplateName),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: boolean | Key, record: PendingTour) => {
        const searchValue = value.toString().toLowerCase();
        return (
          record.tourTemplateName.toLowerCase().includes(searchValue) ||
          record.startLocation.toLowerCase().includes(searchValue)
        );
      },
    },
    {
      title: 'Công ty tổ chức',
      dataIndex: 'tourCompanyName',
      key: 'tourCompanyName',
    },
    {
      title: 'Thời gian',
      dataIndex: 'scheduleDays',
      key: 'scheduleDays',
    },
    {
      title: 'Điểm khởi hành',
      dataIndex: 'startLocation',
      key: 'startLocation',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: PendingTour['status']) => {
        const color = status === 1 ? 'success' : 'error';
        const text = status === 1 ? 'Đang mở' : 'Tạm ngưng';
        return <Tag className={`status-tag ${color}`}>{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PendingTour) => (
        <Space size="middle">
          <Button type="primary" onClick={e => { e.stopPropagation(); handleApprove(record); }}>Duyệt</Button>
          <Button danger onClick={e => { e.stopPropagation(); handleReject(record); }}>Từ chối</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="tours-page">
      <div className="page-header">
        <h1>Quản lý tour</h1>
        <div className="header-actions">
          <Input
            placeholder="Tìm kiếm theo tên, địa điểm"
            prefix={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
            className="search-input"
            allowClear
          />
        </div>
      </div>

      <Table
        dataSource={tours}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className="tours-table"
        loading={loading}
        onRow={record => ({
          onClick: () => handleRowClick(record),
        })}
      />

      <TourDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        tour={selectedTour}
      />
    </div>
  );
};



export default Tours
