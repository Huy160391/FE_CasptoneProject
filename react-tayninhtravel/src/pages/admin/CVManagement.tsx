import { useState } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form } from 'antd'
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    FileOutlined,
    DownloadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import './CVManagement.scss'

const { TextArea } = Input

interface CV {
    key: string
    id: number
    email: string
    name: string
    submissionDate: string
    fileAttachment: string
    status: 'pending' | 'approved' | 'rejected'
    note?: string
}

const CVManagement = () => {
    const [searchText, setSearchText] = useState('')
    const [rejectModalVisible, setRejectModalVisible] = useState(false)
    const [form] = Form.useForm()
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

    // Mock data for CVs
    const cvs: CV[] = [
        {
            key: '1',
            id: 1,
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@gmail.com',
            submissionDate: '2023-05-20',
            fileAttachment: 'CV_NguyenVanA.pdf',
            status: 'pending',
        },
        {
            key: '2',
            id: 2,
            name: 'Trần Thị B',
            email: 'tranthib@gmail.com',
            submissionDate: '2023-05-19',
            fileAttachment: 'CV_TranThiB.pdf',
            status: 'approved',
        },
        {
            key: '3',
            id: 3,
            name: 'Lê Văn C',
            email: 'levanc@gmail.com',
            submissionDate: '2023-05-18',
            fileAttachment: 'CV_LeVanC.pdf',
            status: 'rejected',
            note: 'Thiếu kinh nghiệm làm việc trong lĩnh vực du lịch',
        },
    ]

    const columns: ColumnsType<CV> = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id',
            sorter: (a: CV, b: CV) => a.id - b.id,
            width: '8%',
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: CV, b: CV) => a.name.localeCompare(b.name),
            width: '20%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '25%',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: boolean | Key, record: CV) => {
                const searchValue = value.toString().toLowerCase()
                return (
                    record.email.toLowerCase().includes(searchValue) ||
                    record.name.toLowerCase().includes(searchValue)
                )
            },
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submissionDate',
            key: 'submissionDate',
            width: '15%',
            sorter: (a: CV, b: CV) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime(),
        },
        {
            title: 'File đính kèm',
            dataIndex: 'fileAttachment',
            key: 'fileAttachment',
            width: '17%',
            render: (file: string) => (
                <Space>
                    <FileOutlined />
                    <a href="#" onClick={(e) => {
                        e.preventDefault()
                        // Logic to download file
                        console.log('Downloading file:', file)
                    }}>
                        {file}
                    </a>
                    <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        type="text"
                        onClick={() => {
                            // Logic to download file
                            console.log('Downloading file through button')
                        }}
                    />
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '15%',
            render: (status: CV['status']) => {
                let color = 'gold'
                let text = 'Đang xử lý'

                if (status === 'approved') {
                    color = 'green'
                    text = 'Đã duyệt'
                } else if (status === 'rejected') {
                    color = 'red'
                    text = 'Từ chối'
                }

                return <Tag color={color}>{text}</Tag>
            },
            filters: [
                { text: 'Đang xử lý', value: 'pending' },
                { text: 'Đã duyệt', value: 'approved' },
                { text: 'Từ chối', value: 'rejected' },
            ],
            onFilter: (value: boolean | Key, record: CV) => record.status === value,
        },
    ]

    const handleSearch = (value: string) => {
        setSearchText(value)
    }

    const handleApprove = (cvId: string) => {
        Modal.confirm({
            title: 'Xác nhận duyệt CV',
            content: 'Bạn có chắc chắn muốn duyệt CV này không?',
            okText: 'Duyệt',
            okType: 'primary',
            cancelText: 'Hủy',
            onOk() {
                console.log('Approved CV:', cvId)
            },
        })
    }

    const handleReject = () => {
        if (selectedRowKeys.length === 0) {
            Modal.warning({
                title: 'Cảnh báo',
                content: 'Vui lòng chọn ít nhất một CV để từ chối.',
            })
            return
        }
        setRejectModalVisible(true)
        form.resetFields()
    }

    const handleDelete = () => {
        if (selectedRowKeys.length === 0) {
            Modal.warning({
                title: 'Cảnh báo',
                content: 'Vui lòng chọn ít nhất một CV để xóa.',
            })
            return
        }
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} CV đã chọn không?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                console.log('Deleted CVs:', selectedRowKeys)
                setSelectedRowKeys([])
            },
        })
    }

    const handleRejectModalOk = () => {
        form.validateFields().then(values => {
            console.log('Reject reason:', values.reason)
            console.log('Rejected CVs:', selectedRowKeys)
            setRejectModalVisible(false)
            setSelectedRowKeys([])
        })
    }

    const handleRejectModalCancel = () => {
        setRejectModalVisible(false)
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    return (
        <div className="cv-management-page">
            <div className="page-header">
                <h1>Quản lý CV ứng tuyển</h1>
                <div className="header-actions">
                    <Input
                        placeholder="Tìm kiếm theo tên, email"
                        prefix={<SearchOutlined />}
                        onChange={e => handleSearch(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                </div>
            </div>

            <div className="batch-actions">
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(selectedRowKeys.join(','))}
                        disabled={selectedRowKeys.length === 0}
                    >
                        Duyệt đã chọn
                    </Button>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={handleReject}
                        disabled={selectedRowKeys.length === 0}
                    >
                        Từ chối đã chọn
                    </Button>
                    <Button
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                        disabled={selectedRowKeys.length === 0}
                    >
                        Xóa đã chọn
                    </Button>
                </Space>
            </div>

            <Table
                rowSelection={rowSelection}
                dataSource={cvs}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                className="cv-table"
            />

            <Modal
                title="Lý do từ chối CV"
                open={rejectModalVisible}
                onOk={handleRejectModalOk}
                onCancel={handleRejectModalCancel}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="reason"
                        label="Lý do từ chối"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                    >
                        <TextArea rows={4} placeholder="Nhập lý do từ chối CV này..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default CVManagement
