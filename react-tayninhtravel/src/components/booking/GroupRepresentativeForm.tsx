import React from 'react';
import { Form, Input, Card, Row, Col, Typography, Alert } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface GroupRepresentativeFormProps {
    form: any;
    numberOfGuests: number;
}

export const GroupRepresentativeForm: React.FC<GroupRepresentativeFormProps> = ({ 
    numberOfGuests
}) => {
    return (
        <div>
            {/* Group Information */}
            <Card style={{ marginBottom: 16 }}>
                <Title level={5}>
                    <TeamOutlined /> Thông tin nhóm
                </Title>
                
                <Form.Item
                    name="groupName"
                    label="Tên nhóm"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên nhóm' },
                        { max: 200, message: 'Tên nhóm không quá 200 ký tự' }
                    ]}
                >
                    <Input 
                        prefix={<TeamOutlined />} 
                        placeholder="VD: Công ty ABC, Gia đình Nguyễn, CLB Du lịch..." 
                    />
                </Form.Item>

                <Form.Item
                    name="groupDescription"
                    label="Mô tả nhóm (tùy chọn)"
                    rules={[
                        { max: 500, message: 'Mô tả không quá 500 ký tự' }
                    ]}
                >
                    <Input.TextArea 
                        rows={3}
                        placeholder="VD: Nhóm nhân viên công ty đi team building, Gia đình 3 thế hệ..."
                        showCount
                        maxLength={500}
                    />
                </Form.Item>
            </Card>

            {/* Representative Information */}
            <Card>
                <Title level={5}>
                    <UserOutlined /> Thông tin người đại diện
                </Title>
                
                <Form.Item
                    name={['groupRepresentative', 'guestName']}
                    label="Họ và tên người đại diện"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên người đại diện' },
                        { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
                        { max: 100, message: 'Tên không quá 100 ký tự' }
                    ]}
                >
                    <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Nhập họ và tên đầy đủ" 
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={['groupRepresentative', 'guestEmail']}
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                        >
                            <Input 
                                prefix={<MailOutlined />} 
                                placeholder="email@example.com" 
                            />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={['groupRepresentative', 'guestPhone']}
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
                            ]}
                        >
                            <Input 
                                prefix={<PhoneOutlined />} 
                                placeholder="0123456789" 
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            {/* Information Alert */}
            <Alert
                message="Lợi ích khi đặt tour nhóm"
                description={
                    <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                        <li>Chỉ cần 1 mã QR cho cả nhóm - tiện lợi khi check-in</li>
                        <li>Người đại diện quản lý toàn bộ thông tin nhóm</li>
                        <li>Tiết kiệm thời gian điền thông tin cho nhóm lớn</li>
                        <li>HDV có thể bổ sung thông tin khách sau khi check-in</li>
                    </ul>
                }
                type="info"
                showIcon
                style={{ marginTop: 16 }}
            />

            {/* Guest Count Summary */}
            <Card style={{ marginTop: 16, backgroundColor: '#f0f2f5' }}>
                <div style={{ textAlign: 'center' }}>
                    <TeamOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                    <div>
                        <Text strong style={{ fontSize: 18 }}>
                            Tổng số khách: {numberOfGuests} người
                        </Text>
                    </div>
                    <Text type="secondary">
                        Tất cả {numberOfGuests} khách sẽ sử dụng chung 1 mã QR để check-in
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default GroupRepresentativeForm;