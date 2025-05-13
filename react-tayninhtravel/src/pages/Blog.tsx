import { useState } from 'react'
import { Row, Col, Card, Input, Select, Pagination, Tag, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import './Blog.scss'

const { Option } = Select

// Mock blog data
const blogs = [
  {
    id: 1,
    title: 'Khám phá Núi Bà Đen - Nóc nhà Nam Bộ',
    summary: 'Hành trình chinh phục đỉnh núi cao nhất Nam Bộ và khám phá những điều thú vị tại Núi Bà Đen, Tây Ninh.',
    content: 'Núi Bà Đen là ngọn núi cao nhất Nam Bộ với độ cao 986m so với mực nước biển. Đây không chỉ là địa điểm du lịch nổi tiếng mà còn là nơi có ý nghĩa tâm linh quan trọng đối với người dân địa phương...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Nguyễn Văn A',
    date: '15/03/2024',
    category: 'Du lịch',
    tags: ['Núi Bà Đen', 'Tây Ninh', 'Du lịch'],
    views: 1250
  },
  {
    id: 2,
    title: 'Tòa Thánh Cao Đài - Kiến trúc độc đáo của Tây Ninh',
    summary: 'Tìm hiểu về kiến trúc độc đáo và ý nghĩa văn hóa của Tòa Thánh Cao Đài, trung tâm của đạo Cao Đài tại Tây Ninh.',
    content: 'Tòa Thánh Cao Đài là công trình kiến trúc tôn giáo độc đáo, được xây dựng từ năm 1933 đến năm 1955. Đây là trung tâm của đạo Cao Đài, một tôn giáo bản địa của Việt Nam ra đời vào năm 1926...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Trần Thị B',
    date: '10/03/2024',
    category: 'Văn hóa',
    tags: ['Tòa Thánh', 'Cao Đài', 'Tây Ninh', 'Văn hóa'],
    views: 980
  },
  {
    id: 3,
    title: 'Ẩm thực Tây Ninh - Những món ngon không thể bỏ qua',
    summary: 'Khám phá những món ăn đặc sản nổi tiếng của Tây Ninh mà bạn không nên bỏ lỡ khi đến thăm vùng đất này.',
    content: 'Tây Ninh không chỉ nổi tiếng với các địa điểm du lịch mà còn có nền ẩm thực phong phú với nhiều món ăn đặc sản độc đáo. Từ bánh canh Trảng Bàng, bánh tráng phơi sương đến mắm Châu Đốc...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Lê Văn C',
    date: '05/03/2024',
    category: 'Ẩm thực',
    tags: ['Ẩm thực', 'Đặc sản', 'Tây Ninh'],
    views: 1560
  },
  {
    id: 4,
    title: 'Lễ hội Yến Sào - Nét văn hóa đặc sắc của Tây Ninh',
    summary: 'Tìm hiểu về lễ hội Yến Sào, một trong những lễ hội truyền thống đặc sắc của người dân Tây Ninh.',
    content: 'Lễ hội Yến Sào là một trong những lễ hội truyền thống lâu đời của người dân Tây Ninh, thường được tổ chức vào tháng 3 âm lịch hàng năm. Đây là dịp để người dân địa phương tưởng nhớ và tỏ lòng biết ơn...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Phạm Thị D',
    date: '01/03/2024',
    category: 'Văn hóa',
    tags: ['Lễ hội', 'Văn hóa', 'Tây Ninh'],
    views: 820
  },
  {
    id: 5,
    title: 'Hồ Dầu Tiếng - Điểm đến lý tưởng cho dã ngoại cuối tuần',
    summary: 'Khám phá vẻ đẹp của Hồ Dầu Tiếng, một điểm đến lý tưởng cho các hoạt động dã ngoại cuối tuần gần Tây Ninh.',
    content: 'Hồ Dầu Tiếng là hồ nước nhân tạo lớn nhất Việt Nam, nằm trên địa phận hai tỉnh Tây Ninh và Bình Dương. Với diện tích mặt nước rộng lớn và cảnh quan thiên nhiên tuyệt đẹp, đây là điểm đến lý tưởng...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Nguyễn Văn E',
    date: '25/02/2024',
    category: 'Du lịch',
    tags: ['Hồ Dầu Tiếng', 'Dã ngoại', 'Tây Ninh'],
    views: 1100
  },
  {
    id: 6,
    title: 'Làng nghề truyền thống Tây Ninh - Giá trị văn hóa cần được bảo tồn',
    summary: 'Tìm hiểu về các làng nghề truyền thống của Tây Ninh và những nỗ lực bảo tồn giá trị văn hóa độc đáo này.',
    content: 'Tây Ninh có nhiều làng nghề truyền thống với lịch sử phát triển lâu đời như làng nghề bánh tráng Trảng Bàng, làng nghề đan lát Phước Chỉ, làng nghề rèn Thái Bình... Những làng nghề này không chỉ tạo ra các sản phẩm...',
    thumbnail: 'https://placehold.co/600x400',
    author: 'Trần Văn F',
    date: '20/02/2024',
    category: 'Văn hóa',
    tags: ['Làng nghề', 'Văn hóa', 'Tây Ninh'],
    views: 750
  }
]

const categories = ['Tất cả', 'Du lịch', 'Văn hóa', 'Ẩm thực', 'Lễ hội', 'Kinh nghiệm']

const Blog = () => {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 4

  const handleSearch = (value: string) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Filter blogs based on search text and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchText.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'Tất cả' || blog.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Paginate blogs
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="blog-page">
      <div className="container">
        <div className="blog-header">
          <h1>Blog Du Lịch Tây Ninh</h1>
          <p>Khám phá những câu chuyện, kinh nghiệm và thông tin hữu ích về Tây Ninh</p>
        </div>
        
        <div className="filter-bar">
          <div className="search-box">
            <Input
              placeholder="Tìm kiếm bài viết..."
              prefix={<SearchOutlined />}
              onChange={e => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <Select
              defaultValue="Tất cả"
              onChange={handleCategoryChange}
              className="category-select"
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </div>
        </div>
        
        {paginatedBlogs.length > 0 ? (
          <>
            <Row gutter={[24, 24]} className="blog-list">
              {paginatedBlogs.map(blog => (
                <Col xs={24} md={12} key={blog.id}>
                  <Link to={`/blog/post/${blog.id}`} className="blog-link">
                    <Card 
                      hoverable 
                      className="blog-card"
                      cover={
                        <div className="blog-thumbnail">
                          <img alt={blog.title} src={blog.thumbnail} />
                          <div className="blog-category">{blog.category}</div>
                        </div>
                      }
                    >
                      <div className="blog-meta">
                        <span className="blog-date">{blog.date}</span>
                        <span className="blog-views">{blog.views} lượt xem</span>
                      </div>
                      
                      <h2 className="blog-title">{blog.title}</h2>
                      <p className="blog-summary">{blog.summary}</p>
                      
                      <div className="blog-footer">
                        <div className="blog-tags">
                          {blog.tags.slice(0, 2).map((tag, index) => (
                            <Tag key={index}>{tag}</Tag>
                          ))}
                          {blog.tags.length > 2 && <Tag>+{blog.tags.length - 2}</Tag>}
                        </div>
                        <div className="blog-author">
                          <span>Bởi {blog.author}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
            
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={filteredBlogs.length}
                pageSize={pageSize}
                onChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <Empty description="Không tìm thấy bài viết nào" />
        )}
      </div>
    </div>
  )
}

export default Blog
