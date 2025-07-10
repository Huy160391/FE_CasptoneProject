import React from 'react';
import { Modal, Descriptions, Tag, Button } from 'antd';
import { FileOutlined, DownloadOutlined } from '@ant-design/icons';
import './CVDetailModal.scss';

interface CVDetailModalProps {
    open: boolean;
    onClose: () => void;
    cv: {
        id: string;
        fullName: string;
        userEmail: string;
        phoneNumber: string;
        experience: string;
        curriculumVitae?: string;
        status: number;
        submittedAt: string;
        userName: string;
        reason?: string;
    } | null;
}

const statusMap = [
    { color: 'gold', text: 'Đang xử lý' },
    { color: 'green', text: 'Đã duyệt' },
    { color: 'red', text: 'Từ chối' },
];

const CVDetailModal: React.FC<CVDetailModalProps> = ({ open, onClose, cv }) => {
    if (!cv) return null;
    const status = statusMap[cv.status] || statusMap[0];
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title={`Chi tiết CV: ${cv.fullName}`}
            width={600}
            className="cv-detail-modal"
        >
            <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Họ tên">{cv.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{cv.userEmail}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{cv.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label="Ngày nộp">{new Date(cv.submittedAt).toLocaleString('vi-VN')}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={status.color}>{status.text}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Kinh nghiệm">{cv.experience}</Descriptions.Item>
                <Descriptions.Item label="File CV">
                    {cv.curriculumVitae ? (
                        <>
                            <FileOutlined style={{ marginRight: 8 }} />
                            <a href={cv.curriculumVitae} target="_blank" rel="noopener noreferrer">Xem CV</a>
                            <Button
                                icon={<DownloadOutlined />}
                                size="small"
                                type="text"
                                style={{ marginLeft: 8 }}
                                onClick={() => window.open(cv.curriculumVitae, '_blank')}
                            />
                        </>
                    ) : 'N/A'}
                </Descriptions.Item>
                {cv.status === 2 && (
                    <Descriptions.Item label="Lý do từ chối">{cv.reason || 'Không có'}</Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
};

export default CVDetailModal;
