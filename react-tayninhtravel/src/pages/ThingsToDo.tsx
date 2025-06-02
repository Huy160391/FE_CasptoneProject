import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Tag, Rate } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import TourSearchBar from './TourSearchBar'
import './ThingsToDo.scss'

const { Meta } = Card

const ThingsToDo = () => {
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get('location');
  const dateParam = searchParams.get('date');
  const keywordParam = searchParams.get('keyword');
  const { t } = useTranslation();

  const [selectedDestination, setSelectedDestination] = useState(locationParam ? locationParam : 'all')
  const [searchKeyword, setSearchKeyword] = useState(keywordParam || '')
  const [selectedDate, setSelectedDate] = useState(dateParam ? dayjs(dateParam) : null)

  // Update search fields when URL params change
  useEffect(() => {
    if (locationParam) {
      setSelectedDestination(locationParam);
    }

    if (keywordParam) {
      setSearchKeyword(keywordParam);
    }

    if (dateParam) {
      setSelectedDate(dayjs(dateParam));
    }
  }, [locationParam, dateParam, keywordParam]);

  // Mock data for activities
  const activities = [
    {
      id: 1,
      title: 'Leo Núi Bà Đen',
      image: 'https://placehold.co/800x600',
      description: 'Khám phá ngọn núi cao nhất Nam Bộ với cảnh quan tuyệt đẹp và các di tích lịch sử.',
      location: 'Tây Ninh',
      duration: '4-6 giờ',
      price: '100.000 VND',
      rating: 4.7,
      tags: ['Thiên nhiên', 'Phiêu lưu', 'Di tích'],
      availableDates: ['2023-12-15', '2023-12-16', '2023-12-17', '2023-12-18', '2023-12-19'],
    },
    {
      id: 2,
      title: 'Tham quan Tòa Thánh Cao Đài',
      image: 'https://placehold.co/800x600',
      description: 'Khám phá trung tâm của đạo Cao Đài với kiến trúc độc đáo và lịch sử phong phú.',
      location: 'Tây Ninh',
      duration: '2-3 giờ',
      price: 'Miễn phí',
      rating: 4.8,
      tags: ['Văn hóa', 'Tâm linh', 'Kiến trúc'],
      availableDates: ['2023-12-15', '2023-12-16', '2023-12-17', '2023-12-20', '2023-12-21'],
    },
    {
      id: 3,
      title: 'Khu Du Lịch Sinh Thái Núi Bà',
      image: 'https://placehold.co/800x600',
      description: 'Tận hưởng không khí trong lành và các hoạt động giải trí tại khu du lịch sinh thái.',
      location: 'Tây Ninh',
      duration: '1 ngày',
      price: '200.000 VND',
      rating: 4.5,
      tags: ['Thiên nhiên', 'Giải trí', 'Gia đình'],
      availableDates: ['2023-12-16', '2023-12-17', '2023-12-18', '2023-12-19', '2023-12-20'],
    },
    {
      id: 4,
      title: 'Hồ Dầu Tiếng',
      image: 'https://placehold.co/800x600',
      description: 'Tham quan hồ nước ngọt nhân tạo lớn nhất Việt Nam với cảnh quan tuyệt đẹp.',
      location: 'Tây Ninh',
      duration: '3-4 giờ',
      price: '50.000 VND',
      rating: 4.3,
      tags: ['Thiên nhiên', 'Chèo thuyền', 'Picnic'],
      availableDates: ['2023-12-15', '2023-12-18', '2023-12-19', '2023-12-20', '2023-12-21'],
    },
    {
      id: 5,
      title: 'Vườn Quốc Gia Lò Gò - Xa Mát',
      image: 'https://placehold.co/800x600',
      description: 'Khám phá hệ sinh thái đa dạng với nhiều loài động thực vật quý hiếm.',
      location: 'Tây Ninh',
      duration: '1 ngày',
      price: '150.000 VND',
      rating: 4.6,
      tags: ['Thiên nhiên', 'Động vật hoang dã', 'Trekking'],
      availableDates: ['2023-12-16', '2023-12-17', '2023-12-18', '2023-12-22', '2023-12-23'],
    },
    {
      id: 6,
      title: 'Làng Dệt Thổ Cẩm Châu Thành',
      image: 'https://placehold.co/800x600',
      description: 'Tìm hiểu về nghề dệt thổ cẩm truyền thống của người Khmer.',
      location: 'Tây Ninh',
      duration: '2-3 giờ',
      price: '30.000 VND',
      rating: 4.2,
      tags: ['Văn hóa', 'Làng nghề', 'Mua sắm'],
      availableDates: ['2023-12-15', '2023-12-16', '2023-12-19', '2023-12-20', '2023-12-21'],
    },
  ]

  // Filter activities based on destination, date and search keyword
  const filteredActivities = activities.filter(activity => {
    // Match destination - if selectedDestination is 'all' or matches the activity location
    const matchDestination = selectedDestination === 'all' ||
      activity.location.toLowerCase() === selectedDestination.toLowerCase() ||
      (activity.location.toLowerCase() === 'tây ninh' && selectedDestination === 'tayninh');

    // Match keyword - search in title, description and tags
    const matchKeyword = searchKeyword === '' ||
      activity.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      activity.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()));

    // Filter by date if selected
    const matchDate = !selectedDate ||
      activity.availableDates.includes(selectedDate.format('YYYY-MM-DD'));

    return matchDestination && matchKeyword && matchDate;
  })

  return (
    <div className="things-to-do-page">
      <div className="container">
        <div className="page-header">
          <h1>{t('thingsToDo.pageTitle')}</h1>
          <p>{t('thingsToDo.pageSubtitle')}</p>
        </div>

        <div className="search-filter-section">
          <TourSearchBar />
        </div>

        <div className="activities-grid">
          <Row gutter={[24, 24]}>
            {filteredActivities.map(activity => (
              <Col xs={24} sm={12} md={8} key={activity.id}>
                <Card
                  hoverable
                  cover={<img alt={activity.title} src={activity.image} />}
                  className="activity-card"
                >
                  <Meta title={activity.title} />
                  <p className="activity-description">{activity.description}</p>

                  <div className="activity-details">
                    <div className="detail-item">
                      <span className="label">{t('thingsToDo.location')}:</span>
                      <span className="value">{activity.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t('thingsToDo.duration')}:</span>
                      <span className="value">{activity.duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t('thingsToDo.price')}:</span>
                      <span className="value">{activity.price}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t('thingsToDo.rating')}:</span>
                      <Rate disabled defaultValue={activity.rating} allowHalf />
                    </div>
                  </div>

                  <div className="activity-tags">
                    {activity.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>

                  <Link to={`/things-to-do/detail/${activity.id}`}>
                    <Button type="primary" block>
                      {t('thingsToDo.viewDetails')}
                    </Button>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default ThingsToDo
