import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Timeline,
    Button,
    Typography,
    Space,
    Modal,
    Input,
    notification,
    Progress,
    Alert,
    Tag,
    Row,
    Col
} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    CheckOutlined,
    ShopOutlined,
    EnvironmentOutlined,
    MessageOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import { getTourTimeline, completeTimelineItem, TimelineItem } from '@/services/tourguideService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TimelineProgress: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [completing, setCompleting] = useState<string | null>(null);
    const [completeModalVisible, setCompleteModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
    const [notes, setNotes] = useState('');

    // Load timeline items
    const loadTimeline = async () => {
        if (!tourId) return;
        
        try {
            setLoading(true);
            const response = await getTourTimeline(tourId);
            
            if (response.success && response.data) {
                setTimelineItems(response.data);
            }
        } catch (error) {
            console.error('Error loading timeline:', error);
            notification.error({
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải lịch trình tour.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTimeline();
    }, [tourId]);

    // Handle complete timeline item
    const handleCompleteItem = async (item: TimelineItem) => {
        try {
            setCompleting(item.id);
            
            const response = await completeTimelineItem(item.id, {
                notes: notes
            });
            
            if (response.success) {
                notification.success({
                    message: 'Hoàn thành thành công',
                    description: `Đã hoàn thành: ${item.activity}`,
                });
                
                // Reload timeline
                await loadTimeline();
                
                // Reset form
                setCompleteModalVisible(false);
                setSelectedItem(null);
                setNotes('');
            }
        } catch (error: any) {
            console.error('Error completing timeline item:', error);
            notification.error({
                message: 'Lỗi hoàn thành',
                description: error.response?.data?.message || 'Không thể hoàn thành mục này.',
            });
        } finally {
            setCompleting(null);
        }
    };

    // Open complete modal
    const openCompleteModal = (item: TimelineItem) => {
        setSelectedItem(item);
        setCompleteModalVisible(true);
        setNotes('');
    };

    // Calculate progress
    const totalItems = timelineItems.length;
    const completedItems = timelineItems.filter(item => item.isCompleted).length;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Get timeline item status
    const getTimelineItemStatus = (item: TimelineItem, index: number) => {
        if (item.isCompleted) {
            return 'finish';
        }
        
        // Check if previous items are completed
        const previousItems = timelineItems.slice(0, index);
        const allPreviousCompleted = previousItems.every(prevItem => prevItem.isCompleted);
        
        if (allPreviousCompleted) {
            return 'process'; // Can be completed now
        }
        
        return 'wait'; // Must wait for previous items
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/tour-guide/dashboard')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại Dashboard
                </Button>
                
                <Title level={2}>Lịch trình Tour</Title>
                
                {/* Progress Overview */}
                <Card style={{ marginBottom: '16px' }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12}>
                            <div style={{ textAlign: 'center' }}>
                                <Progress
                                    type="circle"
                                    percent={progressPercent}
                                    format={() => `${completedItems}/${totalItems}`}
                                    size={120}
                                    strokeColor={progressPercent === 100 ? '#52c41a' : '#1890ff'}
                                />
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div>
                                <Title level={4}>Tiến độ tour</Title>
                                <Text type="secondary">
                                    {completedItems} / {totalItems} điểm đã hoàn thành
                                </Text>
                                <br />
                                <Text strong>
                                    {progressPercent}% hoàn thành
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {progressPercent === 100 && (
                    <Alert
                        message="Hoàn thành tour"
                        description="Tất cả điểm trong lịch trình đã hoàn thành. Tour đã kết thúc thành công!"
                        type="success"
                        showIcon
                        style={{ marginBottom: '16px' }}
                        action={
                            <Button
                                type="primary"
                                onClick={() => navigate(`/tour-guide/guest-notification/${tourId}`)}
                            >
                                Thông báo khách
                            </Button>
                        }
                    />
                )}
            </div>

            {/* Timeline */}
            <Card title="Lịch trình chi tiết" loading={loading}>
                <Timeline>
                    {timelineItems.map((item, index) => {
                        const status = getTimelineItemStatus(item, index);
                        const canComplete = status === 'process' && !item.isCompleted;
                        
                        return (
                            <Timeline.Item
                                key={item.id}
                                color={
                                    item.isCompleted 
                                        ? 'green' 
                                        : canComplete 
                                            ? 'blue' 
                                            : 'gray'
                                }
                                dot={
                                    item.isCompleted ? (
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    ) : canComplete ? (
                                        <PlayCircleOutlined style={{ color: '#1890ff' }} />
                                    ) : (
                                        <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
                                    )
                                }
                            >
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <Space>
                                            <Text strong style={{ fontSize: '16px' }}>
                                                {item.checkInTime} - {item.activity}
                                            </Text>
                                            {item.isCompleted && (
                                                <Tag color="success" icon={<CheckCircleOutlined />}>
                                                    Hoàn thành
                                                </Tag>
                                            )}
                                            {canComplete && (
                                                <Tag color="processing" icon={<PlayCircleOutlined />}>
                                                    Có thể thực hiện
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>
                                    
                                    {item.specialtyShop && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <Space>
                                                <ShopOutlined />
                                                <Text type="secondary">
                                                    {item.specialtyShop.shopName}
                                                </Text>
                                                <EnvironmentOutlined />
                                                <Text type="secondary">
                                                    {item.specialtyShop.address}
                                                </Text>
                                            </Space>
                                        </div>
                                    )}
                                    
                                    {item.isCompleted && item.completedAt && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <Text type="success" style={{ fontSize: '12px' }}>
                                                <CheckCircleOutlined /> Hoàn thành lúc: {new Date(item.completedAt).toLocaleString('vi-VN')}
                                            </Text>
                                            {item.completionNotes && (
                                                <div style={{ marginTop: '4px' }}>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        <MessageOutlined /> {item.completionNotes}
                                                    </Text>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {canComplete && (
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            onClick={() => openCompleteModal(item)}
                                            loading={completing === item.id}
                                            style={{ marginTop: '8px' }}
                                        >
                                            Đã hoàn thành
                                        </Button>
                                    )}
                                </div>
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            </Card>

            {/* Complete Modal */}
            <Modal
                title="Hoàn thành mục lịch trình"
                open={completeModalVisible}
                onCancel={() => {
                    setCompleteModalVisible(false);
                    setSelectedItem(null);
                    setNotes('');
                }}
                footer={[
                    <Button key="cancel" onClick={() => setCompleteModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={completing === selectedItem?.id}
                        onClick={() => selectedItem && handleCompleteItem(selectedItem)}
                    >
                        Hoàn thành
                    </Button>
                ]}
            >
                {selectedItem && (
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Hoạt động: </Text>
                            <Text>{selectedItem.activity}</Text>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Thời gian: </Text>
                            <Text>{selectedItem.checkInTime}</Text>
                        </div>
                        
                        <div>
                            <Text strong>Ghi chú hoàn thành (tùy chọn):</Text>
                            <TextArea
                                placeholder="Ghi chú về tình hình thực tế, thay đổi so với kế hoạch..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                style={{ marginTop: '8px' }}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TimelineProgress;
