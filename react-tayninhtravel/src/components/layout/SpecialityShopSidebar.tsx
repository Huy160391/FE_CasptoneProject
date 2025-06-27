import { Menu } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, StarOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import './SpecialityShopSidebar.scss';

const menuItems = [
    {
        key: 'products',
        icon: <ShopOutlined />,
        label: <Link to="/speciality-shop/products">Quản lý sản phẩm</Link>,
    },
    {
        key: 'orders',
        icon: <ShoppingCartOutlined />,
        label: <Link to="/speciality-shop/orders">Quản lý đơn hàng</Link>,
    },
    {
        key: 'reviews',
        icon: <StarOutlined />,
        label: <Link to="/speciality-shop/reviews">Đánh giá sản phẩm</Link>,
    },
];

const SpecialityShopSidebar = () => {
    const location = useLocation();
    return (
        <aside className="specialityshop-sidebar">
            <Menu
                mode="inline"
                selectedKeys={[location.pathname.split('/')[2] || 'products']}
                items={menuItems}
            />
        </aside>
    );
};

export default SpecialityShopSidebar;
