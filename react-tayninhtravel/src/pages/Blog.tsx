import { useState, useEffect, useMemo } from 'react'
import { Card, Select, Pagination, Empty, Spin, Row, Col } from 'antd'
import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
// ...existing code...
import SearchBarCommon from '@/components/common/SearchBarCommon'
import { Link } from 'react-router-dom'
import { publicService } from '@/services/publicService'
import { type PublicBlog } from '@/types'
import './Blog.scss'

const { Option } = Select


const Blog = () => {
  const { t } = useTranslation()

  const sortOptions = [
    { value: 'newest', label: t('blog.sortNewest') },
    { value: 'oldest', label: t('blog.sortOldest') },
    { value: 'aToZ', label: t('blog.sortAtoZ') },
    { value: 'zToA', label: t('blog.sortZtoA') }
  ]
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [originalBlogs, setOriginalBlogs] = useState<PublicBlog[]>([])
  const [totalBlogs, setTotalBlogs] = useState(0)
  const [loading, setLoading] = useState(false)
  const pageSize = 6

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      try {
        const response = await publicService.getPublicBlogs(currentPage, pageSize, searchText)
        setOriginalBlogs(response.data as unknown as PublicBlog[])
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
          <Typography.Title level={2}>{t('blog.headerTitle')}</Typography.Title>
          <p>{t('blog.headerDesc')}</p>
        </div>

        <SearchBarCommon
          onSearch={handleSearch}
          loading={loading}
          placeholder={t('blog.searchPlaceholder')}
          className="search-bar-common"
          buttonText={t('blog.searchButton')}
        />

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : sortedBlogs.length > 0 ? (
          <>
            <Row gutter={[24, 24]} className="blog-list">
              {sortedBlogs.map((blog: PublicBlog) => (
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
                          {t('blog.byAuthor', { author: blog.authorName })}
                        </span>
                      </div>

                      <h2 className="blog-title">{blog.title}</h2>

                      <div className="blog-footer">
                        <div className="blog-stats">
                          <span>{blog.totalLikes || 0} {t('blog.likes')}</span>
                          <span> • </span>
                          <span>{blog.totalComments || 0} {t('blog.comments')}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>

            <div className="pagination-container">
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
              <div className="pagination-controls">
                <div className="results-info">
                  <span>{`${totalBlogs} ${t('blog.totalPosts')}`}</span>
                </div>
                <Pagination
                  current={currentPage}
                  total={totalBlogs}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => (
                    <span className="results-info-total">
                      {`${range[0]}-${range[1]} ${t('blog.of')} ${total} ${t('blog.totalPosts')}`}
                    </span>
                  )}
                />
              </div>
            </div>
          </>
        ) : (
          <Empty description={t('blog.noPostsFound')} />
        )}
      </div>
    </div>
  )
}

export default Blog
