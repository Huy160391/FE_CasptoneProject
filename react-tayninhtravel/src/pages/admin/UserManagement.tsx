import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Spin } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import { adminService } from '@/services/adminService'
import type { User } from '@/types/user'
import './UserManagement.scss'

const { Option } = Select

const UserManagement = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuthStore()
    const { t } = useTranslation()
    const [searchText, setSearchText] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [form] = Form.useForm()
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    })
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined)

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
    }, [searchText])    // Hàm xử lý filter theo trạng thái
    const handleStatusFilterChange = (status: boolean | undefined) => {
        setStatusFilter(status);
        setPagination(prev => ({ ...prev, current: 1 }));
    }

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
            status: user.status,
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
                        status: values.status,
                    })
                    message.success(t('admin.users.messages.success.updated'))
                } else {
                    // Thêm người dùng mới
                    await adminService.createUser({
                        name: values.name,
                        email: values.email,
                        phone: values.phone,
                        status: values.status,
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
            dataIndex: 'status',
            key: 'status',
            render: (status: boolean) => {
                const color = status ? 'success' : 'error'
                const text = status ? t('admin.users.status.active') : t('admin.users.status.inactive')

                return <Tag color={color}>{text}</Tag>
            },
            filters: [
                { text: t('admin.users.status.active'), value: true },
                { text: t('admin.users.status.inactive'), value: false },
            ],
            onFilter: (value: any, record: User) =>
                record.status === value,
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
                    {record.status ? (
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
                    <Select
                        placeholder={t('admin.users.filters.all') || 'Tất cả người dùng'}
                        onChange={handleStatusFilterChange}
                        allowClear
                        style={{ width: 150 }}
                        value={statusFilter}
                    >
                        <Option value={true}>{t('admin.users.status.active')}</Option>
                        <Option value={false}>{t('admin.users.status.inactive')}</Option>
                    </Select>
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
                />
            </Spin>

            <Modal
                title={editingUser ? t('admin.users.modal.edit') : t('admin.users.modal.add')}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingUser ? t('common.save') : t('common.add')}
                cancelText={t('common.cancel')}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label={t('profile.name')}
                        rules={[{ required: true, message: t('profile.nameRequired') }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={t('profile.email')}
                        rules={[
                            { required: true, message: t('profile.emailRequired') },
                            { type: 'email', message: t('profile.emailInvalid') },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label={t('profile.phone')}
                        rules={[
                            { required: true, message: t('profile.phoneRequired') },
                            { pattern: /^[0-9]{10}$/, message: t('auth.phoneInvalid') },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label={t('admin.users.columns.status')}
                        rules={[{ required: true, message: t('admin.users.validation.statusRequired') }]}
                    >
                        <Select>
                            <Option value={true}>{t('admin.users.status.active')}</Option>
                            <Option value={false}>{t('admin.users.status.inactive')}</Option>
                        </Select>
                    </Form.Item>

                    {!editingUser && (
                        <>
                            <Form.Item
                                name="password"
                                label={t('auth.password')}
                                rules={[
                                    { required: true, message: t('auth.passwordRequired') },
                                    { min: 6, message: t('auth.passwordInvalid') },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label={t('auth.confirmPassword')}
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: t('auth.confirmPasswordRequired') },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve()
                                            }
                                            return Promise.reject(new Error(t('auth.passwordMismatch')))
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    )
}

export default UserManagement
