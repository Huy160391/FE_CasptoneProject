import { useState, useRef } from 'react';
import { Modal, Button, Tag, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Product } from '@/types';
import { getCategoryViLabel } from '@/utils/categoryViLabels';
import './ViewProductModal.scss';

interface ViewProductModalProps {
    visible: boolean;
    onCancel: () => void;
    product: Product | null;
}

const ViewProductModal = ({ visible, onCancel, product }: ViewProductModalProps) => {
    const [activeImage, setActiveImage] = useState(0);
    const carouselRef = useRef<any>(null);

    if (!product) return null;

    const handlePrev = () => {
        if (carouselRef.current) {
            carouselRef.current.prev();
        }
    };

    const handleNext = () => {
        if (carouselRef.current) {
            carouselRef.current.next();
        }
    };

    const handleThumbnailClick = (index: number) => {
        if (carouselRef.current) {
            carouselRef.current.goTo(index);
        }
    };

    const handleCarouselChange = (currentSlide: number) => {
        setActiveImage(currentSlide);
    };

    // Format dates
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <Modal
            title="Chi tiết sản phẩm"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Đóng
                </Button>
            ]}
            width={800}
            className="view-product-modal"
        >
            <div className="product-view">
                <div className="product-gallery">
                    <div className="main-image-container">
                        {product.imageUrl && product.imageUrl.length > 0 ? (
                            <>
                                <Button
                                    className="gallery-nav prev"
                                    icon={<LeftOutlined />}
                                    onClick={handlePrev}
                                    disabled={product.imageUrl.length <= 1}
                                />

                                <Carousel
                                    ref={carouselRef}
                                    afterChange={handleCarouselChange}
                                    dots={false}
                                >
                                    {product.imageUrl.map((image, index) => (
                                        <div key={index} className="carousel-item">
                                            <img src={image} alt={`${product.name} - Ảnh ${index + 1}`} />
                                        </div>
                                    ))}
                                </Carousel>

                                <Button
                                    className="gallery-nav next"
                                    icon={<RightOutlined />}
                                    onClick={handleNext}
                                    disabled={product.imageUrl.length <= 1}
                                />
                            </>
                        ) : (
                            <div className="no-image">Không có hình ảnh</div>
                        )}
                    </div>

                    {product.imageUrl && product.imageUrl.length > 1 && (
                        <div className="thumbnails">
                            {product.imageUrl.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                                    onClick={() => handleThumbnailClick(index)}
                                >
                                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-details">
                    <h1 className="product-name">{product.name}</h1>

                    <div className="product-meta">
                        <Tag color="blue">{getCategoryViLabel(product.category.toLowerCase())}</Tag>
                        <Tag color={product.quantityInStock > 0 ? 'green' : 'red'}>
                            {product.quantityInStock > 0 ? 'Có sẵn' : 'Hết hàng'}
                        </Tag>
                        {product.isSale && (
                            <Tag color="volcano">Giảm giá {product.salePercent}%</Tag>
                        )}
                    </div>

                    <div className="product-price">
                        {product.isSale && product.salePercent ? (
                            <>
                                <span className="price-current">
                                    {(product.price * (1 - product.salePercent / 100)).toLocaleString()} ₫
                                </span>
                                <span className="price-original">{product.price.toLocaleString()} ₫</span>
                            </>
                        ) : (
                            <span className="price-current">{product.price.toLocaleString()} ₫</span>
                        )}
                    </div>

                    <div className="product-stock">
                        <span className="stock-label">Tồn kho:</span>
                        <span className={`stock-value ${product.quantityInStock === 0 ? 'out-of-stock' : product.quantityInStock < 20 ? 'low-stock' : 'in-stock'}`}>
                            {product.quantityInStock} sản phẩm
                        </span>
                    </div>

                    <div className="product-description">
                        <h3>Mô tả sản phẩm</h3>
                        <div className="description-content">
                            {product.description || 'Không có mô tả cho sản phẩm này.'}
                        </div>
                    </div>

                    <div className="product-additional-info">
                        <div className="info-item">
                            <span className="info-label">ID Sản phẩm:</span>
                            <span className="info-value">{product.id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">ID Cửa hàng:</span>
                            <span className="info-value">{product.shopId}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Ngày tạo:</span>
                            <span className="info-value">{formatDate(product.createdAt)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Cập nhật:</span>
                            <span className="info-value">{formatDate(product.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ViewProductModal;
