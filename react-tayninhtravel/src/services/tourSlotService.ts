import axiosInstance from "../config/axios";


export interface TourSlotDto {
  id: string;
  tourTemplateId: string;
  tourDetailsId?: string;
  tourDate: string; // DateOnly from backend (YYYY-MM-DD format)
  scheduleDay: number; // ScheduleDay enum value
  scheduleDayName: string; // Vietnamese day name
  status: number; // TourSlotStatus enum value
  statusName: string; // Vietnamese status name
  maxGuests?: number; // Independent capacity per slot
  currentBookings?: number; // Independent bookings per slot
  availableSpots?: number; // Calculated from slot's own capacity
  isActive: boolean;
  isBookable?: boolean; // ✅ NEW: Backend calculated bookable flag (primary source)
  tourTemplate?: {
    id: string;
    title: string;
    startLocation: string;
    endLocation: string;
    templateType: number;
  };
  tourDetails?: {
    id: string;
    title: string;
    description: string;
    status: number;
    statusName: string;
  };
  tourOperation?: {
    id: string;
    price: number;
    maxGuests: number;
    currentBookings: number;
    availableSpots: number;
    status: number;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt?: string;
  formattedDate: string; // DD/MM/YYYY format
  formattedDateWithDay: string; // "Thứ bảy - DD/MM/YYYY" format
}

export interface TourSlotsResponse {
  success: boolean;
  message: string;
  data: TourSlotDto[];
  totalCount: number;
  tourDetailsId?: string;
  tourTemplateId?: string;
  filters?: {
    tourTemplateId?: string;
    tourDetailsId?: string;
    fromDate?: string;
    toDate?: string;
    scheduleDay?: number;
    includeInactive?: boolean;
  };
}

export interface GetSlotsParams {
  tourTemplateId?: string;
  tourDetailsId?: string;
  fromDate?: string; // YYYY-MM-DD format
  toDate?: string; // YYYY-MM-DD format
  scheduleDay?: number;
  includeInactive?: boolean;
}

export interface BookedUserInfo {
  bookingId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  numberOfGuests: number;
  totalPrice: number;
  originalPrice: number;
  discountPercent: number;
  status: number;
  statusName: string;
  bookingDate: string;
  confirmedDate?: string;
  bookingCode: string;
  customerNotes?: string;
}

export interface BookingStatistics {
  totalBookings: number;
  totalGuests: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  confirmedRevenue: number;
  occupancyRate: number; // Tỷ lệ lấp đầy (%)
}

export interface TourSlotWithBookingsDto {
  slot: TourSlotDto;
  tourDetails?: {
    id: string;
    title: string;
    description: string;
    imageUrls?: string[];
    skillsRequired?: string[];
    status: string;
    statusName?: string;
    createdAt?: string;
    timeline?: Array<{
      id: string;
      checkInTime: string;
      activity: string;
      sortOrder: number;
      specialtyShop?: any;
    }>;
    tourTemplate?: {
      id: string;
      title: string;
      startLocation: string;
      endLocation: string;
      templateType: number;
    };
  };
  // ✅ FIXED: tourOperation at root level (not nested in tourDetails)
  tourOperation?: {
    id: string;
    price: number;
    maxGuests: number;
    currentBookings: number;
    availableSpots?: number;
    status: string;
    isActive: boolean;
    tourGuide?: {
      id: string;
      fullName: string;
      phoneNumber: string;
      email: string;
    };
  };
  // ✅ FIXED: bookings at root level (not bookedUsers)
  bookings: BookedUserInfo[];
  bookedUsers?: BookedUserInfo[]; // Keep for backward compatibility
  statistics?: BookingStatistics;
}

export interface TourSlotWithBookingsResponse {
  success: boolean;
  message: string;
  data: TourSlotWithBookingsDto;
}

export interface CancelTourRequest {
  reason: string;
  additionalMessage?: string;
}

export interface CancelTourResponse {
  success: boolean;
  message: string;
  data?: any;
}

class TourSlotService {
  private readonly baseUrl = "/TourSlot";

