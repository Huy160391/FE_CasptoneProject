import axios from "../config/axios";

import {
  ApiResponse,
  CreateHolidayTourTemplateRequest,
  CreateTimelineItemRequest,
  CreateTimelineItemsRequest,
  CreateTourDetailsRequest,
  CreateTourOperationRequest,
  CreateTourTemplateRequest,
  GetTourDetailsListResponse,
  GetTourTemplatesParams,
  GetTourTemplatesResponse,
  SpecialtyShop,
  TimelineItem,
  TourDetails,
  TourGuide,
  TourOperation,
  TourTemplate,
  UpdateTourOperationResponse,
  UpdateTourTemplateRequest,
} from "../types";

// ===== TOUR TEMPLATE APIs =====

// Tạo mới template tour
export const createTourTemplate = async (
  data: CreateTourTemplateRequest,
  token?: string
): Promise<ApiResponse<TourTemplate>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post("/TourCompany/template", data, { headers });
  return response.data;
};

// Tạo holiday tour template
export const createHolidayTourTemplate = async (
  data: CreateHolidayTourTemplateRequest,
  token?: string
): Promise<ApiResponse<TourTemplate>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post("/TourCompany/template/holiday", data, {
    headers,
  });
  return response.data;
};

// Enhanced Holiday Tour creation with detailed error handling
export const createHolidayTourTemplateEnhanced = async (
  data: CreateHolidayTourTemplateRequest,
  token?: string
): Promise<ApiResponse<TourTemplate>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await axios.post("/TourCompany/template/holiday", data, {
      headers,
      // Disable automatic error handling for this request
      validateStatus: () => true, // Accept all status codes
    });

    // Always return the response data, whether success or error
    return {
      success: response.data.success || response.status < 400,
      statusCode: response.status,
      message: response.data.message || (response.status < 400 ? "Thành công" : "Có lỗi xảy ra"),
      validationErrors: response.data.validationErrors || response.data.ValidationErrors || [],
      fieldErrors: response.data.fieldErrors || response.data.FieldErrors || {},
      data: response.data.data || null,
    } as ApiResponse<TourTemplate>;

  } catch (error: any) {
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        statusCode: 408,
        message: "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.",
        validationErrors: [],
        fieldErrors: {},
      } as unknown as ApiResponse<TourTemplate>;
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        statusCode: 0,
        message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        validationErrors: [],
        fieldErrors: {},
      } as unknown as ApiResponse<TourTemplate>;
    }

    // For other errors, return generic error
    return {
      success: false,
      statusCode: 500,
      message: "Có lỗi không xác định xảy ra. Vui lòng thử lại.",
      validationErrors: [],
      fieldErrors: {},
    } as unknown as ApiResponse<TourTemplate>;
  }
};

// Lấy danh sách incidents cho tour company
export const getTourCompanyIncidents = async (
  params: {
    pageIndex?: number;
    pageSize?: number;
    severity?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  },
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const queryParams = new URLSearchParams();

  if (params.pageIndex !== undefined)
    queryParams.append("pageIndex", params.pageIndex.toString());
  if (params.pageSize !== undefined)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params.severity) queryParams.append("severity", params.severity);
  if (params.status) queryParams.append("status", params.status);
  if (params.fromDate)
    queryParams.append("fromDate", params.fromDate.toISOString());
  if (params.toDate) queryParams.append("toDate", params.toDate.toISOString());

  const response = await axios.get(
    `/TourCompany/incidents?${queryParams.toString()}`,
    { headers }
  );
  return response.data;
};

// Lấy danh sách tours đang hoạt động cho tour company
export const getTourCompanyActiveTours = async (
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get("/TourCompany/tours/active", { headers });
  return response.data;
};

