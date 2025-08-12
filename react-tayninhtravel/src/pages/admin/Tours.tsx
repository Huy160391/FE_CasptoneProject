import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, message, Switch } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './Tours.scss';
import { adminService } from '@/services/adminService';

import TourDetailModal from '@/pages/admin/TourDetailModal';
import type { PendingTour } from '@/types/tour';
import { getTourDetailsStatusText, getTourDetailsStatusColor } from '@/types/tour';



const Tours = () => {
  const [searchText, setSearchText] = useState('');
  const [tours, setTours] = useState<PendingTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<PendingTour | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllTours({
        searchTerm: searchText,
        includeInactive: includeInactive
      });
      console.log('API Response:', res); // Debug log
      const data = Array.isArray(res.data)
        ? res.data.map((item: PendingTour) => {
          console.log('Tour item status:', item.status); // Debug log for each tour status
          return { ...item };
        })
        : [];
      setTours(data);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [searchText, includeInactive]);

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
    const updateContent = () => (
      <div>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 6 }}
          placeholder="Nhập lý do từ chối (bắt buộc)"
          onChange={e => {
            rejectMessage = e.target.value;
            if (error && rejectMessage) {
              error = '';
              modal.update({ content: updateContent() });
            }
          }}
        />
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    );
    const modal = Modal.confirm({
      title: 'Nhập lý do từ chối tour',
      content: updateContent(),
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        if (!rejectMessage.trim()) {
          error = 'Vui lòng nhập lý do từ chối!';
          modal.update({ content: updateContent() });
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
      width: 120,
      render: (text: string) => (
        text.length > 10 ? (
          <span title={text} style={{ cursor: 'pointer' }}>
            {text.slice(0, 10)}...
          </span>
        ) : text
      ),
      sorter: (a: PendingTour, b: PendingTour) => (a.id > b.id ? 1 : -1),
    },
    {
      title: 'Tên tour',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: PendingTour) => (
        <div className="tour-cell">
          <img src={record.imageUrl || (record.imageUrls && record.imageUrls[0])} alt={text} className="tour-image" />
          <span>{text}</span>
        </div>
      ),
      sorter: (a: PendingTour, b: PendingTour) => a.title.localeCompare(b.title),
    },
    {
      title: 'Số khách tối đa',
      dataIndex: ['tourOperation', 'maxGuests'],
      key: 'maxGuests',
      render: (_: any, record: PendingTour) => record.tourOperation?.maxGuests ?? '-',
    },
    {
      title: 'Giá',
      dataIndex: ['tourOperation', 'price'],
      key: 'price',
      render: (_: any, record: PendingTour) => record.tourOperation?.price ? `${record.tourOperation.price.toLocaleString()}₫` : '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString('vi-VN'),
      sorter: (a: PendingTour, b: PendingTour) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
        const color = getTourDetailsStatusColor(status);
        const text = getTourDetailsStatusText(status);
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Chờ duyệt', value: 'Pending' },
        { text: 'Đã được duyệt', value: 'Approved' },
        { text: 'Bị từ chối', value: 'Rejected' },
        { text: 'Tạm ngưng', value: 'Suspended' },
        { text: 'Chờ phân công HDV', value: 'AwaitingGuideAssignment' },
        { text: 'Đã hủy', value: 'Cancelled' },
        { text: 'Chờ admin duyệt', value: 'AwaitingAdminApproval' },
        { text: 'Chờ mở bán vé', value: 'WaitToPublic' },
        { text: 'Đã công khai', value: 'Public' },
      ],
      onFilter: (value: any, record: PendingTour) =>
        record.status === value,
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
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="search-input"
            allowClear
            style={{ width: 250, marginRight: 16 }}
          />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8 }}>Bao gồm tour không hoạt động:</span>
            <Switch
              checked={includeInactive}
              onChange={setIncludeInactive}
            />
          </div>
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
