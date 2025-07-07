import React from 'react';
import { Modal, Descriptions, Tag, Image, Button, Space } from 'antd';
import {
    ShopOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    GlobalOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AdminShopRegistration } from '../../types/application';
import './ShopApplicationDetailModal.scss';

interface ShopApplicationDetailModalProps {
    visible: boolean;
    onClose: () => void;
    application: AdminShopRegistration | null;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    translateShopType: (shopType: string) => string;
}

const ShopApplicationDetailModal: React.FC<ShopApplicationDetailModalProps> = ({
    visible,
    onClose,
    application,
    onApprove,
    onReject,
    translateShopType
}) => {
    const { t } = useTranslation();

    if (!application) return null;

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0: return 'gold';
            case 1: return 'green';
            case 2: return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case 0: return t('admin.shopManagement.status.pending');
            case 1: return t('admin.shopManagement.status.approved');
            case 2: return t('admin.shopManagement.status.rejected');
            default: return 'Unknown';
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <ShopOutlined />
                    Chi tiết đơn đăng ký shop
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            className="shop-application-detail-modal"
            footer={
                application.status === 0 ? (
                    <Space>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => onReject?.(application.id)}
                        >
                            Từ chối
                        </Button>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => onApprove?.(application.id)}
                        >
                            Duyệt
                        </Button>
                    </Space>
                ) : null
            }
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Descriptions
                    bordered
                    column={2}
                    size="small"
                    labelStyle={{ fontWeight: 'bold', width: '150px' }}
                >
                    {/* Thông tin cơ bản */}
                    <Descriptions.Item label={
                        <Space>
                            <ShopOutlined />
                            Tên shop
                        </Space>
                    } span={2}>
                        <strong style={{ fontSize: '16px' }}>{application.shopName}</strong>
                    </Descriptions.Item>

                    <Descriptions.Item label={
                        <Space>
                            <UserOutlined />
                            Người đại diện
                        </Space>
                    }>
                        {application.representativeName}
                    </Descriptions.Item>

                    <Descriptions.Item label={
                        <Space>
                            <PhoneOutlined />
                            Số điện thoại
                        </Space>
                    }>
                        <a href={`tel:${application.phoneNumber}`}>{application.phoneNumber}</a>
                    </Descriptions.Item>

                    <Descriptions.Item label={
                        <Space>
                            <MailOutlined />
                            Email
                        </Space>
                    }>
                        <a href={`mailto:${application.userEmail}`}>{application.userEmail}</a>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tên người dùng">
                        {application.userName}
                    </Descriptions.Item>

                    <Descriptions.Item label="Loại shop">
                        <Tag color="blue">{translateShopType(application.shopType)}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label={
                        <Space>
                            <EnvironmentOutlined />
                            Địa chỉ
                        </Space>
                    } span={2}>
                        {application.location}
                    </Descriptions.Item>

                    {/* Website (nếu có) */}
                    {application.website && (
                        <Descriptions.Item label={
                            <Space>
                                <GlobalOutlined />
                                Website
                            </Space>
                        } span={2}>
                            <a href={application.website} target="_blank" rel="noopener noreferrer">
                                {application.website}
                            </a>
                        </Descriptions.Item>
                    )}

                    {/* Giờ hoạt động */}
                    {(application.openingHour || application.closingHour) && (
                        <Descriptions.Item label={
                            <Space>
                                <ClockCircleOutlined />
                                Giờ hoạt động
                            </Space>
                        } span={2}>
                            {application.openingHour && application.closingHour
                                ? `${application.openingHour} - ${application.closingHour}`
                                : (application.openingHour || application.closingHour)
                            }
                        </Descriptions.Item>
                    )}

                    {/* Mô tả shop */}
                    {application.shopDescription && (
                        <Descriptions.Item label={
                            <Space>
                                <FileTextOutlined />
                                Mô tả
                            </Space>
                        } span={2}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                {application.shopDescription}
                            </div>
                        </Descriptions.Item>
                    )}

                    {/* Mã số kinh doanh */}
                    {application.businessCode && (
                        <Descriptions.Item label="Mã số kinh doanh" span={2}>
                            <strong>{application.businessCode}</strong>
                        </Descriptions.Item>
                    )}

                    {/* Thông tin trạng thái */}
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={getStatusColor(application.status)}>
                            {getStatusText(application.status)}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày nộp đơn">
                        {formatDateTime(application.submittedAt)}
                    </Descriptions.Item>

                    {application.processedAt && (
                        <Descriptions.Item label="Ngày xử lý" span={2}>
                            {formatDateTime(application.processedAt)}
                        </Descriptions.Item>
                    )}

                    {/* Lý do từ chối */}
                    {application.status === 2 && application.reason && (
                        <Descriptions.Item label="Lý do từ chối" span={2}>
                            <div className="rejection-reason">
                                {application.reason}
                            </div>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {/* Hình ảnh */}
                <div className="shop-images">
                    {application.logo && (
                        <div style={{ marginBottom: '16px' }}>
                            <h4>Logo shop:</h4>
                            <Image
                                src={application.logo}
                                alt="Shop Logo"
                                width={200}
                                style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
                            />
                        </div>
                    )}

                    {application.businessLicense && (
                        <div>
                            <h4>Giấy phép kinh doanh:</h4>
                            <Image
                                src={application.businessLicense}
                                alt="Business License"
                                width={300}
                                style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ShopApplicationDetailModal;
