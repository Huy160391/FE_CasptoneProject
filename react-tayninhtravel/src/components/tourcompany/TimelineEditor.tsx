import React, { useState, useEffect } from 'react';
import {
    Timeline,
    Card,
    Button,
    Modal,
    Form,
    Input,
    TimePicker,
    Select,
    InputNumber,
    message,
    Popconfirm,
    Space,
    Tag,
    Tooltip
} from 'antd';
import {
    ClockCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ShopOutlined,
    SaveOutlined,
    CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/useAuthStore';
import {
    updateTimelineItem,
    createTimelineItems,
    deleteTimelineItem,
    getSpecialtyShops,
    handleApiError
} from '../../services/tourcompanyService';
import {
    TimelineItem,
    SpecialtyShop,
    CreateTimelineItemRequest
} from '../../types/tour';

const { Option } = Select;

interface TimelineEditorProps {
    tourDetailsId: string;
    timeline: TimelineItem[];
    onUpdate: (timeline: TimelineItem[]) => void;
}

interface EditingItem {
    id: string;
    checkInTime: string;
    activity: string;
    specialtyShopId?: string | null;
    sortOrder: number;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({
    tourDetailsId,
    timeline,
    onUpdate
}) => {
    console.log('🎯 TimelineEditor rendered with timeline:', timeline.length, 'items');
    const { token } = useAuthStore();
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [specialtyShops, setSpecialtyShops] = useState<SpecialtyShop[]>([]);

    useEffect(() => {
        loadSpecialtyShops();
    }, []);

    const loadSpecialtyShops = async () => {
        try {
            const response = await getSpecialtyShops(false, token ?? undefined);
            if (response.success && response.data) {
                setSpecialtyShops(response.data);
            }
        } catch (error) {
            console.error('Error loading specialty shops:', error);
        }
    };

    const handleEdit = (item: TimelineItem) => {
        setEditingItem({
            id: item.id,
            checkInTime: item.checkInTime,
            activity: item.activity,
            specialtyShopId: item.specialtyShopId,
            sortOrder: item.sortOrder
        });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;

        try {
            setLoading(true);
            const updateData = {
                checkInTime: editingItem.checkInTime,
                activity: editingItem.activity,
                specialtyShopId: editingItem.specialtyShopId,
                sortOrder: editingItem.sortOrder
            };
            console.log('🚀 Updating timeline item:', editingItem.id, updateData);
            const response = await updateTimelineItem(editingItem.id, updateData, token ?? undefined);
            console.log('✅ Timeline item updated:', response);

            if (response.success) {
                // Update local timeline
                const updatedTimeline = timeline.map(item => 
                    item.id === editingItem.id 
                        ? {
                            ...item,
                            checkInTime: editingItem.checkInTime,
                            activity: editingItem.activity,
                            specialtyShopId: editingItem.specialtyShopId,
                            sortOrder: editingItem.sortOrder,
                            specialtyShop: specialtyShops.find(shop => shop.id === editingItem.specialtyShopId) || null
                        }
                        : item
                );
                onUpdate(updatedTimeline);
                setEditingItem(null);
                message.success('Cập nhật timeline item thành công');
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        try {
            setLoading(true);
            console.log('🚀 Deleting timeline item:', itemId);
            const response = await deleteTimelineItem(itemId, token ?? undefined);
            console.log('✅ Timeline item deleted:', response);
            
            if (response.success) {
                const updatedTimeline = timeline.filter(item => item.id !== itemId);
                onUpdate(updatedTimeline);
                message.success('Xóa timeline item thành công');
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (values: any) => {
        try {
            setLoading(true);
            const newSortOrder = Math.max(...timeline.map(item => item.sortOrder), 0) + 1;

            const createRequest = {
                tourDetailsId,
                timelineItems: [{
                    checkInTime: values.checkInTime.format('HH:mm'),
                    activity: values.activity,
                    specialtyShopId: values.specialtyShopId || null,
                    sortOrder: newSortOrder
                }]
            };

            console.log('🚀 Creating timeline items:', createRequest);
            const response = await createTimelineItems(createRequest, token ?? undefined);
            console.log('✅ Timeline items created:', response);
            
            if (response.success) {
                // Create new timeline item for local state
                const newItem: TimelineItem = {
                    id: `temp-${Date.now()}`, // Temporary ID
                    tourDetailsId,
                    checkInTime: values.checkInTime.format('HH:mm'),
                    activity: values.activity,
                    specialtyShopId: values.specialtyShopId || null,
                    sortOrder: newSortOrder,
                    specialtyShop: specialtyShops.find(shop => shop.id === values.specialtyShopId) || null,
                    createdAt: new Date().toISOString()
                };

                const updatedTimeline = [...timeline, newItem];
                onUpdate(updatedTimeline);
                setShowAddModal(false);
                form.resetFields();
                message.success('Thêm timeline item thành công');
            }
        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const renderTimelineItem = (item: TimelineItem) => {
        const isEditing = editingItem?.id === item.id;

        if (isEditing) {
            return (
                <Card size="small" style={{ marginBottom: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Input
                            value={editingItem.checkInTime}
                            onChange={(e) => setEditingItem({ ...editingItem, checkInTime: e.target.value })}
                            placeholder="HH:mm"
                            style={{ width: 100 }}
                        />
                        <Input
                            value={editingItem.activity}
                            onChange={(e) => setEditingItem({ ...editingItem, activity: e.target.value })}
                            placeholder="Hoạt động"
                        />
                        <Select
                            value={editingItem.specialtyShopId}
                            onChange={(value) => setEditingItem({ ...editingItem, specialtyShopId: value })}
                            placeholder="Chọn specialty shop (tùy chọn)"
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {specialtyShops.map(shop => (
                                <Option key={shop.id} value={shop.id}>
                                    {shop.shopName}
                                </Option>
                            ))}
                        </Select>
                        <InputNumber
                            value={editingItem.sortOrder}
                            onChange={(value) => setEditingItem({ ...editingItem, sortOrder: value || 1 })}
                            min={1}
                            placeholder="Thứ tự"
                            style={{ width: 100 }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleSaveEdit}
                                loading={loading}
                                size="small"
                            >
                                Lưu
                            </Button>
                            <Button
                                icon={<CloseOutlined />}
                                onClick={handleCancelEdit}
                                size="small"
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Space>
                </Card>
            );
        }

        return (
            <Card size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {item.activity}
                        </div>
                        {item.specialtyShop && (
                            <Tag icon={<ShopOutlined />} color="green" style={{ marginTop: 4 }}>
                                {item.specialtyShop.shopName}
                            </Tag>
                        )}
                        <div style={{ color: '#666', fontSize: '12px', marginTop: 4 }}>
                            Thứ tự: {item.sortOrder}
                        </div>
                    </div>
                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(item)}
                                size="small"
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Xóa timeline item"
                            description="Bạn có chắc chắn muốn xóa timeline item này?"
                            onConfirm={() => handleDelete(item.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    danger
                                    size="small"
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </div>
            </Card>
        );
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAddModal(true)}
                >
                    Thêm Timeline Item
                </Button>
            </div>

            <Timeline
                mode="left"
                items={timeline
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((item) => ({
                        key: item.id,
                        dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                        label: item.checkInTime,
                        children: renderTimelineItem(item)
                    }))}
            />

            <Modal
                title="Thêm Timeline Item"
                open={showAddModal}
                onCancel={() => {
                    setShowAddModal(false);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAdd}
                >
                    <Form.Item
                        name="checkInTime"
                        label="Thời gian"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                    >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="activity"
                        label="Hoạt động"
                        rules={[{ required: true, message: 'Vui lòng nhập hoạt động' }]}
                    >
                        <Input placeholder="Nhập hoạt động" />
                    </Form.Item>

                    <Form.Item
                        name="specialtyShopId"
                        label="Specialty Shop (tùy chọn)"
                    >
                        <Select
                            placeholder="Chọn specialty shop"
                            allowClear
                        >
                            {specialtyShops.map(shop => (
                                <Option key={shop.id} value={shop.id}>
                                    {shop.shopName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => {
                                setShowAddModal(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Thêm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TimelineEditor;
