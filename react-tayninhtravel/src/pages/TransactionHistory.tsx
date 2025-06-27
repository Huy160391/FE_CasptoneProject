import { List, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

interface TransactionHistoryProps {
    data: Array<any>;
}

const TransactionHistory = ({ data }: TransactionHistoryProps) => {
    const { t } = useTranslation();
    return (
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        title={item.type}
                        description={
                            <>
                                <div>{t('profile.transactionDate')}: {item.date}</div>
                                <div>{t('profile.amount')}: {item.amount}</div>
                                <Tag color="green">{t('profile.completed')}</Tag>
                            </>
                        }
                    />
                </List.Item>
            )}
        />
    );
};

export default TransactionHistory;
