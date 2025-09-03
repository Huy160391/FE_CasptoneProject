import React from "react"
import dayjs from "dayjs"
import { Row, Col, Card, Typography, Button } from "antd"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import "./BlogPosts.scss"

const { Title, Paragraph } = Typography

const BlogPosts: React.FC = () => {
    const { t } = useTranslation()

    const [posts, setPosts] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await import('@/services/publicService').then(mod => mod.publicService.getPublicBlogs(1));
                const apiPosts = (response.data || []).slice(0, 3).map((b: any) => ({
                    id: b.id,
                    title: b.title,
                    excerpt: b.excerpt || b.summary || '',
                    image: b.imageUrl && b.imageUrl.length > 0 ? b.imageUrl[0] : '/placeholder.svg',
                    date: b.date || b.createdAt || '',
                    category: b.category || '',
                    featured: b.featured || false,
                }));
                setPosts(apiPosts);
            } catch {
                setPosts([]);
            }
        };
        fetchBlogs();
    }, []);

    // Sắp xếp posts theo ngày giảm dần
    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = dayjs(a.date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD']);
        const dateB = dayjs(b.date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD']);
        return dateB.valueOf() - dateA.valueOf();
    });

    return (
        <section className="blog-posts">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t("home.blogPosts.title")}</h2>
                    <p className="section-subtitle">{t("home.blogPosts.subtitle")}</p>
                </div>

                <Row gutter={[24, 24]} className="bento-grid">
                    {/* Hai bài nhỏ bên trái xếp dọc */}
                    <Col xs={24} md={8} className="post-col left-posts">
                        <div className="left-stack">
                            {Array.from({ length: 2 }).map((_, idx) => {
                                const post = sortedPosts[idx + 1];
                                if (post) {
                                    return (
                                        <Link to={`/blog/post/${post.id}`} className="post-link" key={post.id}>
                                            <Card
                                                hoverable
                                                cover={
                                                    <div className="post-image small">
                                                        <img alt={post.title} src={post.image || "https://placehold.co/400x400?text=No+Image"} />
                                                        <div className="post-category">{post.category}</div>
                                                    </div>
                                                }
                                                className="post-card small"
                                            >
                                                <div className="post-content">
                                                    <Title level={4}>{post.title}</Title>
                                                    <Paragraph className="post-excerpt">{post.excerpt}</Paragraph>
                                                    <div className="post-meta">
                                                        <span className="post-date">{dayjs(post.date).isValid() ? dayjs(post.date).format('DD/MM/YYYY') : post.date}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    );
                                } else {
                                    return (
                                        <Card
                                            hoverable
                                            cover={
                                                <div className="post-image small">
                                                    <img alt="Placeholder" src="https://placehold.co/400x400?text=No+Image" />
                                                    <div className="post-category">Blog</div>
                                                </div>
                                            }
                                            className="post-card small"
                                            key={idx}
                                        >
                                            <div className="post-content">
                                                <Title level={4}>Bài viết đang cập nhật</Title>
                                                <Paragraph className="post-excerpt">Nội dung sẽ được bổ sung sớm.</Paragraph>
                                                <div className="post-meta">
                                                    <span className="post-date">--/--/----</span>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                }
                            })}
                        </div>
                    </Col>

                    {/* Bài post chính lớn bên phải */}
                    <Col xs={24} md={16} className="post-col featured-post">
                        {sortedPosts[0]
                            ? (
                                <Link to={`/blog/post/${sortedPosts[0].id}`} className="post-link">
                                    <Card
                                        hoverable
                                        cover={
                                            <div className="post-image">
                                                <img alt={sortedPosts[0].title} src={sortedPosts[0].image || "https://placehold.co/400x400?text=No+Image"} />
                                                <div className="post-category">{sortedPosts[0].category}</div>
                                            </div>
                                        }
                                        className="post-card"
                                    >
                                        <div className="post-content">
                                            <Title level={3}>{sortedPosts[0].title}</Title>
                                            <Paragraph className="post-excerpt">{sortedPosts[0].excerpt}</Paragraph>
                                            <div className="post-meta">
                                                <span className="post-date">{dayjs(sortedPosts[0].date).isValid() ? dayjs(sortedPosts[0].date).format('DD/MM/YYYY') : sortedPosts[0].date}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            )
                            : (
                                <Card
                                    hoverable
                                    cover={
                                        <div className="post-image">
                                            <img alt="Placeholder" src="/placeholder.svg" />
                                            <div className="post-category">Blog</div>
                                        </div>
                                    }
                                    className="post-card"
                                >
                                    <div className="post-content">
                                        <Title level={3}>Bài viết đang cập nhật</Title>
                                        <Paragraph className="post-excerpt">Nội dung sẽ được bổ sung sớm.</Paragraph>
                                        <div className="post-meta">
                                            <span className="post-date">--/--/----</span>
                                        </div>
                                    </div>
                                </Card>
                            )
                        }
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