// Lấy danh sách template tour
export const getTourTemplates = async (
  params: GetTourTemplatesParams = {},
  token?: string
): Promise<GetTourTemplatesResponse> => {
  const {
    pageIndex = 0,
    pageSize = 10,
    includeInactive = false,
    textSearch,
    templateType,
    startLocation,
  } = params;

  // Chỉ truyền params có giá trị
  const queryParams: any = {
    pageIndex,
    pageSize,
    includeInactive,
  };

  // Chỉ thêm optional params nếu có giá trị
  if (textSearch && textSearch.trim()) {
    queryParams.textSearch = textSearch.trim();
  }
  if (templateType !== undefined && templateType !== "") {
    queryParams.templateType = templateType;
  }
  if (startLocation && startLocation.trim()) {
    queryParams.startLocation = startLocation.trim();
  }

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get("/TourCompany/template", {
    params: queryParams,
    headers,
  });
  return response.data;
};

// Lấy chi tiết template tour
export const getTourTemplateDetail = async (
  id: string,
  token: string
): Promise<TourTemplate | null> => {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get(`/TourCompany/template/${id}`, { headers });
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return null;
};

// Xoá template tour
export const deleteTourTemplate = async (id: string, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.delete(`/TourCompany/template/${id}`, {
    headers,
  });
  return response.data;
};

// Cập nhật template tour
export const updateTourTemplate = async (
  id: string,
  data: UpdateTourTemplateRequest,
  token?: string
): Promise<ApiResponse<TourTemplate>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.patch(`/TourCompany/template/${id}`, data, {
    headers,
  });
  return response.data;
};

// ===== TOUR DETAILS APIs =====

// Tạo TourDetails từ Template
export const createTourDetails = async (
  data: CreateTourDetailsRequest,
  token?: string
): Promise<ApiResponse<TourDetails>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post("/TourDetails", data, { headers });
  return response.data;
};

// Lấy danh sách TourDetails theo Template
export const getTourDetailsByTemplate = async (
  templateId: string,
  includeInactive = false,
  token?: string
): Promise<ApiResponse<TourDetails[]>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = { includeInactive };
  const response = await axios.get(`/TourDetails/template/${templateId}`, {
    params,
    headers,
  });
  return response.data;
};

// Lấy danh sách TourDetails (general) - sử dụng endpoint paginated
export const getTourDetailsList = async (
  params: any = {},
  token?: string
): Promise<GetTourDetailsListResponse> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Sử dụng endpoint paginated với 0-based indexing
  // Backend đã được sửa để expect pageIndex bắt đầu từ 0
  const queryParams = {
    pageIndex: params.pageIndex || 0, // Use 0-based indexing directly
    pageSize: params.pageSize || 10,
    includeInactive: params.includeInactive || false,
    templateId: params.templateId, // Thêm filter theo template
    titleFilter: params.titleFilter, // Thêm filter theo title
    ...params,
  };

  const response = await axios.get("/TourDetails/paginated", {
    params: queryParams,
    headers,
  });

  // Backend trả về ResponseGetTourDetailsPaginatedDto với structure mới
  // Data, TotalCount, PageIndex, PageSize, TotalPages, StatusCode, Message, IsSuccess
  return response.data;
};

// Lấy chi tiết TourDetails
export const getTourDetailsById = async (
  id: string,
  token?: string
): Promise<ApiResponse<TourDetails>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`/TourDetails/${id}`, { headers });
  return response.data;
};

// Cập nhật TourDetails
export const updateTourDetails = async (
  id: string,
  data: Partial<CreateTourDetailsRequest>,
  token?: string
): Promise<ApiResponse<TourDetails>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.patch(`/TourDetails/${id}`, data, { headers });
  return response.data;
};

// Xóa TourDetails
export const deleteTourDetails = async (
  id: string,
  token?: string
): Promise<ApiResponse<void>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.delete(`/TourDetails/${id}`, { headers });
  return response.data;
};

// ===== TOUR OPERATION APIs =====

// Tạo TourOperation
export const createTourOperation = async (
  data: CreateTourOperationRequest,
  token?: string
): Promise<ApiResponse<TourOperation>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post("/TourOperation", data, { headers });
  return response.data;
};

// Lấy TourOperation theo TourDetails ID
export const getTourOperationByDetailsId = async (
  tourDetailsId: string,
  token?: string
): Promise<ApiResponse<TourOperation>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  console.log("🚀 Getting TourOperation for TourDetails:", tourDetailsId);
  const response = await axios.get(`/TourOperation/details/${tourDetailsId}`, {
    headers,
  });
  console.log("✅ TourOperation API response:", response.data);

  // API trả về format: { data: TourOperation, success: boolean, message: string, statusCode: number }
  return response.data as ApiResponse<TourOperation>;
};

