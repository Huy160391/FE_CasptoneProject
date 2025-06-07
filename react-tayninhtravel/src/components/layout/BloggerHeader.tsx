import { Layout, Space, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import './BloggerHeader.scss';

const { Header } = Layout;

const BloggerHeader = () => {
    const { t } = useTranslation();

    return (
        <Header className="blogger-header">
            <div className="header-content">
                <div className="page-title">{t('blogger.header.title')}</div>
                <Space className="header-actions" size="middle">
                    <ThemeToggle />
                    <LanguageSwitcher />

                    <Button
                        type="text"
                        icon={<BellOutlined />}
                        className="notification-btn"
                    />
                </Space>
            </div>
        </Header>
    );
};

export default BloggerHeader;
