import { useEffect, useState } from 'react';
import { Spin, Table, Tag, Modal, Descriptions, Image, Typography, Card } from 'antd';
import { useTranslation } from 'react-i18next';
import userService from '../services/userService';

const { Title, Text } = Typography;

interface RegisterHistoryItem {
    id: string;
    type: 'shop' | 'tourGuide';
    submittedAt: string;
    status: string;
    response?: string;
    originalData?: any; // Thêm field để lưu data gốc từ API
}

const mapRegisterHistoryData = (apiData: any, type: 'shop' | 'tourGuide') => {

    // Nếu không có dữ liệu hoặc data là null/[] thì trả về mảng rỗng
    if (!apiData || apiData.data === null || (Array.isArray(apiData.data) && apiData.data.length === 0)) {
        return [];
    }

    // Xử lý nhiều trường hợp khác nhau của cấu trúc dữ liệu
    let arr;
    if (Array.isArray(apiData)) {
        // Trường hợp tourGuide applications - trả về array trực tiếp
        arr = apiData;
    } else if (apiData?.data && Array.isArray(apiData.data)) {
        // Trường hợp có wrapper với data là array
        arr = apiData.data;
    } else if (apiData?.data && typeof apiData.data === 'object') {
        // Trường hợp shop applications - trả về object wrapper với data là object đơn
        arr = [apiData.data];
    } else if (typeof apiData === 'object') {
        // Nếu là object đơn, chuyển thành array
        arr = [apiData];
    } else {
        return [];
    }

    return arr.map((item: any, index: number) => {
        const mapped = {
            id: item.id || `${type}-${index}`,
            type,
            submittedAt: item.submittedAt || item.createdAt || new Date().toISOString(),
            status:
                // Handle both string and number status
                (typeof item.status === 'string' && item.status === 'Approved') || item.status === 1
                    ? 'approved'
                    : (typeof item.status === 'string' && item.status === 'Pending') || item.status === 0
                        ? 'pending'
                        : 'rejected',
            response: ((typeof item.status === 'string' && item.status === 'Pending') || item.status === 0) ? '' : (item.response || item.rejectionReason || ''),
            originalData: item, // Lưu data gốc
        };
        return mapped;
    });
};

