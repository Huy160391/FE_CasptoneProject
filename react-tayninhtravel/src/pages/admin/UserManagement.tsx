import { useState, useEffect, useCallback } from 'react'
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
import UserDetailModal from './UserDetailModal'

const UserManagement = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuthStore()
    const { t } = useTranslation()
    const [searchText, setSearchText] = useState('')
    const [debouncedSearchText, setDebouncedSearchText] = useState('')
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
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const response = await adminService.getUsers(
                pagination.current - 1, // Convert 1-based to 0-based index for API
                pagination.pageSize,
                debouncedSearchText || undefined,
                statusFilter !== undefined ? statusFilter : undefined // Truyền đúng kiểu boolean cho param status
            )

            setUsers(response.data)
            setPagination(prev => ({
                ...prev,
                total: response.totalRecord ?? response.totalCount ?? 0
            }))
        } catch (error) {
            console.error('Error fetching users:', error)
            message.error(t('admin.users.messages.error.loading'))
        } finally {
            setLoading(false)
        }
    }, [pagination.current, pagination.pageSize, debouncedSearchText, statusFilter, t])

    // Gọi API khi component được mount hoặc khi các điều kiện tìm kiếm thay đổi
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUsers()
        } else {
            navigate('/auth/login')
        }
    }, [fetchUsers, isAuthenticated, user, navigate])

    // Sử dụng debounce cho tìm kiếm để tránh gọi API quá nhiều
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchText])

    // Reset về trang 1 khi debouncedSearchText thay đổi
    useEffect(() => {
        if (debouncedSearchText !== searchText) return // Chỉ reset khi debounce hoàn tất
        setPagination(prev => ({ ...prev, current: 1 }))
    }, [debouncedSearchText])

    const handleTableChange = (newPagination: any, filters: any) => {
        // Chỉ xử lý pagination và filters, không xử lý sorter vì đã sort phía client
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        })

        if (filters.status && filters.status.length > 0) {
            setStatusFilter(filters.status[0])
            fetchUsers() // Gọi lại fetchUsers khi filter status thay đổi
        } else {
            setStatusFilter(undefined)
            fetchUsers() // Gọi lại fetchUsers khi filter status bị xóa
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
                    await adminService.updateUser(user.id, { isActive: newStatus })
                    message.success(newStatus
                        ? t('admin.users.messages.success.activated')
                        : t('admin.users.messages.success.deactivated')
                    )
                    fetchUsers()
                } catch (error) {
                    console.error('Error updating user status:', error)
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
                        phoneNumber: values.phone,
                        avatar: editingUser?.avatar,
                        isActive: values.status, // Đúng với kiểu UpdateUserPayload, userService sẽ map sang status
                    })
                    message.success(t('admin.users.messages.success.updated'))
                } else {
                    // Thêm người dùng mới
                    await adminService.createUser({
                        name: values.name,
                        email: values.email,
                        phoneNumber: values.phone,
                        role: values.role,
                        avatar: undefined,
                        isActive: true, // Mặc định user mới sẽ hoạt động
                        password: values.password,
                    })
                    message.success(t('admin.users.messages.success.created'))
                }

                setIsModalVisible(false)
                fetchUsers()
            } catch (error: any) {
                // Hiển thị message trả về từ API nếu có
                const apiMsg = error?.response?.data?.message
                if (apiMsg) {
                    message.error(apiMsg)
                } else {
                    message.error(editingUser
                        ? t('admin.users.messages.error.update')
                        : t('admin.users.messages.error.create')
                    )
                }
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
            title: t('admin.users.columns.role'),
            dataIndex: 'roleName',
            key: 'roleName',
            render: (roleName: string, record: User) => {
                const roleDisplay = roleName || record.role || 'N/A';
                let color = 'default';

                switch (roleDisplay.toLowerCase()) {
                    case 'admin':
                        color = 'red';
                        break;
                    case 'blogger':
                        color = 'blue';
                        break;
                    case 'tour company':
                        color = 'green';
                        break;
                    case 'specialty shop':
                        color = 'orange';
                        break;
                    case 'user':
                        color = 'purple';
                        break;
                    default:
                        color = 'default';
                }

                return <Tag color={color}>{roleDisplay}</Tag>;
            },
            sorter: (a: User, b: User) => {
                const roleA = a.roleName || a.role || '';
                const roleB = b.roleName || b.role || '';
                return roleA.localeCompare(roleB);
            },
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
            width: 200,
            fixed: 'right',
            render: (_, record: User) => (
                <Space size="small" wrap>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                        }}
                    />
                    {record.isActive ? (
                        <Button
                            icon={<StopOutlined />}
                            danger
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(record, false);
                            }}
                        />
                    ) : (
                        <Button
                            icon={<CheckCircleOutlined />}
                            type="primary"
                            size="small"
                            className="activate-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(record, true);
                            }}
                        />
                    )}
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(record);
                        }}
                    />
                </Space>
            ),
        },
    ]

    return (
        <div className="user-management-page">
            <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1>{t('admin.users.title')}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Input
                        placeholder={t('admin.users.searchPlaceholder')}
                        prefix={<SearchOutlined />}
                        onChange={e => handleSearch(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                        value={searchText}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        {t('admin.users.actions.add')}
                    </Button>
                </div>
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

            <UserDetailModal
                visible={isViewModalVisible}
                user={viewUser}
                onClose={() => setIsViewModalVisible(false)}
                onEdit={(user) => {
                    setIsViewModalVisible(false)
                    handleEdit(user)
                }}
            />
        </div>
    )
}

export default UserManagement
