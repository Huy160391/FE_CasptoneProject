import { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, message, Select, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { publicService } from '@/services/publicService';
import type { Product } from '@/types';
import { CATEGORY_VI_LABELS, getCategoryViLabel } from '@/utils/categoryViLabels'
import CustomProductModal from './CustomProductModal';
import ViewProductModal from './ViewProductModal';
import { createProduct, updateProduct, deleteProduct } from '@/services/specialtyShopService';
import { useAuthStore } from '@/store/useAuthStore';
import './Products.scss';

const { Search } = Input;
const { Option } = Select;

const SpecialityShopProducts = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isProductModalVisible, setIsProductModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuthStore();
    const accessToken = token || undefined; // Make sure it's a string or undefined, not null
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Chỉ gửi các params API hỗ trợ
            const params: any = {
                pageIndex: pagination.current,
                pageSize: pagination.pageSize,
                textSearch: searchText || undefined,
                status: undefined // hoặc true/false nếu muốn lọc trạng thái
            };
            const response = await publicService.getPublicProducts(params);

            const transformedProducts = response.data.map(product => ({
                ...product,
                category: product.category // Đã là string, không cần kiểm tra kiểu số nữa
            }));

            // Filter FE theo category nếu có chọn
            const filteredProducts = selectedCategory === 'all'
                ? transformedProducts
                : transformedProducts.filter(p => p.category && p.category.toLowerCase() === selectedCategory);

            setProducts(filteredProducts);
            setPagination(prev => ({
                ...prev,
                total: response.totalRecord
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
        setSelectedProduct(product);
        setIsProductModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsProductModalVisible(true);
    };

    const handleDelete = async (product: Product) => {
        try {
            setLoading(true);
            await deleteProduct(product.id, accessToken);
            message.success(`Đã xóa sản phẩm: ${product.name}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            message.error('Không thể xóa sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (values: FormData | any) => {
        try {
            setLoading(true);
            if (selectedProduct) {
                // Edit mode
                await updateProduct(selectedProduct.id, values, accessToken);
                message.success('Cập nhật sản phẩm thành công!');
            } else {
                // Add mode
                await createProduct(values, accessToken);
                message.success('Thêm sản phẩm thành công!');
            }
            fetchProducts();
            return Promise.resolve();
        } catch (error: any) {
            console.error('Error saving product:', error);

            // Hiển thị thông báo lỗi cụ thể từ API nếu có
            if (error.response?.data?.message) {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else {
                message.error('Lỗi khi lưu sản phẩm');
            }

            return Promise.reject(error);
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<Product> = [

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
            render: (category: string) => <Tag color="blue">{getCategoryViLabel(category.toLowerCase())}</Tag>,
        },
        {
            title: 'Giá bán hiện tại',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `${price.toLocaleString()} ₫`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Giá gốc',
            key: 'originalPrice',
            render: (_: any, record: Product) => {
                if (record.isSale && record.salePercent) {
                    const original = Math.round(record.price / (1 - record.salePercent / 100));
                    return <span style={{ textDecoration: 'line-through', color: '#888' }}>{original.toLocaleString()} ₫</span>;
                }
                return '';
            },
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
                            {Object.keys(CATEGORY_VI_LABELS).map(key => (
                                <Option key={key} value={key}>{CATEGORY_VI_LABELS[key]}</Option>
                            ))}
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

            {/* Modal chi tiết sản phẩm */}
            <ViewProductModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                product={selectedProduct}
            />

            {/* Modal thêm/sửa sản phẩm */}
            <CustomProductModal
                visible={isProductModalVisible}
                onCancel={() => setIsProductModalVisible(false)}
                onSubmit={handleProductSubmit}
                initialValues={selectedProduct}
                title={selectedProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            />
        </div>
    );
};

export default SpecialityShopProducts;
