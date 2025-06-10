import { useState, useEffect, useMemo } from 'react'
import { Card, Input, Select, Pagination, Empty, Spin, Row, Col } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { publicService, type Blog } from '@/services/publicService'
import './Blog.scss'

const { Option } = Select

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'aToZ', label: 'A-Z' },
  { value: 'zToA', label: 'Z-A' }
]

const Blog = () => {
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [originalBlogs, setOriginalBlogs] = useState<Blog[]>([])
  const [totalBlogs, setTotalBlogs] = useState(0)
  const [loading, setLoading] = useState(false)
  const pageSize = 6

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      try {
        const response = await publicService.getPublicBlogs(currentPage, pageSize, searchText)
        setOriginalBlogs(response.data)
        setTotalBlogs(response.totalRecords)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [currentPage, searchText])

  // Apply sorting on the client side
  const sortedBlogs = useMemo(() => {
    let result = [...originalBlogs]

    switch (sortBy) {
      case 'newest':
        // Assuming newest is the default from the API, no need to sort
        break
      case 'oldest':
        result.reverse()
        break
      case 'aToZ':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'zToA':
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        break
    }

    return result
  }, [originalBlogs, sortBy])

  const handleSearch = (value: string) => {
    setSearchText(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    // Không cần phải setCurrentPage(1) vì việc sắp xếp không ảnh hưởng đến pagination
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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

          <div className="sort-filter">
            <Select
              defaultValue="newest"
              onChange={handleSortChange}
              className="sort-select"
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : sortedBlogs.length > 0 ? (
          <>
            <Row gutter={[24, 24]} className="blog-list">
              {sortedBlogs.map((blog: Blog) => (
                <Col xs={24} md={12} key={blog.id}>
                  <Link to={`/blog/post/${blog.id}`} className="blog-link">
                    <Card
                      hoverable
                      className="blog-card"
                      cover={
                        <div className="blog-thumbnail">
                          <img alt={blog.title} src={blog.imageUrl && blog.imageUrl.length > 0 ? blog.imageUrl[0] : ''} />
                        </div>
                      }
                    >
                      <div className="blog-meta">
                        <span className="blog-author">
                          Bởi {blog.authorName}
                        </span>
                      </div>

                      <h2 className="blog-title">{blog.title}</h2>

                      <div className="blog-footer">
                        <div className="blog-stats">
                          <span>{blog.totalLikes || 0} lượt thích</span>
                          <span> • </span>
                          <span>{blog.totalComments || 0} bình luận</span>
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
                total={totalBlogs}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
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
