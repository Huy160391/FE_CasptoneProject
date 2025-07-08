import { useState } from 'react'
import {
    Modal,
    Form,
    Input,
    Upload,
    Button,
    Alert,
    Typography,
    Row,
    Col,
    Divider,
    notification,
    Space,
    DatePicker
} from 'antd'
import {
    BankOutlined,
    CopyOutlined,
    UploadOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { useTranslation } from 'react-i18next'
import './BankTransferConfirmModal.scss'

const { Text } = Typography
const { TextArea } = Input

interface BankTransferConfirmModalProps {
    visible: boolean
    onClose: () => void
    onConfirm: (data: BankTransferData) => void
    orderTotal: number
    orderId?: string
}

export interface BankTransferData {
    transferAmount: number
    transferDate: string
    transferNote: string
    proofImage?: UploadFile[]
    customerNote?: string
}

const BankTransferConfirmModal = ({
    visible,
    onClose,
    onConfirm,
    orderTotal,
    orderId = 'TN-' + Date.now()
}: BankTransferConfirmModalProps) => {
    const { t } = useTranslation()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const bankInfo = {
        bankName: 'Ngân hàng TMCP Á Châu (ACB)',
        accountNumber: '123456789',
        accountName: 'CONG TY TNHH TAY NINH TRAVEL',
        branch: 'Chi nhánh Tây Ninh'
    }

    const formatPrice = (price: number) => {
        return `${price.toLocaleString('vi-VN')}₫`
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            notification.success({
                message: t('common.copySuccess'),
                description: `${label} đã được sao chép`,
                duration: 2
            })
        })
    }

    const uploadProps: UploadProps = {
        fileList,
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList)
        },
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/')
            if (!isImage) {
                notification.error({
                    message: t('common.error'),
                    description: 'Chỉ chấp nhận file ảnh!'
                })
                return false
            }
            const isLt5M = file.size / 1024 / 1024 < 5
            if (!isLt5M) {
                notification.error({
                    message: t('common.error'),
                    description: 'Ảnh phải nhỏ hơn 5MB!'
                })
                return false
            }
            return false // Prevent auto upload
        },
        onRemove: (file) => {
            const index = fileList.indexOf(file)
            const newFileList = fileList.slice()
            newFileList.splice(index, 1)
            setFileList(newFileList)
        },
        maxCount: 3,
        multiple: true,
        accept: 'image/*'
    }

    const handleSubmit = async (values: any) => {
        setLoading(true)
        try {
            const transferData: BankTransferData = {
                transferAmount: orderTotal, // Use the fixed amount from props
                transferDate: values.transferDate ? values.transferDate.format('DD/MM/YYYY') : '',
                transferNote: values.transferNote,
                proofImage: fileList,
                customerNote: values.customerNote
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            onConfirm(transferData)

            notification.success({
                message: 'Xác nhận thành công',
                description: 'Thông tin chuyển khoản đã được ghi nhận. Đơn hàng sẽ được xử lý sau khi xác minh thanh toán.'
            })

            form.resetFields()
            setFileList([])
            onClose()

        } catch (error) {
            notification.error({
                message: t('common.error'),
                description: 'Có lỗi xảy ra, vui lòng thử lại'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        setFileList([])
        onClose()
    }

    return (
        <Modal
            title={
                <div className="modal-title">
                    <BankOutlined />
                    <span>Xác nhận chuyển khoản</span>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            width={680}
            className="bank-transfer-modal"
            footer={null}
        >
            <div className="modal-content">
                {/* Bank Information */}
                <Alert
                    type="info"
                    icon={<InfoCircleOutlined />}
                    message="Thông tin chuyển khoản"
                    description={
                        <div className="bank-info">
                            <Row gutter={[16, 8]}>
                                <Col span={8}>
                                    <Text strong>Ngân hàng:</Text>
                                </Col>
                                <Col span={14}>
                                    <Text>{bankInfo.bankName}</Text>
                                </Col>
                                <Col span={2}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => copyToClipboard(bankInfo.bankName, 'Tên ngân hàng')}
                                    />
                                </Col>

                                <Col span={8}>
                                    <Text strong>Số tài khoản:</Text>
                                </Col>
                                <Col span={14}>
                                    <Text copyable={{ text: bankInfo.accountNumber }}>
                                        {bankInfo.accountNumber}
                                    </Text>
                                </Col>
                                <Col span={2}></Col>

                                <Col span={8}>
                                    <Text strong>Chủ tài khoản:</Text>
                                </Col>
                                <Col span={14}>
                                    <Text>{bankInfo.accountName}</Text>
                                </Col>
                                <Col span={2}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => copyToClipboard(bankInfo.accountName, 'Tên chủ tài khoản')}
                                    />
                                </Col>

                                <Col span={8}>
                                    <Text strong>Số tiền:</Text>
                                </Col>
                                <Col span={14}>
                                    <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                                        {formatPrice(orderTotal)}
                                    </Text>
                                </Col>
                                <Col span={2}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => copyToClipboard(orderTotal.toString(), 'Số tiền')}
                                    />
                                </Col>

                                <Col span={8}>
                                    <Text strong>Nội dung CK:</Text>
                                </Col>
                                <Col span={14}>
                                    <Text copyable={{ text: `${orderId} - Thanh toan don hang` }}>
                                        {orderId} - Thanh toan don hang
                                    </Text>
                                </Col>
                                <Col span={2}></Col>
                            </Row>
                        </div>
                    }
                    className="bank-info-alert"
                />

                <Divider>Xác nhận thông tin chuyển khoản</Divider>

                {/* Confirmation Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        transferNote: `${orderId} - Thanh toan don hang`
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="transferAmount"
                                label="Số tiền đã chuyển"
                            >
                                <Input
                                    value={formatPrice(orderTotal)}
                                    readOnly
                                    style={{
                                        backgroundColor: '#f5f5f5',
                                        cursor: 'not-allowed',
                                        color: '#666'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="transferDate"
                                label="Ngày chuyển khoản"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày chuyển khoản' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngày chuyển khoản"
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="transferNote"
                        label="Nội dung chuyển khoản"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung chuyển khoản' }]}
                    >
                        <Input placeholder="Nội dung chuyển khoản" />
                    </Form.Item>

                    <Form.Item
                        label="Ảnh chứng từ chuyển khoản"
                        help="Tải lên ảnh chụp màn hình giao dịch thành công (tối đa 3 ảnh, mỗi ảnh < 5MB)"
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>
                                Tải lên ảnh chứng từ
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="customerNote"
                        label="Ghi chú thêm (không bắt buộc)"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Ghi chú thêm về giao dịch..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Alert
                        type="warning"
                        message="Lưu ý quan trọng"
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Vui lòng chuyển khoản đúng số tiền và nội dung được cung cấp</li>
                                <li>Đơn hàng sẽ được xử lý sau khi chúng tôi xác minh thông tin chuyển khoản</li>
                                <li>Thời gian xác minh: 1-2 giờ trong giờ hành chính</li>
                                <li>Ảnh chứng từ giúp chúng tôi xử lý nhanh chóng hơn</li>
                            </ul>
                        }
                        style={{ marginBottom: 24 }}
                    />

                    {/* Form Actions */}
                    <div className="form-actions">
                        <Space>
                            <Button onClick={handleCancel}>
                                Hủy bỏ
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<CheckCircleOutlined />}
                            >
                                Xác nhận đã chuyển khoản
                            </Button>
                        </Space>
                    </div>
                </Form>
            </div>
        </Modal>
    )
}

export default BankTransferConfirmModal
