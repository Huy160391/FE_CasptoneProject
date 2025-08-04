import React, { useState } from 'react';
import { Layout, Menu, Avatar, Divider, theme, Space } from 'antd';
import {
    DashboardOutlined,
    MailOutlined,
    UserOutlined,
    CalendarOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import ThemeToggle from '@/components/common/ThemeToggle';
import NotificationBell from '@/components/common/NotificationBell';
import './TourGuideLayout.scss';

const { Sider, Content } = Layout;

const TourGuideLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        {
            key: '/tour-guide/dashboard',
            icon: <DashboardOutlined />,
            label: t('tourGuide.sidebar.dashboard'),
        },
        {
            key: '/tour-guide/invitations',
            icon: <MailOutlined />,
            label: t('tourGuide.sidebar.invitations'),
        },
        {
            key: '/tour-guide/schedule',
            icon: <CalendarOutlined />,
            label: t('tourGuide.sidebar.schedule'),
        },
    ];

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Layout className={`tour-guide-layout ${isDarkMode ? 'dark-mode' : ''}`}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="tour-guide-sider"
                width={250}
            >
                <div className="logo-container">
                    {collapsed ? 'TG' : 'Tour Guide'}
                </div>

                <div className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </div>

                {/* Tour Guide info section */}
                <div className="guide-info">
                    <Avatar
                        size={collapsed ? 40 : 64}
                        src={user?.avatar || "https://i.imgur.com/4AiXzf8.jpg"}
                        icon={<UserOutlined />}
                    />
                    {!collapsed && (
                        <div className="guide-details">
                            <div className="guide-name">{user?.name || 'Tour Guide'}</div>
                            <div className="guide-role">{t('tourGuide.sidebar.profile')}</div>
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

                {/* Bottom menu */}
                <div className="bottom-menu">
                    {/* Theme Toggle */}
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Space align="center" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ThemeToggle />
                                {!collapsed && <span style={{ color: 'rgba(255, 255, 255, 0.85)', marginLeft: 8 }}>Theme</span>}
                            </div>
                            <div className="notification-bell">
                                <NotificationBell />
                            </div>
                        </Space>
                    </div>

                    <Menu
                        theme="dark"
                        mode="inline"
                        items={[
                            {
                                key: 'settings',
                                icon: <SettingOutlined />,
                                label: !collapsed ? t('common.settings') : null,
                            },
                            {
                                key: 'logout',
                                icon: <LogoutOutlined />,
                                label: !collapsed ? t('common.logout') : null,
                                onClick: handleLogout,
                            },
                        ]}
                    />
                </div>
            </Sider>

            <Layout>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: 8,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default TourGuideLayout;
