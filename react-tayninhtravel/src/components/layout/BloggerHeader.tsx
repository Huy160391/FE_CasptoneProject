import { Layout, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import NotificationBell from '../common/NotificationBell';
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
                    <NotificationBell />
                </Space>
            </div>
        </Header>
    );
};

export default BloggerHeader;
