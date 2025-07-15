import { useState, useRef } from 'react';
import { Modal, Button, Tag, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
    const { i18n } = useTranslation();

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
            title={i18n.language === 'vi' ? 'Chi tiết sản phẩm' : 'Product Details'}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    {i18n.language === 'vi' ? 'Đóng' : 'Close'}
                </Button>
            ]}
            width={800}
            className="view-product-modal"
        >
            <div className="product-view">
                <div className="product-gallery">
                    <div className="main-image-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
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
                                    style={{ width: 320 }}
                                >
                                    {product.imageUrl.map((image, index) => (
                                        <div key={index} className="carousel-item" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                                            <img src={image} alt={`${product.name} - Ảnh ${index + 1}`} style={{ maxHeight: 300, maxWidth: 300, objectFit: 'contain' }} />
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
                        <div className="thumbnails" style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                            {product.imageUrl.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                                    onClick={() => handleThumbnailClick(index)}
                                    style={{ border: activeImage === index ? '2px solid #1890ff' : '1px solid #eee', margin: '0 4px', cursor: 'pointer', padding: 2, borderRadius: 4 }}
                                >
                                    <img src={image} alt={`Thumbnail ${index + 1}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
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
                            {product.quantityInStock > 0 ? (i18n.language === 'vi' ? 'Có sẵn' : 'Available') : (i18n.language === 'vi' ? 'Hết hàng' : 'Out of stock')}
                        </Tag>
                        {product.isSale && (
                            <Tag color="volcano">{i18n.language === 'vi' ? `Giảm giá ${product.salePercent}%` : `Sale ${product.salePercent}%`}</Tag>
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
                        <span className="stock-label">{i18n.language === 'vi' ? 'Tồn kho:' : 'Stock:'}</span>
                        <span className={`stock-value ${product.quantityInStock === 0 ? 'out-of-stock' : product.quantityInStock < 20 ? 'low-stock' : 'in-stock'}`}>
                            {product.quantityInStock} {i18n.language === 'vi' ? 'sản phẩm' : 'items'}
                        </span>
                    </div>
                    <div className="product-description">
                        <h3>{i18n.language === 'vi' ? 'Mô tả sản phẩm' : 'Description'}</h3>
                        <div className="description-content">
                            {product.description || (i18n.language === 'vi' ? 'Không có mô tả cho sản phẩm này.' : 'No description for this product.')}
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
