import React, { useEffect } from "react";
import { Menu, Divider } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseFloor, faList, faPlusSquare, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/TNDT_Logo.png";
import StorageService from "../../services/storageService";

/**
 * Sidebar navigation component for Tour Company and Admin roles
 */
function Sidenav({ color }) {
  const roleLogin = StorageService.getRoleLogin();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to sign-in if no token or role
    if (!StorageService.getAccessToken() || !roleLogin) {
      navigate('/sign-in');
    }
  }, [roleLogin, navigate]);

  // Define sidebar items
  const menuItems = [
    {
      key: '1',
      linkURL: '/dashboard',
      pageName: 'dashboard',
      labelPageName: 'Thống kê',
      icon: <FontAwesomeIcon icon={faHouseFloor} />,
      allowedRoles: ['admin', 'company'],
    },
    {
      key: '2',
      linkURL: '/tours',
      pageName: 'tours',
      labelPageName: 'Danh sách tour',
      icon: <FontAwesomeIcon icon={faList} />,
      allowedRoles: ['admin', 'company'],
    },
    {
      key: '3',
      linkURL: '/create-tour',
      pageName: 'create-tour',
      labelPageName: 'Tạo mới tour',
      icon: <FontAwesomeIcon icon={faPlusSquare} />,
      allowedRoles: ['admin', 'company'],
    },
    {
      key: '4',
      linkURL: '/detail-tour',
      pageName: 'detail-tour',
      labelPageName: 'Chi tiết tour',
      icon: <FontAwesomeIcon icon={faInfoCircle} />,
      allowedRoles: ['admin', 'company'],
    },
  ];

  return (
    <>
      <div className="company" style={{ textAlign: 'center', padding: '16px' }}>
        <img src={logo} alt="Logo" style={{ width: '80%', borderRadius: 8 }} />
      </div>
      <Divider />
      <Menu theme="light" mode="inline">
        {menuItems
          .filter(item => item.allowedRoles.includes(roleLogin))
          .map(item => (
            <Menu.Item key={item.key} icon={item.icon} style={{ color }}>
              <NavLink to={item.linkURL} className={({ isActive }) => (isActive ? 'ant-menu-item-selected' : '')}>
                {item.labelPageName}
              </NavLink>
            </Menu.Item>
          ))}
      </Menu>
    </>
  );
}

export default Sidenav;
