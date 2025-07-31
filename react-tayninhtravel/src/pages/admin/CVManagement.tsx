import { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Tag, Modal, Form, message, Tooltip } from 'antd'
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileOutlined,
    DownloadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Key } from 'react'
import { adminService } from '@/services/adminService'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import { getTourGuideApplicationStatusText, getTourGuideApplicationStatusColor, TourGuideApplicationStatus } from '@/types/application'
import './CVManagement.scss'
import CVDetailModal from './CVDetailModal'

// Đổi tên interface CV thành AdminCV để tránh xung đột với type CV global
interface AdminCV {
    id: string;
    fullName: string;
    userEmail: string;
    phoneNumber: string;
    experience: string;
    curriculumVitae?: string;
    status: string; // Change from number to string
    submittedAt: string;
    userName: string;
    reason?: string;
}

const { TextArea } = Input

const CVManagement = () => {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const { t } = useTranslation()
    const [searchText, setSearchText] = useState('')
    const [rejectModalVisible, setRejectModalVisible] = useState(false)
    const [selectedCV, setSelectedCV] = useState<string | null>(null)
    const [cvs, setCvs] = useState<AdminCV[]>([])
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedCVDetail, setSelectedCVDetail] = useState<AdminCV | null>(null);

    const fetchCVs = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            console.log('Current token:', token)
            // Map dữ liệu trả về sang đúng shape của AdminCV
            const apiCVs = await adminService.getCVs();
            const mappedCVs: AdminCV[] = apiCVs.map((cv: any) => ({
                id: cv.id,
                fullName: cv.fullName,
                userEmail: cv.userEmail,
                phoneNumber: cv.phoneNumber,
                experience: cv.experience,
                curriculumVitae: cv.curriculumVitae,
                status: typeof cv.status === 'string' ? cv.status : (cv.status === 0 ? 'Pending' : cv.status === 1 ? 'Approved' : 'Rejected'),
                submittedAt: cv.submittedAt,
                userName: cv.userName,
                reason: cv.rejectionReason || undefined
            }))
            setCvs(mappedCVs)
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

    const columns: ColumnsType<AdminCV> = [
        {
            title: t('admin.cvManagement.columns.index'),
            key: 'index',
            width: '8%',
            render: (_, __, index) => index + 1,
        },
        {
            title: t('admin.cvManagement.columns.email'),
            dataIndex: 'userEmail',
            key: 'userEmail',
            width: '20%',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: boolean | Key, record: AdminCV) => {
                const searchValue = value.toString().toLowerCase()
                return record.userEmail.toLowerCase().includes(searchValue) ||
                    record.fullName.toLowerCase().includes(searchValue)
            },
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            width: '15%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: '12%',
        },
        {
            title: 'Kinh nghiệm',
            dataIndex: 'experience',
            key: 'experience',
            width: '10%',
            render: (exp: string) => {
                const displayText = exp.length > 50 ? exp.slice(0, 50) + '...' : exp;
                return (
                    <Tooltip title={exp} placement="topLeft">
                        <span>{displayText} năm</span>
                    </Tooltip>
                );
            },
        },
        {
            title: t('admin.cvManagement.columns.submitDate'),
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            width: '12%',
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
            sorter: (a: AdminCV, b: AdminCV) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
        },
        {
            title: t('admin.cvManagement.columns.attachment'),
            dataIndex: 'curriculumVitae',
            key: 'curriculumVitae',
            width: '15%',
            render: (file: string) => {
                if (!file) return 'N/A';
                return (
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
                );
            }
        },
        {
            title: t('admin.cvManagement.columns.status'),
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            render: (status: string) => {
                const color = getTourGuideApplicationStatusColor(status);
                const text = getTourGuideApplicationStatusText(status);
                return <Tag color={color}>{text}</Tag>
            },
            filters: [
                { text: t('admin.cvManagement.status.pending'), value: TourGuideApplicationStatus.PENDING },
                { text: t('admin.cvManagement.status.approved'), value: TourGuideApplicationStatus.APPROVED },
                { text: t('admin.cvManagement.status.rejected'), value: TourGuideApplicationStatus.REJECTED },
            ],
            onFilter: (value: boolean | Key, record: AdminCV) => record.status === value,
        },
        {
            title: t('admin.cvManagement.columns.actions'),
            key: 'actions',
            width: '16%',
            render: (_, record: AdminCV) => (
                <Space>                    {record.status === TourGuideApplicationStatus.PENDING && (
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
                    await adminService.approveTourGuideApplication(cvId);
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
            await adminService.rejectTourGuideApplication(selectedCV as string, values.reason);
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
                onRow={record => ({
                    onClick: () => {
                        setSelectedCVDetail(record);
                        setDetailModalOpen(true);
                    }
                })}
            />
            <CVDetailModal
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                cv={selectedCVDetail}
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
                        rules={[{ required: true, message: t('admin.cvManagement.confirmations.reject.required') }, { min: 10, message: t('admin.cvManagement.confirmations.reject.minLength') }]}
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
