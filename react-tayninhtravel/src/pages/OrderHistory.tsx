import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Typography,
    Spin,
    Alert,
    Empty,
    Input,
    Select,
    Row,
    Col,
    Descriptions,
    Modal,
    Switch,
    Tooltip
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    CalendarOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    EyeOutlined,
    ReloadOutlined,
    ShopOutlined,
    StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// ...existing code...
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export interface OrderDetail {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
    shopId: string;
    shopName?: string;
    shopEmail?: string;
    shopType?: string;
    rating?: number;
}

export interface ApiOrder {
    id: string;
    userId: string;
    totalAmount: number;
    discountAmount: number;
    totalAfterDiscount: number;
    status: string; // "Paid", "Pending", "Cancel"
    voucherCode?: string;
    payOsOrderCode: string;
    isChecked: boolean;
    checkedAt?: string;
    checkedByShopId?: string;
    createdAt: string;
    orderDetails: OrderDetail[];
}

export interface ApiResponse {
    statusCode: number;
    message?: string;
    success: boolean;
    data: ApiOrder[];
    totalPages: number;
    totalRecord: number;
    totalCount?: number;
    pageIndex?: number;
    pageSize?: number;
}

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
    status: 'unpaid' | 'paid' | 'cancelled' | 'delivered' | 'not-delivered';
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

// Helper function to map API status to component status
const mapApiStatusToComponentStatus = (apiStatus: string, isChecked: boolean): Order['status'] => {
    switch (apiStatus.toLowerCase()) {
        case 'pending': return 'unpaid';    // Pending -> Chưa thanh toán
        case 'paid': return isChecked ? 'delivered' : 'paid';  // Paid - nếu đã check thì delivered, chưa check thì paid
        case 'cancel':
        case 'cancelled': return 'cancelled';  // Cancel/Cancelled -> Bị hủy
        default: return 'not-delivered';
    }
};

