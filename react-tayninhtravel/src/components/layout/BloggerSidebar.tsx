import { useState } from 'react';
import { Layout, Menu, Button, Divider, Avatar } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    FileTextOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    EditOutlined,
    HomeOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import type { MenuProps } from 'antd';
import './BloggerSidebar.scss';

const { Sider } = Layout;

const BloggerSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleBackToSite = () => {
        navigate('/');
    }; const menuItems: MenuProps['items'] = [
        {
            key: '/blogger/dashboard',
            icon: <DashboardOutlined />,
            label: t('blogger.sidebar.dashboard'),
            onClick: () => navigate('/blogger/dashboard'),
        },
        {
            key: '/blogger/my-blogs',
            icon: <FileTextOutlined />,
            label: t('blogger.sidebar.myBlogs'),
            onClick: () => navigate('/blogger/my-blogs'),
        },
        {
            key: '/blogger/create-blog',
            icon: <EditOutlined />,
            label: t('blogger.sidebar.createBlog'),
            onClick: () => navigate('/blogger/create-blog'),
        },
        {
            key: '/blogger/my-info',
            icon: <UserOutlined />,
            label: t('blogger.sidebar.editProfile'),
            onClick: () => navigate('/blogger/my-info'),
        }
    ]; return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="blogger-sidebar"
            width={250}
            collapsedWidth={80}
        >
            <div className="blogger-logo">
                <h2>{collapsed ? 'BG' : t('blogger.sidebar.title')}</h2>
            </div>

            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="collapse-btn"
            />

            {/* Blogger info section */}
            <div className="blogger-info">
                <Avatar
                    size={collapsed ? 40 : 64}
                    src={user?.avatar}
                    icon={<UserOutlined />}
                />
                {!collapsed && (
                    <div className="blogger-details">
                        <div className="blogger-name">{user?.name || 'Blogger'}</div>
                        <div className="blogger-role">{t('blogger.sidebar.role')}</div>
                    </div>
                )}
            </div>

            <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.2)' }} />            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                className="blogger-menu"
            />

            {/* Bottom actions */}
            <div className="sidebar-bottom">
                <Button
                    type="primary"
                    icon={<HomeOutlined />}
                    onClick={handleBackToSite}
                    className="back-to-site-btn"
                    block
                >
                    {!collapsed && t('blogger.sidebar.backToSite')}
                </Button>

                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    className="logout-btn"
                    block
                >
                    {!collapsed && t('blogger.sidebar.logout')}
                </Button>
            </div>
        </Sider>
    );
};

export default BloggerSidebar;
