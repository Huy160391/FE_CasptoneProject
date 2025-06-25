import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Card,
    Row,
    Col,
    Statistic,
    Select,
    DatePicker,
    message,
    Modal,
    Descriptions
} from 'antd';
import {
    CalendarOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/useAuthStore';
import {
    TourSlot,
    TourSlotStatus,
    ScheduleDay,
    TourTemplate
} from '../../types/tour';
import {
    getTourSlotStatusLabel,
    getStatusColor,
    getScheduleDayLabel
} from '../../constants/tourTemplate';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface TourSlotsListProps {
    templateId?: string;
    template?: TourTemplate;
    slots?: TourSlot[];
    onSlotUpdate?: (slot: TourSlot) => void;
}

const TourSlotsList: React.FC<TourSlotsListProps> = ({
    templateId,
    template,
    slots = [],
    onSlotUpdate
}) => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [filteredSlots, setFilteredSlots] = useState<TourSlot[]>(slots);
    const [selectedSlot, setSelectedSlot] = useState<TourSlot | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        status: undefined as TourSlotStatus | undefined,
        dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined
    });

    useEffect(() => {
        applyFilters();
    }, [slots, filters]);

    const applyFilters = () => {
        let filtered = [...slots];

        // Filter by status
        if (filters.status !== undefined) {
            filtered = filtered.filter(slot => slot.status === filters.status);
        }

        // Filter by date range
        if (filters.dateRange) {
            const [startDate, endDate] = filters.dateRange;
            filtered = filtered.filter(slot => {
                const slotDate = dayjs(slot.tourDate);
                return slotDate.isAfter(startDate.subtract(1, 'day')) && 
                       slotDate.isBefore(endDate.add(1, 'day'));
            });
        }

        setFilteredSlots(filtered);
    };

    const handleStatusFilter = (status: TourSlotStatus | undefined) => {
        setFilters(prev => ({ ...prev, status }));
    };

    const handleDateRangeFilter = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
        setFilters(prev => ({ ...prev, dateRange: dates || undefined }));
    };

    const handleViewSlotDetail = (slot: TourSlot) => {
        setSelectedSlot(slot);
        setDetailModalVisible(true);
    };

    const getSlotStats = () => {
        const total = slots.length;
        const available = slots.filter(slot => slot.status === TourSlotStatus.Available).length;
        const fullyBooked = slots.filter(slot => slot.status === TourSlotStatus.FullyBooked).length;
        const cancelled = slots.filter(slot => slot.status === TourSlotStatus.Cancelled).length;
        const completed = slots.filter(slot => slot.status === TourSlotStatus.Completed).length;

        return { total, available, fullyBooked, cancelled, completed };
    };

    const stats = getSlotStats();

    const columns = [
        {
            title: 'Ngày tour',
            dataIndex: 'tourDate',
            key: 'tourDate',
            render: (date: string) => (
                <Space>
                    <CalendarOutlined />
                    {new Date(date).toLocaleDateString('vi-VN')}
                </Space>
            ),
            sorter: (a: TourSlot, b: TourSlot) => 
                new Date(a.tourDate).getTime() - new Date(b.tourDate).getTime(),
        },
        {
            title: 'Thứ',
            dataIndex: 'scheduleDay',
            key: 'scheduleDay',
            render: (day: ScheduleDay) => (
                <Tag color={day === ScheduleDay.Saturday ? 'blue' : 'green'}>
                    {getScheduleDayLabel(day)}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: TourSlotStatus) => (
                <Tag color={getStatusColor(status)}>
                    {getTourSlotStatusLabel(status)}
                </Tag>
            ),
            filters: [
                { text: 'Có sẵn', value: TourSlotStatus.Available },
                { text: 'Đã đầy', value: TourSlotStatus.FullyBooked },
                { text: 'Đã hủy', value: TourSlotStatus.Cancelled },
                { text: 'Hoàn thành', value: TourSlotStatus.Completed },
                { text: 'Đang thực hiện', value: TourSlotStatus.InProgress },
            ],
            onFilter: (value: any, record: TourSlot) => record.status === value,
        },
        {
            title: 'Tour Details',
            dataIndex: 'tourDetailsId',
            key: 'tourDetailsId',
            render: (detailsId: string | null) => (
                detailsId ? (
                    <Tag color="blue">Đã gán</Tag>
                ) : (
                    <Tag color="default">Chưa gán</Tag>
                )
            ),
        },
        {
            title: 'Hoạt động',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                isActive ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Hoạt động</Tag>
                ) : (
                    <Tag color="red" icon={<CloseCircleOutlined />}>Không hoạt động</Tag>
                )
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
            sorter: (a: TourSlot, b: TourSlot) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record: TourSlot) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewSlotDetail(record)}
                    >
                        Xem
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Tổng slots"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Có sẵn"
                            value={stats.available}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Đã đầy"
                            value={stats.fullyBooked}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Đã hủy"
                            value={stats.cancelled}
                            valueStyle={{ color: '#f5222d' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={4}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={handleStatusFilter}
                        >
                            <Option value={TourSlotStatus.Available}>Có sẵn</Option>
                            <Option value={TourSlotStatus.FullyBooked}>Đã đầy</Option>
                            <Option value={TourSlotStatus.Cancelled}>Đã hủy</Option>
                            <Option value={TourSlotStatus.Completed}>Hoàn thành</Option>
                            <Option value={TourSlotStatus.InProgress}>Đang thực hiện</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <RangePicker
                            placeholder={['Từ ngày', 'Đến ngày']}
                            style={{ width: '100%' }}
                            onChange={handleDateRangeFilter}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Slots Table */}
            <Card title={`Danh sách Slots${template ? ` - ${template.title}` : ''}`}>
                <Table
                    columns={columns}
                    dataSource={filteredSlots}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} slots`,
                    }}
                />
            </Card>

            {/* Slot Detail Modal */}
            <Modal
                title="Chi tiết Slot"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedSlot && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID" span={2}>
                            {selectedSlot.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tour">
                            {new Date(selectedSlot.tourDate).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thứ">
                            <Tag color={selectedSlot.scheduleDay === ScheduleDay.Saturday ? 'blue' : 'green'}>
                                {getScheduleDayLabel(selectedSlot.scheduleDay)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(selectedSlot.status)}>
                                {getTourSlotStatusLabel(selectedSlot.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Hoạt động">
                            {selectedSlot.isActive ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>Hoạt động</Tag>
                            ) : (
                                <Tag color="red" icon={<CloseCircleOutlined />}>Không hoạt động</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tour Details ID" span={2}>
                            {selectedSlot.tourDetailsId || 'Chưa gán'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(selectedSlot.createdAt).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">
                            {selectedSlot.updatedAt 
                                ? new Date(selectedSlot.updatedAt).toLocaleString('vi-VN')
                                : 'Chưa cập nhật'
                            }
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default TourSlotsList;