const RegisterHistory = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RegisterHistoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<RegisterHistoryItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

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

    const handleRowClick = (record: RegisterHistoryItem) => {
        setSelectedItem(record);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    const renderShopDetails = (item: RegisterHistoryItem) => {
        const data = item.originalData;
        return (
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('registerHistory.modal.shopName', 'Tên shop')}>
                    {data.shopName}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.representativeName', 'Người đại diện')}>
                    {data.representativeName}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.email', 'Email')}>
                    {data.email}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.phone', 'Số điện thoại')}>
                    {data.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.location', 'Địa chỉ')}>
                    {data.location}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.shopType', 'Loại shop')}>
                    {data.shopType}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.businessLicense', 'Mã doanh nghiệp')}>
                    {data.businessLicense}
                </Descriptions.Item>
                {data.website && (
                    <Descriptions.Item label={t('registerHistory.modal.website', 'Website')}>
                        <a href={data.website} target="_blank" rel="noopener noreferrer">
                            {data.website}
                        </a>
                    </Descriptions.Item>
                )}
                {data.shopDescription && (
                    <Descriptions.Item label={t('registerHistory.modal.description', 'Mô tả')}>
                        {data.shopDescription}
                    </Descriptions.Item>
                )}
                {data.logoUrl && (
                    <Descriptions.Item label={t('registerHistory.modal.logo', 'Logo')}>
                        <Image src={data.logoUrl} alt="Shop Logo" style={{ maxWidth: 100 }} />
                    </Descriptions.Item>
                )}
                {data.businessLicenseUrl && (
                    <Descriptions.Item label={t('registerHistory.modal.businessLicenseFile', 'Giấy phép kinh doanh')}>
                        <a href={data.businessLicenseUrl} target="_blank" rel="noopener noreferrer">
                            {t('registerHistory.modal.viewFile', 'Xem file')}
                        </a>
                    </Descriptions.Item>
                )}
            </Descriptions>
        );
    };

    const renderTourGuideDetails = (item: RegisterHistoryItem) => {
        const data = item.originalData;
        return (
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('registerHistory.modal.fullName', 'Họ tên')}>
                    {data.fullName}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.email', 'Email')}>
                    {data.email}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.phone', 'Số điện thoại')}>
                    {data.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.age', 'Tuổi')}>
                    {data.age}
                </Descriptions.Item>
                <Descriptions.Item label={t('registerHistory.modal.address', 'Địa chỉ')}>
                    {data.address}
                </Descriptions.Item>
                {data.experience && (
                    <Descriptions.Item label={t('registerHistory.modal.experience', 'Kinh nghiệm')}>
                        {data.experience}
                    </Descriptions.Item>
                )}
                {data.languages && (
                    <Descriptions.Item label={t('registerHistory.modal.languages', 'Ngoại ngữ')}>
                        {data.languages}
                    </Descriptions.Item>
                )}
                {data.additionalInfo && (
                    <Descriptions.Item label={t('registerHistory.modal.additionalInfo', 'Thông tin bổ sung')}>
                        {data.additionalInfo}
                    </Descriptions.Item>
                )}
                {data.cvUrl && (
                    <Descriptions.Item label={t('registerHistory.modal.cv', 'CV')}>
                        <a href={data.cvUrl} target="_blank" rel="noopener noreferrer">
                            {t('registerHistory.modal.viewCV', 'Xem CV')}
                        </a>
                    </Descriptions.Item>
                )}
                {data.photoUrl && (
                    <Descriptions.Item label={t('registerHistory.modal.photo', 'Ảnh chân dung')}>
                        <Image src={data.photoUrl} alt="Profile Photo" style={{ maxWidth: 100 }} />
                    </Descriptions.Item>
                )}
            </Descriptions>
        );
    };

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
            sorter: (a: RegisterHistoryItem, b: RegisterHistoryItem) =>
                new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: t('registerHistory.status', 'Trạng thái'),
            dataIndex: 'status',
            key: 'status',
            sorter: (a: RegisterHistoryItem, b: RegisterHistoryItem) => a.status.localeCompare(b.status),
            filters: [
                { text: t('registerHistory.status_pending', 'Chờ duyệt'), value: 'pending' },
                { text: t('registerHistory.status_approved', 'Đã duyệt'), value: 'approved' },
                { text: t('registerHistory.status_rejected', 'Từ chối'), value: 'rejected' },
            ],
            onFilter: (value: any, record: RegisterHistoryItem) =>
                record.status === value.toString(),
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
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={4}>
                        📝 {t('registerHistory.title', 'Lịch sử đăng ký')}
                    </Title>
                    <Text type="secondary">
                        {t('registerHistory.description', 'Theo dõi trạng thái đăng ký shop và hướng dẫn viên của bạn')}
                    </Text>
                </div>

                <Spin spinning={!!loading}>
                    <Table
                        columns={columns}
                        dataSource={data.map((item, idx) => ({ ...item, key: item.id || idx }))}
                        pagination={false}
                        rowKey="key"
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                            style: { cursor: 'pointer' }
                        })}
                    />
                </Spin>
            </Card>

            <Modal
                title={
                    selectedItem?.type === 'shop'
                        ? t('registerHistory.modal.shopApplicationDetails', 'Chi tiết đăng ký Shop')
                        : t('registerHistory.modal.tourGuideApplicationDetails', 'Chi tiết đăng ký Hướng dẫn viên')
                }
                open={modalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={700}
            >
                {selectedItem && (
                    <div>
                        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label={t('registerHistory.submittedAt', 'Ngày gửi')}>
                                {new Date(selectedItem.submittedAt).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('registerHistory.status', 'Trạng thái')}>
                                <Tag color={
                                    selectedItem.status === 'approved' ? 'green' :
                                        selectedItem.status === 'pending' ? 'orange' : 'red'
                                }>
                                    {t(`registerHistory.status_${selectedItem.status}`, selectedItem.status)}
                                </Tag>
                            </Descriptions.Item>
                            {selectedItem.response && (
                                <Descriptions.Item label={t('registerHistory.response', 'Phản hồi')}>
                                    {selectedItem.response}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {selectedItem.type === 'shop' ? renderShopDetails(selectedItem) : renderTourGuideDetails(selectedItem)}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RegisterHistory;
