
export const ADMIN_ROUTES = {
  ADD_SERVICE: "/api/admin/addService",
  BLOCK_DOCTOR: "/api/admin/blockingDoctor",
  DELETE_DOCTOR_AFTER_REJECTION: "/api/admin/deleteDoctorAfterRejection",
  DELETE_SERVICE: "/api/admin/deleteService",
  DOCTOR_PAGINATION: "/api/admin/doctorPagination",
  EDIT_SERVICE: "/api/admin/editService",
  FECH_DOCTORS: "/api/admin/fechDoctors",
  FECTH_USERS: "/api/admin/fecthUsers",
  FETCHING_ALL_USER_APPOINTS_MENTS_ADMIN: "/api/admin/FecthAppointMentForAdmin",
  FETCH_SERVICES: "/api/doctor/fetchService",
  HANDLING_ADMIN_CANCEL: "/api/notification/handleCanceldoctorApplication",
  NOTIFICATION_API: "/api/notification/storeNotificationData",
  PAGINATION_API: "/api/admin/search",
};

export const USER_ROUTES = {
  CANCELING_USER_APPOINTMENT: "/api/doctor/CancelingUserAppointMent",
  CHANGING_USER_PASSWORD: "/api/user/changing_userPassword",
  CHANGING_USER_INFO: "/api/user/ChangingUserInfo",
  FETCH_USER_CONVERSATIONS: "/api/doctor/fetchUserConversations",
  FETCH_USER_PROFILE: "/api/user/fectingUserProfileData",
  GET_NOTIFICATION_API: "/api/notification/getNotifications",
  USER_FECTING_APPOINTMENT_SLOTE: "/api/doctor/fectingAppointMentSlotes",
  USER_FETCHING_APPOINTMENTS: "/api/doctor/fectingAppointMent",
  USER_FETCHING_DOCTORS: "/api/user/fecthAllDoctors",
};



// FECTING_APPOINTMENT_SLOTES
export const DOCTOR_ROUTES = {
  ADD_PRESCRIPTION: "/api/doctor/AddPrescription",
  APPOINTMENT_SLOTS: "/api/doctor/appointment-slots",
  FETCH_DOCTOR_SLOTES:"/api/doctor/fetchDoctorSlots",
  APPOINTMENT_PAGINATION: "/api/doctor/doctorAppointmentPagination",
  FECTING_APPOINTMENT_SLOTES: "/api/doctor/fectingAppointMentSlotes",
  FECTING_FULL_USER_APPOINTMENTS:"/api/doctor/fectingAllUserAppointMents",
  FETCH_DOCTOR_DASHBOARD_DATA: "/api/user/fetchDoctorDashBoardData",
  FETCHING_PRESCRIPTION: "/api/doctor/fetchingPrescription",
  MAKING_APPOINTMENT:  "/api/auth/user/makingAppointMent",
  REFRESH_TOCKEN_API: "/api/user/refresh",
};


