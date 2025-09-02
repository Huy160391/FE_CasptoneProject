import { useState } from 'react';
import { Layout, Menu, Button, Divider, Avatar } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    DashboardOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined,
    LogoutOutlined,
    WalletOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import type { MenuProps } from 'antd';
import './SpecialityShopSidebar.scss';

const { Sider } = Layout;

const SpecialityShopSidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleBackToSite = () => {
        navigate('/');
    };

    const menuItems: MenuProps['items'] = [
        {
            key: '/speciality-shop',
            icon: <DashboardOutlined />,
            label: <Link to="/speciality-shop">Dashboard</Link>,
        },
        {
            key: '/speciality-shop/products',
            icon: <ShopOutlined />,
            label: <Link to="/speciality-shop/products">Quản lý sản phẩm</Link>,
        },
        {
            key: '/speciality-shop/orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/speciality-shop/orders">Quản lý đơn hàng</Link>,
        },
        // {
        //     key: '/speciality-shop/reviews',
        //     icon: <StarOutlined />,
        //     label: <Link to="/speciality-shop/reviews">Đánh giá sản phẩm</Link>,
        // },
        {
            key: '/speciality-shop/wallet',
            icon: <WalletOutlined />,
            label: <Link to="/speciality-shop/wallet">Quản lý ví</Link>,
        },
        {
            key: '/speciality-shop/customers',
            icon: <UserOutlined />,
            label: <Link to="/speciality-shop/customers">Khách hàng đặt trước</Link>,
        },
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="specialityshop-sidebar"
            width={250}
            collapsedWidth={80}
        >
            <div className="specialityshop-logo">
                <h2>{collapsed ? 'SS' : t('specialityShop.sidebar.title', 'Speciality Shop')}</h2>
            </div>

            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="collapse-btn"
            />

            {/* Shop info section */}
            <div className="shop-info">
                <Avatar
                    size={collapsed ? 40 : 64}
                    src={user?.avatar}
                    icon={<UserOutlined />}
                />
                {!collapsed && (
                    <div className="shop-details">
                        <div className="shop-name">{user?.name || 'Shop Owner'}</div>
                        <div className="shop-role">Chủ cửa hàng đặc sản</div>
                    </div>
                )}
            </div>

            <Divider style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.2)' }} />

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                className="specialityshop-menu"
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
                    {!collapsed && t('specialityShop.sidebar.backToSite', 'Về trang chủ')}
                </Button>

                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    className="logout-btn"
                    block
                >
                    {!collapsed && t('specialityShop.sidebar.logout', 'Đăng xuất')}
                </Button>
            </div>
        </Sider>
    );
};

export default SpecialityShopSidebar;
