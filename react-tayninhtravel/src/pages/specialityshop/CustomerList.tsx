import { useState, useEffect } from 'react';
import { Table, Spin, Card, Input } from 'antd';
import { Modal, Descriptions } from 'antd';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { UserOutlined } from '@ant-design/icons';
import './CustomerList.scss';
import { getVisitorsBuyProduct } from '../../services/specialtyShopService';
// ...existing code...


// ...existing code...

// columns sẽ được khai báo trong component CustomerList

const { Search } = Input;

const CustomerList: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let fromDate, toDate;
                if (dateRange) {
                    fromDate = dateRange[0];
                    toDate = dateRange[1];
                }
                const res = await getVisitorsBuyProduct({ pageIndex, pageSize, fromDate, toDate });
                // Map dữ liệu cho bảng
                const rows = (res.data || []).map((item: any) => ({
                    id: item.bookingId,
                    name: item.customerName,
                    phone: item.customerPhone,
                    email: item.customerEmail,
                    tourName: item.tourName,
                    joinDate: item.tourDate ? formatDate(item.tourDate) : '',
                    payOsOrderCode: item.paidOrders?.[0]?.payOsOrderCode || '',
                    paymentDate: item.paidOrders?.[0]?.createdAt ? new Date(item.paidOrders[0].createdAt).toLocaleString('vi-VN') : '',
                }));

                function formatDate(dateStr: string) {
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return dateStr;
                    return d.toLocaleDateString('vi-VN');
                }
                setData(rows);
                setTotal(res.total || 0);
            } catch (e) {
                setData([]);
                setTotal(0);
            }
            setLoading(false);
        };
        fetchData();
    }, [pageIndex, pageSize, dateRange]);

    // Lọc dữ liệu theo searchText
    const filteredData = data.filter(item => {
        const text = searchText.toLowerCase();
        const matchText = (
            item.name.toLowerCase().includes(text) ||
            item.email.toLowerCase().includes(text) ||
            item.phone.toLowerCase().includes(text)
        );
        if (!dateRange) return matchText;
        // So sánh joinDate với khoảng ngày
        const [start, end] = dateRange;
        const joinDate = dayjs(item.joinDate, 'DD/MM/YYYY');
        return matchText && joinDate.isSameOrAfter(dayjs(start, 'YYYY-MM-DD')) && joinDate.isSameOrBefore(dayjs(end, 'YYYY-MM-DD'));
    });

    const columns = [
        {
            title: 'Thông tin khách hàng',
            key: 'customerInfo',
            render: (_: any, record: any) => (
                <div>
                    <span style={{ fontWeight: 500 }}><UserOutlined /> {record.name}</span><br />
                    <span style={{ color: '#888' }}>{record.email}</span><br />
                    <span style={{ color: '#888' }}>{record.phone}</span>
                </div>
            ),
        },
        {
            title: 'Tên tour',
            dataIndex: 'tourName',
            key: 'tourName',
        },
        {
            title: 'Ngày tới',
            dataIndex: 'joinDate',
            key: 'joinDate',
        },
        {
            title: 'Mã PayOS',
            dataIndex: 'payOsOrderCode',
            key: 'payOsOrderCode',
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <a
                    style={{ cursor: 'pointer', color: '#1677ff' }}
                    onClick={() => {
                        setSelectedOrder(record);
                        setIsModalVisible(true);
                    }}
                >
                    Xem đơn hàng
                </a>
            ),
        },
    ];

    return (
        <div className="customer-list-page">
            <div className="page-header">
                <h1>Danh sách khách hàng đặt trước sản phẩm</h1>
                <div className="header-actions" style={{ display: 'flex', gap: 16 }}>
                    <Search
                        placeholder="Tìm kiếm khách hàng đặt trước sản phẩm..."
                        allowClear
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <RangePicker
                        format="DD/MM/YYYY"
                        placeholder={["Từ ngày", "Đến ngày"]}
                        allowClear
                        value={dateRange ? [dayjs(dateRange[0], 'YYYY-MM-DD'), dayjs(dateRange[1], 'YYYY-MM-DD')] : null}
                        onChange={dates => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
                            } else {
                                setDateRange(null);
                            }
                        }}
                        style={{ width: 260 }}
                    />
                </div>
            </div>
            <Card className="customer-list-table">
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        pagination={{
                            current: pageIndex,
                            pageSize: pageSize,
                            total: total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khách hàng đặt trước sản phẩm`,
                        }}
                        locale={{ emptyText: 'Không có khách hàng nào' }}
                        onChange={(pagination) => {
                            setPageIndex(pagination.current || 1);
                            setPageSize(pagination.pageSize || 10);
                        }}
                    />
                </Spin>
            </Card>
            <Modal
                title="Chi tiết đơn hàng"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div className="order-detail">
                        <Descriptions title="Thông tin đơn hàng" bordered column={2}>
                            <Descriptions.Item label="Mã đơn hàng">{selectedOrder.payOsOrderCode}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{selectedOrder.paymentDate}</Descriptions.Item>
                            <Descriptions.Item label="Tên khách hàng">{selectedOrder.name}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedOrder.email}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedOrder.phone}</Descriptions.Item>
                            <Descriptions.Item label="Tên tour">{selectedOrder.tourName}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tới">{selectedOrder.joinDate}</Descriptions.Item>
                            <Descriptions.Item label="Hoạt động">{selectedOrder.activity}</Descriptions.Item>
                            <Descriptions.Item label="CheckInAtUtc">{selectedOrder.plannedCheckInAtUtc}</Descriptions.Item>
                        </Descriptions>
                        <div className="order-items">
                            <h4>Sản phẩm đã đặt</h4>
                            <ul>
                                {(selectedOrder.products || []).map((item: any, idx: number) => (
                                    <li key={idx}>
                                        {item.productName} - SL: {item.quantity} - Đơn giá: {item.unitPrice?.toLocaleString()} ₫
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-payment">
                            <h4>Thông tin thanh toán</h4>
                            {(selectedOrder.paidOrders || []).map((order: any, idx: number) => (
                                <Descriptions key={idx} bordered size="small" column={2}>
                                    <Descriptions.Item label="Mã PayOS">{order.payOsOrderCode}</Descriptions.Item>
                                    <Descriptions.Item label="Ngày thanh toán">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}</Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái giao hàng">{order.isChecked ? 'Đã nhận hàng' : 'Chưa nhận hàng'}</Descriptions.Item>
                                </Descriptions>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CustomerList;
