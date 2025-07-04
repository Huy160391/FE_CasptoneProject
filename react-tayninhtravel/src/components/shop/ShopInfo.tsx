import { Card, Avatar, Typography, Rate, Space, Tag, Button, Divider } from 'antd'
import {
    ShopOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    PhoneOutlined,
    StarOutlined
} from '@ant-design/icons'
import './ShopInfo.scss'

const { Title, Text, Paragraph } = Typography

interface ShopInfoProps {
    shopId: string
}

// Mock shop data - in real app, this would come from an API
const mockShopData = {
    shop1: {
        id: 'shop1',
        name: 'Cửa Hàng Đặc Sản Tây Ninh',
        avatar: 'https://placehold.co/80x80/2B5CE6/FFFFFF?text=TN',
        description: 'Chuyên cung cấp các sản phẩm đặc sản truyền thống Tây Ninh, được làm thủ công bởi các nghệ nhân địa phương.',
        rating: 4.7,
        totalReviews: 156,
        totalProducts: 48,
        joinedDate: '2022-03-15',
        location: 'Tây Ninh, Việt Nam',
        phone: '0123 456 789',
        tags: ['Đặc sản', 'Truyền thống', 'Thủ công'],
        isVerified: true,
        responseTime: '2 giờ',
        followers: 1240
    },
    shop2: {
        id: 'shop2',
        name: 'Quà Lưu Niệm Núi Bà Đen',
        avatar: 'https://placehold.co/80x80/52C41A/FFFFFF?text=BD',
        description: 'Chuyên sản xuất và kinh doanh các món quà lưu niệm độc đáo từ Núi Bà Đen, mang đậm văn hóa địa phương.',
        rating: 4.5,
        totalReviews: 89,
        totalProducts: 32,
        joinedDate: '2021-08-20',
        location: 'Núi Bà Đen, Tây Ninh',
        phone: '0987 654 321',
        tags: ['Quà lưu niệm', 'Núi Bà Đen', 'Văn hóa'],
        isVerified: true,
        responseTime: '1 giờ',
        followers: 890
    },
    shop3: {
        id: 'shop3',
        name: 'Thời Trang Tây Ninh',
        avatar: 'https://placehold.co/80x80/722ED1/FFFFFF?text=TT',
        description: 'Thời trang hiện đại kết hợp với nét truyền thống Tây Ninh, tạo nên phong cách độc đáo và ấn tượng.',
        rating: 4.3,
        totalReviews: 67,
        totalProducts: 28,
        joinedDate: '2023-01-10',
        location: 'Tây Ninh, Việt Nam',
        phone: '0369 258 147',
        tags: ['Thời trang', 'Hiện đại', 'Truyền thống'],
        isVerified: false,
        responseTime: '3 giờ',
        followers: 560
    },
    shop4: {
        id: 'shop4',
        name: 'Bánh Tráng Tây Ninh',
        avatar: 'https://placehold.co/80x80/FA8C16/FFFFFF?text=BT',
        description: 'Sản xuất bánh tráng nướng và các món ăn đặc sản Tây Ninh theo công thức gia truyền.',
        rating: 4.8,
        totalReviews: 203,
        totalProducts: 15,
        joinedDate: '2020-05-12',
        location: 'Tây Ninh, Việt Nam',
        phone: '0456 789 123',
        tags: ['Bánh tráng', 'Đặc sản', 'Gia truyền'],
        isVerified: true,
        responseTime: '30 phút',
        followers: 1680
    }
}

const ShopInfo: React.FC<ShopInfoProps> = ({ shopId }) => {
    const shop = mockShopData[shopId as keyof typeof mockShopData]

    if (!shop) {
        return null
    }

    const handleViewShop = () => {
        // Handle view shop logic
        console.log('View shop:', shopId)
    }

    return (
        <Card className="shop-info-card">
            <div className="shop-info-header">
                <div className="shop-avatar-section">
                    <Avatar size={80} src={shop.avatar} className="shop-avatar" />
                    <div className="shop-basic-info">
                        <div className="shop-name-row">
                            <Title level={4} className="shop-name">
                                {shop.name}
                            </Title>
                            {shop.isVerified && (
                                <Tag color="blue" className="verified-tag">
                                    <StarOutlined /> Đã xác minh
                                </Tag>
                            )}
                        </div>
                        <div className="shop-rating">
                            <Rate disabled defaultValue={shop.rating} />
                            <Text className="rating-text">
                                {shop.rating} ({shop.totalReviews} đánh giá)
                            </Text>
                        </div>
                        <div className="shop-stats">
                            <Space split={<Divider type="vertical" />}>
                                <Text><ShopOutlined /> {shop.totalProducts} sản phẩm</Text>
                                <Text><ClockCircleOutlined /> Phản hồi trong {shop.responseTime}</Text>
                            </Space>
                        </div>
                    </div>
                </div>

                <div className="shop-actions">
                    <Button
                        icon={<ShopOutlined />}
                        onClick={handleViewShop}
                        className="view-shop-btn"
                    >
                        Xem cửa hàng
                    </Button>
                </div>
            </div>

            <Divider />

            <div className="shop-info-details">
                <Paragraph className="shop-description">
                    {shop.description}
                </Paragraph>

                <div className="shop-meta">
                    <div className="shop-location">
                        <EnvironmentOutlined className="icon" />
                        <Text>{shop.location}</Text>
                    </div>
                    <div className="shop-phone">
                        <PhoneOutlined className="icon" />
                        <Text>{shop.phone}</Text>
                    </div>
                    <div className="shop-joined">
                        <ClockCircleOutlined className="icon" />
                        <Text>Tham gia từ {new Date(shop.joinedDate).toLocaleDateString('vi-VN')}</Text>
                    </div>
                </div>

                <div className="shop-tags">
                    <Space size={[0, 8]} wrap>
                        {shop.tags.map((tag, index) => (
                            <Tag key={index} color="geekblue">
                                {tag}
                            </Tag>
                        ))}
                    </Space>
                </div>
            </div>
        </Card>
    )
}

export default ShopInfo
