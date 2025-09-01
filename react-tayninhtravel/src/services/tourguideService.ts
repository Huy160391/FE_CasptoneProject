import axiosInstance from "@/config/axios";
import type { ApiResponse } from '@/types/index';
import { InvitationStatistics, TourGuideInvitation } from "@/types/tour";
import { getVietnamNow, toVietnamTime } from "../utils/vietnamTimezone";

// Use the shared axios instance from config
const api = axiosInstance;

// ===== TOUR GUIDE INVITATION APIs =====

export interface MyInvitationsResponse {
  invitations: TourGuideInvitation[];
  statistics: InvitationStatistics;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export interface AcceptInvitationRequest {
  invitationId: string;
  acceptanceMessage?: string;
  confirmUnderstanding: boolean;
}

export interface RejectInvitationRequest {
  invitationId: string;
  rejectionReason: string;
  improvementSuggestion?: string;
}

/**
 * Lấy danh sách invitations của tour guide hiện tại
 * @param status - Lọc theo status (optional): "Pending" | "Accepted" | "Rejected" | "Expired"
 * @param token - JWT token (optional, sẽ lấy từ localStorage nếu không có)
 */
export const getMyInvitations = async (
  status?: string,
  token?: string
): Promise<ApiResponse<MyInvitationsResponse>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params = status ? { status } : {};

    const response = await api.get("/TourGuideInvitation/my-invitations", {
      headers,
      params,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching my invitations:", error);
    throw error;
  }
};

/**
 * Chấp nhận invitation
 * @param invitationId - ID của invitation
 * @param acceptanceMessage - Tin nhắn chấp nhận (optional)
 * @param token - JWT token (optional)
 */
export const acceptInvitation = async (
  invitationId: string,
  acceptanceMessage?: string,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const requestData: AcceptInvitationRequest = {
      invitationId,
      acceptanceMessage,
      confirmUnderstanding: true,
    };

    const response = await api.post(
      `/TourGuideInvitation/${invitationId}/accept`,
      requestData,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
};

/**
 * Từ chối invitation
 * @param invitationId - ID của invitation
 * @param rejectionReason - Lý do từ chối (bắt buộc)
 * @param improvementSuggestion - Gợi ý cải thiện (optional)
 * @param token - JWT token (optional)
 */
export const rejectInvitation = async (
  invitationId: string,
  rejectionReason: string,
  improvementSuggestion?: string,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const requestData: RejectInvitationRequest = {
      invitationId,
      rejectionReason,
      improvementSuggestion,
    };

    const response = await api.post(
      `/TourGuideInvitation/${invitationId}/reject`,
      requestData,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error rejecting invitation:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết của một invitation
 * @param invitationId - ID của invitation
 * @param token - JWT token (optional)
 */
export const getInvitationDetails = async (
  invitationId: string,
  token?: string
): Promise<ApiResponse<TourGuideInvitation>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get(`/TourGuideInvitation/${invitationId}`, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching invitation details:", error);
    throw error;
  }
};

/**
 * Validate invitation trước khi accept
 * @param invitationId - ID của invitation
 * @param token - JWT token (optional)
 */
export const validateInvitationAcceptance = async (
  invitationId: string,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get(
      `/TourGuideInvitation/${invitationId}/validate-acceptance`,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error validating invitation acceptance:", error);
    throw error;
  }
};

// ===== TOUR GUIDE PROFILE APIs =====

/**
 * Lấy thông tin profile của tour guide hiện tại
 * @param token - JWT token (optional)
 */
export const getMyProfile = async (
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get("/Account/profile", { headers });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching tour guide profile:", error);
    throw error;
  }
};

/**
 * Cập nhật profile của tour guide
 * @param profileData - Dữ liệu profile cần cập nhật
 * @param token - JWT token (optional)
 */
export const updateMyProfile = async (
  profileData: any,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.put("/Account/profile", profileData, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating tour guide profile:", error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Format thời gian còn lại trước khi invitation hết hạn
 * @param expiresAt - Thời gian hết hạn
 */
export const formatTimeUntilExpiry = (expiresAt: string): string => {
  const now = getVietnamNow();
  const expiry = toVietnamTime(new Date(expiresAt));
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Đã hết hạn";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày ${diffHours % 24} giờ`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ ${diffMinutes} phút`;
  } else {
    return `${diffMinutes} phút`;
  }
};

/**
 * Kiểm tra invitation có thể accept/reject không
 * @param invitation - Invitation object
 */
export const canRespondToInvitation = (
  invitation: TourGuideInvitation
): boolean => {
  return (
    invitation.status === "Pending" &&
    new Date(invitation.expiresAt) > new Date()
  );
};

// ===== HDV TOUR MANAGEMENT APIs =====

export interface ActiveTour {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  price: number;
  maxGuests: number;
  currentBookings: number;
  status: string;
  tourTemplate: {
    title: string;
    startLocation: string;
    endLocation: string;
  };
  bookingsCount: number;
  checkedInCount: number;
}

export interface TourBooking {
  id: string;
  bookingCode: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  numberOfGuests: number;
  adultCount: number;
  childCount: number;
  totalPrice: number;
  isCheckedIn: boolean;
  checkInTime?: string;
  checkInNotes?: string;
  qrCodeData?: string;
  customerName?: string;
}

export interface TimelineItem {
  id: string;
  checkInTime: string;
  activity: string;
  sortOrder: number;
  isCompleted: boolean;
  completedAt?: string;
  completionNotes?: string;
  specialtyShop?: {
    id: string;
    shopName: string;
    address: string;
  };
}

export interface CheckInRequest {
  qrCodeData?: string;
  notes?: string;
}

export interface CheckInWithOverrideRequest {
  qrCodeData?: string;
  notes?: string;
  overrideTimeRestriction?: boolean;
  overrideReason?: string;
}

export interface CompleteTimelineRequest {
  notes?: string;
}

export interface ReportIncidentRequest {
  tourOperationId: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  imageUrls?: string[];
}

export interface NotifyGuestsRequest {
  message: string;
  isUrgent?: boolean;
}

/**
 * Lấy danh sách tours đang active của HDV hiện tại
 * @param token - JWT token (optional)
 */
export const getMyActiveTours = async (
  token?: string
): Promise<ApiResponse<ActiveTour[]>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get("/TourGuide/my-active-tours", { headers });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching active tours:", error);
    throw error;
  }
};

/**
 * Lấy danh sách bookings cho tour cụ thể
 * @param operationId - ID của TourOperation
 * @param token - JWT token (optional)
 */
export const getTourBookings = async (
  operationId: string,
  token?: string
): Promise<ApiResponse<TourBooking[]>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get(`/TourGuide/tour/${operationId}/bookings`, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching tour bookings:", error);
    throw error;
  }
};

