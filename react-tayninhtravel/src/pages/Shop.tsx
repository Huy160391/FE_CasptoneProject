import { useState } from 'react'
import { Row, Col, Card, Input, Select, Pagination, Empty } from 'antd'
import { SearchOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import './Shop.scss'

const { Meta } = Card
const { Option } = Select

const Shop = () => {
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data for products
  const products = [
    {
      id: 1,
      name: 'Nón lá Tây Ninh',
      image: '/images/products/non-la.jpg',
      price: '150.000 VND',
      category: 'Đồ lưu niệm',
    },
    {
      id: 2,
      name: 'Áo thun Núi Bà Đen',
      image: '/images/products/ao-thun.jpg',
      price: '200.000 VND',
      category: 'Quần áo',
    },
    {
      id: 3,
      name: 'Tranh Tòa Thánh Cao Đài',
      image: '/images/products/tranh.jpg',
      price: '350.000 VND',
      category: 'Đồ lưu niệm',
    },
    {
      id: 4,
      name: 'Túi xách thổ cẩm',
      image: '/images/products/tui-xach.jpg',
      price: '250.000 VND',
      category: 'Phụ kiện',
    },
    {
      id: 5,
      name: 'Trà Tây Ninh',
      image: '/images/products/tra.jpg',
      price: '120.000 VND',
      category: 'Đặc sản',
    },
    {
      id: 6,
      name: 'Mật ong rừng Tây Ninh',
      image: '/images/products/mat-ong.jpg',
      price: '180.000 VND',
      category: 'Đặc sản',
    },
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Filter products based on search text
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.category.toLowerCase().includes(searchText.toLowerCase())
  )

  // Sort products based on sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''))
    } else if (sortBy === 'price-high') {
      return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''))
    } else if (sortBy === 'newest') {
      return b.id - a.id
    }
    return 0
  })

  // Paginate products
  const pageSize = 6
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-header">
          <h1>Cửa hàng lưu niệm</h1>
          <p>Khám phá các sản phẩm đặc trưng của Tây Ninh</p>
        </div>

        <div className="action-bar">
          <div className="search-box">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              onChange={e => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="sort-box">
            <Select
              defaultValue="popularity"
              onChange={handleSortChange}
              suffixIcon={<SortAscendingOutlined />}
              className="sort-select"
            >
              <Option value="popularity">Phổ Biến Nhất</Option>
              <Option value="newest">Mới Nhất</Option>
              <Option value="price-low">Giá: Thấp - Cao</Option>
              <Option value="price-high">Giá: Cao - Thấp</Option>
            </Select>
          </div>
        </div>

        {paginatedProducts.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {paginatedProducts.map(product => (
                <Col xs={24} sm={12} md={8} key={product.id}>
                  <Link to={`/shop/product/${product.id}`} className="product-link">
                    <Card
                      hoverable
                      cover={<img alt={product.name} src={product.image} />}
                      className="product-card"
                    >
                      <Meta title={product.name} description={product.category} />
                      <div className="product-price">{product.price}</div>
                      <button
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.preventDefault()
                          // Add to cart logic here
                        }}
                      >
                        Thêm vào giỏ hàng
                      </button>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>

            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={filteredProducts.length}
                pageSize={pageSize}
                onChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <Empty description="Không tìm thấy sản phẩm nào" />
        )}
      </div>
    </div>
  )
}

export default Shop
