import apiClient from "./apiClient";
import toast from "react-hot-toast";
import StorageService from "../../services/storageService";
import { AUTH_ENDPOINTS } from "./endpoints";
import { getCampusByAccountIdAPI } from "./campusApi";

const ROLE_MAPPING = {
  "Quản trị viên": "admin",
  "Tour Company": "Tour Company",
};

const ERROR_MESSAGES = {
  LOGIN_FAILED: "Đăng nhập thất bại!",
  LOGIN_ERROR: "Lỗi tài khoản hoặc mật khẩu, xin vui lòng nhập lại",
  INVALID_DATA: "Dữ liệu từ server không hợp lệ!",
  NO_TOKEN: "Không nhận được token từ server!",
  PROCESS_ERROR: "Lỗi xử lý dữ liệu đăng nhập!",
  LOGOUT_ERROR: "Đã xảy ra lỗi khi đăng xuất!",
  VERIFY_ACCOUNT_ERROR: "Xác minh tài khoản thất bại!",
  INVALID_VERIFY_DATA: "Dữ liệu xác minh không hợp lệ!",
};

export const login = async (userName, password) => {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
      userName,
      password,
    });

    if (response.status !== 200 || !response.data) {
      console.warn("⚠️ API trả về lỗi:", response);
      return {
        success: false,
        message: response.data?.message || ERROR_MESSAGES.LOGIN_ERROR,
      };
    }

    // const apiData = response.data;

    // if (!apiData) {
    //   return { success: false, message: ERROR_MESSAGES.INVALID_DATA };
    // }

    const apiData = response.data;

    if (!apiData || !apiData.token || !apiData.userId) {
      return { success: false, message: ERROR_MESSAGES.INVALID_DATA };
    }

    const {
      token,
      refreshToken,
      tokenExpirationTime,
      userId,
      email,
      name,
      phoneNumber,
      avatar,
    } = apiData;
    if (!token) {
      return { success: false, message: ERROR_MESSAGES.NO_TOKEN };
    }
    StorageService.setAccessToken(token);
    StorageService.setRefreshToken?.(refreshToken);

    StorageService.setLoginId(userId);
    StorageService.setUser({
      userId,
      email,
      name,
      phoneNumber,
      avatar,
    });
    StorageService.setNameLogin(name); // optional nếu đang dùng cho UI

    StorageService.setAccessToken(token);

    const mappedRole = ROLE_MAPPING[role] || role;
    const userData = {
      role: mappedRole,
      accountId,
      userName,
      isVerify,
    };

    

    StorageService.setUser(userData);
    StorageService.setRoleLogin(mappedRole);
    StorageService.setNameLogin(userName);
    StorageService.setLoginId(accountId || "");

    
    StorageService.setItem
      ? StorageService.setItem("isVerify", isVerify)
      : localStorage.setItem("isVerify", JSON.stringify(isVerify));

    window.dispatchEvent(new Event("authChange"));

    return {
      success: true,
      data: {
        token,
        userName,
        loginId: accountId,
        role: mappedRole,
        isVerify,
      },
    };
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    return {
      success: false,
      message: "Username hoặc password không đúng, xin vui lòng nhập lại!",
    };
  }
};

export const verifyAccount = async (id, email, code) => {
  try {
    if (!code) {
      return {
        success: false,
        message: "Vui lòng nhập mã xác minh!",
      };
    }

    const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_ACCOUNT, {
      id,
      email,
      code: code.toString(),
    });

    if (response.status !== 200 || !response.data) {
      console.warn("⚠️ API verify account trả về lỗi:", response);
      return {
        success: false,
        message: response.data?.message || ERROR_MESSAGES.VERIFY_ACCOUNT_ERROR,
      };
    }

    const apiData = response.data;

    if (!apiData) {
      return {
        success: false,
        message: ERROR_MESSAGES.INVALID_VERIFY_DATA,
      };
    }

    toast.success("Xác minh tài khoản thành công!");
    localStorage.setItem("isVerify", "true");

    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    console.error("❌ Lỗi khi xác minh tài khoản:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || ERROR_MESSAGES.VERIFY_ACCOUNT_ERROR,
    };
  }
};

export const logout = () => {
  try {
    StorageService.clearAll();
    // Thêm logic clear cache
    window.dispatchEvent(new Event("authChange"));
    toast.success("Đã đăng xuất thành công!");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    toast.error(ERROR_MESSAGES.LOGOUT_ERROR);
  }
};

export const resendVerificationCode = async (email) => {
  try {
    const response = await apiClient.post(
      EMAIL_ENDPOINTS.SEND_CODE_EMAIL_AGAIN,
      {},
      {
        params: { email },
      }
    );

    if (response.status === 200) {
      toast.success("Đã gửi lại mã xác minh!");
      return {
        success: true,
      };
    }

    return {
      success: false,
      message: response.data?.message || "Không thể gửi lại mã xác minh",
    };
  } catch (error) {
    console.error("❌ Lỗi khi gửi lại mã:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi khi gửi lại mã xác minh",
    };
  }
};