/**
 * Lấy timeline items cho tour cụ thể
 * @param tourDetailsId - ID của TourDetails
 * @param token - JWT token (optional)
 */
export const getTourTimeline = async (
  tourDetailsId: string,
  token?: string
): Promise<ApiResponse<TimelineItem[]>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get(`/TourDetails/${tourDetailsId}/timeline`, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching tour timeline:", error);
    throw error;
  }
};

/**
 * Check-in khách hàng
 * @param bookingId - ID của TourBooking
 * @param request - Thông tin check-in
 * @param token - JWT token (optional)
 */
export const checkInGuest = async (
  bookingId: string,
  request: CheckInRequest,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.post(
      `/TourGuide/checkin/${bookingId}`,
      request,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error checking in guest:", error);
    throw error;
  }
};

/**
 * Check-in khách hàng với khả năng override thời gian
 * @param bookingId - ID của TourBooking
 * @param request - Thông tin check-in với override
 * @param token - JWT token (optional)
 */
export const checkInGuestWithOverride = async (
  bookingId: string,
  request: CheckInWithOverrideRequest,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.post(
      `/TourGuide/checkin-override/${bookingId}`,
      request,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error checking in guest with override:", error);
    throw error;
  }
};

/**
 * Hoàn thành timeline item
 * @param timelineId - ID của TimelineItem
 * @param request - Thông tin hoàn thành
 * @param token - JWT token (optional)
 */
export const completeTimelineItem = async (
  timelineId: string,
  request: CompleteTimelineRequest,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.post(
      `/TourGuide/timeline/${timelineId}/complete`,
      request,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error completing timeline item:", error);
    throw error;
  }
};

/**
 * Báo cáo sự cố
 * @param request - Thông tin sự cố
 * @param token - JWT token (optional)
 */
export const reportIncident = async (
  request: ReportIncidentRequest,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.post("/TourGuide/incident/report", request, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error reporting incident:", error);
    throw error;
  }
};

/**
 * Gửi thông báo cho guests
 * @param operationId - ID của TourOperation
 * @param request - Nội dung thông báo
 * @param token - JWT token (optional)
 */
export const notifyGuests = async (
  operationId: string,
  request: NotifyGuestsRequest,
  token?: string
): Promise<ApiResponse<any>> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.post(
      `/TourGuide/tour/${operationId}/notify-guests`,
      request,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error notifying guests:", error);
    throw error;
  }
};

export default {
  // Existing invitation APIs
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  getInvitationDetails,
  validateInvitationAcceptance,
  getMyProfile,
  updateMyProfile,
  formatTimeUntilExpiry,
  canRespondToInvitation,

  // New HDV tour management APIs
  getMyActiveTours,
  getTourBookings,
  getTourTimeline,
  checkInGuest,
  completeTimelineItem,
  reportIncident,
  notifyGuests,
};

// ===== TOUR GUIDE INFO API =====

// Tour Guide Info interface based on API response
export interface TourGuideInfo {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  experience: string;
  skills: string;
  rating: number;
  totalToursGuided: number;
  isAvailable: boolean;
  notes?: string;
  profileImageUrl?: string;
  approvedAt: string;
  userName: string;
  approvedByName: string;
}

/**
 * Get tour guide details by ID
 * @param tourGuideId - The tour guide ID
 * @param token - JWT token (optional)
 */
export const getTourGuideById = async (
  tourGuideId: string,
  token?: string
): Promise<ApiResponse<TourGuideInfo>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get(`/Cms/TourGuide/${tourGuideId}`, { headers });
  return response.data;
};
