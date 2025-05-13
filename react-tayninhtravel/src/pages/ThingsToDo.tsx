import { useState } from 'react'
import { Row, Col, Card, Button, Tag, Rate, Select, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import './ThingsToDo.scss'

const { Meta } = Card
const { Option } = Select

const ThingsToDo = () => {
  const [selectedDestination, setSelectedDestination] = useState('tayninh')
  const [searchKeyword, setSearchKeyword] = useState('')

  // Mock data for activities
  const activities = [
    {
      id: 1,
      title: 'Leo Núi Bà Đen',
      image: '/images/activities/nui-ba-den.jpg',
      description: 'Khám phá ngọn núi cao nhất Nam Bộ với cảnh quan tuyệt đẹp và các di tích lịch sử.',
      location: 'Tây Ninh',
      duration: '4-6 giờ',
      price: '100.000 VND',
      rating: 4.7,
      tags: ['Thiên nhiên', 'Phiêu lưu', 'Di tích'],
    },
    {
      id: 2,
      title: 'Tham quan Tòa Thánh Cao Đài',
      image: '/images/activities/toa-thanh-cao-dai.jpg',
      description: 'Khám phá trung tâm của đạo Cao Đài với kiến trúc độc đáo và lịch sử phong phú.',
      location: 'Tây Ninh',
      duration: '2-3 giờ',
      price: 'Miễn phí',
      rating: 4.8,
      tags: ['Văn hóa', 'Tâm linh', 'Kiến trúc'],
    },
    {
      id: 3,
      title: 'Khu Du Lịch Sinh Thái Núi Bà',
      image: '/images/activities/khu-du-lich-nui-ba.jpg',
      description: 'Tận hưởng không khí trong lành và các hoạt động giải trí tại khu du lịch sinh thái.',
      location: 'Tây Ninh',
      duration: '1 ngày',
      price: '200.000 VND',
      rating: 4.5,
      tags: ['Thiên nhiên', 'Giải trí', 'Gia đình'],
    },
    {
      id: 4,
      title: 'Hồ Dầu Tiếng',
      image: '/images/activities/ho-dau-tieng.jpg',
      description: 'Tham quan hồ nước ngọt nhân tạo lớn nhất Việt Nam với cảnh quan tuyệt đẹp.',
      location: 'Tây Ninh',
      duration: '3-4 giờ',
      price: '50.000 VND',
      rating: 4.3,
      tags: ['Thiên nhiên', 'Chèo thuyền', 'Picnic'],
    },
    {
      id: 5,
      title: 'Vườn Quốc Gia Lò Gò - Xa Mát',
      image: '/images/activities/lo-go-xa-mat.jpg',
      description: 'Khám phá hệ sinh thái đa dạng với nhiều loài động thực vật quý hiếm.',
      location: 'Tây Ninh',
      duration: '1 ngày',
      price: '150.000 VND',
      rating: 4.6,
      tags: ['Thiên nhiên', 'Động vật hoang dã', 'Trekking'],
    },
    {
      id: 6,
      title: 'Làng Dệt Thổ Cẩm Châu Thành',
      image: '/images/activities/lang-det-tho-cam.jpg',
      description: 'Tìm hiểu về nghề dệt thổ cẩm truyền thống của người Khmer.',
      location: 'Tây Ninh',
      duration: '2-3 giờ',
      price: '30.000 VND',
      rating: 4.2,
      tags: ['Văn hóa', 'Làng nghề', 'Mua sắm'],
    },
  ]

  // Filter activities based on destination and search keyword
  const filteredActivities = activities.filter(activity => {
    const matchDestination = selectedDestination === 'all' ||
      activity.location.toLowerCase() === selectedDestination.toLowerCase()

    const matchKeyword = searchKeyword === '' ||
      activity.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      activity.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()))

    return matchDestination && matchKeyword
  })

  return (
    <div className="things-to-do-page">
      <div className="container">
        <div className="page-header">
          <h1>Khám phá Tây Ninh</h1>
          <p>Trải nghiệm những hoạt động thú vị và địa điểm tham quan hấp dẫn</p>
        </div>

        <div className="search-filter-bar">
          <div className="destination-section">
            <span className="label">Điểm Đến</span>
            <Select
              value={selectedDestination}
              onChange={setSelectedDestination}
              className="destination-select"
            >
              <Option value="all">Tất cả</Option>
              <Option value="tayninh">Tây Ninh</Option>
              <Option value="hcm">Hồ Chí Minh</Option>
              <Option value="danang">Đà Nẵng</Option>
              <Option value="hanoi">Hà Nội</Option>
            </Select>
          </div>

          <div className="keyword-section">
            <span className="label">Từ khóa (Không Bắt Buộc)</span>
            <Input
              placeholder="Tìm kiếm điểm tham quan hoặc hoạt động"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="keyword-input"
            />
          </div>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            className="search-button"
            onClick={() => {/* Handle search */}}
          />
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
                      <span className="label">Địa điểm:</span>
                      <span className="value">{activity.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Thời gian:</span>
                      <span className="value">{activity.duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Giá:</span>
                      <span className="value">{activity.price}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Đánh giá:</span>
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
                      Xem chi tiết
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
