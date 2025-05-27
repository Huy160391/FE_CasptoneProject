import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form, message } from 'antd'
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileOutlined,
    DownloadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import axiosInstance from '@/config/axios'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import './CVManagement.scss'

const { TextArea } = Input

interface CV {
    id: string
    email: string
    curriculumVitae: string
    status: number
    rejectionReason: string | null
    createdAt: string
    user: {
        name: string
    }
}

const CVManagement = () => {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const { t } = useTranslation()
    const [searchText, setSearchText] = useState('')
    const [rejectModalVisible, setRejectModalVisible] = useState(false)
    const [selectedCV, setSelectedCV] = useState<string | null>(null)
    const [cvs, setCvs] = useState<CV[]>([])
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const fetchCVs = async () => {
        try {
            setLoading(true)
            // Debug: Kiểm tra token
            const token = localStorage.getItem('token')
            console.log('Current token:', token)

            const response = await axiosInstance.get('Cms/tour-guide-application')
            console.log('Response:', response)
            setCvs(response.data)
        } catch (error: any) {
            console.error('Error fetching CVs:', error)
            if (error.response) {
                console.error('Response status:', error.response.status)
                console.error('Response headers:', error.response.headers)
                console.error('Response data:', error.response.data)
            }
            Modal.error({
                title: 'Lỗi',
                content: error.response?.status === 401 ? 'Bạn cần đăng nhập lại' : 'Không thể tải danh sách CV. Vui lòng thử lại sau.'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Kiểm tra xác thực
        if (!isAuthenticated) {
            message.error(t('admin.cvManagement.messages.error.auth'))
            navigate('/login')
            return
        }
        fetchCVs()
    }, [isAuthenticated, navigate, t])

    const columns: ColumnsType<CV> = [
        {
            title: t('admin.cvManagement.columns.index'),
            key: 'index',
            width: '8%',
            render: (_, __, index) => index + 1,
        },
        {
            title: t('admin.cvManagement.columns.email'),
            dataIndex: 'email',
            key: 'email',
            width: '30%',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: boolean | Key, record: CV) => {
                const searchValue = value.toString().toLowerCase()
                return record.email.toLowerCase().includes(searchValue)
            },
        },
        {
            title: t('admin.cvManagement.columns.submitDate'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '15%',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
            sorter: (a: CV, b: CV) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: t('admin.cvManagement.columns.attachment'),
            dataIndex: 'curriculumVitae',
            key: 'curriculumVitae',
            width: '20%',
            render: (file: string) => (
                <Space>
                    <FileOutlined />
                    <a href={file} target="_blank" rel="noopener noreferrer">
                        {t('admin.cvManagement.actions.viewCV')}
                    </a>
                    <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        type="text"
                        onClick={() => {
                            window.open(file, '_blank')
                        }}
                    />
                </Space>
            )
        },
        {
            title: t('admin.cvManagement.columns.status'),
            dataIndex: 'status',
            key: 'status',
            width: '12%',
            render: (status: number) => {
                let color = 'gold'
                let text = t('admin.cvManagement.status.pending')

                if (status === 1) {
                    color = 'green'
                    text = t('admin.cvManagement.status.approved')
                } else if (status === 2) {
                    color = 'red'
                    text = t('admin.cvManagement.status.rejected')
                }

                return <Tag color={color}>{text}</Tag>
            },
            filters: [
                { text: t('admin.cvManagement.status.pending'), value: 0 },
                { text: t('admin.cvManagement.status.approved'), value: 1 },
                { text: t('admin.cvManagement.status.rejected'), value: 2 },
            ],
            onFilter: (value: boolean | Key, record: CV) => record.status === Number(value),
        },
        {
            title: t('admin.cvManagement.columns.actions'),
            key: 'actions',
            width: '15%',
            render: (_, record: CV) => (
                <Space>                    {record.status === 0 && (
                    <>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleApprove(record.id)}
                        >
                            {t('admin.cvManagement.actions.approve')}
                        </Button>
                        <Button
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleReject(record.id)}
                        >
                            {t('admin.cvManagement.actions.reject')}
                        </Button>
                    </>
                )}
                </Space>
            )
        }
    ]

    const handleSearch = (value: string) => {
        setSearchText(value)
    }

    const handleApprove = async (cvId: string) => {
        Modal.confirm({
            title: t('admin.cvManagement.confirmations.approve.title'), content: t('admin.cvManagement.confirmations.approve.content'),
            okText: t('admin.cvManagement.actions.approve'),
            okType: 'primary',
            cancelText: t('common.cancel'),
            onOk: async () => {
                try {
                    await axiosInstance.put(`Cms/${cvId}/approve-application`)
                    fetchCVs()
                    Modal.success({
                        title: t('admin.cvManagement.messages.success.approved'),
                        content: t('admin.cvManagement.messages.success.approved')
                    })
                } catch (error) {
                    console.error('Error approving CV:', error)
                    Modal.error({
                        title: t('admin.cvManagement.messages.error.approve'),
                        content: t('admin.cvManagement.messages.error.approve')
                    })
                }
            }
        })
    }

    const handleReject = (cvId: string) => {
        setSelectedCV(cvId)
        setRejectModalVisible(true)
        form.resetFields()
    }
    const handleRejectModalOk = async () => {
        try {
            const values = await form.validateFields()
            await axiosInstance.put(`Cms/${selectedCV}/reject-application`, {
                reason: values.reason
            })
            fetchCVs()
            setRejectModalVisible(false)
            setSelectedCV(null)
            Modal.success({
                title: t('admin.cvManagement.messages.success.rejected'),
                content: t('admin.cvManagement.messages.success.rejected')
            })
        } catch (error: any) {
            console.error('Error rejecting CV:', error)
            if (error.errorFields === undefined) {
                Modal.error({
                    title: t('admin.cvManagement.messages.error.reject'),
                    content: t('admin.cvManagement.messages.error.reject')
                })
            }
        }
    }

    const handleRejectModalCancel = () => {
        setRejectModalVisible(false)
        setSelectedCV(null)
    }

    return (
        <div className="cv-management-page">
            <div className="page-header">
                <h1>{t('admin.cvManagement.title')}</h1>
                <div className="header-actions">
                    <Input
                        placeholder={t('admin.cvManagement.searchPlaceholder')}
                        prefix={<SearchOutlined />}
                        onChange={e => handleSearch(e.target.value)}
                        className="search-input"
                        allowClear
                    />
                </div>
            </div>

            <Table
                dataSource={cvs}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                className="cv-table"
                loading={loading}
            />

            <Modal
                title={t('admin.cvManagement.confirmations.reject.title')}
                open={rejectModalVisible} onOk={handleRejectModalOk}
                onCancel={handleRejectModalCancel}
                okText={t('admin.cvManagement.actions.reject')}
                cancelText={t('common.cancel')}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="reason"
                        label={t('admin.cvManagement.confirmations.reject.label')}
                        rules={[{ required: true, message: t('admin.cvManagement.confirmations.reject.required') }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder={t('admin.cvManagement.confirmations.reject.placeholder')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default CVManagement
