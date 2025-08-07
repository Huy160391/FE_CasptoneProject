import { Modal, Button, Tag } from 'antd'
import { useThemeStore } from '@/store/useThemeStore'
import type { User } from '@/types/user'
import './UserDetailModal.scss'

interface UserDetailModalProps {
    visible: boolean
    user: User | null
    onClose: () => void
    onEdit: (user: User) => void
}

const UserDetailModal = ({ visible, user, onClose, onEdit }: UserDetailModalProps) => {
    const { isDarkMode } = useThemeStore()

    if (!user) return null

    return (
        <Modal
            open={visible}
            title={null}
            onCancel={onClose}
            footer={null}
            width={520}
            centered
            className={`user-detail-modal ${isDarkMode ? 'dark-theme' : ''}`}
        >
            <div className="user-detail-content">
                {/* Header */}
                <div className="user-detail-header">
                    <div className="user-avatar">
                        <img
                            src={user.avatar || 'https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png'}
                            alt="avatar"
                        />
                    </div>
                    <div className="user-info">
                        <h2 className="user-name">
                            {user.name}
                        </h2>
                        <Tag
                            color={user.isActive ? 'success' : 'default'}
                            className="status-tag"
                        >
                            {user.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </Tag>
                    </div>
                </div>

                {/* Body sections */}
                <div className="user-detail-body">
                    {/* Thông tin liên hệ */}
                    <div className="info-section">
                        <div className="section-content">
                            <h3>Thông tin liên hệ</h3>
                            <div className="info-grid">
                                <div className="info-row">
                                    <span className="label">Số điện thoại</span>
                                    <span className="value">{user.phone || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Email</span>
                                    <span className="value">{user.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin tài khoản */}
                    <div className="info-section">
                        <div className="section-content">
                            <h3>Thông tin tài khoản</h3>
                            <div className="info-grid">
                                <div className="info-row">
                                    <span className="label">ID người dùng</span>
                                    <span className="value user-id">{user.id}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Vai trò</span>
                                    <span className="value">{user.roleName || user.role || 'User'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thời gian */}
                    <div className="info-section">
                        <div className="section-content">
                            <h3>Thời gian</h3>
                            <div className="info-grid">
                                <div className="info-row">
                                    <span className="label">Ngày tạo</span>
                                    <span className="value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '7/8/2025'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Cập nhật</span>
                                    <span className="value">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : '7/8/2025'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="modal-footer">
                        <Button
                            className="close-btn"
                            onClick={onClose}
                            type="default"
                        >
                            Đóng
                        </Button>
                        <Button
                            className="edit-btn"
                            type="primary"
                            onClick={() => onEdit(user)}
                        >
                            Chỉnh sửa
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default UserDetailModal
