import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Typography, Avatar, Tag, Rate, Spin, Empty, Card, Button, Skeleton, Breadcrumb } from 'antd';
import { ShareAltOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, ExclamationCircleOutlined, UserOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import SharePopup from '../../components/common/SharePopup';
import * as tourcompanyService from '@/services/tourcompanyService';
import TourCard from '@/components/tours/TourCard';
import { TourDetail } from '@/services/tourDetailsService';
import './TourCompanyDetail.scss';

const { Title, Text, Paragraph } = Typography;

const TourCompanyDetail: React.FC = () => {
    const [sharePopupVisible, setSharePopupVisible] = useState(false);
    const { companyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const companyData = location.state?.companyData;

    const [tours, setTours] = useState<TourDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [toursLoading, setToursLoading] = useState(true);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        // Company info fetching is not available in the API
        // const fetchCompanyData = async () => {
        //     if (!companyId) return;
        //     try {
        //         setLoading(true);
        //         setError(null);
        //         const response = await tourcompanyService.getCompanyInfo(companyId);
        //         setCompanyData(response);
        //     } catch (err) {
        //         setError('Không thể tải thông tin công ty du lịch');
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // fetchCompanyData();
        setLoading(false); // Skip loading company data
    }, [companyId]);

    useEffect(() => {
        const fetchTours = async () => {
            if (!companyId) return;
            try {
                setToursLoading(true);
                // Get all tours and filter by companyId
                const response = await tourcompanyService.getPublicTourDetails({ pageSize: 1000 });
                const allTours = response.data?.data || [];
                const companyTours = allTours.filter((tour: any) => tour.companyId === companyId) || [];
                setTours(companyTours);
            } catch (err) {
                setTours([]);
            } finally {
                setToursLoading(false);
            }
        };
        fetchTours();
    }, [companyId]);

    if (loading) {
        return (
            <div className="tourcompany-detail-page">
                <div className="loading-container">
                    <Spin size="large" />
                    <div className="loading-text">Đang tải thông tin công ty du lịch...</div>
                </div>
            </div>
        );
    }

    if (error || !companyData) {
        return (
            <div className="tourcompany-detail-page">
                <div className="error-container">
                    <ExclamationCircleOutlined className="error-icon" />
                    <Title level={3} className="error-title">Không thể tải thông tin công ty</Title>
                    <Text className="error-message">{error || 'Công ty không tồn tại hoặc đã bị xóa'}</Text>
                    <Button type="primary" onClick={() => window.history.back()}>
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="tourcompany-detail-page">
            {/* Breadcrumb */}
            <Breadcrumb
                className="breadcrumb"
                items={[
                    { title: <Link to="/">Trang Chủ</Link> },
                    { title: <Link to="/tours">Tour</Link> },
                    { title: companyData.name }
                ]}
            />

            {/* Company Header */}
            <div className="company-header">
                <div className="company-header-content">
                    <Avatar
                        size={120}
                        src={companyData.logoUrl || `https://placehold.co/120x120/667eea/FFFFFF?text=${companyData.name.charAt(0)}`}
                        className="company-avatar"
                    />
                    <div className="company-main-info">
                        <Title level={1} className="company-name">{companyData.name}</Title>
                        <Tag className="company-type-tag">Công ty du lịch</Tag>
                        <div className="company-rating">
                            <Rate disabled allowHalf value={companyData.rating || 0} />
                            <Text className="rating-text">{companyData.rating || 0} / 5</Text>
                        </div>
                        <div className="company-stats-with-share" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                            <div className="company-stats" style={{ display: 'flex', gap: 32 }}>
                                <div className="stat-item tour-count">
                                    <UserOutlined />
                                    <span>{tours.length} tour</span>
                                </div>
                                <div className="stat-item join-date">
                                    <CalendarOutlined />
                                    <span>Tham gia từ {formatDate(companyData.createdAt || new Date().toISOString())}</span>
                                </div>
                            </div>
                            <Button type="text" icon={<ShareAltOutlined />} className="share-btn" onClick={() => setSharePopupVisible(true)} />
                            <SharePopup visible={sharePopupVisible} onClose={() => setSharePopupVisible(false)} url={window.location.href} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="company-content">
                {/* Company Information */}
                <div className="content-section company-info-section">
                    <Title level={3} className="section-title">Thông tin công ty</Title>
                    <Paragraph className="company-description">{companyData.description}</Paragraph>
                    <div className="info-grid">
                        <div className="info-item">
                            <EnvironmentOutlined className="info-icon address-icon" />
                            <div className="info-content">
                                <span className="info-label">Địa chỉ</span>
                                <span className="info-value">{companyData.address}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <PhoneOutlined className="info-icon phone-icon" />
                            <div className="info-content">
                                <span className="info-label">Số điện thoại</span>
                                <span className="info-value">{companyData.phoneNumber}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <MailOutlined className="info-icon email-icon" />
                            <div className="info-content">
                                <span className="info-label">Email</span>
                                <span className="info-value">{companyData.email}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <FileTextOutlined className="info-icon license-icon" />
                            <div className="info-content">
                                <span className="info-label">Giấy phép kinh doanh</span>
                                <span className="info-value">{companyData.businessLicense}</span>
                            </div>
                        </div>
                        {companyData.website && (
                            <div className="info-item">
                                <GlobalOutlined className="info-icon web-icon" />
                                <div className="info-content">
                                    <span className="info-label">Website</span>
                                    <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="info-value website-link">
                                        {companyData.website}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tours Section */}
                <div className="content-section tours-section">
                    <Title level={3} className="section-title">
                        Các tour của công ty ({tours.length})
                    </Title>
                    {toursLoading ? (
                        <div className="tours-loading">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <Card key={index} className="tour-skeleton">
                                    <Skeleton.Image className="tour-skeleton-img" />
                                    <Skeleton active paragraph={{ rows: 2 }} />
                                </Card>
                            ))}
                        </div>
                    ) : tours.length > 0 ? (
                        <div className="tours-grid">
                            {tours.map((tour: TourDetail) => (
                                <TourCard
                                    key={tour.id}
                                    tour={tour}
                                    onBookNow={() => { }}
                                    onViewDetails={() => { }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-tours">
                            <Empty
                                description="Công ty chưa có tour nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TourCompanyDetail;
