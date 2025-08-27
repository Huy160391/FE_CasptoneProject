import { Modal, Form, Input, Select, Row, Col } from 'antd';
import { useEffect } from 'react';
import type { User } from '@/types/user';

const { Option } = Select;

interface UserModalProps {
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
    form: any;
    editingUser: User | null;
}

const UserModal = ({ visible, onOk, onCancel, form, editingUser }: UserModalProps) => {

    useEffect(() => {
        if (!visible) form.resetFields();
    }, [visible, form]);

    return (
        <Modal
            title={editingUser ? "Chỉnh sửa" : "Thêm mới"}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={editingUser ? "Lưu" : "Thêm"}
            cancelText="Hủy"
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Họ tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input placeholder="Nhập họ tên" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input placeholder="Nhập địa chỉ email" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                    {editingUser ? (
                        null
                    ) : (
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value="user">User</Option>
                                    <Option value="blogger">Blogger</Option>
                                    <Option value="tour company">Tour Company</Option>
                                    <Option value="specialty shop">Specialty Shop</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    )}
                </Row>
                {editingUser && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select>
                                    <Option value={true}>Hoạt động</Option>
                                    <Option value={false}>Không hoạt động</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                )}
                {!editingUser && (
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>
                        </Col>
                    </Row>
                )}
            </Form>
        </Modal>
    );
};

export default UserModal;