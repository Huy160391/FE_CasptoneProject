import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import './Unauthorized.scss';

const Unauthorized: React.FC = () => {
    return (
        <div className="unauthorized-page">
            <Result
                status="403"
                title="Không có quyền truy cập"
                subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
                extra={
                    <Link to="/">
                        <Button type="primary">Quay lại trang chủ</Button>
                    </Link>
                }
            />
        </div>
    );
};

export default Unauthorized;
