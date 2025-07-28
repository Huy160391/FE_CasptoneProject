import { Layout, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import NotificationBell from '../common/NotificationBell';
import './SpecialityShopHeader.scss';

const { Header } = Layout;

const SpecialityShopHeader = () => {
    const { t } = useTranslation();

    return (
        <Header className="specialityshop-header">
            <div className="header-content">
                <div className="page-title">{t('specialityShop.header.title', 'Quản lý cửa hàng đặc sản')}</div>
                <Space className="header-actions" size="middle">
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <NotificationBell />
                </Space>
            </div>
        </Header>
    );
};

export default SpecialityShopHeader;
