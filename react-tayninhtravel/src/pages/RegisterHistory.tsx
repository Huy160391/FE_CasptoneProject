import { Spin, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

interface RegisterHistoryItem {
    id: string;
    type: 'shop' | 'tourGuide';
    submittedAt: string;
    status: string;
    response?: string;
}

interface RegisterHistoryProps {
    data: Array<RegisterHistoryItem>;
    loading?: boolean;
}

const RegisterHistory = ({ data, loading }: RegisterHistoryProps) => {
    const { t } = useTranslation();

    const columns = [
        {
            title: t('registerHistory.stt', 'STT'),
            dataIndex: 'stt',
            key: 'stt',
            render: (_: any, __: any, index: number) => index + 1,
            width: 60,
        },
        {
            title: t('registerHistory.type', 'Loại đăng ký'),
            dataIndex: 'type',
            key: 'type',
            render: (type: string) =>
                type === 'shop'
                    ? t('registerHistory.shop', 'Đăng ký Shop')
                    : t('registerHistory.tourGuide', 'Đăng ký Hướng dẫn viên'),
        },
        {
            title: t('registerHistory.submittedAt', 'Ngày gửi'),
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: t('registerHistory.status', 'Trạng thái'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'approved') color = 'green';
                else if (status === 'pending') color = 'orange';
                else if (status === 'rejected') color = 'red';
                return <Tag color={color}>{t(`registerHistory.status_${status}`, status)}</Tag>;
            },
        },
        {
            title: t('registerHistory.response', 'Phản hồi'),
            dataIndex: 'response',
            key: 'response',
            render: (response: string) => response || '-',
        },
    ];

    return (
        <Spin spinning={!!loading}>
            <Table
                columns={columns}
                dataSource={data.map((item, idx) => ({ ...item, key: item.id || idx }))}
                pagination={false}
                rowKey="key"
            />
        </Spin>
    );
};

export default RegisterHistory;
