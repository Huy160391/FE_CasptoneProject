import React from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, Divider, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
    TourTemplateType,
    ScheduleDay
} from '../../types/tour';
import {
    TOUR_TEMPLATE_TYPE_LABELS,
    SCHEDULE_DAY_LABELS
} from '../../constants/tourTemplate';

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
    const handleFormSubmit = () => {
        form.validateFields()
            .then((values: any) => {
                console.log('Form values before submit:', values);
                console.log('scheduleDays value:', values.scheduleDays, 'type:', typeof values.scheduleDays);
                console.log('templateType value:', values.templateType, 'type:', typeof values.templateType);
                onOk();
            })
            .catch((info: any) => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={editingTemplate ? 'Cập nhật Template' : 'Tạo Template Mới'}
            open={visible}
            onOk={handleFormSubmit}
            onCancel={onCancel}
            okText={editingTemplate ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            width={800}
            confirmLoading={loading}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    templateType: TourTemplateType.FreeScenic,
                    scheduleDays: ScheduleDay.Saturday,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    images: []
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
                                <Option value={TourTemplateType.FreeScenic}>
                                    {TOUR_TEMPLATE_TYPE_LABELS[TourTemplateType.FreeScenic]}
                                </Option>
                                <Option value={TourTemplateType.PaidAttraction}>
                                    {TOUR_TEMPLATE_TYPE_LABELS[TourTemplateType.PaidAttraction]}
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="scheduleDays"
                            label="Ngày trong tuần"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày (chỉ Thứ 7 hoặc Chủ nhật)' }]}
                        >
                            <Select
                                placeholder="Chọn ngày trong tuần"
                                onChange={(value) => console.log('Schedule day changed:', value)}
                            >
                                <Option value={ScheduleDay.Saturday}>
                                    {SCHEDULE_DAY_LABELS[ScheduleDay.Saturday]} (Giá trị: {ScheduleDay.Saturday})
                                </Option>
                                <Option value={ScheduleDay.Sunday}>
                                    {SCHEDULE_DAY_LABELS[ScheduleDay.Sunday]} (Giá trị: {ScheduleDay.Sunday})
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Thời gian */}
                <Divider orientation="left">Thời gian</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="month"
                            label="Tháng"
                            rules={[
                                { required: true, message: 'Vui lòng chọn tháng' },
                                { type: 'number', min: 1, max: 12, message: 'Tháng phải từ 1 đến 12' }
                            ]}
                        >
                            <Select placeholder="Chọn tháng">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <Option key={month} value={month}>
                                        Tháng {month}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="year"
                            label="Năm"
                            rules={[
                                { required: true, message: 'Vui lòng nhập năm' },
                                { type: 'number', min: 2024, max: 2030, message: 'Năm phải từ 2024 đến 2030' }
                            ]}
                        >
                            <InputNumber
                                min={2024}
                                max={2030}
                                placeholder="Nhập năm"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                {/* Hình ảnh */}
                <Divider orientation="left">Hình ảnh</Divider>
                <Form.Item
                    name="images"
                    label="Hình ảnh tour (tùy chọn)"
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
