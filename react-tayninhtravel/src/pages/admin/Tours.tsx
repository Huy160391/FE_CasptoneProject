import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, message, Switch, Tooltip } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './Tours.scss';
import { adminService } from '@/services/adminService';

import TourDetailModal from '@/pages/admin/TourDetailModal';
import type { PendingTour } from '@/types/tour';
import { getTourDetailsStatusColor } from '@/types/tour';



const Tours = () => {
  const [searchText, setSearchText] = useState('');
  const [tours, setTours] = useState<PendingTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<PendingTour | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllTours({
        searchTerm: searchText,
        includeInactive: includeInactive,
        pageIndex: pageIndex,
        pageSize: pageSize,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setTours(data);
      setTotalCount(res.totalCount || data.length);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setTours([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [searchText, includeInactive, pageIndex, pageSize]);

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

  // Thay đổi handleRowClick để lấy chi tiết tour từ API
  const handleRowClick = async (record: PendingTour) => {
    setLoading(true);
    try {
      const detail = await adminService.getTourDetail(record.id);
      setSelectedTour(detail.data || detail); // Đảm bảo truyền đúng dữ liệu vào modal
      setDetailModalOpen(true);
    } catch (err) {
      message.error('Không thể lấy chi tiết tour');
    } finally {
      setLoading(false);
    }
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
          <img src={(record.imageUrls && record.imageUrls[0]) || ''} alt={text} className="tour-image" />
          <span>{text}</span>
        </div>
      ),
      sorter: (a: PendingTour, b: PendingTour) => a.title.localeCompare(b.title),
    },
    {
      title: 'Tên công ty',
      key: 'company',
      render: (_: any, record: PendingTour) => record.tourTemplate?.createdBy?.name || '-',
    },
    {
      title: 'Thời gian',
      key: 'scheduleDays',
      render: (_: any, record: PendingTour) => record.tourTemplate?.scheduleDaysVietnamese || record.tourTemplate?.scheduleDays || '-',
    },
    {
      title: 'Điểm khởi hành',
      key: 'startLocation',
      render: (_: any, record: PendingTour) => record.tourTemplate?.startLocation || '-',
    },
    {
      title: 'Điểm kết thúc',
      key: 'endLocation',
      render: (_: any, record: PendingTour) => record.tourTemplate?.endLocation || '-',
    },
    {
      title: 'Số khách tối đa',
      key: 'maxGuests',
      render: (_: any, record: PendingTour) => record.tourOperation?.maxGuests ?? '-',
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_: any, record: PendingTour) => record.tourOperation?.price ? `${record.tourOperation.price.toLocaleString()}₫` : '-',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: PendingTour) => {
        // Hiển thị status text trực tiếp từ response, hoặc dùng hàm chuyển đổi nếu cần
        const color = getTourDetailsStatusColor(record.status);
        const text = record.status;
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
      onFilter: (value: any, record: PendingTour) => record.status === value,
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      render: (_: any, record: PendingTour) => {
        const d = new Date(record.createdAt);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      },
      sorter: (a: PendingTour, b: PendingTour) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: PendingTour) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button type="primary" icon={<EyeOutlined />} size="small" onClick={e => { e.stopPropagation(); handleRowClick(record); }} />
          </Tooltip>
          {record.status === 'AwaitingAdminApproval' && (
            <>
              <Tooltip title="Duyệt">
                <Button type="primary" icon={<CheckOutlined />} size="small" onClick={e => { e.stopPropagation(); handleApprove(record); }} />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button danger icon={<CloseOutlined />} size="small" onClick={e => { e.stopPropagation(); handleReject(record); }} />
              </Tooltip>
            </>
          )}
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
              onChange={checked => {
                setIncludeInactive(checked);
                setTimeout(() => fetchTours(), 0);
              }}
            />
          </div>
        </div>
      </div>

      <Table
        dataSource={tours}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize,
          current: pageIndex + 1,
          total: totalCount,
          showSizeChanger: true,
          onChange: (page, size) => {
            setPageIndex(page - 1);
            setPageSize(size);
            setTimeout(() => fetchTours(), 0);
          },
        }}
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
