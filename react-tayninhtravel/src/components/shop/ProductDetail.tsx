import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Breadcrumb,
  Row,
  Col,
  Typography,
  Button,
  Tabs,
  Rate,
  InputNumber,
  Divider,
  Tag,
  Space,
  notification,
  Skeleton,
  Modal
} from 'antd'
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  StarOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  TagOutlined,
  HeartFilled,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import './ProductDetail.scss'
import { useCartStore } from '@/store/useCartStore'
// CheckCircleOutlined, of import ant-design/icons
const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Mứt Tây Ninh - Hộp Quà Tặng Truyền Thống',
    price: 250000,
    discountPrice: 200000,
    image: 'https://placehold.co/400x400',
    rating: 4.5,
    reviews: 28,
    category: 'Đặc Sản Địa Phương',
    tags: ['đặc sản', 'quà tặng', 'mứt'],
    isSale: true,
  },
  {
    id: 2,
    name: 'Túi Tote Canvas Tây Ninh Phong Cảnh',
    price: 150000,
    image: 'https://placehold.co/400x400',
    rating: 4.7,
    reviews: 42,
    category: 'Thời Trang',
    tags: ['túi', 'canvas', 'thời trang'],
    isNew: true,
  },
  {
    id: 3,
    name: 'Mô Hình Thu Nhỏ Núi Bà Đen',
    price: 350000,
    discountPrice: 299000,
    image: 'https://placehold.co/400x400',
    rating: 4.8,
    reviews: 15,
    category: 'Quà Lưu Niệm',
    tags: ['mô hình', 'núi bà đen', 'lưu niệm'],
    isSale: true,
  },
  {
    id: 4,
    name: 'Trà Tây Ninh - Hộp Gỗ Cao Cấp 100g',
    price: 180000,
    image: 'https://placehold.co/400x400',
    rating: 4.9,
    reviews: 67,
    category: 'Đặc Sản Địa Phương',
    tags: ['trà', 'đặc sản', 'quà tặng'],
  },
  {
    id: 5,
    name: 'Áo Thun In Hình Địa Danh Tây Ninh',
    price: 220000,
    discountPrice: 180000,
    image: 'https://placehold.co/400x400',
    rating: 4.2,
    reviews: 33,
    category: 'Thời Trang',
    tags: ['áo thun', 'thời trang', 'quà lưu niệm'],
    isSale: true,
  }
]

interface Review {
  id: number
  userName: string
  rating: number
  date: string
  comment: string
}

interface Specification {
  name: string
  value: string
}

interface EnhancedProduct {
  id: number
  name: string
  price: number
  discountPrice?: number
  image: string
  rating: number
  reviews: number
  category: string
  tags: string[]
  isNew?: boolean
  isSale?: boolean
  description: string
  shortDescription: string
  stock: number
  sku: string
  specifications: Specification[]
  additionalImages: string[]
  reviewsData: Review[]
}

