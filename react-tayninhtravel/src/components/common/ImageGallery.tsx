import React, { useState } from 'react';
import { Image, Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './ImageGallery.scss';

interface ImageGalleryProps {
    images: string[];
    alt?: string;
    height?: number | string;
    showThumbnails?: boolean;
    autoPlay?: boolean;
    className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    alt = 'Gallery Image',
    height = 300,
    showThumbnails = true,
    autoPlay = false,
    className = ''
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If no images, show placeholder
    if (!images || images.length === 0) {
        return (
            <div className={`image-gallery-placeholder ${className}`} style={{ height }}>
                <Image
                    src="https://placehold.co/800x300?text=No+Image"
                    alt={alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preview={false}
                />
            </div>
        );
    }

    // If only one image, show simple image
    if (images.length === 1) {
        return (
            <div className={`image-gallery-single ${className}`}>
                <Image
                    src={images[0]}
                    alt={alt}
                    style={{ width: '100%', height, objectFit: 'cover' }}
                    fallback="https://placehold.co/800x300?text=Image+Error"
                />
            </div>
        );
    }

    // Multiple images - show carousel with thumbnails
    return (
        <div className={`image-gallery ${className}`}>
            {/* Main carousel */}
            <div className="gallery-main" style={{ height }}>
                <Carousel
                    autoplay={autoPlay}
                    dots={false}
                    arrows
                    prevArrow={<Button icon={<LeftOutlined />} />}
                    nextArrow={<Button icon={<RightOutlined />} />}
                    afterChange={setCurrentIndex}
                >
                    {images.map((image, index) => (
                        <div key={index} className="gallery-slide">
                            <Image
                                src={image}
                                alt={`${alt} ${index + 1}`}
                                style={{ width: '100%', height, objectFit: 'cover' }}
                                fallback="https://placehold.co/800x300?text=Image+Error"
                            />
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Thumbnails */}
            {showThumbnails && images.length > 1 && (
                <div className="gallery-thumbnails">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <img
                                src={image}
                                alt={`${alt} thumbnail ${index + 1}`}
                                style={{ width: '100%', height: '60px', objectFit: 'cover' }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Image counter */}
            <div className="gallery-counter">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export default ImageGallery;
