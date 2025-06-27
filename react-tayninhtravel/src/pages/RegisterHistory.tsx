import { useEffect, useState } from 'react';
import { Spin, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import userService from '../services/userService';

interface RegisterHistoryItem {
    id: string;
    type: 'shop' | 'tourGuide';
    submittedAt: string;
    status: string;
    response?: string;
}

const mapRegisterHistoryData = (apiData: any, type: 'shop' | 'tourGuide') => {
    const arr = Array.isArray(apiData) ? apiData : apiData?.data || [];
    return arr.map((item: any) => ({
        id: item.id,
        type,
        submittedAt: item.submittedAt || item.createdAt,
        status:
            item.status === 1
                ? 'approved'
                : item.status === 0
                    ? 'pending'
                    : 'rejected',
        response: item.status === 0 ? '' : (item.response || ''),
    }));
};

const RegisterHistory = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RegisterHistoryItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tourGuide, shop] = await Promise.all([
                    userService.getMyTourGuideApplications(),
                    userService.getMyShopApplications(),
                ]);
                const tourGuideData = mapRegisterHistoryData(tourGuide, 'tourGuide');
                const shopData = mapRegisterHistoryData(shop, 'shop');
                const allData = [...tourGuideData, ...shopData];
                setData(allData);
            } catch (e) {
                console.error('RegisterHistory fetch error:', e);
                setData([]);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

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
