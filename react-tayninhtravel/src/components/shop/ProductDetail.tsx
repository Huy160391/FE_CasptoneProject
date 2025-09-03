import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Breadcrumb,
  Row,
  Col,
  Typography,
  Button,
  Tabs,
  Rate,
  Divider,
  Tag,
  Space,
  notification,
  Skeleton,
  Modal
} from 'antd'
import {
  ShoppingCartOutlined,
  ShareAltOutlined,
  StarOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  TagOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons'
import { Empty } from 'antd'
import LoginModal from '@/components/auth/LoginModal'
import './ProductDetail.scss'
import { useProductCart } from '@/hooks/useCart'
import { useTranslation } from 'react-i18next'
import { Product } from '@/types'
import ShopInfo from './ShopInfo'
import CreateReviewModal from './CreateReviewModal'
import { publicService } from '@/services/publicService'
import { getCategoryViLabel } from '@/utils/categoryViLabels'
// ...existing code...
import SharePopup from '../common/SharePopup';

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

interface Review {
  id: number
  userName: string
  rating: number
  date: string
  comment: string
}

interface EnhancedProduct extends Product {
  rating: number
  reviews: number
  tags: string[]
  isNew?: boolean
  discountPrice?: number
  shortDescription: string
  stock: number
  sku: string
  additionalImages: string[]
  reviewsData: Review[]
}

const ProductDetail = () => {
  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const { id } = useParams()
  const productId = id || '1'

  const [product, setProduct] = useState<EnhancedProduct | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [quantity, setQuantity] = useState<number>(1)
  // const [activeTab, setActiveTab] = useState<string>('description')
  const [reviewsData, setReviewsData] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true)
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false)
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Format date helper
  const formatReviewDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Sử dụng hàm tạo review thực tế
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!product) return;
    // Nếu không chọn sao thì gửi 0 sao
    const finalRating = rating || 0;
    try {
      const userService = await import('@/services/userService').then(mod => mod.default);
      await userService.createProductReview(product.id, finalRating, comment);
      notification.success({ message: t('navigation.review.success'), description: t('navigation.review.thankYou') });
      setReviewModalVisible(false);
      // Reload lại danh sách review sau khi gửi thành công
      setReviewsLoading(true);
      try {
        const apiResponse: any = await publicService.getProductReviews(product.id);
        // Nếu response là object chứa reviews thì lấy ra, nếu là mảng thì dùng luôn
        let reviewsArr: any[] = [];
        if (Array.isArray(apiResponse)) {
          reviewsArr = apiResponse;
        } else if (apiResponse && typeof apiResponse === 'object' && 'reviews' in apiResponse) {
          reviewsArr = (apiResponse as any).reviews;
        }
        const fetchedReviews = reviewsArr.map((r: any, idx: number) => ({
          id: idx + 1,
          userName: r.userName || r.user || t('product.detail.anonymous'),
          rating: r.rating || 0,
          date: formatReviewDate(r.createdAt || r.date || ''),
          comment: r.content || r.comment || '',
        }));
        setReviewsData(fetchedReviews);
      } catch {
        setReviewsData([]);
      }
      setReviewsLoading(false);
    } catch {
      notification.error({ message: t('navigation.review.error'), description: t('navigation.review.submitFailed') });
    }
  }

  // Use cart hook instead of direct store access
  const productCart = useProductCart(productId)
  const { t, i18n } = useTranslation()

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const productData = await publicService.getPublicProductById(productId)
        if (productData) {
          // Lấy review từ API
          setReviewsLoading(true)
          let fetchedReviews: Review[] = [];
          try {
            const apiResponse: any = await publicService.getProductReviews(productId);
            let reviewsArr: any[] = [];
            if (Array.isArray(apiResponse)) {
              reviewsArr = apiResponse;
            } else if (apiResponse && typeof apiResponse === 'object' && 'reviews' in apiResponse) {
              reviewsArr = apiResponse.reviews;
            }
            fetchedReviews = reviewsArr.map((r: any, idx: number) => ({
              id: idx + 1,
              userName: r.userName || r.user || t('product.detail.anonymous'),
              rating: r.rating || 0,
              date: formatReviewDate(r.createdAt || r.date || ''),
              comment: r.content || r.comment || '',
            }));
          } catch {
            fetchedReviews = [];
          }
          setReviewsData(fetchedReviews);
          setReviewsLoading(false);
          // Create enhanced product with additional UI data
          // Chỉ hiển thị đúng số lượng ảnh mà sản phẩm có, nếu không có thì dùng 1 ảnh placeholder
          let additionalImages: string[] = [];
          if (productData.imageUrl && productData.imageUrl.length > 0) {
            additionalImages = [...productData.imageUrl];
          } else {
            additionalImages = ['https://placehold.co/400x400?text=No+Image'];
          }
          const enhancedProduct: EnhancedProduct = {
            ...productData,
            category: productData.category,
            rating: 4.5,
            reviews: 28,
            tags: [t('product.detail.tags.specialty'), t('product.detail.tags.gift'), t('product.detail.tags.traditional')],
            isNew: false,
            discountPrice: productData.isSale && productData.salePercent ?
              productData.price * (1 - productData.salePercent / 100) : undefined,
            shortDescription: productData.description || t('product.detail.defaultDescription'),
            stock: productData.quantityInStock,
            sku: `TN-${productData.id.toString().padStart(5, '0')}`,
            additionalImages,
            reviewsData: fetchedReviews,
            soldCount: productData.soldCount || 0,
          }
          setProduct(enhancedProduct)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    // Ngăn không cho thêm vượt quá số lượng tồn kho
    if (productCart.quantity + quantity > product.stock) {
      notification.error({
        message: t('cart.error'),
        description: t('product.detail.stockExceeded'),
      })
      return
    }
    productCart.addToCart({
      cartItemId: product.id,
      productId: product.id,
      name: product.name,
      image: product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl[0] : 'https://placehold.co/400x400?text=No+Image',
      price: product.discountPrice || product.price,
      quantity: quantity,
      quantityInStock: product.stock
    })
  }

  // const handleBuyNow = () => {
  //   handleAddToCart()
  //   // Navigate to checkout page
  //   // navigate('/checkout')
  // }

  const ProductImages = React.memo(({ product }: { product: EnhancedProduct }) => {
    const [mainImage, setMainImage] = useState<string>(product.additionalImages[0] || '');
    const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const handleThumbnailClick = (image: string, index: number) => {
      setMainImage(image);
      setCurrentImageIndex(index);
    };

    const handleImageClick = () => {
      setImageModalVisible(true);
    };

    const handlePrevImage = () => {
      const newIndex = (currentImageIndex - 1 + product.additionalImages.length) % product.additionalImages.length;
      setCurrentImageIndex(newIndex);
      setMainImage(product.additionalImages[newIndex]);
    };

    const handleNextImage = () => {
      const newIndex = (currentImageIndex + 1) % product.additionalImages.length;
      setCurrentImageIndex(newIndex);
      setMainImage(product.additionalImages[newIndex]);
    };

    const renderThumbnails = () => {
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
      ));
    };

    return (
      <>
        <div className="product-images">
          <div className="main-image-container" onClick={handleImageClick}>
            <img
              src={mainImage}
              alt={product.name}
              className="main-image"
            />
            {(product.isNew || product.isSale) && (
              <div
                className={`product-badge ${product.isNew ? 'new-badge' : 'sale-badge'}`}
              >
                {product.isNew
                  ? t('product.detail.newBadge')
                  : t('product.detail.discountBadge', {
                    percent: typeof product.discountPrice === 'number' ? Math.round(
                      ((product.price - product.discountPrice) / product.price) * 100
                    ) : 0
                  })}
              </div>
            )}
            <div className="image-hint">{t('product.detail.imageHint')}</div>
          </div>
          <div className="thumbnail-container">{renderThumbnails()}</div>
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
              <img
                src={product.additionalImages[currentImageIndex]}
                alt={product.name}
                className="modal-image"
              />
            </div>
            <Button
              className="image-nav-button next-button"
              onClick={handleNextImage}
              icon={<RightOutlined />}
            />
          </div>
          <div className="modal-thumbnails">
            <div className="modal-thumbnail-container">
              {product.additionalImages.map((image, index) => (
                <div
                  key={index}
                  className={`modal-thumbnail ${currentImageIndex === index ? 'active-thumbnail' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="image-pagination">
            {currentImageIndex + 1}/{product.additionalImages.length || 0}
          </div>
        </Modal>
      </>
    );
  });

  // Related products component
  const RelatedProductsSection = ({
    currentProductId,
    category,
    tags
  }: {
    currentProductId: string
    category: string
    tags: string[]
  }) => {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [relatedLoading, setRelatedLoading] = useState(true)

    useEffect(() => {
      const fetchRelatedProducts = async () => {
        setRelatedLoading(true)
        try {
          // Fetch products from API with category filter
          const response = await publicService.getPublicProducts({
            pageIndex: 1,
            pageSize: 4,
            // Add category filter when API supports it
            // category: category
          })

          // Filter out current product and limit to 4 items
          const filteredProducts = response.data
            .filter(p => p.id !== currentProductId)
            .slice(0, 4)
          // Không cần ép kiểu category nữa, luôn là string

          setRelatedProducts(filteredProducts)
        } catch (error) {
          console.error('Error fetching related products:', error)
          setRelatedProducts([])
        } finally {
          setRelatedLoading(false)
        }
      }

      fetchRelatedProducts()
    }, [currentProductId, category])

    // Use tags parameter to avoid unused warning
    console.debug('Product tags:', tags)

    if (relatedLoading) {
      return (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(index => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Skeleton.Image style={{ width: '100%', height: 200 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
          ))}
        </Row>
      )
    }

    return (
      <Row gutter={[16, 16]}>
        {relatedProducts.map(product => (
          <Col xs={24} sm={12} md={6} key={product.id}>
            <Link to={`/shop/product/${product.id}`} className="related-product-link">
              <div className="related-product-card">
                <div className="related-product-image">
                  <img
                    src={product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl[0] : 'https://placehold.co/400x400?text=No+Image'}
                    alt={product.name}
                  />
                </div>
                <div className="related-product-info">
                  <h4>{product.name}</h4>
                  <div className="related-product-price">
                    {product.isSale && product.salePercent ? (
                      <>
                        <span className="discount-price">
                          {(product.price * (1 - product.salePercent / 100)).toLocaleString('vi-VN')}₫
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
          <Title level={3}>{t('product.detail.notFoundTitle')}</Title>
          <Text>{t('product.detail.notFoundMessage')}</Text>
          <Link to="/shop">
            <Button type="primary" size="large" className="back-button">
              {t('product.detail.backToShop')}
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
          { title: <Link to="/">{t('product.detail.breadcrumbHome')}</Link> },
          { title: <Link to="/shop">{t('product.detail.breadcrumbShop')}</Link> },
          { title: <Link to={`/shop?category=${product.category}`}>{i18n.language === 'vi' ? getCategoryViLabel(product.category.toLowerCase()) : product.category}</Link> },
          { title: product.name },
        ]}
      />

      <Row gutter={[32, 32]} className="product-detail-content">
        {/* Product Images */}
        <Col xs={24} md={12}>
          <ProductImages product={product} />
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
              {/* <Text className="sku">SKU: {product.sku}</Text> */}
              <Text className="sold-count" style={{ marginLeft: 16, color: '#888' }}>
                {t('shop.soldCount', { count: product.soldCount })}
              </Text>
            </div>

            <div className="product-price">
              {typeof product.discountPrice === 'number' ? (
                <>
                  <Text className="current-price">
                    {product.discountPrice?.toLocaleString('vi-VN')}₫
                  </Text>
                  <Text className="original-price">
                    {product.price.toLocaleString('vi-VN')}₫
                  </Text>
                  <Tag color="red" className="discount-tag">
                    Giảm{' '}
                    {typeof product.discountPrice === 'number' ? Math.round(
                      ((product.price - product.discountPrice) / product.price) * 100
                    ) : 0}
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
                <div className="quantity-controls">
                  <Button
                    type="text"
                    icon={<MinusOutlined />}
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="quantity-btn minus-btn"
                  />
                  <span className="quantity-display">{quantity}</span>
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="quantity-btn plus-btn"
                  />
                </div>
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
                  loading={productCart.loading}
                  className="add-to-cart-btn"
                  disabled={quantity > product.stock}
                >
                  {productCart.isInCart
                    ? t('cart.inCart') + ` (${productCart.quantity})`
                    : t('cart.addToCart')
                  }
                </Button>
                {/* <Button
                  type="default"
                  size="large"
                  onClick={handleBuyNow}
                  className="buy-now-btn"
                  disabled={productCart.loading}
                >
                  Mua ngay
                </Button> */}
                <Button type="text" icon={<ShareAltOutlined />} className="share-btn" onClick={() => setSharePopupVisible(true)} />
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
                <Link to={`/shop?category=${product.category}`}>{i18n.language === 'vi' ? getCategoryViLabel(product.category.toLowerCase()) : product.category}</Link>
              </Space>
            </div>

            <div className="product-location">
              <Space>
                <EnvironmentOutlined />
                <Text>Tây Ninh, Việt Nam</Text>
              </Space>
            </div>
            {/* Social Share Section */}
            <SharePopup visible={sharePopupVisible} onClose={() => setSharePopupVisible(false)} url={window.location.href} />
          </div>
        </Col>
      </Row>

      {/* Product Details Tabs */}
      {/* onChange={key => setActiveTab(key)} */}
      <div className="product-details-tabs">
        <Tabs defaultActiveKey="description">
          <TabPane tab={t('product.detail.descriptionTab')} key="description">
            <div className="tab-content">
              <Paragraph>{product.description}</Paragraph>
            </div>
          </TabPane>
          <TabPane tab={`Đánh giá (${reviewsData.length})`} key="reviews">
            <div className="tab-content">
              {reviewsLoading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : (
                <>
                  <div className="reviews-summary">
                    <div className="rating-summary">
                      <div className="average-rating">
                        <Title level={2}>{reviewsData.length === 0 ? '0.0' : product.rating.toFixed(1)}</Title>
                        <Rate disabled defaultValue={reviewsData.length === 0 ? 0 : product.rating} />
                        <Text>{reviewsData.length} đánh giá</Text>
                      </div>
                      <div className="rating-bars">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="rating-bar-item">
                            <Text>{star} sao</Text>
                            <div className="rating-bar">
                              <div
                                className="rating-bar-fill"
                                style={{
                                  width: `${(reviewsData.filter(r => Math.round(r.rating) === star)
                                    .length /
                                    reviewsData.length) *
                                    100
                                    }%`,
                                }}
                              ></div>
                            </div>
                            <Text>
                              {
                                reviewsData.filter(r => Math.round(r.rating) === star).length
                              }
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="write-review">
                      <Button type="primary" icon={<StarOutlined />} onClick={() => setReviewModalVisible(true)}>
                        Viết đánh giá
                      </Button>
                    </div>
                  </div>
                  <Divider />
                  <div className="reviews-list">
                    {reviewsData.length === 0 ? (
                      <div style={{ textAlign: 'center', margin: '32px 0', color: '#888' }}>
                        <Empty description={t('cart.noReviews')} />
                      </div>
                    ) : (
                      reviewsData.map((review: Review) => (
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
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* Shop Information */}
      <div className="shop-info-section">
        <ShopInfo shopId={product.specialtyShopId} />
      </div>

      {/* Related Products */}
      <div className="related-products">
        <Title level={3} className="section-title">
          {t('product.detail.relatedProducts')}
        </Title>
        <RelatedProductsSection
          currentProductId={product.id}
          category={product.category}
          tags={product.tags}
        />
      </div>

      {/* Modal đánh giá */}
      <CreateReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        productId={product?.id || ''}
        productName={product?.name}
        onShowLogin={() => setShowLoginModal(true)}
        onSubmit={handleSubmitReview}
      />
      {/* Modal đăng nhập thực tế */}
      {showLoginModal && (
        <LoginModal
          isVisible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onRegisterClick={() => { }}
        />
      )}

      {/* Thêm khu vực chia sẻ vào UI chi tiết sản phẩm */}

      {/* Kết thúc nội dung chi tiết sản phẩm */}
    </div>
  );
};
export default ProductDetail;