// Cập nhật TourOperation
export const updateTourOperation = async (
  id: string,
  data: Partial<CreateTourOperationRequest>,
  token?: string
): Promise<UpdateTourOperationResponse> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.patch(`/TourOperation/${id}`, data, { headers });
  return response.data;
};

// Xóa TourOperation
export const deleteTourOperation = async (
  id: string,
  token?: string
): Promise<ApiResponse<void>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.delete(`/TourOperation/${id}`, { headers });
  return response.data;
};

// Kiểm tra capacity real-time
export const checkTourCapacity = async (
  operationId: string,
  token?: string
): Promise<
  ApiResponse<{
    maxSeats: number;
    bookedSeats: number;
    availableSeats: number;
    isFullyBooked: boolean;
  }>
> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`/TourOperation/${operationId}`, {
    headers,
  });
  const operation = response.data.data; // API response có format { success, data, message }

  return {
    ...response.data,
    data: {
      maxSeats: operation.maxSeats,
      bookedSeats: operation.bookedSeats || operation.currentBookings,
      availableSeats:
        operation.maxSeats -
        (operation.bookedSeats || operation.currentBookings),
      isFullyBooked:
        (operation.bookedSeats || operation.currentBookings) >=
        operation.maxSeats,
    },
  };
};

// ===== TIMELINE APIs =====

// Tạo Timeline Item
export const createTimelineItem = async (
  data: CreateTimelineItemRequest,
  token?: string
): Promise<ApiResponse<TimelineItem>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post("/TourDetails/timeline/single", data, {
    headers,
  });
  return response.data;
};

// Tạo nhiều Timeline Items
export const createTimelineItems = async (
  data: CreateTimelineItemsRequest,
  token?: string
): Promise<ApiResponse<{ createdCount: number; items: TimelineItem[] }>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post("/TourDetails/timeline", data, { headers });
  return response.data;
};

// Lấy Timeline Items theo TourDetails ID
export const getTimelineItemsByDetailsId = async (
  tourDetailsId: string,
  token?: string
): Promise<ApiResponse<TimelineItem[]>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`/TourDetails/${tourDetailsId}/timeline`, {
    headers,
  });
  return response.data;
};

// Cập nhật Timeline Item
export const updateTimelineItem = async (
  id: string,
  data: Partial<CreateTimelineItemRequest>,
  token?: string
): Promise<ApiResponse<TimelineItem>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.patch(`/TourDetails/timeline/${id}`, data, {
    headers,
  });
  return response.data;
};

// Xóa Timeline Item
export const deleteTimelineItem = async (
  id: string,
  token?: string
): Promise<ApiResponse<void>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.delete(`/TourDetails/timeline/${id}`, {
    headers,
  });
  return response.data;
};

// ===== PUBLIC TOUR DETAILS APIs =====

// Lấy danh sách tour details công khai (cho homepage)
export const getPublicTourDetails = async (
  params: {
    pageIndex?: number;
    pageSize?: number;
    includeInactive?: boolean;
  } = {}
): Promise<ApiResponse<any>> => {
  const queryParams = {
    pageIndex: params.pageIndex || 0,
    pageSize: params.pageSize || 10,
    includeInactive: params.includeInactive || false,
  };

  const response = await axios.get("/TourDetails/paginated", {
    params: queryParams,
  });
  return response.data;
};

// Lấy tour details nổi bật (featured tours) - không cần authentication
export const getFeaturedTourDetails = async (
  limit = 6
): Promise<ApiResponse<any>> => {
  const response = await axios.get("/TourDetails/paginated", {
    params: {
      pageIndex: 0,
      pageSize: limit,
      includeInactive: false,
    },
  });
  return response.data;
};

// Lấy tour holiday
export const getHolidayTours = async (limit = 6): Promise<ApiResponse<any>> => {
  const response = await axios.get("/UserTourSearch/holiday", {
    params: {
      pageIndex: 0,
      pageSize: limit,
    },
  });
  return response.data;
};
// ===== SPECIALTY SHOP APIs =====

