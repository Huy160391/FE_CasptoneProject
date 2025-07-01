import { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Modal, message, Select, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { publicService } from '@/services/publicService';
import type { Product } from '@/types';
import './Products.scss';

const { Search } = Input;
const { Option } = Select;

const SpecialityShopProducts = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await publicService.getPublicProducts({
                pageIndex: pagination.current,
                pageSize: pagination.pageSize,
                textSearch: searchText || undefined,
                status: selectedCategory === 'all' ? undefined : selectedCategory === 'active'
            });

            setProducts(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.totalRecords
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [pagination.current, pagination.pageSize]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.current === 1) {
                fetchProducts();
            } else {
                setPagination(prev => ({ ...prev, current: 1 }));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText, selectedCategory]);

    const handleTableChange = (newPagination: any) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    const handleView = (product: Product) => {
        setSelectedProduct(product);
        setIsModalVisible(true);
    };

    const handleEdit = (product: Product) => {
        message.info(`Sửa sản phẩm: ${product.name}`);
    };

    const handleDelete = (product: Product) => {
        message.success(`Đã xóa sản phẩm: ${product.name}`);
    };

    const handleAdd = () => {
        message.info('Thêm sản phẩm mới');
    };

    const columns: ColumnsType<Product> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image: string) => (
                <img src={image} alt="Product" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Product) => (
                <div>
                    <div className="product-name">{text}</div>
                    <div className="product-id">ID: {record.id}</div>
                </div>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString()} ₫`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'quantityInStock',
            key: 'quantityInStock',
            render: (stock: number) => (
                <span className={stock === 0 ? 'out-of-stock' : stock < 20 ? 'low-stock' : 'in-stock'}>
                    {stock}
                </span>
            ),
            sorter: (a, b) => a.quantityInStock - b.quantityInStock,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record: Product) => {
                const isActive = record.quantityInStock > 0;
                return (
                    <Tag color={isActive ? 'green' : 'red'}>
                        {isActive ? 'Có sẵn' : 'Hết hàng'}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record: Product) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => handleDelete(record)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="products-page">
            <div className="page-header">
                <h1>Quản lý sản phẩm</h1>
                <div className="header-actions">
                    <Space>
                        <Search
                            placeholder="Tìm kiếm sản phẩm..."
                            allowClear
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            prefix={<SearchOutlined />}
                        />
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            style={{ width: 150 }}
                        >
                            <Option value="all">Tất cả danh mục</Option>
                            <Option value="Bánh kẹo">Bánh kẹo</Option>
                            <Option value="Gia vị">Gia vị</Option>
                            <Option value="Thực phẩm">Thực phẩm</Option>
                        </Select>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm sản phẩm
                        </Button>
                    </Space>
                </div>
            </div>

            <Card className="products-table">
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey="id"
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} sản phẩm`,
                        }}
                        onChange={handleTableChange}
                        locale={{
                            emptyText: 'Không có sản phẩm nào'
                        }}
                    />
                </Spin>
            </Card>

            <Modal
                title="Chi tiết sản phẩm"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedProduct && (
                    <div className="product-detail">
                        <div className="product-image">
                            {selectedProduct.imageUrl && selectedProduct.imageUrl.length > 0 ? (
                                <img src={selectedProduct.imageUrl[0]} alt={selectedProduct.name} />
                            ) : (
                                <div className="no-image">Không có hình ảnh</div>
                            )}
                        </div>
                        <div className="product-info">
                            <h3>{selectedProduct.name}</h3>
                            <p><strong>ID:</strong> {selectedProduct.id}</p>
                            <p><strong>Shop ID:</strong> {selectedProduct.shopId}</p>
                            <p><strong>Danh mục:</strong> {selectedProduct.category}</p>
                            <p><strong>Giá:</strong> {selectedProduct.price.toLocaleString()} ₫</p>
                            <p><strong>Tồn kho:</strong> {selectedProduct.quantityInStock}</p>
                            <p><strong>Trạng thái:</strong>
                                <Tag color={selectedProduct.quantityInStock > 0 ? 'green' : 'red'}>
                                    {selectedProduct.quantityInStock > 0 ? 'Có sẵn' : 'Hết hàng'}
                                </Tag>
                            </p>
                            <p><strong>Mô tả:</strong> {selectedProduct.description}</p>
                            <p><strong>Ngày tạo:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p><strong>Cập nhật:</strong> {new Date(selectedProduct.updatedAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SpecialityShopProducts;
