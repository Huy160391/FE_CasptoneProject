import React, { useState } from 'react';
import { Layout, Menu, Avatar, Button, theme, Divider } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    FormOutlined,
    ShoppingOutlined,
    HistoryOutlined,
    StarOutlined,
    BarChartOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import NotificationBell from '../common/NotificationBell';
import './TourCompanyLayout.scss';

const { Header, Sider, Content } = Layout;

const TourCompanyLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const {
        token: { colorBgContainer },
    } = theme.useToken(); const menuItems = [
        {
            key: '/tour-company/dashboard',
            icon: <DashboardOutlined />,
            label: t('tourCompany.sidebar.dashboard'),
        },
        {
            key: '/tour-company/tour-templates',
            icon: <FormOutlined />,
            label: t('tourCompany.sidebar.tourTemplates'),
        },
        {
            key: '/tour-company/tours',
            icon: <ShoppingOutlined />,
            label: t('tourCompany.sidebar.tours'),
        },
        {
            key: '/tour-company/transactions',
            icon: <HistoryOutlined />,
            label: t('tourCompany.sidebar.transactions'),
        },
        {
            key: '/tour-company/reviews',
            icon: <StarOutlined />,
            label: t('tourCompany.sidebar.reviews'),
        },
        {
            key: '/tour-company/revenue',
            icon: <BarChartOutlined />,
            label: t('tourCompany.sidebar.revenue'),
        },
    ];

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleBackToSite = () => {
        navigate('/');
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    return (
        <Layout className={`tour-company-layout ${isDarkMode ? 'dark-mode' : ''}`}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="tour-company-sider"
                width={250}
            >
                <div className="logo-container">
                    {collapsed ? 'TNT' : 'Tour Company'}
                </div>

                <div className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </div>

                {/* Tour Company info section */}
                <div className="company-info">
                    <Avatar
                        size={collapsed ? 40 : 64}
                        src={user?.avatar || "https://i.imgur.com/4AiXzf8.jpg"}
                        icon={<UserOutlined />}
                    />                    {!collapsed && (
                        <div className="company-details">
                            <div className="company-name">{user?.name || 'Tour Company'}</div>
                            <div className="company-role">{t('tourCompany.sidebar.profile')}</div>
                        </div>
                    )}
                </div>

                <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                {/* Main menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                />

                {/* Bottom actions */}
                <div className="sidebar-bottom">                    <Button
                    type="text"
                    icon={<UserOutlined />}
                    onClick={handleProfile}
                    className="profile-btn"
                    block
                >
                    {!collapsed && t('tourCompany.sidebar.profile')}
                </Button>

                    <Button
                        type="primary"
                        icon={<HomeOutlined />}
                        onClick={handleBackToSite}
                        className="back-to-site-btn"
                        block
                    >
                        {!collapsed && t('tourCompany.sidebar.backToSite')}
                    </Button>

                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        className="logout-btn"
                        block
                    >
                        {!collapsed && t('tourCompany.sidebar.logout')}
                    </Button>
                </div>
            </Sider>
            <Layout>
                <Header className="tour-company-header" style={{ background: colorBgContainer }}>
                    <div className="header-left">
                        <div className="page-title">{t('tourCompany.dashboard.title')}</div>
                    </div>
                    <div className="header-right">
                        <div className="notification-bell">
                            <NotificationBell />
                        </div>
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                </Header>
                <Content className="tour-company-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default TourCompanyLayout;
