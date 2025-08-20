import React from 'react';
import { Radio, Card, Space, Typography, Tag } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface BookingTypeSelectorProps {
    value: 'Individual' | 'GroupRepresentative';
    onChange: (type: 'Individual' | 'GroupRepresentative') => void;
    disabled?: boolean;
}

export const BookingTypeSelector: React.FC<BookingTypeSelectorProps> = ({ 
    value, 
    onChange,
    disabled = false 
}) => {
    return (
        <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 16 }}>Chọn loại đặt tour</Title>
            
            <Radio.Group 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                style={{ width: '100%' }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Card 
                        hoverable={!disabled}
                        style={{ 
                            borderColor: value === 'Individual' ? '#1890ff' : undefined,
                            borderWidth: value === 'Individual' ? 2 : 1
                        }}
                    >
                        <Radio value="Individual">
                            <Space>
                                <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Đặt tour cá nhân</div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Mỗi khách có mã QR riêng, nhận email xác nhận riêng
                                    </Text>
                                </div>
                            </Space>
                        </Radio>
                    </Card>

                    <Card 
                        hoverable={!disabled}
                        style={{ 
                            borderColor: value === 'GroupRepresentative' ? '#1890ff' : undefined,
                            borderWidth: value === 'GroupRepresentative' ? 2 : 1
                        }}
                    >
                        <Radio value="GroupRepresentative">
                            <Space>
                                <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        Đặt tour nhóm (Đại diện)
                                        <Tag color="green" style={{ marginLeft: 8 }}>Mới</Tag>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Một mã QR cho cả nhóm, check-in nhanh chóng
                                    </Text>
                                </div>
                            </Space>
                        </Radio>
                    </Card>
                </Space>
            </Radio.Group>
        </div>
    );
};

export default BookingTypeSelector;