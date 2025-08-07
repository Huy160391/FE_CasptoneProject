import { useState, useEffect } from 'react'
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    Modal,
    Typography,
    message,
    Spin,
    Badge,
    Tooltip
} from 'antd'
import {
    SearchOutlined,
    EyeOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { adminService, type AdminSupportTicket } from '@/services/adminService'
import { type TicketStatus } from '@/types'
import { useTranslation } from 'react-i18next'
import './SupportTickets.scss'

const { Title, Text } = Typography
const { TextArea } = Input

// Use the TicketStatus type for better type safety
const TICKET_STATUSES: TicketStatus[] = ['Open', 'Closed']

interface TicketStatusConfig {
    color: string
    icon: React.ReactNode
}

// Status configuration map for consistent styling
const STATUS_CONFIG: Record<TicketStatus, TicketStatusConfig> = {
    Open: {
        color: 'processing',
        icon: <ExclamationCircleOutlined />
    },
    Closed: {
        color: 'default',
        icon: <CheckCircleOutlined />
    }
}

const SupportTickets = () => {
    const { t } = useTranslation()
    const [tickets, setTickets] = useState<AdminSupportTicket[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null)
    const [isViewModalVisible, setIsViewModalVisible] = useState(false)
    const [isRespondModalVisible, setIsRespondModalVisible] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [response, setResponse] = useState('')
    const [responseLoading, setResponseLoading] = useState(false)
    const [filteredInfo, setFilteredInfo] = useState<any>({})

    const fetchTickets = async () => {
        try {
            setLoading(true)
            console.log('Fetching all tickets')
            const tickets = await adminService.getSupportTickets()
            console.log('Raw tickets response:', tickets)
            console.log('Tickets status values:', tickets.map(t => ({ id: t.id, status: t.status, statusType: typeof t.status })))
            setTickets(tickets)
            console.log('Tickets set to state:', tickets)
        } catch (error: any) {
            console.error('Error fetching tickets:', error)
            message.error(error.message || t('admin.supportTickets.errors.fetchFailed'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    const handleTableChange = (_pagination: any, filters: any, _sorter: any) => {
        console.log('Table change - filters:', filters);
        setFilteredInfo(filters);
    };

    const handleSearch = (value: string) => {
        setSearchText(value)
    }

    const handleView = (ticket: AdminSupportTicket) => {
        setSelectedTicket(ticket)
        setIsViewModalVisible(true)
    }

    const handleRespond = (ticket: AdminSupportTicket) => {
        setSelectedTicket(ticket)
        setResponse(ticket.response || '')
        setIsRespondModalVisible(true)
    }

    const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
        try {
            await adminService.updateTicketStatus(ticketId, newStatus)
            message.success(t('admin.supportTickets.statusUpdateSuccess', { status: newStatus }))
            fetchTickets()
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus })
            }
        } catch (error: any) {
            console.error('Error updating ticket status:', error)
            message.error(error.message || t('admin.supportTickets.errors.statusUpdateFailed'))
        }
    }

    const handleRespondSubmit = async () => {
        if (!selectedTicket) return

        try {
            setResponseLoading(true)
            await adminService.respondToTicket(selectedTicket.id, response)
            message.success(t('admin.supportTickets.responseSuccess'))
            setIsRespondModalVisible(false)
            fetchTickets()
        } catch (error: any) {
            console.error('Error sending response:', error)
            message.error(error.message || t('admin.supportTickets.errors.responseFailed'))
        } finally {
            setResponseLoading(false)
        }
    }

    const renderStatusTag = (status: TicketStatus) => {
        const config = STATUS_CONFIG[status]
        return (
            <Tag color={config.color} icon={config.icon}>
                {status}
            </Tag>
        )
    }

    const columns: ColumnsType<AdminSupportTicket> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '80px',
            ellipsis: true,
        },
        {
            title: t('admin.supportTickets.columns.title'),
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <strong>{text}</strong>,
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const searchValue = value?.toString().toLowerCase() || ''
                return (
                    record.title.toLowerCase().includes(searchValue) ||
                    record.content.toLowerCase().includes(searchValue) ||
                    (record.userEmail?.toLowerCase() || '').includes(searchValue) ||
                    (record.userName?.toLowerCase() || '').includes(searchValue)
                )
            },
            filterSearch: true,
        },
        {
            title: t('admin.supportTickets.columns.user'),
            dataIndex: 'userName',
            key: 'userName',
            render: (text: string, record) => (
                <Tooltip title={record.userEmail}>
                    <span>{text}</span>
                </Tooltip>
            ),
        },
        {
            title: t('admin.supportTickets.columns.date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleString(),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: t('admin.supportTickets.columns.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: TicketStatus) => renderStatusTag(status),
            filters: TICKET_STATUSES.map(status => ({
                text: status,
                value: status,
            })),
            filteredValue: filteredInfo.status || null,
            onFilter: (value, record) => {
                console.log('Filter value:', value, 'Record status:', record.status);
                return record.status === value;
            },
            filterMultiple: true,
            width: '120px',
        },
        {
            title: t('admin.supportTickets.columns.hasAttachment'),
            key: 'attachment',
            render: (_, record) => (
                record.images && record.images.length > 0 ? (
                    <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(record.images[0].url, '_blank')}
                    >
                        {t('admin.supportTickets.viewAttachment')}
                    </Button>
                ) : (
                    <Badge status="default" text={t('common.no')} />
                )
            ),
        },
        {
            title: t('admin.supportTickets.columns.actions'),
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        {t('admin.supportTickets.actions.view')}
                    </Button>
                    <Button
                        type="default"
                        size="small"
                        onClick={() => handleRespond(record)}
                    >
                        {t('admin.supportTickets.actions.respond')}
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div className="support-tickets-page">
            <div className="page-header">
                <Title level={2}>{t('admin.supportTickets.title')}</Title>
                <Text>{t('admin.supportTickets.subtitle')}</Text>
            </div>

            <div className="table-actions">
                <Input
                    placeholder={t('admin.supportTickets.searchPlaceholder')}
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 250 }}
                    allowClear
                />
            </div>

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={tickets}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    className="tickets-table"
                    scroll={{ x: true }}
                    onChange={handleTableChange}
                />
            </Spin>

            {/* View Ticket Modal */}
            <Modal
                title={t('admin.supportTickets.viewTicket')}
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        {t('common.close')}
                    </Button>,
                    selectedTicket?.images && selectedTicket.images.length > 0 && (
                        <Button
                            key="download"
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(selectedTicket.images[0].url, '_blank')}
                        >
                            {t('admin.supportTickets.viewAttachment')}
                        </Button>
                    )
                ]}
                width={700}
            >
                {selectedTicket && (
                    <div className="ticket-details">
                        <div className="ticket-header">
                            <Title level={4}>{selectedTicket.title}</Title>
                            <div className="ticket-meta">
                                <div className="ticket-user">
                                    <strong>{t('admin.supportTickets.submittedBy')}:</strong>
                                    {selectedTicket.userName} ({selectedTicket.userEmail})
                                </div>
                                <div className="ticket-date">
                                    <strong>{t('admin.supportTickets.dateSubmitted')}:</strong>
                                    {new Date(selectedTicket.createdAt).toLocaleString()}
                                </div>
                                <div className="ticket-status">
                                    <strong>{t('admin.supportTickets.status')}:</strong>
                                    {renderStatusTag(selectedTicket.status)}
                                </div>
                            </div>
                        </div>

                        <div className="ticket-content">
                            <Title level={5}>{t('admin.supportTickets.message')}:</Title>
                            <div className="content-box">
                                {selectedTicket.content}
                            </div>
                        </div>

                        {selectedTicket.response && (
                            <div className="ticket-response">
                                <Title level={5}>{t('admin.supportTickets.response')}:</Title>
                                <div className="response-box">
                                    {selectedTicket.response}
                                </div>
                            </div>
                        )}                        <div className="ticket-actions">
                            <Title level={5}>{t('admin.supportTickets.updateStatus')}:</Title>
                            <Space>
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                    onClick={() => handleStatusUpdate(selectedTicket.id, 'Closed')}
                                    disabled={selectedTicket.status === 'Closed'}
                                >
                                    {t('admin.supportTickets.markClosed')}
                                </Button>
                                <Button
                                    onClick={() => handleStatusUpdate(selectedTicket.id, 'Open')}
                                    disabled={selectedTicket.status === 'Open'}
                                >
                                    {t('admin.supportTickets.markOpen')}
                                </Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Respond to Ticket Modal */}
            <Modal
                title={t('admin.supportTickets.respondToTicket')}
                open={isRespondModalVisible}
                onOk={handleRespondSubmit}
                onCancel={() => setIsRespondModalVisible(false)}
                confirmLoading={responseLoading}
            >
                {selectedTicket && (
                    <div className="respond-form">
                        <div className="ticket-summary">
                            <div>
                                <strong>{t('admin.supportTickets.columns.title')}:</strong> {selectedTicket.title}
                            </div>
                            <div>
                                <strong>{t('admin.supportTickets.submittedBy')}:</strong> {selectedTicket.userName}
                            </div>
                        </div>

                        <div className="form-item">
                            <label>{t('admin.supportTickets.yourResponse')}:</label>
                            <TextArea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={6}
                                placeholder={t('admin.supportTickets.responseHint')}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default SupportTickets
