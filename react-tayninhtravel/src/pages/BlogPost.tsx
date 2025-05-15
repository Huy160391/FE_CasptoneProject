import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Row, Col, Breadcrumb, Tag, Divider, Avatar, Card, Typography, Button, Skeleton } from 'antd'
import {
  CalendarOutlined,
  EyeOutlined,
  UserOutlined,
  TagOutlined,
  ShareAltOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import './BlogPost.scss'

const { Title, Text } = Typography
// Paragraph,
// Mock blog data (same as in Blog.tsx)
const blogs = [
  {
    id: 1,
    title: 'Khám phá Núi Bà Đen - Nóc nhà Nam Bộ',
    summary: 'Hành trình chinh phục đỉnh núi cao nhất Nam Bộ và khám phá những điều thú vị tại Núi Bà Đen, Tây Ninh.',
    content: `<p>Núi Bà Đen là ngọn núi cao nhất Nam Bộ với độ cao 986m so với mực nước biển. Đây không chỉ là địa điểm du lịch nổi tiếng mà còn là nơi có ý nghĩa tâm linh quan trọng đối với người dân địa phương.</p>
    
    <p>Khi đến với Núi Bà Đen, du khách có thể lựa chọn đi bộ theo các bậc thang đá hoặc sử dụng hệ thống cáp treo hiện đại để lên đỉnh núi. Hệ thống cáp treo Núi Bà Đen được đưa vào hoạt động từ năm 2020, giúp du khách tiết kiệm thời gian và sức lực, đồng thời có cơ hội ngắm nhìn toàn cảnh Tây Ninh từ trên cao.</p>
    
    <h3>Điểm tham quan nổi bật</h3>
    
    <p>Trên núi Bà Đen có nhiều điểm tham quan hấp dẫn như:</p>
    
    <ul>
      <li><strong>Chùa Bà:</strong> Ngôi chùa cổ thờ Bà Đen (Linh Sơn Tiên Thạch Tự), nơi diễn ra các lễ hội lớn hàng năm.</li>
      <li><strong>Động Thanh Long:</strong> Hang động tự nhiên với nhiều nhũ đá có hình thù kỳ lạ.</li>
      <li><strong>Thác Đồng Đen:</strong> Thác nước đẹp nằm giữa rừng già.</li>
      <li><strong>Đỉnh Núi Bà Đen:</strong> Nơi có thể ngắm toàn cảnh Tây Ninh và các tỉnh lân cận.</li>
    </ul>
    
    <h3>Lễ hội Núi Bà</h3>
    
    <p>Hàng năm, vào dịp rằm tháng Giêng (lễ hội Xuân) và rằm tháng 7 (lễ hội Thu), tại Núi Bà Đen diễn ra lễ hội truyền thống thu hút hàng trăm nghìn lượt khách hành hương từ khắp nơi đổ về. Đây là dịp để người dân cầu an, cầu tài lộc và tỏ lòng thành kính với Bà Đen.</p>
    
    <h3>Kinh nghiệm du lịch Núi Bà Đen</h3>
    
    <p>Để có chuyến đi trọn vẹn, du khách nên lưu ý:</p>
    
    <ul>
      <li>Thời điểm lý tưởng để tham quan Núi Bà Đen là từ tháng 11 đến tháng 4 năm sau, khi thời tiết mát mẻ, ít mưa.</li>
      <li>Nên mang theo nước uống, đồ ăn nhẹ và mặc trang phục thoải mái, giày dép phù hợp nếu chọn đi bộ leo núi.</li>
      <li>Giá vé cáp treo dao động từ 150.000đ đến 400.000đ tùy theo loại vé và tuyến cáp.</li>
      <li>Nên dành ít nhất một ngày để khám phá đầy đủ các điểm tham quan trên núi.</li>
    </ul>
    
    <p>Núi Bà Đen không chỉ là điểm đến lý tưởng cho những người yêu thích thiên nhiên, mà còn là nơi để tìm hiểu về văn hóa tâm linh và lịch sử của vùng đất Tây Ninh. Hãy đến và trải nghiệm để cảm nhận hết vẻ đẹp hùng vĩ của "nóc nhà Nam Bộ" này!</p>`,
    thumbnail: 'https://placehold.co/1200x600',
    author: 'Nguyễn Văn A',
    authorAvatar: 'https://placehold.co/100x100',
    authorBio: 'Blogger du lịch với hơn 5 năm kinh nghiệm khám phá các điểm đến trong nước và quốc tế.',
    date: '15/03/2024',
    category: 'Du lịch',
    tags: ['Núi Bà Đen', 'Tây Ninh', 'Du lịch'],
    views: 1250
  },
  {
    id: 2,
    title: 'Tòa Thánh Cao Đài - Kiến trúc độc đáo của Tây Ninh',
    summary: 'Tìm hiểu về kiến trúc độc đáo và ý nghĩa văn hóa của Tòa Thánh Cao Đài, trung tâm của đạo Cao Đài tại Tây Ninh.',
    content: `<p>Tòa Thánh Cao Đài là công trình kiến trúc tôn giáo độc đáo, được xây dựng từ năm 1933 đến năm 1955. Đây là trung tâm của đạo Cao Đài, một tôn giáo bản địa của Việt Nam ra đời vào năm 1926.</p>
    
    <p>Tọa lạc tại thị trấn Hòa Thành, cách trung tâm thành phố Tây Ninh khoảng 5km, Tòa Thánh Cao Đài là một quần thể kiến trúc rộng lớn với diện tích khoảng 140ha. Công trình chính là Đền Thánh với lối kiến trúc kết hợp hài hòa giữa phương Đông và phương Tây, mang đậm dấu ấn của nhiều tôn giáo lớn trên thế giới.</p>
    
    <h3>Kiến trúc độc đáo</h3>
    
    <p>Tòa Thánh Cao Đài có kiến trúc vô cùng đặc biệt với những đặc điểm nổi bật:</p>
    
    <ul>
      <li><strong>Mặt tiền:</strong> Được thiết kế theo phong cách Gothic của châu Âu với hai tháp chuông cao 36m.</li>
      <li><strong>Nội thất:</strong> Kết hợp nhiều yếu tố từ các tôn giáo khác nhau như Phật giáo, Kitô giáo, Hồi giáo, Khổng giáo và Đạo giáo.</li>
      <li><strong>Cột trụ:</strong> 28 cột trụ lớn được trang trí với hình rồng uốn lượn, tượng trưng cho 28 tầng trời trong vũ trụ quan của đạo Cao Đài.</li>
      <li><strong>Màu sắc:</strong> Sử dụng ba màu chính là xanh, đỏ, vàng tượng trưng cho Tam giáo (Phật, Lão, Khổng).</li>
    </ul>
    
    <h3>Ý nghĩa tâm linh</h3>
    
    <p>Đạo Cao Đài là tôn giáo kết hợp tinh hoa của nhiều tôn giáo lớn trên thế giới với triết lý "Tam giáo quy nguyên, Ngũ chi phục nhất" (ba tôn giáo trở về một gốc, năm nhánh tôn giáo hợp nhất). Biểu tượng của đạo Cao Đài là Thiên Nhãn (Con mắt thần) tượng trưng cho sự giám sát của Đấng Tối cao.</p>
    
    <p>Hàng ngày tại Tòa Thánh diễn ra bốn thời cúng: Tý (0h), Ngọ (12h), Mẹo (6h) và Dậu (18h). Du khách có thể tham quan và quan sát các nghi lễ này từ khu vực dành cho khách tham quan.</p>
    
    <h3>Kinh nghiệm tham quan</h3>
    
    <ul>
      <li>Thời gian tham quan lý tưởng: 7h-11h30 và 13h-17h hàng ngày.</li>
      <li>Trang phục: Nên mặc trang phục lịch sự, kín đáo khi vào Tòa Thánh.</li>
      <li>Chụp ảnh: Được phép chụp ảnh ở hầu hết các khu vực, trừ một số nơi có biển cấm.</li>
      <li>Hướng dẫn viên: Có thể thuê hướng dẫn viên tại cổng để hiểu rõ hơn về lịch sử và ý nghĩa của các công trình.</li>
    </ul>
    
    <p>Tòa Thánh Cao Đài không chỉ là trung tâm tôn giáo quan trọng mà còn là điểm đến du lịch hấp dẫn, thu hút hàng nghìn du khách trong và ngoài nước mỗi năm. Đây là nơi lý tưởng để tìm hiểu về một tôn giáo độc đáo của Việt Nam và chiêm ngưỡng một công trình kiến trúc mang tính biểu tượng của vùng đất Tây Ninh.</p>`,
    thumbnail: 'https://placehold.co/1200x600',
    author: 'Trần Thị B',
    authorAvatar: 'https://placehold.co/100x100',
    authorBio: 'Nhà nghiên cứu văn hóa với nhiều công trình nghiên cứu về văn hóa tâm linh Việt Nam.',
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
    thumbnail: 'https://placehold.co/1200x600',
    author: 'Lê Văn C',
    authorAvatar: 'https://placehold.co/100x100',
    authorBio: 'Đầu bếp và blogger ẩm thực chuyên giới thiệu các món ăn đặc sản vùng miền.',
    date: '05/03/2024',
    category: 'Ẩm thực',
    tags: ['Ẩm thực', 'Đặc sản', 'Tây Ninh'],
    views: 1560
  }
]

// Mock related posts function
const getRelatedPosts = (currentId: number, currentTags: string[]) => {
  return blogs
    .filter(blog => blog.id !== currentId && blog.tags.some(tag => currentTags.includes(tag)))
    .slice(0, 3)
}

const BlogPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [relatedPosts, setRelatedPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setLoading(true)
    setTimeout(() => {
      const foundPost = blogs.find(blog => blog.id === parseInt(id || '0'))
      if (foundPost) {
        setPost(foundPost)
        setRelatedPosts(getRelatedPosts(foundPost.id, foundPost.tags))
      }
      setLoading(false)
    }, 800)
  }, [id])

  const handleGoBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton.Image className="skeleton-image" />
          <Skeleton active paragraph={{ rows: 15 }} />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="not-found">
            <Title level={3}>Không tìm thấy bài viết</Title>
            <Text>Bài viết này không tồn tại hoặc đã bị xóa.</Text>
            <Button type="primary" onClick={handleGoBack}>
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="container">
        <div className="post-header">
          <Breadcrumb
            className="breadcrumb"
            items={[
              { title: <Link to="/">Trang Chủ</Link> },
              { title: <Link to="/blog">Blog</Link> },
              { title: post.title }
            ]}
          />

          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            className="back-button"
          >
            Quay lại
          </Button>

          <Title level={1} className="post-title">
            {post.title}
          </Title>

          <div className="post-meta">
            <div className="meta-item">
              <CalendarOutlined /> {post.date}
            </div>
            <div className="meta-item">
              <EyeOutlined /> {post.views} lượt xem
            </div>
            <div className="meta-item">
              <TagOutlined /> {post.category}
            </div>
          </div>

          <div className="post-tags">
            {post.tags.map((tag: string, index: number) => (
              <Tag key={index} className="post-tag">
                {tag}
              </Tag>
            ))}
          </div>
        </div>

        <div className="post-featured-image">
          <img src={post.thumbnail} alt={post.title} />
        </div>

        <Row gutter={[32, 32]} className="post-content-wrapper">
          <Col xs={24} lg={16} className="post-content">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />

            <Divider />

            <div className="post-share">
              <Text strong>Chia sẻ bài viết:</Text>
              <div className="share-buttons">
                <Button type="text" icon={<FacebookOutlined />} />
                <Button type="text" icon={<TwitterOutlined />} />
                <Button type="text" icon={<LinkedinOutlined />} />
                <Button type="text" icon={<ShareAltOutlined />} />
              </div>
            </div>

            <div className="post-author">
              <Avatar
                size={64}
                src={post.authorAvatar}
                icon={<UserOutlined />}
              />
              <div className="author-info">
                <Title level={5}>Tác giả: {post.author}</Title>
                <Text>{post.authorBio}</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={8} className="post-sidebar">
            <div className="sidebar-section">
              <Title level={4} className="section-title">
                Bài viết liên quan
              </Title>

              {relatedPosts.length > 0 ? (
                <div className="related-posts">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      to={`/blog/post/${relatedPost.id}`}
                      key={relatedPost.id}
                      className="related-post-link"
                    >
                      <Card className="related-post-card">
                        <div className="related-post-image">
                          <img src={relatedPost.thumbnail} alt={relatedPost.title} />
                        </div>
                        <div className="related-post-info">
                          <h4>{relatedPost.title}</h4>
                          <div className="related-post-meta">
                            <CalendarOutlined /> {relatedPost.date}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Text>Không có bài viết liên quan</Text>
              )}
            </div>

            <div className="sidebar-section">
              <Title level={4} className="section-title">
                Danh mục
              </Title>

              <div className="categories-list">
                <Link to="/blog?category=Du lịch" className="category-link">
                  Du lịch
                </Link>
                <Link to="/blog?category=Văn hóa" className="category-link">
                  Văn hóa
                </Link>
                <Link to="/blog?category=Ẩm thực" className="category-link">
                  Ẩm thực
                </Link>
                <Link to="/blog?category=Lễ hội" className="category-link">
                  Lễ hội
                </Link>
                <Link to="/blog?category=Kinh nghiệm" className="category-link">
                  Kinh nghiệm
                </Link>
              </div>
            </div>

            <div className="sidebar-section">
              <Title level={4} className="section-title">
                Tags phổ biến
              </Title>

              <div className="tags-cloud">
                <Tag className="tag-item">Tây Ninh</Tag>
                <Tag className="tag-item">Du lịch</Tag>
                <Tag className="tag-item">Núi Bà Đen</Tag>
                <Tag className="tag-item">Tòa Thánh</Tag>
                <Tag className="tag-item">Ẩm thực</Tag>
                <Tag className="tag-item">Văn hóa</Tag>
                <Tag className="tag-item">Lễ hội</Tag>
                <Tag className="tag-item">Cao Đài</Tag>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default BlogPost
