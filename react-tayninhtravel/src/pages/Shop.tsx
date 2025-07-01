import { useState } from 'react'
import { Row, Col, Card, Select, Pagination, Empty, Button, Slider, Checkbox, Divider, Typography, Space } from 'antd'
import { SortAscendingOutlined, ShoppingCartOutlined, FilterOutlined, StarOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductCart } from '@/hooks/useCart'
import { Product } from '@/types'
import ShopSearchBar from '@/components/shop/ShopSearchBar'
import './Shop.scss'

const { Meta } = Card
const { Option } = Select
const { Title } = Typography
const CheckboxGroup = Checkbox.Group

// Extended Product interface with UI specific fields
interface ShopProduct extends Product {
  rating: number;
  reviews: number;
  soldCount: number;
}

const Shop = () => {
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
  const [showFilters, setShowFilters] = useState(true)
  const { t } = useTranslation()

  // Enhanced mock data for products with proper Product structure
  const products: ShopProduct[] = [
    {
      id: '1',
      shopId: 'shop1',
      name: 'Nón lá Tây Ninh',
      description: 'Nón lá truyền thống được làm thủ công từ lá cọ',
      price: 150000,
      quantityInStock: 25,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Đồ lưu niệm',
      isActive: true,
      isSale: true,
      salePercent: 17,
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      rating: 4.5,
      reviews: 23,
      soldCount: 156,
    },
    {
      id: '2',
      shopId: 'shop1',
      name: 'Áo thun Núi Bà Đen',
      description: 'Áo thun cotton in hình Núi Bà Đen',
      price: 200000,
      quantityInStock: 15,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Quần áo',
      isActive: true,
      isSale: false,
      salePercent: 0,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-15T14:00:00Z',
      rating: 4.2,
      reviews: 15,
      soldCount: 89,
    },
    {
      id: '3',
      shopId: 'shop2',
      name: 'Tranh Tòa Thánh Cao Đài',
      description: 'Tranh in canvas Tòa Thánh Cao Đài',
      price: 350000,
      quantityInStock: 8,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Đồ lưu niệm',
      isActive: true,
      isSale: false,
      salePercent: 0,
      createdAt: '2024-01-08T11:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z',
      rating: 4.8,
      reviews: 31,
      soldCount: 67,
    },
    {
      id: '4',
      shopId: 'shop2',
      name: 'Túi xách thổ cẩm',
      description: 'Túi xách thổ cẩm đặc trưng vùng miền',
      price: 250000,
      quantityInStock: 0,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Phụ kiện',
      isActive: true,
      isSale: false,
      salePercent: 0,
      createdAt: '2024-01-05T13:00:00Z',
      updatedAt: '2024-01-18T09:00:00Z',
      rating: 4.1,
      reviews: 12,
      soldCount: 34,
    },
    {
      id: '5',
      shopId: 'shop3',
      name: 'Trà Tây Ninh',
      description: 'Trà thảo mộc đặc sản Tây Ninh',
      price: 120000,
      quantityInStock: 50,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Đặc sản',
      isActive: true,
      isSale: false,
      salePercent: 0,
      createdAt: '2024-01-12T07:00:00Z',
      updatedAt: '2024-01-22T12:00:00Z',
      rating: 4.7,
      reviews: 45,
      soldCount: 234,
    },
    {
      id: '6',
      shopId: 'shop3',
      name: 'Mật ong rừng Tây Ninh',
      description: 'Mật ong rừng nguyên chất 100%',
      price: 180000,
      quantityInStock: 18,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Đặc sản',
      isActive: true,
      isSale: false,
      salePercent: 0,
      createdAt: '2024-01-14T15:00:00Z',
      updatedAt: '2024-01-19T11:00:00Z',
      rating: 4.6,
      reviews: 28,
      soldCount: 123,
    },
    {
      id: '7',
      shopId: 'shop4',
      name: 'Bánh tráng Tây Ninh',
      description: 'Bánh tráng nướng đặc sản Tây Ninh',
      price: 85000,
      quantityInStock: 30,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Đặc sản',
      isActive: true,
      isSale: false,
      salePercent: 0,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-21T08:00:00Z',
      rating: 4.3,
      reviews: 18,
      soldCount: 78,
    },
    {
      id: '8',
      shopId: 'shop4',
      name: 'Khăn rằn Tây Ninh',
      description: 'Khăn rằn truyền thống Tây Ninh',
      price: 120000,
      quantityInStock: 12,
      imageUrl: ['https://placehold.co/400x400'],
      category: 'Phụ kiện',
      isActive: true,
      isSale: true,
      salePercent: 20,
      createdAt: '2024-01-18T12:00:00Z',
      updatedAt: '2024-01-23T14:00:00Z',
      rating: 4.0,
      reviews: 9,
      soldCount: 45,
    },
  ]

  const categories = [
    { label: t('shop.categories.all'), value: 'all' },
    { label: 'Đồ lưu niệm', value: 'Đồ lưu niệm' },
    { label: 'Quần áo', value: 'Quần áo' },
    { label: 'Phụ kiện', value: 'Phụ kiện' },
    { label: 'Đặc sản', value: 'Đặc sản' },
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCategoryChange = (checkedValues: string[]) => {
    setSelectedCategories(checkedValues)
    setCurrentPage(1)
  }

  const handlePriceRangeChange = (value: number | number[]) => {
    setPriceRange(value as [number, number])
    setCurrentPage(1)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Enhanced filter logic
  const filteredProducts = products.filter(product => {
    // Text search filter
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.category.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase())

    // Category filter
    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.includes('all') ||
      selectedCategories.includes(product.category)

    // Price range filter
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

    // Active filter
    const matchesActive = product.isActive

    return matchesSearch && matchesCategory && matchesPrice && matchesActive
  })

  // Enhanced sort products based on sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'popular':
        return b.soldCount - a.soldCount
      default:
        return b.soldCount - a.soldCount // Default to popularity
    }
  })

  // Enhanced Product Card with rating and stock status
  const ProductCard = ({ product }: { product: ShopProduct }) => {
    const productCart = useProductCart(product.id)

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (product.quantityInStock === 0) return

      productCart.addToCart({
        productId: product.id,
        name: product.name,
        image: product.imageUrl[0],
        price: product.price,
        quantity: 1
      })
    }

    // Calculate original price if on sale
    const originalPrice = product.isSale
      ? Math.round(product.price / (1 - product.salePercent / 100))
      : null

    return (
      <Link to={`/shop/product/${product.id}`} className="product-link">
        <Card
          hoverable
          cover={
            <div className="product-image-container">
              <img alt={product.name} src={product.imageUrl[0]} />
              {product.quantityInStock === 0 && (
                <div className="out-of-stock-overlay">
                  <span>{t('shop.outOfStock')}</span>
                </div>
              )}
            </div>
          }
          className="product-card"
        >
          <Meta title={product.name} description={product.category} />

          <div className="product-rating">
            <Space>
              <StarOutlined style={{ color: '#faad14' }} />
              <span>{product.rating.toFixed(1)}</span>
              <span className="review-count">({product.reviews})</span>
              <span className="sold-count">• Đã bán {product.soldCount}</span>
            </Space>
          </div>

          <div className="product-price">
            {product.isSale && originalPrice && (
              <span className="original-price">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
            <span className="current-price">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            {product.isSale && (
              <span className="sale-badge">-{product.salePercent}%</span>
            )}
          </div>

          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleAddToCart}
            loading={productCart.loading}
            disabled={product.quantityInStock === 0}
            className="add-to-cart-btn"
            block
          >
            {product.quantityInStock === 0
              ? t('shop.outOfStock')
              : productCart.isInCart
                ? `${t('cart.inCart')} (${productCart.quantity})`
                : t('cart.addToCart')
            }
          </Button>
        </Card>
      </Link>
    )
  }

  // Paginate products
  const pageSize = 6
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="shop-page">
      <div className="container">
        {/* Shop Header */}
        <div className="shop-header">
          <Title level={2}>{t('shop.title')}</Title>
          <p>{t('shop.subtitle')}</p>
        </div>

        {/* Search Bar */}
        <ShopSearchBar
          onSearch={handleSearch}
          onCategoryChange={setSelectedCategories}
          onSortChange={handleSortChange}
          searchText={searchText}
          sortBy={sortBy}
        />

        {/* Main Content Area */}
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
                    <Title level={5}>Danh mục</Title>
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
                    <Title level={5}>Khoảng giá</Title>
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
                    <Checkbox>Chỉ hiển thị hàng có sẵn</Checkbox>
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
                      <span>{sortedProducts.length} sản phẩm</span>
                    </div>

                    <Pagination
                      current={currentPage}
                      total={sortedProducts.length}
                      pageSize={pageSize}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} của ${total} sản phẩm`
                      }
                    />

                    <div className="sort-controls">
                      <Space>
                        <span>Sắp xếp:</span>
                        <Select
                          value={sortBy}
                          onChange={handleSortChange}
                          className="sort-select"
                          suffixIcon={<SortAscendingOutlined />}
                        >
                          <Option value="popularity">{t('shop.sortOptions.popularity')}</Option>
                          <Option value="newest">{t('shop.sortOptions.newest')}</Option>
                          <Option value="price-low">{t('shop.sortOptions.priceLow')}</Option>
                          <Option value="price-high">{t('shop.sortOptions.priceHigh')}</Option>
                          <Option value="rating">Đánh giá cao nhất</Option>
                          <Option value="popular">Phổ biến nhất</Option>
                        </Select>
                      </Space>
                    </div>
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
      </div>
    </div>
  )
}

export default Shop
