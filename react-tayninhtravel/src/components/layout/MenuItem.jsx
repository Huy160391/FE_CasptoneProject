/* eslint-disable react/prop-types */
import { NavLink, useLocation } from "react-router-dom";

export const MenuItem = ({
  linkURL,
  iconPage,
  pageName,
  color,
  labelPageName,
}) => {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");

  // Sửa lại logic kiểm tra active
  const isActive =
    pageName === page ||
    (pageName === "dashboard" && page === "") || // Thêm trường hợp trang chủ
    (pageName === "dashboard" && page.startsWith("dashboard"));

  return (
    <NavLink to={linkURL}>
      <div>
        <div
          className="icon"
          style={{
            background: isActive ? "#0f4257" : "", // Màu nền khi active
            color: isActive ? "#fbfbfb" : color, // Màu icon
          }}
        >
          {iconPage}
        </div>
      </div>
      <div
        className="label"
        style={{
          color: isActive ? "#fff" : "", // Màu chữ khi active
        }}
      >
        {labelPageName}
      </div>
    </NavLink>
  );
};
