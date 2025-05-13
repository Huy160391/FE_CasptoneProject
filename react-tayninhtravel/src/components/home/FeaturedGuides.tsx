import { Card, Row, Col, Rate } from 'antd'
import { useTranslation } from 'react-i18next'
import './FeaturedGuides.scss'

const { Meta } = Card

const FeaturedGuides = () => {
    const { t } = useTranslation()

    const guides = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
            rating: 4.8,
            reviews: 128,
            specialties: ['Văn hóa', 'Ẩm thực', 'Lịch sử'],
            experience: '5 năm kinh nghiệm'
        },
        {
            id: 2,
            name: 'Trần Thị B',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            rating: 4.9,
            reviews: 156,
            specialties: ['Thiên nhiên', 'Du lịch mạo hiểm', 'Nhiếp ảnh'],
            experience: '7 năm kinh nghiệm'
        },
        {
            id: 3,
            name: 'Lê Văn C',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            rating: 4.7,
            reviews: 98,
            specialties: ['Tôn giáo', 'Kiến trúc', 'Văn hóa địa phương'],
            experience: '4 năm kinh nghiệm'
        },
        {
            id: 4,
            name: 'Phạm Thị D',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
            rating: 4.9,
            reviews: 142,
            specialties: ['Ẩm thực', 'Mua sắm', 'Văn hóa'],
            experience: '6 năm kinh nghiệm'
        }
    ]

    return (
        <section className="featured-guides">
            <div className="container">
                <h2 className="section-title">{t('home.featuredGuides.title')}</h2>
                <p className="section-subtitle">{t('home.featuredGuides.subtitle')}</p>

                <Row gutter={[24, 24]}>
                    {guides.map((guide) => (
                        <Col xs={24} sm={12} md={6} key={guide.id}>
                            <Card
                                hoverable
                                cover={<img alt={guide.name} src={guide.avatar} />}
                                className="guide-card"
                            >
                                <Meta
                                    title={guide.name}
                                    description={
                                        <div className="guide-info">
                                            <div className="guide-rating">
                                                <Rate disabled defaultValue={guide.rating} allowHalf />
                                                <span className="rating-text">{guide.rating} ({guide.reviews} đánh giá)</span>
                                            </div>
                                            <div className="guide-specialties">
                                                {guide.specialties.map((specialty, index) => (
                                                    <span key={index} className="specialty-tag">
                                                        {specialty}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="guide-experience">
                                                {guide.experience}
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </section>
    )
}

export default FeaturedGuides 