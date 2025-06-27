import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import SpecialityShopSidebar from './SpecialityShopSidebar';
import SpecialityShopHeader from './SpecialityShopHeader';
import './SpecialityShopLayout.scss';

const { Content } = Layout;

const SpecialityShopLayout = () => {
    return (
        <Layout className="specialityshop-layout">
            <SpecialityShopSidebar />
            <Layout className="specialityshop-main-layout">
                <SpecialityShopHeader />
                <Content className="specialityshop-content">
                    <div className="specialityshop-content-wrapper">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SpecialityShopLayout;
