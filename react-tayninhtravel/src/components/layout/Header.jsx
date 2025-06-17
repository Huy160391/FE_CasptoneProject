// Header.jsx (React component) - Updated for Tour Company login/logout
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Col, Divider, Popover, Row, Typography, notification } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import avatarProfile from '../../assets/images/avatar-profile.png';
import { logoutTourCompany } from '../api/authApi';
import StorageService from '../../services/storageService';

/**
 * Header component with user info and logout button
 */
function Header() {
  const navigate = useNavigate();
  const user = StorageService.getUser() || {};
  const { name = 'Guest', avatar } = user;

  const handleLogout = () => {
    const result = logoutTourCompany();
    if (result.success) {
      notification.success({ message: 'Đã đăng xuất thành công!' });
      navigate('/sign-in');
    } else {
      notification.error({ message: result.message });
    }
  };

  const menuContent = (
    <div style={{ textAlign: 'center' }}>
      <Avatar size={64} src={avatar || avatarProfile} icon={<UserOutlined />} />
      <Typography.Title level={5} style={{ marginTop: 8 }}>{name}</Typography.Title>
      <Divider />
      <Typography.Link onClick={handleLogout}>Đăng xuất</Typography.Link>
    </div>
  );

  return (
    <Row justify="space-between" align="middle" style={{ padding: '0 24px', background: '#fff' }}>
      <Col>
        <Link to="/dashboard"><HomeOutlined style={{ fontSize: 24 }} /></Link>
      </Col>
      <Col>
        <Popover content={menuContent} trigger="click" placement="bottomRight">
          <Badge dot>
            <Avatar src={avatar || avatarProfile} icon={<UserOutlined />} />
          </Badge>
        </Popover>
      </Col>
    </Row>
  );
}

export default Header;