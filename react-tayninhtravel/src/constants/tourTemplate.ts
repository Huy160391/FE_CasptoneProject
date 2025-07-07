import { TourTemplateType, ScheduleDay, TourSlotStatus, TourDetailsStatus, TourOperationStatus } from '../types/tour';

// Validation constants
export const VALIDATION_RULES = {
  template: {
    title: {
      required: true,
      maxLength: 200,
      message: "Vui lòng nhập tên template (không quá 200 ký tự)"
    },
    templateType: {
      required: true,
      enum: [TourTemplateType.FreeScenic, TourTemplateType.PaidAttraction],
      message: "Vui lòng chọn thể loại tour"
    },
    scheduleDays: {
      required: true,
      enum: [ScheduleDay.Sunday, ScheduleDay.Saturday],
      message: "Vui lòng chọn thứ (chỉ được chọn Thứ 7 hoặc Chủ nhật)"
    },
    startLocation: {
      required: true,
      maxLength: 500,
      message: "Vui lòng nhập điểm bắt đầu (không quá 500 ký tự)"
    },
    endLocation: {
      required: true,
      maxLength: 500,
      message: "Vui lòng nhập điểm kết thúc (không quá 500 ký tự)"
    },
    month: {
      required: true,
      min: 1,
      max: 12,
      message: "Tháng phải từ 1 đến 12"
    },
    year: {
      required: true,
      min: 2024,
      max: 2030,
      message: "Năm phải từ 2024 đến 2030"
    },
    images: {
      required: false,
      type: "array",
      message: "Danh sách hình ảnh (tùy chọn)"
    }
  },
  timeline: {
    checkInTime: {
      required: true,
      pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      message: "Thời gian phải theo định dạng HH:mm (00:00-23:59)"
    },
    activity: {
      required: true,
      maxLength: 255,
      message: "Hoạt động là bắt buộc và không quá 255 ký tự"
    },
    location: {
      required: false,
      maxLength: 500,
      message: "Địa điểm không được quá 500 ký tự"
    },
    orderIndex: {
      min: 1,
      message: "Thứ tự phải lớn hơn 0"
    },
    estimatedDuration: {
      min: 1,
      max: 1440, // 24 hours in minutes
      message: "Thời gian ước tính phải từ 1 đến 1440 phút"
    }
  },
  tourOperation: {
    price: {
      required: true,
      min: 0,
      message: "Giá tour phải lớn hơn hoặc bằng 0"
    },
    maxSeats: {
      required: true,
      min: 1,
      max: 100,
      message: "Số ghế tối đa phải từ 1 đến 100"
    }
  }
};

// Display labels
export const TOUR_TEMPLATE_TYPE_LABELS = {
  [TourTemplateType.FreeScenic]: 'Tour danh lam thắng cảnh',
  [TourTemplateType.PaidAttraction]: 'Tour khu vui chơi'
};

export const SCHEDULE_DAY_LABELS = {
  [ScheduleDay.Sunday]: 'Chủ nhật',
  [ScheduleDay.Saturday]: 'Thứ bảy'
};

export const TOUR_SLOT_STATUS_LABELS = {
  [TourSlotStatus.Available]: 'Có sẵn',
  [TourSlotStatus.FullyBooked]: 'Đã đầy',
  [TourSlotStatus.Cancelled]: 'Đã hủy',
  [TourSlotStatus.Completed]: 'Hoàn thành',
  [TourSlotStatus.InProgress]: 'Đang thực hiện'
};

export const TOUR_DETAILS_STATUS_LABELS = {
  [TourDetailsStatus.Pending]: 'Chờ duyệt',
  [TourDetailsStatus.Approved]: 'Đã duyệt',
  [TourDetailsStatus.Rejected]: 'Bị từ chối',
  [TourDetailsStatus.Suspended]: 'Tạm ngưng',
  [TourDetailsStatus.AwaitingGuideAssignment]: 'Chờ phân công HDV',
  [TourDetailsStatus.Cancelled]: 'Đã hủy',
  [TourDetailsStatus.AwaitingAdminApproval]: 'Chờ admin duyệt',
  [TourDetailsStatus.WaitToPublic]: 'Chờ công khai',
  [TourDetailsStatus.Public]: 'Đã công khai'
};

export const TOUR_OPERATION_STATUS_LABELS = {
  [TourOperationStatus.Scheduled]: 'Đã lên lịch',
  [TourOperationStatus.InProgress]: 'Đang thực hiện',
  [TourOperationStatus.Completed]: 'Hoàn thành',
  [TourOperationStatus.Cancelled]: 'Đã hủy',
  [TourOperationStatus.Postponed]: 'Hoãn lại',
  [TourOperationStatus.PendingConfirmation]: 'Chờ xác nhận'
};

// Helper functions
export const getTemplateTypeLabel = (type: TourTemplateType): string => {
  return TOUR_TEMPLATE_TYPE_LABELS[type] || 'Không xác định';
};

export const getScheduleDayLabel = (day: ScheduleDay): string => {
  return SCHEDULE_DAY_LABELS[day] || 'Không xác định';
};

