import React from 'react';
import { Modal, Descriptions, Button, Input, Space, Switch } from 'antd';
import { EditOutlined, MailOutlined, PhoneOutlined, GlobalOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import './CompanyModal.scss';

export interface TourCompany {
    id: string;
    userId: string;
    companyName: string;
    wallet: number;
    revenueHold: number;
    description?: string | null;
    address?: string | null;
    website?: string | null;
    businessLicense?: string | null;
    isActive: boolean;
    email: string;
    fullName: string;
    phoneNumber: string;
}

interface CompanyModalProps {
    open: boolean;
    onClose: () => void;
    company: TourCompany | null;
    isEdit?: boolean;
    onEdit?: (company: TourCompany) => void;
}

const CompanyModal: React.FC<CompanyModalProps> = ({ open, onClose, company, isEdit = false, onEdit }) => {
    const [editMode, setEditMode] = React.useState(isEdit);
    const [form, setForm] = React.useState<TourCompany | null>(company);

    React.useEffect(() => {
        setForm(company);
        setEditMode(isEdit);
    }, [company, isEdit]);

    if (!company) return null;

    const handleChange = (field: keyof TourCompany, value: any) => {
        setForm(prev => prev ? { ...prev, [field]: value } : prev);
    };

    const handleSave = () => {
        if (form && onEdit) onEdit(form);
        setEditMode(false);
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            className="company-modal"
            title={editMode ? 'Chỉnh sửa công ty du lịch' : 'Thông tin công ty du lịch'}
        >
            <Descriptions column={1} bordered className="company-desc">
                <Descriptions.Item label={<><ShopOutlined /> Tên công ty</>}>
                    {editMode ? (
                        <Input value={form?.companyName} onChange={e => handleChange('companyName', e.target.value)} />
                    ) : company.companyName}
                </Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined /> Đại diện</>}>
                    {editMode ? (
                        <Input value={form?.fullName} onChange={e => handleChange('fullName', e.target.value)} />
                    ) : company.fullName}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                    {editMode ? (
                        <Input value={form?.email} onChange={e => handleChange('email', e.target.value)} />
                    ) : company.email}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                    {editMode ? (
                        <Input value={form?.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
                    ) : company.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label={<><GlobalOutlined /> Website</>}>
                    {editMode ? (
                        <Input value={form?.website || ''} onChange={e => handleChange('website', e.target.value)} />
                    ) : (company.website || 'Chưa cập nhật')}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                    {editMode ? (
                        <Input value={form?.address || ''} onChange={e => handleChange('address', e.target.value)} />
                    ) : (company.address || 'Chưa cập nhật')}
                </Descriptions.Item>
                <Descriptions.Item label="Giấy phép kinh doanh">
                    {editMode ? (
                        <Input value={form?.businessLicense || ''} onChange={e => handleChange('businessLicense', e.target.value)} />
                    ) : (company.businessLicense || 'Chưa cập nhật')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    {editMode ? (
                        <Switch checked={form?.isActive} onChange={val => handleChange('isActive', val)} checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    ) : (
                        <span style={{ color: company.isActive ? '#52c41a' : '#faad14', fontWeight: 500 }}>
                            {company.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Số dư ví">
                    {company.wallet?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Descriptions.Item>
                <Descriptions.Item label="Doanh thu tạm giữ">
                    {company.revenueHold?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Descriptions.Item>
            </Descriptions>
            <Space style={{ marginTop: 24, justifyContent: 'flex-end', width: '100%' }}>
                {editMode ? (
                    <>
                        <Button type="primary" icon={<EditOutlined />} onClick={handleSave}>Lưu</Button>
                        <Button onClick={() => setEditMode(false)}>Hủy</Button>
                    </>
                ) : (
                    <Button type="primary" icon={<EditOutlined />} onClick={() => setEditMode(true)}>Chỉnh sửa</Button>
                )}
                <Button onClick={onClose}>Đóng</Button>
            </Space>
        </Modal>
    );
};

export default CompanyModal;