// Lấy danh sách SpecialtyShops
export const getSpecialtyShops = async (
  includeInactive = false,
  token?: string
): Promise<ApiResponse<SpecialtyShop[]>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = { includeInactive };
  const response = await axios.get("/SpecialtyShop", { params, headers });
  return response.data;
};

// Lấy SpecialtyShop theo ID
export const getSpecialtyShopById = async (
  id: string,
  token?: string
): Promise<ApiResponse<SpecialtyShop>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`/SpecialtyShop/${id}`, { headers });
  return response.data;
};

// ===== UTILITY FUNCTIONS =====

// Error handler for API calls
export const handleApiError = (error: any): string => {
  console.error("API Error Details:", error);

  if (error.response?.status === 400) {
    const responseData = error.response.data;

    // Check for validation errors array first
    if (
      responseData.validationErrors &&
      Array.isArray(responseData.validationErrors) &&
      responseData.validationErrors.length > 0
    ) {
      return responseData.validationErrors.join("\n");
    }

    // Check for detailed error message from API
    if (responseData.message) {
      return responseData.message;
    }

    // Check for errors object (sometimes API returns errors in different format)
    if (responseData.errors) {
      const errorMessages = [];
      for (const [field, messages] of Object.entries(responseData.errors)) {
        if (Array.isArray(messages)) {
          errorMessages.push(`${field}: ${messages.join(", ")}`);
        } else {
          errorMessages.push(`${field}: ${messages}`);
        }
      }
      if (errorMessages.length > 0) {
        return errorMessages.join("\n");
      }
    }

    return "Dữ liệu không hợp lệ";
  } else if (error.response?.status === 403) {
    return "Bạn không có quyền thực hiện thao tác này";
  } else if (error.response?.status === 404) {
    return "Không tìm thấy dữ liệu";
  } else if (error.response?.status === 500) {
    const responseData = error.response.data;
    if (responseData?.message) {
      return `Lỗi hệ thống: ${responseData.message}`;
    }
    return "Lỗi hệ thống, vui lòng thử lại sau";
  } else {
    return error.message || "Có lỗi xảy ra";
  }
};

// Performance tracker
export const performanceTracker = {
  startTime: null as number | null,

  start(operation: string) {
    this.startTime = performance.now();
    console.log(`Starting ${operation}...`);
  },

  end(operation: string) {
    if (this.startTime) {
      const duration = performance.now() - this.startTime;
      console.log(`${operation} completed in ${duration.toFixed(2)}ms`);
    }
  },
};

// ===== TOUR GUIDE APIs =====

// Lấy danh sách TourGuides
export const getTourGuides = async (
  includeInactive = false,
  token?: string
): Promise<ApiResponse<TourGuide[]>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = { includeInactive };
  const response = await axios.get("/Account/guides", { headers, params });
  return response.data;
};

// ===== TOUR GUIDE INVITATION APIs =====

// Lấy danh sách invitations cho một TourDetails
export const getTourGuideInvitations = async (
  tourDetailsId: string,
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `/TourGuideInvitation/tourdetails/${tourDetailsId}`,
    { headers }
  );
  return response.data;
};

// Lấy danh sách TourGuides available cho ngày cụ thể
export const getAvailableTourGuides = async (
  date: string,
  excludeOperationId?: string,
  token?: string
): Promise<ApiResponse<TourGuide[]>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params: any = { date };
  if (excludeOperationId) {
    params.excludeOperationId = excludeOperationId;
  }
  const response = await axios.get("/Account/guides/available", {
    headers,
    params,
  });
  return response.data;
};

// ===== TOUR DETAILS STATUS MANAGEMENT =====

// Kích hoạt public cho TourDetails (chuyển từ WaitToPublic sang Public)
export const activatePublicTourDetails = async (
  tourDetailsId: string,
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(
    `/TourCompany/tourdetails/${tourDetailsId}/activate-public`,
    {},
    { headers }
  );
  return response.data;
};