export const getTourSlotStatusLabel = (status: TourSlotStatus): string => {
  return TOUR_SLOT_STATUS_LABELS[status] || 'Không xác định';
};

export const getTourDetailsStatusLabel = (status: TourDetailsStatus): string => {
  return TOUR_DETAILS_STATUS_LABELS[status] || 'Không xác định';
};

export const getTourOperationStatusLabel = (status: TourOperationStatus): string => {
  return TOUR_OPERATION_STATUS_LABELS[status] || 'Không xác định';
};

// Validation functions
export const validateTourTemplate = (data: any): string[] => {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.template;

  console.log('Validating data:', data);
  console.log('Schedule days value:', data.scheduleDays);
  console.log('Valid schedule days:', rules.scheduleDays.enum);

  // Title validation
  if (!data.title || data.title.trim() === '') {
    errors.push(rules.title.message);
  } else if (data.title.length > rules.title.maxLength) {
    errors.push(rules.title.message);
  }

  // Template type validation
  if (!data.templateType || !rules.templateType.enum.includes(data.templateType)) {
    errors.push(rules.templateType.message);
  }

  // Schedule days validation
  if (data.scheduleDays === undefined || data.scheduleDays === null || !rules.scheduleDays.enum.includes(data.scheduleDays)) {
    console.log('Schedule days validation failed:', data.scheduleDays, 'not in', rules.scheduleDays.enum);
    errors.push(rules.scheduleDays.message);
  }

  // Start location validation
  if (!data.startLocation || data.startLocation.trim() === '') {
    errors.push(rules.startLocation.message);
  } else if (data.startLocation.length > rules.startLocation.maxLength) {
    errors.push(rules.startLocation.message);
  }

  // End location validation
  if (!data.endLocation || data.endLocation.trim() === '') {
    errors.push(rules.endLocation.message);
  } else if (data.endLocation.length > rules.endLocation.maxLength) {
    errors.push(rules.endLocation.message);
  }

  // Month validation
  if (!data.month || data.month < rules.month.min || data.month > rules.month.max) {
    errors.push(rules.month.message);
  }

  // Year validation
  if (!data.year || data.year < rules.year.min || data.year > rules.year.max) {
    errors.push(rules.year.message);
  }

  return errors;
};

export const validateTimelineItem = (data: any): string[] => {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.timeline;

  // Check-in time validation
  if (!data.checkInTime || !rules.checkInTime.pattern.test(data.checkInTime)) {
    errors.push(rules.checkInTime.message);
  }

  // Activity validation
  if (!data.activity || data.activity.trim() === '') {
    errors.push(rules.activity.message);
  } else if (data.activity.length > rules.activity.maxLength) {
    errors.push(rules.activity.message);
  }

  // Location validation (optional)
  if (data.location && data.location.length > rules.location.maxLength) {
    errors.push(rules.location.message);
  }

  // Order index validation
  if (data.orderIndex && data.orderIndex < rules.orderIndex.min) {
    errors.push(rules.orderIndex.message);
  }

  // Estimated duration validation (optional)
  if (data.estimatedDuration && (data.estimatedDuration < rules.estimatedDuration.min || data.estimatedDuration > rules.estimatedDuration.max)) {
    errors.push(rules.estimatedDuration.message);
  }

  return errors;
};

export const validateTourOperation = (data: any): string[] => {
  const errors: string[] = [];
  const rules = VALIDATION_RULES.tourOperation;

  // Price validation
  if (data.price === undefined || data.price === null || data.price < rules.price.min) {
    errors.push(rules.price.message);
  }

  // Max seats validation
  if (!data.maxSeats || data.maxSeats < rules.maxSeats.min || data.maxSeats > rules.maxSeats.max) {
    errors.push(rules.maxSeats.message);
  }

  return errors;
};

// Status color helpers for UI
export const getStatusColor = (status: TourDetailsStatus | TourSlotStatus | TourOperationStatus): string => {
  switch (status) {
    case TourDetailsStatus.Approved:
    case TourSlotStatus.Available:
    case TourOperationStatus.Scheduled:
      return 'green';
    case TourDetailsStatus.Pending:
    case TourDetailsStatus.AwaitingAdminApproval:
    case TourOperationStatus.PendingConfirmation:
      return 'orange';
    case TourDetailsStatus.Rejected:
    case TourDetailsStatus.Cancelled:
    case TourSlotStatus.Cancelled:
    case TourOperationStatus.Cancelled:
      return 'red';
    case TourDetailsStatus.Suspended:
    case TourOperationStatus.Postponed:
      return 'volcano';
    case TourDetailsStatus.AwaitingGuideAssignment:
      return 'purple';
    case TourDetailsStatus.WaitToPublic:
      return 'geekblue';
    case TourDetailsStatus.Public:
      return 'lime';
    case TourSlotStatus.FullyBooked:
    case TourSlotStatus.Completed:
    case TourOperationStatus.Completed:
      return 'blue';
    case TourSlotStatus.InProgress:
    case TourOperationStatus.InProgress:
      return 'cyan';
    default:
      return 'default';
  }
};
