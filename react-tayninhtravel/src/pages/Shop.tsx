import { useState, useEffect } from 'react'
import { Row, Col, Pagination, Empty, Button, Slider, Checkbox, Divider, Typography, Spin } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Product } from '@/types'
import { publicService } from '@/services/publicService'
import SearchBarCommon from '@/components/common/SearchBarCommon'
import ProductCard from '@/components/shop/ProductCard'
import { getCategoryViLabel } from '@/utils/categoryViLabels'
import './Shop.scss'

const { Title } = Typography
const CheckboxGroup = Checkbox.Group

// Extended Product interface with UI specific fields
interface ShopProduct extends Product {
  rating: number;
  reviews: number;
  soldCount: number;
  isActive?: boolean;
}

const Shop = () => {
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
  const [showFilters, setShowFilters] = useState(true)
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const { t, i18n } = useTranslation()

  const pageSize = 6

  // Hàm đặt lại bộ lọc
  const resetFilters = () => {
    setResetting(true);
    setSelectedCategories([]);
    setPriceRange([0, 500000]);
    setShowInStockOnly(false);
    setSearchText('');
    setCurrentPage(1);
    setTimeout(() => setResetting(false), 500); // Giả lập loading khi reset
  }
  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchText, selectedCategories])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Chỉ truyền các tham số khi có giá trị
      const params: any = {}

      if (currentPage > 1) params.pageIndex = currentPage
      params.pageSize = pageSize // Luôn truyền pageSize vì frontend dùng 6, backend default 10
      if (searchText.trim()) params.textSearch = searchText
      params.status = true // Luôn lấy sản phẩm active

      const response = await publicService.getPublicProducts(params)

      // Transform API data to ShopProduct format
      const transformedProducts: ShopProduct[] = response.data.map(product => ({
        ...product,
        category: product.category, // Đã là string, không cần kiểm tra kiểu số nữa
        // Add UI-specific fields with default values
        rating: 4.5, // Default rating - bạn có thể tính toán lại sau
        reviews: Math.floor(Math.random() * 50) + 1, // Random reviews for now
        soldCount: product.soldCount || 0, // lấy đúng từ API
        isActive: true,
        isSale: product.isSale || false,
        salePercent: product.salePercent || 0
      }))

      setProducts(transformedProducts)
      setTotalRecords(response.totalRecord)
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Category filter options (hiển thị tiếng Việt nếu đang ở ngôn ngữ 'vi')
  const categories = [
    { label: t('shop.categories.all'), value: 'all' },
    { label: i18n.language === 'vi' ? getCategoryViLabel('souvenir') : 'Souvenir', value: 'souvenir' },
    { label: i18n.language === 'vi' ? getCategoryViLabel('jewelry') : 'Jewelry', value: 'jewelry' },
    { label: i18n.language === 'vi' ? getCategoryViLabel('food') : 'Food', value: 'food' },
    { label: i18n.language === 'vi' ? getCategoryViLabel('clothing') : 'Clothing', value: 'clothing' },
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCategoryChange = (checkedValues: string[]) => {
    setFiltering(true);
    setSelectedCategories(checkedValues);
    setCurrentPage(1);
    setTimeout(() => setFiltering(false), 500);
  }

  const handlePriceRangeChange = (value: number | number[]) => {
    setFiltering(true);
    setPriceRange(value as [number, number]);
    setCurrentPage(1);
    setTimeout(() => setFiltering(false), 500);
  }

  const handleInStockChange = (e: any) => {
    setFiltering(true);
    setShowInStockOnly(e.target.checked);
    setCurrentPage(1);
    setTimeout(() => setFiltering(false), 500);
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Enhanced filter logic for client-side filtering
  const filteredProducts = products.filter(product => {
    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes('all') ||
      selectedCategories.some(cat => cat.toLowerCase() === product.category.toLowerCase())

    // Price range filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

    // Active filter
    const matchesActive = product.isActive !== false

    // In-stock filter
    const matchesInStock = !showInStockOnly || product.quantityInStock > 0

    return matchesCategory && matchesPrice && matchesActive && matchesInStock
  })

  // No sorting - just use filtered products as-is
  const sortedProducts = filteredProducts

  // Paginate products - using server-side pagination
  const paginatedProducts = sortedProducts

  return (
    <div className="shop-page">
      <div className="container">
        {/* Shop Header */}
        <div className="shop-header">
          <Title level={2}>{t('shop.title')}</Title>
          <p>{t('shop.subtitle')}</p>
        </div>

        {/* Search Bar */}
        <SearchBarCommon
          onSearch={handleSearch}
          loading={loading}
          placeholder={t('shop.searchPlaceholder')}
          className="shop-search-bar"
          buttonText={t('common.search')}
        />

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>{t('shop.loading')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Empty
              description="Có lỗi xảy ra khi tải sản phẩm"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {/* Main Content Area */}
        {!loading && !error && (
          <Row gutter={[24, 24]} className="main-content">
            {/* Filter Sidebar */}
            <Col xs={24} md={6} className="filter-sidebar">
              <div className={`filters-container ${showFilters ? 'show' : 'hide'}`}>
                <div className="filter-header">
                  <Title level={4}>
                    <FilterOutlined /> {t('shop.filters')}
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
                    {/* Category Filter */}
                    <div className="filter-section">
                      <Title level={5}>{t('shop.categories.title')}</Title>
                      <CheckboxGroup
                        options={categories}
                        value={selectedCategories}
                        onChange={handleCategoryChange}
                        className="category-filter"
                      />
                    </div>

                    <Divider />

                    {/* Price Range Filter */}
                    <div className="filter-section">
                      <Title level={5}>{t('shop.priceRange')}</Title>
                      <Slider
                        range
                        min={0}
                        max={500000}
                        step={10000}
                        value={priceRange}
                        onChange={handlePriceRangeChange}
                        tooltip={{
                          formatter: (value) => `${value?.toLocaleString('vi-VN')}₫`
                        }}
                      />
                      <div className="price-range-display">
                        <span>{priceRange[0].toLocaleString('vi-VN')}₫</span>
                        <span> - </span>
                        <span>{priceRange[1].toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>

                    <Divider />

                    {/* Stock Filter */}
                    <div className="filter-section">
                      <Checkbox
                        checked={showInStockOnly}
                        onChange={handleInStockChange}
                      >
                        {t('shop.inStockOnly')}
                      </Checkbox>
                    </div>
                    {/* Nút Đặt lại bộ lọc */}
                    <div className="filter-section">
                      <Button
                        type="default"
                        icon={<FilterOutlined />}
                        onClick={resetFilters}
                        block
                        loading={resetting || filtering}
                      >
                        {t('shopList.resetFilters')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Col>

            {/* Products Section */}
            <Col xs={24} md={18} className="products-section">
              {/* Products Grid */}
              {paginatedProducts.length > 0 ? (
                <>
                  <Row gutter={[16, 24]} className="products-grid">
                    {paginatedProducts.map(product => (
                      <Col xs={24} sm={12} lg={8} key={product.id}>
                        <ProductCard product={product} />
                      </Col>
                    ))}
                  </Row>

                  {/* Pagination with Controls */}
                  <div className="pagination-container">
                    <div className="pagination-controls">
                      <div className="results-info">
                        <span>{totalRecords} {t('shop.totalProducts')}</span>
                      </div>
                      <Pagination
                        current={currentPage}
                        total={totalRecords}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) => (
                          <span className="results-info-total">
                            {range[0]}-{range[1]} {t('shop.of')} {total} {t('shop.totalProducts')}
                          </span>
                        )}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <Empty
                    description={t('shop.noProductsFound') || "Không tìm thấy sản phẩm nào"}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Col>
          </Row>
        )}
      </div>
    </div>
  )
}

export default Shop
