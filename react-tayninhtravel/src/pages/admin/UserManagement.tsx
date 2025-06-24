import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, message, Spin, Form as AntForm } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import { adminService } from '@/services/adminService'
import type { User } from '@/types/user'
import './UserManagement.scss'
import UserModal from './UserModal'

const UserManagement = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuthStore()
    const { t } = useTranslation()
    const [searchText, setSearchText] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [form] = AntForm.useForm()
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    })
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined)

    // Modal hiển thị thông tin chi tiết user
    const [viewUser, setViewUser] = useState<User | null>(null)
    const [isViewModalVisible, setIsViewModalVisible] = useState(false)

    // Tải danh sách người dùng từ API
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await adminService.getUsers(
                pagination.current,
                pagination.pageSize,
                searchText || undefined,
                statusFilter
            )

            setUsers(response.data)
            setPagination({
                ...pagination,
                total: response.totalRecords
            })
        } catch (error) {
            console.error('Error fetching users:', error)
            message.error(t('admin.users.messages.error.loading'))
        } finally {
            setLoading(false)
        }
    }

    // Gọi API khi component được mount hoặc khi các điều kiện tìm kiếm thay đổi
    useEffect(() => {
        // Kiểm tra xác thực
        if (!isAuthenticated || !user) {
            message.error(t('admin.users.messages.error.auth'))
            navigate('/login')
            return
        }

        if (user.role !== 'Admin') {
            message.error(t('admin.users.messages.error.permission'))
            navigate('/unauthorized')
            return
        }

        fetchUsers()
    }, [pagination.current, pagination.pageSize, statusFilter, isAuthenticated, user, navigate, t])

    // Sử dụng debounce cho tìm kiếm để tránh gọi API quá nhiều
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.current === 1) {
                fetchUsers()
            } else {
                setPagination(prev => ({ ...prev, current: 1 }))
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchText])

    const handleTableChange = (newPagination: any, filters: any) => {
        // Chỉ xử lý pagination và filters, không xử lý sorter vì đã sort phía client
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        })

        if (filters.status && filters.status.length > 0) {
            setStatusFilter(filters.status[0])
        } else {
            setStatusFilter(undefined)
        }
    }

    const handleSearch = (value: string) => {
        setSearchText(value)
    }

    const handleAdd = () => {
        setEditingUser(null)
        form.resetFields()
        setIsModalVisible(true)
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
        })
        setIsModalVisible(true)
    }

    const handleToggleStatus = (user: User, newStatus: boolean) => {
        Modal.confirm({
            title: newStatus
                ? t('admin.users.confirmations.activate.title')
                : t('admin.users.confirmations.deactivate.title'),
            content: newStatus
                ? t('admin.users.confirmations.activate.content')
                : t('admin.users.confirmations.deactivate.content'),
            okText: t('common.confirm'),
            cancelText: t('common.cancel'),
            onOk: async () => {
                try {
                    await adminService.toggleUserStatus(user.id, newStatus)
                    message.success(newStatus
                        ? t('admin.users.messages.success.activated')
                        : t('admin.users.messages.success.deactivated')
                    )
                    fetchUsers()
                } catch (error) {
                    console.error('Error toggling user status:', error)
                    message.error(newStatus
                        ? t('admin.users.messages.error.activate')
                        : t('admin.users.messages.error.deactivate')
                    )
                }
            },
        })
    }

    const handleDelete = (user: User) => {
        if (!user || !user.name) {
            message.error(t('admin.users.messages.error.invalidUser'))
            return
        }

        Modal.confirm({
            title: t('admin.users.confirmations.delete.title'),
            content: t('admin.users.confirmations.delete.content', { name: user.name }),
            okText: t('common.delete'),
            okType: 'danger',
            cancelText: t('common.cancel'),
            onOk: async () => {
                try {
                    await adminService.deleteUser(user.id)
                    message.success(t('admin.users.messages.success.deleted'))
                    fetchUsers()
                } catch (error) {
                    console.error('Error deleting user:', error)
                    message.error(t('admin.users.messages.error.delete'))
                }
            },
        })
    }

    const handleModalOk = () => {
        form.validateFields().then(async values => {
            try {
                if (editingUser) {
                    // Cập nhật người dùng hiện có
                    await adminService.updateUser(editingUser.id, {
                        name: values.name,
                        email: values.email,
                        phone: values.phone,
                        isActive: values.isActive,
                    })
                    message.success(t('admin.users.messages.success.updated'))
                } else {
                    // Thêm người dùng mới
                    await adminService.createUser({
                        name: values.name,
                        email: values.email,
                        phone: values.phone,
                        isActive: values.isActive,
                        password: values.password,
                    })
                    message.success(t('admin.users.messages.success.created'))
                }

                setIsModalVisible(false)
                fetchUsers()
            } catch (error) {
                console.error('Error saving user:', error)
                message.error(editingUser
                    ? t('admin.users.messages.error.update')
                    : t('admin.users.messages.error.create')
                )
            }
        })
    }

    const handleModalCancel = () => {
        setIsModalVisible(false)
    }

    const handleRowClick = (record: User) => {
        setViewUser(record)
        setIsViewModalVisible(true)
    }

    const columns: ColumnsType<User> = [
        {
            title: t('admin.users.columns.id'),
            dataIndex: 'id',
            key: 'id',
            width: '80px',
            ellipsis: true,
        }, {
            title: t('admin.users.columns.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a: User, b: User) => a.name.localeCompare(b.name),
        }, {
            title: t('admin.users.columns.email'),
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            sorter: (a: User, b: User) => a.email.localeCompare(b.email),
        },
        {
            title: t('admin.users.columns.phone'),
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a: User, b: User) => (a.phone || '').localeCompare(b.phone || ''),
        },
        {
            title: t('admin.users.columns.status'),
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => {
                const color = isActive ? 'success' : 'error'
                const text = isActive ? t('admin.users.status.active') : t('admin.users.status.inactive')

                return <Tag color={color}>{text}</Tag>
            },
            filters: [
                { text: t('admin.users.status.active'), value: true },
                { text: t('admin.users.status.inactive'), value: false },
            ],
            onFilter: (value: any, record: User) =>
                record.isActive === value,
        },
        {
            title: t('admin.users.columns.actions'),
            key: 'action',
            render: (_, record: User) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        {t('common.edit')}
                    </Button>
                    {record.isActive ? (
                        <Button
                            icon={<StopOutlined />}
                            danger
                            size="small"
                            onClick={() => handleToggleStatus(record, false)}
                        >
                            {t('admin.users.actions.deactivate')}
                        </Button>
                    ) : (
                        <Button
                            icon={<CheckCircleOutlined />}
                            type="primary"
                            size="small"
                            className="activate-btn"
                            onClick={() => handleToggleStatus(record, true)}
                        >
                            {t('admin.users.actions.activate')}
                        </Button>
                    )}
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record)}
                    >
                        {t('common.delete')}
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div className="user-management-page">            <div className="page-header">
            <div className="title-with-filters">
                <h1>{t('admin.users.title')}</h1>
            </div>
            <div className="header-actions">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    {t('admin.users.actions.add')}
                </Button>                </div>
        </div>

            <div className="table-actions">
                <Space>
                    <Input
                        placeholder={t('admin.users.searchPlaceholder')}
                        prefix={<SearchOutlined />}
                        onChange={e => handleSearch(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                        value={searchText}
                    />
                </Space>
            </div>

            <Spin spinning={loading}>
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} ${t('admin.users.pagination.of')} ${total} ${t('admin.users.pagination.items')}`,
                    }}
                    onChange={handleTableChange}
                    className="users-table"
                    onRow={record => ({
                        onClick: () => handleRowClick(record)
                    })}
                />
            </Spin>

            <UserModal
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                form={form}
                editingUser={editingUser}
            />

            {/* Modal xem thông tin user */}
            <Modal
                open={isViewModalVisible}
                title={t('admin.users.modal.view')}
                onCancel={() => setIsViewModalVisible(false)}
                footer={null}
            >
                {viewUser && (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={viewUser.avatar || 'https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png'}
                            alt="avatar"
                            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }}
                        />
                        <div><b>{t('profile.name')}:</b> {viewUser.name}</div>
                        <div><b>{t('profile.email')}:</b> {viewUser.email}</div>
                        <div><b>{t('profile.phone')}:</b> {viewUser.phone}</div>
                        <div><b>{t('admin.users.columns.status')}:</b> {viewUser.isActive ? t('admin.users.status.active') : t('admin.users.status.inactive')}</div>
                        <div><b>{t('profile.role')}:</b> {viewUser.role}</div>
                        <div><b>{t('profile.createdAt')}:</b> {viewUser.createdAt}</div>
                        <div><b>{t('profile.updatedAt')}:</b> {viewUser.updatedAt}</div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default UserManagement
