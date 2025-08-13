import { useEffect, useState } from 'react'
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    message,
    Spin,
    Modal,
    Form,
    InputNumber,
    DatePicker,
    Switch,
    Radio
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { voucherService } from '@/services/voucherService'
import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '@/types/voucher'
import dayjs from 'dayjs'
import './VoucherManagement.scss'

const { RangePicker } = DatePicker
const { TextArea } = Input

const VoucherManagement = () => {
    const [loading, setLoading] = useState(false)
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [searchText, setSearchText] = useState('')
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    })
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined)

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
    const [form] = Form.useForm()

    // Fetch vouchers from API
    const fetchVouchers = async () => {
        setLoading(true)
        try {
            const response = await voucherService.getAllVouchers(
                pagination.current,
                pagination.pageSize,
                searchText,
                statusFilter
            )

            if (response.success) {
                setVouchers(response.data)
                setPagination(prev => ({
                    ...prev,
                    total: response.totalRecord
                }))
            } else {
                message.error(response.message || 'Lỗi tải danh sách voucher')
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error)
            message.error('Lỗi tải danh sách voucher')
        } finally {
            setLoading(false)
        }
    }

    // Load vouchers on component mount and when dependencies change
    useEffect(() => {
        fetchVouchers()
    }, [pagination.current, pagination.pageSize, statusFilter])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.current === 1) {
                fetchVouchers()
            } else {
                setPagination(prev => ({ ...prev, current: 1 }))
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchText])

    // Handle table pagination change
    const handleTableChange = (newPagination: any, filters: any) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        })

        // Handle status filter
        if (filters.isActive && filters.isActive.length > 0) {
            setStatusFilter(filters.isActive[0])
        } else {
            setStatusFilter(undefined)
        }
    }

    // Handle search
    const handleSearch = (value: string) => {
        setSearchText(value)
    }

    // Handle add voucher
    const handleAdd = () => {
        setEditingVoucher(null)
        form.resetFields()
        // Set default values
        form.setFieldsValue({
            isActive: true,
            discountType: 'amount',
            quantity: 1
        })
        setIsModalVisible(true)
    }

    // Handle edit voucher
    const handleEdit = (voucher: Voucher) => {
        setEditingVoucher(voucher)
        form.setFieldsValue({
            name: voucher.name,
            description: voucher.description,
            quantity: voucher.quantity,
            discountType: voucher.discountAmount ? 'amount' : 'percent',
            discountAmount: voucher.discountAmount,
            discountPercent: voucher.discountPercent,
            dateRange: [dayjs(voucher.startDate), dayjs(voucher.endDate)],
            isActive: voucher.isActive
        })
        setIsModalVisible(true)
    }

    // Handle delete voucher
    const handleDelete = (voucher: Voucher) => {
        Modal.confirm({
            title: 'Xác nhận xóa voucher',
            content: `Bạn có chắc chắn muốn xóa voucher "${voucher.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await voucherService.deleteVoucher(voucher.id)
                    if (response.success) {
                        message.success('Xóa voucher thành công')
                        fetchVouchers()
                    } else {
                        message.error(response.message || 'Lỗi xóa voucher')
                    }
                } catch (error) {
                    console.error('Error deleting voucher:', error)
                    message.error('Lỗi xóa voucher')
                }
            },
        })
    }

    // Handle form submit
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            const voucherData = {
                name: values.name,
                description: values.description,
                quantity: values.quantity,
                discountAmount: values.discountType === 'amount' ? values.discountAmount : null,
                discountPercent: values.discountType === 'percent' ? values.discountPercent : null,
                startDate: values.dateRange[0].toISOString(),
                endDate: values.dateRange[1].toISOString(),
                ...(editingVoucher && { isActive: values.isActive })
            }

            // Loại bỏ field null để không gửi lên API
            const cleanData = Object.fromEntries(
                Object.entries(voucherData).filter(([_, value]) => value !== null && value !== undefined)
            )

            console.log('Voucher data to send:', cleanData)

            // Validate data
            const errors = voucherService.validateVoucherData(voucherData as CreateVoucherRequest)
            if (errors.length > 0) {
                message.error(errors[0])
                return
            }

            let response
            if (editingVoucher) {
                response = await voucherService.updateVoucher(
                    editingVoucher.id,
                    cleanData as UpdateVoucherRequest
                )
            } else {
                response = await voucherService.createVoucher(cleanData as CreateVoucherRequest)
            }

            if (response.success) {
                message.success(editingVoucher ? 'Cập nhật voucher thành công' : 'Tạo voucher thành công')
                setIsModalVisible(false)
                fetchVouchers()
            } else {
                message.error(response.message || 'Lỗi lưu voucher')
            }
        } catch (error) {
            console.error('Error saving voucher:', error)
            message.error('Lỗi lưu voucher')
        }
    }

    // Get status color for voucher
    const getStatusColor = (voucher: Voucher): string => {
        if (!voucher.isActive) return 'default'
        if (voucher.isExpired) return 'red'

        const daysRemaining = voucherService.getDaysRemaining(voucher)

        if (daysRemaining <= 3) return 'orange' // Sắp hết hạn
        return 'green' // Hoạt động bình thường
    }

    // Get status text for voucher
    const getStatusText = (voucher: Voucher): string => {
        if (!voucher.isActive) return 'Tạm dừng'
        if (voucher.isExpired) return 'Hết hạn'

        const daysRemaining = voucherService.getDaysRemaining(voucher)
        if (daysRemaining === 0) return 'Hết hạn hôm nay'
        if (daysRemaining <= 3) return `Còn ${daysRemaining} ngày`
        return 'Hoạt động'
    }

    // Table columns configuration
    const columns: ColumnsType<Voucher> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '80px',
            ellipsis: true,
        },
        {
            title: 'Tên voucher',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a, b) => a.quantity - b.quantity,
            align: 'center',
        },
        {
            title: 'Đã dùng',
            dataIndex: 'usedCount',
            key: 'usedCount',
            sorter: (a, b) => a.usedCount - b.usedCount,
            align: 'center',
            render: (count) => <span style={{ color: '#1890ff' }}>{count}</span>
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            render: (_, record) => (
                <span style={{ fontWeight: 'bold', color: '#f5222d' }}>
                    {voucherService.getFormattedDiscount(record)}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => (
                <Tag color={getStatusColor(record)}>
                    {getStatusText(record)}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Tạm dừng', value: false },
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small" wrap>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ]

    return (
        <div className="voucher-management-page">
            {/* Header */}
            <div className="header-bar">
                <h1>Quản lý voucher</h1>
                <div className="header-actions">
                    <Input
                        placeholder="Tìm kiếm voucher theo tên..."
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
                        Thêm voucher
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Spin spinning={loading}>
                <Table
                    dataSource={vouchers}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} voucher`,
                    }}
                    onChange={handleTableChange}
                    className="vouchers-table"
                />
            </Spin>

            {/* Create/Edit Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                        {editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
                    </div>
                }
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                okText={editingVoucher ? 'Cập nhật' : 'Tạo voucher'}
                cancelText="Hủy"
                destroyOnClose
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        isActive: true,
                        discountType: 'amount',
                        quantity: 1
                    }}
                >
                    <Form.Item
                        label="Tên voucher"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên voucher' },
                            { min: 3, message: 'Tên voucher phải có ít nhất 3 ký tự' },
                            { max: 100, message: 'Tên voucher không được quá 100 ký tự' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: Giảm 50K cuối tuần" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mô tả' },
                            { max: 500, message: 'Mô tả không được quá 500 ký tự' }
                        ]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Mô tả chi tiết về voucher..."
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            label="Số lượng"
                            name="quantity"
                            style={{ flex: 1 }}
                            rules={[
                                { required: true, message: 'Vui lòng nhập số lượng' },
                                { type: 'number', min: 1, max: 10000, message: 'Số lượng từ 1 đến 10,000' }
                            ]}
                        >
                            <InputNumber
                                placeholder="Số lượng"
                                style={{ width: '100%' }}
                                min={1}
                                max={10000}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Loại giảm giá"
                            name="discountType"
                            style={{ flex: 1 }}
                        >
                            <Radio.Group
                                onChange={() => {
                                    // Clear both discount fields when type changes
                                    form.setFieldValue('discountAmount', undefined)
                                    form.setFieldValue('discountPercent', undefined)
                                }}
                            >
                                <Radio value="amount">Số tiền</Radio>
                                <Radio value="percent">Phần trăm</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </div>

                    <Form.Item dependencies={['discountType']}>
                        {({ getFieldValue }) => {
                            const discountType = getFieldValue('discountType')
                            return discountType === 'amount' ? (
                                <Form.Item
                                    label="Số tiền giảm (VNĐ)"
                                    name="discountAmount"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số tiền giảm' },
                                        { type: 'number', min: 1000, message: 'Số tiền tối thiểu 1,000 VNĐ' }
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="Ví dụ: 50000"
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        min={1000}
                                        addonAfter="VNĐ"
                                        onChange={() => {
                                            // Clear percent field when amount is selected
                                            form.setFieldValue('discountPercent', undefined)
                                        }}
                                    />
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    label="Phần trăm giảm (%)"
                                    name="discountPercent"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập phần trăm giảm' },
                                        { type: 'number', min: 1, max: 100, message: 'Phần trăm từ 1% đến 100%' }
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="Ví dụ: 10"
                                        style={{ width: '100%' }}
                                        min={1}
                                        max={100}
                                        addonAfter="%"
                                        onChange={() => {
                                            // Clear amount field when percent is selected
                                            form.setFieldValue('discountAmount', undefined)
                                        }}
                                    />
                                </Form.Item>
                            )
                        }}
                    </Form.Item>

                    <Form.Item
                        label="Thời gian hiệu lực"
                        name="dateRange"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thời gian hiệu lực' }
                        ]}
                    >
                        <RangePicker
                            showTime
                            style={{ width: '100%' }}
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

                    {editingVoucher && (
                        <Form.Item
                            label="Trạng thái"
                            name="isActive"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Hoạt động"
                                unCheckedChildren="Tạm dừng"
                            />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    )
}

export default VoucherManagement
