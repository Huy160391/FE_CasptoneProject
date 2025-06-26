import React, { useState, useEffect } from 'react';
import {
    Modal,
    Descriptions,
    Tag,
    Timeline,
    Card,
    Row,
    Col,
    Button,
    Space,
    Divider,
    Alert,
    Spin,
    message,
    Tabs
} from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DollarOutlined,
    TeamOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    getTourDetailsById,
    getTourOperationByDetailsId,
    handleApiError
} from '../../services/tourcompanyService';
import {
    TourDetails,
    TourOperation,
    TimelineItem,
    TourDetailsStatus
} from '../../types/tour';
import {
    getTourDetailsStatusLabel,
    getStatusColor,
    TOUR_DETAILS_STATUS_LABELS
} from '../../constants/tourTemplate';
import TourOperationManagement from './TourOperationManagement';

const { TabPane } = Tabs;

interface TourDetailsModalProps {
    visible: boolean;
    tourDetailsId: string | null;
    onClose: () => void;
    onUpdate?: () => void;
    initialTab?: string;
}

const TourDetailsModal: React.FC<TourDetailsModalProps> = ({
    visible,
    tourDetailsId,
    onClose,
    onUpdate,
    initialTab = 'details'
}) => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [tourDetails, setTourDetails] = useState<TourDetails | null>(null);
    const [tourOperation, setTourOperation] = useState<TourOperation | null>(null);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        if (visible && tourDetailsId && token) {
            loadTourDetailsData();
        }
    }, [visible, tourDetailsId, token]);

    const loadTourDetailsData = async () => {
        if (!tourDetailsId || !token) return;

        try {
            setLoading(true);

            // Load tour details (includes timeline)
            const detailsResponse = await getTourDetailsById(tourDetailsId, token);
            if (detailsResponse.isSuccess && detailsResponse.data) {
                setTourDetails(detailsResponse.data);
                // Set timeline from tour details data
                if (detailsResponse.data.timeline) {
                    setTimeline(detailsResponse.data.timeline);
                }
            }

            // Load tour operation (if exists)
            try {
                const operationResponse = await getTourOperationByDetailsId(tourDetailsId, token);
                if (operationResponse.isSuccess && operationResponse.data) {
                    setTourOperation(operationResponse.data);
                }
            } catch (error) {
                // Operation might not exist yet, that's ok
                setTourOperation(null);
            }

        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleOperationUpdate = (updatedOperation: TourOperation) => {
        setTourOperation(updatedOperation);
        if (onUpdate) {
            onUpdate();
        }
    };

    const handleOperationCreate = (newOperation: TourOperation) => {
        setTourOperation(newOperation);
        if (onUpdate) {
            onUpdate();
        }
    };

    const renderDetailsTab = () => (
        <div>
            {tourDetails && (
                <>
                    <Descriptions title="Thông tin cơ bản" bordered column={2}>
                        <Descriptions.Item label="Tiêu đề" span={2}>
                            {tourDetails.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả" span={2}>
                            {tourDetails.description || 'Chưa có mô tả'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(tourDetails.status)}>
                                {getTourDetailsStatusLabel(tourDetails.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Template">
                            {tourDetails.tourTemplateName || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kỹ năng yêu cầu" span={2}>
                            {tourDetails.skillsRequired ? (
                                tourDetails.skillsRequired.split(',').map(skill => (
                                    <Tag key={skill} color="blue">{skill.trim()}</Tag>
                                ))
                            ) : (
                                <span style={{ color: '#999' }}>Chưa có yêu cầu kỹ năng</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(tourDetails.createdAt).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lần cuối">
                            {tourDetails.updatedAt ? 
                                new Date(tourDetails.updatedAt).toLocaleString('vi-VN') : 
                                'Chưa cập nhật'
                            }
                        </Descriptions.Item>
                        {tourDetails.commentApproved && (
                            <Descriptions.Item label="Nhận xét admin" span={2}>
                                <Alert
                                    message={tourDetails.commentApproved}
                                    type={tourDetails.status === TourDetailsStatus.Approved ? 'success' : 'warning'}
                                    showIcon
                                />
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <Divider />

                    <Card title="Thống kê" size="small">
                        <Row gutter={16}>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#1890ff' }}>
                                        {tourDetails.timeline?.length || 0}
                                    </div>
                                    <div style={{ color: '#666' }}>Timeline Items</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#52c41a' }}>
                                        {tourDetails.assignedSlots?.length || 0}
                                    </div>
                                    <div style={{ color: '#666' }}>Assigned Slots</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#fa8c16' }}>
                                        {tourDetails.timeline?.filter(item => item.specialtyShop).length || 0}
                                    </div>
                                    <div style={{ color: '#666' }}>Shops in Timeline</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </>
            )}
        </div>
    );

    const renderTimelineTab = () => (
        <div>
            {timeline.length > 0 ? (
                <Timeline mode="left">
                    {timeline
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((item, index) => (
                            <Timeline.Item
                                key={item.id}
                                dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                                label={item.checkInTime}
                            >
                                <Card size="small" style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                        {item.activity}
                                    </div>
                                    {item.location && (
                                        <div style={{ color: '#666', fontSize: '12px' }}>
                                            📍 {item.location}
                                        </div>
                                    )}
                                    {item.specialtyShop && (
                                        <Tag icon={<ShopOutlined />} color="green" style={{ marginTop: 4 }}>
                                            {item.specialtyShop.shopName}
                                        </Tag>
                                    )}
                                </Card>
                            </Timeline.Item>
                        ))}
                </Timeline>
            ) : (
                <Alert
                    message="Chưa có timeline"
                    description="TourDetails này chưa có timeline items nào."
                    type="info"
                    showIcon
                />
            )}
        </div>
    );

    const renderOperationTab = () => (
        <div>
            {tourDetails?.status === TourDetailsStatus.Approved ? (
                <TourOperationManagement
                    tourDetails={tourDetails}
                    onOperationUpdate={handleOperationUpdate}
                    onOperationCreate={handleOperationCreate}
                />
            ) : (
                <Alert
                    message="TourDetails chưa được duyệt"
                    description="TourOperation chỉ có thể tạo sau khi TourDetails được admin duyệt."
                    type="warning"
                    showIcon
                />
            )}
        </div>
    );

    return (
        <Modal
            title={`Chi tiết TourDetails${tourDetails ? ` - ${tourDetails.title}` : ''}`}
            open={visible}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>
            ]}
        >
            <Spin spinning={loading}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane
                        tab={
                            <span>
                                <ExclamationCircleOutlined />
                                Chi tiết
                            </span>
                        }
                        key="details"
                    >
                        {renderDetailsTab()}
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <ClockCircleOutlined />
                                Timeline ({timeline.length})
                            </span>
                        }
                        key="timeline"
                    >
                        {renderTimelineTab()}
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <DollarOutlined />
                                Vận hành
                                {tourOperation && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />}
                            </span>
                        }
                        key="operation"
                    >
                        {renderOperationTab()}
                    </TabPane>
                </Tabs>
            </Spin>
        </Modal>
    );
};

export default TourDetailsModal;
