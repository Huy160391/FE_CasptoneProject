import React from 'react';
import { Form, Input, Select, InputNumber, Button, message } from 'antd';
import { TourTemplateType, ScheduleDay } from '../../types/tour';
import { createTourTemplate } from '../../services/tourcompanyService';

const { Option } = Select;

const SimpleTemplateForm: React.FC = () => {
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        try {
            console.log('Raw form values:', values);
            
            const apiData = {
                title: values.title,
                startLocation: values.startLocation,
                endLocation: values.endLocation,
                templateType: values.templateType,
                scheduleDays: values.scheduleDays,
                month: values.month,
                year: values.year,
                images: []
            };
            
            console.log('API data to send:', apiData);
            
            const token = localStorage.getItem('token') || undefined;
            const response = await createTourTemplate(apiData, token);
            
            console.log('API response:', response);
            message.success('Tạo template thành công!');
            form.resetFields();
        } catch (error) {
            console.error('Error creating template:', error);
            message.error('Lỗi khi tạo template');
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 600 }}>
            <h2>Debug Template Form</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    templateType: TourTemplateType.FreeScenic,
                    scheduleDays: ScheduleDay.Saturday,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                }}
            >
                <Form.Item
                    name="title"
                    label="Tên template"
                    rules={[{ required: true, message: 'Vui lòng nhập tên template' }]}
                >
                    <Input placeholder="Nhập tên template" />
                </Form.Item>

                <Form.Item
                    name="startLocation"
                    label="Điểm bắt đầu"
                    rules={[{ required: true, message: 'Vui lòng nhập điểm bắt đầu' }]}
                >
                    <Input placeholder="VD: TP.HCM" />
                </Form.Item>

                <Form.Item
                    name="endLocation"
                    label="Điểm kết thúc"
                    rules={[{ required: true, message: 'Vui lòng nhập điểm kết thúc' }]}
                >
                    <Input placeholder="VD: Tây Ninh" />
                </Form.Item>

                <Form.Item
                    name="templateType"
                    label="Loại tour"
                    rules={[{ required: true, message: 'Vui lòng chọn loại tour' }]}
                >
                    <Select placeholder="Chọn loại tour">
                        <Option value={TourTemplateType.FreeScenic}>
                            Tour danh lam thắng cảnh (Giá trị: {TourTemplateType.FreeScenic})
                        </Option>
                        <Option value={TourTemplateType.PaidAttraction}>
                            Tour khu vui chơi (Giá trị: {TourTemplateType.PaidAttraction})
                        </Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="scheduleDays"
                    label="Ngày trong tuần"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                    <Select placeholder="Chọn ngày trong tuần">
                        <Option value={ScheduleDay.Saturday}>
                            Thứ bảy (Giá trị: {ScheduleDay.Saturday})
                        </Option>
                        <Option value={ScheduleDay.Sunday}>
                            Chủ nhật (Giá trị: {ScheduleDay.Sunday})
                        </Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="month"
                    label="Tháng"
                    rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
                >
                    <InputNumber min={1} max={12} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="year"
                    label="Năm"
                    rules={[{ required: true, message: 'Vui lòng nhập năm' }]}
                >
                    <InputNumber min={2024} max={2030} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Tạo Template (Debug)
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f5f5f5' }}>
                <h4>Debug Info:</h4>
                <p>TourTemplateType.FreeScenic = {TourTemplateType.FreeScenic}</p>
                <p>TourTemplateType.PaidAttraction = {TourTemplateType.PaidAttraction}</p>
                <p>ScheduleDay.Saturday = {ScheduleDay.Saturday}</p>
                <p>ScheduleDay.Sunday = {ScheduleDay.Sunday}</p>
            </div>
        </div>
    );
};

export default SimpleTemplateForm;
