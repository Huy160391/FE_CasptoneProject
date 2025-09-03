import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Card, Button, Input, Space, Tag, Modal, message, Descriptions } from 'antd';
import { EyeOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getShopOrders, cancelOrder, markOrderAsReceived, ShopOrder } from '../../services/specialtyShopService';
import './Orders.scss';

const { Search } = Input;

const SpecialityShopOrders = () => {
    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const location = useLocation();

    // Lấy token từ localStorage (hoặc từ context nếu có)
    const getToken = () => localStorage.getItem('token');

    // Hàm lấy danh sách orders
    const fetchOrders = async (page = 1, pageSize = 10, search?: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const params: any = {
                pageIndex: page,
                pageSize: pageSize,
                status: true // Luôn lấy orders đang active
            };

            // Thêm tìm kiếm theo payOsOrderCode nếu có
            if (search) {
                params.payOsOrderCode = search;
            }

            const response = await getShopOrders(params, token || undefined);

            setOrders(response.data || []);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.totalRecord || response.totalCount || 0
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders khi component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Nếu có orderId trên query, tự động mở modal chi tiết đơn hàng
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const orderId = params.get('orderId');
        if (orderId && orders.length > 0) {
            const found = orders.find(o => o.id === orderId);
            if (found) {
                setSelectedOrder(found);
                setIsModalVisible(true);
            }
        }
    }, [location.search, orders]);

    // Fetch lại khi thay đổi filter
    useEffect(() => {
        fetchOrders(1, pagination.pageSize, searchText);
    }, [searchText]);

    const handleView = (order: ShopOrder) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleMarkAsReceived = (order: ShopOrder) => {
        Modal.confirm({
            title: 'Xác nhận đã nhận hàng',
            content: `Bạn có chắc chắn khách hàng đã nhận đơn hàng ${order.payOsOrderCode}?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            okType: 'primary',
            onOk: async () => {
                try {
                    const token = getToken();
                    if (!token) {
                        message.error('Không tìm thấy token xác thực');
                        return;
                    }

                    // Gọi API để đánh dấu đã nhận hàng
                    await markOrderAsReceived(order.payOsOrderCode, token);
                    message.success(`Đã đánh dấu đơn hàng ${order.payOsOrderCode} là đã nhận hàng`);

                    // Refresh danh sách orders
                    fetchOrders(pagination.current, pagination.pageSize, searchText);
                } catch (error) {
                    console.error('Error marking order as received:', error);
                    message.error('Không thể cập nhật trạng thái đơn hàng');
                }
            }
        });
    };

    const handleDeleteOrder = (order: ShopOrder) => {
        Modal.confirm({
            title: 'Xác nhận xóa đơn hàng',
            content: `Bạn có chắc chắn muốn xóa đơn hàng ${order.payOsOrderCode}?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    const token = getToken();
                    if (!token) {
                        message.error('Không tìm thấy token xác thực');
                        return;
                    }

                    // Gọi API để xóa đơn hàng (hoặc hủy đơn hàng)
                    await cancelOrder(order.id, 'Xóa bởi shop', token);
                    message.success(`Đã xóa đơn hàng ${order.payOsOrderCode}`);

                    // Refresh danh sách orders
                    fetchOrders(pagination.current, pagination.pageSize, searchText);
                } catch (error) {
                    console.error('Error deleting order:', error);
                    message.error('Không thể xóa đơn hàng');
                }
            }
        });
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

    const getDeliveryStatusText = (isChecked: boolean) => {
        return isChecked ? 'Đã nhận hàng' : 'Chưa nhận hàng';
    };

    const getDeliveryStatusColor = (isChecked: boolean) => {
        return isChecked ? 'green' : 'orange';
    };

    const columns: ColumnsType<ShopOrder> = [
        {
            title: 'Mã PayOS',
            dataIndex: 'payOsOrderCode',
            key: 'payOsOrderCode',
            width: 180,
            render: (text: string) => <span className="order-id">{text}</span>,
        },
        {
            title: 'Thông tin khách hàng',
            key: 'customer',
            width: 200,
            render: (_, record: ShopOrder) => (
                <div>
                    <div className="customer-name">{record.userName}</div>
                    <div className="customer-email" style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
                    <div className="customer-phone" style={{ fontSize: '12px', color: '#666' }}>{record.userPhoneNumber}</div>
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 120,
            render: (amount: number) => `${amount.toLocaleString()} ₫`,
            sorter: (a, b) => a.totalAmount - b.totalAmount,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) => new Date(date).toLocaleString('vi-VN'),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            filters: [
                { text: 'Chờ xử lý', value: 'Pending' },
                { text: 'Đã thanh toán', value: 'Paid' },
                { text: 'Đã hủy', value: 'Cancelled' },
            ],
            onFilter: (value: any, record: ShopOrder) => record.status === value,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'isChecked',
            key: 'isChecked',
            width: 130,
            filters: [
                { text: 'Đã nhận hàng', value: true },
                { text: 'Chưa nhận hàng', value: false },
            ],
            onFilter: (value: any, record: ShopOrder) => record.isChecked === value,
            render: (isChecked: boolean) => (
                <Tag color={getDeliveryStatusColor(isChecked)}>
                    {getDeliveryStatusText(isChecked)}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_, record: ShopOrder) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    {record.status === 'Paid' && !record.isChecked && (
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
                        onClick={() => handleDeleteOrder(record)}
                        disabled={record.isChecked}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    // Filter chỉ cho search, table sẽ tự filter các trạng thái
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.payOsOrderCode.toLowerCase().includes(searchText.toLowerCase()) ||
            order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
            order.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
            order.userPhoneNumber.includes(searchText);
        return matchesSearch;
    }); return (
        <div className="orders-page">
            <div className="page-header">
                <h1>Quản lý đơn hàng</h1>
                <div className="header-actions">
                    <Search
                        placeholder="Tìm kiếm mã PayOS"
                        allowClear
                        style={{ width: 400 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        prefix={<SearchOutlined />}
                    />
                </div>
            </div>

            <Card className="orders-table">
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn hàng`,
                        onChange: (page, pageSize) => {
                            fetchOrders(page, pageSize, searchText);
                        }
                    }}
                    locale={{
                        emptyText: 'Không có đơn hàng nào'
                    }}
                />
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
                            <Descriptions.Item label="Ngày đặt">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
                            <Descriptions.Item label="ID người dùng">{selectedOrder.userId}</Descriptions.Item>
                            <Descriptions.Item label="Voucher">{selectedOrder.voucherCode || 'Không có'}</Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền gốc">{selectedOrder.totalAmount.toLocaleString()} ₫</Descriptions.Item>
                            <Descriptions.Item label="Giảm giá">{selectedOrder.discountAmount.toLocaleString()} ₫</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái thanh toán">
                                <Tag color={getStatusColor(selectedOrder.status)}>
                                    {getStatusText(selectedOrder.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái giao hàng">
                                <Tag color={getDeliveryStatusColor(selectedOrder.isChecked)}>
                                    {getDeliveryStatusText(selectedOrder.isChecked)}
                                </Tag>
                            </Descriptions.Item>
                            {selectedOrder.checkedAt && (
                                <Descriptions.Item label="Thời gian nhận hàng" span={2}>
                                    {new Date(selectedOrder.checkedAt).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <div className="order-items">
                            <h4>Sản phẩm đã đặt</h4>
                            <Table
                                size="small"
                                dataSource={selectedOrder.orderDetails.map((item, index) => ({
                                    key: index,
                                    ...item,
                                    total: item.quantity * item.unitPrice
                                }))}
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
                                            <strong>{selectedOrder.totalAmount.toLocaleString()} ₫</strong>
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

export default SpecialityShopOrders;
