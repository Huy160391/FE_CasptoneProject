// src/services/storageService.js

const StorageService = {
  // --- Access Token ---
  setAccessToken(token) {
    localStorage.setItem("token", token);
  },
  getAccessToken() {
    return localStorage.getItem("token");
  },
  removeAccessToken() {
    localStorage.removeItem("token");
  },

  // --- Refresh Token ---
  setRefreshToken(token) {
    localStorage.setItem("refreshToken", token);
  },
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  },
  removeRefreshToken() {
    localStorage.removeItem("refreshToken");
  },

  // --- User Info ---
  setUser(user) {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },
  getUser() {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },
  removeUser() {
    localStorage.removeItem("user");
  },

  // --- Role, Name, ID, Avatar (tách riêng để dễ dùng) ---
  setRoleLogin(role) {
    localStorage.setItem("roleLogin", role);
  },
  getRoleLogin() {
    return localStorage.getItem("roleLogin");
  },
  removeRoleLogin() {
    localStorage.removeItem("roleLogin");
  },

  setNameLogin(name) {
    localStorage.setItem("nameLogin", name);
  },
  getNameLogin() {
    return localStorage.getItem("nameLogin");
  },
  removeNameLogin() {
    localStorage.removeItem("nameLogin");
  },

  setLoginId(id) {
    localStorage.setItem("loginId", id);
  },
  getLoginId() {
    return localStorage.getItem("loginId");
  },
  removeLoginId() {
    localStorage.removeItem("loginId");
  },

  setAvatarLogin(avatarUrl) {
    localStorage.setItem("avatarLogin", avatarUrl);
  },
  getAvatarLogin() {
    return localStorage.getItem("avatarLogin");
  },
  removeAvatarLogin() {
    localStorage.removeItem("avatarLogin");
  },

  // --- JWT Payload & Expiry Check ---
  getTokenPayload() {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      // Lấy phần payload giữa hai dấu chấm
      const [, payloadBase64] = token.split('.');
      // atob: decode base64 → JSON string → parse
      const json = atob(payloadBase64);
      return JSON.parse(json);
    } catch (err) {
      console.error("Error parsing JWT payload:", err);
      return null;
    }
  },

  isJwtTokenExpired() {
    const payload = this.getTokenPayload();
    if (!payload || typeof payload.exp !== 'number') {
      // Không lấy được exp thì coi như hết hạn
      return true;
    }
    // payload.exp là Unix timestamp (giây)
    const now = Math.floor(Date.now() / 1000);
    return now >= payload.exp;
  },

  // --- Clear all khi logout hoặc token hết hạn ---
  clearAll() {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUser();
    this.removeRoleLogin();
    this.removeNameLogin();
    this.removeLoginId();
    this.removeAvatarLogin();
    // Nếu vẫn còn lưu companyId hay key nào khác, xóa thêm ở đây:
    localStorage.removeItem("companyId");
  },
};

export default StorageService;
