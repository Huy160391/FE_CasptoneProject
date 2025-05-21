import type React from "react"
import { Row, Col, Card, Typography, Button } from "antd"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import "./BlogPosts.scss"

const { Title, Paragraph } = Typography

const BlogPosts: React.FC = () => {
    const { t } = useTranslation()

    const posts = [
        {
            id: 1,
            title: "Khám phá vẻ đẹp huyền bí của Núi Bà Đen",
            excerpt:
                "Núi Bà Đen - ngọn núi thiêng liêng của Tây Ninh, nơi hội tụ văn hóa tâm linh và cảnh quan thiên nhiên tuyệt đẹp...",
            image: "https://www.vietourist.com.vn/public/frontend/uploads/kceditor/images/Nui-Ba-Den1.jpg",
            date: "15/03/2024",
            category: "Du lịch",
            featured: true,
        },
        {
            id: 2,
            title: "Ẩm thực Tây Ninh: Hương vị đặc trưng miền Đông",
            excerpt: "Khám phá những món ăn đặc sản của Tây Ninh, từ bánh tráng phơi sương đến bánh canh Trảng Bàng...",
            image: "https://www.vietourist.com.vn/public/frontend/uploads/kceditor/images/Nui-Ba-Den1.jpg",
            date: "14/03/2024",
            category: "Ẩm thực",
        },
        {
            id: 3,
            title: "Lễ hội Tòa Thánh Cao Đài: Nét văn hóa độc đáo",
            excerpt:
                "Tìm hiểu về lễ hội truyền thống của Tòa Thánh Cao Đài, một trong những công trình kiến trúc độc đáo nhất Việt Nam...",
            image: "https://www.vietourist.com.vn/public/frontend/uploads/kceditor/images/Nui-Ba-Den1.jpg",
            date: "13/03/2024",
            category: "Văn hóa",
        },
        {
            id: 4,
            title: "Trải nghiệm homestay tại Tây Ninh",
            excerpt:
                "Khám phá những homestay đẹp và độc đáo tại Tây Ninh, nơi bạn có thể trải nghiệm cuộc sống địa phương...",
            image: "https://www.vietourist.com.vn/public/frontend/uploads/kceditor/images/Nui-Ba-Den1.jpg",
            date: "12/03/2024",
            category: "Du lịch",
        },
    ]

    return (
        <section className="blog-posts">
            <div className="container">
                <div className="section-header">
                    <Title level={2}>{t("home.blogPosts.title")}</Title>
                    <Paragraph>{t("home.blogPosts.subtitle")}</Paragraph>
                </div>

                <Row gutter={[24, 24]} className="bento-grid">
                    {/* Hai bài nhỏ bên trái xếp dọc */}
                    <Col xs={24} md={8} className="post-col left-posts">
                        <div className="left-stack">
                            {posts.slice(1, 3).map((post) => (
                                <Link to={`/blog/${post.id}`} className="post-link" key={post.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div className="post-image small">
                                                <img alt={post.title} src={post.image || "/placeholder.svg"} />
                                                <div className="post-category">{post.category}</div>
                                            </div>
                                        }
                                        className="post-card small"
                                    >
                                        <div className="post-content">
                                            <Title level={4}>{post.title}</Title>
                                            <Paragraph className="post-excerpt">{post.excerpt}</Paragraph>
                                            <div className="post-meta">
                                                <span className="post-date">{post.date}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </Col>

                    {/* Bài post chính lớn bên phải */}
                    <Col xs={24} md={16} className="post-col featured-post">
                        <Link to={`/blog/${posts[0].id}`} className="post-link">
                            <Card
                                hoverable
                                cover={
                                    <div className="post-image">
                                        <img alt={posts[0].title} src={posts[0].image || "/placeholder.svg"} />
                                        <div className="post-category">{posts[0].category}</div>
                                    </div>
                                }
                                className="post-card"
                            >
                                <div className="post-content">
                                    <Title level={3}>{posts[0].title}</Title>
                                    <Paragraph className="post-excerpt">{posts[0].excerpt}</Paragraph>
                                    <div className="post-meta">
                                        <span className="post-date">{posts[0].date}</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </Col>
                </Row>

                <div className="view-more">
                    <Link to="/blog">
                        <Button type="primary" size="large">
                            {t("home.blogPosts.viewMore")}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default BlogPosts
