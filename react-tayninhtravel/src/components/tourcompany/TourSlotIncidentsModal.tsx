import React, { useState, useEffect } from 'react';
import {
    Modal,
    Card,
    Tag,
    Row,
    Col,
    Button,
    Alert,
    Spin,
    Image,
    message
} from 'antd';
import {
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import { getTourSlotIncidents } from '../../services/tourcompanyService';
import { TourSlotDto } from '../../services/tourSlotService';

interface TourSlotIncidentsModalProps {
    visible: boolean;
    onClose: () => void;
    tourSlot: TourSlotDto | null;
}

interface Incident {
    id: string;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: string;
    createdAt: string | Date;
    reportedAt?: string | Date;
    tourSlotId: string;
    tourSlotDate: string; // DateOnly field - kept as string
    tourName: string;
    guideName?: string;
    guidePhone?: string;
    imageUrls?: string[];
}

const TourSlotIncidentsModal: React.FC<TourSlotIncidentsModalProps> = ({
    visible,
    onClose,
    tourSlot
}) => {
    const { token } = useAuthStore();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && tourSlot && token) {
            // Add small delay to prevent rapid API calls
            const timer = setTimeout(() => {
                loadIncidents();
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [visible, tourSlot?.id, token]); // Use tourSlot.id instead of entire object

    const loadIncidents = async () => {
        if (!tourSlot || !token) return;
        
        setLoading(true);
        try {
            const response = await getTourSlotIncidents(tourSlot.id, 0, 50, token);
            if (response.success && response.data) {
                setIncidents(response.data.incidents || []);
            } else {
                setIncidents([]);
            }
        } catch (error) {
            console.error('Error loading incidents:', error);
            message.error('Không thể tải danh sách sự cố');
            setIncidents([]);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'red';
            case 'High': return 'orange';
            case 'Medium': return 'blue';
            case 'Low': return 'green';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'green';
            case 'in progress': return 'blue';
            case 'reported': return 'orange';
            default: return 'default';
        }
    };

    const formatDate = (dateValue: string | Date | undefined): string => {
        if (!dateValue) return 'N/A';
        try {
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            return date.toLocaleString('vi-VN');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };



    const handleClose = () => {
        setIncidents([]);
        onClose();
    };

    return (
        <Modal
            title={`Sự cố - ${tourSlot?.formattedDateWithDay || ''}`}
            open={visible}
            onCancel={handleClose}
            footer={[
                <Button key="close" onClick={handleClose}>
                    Đóng
                </Button>
            ]}
            width={800}
        >
            <Spin spinning={loading}>
                {incidents.length > 0 ? (
                    <div>
                        <Alert
                            message={`Tìm thấy ${incidents.length} sự cố cho tour slot này`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {incidents.map((incident) => (
                                <Card
                                    key={incident.id}
                                    size="small"
                                    style={{ marginBottom: 12 }}
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{incident.title}</span>
                                            <div>
                                                <Tag color={getSeverityColor(incident.severity)}>
                                                    {incident.severity}
                                                </Tag>
                                                <Tag color={getStatusColor(incident.status)}>
                                                    {incident.status}
                                                </Tag>
                                            </div>
                                        </div>
                                    }
                                >
                                    <p style={{ marginBottom: 8 }}>{incident.description}</p>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <small style={{ color: '#666' }}>
                                                <strong>HDV báo cáo:</strong> {incident.guideName || 'N/A'}
                                            </small>
                                        </Col>
                                        <Col span={12}>
                                            <small style={{ color: '#666' }}>
                                                <strong>SĐT HDV:</strong> {incident.guidePhone || 'N/A'}
                                            </small>
                                        </Col>
                                    </Row>
                                    
                                    <Row gutter={16} style={{ marginTop: 8 }}>
                                        <Col span={12}>
                                            <small style={{ color: '#666' }}>
                                                <strong>Thời gian báo cáo:</strong> {formatDate(incident.reportedAt || incident.createdAt)}
                                            </small>
                                        </Col>
                                        <Col span={12}>
                                            <small style={{ color: '#666' }}>
                                                <strong>Ngày tour:</strong> {incident.tourSlotDate}
                                            </small>
                                        </Col>
                                    </Row>

                                    {incident.imageUrls && incident.imageUrls.length > 0 && (
                                        <div style={{ marginTop: 12 }}>
                                            <strong style={{ fontSize: '12px' }}>Hình ảnh:</strong>
                                            <div style={{ marginTop: 8 }}>
                                                <Image.PreviewGroup>
                                                    {incident.imageUrls.map((url: string, imgIndex: number) => (
                                                        <Image
                                                            key={imgIndex}
                                                            width={60}
                                                            height={60}
                                                            src={url}
                                                            style={{ 
                                                                marginRight: 8, 
                                                                marginBottom: 8,
                                                                objectFit: 'cover',
                                                                borderRadius: 4
                                                            }}
                                                        />
                                                    ))}
                                                </Image.PreviewGroup>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                        <p style={{ color: '#999', fontSize: '16px' }}>Chưa có sự cố nào được báo cáo cho tour slot này</p>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Sự cố sẽ được báo cáo bởi HDV thông qua mobile app
                        </p>
                    </div>
                )}
            </Spin>
        </Modal>
    );
};

export default TourSlotIncidentsModal;
