import { useState } from 'react';
import { Table, Card, Button, Input, Space, Tag, Modal, message, Select, Descriptions } from 'antd';
import { EyeOutlined, SearchOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './Orders.scss';

const { Search } = Input;
const { Option } = Select;

interface OrderItem {
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    key: string;
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    orderDate: string;
    notes?: string;
}

const SpecialityShopOrders = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Mock data
    const orders: Order[] = [
        {
            key: '1',
            id: 'ORD-001',
            customerName: 'Nguyễn Văn A',
            customerEmail: 'nguyenvana@email.com',
            customerPhone: '0901234567',
            customerAddress: '123 Đường ABC, Quận 1, TP.HCM',
            items: [
                { productName: 'Bánh tráng Tây Ninh', quantity: 2, price: 45000 },
                { productName: 'Nước mắm Phú Quốc', quantity: 1, price: 85000 }
            ],
            totalAmount: 175000,
            status: 'pending',
            orderDate: '2025-06-28 10:30',
            notes: 'Giao hàng buổi chiều'
        },
        {
            key: '2',
            id: 'ORD-002',
            customerName: 'Trần Thị B',
            customerEmail: 'tranthib@email.com',
            customerPhone: '0912345678',
            customerAddress: '456 Đường XYZ, Quận 2, TP.HCM',
            items: [
                { productName: 'Kẹo dừa Bến Tre', quantity: 3, price: 35000 }
            ],
            totalAmount: 105000,
            status: 'processing',
            orderDate: '2025-06-27 14:15'
        },
        {
            key: '3',
            id: 'ORD-003',
            customerName: 'Lê Văn C',
            customerEmail: 'levanc@email.com',
            customerPhone: '0923456789',
            customerAddress: '789 Đường DEF, Quận 3, TP.HCM',
            items: [
                { productName: 'Chà bông Hà Nội', quantity: 1, price: 120000 },
                { productName: 'Bánh phồng tôm', quantity: 2, price: 28000 }
            ],
            totalAmount: 176000,
            status: 'completed',
            orderDate: '2025-06-26 09:45'
        },
        {
            key: '4',
            id: 'ORD-004',
            customerName: 'Phạm Thị D',
            customerEmail: 'phamthid@email.com',
            customerPhone: '0934567890',
            customerAddress: '321 Đường GHI, Quận 4, TP.HCM',
            items: [
                { productName: 'Bánh tráng Tây Ninh', quantity: 1, price: 45000 }
            ],
            totalAmount: 45000,
            status: 'cancelled',
            orderDate: '2025-06-25 16:20',
            notes: 'Khách hàng hủy đơn'
        }
    ];

    const handleView = (order: Order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleUpdateStatus = (order: Order, newStatus: string) => {
        message.success(`Đã cập nhật trạng thái đơn hàng ${order.id} thành ${getStatusText(newStatus)}`);
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ xử lý';
            case 'processing': return 'Đang xử lý';
            case 'completed': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'processing': return 'blue';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    const columns: ColumnsType<Order> = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="order-id">{text}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text: string, record: Order) => (
                <div>
                    <div className="customer-name">{text}</div>
                    <div className="customer-phone">{record.customerPhone}</div>
                </div>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'orderDate',
            key: 'orderDate',
            sorter: (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
        },
        {
            title: 'Số lượng SP',
            key: 'itemCount',
            render: (_, record: Order) => record.items.length,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) => `${amount.toLocaleString()} ₫`,
            sorter: (a, b) => a.totalAmount - b.totalAmount,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record: Order) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    {record.status === 'pending' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => handleUpdateStatus(record, 'processing')}
                        >
                            Xác nhận
                        </Button>
                    )}
                    {record.status === 'processing' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => handleUpdateStatus(record, 'completed')}
                        >
                            Hoàn thành
                        </Button>
                    )}
                    {(record.status === 'pending' || record.status === 'processing') && (
                        <Button
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleUpdateStatus(record, 'cancelled')}
                        >
                            Hủy
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchText.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
            order.customerPhone.includes(searchText);
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="orders-page">
            <div className="page-header">
                <h1>Quản lý đơn hàng</h1>
                <div className="header-actions">
                    <Space>
                        <Search
                            placeholder="Tìm kiếm đơn hàng..."
                            allowClear
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            prefix={<SearchOutlined />}
                        />
                        <Select
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            style={{ width: 150 }}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="pending">Chờ xử lý</Option>
                            <Option value="processing">Đang xử lý</Option>
                            <Option value="completed">Hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Space>
                </div>
            </div>

            <Card className="orders-table">
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    pagination={{
                        current: 1,
                        pageSize: 10,
                        total: filteredOrders.length,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn hàng`,
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
                            <Descriptions.Item label="Mã đơn hàng">{selectedOrder.id}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{selectedOrder.orderDate}</Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedOrder.customerEmail}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{selectedOrder.customerPhone}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getStatusColor(selectedOrder.status)}>
                                    {getStatusText(selectedOrder.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                                {selectedOrder.customerAddress}
                            </Descriptions.Item>
                            {selectedOrder.notes && (
                                <Descriptions.Item label="Ghi chú" span={2}>
                                    {selectedOrder.notes}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <div className="order-items">
                            <h4>Sản phẩm đã đặt</h4>
                            <Table
                                size="small"
                                dataSource={selectedOrder.items.map((item, index) => ({
                                    key: index,
                                    ...item,
                                    total: item.quantity * item.price
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
                                        dataIndex: 'price',
                                        key: 'price',
                                        render: (price: number) => `${price.toLocaleString()} ₫`,
                                    },
                                    {
                                        title: 'Thành tiền',
                                        dataIndex: 'total',
                                        key: 'total',
                                        render: (total: number) => `${total.toLocaleString()} ₫`,
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
