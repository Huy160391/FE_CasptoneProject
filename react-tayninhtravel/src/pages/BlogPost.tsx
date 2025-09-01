import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Row, Col, Breadcrumb, Divider, Avatar, Card, Typography, Button, Skeleton, List, Form, Input, message } from 'antd'
import {
  UserOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
  CommentOutlined,
  SendOutlined,
  CloseOutlined,
  RollbackOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons'
import SharePopup from '../components/common/SharePopup';
import { publicService } from '@/services/publicService'
import { userService, type UserComment } from '@/services/userService'
import { useAuthStore } from '@/store/useAuthStore'
import { useBlog } from '@/hooks/useBlogs'
import { type PublicBlog } from '@/types'
import LoginModal from '@/components/auth/LoginModal'
import RegisterModal from '@/components/auth/RegisterModal'
import './BlogPost.scss'

const { Title, Text } = Typography
const { TextArea } = Input

// Recursive component for rendering nested replies
const ReplyItem: React.FC<{
  reply: UserComment
  onReplyClick: (replyId: string) => void
  replyingToReply: string | null
  replyToReplyContent: string
  onReplyContentChange: (content: string) => void
  onReplySubmit: (parentCommentId: string) => void
  onCancelReply: () => void
  commentsLoading: boolean
  level: number
  parentUserName?: string
}> = ({
  reply,
  onReplyClick,
  replyingToReply,
  replyToReplyContent,
  onReplyContentChange,
  onReplySubmit,
  onCancelReply,
  commentsLoading,
  level,
  parentUserName
}) => {
    // Only indent for level 1, other levels don't indent
    const indentStyle = level === 1 ? { marginLeft: '40px' } : {}

    return (
      <div className="reply-item-container" style={indentStyle}>
        <List.Item className="reply-item">
          <List.Item.Meta
            avatar={<Avatar src={reply.userAvatar} size="small" icon={<UserOutlined />} />}
            title={
              <div className="reply-title-container">
                <span className="reply-user-name">{reply.userName}</span>
                {parentUserName && (
                  <span className="reply-to-indicator">reply @{parentUserName}</span>
                )}
              </div>
            }
            description={
              <div className="reply-meta">
                <div className="reply-date">
                  {new Date(reply.createdAt).toLocaleString()}
                </div>
                <div className="reply-content">
                  <div className="reply-text">
                    {reply.content}
                  </div>
                </div>
              </div>
            }
          />
          <Button
            type="link"
            onClick={() => onReplyClick(reply.id)}
            icon={<RollbackOutlined />}
            className="reply-button"
            title="Trả lời"
            size="small"
          />
        </List.Item>

        {/* Reply form for this reply */}
        {replyingToReply === reply.id && (
          <div className="reply-form reply-to-reply-form" style={{ marginTop: '8px' }}>
            <TextArea
              rows={2}
              value={replyToReplyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              placeholder={`Trả lời ${reply.userName}...`}
              className="reply-textarea"
            />
            <div className="reply-form-actions">
              <Button
                type="primary"
                onClick={() => onReplySubmit(reply.id)}
                loading={commentsLoading}
                size="small"
              >
                Gửi
              </Button>
              <Button
                type="default"
                onClick={onCancelReply}
                icon={<CloseOutlined />}
                size="small"
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Render nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="nested-replies">
            {reply.replies.map((nestedReply: UserComment) => (
              <ReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                onReplyClick={onReplyClick}
                replyingToReply={replyingToReply}
                replyToReplyContent={replyToReplyContent}
                onReplyContentChange={onReplyContentChange}
                onReplySubmit={onReplySubmit}
                onCancelReply={onCancelReply}
                commentsLoading={commentsLoading}
                level={level + 1}
                parentUserName={reply.userName}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

const BlogPost = () => {
  const [sharePopupVisible, setSharePopupVisible] = useState(false);
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // Use custom hook for blog data
  const { blog: post, loading, error } = useBlog(id || '')

  const [relatedPosts, setRelatedPosts] = useState<PublicBlog[]>([])
  const [recentBlogs, setRecentBlogs] = useState<PublicBlog[]>([])
  const [comments, setComments] = useState<UserComment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [hasMoreComments, setHasMoreComments] = useState(false)
  const [loadingMoreComments, setLoadingMoreComments] = useState(false)
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyingToReply, setReplyingToReply] = useState<string | null>(null)
  const [replyToReplyContent, setReplyToReplyContent] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5)
  const [isShowingAllComments, setIsShowingAllComments] = useState(false)
  const commentListRef = useRef<HTMLDivElement>(null)
  // Hàm xử lý chuyển ảnh trước đó
  const handlePrevImage = () => {
    if (!post || !post.imageUrl) return

    const totalImages = post.imageUrl.length
    if (totalImages <= 1) return

    setCurrentImageIndex(prevIndex => {
      if (prevIndex > 0) return prevIndex - 1
      return totalImages - 1 // Quay lại ảnh cuối cùng
    })
  }

  // Hàm xử lý chuyển ảnh tiếp theo
  const handleNextImage = () => {
    if (!post || !post.imageUrl) return

    const totalImages = post.imageUrl.length
    if (totalImages <= 1) return

    setCurrentImageIndex(prevIndex => {
      if (prevIndex < totalImages - 1) return prevIndex + 1
      return 0 // Quay lại ảnh đầu tiên (index 0)
    })
  }

  // Fetch related posts and recent blogs
  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (!id || !post) return

      try {
        // Fetch related blog posts
        const relatedData = await publicService.getRelatedBlogs(id)
        setRelatedPosts(relatedData)

        // Fetch recent blogs for the sidebar
        const recentBlogsData = await publicService.getPublicBlogs(1, 5)
        setRecentBlogs(recentBlogsData.data as unknown as PublicBlog[])
      } catch (err) {
        console.error('Error fetching additional data:', err)
      }
    }

    fetchAdditionalData()
  }, [id, post])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return

      setCommentsLoading(true)
      try {
        const commentsResponse = await userService.getBlogComments(id)
        console.log('Comments response in component:', commentsResponse)
        setComments(commentsResponse.data)
        console.log('Comments state after setting:', commentsResponse.data)

        // Set initial visible comments count and show more button logic
        const totalComments = commentsResponse.data.length
        if (totalComments <= 5) {
          setVisibleCommentsCount(totalComments)
          setHasMoreComments(false)
        } else {
          setVisibleCommentsCount(5)
          setHasMoreComments(true)
        }
        setIsShowingAllComments(false)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [id])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      handleLoginModalOpen()
      return
    }

    if (!id) return

    try {


      await userService.toggleBlogReaction(id, 1)

      setIsFavorite(!isFavorite)
      message.success(isFavorite ? 'Đã bỏ yêu thích bài viết' : 'Đã yêu thích bài viết')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      message.error('Có lỗi xảy ra khi cập nhật yêu thích')
    }
  }

  const handleLoginModalOpen = () => {
    setIsLoginModalVisible(true)
  }

  const handleLoginModalClose = () => {
    setIsLoginModalVisible(false)
  }

  const handleRegisterModalOpen = () => {
    setIsRegisterModalVisible(true)
    setIsLoginModalVisible(false)
  }

  const handleRegisterModalClose = () => {
    setIsRegisterModalVisible(false)
  }

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId)
    setReplyContent('')
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyContent('')
  }

  const handleReplyToReplyClick = (replyId: string) => {
    setReplyingToReply(replyId)
    setReplyToReplyContent('')
  }

  const handleCancelReplyToReply = () => {
    setReplyingToReply(null)
    setReplyToReplyContent('')
  }

  const handleToggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return
    if (!isAuthenticated) {
      // Show login modal instead of showing a warning message
      handleLoginModalOpen()
      return
    }

    setCommentsLoading(true)
    try {
      if (!id) return

      const newComment = await userService.createComment(id, commentContent)
      if (newComment) {
        // Refresh comments to show the new one
        const commentsResponse = await userService.getBlogComments(id)
        setComments(commentsResponse.data)

        // Update pagination state based on new comments count
        const totalComments = commentsResponse.data.length
        if (totalComments <= 5) {
          setVisibleCommentsCount(totalComments)
          setHasMoreComments(false)
        } else {
          setVisibleCommentsCount(5)
          setHasMoreComments(true)
        }
        setIsShowingAllComments(false)
        setCommentContent('') // Clear the input
        message.success('Bình luận đã được gửi thành công')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      message.error('Có lỗi xảy ra khi gửi bình luận')
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleLoadMoreComments = async () => {
    if (!id || loadingMoreComments) return

    setLoadingMoreComments(true)
    try {
      if (isShowingAllComments) {
        // Reset to show only 5 comments
        setVisibleCommentsCount(5)
        setIsShowingAllComments(false)
        setHasMoreComments(true)
      } else {
        // Show 5 more comments
        const newCount = Math.min(visibleCommentsCount + 5, comments.length)
        setVisibleCommentsCount(newCount)

        // Check if we're showing all comments now
        if (newCount >= comments.length) {
          setIsShowingAllComments(true)
          setHasMoreComments(false)
        }
      }
    } catch (error) {
      console.error('Error loading more comments:', error)
    } finally {
      setLoadingMoreComments(false)
    }
  }

  const handleReplySubmit = async (commentId: string) => {
    if (!replyContent.trim()) return
    if (!isAuthenticated) {
      handleLoginModalOpen()
      return
    }

    setCommentsLoading(true)
    try {
      if (!id) return

      const newReply = await userService.createReplyComment(id, replyContent, commentId)
      if (newReply) {
        // Refresh comments to show the new reply
        const commentsResponse = await userService.getBlogComments(id)
        setComments(commentsResponse.data)

        // Update pagination state based on new comments count
        const totalComments = commentsResponse.data.length
        if (totalComments <= 5) {
          setVisibleCommentsCount(totalComments)
          setHasMoreComments(false)
        } else {
          setVisibleCommentsCount(5)
          setHasMoreComments(true)
        }
        setIsShowingAllComments(false)
        setReplyContent('') // Clear the input
        setReplyingTo(null) // Close the reply form
        message.success('Phản hồi đã được gửi thành công')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      message.error('Có lỗi xảy ra khi gửi phản hồi')
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleReplyToReplySubmit = async (parentCommentId: string) => {
    if (!replyToReplyContent.trim()) return
    if (!isAuthenticated) {
      handleLoginModalOpen()
      return
    }

    setCommentsLoading(true)
    try {
      if (!id) return

      const newReply = await userService.createReplyComment(id, replyToReplyContent, parentCommentId)
      if (newReply) {
        // Refresh comments to show the new reply
        const commentsResponse = await userService.getBlogComments(id)
        setComments(commentsResponse.data)

        // Update pagination state based on new comments count
        const totalComments = commentsResponse.data.length
        if (totalComments <= 5) {
          setVisibleCommentsCount(totalComments)
          setHasMoreComments(false)
        } else {
          setVisibleCommentsCount(5)
          setHasMoreComments(true)
        }
        setIsShowingAllComments(false)
        setReplyToReplyContent('') // Clear the input
        setReplyingToReply(null) // Close the reply form
        message.success('Phản hồi đã được gửi thành công')
      }
    } catch (error) {
      console.error('Error submitting reply to reply:', error)
      message.error('Có lỗi xảy ra khi gửi phản hồi')
    } finally {
      setCommentsLoading(false)
    }
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

  if (error) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="not-found">
            <Title level={3}>Lỗi tải bài viết</Title>
            <Text>{error}</Text>
            <Button type="primary" onClick={handleGoBack}>
              Quay lại
            </Button>
          </div>
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
    <>
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
            />            <Button
              type="text"
              icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={handleFavoriteToggle}
              className="favorite-button"
              title={isFavorite ? "Bỏ yêu thích" : "Yêu thích bài viết"}
            /><Title level={1} className="post-title">
              {post.title}
            </Title>

            <div className="post-author-date">
              <Text>
                <UserOutlined /> Tác giả: <strong>{post.authorName}</strong>
              </Text>
              {post.createdAt && (
                <Text>
                  Ngày đăng: <strong>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</strong>
                </Text>
              )}
            </div>
            <div className="post-meta">
              <div className="meta-item">
                <CommentOutlined /> {comments.length || 0} bình luận
              </div>
            </div></div>          {/* Gallery with navigation for all images */}
          {post.imageUrl && post.imageUrl.length > 0 && (
            <div className="post-gallery">
              <div className="gallery-container">
                <Button
                  className="gallery-nav-button gallery-prev"
                  icon={<ArrowLeftOutlined />}
                  onClick={handlePrevImage}
                  disabled={post.imageUrl.length <= 1}
                />
                <div className="gallery-image-container">
                  <img
                    src={post.imageUrl[currentImageIndex]}
                    alt={`${post.title} - ảnh ${currentImageIndex + 1}`}
                  />
                  <div className="image-counter">
                    {`${currentImageIndex + 1}/${post.imageUrl.length}`}
                  </div>
                </div>
                <Button
                  className="gallery-nav-button gallery-next"
                  icon={<ArrowLeftOutlined style={{ transform: 'rotate(180deg)' }} />}
                  onClick={handleNextImage}
                  disabled={post.imageUrl.length <= 1}
                />
              </div>
            </div>
          )}

          <Row gutter={[32, 32]} className="post-content-wrapper">
            <Col xs={24} lg={16} className="post-content">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />

              <Divider />

              <div className="post-share">
                <Text strong>Chia sẻ bài viết:</Text>
                <div className="share-buttons">
                  <Button type="text" icon={<ShareAltOutlined />} onClick={() => setSharePopupVisible(true)} />
                  <SharePopup visible={sharePopupVisible} onClose={() => setSharePopupVisible(false)} url={window.location.href} />
                </div>
              </div>

              <div className="post-author">
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                />
                <div className="author-info">
                  <Title level={5}>Tác giả: {post.authorName}</Title>
                </div>
              </div>

              <Divider />
              <div className="comments-section">
                <Title level={4}>Bình luận ({comments.length})</Title>

                <div className="comments-list" ref={commentListRef}>
                  {commentsLoading ? (
                    <Skeleton avatar paragraph={{ rows: 2 }} active />
                  ) : (
                    <List
                      itemLayout="horizontal"
                      dataSource={comments.slice(0, visibleCommentsCount)}
                      locale={{ emptyText: 'Chưa có bình luận nào cho bài viết này' }}
                      renderItem={comment => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={comment.userAvatar} icon={<UserOutlined />} />}
                            title={comment.userName}
                            description={
                              <div className="comment-meta">
                                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                              </div>
                            }
                          />
                          <div className="comment-content">
                            {comment.content}
                          </div>

                          {/* Display reply count if there are replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div
                              className="reply-count clickable"
                              onClick={() => handleToggleReplies(comment.id)}
                            >
                              {expandedReplies.has(comment.id) ? 'Ẩn' : 'Hiện'} {comment.replies.length} phản hồi
                            </div>
                          )}

                          {/* Render replies if any and expanded */}
                          {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                            <div className="comment-replies">
                              {comment.replies.map((reply: UserComment) => (
                                <ReplyItem
                                  key={reply.id}
                                  reply={reply}
                                  onReplyClick={handleReplyToReplyClick}
                                  replyingToReply={replyingToReply}
                                  replyToReplyContent={replyToReplyContent}
                                  onReplyContentChange={setReplyToReplyContent}
                                  onReplySubmit={handleReplyToReplySubmit}
                                  onCancelReply={handleCancelReplyToReply}
                                  commentsLoading={commentsLoading}
                                  level={1}
                                  parentUserName={comment.userName}
                                />
                              ))}
                            </div>
                          )}                          <Button
                            type="link"
                            onClick={() => handleReplyClick(comment.id)}
                            icon={<RollbackOutlined />}
                            className="reply-button"
                            title="Trả lời"
                          />                          {/* Reply form for the comment */}
                          {replyingTo === comment.id && (
                            <div className="reply-form">
                              <TextArea
                                rows={2}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Nhập phản hồi của bạn tại đây..."
                                className="reply-textarea"
                              />
                              <div className="reply-form-actions">
                                <Button
                                  type="primary"
                                  onClick={() => handleReplySubmit(comment.id)}
                                  loading={commentsLoading}
                                >
                                  Gửi
                                </Button>
                                <Button
                                  type="default"
                                  onClick={handleCancelReply}
                                  icon={<CloseOutlined />}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          )}
                        </List.Item>
                      )}
                    />
                  )}

                  {/* "View more" button for more comments */}
                  {hasMoreComments && (
                    <div className="load-more-comments">
                      <Button
                        type="link"
                        onClick={handleLoadMoreComments}
                        loading={loadingMoreComments}
                      >
                        {isShowingAllComments ? 'Hiển thị ít hơn' : 'Xem thêm bình luận'}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="comment-form">
                  <Divider />
                  <Title level={5}>Để lại bình luận</Title>
                  <Form onFinish={handleCommentSubmit}>
                    <Form.Item>
                      <TextArea
                        rows={4}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Nhập bình luận của bạn tại đây..."
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={commentsLoading}
                        icon={<SendOutlined />}
                      >
                        Gửi bình luận
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={8} className="post-sidebar">
              {relatedPosts.length > 0 && (
                <div className="sidebar-section">
                  <Title level={4} className="section-title">
                    Bài viết liên quan
                  </Title>

                  <div className="related-posts">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        to={`/blog/post/${relatedPost.id}`}
                        key={relatedPost.id}
                        className="related-post-link"
                      >
                        <Card className="related-post-card">
                          <div className="related-post-image">
                            <img
                              src={relatedPost.imageUrl && relatedPost.imageUrl.length > 0 ? relatedPost.imageUrl[0] : ''}
                              alt={relatedPost.title}
                            />
                          </div>
                          <div className="related-post-info">
                            <h4>{relatedPost.title}</h4>
                            <div className="related-post-meta">
                              <UserOutlined /> {relatedPost.authorName}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="sidebar-section">
                <Title level={4} className="section-title">
                  Bài viết gần đây
                </Title>                <div className="recent-blogs-list">
                  {recentBlogs.map((blog) => (
                    <Link
                      to={`/blog/post/${blog.id}`}
                      key={blog.id}
                      className="recent-blog-link"
                    >
                      <Card className="recent-blog-card" bordered={false} size="small">
                        <div className="recent-blog-content" style={{ display: 'flex', gap: '12px' }}>
                          <div
                            className="recent-blog-image"
                            style={{
                              flexShrink: 0,
                              width: '80px',
                              height: '60px',
                              overflow: 'hidden',
                              borderRadius: '4px'
                            }}
                          >
                            <img
                              src={blog.imageUrl && blog.imageUrl.length > 0 ? blog.imageUrl[0] : ''}
                              alt={blog.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                maxWidth: '100%',
                                maxHeight: '100%'
                              }}
                            />
                          </div>
                          <div className="recent-blog-title" style={{ flex: 1 }}>
                            <h5 style={{
                              margin: 0,
                              fontSize: '14px',
                              lineHeight: '1.4',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>{blog.title}</h5>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Login and Register Modals */}
      <LoginModal
        isVisible={isLoginModalVisible}
        onClose={handleLoginModalClose}
        onRegisterClick={handleRegisterModalOpen}
        onLoginSuccess={() => {
          // After successful login, allow the user to submit their comment
          message.success('Đăng nhập thành công! Bạn có thể gửi bình luận ngay bây giờ.')
        }}
      />

      <RegisterModal
        isVisible={isRegisterModalVisible}
        onClose={handleRegisterModalClose}
        onLoginClick={handleLoginModalOpen}
      />
    </>
  )
}

export default BlogPost