import React from 'react';
import { Modal, Form, Input, Select, Row, Col, InputNumber, Divider, Upload, message, Alert } from 'antd';
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
    errorInfo?: {
        type: 'error' | 'warning' | 'info';
        message: string;
        description?: string;
        details?: string[];
    } | null;
}

const TourTemplateFormModal: React.FC<TourTemplateFormModalProps> = ({
    form,
    visible,
    onOk,
    onCancel,
    uploadFileList,
    setUploadFileList,
    editingTemplate,
    loading,
    errorInfo
}) => {
    const handleFormSubmit = () => {
        form.validateFields()
            .then((values: any) => {
                console.log('Form values before submit:', values);
                console.log('scheduleDays value:', values.scheduleDays, 'type:', typeof values.scheduleDays);
                console.log('templateType value:', values.templateType, 'type:', typeof values.templateType);

                // Additional client-side validation
                if (!values.title?.trim()) {
                    message.error('Vui lòng nhập tên template');
                    return;
                }
                if (!values.startLocation?.trim()) {
                    message.error('Vui lòng nhập điểm bắt đầu');
                    return;
                }
                if (!values.endLocation?.trim()) {
                    message.error('Vui lòng nhập điểm kết thúc');
                    return;
                }
                if (!values.templateType) {
                    message.error('Vui lòng chọn loại tour');
                    return;
                }
                if (!values.scheduleDays) {
                    message.error('Vui lòng chọn ngày trong tuần');
                    return;
                }
                if (!values.month || values.month < 1 || values.month > 12) {
                    message.error('Vui lòng chọn tháng hợp lệ (1-12)');
                    return;
                }
                if (!values.year || values.year < 2024 || values.year > 2030) {
                    message.error('Vui lòng nhập năm hợp lệ (2024-2030)');
                    return;
                }

                onOk();
            })
            .catch((info: any) => {
                console.log('Form validation failed:', info);

                // Show specific validation errors
                if (info.errorFields && info.errorFields.length > 0) {
                    const firstError = info.errorFields[0];
                    message.error(`${firstError.name[0]}: ${firstError.errors[0]}`);
                } else {
                    message.error('Vui lòng kiểm tra lại thông tin đã nhập');
                }
            });
    };

    return (
        <Modal
            title={errorInfo && !editingTemplate ? 'Lỗi xóa Template' : (editingTemplate ? 'Cập nhật Template' : 'Tạo Template Mới')}
            open={visible}
            onOk={errorInfo && !editingTemplate ? undefined : handleFormSubmit}
            onCancel={onCancel}
            okText={editingTemplate ? 'Cập nhật' : 'Tạo mới'}
            cancelText={errorInfo && !editingTemplate ? 'Đóng' : 'Hủy'}
            width={800}
            confirmLoading={loading}
            footer={errorInfo && !editingTemplate ? null : undefined}
            closable={!(errorInfo && !editingTemplate)}
        >
            {errorInfo && (
                <Alert
                    type={errorInfo.type}
                    message={errorInfo.message}
                    description={
                        <div>
                            {errorInfo.description && <p>{errorInfo.description}</p>}
                            {errorInfo.details && errorInfo.details.length > 0 && (
                                <ul style={{ margin: '8px 0 0 16px' }}>
                                    {errorInfo.details.map((detail, index) => (
                                        <li key={index}>{detail}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    }
                    showIcon
                    closable={true}
                    style={{ marginBottom: 16 }}
                />
            )}
            {!(errorInfo && !editingTemplate) && (
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
                                    disabled={!!editingTemplate}
                                >
                                    <Option value={ScheduleDay.Saturday}>
                                        {SCHEDULE_DAY_LABELS[ScheduleDay.Saturday]}
                                    </Option>
                                    <Option value={ScheduleDay.Sunday}>
                                        {SCHEDULE_DAY_LABELS[ScheduleDay.Sunday]}
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
                                <Select placeholder="Chọn tháng" disabled={!!editingTemplate}>
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
                                    disabled={!!editingTemplate}
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
            )}
        </Modal>
    );
};

export default TourTemplateFormModal;