// Huỷ slot tour
export const cancelTourSlot = async (
  slotId: string,
  reason: string,
  additionalMessage?: string,
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const requestBody = {
    reason,
    additionalMessage: additionalMessage || "",
  };
  const response = await axios.post(
    `/TourSlot/${slotId}/cancel-public`,
    requestBody,
    { headers }
  );
  return response.data;
};

// Mời thủ công hướng dẫn viên cho TourDetails
export const manualInviteGuide = async (
  tourDetailsId: string,
  guideId: string,
  additionalMessage?: string,
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const requestBody = {
    tourDetailsId,
    guideId,
    additionalMessage: additionalMessage || "",
    expirationDays: 3,
  };
  const response = await axios.post(
    `/TourDetails/${tourDetailsId}/manual-invite-guide`,
    requestBody,
    { headers }
  );
  return response.data;
};

// ===== DASHBOARD APIs =====

// Lấy thống kê dashboard tổng quan cho TourCompany
export const getDashboardStatistics = async (
  params: {
    year?: number;
    month?: number;
    compareWithPrevious?: boolean;
  } = {},
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const queryParams = new URLSearchParams();

  if (params.year !== undefined)
    queryParams.append("year", params.year.toString());
  if (params.month !== undefined)
    queryParams.append("month", params.month.toString());
  if (params.compareWithPrevious !== undefined)
    queryParams.append(
      "compareWithPrevious",
      params.compareWithPrevious.toString()
    );

  const response = await axios.get(
    `/TourCompany/dashboard/statistics?${queryParams.toString()}`,
    { headers }
  );
  return response.data;
};

// Lấy phân tích chi tiết cho TourCompany dashboard
export const getDetailedAnalytics = async (
  params: {
    year?: number;
    month?: number;
    tourId?: string;
    analyticsType?: string;
    granularity?: string;
  } = {},
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const queryParams = new URLSearchParams();

  if (params.year !== undefined)
    queryParams.append("year", params.year.toString());
  if (params.month !== undefined)
    queryParams.append("month", params.month.toString());
  if (params.tourId) queryParams.append("tourId", params.tourId);
  if (params.analyticsType)
    queryParams.append("analyticsType", params.analyticsType);
  if (params.granularity) queryParams.append("granularity", params.granularity);

  const response = await axios.get(
    `/TourCompany/dashboard/detailed-analytics?${queryParams.toString()}`,
    { headers }
  );
  return response.data;
};

// ===== TOUR COMPANY INFO API =====

// Tour Company Info interface based on API response
export interface TourCompanyInfo {
  id: string;
  userId: string;
  companyName: string;
  wallet: number;
  revenueHold: number;
  description?: string;
  address?: string;
  website?: string;
  businessLicense?: string;
  isActive: boolean;
  email: string;
  fullName: string;
  phoneNumber: string;
  publicTour: number;
}

/**
 * Get tour company details by ID
 * @param tourCompanyId - The tour company ID
 * @param token - JWT token (optional)
 */
export const getTourCompanyById = async (
  tourCompanyId: string,
  token?: string
): Promise<ApiResponse<TourCompanyInfo>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`/Cms/TourCompany/${tourCompanyId}`, { headers });
  return response.data;
};
export const getRecentBookings = async (
  pageSize: number = 10,
  token?: string
): Promise<ApiResponse<any[]>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `/TourCompany/dashboard/recent-bookings?pageSize=${pageSize}`,
    { headers }
  );
  return response.data;
};

// ===== INCIDENT MANAGEMENT APIs =====

/**
 * Lấy danh sách sự cố theo TourSlotId
 */
export const getTourSlotIncidents = async (
  tourSlotId: string,
  pageIndex: number = 0,
  pageSize: number = 10,
  token?: string
): Promise<ApiResponse<any>> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(
    `/TourCompany/tour-slot/${tourSlotId}/incidents?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { headers }
  );
  return response.data;
};

/**
 * Lấy tổng số sự cố của một tour slot (để hiển thị badge)
 */
export const getTourSlotIncidentCount = async (
  tourSlotId: string,
  token?: string
): Promise<number> => {
  try {
    const response = await getTourSlotIncidents(tourSlotId, 0, 1, token);
    return response.data?.totalCount || 0;
  } catch (error) {
    console.error('Error getting incident count:', error);
    return 0;
  }
};
