import React, { useState, useEffect, useRef } from 'react';
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
    Modal,
    Descriptions,
    Spin,
    message
} from 'antd';
import {
    CalendarOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

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
import { tourSlotService } from '../../services/tourSlotService';
import { formatDate } from '../../utils/formatters';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface TourSlotsListProps {
    templateId?: string;
    template?: TourTemplate;
    slots?: TourSlot[];
    showUnassignedOnly?: boolean; // Mới thêm để chỉ hiển thị slots chưa gán
}

const TourSlotsList: React.FC<TourSlotsListProps> = ({
    templateId,
    template,
    slots = [],
    showUnassignedOnly = false
}) => {
    const [loading, setLoading] = useState(false);
    const [tourSlots, setTourSlots] = useState<TourSlot[]>(slots);
    const [filteredSlots, setFilteredSlots] = useState<TourSlot[]>(slots);
    const [selectedSlot, setSelectedSlot] = useState<TourSlot | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        status: undefined as TourSlotStatus | undefined,
        dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined
    });

    // Track if data has been fetched to prevent multiple API calls
    const hasFetchedRef = useRef<string>('');

    // Reset fetch tracking when templateId changes
    useEffect(() => {
        hasFetchedRef.current = '';
    }, [templateId]);

    // Fetch tour slots từ API khi có templateId
    useEffect(() => {
        const fetchKey = `${templateId}-${showUnassignedOnly}`;

        if (templateId && showUnassignedOnly && hasFetchedRef.current !== fetchKey) {
            hasFetchedRef.current = fetchKey;
            fetchUnassignedSlots();
        } else if (templateId && !showUnassignedOnly && hasFetchedRef.current !== fetchKey) {
            hasFetchedRef.current = fetchKey;
            fetchAllSlots();
        } else if (!templateId && slots.length > 0) {
            // Chỉ set slots khi không có templateId và slots thực sự có dữ liệu
            setTourSlots(slots);
            hasFetchedRef.current = 'props-slots';
        }
    }, [templateId, showUnassignedOnly]); // Bỏ 'slots' khỏi dependency array

    // Separate useEffect for handling slots prop changes when not using templateId
    useEffect(() => {
        if (!templateId) {
            setTourSlots(slots);
            hasFetchedRef.current = 'props-slots';
        }
    }, [slots, templateId]);

    useEffect(() => {
        applyFilters();
    }, [tourSlots, filters]);

    const fetchUnassignedSlots = async () => {
        if (!templateId) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const response = await tourSlotService.getUnassignedSlotsByTourTemplate(templateId, false, token);

            if (response.success && response.data) {
                // Map từ TourSlotDto sang TourSlot format, giữ scheduleDayName và statusName
                const mappedSlots: TourSlot[] = response.data.map(slot => ({
                    id: slot.id,
                    tourTemplateId: slot.tourTemplateId,
                    tourDetailsId: slot.tourDetailsId,
                    tourDate: slot.tourDate,
                    scheduleDay: slot.scheduleDay,
                    scheduleDayName: slot.scheduleDayName, // fix
                    status: slot.status,
                    statusName: slot.statusName, // fix
                    maxGuests: slot.maxGuests || 0,
                    currentBookings: slot.currentBookings || 0,
                    availableSpots: slot.availableSpots || 0,
                    isActive: slot.isActive,
                    isBookable: slot.isBookable || false,
                    createdAt: slot.createdAt,
                    updatedAt: slot.updatedAt,
                    tourTemplate: slot.tourTemplate,
                    tourDetails: slot.tourDetails || undefined,
                    tourOperation: slot.tourOperation || undefined
                }));
                setTourSlots(mappedSlots);
            }
        } catch (error) {
            console.error('Error fetching unassigned slots:', error);
            message.error('Không thể tải danh sách tour slots');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSlots = async () => {
        if (!templateId) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const response = await tourSlotService.getSlotsByTourTemplate(templateId, token);

            if (response.success && response.data) {
                // Map từ TourSlotDto sang TourSlot format
                const mappedSlots: TourSlot[] = response.data.map(slot => ({
                    id: slot.id,
                    tourTemplateId: slot.tourTemplateId,
                    tourDetailsId: slot.tourDetailsId,
                    tourDate: slot.tourDate,
                    scheduleDay: slot.scheduleDay,
                    status: slot.status,
                    maxGuests: slot.maxGuests || 0,
                    currentBookings: slot.currentBookings || 0,
                    availableSpots: slot.availableSpots || 0,
                    isActive: slot.isActive,
                    isBookable: slot.isBookable || false,
                    createdAt: slot.createdAt,
                    updatedAt: slot.updatedAt,
                    tourTemplate: slot.tourTemplate,
                    tourDetails: slot.tourDetails || undefined,
                    tourOperation: slot.tourOperation || undefined
                }));
                setTourSlots(mappedSlots);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            message.error('Không thể tải danh sách tour slots');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...tourSlots];

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

    const handleDateRangeFilter = (dates: any) => {
        setFilters(prev => ({ ...prev, dateRange: dates || undefined }));
    };

    const handleViewSlotDetail = (slot: TourSlot) => {
        setSelectedSlot(slot);
        setDetailModalVisible(true);
    };



    const getSlotStats = () => {
        const total = tourSlots.length;
        const available = tourSlots.filter(slot => slot.status === TourSlotStatus.Available).length;
        const fullyBooked = tourSlots.filter(slot => slot.status === TourSlotStatus.FullyBooked).length;
        const cancelled = tourSlots.filter(slot => slot.status === TourSlotStatus.Cancelled).length;
        const completed = tourSlots.filter(slot => slot.status === TourSlotStatus.Completed).length;

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
                    {formatDate(date)}
                </Space>
            ),
            sorter: (a: TourSlot, b: TourSlot) =>
                new Date(a.tourDate).getTime() - new Date(b.tourDate).getTime(),
        },
        {
            title: 'Thứ',
            dataIndex: 'scheduleDay',
            key: 'scheduleDay',
            render: (_: any, record: any) => (
                <Tag color={record.scheduleDay === 'Saturday' ? 'blue' : 'green'}>
                    {record.scheduleDayName || getScheduleDayLabel(record.scheduleDay)}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (_: any, record: any) => (
                <Tag color={getStatusColor(record.status)}>
                    {record.statusName || getTourSlotStatusLabel(record.status)}
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
            render: (_: any, record: TourSlot) => {
                return (
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewSlotDetail(record)}
                    >
                        Xem
                    </Button>
                );
            },
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
                <Spin spinning={loading} tip="Đang tải danh sách tour slots...">
                    <Table
                        columns={columns}
                        dataSource={filteredSlots}
                        rowKey="id"
                        loading={false}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `Tổng ${total} slots`,
                        }}
                    />
                </Spin>
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