// Helper function to transform API order to component order
const transformApiOrderToOrder = (apiOrder: ApiOrder): Order => {
    const items: OrderItem[] = apiOrder.orderDetails.map(detail => ({
        id: detail.productId,
        productName: detail.productName,
        productImage: detail.imageUrl || undefined,
        quantity: detail.quantity,
        price: detail.unitPrice,
        totalPrice: detail.unitPrice * detail.quantity
    }));

    const shopName = apiOrder.orderDetails.length > 0 && apiOrder.orderDetails[0].shopName
        ? apiOrder.orderDetails[0].shopName
        : 'Cửa hàng đặc sản';

    return {
        id: apiOrder.id,
        orderNumber: apiOrder.payOsOrderCode,
        shopName: shopName,
        items,
        totalAmount: apiOrder.totalAfterDiscount,
        status: mapApiStatusToComponentStatus(apiOrder.status, apiOrder.isChecked),
        paymentStatus: apiOrder.status.toLowerCase() === 'paid' ? 'paid' :
            (apiOrder.status.toLowerCase() === 'cancel' || apiOrder.status.toLowerCase() === 'cancelled') ? 'refunded' : 'unpaid',
        paymentMethod: 'PayOS',
        orderDate: apiOrder.createdAt,
        deliveryDate: apiOrder.checkedAt || undefined,
        shippingAddress: '(Chưa có thông tin địa chỉ)', // Default address, you might want to fetch this from user profile
        notes: apiOrder.voucherCode ? `Mã voucher: ${apiOrder.voucherCode}` : undefined
    };
};

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
    const navigate = useNavigate();

    // Chuyển hướng sang trang chi tiết sản phẩm khi nhấn nút đánh giá
    const handleReview = (order: Order) => {
        if (order.items && order.items.length > 0) {
            const productId = order.items[0].id;
            navigate(`/shop/product/${productId}`);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [includeInactive]);

    // Load orders with filtering
    const loadOrders = async (page = 1, keyword = '', status?: Order['status'], includeInactiveOrders = includeInactive) => {
        try {
            setLoading(true);
            setError(null);

            // Convert component status to API parameters
            let orderStatus: string | undefined;
            let isChecked: boolean | undefined;

            if (status) {
                if (status === 'not-delivered') {
                    orderStatus = 'Pending';  // Chưa nhận hàng = chưa thanh toán
                } else if (status === 'paid') {
                    orderStatus = 'Paid';
                    isChecked = false; // Đã thanh toán nhưng chưa nhận hàng
                } else if (status === 'delivered') {
                    orderStatus = 'Paid';
                    isChecked = true; // Đã thanh toán và đã nhận hàng
                } else if (status === 'cancelled') {
                    orderStatus = 'Cancelled'; // Sửa từ 'Cancelled' thay vì 'Cancel'
                }
            }

            // Call the actual API - cần update userService để nhận orderStatus và isChecked
            const response: ApiResponse = await userService.getUserOrders(
                page,
                pageSize,
                keyword || undefined,
                orderStatus,
                isChecked
            );

            if (response.success || response.statusCode === 200) {
                // Transform API orders to component orders
                let transformedOrders = response.data.map(transformApiOrderToOrder);

                // Apply client-side filtering for inactive orders if needed
                if (!includeInactiveOrders) {
                    transformedOrders = transformedOrders.filter(order => order.status !== 'cancelled');
                }

                setOrders(transformedOrders);
                setTotalCount(response.totalRecord || transformedOrders.length);
                setCurrentPage(page);
            } else {
                throw new Error(response.message || 'Không thể tải danh sách đơn hàng');
            }
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
            unpaid: 'gray',
            paid: 'blue',
            'not-delivered': 'orange',
            delivered: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status: Order['status']) => {
        const texts = {
            unpaid: t('orderHistory.statuses.unpaid'),
            paid: t('orderHistory.statuses.paid'),
            'not-delivered': t('orderHistory.statuses.notDelivered'),
            delivered: t('orderHistory.statuses.delivered'),
            cancelled: t('orderHistory.statuses.cancelled')
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

    // Define table columns
    const columns: ColumnsType<Order> = [
        {
            title: t('orderHistory.orderNumber'),
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 150,
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: t('orderHistory.shopName'),
            dataIndex: 'shopName',
            key: 'shopName',
            width: 200,
            render: (text: string) => (
                <Text>
                    <ShopOutlined /> {text}
                </Text>
            ),
        },
        {
            title: t('orderHistory.status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: Order['status']) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: t('orderHistory.deliveryStatus'),
            key: 'deliveryStatus',
            width: 120,
            render: (_, order: Order) => {
                const isDelivered = order.status === 'delivered';
                return (
                    <Tag color={isDelivered ? 'green' : 'orange'}>
                        {isDelivered ? t('orderHistory.delivered') : t('orderHistory.notDelivered')}
                    </Tag>
                );
            },
        },
        {
            title: t('orderHistory.itemCount'),
            dataIndex: 'items',
            key: 'itemCount',
            width: 100,
            render: (items: OrderItem[]) => (
                <Text>
                    <ShoppingCartOutlined /> {items.length} {t('orderHistory.itemCountText')}
                </Text>
            ),
        },
        {
            title: t('orderHistory.totalAmount'),
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 150,
            render: (amount: number) => (
                <Text strong style={{ color: '#f5222d' }}>
                    <DollarOutlined /> {formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: t('orderHistory.orderDate'),
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 160,
            render: (date: string) => (
                <Text>
                    <CalendarOutlined /> {formatDate(date)}
                </Text>
            ),
        },
        {
            title: t('orderHistory.paymentMethod'),
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 120,
        },
        {
            title: t('orderHistory.actions'),
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, order: Order) => (
                <>
                    <Tooltip title={t('orderHistory.viewDetail')}>
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => showOrderDetail(order)}
                            style={{ marginRight: 8 }}
                        />
                    </Tooltip>
                    <Tooltip title={t('orderHistory.review')}>
                        <Button
                            type="primary"
                            icon={<StarOutlined style={{ fontSize: 16 }} />}
                            disabled={order.status !== 'delivered'}
                            onClick={() => handleReview(order)}
                            style={{ padding: 0, width: 32, height: 32 }}
                        />
                    </Tooltip>
                </>
            ),
        },
    ];

    // If using legacy data prop
    if (data) {
        return (
            <Table
                dataSource={data}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
            />
        );
    }

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={4}>
                        {t('orderHistory.title')}
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
                                <Option value="paid">{t('orderHistory.statuses.paid')}</Option>
                                <Option value="not-delivered">{t('orderHistory.statuses.notDelivered')}</Option>
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
                ) : (
                    <Table
                        dataSource={orders}
                        columns={columns}
                        rowKey="id"
                        pagination={{
                            current: currentPage,
                            total: totalCount,
                            pageSize: pageSize,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total: number, range: [number, number]) =>
                                `${range[0]}-${range[1]} ${t('orderHistory.paginationText')} ${total} ${t('orderHistory.paginationTotal')}`,
                            onChange: handlePageChange,
                            onShowSizeChange: handlePageChange,
                        }}
                        scroll={{ x: 1400 }}
                        size="middle"
                        locale={{
                            emptyText: orders.length === 0 ? (
                                <Empty
                                    description={t('orderHistory.noOrders')}
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : undefined
                        }}
                    />
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
                                        <Tooltip title={t('orderHistory.review')}>
                                            <Button
                                                type="text"
                                                icon={<StarOutlined style={{ fontSize: 16 }} />}
                                                style={{ padding: 0, marginLeft: 8, width: 24, height: 24 }}
                                                disabled
                                            />
                                        </Tooltip>
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
