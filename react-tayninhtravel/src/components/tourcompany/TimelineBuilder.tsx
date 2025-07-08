import React, { useState, useEffect } from 'react';
import {
    Card,
    Input,
    Select,
    Button,
    Space,
    List,
    message,
    Popconfirm,
    InputNumber,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

import { useAuthStore } from '../../store/useAuthStore';
import {
    createTimelineItems,
    updateTimelineItem,
    deleteTimelineItem,
    handleApiError
} from '../../services/tourcompanyService';
import {
    TimelineItem,
    SpecialtyShop
} from '../../types/tour';
import { validateTimelineItem } from '../../constants/tourTemplate';


const { Option } = Select;

interface TimelineBuilderProps {
    tourDetailsId: string;
    timeline?: TimelineItem[];
    onUpdate?: (timeline: TimelineItem[]) => void;
    specialtyShops?: SpecialtyShop[];
}

interface TimelineFormItem {
    id?: string;
    checkInTime: string;
    activity: string;
    location?: string;
    specialtyShopId?: string;
    sortOrder: number; // Use sortOrder to match API
    estimatedDuration?: number; // in minutes
    isNew?: boolean;
}

const TimelineBuilder: React.FC<TimelineBuilderProps> = ({
    tourDetailsId,
    timeline = [],
    onUpdate,
    specialtyShops = []
}) => {
    const { token } = useAuthStore();
    const [items, setItems] = useState<TimelineFormItem[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        // Initialize items from existing timeline
        const initialItems: TimelineFormItem[] = timeline
            .sort((a, b) => (a.sortOrder || a.orderIndex || 0) - (b.sortOrder || b.orderIndex || 0))
            .map(item => ({
                id: item.id,
                checkInTime: item.checkInTime,
                activity: item.activity,
                location: item.location,
                specialtyShopId: item.specialtyShopId || undefined,
                sortOrder: item.sortOrder || item.orderIndex || 1,
                estimatedDuration: item.estimatedDuration,
                isNew: false
            }));
        setItems(initialItems);
    }, [timeline]);

    const addTimelineItem = () => {
        const newItem: TimelineFormItem = {
            checkInTime: '',
            activity: '',
            location: '',
            sortOrder: items.length + 1,
            estimatedDuration: 30, // Default 30 minutes
            isNew: true
        };
        setItems([...items, newItem]);
    };

    const updateItem = (index: number, field: keyof TimelineFormItem, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setItems(updatedItems);
    };

    const removeItem = async (index: number) => {
        const item = items[index];
        
        if (item.id && !item.isNew) {
            // Delete existing item from server
            try {
                setLoading(true);
                const response = await deleteTimelineItem(item.id, token ?? undefined);
                if (response.success) {
                    message.success('Xóa timeline item thành công');
                }
            } catch (error) {
                message.error(handleApiError(error));
                return;
            } finally {
                setLoading(false);
            }
        }

        // Remove from local state
        const updatedItems = items.filter((_, i) => i !== index);
        // Reorder sort orders
        const reorderedItems = updatedItems.map((item, i) => ({
            ...item,
            sortOrder: i + 1
        }));
        setItems(reorderedItems);
        
        if (onUpdate) {
            const updatedTimeline = reorderedItems
                .filter(item => !item.isNew)
                .map(item => ({
                    id: item.id!,
                    tourDetailsId,
                    checkInTime: item.checkInTime,
                    activity: item.activity,
                    specialtyShopId: item.specialtyShopId || null,
                    sortOrder: item.sortOrder,
                    specialtyShop: specialtyShops.find(shop => shop.id === item.specialtyShopId) || null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
            onUpdate(updatedTimeline);
        }
    };

    const validateItems = (): boolean => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const errors = validateTimelineItem(item);
            if (errors.length > 0) {
                message.error(`Item ${i + 1}: ${errors.join(', ')}`);
                return false;
            }
        }
        return true;
    };

    const saveTimeline = async () => {
        if (!validateItems()) {
            return;
        }

        try {
            setLoading(true);
            
            // Separate new items and existing items
            const newItems = items.filter(item => item.isNew);
            const existingItems = items.filter(item => !item.isNew && item.id);

            // Create new items in batch
            if (newItems.length > 0) {
                const createRequest = {
                    tourDetailsId,
                    timelineItems: newItems.map(item => ({
                        checkInTime: item.checkInTime,
                        activity: item.activity,
                        specialtyShopId: item.specialtyShopId || null,
                        sortOrder: item.sortOrder
                    }))
                };

                const response = await createTimelineItems(createRequest, token ?? undefined);
                if (response.success) {
                    message.success(`Tạo ${response.data?.createdCount || newItems.length} timeline items thành công`);
                }
            }

            // Update existing items
            for (const item of existingItems) {
                if (item.id) {
                    await updateTimelineItem(item.id, {
                        checkInTime: item.checkInTime,
                        activity: item.activity,
                        specialtyShopId: item.specialtyShopId || null,
                        sortOrder: item.sortOrder
                    }, token ?? undefined);
                }
            }

            // Refresh the timeline
            const updatedTimeline = items.map(item => ({
                id: item.id || `temp-${Date.now()}-${Math.random()}`,
                tourDetailsId,
                checkInTime: item.checkInTime,
                activity: item.activity,
                specialtyShopId: item.specialtyShopId || null,
                sortOrder: item.sortOrder,
                specialtyShop: specialtyShops.find(shop => shop.id === item.specialtyShopId) || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));

            if (onUpdate) {
                onUpdate(updatedTimeline);
            }

            // Mark all items as not new
            setItems(items.map(item => ({ ...item, isNew: false })));

        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex >= 0 && targetIndex < newItems.length) {
            // Swap items
            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
            
            // Update sort orders
            newItems.forEach((item, i) => {
                item.sortOrder = i + 1;
            });
            
            setItems(newItems);
        }
    };

    return (
        <Card title="Timeline Builder" className="timeline-builder">
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addTimelineItem}
                    >
                        Thêm Timeline Item
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={saveTimeline}
                        loading={loading}
                        disabled={items.length === 0}
                    >
                        Lưu Timeline
                    </Button>
                </Space>
            </div>

            <List
                dataSource={items}
                renderItem={(item, index) => (
                    <List.Item key={index}>
                        <Card
                            size="small"
                            style={{ width: '100%' }}
                            title={`Item ${index + 1}`}
                            extra={
                                <Space>
                                    <Button
                                        size="small"
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === items.length - 1}
                                    >
                                        ↓
                                    </Button>
                                    <Popconfirm
                                        title="Bạn có chắc chắn muốn xóa?"
                                        onConfirm={() => removeItem(index)}
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                        />
                                    </Popconfirm>
                                </Space>
                            }
                        >
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Input
                                        placeholder="HH:mm"
                                        value={item.checkInTime}
                                        onChange={(e) => updateItem(index, 'checkInTime', e.target.value)}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Col>
                                <Col span={10}>
                                    <Input
                                        placeholder="Hoạt động"
                                        value={item.activity}
                                        onChange={(e) => updateItem(index, 'activity', e.target.value)}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Select
                                        placeholder="Chọn shop (tùy chọn)"
                                        value={item.specialtyShopId}
                                        onChange={(value) => updateItem(index, 'specialtyShopId', value)}
                                        allowClear
                                        style={{ width: '100%' }}
                                    >
                                        {specialtyShops.map(shop => (
                                            <Option key={shop.id} value={shop.id}>
                                                {shop.shopName}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col span={2}>
                                    <InputNumber
                                        min={1}
                                        value={item.sortOrder}
                                        onChange={(value) => updateItem(index, 'sortOrder', value || 1)}
                                        style={{ width: '100%' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </List.Item>
                )}
            />

            {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    <ClockCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>Chưa có timeline items</div>
                    <div>Nhấn "Thêm Timeline Item" để bắt đầu</div>
                </div>
            )}
        </Card>
    );
};

export default TimelineBuilder;
