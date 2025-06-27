import { List, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

interface BookingHistoryProps {
    data: Array<any>;
}

const BookingHistory = ({ data }: BookingHistoryProps) => {
    const { t } = useTranslation();
    return (
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        title={item.tourName}
                        description={
                            <>
                                <div>{t('profile.bookingDate')}: {item.date}</div>
                                <div>{t('profile.price')}: {item.price}</div>
                                <Tag color={item.status === 'completed' ? 'green' : 'blue'}>
                                    {item.status === 'completed' ? t('profile.completed') : t('profile.upcoming')}
                                </Tag>
                            </>
                        }
                    />
                </List.Item>
            )}
        />
    );
};

export default BookingHistory;
