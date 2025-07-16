import { Spin, Table, Tooltip, Empty, Tag, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UserSupportTicket } from '@/types/support';

interface SupportTicketHistoryProps {
    data: UserSupportTicket[];
    loading: boolean;
}

const SupportTicketHistory = ({ data, loading }: SupportTicketHistoryProps) => {
    const { t } = useTranslation();
    const hasData = Array.isArray(data) && data.length > 0;
    return (
        <Spin spinning={loading}>
            {hasData ? (
                <Table
                    dataSource={data}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 800 }}
                    sticky={true}
                    columns={[
                        {
                            title: t('profile.ticketTable.orderNumber'),
                            key: "index",
                            width: 60,
                            render: (_: any, __: any, index: number) => index + 1
                        },
                        {
                            title: t('support.form.title'),
                            dataIndex: "title",
                            key: "title",
                            width: 200,
                            render: (text: string) => <div className="ticket-title">{text}</div>
                        }, {
                            title: t('support.form.content'),
                            dataIndex: "content",
                            key: "content",
                            render: (text: string) => (
                                <Tooltip
                                    title={typeof text === 'string' && text.length > 0 ? text : t('profile.noContent')}
                                    placement="topLeft"
                                    overlayStyle={{ maxWidth: '400px' }}
                                >
                                    <div className="ticket-content-table">
                                        {typeof text === 'string' && text.length > 0
                                            ? (text.length > 100 ? `${text.substring(0, 100)}...` : text)
                                            : t('profile.noContent')}
                                    </div>
                                </Tooltip>
                            )
                        }, {
                            title: t('profile.ticketTable.attachment'),
                            key: "attachment",
                            width: 150,
                            render: (_: any, record: UserSupportTicket) => (
                                Array.isArray(record.images) && record.images && record.images.length > 0 && record.images[0] && typeof record.images[0].url === 'string' && record.images[0].url.length > 0 ? (
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<DownloadOutlined />}
                                        onClick={() => window.open(record.images[0].url, '_blank')}
                                        className="view-attachment-btn"
                                    >
                                        {t('profile.viewAttachment')}
                                    </Button>
                                ) : (
                                    <span className="no-attachment">{t('profile.noAttachment')}</span>
                                )
                            )
                        }, {
                            title: t('profile.sendDate'),
                            dataIndex: "createdAt",
                            key: "date",
                            width: 130,
                            sorter: (a: UserSupportTicket, b: UserSupportTicket) =>
                                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                            render: (date: string) => new Date(date).toLocaleDateString()
                        },
                        {
                            title: t('admin.users.columns.status'),
                            dataIndex: "status",
                            key: "status",
                            width: 120,
                            sorter: (a: UserSupportTicket, b: UserSupportTicket) => a.status.localeCompare(b.status), filters: [
                                { text: t('profile.ticketStatus.Open'), value: 'Open' },
                                { text: t('profile.ticketStatus.Pending'), value: 'Pending' },
                                { text: t('profile.ticketStatus.InProgress'), value: 'InProgress' },
                                { text: t('profile.ticketStatus.Resolved'), value: 'Resolved' },
                                { text: t('profile.ticketStatus.Rejected'), value: 'Rejected' },
                            ],
                            onFilter: (value, record: UserSupportTicket) =>
                                record.status === value.toString(),
                            render: (status: string) => (
                                <Tag color={
                                    status === 'Pending' ? 'gold' :
                                        status === 'Resolved' ? 'green' :
                                            status === 'InProgress' ? 'blue' :
                                                status === 'Open' ? 'cyan' : 'default'
                                }>
                                    {t(`profile.ticketStatus.${status}`)}
                                </Tag>
                            )
                        }, {
                            title: t('profile.ticketTable.responseFromTNDT'),
                            key: "response",
                            width: 150,
                            render: () => (
                                <>
                                    {/* Response column - currently empty, will be populated once API provides response data */}
                                </>
                            )
                        }
                    ]}
                />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('profile.noSupportTickets')}
                />
            )}
        </Spin>
    );
};

export default SupportTicketHistory;