  /**
   * Lấy danh sách TourSlots theo filter
   */
  async getSlots(
    params?: GetSlotsParams,
    token?: string
  ): Promise<TourSlotsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.tourTemplateId)
      queryParams.append("tourTemplateId", params.tourTemplateId);
    if (params?.tourDetailsId)
      queryParams.append("tourDetailsId", params.tourDetailsId);
    if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params?.toDate) queryParams.append("toDate", params.toDate);
    if (params?.scheduleDay !== undefined)
      queryParams.append("scheduleDay", params.scheduleDay.toString());
    if (params?.includeInactive !== undefined)
      queryParams.append("includeInactive", params.includeInactive.toString());

    const url = queryParams.toString()
      ? `${this.baseUrl}?${queryParams}`
      : this.baseUrl;

    const response = await axiosInstance.get<TourSlotsResponse>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
  }

  /**
   * Lấy chi tiết một TourSlot theo ID
   */
  async getSlotById(
    id: string,
    token?: string
  ): Promise<{ success: boolean; data: TourSlotDto; message: string }> {
    const response = await axiosInstance.get<{
      success: boolean;
      data: TourSlotDto;
      message: string;
    }>(`${this.baseUrl}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
  }

  /**
   * Lấy TourSlots của một TourDetails cụ thể
   */
  async getSlotsByTourDetails(
    tourDetailsId: string,
    token?: string
  ): Promise<TourSlotsResponse> {
    const response = await axiosInstance.get<TourSlotsResponse>(
      `${this.baseUrl}/tour-details/${tourDetailsId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return response.data;
  }

  /**
   * Lấy TourSlots của một TourTemplate cụ thể
   */
  async getSlotsByTourTemplate(
    tourTemplateId: string,
    token?: string
  ): Promise<TourSlotsResponse> {
    const response = await axiosInstance.get<TourSlotsResponse>(
      `${this.baseUrl}/tour-template/${tourTemplateId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return response.data;
  }

  /**
   * Lấy TourSlots chưa được gán tour details của một TourTemplate cụ thể
   */
  async getUnassignedSlotsByTourTemplate(
    tourTemplateId: string,
    includeInactive = false,
    token?: string
  ): Promise<TourSlotsResponse> {
    const queryParams = new URLSearchParams();
    if (includeInactive)
      queryParams.append("includeInactive", includeInactive.toString());

    const url = queryParams.toString()
      ? `${this.baseUrl}/tour-template/${tourTemplateId}/unassigned?${queryParams}`
      : `${this.baseUrl}/tour-template/${tourTemplateId}/unassigned`;

    const response = await axiosInstance.get<TourSlotsResponse>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
  }

  /**
   * Lấy các slots available cho booking
   */
  async getAvailableSlots(
    params?: {
      tourTemplateId?: string;
      fromDate?: string;
      toDate?: string;
    },
    token?: string
  ): Promise<TourSlotsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.tourTemplateId)
      queryParams.append("tourTemplateId", params.tourTemplateId);
    if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params?.toDate) queryParams.append("toDate", params.toDate);

    const url = queryParams.toString()
      ? `${this.baseUrl}/available?${queryParams}`
      : `${this.baseUrl}/available`;

    const response = await axiosInstance.get<TourSlotsResponse>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
  }

  /**
   * Lấy chi tiết slot với thông tin tour và danh sách user đã book
   */
  async getSlotWithTourDetailsAndBookings(
    slotId: string,
    token?: string
  ): Promise<TourSlotWithBookingsResponse> {
    const response = await axiosInstance.get<TourSlotWithBookingsResponse>(
      `${this.baseUrl}/${slotId}/tour-details-and-bookings`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return response.data;
  }

  /**
   * Hủy tour slot với lý do
   */
  async cancelTourSlot(
    slotId: string,
    cancelData: CancelTourRequest,
    token?: string
  ): Promise<CancelTourResponse> {
    const response = await axiosInstance.post<CancelTourResponse>(
      `${this.baseUrl}/${slotId}/cancel-public`,
      cancelData,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return response.data;
  }

  /**
   * Convert TourSlotDto to TourDate format for backward compatibility
   */
  convertToTourDate(slot: TourSlotDto): {
    tourSlotId: string;
    tourDate: string;
    scheduleDay: string;
    isAvailable: boolean;
    formattedDateWithDay: string;
  } {
    return {
      tourSlotId: slot.id,
      tourDate: slot.tourDate,
      scheduleDay: slot.scheduleDayName,
      isAvailable: slot.status === 1 && slot.isActive, // Status 1 = Available
      formattedDateWithDay: slot.formattedDateWithDay,
    };
  }

  /**
   * Convert multiple TourSlotDto to TourDate format
   */
  convertToTourDates(slots: TourSlotDto[]): Array<{
    tourSlotId: string;
    tourDate: string;
    scheduleDay: string;
    isAvailable: boolean;
    formattedDateWithDay: string;
  }> {
    return slots.map((slot) => this.convertToTourDate(slot));
  }
}

export const tourSlotService = new TourSlotService();
export default tourSlotService;

