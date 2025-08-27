import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Pagination, Select, Button, Typography, Divider } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ShopCard from '@/components/shop/ShopCard';
import { userService } from '@/services/userService';
import { Shop, ShopStatus } from '@/types/shop';
import './ShopList.scss';
import SearchBarCommon from '@/components/common/SearchBarCommon';

const { Option } = Select;
const { Title } = Typography;

// Mock data for demo - replace with API call

const ShopList: React.FC = () => {
    // ...existing code...
    useEffect(() => {
        const fetchShops = async () => {
            try {
                // Gọi API lấy danh sách shop
                const response = await userService.getShopList(1, 100);
                const shops: Shop[] = (response.data || []).map((item: any) => ({
                    id: item.id,
                    name: item.shopName,
                    description: item.description,
                    address: item.location,
                    phone: item.phoneNumber,
                    email: item.email,
                    image: item.logoUrl || '/placeholder-shop.jpg',
                    rating: item.rating,
                    reviewCount: 0,
                    status: item.isShopActive ? ShopStatus.ACTIVE : ShopStatus.INACTIVE,
                    specialties: [],
                    openTime: item.openingHours,
                    closeTime: item.closingHours,
                    isVerified: true,
                    isOpen: item.isShopActive,
                    createdDate: item.createdAt,
                    location: undefined
                }));
                setAllShops(shops);
                setFilteredShops(shops);
            } catch (err) {
                setAllShops([]);
                setFilteredShops([]);
            }
        };
        fetchShops();
    }, []);
    const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
    const [allShops, setAllShops] = useState<Shop[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [ratingFilter, setRatingFilter] = useState<number>(0);
    const [showFilters, setShowFilters] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(6); // Giống Shop.tsx
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        filterShops();
    }, [searchTerm, statusFilter, ratingFilter]);


    const filterShops = () => {
        console.log('Filtering shops...', { searchTerm, statusFilter, ratingFilter });
        let filtered = allShops;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(shop =>
                shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.specialties?.some(specialty =>
                    specialty.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(shop => shop.status === statusFilter);
        }


        // Rating filter
        if (ratingFilter > 0) {
            filtered = filtered.filter(shop => (shop.rating ?? 0) >= ratingFilter);
        }

        console.log('Filtered result:', filtered);
        setFilteredShops(filtered);
        setCurrentPage(1);
    };

    const handleSearch = async (value: string) => {
        setSearchTerm(value);
        setLoading(true);
        try {
            const response = await userService.getShopList(1, 100, value);
            const shops: Shop[] = (response.data || []).map((item: any) => ({
                id: item.id,
                name: item.shopName,
                description: item.description,
                address: item.location,
                phone: item.phoneNumber,
                email: item.email,
                image: item.logoUrl || '/placeholder-shop.jpg',
                rating: item.rating,
                reviewCount: 0,
                status: item.isShopActive ? ShopStatus.ACTIVE : ShopStatus.PENDING,
                specialties: [],
                openTime: item.openingHours,
                closeTime: item.closingHours,
                isVerified: true,
                isOpen: item.isShopActive,
                createdDate: item.createdAt,
                location: undefined
            }));
            setAllShops(shops);
            setFilteredShops(shops);
        } catch (err) {
            setAllShops([]);
            setFilteredShops([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const handleRatingFilterChange = (value: number) => {
        setRatingFilter(value);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setRatingFilter(0);
    };

    // Paginate shops
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedShops = filteredShops.slice(startIndex, startIndex + pageSize);

    console.log('Render state:', { filteredShops: filteredShops.length, paginatedShops: paginatedShops.length, loading });

    return (
        <div className="shop-list-page">
            <div className="shop-page">
                <div className="container">
                    {/* Shop List Header */}
                    <div className="shop-header">
                        <Title level={2}>{t('shopList.title')}</Title>
                        <p>{t('shopList.subtitle')}</p>
                    </div>

                    {/* Search Bar */}
                    <SearchBarCommon
                        onSearch={handleSearch}
                        loading={loading}
                        placeholder={t('shopList.searchPlaceholder')}
                        className="shop-search-bar"
                        buttonText={t('common.search')}
                    />

                    {/* Loading State */}
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%' }}>
                            <Spin size="large" />
                            <p style={{ marginTop: '16px' }}>{t('shopList.loading')}</p>
                        </div>
                    )}

                    {/* Main Content Area */}
                    {!loading && (
                        <Row gutter={[24, 24]} className="main-content">
                            {/* Filter Sidebar */}
                            <Col xs={24} md={6} className="filter-sidebar">
                                <div className={`filters-container ${showFilters ? 'show' : 'hide'}`}>
                                    <div className="filter-header">
                                        <Title level={4}>
                                            <FilterOutlined /> {t('shopList.filters')}
                                        </Title>
                                        <Button
                                            type="text"
                                            onClick={toggleFilters}
                                            className="toggle-filters-btn"
                                        >
                                            {showFilters ? 'Ẩn' : 'Hiện'}
                                        </Button>
                                    </div>

                                    {showFilters && (
                                        <div className="filter-content">
                                            {/* Status Filter */}
                                            <div className="filter-section">
                                                <Title level={5}>{t('shopList.status')}</Title>
                                                <Select
                                                    value={statusFilter}
                                                    onChange={setStatusFilter}
                                                    style={{ width: '100%' }}
                                                >
                                                    <Option value="all">{t('shopList.allStatus')}</Option>
                                                    <Option value={ShopStatus.ACTIVE}>{t('shopList.active')}</Option>
                                                    <Option value={ShopStatus.INACTIVE}>{t('shopList.inactive')}</Option>
                                                </Select>
                                            </div>


                                            {/* Rating Filter */}
                                            <div className="filter-section">
                                                <Title level={5}>{t('shopList.minimumRating')}</Title>
                                                <Select
                                                    value={ratingFilter}
                                                    onChange={handleRatingFilterChange}
                                                    style={{ width: '100%' }}
                                                    placeholder="Chọn đánh giá tối thiểu"
                                                >
                                                    <Option value={0}>{t('shopList.allRating')}</Option>
                                                    <Option value={2}>{t('shopList.rating2')}</Option>
                                                    <Option value={3}>{t('shopList.rating3')}</Option>
                                                    <Option value={4}>{t('shopList.rating4')}</Option>
                                                    <Option value={4.5}>{t('shopList.rating45')}</Option>
                                                </Select>
                                            </div>

                                            <Divider />

                                            {/* Reset Filters */}
                                            <div className="filter-section">
                                                <Button
                                                    type="default"
                                                    icon={<ReloadOutlined />}
                                                    onClick={resetFilters}
                                                    block
                                                >
                                                    {t('shopList.resetFilters')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Col>

                            {/* Shops Section */}
                            <Col xs={24} md={18} className="shops-section">
                                {/* Shops Grid */}
                                {paginatedShops.length > 0 ? (
                                    <>
                                        <Row gutter={[16, 24]} className="shops-grid">
                                            {paginatedShops.map(shop => (
                                                <Col xs={24} sm={12} lg={8} key={shop.id}>
                                                    <ShopCard shop={shop} />
                                                </Col>
                                            ))}
                                        </Row>

                                        {/* Pagination giống Shop nhất */}
                                        <div className="pagination-container">
                                            <div className="pagination-controls" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 16 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                                    <span style={{ minWidth: 100, textAlign: 'right', fontWeight: 500, lineHeight: '32px' }}>{filteredShops.length} cửa hàng</span>
                                                </div>
                                                <Pagination
                                                    current={currentPage}
                                                    total={filteredShops.length}
                                                    pageSize={pageSize}
                                                    onChange={handlePageChange}
                                                    showSizeChanger={false}
                                                    showQuickJumper
                                                    showTotal={(total, range) =>
                                                        <span className="results-info-total">{`${range[0]}-${range[1]} của ${total} cửa hàng`}</span>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <Empty
                                            description={t('shopList.noShopsFound') || "Không tìm thấy cửa hàng nào"}
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    </div>
                                )}
                            </Col>
                        </Row>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopList;
