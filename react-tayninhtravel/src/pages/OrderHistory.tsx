import React, { useState, useEffect } from 'react';
import {
    Card,
    List,
    Tag,
    Button,
    Space,
    Typography,
    Spin,
    Alert,
    Empty,
    Pagination,
    Input,
    Select,
    Row,
    Col,
    Descriptions,
    Modal,
    Switch
} from 'antd';
import {
    CalendarOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    EyeOutlined,
    ReloadOutlined,
    ShopOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export interface OrderItem {
    id: string;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    shopName: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    paymentMethod: string;
    orderDate: string;
    deliveryDate?: string;
    shippingAddress: string;
    notes?: string;
}

interface OrderHistoryProps {
    data?: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ data }) => {
    const { t } = useTranslation();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<Order['status'] | undefined>(undefined);
    const [includeInactive, setIncludeInactive] = useState(true);

    // Modal
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        loadOrders();
    }, [includeInactive]);

    // Load orders with filtering
    const loadOrders = async (page = 1, keyword = '', status?: Order['status'], includeInactiveOrders = includeInactive) => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Replace with actual API call
            // const response = await orderService.getUserOrders({
            //     pageIndex: page - 1,
            //     pageSize,
            //     searchKeyword: keyword || undefined,
            //     status,
            //     includeInactive: includeInactiveOrders
            // });

            // Mock data for now
            const mockOrders: Order[] = [
                {
                    id: '1',
                    orderNumber: 'ORD-2024-001',
                    shopName: 'Đặc sản Tây Ninh ABC',
                    items: [
                        {
                            id: '1',
                            productName: 'Bánh tráng nướng',
                            quantity: 2,
                            price: 50000,
                            totalPrice: 100000
                        },
                        {
                            id: '2',
                            productName: 'Mắm ruốc Tây Ninh',
                            quantity: 1,
                            price: 120000,
                            totalPrice: 120000
                        }
                    ],
                    totalAmount: 220000,
                    status: 'delivered',
                    paymentStatus: 'paid',
                    paymentMethod: 'VNPay',
                    orderDate: '2024-03-15T10:30:00Z',
                    deliveryDate: '2024-03-18T14:20:00Z',
                    shippingAddress: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
                    notes: 'Giao hàng giờ hành chính'
                },
                {
                    id: '2',
                    orderNumber: 'ORD-2024-002',
                    shopName: 'Cửa hàng đặc sản XYZ',
                    items: [
                        {
                            id: '3',
                            productName: 'Nem chua Tây Ninh',
                            quantity: 3,
                            price: 80000,
                            totalPrice: 240000
                        }
                    ],
                    totalAmount: 240000,
                    status: 'shipping',
                    paymentStatus: 'paid',
                    paymentMethod: 'MoMo',
                    orderDate: '2024-03-20T09:15:00Z',
                    shippingAddress: '456 Lê Văn Sỹ, Quận 3, TP.HCM'
                }
            ];

            // Filter mock data based on parameters
            let filteredOrders = data || mockOrders;

            if (keyword) {
                filteredOrders = filteredOrders.filter(order =>
                    order.orderNumber.toLowerCase().includes(keyword.toLowerCase()) ||
                    order.shopName.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            if (status) {
                filteredOrders = filteredOrders.filter(order => order.status === status);
            }

            if (!includeInactiveOrders) {
                filteredOrders = filteredOrders.filter(order => order.status !== 'cancelled');
            }

            setOrders(filteredOrders);
            setTotalCount(filteredOrders.length);
            setCurrentPage(page);
        } catch (error: any) {
            console.error('Error loading orders:', error);
            setError(error.message || t('orderHistory.loadingError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchKeyword(value);
        setCurrentPage(1);
        loadOrders(1, value, statusFilter, includeInactive);
    };

    const handleStatusFilter = (status: Order['status'] | undefined) => {
        setStatusFilter(status);
        setCurrentPage(1);
        loadOrders(1, searchKeyword, status, includeInactive);
    };

    const handlePageChange = (page: number, size?: number) => {
        if (size && size !== pageSize) {
            setPageSize(size);
        }
        loadOrders(page, searchKeyword, statusFilter, includeInactive);
    };

    const handleIncludeInactiveChange = (checked: boolean) => {
        setIncludeInactive(checked);
        setCurrentPage(1);
        loadOrders(1, searchKeyword, statusFilter, checked);
    };

    const handleRefresh = () => {
        loadOrders(currentPage, searchKeyword, statusFilter, includeInactive);
    };

    const getStatusColor = (status: Order['status']) => {
        const colors = {
            pending: 'orange',
            confirmed: 'blue',
            processing: 'cyan',
            shipping: 'purple',
            delivered: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: Order['status']) => {
        const texts = {
            pending: t('orderHistory.statuses.pending'),
            confirmed: t('orderHistory.statuses.confirmed'),
            processing: t('orderHistory.statuses.processing'),
            shipping: t('orderHistory.statuses.shipping'),
            delivered: t('orderHistory.statuses.delivered'),
            cancelled: t('orderHistory.statuses.cancelled')
        };
        return texts[status] || status;
    };

    const getPaymentStatusColor = (status: Order['paymentStatus']) => {
        const colors = {
            unpaid: 'red',
            paid: 'green',
            refunded: 'orange'
        };
        return colors[status] || 'default';
    };

    const getPaymentStatusText = (status: Order['paymentStatus']) => {
        const texts = {
            unpaid: t('orderHistory.paymentStatuses.unpaid'),
            paid: t('orderHistory.paymentStatuses.paid'),
            refunded: t('orderHistory.paymentStatuses.refunded')
        };
        return texts[status] || status;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const showOrderDetail = (order: Order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    // If using legacy data prop
    if (data) {
        return (
            <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={item.orderNumber}
                            description={
                                <>
                                    <div>{t('orderHistory.shopName')}: {item.shopName}</div>
                                    <div>{t('orderHistory.totalAmount')}: {formatCurrency(item.totalAmount)}</div>
                                    <Tag color={getStatusColor(item.status)}>
                                        {getStatusText(item.status)}
                                    </Tag>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    }

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={4}>
                        <ShoppingCartOutlined /> {t('orderHistory.title')}
                    </Title>
                    <Text type="secondary">
                        {t('orderHistory.description')}
                    </Text>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder={t('orderHistory.searchPlaceholder')}
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder={t('orderHistory.filterByStatus')}
                                allowClear
                                style={{ width: '100%' }}
                                onChange={handleStatusFilter}
                                value={statusFilter}
                            >
                                <Option value="pending">{t('orderHistory.statuses.pending')}</Option>
                                <Option value="confirmed">{t('orderHistory.statuses.confirmed')}</Option>
                                <Option value="processing">{t('orderHistory.statuses.processing')}</Option>
                                <Option value="shipping">{t('orderHistory.statuses.shipping')}</Option>
                                <Option value="delivered">{t('orderHistory.statuses.delivered')}</Option>
                                <Option value="cancelled">{t('orderHistory.statuses.cancelled')}</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={10} style={{ textAlign: 'right' }}>
                            <Space wrap>
                                <Space>
                                    <Text>{t('orderHistory.showCancelled')}:</Text>
                                    <Switch
                                        checked={includeInactive}
                                        onChange={handleIncludeInactiveChange}
                                        size="small"
                                    />
                                </Space>
                                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                                    {t('orderHistory.refresh')}
                                </Button>
                                <Text type="secondary">
                                    {t('orderHistory.total')}: {totalCount} {t('orderHistory.paginationTotal')}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert
                        message={t('orderHistory.errorOccurred')}
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" onClick={handleRefresh}>
                                {t('orderHistory.tryAgain')}
                            </Button>
                        }
                    />
                ) : orders.length === 0 ? (
                    <Empty
                        description={t('orderHistory.noOrders')}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <>
                        <List
                            itemLayout="vertical"
                            dataSource={orders}
                            renderItem={(order) => (
                                <List.Item
                                    key={order.id}
                                    actions={[
                                        <Button
                                            key="view"
                                            type="link"
                                            icon={<EyeOutlined />}
                                            onClick={() => showOrderDetail(order)}
                                        >
                                            {t('orderHistory.viewDetail')}
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Text strong>{order.orderNumber}</Text>
                                                <Tag color={getStatusColor(order.status)}>
                                                    {getStatusText(order.status)}
                                                </Tag>
                                                <Tag color={getPaymentStatusColor(order.paymentStatus)}>
                                                    {getPaymentStatusText(order.paymentStatus)}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size="small">
                                                <Text>
                                                    <ShopOutlined /> {t('orderHistory.shopName')}: {order.shopName}
                                                </Text>
                                                <Text>
                                                    <CalendarOutlined /> {t('orderHistory.orderDate')}: {formatDate(order.orderDate)}
                                                </Text>
                                                <Text>
                                                    <ShoppingCartOutlined /> {t('orderHistory.itemCount')}: {order.items.length} {t('orderHistory.itemCountText')}
                                                </Text>
                                                <Text>
                                                    <DollarOutlined /> {t('orderHistory.totalAmount')}: <Text strong style={{ color: '#f5222d' }}>
                                                        {formatCurrency(order.totalAmount)}
                                                    </Text>
                                                </Text>
                                                {order.deliveryDate && (
                                                    <Text type="secondary">
                                                        {t('orderHistory.deliveryDate')}: {formatDate(order.deliveryDate)}
                                                    </Text>
                                                )}
                                                <Text type="secondary">
                                                    {t('orderHistory.paymentMethod')}: {order.paymentMethod}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Pagination
                                current={currentPage}
                                total={totalCount}
                                pageSize={pageSize}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} ${t('orderHistory.paginationText')} ${total} ${t('orderHistory.paginationTotal')}`
                                }
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </Card>

            {/* Order Detail Modal */}
            <Modal
                title={`${t('orderHistory.detailModalTitle')} ${selectedOrder?.orderNumber}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        {t('orderHistory.close')}
                    </Button>
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <Descriptions title={t('orderHistory.orderInformation')} column={1} bordered>
                            <Descriptions.Item label={t('orderHistory.orderNumber')}>
                                <Text strong>{selectedOrder.orderNumber}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label={t('orderHistory.shopName')}>
                                {selectedOrder.shopName}
                            </Descriptions.Item>

                            <Descriptions.Item label={t('orderHistory.status')}>
                                <Tag color={getStatusColor(selectedOrder.status)}>
                                    {getStatusText(selectedOrder.status)}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label={t('orderHistory.payment')}>
                                <Tag color={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                                    {getPaymentStatusText(selectedOrder.paymentStatus)}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label={t('orderHistory.paymentMethod')}>
                                {selectedOrder.paymentMethod}
                            </Descriptions.Item>

                            <Descriptions.Item label={t('orderHistory.orderDate')}>
                                {formatDate(selectedOrder.orderDate)}
                            </Descriptions.Item>

                            {selectedOrder.deliveryDate && (
                                <Descriptions.Item label={t('orderHistory.deliveryDate')}>
                                    {formatDate(selectedOrder.deliveryDate)}
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label={t('orderHistory.shippingAddress')}>
                                {selectedOrder.shippingAddress}
                            </Descriptions.Item>

                            {selectedOrder.notes && (
                                <Descriptions.Item label={t('orderHistory.notes')}>
                                    {selectedOrder.notes}
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label={t('orderHistory.totalAmount')}>
                                <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                                    {formatCurrency(selectedOrder.totalAmount)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions title={t('orderHistory.productOrdered')} column={1} bordered style={{ marginTop: 16 }}>
                            {selectedOrder.items.map((item, index) => (
                                <Descriptions.Item key={item.id} label={`${t('orderHistory.productName')} ${index + 1}`}>
                                    <div>
                                        <Text strong>{item.productName}</Text>
                                        <br />
                                        <Text>{t('orderHistory.quantity')}: {item.quantity}</Text>
                                        <br />
                                        <Text>{t('orderHistory.unitPrice')}: {formatCurrency(item.price)}</Text>
                                        <br />
                                        <Text strong>{t('orderHistory.itemTotal')}: {formatCurrency(item.totalPrice)}</Text>
                                    </div>
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistory;
