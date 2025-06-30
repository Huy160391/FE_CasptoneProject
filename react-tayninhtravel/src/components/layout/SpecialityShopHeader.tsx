import { Layout } from 'antd';
import { useAuthStore } from '@/store/useAuthStore';
import './SpecialityShopHeader.scss';

const { Header } = Layout;

const SpecialityShopHeader = () => {
    const { user } = useAuthStore();
    return (
        <Header className="specialityshop-header">
            <div className="specialityshop-header-title">Quản lý cửa hàng đặc sản</div>
            <div className="specialityshop-header-user">{user?.name}</div>
        </Header>
    );
};

export default SpecialityShopHeader;
