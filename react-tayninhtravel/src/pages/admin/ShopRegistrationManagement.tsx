import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form, message } from 'antd'
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import { adminService } from '@/services/adminService'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import './ShopRegistrationManagement.scss'
import { useThemeStore } from '@/store/useThemeStore'

interface AdminShopRegistration {
    id: string;
    shopName: string;
    ownerEmail: string;
    status: number;
    createdAt: string;
    reason?: string;
}

const { TextArea } = Input

const ShopRegistrationManagement = () => {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const { t } = useTranslation()
    const [searchText, setSearchText] = useState('')
    const [rejectModalVisible, setRejectModalVisible] = useState(false)
    const [selectedShop, setSelectedShop] = useState<string | null>(null)
    const [registrations, setRegistrations] = useState<AdminShopRegistration[]>([])
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)

    // Lấy trạng thái dark mode từ store
    const isDark = useThemeStore(state => state.isDarkMode)

    const fetchRegistrations = async (params = {}) => {
        try {
            setLoading(true)
            const apiShops = await adminService.getShopRegistrations({
                page: (pagination.current || 1) - 1,
                pageSize: pagination.pageSize,
                status: statusFilter,
                searchTerm: searchText,
                ...params
            })
            const mapped: AdminShopRegistration[] = apiShops.map((shop: any) => ({
                id: shop.id,
                shopName: shop.shopName,
                ownerEmail: shop.ownerEmail,
                status: typeof shop.status === 'number' ? shop.status : 0,
                createdAt: shop.createdAt,
                reason: shop.rejectionReason || undefined
            }))
            setRegistrations(mapped)
        } catch (error: any) {
            Modal.error({
                title: 'Lỗi',
                content: error.response?.status === 401 ? 'Bạn cần đăng nhập lại' : 'Không thể tải danh sách đăng ký shop. Vui lòng thử lại sau.'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            message.error(t('admin.shopManagement.messages.error.auth'))
            navigate('/login')
            return
        }
        fetchRegistrations()
    }, [isAuthenticated, navigate, t, pagination, statusFilter, searchText])

    const columns: ColumnsType<AdminShopRegistration> = [
        {
            title: t('admin.shopManagement.columns.index'),
            key: 'index',
            width: '8%',
            render: (_, __, index) => index + 1,
        },
        {
            title: t('admin.shopManagement.columns.shopName'),
            dataIndex: 'shopName',
            key: 'shopName',
            width: '30%',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: boolean | Key, record: AdminShopRegistration) => {
                const searchValue = value.toString().toLowerCase()
                return record.shopName.toLowerCase().includes(searchValue)
            },
        },
        {
            title: t('admin.shopManagement.columns.ownerEmail'),
            dataIndex: 'ownerEmail',
            key: 'ownerEmail',
            width: '25%',
        },
        {
            title: t('admin.shopManagement.columns.submitDate'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
            sorter: (a: AdminShopRegistration, b: AdminShopRegistration) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: t('admin.shopManagement.columns.status'),
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            render: (status: number) => {
                let color = 'gold'
                let text = t('admin.shopManagement.status.pending')
                if (status === 1) {
                    color = 'green'
                    text = t('admin.shopManagement.status.approved')
                } else if (status === 2) {
                    color = 'red'
                    text = t('admin.shopManagement.status.rejected')
                }
                return <Tag color={color}>{text}</Tag>
            },
            filters: [
                { text: t('admin.shopManagement.status.pending'), value: 0 },
                { text: t('admin.shopManagement.status.approved'), value: 1 },
                { text: t('admin.shopManagement.status.rejected'), value: 2 },
            ],
            onFilter: (value: boolean | Key, record: AdminShopRegistration) => record.status === Number(value),
        },
        {
            title: t('admin.shopManagement.columns.actions'),
            key: 'actions',
            width: '15%',
            render: (_, record: AdminShopRegistration) => (
                <Space>
                    {record.status === 0 && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(record.id)}
                            >
                                {t('admin.shopManagement.actions.approve')}
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleReject(record.id)}
                            >
                                {t('admin.shopManagement.actions.reject')}
                            </Button>
                        </>
                    )}
                </Space>
            )
        }
    ]

    const handleTableChange = (paginationObj: any, filters: any) => {
        setPagination({ current: paginationObj.current, pageSize: paginationObj.pageSize })
        if (filters.status && filters.status.length > 0) {
            setStatusFilter(Number(filters.status[0]))
        } else {
            setStatusFilter(undefined)
        }
    }

    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination({ ...pagination, current: 1 })
    }
    const handleApprove = async (shopId: string) => {
        Modal.confirm({
            title: t('admin.shopManagement.confirmations.approve.title'),
            content: t('admin.shopManagement.confirmations.approve.content'),
            okText: t('admin.shopManagement.actions.approve'),
            okType: 'primary',
            cancelText: t('common.cancel'),
            onOk: async () => {
                try {
                    await adminService.approveShopRegistration(shopId);
                    fetchRegistrations()
                    Modal.success({
                        title: t('admin.shopManagement.messages.success.approved'),
                        content: t('admin.shopManagement.messages.success.approved')
                    })
                } catch (error) {
                    Modal.error({
                        title: t('admin.shopManagement.messages.error.approve'),
                        content: t('admin.shopManagement.messages.error.approve')
                    })
                }
            }
        })
    }
    const handleReject = (shopId: string) => {
        setSelectedShop(shopId)
        setRejectModalVisible(true)
        form.resetFields()
    }
    const handleRejectModalOk = async () => {
        try {
            const values = await form.validateFields()
            await adminService.rejectShopRegistration(selectedShop as string, values.reason);
            fetchRegistrations()
            setRejectModalVisible(false)
            setSelectedShop(null)
            Modal.success({
                title: t('admin.shopManagement.messages.success.rejected'),
                content: t('admin.shopManagement.messages.success.rejected')
            })
        } catch (error: any) {
            if (error.errorFields === undefined) {
                Modal.error({
                    title: t('admin.shopManagement.messages.error.reject'),
                    content: t('admin.shopManagement.messages.error.reject')
                })
            }
        }
    }
    const handleRejectModalCancel = () => {
        setRejectModalVisible(false)
        setSelectedShop(null)
    }

    return (
        <div className={`shop-management-page${isDark ? ' dark' : ''}`}>
            <div className="page-header">
                <h1>{t('admin.shopManagement.title')}</h1>
                <div className="header-actions">
                    <Input
                        placeholder={t('admin.shopManagement.searchPlaceholder')}
                        prefix={<SearchOutlined />}
                        onChange={e => handleSearch(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                </div>
            </div>
            <Table
                dataSource={registrations}
                columns={columns}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                }}
                className="shop-table"
                loading={loading}
                scroll={{ x: 900 }}
                onChange={handleTableChange}
            />
            <Modal
                title={t('admin.shopManagement.confirmations.reject.title')}
                open={rejectModalVisible}
                onOk={handleRejectModalOk}
                onCancel={handleRejectModalCancel}
                okText={t('admin.shopManagement.actions.reject')}
                cancelText={t('common.cancel')}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="reason"
                        label={t('admin.shopManagement.confirmations.reject.label')}
                        rules={[{ required: true, message: t('admin.shopManagement.confirmations.reject.required') }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder={t('admin.shopManagement.confirmations.reject.placeholder')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default ShopRegistrationManagement
