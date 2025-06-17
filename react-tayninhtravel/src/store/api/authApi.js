import apiClient from "./apiClient";
import toast from "react-hot-toast";
import StorageService from "../../services/storageService";
import { AUTH_ENDPOINTS } from "./endpoints";

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

    const {
      token,
      refreshToken,
      tokenExpirationTime,
      userId,
      email,
      name,
      phoneNumber,
      avatar,
    } = response.data;

    if (!token || !userId) {
      return { success: false, message: ERROR_MESSAGES.INVALID_DATA };
    }

    // Map role từ backend (sử dụng "name" trả về)
    const rawRole = name;
    const mappedRole = ROLE_MAPPING[rawRole] || rawRole;

    const userInfo = { userId, role: mappedRole, email, name, phoneNumber, avatar };

    // Lưu token và thông tin user
    StorageService.setAccessToken(token);
    StorageService.setRefreshToken?.(refreshToken);
    StorageService.setLoginId(userId);
    StorageService.setUser(userInfo);
    StorageService.setRoleLogin(mappedRole);
    StorageService.setNameLogin(name);

    window.dispatchEvent(new Event("authChange"));

    return { success: true, data: { token, refreshToken, tokenExpirationTime, ...userInfo } };
  } catch (error) {
    console.error("loginTourCompany error:", error);
    return { success: false, message: ERROR_MESSAGES.LOGIN_FAILED };
  }
}

export function logoutTourCompany() {
  try {
    StorageService.clearAll();
    window.dispatchEvent(new Event("authChange"));
    toast.success("Đã đăng xuất thành công!");
    return { success: true };
  } catch (error) {
    console.error("logoutTourCompany error:", error);
    return { success: false, message: ERROR_MESSAGES.LOGOUT_FAILED };
  }
}

export async function requestPasswordResetOtp(email) {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.SEND_OTP_RESET_PASSWORD, { email });
    if (response.status === 200) {
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      return { success: true };
    }
    return { success: false, message: response.data?.message || ERROR_MESSAGES.OTP_REQUEST_FAILED };
  } catch (error) {
    console.error("requestPasswordResetOtp error:", error);
    return { success: false, message: error.response?.data?.message || ERROR_MESSAGES.OTP_REQUEST_FAILED };
  }
}

export async function verifyPasswordResetOtp(email, otpCode) {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_OTP, { email, code: otpCode.toString() });
    if (response.status === 200 && response.data?.isSuccess) {
      toast.success("Xác thực mã OTP thành công!");
      return { success: true };
    }
    return { success: false, message: response.data?.message || ERROR_MESSAGES.OTP_VERIFY_FAILED };
  } catch (error) {
    console.error("verifyPasswordResetOtp error:", error);
    return { success: false, message: error.response?.data?.message || ERROR_MESSAGES.OTP_VERIFY_FAILED };
  }
}

export async function resetPasswordWithOtp(email, otpCode, newPassword) {
  try {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      email,
      code: otpCode.toString(),
      newPassword,
    });
    if (response.status === 200 && response.data?.isSuccess) {
      toast.success("Đặt lại mật khẩu thành công!");
      return { success: true };
    }
    return { success: false, message: response.data?.message || ERROR_MESSAGES.PASSWORD_RESET_FAILED };
  } catch (error) {
    console.error("resetPasswordWithOtp error:", error);
    return { success: false, message: error.response?.data?.message || ERROR_MESSAGES.PASSWORD_RESET_FAILED };
  }
}
