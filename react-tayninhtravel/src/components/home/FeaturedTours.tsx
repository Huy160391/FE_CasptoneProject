import { Row, Col, Card, Button, Rate } from 'antd'
import { useTranslation } from 'react-i18next'
import './FeaturedTours.scss'

const { Meta } = Card

const FeaturedTours = () => {
  const { t } = useTranslation()
  
  const tours = [
    {
      id: 1,
      title: 'Núi Bà Đen',
      image: '/images/tours/nui-ba-den.jpg',
      duration: '1 ngày',
      price: '500.000 VND',
      rating: 4.5,
    },
    {
      id: 2,
      title: 'Tòa Thánh Cao Đài',
      image: '/images/tours/toa-thanh-cao-dai.jpg',
      duration: '1 ngày',
      price: '450.000 VND',
      rating: 4.8,
    },
    {
      id: 3,
      title: 'Khu Du Lịch Suối Đá',
      image: '/images/tours/suoi-da.jpg',
      duration: '1 ngày',
      price: '550.000 VND',
      rating: 4.3,
    },
  ]
  
  return (
    <section className="featured-tours">
      <h2>{t('home.featuredToursTitle')}</h2>
      
      <Row gutter={[24, 24]}>
        {tours.map(tour => (
          <Col xs={24} sm={12} md={8} key={tour.id}>
            <Card
              hoverable
              cover={<img alt={tour.title} src={tour.image} />}
              className="tour-card"
            >
              <Meta title={tour.title} />
              <div className="tour-info">
                <div className="info-item">
                  <span className="label">{t('home.tourInfo.duration')}:</span>
                  <span className="value">{tour.duration}</span>
                </div>
                <div className="info-item">
                  <span className="label">{t('home.tourInfo.price')}:</span>
                  <span className="value">{tour.price}</span>
                </div>
                <div className="info-item">
                  <span className="label">{t('home.tourInfo.rating')}:</span>
                  <Rate disabled defaultValue={tour.rating} allowHalf />
                </div>
              </div>
              <Button type="primary" block>
                {t('tours.bookNow')}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default FeaturedTours