const ProductDetail = () => {
  const { id } = useParams()
  const productId = parseInt(id || '1')

  const [product, setProduct] = useState<EnhancedProduct | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [mainImage, setMainImage] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  // const [activeTab, setActiveTab] = useState<string>('description')
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)

  const addToCart = useCartStore(state => state.addItem)

  // Fetch product data
  useEffect(() => {
    // Simulating API fetch
    const fetchProduct = () => {
      setLoading(true)
      setTimeout(() => {
        const foundProduct = mockProducts.find(p => p.id === productId)
        if (foundProduct) {
          // Create additional mock data for product detail
          const enhancedProduct = {
            ...foundProduct,
            description:
              'Sản phẩm đặc trưng của Tây Ninh, được làm thủ công bởi các nghệ nhân địa phương. Chất lượng cao và độc đáo, sẽ là món quà lưu niệm hoàn hảo cho chuyến du lịch của bạn.',
            shortDescription: 'Sản phẩm đặc trưng từ Tây Ninh, chất lượng cao',
            stock: 15,
            sku: `TN-${foundProduct.id.toString().padStart(5, '0')}`,
            specifications: [
              { name: 'Xuất xứ', value: 'Tây Ninh' },
              { name: 'Chất liệu', value: 'Thủ công' },
              { name: 'Kích thước', value: '20 x 15 x 5 cm' },
              { name: 'Trọng lượng', value: '250g' },
              { name: 'Bảo quản', value: 'Nơi khô ráo, thoáng mát' },
            ],
            additionalImages: [
              foundProduct.image,
              'https://placehold.co/400x400?text=Image+2',
              'https://placehold.co/400x400?text=Image+3',
              'https://placehold.co/400x400?text=Image+4',
            ],
            reviewsData: [
              {
                id: 1,
                userName: 'Nguyễn Văn A',
                rating: 5,
                date: '15/03/2024',
                comment: 'Sản phẩm rất đẹp và chất lượng. Đóng gói cẩn thận, giao hàng nhanh.',
              },
              {
                id: 2,
                userName: 'Trần Thị B',
                rating: 4,
                date: '10/03/2024',
                comment: 'Hàng đẹp, đúng như mô tả. Sẽ ủng hộ shop lần sau.',
              },
              {
                id: 3,
                userName: 'Lê Văn C',
                rating: 5,
                date: '05/03/2024',
                comment: 'Quá tuyệt vời, mọi người nên mua thử.',
              },
            ],
          }
          setProduct(enhancedProduct)
          setMainImage(enhancedProduct.additionalImages[0])
        }
        setLoading(false)
      }, 800)
    }

    fetchProduct()
  }, [productId])

  const handleQuantityChange = (value: number | null) => {
    if (value !== null) {
      setQuantity(value)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      type: 'product',
      quantity: quantity
    })

    notification.success({
      message: 'Thêm vào giỏ hàng thành công',
      description: `Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng.`,
      icon: <ShoppingCartOutlined style={{ color: '#52c41a' }} />,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Navigate to checkout page
    // navigate('/checkout')
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    notification.info({
      message: isFavorite ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích',
      icon: isFavorite ? <HeartOutlined /> : <HeartFilled style={{ color: '#ff4d4f' }} />,
    })
  }

  const handleThumbnailClick = (image: string, index: number) => {
    setMainImage(image)
    setCurrentImageIndex(index)
  }

  const handleImageClick = () => {
    if (!product) return
    setImageModalVisible(true)
  }

  const handlePrevImage = () => {
    if (!product) return
    const newIndex =
      (currentImageIndex - 1 + product.additionalImages.length) % product.additionalImages.length
    setCurrentImageIndex(newIndex)
    setMainImage(product.additionalImages[newIndex])
  }

  const handleNextImage = () => {
    if (!product) return
    const newIndex = (currentImageIndex + 1) % product.additionalImages.length
    setCurrentImageIndex(newIndex)
    setMainImage(product.additionalImages[newIndex])
  }

  const renderThumbnails = () => {
    if (!product) return null
    return product.additionalImages.map((image: string, index: number) => (
      <div
        key={index}
        className={`thumbnail ${mainImage === image ? 'active-thumbnail' : ''}`}
        onClick={() => handleThumbnailClick(image, index)}
      >
        <img
          src={image}
          alt={`${product.name} - Ảnh ${index + 1}`}
          className="thumbnail-image"
        />
      </div>
    ))
  }

  // Related products component
  const RelatedProductsSection = ({
    currentProductId,
    category,
    tags
  }: {
    currentProductId: number
    category: string
    tags: string[]
  }) => {
    // Filter related products based on category and tags
    const relatedProducts = mockProducts
      .filter(p => p.id !== currentProductId)
      .filter(p => p.category === category || p.tags.some(tag => tags.includes(tag)))
      .slice(0, 4)

    return (
      <Row gutter={[16, 16]}>
        {relatedProducts.map(product => (
          <Col xs={24} sm={12} md={6} key={product.id}>
            <Link to={`/shop/product/${product.id}`} className="related-product-link">
              <div className="related-product-card">
                <div className="related-product-image">
                  <img src={product.image} alt={product.name} />
                  {(product.isNew || product.isSale) && (
                    <div className={`product-badge ${product.isNew ? 'new-badge' : 'sale-badge'}`}>
                      {product.isNew
                        ? 'Mới'
                        : `Giảm ${Math.round(
                          ((product.price - (product.discountPrice || 0)) / product.price) * 100
                        )}%`}
                    </div>
                  )}
                </div>
                <div className="related-product-info">
                  <h4>{product.name}</h4>
                  <div className="related-product-price">
                    {product.discountPrice ? (
                      <>
                        <span className="discount-price">
                          {product.discountPrice.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="original-price">
                          {product.price.toLocaleString('vi-VN')}₫
                        </span>
                      </>
                    ) : (
                      <span className="regular-price">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </Col>
        ))}
      </Row>
    )
  }

  if (loading) {
    return (
      <div className="product-detail-container">
        <Skeleton active paragraph={{ rows: 1 }} />
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <Skeleton.Image className="skeleton-image" />
            <div className="thumbnail-skeleton">
              <Skeleton.Image className="thumbnail-skeleton-item" />
              <Skeleton.Image className="thumbnail-skeleton-item" />
              <Skeleton.Image className="thumbnail-skeleton-item" />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Col>
        </Row>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-container">
        <div className="not-found">
          <Title level={3}>Không tìm thấy sản phẩm</Title>
          <Text>Sản phẩm này không tồn tại hoặc đã bị xóa.</Text>
          <Link to="/shop">
            <Button type="primary" size="large" className="back-button">
              Quay lại cửa hàng
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/">Trang Chủ</Link> },
          { title: <Link to="/shop">Cửa Hàng</Link> },
          { title: <Link to={`/shop?category=${product.category}`}>{product.category}</Link> },
          { title: product.name },
        ]}
      />

      <Row gutter={[32, 32]} className="product-detail-content">
        {/* Product Images */}
        <Col xs={24} md={12}>
          <div className="product-images">
            <div className="main-image-container" onClick={handleImageClick}>
              <img
                src={mainImage}
                alt={product.name}
                className="main-image"
              />
              {(product.isNew || product.isSale) && (
                <div
                  className={`product-badge ${product.isNew ? 'new-badge' : 'sale-badge'
                    }`}
                >
                  {product.isNew
                    ? 'Mới'
                    : `Giảm ${Math.round(
                      ((product.price - (product.discountPrice || 0)) / product.price) * 100
                    )}%`}
                </div>
              )}
              <div className="image-hint">Nhấp để xem ảnh lớn</div>
            </div>
            <div className="thumbnail-container">{renderThumbnails()}</div>
          </div>
        </Col>

        {/* Product Info */}
        <Col xs={24} md={12}>
          <div className="product-info">
            <Title level={2} className="product-title">
              {product.name}
            </Title>

            <div className="product-meta">
              <Rate disabled defaultValue={product.rating} />
              <Text className="review-count">({product.reviews} đánh giá)</Text>
              <Text className="sku">SKU: {product.sku}</Text>
            </div>

            <div className="product-price">
              {product.discountPrice ? (
                <>
                  <Text className="current-price">
                    {product.discountPrice.toLocaleString('vi-VN')}₫
                  </Text>
                  <Text className="original-price">
                    {product.price.toLocaleString('vi-VN')}₫
                  </Text>
                  <Tag color="red" className="discount-tag">
                    Giảm{' '}
                    {Math.round(
                      ((product.price - (product.discountPrice || 0)) / product.price) * 100
                    )}
                    %
                  </Tag>
                </>
              ) : (
                <Text className="current-price">
                  {product.price.toLocaleString('vi-VN')}₫
                </Text>
              )}
            </div>

            <Paragraph className="short-description">{product.shortDescription}</Paragraph>

            <div className="product-actions">
              <div className="quantity-selector">
                <Text>Số lượng:</Text>
                <InputNumber
                  min={1}
                  max={product.stock}
                  defaultValue={1}
                  onChange={handleQuantityChange}
                />
                <Text className="stock-info">
                  <InfoCircleOutlined /> Còn {product.stock} sản phẩm
                </Text>
              </div>

              <div className="action-buttons">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="add-to-cart-btn"
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  type="default"
                  size="large"
                  onClick={handleBuyNow}
                  className="buy-now-btn"
                >
                  Mua ngay
                </Button>
                <Button
                  type="text"
                  icon={isFavorite ? <HeartFilled className="favorite-icon" /> : <HeartOutlined />}
                  onClick={handleToggleFavorite}
                  className="favorite-btn"
                />
                <Button type="text" icon={<ShareAltOutlined />} className="share-btn" />
              </div>
            </div>

            <Divider />

            <div className="product-tags">
              <Space size={[0, 8]} wrap>
                <TagOutlined />
                {product.tags.map((tag, index) => (
                  <Tag key={index} className="product-tag">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            <div className="product-category">
              <Space>
                <Text>Danh mục:</Text>
                <Link to={`/shop?category=${product.category}`}>{product.category}</Link>
              </Space>
            </div>

            <div className="product-location">
              <Space>
                <EnvironmentOutlined />
                <Text>Tây Ninh, Việt Nam</Text>
              </Space>
            </div>
          </div>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      {/* onChange={key => setActiveTab(key)} */}
      <div className="product-details-tabs">
        <Tabs defaultActiveKey="description">
          <TabPane tab="Mô tả sản phẩm" key="description">
            <div className="tab-content">
              <Paragraph>{product.description}</Paragraph>
              <Paragraph>
                Sản phẩm này là một phần của bộ sưu tập đặc biệt từ Tây Ninh, được thiết kế và sản
                xuất bởi các nghệ nhân địa phương với kỹ thuật truyền thống kết hợp với công nghệ
                hiện đại.
              </Paragraph>
              <Paragraph>
                Mỗi sản phẩm đều là độc nhất và mang đậm bản sắc văn hóa của vùng đất Tây Ninh, là
                món quà lưu niệm hoàn hảo cho bạn bè và người thân sau chuyến du lịch.
              </Paragraph>
            </div>
          </TabPane>
          <TabPane tab="Thông số kỹ thuật" key="specifications">
            <div className="tab-content">
              <table className="specifications-table">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index}>
                      <td className="spec-name">{spec.name}</td>
                      <td className="spec-value">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPane>
          <TabPane tab={`Đánh giá (${product.reviews})`} key="reviews">
            <div className="tab-content">
              <div className="reviews-summary">
                <div className="rating-summary">
                  <div className="average-rating">
                    <Title level={2}>{product.rating.toFixed(1)}</Title>
                    <Rate disabled defaultValue={product.rating} />
                    <Text>{product.reviews} đánh giá</Text>
                  </div>
                  <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="rating-bar-item">
                        <Text>{star} sao</Text>
                        <div className="rating-bar">
                          <div
                            className="rating-bar-fill"
                            style={{
                              width: `${(product.reviewsData.filter(r => Math.round(r.rating) === star)
                                .length /
                                product.reviewsData.length) *
                                100
                                }%`,
                            }}
                          ></div>
                        </div>
                        <Text>
                          {
                            product.reviewsData.filter(r => Math.round(r.rating) === star).length
                          }
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="write-review">
                  <Button type="primary" icon={<StarOutlined />}>
                    Viết đánh giá
                  </Button>
                </div>
              </div>

              <Divider />

              <div className="reviews-list">
                {product.reviewsData &&
                  product.reviewsData.map((review: Review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <Title level={5}>{review.userName}</Title>
                          <Text type="secondary">{review.date}</Text>
                        </div>
                        <Rate disabled defaultValue={review.rating} />
                      </div>
                      <Paragraph>{review.comment}</Paragraph>
                      <Divider />
                    </div>
                  ))}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="related-products">
        <Title level={3} className="section-title">
          Sản phẩm liên quan
        </Title>
        <RelatedProductsSection
          currentProductId={product.id}
          category={product.category}
          tags={product.tags}
        />
      </div>

      {/* Image Modal */}
      <Modal
        open={imageModalVisible}
        footer={null}
        onCancel={() => setImageModalVisible(false)}
        width={800}
        className="image-modal"
        centered
      >
        <div className="modal-image-container">
          <Button
            className="image-nav-button prev-button"
            onClick={handlePrevImage}
            icon={<LeftOutlined />}
          />
          <div className="modal-main-image">
            {product && (
              <img
                src={product.additionalImages[currentImageIndex]}
                alt={product.name}
                className="modal-image"
              />
            )}
          </div>
          <Button
            className="image-nav-button next-button"
            onClick={handleNextImage}
            icon={<RightOutlined />}
          />
        </div>

        <div className="modal-thumbnails">
          <div className="modal-thumbnail-container">
            {product &&
              product.additionalImages.map((image, index) => (
                <div
                  key={index}
                  className={`modal-thumbnail ${currentImageIndex === index ? 'active-thumbnail' : ''
                    }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
          </div>
        </div>

        <div className="image-pagination">
          {currentImageIndex + 1}/{product?.additionalImages.length || 0}
        </div>
      </Modal>
    </div>
  )
}

export default ProductDetail
