export const AUTH_ENDPOINTS = {
  REGISTER: "/api/Authentication/register",
  LOGIN: "/api/Authentication/login",
  VERIFY_OTP: "/api/Authentication/verify-otp",
  SEND_OTP_RESET_PASSWORD: "/api/Authentication/send-otp-reset-password",
  RESET_PASSWORD: "/api/Authentication/reset-password",
  REFRESH_TOKEN: "/api/Authentication/refresh-token",
};

export const ACCOUNT_ENDPOINTS = {
  CHANGE_PASSWORD: "/api/Account/change-password",
  EDIT_PROFILE: "/api/Account/edit-profile",
  GET_PROFILE: "/api/Account/profile",
  APPLY_TOURGUIDE: "/api/Account/tourguide-application",
  VIEW_TOURGUIDE_APPLICATION: "/api/Account/View-tourguideapplication",
  EDIT_AVATAR: "/api/Account/edit-Avatar",
  GET_GUIDES: "/api/Account/guides",
  GET_AVAILABLE_GUIDES: "/api/Account/guides/available",
  DEBUG_CURRENT_USER: "/api/Account/debug/current-user",
  APPLY_SHOP: "/api/Account/shop-application",
  VIEW_SHOP_APPLICATION: "/api/Account/View-shopapplication",
};

export const IMAGE_ENDPOINTS = {
  UPLOAD: "/api/Image/Upload",
};

export const SCHEDULING_ENDPOINTS = {
  GET_WEEKEND_DATES: "/api/Scheduling/weekend-dates/{year}/{month}",
  GENERATE_SLOT_DATES: "/api/Scheduling/generate-slot-dates",
  VALIDATE: "/api/Scheduling/validate",
  NEXT_AVAILABLE_SLOTS: "/api/Scheduling/next-available-slots",
  OPTIMAL_DISTRIBUTION: "/api/Scheduling/optimal-distribution",
  RUN_TESTS: "/api/Scheduling/run-tests",
  RUN_TEST_BY_NAME: "/api/Scheduling/run-test/{testName}",
};

export const TOUR_DETAILS_ENDPOINTS = {
  GET_TEMPLATE_BY_ID: "/api/TourDetails/template/{templateId}",
  GET_BY_ID: "/api/TourDetails/{id}",
  PATCH_BY_ID: "/api/TourDetails/{id}",
  DELETE_BY_ID: "/api/TourDetails/{id}",
  CREATE: "/api/TourDetails",
  SEARCH: "/api/TourDetails/search",
  GET_PAGINATED: "/api/TourDetails/paginated",
  GET_TIMELINE_BY_TOUR_ID: "/api/TourDetails/{tourDetailsId}/timeline",
  GET_SHOPS: "/api/TourDetails/shops",
};

export const TIMELINE_ENDPOINTS = {
  CREATE: "/api/TourDetails/timeline",
  CREATE_SINGLE: "/api/TourDetails/timeline/single",
  PATCH_BY_ID: "/api/TourDetails/timeline/{id}",
  DELETE_BY_ID: "/api/TourDetails/timeline/{id}",
  REORDER: "/api/TourDetails/timeline/reorder",
};

export const TOUR_MIGRATION_ENDPOINTS = {
  PREVIEW: "/api/TourMigration/preview",
  EXECUTE: "/api/TourMigration/execute",
  ROLLBACK: "/api/TourMigration/rollback",
  STATUS: "/api/TourMigration/status",
};

export const TOUR_OPERATION_ENDPOINTS = {
  CREATE: "/api/TourOperation",
  GET_DETAILS_BY_TOUR_ID: "/api/TourOperation/details/{tourDetailsId}",
  PATCH_BY_ID: "/api/TourOperation/{id}",
  DELETE_BY_ID: "/api/TourOperation/{id}",
};
