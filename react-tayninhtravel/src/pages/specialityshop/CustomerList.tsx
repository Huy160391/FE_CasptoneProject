import { useState, useEffect } from 'react';
import { Table, Spin, Card, Input, Button, Space, Tag, Modal, message, Descriptions } from 'antd';
import { EyeOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
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
                console.log('API Response:', res?.data?.slice(0, 1)); // Log 1 item đầu để debug

                function formatJoinDate(dateStr: string) {
                    if (!dateStr) return '';
                    try {
                        const d = new Date(dateStr);
                        if (isNaN(d.getTime())) return dateStr;
                        return d.toLocaleDateString('vi-VN');
                    } catch (error) {
                        console.error('formatJoinDate error:', error, 'input:', dateStr);
                        return dateStr;
                    }
                }

                // Map dữ liệu cho bảng
                const rows = (res.data || []).map((item: any) => ({
                    id: item.bookingId,
                    name: item.customerName,
                    phone: item.customerPhone,
                    email: item.customerEmail,
                    tourName: item.tourName,
                    joinDate: item.tourDate ? formatJoinDate(item.tourDate) : '',
                    payOsOrderCode: item.paidOrdersFull?.[0]?.payOsOrderCode || '',
                    paymentDate: item.paidOrdersFull?.[0]?.createdAt ? formatDate(item.paidOrdersFull[0].createdAt) : '',
                    // Giữ nguyên toàn bộ object để sử dụng trong columns render
                    ...item
                }));

                setData(rows);
                setTotal(res.total || 0);
            } catch (e) {
                console.error('fetchData error:', e);
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

    // Các hàm xử lý actions
    const handleView = (record: any) => {
        console.log('handleView record:', record); // Debug log
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    const handleMarkAsReceived = (_record: any) => {
        Modal.confirm({
            title: 'Xác nhận đã nhận hàng',
            content: `Bạn có chắc chắn khách hàng đã nhận đơn hàng này?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            okType: 'primary',
            onOk: async () => {
                try {
                    // TODO: Gọi API để đánh dấu đã nhận hàng
                    message.success('Đã đánh dấu đơn hàng là đã nhận hàng');
                    // Refresh data nếu cần
                } catch (error) {
                    console.error('Error marking as received:', error);
                    message.error('Không thể cập nhật trạng thái đơn hàng');
                }
            }
        });
    };

    const handleDelete = (record: any) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa thông tin khách hàng ${record.name}?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    // TODO: Gọi API để xóa
                    message.success('Đã xóa thành công');
                    // Refresh data
                } catch (error) {
                    console.error('Error deleting:', error);
                    message.error('Không thể xóa');
                }
            }
        });
    };

    // Hàm helper để format date an toàn
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleString('vi-VN');
        } catch (error) {
            console.error('formatDate error:', error, 'input:', dateString);
            return 'N/A';
        }
    };

    // Hàm helper để lấy status từ order data
    const getOrderStatus = (record: any) => {
        const firstOrder = record.paidOrdersFull?.[0];
        return firstOrder?.status || 'Unknown';
    };

    const getIsChecked = (record: any) => {
        const firstOrder = record.paidOrdersFull?.[0];
        return firstOrder?.isChecked || false;
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending': return 'Chờ xử lý';
            case 'Paid': return 'Đã thanh toán';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'orange';
            case 'Paid': return 'green';
            case 'Cancelled': return 'red';
            default: return 'default';
        }
    };

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
            title: 'Trạng thái thanh toán',
            key: 'paymentStatus',
            width: 150,
            filters: [
                { text: 'Chờ xử lý', value: 'Pending' },
                { text: 'Đã thanh toán', value: 'Paid' },
                { text: 'Đã hủy', value: 'Cancelled' },
            ],
            onFilter: (value: any, record: any) => getOrderStatus(record) === value,
            render: (_: any, record: any) => {
                const status = getOrderStatus(record);
                return (
                    <Tag color={getStatusColor(status)}>
                        {getStatusText(status)}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái nhận hàng',
            key: 'deliveryStatus',
            width: 150,
            filters: [
                { text: 'Đã nhận hàng', value: true },
                { text: 'Chưa nhận hàng', value: false },
            ],
            onFilter: (value: any, record: any) => getIsChecked(record) === value,
            render: (_: any, record: any) => {
                const isChecked = getIsChecked(record);
                return (
                    <Tag color={isChecked ? 'green' : 'orange'}>
                        {isChecked ? 'Đã nhận hàng' : 'Chưa nhận hàng'}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá tiền đơn hàng',
            key: 'orderAmount',
            width: 150,
            render: (_: any, record: any) => {
                const amount = record.paidOrdersFull?.[0]?.totalAmount;
                return amount && typeof amount === 'number'
                    ? `${amount.toLocaleString()} ₫`
                    : '0 ₫';
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_: any, record: any) => {
                const orderStatus = getOrderStatus(record);
                const isChecked = getIsChecked(record);

                return (
                    <Space size="small">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        >
                            Xem
                        </Button>
                        {orderStatus === 'Paid' && !isChecked && (
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleMarkAsReceived(record)}
                            >
                                Đã nhận
                            </Button>
                        )}
                        <Button
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleDelete(record)}
                            disabled={isChecked}
                        >
                            Xóa
                        </Button>
                    </Space>
                );
            },
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
                            <Descriptions.Item label="Mã đơn hàng">
                                {selectedOrder.paidOrdersFull?.[0]?.payOsOrderCode || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {formatDate(selectedOrder.paidOrdersFull?.[0]?.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên khách hàng">{selectedOrder.customerName}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedOrder.customerEmail}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedOrder.customerPhone}</Descriptions.Item>
                            <Descriptions.Item label="Tên tour">{selectedOrder.tourName}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tới">
                                {selectedOrder.tourDate ? (typeof selectedOrder.tourDate === 'string' ? selectedOrder.tourDate : formatDate(selectedOrder.tourDate)) : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Hoạt động">{selectedOrder.activity}</Descriptions.Item>
                            <Descriptions.Item label="Voucher">
                                {selectedOrder.paidOrdersFull?.[0]?.voucherCode || 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền gốc">
                                {(selectedOrder.paidOrdersFull?.[0]?.totalAmount && typeof selectedOrder.paidOrdersFull[0].totalAmount === 'number')
                                    ? selectedOrder.paidOrdersFull[0].totalAmount.toLocaleString() + ' ₫'
                                    : '0 ₫'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảm giá">
                                {(selectedOrder.paidOrdersFull?.[0]?.discountAmount && typeof selectedOrder.paidOrdersFull[0].discountAmount === 'number')
                                    ? selectedOrder.paidOrdersFull[0].discountAmount.toLocaleString() + ' ₫'
                                    : '0 ₫'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thành tiền">
                                {(selectedOrder.paidOrdersFull?.[0]?.totalAmount && typeof selectedOrder.paidOrdersFull[0].totalAmount === 'number')
                                    ? selectedOrder.paidOrdersFull[0].totalAmount.toLocaleString() + ' ₫'
                                    : '0 ₫'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái thanh toán">
                                <Tag color={getStatusColor(getOrderStatus(selectedOrder))}>
                                    {getStatusText(getOrderStatus(selectedOrder))}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái giao hàng">
                                <Tag color={getIsChecked(selectedOrder) ? 'green' : 'orange'}>
                                    {getIsChecked(selectedOrder) ? 'Đã nhận hàng' : 'Chưa nhận hàng'}
                                </Tag>
                            </Descriptions.Item>
                            {selectedOrder.paidOrdersFull?.[0]?.checkedAt && (
                                <Descriptions.Item label="Thời gian nhận hàng" span={2}>
                                    {formatDate(selectedOrder.paidOrdersFull[0].checkedAt)}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <div className="order-items">
                            <h4>Sản phẩm đã đặt</h4>
                            <Table
                                size="small"
                                dataSource={selectedOrder.paidOrdersFull?.[0]?.details?.map((item: any, index: number) => {
                                    // Đảm bảo tất cả dữ liệu đều là primitive types
                                    const safeItem = {
                                        key: index,
                                        productName: item.productName || '',
                                        quantity: Number(item.quantity) || 0,
                                        unitPrice: Number(item.unitPrice) || 0,
                                        total: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
                                    };
                                    return safeItem;
                                }) || []}
                                columns={[
                                    {
                                        title: 'Sản phẩm',
                                        dataIndex: 'productName',
                                        key: 'productName',
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'unitPrice',
                                        key: 'unitPrice',
                                        render: (price: number) => `${price.toLocaleString()} ₫`,
                                    },
                                    {
                                        title: 'Thành tiền',
                                        key: 'total',
                                        render: (_: any, record: any) => `${(record.quantity * record.unitPrice).toLocaleString()} ₫`,
                                    },
                                ]}
                                pagination={false}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3}>
                                            <strong>Tổng cộng</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <strong>
                                                {selectedOrder.paidOrdersFull?.[0]?.totalAmount?.toLocaleString() || '0'} ₫
                                            </strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CustomerList;
