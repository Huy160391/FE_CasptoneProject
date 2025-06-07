import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import BloggerSidebar from './BloggerSidebar.tsx';
import BloggerHeader from './BloggerHeader.tsx';
import './BloggerLayout.scss';

const { Content } = Layout;

const BloggerLayout = () => {
    return (
        <Layout className="blogger-layout">
            <BloggerSidebar />
            <Layout className="blogger-main-layout">
                <BloggerHeader />
                <Content className="blogger-content">
                    <div className="blogger-content-wrapper">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default BloggerLayout;
