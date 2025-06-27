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
import { AdminShopRegistration } from '@/types/application'
import './ShopRegistrationManagement.scss'
import { useThemeStore } from '@/store/useThemeStore'
import ShopApplicationDetailModal from './ShopApplicationDetailModal'

const { TextArea } = Input

const ShopRegistrationManagement = () => {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const { t } = useTranslation()
    const [searchText, setSearchText] = useState('')
    const [rejectModalVisible, setRejectModalVisible] = useState(false)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [selectedShop, setSelectedShop] = useState<string | null>(null)
    const [selectedApplication, setSelectedApplication] = useState<AdminShopRegistration | null>(null)
    const [registrations, setRegistrations] = useState<AdminShopRegistration[]>([])
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [statusFilter, setStatusFilter] = useState<number[] | undefined>(undefined)

    // Lấy trạng thái dark mode từ store
    const isDark = useThemeStore(state => state.isDarkMode)

    // Function để translate shop type
    const translateShopType = (shopType: string) => {
        const shopTypeKey = `jobs.shopRegistration.form.shopTypes.${shopType}`;
        const translated = t(shopTypeKey);
        // Nếu không tìm thấy translation, trả về shopType gốc
        return translated !== shopTypeKey ? translated : shopType;
    }

    const fetchRegistrations = async (params = {}) => {
        try {
            setLoading(true)
            const response = await adminService.getShopRegistrations({
                page: (pagination.current || 1) - 1,
                pageSize: pagination.pageSize,
                // Không gửi status filter lên server, sẽ filter ở client
                searchTerm: searchText,
                ...params
            })

            // Kiểm tra structure của response
            console.log('Shop registrations response:', response);
            console.log('Response type:', typeof response);
            console.log('Is array:', Array.isArray(response));

            // Nếu response có structure như tour guide (có data.applications)
            let apiShops = [];
            if (response && (response as any).data && Array.isArray((response as any).data.applications)) {
                console.log('Using data.applications structure');
                apiShops = (response as any).data.applications;
            } else if (Array.isArray(response)) {
                console.log('Using direct array structure');
                apiShops = response;
            } else {
                console.warn('Unexpected response structure:', response);
                apiShops = [];
            }

            console.log('Processed apiShops:', apiShops);

            const mapped: AdminShopRegistration[] = apiShops.map((shop: any) => ({
                id: shop.id,
                shopName: shop.shopName,
                location: shop.location,
                shopType: shop.shopType,
                representativeName: shop.representativeName,
                phoneNumber: shop.phoneNumber,
                userEmail: shop.userEmail,
                userName: shop.userName,
                status: typeof shop.status === 'number' ? shop.status : 0,
                submittedAt: shop.submittedAt,
                processedAt: shop.processedAt,
                reason: shop.rejectionReason || undefined,
                website: shop.website,
                shopDescription: shop.shopDescription,
                openingHour: shop.openingHour,
                closingHour: shop.closingHour,
                logo: shop.logo,
                businessLicense: shop.businessLicense,
                businessCode: shop.businessCode
            }))
            setRegistrations(mapped)
        } catch (error: any) {
            console.error('Error fetching shop registrations:', error);
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
    }, [isAuthenticated, navigate, t, pagination, searchText])

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
            width: '18%',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: boolean | Key, record: AdminShopRegistration) => {
                const searchValue = value.toString().toLowerCase()
                return record.shopName.toLowerCase().includes(searchValue) ||
                    record.representativeName.toLowerCase().includes(searchValue) ||
                    record.userEmail.toLowerCase().includes(searchValue)
            },
        },
        {
            title: 'Người đại diện',
            dataIndex: 'representativeName',
            key: 'representativeName',
            width: '15%',
        },
        {
            title: t('admin.shopManagement.columns.ownerEmail'),
            dataIndex: 'userEmail',
            key: 'userEmail',
            width: '17%',
        },
        {
            title: 'Loại shop',
            dataIndex: 'shopType',
            key: 'shopType',
            width: '12%',
            render: (shopType: string) => translateShopType(shopType),
        },
        {
            title: t('admin.shopManagement.columns.submitDate'),
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            width: '13%',
            render: (date: string) => {
                if (!date) return 'N/A';
                try {
                    return new Date(date).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (error) {
                    return 'Invalid Date';
                }
            },
            sorter: (a: AdminShopRegistration, b: AdminShopRegistration) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
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
            filteredValue: statusFilter,
            onFilter: (value: boolean | Key, record: AdminShopRegistration) => record.status === Number(value),
        },
        {
            title: t('admin.shopManagement.columns.actions'),
            key: 'actions',
            width: '22%',
            render: (_, record: AdminShopRegistration) => (
                <Space>
                    {record.status === 0 ? (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(record.id);
                                }}
                            >
                                Duyệt
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(record.id);
                                }}
                            >
                                Từ chối
                            </Button>
                        </>
                    ) : (
                        // Placeholder để giữ nguyên độ rộng cột
                        <span style={{ display: 'inline-block', width: '100px' }}>&nbsp;</span>
                    )}
                </Space>
            )
        }
    ]

    const handleTableChange = (paginationObj: any, filters: any) => {
        setPagination({ current: paginationObj.current, pageSize: paginationObj.pageSize })

        // Xử lý filter status
        if (filters.status) {
            if (filters.status.length === 0) {
                // Reset filter - không có filter nào được chọn
                setStatusFilter(undefined)
            } else if (filters.status.length === 3) {
                // Chọn tất cả options - hiển thị tất cả
                setStatusFilter(undefined)
            } else {
                // Chọn 1 hoặc nhiều options cụ thể
                setStatusFilter(filters.status.map((status: any) => Number(status)))
            }
        } else {
            // Không có filter
            setStatusFilter(undefined)
        }
    }

    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination({ ...pagination, current: 1 })
    }

    const handleDetailModalClose = () => {
        setDetailModalVisible(false)
        setSelectedApplication(null)
    }

    const handleDetailApprove = (id: string) => {
        setDetailModalVisible(false)
        handleApprove(id)
    }

    const handleDetailReject = (id: string) => {
        setDetailModalVisible(false)
        const application = registrations.find(reg => reg.id === id)
        if (application) {
            handleReject(id)
        }
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
                onRow={(record) => ({
                    onClick: () => {
                        setSelectedApplication(record);
                        setDetailModalVisible(true);
                    },
                    style: { cursor: 'pointer' }
                })}
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

            {/* Detail Modal */}
            <ShopApplicationDetailModal
                visible={detailModalVisible}
                onClose={handleDetailModalClose}
                application={selectedApplication}
                onApprove={handleDetailApprove}
                onReject={handleDetailReject}
                translateShopType={translateShopType}
            />
        </div>
    )
}

export default ShopRegistrationManagement
