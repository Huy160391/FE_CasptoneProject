import React from 'react';
import { Modal, Form, Input, Select, Row, Col, Checkbox, Divider, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

interface TourTemplateFormModalProps {
    form: any;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
    uploadFileList: any[];
    setUploadFileList: (list: any[]) => void;
    editingTemplate: any;
    loading?: boolean;
}

const TourTemplateFormModal: React.FC<TourTemplateFormModalProps> = ({
    form,
    visible,
    onOk,
    onCancel,
    uploadFileList,
    setUploadFileList,
    editingTemplate,
    loading
}) => {
    return (
        <Modal
            title={editingTemplate ? 'Sửa Template' : 'Thêm Template Mới'}
            open={visible}
            onOk={onOk}
            onCancel={onCancel}
            okText={editingTemplate ? 'Cập nhật' : 'Thêm'}
            cancelText="Hủy"
            width={1000}
            confirmLoading={loading}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    tourType: 'Núi non',
                    availableDays: ['saturday', 'sunday'],
                    availableMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    availableTourDates: []
                }}
            >
                {/* Thông tin cơ bản */}
                <Divider orientation="left">Thông tin cơ bản</Divider>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="title"
                            label="Tên template"
                            rules={[{ required: true, message: 'Vui lòng nhập tên template' }]}
                        >
                            <Input placeholder="Nhập tên template tour" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startLocation"
                            label="Điểm bắt đầu"
                            rules={[{ required: true, message: 'Vui lòng nhập điểm bắt đầu' }]}
                        >
                            <Input placeholder="VD: TP. Hồ Chí Minh" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endLocation"
                            label="Điểm kết thúc"
                            rules={[{ required: true, message: 'Vui lòng nhập điểm kết thúc' }]}
                        >
                            <Input placeholder="VD: Núi Bà Đen, Tây Ninh" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="templateType"
                            label="Loại tour"
                            rules={[{ required: true, message: 'Vui lòng chọn loại tour' }]}
                        >
                            <Select placeholder="Chọn loại tour">
                                <Option value="FreeScenic">FreeScenic</Option>
                                <Option value="PaidAttraction">PaidAttraction</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                {/* Thời gian có sẵn */}
                <Divider orientation="left">Thời gian có sẵn</Divider>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="availableDays"
                            label="Thứ trong tuần"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thứ' }]}
                        >
                            <Checkbox.Group
                                options={[
                                    { label: 'Thứ 7', value: 'saturday' },
                                    { label: 'Chủ nhật', value: 'sunday' }
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="availableMonths"
                            label="Tháng trong năm"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 tháng' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn tháng trong năm"
                                style={{ width: '100%' }}
                            >
                                {[
                                    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
                                    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
                                    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
                                ].map((month, index) => (
                                    <Option key={index + 1} value={index + 1}>
                                        {month}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="availableYears"
                            label="Năm"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 năm' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn năm"
                                style={{ width: '100%' }}
                            >
                                {[2024, 2025, 2026, 2027, 2028].map(year => (
                                    <Option key={year} value={year}>{year}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                {/* Hình ảnh */}
                <Divider orientation="left">Hình ảnh</Divider>
                <Form.Item
                    name="images"
                    label="Hình ảnh tour"
                    rules={[{ required: true, message: 'Vui lòng tải lên ít nhất 1 hình ảnh' }]}
                    valuePropName="fileList"
                    getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)}
                >
                    <Upload
                        listType="picture-card"
                        multiple
                        maxCount={10}
                        beforeUpload={() => false}
                        fileList={uploadFileList}
                        onChange={({ fileList }) => setUploadFileList(fileList)}
                    >
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                        </div>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TourTemplateFormModal;
