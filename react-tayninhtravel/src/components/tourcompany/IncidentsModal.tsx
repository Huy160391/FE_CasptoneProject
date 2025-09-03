import React, { useState, useEffect } from 'react';
import {
    Modal,
    Table,
    Tag,
    Button,
    Space,
    Typography,
    Alert,
    Spin,
    Empty,
    Descriptions,
    Image,
    Tooltip,
    message
} from 'antd';
import {
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    FileImageOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTourSlotIncidents } from '../../services/tourcompanyService';

const { Title, Text } = Typography;

interface IncidentsModalProps {
    visible: boolean;
    onClose: () => void;
    tourSlotId: string | null;
    tourSlotInfo?: {
        tourDate: string;
        formattedDateWithDay: string;
        statusName: string;
    };
}

interface IncidentData {
    id: string;
    tourSlotId: string;
    tourOperationId?: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    reportedAt: string;
    tourName?: string;
    tourDate?: string;
    reporterName?: string;
    reporterPhone?: string;
    imageUrls?: string[];
    hasImages: boolean;
}

const IncidentsModal: React.FC<IncidentsModalProps> = ({
    visible,
    onClose,
    tourSlotId,
    tourSlotInfo
}) => {
    const [loading, setLoading] = useState(false);
    const [incidents, setIncidents] = useState<IncidentData[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Fetch incidents data
    const fetchIncidents = async () => {
        if (!tourSlotId) return;

        setLoading(true);
        try {
            const response = await getTourSlotIncidents(
                tourSlotId,
                currentPage - 1,
                pageSize
            );

            if (response.success && response.data) {
                setIncidents(response.data.incidents || []);
                setTotalCount(response.data.totalCount || 0);
            } else {
                message.error('Không thể tải danh sách sự cố');
                setIncidents([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching incidents:', error);
            message.error('Có lỗi xảy ra khi tải danh sách sự cố');
            setIncidents([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Load data when modal opens or page changes
    useEffect(() => {
        if (visible && tourSlotId) {
            fetchIncidents();
        }
    }, [visible, tourSlotId, currentPage]);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setIncidents([]);
            setTotalCount(0);
            setCurrentPage(1);
        }
    }, [visible]);

    // Get severity color
    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'red';
            case 'high': return 'orange';
            case 'medium': return 'yellow';
            case 'low': return 'green';
            default: return 'default';
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'green';
            case 'inprogress': return 'blue';
            case 'reported': return 'orange';
            case 'closed': return 'default';
            default: return 'default';
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            render: (text: string, record: IncidentData) => (
                <div>
                    <Text strong>{text}</Text>
                    {record.hasImages && (
                        <Tooltip title="Có hình ảnh đính kèm">
                            <FileImageOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                        </Tooltip>
                    )}
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text: string) => (
                <Tooltip title={text}>
                    <Text>{text}</Text>
                </Tooltip>
            ),
        },
        {
            title: 'Mức độ',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            render: (severity: string) => (
                <Tag color={getSeverityColor(severity)}>
                    {severity}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Người báo cáo',
            dataIndex: 'reporterName',
            key: 'reporterName',
            width: 150,
            render: (name: string, record: IncidentData) => (
                <div>
                    <div><UserOutlined /> {name || 'N/A'}</div>
                    {record.reporterPhone && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.reporterPhone}
                        </Text>
                    )}
                </div>
            ),
        },
        {
            title: 'Thời gian báo cáo',
            dataIndex: 'reportedAt',
            key: 'reportedAt',
            width: 150,
            render: (date: string) => (
                <div>
                    <div><ClockCircleOutlined /> {dayjs(date).format('DD/MM/YYYY')}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(date).format('HH:mm')}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Ngày tour',
            dataIndex: 'tourDate',
            key: 'tourDate',
            width: 120,
            render: (date: string) => (
                <div>
                    <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
                </div>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    Danh sách sự cố - Tour Slot
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={1200}
            footer={[
                <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchIncidents}>
                    Làm mới
                </Button>,
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
        >
            {/* Tour Slot Info */}
            {tourSlotInfo && (
                <Alert
                    message="Thông tin Tour Slot"
                    description={
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="Ngày tour">
                                {tourSlotInfo.formattedDateWithDay}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag>{tourSlotInfo.statusName}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Incidents Table */}
            <Spin spinning={loading}>
                {incidents.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={incidents}
                        rowKey="id"
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: totalCount,
                            onChange: setCurrentPage,
                            showSizeChanger: false,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} sự cố`,
                        }}
                        scroll={{ x: 1000 }}
                    />
                ) : (
                    !loading && (
                        <Empty
                            description="Không có sự cố nào được báo cáo cho tour slot này"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    )
                )}
            </Spin>
        </Modal>
    );
};

export default IncidentsModal;
